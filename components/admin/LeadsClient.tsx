"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/toastStore";

// ─── Types ────────────────────────────────────────────────────

type LeadStatus = "NEW" | "CONTACTED" | "NEGOTIATING" | "WON" | "LOST";

interface LeadReservation {
  pickupDate: string;
  returnDate: string;
  totalPrice: number;
  vehicle: { brand: string; model: string } | null;
}

export interface LeadRow {
  id: string;
  name: string;
  phone: string;
  status: string;
  notes: string | null;
  createdAt: string;
  reservation: LeadReservation | null;
}

// ─── Status config ────────────────────────────────────────────

const STATUS_CFG: Record<
  LeadStatus,
  { label: string; badge: string; dot: string; text: string }
> = {
  NEW:         { label: "Novo",        badge: "bg-violet-500/15 text-violet-300 border-violet-500/30", dot: "bg-violet-400",  text: "text-violet-400" },
  CONTACTED:   { label: "Contatado",   badge: "bg-blue-500/15 text-blue-300 border-blue-500/30",       dot: "bg-blue-400",    text: "text-blue-400" },
  NEGOTIATING: { label: "Negociando",  badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",    dot: "bg-amber-400",   text: "text-amber-400" },
  WON:         { label: "Ganho",       badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", dot: "bg-emerald-400", text: "text-emerald-400" },
  LOST:        { label: "Perdido",     badge: "bg-white/[0.06] text-white/35 border-white/[0.1]",      dot: "bg-white/30",    text: "text-white/35" },
};

const STATUS_OPTIONS: LeadStatus[] = ["NEW", "CONTACTED", "NEGOTIATING", "WON", "LOST"];

function scfg(s: string) {
  return STATUS_CFG[s as LeadStatus] ?? STATUS_CFG.NEW;
}

// ─── WhatsApp helper ──────────────────────────────────────────

function openWhatsApp(lead: LeadRow) {
  const digits = lead.phone.replace(/\D/g, "");
  const number = digits.startsWith("55") ? digits : `55${digits}`;
  const vehicle = lead.reservation?.vehicle;
  const vehicleStr = vehicle
    ? `${vehicle.brand} ${vehicle.model}`
    : "seu veículo reservado";
  const pickupStr = lead.reservation?.pickupDate
    ? new Date(lead.reservation.pickupDate + "T12:00:00").toLocaleDateString("pt-BR")
    : null;
  const text = pickupStr
    ? `Olá, ${lead.name}! Aqui é a equipe RCAR Locadora. Vi sua reserva do ${vehicleStr} para ${pickupStr}. Posso confirmar os detalhes e te ajudar?`
    : `Olá, ${lead.name}! Aqui é a equipe RCAR Locadora. Como posso ajudar com sua locação?`;
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, "_blank");
}

// ─── Notes modal ──────────────────────────────────────────────

function NotesModal({
  lead,
  onClose,
  onSave,
  saving,
}: {
  lead: LeadRow;
  onClose: () => void;
  onSave: (notes: string) => Promise<void>;
  saving: boolean;
}) {
  const [value, setValue] = useState(lead.notes ?? "");

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        role="dialog"
        aria-modal
        aria-label={`Notas — ${lead.name}`}
        className="relative w-full sm:max-w-md bg-[#0c0c0c] border border-white/[0.08] sm:rounded-2xl z-10 flex flex-col overflow-hidden"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 340 }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] shrink-0">
          <div>
            <div className="text-white font-bold">{lead.name}</div>
            <div className="text-white/30 text-xs mt-0.5">Notas internas</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Adicione observações sobre este lead…"
            rows={5}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white/80 text-sm placeholder:text-white/20 resize-none focus:outline-none focus:border-white/20 transition-colors"
          />
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="h-9 px-5 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/25 text-sm transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(value)}
              disabled={saving}
              className="h-9 px-5 rounded-lg bg-white/10 hover:bg-white/[0.15] text-white text-sm font-medium transition-all disabled:opacity-40 flex items-center gap-2"
            >
              {saving && (
                <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
              )}
              Salvar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────

export function LeadsClient({ leads: initial }: { leads: LeadRow[] }) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.add);

  const [leads, setLeads] = useState(initial);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "ALL">("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<LeadRow | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const l of leads) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [leads]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return leads.filter((l) => {
      const matchSearch =
        !q ||
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(search);
      const matchStatus = statusFilter === "ALL" || l.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [leads, search, statusFilter]);

  async function handleStatusChange(id: string, status: LeadStatus) {
    if (updatingId) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status } : l))
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

  async function handleNotesSave(notes: string) {
    if (!editingNotes) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/leads/${editingNotes.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notes || null }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) =>
            l.id === editingNotes.id ? { ...l, notes: notes || null } : l
          )
        );
        addToast({ type: "success", title: "Notas salvas" });
        setEditingNotes(null);
        router.refresh();
      } else {
        addToast({ type: "error", title: "Erro ao salvar notas" });
      }
    } catch {
      addToast({ type: "error", title: "Falha de conexão" });
    } finally {
      setSavingNotes(false);
    }
  }

  return (
    <>
      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setStatusFilter("ALL")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            statusFilter === "ALL"
              ? "bg-white/10 border-white/20 text-white"
              : "border-white/[0.07] text-white/30 hover:text-white hover:border-white/20"
          }`}
        >
          Todos
          <span className={statusFilter === "ALL" ? "text-white/50" : "text-white/20"}>
            {leads.length}
          </span>
        </button>

        {STATUS_OPTIONS.map((s) => {
          const c = scfg(s);
          const n = counts[s] ?? 0;
          const active = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(active ? "ALL" : s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                active
                  ? `${c.badge} border-current`
                  : "border-white/[0.07] text-white/30 hover:text-white hover:border-white/15 bg-white/[0.01]"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} aria-hidden />
              {c.label}
              <span className={active ? "opacity-60" : "text-white/20"}>{n}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Buscar por nome ou telefone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 text-white/80 text-sm placeholder:text-white/20 focus:outline-none focus:border-white/[0.15] transition-colors"
        />
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-4xl opacity-20" aria-hidden>🎯</span>
          <p className="text-white/25 text-sm">
            {leads.length === 0
              ? "Nenhum lead ainda. Leads são criados automaticamente ao receber novas reservas."
              : "Nenhum lead encontrado para esse filtro."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.08] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr
                  className="border-b border-white/[0.07]"
                  style={{ background: "rgba(255,255,255,0.015)" }}
                >
                  {["Cliente", "Reserva", "Status", "Notas", "Criado em", ""].map((h) => (
                    <th
                      key={h}
                      className="text-left text-white/20 text-[9px] tracking-[0.18em] uppercase font-semibold px-5 py-3.5"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => {
                  const sc = scfg(lead.status);
                  const isUpdating = updatingId === lead.id;
                  const veh = lead.reservation?.vehicle;
                  const fmtDate = (iso: string) =>
                    new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    });

                  return (
                    <tr
                      key={lead.id}
                      className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.015] transition-colors"
                    >
                      {/* Cliente */}
                      <td className="px-5 py-4">
                        <div className="text-white/80 text-sm font-semibold leading-tight">
                          {lead.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-white/30 text-xs">{lead.phone}</span>
                        </div>
                      </td>

                      {/* Reserva */}
                      <td className="px-5 py-4">
                        {veh ? (
                          <>
                            <div className="text-white/65 text-xs font-medium">
                              {veh.brand} {veh.model}
                            </div>
                            {lead.reservation?.pickupDate && lead.reservation?.returnDate && (
                              <div className="text-white/25 text-[10px] mt-0.5">
                                {fmtDate(lead.reservation.pickupDate)}{" "}
                                <span className="text-white/15">→</span>{" "}
                                {fmtDate(lead.reservation.returnDate)}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-white/15 text-xs">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <div className="relative inline-flex">
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              handleStatusChange(lead.id, e.target.value as LeadStatus)
                            }
                            disabled={!!isUpdating}
                            className={`appearance-none cursor-pointer pl-6 pr-7 py-1 text-[10px] font-bold tracking-wide uppercase rounded-md border transition-all disabled:opacity-50 bg-transparent ${sc.badge}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option
                                key={s}
                                value={s}
                                className="bg-[#111] text-white normal-case text-xs"
                              >
                                {STATUS_CFG[s].label}
                              </option>
                            ))}
                          </select>
                          <span
                            className={`absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full pointer-events-none ${sc.dot}`}
                            aria-hidden
                          />
                          {isUpdating ? (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin pointer-events-none" />
                          ) : (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white/25 text-[8px] pointer-events-none select-none">
                              ▾
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Notas */}
                      <td className="px-5 py-4 max-w-[160px]">
                        <button
                          onClick={() => setEditingNotes(lead)}
                          className="flex items-center gap-1.5 text-xs text-white/25 hover:text-white/60 transition-colors group"
                          title="Editar notas"
                        >
                          <span
                            className="shrink-0 group-hover:scale-110 transition-transform"
                            aria-hidden
                          >
                            📝
                          </span>
                          <span className="truncate max-w-[120px]">
                            {lead.notes ? lead.notes : "Adicionar nota"}
                          </span>
                        </button>
                      </td>

                      {/* Criado em */}
                      <td className="px-5 py-4">
                        <div className="text-white/25 text-xs">
                          {new Date(lead.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>

                      {/* WhatsApp */}
                      <td className="pr-4 py-4">
                        <button
                          onClick={() => openWhatsApp(lead)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.07] text-white/20 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/[0.05] transition-all"
                          title={`Abrir WhatsApp de ${lead.name}`}
                          aria-label={`Abrir WhatsApp de ${lead.name}`}
                        >
                          <span className="text-sm" aria-hidden>💬</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notes modal */}
      <AnimatePresence>
        {editingNotes && (
          <NotesModal
            key={editingNotes.id}
            lead={editingNotes}
            onClose={() => setEditingNotes(null)}
            onSave={handleNotesSave}
            saving={savingNotes}
          />
        )}
      </AnimatePresence>
    </>
  );
}
