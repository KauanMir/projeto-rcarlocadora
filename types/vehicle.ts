export type VehicleCategory = "economy" | "sedan" | "suv" | "premium" | "minivan" | "pickup";

export interface ShowroomCategory {
  id: string;
  name: string;
  pricePerDay: number;
  models: string[];
  image: string | null;
  tag?: string;
  dbCategory: string; // matches Prisma VehicleCategory (lowercase) for booking flow filter
}

export type VehicleFuel = "flex" | "gasoline" | "electric" | "hybrid" | "diesel";

export type VehicleTransmission = "manual" | "automatic";

export interface VehicleSpec {
  seats: number;
  doors: number;
  fuel: VehicleFuel;
  transmission: VehicleTransmission;
  airConditioning: boolean;
}

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: VehicleCategory;
  pricePerDay: number;
  image: string | null;
  specs: VehicleSpec;
  tags: string[];
  available: boolean;
}
