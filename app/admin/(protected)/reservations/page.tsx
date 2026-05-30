import { prisma } from "@/lib/prisma";
import { ReservationsClient } from "@/components/admin/ReservationsClient";
import { AdminPageHeader, AdminKpiCard } from "@/components/admin/AdminPageHeader";
import { formatPrice } from "@/utils/format";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reservas" };

export default async function ReservationsPage() {
  const [rows, rentalRows] = await Promise.all([
    prisma.reservation.findMany({
      orderBy: { createdAt: "desc" },
      include: { vehicle: { select: { name: true, brand: true, model: true } } },
    }),
    prisma.rental.findMany({ select: { reservationId: true } }),
  ]);

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
    revenue: reservations.filter((r) => r.status !== "CANCELLED").reduce((sum, r) => sum + r.totalPrice, 0),
  };

  return (
    <div style={{ padding: "28px 28px 40px" }}>
      <AdminPageHeader
        title="Reservas"
        subtitle="Gerencie e atualize o status das reservas."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
        <AdminKpiCard label="Total" value={counts.total} />
        <AdminKpiCard label="Pendentes" value={counts.pending} accent="#fbbf24" />
        <AdminKpiCard label="Confirmadas" value={counts.confirmed} accent="#60a5fa" />
        <AdminKpiCard label="Receita total" value={formatPrice(counts.revenue)} accent="var(--gold)" />
      </div>

      <ReservationsClient
        reservations={reservations}
        rentalReservationIds={rentalRows.map((r) => r.reservationId).filter(Boolean) as string[]}
      />
    </div>
  );
}
