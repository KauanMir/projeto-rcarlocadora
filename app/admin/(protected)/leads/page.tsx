import { prisma } from "@/lib/prisma";
import { LeadsClient } from "@/components/admin/LeadsClient";
import { AdminPageHeader, AdminKpiCard } from "@/components/admin/AdminPageHeader";
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

  const total = leads.length;
  const newCount = leads.filter((l) => l.status === "NEW").length;
  const wonCount = leads.filter((l) => l.status === "WON").length;
  const negotiating = leads.filter((l) => l.status === "NEGOTIATING").length;

  return (
    <div style={{ padding: "28px 28px 40px" }}>
      <AdminPageHeader
        title="Leads"
        subtitle="Pipeline de vendas e acompanhamento de clientes."
        stats={[
          { label: "Total", value: total },
          { label: "Novos", value: newCount, color: "#a78bfa" },
          { label: "Negociando", value: negotiating, color: "#fbbf24" },
          { label: "Ganhos", value: wonCount, color: "#34d399" },
        ]}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
        <AdminKpiCard label="Total de leads" value={total} />
        <AdminKpiCard label="Novos" value={newCount} accent="#a78bfa" />
        <AdminKpiCard label="Negociando" value={negotiating} accent="#fbbf24" />
        <AdminKpiCard label="Ganhos" value={wonCount} accent="#34d399" />
      </div>

      <LeadsClient leads={leads} />
    </div>
  );
}
