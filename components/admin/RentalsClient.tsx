"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/toastStore";
import { formatDateShort } from "@/utils/format";

// ─── Types ────────────────────────────────────────────────────

type RentalStatus = "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface RentalRow {
  id: string;
  customerName: string;
  customerPhone: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleName: string;
  pickupDate: string;
  returnDate: string;
  pickupMileage: number | null;
  returnMileage: number | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

// ─── Status config ────────────────────────────────────────────

const STATUS_CFG: Record<
  RentalStatus,
  { label: string; badge: string; dot: string }
> = {
  SCHEDULED: { label: "Agendada",  badge: "bg-sky-500/15 text-sky-300 border-sky-500/30",           dot: "bg-sky-400"     },
  ACTIVE:    { label: "Ativa",     badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", dot: "bg-emerald-400" },
  COMPLETED: { label: "Concluída", badge: "bg-white/[0.06] text-white/40 border-white/[0.1]",         dot: "bg-white/30"    },
  CANCELLED: { label: "Cancelada", badge: "bg-red-500/10 text-red-400/70 border-red-500/20",          dot: "bg-red-400/50"  },
};

function scfg(s: string) { return STATUS_CFG[s as RentalStatus] ?? STATUS_CFG.SCHEDULED; }

// ─── Activate modal ───────────────────────────────────────────

function ActivateModal({
  rental,
  onClose,
  onConfirm,
  saving,
}: {
  rental: RentalRow;
  onClose: () => void;
  onConfirm: (pickupMileage: number | null) => Promise<void>;
  saving: boolean;
}) {
  const [km, setKm] = useState("");

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} aria-hidden />
      <motion.div
        role="dialog" aria-modal className="relative w-full sm:max-w-sm bg-[#0c0c0c] border border-white/[0.08] sm:rounded-2xl z-10 flex flex-col overflow-hidden"
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 340 }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <div>
            <div className="text-white font-bold">Iniciar locação</div>
            <div className="text-white/30 text-xs mt-0.5">{rental.customerName} · {rental.vehicleBrand} {rental.vehicleModel}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white transition-colors" aria-label="Fechar">✕</button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-white/30 text-[10px] tracking-[0.16em] uppercase block mb-2">
              KM de saída <span className="text-white/15 font-normal normal-case tracking-normal">(opcional)</span>
            </label>
            <input
              type="number"
              min={0}
              value={km}
              onChange={(e) => setKm(e.target.value)}
              placeholder="Ex: 45200"
              className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 text-white/80 text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={onClose} className="h-9 px-5 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/25 text-sm transition-all">
              Cancelar
            </button>
            <button
              onClick={() => onConfirm(km ? parseInt(km) : null)}
              disabled={saving}
              className="h-9 px-5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-sm font-semibold transition-all disabled:opacity-40 flex items-center gap-2"
            >
              {saving && <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />}
              Iniciar locação
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Finalize modal ───────────────────────────────────────────

function FinalizeModal({
  rental,
  onClose,
  onConfirm,
  saving,
}: {
  rental: RentalRow;
  onClose: () => void;
  onConfirm: (returnMileage: number | null, notes: string) => Promise<void>;
  saving: boolean;
}) {
  const [km, setKm] = useState("");
  const [notes, setNotes] = useState(rental.notes ?? "");

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} aria-hidden />
      <motion.div
        role="dialog" aria-modal className="relative w-full sm:max-w-sm bg-[#0c0c0c] border border-white/[0.08] sm:rounded-2xl z-10 flex flex-col overflow-hidden"
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 340 }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <div>
            <div className="text-white font-bold">Finalizar locação</div>
            <div className="text-white/30 text-xs mt-0.5">{rental.customerName} · {rental.vehicleBrand} {rental.vehicleModel}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white transition-colors" aria-label="Fechar">✕</button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {rental.pickupMileage !== null && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-white/30 text-xs">KM de saída</span>
              <span className="text-white/60 text-sm font-semibold">{rental.pickupMileage?.toLocaleString("pt-BR")} km</span>
            </div>
          )}
          <div>
            <label className="text-white/30 text-[10px] tracking-[0.16em] uppercase block mb-2">
              KM de retorno <span className="text-white/15 font-normal normal-case tracking-normal">(opcional)</span>
            </label>
            <input
              type="number"
              min={rental.pickupMileage ?? 0}
              value={km}
              onChange={(e) => setKm(e.target.value)}
              placeholder="Ex: 46500"
              className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 text-white/80 text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <div>
            <label className="text-white/30 text-[10px] tracking-[0.16em] uppercase block mb-2">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Condições do veículo, ocorrências…"
              rows={3}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white/80 text-sm placeholder:text-white/20 resize-none focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button onClick={onClose} className="h-9 px-5 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/25 text-sm transition-all">
              Cancelar
            </button>
            <button
              onClick={() => onConfirm(km ? parseInt(km) : null, notes)}
              disabled={saving}
              className="h-9 px-5 rounded-lg bg-white/10 hover:bg-white/[0.15] text-white text-sm font-semibold transition-all disabled:opacity-40 flex items-center gap-2"
            >
              {saving && <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />}
              Finalizar locação
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Cancel confirm modal ─────────────────────────────────────

function CancelModal({
  rental,
  onClose,
  onConfirm,
  saving,
}: {
  rental: RentalRow;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  saving: boolean;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} aria-hidden />
      <motion.div
        role="dialog" aria-modal className="relative w-full sm:max-w-sm bg-[#0c0c0c] border border-white/[0.08] sm:rounded-2xl z-10 overflow-hidden"
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 340 }}
      >
        <div className="p-6">
          <div className="text-white font-bold mb-1">Cancelar locação?</div>
          <p className="text-white/40 text-sm">
            {rental.customerName} · {rental.vehicleBrand} {rental.vehicleModel}
          </p>
          <div className="flex gap-3 justify-end mt-6">
            <button onClick={onClose} className="h-9 px-5 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/25 text-sm transition-all">
              Voltar
            </button>
            <button
              onClick={onConfirm}
              disabled={saving}
              className="h-9 px-5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-40 flex items-center gap-2"
            >
              {saving && <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />}
              Confirmar cancelamento
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Action button ────────────────────────────────────────────

function ActionBtn({
  label,
  onClick,
  variant = "default",
  disabled,
}: {
  label: string;
  onClick: () => void;
  variant?: "green" | "red" | "default";
  disabled?: boolean;
}) {
  const cls =
    variant === "green"
      ? "border-emerald-500/30 text-emerald-400/80 hover:text-emerald-300 hover:border-emerald-500/50 hover:bg-emerald-500/[0.07]"
      : variant === "red"
      ? "border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/[0.05]"
      : "border-white/[0.08] text-white/35 hover:text-white hover:border-white/25 hover:bg-white/[0.04]";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-7 px-3 rounded-md border text-[10px] font-semibold uppercase tracking-wide transition-all active:scale-[0.97] disabled:opacity-30 ${cls}`}
    >
      {label}
    </button>
  );
}

// ─── Status filter tabs ───────────────────────────────────────

const FILTER_OPTIONS = ["TODOS", "SCHEDULED", "ACTIVE", "COMPLETED", "CANCELLED"] as const;
type Filter = (typeof FILTER_OPTIONS)[number];

// ─── Main component ───────────────────────────────────────────

export function RentalsClient({ rentals: initial }: { rentals: RentalRow[] }) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.add);

  const [rentals, setRentals] = useState(initial);
  const [filter, setFilter] = useState<Filter>("TODOS");
  const [actionId, setActionId] = useState<string | null>(null);
  const [modal, setModal] = useState<{ type: "activate" | "finalize" | "cancel"; rental: RentalRow } | null>(null);

  const filtered =
    filter === "TODOS" ? rentals : rentals.filter((r) => r.status === filter);

  const countFor = (f: Filter) =>
    f === "TODOS" ? rentals.length : rentals.filter((r) => r.status === f).length;

  async function patch(id: string, data: Record<string, unknown>) {
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/rentals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setRentals((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
        router.refresh();
        return true;
      }
      const err = await res.json().catch(() => ({}));
      addToast({ type: "error", title: "Erro", message: (err as { error?: string }).error ?? "Tente novamente." });
      return false;
    } catch {
      addToast({ type: "error", title: "Falha de conexão" });
      return false;
    } finally {
      setActionId(null);
    }
  }

  async function handleActivate(pickupMileage: number | null) {
    if (!modal) return;
    const ok = await patch(modal.rental.id, { status: "ACTIVE", pickupMileage });
    if (ok) {
      addToast({ type: "success", title: "Locação iniciada", message: modal.rental.customerName });
      setModal(null);
    }
  }

  async function handleFinalize(returnMileage: number | null, notes: string) {
    if (!modal) return;
    const ok = await patch(modal.rental.id, {
      status: "COMPLETED",
      returnMileage,
      notes: notes || null,
    });
    if (ok) {
      addToast({ type: "success", title: "Locação concluída", message: modal.rental.customerName });
      setModal(null);
    }
  }

  async function handleCancel() {
    if (!modal) return;
    const ok = await patch(modal.rental.id, { status: "CANCELLED" });
    if (ok) {
      addToast({ type: "success", title: "Locação cancelada" });
      setModal(null);
    }
  }

  return (
    <>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_OPTIONS.map((f) => {
          const isActive = filter === f;
          const c = f !== "TODOS" ? scfg(f) : null;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                isActive
                  ? c ? `${c.badge} border-current` : "bg-white/10 border-white/20 text-white"
                  : "border-white/[0.07] text-white/30 hover:text-white hover:border-white/15"
              }`}
            >
              {c && <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} aria-hidden />}
              {f === "TODOS" ? "Todos" : c!.label}
              <span className={isActive ? "opacity-60" : "text-white/20"}>{countFor(f)}</span>
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-4xl opacity-20" aria-hidden>🚗</span>
          <p className="text-white/25 text-sm">
            {rentals.length === 0
              ? "Nenhuma locação ainda. Inicie uma locação a partir de uma reserva confirmada."
              : "Nenhuma locação para esse filtro."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.08] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-white/[0.07]" style={{ background: "rgba(255,255,255,0.015)" }}>
                  {["Cliente", "Veículo", "Período", "Quilometragem", "Status", "Ações"].map((h) => (
                    <th key={h} className="text-left text-white/20 text-[9px] tracking-[0.18em] uppercase font-semibold px-5 py-3.5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const sc = scfg(r.status);
                  const busy = actionId === r.id;
                  const pickupStr = formatDateShort(r.pickupDate.split("T")[0]);
                  const returnStr = formatDateShort(r.returnDate.split("T")[0]);

                  return (
                    <tr key={r.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.015] transition-colors">
                      {/* Cliente */}
                      <td className="px-5 py-4">
                        <div className="text-white/80 text-xs font-semibold">{r.customerName}</div>
                        <div className="text-white/25 text-[10px] mt-0.5">{r.customerPhone}</div>
                      </td>

                      {/* Veículo */}
                      <td className="px-5 py-4">
                        <div className="text-white/65 text-xs font-medium">{r.vehicleBrand} {r.vehicleModel}</div>
                        <div className="text-white/25 text-[10px] mt-0.5 truncate max-w-[120px]">{r.vehicleName}</div>
                      </td>

                      {/* Período */}
                      <td className="px-5 py-4">
                        <div className="text-white/60 text-xs whitespace-nowrap">
                          {pickupStr} <span className="text-white/20">→</span> {returnStr}
                        </div>
                      </td>

                      {/* Quilometragem */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-xs text-white/40">
                          {r.pickupMileage !== null ? (
                            <span>{r.pickupMileage.toLocaleString("pt-BR")} km</span>
                          ) : (
                            <span className="text-white/15">— km</span>
                          )}
                          {r.returnMileage !== null && (
                            <>
                              <span className="text-white/15">→</span>
                              <span className="text-white/60">{r.returnMileage.toLocaleString("pt-BR")} km</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wide ${sc.badge}`}
                        >
                          {r.status === "ACTIVE" && (
                            <span className="relative flex w-1.5 h-1.5">
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${sc.dot}`} />
                              <span className={`relative inline-flex rounded-full w-1.5 h-1.5 ${sc.dot}`} />
                            </span>
                          )}
                          {sc.label}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {r.status === "SCHEDULED" && (
                            <>
                              <ActionBtn
                                label="Iniciar"
                                variant="green"
                                disabled={busy}
                                onClick={() => setModal({ type: "activate", rental: r })}
                              />
                              <ActionBtn
                                label="Cancelar"
                                variant="red"
                                disabled={busy}
                                onClick={() => setModal({ type: "cancel", rental: r })}
                              />
                            </>
                          )}
                          {r.status === "ACTIVE" && (
                            <>
                              <ActionBtn
                                label="Finalizar"
                                variant="default"
                                disabled={busy}
                                onClick={() => setModal({ type: "finalize", rental: r })}
                              />
                              <ActionBtn
                                label="Cancelar"
                                variant="red"
                                disabled={busy}
                                onClick={() => setModal({ type: "cancel", rental: r })}
                              />
                            </>
                          )}
                          {(r.status === "COMPLETED" || r.status === "CANCELLED") && (
                            <span className="text-white/15 text-xs">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {modal?.type === "activate" && (
          <ActivateModal
            key="activate"
            rental={modal.rental}
            onClose={() => setModal(null)}
            onConfirm={handleActivate}
            saving={actionId !== null}
          />
        )}
        {modal?.type === "finalize" && (
          <FinalizeModal
            key="finalize"
            rental={modal.rental}
            onClose={() => setModal(null)}
            onConfirm={handleFinalize}
            saving={actionId !== null}
          />
        )}
        {modal?.type === "cancel" && (
          <CancelModal
            key="cancel"
            rental={modal.rental}
            onClose={() => setModal(null)}
            onConfirm={handleCancel}
            saving={actionId !== null}
          />
        )}
      </AnimatePresence>
    </>
  );
}
