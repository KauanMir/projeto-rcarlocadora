import type { Vehicle } from "@/types/vehicle";
import type { InsuranceOption, Addon, PriceBreakdown } from "@/types/booking";
import { parseDateUTC, MIN_RENTAL_DAYS } from "@/utils/dates";

/** Days booked in advance before pickup date (kept for internal use if needed). */
export function calculateAdvanceDays(pickupDate: string): number {
  const todayUTC = new Date();
  todayUTC.setUTCHours(12, 0, 0, 0);
  const pickup = parseDateUTC(pickupDate);
  return Math.max(Math.floor((pickup.getTime() - todayUTC.getTime()) / 86_400_000), 0);
}

/**
 * Applies only the seasonal multiplier to the vehicle subtotal.
 * No automatic discounts — only coupon discounts are allowed.
 */
export function applySeasonalMultiplier(params: {
  vehicleSubtotal: number;
  seasonalMultiplier: number;
}): number {
  return params.vehicleSubtotal * params.seasonalMultiplier;
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
