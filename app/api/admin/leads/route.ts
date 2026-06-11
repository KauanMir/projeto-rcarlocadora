import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  name:            z.string().min(2).max(120),
  phone:           z.string().min(8).max(30),
  vehicleInterest: z.string().max(120).optional(),
  notes:           z.string().max(2000).nullable().optional(),
  status:          z.enum(["NEW", "CONTACTED", "NEGOTIATING", "AWAITING", "WON", "CAR_RENTED", "LOST"]).optional(),
});

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

export async function POST(request: NextRequest) {
  try {
    const body   = await request.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const { name, phone, vehicleInterest, notes, status } = parsed.data;

    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        vehicleInterest: vehicleInterest?.trim() || null,
        notes:           notes?.trim()           || null,
        status:          status ?? "NEW",
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/leads]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
