import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { dailyRate: "asc" },
      include: {
        _count: { select: { reservations: true } },
      },
    });

    const data = vehicles.map((v) => ({
      id: v.id,
      name: v.name,
      brand: v.brand,
      model: v.model,
      year: v.year,
      category: v.category,
      transmission: v.transmission,
      fuel: v.fuel,
      seats: v.seats,
      doors: v.doors,
      dailyRate: Number(v.dailyRate),
      imageUrl: v.imageUrl,
      galleryImages: v.galleryImages,
      available: v.available,
      featured: v.featured,
      tags: v.tags,
      reservationCount: v._count.reservations,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/admin/vehicles]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

// ─── Slug generator ───────────────────────────────────────────

function toSlug(brand: string, model: string, year: number): string {
  return `${brand}-${model}-${year}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── POST — create vehicle ────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name, brand, model, year,
      category, transmission, fuel,
      seats, doors, dailyRate,
      imageUrl = null, galleryImages = [],
      available = true, featured = false,
    } = body as {
      name: string; brand: string; model: string; year: number;
      category: string; transmission: string; fuel: string;
      seats: number; doors: number; dailyRate: number;
      imageUrl?: string | null; galleryImages?: string[];
      available?: boolean; featured?: boolean;
    };

    // Basic validation
    if (!name?.trim())       return NextResponse.json({ error: "Nome é obrigatório." },       { status: 400 });
    if (!brand?.trim())      return NextResponse.json({ error: "Marca é obrigatória." },      { status: 400 });
    if (!model?.trim())      return NextResponse.json({ error: "Modelo é obrigatório." },     { status: 400 });
    if (!category)           return NextResponse.json({ error: "Categoria é obrigatória." },  { status: 400 });
    if (!transmission)       return NextResponse.json({ error: "Transmissão é obrigatória." },{ status: 400 });
    if (!fuel)               return NextResponse.json({ error: "Combustível é obrigatório." },{ status: 400 });
    if (!year || isNaN(year))return NextResponse.json({ error: "Ano inválido." },              { status: 400 });
    if (!dailyRate || isNaN(dailyRate) || dailyRate <= 0)
      return NextResponse.json({ error: "Diária inválida." }, { status: 400 });

    // Generate a unique slug
    const baseSlug = toSlug(brand, model, year);
    let slug = baseSlug;
    let attempt = 0;

    while (await prisma.vehicle.findUnique({ where: { slug } })) {
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        name:         name.trim(),
        slug,
        brand:        brand.trim(),
        model:        model.trim(),
        year:         Number(year),
        category:     category as never,
        transmission: transmission as never,
        fuel:         fuel as never,
        seats:        Number(seats) || 5,
        doors:        Number(doors) || 4,
        dailyRate:    Number(dailyRate),
        imageUrl:     imageUrl ?? null,
        galleryImages: galleryImages ?? [],
        available,
        featured,
      },
      include: { _count: { select: { reservations: true } } },
    });

    return NextResponse.json({
      id: vehicle.id,
      name: vehicle.name,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      category: vehicle.category,
      transmission: vehicle.transmission,
      fuel: vehicle.fuel,
      seats: vehicle.seats,
      doors: vehicle.doors,
      dailyRate: Number(vehicle.dailyRate),
      imageUrl: vehicle.imageUrl,
      galleryImages: vehicle.galleryImages,
      available: vehicle.available,
      featured: vehicle.featured,
      tags: vehicle.tags,
      reservationCount: 0,
    }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/vehicles]", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
