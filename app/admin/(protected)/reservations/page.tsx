import { prisma } from "@/lib/prisma";
import { ReservationsClient } from "@/components/admin/ReservationsClient";
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <ReservationsClient
        reservations={reservations}
        rentalReservationIds={rentalRows.map((r) => r.reservationId).filter(Boolean) as string[]}
        totalCount={reservations.length}
      />
    </div>
  );
}
