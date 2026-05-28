import { prisma } from "@/lib/prisma";
import type { Vehicle } from "@prisma/client";

/**
 * Returns all available vehicles for the given date range.
 * A vehicle is unavailable if it has a non-cancelled reservation
 * that overlaps with [pickupDate, returnDate).
 */
export async function getAvailableVehicles(
  pickupDate: Date,
  returnDate: Date,
  category?: string
): Promise<Vehicle[]> {
  return prisma.vehicle.findMany({
    where: {
      available: true,
      ...(category
        ? { category: category.toUpperCase() as Vehicle["category"] }
        : {}),
      NOT: {
        reservations: {
          some: {
            status: { not: "CANCELLED" },
            // Overlap: existing.pickup < new.return AND existing.return > new.pickup
            AND: [
              { pickupDate: { lt: returnDate } },
              { returnDate: { gt: pickupDate } },
            ],
          },
        },
      },
    },
    orderBy: { dailyRate: "asc" },
  });
}

/**
 * Checks if a specific vehicle is available for the given date range.
 * Does NOT use a transaction — use validateNoOverlap inside a transaction
 * when creating a reservation.
 */
export async function isVehicleAvailable(
  vehicleId: string,
  pickupDate: Date,
  returnDate: Date
): Promise<boolean> {
  const conflict = await prisma.reservation.findFirst({
    where: {
      vehicleId,
      status: { not: "CANCELLED" },
      AND: [
        { pickupDate: { lt: returnDate } },
        { returnDate: { gt: pickupDate } },
      ],
    },
    select: { id: true },
  });
  return conflict === null;
}
