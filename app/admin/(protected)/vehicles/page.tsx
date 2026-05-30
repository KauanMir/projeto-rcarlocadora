import { prisma } from "@/lib/prisma";
import { VehiclesClient } from "@/components/admin/VehiclesClient";
import { AdminPageHeader, AdminKpiCard } from "@/components/admin/AdminPageHeader";
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

  const active   = vehicles.filter((v) => v.available).length;
  const inactive = vehicles.length - active;
  const featured = vehicles.filter((v) => v.featured).length;

  return (
    <div style={{ padding: "28px 28px 40px" }}>
      <AdminPageHeader
        title="Veículos"
        subtitle="Edite diárias, disponibilidade, imagens e informações da frota."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
        <AdminKpiCard label="Total na frota" value={vehicles.length} />
        <AdminKpiCard label="Disponíveis" value={active} accent="#34d399" />
        <AdminKpiCard label="Indisponíveis" value={inactive} accent="#f87171" />
        <AdminKpiCard label="Em destaque" value={featured} accent="var(--gold)" />
      </div>

      <VehiclesClient vehicles={vehicles} />
    </div>
  );
}
