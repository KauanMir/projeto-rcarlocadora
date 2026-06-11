import { prisma } from "@/lib/prisma";
import { RentalsClient } from "@/components/admin/RentalsClient";
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, fontFamily: "var(--font-display)" }}>Locações ativas</h1>
        <p style={{ color: "var(--d-2)", fontSize: 14, marginTop: 4 }}>
          {activeCount} ativa{activeCount !== 1 ? "s" : ""} · {scheduledCount} agendada{scheduledCount !== 1 ? "s" : ""} — veículos na rua
        </p>
      </div>
      <RentalsClient rentals={rentals} />
    </div>
  );
}
