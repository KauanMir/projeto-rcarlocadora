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
          pickupDate: true,
          returnDate: true,
          totalPrice: true,
          vehicle: { select: { brand: true, model: true } },
        },
      },
    },
  });

  const leads = rows.map((l) => ({
    id: l.id,
    name: l.name,
    phone: l.phone,
    status: l.status as string,
    notes: l.notes ?? null,
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

  const total = leads.length;
  const newCount = leads.filter((l) => l.status === "NEW").length;
  const wonCount = leads.filter((l) => l.status === "WON").length;

  return (
    <div className="px-6 py-8">
      <div className="mb-8">
        <h1 className="text-white font-black text-2xl">Leads</h1>
        <p className="text-white/35 text-sm mt-1">
          {total} lead{total !== 1 ? "s" : ""} ·{" "}
          {newCount} novo{newCount !== 1 ? "s" : ""} ·{" "}
          {wonCount} ganho{wonCount !== 1 ? "s" : ""}
        </p>
      </div>

      <LeadsClient leads={leads} />
    </div>
  );
}
