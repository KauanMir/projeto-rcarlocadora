import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  name:       z.string().min(1).max(80).optional(),
  startDate:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  multiplier: z.number().min(1.0).max(5.0).optional(),
  active:     z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body   = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos.", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.seasonalPricing.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Temporada não encontrada." }, { status: 404 });
    }

    const { startDate, endDate, ...rest } = parsed.data;
    const resolvedStart = startDate ? new Date(startDate) : existing.startDate;
    const resolvedEnd   = endDate   ? new Date(endDate)   : existing.endDate;

    if (resolvedStart >= resolvedEnd) {
      return NextResponse.json(
        { error: "A data inicial deve ser anterior à data final." },
        { status: 400 }
      );
    }

    const updated = await prisma.seasonalPricing.update({
      where: { id },
      data:  { ...rest, startDate: resolvedStart, endDate: resolvedEnd },
    });

    return NextResponse.json({
      id:         updated.id,
      name:       updated.name,
      startDate:  updated.startDate.toISOString().slice(0, 10),
      endDate:    updated.endDate.toISOString().slice(0, 10),
      multiplier: Number(updated.multiplier),
      active:     updated.active,
      createdAt:  updated.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("[PATCH /api/admin/seasons/:id]", error);
    return NextResponse.json({ error: "Erro ao atualizar temporada." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.seasonalPricing.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Temporada não encontrada." }, { status: 404 });
    }

    await prisma.seasonalPricing.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/admin/seasons/:id]", error);
    return NextResponse.json({ error: "Erro ao excluir temporada." }, { status: 500 });
  }
}
