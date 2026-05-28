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

// ─── Status config (single source of truth) ──────────────────

const STATUS_OPTIONS: ReservationStatus[] = ["PENDING", "CONFIRMED", "FINISHED", "CANCELLED"];

const STATUS_CFG: Record<string, { label: string; badge: string; dot: string; text: string }> = {
  PENDING:   { label: "Pendente",   badge: "bg-amber-500/15 text-amber-400 border-amber-500/25",       dot: "bg-amber-400",    text: "text-amber-400"   },
  CONFIRMED: { label: "Confirmada", badge: "bg-blue-500/15 text-blue-400 border-blue-500/25",           dot: "bg-blue-400",     text: "text-blue-400"    },
  FINISHED:  { label: "Concluída",  badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",  dot: "bg-emerald-400",  text: "text-emerald-400" },
  CANCELLED: { label: "Cancelada",  badge: "bg-red-500/15 text-red-400 border-red-500/25",              dot: "bg-red-400",      text: "text-red-400"     },
};
const FALLBACK_CFG = { label: "–", badge: "bg-white/10 text-white/40 border-white/10", dot: "bg-white/30", text: "text-white/40" };

function cfg(status: string) { return STATUS_CFG[status] ?? FALLBACK_CFG; }

// ─── StatusBadge (read-only) ──────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const c = cfg(status);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold tracking-[0.12em] uppercase border ${c.badge}`}>
      {c.label}
    </span>
  );
}

// ─── StatusSelect (interactive dropdown) ─────────────────────

function StatusSelect({
  status,
  loading,
  onChange,
}: {
  status: string;
  loading: boolean;
  onChange: (s: ReservationStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const c = cfg(status);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      {/* Trigger */}
      <button
        disabled={loading}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        aria-label={`Status: ${c.label}. Clique para alterar.`}
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-[10px] font-bold tracking-[0.12em] uppercase select-none transition-all ${c.badge} ${
          loading ? "opacity-50 cursor-wait" : "cursor-pointer hover:opacity-75 active:scale-[0.97]"
        }`}
      >
        {loading ? (
          <span className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin shrink-0" aria-hidden />
        ) : (
          <span aria-hidden className="opacity-50 text-[7px] leading-none">▾</span>
        )}
        {c.label}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            className="absolute left-0 top-full mt-1.5 z-30 w-44 rounded-xl overflow-hidden border border-white/[0.1]"
            style={{ background: "#111113", boxShadow: "0 16px 48px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04)" }}
          >
            {STATUS_OPTIONS.map((s) => {
              const sc = cfg(s);
              const isCurrent = s === status;
              return (
                <button
                  key={s}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isCurrent) onChange(s);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
                    isCurrent ? "opacity-30 cursor-default" : "hover:bg-white/[0.06] cursor-pointer active:bg-white/[0.1]"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sc.dot}`} aria-hidden />
                  <span className={sc.text}>{sc.label}</span>
                  {isCurrent && <span className="ml-auto text-[9px] text-white/25 font-normal">atual</span>}
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
  reservation,
  liveStatus,
  updatingId,
  onClose,
  onStatusChange,
}: {
  reservation: Reservation;
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
        aria-label={`Detalhes da reserva ${ref}`}
        className="relative w-full sm:max-w-lg bg-[#0c0c0c] border border-white/[0.08] sm:rounded-2xl overflow-hidden z-10 max-h-[90dvh] flex flex-col"
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
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4 overflow-y-auto">
          {/* Customer */}
          <section>
            <h3 className="text-white/25 text-[9px] tracking-[0.18em] uppercase mb-2">Cliente</h3>
            <p className="text-white font-medium">{reservation.customerName}</p>
            <a
              href={`tel:${reservation.customerPhone}`}
              className="text-white/50 text-sm hover:text-white transition-colors"
            >
              {reservation.customerPhone}
            </a>
          </section>

          {/* Trip */}
          <section>
            <h3 className="text-white/25 text-[9px] tracking-[0.18em] uppercase mb-2">Viagem</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Veículo",   value: reservation.vehicleName },
                { label: "Duração",   value: `${reservation.rentalDays} dia${reservation.rentalDays !== 1 ? "s" : ""}` },
                { label: "Retirada",  value: formatDateShort(reservation.pickupDate.split("T")[0]) },
                { label: "Devolução", value: formatDateShort(reservation.returnDate.split("T")[0]) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-white/30 text-[10px] uppercase tracking-wide">{label}</div>
                  <div className="text-white text-sm mt-0.5">{value}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Price */}
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

          {/* Status actions */}
          <section>
            <h3 className="text-white/25 text-[9px] tracking-[0.18em] uppercase mb-3">Alterar Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((s) => {
                const sc = cfg(s);
                const isCurrent = s === liveStatus;
                return (
                  <button
                    key={s}
                    onClick={() => onStatusChange(reservation.id, s)}
                    disabled={isUpdating || isCurrent}
                    className={`h-10 flex items-center justify-center gap-2 rounded-lg border text-xs font-semibold transition-all ${
                      isCurrent
                        ? `${sc.badge} opacity-40 cursor-default`
                        : `border-white/10 text-white/50 hover:text-white hover:border-white/25 hover:bg-white/[0.04] active:scale-[0.97] disabled:opacity-30`
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

// ─── Main component ───────────────────────────────────────────

const FILTER_ALL = "TODOS";
const FILTER_OPTIONS = [FILTER_ALL, ...STATUS_OPTIONS];

export function ReservationsClient({ reservations: initial }: { reservations: Reservation[] }) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.add);

  const [reservations, setReservations] = useState(initial);
  const [selected, setSelected]         = useState<Reservation | null>(null);
  const [filter, setFilter]             = useState(FILTER_ALL);
  const [updatingId, setUpdatingId]     = useState<string | null>(null);

  const filtered = filter === FILTER_ALL
    ? reservations
    : reservations.filter((r) => r.status === filter);

  // Reactive status for the open modal (updates if changed inline while modal is open)
  const selectedLiveStatus = selected
    ? (reservations.find((r) => r.id === selected.id)?.status ?? selected.status)
    : "";

  async function handleStatusChange(id: string, status: ReservationStatus) {
    if (updatingId) return; // block concurrent updates
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
      addToast({ type: "error", title: "Falha de conexão", message: "Verifique sua internet e tente novamente." });
    } finally {
      setUpdatingId(null);
    }
  }

  const filterCount = (f: string) =>
    f === FILTER_ALL ? reservations.length : reservations.filter((r) => r.status === f).length;

  return (
    <>
      {/* ── Filter chips ── */}
      <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Filtrar por status">
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[10px] font-bold tracking-[0.14em] uppercase transition-all ${
              filter === f
                ? "bg-white text-black"
                : "border border-white/10 text-white/35 hover:border-white/25 hover:text-white/70"
            }`}
          >
            {f === FILTER_ALL ? "Todos" : cfg(f).label}
            <span className={`text-[9px] ${filter === f ? "opacity-50" : "opacity-40"}`}>
              {filterCount(f)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <span className="text-4xl opacity-30" aria-hidden>📋</span>
          <p className="text-white/25 text-sm">Nenhuma reserva encontrada.</p>
        </div>
      ) : (
        <>
          {/* ── Desktop table ── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {["Referência", "Cliente", "Veículo", "Período", "Total", "Status", ""].map((h) => (
                    <th key={h} className="text-left text-white/25 text-[9px] tracking-[0.16em] uppercase font-semibold pb-3 pr-4 last:pr-0">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-3.5 pr-4 font-mono text-white/50 text-xs">
                      RCAR-{r.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 pr-4 text-white/80">{r.customerName}</td>
                    <td className="py-3.5 pr-4 text-white/50">{r.vehicleName}</td>
                    <td className="py-3.5 pr-4 text-white/50 text-xs whitespace-nowrap">
                      {formatDateShort(r.pickupDate.split("T")[0])} → {formatDateShort(r.returnDate.split("T")[0])}
                    </td>
                    <td className="py-3.5 pr-4 text-white font-semibold whitespace-nowrap">
                      {formatPrice(r.totalPrice)}
                    </td>
                    <td className="py-3.5 pr-4">
                      <StatusSelect
                        status={r.status}
                        loading={updatingId === r.id}
                        onChange={(s) => handleStatusChange(r.id, s)}
                      />
                    </td>
                    <td className="py-3.5">
                      <button
                        onClick={() => setSelected(r)}
                        className="px-3 py-1.5 border border-white/[0.08] text-white/30 hover:text-white hover:border-white/25 rounded-sm text-[10px] font-semibold tracking-wide uppercase transition-all active:scale-[0.97]"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile cards ── */}
          <div className="md:hidden flex flex-col gap-3">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-4 hover:border-white/15 transition-colors"
              >
                {/* Top row: name + details button */}
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div>
                    <div className="text-white font-medium text-sm">{r.customerName}</div>
                    <div className="text-white/35 text-xs mt-0.5">{r.vehicleName}</div>
                  </div>
                  <button
                    onClick={() => setSelected(r)}
                    className="shrink-0 px-2.5 py-1 border border-white/[0.08] text-white/30 hover:text-white hover:border-white/25 rounded-sm text-[10px] font-semibold tracking-wide uppercase transition-all"
                  >
                    Ver
                  </button>
                </div>

                {/* Middle: dates + price */}
                <div className="flex items-center justify-between mt-2.5 mb-3">
                  <span className="text-white/30 text-xs">
                    {formatDateShort(r.pickupDate.split("T")[0])} → {formatDateShort(r.returnDate.split("T")[0])}
                  </span>
                  <span className="text-white font-bold text-sm">{formatPrice(r.totalPrice)}</span>
                </div>

                {/* Bottom: status select */}
                <div className="pt-2.5 border-t border-white/[0.05]">
                  <StatusSelect
                    status={r.status}
                    loading={updatingId === r.id}
                    onChange={(s) => handleStatusChange(r.id, s)}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Detail modal ── */}
      <AnimatePresence>
        {selected && (
          <ReservationModal
            key={selected.id}
            reservation={selected}
            liveStatus={selectedLiveStatus}
            updatingId={updatingId}
            onClose={() => setSelected(null)}
            onStatusChange={async (id, status) => {
              await handleStatusChange(id, status);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
