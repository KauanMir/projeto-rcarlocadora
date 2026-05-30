"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Car } from "lucide-react";
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

const STATUS_CFG: Record<LeadStatus, { label: string; dot: string; text: string }> = {
  NEW:         { label: "Novo",       dot: "#a78bfa", text: "#a78bfa" },
  CONTACTED:   { label: "Contatado",  dot: "#60a5fa", text: "#60a5fa" },
  NEGOTIATING: { label: "Negociando", dot: "#fbbf24", text: "#fbbf24" },
  WON:         { label: "Ganho",      dot: "#34d399", text: "#34d399" },
  LOST:        { label: "Perdido",    dot: "#9a999e", text: "#9a999e" },
};
const STATUS_OPTIONS: LeadStatus[] = ["NEW", "CONTACTED", "NEGOTIATING", "WON", "LOST"];

function scfg(s: string) { return STATUS_CFG[s as LeadStatus] ?? STATUS_CFG.NEW; }

// ─── WhatsApp ─────────────────────────────────────────────────

function openWhatsApp(lead: LeadRow) {
  const digits = lead.phone.replace(/\D/g, "");
  const number = digits.startsWith("55") ? digits : `55${digits}`;
  const vehicle = lead.reservation?.vehicle;
  const vehicleStr = vehicle ? `${vehicle.brand} ${vehicle.model}` : "seu veículo reservado";
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
  lead, onClose, onSave, saving,
}: {
  lead: LeadRow; onClose: () => void; onSave: (notes: string) => Promise<void>; saving: boolean;
}) {
  const [value, setValue] = useState(lead.notes ?? "");

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} aria-hidden />
      <motion.div
        role="dialog" aria-modal aria-label={`Notas — ${lead.name}`}
        style={{ position: "relative", width: "100%", maxWidth: 440, background: "var(--ink-card)", border: "1px solid var(--ink-line)", borderRadius: "var(--r-md)", overflow: "hidden" }}
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 340 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: "1px solid var(--ink-line)" }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{lead.name}</div>
            <div style={{ color: "var(--d-3)", fontSize: 12, marginTop: 2 }}>Notas internas</div>
          </div>
          <button onClick={onClose} aria-label="Fechar" style={{ color: "var(--d-2)", background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: 4 }}>✕</button>
        </div>
        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Adicione observações sobre este lead…"
            rows={4}
            style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid var(--ink-line-2)", borderRadius: "var(--r-sm)", padding: "12px 14px", color: "#fff", fontSize: 13.5, resize: "none", outline: "none", fontFamily: "var(--font-body)", lineHeight: 1.6 }}
          />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ height: 36, padding: "0 16px", border: "1px solid var(--ink-line-2)", borderRadius: "var(--r-sm)", color: "var(--d-2)", fontSize: 13, background: "transparent", cursor: "pointer" }}>
              Cancelar
            </button>
            <button
              onClick={() => onSave(value)}
              disabled={saving}
              style={{ height: 36, padding: "0 16px", border: "none", borderRadius: "var(--r-sm)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, opacity: saving ? 0.5 : 1 }}
            >
              {saving && <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />}
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
  const router   = useRouter();
  const addToast = useToastStore((s) => s.add);

  const [leads,        setLeads]        = useState(initial);
  const [updatingId,   setUpdatingId]   = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<LeadRow | null>(null);
  const [savingNotes,  setSavingNotes]  = useState(false);

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
        setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
        addToast({ type: "success", title: "Status atualizado", message: scfg(status).label });
        router.refresh();
      } else {
        addToast({ type: "error", title: "Erro", message: "Tente novamente." });
      }
    } catch {
      addToast({ type: "error", title: "Falha de conexão" });
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
        setLeads((prev) => prev.map((l) => l.id === editingNotes.id ? { ...l, notes: notes || null } : l));
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
      {/* Header */}
      <div>
        <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, fontFamily: "var(--font-display)" }}>Leads</h1>
        <p style={{ color: "var(--d-2)", fontSize: 14, marginTop: 4 }}>Oportunidades em acompanhamento</p>
      </div>

      {/* Card grid — exact design layout */}
      {leads.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: "var(--d-3)", fontSize: 13.5 }}>
          Nenhum lead ainda. Leads são criados automaticamente ao receber novas reservas.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
          {leads.map((lead) => {
            const sc = scfg(lead.status);
            const isUpdating = updatingId === lead.id;
            const veh = lead.reservation?.vehicle;
            const interest = veh ? `${veh.brand} ${veh.model}` : lead.reservation ? "Veículo reservado" : "—";
            const when = new Date(lead.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

            return (
              <div
                key={lead.id}
                style={{
                  background: "var(--ink-card)",
                  border: "1px solid var(--ink-line)",
                  borderRadius: "var(--r-md)",
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {/* Header row: avatar + name + status badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {/* Initial circle */}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.06)",
                        display: "grid",
                        placeItems: "center",
                        color: "#fff",
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    >
                      {lead.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ color: "#fff", fontSize: 14.5, fontWeight: 700 }}>{lead.name}</div>
                      <div style={{ color: "var(--d-3)", fontSize: 12 }}>{lead.phone}</div>
                    </div>
                  </div>

                  {/* Status badge pill */}
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                    disabled={!!isUpdating}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      color: sc.text,
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: "var(--r-pill)",
                      padding: "4px 10px",
                      border: "none",
                      cursor: "pointer",
                      opacity: isUpdating ? 0.5 : 1,
                      fontFamily: "var(--font-display)",
                      appearance: "none",
                    }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s} className="bg-[#111] text-white normal-case text-xs">
                        {STATUS_CFG[s].label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Interest row */}
                {interest !== "—" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--d-1)", fontSize: 12.5 }}>
                    <Car size={14} style={{ color: "var(--gold)", flexShrink: 0 }} />
                    Interesse:{" "}
                    <strong style={{ color: "var(--d-fg)", fontWeight: 600 }}>{interest}</strong>
                  </div>
                )}

                {/* Note with top border */}
                <p
                  style={{
                    color: "var(--d-2)",
                    fontSize: 13,
                    lineHeight: 1.5,
                    paddingTop: 12,
                    borderTop: "1px solid var(--ink-line)",
                    margin: 0,
                    cursor: "pointer",
                  }}
                  onClick={() => setEditingNotes(lead)}
                  title="Clique para editar notas"
                >
                  {lead.notes || <span style={{ color: "var(--d-4)", fontStyle: "italic" }}>Sem notas. Clique para adicionar.</span>}
                </p>

                {/* Footer: timestamp + WhatsApp */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--d-3)", fontSize: 11.5 }}>{when}</span>
                  <button
                    onClick={() => openWhatsApp(lead)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      color: "var(--wa)",
                      fontSize: 12.5,
                      fontWeight: 700,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "var(--font-display)",
                      transition: "opacity .2s",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.75")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                  >
                    💬 Contatar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
