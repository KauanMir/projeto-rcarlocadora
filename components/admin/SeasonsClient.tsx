"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar } from "lucide-react";
import { useToastStore } from "@/store/toastStore";

// ─── Types ────────────────────────────────────────────────────

export interface AdminSeason {
  id:         string;
  name:       string;
  startDate:  string;
  endDate:    string;
  multiplier: number;
  active:     boolean;
  createdAt:  string;
}

// ─── Helpers ──────────────────────────────────────────────────

function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function multiplierLabel(m: number): string {
  const pct = Math.round((m - 1) * 100);
  return pct === 0 ? "1.00×" : `+${pct}% (${m.toFixed(2)}×)`;
}

// ─── Shared form primitives (same style as VehiclesClient) ────

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

function TextInput({ id, value, onChange, type = "text", min, max, step }: {
  id?: string; value: string; onChange: (v: string) => void;
  type?: string; min?: string; max?: string; step?: string;
}) {
  return (
    <input
      id={id} type={type} min={min} max={max} step={step}
      value={value} onChange={(e) => onChange(e.target.value)}
      style={inputStyle}
    />
  );
}

function Toggle({ label, sublabel, checked, onChange }: {
  label: string; sublabel?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%",
        padding: "12px 14px", borderRadius: "var(--r-sm)", border: "1px solid",
        textAlign: "left", cursor: "pointer", transition: "all .2s",
        background: checked ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
        borderColor: checked ? "var(--ink-line-2)" : "var(--ink-line)",
      }}
    >
      <div style={{ position: "relative", width: 36, height: 20, borderRadius: 10, flexShrink: 0, background: checked ? "var(--gold)" : "rgba(255,255,255,0.12)", transition: "background .2s" }}>
        <span style={{ position: "absolute", top: 2, width: 16, height: 16, borderRadius: "50%", transition: "transform .2s", transform: checked ? "translateX(16px)" : "translateX(2px)", background: checked ? "#181203" : "rgba(255,255,255,0.5)" }} />
      </div>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: checked ? "#fff" : "var(--d-2)" }}>{label}</div>
        {sublabel && <div style={{ color: "var(--d-3)", fontSize: 11, marginTop: 2 }}>{sublabel}</div>}
      </div>
    </button>
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <span style={{ color: "var(--d-3)", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: "var(--ink-line)" }} />
    </div>
  );
}

// ─── Modal base ───────────────────────────────────────────────

type SeasonFormData = { name: string; startDate: string; endDate: string; multiplier: string; active: boolean };

function SeasonModal({
  title,
  subtitle,
  initial,
  saving,
  fieldError,
  onClose,
  onSave,
}: {
  title: string;
  subtitle: string;
  initial: SeasonFormData;
  saving: boolean;
  fieldError: string;
  onClose: () => void;
  onSave: (data: SeasonFormData) => void;
}) {
  const [form, setForm] = useState<SeasonFormData>(initial);

  function set(key: keyof SeasonFormData, value: string | boolean) {
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
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <FieldLabel htmlFor="s-name">Nome da temporada</FieldLabel>
              <TextInput id="s-name" value={form.name} onChange={(v) => set("name", v)} />
            </div>
          </section>

          <section>
            <SectionHeading>Período</SectionHeading>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <FieldLabel htmlFor="s-start">Data inicial</FieldLabel>
                <TextInput id="s-start" value={form.startDate} onChange={(v) => set("startDate", v)} type="date" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <FieldLabel htmlFor="s-end">Data final</FieldLabel>
                <TextInput id="s-end" value={form.endDate} onChange={(v) => set("endDate", v)} type="date" />
              </div>
            </div>
          </section>

          <section>
            <SectionHeading>Precificação</SectionHeading>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <FieldLabel htmlFor="s-mult">Multiplicador (ex: 1.30 = +30%)</FieldLabel>
              <TextInput id="s-mult" value={form.multiplier} onChange={(v) => set("multiplier", v)} type="number" min="1.00" max="5.00" step="0.01" />
            </div>
          </section>

          <section>
            <SectionHeading>Status</SectionHeading>
            <Toggle
              label="Temporada ativa"
              sublabel={form.active ? "Aplicada automaticamente no booking" : "Ignorada no cálculo de preço"}
              checked={form.active}
              onChange={(v) => set("active", v)}
            />
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
            {saving ? <><span className="w-3.5 h-3.5 border-2 border-black/25 border-t-black rounded-full animate-spin" />Salvando...</> : "Salvar"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Delete confirmation modal ────────────────────────────────

function DeleteModal({
  season,
  deleting,
  onClose,
  onConfirm,
}: {
  season: AdminSeason;
  deleting: boolean;
  onClose: () => void;
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
        <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Excluir temporada?</p>
        <p style={{ color: "var(--d-2)", fontSize: 13.5, lineHeight: 1.5 }}>
          <strong style={{ color: "#fff" }}>{season.name}</strong> será removida permanentemente.
          Reservas existentes não são afetadas.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} disabled={deleting} style={{ flex: 1, height: 40, border: "1px solid var(--ink-line-2)", color: "var(--d-2)", borderRadius: "var(--r-sm)", fontSize: 13.5, background: "transparent", cursor: "pointer" }}>
            Cancelar
          </button>
          <button
            onClick={onConfirm} disabled={deleting}
            style={{ flex: 1, height: 40, background: "#ef4444", color: "#fff", border: "none", borderRadius: "var(--r-sm)", fontSize: 13.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: deleting ? 0.6 : 1 }}
          >
            {deleting ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Excluindo...</> : "Excluir"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────

export function SeasonsClient({ seasons: initial }: { seasons: AdminSeason[] }) {
  const router   = useRouter();
  const addToast = useToastStore((s) => s.add);

  const [seasons,     setSeasons]    = useState(initial);
  const [creating,    setCreating]   = useState(false);
  const [editing,     setEditing]    = useState<AdminSeason | null>(null);
  const [deleting,    setDeleting]   = useState<AdminSeason | null>(null);
  const [savingId,    setSavingId]   = useState<string | null>(null);
  const [deletingId,  setDeletingId] = useState<string | null>(null);
  const [fieldError,  setFieldError] = useState("");

  function validateForm(data: SeasonFormData): string {
    if (!data.name.trim())                        return "Nome é obrigatório.";
    if (!data.startDate)                          return "Data inicial é obrigatória.";
    if (!data.endDate)                            return "Data final é obrigatória.";
    if (new Date(data.startDate) >= new Date(data.endDate)) return "A data inicial deve ser anterior à data final.";
    const mult = parseFloat(data.multiplier);
    if (isNaN(mult) || mult < 1.0 || mult > 5.0) return "Multiplicador deve estar entre 1.00 e 5.00.";
    return "";
  }

  async function handleCreate(data: SeasonFormData) {
    const err = validateForm(data);
    if (err) { setFieldError(err); return; }
    setFieldError("");
    setSavingId("new");
    try {
      const res = await fetch("/api/admin/seasons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, multiplier: parseFloat(data.multiplier) }),
      });
      if (res.ok) {
        const created = (await res.json()) as AdminSeason;
        setSeasons((prev) => [created, ...prev]);
        setCreating(false);
        addToast({ type: "success", title: "Temporada criada", message: created.name });
        router.refresh();
      } else {
        const e = await res.json().catch(() => ({}));
        setFieldError((e as { error?: string }).error ?? "Erro ao criar.");
      }
    } catch {
      setFieldError("Falha de conexão. Tente novamente.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleEdit(data: SeasonFormData) {
    if (!editing) return;
    const err = validateForm(data);
    if (err) { setFieldError(err); return; }
    setFieldError("");
    setSavingId(editing.id);
    try {
      const res = await fetch(`/api/admin/seasons/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, multiplier: parseFloat(data.multiplier) }),
      });
      if (res.ok) {
        const updated = (await res.json()) as AdminSeason;
        setSeasons((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        setEditing(null);
        addToast({ type: "success", title: "Temporada atualizada", message: updated.name });
        router.refresh();
      } else {
        const e = await res.json().catch(() => ({}));
        setFieldError((e as { error?: string }).error ?? "Erro ao atualizar.");
      }
    } catch {
      setFieldError("Falha de conexão. Tente novamente.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeletingId(deleting.id);
    try {
      const res = await fetch(`/api/admin/seasons/${deleting.id}`, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        setSeasons((prev) => prev.filter((s) => s.id !== deleting.id));
        setDeleting(null);
        addToast({ type: "success", title: "Temporada excluída", message: deleting.name });
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

  async function toggleActive(season: AdminSeason) {
    if (savingId) return;
    const next = !season.active;
    setSavingId(season.id);
    try {
      const res = await fetch(`/api/admin/seasons/${season.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: next }),
      });
      if (res.ok) {
        const updated = (await res.json()) as AdminSeason;
        setSeasons((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        addToast({ type: next ? "success" : "warning", title: next ? "Temporada ativada" : "Temporada desativada", message: season.name });
        router.refresh();
      } else {
        addToast({ type: "error", title: "Erro ao alterar status" });
      }
    } catch {
      addToast({ type: "error", title: "Falha de conexão" });
    } finally {
      setSavingId(null);
    }
  }

  const EMPTY: SeasonFormData = { name: "", startDate: "", endDate: "", multiplier: "1.30", active: true };

  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
        <div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, fontFamily: "var(--font-display)" }}>Temporadas</h1>
          <p style={{ color: "var(--d-2)", fontSize: 14, marginTop: 4 }}>{seasons.length} período{seasons.length !== 1 ? "s" : ""} cadastrado{seasons.length !== 1 ? "s" : ""}</p>
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
          <Plus size={16} /> Nova temporada
        </button>
      </div>

      {/* Table */}
      {seasons.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "60px 0", color: "var(--d-3)" }}>
          <Calendar size={36} />
          <p style={{ fontSize: 14 }}>Nenhuma temporada cadastrada ainda.</p>
        </div>
      ) : (
        <div style={{ background: "var(--ink-card)", border: "1px solid var(--ink-line)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 90px 100px 140px", gap: 0, borderBottom: "1px solid var(--ink-line)", padding: "10px 20px" }}>
            {["Nome", "Início", "Fim", "Multiplicador", "Status", "Ações"].map((h) => (
              <span key={h} style={{ color: "var(--d-3)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {seasons.map((s) => {
            const toggling = savingId === s.id;
            return (
              <div
                key={s.id}
                style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 90px 100px 140px", gap: 0, padding: "14px 20px", borderBottom: "1px solid var(--ink-line)", alignItems: "center", transition: "background .15s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                <span style={{ color: "#fff", fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 12 }}>{s.name}</span>
                <span style={{ color: "var(--d-2)", fontSize: 13 }}>{formatDateBR(s.startDate)}</span>
                <span style={{ color: "var(--d-2)", fontSize: 13 }}>{formatDateBR(s.endDate)}</span>
                <span style={{ color: "var(--gold)", fontSize: 13, fontWeight: 700, fontFamily: "var(--font-display)" }}>{multiplierLabel(s.multiplier)}</span>

                {/* Status toggle */}
                <button
                  onClick={() => toggleActive(s)}
                  disabled={!!savingId}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    height: 26, padding: "0 10px", borderRadius: "var(--r-pill)",
                    fontSize: 11, fontWeight: 700, border: "1px solid", cursor: "pointer",
                    transition: "all .2s",
                    ...(s.active
                      ? { borderColor: "rgba(52,211,153,0.3)", color: "#34d399", background: "rgba(52,211,153,0.08)" }
                      : { borderColor: "rgba(155,155,159,0.3)", color: "var(--d-3)", background: "rgba(155,155,159,0.06)" }),
                  }}
                >
                  {toggling && <span className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin" aria-hidden />}
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.active ? "#34d399" : "var(--d-4)", flexShrink: 0 }} />
                  {s.active ? "Ativa" : "Inativa"}
                </button>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => { setFieldError(""); setEditing(s); }}
                    style={{ height: 28, padding: "0 12px", border: "1px solid var(--ink-line-2)", color: "var(--d-2)", borderRadius: "var(--r-sm)", fontSize: 11.5, fontWeight: 600, background: "transparent", cursor: "pointer", transition: "all .2s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "var(--d-3)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--d-2)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--ink-line-2)"; }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setDeleting(s)}
                    style={{ height: 28, padding: "0 12px", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", borderRadius: "var(--r-sm)", fontSize: 11.5, fontWeight: 600, background: "rgba(239,68,68,0.06)", cursor: "pointer", transition: "all .2s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.12)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.06)"; }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      <AnimatePresence>
        {creating && (
          <SeasonModal
            key="create"
            title="Nova temporada"
            subtitle="Defina o período e o multiplicador de preço"
            initial={EMPTY}
            saving={savingId === "new"}
            fieldError={fieldError}
            onClose={() => setCreating(false)}
            onSave={handleCreate}
          />
        )}
      </AnimatePresence>

      {/* Edit modal */}
      <AnimatePresence>
        {editing && (
          <SeasonModal
            key={editing.id}
            title="Editar temporada"
            subtitle={editing.name}
            initial={{ name: editing.name, startDate: editing.startDate, endDate: editing.endDate, multiplier: String(editing.multiplier), active: editing.active }}
            saving={savingId === editing.id}
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
            season={deleting}
            deleting={deletingId === deleting.id}
            onClose={() => setDeleting(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </>
  );
}
