import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  type:      z.enum(["PICKUP", "RETURN"]),
  fuelLevel: z.enum(["E", "1/4", "1/2", "3/4", "F"]),
  mileage:   z.number().int().nonnegative().nullable().optional(),
  notes:     z.string().max(2000).nullable().optional(),
  photos:    z.array(z.string()).max(10).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rentalId } = await params;
    const checklists = await prisma.rentalChecklist.findMany({
      where: { rentalId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(checklists);
  } catch (error) {
    console.error("[GET /api/admin/rentals/:id/checklist]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rentalId } = await params;
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      select: { id: true },
    });

    if (!rental) {
      return NextResponse.json({ error: "Locação não encontrada." }, { status: 404 });
    }

    const existing = await prisma.rentalChecklist.findUnique({
      where: { rentalId_type: { rentalId, type: parsed.data.type } },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Checklist já registrado para este tipo." },
        { status: 409 }
      );
    }

    const checklist = await prisma.rentalChecklist.create({
      data: {
        rentalId,
        type: parsed.data.type,
        fuelLevel: parsed.data.fuelLevel,
        mileage: parsed.data.mileage ?? null,
        notes: parsed.data.notes ?? null,
        photos: parsed.data.photos ?? [],
      },
    });

    return NextResponse.json(checklist, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/rentals/:id/checklist]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
