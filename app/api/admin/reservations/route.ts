import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        vehicle: {
          select: { name: true, brand: true, model: true },
        },
      },
    });

    const data = reservations.map((r) => ({
      id: r.id,
      vehicleId: r.vehicleId,
      vehicleName: `${r.vehicle.brand} ${r.vehicle.model}`,
      pickupDate: r.pickupDate.toISOString(),
      returnDate: r.returnDate.toISOString(),
      rentalDays: r.rentalDays,
      insuranceType: r.insuranceType,
      addons: r.addons,
      subtotal: Number(r.subtotal),
      totalPrice: Number(r.totalPrice),
      status: r.status,
      customerName: r.customerName,
      customerPhone: r.customerPhone,
      notes: r.notes ?? null,
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/admin/reservations]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
