export type InsuranceTier = "basic" | "intermediate" | "premium";
export type AddonId = "gps" | "baby-seat" | "extra-driver" | "wifi";
export type BookingStep = 1 | 2 | 3 | 4 | 5;

export interface InsuranceOption {
  id: InsuranceTier;
  name: string;
  description: string;
  pricePerDay: number;
  features: string[];
  recommended?: boolean;
}

export interface Addon {
  id: AddonId;
  name: string;
  description: string;
  pricePerDay: number;
  icon: string;
}

export interface PriceBreakdown {
  vehicleSubtotal: number;
  insuranceCost: number;
  addonsCost: number;
  total: number;
  days: number;
}
