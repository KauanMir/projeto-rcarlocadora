import { prisma } from "@/lib/prisma";
import { RentalsClient } from "@/components/admin/RentalsClient";
import { AdminPageHeader, AdminKpiCard } from "@/components/admin/AdminPageHeader";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Locações" };

export default async function RentalsPage() {
  const rows = await prisma.rental.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      vehicle: { select: { brand: true, model: true, name: true } },
      checklists: { orderBy: { createdAt: "asc" } },
    },
  });

  const rentals = rows.map((r) => ({
    id: r.id,
    customerName: r.customerName,
    customerPhone: r.customerPhone,
    vehicleBrand: r.vehicle.brand,
    vehicleModel: r.vehicle.model,
    vehicleName: r.vehicle.name,
    pickupDate: r.pickupDate.toISOString(),
    returnDate: r.returnDate.toISOString(),
    pickupMileage: r.pickupMileage,
    returnMileage: r.returnMileage,
    status: r.status as string,
    notes: r.notes ?? null,
    createdAt: r.createdAt.toISOString(),
    checklists: r.checklists.map((c) => ({
      type: c.type as string,
      fuelLevel: c.fuelLevel,
      mileage: c.mileage,
      notes: c.notes ?? null,
      photos: c.photos,
      createdAt: c.createdAt.toISOString(),
    })),
  }));

  const activeCount    = rentals.filter((r) => r.status === "ACTIVE").length;
  const scheduledCount = rentals.filter((r) => r.status === "SCHEDULED").length;
  const completedCount = rentals.filter((r) => r.status === "COMPLETED").length;

  return (
    <div style={{ padding: "28px 28px 40px" }}>
      <AdminPageHeader
        title="Locações"
        subtitle="Gerencie o ciclo de vida de cada locação ativa."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
        <AdminKpiCard label="Total" value={rentals.length} />
        <AdminKpiCard label="Ativas" value={activeCount} accent="#34d399" />
        <AdminKpiCard label="Agendadas" value={scheduledCount} accent="#38bdf8" />
        <AdminKpiCard label="Concluídas" value={completedCount} />
      </div>

      <RentalsClient rentals={rentals} />
    </div>
  );
}
