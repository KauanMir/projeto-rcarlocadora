import { prisma } from "@/lib/prisma";
import { DashboardCharts, type FleetMixItem, type UtilItem } from "@/components/admin/DashboardCharts";
import { formatPrice } from "@/utils/format";
import { AlertTriangle, TrendingUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

const MONTH_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const CATEGORY_COLORS: Record<string, string> = {
  ECONOMY: "#ffb800",
  SEDAN:   "#60a5fa",
  SUV:     "#34d399",
  PICKUP:  "#a78bfa",
  MINIVAN: "#f87171",
};

const CATEGORY_LABELS: Record<string, string> = {
  ECONOMY: "Econômico",
  SEDAN:   "Sedan",
  SUV:     "SUV",
  PICKUP:  "Picape",
  MINIVAN: "Minivan",
};

const STATUS_CFG: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  PENDING:   { label: "Pendente",   dot: "#fbbf24", text: "#fbbf24", bg: "rgba(251,191,36,0.12)"  },
  CONFIRMED: { label: "Confirmada", dot: "#60a5fa", text: "#60a5fa", bg: "rgba(96,165,250,0.12)"  },
  FINISHED:  { label: "Concluída",  dot: "#34d399", text: "#34d399", bg: "rgba(52,211,153,0.12)"  },
  CANCELLED: { label: "Cancelada",  dot: "#9a999e", text: "#9a999e", bg: "rgba(154,153,158,0.12)" },
};

const aCard: React.CSSProperties = {
  background: "var(--ink-card)",
  border: "1px solid var(--ink-line)",
  borderRadius: "var(--r-md)",
};

// ─── Sub-components (server-rendered) ─────────────────────────

function KpiCard({
  icon,
  label,
  value,
  sub,
  trend,
  warn,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  trend?: string;
  warn?: boolean;
}) {
  return (
    <div style={{ ...aCard, padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          style={{
            color: "var(--d-3)",
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontFamily: "var(--font-body)",
          }}
        >
          {label}
        </span>
        <span style={{ color: warn ? "#fbbf24" : "var(--d-2)", fontSize: 17 }} aria-hidden>
          {icon}
        </span>
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 27,
              color: "#fff",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {value}
          </span>
          {trend && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 2, color: "#34d399", fontSize: 11.5, fontWeight: 700 }}>
              <TrendingUp size={12} /> {trend}
            </span>
          )}
        </div>
        {sub && <div style={{ color: "var(--d-3)", fontSize: 11.5, marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}

function PanelTitle({ children }: { children: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
      <span style={{ color: "var(--d-1)", fontSize: 13.5, fontWeight: 700 }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: "var(--ink-line)" }} />
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────

export default async function DashboardPage() {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();

  const monthStart     = new Date(year, month, 1);
  const monthEnd       = new Date(year, month + 1, 0, 23, 59, 59, 999);
  const twelveMonthsAgo = new Date(year, month - 11, 1);

  const [reservations12m, allPending, vehicles, recentNew, leadGroups, activeRentalsCount, rentalsWithoutChecklist] =
    await Promise.all([
      prisma.reservation.findMany({
        where: { createdAt: { gte: twelveMonthsAgo } },
        select: { id: true, vehicleId: true, totalPrice: true, status: true, pickupDate: true, returnDate: true, createdAt: true, updatedAt: true },
      }),
      prisma.reservation.count({ where: { status: "PENDING" } }),
      prisma.vehicle.findMany({ select: { id: true, name: true, brand: true, model: true, available: true, category: true } }),
      prisma.reservation.findMany({
        take: 5, orderBy: { createdAt: "desc" },
        select: { id: true, customerName: true, totalPrice: true, status: true, createdAt: true, vehicle: { select: { brand: true, model: true } } },
      }),
      prisma.lead.groupBy({ by: ["status"], _count: { status: true } }),
      prisma.rental.count({ where: { status: "ACTIVE" } }),
      prisma.rental.count({
        where: { status: { in: ["ACTIVE","COMPLETED"] }, NOT: { checklists: { some: { type: "PICKUP" } } } },
      }),
    ]);

  // ── KPIs ──────────────────────────────────────────────────

  const thisMonthRes    = reservations12m.filter((r) => r.createdAt >= monthStart && r.createdAt <= monthEnd);
  const monthlyRevenue  = thisMonthRes.filter((r) => r.status !== "CANCELLED").reduce((s, r) => s + Number(r.totalPrice), 0);
  const totalVehicles   = vehicles.length;
  const availableVehicles = vehicles.filter((v) => v.available).length;

  const activeVehicleIds = new Set(
    reservations12m
      .filter((r) => r.status !== "CANCELLED" && r.pickupDate <= monthEnd && r.returnDate >= monthStart)
      .map((r) => r.vehicleId)
  );
  const occupancyRate = totalVehicles > 0 ? Math.round((activeVehicleIds.size / totalVehicles) * 100) : 0;

  // ── Leads ─────────────────────────────────────────────────

  const leadCounts: Record<string, number> = {};
  for (const g of leadGroups) leadCounts[g.status] = g._count.status;

  // ── Chart data ─────────────────────────────────────────────

  const monthlyStats = Array.from({ length: 12 }, (_, i) => {
    const d     = new Date(year, month - 11 + i, 1);
    const y     = d.getFullYear();
    const m     = d.getMonth();
    const start = new Date(y, m, 1);
    const end   = new Date(y, m + 1, 0, 23, 59, 59, 999);
    const mRes  = reservations12m.filter((r) => r.createdAt >= start && r.createdAt <= end);
    return {
      label: MONTH_SHORT[m],
      reservations: mRes.length,
      revenue: mRes.filter((r) => r.status !== "CANCELLED").reduce((s, r) => s + Number(r.totalPrice), 0),
    };
  });

  // ── Fleet mix (donut) ──────────────────────────────────────

  const categoryCounts: Record<string, number> = {};
  for (const v of vehicles) {
    categoryCounts[v.category] = (categoryCounts[v.category] ?? 0) + 1;
  }
  const fleetMix: FleetMixItem[] = Object.entries(categoryCounts)
    .filter(([, c]) => c > 0)
    .map(([cat, count]) => ({
      label: CATEGORY_LABELS[cat] ?? cat,
      count,
      color: CATEGORY_COLORS[cat] ?? "#9a999e",
    }));

  // ── Utilization (horizontal bars) ─────────────────────────

  const utilization: UtilItem[] = Object.entries(categoryCounts)
    .filter(([, c]) => c > 0)
    .map(([cat, fleet]) => {
      const catVehicleIds = new Set(vehicles.filter((v) => v.category === cat).map((v) => v.id));
      const active = new Set(
        reservations12m
          .filter((r) => r.status !== "CANCELLED" && catVehicleIds.has(r.vehicleId) && r.pickupDate <= monthEnd && r.returnDate >= monthStart)
          .map((r) => r.vehicleId)
      );
      return {
        cat: CATEGORY_LABELS[cat] ?? cat,
        fleet,
        pct: Math.round((active.size / fleet) * 100),
      };
    })
    .sort((a, b) => b.pct - a.pct);

  // ── Vehicle rankings ───────────────────────────────────────

  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));
  const vstats = new Map<string, { count: number; revenue: number }>();
  for (const v of vehicles) vstats.set(v.id, { count: 0, revenue: 0 });
  for (const r of reservations12m) {
    if (r.status === "CANCELLED") continue;
    const cur = vstats.get(r.vehicleId) ?? { count: 0, revenue: 0 };
    vstats.set(r.vehicleId, { count: cur.count + 1, revenue: cur.revenue + Number(r.totalPrice) });
  }
  const topVehicles = [...vstats.entries()]
    .map(([id, s]) => ({ id, brand: vehicleMap.get(id)?.brand ?? "—", model: vehicleMap.get(id)?.model ?? "—", name: vehicleMap.get(id)?.name ?? "—", ...s }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ── Recent activity ────────────────────────────────────────

  const recentActivity = recentNew.map((r) => ({
    id: r.id,
    customer: r.customerName,
    vehicle: `${r.vehicle.brand} ${r.vehicle.model}`,
    total: Number(r.totalPrice),
    status: r.status as string,
    date: r.createdAt.toISOString().slice(5, 10),
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div>
        <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, fontFamily: "var(--font-display)" }}>Dashboard</h1>
        <p style={{ color: "var(--d-2)", fontSize: 14, marginTop: 4 }}>
          Visão geral · {MONTH_SHORT[month]} {year}
        </p>
      </div>

      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(168px, 1fr))", gap: 12 }}>
        <KpiCard icon="📋" label="Reservas do mês" value={thisMonthRes.length} sub="criadas este mês" trend="+15%" />
        <KpiCard icon="💰" label="Receita do mês"  value={formatPrice(monthlyRevenue)} sub="excl. canceladas" trend="+20%" />
        <KpiCard icon="⏳" label="Pendentes"        value={allPending} sub="aguardando ação" warn />
        <KpiCard icon="🚗" label="Disponíveis"      value={`${availableVehicles}/${totalVehicles}`} sub="veículos ativos" />
        <KpiCard icon="📊" label="Ocupação"         value={`${occupancyRate}%`} sub="veículos com reserva" />
        <KpiCard icon="🔑" label="Locações ativas"  value={activeRentalsCount} sub="veículos na rua" />
      </div>

      {/* Checklist warning */}
      {rentalsWithoutChecklist > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(251,191,36,0.07)",
            border: "1px solid rgba(251,191,36,0.22)",
            borderRadius: "var(--r-sm)",
            padding: "12px 18px",
          }}
        >
          <AlertTriangle size={16} style={{ color: "#fbbf24", flexShrink: 0 }} />
          <span style={{ color: "rgba(251,191,36,0.85)", fontSize: 13.5, flex: 1 }}>
            {rentalsWithoutChecklist} locaç{rentalsWithoutChecklist !== 1 ? "ões" : "ão"} sem checklist de retirada
          </span>
          <a href="/admin/rentals" style={{ color: "rgba(251,191,36,0.6)", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
            Verificar →
          </a>
        </div>
      )}

      {/* Leads strip */}
      {Object.keys(leadCounts).length > 0 && (
        <div style={{ ...aCard, padding: "16px 22px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 26px" }}>
          <span style={{ color: "var(--d-3)", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
            Leads
          </span>
          {(
            [
              { s: "NEW",         label: "Novos",      dot: "#a78bfa" },
              { s: "CONTACTED",   label: "Contatados", dot: "#60a5fa" },
              { s: "NEGOTIATING", label: "Negociando", dot: "#fbbf24" },
              { s: "WON",         label: "Ganhos",     dot: "#34d399" },
              { s: "LOST",        label: "Perdidos",   dot: "#9a999e" },
            ] as const
          ).map(({ s, label, dot }) =>
            (leadCounts[s] ?? 0) > 0 ? (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot }} />
                <span style={{ color: "var(--d-2)", fontSize: 13 }}>{label}</span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "var(--font-display)" }}>{leadCounts[s]}</span>
              </div>
            ) : null
          )}
          <a href="/admin/leads" style={{ marginLeft: "auto", color: "var(--d-3)", fontSize: 12.5, textDecoration: "none" }}>
            Ver todos →
          </a>
        </div>
      )}

      {/* Charts — exact design layout */}
      <DashboardCharts monthlyStats={monthlyStats} fleetMix={fleetMix} utilization={utilization} />

      {/* Row 3: Rankings + Recent activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="adm-2col">
        {/* Most rented */}
        <div style={{ ...aCard, padding: 24 }}>
          <PanelTitle>Mais alugados</PanelTitle>
          {topVehicles.length === 0 ? (
            <p style={{ color: "var(--d-4)", fontSize: 13, textAlign: "center", padding: "24px 0" }}>Sem dados ainda.</p>
          ) : (
            topVehicles.map((v, i) => (
              <div
                key={v.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 0",
                  borderBottom: i < topVehicles.length - 1 ? "1px solid var(--ink-line)" : "none",
                }}
              >
                <span style={{ color: "var(--d-3)", fontSize: 12, fontWeight: 800, width: 16, textAlign: "right", flexShrink: 0 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "var(--d-fg)", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.brand} {v.model}</div>
                  <div style={{ color: "var(--d-3)", fontSize: 11 }}>{v.name}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ color: "var(--d-fg)", fontSize: 13, fontWeight: 700 }}>
                    {v.count} <span style={{ color: "var(--d-3)", fontWeight: 400 }}>alug.</span>
                  </div>
                  {v.revenue > 0 && <div style={{ color: "var(--d-3)", fontSize: 11 }}>{formatPrice(v.revenue)}</div>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent activity */}
        <div style={{ ...aCard, padding: 24 }}>
          <PanelTitle>Atividade recente</PanelTitle>
          {recentActivity.length === 0 ? (
            <p style={{ color: "var(--d-4)", fontSize: 13, textAlign: "center", padding: "24px 0" }}>Nenhuma reserva recente.</p>
          ) : (
            recentActivity.map((r) => {
              const sc = STATUS_CFG[r.status] ?? STATUS_CFG.PENDING;
              return (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 11,
                    padding: "11px 0",
                    borderBottom: "1px solid var(--ink-line)",
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: "50%", marginTop: 5, background: sc.dot, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ color: "var(--d-fg)", fontSize: 13, fontWeight: 600 }}>{r.customer}</span>
                      <span style={{ color: sc.text, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{sc.label}</span>
                    </div>
                    <div style={{ color: "var(--d-3)", fontSize: 11, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      RCAR-{r.id.slice(-6).toUpperCase()} · {r.vehicle}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ color: "var(--d-1)", fontSize: 12.5, fontWeight: 600 }}>{formatPrice(r.total)}</div>
                    <div style={{ color: "var(--d-3)", fontSize: 10 }}>{r.date}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Responsive breakpoints matching design */}
      <style>{`
        @media (max-width: 900px) {
          .adm-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
