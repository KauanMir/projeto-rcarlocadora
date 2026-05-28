"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBadge } from "./StatusBadge";
import { formatPrice, formatDateShort } from "@/utils/format";

type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "FINISHED";

interface Reservation {
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

const STATUS_OPTIONS: ReservationStatus[] = ["PENDING", "CONFIRMED", "FINISHED", "CANCELLED"];
const STATUS_FILTERS = ["TODOS", ...STATUS_OPTIONS];

const STATUS_LABELS: Record<string, string> = {
  TODOS: "Todos",
  PENDING: "Pendente",
  CONFIRMED: "Confirmada",
  FINISHED: "Concluída",
  CANCELLED: "Cancelada",
};

// ─── Detail modal ─────────────────────────────────────────────

function ReservationModal({
  reservation,
  onClose,
  onStatusChange,
}: {
  reservation: Reservation;
  onClose: () => void;
  onStatusChange: (id: string, status: ReservationStatus) => Promise<void>;
}) {
  const [updating, setUpdating] = useState(false);
  const ref = `RCAR-${reservation.id.slice(-6).toUpperCase()}`;

  async function handleStatus(status: ReservationStatus) {
    setUpdating(true);
    await onStatusChange(reservation.id, status);
    setUpdating(false);
    onClose();
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} aria-hidden />
      <motion.div
        className="relative w-full sm:max-w-lg bg-[#0c0c0c] border border-white/[0.08] sm:rounded-2xl overflow-hidden z-10"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 340 }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <div>
            <div className="text-white font-bold">{ref}</div>
            <div className="text-white/35 text-xs mt-0.5">{new Date(reservation.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
          </div>
          <StatusBadge status={reservation.status} />
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white transition-colors ml-3">✕</button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Customer */}
          <section>
            <h3 className="text-white/25 text-[9px] tracking-[0.18em] uppercase mb-2">Cliente</h3>
            <p className="text-white font-medium">{reservation.customerName}</p>
            <a href={`tel:${reservation.customerPhone}`} className="text-white/50 text-sm hover:text-white transition-colors">
              {reservation.customerPhone}
            </a>
          </section>

          {/* Trip */}
          <section>
            <h3 className="text-white/25 text-[9px] tracking-[0.18em] uppercase mb-2">Viagem</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Veículo", value: reservation.vehicleName },
                { label: "Duração", value: `${reservation.rentalDays} dia${reservation.rentalDays !== 1 ? "s" : ""}` },
                { label: "Retirada", value: formatDateShort(reservation.pickupDate.split("T")[0]) },
                { label: "Devolução", value: formatDateShort(reservation.returnDate.split("T")[0]) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-white/30 text-[10px] uppercase tracking-wide">{label}</div>
                  <div className="text-white text-sm mt-0.5">{value}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
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
            <h3 className="text-white/25 text-[9px] tracking-[0.18em] uppercase mb-2">Alterar Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.filter((s) => s !== reservation.status).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatus(s)}
                  disabled={updating}
                  className="h-9 border border-white/10 text-white/50 hover:text-white hover:border-white/25 active:scale-[0.97] rounded-sm text-xs font-medium transition-all disabled:opacity-40"
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────

export function ReservationsClient({ reservations: initial }: { reservations: Reservation[] }) {
  const router = useRouter();
  const [reservations, setReservations] = useState(initial);
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [filter, setFilter] = useState("TODOS");

  const filtered = filter === "TODOS" ? reservations : reservations.filter((r) => r.status === filter);

  async function handleStatusChange(id: string, status: ReservationStatus) {
    const res = await fetch(`/api/admin/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
      router.refresh();
    }
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-sm text-[10px] font-bold tracking-[0.14em] uppercase transition-all ${
              filter === f
                ? "bg-white text-black"
                : "border border-white/10 text-white/35 hover:border-white/25 hover:text-white/70"
            }`}
          >
            {STATUS_LABELS[f]}
            {f !== "TODOS" && (
              <span className="ml-1.5 opacity-60">
                {reservations.filter((r) => r.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <span className="text-4xl opacity-30">📋</span>
          <p className="text-white/25 text-sm">Nenhuma reserva encontrada.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {["Referência", "Cliente", "Veículo", "Período", "Total", "Status"].map((h) => (
                    <th key={h} className="text-left text-white/25 text-[9px] tracking-[0.16em] uppercase font-semibold pb-3 pr-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 pr-4 font-mono text-white/60 text-xs group-hover:text-white/80 transition-colors">
                      RCAR-{r.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 pr-4 text-white/80">{r.customerName}</td>
                    <td className="py-3.5 pr-4 text-white/50">{r.vehicleName}</td>
                    <td className="py-3.5 pr-4 text-white/50 text-xs">
                      {formatDateShort(r.pickupDate.split("T")[0])} → {formatDateShort(r.returnDate.split("T")[0])}
                    </td>
                    <td className="py-3.5 pr-4 text-white font-semibold">{formatPrice(r.totalPrice)}</td>
                    <td className="py-3.5"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3">
            {filtered.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelected(r)}
                className="w-full text-left bg-white/[0.02] border border-white/[0.07] rounded-xl p-4 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="text-white font-medium text-sm">{r.customerName}</div>
                    <div className="text-white/35 text-xs mt-0.5">{r.vehicleName}</div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-white/30 text-xs">
                    {formatDateShort(r.pickupDate.split("T")[0])} → {formatDateShort(r.returnDate.split("T")[0])}
                  </span>
                  <span className="text-white font-bold">{formatPrice(r.totalPrice)}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <ReservationModal
            key={selected.id}
            reservation={selected}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>
    </>
  );
}
