import { prisma } from "@/lib/prisma";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { formatPrice } from "@/utils/format";
import { ClipboardList, DollarSign, Clock, Car, Gauge, Key, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

const MONTH_SHORT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: "Pendente",   color: "#fbbf24", bg: "rgba(251,191,36,0.12)"  },
  CONFIRMED: { label: "Confirmada", color: "#60a5fa", bg: "rgba(96,165,250,0.12)"  },
  FINISHED:  { label: "Concluída",  color: "#34d399", bg: "rgba(52,211,153,0.12)"  },
  CANCELLED: { label: "Cancelada",  color: "#9a999e", bg: "rgba(154,153,158,0.12)" },
};

// ─── KPI card ──────────────────────────────────────────────────

function KpiCard({
  Icon,
  label,
  value,
  sub,
  accent,
  large,
}: {
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  large?: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--ink-card)",
        border: "1px solid var(--ink-line)",
        borderRadius: "var(--r-md)",
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "relative",
        overflow: "hidden",
        ...(accent ? { borderLeft: `3px solid ${accent}` } : {}),
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            color: "var(--d-3)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontFamily: "var(--font-body)",
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "var(--r-xs)",
            background: accent ? `${accent}18` : "var(--ink-card-2)",
            border: `1px solid ${accent ? `${accent}28` : "var(--ink-line)"}`,
            display: "grid",
            placeItems: "center",
            color: accent ?? "var(--d-3)",
            flexShrink: 0,
          }}
        >
          <Icon size={15} />
        </div>
      </div>
      <div>
        <div
          style={{
            color: "#fff",
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: large ? 28 : 24,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </div>
        {sub && (
          <div style={{ color: "var(--d-3)", fontSize: 11, marginTop: 5 }}>{sub}</div>
        )}
      </div>
    </div>
  );
}

// ─── Section title ─────────────────────────────────────────────

function SectionTitle({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
      <span style={{ width: 20, height: 2, background: "var(--gold)", borderRadius: 2, flexShrink: 0 }} />
      <span
        style={{
          color: "var(--d-1)",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.06em",
          fontFamily: "var(--font-display)",
        }}
      >
        {title}
      </span>
      <div style={{ flex: 1, height: 1, background: "var(--ink-line)" }} />
    </div>
  );
}

// ─── Panel ─────────────────────────────────────────────────────

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{
        background: "var(--ink-card)",
        border: "1px solid var(--ink-line)",
        borderRadius: "var(--r-md)",
        padding: "20px 22px",
      }}
    >
      {children}
    </div>
  );
}

// ─── Ranking row ───────────────────────────────────────────────

function RankingRow({
  rank, brand, model, name, count, revenue,
}: {
  rank: number; brand: string; model: string; name: string; count: number; revenue: number;
}) {
  const isTop = rank === 1;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid var(--ink-line)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 13,
          color: isTop ? "var(--gold)" : "var(--d-4)",
          width: 18,
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        {rank}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "var(--d-fg)", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {brand} {model}
        </div>
        <div style={{ color: "var(--d-3)", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ color: "var(--d-1)", fontSize: 13, fontWeight: 700 }}>
          {count} <span style={{ color: "var(--d-4)", fontWeight: 400 }}>alug.</span>
        </div>
        {revenue > 0 && (
          <div style={{ color: "var(--d-3)", fontSize: 11 }}>{formatPrice(revenue)}</div>
        )}
      </div>
    </div>
  );
}

// ─── Activity row ──────────────────────────────────────────────

function ActivityRow({
  id, customerName, vehicleName, totalPrice, status, date,
}: {
  id: string; customerName: string; vehicleName: string;
  totalPrice: number; status: string; date: string;
}) {
  const ref = `RCAR-${id.slice(-6).toUpperCase()}`;
  const sc = STATUS_CFG[status] ?? STATUS_CFG.PENDING;
  const d = new Date(date);
  const dateStr = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  const timeStr = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid var(--ink-line)",
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: sc.color,
          flexShrink: 0,
          marginTop: 1,
        }}
        aria-hidden
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ color: "var(--d-1)", fontSize: 13, fontWeight: 600 }}>{customerName}</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: sc.bg,
              color: sc.color,
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "2px 7px",
              borderRadius: "var(--r-xs)",
            }}
          >
            {sc.label}
          </span>
        </div>
        <div style={{ color: "var(--d-3)", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {ref} · {vehicleName}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ color: "var(--d-1)", fontSize: 13, fontWeight: 600 }}>{formatPrice(totalPrice)}</div>
        <div style={{ color: "var(--d-4)", fontSize: 10 }}>
          {dateStr} {timeStr}
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────

export default async function DashboardPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
  const twelveMonthsAgo = new Date(year, month - 11, 1);

  const [reservations12m, allPending, vehicles, recentNew, recentUpdatedRaw, leadGroups, activeRentalsCount, rentalsWithoutChecklist] =
    await Promise.all([
      prisma.reservation.findMany({
        where: { createdAt: { gte: twelveMonthsAgo } },
        select: { id: true, vehicleId: true, totalPrice: true, status: true, pickupDate: true, returnDate: true, createdAt: true, updatedAt: true },
      }),
      prisma.reservation.count({ where: { status: "PENDING" } }),
      prisma.vehicle.findMany({ select: { id: true, name: true, brand: true, model: true, available: true } }),
      prisma.reservation.findMany({
        take: 6, orderBy: { createdAt: "desc" },
        select: { id: true, customerName: true, totalPrice: true, status: true, createdAt: true, vehicle: { select: { brand: true, model: true } } },
      }),
      prisma.reservation.findMany({
        take: 20, orderBy: { updatedAt: "desc" },
        select: { id: true, customerName: true, totalPrice: true, status: true, createdAt: true, updatedAt: true, vehicle: { select: { brand: true, model: true } } },
      }),
      prisma.lead.groupBy({ by: ["status"], _count: { status: true } }),
      prisma.rental.count({ where: { status: "ACTIVE" } }),
      prisma.rental.count({
        where: { status: { in: ["ACTIVE", "COMPLETED"] }, NOT: { checklists: { some: { type: "PICKUP" } } } },
      }),
    ]);

  // ── KPI calculations ─────────────────────────────────────

  const thisMonthRes = reservations12m.filter((r) => r.createdAt >= monthStart && r.createdAt <= monthEnd);
  const monthlyReservations = thisMonthRes.length;
  const monthlyRevenue = thisMonthRes.filter((r) => r.status !== "CANCELLED").reduce((s, r) => s + Number(r.totalPrice), 0);

  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter((v) => v.available).length;

  const activeVehicleIds = new Set(
    reservations12m.filter((r) => r.status !== "CANCELLED" && r.pickupDate <= monthEnd && r.returnDate >= monthStart).map((r) => r.vehicleId)
  );
  const occupancyRate = totalVehicles > 0 ? Math.round((activeVehicleIds.size / totalVehicles) * 100) : 0;

  // ── Lead counts ─────────────────────────────────────────

  const leadCounts: Record<string, number> = {};
  for (const g of leadGroups) leadCounts[g.status] = g._count.status;
  const totalLeads = Object.values(leadCounts).reduce((s, n) => s + n, 0);

  // ── Chart data ─────────────────────────────────────────

  const monthlyStats = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(year, month - 11 + i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
    const mRes = reservations12m.filter((r) => r.createdAt >= start && r.createdAt <= end);
    return {
      label: MONTH_SHORT[m],
      reservations: mRes.length,
      revenue: mRes.filter((r) => r.status !== "CANCELLED").reduce((s, r) => s + Number(r.totalPrice), 0),
    };
  });

  // ── Vehicle rankings ─────────────────────────────────────

  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));
  const vstats = new Map<string, { count: number; revenue: number }>();
  for (const v of vehicles) vstats.set(v.id, { count: 0, revenue: 0 });
  for (const r of reservations12m) {
    if (r.status === "CANCELLED") continue;
    const cur = vstats.get(r.vehicleId) ?? { count: 0, revenue: 0 };
    vstats.set(r.vehicleId, { count: cur.count + 1, revenue: cur.revenue + Number(r.totalPrice) });
  }

  const rankedVehicles = [...vstats.entries()]
    .map(([id, stats]) => ({ id, brand: vehicleMap.get(id)?.brand ?? "—", model: vehicleMap.get(id)?.model ?? "—", name: vehicleMap.get(id)?.name ?? "—", ...stats }))
    .sort((a, b) => b.count - a.count);

  const topVehicles = rankedVehicles.slice(0, 5);
  const leastRented = [...rankedVehicles].reverse().slice(0, 5);

  // ── Recent activity ────────────────────────────────────

  const newReservations = recentNew.map((r) => ({
    id: r.id, customerName: r.customerName,
    vehicleName: `${r.vehicle.brand} ${r.vehicle.model}`,
    totalPrice: Number(r.totalPrice), status: r.status as string, date: r.createdAt.toISOString(),
  }));

  const recentUpdated = recentUpdatedRaw
    .filter((r) => r.updatedAt.getTime() - r.createdAt.getTime() > 5000)
    .slice(0, 6)
    .map((r) => ({
      id: r.id, customerName: r.customerName,
      vehicleName: `${r.vehicle.brand} ${r.vehicle.model}`,
      totalPrice: Number(r.totalPrice), status: r.status as string, date: r.updatedAt.toISOString(),
    }));

  return (
    <div style={{ padding: "28px 28px 40px" }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ width: 22, height: 2, background: "var(--gold)", borderRadius: 2 }} />
          <span style={{ color: "var(--gold)", fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
            Admin
          </span>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1 }}>
          Dashboard
        </h1>
        <p style={{ color: "var(--d-2)", fontSize: 14, marginTop: 6 }}>
          Visão geral · {MONTH_SHORT[month]} {year}
        </p>
      </div>

      {/* Checklist warning */}
      {rentalsWithoutChecklist > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            background: "rgba(251,191,36,0.07)",
            border: "1px solid rgba(251,191,36,0.2)",
            borderRadius: "var(--r-md)",
            padding: "12px 16px",
            marginBottom: 24,
          }}
        >
          <AlertTriangle size={16} style={{ color: "#fbbf24", flexShrink: 0 }} />
          <span style={{ color: "rgba(251,191,36,0.8)", fontSize: 13.5, flex: 1 }}>
            {rentalsWithoutChecklist} locaç{rentalsWithoutChecklist !== 1 ? "ões" : "ão"} sem checklist de retirada
          </span>
          <a
            href="/admin/rentals"
            style={{ color: "#fbbf24", fontSize: 12.5, fontWeight: 600, textDecoration: "none" }}
          >
            Verificar →
          </a>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
        <KpiCard Icon={ClipboardList} label="Reservas do mês"  value={monthlyReservations} sub="criadas este mês"      />
        <KpiCard Icon={DollarSign}   label="Receita do mês"   value={formatPrice(monthlyRevenue)} sub="excl. canceladas" accent="var(--gold)" large />
        <KpiCard Icon={Clock}        label="Pendentes"         value={allPending}           sub="aguardando ação"       accent="#fbbf24" />
        <KpiCard Icon={Car}          label="Disponíveis"       value={`${availableVehicles}/${totalVehicles}`} sub="veículos ativos" />
        <KpiCard Icon={Gauge}        label="Ocupação"          value={`${occupancyRate}%`}  sub="veículos com reserva"  accent="#60a5fa" />
        <KpiCard Icon={Key}          label="Locações ativas"   value={activeRentalsCount}   sub="veículos na rua"      accent="#34d399" />
      </div>

      {/* Leads summary */}
      {totalLeads > 0 && (
        <div
          style={{
            background: "var(--ink-card)",
            border: "1px solid var(--ink-line)",
            borderRadius: "var(--r-md)",
            padding: "14px 20px",
            marginBottom: 28,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "12px 24px",
          }}
        >
          <span style={{ color: "var(--d-3)", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "var(--font-body)", flexShrink: 0 }}>
            Leads
          </span>
          {(
            [
              { s: "NEW",         label: "Novos",      color: "#a78bfa" },
              { s: "CONTACTED",   label: "Contatados", color: "#60a5fa" },
              { s: "NEGOTIATING", label: "Negociando", color: "#fbbf24" },
              { s: "WON",         label: "Ganhos",     color: "#34d399" },
              { s: "LOST",        label: "Perdidos",   color: "#9a999e" },
            ] as const
          ).map(({ s, label, color }) =>
            (leadCounts[s] ?? 0) > 0 ? (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} aria-hidden />
                <span style={{ color: "var(--d-2)", fontSize: 13 }}>{label}</span>
                <span style={{ color: "#fff", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15 }}>{leadCounts[s]}</span>
              </div>
            ) : null
          )}
          <a href="/admin/leads" style={{ marginLeft: "auto", color: "var(--d-3)", fontSize: 12.5, textDecoration: "none", fontWeight: 600 }}>
            Ver todos →
          </a>
        </div>
      )}

      {/* Charts */}
      <DashboardCharts monthlyStats={monthlyStats} />

      {/* Rankings */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16, marginTop: 28 }}>
        <Panel>
          <SectionTitle title="Mais alugados — últimos 12 meses" />
          {topVehicles.length === 0 ? (
            <p style={{ color: "var(--d-4)", fontSize: 13, textAlign: "center", padding: "24px 0" }}>Sem dados ainda.</p>
          ) : (
            topVehicles.map((v, i) => <RankingRow key={v.id} rank={i + 1} {...v} />)
          )}
        </Panel>

        <Panel>
          <SectionTitle title="Menos alugados — últimos 12 meses" />
          {leastRented.length === 0 ? (
            <p style={{ color: "var(--d-4)", fontSize: 13, textAlign: "center", padding: "24px 0" }}>Sem dados ainda.</p>
          ) : (
            leastRented.map((v, i) => <RankingRow key={v.id} rank={i + 1} {...v} />)
          )}
        </Panel>
      </div>

      {/* Recent activity */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16, marginTop: 16 }}>
        <Panel>
          <SectionTitle title="Novas reservas" />
          {newReservations.length === 0 ? (
            <p style={{ color: "var(--d-4)", fontSize: 13, textAlign: "center", padding: "24px 0" }}>Nenhuma reserva recente.</p>
          ) : (
            newReservations.map((r) => <ActivityRow key={r.id} {...r} />)
          )}
        </Panel>

        <Panel>
          <SectionTitle title="Atualizadas recentemente" />
          {recentUpdated.length === 0 ? (
            <p style={{ color: "var(--d-4)", fontSize: 13, textAlign: "center", padding: "24px 0" }}>Nenhuma atualização recente.</p>
          ) : (
            recentUpdated.map((r) => <ActivityRow key={r.id} {...r} />)
          )}
        </Panel>
      </div>
    </div>
  );
}
