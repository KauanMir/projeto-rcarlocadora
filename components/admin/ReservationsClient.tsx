"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/toastStore";
import { formatPrice, formatDateShort } from "@/utils/format";

type ReservationStatus = "PENDING" | "CONFIRMED" | "FINISHED" | "CANCELLED";

export interface Reservation {
  id: string;
  vehicleName: string;
  pickupDate: string;
  returnDate: string;
  rentalDays: number;
  insuranceType: string;
  addons: unknown;
  subtotal: number;
  totalPrice: number;
  status: string;
  customerName: string;
  customerPhone: string;
  notes: string | null;
  createdAt: string;
}

// ─── Status config (matches design export STATUS_CFG exactly) ─

const STATUS_OPTIONS: ReservationStatus[] = ["PENDING", "CONFIRMED", "FINISHED", "CANCELLED"];

const STATUS_CFG: Record<string, { label: string; dot: string; text: string; bg: string; badge: string; badgeBorder: string }> = {
  PENDING:   { label: "Pendente",   dot: "#fbbf24", text: "#fbbf24", bg: "rgba(251,191,36,0.12)",  badge: "bg-amber-500/15 text-amber-400 border-amber-500/25",        badgeBorder: "rgba(251,191,36,0.25)"    },
  CONFIRMED: { label: "Confirmada", dot: "#60a5fa", text: "#60a5fa", bg: "rgba(96,165,250,0.12)",  badge: "bg-blue-500/15 text-blue-400 border-blue-500/25",           badgeBorder: "rgba(96,165,250,0.25)"    },
  FINISHED:  { label: "Concluída",  dot: "#34d399", text: "#34d399", bg: "rgba(52,211,153,0.12)",  badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",  badgeBorder: "rgba(52,211,153,0.25)"    },
  CANCELLED: { label: "Cancelada",  dot: "#9a999e", text: "#9a999e", bg: "rgba(154,153,158,0.12)", badge: "bg-white/[0.06] text-white/40 border-white/[0.1]",          badgeBorder: "rgba(154,153,158,0.25)"   },
};
const FALLBACK = STATUS_CFG.PENDING;
function cfg(s: string) { return STATUS_CFG[s] ?? FALLBACK; }

// ─── Status badge (pill, matches design export StatusBadge) ───

function StatusBadge({ status }: { status: string }) {
  const c = cfg(status);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11.5,
        fontWeight: 700,
        color: c.text,
        background: c.bg,
        borderRadius: "var(--r-pill)",
        padding: "4px 11px",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot }} />
      {c.label}
    </span>
  );
}

// ─── StatusSelect (interactive dropdown) ─────────────────────

function StatusSelect({
  status, loading, onChange,
}: {
  status: string; loading: boolean; onChange: (s: ReservationStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const c = cfg(status);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        disabled={loading}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        aria-label={`Status: ${c.label}. Clique para alterar.`}
        aria-expanded={open}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11.5,
          fontWeight: 700,
          color: c.text,
          background: c.bg,
          borderRadius: "var(--r-pill)",
          padding: "4px 11px",
          border: "none",
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.5 : 1,
          whiteSpace: "nowrap",
          transition: "opacity .15s",
        }}
      >
        {loading ? (
          <span className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin shrink-0" aria-hidden />
        ) : (
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot }} />
        )}
        {c.label}
        {!loading && <span style={{ opacity: 0.5, fontSize: 7, marginLeft: 1 }}>▾</span>}
      </button>

      <AnimatePresence>
        {open && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.1 }}
            style={{
              position: "absolute",
              left: 0,
              top: "calc(100% + 6px)",
              zIndex: 30,
              width: 160,
              borderRadius: "var(--r-md)",
              overflow: "hidden",
              border: "1px solid var(--ink-line-2)",
              background: "#111113",
              boxShadow: "0 16px 48px rgba(0,0,0,0.75)",
            }}
          >
            {STATUS_OPTIONS.map((s) => {
              const sc = cfg(s);
              const isCurrent = s === status;
              return (
                <button
                  key={s}
                  onClick={(e) => { e.stopPropagation(); if (!isCurrent) onChange(s); setOpen(false); }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    textAlign: "left",
                    fontSize: 13,
                    fontWeight: 600,
                    color: isCurrent ? "var(--d-3)" : sc.text,
                    background: "transparent",
                    border: "none",
                    cursor: isCurrent ? "default" : "pointer",
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) => { if (!isCurrent) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: sc.dot, flexShrink: 0 }} />
                  {sc.label}
                  {isCurrent && <span style={{ marginLeft: "auto", color: "var(--d-4)", fontSize: 10 }}>atual</span>}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Detail modal ─────────────────────────────────────────────

function ReservationModal({
  reservation, liveStatus, updatingId, onClose, onStatusChange,
}: {
  reservation: Reservation; liveStatus: string; updatingId: string | null;
  onClose: () => void; onStatusChange: (id: string, s: ReservationStatus) => Promise<void>;
}) {
  const ref = `RCAR-${reservation.id.slice(-6).toUpperCase()}`;
  const isUpdating = updatingId === reservation.id;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} aria-hidden />
      <motion.div
        role="dialog" aria-modal="true" aria-label={`Detalhes da reserva ${ref}`}
        className="relative w-full sm:max-w-lg sm:rounded-2xl overflow-hidden z-10 max-h-[90dvh] flex flex-col"
        style={{ background: "var(--ink-card)", border: "1px solid var(--ink-line)" }}
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 340 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid var(--ink-line)" }}>
          <div>
            <div style={{ color: "var(--gold)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>{ref}</div>
            <div style={{ color: "var(--d-3)", fontSize: 12, marginTop: 2 }}>
              {new Date(reservation.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <StatusBadge status={liveStatus} />
            <button onClick={onClose} aria-label="Fechar" style={{ color: "var(--d-2)", background: "none", border: "none", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 4 }}>✕</button>
          </div>
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, overflowY: "auto" }}>
          <div>
            <div style={{ color: "var(--d-3)", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 8, fontFamily: "var(--font-body)" }}>Cliente</div>
            <p style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>{reservation.customerName}</p>
            <a href={`tel:${reservation.customerPhone}`} style={{ color: "var(--d-2)", fontSize: 13, textDecoration: "none" }}>{reservation.customerPhone}</a>
          </div>

          <div>
            <div style={{ color: "var(--d-3)", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 8, fontFamily: "var(--font-body)" }}>Viagem</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "Veículo",   value: reservation.vehicleName },
                { label: "Duração",   value: `${reservation.rentalDays} dia${reservation.rentalDays !== 1 ? "s" : ""}` },
                { label: "Retirada",  value: formatDateShort(reservation.pickupDate.split("T")[0]) },
                { label: "Devolução", value: formatDateShort(reservation.returnDate.split("T")[0]) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ color: "var(--d-3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
                  <div style={{ color: "#fff", fontSize: 13.5, marginTop: 3 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "14px 0", borderTop: "1px solid var(--ink-line)", borderBottom: "1px solid var(--ink-line)" }}>
            <span style={{ color: "var(--d-2)", fontSize: 13 }}>Total</span>
            <span style={{ color: "#fff", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26 }}>{formatPrice(reservation.totalPrice)}</span>
          </div>

          <div>
            <div style={{ color: "var(--d-3)", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 12, fontFamily: "var(--font-body)" }}>Alterar Status</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {STATUS_OPTIONS.map((s) => {
                const sc = cfg(s);
                const isCurrent = s === liveStatus;
                return (
                  <button
                    key={s}
                    onClick={() => onStatusChange(reservation.id, s)}
                    disabled={isUpdating || isCurrent}
                    style={{
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      borderRadius: "var(--r-sm)",
                      border: "1px solid",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: isCurrent ? "default" : "pointer",
                      transition: "all .2s",
                      borderColor: isCurrent ? sc.badgeBorder : "var(--ink-line-2)",
                      background: isCurrent ? sc.bg : "transparent",
                      color: isCurrent ? sc.text : "var(--d-2)",
                      opacity: isUpdating && !isCurrent ? 0.3 : 1,
                    }}
                  >
                    {isUpdating && !isCurrent ? (
                      <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" aria-hidden />
                    ) : (
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: sc.dot }} aria-hidden />
                    )}
                    {sc.label}
                    {isCurrent && <span style={{ fontSize: 9, opacity: 0.6 }}>atual</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────

const TABS = [
  { id: "ALL",       label: "Todas"      },
  { id: "PENDING",   label: "Pendentes"  },
  { id: "CONFIRMED", label: "Confirmadas"},
  { id: "FINISHED",  label: "Concluídas" },
  { id: "CANCELLED", label: "Canceladas" },
] as const;

export function ReservationsClient({
  reservations: initial,
  rentalReservationIds: initialRentalIds = [],
  totalCount,
}: {
  reservations: Reservation[];
  rentalReservationIds?: string[];
  totalCount?: number;
}) {
  const router    = useRouter();
  const addToast  = useToastStore((s) => s.add);

  const [reservations, setReservations] = useState(initial);
  const [selected,     setSelected]     = useState<Reservation | null>(null);
  const [filter,       setFilter]       = useState<string>("ALL");
  const [updatingId,   setUpdatingId]   = useState<string | null>(null);
  const [rentalIds,    setRentalIds]    = useState(() => new Set(initialRentalIds));
  const [startingId,   setStartingId]  = useState<string | null>(null);

  const filtered = filter === "ALL" ? reservations : reservations.filter((r) => r.status === filter);
  const selectedLiveStatus = selected
    ? (reservations.find((r) => r.id === selected.id)?.status ?? selected.status)
    : "";

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
        setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
        addToast({ type: "success", title: "Status atualizado", message: cfg(status).label });
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        addToast({ type: "error", title: "Erro ao atualizar", message: data.error ?? "Tente novamente." });
      }
    } catch {
      addToast({ type: "error", title: "Falha de conexão" });
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleStartRental(reservationId: string) {
    setStartingId(reservationId);
    try {
      const res = await fetch("/api/admin/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId }),
      });
      if (res.ok) {
        setRentalIds((prev) => new Set([...prev, reservationId]));
        addToast({ type: "success", title: "Locação agendada", message: "Acesse Locações para gerenciar." });
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        addToast({ type: "error", title: "Erro", message: data.error ?? "Tente novamente." });
      }
    } catch {
      addToast({ type: "error", title: "Falha de conexão" });
    } finally {
      setStartingId(null);
    }
  }

  return (
    <>
      {/* Header + tabs — exact design layout */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14 }}>
        <div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, fontFamily: "var(--font-display)" }}>Reservas</h1>
          <p style={{ color: "var(--d-2)", fontSize: 14, marginTop: 4 }}>
            {(totalCount ?? reservations.length)} reservas no total
          </p>
        </div>
        {/* Filter tabs aligned RIGHT, design style */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              style={{
                padding: "8px 14px",
                borderRadius: "var(--r-sm)",
                fontSize: 12.5,
                fontWeight: 600,
                transition: "all .2s",
                background: filter === id ? "var(--gold)" : "rgba(255,255,255,0.04)",
                color: filter === id ? "#181203" : "var(--d-1)",
                border: "1px solid",
                borderColor: filter === id ? "transparent" : "var(--ink-line)",
                cursor: "pointer",
                fontFamily: "var(--font-display)",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: "var(--d-3)", fontSize: 13.5 }}>
          Nenhuma reserva encontrada.
        </div>
      ) : (
        <div
          style={{
            background: "var(--ink-card)",
            border: "1px solid var(--ink-line)",
            borderRadius: "var(--r-md)",
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--ink-line)" }}>
                  {["Referência", "Cliente", "Veículo", "Período", "Total", "Status", ""].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "14px 18px",
                        color: "var(--d-3)",
                        fontSize: 10.5,
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    style={{ borderBottom: "1px solid var(--ink-line)", transition: "background .15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Ref — GOLD color, Sora font */}
                    <td
                      style={{
                        padding: "15px 18px",
                        color: "var(--gold)",
                        fontSize: 12.5,
                        fontWeight: 700,
                        fontFamily: "var(--font-display)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      RCAR-{r.id.slice(-6).toUpperCase()}
                    </td>

                    {/* Customer: name + phone */}
                    <td style={{ padding: "15px 18px" }}>
                      <div style={{ color: "var(--d-fg)", fontSize: 13.5, fontWeight: 600 }}>{r.customerName}</div>
                      <div style={{ color: "var(--d-3)", fontSize: 11.5, marginTop: 1 }}>{r.customerPhone}</div>
                    </td>

                    {/* Vehicle */}
                    <td style={{ padding: "15px 18px", color: "var(--d-1)", fontSize: 13 }}>
                      {r.vehicleName}
                    </td>

                    {/* Period: dates + days */}
                    <td style={{ padding: "15px 18px" }}>
                      <div style={{ color: "var(--d-1)", fontSize: 12.5 }}>
                        {formatDateShort(r.pickupDate.split("T")[0])} → {formatDateShort(r.returnDate.split("T")[0])}
                      </div>
                      <div style={{ color: "var(--d-3)", fontSize: 11.5, marginTop: 1 }}>{r.rentalDays} dias</div>
                    </td>

                    {/* Total */}
                    <td style={{ padding: "15px 18px", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)", whiteSpace: "nowrap" }}>
                      {formatPrice(r.totalPrice)}
                    </td>

                    {/* Status badge (pill) */}
                    <td style={{ padding: "15px 18px" }}>
                      <StatusSelect
                        status={r.status}
                        loading={updatingId === r.id}
                        onChange={(s) => handleStatusChange(r.id, s)}
                      />
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "15px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                          onClick={() => setSelected(r)}
                          style={{
                            padding: "5px 12px",
                            border: "1px solid var(--ink-line-2)",
                            borderRadius: "var(--r-sm)",
                            color: "var(--d-2)",
                            fontSize: 11,
                            fontWeight: 600,
                            background: "transparent",
                            cursor: "pointer",
                            transition: "all .2s",
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "var(--d-3)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--d-2)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--ink-line-2)"; }}
                        >
                          Ver
                        </button>
                        {r.status === "CONFIRMED" && !rentalIds.has(r.id) && (
                          <button
                            onClick={() => handleStartRental(r.id)}
                            disabled={startingId === r.id}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "5px 10px",
                              border: "1px solid rgba(52,211,153,0.3)",
                              borderRadius: "var(--r-sm)",
                              color: "#34d399",
                              fontSize: 11,
                              fontWeight: 700,
                              background: "rgba(52,211,153,0.06)",
                              cursor: "pointer",
                              opacity: startingId === r.id ? 0.5 : 1,
                            }}
                          >
                            {startingId === r.id
                              ? <span className="w-2.5 h-2.5 border border-emerald-400/40 border-t-emerald-400 rounded-full animate-spin" />
                              : "▶"}
                            Locação
                          </button>
                        )}
                        {r.status === "CONFIRMED" && rentalIds.has(r.id) && (
                          <span style={{ color: "rgba(52,211,153,0.5)", fontSize: 11, fontWeight: 600 }}>✓ locação</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <ReservationModal
            key={selected.id}
            reservation={selected}
            liveStatus={selectedLiveStatus}
            updatingId={updatingId}
            onClose={() => setSelected(null)}
            onStatusChange={async (id, s) => { await handleStatusChange(id, s); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
