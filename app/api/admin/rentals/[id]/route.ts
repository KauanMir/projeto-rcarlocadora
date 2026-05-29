import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  status: z.enum(["SCHEDULED", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
  pickupMileage: z.number().int().nonnegative().nullable().optional(),
  returnMileage: z.number().int().nonnegative().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
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
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const rental = await prisma.rental.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!rental) {
      return NextResponse.json({ error: "Locação não encontrada." }, { status: 404 });
    }

    const updated = await prisma.rental.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true,
        status: true,
        pickupMileage: true,
        returnMileage: true,
        notes: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/admin/rentals/:id]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
