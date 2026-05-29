"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/toastStore";
import { formatPrice, formatDateShort } from "@/utils/format";

// ─── Types ────────────────────────────────────────────────────

type ReservationStatus = "PENDING" | "CONFIRMED" | "FINISHED" | "CANCELLED";

interface CalendarReservation {
  id: string;
  customerName: string;
  customerPhone: string;
  pickupDate: string;   // YYYY-MM-DD
  returnDate: string;   // YYYY-MM-DD
  rentalDays: number;
  insuranceType: string;
  addons: unknown;
  subtotal: number;
  totalPrice: number;
  status: string;
  notes: string | null;
  createdAt: string;
  hasActiveRental: boolean;
}

interface CalendarVehicle {
  id: string;
  brand: string;
  model: string;
  name: string;
  category: string;
  available: boolean;
  reservations: CalendarReservation[];
}

interface CalendarClientProps {
  vehicles: CalendarVehicle[];
  year: number;
  month: number;
}

// ─── Status config ────────────────────────────────────────────

const STATUS_CFG: Record<string, {
  label: string;
  bar: string;      // bar background + border
  barText: string;  // text on bar
  badge: string;    // badge (modal)
  dot: string;
}> = {
  PENDING:   {
    label: "Pendente",
    bar:     "bg-amber-500/30 border border-amber-500/50 hover:bg-amber-500/45",
    barText: "text-amber-100",
    badge:   "bg-amber-500/15 text-amber-400 border-amber-500/25",
    dot:     "bg-amber-400",
  },
  CONFIRMED: {
    label: "Confirmada",
    bar:     "bg-blue-500/30 border border-blue-500/50 hover:bg-blue-500/45",
    barText: "text-blue-100",
    badge:   "bg-blue-500/15 text-blue-400 border-blue-500/25",
    dot:     "bg-blue-400",
  },
  FINISHED:  {
    label: "Concluída",
    bar:     "bg-emerald-500/25 border border-emerald-500/40 hover:bg-emerald-500/35",
    barText: "text-emerald-100",
    badge:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    dot:     "bg-emerald-400",
  },
  CANCELLED: {
    label: "Cancelada",
    bar:     "bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1]",
    barText: "text-white/30",
    badge:   "bg-white/10 text-white/40 border-white/15",
    dot:     "bg-white/30",
  },
};
const STATUS_OPTIONS: ReservationStatus[] = ["PENDING", "CONFIRMED", "FINISHED", "CANCELLED"];
const fallbackCfg = STATUS_CFG.PENDING;
function scfg(s: string) { return STATUS_CFG[s] ?? fallbackCfg; }

// ─── Date helpers ─────────────────────────────────────────────

const MONTH_NAMES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];
const DOW_SHORT = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getDow(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay(); // 0=Sun
}

function isWeekend(year: number, month: number, day: number) {
  const d = getDow(year, month, day);
  return d === 0 || d === 6;
}

/** Returns 0-based start/end day indices clamped to the current month. */
function barSpan(
  res: CalendarReservation,
  year: number,
  month: number,
  totalDays: number
): { start: number; end: number; clippedLeft: boolean; clippedRight: boolean } {
  const pad = (n: number) => String(n).padStart(2, "0");
  const firstDay = `${year}-${pad(month)}-01`;
  const lastDay  = `${year}-${pad(month)}-${pad(totalDays)}`;

  const clippedLeft  = res.pickupDate  < firstDay;
  const clippedRight = res.returnDate  > lastDay;

  const effStart = clippedLeft  ? firstDay : res.pickupDate;
  const effEnd   = clippedRight ? lastDay   : res.returnDate;

  const start = parseInt(effStart.split("-")[2]) - 1; // 0-based
  const end   = parseInt(effEnd.split("-")[2])   - 1;

  return { start, end, clippedLeft, clippedRight };
}

// ─── Reservation detail modal ─────────────────────────────────

function ReservationModal({
  reservation,
  liveStatus,
  updatingId,
  onClose,
  onStatusChange,
}: {
  reservation: CalendarReservation;
  liveStatus: string;
  updatingId: string | null;
  onClose: () => void;
  onStatusChange: (id: string, status: ReservationStatus) => Promise<void>;
}) {
  const ref = `RCAR-${reservation.id.slice(-6).toUpperCase()}`;
  const c   = scfg(liveStatus);
  const isUpdating = updatingId === reservation.id;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} aria-hidden />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Reserva ${ref}`}
        className="relative w-full sm:max-w-lg bg-[#0c0c0c] border border-white/[0.08] sm:rounded-2xl z-10 max-h-[90dvh] flex flex-col overflow-hidden"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 340 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] shrink-0">
          <div>
            <div className="text-white font-bold">{ref}</div>
            <div className="text-white/35 text-xs mt-0.5">
              {new Date(reservation.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold tracking-[0.12em] uppercase border ${c.badge}`}>
              {c.label}
            </span>
            <button onClick={onClose} aria-label="Fechar" className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white transition-colors">✕</button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4 overflow-y-auto">
          <section>
            <h3 className="text-white/25 text-[9px] tracking-[0.18em] uppercase mb-2">Cliente</h3>
            <p className="text-white font-medium">{reservation.customerName}</p>
            <a href={`tel:${reservation.customerPhone}`} className="text-white/50 text-sm hover:text-white transition-colors">
              {reservation.customerPhone}
            </a>
          </section>

          <section>
            <h3 className="text-white/25 text-[9px] tracking-[0.18em] uppercase mb-2">Período</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Retirada",  value: formatDateShort(reservation.pickupDate) },
                { label: "Devolução", value: formatDateShort(reservation.returnDate) },
                { label: "Duração",   value: `${reservation.rentalDays} dia${reservation.rentalDays !== 1 ? "s" : ""}` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-white/30 text-[10px] uppercase tracking-wide">{label}</div>
                  <div className="text-white text-sm mt-0.5">{value}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-white/25 text-[9px] tracking-[0.18em] uppercase mb-2">Valor</h3>
            <div className="flex items-baseline justify-between">
              <span className="text-white/40 text-sm">Total</span>
              <span className="text-white font-black text-2xl">{formatPrice(reservation.totalPrice)}</span>
            </div>
          </section>

          {reservation.notes && (
            <section>
              <h3 className="text-white/25 text-[9px] tracking-[0.18em] uppercase mb-2">Observações</h3>
              <p className="text-white/50 text-sm">{reservation.notes}</p>
            </section>
          )}

          {/* Status change */}
          <section>
            <h3 className="text-white/25 text-[9px] tracking-[0.18em] uppercase mb-3">Alterar Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((s) => {
                const sc = scfg(s);
                const isCurrent = s === liveStatus;
                return (
                  <button
                    key={s}
                    onClick={() => onStatusChange(reservation.id, s)}
                    disabled={isUpdating || isCurrent}
                    className={`h-10 flex items-center justify-center gap-2 rounded-lg border text-xs font-semibold transition-all ${
                      isCurrent
                        ? `${sc.badge} opacity-40 cursor-default`
                        : "border-white/10 text-white/50 hover:text-white hover:border-white/25 hover:bg-white/[0.04] active:scale-[0.97] disabled:opacity-30"
                    }`}
                  >
                    {isUpdating ? (
                      <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" aria-hidden />
                    ) : (
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} aria-hidden />
                    )}
                    {sc.label}
                    {isCurrent && <span className="text-[9px] opacity-60 font-normal">atual</span>}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Reservation bar with tooltip ────────────────────────────

function ReservationBar({
  reservation,
  totalDays,
  year,
  month,
  onOpen,
}: {
  reservation: CalendarReservation;
  totalDays: number;
  year: number;
  month: number;
  onOpen: (r: CalendarReservation) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const c = scfg(reservation.status);

  const { start, end, clippedLeft, clippedRight } = barSpan(reservation, year, month, totalDays);
  const span = end - start + 1;

  // Percentage-based position inside the days area
  const leftPct  = (start / totalDays) * 100;
  const widthPct = (span / totalDays) * 100;

  // Tooltip horizontal alignment: avoid overflow at edges
  const tooltipAlign =
    start < totalDays * 0.3  ? "left-0"  :
    end   > totalDays * 0.7  ? "right-0" :
    "left-1/2 -translate-x-1/2";

  return (
    <div
      className="absolute"
      style={{ left: `${leftPct}%`, width: `calc(${widthPct}% - 3px)`, top: 9, height: 30 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen(reservation)}
    >
      {/* Bar */}
      <div
        className={`w-full h-full flex items-center overflow-hidden cursor-pointer transition-all duration-150 ${c.bar} ${
          clippedLeft  ? "rounded-l-none rounded-r-md" :
          clippedRight ? "rounded-l-md rounded-r-none" :
          "rounded-md"
        }`}
        aria-label={`${reservation.customerName} — ${reservation.status}`}
      >
        {/* Clipped left indicator */}
        {clippedLeft && (
          <span className={`shrink-0 text-[8px] ${c.barText} opacity-60 pl-1`}>◄</span>
        )}
        <span className={`truncate text-[10px] font-semibold px-1.5 ${c.barText}`}>
          {reservation.customerName.split(" ")[0]}
        </span>
        {/* Clipped right indicator */}
        {clippedRight && (
          <span className={`shrink-0 text-[8px] ${c.barText} opacity-60 pr-1 ml-auto`}>►</span>
        )}

        {/* Active rental indicator */}
        {reservation.hasActiveRental && (
          <span className="absolute top-1.5 right-1.5 flex" aria-label="Locação ativa">
            <span className="absolute w-2 h-2 rounded-full bg-emerald-400 opacity-70 animate-ping" />
            <span className="relative w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px rgba(52,211,153,0.8)" }} />
          </span>
        )}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.1 }}
            className={`absolute bottom-full mb-1.5 z-40 w-52 pointer-events-none ${tooltipAlign}`}
            style={{
              background: "rgba(10,10,12,0.97)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.09)",
              borderRadius: 10,
            }}
          >
            <div className="px-3.5 py-3 flex flex-col gap-2">
              {/* Customer */}
              <div>
                <div className="text-white font-semibold text-xs leading-tight">{reservation.customerName}</div>
                <div className="text-white/35 text-[10px] mt-0.5">{reservation.customerPhone}</div>
              </div>
              {/* Period */}
              <div className="flex items-center gap-1 text-white/50 text-[10px]">
                <span>{formatDateShort(reservation.pickupDate)}</span>
                <span className="text-white/20">→</span>
                <span>{formatDateShort(reservation.returnDate)}</span>
                <span className="text-white/25 ml-0.5">({reservation.rentalDays}d)</span>
              </div>
              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-white/30 text-[10px]">Total</span>
                <span className="text-white font-bold text-sm">{formatPrice(reservation.totalPrice)}</span>
              </div>
              {/* Status badge */}
              <div className="pt-1 border-t border-white/[0.07]">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[9px] font-bold tracking-[0.12em] uppercase border ${scfg(reservation.status).badge}`}>
                  <span className={`w-1 h-1 rounded-full ${scfg(reservation.status).dot}`} aria-hidden />
                  {scfg(reservation.status).label}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Vehicle row ──────────────────────────────────────────────

const VEHICLE_COL_W = 176; // px — fixed left column width
const DAY_W         = 36;  // px — per day cell

function VehicleRow({
  vehicle,
  totalDays,
  year,
  month,
  todayIdx,
  onOpen,
}: {
  vehicle: CalendarVehicle;
  totalDays: number;
  year: number;
  month: number;
  todayIdx: number;
  onOpen: (r: CalendarReservation) => void;
}) {
  return (
    <div className="flex border-b border-white/[0.04] last:border-b-0 group/row hover:bg-white/[0.015] transition-colors">
      {/* Vehicle name — fixed column */}
      <div
        style={{ minWidth: VEHICLE_COL_W, width: VEHICLE_COL_W }}
        className="shrink-0 flex items-center px-4 border-r border-white/[0.07] h-14"
      >
        <div className="min-w-0">
          <div className="text-white/80 text-xs font-semibold truncate leading-tight">
            {vehicle.brand} {vehicle.model}
          </div>
          <div className="text-white/30 text-[10px] truncate mt-0.5">{vehicle.name}</div>
        </div>
      </div>

      {/* Days area — scrolls horizontally */}
      <div className="flex-1 relative h-14" style={{ minWidth: totalDays * DAY_W }}>
        {/* Day grid lines */}
        <div className="absolute inset-0 flex pointer-events-none">
          {Array.from({ length: totalDays }, (_, i) => (
            <div
              key={i}
              style={{ minWidth: DAY_W, width: DAY_W }}
              className={`h-full border-r border-white/[0.04] ${
                i === todayIdx     ? "bg-blue-500/[0.06]"   :
                isWeekend(year, month, i + 1) ? "bg-white/[0.012]" :
                ""
              }`}
            />
          ))}
        </div>

        {/* Reservation bars */}
        {vehicle.reservations.map((res) => (
          <ReservationBar
            key={res.id}
            reservation={res}
            totalDays={totalDays}
            year={year}
            month={month}
            onOpen={onOpen}
          />
        ))}

        {/* Empty state hint */}
        {vehicle.reservations.length === 0 && (
          <div className="absolute inset-0 flex items-center pointer-events-none">
            <span className="text-white/[0.07] text-[10px] pl-3">—</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main CalendarClient ──────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  ECONOMY: "Econ.", SEDAN: "Sedan", SUV: "SUV", PREMIUM: "Prem.",
};

export function CalendarClient({ vehicles, year, month }: CalendarClientProps) {
  const router   = useRouter();
  const addToast = useToastStore((s) => s.add);

  const [selectedRes, setSelectedRes]   = useState<CalendarReservation | null>(null);
  const [updatingId,  setUpdatingId]    = useState<string | null>(null);
  const [localVehicles, setLocalVehicles] = useState(vehicles);

  const totalDays = daysInMonth(year, month);

  // Today marker
  const now   = new Date();
  const todayIdx =
    now.getFullYear() === year && now.getMonth() + 1 === month
      ? now.getDate() - 1 // 0-based
      : -1;

  // Month navigation
  function navigate(delta: number) {
    let y = year, m = month + delta;
    if (m > 12) { y += 1; m = 1; }
    if (m < 1)  { y -= 1; m = 12; }
    router.push(`/admin/calendar?year=${y}&month=${m}`);
  }

  // Status change
  async function handleStatusChange(id: string, status: ReservationStatus) {
    if (updatingId) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setLocalVehicles((prev) =>
          prev.map((v) => ({
            ...v,
            reservations: v.reservations.map((r) => r.id === id ? { ...r, status } : r),
          }))
        );
        addToast({ type: "success", title: "Status atualizado", message: scfg(status).label });
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        addToast({ type: "error", title: "Erro", message: (data as { error?: string }).error ?? "Tente novamente." });
      }
    } catch {
      addToast({ type: "error", title: "Falha de conexão", message: "Verifique sua internet." });
    } finally {
      setUpdatingId(null);
    }
  }

  // Live status for open modal
  const selectedLiveStatus = selectedRes
    ? (localVehicles.flatMap((v) => v.reservations).find((r) => r.id === selectedRes.id)?.status ?? selectedRes.status)
    : "";

  // Total reservations this month
  const totalThisMonth = localVehicles.reduce((s, v) => s + v.reservations.length, 0);

  return (
    <>
      <div className="px-6 py-8">
        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h1 className="text-white font-black text-2xl">Calendário</h1>
            <p className="text-white/35 text-sm mt-1">
              {totalThisMonth} reserva{totalThisMonth !== 1 ? "s" : ""} em {MONTH_NAMES[month - 1]} {year}
            </p>
          </div>

          {/* Month navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              aria-label="Mês anterior"
              className="w-9 h-9 flex items-center justify-center border border-white/10 text-white/40 hover:text-white hover:border-white/25 rounded-lg transition-all active:scale-[0.96]"
            >
              ‹
            </button>
            <div className="px-5 h-9 flex items-center bg-white/[0.04] border border-white/[0.08] rounded-lg text-white font-semibold text-sm min-w-[160px] justify-center">
              {MONTH_NAMES[month - 1]} {year}
            </div>
            <button
              onClick={() => navigate(+1)}
              aria-label="Próximo mês"
              className="w-9 h-9 flex items-center justify-center border border-white/10 text-white/40 hover:text-white hover:border-white/25 rounded-lg transition-all active:scale-[0.96]"
            >
              ›
            </button>
          </div>
        </div>

        {/* ── Legend ── */}
        <div className="flex flex-wrap gap-3 mb-6">
          {(["PENDING","CONFIRMED","FINISHED"] as const).map((s) => {
            const c = scfg(s);
            return (
              <div key={s} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-sm ${c.dot} opacity-80`} aria-hidden />
                <span className="text-white/35 text-[10px] font-medium">{c.label}</span>
              </div>
            );
          })}
          <div className="flex items-center gap-1.5 ml-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 5px rgba(52,211,153,0.7)" }} aria-hidden />
            <span className="text-white/35 text-[10px] font-medium">Locação ativa</span>
          </div>
          {todayIdx >= 0 && (
            <div className="flex items-center gap-1.5 ml-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-400/30 border border-blue-400/40" aria-hidden />
              <span className="text-white/35 text-[10px] font-medium">Hoje</span>
            </div>
          )}
        </div>

        {/* ── Calendar grid ── */}
        <div
          className="rounded-xl overflow-hidden border border-white/[0.08]"
          style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.04)" }}
        >
          <div className="flex">
            {/* ── Fixed left column (vehicle names) ── */}
            <div
              style={{ minWidth: VEHICLE_COL_W, width: VEHICLE_COL_W }}
              className="shrink-0 z-10 bg-[#0a0a0a]"
            >
              {/* Column header */}
              <div
                className="h-14 flex items-end pb-2.5 px-4 border-b border-r border-white/[0.08] bg-[#0a0a0a]"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
              >
                <span className="text-white/20 text-[9px] tracking-[0.2em] uppercase">Veículo</span>
              </div>

              {/* Vehicle name cells */}
              {localVehicles.map((v) => (
                <div
                  key={v.id}
                  className="h-14 flex items-center px-4 border-b border-r border-white/[0.07] bg-[#0a0a0a] last:border-b-0"
                >
                  <div className="min-w-0">
                    <div className="text-white/80 text-xs font-semibold truncate leading-tight">
                      {v.brand} {v.model}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-white/25 text-[10px] truncate">{v.name}</span>
                      {!v.available && (
                        <span className="shrink-0 text-[8px] text-red-400/60 font-bold uppercase tracking-wide">
                          inativo
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Scrollable days area ── */}
            <div className="flex-1 overflow-x-auto">
              {/* Day header */}
              <div
                className="flex border-b bg-[#0a0a0a]"
                style={{
                  minWidth: totalDays * DAY_W,
                  borderBottom: "1px solid rgba(255,255,255,0.07)"
                }}
              >
                {Array.from({ length: totalDays }, (_, i) => {
                  const day   = i + 1;
                  const isToday   = i === todayIdx;
                  const isWknd    = isWeekend(year, month, day);
                  const dow       = getDow(year, month, day);
                  return (
                    <div
                      key={i}
                      style={{ minWidth: DAY_W, width: DAY_W }}
                      className={`h-14 flex flex-col items-center justify-end pb-2 gap-0.5 border-r border-white/[0.04] ${
                        isToday ? "bg-blue-500/10" :
                        isWknd  ? "bg-white/[0.02]" : ""
                      }`}
                    >
                      <span className={`text-[11px] font-bold leading-none ${
                        isToday ? "text-blue-300" : isWknd ? "text-white/40" : "text-white/55"
                      }`}>
                        {day}
                      </span>
                      <span className={`text-[8px] leading-none ${
                        isToday ? "text-blue-400/60" : isWknd ? "text-white/20" : "text-white/18"
                      }`}>
                        {DOW_SHORT[dow]}
                      </span>
                      {isToday && (
                        <span className="w-1 h-1 rounded-full bg-blue-400 mt-0.5" aria-label="hoje" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Vehicle rows */}
              <div style={{ minWidth: totalDays * DAY_W }}>
                {localVehicles.map((v) => (
                  <VehicleRow
                    key={v.id}
                    vehicle={v}
                    totalDays={totalDays}
                    year={year}
                    month={month}
                    todayIdx={todayIdx}
                    onOpen={setSelectedRes}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Empty state ── */}
        {localVehicles.every((v) => v.reservations.length === 0) && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="text-4xl opacity-20" aria-hidden>📅</span>
            <p className="text-white/25 text-sm">
              Nenhuma reserva em {MONTH_NAMES[month - 1]} {year}.
            </p>
          </div>
        )}

        {/* ── Scroll hint on mobile ── */}
        <p className="text-white/15 text-[10px] text-center mt-3 md:hidden">
          ← arraste para ver todos os dias →
        </p>
      </div>

      {/* ── Detail modal ── */}
      <AnimatePresence>
        {selectedRes && (
          <ReservationModal
            key={selectedRes.id}
            reservation={selectedRes}
            liveStatus={selectedLiveStatus}
            updatingId={updatingId}
            onClose={() => setSelectedRes(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>
    </>
  );
}
