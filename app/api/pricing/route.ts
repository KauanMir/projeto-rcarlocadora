import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { INSURANCE_OPTIONS, ADDONS } from "@/utils/constants";
import {
  calculateAdvanceDays,
  advanceBookingDiscount,
  longStayDiscount,
  applyDynamicRules,
} from "@/services/pricing";
import { calcRentalDays, parseDateUTC, MAX_RENTAL_DAYS, MIN_RENTAL_DAYS } from "@/utils/dates";

const schema = z.object({
  vehicleId: z.string(),
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  insuranceType: z.enum(["basic", "intermediate", "premium"]),
  addons: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos.", code: "VALIDATION_ERROR", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { vehicleId, pickupDate, returnDate, insuranceType, addons: addonIds } = parsed.data;

    // Always calculate server-side — never trust client-provided rentalDays
    const rentalDays = calcRentalDays(pickupDate, returnDate);

    if (rentalDays < MIN_RENTAL_DAYS || rentalDays > MAX_RENTAL_DAYS) {
      return NextResponse.json(
        { error: `Período inválido. Mínimo ${MIN_RENTAL_DAYS} dia, máximo ${MAX_RENTAL_DAYS} dias.`, code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { dailyRate: true },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Veículo não encontrado.", code: "NOT_FOUND" }, { status: 404 });
    }

    // Seasonal pricing lookup
    const pickupDt = parseDateUTC(pickupDate);
    const returnDt = parseDateUTC(returnDate);

    const seasonal = await prisma.seasonalPricing.findFirst({
      where: {
        active: true,
        startDate: { lte: returnDt },
        endDate: { gte: pickupDt },
      },
      orderBy: { multiplier: "desc" },
    });

    const seasonalMultiplier = seasonal ? Number(seasonal.multiplier) : 1.0;
    const seasonalName = seasonal?.name ?? null;

    // Price components
    const dailyRate = Number(vehicle.dailyRate);
    const vehicleSubtotal = dailyRate * rentalDays;

    const insurance = INSURANCE_OPTIONS.find((i) => i.id === insuranceType);
    const insuranceCost = insurance ? insurance.pricePerDay * rentalDays : 0;

    const selectedAddons = ADDONS.filter((a) => addonIds.includes(a.id));
    const addonsCost = selectedAddons.reduce((sum, a) => sum + a.pricePerDay * rentalDays, 0);

    const advanceDays = calculateAdvanceDays(pickupDate);
    const { adjusted, discount } = applyDynamicRules({
      vehicleSubtotal,
      insuranceCost,
      addonsCost,
      seasonalMultiplier,
      advanceDays,
      rentalDays,
    });

    const total = adjusted + insuranceCost + addonsCost;

    return NextResponse.json({
      vehicleSubtotal,
      insuranceCost,
      addonsCost,
      seasonalMultiplier,
      seasonalName,
      advanceDiscount: advanceBookingDiscount(advanceDays),
      longStayDiscount: longStayDiscount(rentalDays),
      finalDiscount: discount,
      total: Math.round(total * 100) / 100,
      days: rentalDays,
    });
  } catch (error) {
    console.error("[POST /api/pricing]", error);
    return NextResponse.json(
      { error: "Erro ao calcular preço.", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
