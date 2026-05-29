import { prisma } from "@/lib/prisma";
import { RentalsClient } from "@/components/admin/RentalsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Locações" };

export default async function RentalsPage() {
  const rows = await prisma.rental.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      vehicle: { select: { brand: true, model: true, name: true } },
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
  }));

  const activeCount = rentals.filter((r) => r.status === "ACTIVE").length;
  const scheduledCount = rentals.filter((r) => r.status === "SCHEDULED").length;

  return (
    <div className="px-6 py-8">
      <div className="mb-8">
        <h1 className="text-white font-black text-2xl">Locações</h1>
        <p className="text-white/35 text-sm mt-1">
          {rentals.length} locaç{rentals.length !== 1 ? "ões" : "ão"} ·{" "}
          {activeCount} ativa{activeCount !== 1 ? "s" : ""} ·{" "}
          {scheduledCount} agendada{scheduledCount !== 1 ? "s" : ""}
        </p>
      </div>

      <RentalsClient rentals={rentals} />
    </div>
  );
}
