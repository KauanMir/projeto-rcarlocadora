import { prisma } from "@/lib/prisma";
import { ReservationsClient } from "@/components/admin/ReservationsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reservas" };

export default async function ReservationsPage() {
  const rows = await prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      vehicle: { select: { name: true, brand: true, model: true } },
    },
  });

  const reservations = rows.map((r) => ({
    id: r.id,
    vehicleName: `${r.vehicle.brand} ${r.vehicle.model}`,
    pickupDate: r.pickupDate.toISOString(),
    returnDate: r.returnDate.toISOString(),
    rentalDays: r.rentalDays,
    insuranceType: r.insuranceType as string,
    addons: r.addons,
    subtotal: Number(r.subtotal),
    totalPrice: Number(r.totalPrice),
    status: r.status as string,
    customerName: r.customerName,
    customerPhone: r.customerPhone,
    notes: r.notes ?? null,
    createdAt: r.createdAt.toISOString(),
  }));

  const counts = {
    total: reservations.length,
    pending: reservations.filter((r) => r.status === "PENDING").length,
    confirmed: reservations.filter((r) => r.status === "CONFIRMED").length,
    revenue: reservations
      .filter((r) => r.status !== "CANCELLED")
      .reduce((sum, r) => sum + r.totalPrice, 0),
  };

  return (
    <div className="px-6 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-white font-black text-2xl">Reservas</h1>
        <p className="text-white/35 text-sm mt-1">Gerencie e atualize o status das reservas.</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: counts.total },
          { label: "Pendentes", value: counts.pending },
          { label: "Confirmadas", value: counts.confirmed },
          { label: "Receita", value: `R$ ${counts.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white/[0.025] border border-white/[0.07] rounded-xl p-4"
          >
            <div className="text-white/30 text-[9px] tracking-[0.18em] uppercase mb-1">{label}</div>
            <div className="text-white font-black text-2xl">{value}</div>
          </div>
        ))}
      </div>

      <ReservationsClient reservations={reservations} />
    </div>
  );
}
