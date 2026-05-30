import { prisma } from "@/lib/prisma";
import { VehiclesClient } from "@/components/admin/VehiclesClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Veículos" };

export default async function VehiclesPage() {
  const rows = await prisma.vehicle.findMany({
    orderBy: { dailyRate: "asc" },
    include: { _count: { select: { reservations: true } } },
  });

  const vehicles = rows.map((v) => ({
    id: v.id, name: v.name, brand: v.brand, model: v.model, year: v.year,
    category: v.category as string, transmission: v.transmission as string,
    fuel: v.fuel as string, seats: v.seats, doors: v.doors,
    dailyRate: Number(v.dailyRate),
    imageUrl: v.imageUrl, galleryImages: v.galleryImages,
    available: v.available, featured: v.featured, tags: v.tags,
    reservationCount: v._count.reservations,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, fontFamily: "var(--font-display)" }}>Veículos</h1>
          <p style={{ color: "var(--d-2)", fontSize: 14, marginTop: 4 }}>{vehicles.length} veículos cadastrados</p>
        </div>
      </div>
      <VehiclesClient vehicles={vehicles} />
    </div>
  );
}
