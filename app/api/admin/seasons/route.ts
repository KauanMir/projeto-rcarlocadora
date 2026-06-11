import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  name:       z.string().min(1).max(80),
  startDate:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  multiplier: z.number().min(1.0).max(5.0),
  active:     z.boolean().default(true),
});

export async function GET() {
  try {
    const seasons = await prisma.seasonalPricing.findMany({
      orderBy: { startDate: "asc" },
    });
    return NextResponse.json(
      seasons.map((s) => ({
        id:         s.id,
        name:       s.name,
        startDate:  s.startDate.toISOString().slice(0, 10),
        endDate:    s.endDate.toISOString().slice(0, 10),
        multiplier: Number(s.multiplier),
        active:     s.active,
        createdAt:  s.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("[GET /api/admin/seasons]", error);
    return NextResponse.json({ error: "Erro ao listar temporadas." }, { status: 500 });
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

    const { name, startDate, endDate, multiplier, active } = parsed.data;

    if (new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json(
        { error: "A data inicial deve ser anterior à data final." },
        { status: 400 }
      );
    }

    const season = await prisma.seasonalPricing.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate:   new Date(endDate),
        multiplier,
        active,
      },
    });

    return NextResponse.json(
      {
        id:         season.id,
        name:       season.name,
        startDate:  season.startDate.toISOString().slice(0, 10),
        endDate:    season.endDate.toISOString().slice(0, 10),
        multiplier: Number(season.multiplier),
        active:     season.active,
        createdAt:  season.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/admin/seasons]", error);
    return NextResponse.json({ error: "Erro ao criar temporada." }, { status: 500 });
  }
}
