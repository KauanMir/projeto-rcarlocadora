import { prisma } from "@/lib/prisma";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { formatPrice } from "@/utils/format";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

const MONTH_SHORT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const STATUS_CFG: Record<string, { label: string; dot: string; text: string }> = {
  PENDING:   { label: "Pendente",   dot: "bg-amber-400",   text: "text-amber-400" },
  CONFIRMED: { label: "Confirmada", dot: "bg-blue-400",    text: "text-blue-400" },
  FINISHED:  { label: "Concluída",  dot: "bg-emerald-400", text: "text-emerald-400" },
  CANCELLED: { label: "Cancelada",  dot: "bg-white/30",    text: "text-white/30" },
};

// ─── Sub-components (server-rendered) ────────────────────────

function KpiCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-white/20 text-[9px] tracking-[0.18em] uppercase">{label}</span>
        <span className="text-xl" aria-hidden>{icon}</span>
      </div>
      <div>
        <div className="text-white font-black text-[1.75rem] leading-none tracking-tight">
          {value}
        </div>
        {sub && <div className="text-white/25 text-[11px] mt-1.5">{sub}</div>}
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-white/60 text-sm font-bold">{title}</span>
      <div className="flex-1 h-px bg-white/[0.05]" />
    </div>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white/[0.025] border border-white/[0.07] rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );
}

function RankingRow({
  rank,
  brand,
  model,
  name,
  count,
  revenue,
}: {
  rank: number;
  brand: string;
  model: string;
  name: string;
  count: number;
  revenue: number;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/[0.05] last:border-b-0">
      <span className="text-white/15 text-[11px] font-black w-4 text-right shrink-0">{rank}</span>
      <div className="flex-1 min-w-0">
        <div className="text-white/80 text-xs font-semibold truncate">
          {brand} {model}
        </div>
        <div className="text-white/25 text-[10px] truncate">{name}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-white/80 text-xs font-bold">
          {count}{" "}
          <span className="text-white/25 font-normal">alug.</span>
        </div>
        {revenue > 0 && (
          <div className="text-white/25 text-[10px]">{formatPrice(revenue)}</div>
        )}
      </div>
    </div>
  );
}

function ActivityRow({
  id,
  customerName,
  vehicleName,
  totalPrice,
  status,
  date,
}: {
  id: string;
  customerName: string;
  vehicleName: string;
  totalPrice: number;
  status: string;
  date: string;
}) {
  const ref = `RCAR-${id.slice(-6).toUpperCase()}`;
  const sc = STATUS_CFG[status] ?? STATUS_CFG.PENDING;
  const d = new Date(date);
  const dateStr = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  const timeStr = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/[0.05] last:border-b-0">
      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${sc.dot}`} aria-hidden />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white/70 text-xs font-semibold">{customerName}</span>
          <span className={`text-[9px] font-bold uppercase tracking-wide ${sc.text}`}>
            {sc.label}
          </span>
        </div>
        <div className="text-white/25 text-[10px] truncate">
          {ref} · {vehicleName}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-white/60 text-xs font-medium">{formatPrice(totalPrice)}</div>
        <div className="text-white/20 text-[9px]">
          {dateStr} {timeStr}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default async function DashboardPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
  const twelveMonthsAgo = new Date(year, month - 11, 1);

  const [reservations12m, allPending, vehicles, recentNew, recentUpdatedRaw, leadGroups, activeRentalsCount] =
    await Promise.all([
      prisma.reservation.findMany({
        where: { createdAt: { gte: twelveMonthsAgo } },
        select: {
          id: true,
          vehicleId: true,
          totalPrice: true,
          status: true,
          pickupDate: true,
          returnDate: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.reservation.count({ where: { status: "PENDING" } }),
      prisma.vehicle.findMany({
        select: { id: true, name: true, brand: true, model: true, available: true },
      }),
      prisma.reservation.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          customerName: true,
          totalPrice: true,
          status: true,
          createdAt: true,
          vehicle: { select: { brand: true, model: true } },
        },
      }),
      prisma.reservation.findMany({
        take: 20,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          customerName: true,
          totalPrice: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          vehicle: { select: { brand: true, model: true } },
        },
      }),
      prisma.lead.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.rental.count({ where: { status: "ACTIVE" } }),
    ]);

  // ── KPI calculations ─────────────────────────────────────

  const thisMonthRes = reservations12m.filter(
    (r) => r.createdAt >= monthStart && r.createdAt <= monthEnd
  );
  const monthlyReservations = thisMonthRes.length;
  const monthlyRevenue = thisMonthRes
    .filter((r) => r.status !== "CANCELLED")
    .reduce((s, r) => s + Number(r.totalPrice), 0);

  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter((v) => v.available).length;

  const activeVehicleIds = new Set(
    reservations12m
      .filter(
        (r) =>
          r.status !== "CANCELLED" &&
          r.pickupDate <= monthEnd &&
          r.returnDate >= monthStart
      )
      .map((r) => r.vehicleId)
  );
  const occupancyRate =
    totalVehicles > 0
      ? Math.round((activeVehicleIds.size / totalVehicles) * 100)
      : 0;

  // ── Lead counts ─────────────────────────────────────────

  const leadCounts: Record<string, number> = {};
  for (const g of leadGroups) leadCounts[g.status] = g._count.status;
  const totalLeads = Object.values(leadCounts).reduce((s, n) => s + n, 0);

  // ── Chart data (last 12 months) ──────────────────────────

  const monthlyStats = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(year, month - 11 + i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
    const mRes = reservations12m.filter(
      (r) => r.createdAt >= start && r.createdAt <= end
    );
    return {
      label: MONTH_SHORT[m],
      reservations: mRes.length,
      revenue: mRes
        .filter((r) => r.status !== "CANCELLED")
        .reduce((s, r) => s + Number(r.totalPrice), 0),
    };
  });

  // ── Vehicle rankings (last 12 months, non-cancelled) ─────

  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));
  const vstats = new Map<string, { count: number; revenue: number }>();
  for (const v of vehicles) vstats.set(v.id, { count: 0, revenue: 0 });
  for (const r of reservations12m) {
    if (r.status === "CANCELLED") continue;
    const cur = vstats.get(r.vehicleId) ?? { count: 0, revenue: 0 };
    vstats.set(r.vehicleId, {
      count: cur.count + 1,
      revenue: cur.revenue + Number(r.totalPrice),
    });
  }

  const rankedVehicles = [...vstats.entries()]
    .map(([id, stats]) => ({
      id,
      brand: vehicleMap.get(id)?.brand ?? "—",
      model: vehicleMap.get(id)?.model ?? "—",
      name: vehicleMap.get(id)?.name ?? "—",
      ...stats,
    }))
    .sort((a, b) => b.count - a.count);

  const topVehicles = rankedVehicles.slice(0, 5);
  const leastRented = [...rankedVehicles].reverse().slice(0, 5);

  // ── Recent activity ──────────────────────────────────────

  const newReservations = recentNew.map((r) => ({
    id: r.id,
    customerName: r.customerName,
    vehicleName: `${r.vehicle.brand} ${r.vehicle.model}`,
    totalPrice: Number(r.totalPrice),
    status: r.status as string,
    date: r.createdAt.toISOString(),
  }));

  const recentUpdated = recentUpdatedRaw
    .filter((r) => r.updatedAt.getTime() - r.createdAt.getTime() > 5000)
    .slice(0, 6)
    .map((r) => ({
      id: r.id,
      customerName: r.customerName,
      vehicleName: `${r.vehicle.brand} ${r.vehicle.model}`,
      totalPrice: Number(r.totalPrice),
      status: r.status as string,
      date: r.updatedAt.toISOString(),
    }));

  return (
    <div className="px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white font-black text-2xl">Dashboard</h1>
        <p className="text-white/35 text-sm mt-1">
          Visão geral · {MONTH_SHORT[month]} {year}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
        <KpiCard
          icon="📋"
          label="Reservas do mês"
          value={monthlyReservations}
          sub="criadas este mês"
        />
        <KpiCard
          icon="💰"
          label="Receita do mês"
          value={formatPrice(monthlyRevenue)}
          sub="excl. canceladas"
        />
        <KpiCard
          icon="⏳"
          label="Pendentes"
          value={allPending}
          sub="aguardando ação"
        />
        <KpiCard
          icon="🚗"
          label="Disponíveis"
          value={`${availableVehicles}/${totalVehicles}`}
          sub="veículos ativos"
        />
        <KpiCard
          icon="📊"
          label="Ocupação"
          value={`${occupancyRate}%`}
          sub="veículos com reserva"
        />
        <KpiCard
          icon="🔑"
          label="Locações ativas"
          value={activeRentalsCount}
          sub="veículos na rua"
        />
      </div>

      {/* Leads summary */}
      {totalLeads > 0 && (
        <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl px-6 py-4 mb-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <span className="text-white/20 text-[9px] tracking-[0.18em] uppercase shrink-0">
            Leads
          </span>
          {(
            [
              { s: "NEW",         label: "Novos",       dot: "bg-violet-400"  },
              { s: "CONTACTED",   label: "Contatados",  dot: "bg-blue-400"    },
              { s: "NEGOTIATING", label: "Negociando",  dot: "bg-amber-400"   },
              { s: "WON",         label: "Ganhos",      dot: "bg-emerald-400" },
              { s: "LOST",        label: "Perdidos",    dot: "bg-white/30"    },
            ] as const
          ).map(({ s, label, dot }) =>
            (leadCounts[s] ?? 0) > 0 ? (
              <div key={s} className="flex items-center gap-2 shrink-0">
                <span className={`w-2 h-2 rounded-full ${dot}`} aria-hidden />
                <span className="text-white/35 text-xs">{label}</span>
                <span className="text-white font-bold text-sm">{leadCounts[s]}</span>
              </div>
            ) : null
          )}
          <a
            href="/admin/leads"
            className="ml-auto text-white/25 text-xs hover:text-white/60 transition-colors shrink-0"
          >
            Ver todos →
          </a>
        </div>
      )}

      {/* Charts */}
      <DashboardCharts monthlyStats={monthlyStats} />

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
        <Panel>
          <SectionTitle title="Mais alugados" />
          {topVehicles.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-6">Sem dados ainda.</p>
          ) : (
            topVehicles.map((v, i) => (
              <RankingRow key={v.id} rank={i + 1} {...v} />
            ))
          )}
        </Panel>

        <Panel>
          <SectionTitle title="Menos alugados" />
          {leastRented.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-6">Sem dados ainda.</p>
          ) : (
            leastRented.map((v, i) => (
              <RankingRow key={v.id} rank={i + 1} {...v} />
            ))
          )}
        </Panel>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8 mb-4">
        <Panel>
          <SectionTitle title="Novas reservas" />
          {newReservations.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-6">
              Nenhuma reserva recente.
            </p>
          ) : (
            newReservations.map((r) => <ActivityRow key={r.id} {...r} />)
          )}
        </Panel>

        <Panel>
          <SectionTitle title="Atualizadas recentemente" />
          {recentUpdated.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-6">
              Nenhuma atualização recente.
            </p>
          ) : (
            recentUpdated.map((r) => <ActivityRow key={r.id} {...r} />)
          )}
        </Panel>
      </div>
    </div>
  );
}
