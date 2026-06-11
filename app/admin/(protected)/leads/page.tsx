import { prisma } from "@/lib/prisma";
import { LeadsClient } from "@/components/admin/LeadsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Leads" };

export default async function LeadsPage() {
  const rows = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reservation: {
        select: {
          pickupDate: true, returnDate: true, totalPrice: true,
          vehicle: { select: { brand: true, model: true } },
        },
      },
    },
  });

  const leads = rows.map((l) => ({
    id: l.id, name: l.name, phone: l.phone,
    vehicleInterest: l.vehicleInterest ?? null,
    status: l.status as string, notes: l.notes ?? null,
    createdAt: l.createdAt.toISOString(),
    reservation: l.reservation
      ? {
          pickupDate: l.reservation.pickupDate.toISOString().split("T")[0],
          returnDate: l.reservation.returnDate.toISOString().split("T")[0],
          totalPrice: Number(l.reservation.totalPrice),
          vehicle: l.reservation.vehicle,
        }
      : null,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <LeadsClient leads={leads} />
    </div>
  );
}
