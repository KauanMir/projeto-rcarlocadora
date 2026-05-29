import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  reservationId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const { reservationId } = parsed.data;

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      select: {
        id: true,
        status: true,
        vehicleId: true,
        customerName: true,
        customerPhone: true,
        pickupDate: true,
        returnDate: true,
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: "Reserva não encontrada." }, { status: 404 });
    }

    if (reservation.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Apenas reservas confirmadas podem gerar locações." },
        { status: 422 }
      );
    }

    const existing = await prisma.rental.findUnique({
      where: { reservationId },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ error: "Locação já existe para esta reserva." }, { status: 409 });
    }

    const rental = await prisma.rental.create({
      data: {
        reservationId,
        vehicleId: reservation.vehicleId,
        customerName: reservation.customerName,
        customerPhone: reservation.customerPhone,
        pickupDate: reservation.pickupDate,
        returnDate: reservation.returnDate,
        status: "SCHEDULED",
      },
      select: { id: true, status: true, createdAt: true },
    });

    return NextResponse.json(rental, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/rentals]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
