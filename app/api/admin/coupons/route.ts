import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  code:           z.string().min(3).max(30).toUpperCase(),
  type:           z.enum(["PERCENTAGE", "FIXED"]),
  value:          z.number().positive(),
  active:         z.boolean().default(true),
  expiresAt:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  minRentalDays:  z.number().int().min(1).default(1),
  maxUses:        z.number().int().positive().nullable().optional(),
  categoryFilter: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      coupons.map((c) => ({
        id:             c.id,
        code:           c.code,
        type:           c.type,
        value:          Number(c.value),
        active:         c.active,
        expiresAt:      c.expiresAt ? c.expiresAt.toISOString().slice(0, 10) : null,
        minRentalDays:  c.minRentalDays,
        maxUses:        c.maxUses,
        currentUses:    c.currentUses,
        categoryFilter: c.categoryFilter,
        createdAt:      c.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("[GET /api/admin/coupons]", error);
    return NextResponse.json({ error: "Erro ao listar cupons." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body   = await request.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos.", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.coupon.findUnique({ where: { code: parsed.data.code } });
    if (existing) {
      return NextResponse.json({ error: "Já existe um cupom com esse código." }, { status: 409 });
    }

    if (parsed.data.type === "PERCENTAGE" && parsed.data.value > 100) {
      return NextResponse.json({ error: "Desconto percentual não pode ser maior que 100%." }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code:           parsed.data.code,
        type:           parsed.data.type,
        value:          parsed.data.value,
        active:         parsed.data.active,
        expiresAt:      parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
        minRentalDays:  parsed.data.minRentalDays,
        maxUses:        parsed.data.maxUses ?? null,
        categoryFilter: parsed.data.categoryFilter ?? null,
      },
    });

    return NextResponse.json(
      {
        id:             coupon.id,
        code:           coupon.code,
        type:           coupon.type,
        value:          Number(coupon.value),
        active:         coupon.active,
        expiresAt:      coupon.expiresAt ? coupon.expiresAt.toISOString().slice(0, 10) : null,
        minRentalDays:  coupon.minRentalDays,
        maxUses:        coupon.maxUses,
        currentUses:    coupon.currentUses,
        categoryFilter: coupon.categoryFilter,
        createdAt:      coupon.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/admin/coupons]", error);
    return NextResponse.json({ error: "Erro ao criar cupom." }, { status: 500 });
  }
}
