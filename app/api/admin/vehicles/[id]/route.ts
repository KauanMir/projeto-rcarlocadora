import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const schema = z.object({
  name: z.string().min(1).max(120).optional(),
  dailyRate: z.number().positive().max(9999).optional(),
  available: z.boolean().optional(),
  featured: z.boolean().optional(),
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
      return NextResponse.json({ error: "Dados inválidos.", details: parsed.error.issues }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Veículo não encontrado." }, { status: 404 });
    }

    const { name, dailyRate, available, featured } = parsed.data;

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(dailyRate !== undefined && { dailyRate: new Prisma.Decimal(dailyRate) }),
        ...(available !== undefined && { available }),
        ...(featured !== undefined && { featured }),
      },
      select: {
        id: true,
        name: true,
        dailyRate: true,
        available: true,
        featured: true,
      },
    });

    return NextResponse.json({
      ...updated,
      dailyRate: Number(updated.dailyRate),
    });
  } catch (error) {
    console.error("[PATCH /api/admin/vehicles/:id]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
