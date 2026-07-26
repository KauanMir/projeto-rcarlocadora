import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { INSURANCE_OPTIONS, ADDONS } from "@/utils/constants";
import { applySeasonalMultiplier } from "@/services/pricing";
import { calcRentalDays, parseDateUTC, MAX_RENTAL_DAYS, MIN_RENTAL_DAYS } from "@/utils/dates";
import { BOOKING_ENABLED } from "@/lib/feature-flags";

const schema = z.object({
  vehicleId:     z.string(),
  pickupDate:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  insuranceType: z.enum(["basic", "intermediate", "premium"]),
  addons:        z.array(z.string()),
  couponCode:    z.string().optional(),
});

export async function POST(request: NextRequest) {
  if (!BOOKING_ENABLED) {
    return NextResponse.json(
      { error: "Cálculo de preço online está temporariamente desativado. Fale conosco pelo WhatsApp.", code: "BOOKING_DISABLED" },
      { status: 403 }
    );
  }

  try {
    const body   = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos.", code: "VALIDATION_ERROR", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { vehicleId, pickupDate, returnDate, insuranceType, addons: addonIds, couponCode } = parsed.data;

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
        endDate:   { gte: pickupDt },
      },
      orderBy: { multiplier: "desc" },
    });

    const seasonalMultiplier = seasonal ? Number(seasonal.multiplier) : 1.0;
    const seasonalName       = seasonal?.name ?? null;

    // Price components
    const dailyRate       = Number(vehicle.dailyRate);
    const vehicleSubtotal = dailyRate * rentalDays;

    const insurance    = INSURANCE_OPTIONS.find((i) => i.id === insuranceType);
    const insuranceCost = insurance ? insurance.pricePerDay * rentalDays : 0;

    const selectedAddons = ADDONS.filter((a) => addonIds.includes(a.id));
    const addonsCost     = selectedAddons.reduce((sum, a) => sum + a.pricePerDay * rentalDays, 0);

    // Apply only seasonal multiplier — no automatic discounts
    const adjustedVehicle = applySeasonalMultiplier({ vehicleSubtotal, seasonalMultiplier });

    // Coupon lookup and validation
    let couponRecord: { id: string; code: string; type: string; value: number } | null = null;
    if (couponCode) {
      const found = await prisma.coupon.findUnique({ where: { code: couponCode.trim().toUpperCase() } });
      const now = new Date();
      if (
        found &&
        found.active &&
        (!found.expiresAt || found.expiresAt > now) &&
        (found.maxUses === null || found.currentUses < found.maxUses) &&
        rentalDays >= found.minRentalDays
      ) {
        couponRecord = { id: found.id, code: found.code, type: found.type, value: Number(found.value) };
      }
    }

    // Coupon applied on top of seasonal-adjusted vehicle subtotal
    let couponAmount = 0;
    if (couponRecord) {
      if (couponRecord.type === "PERCENTAGE") {
        couponAmount = Math.round(adjustedVehicle * (couponRecord.value / 100) * 100) / 100;
      } else {
        couponAmount = Math.min(couponRecord.value, adjustedVehicle);
      }
    }

    const total = adjustedVehicle + insuranceCost + addonsCost - couponAmount;

    return NextResponse.json({
      vehicleSubtotal,
      insuranceCost,
      addonsCost,
      seasonalMultiplier,
      seasonalName,
      finalDiscount:  0,
      couponCode:     couponRecord?.code ?? null,
      couponDiscount: couponAmount,
      total: Math.round(total * 100) / 100,
      days:  rentalDays,
    });
  } catch (error) {
    console.error("[POST /api/pricing]", error);
    return NextResponse.json(
      { error: "Erro ao calcular preço.", code: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
