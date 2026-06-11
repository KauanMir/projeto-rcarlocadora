"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Key, Check, Calendar } from "lucide-react";
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

// ─── Calendar event (pickup or return) ───────────────────────

interface CalEvent {
  day: number;
  type: "pickup" | "return";
  customerName: string;
  vehicleName: string;
  status: string;
  reservation: CalendarReservation;
}

// ─── Status config ────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; dot: string; text: string; bg: string; badge: string; badgeBorder: string }> = {
  PENDING:   { label: "Pendente",   dot: "#fbbf24", text: "#fbbf24", bg: "rgba(251,191,36,0.12)",  badge: "bg-amber-500/15 text-amber-400 border-amber-500/25",       badgeBorder: "rgba(251,191,36,0.25)"   },
  CONFIRMED: { label: "Confirmada", dot: "#60a5fa", text: "#60a5fa", bg: "rgba(96,165,250,0.12)",  badge: "bg-blue-500/15 text-blue-400 border-blue-500/25",          badgeBorder: "rgba(96,165,250,0.25)"   },
  FINISHED:  { label: "Concluída",  dot: "#34d399", text: "#34d399", bg: "rgba(52,211,153,0.12)",  badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25", badgeBorder: "rgba(52,211,153,0.25)"   },
  CANCELLED: { label: "Cancelada",  dot: "#9a999e", text: "#9a999e", bg: "rgba(154,153,158,0.12)", badge: "bg-white/[0.06] text-white/40 border-white/[0.1]",         badgeBorder: "rgba(154,153,158,0.25)"  },
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

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function pad2(n: number) { return String(n).padStart(2, "0"); }

// ─── Event builder ────────────────────────────────────────────

function buildEvents(vehicles: CalendarVehicle[], year: number, month: number): CalEvent[] {
  const prefix = `${year}-${pad2(month)}-`;
  const events: CalEvent[] = [];

  for (const v of vehicles) {
    const vehName = `${v.brand} ${v.model}`;
    for (const r of v.reservations) {
      if (r.pickupDate.startsWith(prefix)) {
        events.push({
          day: parseInt(r.pickupDate.slice(8, 10)),
          type: "pickup",
          customerName: r.customerName,
          vehicleName: vehName,
          status: r.status,
          reservation: r,
        });
      }
      if (r.returnDate.startsWith(prefix) && r.returnDate !== r.pickupDate) {
        events.push({
          day: parseInt(r.returnDate.slice(8, 10)),
          type: "return",
          customerName: r.customerName,
          vehicleName: vehName,
          status: r.status,
          reservation: r,
        });
      }
    }
  }

  return events;
}

function evColor(e: CalEvent): string {
  if (e.status === "CANCELLED") return "#9a999e";
  if (e.status === "PENDING")   return "#fbbf24";
  return e.type === "pickup" ? "#60a5fa" : "#34d399";
}

const evLabel = (e: CalEvent) => e.type === "pickup" ? "Retirada" : "Devolução";

// ─── Card base style ──────────────────────────────────────────

const aCard: React.CSSProperties = {
  background: "var(--ink-card)",
  border: "1px solid var(--ink-line)",
  borderRadius: "var(--r-md)",
};

// ─── Status badge (inline) ────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const c = scfg(status);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: c.text, background: c.bg, borderRadius: "var(--r-pill)", padding: "4px 11px" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot }} />
      {c.label}
    </span>
  );
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
            <StatusBadge status={liveStatus} />
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
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} aria-hidden style={{ background: sc.dot }} />
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

// ─── Main CalendarClient ──────────────────────────────────────

export function CalendarClient({ vehicles, year, month }: CalendarClientProps) {
  const router   = useRouter();
  const addToast = useToastStore((s) => s.add);

  const now = new Date();
  const todayDay =
    now.getFullYear() === year && now.getMonth() + 1 === month
      ? now.getDate()
      : -1;

  const [sel,          setSel]          = useState(todayDay > 0 ? todayDay : 1);
  const [selectedRes,  setSelectedRes]  = useState<CalendarReservation | null>(null);
  const [updatingId,   setUpdatingId]   = useState<string | null>(null);
  const [localVehicles, setLocalVehicles] = useState(vehicles);

  const totalDays = getDaysInMonth(year, month);
  const firstDow  = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(); // 0=Sun

  // Build month grid cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  // Build events from vehicle reservations
  const events      = buildEvents(localVehicles, year, month);
  const byDay       = (d: number) => events.filter((e) => e.day === d);
  const selEvents   = byDay(sel);
  const totalThisMonth = events.length;

  // Month navigation
  function navigate(delta: number) {
    let y = year, m = month + delta;
    if (m > 12) { y += 1; m = 1; }
    if (m < 1)  { y -= 1; m = 12; }
    router.push(`/admin/calendar?year=${y}&month=${m}`);
  }

  // Status change (PATCH reservation)
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

  const selectedLiveStatus = selectedRes
    ? (localVehicles.flatMap((v) => v.reservations).find((r) => r.id === selectedRes.id)?.status ?? selectedRes.status)
    : "";

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {/* ── Page header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14 }}>
          <div>
            <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, fontFamily: "var(--font-display)" }}>Calendário</h1>
            <p style={{ color: "var(--d-2)", fontSize: 14, marginTop: 4 }}>
              {totalThisMonth} movimentações em {MONTH_NAMES[month - 1]} · retiradas e devoluções
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {/* Month navigation */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button
                onClick={() => navigate(-1)}
                aria-label="Mês anterior"
                style={{ width: 34, height: 34, borderRadius: "var(--r-sm)", border: "1px solid var(--ink-line)", color: "var(--d-1)", display: "grid", placeItems: "center", background: "transparent", cursor: "pointer" }}
              >
                ‹
              </button>
              <span style={{ color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, minWidth: 110, textAlign: "center" }}>
                {MONTH_NAMES[month - 1]} {year}
              </span>
              <button
                onClick={() => navigate(+1)}
                aria-label="Próximo mês"
                style={{ width: 34, height: 34, borderRadius: "var(--r-sm)", border: "1px solid var(--ink-line)", color: "var(--d-1)", display: "grid", placeItems: "center", background: "transparent", cursor: "pointer" }}
              >
                ›
              </button>
            </div>

            {todayDay > 0 && (
              <button
                onClick={() => setSel(todayDay)}
                style={{ height: 34, padding: "0 14px", borderRadius: "var(--r-sm)", border: "1px solid var(--ink-line)", color: "var(--d-1)", fontSize: 12.5, fontWeight: 700, background: "transparent", cursor: "pointer" }}
              >
                Hoje
              </button>
            )}

            {/* View tabs — "Mês" active by design */}
            <div style={{ display: "flex", gap: 3, background: "rgba(255,255,255,0.04)", border: "1px solid var(--ink-line)", borderRadius: "var(--r-sm)", padding: 3 }}>
              {["Mês", "Agenda"].map((v, i) => (
                <span key={v} style={{ padding: "6px 13px", borderRadius: 6, fontSize: 12.5, fontWeight: 700, background: i === 0 ? "var(--gold)" : "transparent", color: i === 0 ? "#181203" : "var(--d-2)", cursor: "pointer" }}>
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Grid + day panel ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.65fr 1fr", gap: 16, alignItems: "start" }} className="cal-grid">
          {/* Month grid */}
          <div style={{ ...aCard, padding: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
              {/* Day-of-week headers */}
              {DOW_SHORT.map((d) => (
                <div key={d} style={{ textAlign: "center", color: "var(--d-3)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", paddingBottom: 6 }}>
                  {d}
                </div>
              ))}

              {/* Day cells */}
              {cells.map((d, i) => {
                const evs   = d ? byDay(d) : [];
                const isToday = d === todayDay;
                const isSel   = d === sel;

                return (
                  <div
                    key={i}
                    onClick={() => d && setSel(d)}
                    style={{
                      minHeight: 92,
                      borderRadius: "var(--r-sm)",
                      padding: 7,
                      position: "relative",
                      cursor: d ? "pointer" : "default",
                      border: isSel ? "1px solid var(--gold)" : d ? "1px solid var(--ink-line)" : "none",
                      background: isSel ? "rgba(255,184,0,0.06)" : isToday ? "rgba(96,165,250,0.06)" : d ? "rgba(255,255,255,0.012)" : "transparent",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      transition: "border-color .15s",
                    }}
                  >
                    {d && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{
                          fontSize: 12,
                          fontWeight: 700,
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                          color: isToday ? "#181203" : isSel ? "var(--gold)" : "var(--d-1)",
                          background: isToday ? "var(--gold)" : "transparent",
                        }}>
                          {d}
                        </span>
                        {evs.length > 0 && (
                          <span style={{ color: "var(--d-3)", fontSize: 9.5, fontWeight: 700 }}>{evs.length}</span>
                        )}
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {evs.slice(0, 2).map((e, j) => (
                        <div
                          key={j}
                          onClick={(ev) => { ev.stopPropagation(); d && setSel(d); setSelectedRes(e.reservation); }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            background: "rgba(255,255,255,0.04)",
                            borderLeft: `2px solid ${evColor(e)}`,
                            borderRadius: 3,
                            padding: "2px 5px",
                            overflow: "hidden",
                            cursor: "pointer",
                          }}
                        >
                          <span style={{ color: "var(--d-1)", fontSize: 9.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {e.vehicleName.split(" ").slice(-1)[0]}
                          </span>
                        </div>
                      ))}
                      {evs.length > 2 && (
                        <span style={{ color: "var(--d-3)", fontSize: 9.5, fontWeight: 600, paddingLeft: 2 }}>
                          +{evs.length - 2} mais
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 18, marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--ink-line)", flexWrap: "wrap" }}>
              {[
                ["#60a5fa", "Retirada"],
                ["#34d399", "Devolução"],
                ["#fbbf24", "Pendente"],
                ["#9a999e", "Cancelada"],
              ].map(([c, l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: c }} />
                  <span style={{ color: "var(--d-2)", fontSize: 12 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Day detail panel ── */}
          <div style={{ ...aCard, padding: 22, position: "sticky", top: 84 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <div>
                <div style={{ color: "var(--gold)", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
                  {sel === todayDay ? "Hoje" : "Selecionado"}
                </div>
                <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginTop: 6, fontFamily: "var(--font-display)" }}>
                  {sel} de {MONTH_NAMES[month - 1].toLowerCase()}
                </h3>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "#fff" }}>
                  {selEvents.length}
                </div>
                <div style={{ color: "var(--d-3)", fontSize: 11 }}>movimentações</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
              {selEvents.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "32px 0", textAlign: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid var(--ink-line)", display: "grid", placeItems: "center", color: "var(--d-3)" }}>
                    <Calendar size={20} />
                  </div>
                  <p style={{ color: "var(--d-3)", fontSize: 13, lineHeight: 1.5 }}>
                    Nenhuma movimentação<br />neste dia.
                  </p>
                </div>
              ) : (
                selEvents.map((e, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedRes(e.reservation)}
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: 14,
                      borderRadius: "var(--r-sm)",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid var(--ink-line)",
                      cursor: "pointer",
                      transition: "border-color .15s",
                    }}
                    onMouseEnter={(el) => { (el.currentTarget as HTMLElement).style.borderColor = "var(--ink-line-2)"; }}
                    onMouseLeave={(el) => { (el.currentTarget as HTMLElement).style.borderColor = "var(--ink-line)"; }}
                  >
                    <div style={{
                      width: 38,
                      height: 38,
                      borderRadius: "var(--r-sm)",
                      flexShrink: 0,
                      display: "grid",
                      placeItems: "center",
                      background: `${evColor(e)}22`,
                      color: evColor(e),
                    }}>
                      {e.type === "pickup" ? <Key size={18} /> : <Check size={18} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                        <span style={{ color: "#fff", fontSize: 13.5, fontWeight: 700 }}>{e.vehicleName}</span>
                        <span style={{ color: evColor(e), fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                          {evLabel(e)}
                        </span>
                      </div>
                      <div style={{ color: "var(--d-2)", fontSize: 12, marginTop: 3 }}>{e.customerName}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 7 }}>
                        <StatusBadge status={e.status} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {selEvents.length > 0 && (
              <button
                style={{
                  width: "100%",
                  height: 44,
                  marginTop: 16,
                  background: "var(--gold)",
                  color: "#181203",
                  border: "none",
                  borderRadius: "var(--r-sm)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "var(--font-display)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                + Nova movimentação
              </button>
            )}
          </div>
        </div>
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
