import type { VehicleApiResponse } from "@/types/api";
import type { Vehicle } from "@/types/vehicle";

export function mapApiVehicleToFrontend(v: VehicleApiResponse): Vehicle {
  return {
    id: v.id,
    name: v.name,
    brand: v.brand,
    model: v.model,
    year: v.year,
    category: v.category.toLowerCase() as Vehicle["category"],
    pricePerDay: Number(v.dailyRate),
    image: v.imageUrl ?? "",
    specs: {
      seats: v.seats,
      doors: v.doors,
      fuel: v.fuel.toLowerCase() as Vehicle["specs"]["fuel"],
      transmission: v.transmission.toLowerCase() as Vehicle["specs"]["transmission"],
      airConditioning: true,
    },
    tags: v.tags,
    available: v.available,
  };
}
