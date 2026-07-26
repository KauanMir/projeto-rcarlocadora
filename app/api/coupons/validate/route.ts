import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { BOOKING_ENABLED } from "@/lib/feature-flags";
import { getAdminSession } from "@/lib/admin-auth";

const schema = z.object({
  code:         z.string().min(1),
  rentalDays:   z.number().int().positive(),
  vehicleCategory: z.string().optional(),
});

export async function POST(request: NextRequest) {
  if (!BOOKING_ENABLED && !(await getAdminSession())) {
    return NextResponse.json(
      { error: "Validação de cupons está temporariamente desativada.", code: "BOOKING_DISABLED" },
      { status: 403 }
    );
  }

  try {
    const body   = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const { code, rentalDays, vehicleCategory } = parsed.data;

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Cupom não encontrado." }, { status: 404 });
    }

    if (!coupon.active) {
      return NextResponse.json({ error: "Este cupom não está ativo." }, { status: 422 });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ error: "Este cupom expirou." }, { status: 422 });
    }

    if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
      return NextResponse.json({ error: "Este cupom já atingiu o limite de usos." }, { status: 422 });
    }

    if (rentalDays < coupon.minRentalDays) {
      return NextResponse.json(
        { error: `Este cupom exige mínimo de ${coupon.minRentalDays} diária${coupon.minRentalDays > 1 ? "s" : ""}.` },
        { status: 422 }
      );
    }

    if (coupon.categoryFilter && vehicleCategory) {
      if (coupon.categoryFilter.toUpperCase() !== vehicleCategory.toUpperCase()) {
        return NextResponse.json(
          { error: `Este cupom é válido apenas para a categoria ${coupon.categoryFilter}.` },
          { status: 422 }
        );
      }
    }

    return NextResponse.json({
      id:    coupon.id,
      code:  coupon.code,
      type:  coupon.type,
      value: Number(coupon.value),
    });
  } catch (error) {
    console.error("[POST /api/coupons/validate]", error);
    return NextResponse.json({ error: "Erro ao validar cupom." }, { status: 500 });
  }
}
