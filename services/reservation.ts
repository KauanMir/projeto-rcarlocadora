import { prisma } from "@/lib/prisma";
import { Prisma, InsuranceType } from "@prisma/client";
import type { CreateReservationRequest } from "@/types/api";
import { parseDateUTC } from "@/utils/dates";

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
 * Re-validates availability within the transaction before inserting.
 */
export async function createReservation(input: CreateReservationRequest) {
  const pickupDate = parseDateUTC(input.pickupDate);
  const returnDate = parseDateUTC(input.returnDate);

  return prisma.$transaction(async (tx) => {
    // Verify vehicle exists
    const vehicle = await tx.vehicle.findUnique({
      where: { id: input.vehicleId },
      select: { id: true, available: true },
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

    return tx.reservation.create({
      data: {
        vehicleId: input.vehicleId,
        pickupDate,
        returnDate,
        rentalDays: input.rentalDays,
        insuranceType: toInsuranceEnum(input.insuranceType),
        addons: input.addons as Prisma.InputJsonValue,
        subtotal: new Prisma.Decimal(input.subtotal),
        totalPrice: new Prisma.Decimal(input.totalPrice),
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
  });
}
