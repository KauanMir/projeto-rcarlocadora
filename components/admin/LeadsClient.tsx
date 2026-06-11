"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Car, Plus, Pencil, Trash2 } from "lucide-react";
import { useToastStore } from "@/store/toastStore";

// ─── Types ────────────────────────────────────────────────────

type LeadStatus = "NEW" | "CONTACTED" | "NEGOTIATING" | "AWAITING" | "WON" | "CAR_RENTED" | "LOST";

interface LeadReservation {
  pickupDate: string;
  returnDate: string;
  totalPrice: number;
  vehicle: { brand: string; model: string } | null;
}

export interface LeadRow {
  id:              string;
  name:            string;
  phone:           string;
  vehicleInterest: string | null;
  status:          string;
  notes:           string | null;
  createdAt:       string;
  reservation:     LeadReservation | null;
}

// ─── Status config ────────────────────────────────────────────

const STATUS_CFG: Record<LeadStatus, { label: string; dot: string; text: string }> = {
  NEW:         { label: "Novo",               dot: "#a78bfa", text: "#a78bfa" },
  CONTACTED:   { label: "Em contato",         dot: "#60a5fa", text: "#60a5fa" },
  NEGOTIATING: { label: "Negociando",         dot: "#fbbf24", text: "#fbbf24" },
  AWAITING:    { label: "Ag. retorno",        dot: "#fb923c", text: "#fb923c" },
  WON:         { label: "Convertido",         dot: "#34d399", text: "#34d399" },
  CAR_RENTED:  { label: "Carro alugado",      dot: "#22d3ee", text: "#22d3ee" },
  LOST:        { label: "Perdido",            dot: "#9a999e", text: "#9a999e" },
};
const STATUS_OPTIONS: LeadStatus[] = ["NEW", "CONTACTED", "NEGOTIATING", "AWAITING", "WON", "CAR_RENTED", "LOST"];

function scfg(s: string) { return STATUS_CFG[s as LeadStatus] ?? STATUS_CFG.NEW; }

// ─── Form primitives ──────────────────────────────────────────

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: string }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{ color: "var(--d-3)", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}
    >
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid var(--ink-line-2)",
  borderRadius: "var(--r-sm)",
  color: "#fff",
  fontSize: 14,
  padding: "10px 13px",
  outline: "none",
  fontFamily: "var(--font-body)",
  colorScheme: "dark",
  transition: "border-color .2s",
};

function SectionHeading({ children }: { children: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <span style={{ color: "var(--d-3)", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: "var(--ink-line)" }} />
    </div>
  );
}

// ─── Lead form data ───────────────────────────────────────────

type LeadFormData = {
  name:            string;
  phone:           string;
  vehicleInterest: string;
  notes:           string;
  status:          LeadStatus;
};

const EMPTY_FORM: LeadFormData = {
  name: "", phone: "", vehicleInterest: "", notes: "", status: "NEW",
};

// ─── Lead Modal (create + edit) ───────────────────────────────

function LeadModal({
  title,
  subtitle,
  initial,
  saving,
  fieldError,
  onClose,
  onSave,
}: {
  title:      string;
  subtitle:   string;
  initial:    LeadFormData;
  saving:     boolean;
  fieldError: string;
  onClose:    () => void;
  onSave:     (data: LeadFormData) => void;
}) {
  const [form, setForm] = useState<LeadFormData>(initial);
  function set(key: keyof LeadFormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} aria-hidden />
      <motion.div
        role="dialog" aria-modal="true" aria-label={title}
        style={{ position: "relative", width: "100%", maxWidth: 480, background: "var(--ink-card)", border: "1px solid var(--ink-line)", borderRadius: "var(--r-md)", display: "flex", flexDirection: "column", maxHeight: "92dvh" }}
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 340 }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid var(--ink-line)", flexShrink: 0 }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{title}</div>
            <div style={{ color: "var(--d-3)", fontSize: 12, marginTop: 2 }}>{subtitle}</div>
          </div>
          <button onClick={onClose} aria-label="Fechar" style={{ color: "var(--d-2)", background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: 4 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 22 }}>
          <section>
            <SectionHeading>Identificação</SectionHeading>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <FieldLabel htmlFor="l-name">Nome</FieldLabel>
                <input
                  id="l-name"
                  type="text"
                  placeholder="Nome completo"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <FieldLabel htmlFor="l-phone">Telefone / WhatsApp</FieldLabel>
                <input
                  id="l-phone"
                  type="tel"
                  placeholder="(61) 9 9999-9999"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </section>

          <section>
            <SectionHeading>Interesse</SectionHeading>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <FieldLabel htmlFor="l-vehicle">Veículo de interesse</FieldLabel>
              <input
                id="l-vehicle"
                type="text"
                placeholder="Ex: Hilux, SUV automático, Econômico…"
                value={form.vehicleInterest}
                onChange={(e) => set("vehicleInterest", e.target.value)}
                style={inputStyle}
              />
            </div>
          </section>

          <section>
            <SectionHeading>Status</SectionHeading>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <FieldLabel htmlFor="l-status">Status do lead</FieldLabel>
              <select
                id="l-status"
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                style={{ ...inputStyle, cursor: "pointer", appearance: "none" }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} className="bg-[#111]">{scfg(s).label}</option>
                ))}
              </select>
            </div>
          </section>

          <section>
            <SectionHeading>Observações</SectionHeading>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <FieldLabel htmlFor="l-notes">Observação interna</FieldLabel>
              <textarea
                id="l-notes"
                placeholder="Contexto do atendimento, preferências, data desejada…"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={4}
                style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }}
              />
            </div>
          </section>

          {fieldError && <p role="alert" style={{ color: "#f87171", fontSize: 12.5 }}>{fieldError}</p>}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: 10, padding: "14px 24px", borderTop: "1px solid var(--ink-line)", flexShrink: 0 }}>
          <button onClick={onClose} disabled={saving} style={{ flex: 1, height: 42, border: "1px solid var(--ink-line-2)", color: "var(--d-2)", borderRadius: "var(--r-sm)", fontSize: 13.5, background: "transparent", cursor: "pointer" }}>
            Cancelar
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving}
            style={{ flex: 1, height: 42, background: "var(--gold)", color: "#181203", border: "none", borderRadius: "var(--r-sm)", fontSize: 13.5, fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: saving ? 0.6 : 1 }}
          >
            {saving
              ? <><span className="w-3.5 h-3.5 border-2 border-black/25 border-t-black rounded-full animate-spin" />Salvando...</>
              : "Salvar"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Delete confirmation modal ────────────────────────────────

function DeleteModal({
  lead,
  deleting,
  onClose,
  onConfirm,
}: {
  lead:      LeadRow;
  deleting:  boolean;
  onClose:   () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} aria-hidden />
      <motion.div
        role="dialog" aria-modal="true"
        style={{ position: "relative", width: "100%", maxWidth: 380, background: "var(--ink-card)", border: "1px solid var(--ink-line)", borderRadius: "var(--r-md)", padding: 24 }}
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
      >
        <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Excluir lead?</p>
        <p style={{ color: "var(--d-2)", fontSize: 13.5, lineHeight: 1.5 }}>
          O lead <strong style={{ color: "var(--gold)" }}>{lead.name}</strong> será removido permanentemente.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} disabled={deleting} style={{ flex: 1, height: 40, border: "1px solid var(--ink-line-2)", color: "var(--d-2)", borderRadius: "var(--r-sm)", fontSize: 13.5, background: "transparent", cursor: "pointer" }}>
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            style={{ flex: 1, height: 40, background: "#ef4444", color: "#fff", border: "none", borderRadius: "var(--r-sm)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: deleting ? 0.6 : 1 }}
          >
            {deleting
              ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Excluindo...</>
              : "Excluir"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
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

// ─── Status pill dropdown ─────────────────────────────────────

function LeadStatusPill({
  status, loading, onChange,
}: {
  status: string; loading: boolean; onChange: (s: LeadStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const sc = scfg(status);

  return (
    <div style={{ position: "relative" }}>
      <button
        disabled={loading}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 11, fontWeight: 700, color: sc.text,
          background: "rgba(255,255,255,0.04)", borderRadius: "var(--r-pill)",
          padding: "4px 10px", border: "none",
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.5 : 1,
          fontFamily: "var(--font-display)", transition: "opacity .15s",
        }}
      >
        {loading
          ? <span className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin shrink-0" />
          : <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot, flexShrink: 0 }} />}
        {sc.label}
        {!loading && <span style={{ opacity: 0.4, fontSize: 7, marginLeft: 1 }}>▾</span>}
      </button>

      <AnimatePresence>
        {open && !loading && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 20 }} onClick={() => setOpen(false)} aria-hidden />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              transition={{ duration: 0.1 }}
              style={{
                position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 30,
                width: 160, borderRadius: "var(--r-md)", overflow: "hidden",
                border: "1px solid var(--ink-line-2)", background: "#111113",
                boxShadow: "0 16px 48px rgba(0,0,0,0.75)",
              }}
            >
              {STATUS_OPTIONS.map((s) => {
                const sc2 = scfg(s);
                const isCurrent = s === status;
                return (
                  <button
                    key={s}
                    onClick={(e) => { e.stopPropagation(); if (!isCurrent) onChange(s); setOpen(false); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 14px", textAlign: "left", fontSize: 13, fontWeight: 600,
                      color: isCurrent ? "var(--d-3)" : sc2.text,
                      background: "transparent", border: "none",
                      cursor: isCurrent ? "default" : "pointer", transition: "background .15s",
                    }}
                    onMouseEnter={(e) => { if (!isCurrent) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: sc2.dot, flexShrink: 0 }} />
                    {sc2.label}
                    {isCurrent && <span style={{ marginLeft: "auto", color: "var(--d-4)", fontSize: 10 }}>atual</span>}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── WhatsApp ─────────────────────────────────────────────────

function openWhatsApp(lead: LeadRow) {
  const digits = lead.phone.replace(/\D/g, "");
  const number = digits.startsWith("55") ? digits : `55${digits}`;
  const vehicle = lead.reservation?.vehicle;
  const vehicleStr = vehicle
    ? `${vehicle.brand} ${vehicle.model}`
    : lead.vehicleInterest || "seu veículo";
  const pickupStr = lead.reservation?.pickupDate
    ? new Date(lead.reservation.pickupDate + "T12:00:00").toLocaleDateString("pt-BR")
    : null;
  const text = pickupStr
    ? `Olá, ${lead.name}! Aqui é a equipe RCAR Locadora. Vi sua reserva do ${vehicleStr} para ${pickupStr}. Posso confirmar os detalhes e te ajudar?`
    : `Olá, ${lead.name}! Aqui é a equipe RCAR Locadora. Como posso ajudar com sua locação?`;
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, "_blank");
}

// ─── Main component ───────────────────────────────────────────

export function LeadsClient({ leads: initial }: { leads: LeadRow[] }) {
  const router   = useRouter();
  const addToast = useToastStore((s) => s.add);

  const [leads,        setLeads]        = useState(initial);
  const [updatingId,   setUpdatingId]   = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<LeadRow | null>(null);
  const [savingNotes,  setSavingNotes]  = useState(false);
  const [creating,     setCreating]     = useState(false);
  const [savingNew,    setSavingNew]    = useState(false);
  const [editing,      setEditing]      = useState<LeadRow | null>(null);
  const [savingEdit,   setSavingEdit]   = useState(false);
  const [deleting,     setDeleting]     = useState<LeadRow | null>(null);
  const [deletingId,   setDeletingId]   = useState<string | null>(null);
  const [fieldError,   setFieldError]   = useState("");

  // ── Status change (pill) ────────────────────────────────────
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

  // ── Notes save ──────────────────────────────────────────────
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

  // ── Validate form ───────────────────────────────────────────
  function validateForm(data: LeadFormData): string {
    if (data.name.trim().length < 2)   return "Nome deve ter ao menos 2 caracteres.";
    if (data.phone.trim().length < 8)  return "Telefone deve ter ao menos 8 dígitos.";
    return "";
  }

  // ── Create lead ─────────────────────────────────────────────
  async function handleCreate(data: LeadFormData) {
    const err = validateForm(data);
    if (err) { setFieldError(err); return; }
    setFieldError("");
    setSavingNew(true);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:            data.name.trim(),
          phone:           data.phone.trim(),
          vehicleInterest: data.vehicleInterest.trim() || null,
          notes:           data.notes.trim() || null,
          status:          data.status,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        const newLead: LeadRow = {
          id:              created.id,
          name:            created.name,
          phone:           created.phone,
          vehicleInterest: created.vehicleInterest ?? null,
          status:          created.status,
          notes:           created.notes ?? null,
          createdAt:       created.createdAt,
          reservation:     null,
        };
        setLeads((prev) => [newLead, ...prev]);
        setCreating(false);
        addToast({ type: "success", title: "Lead criado", message: created.name });
        router.refresh();
      } else {
        const e = await res.json().catch(() => ({}));
        setFieldError((e as { error?: string }).error ?? "Erro ao criar lead.");
      }
    } catch {
      setFieldError("Falha de conexão. Tente novamente.");
    } finally {
      setSavingNew(false);
    }
  }

  // ── Edit lead ───────────────────────────────────────────────
  async function handleEdit(data: LeadFormData) {
    if (!editing) return;
    const err = validateForm(data);
    if (err) { setFieldError(err); return; }
    setFieldError("");
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/leads/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:            data.name.trim(),
          phone:           data.phone.trim(),
          vehicleInterest: data.vehicleInterest.trim() || null,
          notes:           data.notes.trim() || null,
          status:          data.status,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setLeads((prev) => prev.map((l) =>
          l.id === editing.id
            ? { ...l, name: updated.name ?? l.name, phone: updated.phone ?? l.phone, vehicleInterest: updated.vehicleInterest ?? null, notes: updated.notes ?? null, status: updated.status ?? l.status }
            : l
        ));
        setEditing(null);
        addToast({ type: "success", title: "Lead atualizado", message: data.name });
        router.refresh();
      } else {
        const e = await res.json().catch(() => ({}));
        setFieldError((e as { error?: string }).error ?? "Erro ao atualizar.");
      }
    } catch {
      setFieldError("Falha de conexão. Tente novamente.");
    } finally {
      setSavingEdit(false);
    }
  }

  // ── Delete lead ─────────────────────────────────────────────
  async function handleDelete() {
    if (!deleting) return;
    setDeletingId(deleting.id);
    try {
      const res = await fetch(`/api/admin/leads/${deleting.id}`, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        setLeads((prev) => prev.filter((l) => l.id !== deleting.id));
        addToast({ type: "success", title: "Lead excluído", message: deleting.name });
        setDeleting(null);
        router.refresh();
      } else {
        addToast({ type: "error", title: "Erro ao excluir" });
      }
    } catch {
      addToast({ type: "error", title: "Falha de conexão" });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, fontFamily: "var(--font-display)" }}>Leads</h1>
          <p style={{ color: "var(--d-2)", fontSize: 14, marginTop: 4 }}>
            {leads.length} lead{leads.length !== 1 ? "s" : ""} em acompanhamento
          </p>
        </div>
        <button
          onClick={() => { setFieldError(""); setCreating(true); }}
          style={{
            height: 42, padding: "0 18px", background: "var(--gold)", color: "#181203",
            border: "none", borderRadius: "var(--r-sm)", fontSize: 13, fontWeight: 700,
            fontFamily: "var(--font-display)", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 8, transition: "opacity .2s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
        >
          <Plus size={16} /> Novo Lead
        </button>
      </div>

      {/* Card grid */}
      {leads.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: "var(--d-3)", fontSize: 13.5 }}>
          Nenhum lead ainda. Crie um manualmente ou aguarde novas reservas.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {leads.map((lead) => {
            const sc        = scfg(lead.status);
            const isUpdating = updatingId === lead.id;
            const veh       = lead.reservation?.vehicle;
            const interest  = veh
              ? `${veh.brand} ${veh.model}`
              : lead.vehicleInterest || null;
            const when = new Date(lead.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

            return (
              <div
                key={lead.id}
                style={{ background: "var(--ink-card)", border: "1px solid var(--ink-line)", borderRadius: "var(--r-md)", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}
              >
                {/* Header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.06)", display: "grid", placeItems: "center", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                      {lead.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ color: "#fff", fontSize: 14.5, fontWeight: 700 }}>{lead.name}</div>
                      <div style={{ color: "var(--d-3)", fontSize: 12 }}>{lead.phone}</div>
                    </div>
                  </div>
                  <LeadStatusPill status={lead.status} loading={!!isUpdating} onChange={(s) => handleStatusChange(lead.id, s)} />
                </div>

                {/* Vehicle interest */}
                {interest && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--d-1)", fontSize: 12.5 }}>
                    <Car size={14} style={{ color: "var(--gold)", flexShrink: 0 }} />
                    Interesse:{" "}
                    <strong style={{ color: "var(--d-fg)", fontWeight: 600 }}>{interest}</strong>
                  </div>
                )}

                {/* Notes */}
                <p
                  style={{ color: "var(--d-2)", fontSize: 13, lineHeight: 1.5, paddingTop: 12, borderTop: "1px solid var(--ink-line)", margin: 0, cursor: "pointer" }}
                  onClick={() => setEditingNotes(lead)}
                  title="Clique para editar notas"
                >
                  {lead.notes || <span style={{ color: "var(--d-4)", fontStyle: "italic" }}>Sem notas. Clique para adicionar.</span>}
                </p>

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--d-3)", fontSize: 11.5 }}>{when}</span>

                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {/* Edit */}
                    <button
                      onClick={() => { setFieldError(""); setEditing(lead); }}
                      title="Editar lead"
                      style={{ width: 28, height: 28, display: "grid", placeItems: "center", border: "1px solid var(--ink-line-2)", borderRadius: "var(--r-sm)", background: "transparent", color: "var(--d-2)", cursor: "pointer", transition: "all .15s" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "var(--d-3)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--d-2)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--ink-line-2)"; }}
                    >
                      <Pencil size={13} />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setDeleting(lead)}
                      title="Excluir lead"
                      style={{ width: 28, height: 28, display: "grid", placeItems: "center", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "var(--r-sm)", background: "rgba(239,68,68,0.06)", color: "#f87171", cursor: "pointer", transition: "background .15s" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.14)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.06)"; }}
                    >
                      <Trash2 size={13} />
                    </button>

                    {/* WhatsApp */}
                    <button
                      onClick={() => openWhatsApp(lead)}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--wa)", fontSize: 12.5, fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-display)", transition: "opacity .2s" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.75")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                    >
                      💬 Contatar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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

      {/* Create modal */}
      <AnimatePresence>
        {creating && (
          <LeadModal
            key="create"
            title="Novo Lead"
            subtitle="Cadastre um lead de WhatsApp, ligação ou atendimento presencial"
            initial={EMPTY_FORM}
            saving={savingNew}
            fieldError={fieldError}
            onClose={() => setCreating(false)}
            onSave={handleCreate}
          />
        )}
      </AnimatePresence>

      {/* Edit modal */}
      <AnimatePresence>
        {editing && (
          <LeadModal
            key={editing.id}
            title="Editar Lead"
            subtitle={editing.name}
            initial={{
              name:            editing.name,
              phone:           editing.phone,
              vehicleInterest: editing.vehicleInterest ?? "",
              notes:           editing.notes ?? "",
              status:          editing.status as LeadStatus,
            }}
            saving={savingEdit}
            fieldError={fieldError}
            onClose={() => setEditing(null)}
            onSave={handleEdit}
          />
        )}
      </AnimatePresence>

      {/* Delete modal */}
      <AnimatePresence>
        {deleting && (
          <DeleteModal
            key={deleting.id}
            lead={deleting}
            deleting={deletingId === deleting.id}
            onClose={() => setDeleting(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </>
  );
}
