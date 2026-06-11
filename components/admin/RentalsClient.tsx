"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Key, Check } from "lucide-react";
import { useToastStore } from "@/store/toastStore";
import { formatDateShort } from "@/utils/format";
import { ChecklistModal, type ChecklistData } from "./ChecklistModal";

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
  checklists: ChecklistData[];
}

// ─── Status config ────────────────────────────────────────────

const STATUS_CFG: Record<RentalStatus, { label: string; badge: string; dot: string }> = {
  SCHEDULED: { label: "Agendada",  badge: "bg-sky-500/15 text-sky-300 border-sky-500/30",              dot: "bg-sky-400"     },
  ACTIVE:    { label: "Ativa",     badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",  dot: "bg-emerald-400" },
  COMPLETED: { label: "Concluída", badge: "bg-white/[0.06] text-white/40 border-white/[0.1]",          dot: "bg-white/30"    },
  CANCELLED: { label: "Cancelada", badge: "bg-red-500/10 text-red-400/70 border-red-500/20",           dot: "bg-red-400/50"  },
};
function scfg(s: string) { return STATUS_CFG[s as RentalStatus] ?? STATUS_CFG.SCHEDULED; }

// ─── Modal helpers ────────────────────────────────────────────

const modalOverlay: React.CSSProperties = {
  position: "fixed", inset: 0, zIndex: 50,
  display: "flex", alignItems: "flex-end",
  justifyContent: "center",
};
const modalBox: React.CSSProperties = {
  position: "relative",
  width: "100%",
  maxWidth: 420,
  background: "var(--ink-card)",
  border: "1px solid var(--ink-line)",
  borderRadius: "var(--r-md)",
  overflow: "hidden",
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 40,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid var(--ink-line-2)",
  borderRadius: "var(--r-sm)",
  padding: "0 14px",
  color: "#fff",
  fontSize: 13.5,
  outline: "none",
  fontFamily: "var(--font-body)",
  colorScheme: "dark",
};

// ─── Activate modal ───────────────────────────────────────────

function ActivateModal({ rental, onClose, onConfirm, saving }: {
  rental: RentalRow; onClose: () => void;
  onConfirm: (pickupMileage: number | null) => Promise<void>; saving: boolean;
}) {
  const [km, setKm] = useState("");
  return (
    <motion.div style={modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sm:items-center sm:p-4">
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} onClick={onClose} aria-hidden />
      <motion.div role="dialog" aria-modal style={modalBox} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ type: "spring", damping: 30, stiffness: 340 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: "1px solid var(--ink-line)" }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Iniciar locação</div>
            <div style={{ color: "var(--d-3)", fontSize: 12, marginTop: 2 }}>{rental.customerName} · {rental.vehicleBrand} {rental.vehicleModel}</div>
          </div>
          <button onClick={onClose} style={{ color: "var(--d-2)", background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: 4 }}>✕</button>
        </div>
        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ color: "var(--d-3)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", display: "block", marginBottom: 8, fontFamily: "var(--font-body)" }}>
              KM de saída <span style={{ color: "var(--d-4)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span>
            </label>
            <input type="number" min={0} value={km} onChange={(e) => setKm(e.target.value)} placeholder="Ex: 45200" style={inputStyle} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ height: 36, padding: "0 16px", border: "1px solid var(--ink-line-2)", borderRadius: "var(--r-sm)", color: "var(--d-2)", fontSize: 13, background: "transparent", cursor: "pointer" }}>Cancelar</button>
            <button onClick={() => onConfirm(km ? parseInt(km) : null)} disabled={saving} style={{ height: 36, padding: "0 16px", border: "none", borderRadius: "var(--r-sm)", background: "#059669", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.5 : 1, display: "flex", alignItems: "center", gap: 8 }}>
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

function FinalizeModal({ rental, onClose, onConfirm, saving }: {
  rental: RentalRow; onClose: () => void;
  onConfirm: (returnMileage: number | null, notes: string) => Promise<void>; saving: boolean;
}) {
  const [km,    setKm]    = useState("");
  const [notes, setNotes] = useState(rental.notes ?? "");
  return (
    <motion.div style={modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sm:items-center sm:p-4">
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} onClick={onClose} aria-hidden />
      <motion.div role="dialog" aria-modal style={modalBox} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ type: "spring", damping: 30, stiffness: 340 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: "1px solid var(--ink-line)" }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Finalizar locação</div>
            <div style={{ color: "var(--d-3)", fontSize: 12, marginTop: 2 }}>{rental.customerName} · {rental.vehicleBrand} {rental.vehicleModel}</div>
          </div>
          <button onClick={onClose} style={{ color: "var(--d-2)", background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: 4 }}>✕</button>
        </div>
        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          {rental.pickupMileage !== null && (
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--ink-line)", borderRadius: "var(--r-sm)", padding: "10px 14px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--d-3)", fontSize: 12 }}>KM de saída</span>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{rental.pickupMileage?.toLocaleString("pt-BR")} km</span>
            </div>
          )}
          <div>
            <label style={{ color: "var(--d-3)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", display: "block", marginBottom: 8, fontFamily: "var(--font-body)" }}>
              KM de retorno <span style={{ color: "var(--d-4)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span>
            </label>
            <input type="number" min={rental.pickupMileage ?? 0} value={km} onChange={(e) => setKm(e.target.value)} placeholder="Ex: 46500" style={inputStyle} />
          </div>
          <div>
            <label style={{ color: "var(--d-3)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", display: "block", marginBottom: 8, fontFamily: "var(--font-body)" }}>Observações</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Condições do veículo, ocorrências…" rows={3} style={{ ...inputStyle, height: "auto", padding: "10px 14px", resize: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ height: 36, padding: "0 16px", border: "1px solid var(--ink-line-2)", borderRadius: "var(--r-sm)", color: "var(--d-2)", fontSize: 13, background: "transparent", cursor: "pointer" }}>Cancelar</button>
            <button onClick={() => onConfirm(km ? parseInt(km) : null, notes)} disabled={saving} style={{ height: 36, padding: "0 16px", border: "none", borderRadius: "var(--r-sm)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.5 : 1, display: "flex", alignItems: "center", gap: 8 }}>
              {saving && <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />}
              Finalizar locação
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Cancel modal ─────────────────────────────────────────────

function CancelModal({ rental, onClose, onConfirm, saving }: {
  rental: RentalRow; onClose: () => void; onConfirm: () => Promise<void>; saving: boolean;
}) {
  return (
    <motion.div style={modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sm:items-center sm:p-4">
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} onClick={onClose} aria-hidden />
      <motion.div role="dialog" aria-modal style={modalBox} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ type: "spring", damping: 30, stiffness: 340 }}>
        <div style={{ padding: "22px 22px" }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Cancelar locação?</div>
          <p style={{ color: "var(--d-2)", fontSize: 13 }}>{rental.customerName} · {rental.vehicleBrand} {rental.vehicleModel}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
            <button onClick={onClose} style={{ height: 36, padding: "0 16px", border: "1px solid var(--ink-line-2)", borderRadius: "var(--r-sm)", color: "var(--d-2)", fontSize: 13, background: "transparent", cursor: "pointer" }}>Voltar</button>
            <button onClick={onConfirm} disabled={saving} style={{ height: 36, padding: "0 16px", border: "none", borderRadius: "var(--r-sm)", background: "#dc2626", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: saving ? 0.5 : 1, display: "flex", alignItems: "center", gap: 8 }}>
              {saving && <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />}
              Confirmar cancelamento
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Filter ───────────────────────────────────────────────────

const FILTER_OPTIONS = ["TODOS", "SCHEDULED", "ACTIVE", "COMPLETED", "CANCELLED"] as const;
type Filter = (typeof FILTER_OPTIONS)[number];

// ─── Main component ───────────────────────────────────────────

export function RentalsClient({ rentals: initial }: { rentals: RentalRow[] }) {
  const router   = useRouter();
  const addToast = useToastStore((s) => s.add);

  const [rentals,         setRentals]         = useState(initial);
  const [filter,          setFilter]          = useState<Filter>("TODOS");
  const [actionId,        setActionId]        = useState<string | null>(null);
  const [modal,           setModal]           = useState<{ type: "activate" | "finalize" | "cancel"; rental: RentalRow } | null>(null);
  const [checklistRental, setChecklistRental] = useState<RentalRow | null>(null);

  const filtered = filter === "TODOS" ? rentals : rentals.filter((r) => r.status === filter);
  const countFor = (f: Filter) => f === "TODOS" ? rentals.length : rentals.filter((r) => r.status === f).length;

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
        setRentals((prev) => prev.map((r) => r.id === id ? { ...r, ...updated } : r));
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

  function handleChecklistCreated(rentalId: string, checklist: ChecklistData) {
    setRentals((prev) => prev.map((r) => r.id === rentalId ? { ...r, checklists: [...r.checklists.filter((c) => c.type !== checklist.type), checklist] } : r));
    setChecklistRental((prev) => prev?.id === rentalId ? { ...prev, checklists: [...prev.checklists.filter((c) => c.type !== checklist.type), checklist] } : prev);
  }

  async function handleActivate(pickupMileage: number | null) {
    if (!modal) return;
    const ok = await patch(modal.rental.id, { status: "ACTIVE", pickupMileage });
    if (ok) { addToast({ type: "success", title: "Locação iniciada", message: modal.rental.customerName }); setModal(null); }
  }

  async function handleFinalize(returnMileage: number | null, notes: string) {
    if (!modal) return;
    const ok = await patch(modal.rental.id, { status: "COMPLETED", returnMileage, notes: notes || null });
    if (ok) { addToast({ type: "success", title: "Locação concluída", message: modal.rental.customerName }); setModal(null); }
  }

  async function handleCancel() {
    if (!modal) return;
    const ok = await patch(modal.rental.id, { status: "CANCELLED" });
    if (ok) { addToast({ type: "success", title: "Locação cancelada" }); setModal(null); }
  }

  return (
    <>
      {/* Filter tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {FILTER_OPTIONS.map((f) => {
          const isActive = filter === f;
          const c = f !== "TODOS" ? scfg(f) : null;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 14px",
                borderRadius: "var(--r-sm)",
                fontSize: 12.5,
                fontWeight: 600,
                transition: "all .2s",
                background: isActive ? "var(--gold)" : "rgba(255,255,255,0.04)",
                color: isActive ? "#181203" : "var(--d-1)",
                border: "1px solid",
                borderColor: isActive ? "transparent" : "var(--ink-line)",
                cursor: "pointer",
                fontFamily: "var(--font-display)",
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              {c && !isActive && <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} aria-hidden />}
              {f === "TODOS" ? "Todos" : c!.label}
              <span style={{ opacity: 0.6, fontSize: 11 }}>{countFor(f)}</span>
            </button>
          );
        })}
      </div>

      {/* Card list — exact design: vertical stack, padding 18 */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: "var(--d-3)", fontSize: 13.5 }}>
          {rentals.length === 0
            ? "Nenhuma locação ainda. Inicie uma locação a partir de uma reserva confirmada."
            : "Nenhuma locação para esse filtro."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((r) => {
            const sc  = scfg(r.status);
            const busy = actionId === r.id;
            const returnDate = new Date(r.returnDate);
            const daysLeft = Math.ceil((returnDate.getTime() - Date.now()) / 86400000);
            const returnSoon = r.status === "ACTIVE" && daysLeft <= 1;
            const hasChecklist = r.checklists.length > 0;

            return (
              <div
                key={r.id}
                style={{
                  background: "var(--ink-card)",
                  border: "1px solid var(--ink-line)",
                  borderRadius: "var(--r-md)",
                  padding: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  flexWrap: "wrap",
                  transition: "border-color .2s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--ink-line-2)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--ink-line)")}
              >
                {/* Key icon — gold tint square, exact design */}
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: "var(--r-sm)",
                    background: "var(--gold-tint)",
                    color: "var(--gold)",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    border: "1px solid rgba(255,184,0,0.2)",
                  }}
                >
                  <Key size={22} />
                </div>

                {/* Customer + vehicle info */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>{r.customerName}</div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${sc.badge}`}>
                      {r.status === "ACTIVE" && (
                        <span className="relative flex w-1.5 h-1.5">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${sc.dot}`} />
                          <span className={`relative inline-flex rounded-full w-1.5 h-1.5 ${sc.dot}`} />
                        </span>
                      )}
                      {sc.label}
                    </span>
                  </div>
                  <div style={{ color: "var(--d-3)", fontSize: 12.5, marginTop: 3 }}>
                    {r.vehicleBrand} {r.vehicleModel} · RCAR-{r.id.slice(-6).toUpperCase()}
                  </div>
                </div>

                {/* Return date — exact design: eyebrow + date */}
                <div style={{ minWidth: 140 }}>
                  <div
                    style={{
                      color: returnSoon ? "#f87171" : "var(--d-3)",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Devolução prevista
                  </div>
                  <div
                    style={{
                      color: returnSoon ? "#f87171" : "var(--d-1)",
                      fontSize: 13.5,
                      fontWeight: 600,
                      marginTop: 4,
                    }}
                  >
                    {new Date(r.returnDate + "").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                    {returnSoon && (
                      <div style={{ fontSize: 11, fontWeight: 700, marginTop: 2, color: "#f87171" }}>
                        {daysLeft <= 0 ? "Hoje!" : "Amanhã"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions — exact design */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {/* Checklist status */}
                  {r.status !== "CANCELLED" && (
                    <button
                      onClick={() => setChecklistRental(r)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 11.5,
                        fontWeight: 700,
                        borderRadius: "var(--r-pill)",
                        padding: "5px 12px",
                        border: "none",
                        cursor: "pointer",
                        transition: "opacity .2s",
                        ...(hasChecklist
                          ? { color: "#34d399", background: "rgba(52,211,153,0.12)" }
                          : { color: "var(--d-2)", background: "rgba(255,255,255,0.05)" }),
                      }}
                      title="Checklist de entrega/devolução"
                    >
                      <Check size={12} />
                      {hasChecklist ? `Checklist ${r.checklists.length}/2` : "Checklist"}
                    </button>
                  )}

                  {/* Status action buttons */}
                  {r.status === "SCHEDULED" && (
                    <>
                      <button
                        onClick={() => setModal({ type: "activate", rental: r })}
                        disabled={busy}
                        style={{ height: 36, padding: "0 16px", border: "1px solid var(--ink-line)", color: "var(--d-1)", borderRadius: "var(--r-sm)", fontSize: 12.5, fontWeight: 600, background: "transparent", cursor: "pointer", transition: "all .2s" }}
                      >
                        Iniciar
                      </button>
                      <button
                        onClick={() => setModal({ type: "cancel", rental: r })}
                        disabled={busy}
                        style={{ height: 36, padding: "0 16px", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171", borderRadius: "var(--r-sm)", fontSize: 12.5, fontWeight: 600, background: "rgba(248,113,113,0.06)", cursor: "pointer" }}
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                  {r.status === "ACTIVE" && (
                    <>
                      <button
                        onClick={() => setModal({ type: "finalize", rental: r })}
                        disabled={busy}
                        style={{ height: 36, padding: "0 16px", border: "1px solid var(--ink-line)", color: "var(--d-1)", borderRadius: "var(--r-sm)", fontSize: 12.5, fontWeight: 600, background: "transparent", cursor: "pointer" }}
                      >
                        Finalizar
                      </button>
                      <button
                        onClick={() => setModal({ type: "cancel", rental: r })}
                        disabled={busy}
                        style={{ height: 36, padding: "0 16px", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171", borderRadius: "var(--r-sm)", fontSize: 12.5, fontWeight: 600, background: "rgba(248,113,113,0.06)", cursor: "pointer" }}
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Checklist modal */}
      <AnimatePresence>
        {checklistRental && (
          <ChecklistModal
            key={checklistRental.id}
            rental={checklistRental}
            onClose={() => setChecklistRental(null)}
            onCreated={handleChecklistCreated}
          />
        )}
      </AnimatePresence>

      {/* Action modals */}
      <AnimatePresence>
        {modal?.type === "activate" && (
          <ActivateModal key="activate" rental={modal.rental} onClose={() => setModal(null)} onConfirm={handleActivate} saving={actionId !== null} />
        )}
        {modal?.type === "finalize" && (
          <FinalizeModal key="finalize" rental={modal.rental} onClose={() => setModal(null)} onConfirm={handleFinalize} saving={actionId !== null} />
        )}
        {modal?.type === "cancel" && (
          <CancelModal key="cancel" rental={modal.rental} onClose={() => setModal(null)} onConfirm={handleCancel} saving={actionId !== null} />
        )}
      </AnimatePresence>
    </>
  );
}
