import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reservation: {
          select: {
            pickupDate: true,
            returnDate: true,
            totalPrice: true,
            vehicle: { select: { brand: true, model: true } },
          },
        },
      },
    });
    return NextResponse.json(leads);
  } catch (error) {
    console.error("[GET /api/admin/leads]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
