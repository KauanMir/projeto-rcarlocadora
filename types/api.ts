import type { InsuranceTier, AddonId } from "./booking";

// ─── Request bodies ───────────────────────────────────────────

export interface CreateReservationRequest {
  vehicleId: string;
  pickupDate: string;   // YYYY-MM-DD
  returnDate: string;   // YYYY-MM-DD
  rentalDays: number;
  insuranceType: InsuranceTier;
  addons: string[];     // addon slugs/ids — validated by the API route
  subtotal: number;
  totalPrice: number;
  customerName: string;
  customerPhone: string;
  notes?: string;
}

export interface PricingRequest {
  vehicleId: string;
  pickupDate: string;
  returnDate: string;
  rentalDays: number;
  insuranceType: InsuranceTier;
  addons: AddonId[];
}

// ─── Response shapes ──────────────────────────────────────────

export interface VehicleApiResponse {
  id: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  transmission: string;
  fuel: string;
  seats: number;
  doors: number;
  dailyRate: number;
  imageUrl: string | null;
  tags: string[];
  available: boolean;
  featured: boolean;
}

export interface ReservationApiResponse {
  id: string;
  vehicleId: string;
  status: string;
  totalPrice: number;
  createdAt: string;
}

export interface PricingApiResponse {
  vehicleSubtotal: number;
  insuranceCost: number;
  addonsCost: number;
  seasonalMultiplier: number;
  seasonalName: string | null;
  advanceDiscount: number;
  longStayDiscount: number;
  finalDiscount: number;
  total: number;
  days: number;
}

export interface ApiError {
  error: string;
  code: "VEHICLE_UNAVAILABLE" | "VALIDATION_ERROR" | "NOT_FOUND" | "SERVER_ERROR";
  details?: unknown;
}
