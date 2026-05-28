import { NextRequest, NextResponse } from "next/server";
import { getAvailableVehicles } from "@/services/availability";
import { prisma } from "@/lib/prisma";
import { parseDateUTC } from "@/utils/dates";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const pickup = searchParams.get("pickup");
  const returnDate = searchParams.get("return");
  const category = searchParams.get("category") ?? undefined;

  try {
    let vehicles;

    if (pickup && returnDate) {
      vehicles = await getAvailableVehicles(
        parseDateUTC(pickup),
        parseDateUTC(returnDate),
        category
      );
    } else {
      vehicles = await prisma.vehicle.findMany({
        where: { available: true },
        orderBy: { dailyRate: "asc" },
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = vehicles.map((v: any) => ({
      id: v.id,
      name: v.name,
      slug: v.slug,
      brand: v.brand,
      model: v.model,
      year: v.year,
      category: v.category.toLowerCase(),
      transmission: v.transmission.toLowerCase(),
      fuel: v.fuel.toLowerCase(),
      seats: v.seats,
      doors: v.doors,
      dailyRate: Number(v.dailyRate),
      imageUrl: v.imageUrl,
      tags: v.tags,
      available: v.available,
      featured: v.featured,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("[GET /api/vehicles]", error);
    return NextResponse.json(
      { error: "Serviço temporariamente indisponível.", code: "SERVER_ERROR" },
      { status: 503 }
    );
  }
}
