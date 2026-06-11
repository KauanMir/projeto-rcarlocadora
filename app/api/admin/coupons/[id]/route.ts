import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  code:           z.string().min(3).max(30).toUpperCase().optional(),
  type:           z.enum(["PERCENTAGE", "FIXED"]).optional(),
  value:          z.number().positive().optional(),
  active:         z.boolean().optional(),
  expiresAt:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  minRentalDays:  z.number().int().min(1).optional(),
  maxUses:        z.number().int().positive().nullable().optional(),
  categoryFilter: z.string().nullable().optional(),
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

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Cupom não encontrado." }, { status: 404 });
    }

    if (parsed.data.code && parsed.data.code !== existing.code) {
      const conflict = await prisma.coupon.findUnique({ where: { code: parsed.data.code } });
      if (conflict) {
        return NextResponse.json({ error: "Já existe um cupom com esse código." }, { status: 409 });
      }
    }

    const resolvedType  = parsed.data.type  ?? existing.type;
    const resolvedValue = parsed.data.value ?? Number(existing.value);
    if (resolvedType === "PERCENTAGE" && resolvedValue > 100) {
      return NextResponse.json({ error: "Desconto percentual não pode ser maior que 100%." }, { status: 400 });
    }

    const { expiresAt, maxUses, categoryFilter, ...rest } = parsed.data;
    const updated = await prisma.coupon.update({
      where: { id },
      data:  {
        ...rest,
        ...(expiresAt      !== undefined ? { expiresAt:      expiresAt      ? new Date(expiresAt)      : null } : {}),
        ...(maxUses        !== undefined ? { maxUses:        maxUses        ?? null                           } : {}),
        ...(categoryFilter !== undefined ? { categoryFilter: categoryFilter ?? null                           } : {}),
      },
    });

    return NextResponse.json({
      id:             updated.id,
      code:           updated.code,
      type:           updated.type,
      value:          Number(updated.value),
      active:         updated.active,
      expiresAt:      updated.expiresAt ? updated.expiresAt.toISOString().slice(0, 10) : null,
      minRentalDays:  updated.minRentalDays,
      maxUses:        updated.maxUses,
      currentUses:    updated.currentUses,
      categoryFilter: updated.categoryFilter,
      createdAt:      updated.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("[PATCH /api/admin/coupons/:id]", error);
    return NextResponse.json({ error: "Erro ao atualizar cupom." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Cupom não encontrado." }, { status: 404 });
    }

    await prisma.coupon.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/admin/coupons/:id]", error);
    return NextResponse.json({ error: "Erro ao excluir cupom." }, { status: 500 });
  }
}
