import { prisma } from "@/lib/prisma";
import { Prisma, InsuranceType } from "@prisma/client";
import type { CreateReservationRequest } from "@/types/api";
import { parseDateUTC } from "@/utils/dates";
import { INSURANCE_OPTIONS, ADDONS } from "@/utils/constants";
import { applySeasonalMultiplier } from "@/services/pricing";

export class VehicleUnavailableError extends Error {
  readonly code = "VEHICLE_UNAVAILABLE" as const;
  constructor() {
    super("Veículo não disponível para as datas selecionadas.");
    this.name = "VehicleUnavailableError";
  }
}

export class VehicleNotFoundError extends Error {
  readonly code = "NOT_FOUND" as const;
  constructor() {
    super("Veículo não encontrado.");
    this.name = "VehicleNotFoundError";
  }
}

function toInsuranceEnum(type: string): InsuranceType {
  return type.toUpperCase() as InsuranceType;
}

/**
 * Creates a reservation inside a transaction to prevent double-bookings.
 * Re-validates availability and recalculates total server-side before inserting.
 */
export async function createReservation(input: CreateReservationRequest) {
  const pickupDate = parseDateUTC(input.pickupDate);
  const returnDate = parseDateUTC(input.returnDate);

  return prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.findUnique({
      where: { id: input.vehicleId },
      select: { id: true, available: true, dailyRate: true },
    });

    if (!vehicle) throw new VehicleNotFoundError();

    // Re-check availability inside the transaction (prevents race conditions)
    const conflict = await tx.reservation.findFirst({
      where: {
        vehicleId: input.vehicleId,
        status: { not: "CANCELLED" },
        AND: [
          { pickupDate: { lt: returnDate } },
          { returnDate: { gt: pickupDate } },
        ],
      },
      select: { id: true },
    });

    if (conflict) throw new VehicleUnavailableError();

    // Recalculate price server-side — never trust client-sent totals
    const seasonal = await tx.seasonalPricing.findFirst({
      where: {
        active: true,
        startDate: { lte: returnDate },
        endDate: { gte: pickupDate },
      },
      orderBy: { multiplier: "desc" },
    });

    const seasonalMultiplier = seasonal ? Number(seasonal.multiplier) : 1.0;

    const insurance = INSURANCE_OPTIONS.find((i) => i.id === input.insuranceType);
    const selectedAddons = ADDONS.filter((a) =>
      (input.addons as string[]).includes(a.id)
    );

    const vehicleSubtotal = Number(vehicle.dailyRate) * input.rentalDays;
    const insuranceCost   = insurance ? insurance.pricePerDay * input.rentalDays : 0;
    const addonsCost      = selectedAddons.reduce(
      (sum, a) => sum + a.pricePerDay * input.rentalDays,
      0
    );

    const adjusted = applySeasonalMultiplier({ vehicleSubtotal, seasonalMultiplier });

    // Coupon validation and application (re-validated server-side)
    let appliedCouponCode: string | null = null;
    let appliedCouponDiscount = 0;

    if (input.couponCode) {
      const coupon = await tx.coupon.findUnique({
        where: { code: input.couponCode.trim().toUpperCase() },
      });
      const now = new Date();
      if (
        coupon &&
        coupon.active &&
        (!coupon.expiresAt || coupon.expiresAt > now) &&
        (coupon.maxUses === null || coupon.currentUses < coupon.maxUses) &&
        input.rentalDays >= coupon.minRentalDays
      ) {
        appliedCouponCode = coupon.code;
        if (coupon.type === "PERCENTAGE") {
          appliedCouponDiscount = Math.round(adjusted * (Number(coupon.value) / 100) * 100) / 100;
        } else {
          appliedCouponDiscount = Math.min(Number(coupon.value), adjusted);
        }
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { currentUses: { increment: 1 } },
        });
      }
    }

    const calculatedSubtotal = Math.round((adjusted - appliedCouponDiscount) * 100) / 100;
    const calculatedTotal    = Math.round((adjusted - appliedCouponDiscount + insuranceCost + addonsCost) * 100) / 100;

    const reservation = await tx.reservation.create({
      data: {
        vehicleId: input.vehicleId,
        pickupDate,
        returnDate,
        rentalDays: input.rentalDays,
        insuranceType: toInsuranceEnum(input.insuranceType),
        addons: input.addons as Prisma.InputJsonValue,
        subtotal: new Prisma.Decimal(calculatedSubtotal),
        totalPrice: new Prisma.Decimal(calculatedTotal),
        couponCode: appliedCouponCode,
        couponDiscount: appliedCouponDiscount > 0 ? new Prisma.Decimal(appliedCouponDiscount) : null,
        status: "PENDING",
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        notes: input.notes,
      },
      select: {
        id: true,
        vehicleId: true,
        status: true,
        totalPrice: true,
        createdAt: true,
      },
    });

    await tx.lead.create({
      data: {
        name: input.customerName,
        phone: input.customerPhone,
        reservationId: reservation.id,
        status: "NEW",
      },
    });

    return reservation;
  });
}
