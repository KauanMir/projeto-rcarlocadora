import type { Vehicle } from "@/types/vehicle";
import type { InsuranceOption, Addon, PriceBreakdown } from "@/types/booking";
import { parseDateUTC, MIN_RENTAL_DAYS } from "@/utils/dates";

// ─── Dynamic pricing rules (pure — no DB dependencies) ────────────────────────

/** Days booked in advance before pickup date. */
export function calculateAdvanceDays(pickupDate: string): number {
  const todayUTC = new Date();
  todayUTC.setUTCHours(12, 0, 0, 0);
  const pickup = parseDateUTC(pickupDate);
  return Math.max(Math.floor((pickup.getTime() - todayUTC.getTime()) / 86_400_000), 0);
}

/** 0.05 for ≥7 days advance, 0.10 for ≥14 days advance, else 0. */
export function advanceBookingDiscount(advanceDays: number): number {
  if (advanceDays >= 14) return 0.10;
  if (advanceDays >= 7) return 0.05;
  return 0;
}

/** 0.05 for ≥7 rental days, 0.10 for ≥14 rental days, else 0. */
export function longStayDiscount(rentalDays: number): number {
  if (rentalDays >= 14) return 0.10;
  if (rentalDays >= 7) return 0.05;
  return 0;
}

/**
 * Applies seasonal multiplier and discounts to the vehicle subtotal only.
 * Insurance and addons are never adjusted.
 * Combined discount is capped at 15%.
 */
export function applyDynamicRules(params: {
  vehicleSubtotal: number;
  insuranceCost: number;
  addonsCost: number;
  seasonalMultiplier: number;
  advanceDays: number;
  rentalDays: number;
}): { adjusted: number; discount: number } {
  const { vehicleSubtotal, seasonalMultiplier, advanceDays, rentalDays } = params;
  const discount = Math.min(advanceBookingDiscount(advanceDays) + longStayDiscount(rentalDays), 0.15);
  const adjusted = vehicleSubtotal * seasonalMultiplier * (1 - discount);
  return { adjusted, discount };
}

export function calculateRentalDays(pickupDate: string, returnDate: string): number {
  const pickup = parseDateUTC(pickupDate);
  const returnD = parseDateUTC(returnDate);
  const ms = returnD.getTime() - pickup.getTime();
  return Math.max(Math.ceil(ms / 86_400_000), MIN_RENTAL_DAYS);
}

export function calculatePriceBreakdown(
  vehicle: Vehicle | null,
  days: number,
  insurance: InsuranceOption | null,
  addons: Addon[]
): PriceBreakdown {
  const vehicleSubtotal = vehicle ? vehicle.pricePerDay * days : 0;
  const insuranceCost = insurance ? insurance.pricePerDay * days : 0;
  const addonsCost = addons.reduce((sum, addon) => sum + addon.pricePerDay * days, 0);

  return {
    vehicleSubtotal,
    insuranceCost,
    addonsCost,
    total: vehicleSubtotal + insuranceCost + addonsCost,
    days,
  };
}
