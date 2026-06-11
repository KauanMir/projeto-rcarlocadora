"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Ticket } from "lucide-react";
import { useToastStore } from "@/store/toastStore";
import { formatPrice } from "@/utils/format";

// ─── Types ────────────────────────────────────────────────────

export interface AdminCoupon {
  id:             string;
  code:           string;
  type:           "PERCENTAGE" | "FIXED";
  value:          number;
  active:         boolean;
  expiresAt:      string | null;
  minRentalDays:  number;
  maxUses:        number | null;
  currentUses:    number;
  categoryFilter: string | null;
  createdAt:      string;
}

// ─── Helpers ──────────────────────────────────────────────────

function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function couponValueLabel(c: AdminCoupon): string {
  return c.type === "PERCENTAGE"
    ? `−${c.value}%`
    : `−${formatPrice(c.value)}`;
}

// ─── Shared form primitives ───────────────────────────────────

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

function TextInput({ id, value, onChange, type = "text", min, max, step, placeholder }: {
  id?: string; value: string; onChange: (v: string) => void;
  type?: string; min?: string; max?: string; step?: string; placeholder?: string;
}) {
  return (
    <input
      id={id} type={type} min={min} max={max} step={step} placeholder={placeholder}
      value={value} onChange={(e) => onChange(e.target.value)}
      style={inputStyle}
    />
  );
}

function SelectInput<T extends string>({ id, value, onChange, options }: {
  id?: string; value: T; onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      id={id} value={value} onChange={(e) => onChange(e.target.value as T)}
      style={{ ...inputStyle, cursor: "pointer", appearance: "none" }}
    >
      {options.map((o) => <option key={o.value} value={o.value} className="bg-[#111]">{o.label}</option>)}
    </select>
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

// ─── Category options (mirrors VehicleCategory enum) ─────────

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL",     label: "Todas as categorias" },
  { value: "ECONOMY", label: "Econômico" },
  { value: "SEDAN",   label: "Sedan" },
  { value: "SUV",     label: "SUV" },
  { value: "PREMIUM", label: "Premium" },
  { value: "PICKUP",  label: "Picape" },
  { value: "MINIVAN", label: "Minivan" },
];

const CATEGORY_LABEL: Record<string, string> = {
  ALL: "Todas", ECONOMY: "Econômico", SEDAN: "Sedan",
  SUV: "SUV", PREMIUM: "Premium", PICKUP: "Picape", MINIVAN: "Minivan",
};

// ─── Form data type ───────────────────────────────────────────

type CouponFormData = {
  code:           string;
  type:           "PERCENTAGE" | "FIXED";
  value:          string;
  active:         boolean;
  expiresAt:      string;
  minRentalDays:  string;
  maxUses:        string;
  categoryFilter: string;
};

const EMPTY: CouponFormData = {
  code: "", type: "PERCENTAGE", value: "10",
  active: true, expiresAt: "", minRentalDays: "1",
  maxUses: "", categoryFilter: "ALL",
};

// ─── Modal ────────────────────────────────────────────────────

function CouponModal({
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
  initial: CouponFormData;
  saving: boolean;
  fieldError: string;
  onClose: () => void;
  onSave: (data: CouponFormData) => void;
}) {
  const [form, setForm] = useState<CouponFormData>(initial);

  function set(key: keyof CouponFormData, value: string | boolean) {
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
        style={{ position: "relative", width: "100%", maxWidth: 520, background: "var(--ink-card)", border: "1px solid var(--ink-line)", borderRadius: "var(--r-md)", display: "flex", flexDirection: "column", maxHeight: "92dvh" }}
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
              <FieldLabel htmlFor="c-code">Código do cupom</FieldLabel>
              <TextInput
                id="c-code"
                value={form.code}
                onChange={(v) => set("code", v.toUpperCase())}
                placeholder="Ex: VERAO25"
              />
            </div>
          </section>

          <section>
            <SectionHeading>Desconto</SectionHeading>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <FieldLabel>Tipo</FieldLabel>
                <SelectInput<"PERCENTAGE" | "FIXED">
                  value={form.type}
                  onChange={(v) => set("type", v)}
                  options={[
                    { value: "PERCENTAGE", label: "Percentual (%)" },
                    { value: "FIXED",      label: "Valor fixo (R$)" },
                  ]}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <FieldLabel htmlFor="c-value">
                  {form.type === "PERCENTAGE" ? "Desconto (%)" : "Desconto (R$)"}
                </FieldLabel>
                <TextInput
                  id="c-value"
                  value={form.value}
                  onChange={(v) => set("value", v)}
                  type="number"
                  min="0.01"
                  max={form.type === "PERCENTAGE" ? "100" : undefined}
                  step="0.01"
                />
              </div>
            </div>
          </section>

          <section>
            <SectionHeading>Restrições</SectionHeading>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <FieldLabel htmlFor="c-min">Mínimo de diárias</FieldLabel>
                  <TextInput id="c-min" value={form.minRentalDays} onChange={(v) => set("minRentalDays", v)} type="number" min="1" step="1" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <FieldLabel htmlFor="c-max-uses">Limite de usos (vazio = ilimitado)</FieldLabel>
                  <TextInput id="c-max-uses" value={form.maxUses} onChange={(v) => set("maxUses", v)} type="number" min="1" step="1" placeholder="Ilimitado" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <FieldLabel htmlFor="c-expires">Validade (vazio = sem expiração)</FieldLabel>
                  <TextInput id="c-expires" value={form.expiresAt} onChange={(v) => set("expiresAt", v)} type="date" />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <FieldLabel htmlFor="c-category">Categoria</FieldLabel>
                  <SelectInput<string>
                    id="c-category"
                    value={form.categoryFilter || "ALL"}
                    onChange={(v) => set("categoryFilter", v)}
                    options={CATEGORY_OPTIONS}
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <SectionHeading>Status</SectionHeading>
            <Toggle
              label="Cupom ativo"
              sublabel={form.active ? "Aceito no checkout" : "Recusado no checkout"}
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

// ─── Delete confirmation ───────────────────────────────────────

function DeleteModal({
  coupon,
  deleting,
  onClose,
  onConfirm,
}: {
  coupon: AdminCoupon;
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
        <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Excluir cupom?</p>
        <p style={{ color: "var(--d-2)", fontSize: 13.5, lineHeight: 1.5 }}>
          O cupom <strong style={{ color: "var(--gold)" }}>{coupon.code}</strong> será removido permanentemente.
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

export function CouponsClient({ coupons: initial }: { coupons: AdminCoupon[] }) {
  const router   = useRouter();
  const addToast = useToastStore((s) => s.add);

  const [coupons,    setCoupons]   = useState(initial);
  const [creating,   setCreating]  = useState(false);
  const [editing,    setEditing]   = useState<AdminCoupon | null>(null);
  const [deleting,   setDeleting]  = useState<AdminCoupon | null>(null);
  const [savingId,   setSavingId]  = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState("");

  function validateForm(data: CouponFormData): string {
    if (data.code.trim().length < 3)                      return "Código deve ter ao menos 3 caracteres.";
    if (!/^[A-Z0-9_-]+$/.test(data.code.trim()))         return "Código deve conter apenas letras, números, _ e -.";
    const val = parseFloat(data.value);
    if (isNaN(val) || val <= 0)                           return "Valor do desconto deve ser positivo.";
    if (data.type === "PERCENTAGE" && val > 100)          return "Desconto percentual não pode exceder 100%.";
    const min = parseInt(data.minRentalDays);
    if (isNaN(min) || min < 1)                            return "Mínimo de diárias deve ser ≥ 1.";
    if (data.maxUses !== "" && parseInt(data.maxUses) < 1) return "Limite de usos deve ser ≥ 1.";
    return "";
  }

  function toPayload(data: CouponFormData) {
    return {
      code:           data.code.trim().toUpperCase(),
      type:           data.type,
      value:          parseFloat(data.value),
      active:         data.active,
      expiresAt:      data.expiresAt || null,
      minRentalDays:  parseInt(data.minRentalDays) || 1,
      maxUses:        data.maxUses !== "" ? parseInt(data.maxUses) : null,
      categoryFilter: data.categoryFilter && data.categoryFilter !== "ALL" ? data.categoryFilter : null,
    };
  }

  async function handleCreate(data: CouponFormData) {
    const err = validateForm(data);
    if (err) { setFieldError(err); return; }
    setFieldError("");
    setSavingId("new");
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(data)),
      });
      if (res.ok) {
        const created = (await res.json()) as AdminCoupon;
        setCoupons((prev) => [created, ...prev]);
        setCreating(false);
        addToast({ type: "success", title: "Cupom criado", message: created.code });
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

  async function handleEdit(data: CouponFormData) {
    if (!editing) return;
    const err = validateForm(data);
    if (err) { setFieldError(err); return; }
    setFieldError("");
    setSavingId(editing.id);
    try {
      const res = await fetch(`/api/admin/coupons/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(data)),
      });
      if (res.ok) {
        const updated = (await res.json()) as AdminCoupon;
        setCoupons((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setEditing(null);
        addToast({ type: "success", title: "Cupom atualizado", message: updated.code });
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
      const res = await fetch(`/api/admin/coupons/${deleting.id}`, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        setCoupons((prev) => prev.filter((c) => c.id !== deleting.id));
        setDeleting(null);
        addToast({ type: "success", title: "Cupom excluído", message: deleting.code });
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

  async function toggleActive(coupon: AdminCoupon) {
    if (savingId) return;
    const next = !coupon.active;
    setSavingId(coupon.id);
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: next }),
      });
      if (res.ok) {
        const updated = (await res.json()) as AdminCoupon;
        setCoupons((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        addToast({ type: next ? "success" : "warning", title: next ? "Cupom ativado" : "Cupom desativado", message: coupon.code });
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

  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
        <div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, fontFamily: "var(--font-display)" }}>Cupons</h1>
          <p style={{ color: "var(--d-2)", fontSize: 14, marginTop: 4 }}>{coupons.length} cupom{coupons.length !== 1 ? "ns" : ""} cadastrado{coupons.length !== 1 ? "s" : ""}</p>
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
          <Plus size={16} /> Novo cupom
        </button>
      </div>

      {/* Table */}
      {coupons.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "60px 0", color: "var(--d-3)" }}>
          <Ticket size={36} />
          <p style={{ fontSize: 14 }}>Nenhum cupom cadastrado ainda.</p>
        </div>
      ) : (
        <div style={{ background: "var(--ink-card)", border: "1px solid var(--ink-line)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 80px 80px 80px 90px 140px", gap: 0, borderBottom: "1px solid var(--ink-line)", padding: "10px 20px" }}>
            {["Código", "Desconto", "Usos", "Mín. dias", "Validade", "Status", "Ações"].map((h) => (
              <span key={h} style={{ color: "var(--d-3)", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>{h}</span>
            ))}
          </div>

          {coupons.map((c) => {
            const toggling = savingId === c.id;
            const expired  = c.expiresAt ? new Date(c.expiresAt) < new Date() : false;
            const exhausted = c.maxUses !== null && c.currentUses >= c.maxUses;

            return (
              <div
                key={c.id}
                style={{ display: "grid", gridTemplateColumns: "120px 1fr 80px 80px 80px 90px 140px", gap: 0, padding: "14px 20px", borderBottom: "1px solid var(--ink-line)", alignItems: "center", transition: "background .15s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                <span style={{ color: "var(--gold)", fontSize: 13, fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "0.06em" }}>{c.code}</span>

                <div style={{ paddingRight: 12 }}>
                  <span style={{ color: "#34d399", fontSize: 14, fontWeight: 700 }}>{couponValueLabel(c)}</span>
                  {c.categoryFilter && (
                    <span style={{ marginLeft: 8, color: "var(--d-3)", fontSize: 11 }}>· {CATEGORY_LABEL[c.categoryFilter] ?? c.categoryFilter}</span>
                  )}
                </div>

                <span style={{ color: "var(--d-2)", fontSize: 13 }}>
                  {c.currentUses}{c.maxUses ? `/${c.maxUses}` : ""}
                </span>

                <span style={{ color: "var(--d-2)", fontSize: 13 }}>{c.minRentalDays}d</span>

                <span style={{ color: expired ? "#f87171" : "var(--d-2)", fontSize: 13 }}>
                  {c.expiresAt ? formatDateBR(c.expiresAt) : "—"}
                </span>

                {/* Status toggle */}
                <button
                  onClick={() => toggleActive(c)}
                  disabled={!!savingId}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    height: 26, padding: "0 10px", borderRadius: "var(--r-pill)",
                    fontSize: 11, fontWeight: 700, border: "1px solid", cursor: "pointer",
                    transition: "all .2s",
                    ...(c.active && !expired && !exhausted
                      ? { borderColor: "rgba(52,211,153,0.3)", color: "#34d399", background: "rgba(52,211,153,0.08)" }
                      : { borderColor: "rgba(155,155,159,0.3)", color: "var(--d-3)", background: "rgba(155,155,159,0.06)" }),
                  }}
                >
                  {toggling && <span className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin" aria-hidden />}
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.active && !expired && !exhausted ? "#34d399" : "var(--d-4)", flexShrink: 0 }} />
                  {c.active ? (expired ? "Expirado" : exhausted ? "Esgotado" : "Ativo") : "Inativo"}
                </button>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => { setFieldError(""); setEditing(c); }}
                    style={{ height: 28, padding: "0 12px", border: "1px solid var(--ink-line-2)", color: "var(--d-2)", borderRadius: "var(--r-sm)", fontSize: 11.5, fontWeight: 600, background: "transparent", cursor: "pointer", transition: "all .2s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "var(--d-3)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--d-2)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--ink-line-2)"; }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setDeleting(c)}
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
          <CouponModal
            key="create"
            title="Novo cupom"
            subtitle="Configure o desconto e as restrições"
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
          <CouponModal
            key={editing.id}
            title="Editar cupom"
            subtitle={editing.code}
            initial={{
              code:           editing.code,
              type:           editing.type,
              value:          String(editing.value),
              active:         editing.active,
              expiresAt:      editing.expiresAt ?? "",
              minRentalDays:  String(editing.minRentalDays),
              maxUses:        editing.maxUses !== null ? String(editing.maxUses) : "",
              categoryFilter: editing.categoryFilter ?? "ALL",
            }}
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
            coupon={deleting}
            deleting={deletingId === deleting.id}
            onClose={() => setDeleting(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </>
  );
}
