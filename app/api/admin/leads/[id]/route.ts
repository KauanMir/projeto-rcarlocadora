import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  status:          z.enum(["NEW", "CONTACTED", "NEGOTIATING", "WON", "LOST"]).optional(),
  notes:           z.string().max(2000).nullable().optional(),
  name:            z.string().min(2).max(120).optional(),
  phone:           z.string().min(8).max(30).optional(),
  vehicleInterest: z.string().max(120).nullable().optional(),
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
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({ where: { id }, select: { id: true } });

    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
    }

    const updated = await prisma.lead.update({
      where: { id },
      data:  parsed.data,
      select: { id: true, status: true, notes: true, name: true, phone: true, vehicleInterest: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/admin/leads/:id]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lead   = await prisma.lead.findUnique({ where: { id }, select: { id: true } });

    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
    }

    await prisma.lead.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/admin/leads/:id]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
