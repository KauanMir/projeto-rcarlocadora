import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  status: z.enum(["NEW", "CONTACTED", "NEGOTIATING", "WON", "LOST"]).optional(),
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

    const lead = await prisma.lead.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: parsed.data,
      select: { id: true, status: true, notes: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/admin/leads/:id]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
