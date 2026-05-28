import { prisma } from "@/lib/prisma";
import { VehiclesClient } from "@/components/admin/VehiclesClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Veículos" };

export default async function VehiclesPage() {
  const rows = await prisma.vehicle.findMany({
    orderBy: { dailyRate: "asc" },
    include: {
      _count: { select: { reservations: true } },
    },
  });

  const vehicles = rows.map((v) => ({
    id: v.id,
    name: v.name,
    brand: v.brand,
    model: v.model,
    year: v.year,
    category: v.category as string,
    transmission: v.transmission as string,
    fuel: v.fuel as string,
    seats: v.seats,
    doors: v.doors,
    dailyRate: Number(v.dailyRate),
    available: v.available,
    featured: v.featured,
    tags: v.tags,
    reservationCount: v._count.reservations,
  }));

  const active = vehicles.filter((v) => v.available).length;

  return (
    <div className="px-6 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-white font-black text-2xl">Veículos</h1>
        <p className="text-white/35 text-sm mt-1">Edite diárias, disponibilidade e informações da frota.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total na frota", value: vehicles.length },
          { label: "Disponíveis", value: active },
          { label: "Indisponíveis", value: vehicles.length - active },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white/[0.025] border border-white/[0.07] rounded-xl p-4">
            <div className="text-white/30 text-[9px] tracking-[0.18em] uppercase mb-1">{label}</div>
            <div className="text-white font-black text-2xl">{value}</div>
          </div>
        ))}
      </div>

      <VehiclesClient vehicles={vehicles} />
    </div>
  );
}
