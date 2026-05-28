import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { dailyRate: "asc" },
      include: {
        _count: { select: { reservations: true } },
      },
    });

    const data = vehicles.map((v) => ({
      id: v.id,
      name: v.name,
      brand: v.brand,
      model: v.model,
      year: v.year,
      category: v.category,
      transmission: v.transmission,
      fuel: v.fuel,
      seats: v.seats,
      doors: v.doors,
      dailyRate: Number(v.dailyRate),
      available: v.available,
      featured: v.featured,
      tags: v.tags,
      reservationCount: v._count.reservations,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/admin/vehicles]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
