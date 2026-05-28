import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "FINISHED"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!reservation) {
      return NextResponse.json({ error: "Reserva não encontrada." }, { status: 404 });
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: { status: parsed.data.status },
      select: { id: true, status: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/admin/reservations/:id]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
