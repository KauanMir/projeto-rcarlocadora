"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/toastStore";
import { formatPrice } from "@/utils/format";
import { CoverUploader, GalleryUploader } from "./ImageUploader";

// ─── Types ────────────────────────────────────────────────────

type Transmission = "MANUAL" | "AUTOMATIC";
type Fuel         = "FLEX" | "GASOLINE" | "ELECTRIC" | "HYBRID";

export interface AdminVehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  transmission: string;
  fuel: string;
  seats: number;
  doors: number;
  dailyRate: number;
  imageUrl: string | null;
  galleryImages: string[];
  available: boolean;
  featured: boolean;
  tags: string[];
  reservationCount: number;
}

type SavePayload = {
  name?: string;
  dailyRate?: number;
  available?: boolean;
  featured?: boolean;
  transmission?: Transmission;
  fuel?: Fuel;
  imageUrl?: string | null;
  galleryImages?: string[];
};

// ─── Status config (matches design VehView) ───────────────────

const VEH_STATUS: Record<string, { label: string; color: string }> = {
  available:   { label: "Disponível",  color: "#34d399" },
  rented:      { label: "Alugado",     color: "#60a5fa" },
  maintenance: { label: "Manutenção",  color: "#fbbf24" },
  inactive:    { label: "Inativo",     color: "#9a999e" },
};

function getVehStatus(v: AdminVehicle): keyof typeof VEH_STATUS {
  if (!v.available) return "inactive";
  return "available";
}

const CATEGORY_LABELS: Record<string, string> = {
  ECONOMY: "Econômico", SEDAN: "Sedan", SUV: "SUV", PREMIUM: "Premium",
  PICKUP: "Picape", MINIVAN: "Minivan",
};
const TRANSMISSION_LABELS: Record<string, string> = { MANUAL: "Manual", AUTOMATIC: "Automático" };
const FUEL_LABELS: Record<string, string> = { FLEX: "Flex", GASOLINE: "Gasolina", ELECTRIC: "Elétrico", HYBRID: "Híbrido" };

// ─── Form field helpers ───────────────────────────────────────

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: string }) {
  return (
    <label htmlFor={htmlFor} style={{ color: "var(--d-3)", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
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

function TextInput({ id, value, onChange, type = "text", min, step }: {
  id?: string; value: string; onChange: (v: string) => void;
  type?: string; min?: string; step?: string;
}) {
  return (
    <input
      id={id} type={type} inputMode={type === "number" ? "decimal" : undefined}
      min={min} step={step} value={value} onChange={(e) => onChange(e.target.value)}
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
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: "12px 14px",
        borderRadius: "var(--r-sm)",
        border: "1px solid",
        textAlign: "left",
        cursor: "pointer",
        transition: "all .2s",
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

// ─── Edit modal ───────────────────────────────────────────────

function VehicleEditModal({
  vehicle, onClose, onSave,
}: {
  vehicle: AdminVehicle; onClose: () => void; onSave: (id: string, data: SavePayload) => Promise<boolean>;
}) {
  const [name,         setName]        = useState(vehicle.name);
  const [rate,         setRate]        = useState(String(vehicle.dailyRate));
  const [transmission, setTransmission] = useState<Transmission>(vehicle.transmission as Transmission);
  const [fuel,         setFuel]        = useState<Fuel>(vehicle.fuel as Fuel);
  const [available,    setAvailable]   = useState(vehicle.available);
  const [featured,     setFeatured]    = useState(vehicle.featured);
  const [imageUrl,     setImageUrl]    = useState<string | null>(vehicle.imageUrl ?? null);
  const [gallery,      setGallery]     = useState<string[]>(vehicle.galleryImages ?? []);
  const [saving,       setSaving]      = useState(false);
  const [fieldError,   setFieldError]  = useState("");

  async function handleSave() {
    const parsedRate = parseFloat(rate);
    if (!name.trim())                        { setFieldError("Nome é obrigatório."); return; }
    if (isNaN(parsedRate) || parsedRate <= 0) { setFieldError("Diária inválida.");    return; }
    setSaving(true); setFieldError("");
    const ok = await onSave(vehicle.id, { name: name.trim(), dailyRate: parsedRate, transmission, fuel, available, featured, imageUrl, galleryImages: gallery });
    setSaving(false);
    if (ok) onClose();
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} aria-hidden />
      <motion.div
        role="dialog" aria-modal="true" aria-label={`Editar ${vehicle.brand} ${vehicle.model}`}
        style={{ position: "relative", width: "100%", maxWidth: 520, background: "var(--ink-card)", border: "1px solid var(--ink-line)", borderRadius: "var(--r-md)", display: "flex", flexDirection: "column", maxHeight: "92dvh" }}
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 340 }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid var(--ink-line)", flexShrink: 0 }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{vehicle.brand} {vehicle.model}</div>
            <div style={{ color: "var(--d-3)", fontSize: 12, marginTop: 2 }}>{vehicle.year} · {CATEGORY_LABELS[vehicle.category] ?? vehicle.category}</div>
          </div>
          <button onClick={onClose} aria-label="Fechar" style={{ color: "var(--d-2)", background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: 4 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 22 }}>
          <section>
            <SectionHeading>Imagens</SectionHeading>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <FieldLabel>Imagem de Capa</FieldLabel>
                <CoverUploader imageUrl={imageUrl} onChange={setImageUrl} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <FieldLabel>Galeria</FieldLabel>
                <GalleryUploader images={gallery} onChange={setGallery} />
              </div>
            </div>
          </section>

          <section>
            <SectionHeading>Informações</SectionHeading>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <FieldLabel htmlFor="edit-name">Nome do veículo</FieldLabel>
                <TextInput id="edit-name" value={name} onChange={setName} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <FieldLabel htmlFor="edit-rate">Diária (R$)</FieldLabel>
                <TextInput id="edit-rate" value={rate} onChange={setRate} type="number" min="1" step="0.01" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <FieldLabel>Transmissão</FieldLabel>
                  <SelectInput<Transmission> value={transmission} onChange={setTransmission} options={[{ value: "MANUAL", label: "Manual" }, { value: "AUTOMATIC", label: "Automático" }]} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <FieldLabel>Combustível</FieldLabel>
                  <SelectInput<Fuel> value={fuel} onChange={setFuel} options={[{ value: "FLEX", label: "Flex" }, { value: "GASOLINE", label: "Gasolina" }, { value: "ELECTRIC", label: "Elétrico" }, { value: "HYBRID", label: "Híbrido" }]} />
                </div>
              </div>
            </div>
          </section>

          <section>
            <SectionHeading>Disponibilidade</SectionHeading>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Toggle label="Disponível para locação" sublabel={available ? "Aparece na busca" : "Oculto da busca"} checked={available} onChange={setAvailable} />
              <Toggle label="Destaque na frota" sublabel={featured ? "Exibido em destaque" : "Sem destaque"} checked={featured} onChange={setFeatured} />
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
            onClick={handleSave} disabled={saving}
            style={{ flex: 1, height: 42, background: "var(--gold)", color: "#181203", border: "none", borderRadius: "var(--r-sm)", fontSize: 13.5, fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? <><span className="w-3.5 h-3.5 border-2 border-black/25 border-t-black rounded-full animate-spin" />Salvando...</> : "Salvar alterações"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────

export function VehiclesClient({ vehicles: initial }: { vehicles: AdminVehicle[] }) {
  const router   = useRouter();
  const addToast = useToastStore((s) => s.add);

  const [vehicles,   setVehicles]  = useState(initial);
  const [editing,    setEditing]   = useState<AdminVehicle | null>(null);
  const [togglingId, setToggling]  = useState<string | null>(null);

  async function handleSave(id: string, data: SavePayload): Promise<boolean> {
    try {
      const res = await fetch(`/api/admin/vehicles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setVehicles((prev) => prev.map((v) => v.id === id ? { ...v, ...updated } : v));
        addToast({ type: "success", title: "Veículo atualizado", message: updated.name });
        router.refresh();
        return true;
      }
      const err = await res.json().catch(() => ({}));
      addToast({ type: "error", title: "Erro ao salvar", message: (err as { error?: string }).error ?? "Tente novamente." });
      return false;
    } catch {
      addToast({ type: "error", title: "Falha de conexão" });
      return false;
    }
  }

  async function toggleAvailability(vehicle: AdminVehicle) {
    if (togglingId) return;
    setToggling(vehicle.id);
    const next = !vehicle.available;
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: next }),
      });
      if (res.ok) {
        setVehicles((prev) => prev.map((v) => v.id === vehicle.id ? { ...v, available: next } : v));
        addToast({ type: next ? "success" : "warning", title: next ? "Veículo ativado" : "Veículo desativado", message: `${vehicle.brand} ${vehicle.model}` });
        router.refresh();
      } else {
        addToast({ type: "error", title: "Erro ao alterar disponibilidade" });
      }
    } catch {
      addToast({ type: "error", title: "Falha de conexão" });
    } finally {
      setToggling(null);
    }
  }

  return (
    <>
      {/* Card grid — exact design: minmax(240px, 1fr), gap 14 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
        {vehicles.map((v) => {
          const statusKey = getVehStatus(v);
          const st = VEH_STATUS[statusKey];
          const toggling = togglingId === v.id;

          return (
            <div
              key={v.id}
              style={{
                background: "var(--ink-card)",
                border: "1px solid var(--ink-line)",
                borderRadius: "var(--r-md)",
                overflow: "hidden",
                transition: "border-color .2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--ink-line-2)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--ink-line)")}
            >
              {/* Image area — exact design: 124px height, dark gradient */}
              <div
                style={{
                  height: 124,
                  background: "linear-gradient(160deg, #1a1a1e, #0e0e10)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {v.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.imageUrl}
                    alt={v.name}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      padding: 14,
                      filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.6))",
                    }}
                  />
                ) : (
                  <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "var(--d-4)", fontSize: 40 }}>
                    🚗
                  </div>
                )}

                {/* Status badge — absolute top-right, dark bg blur */}
                <span
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: st.color,
                    background: "rgba(0,0,0,0.55)",
                    borderRadius: "var(--r-pill)",
                    padding: "4px 9px",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.color }} />
                  {st.label}
                </span>

                {/* Featured badge */}
                {v.featured && (
                  <span
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      fontSize: 9,
                      fontWeight: 800,
                      color: "var(--gold)",
                      background: "rgba(0,0,0,0.55)",
                      borderRadius: "var(--r-pill)",
                      padding: "3px 8px",
                      backdropFilter: "blur(4px)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    ★ Destaque
                  </span>
                )}
              </div>

              {/* Card body — exact design: padding 16 */}
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {v.brand} {v.model}
                    </div>
                    <div style={{ color: "var(--d-3)", fontSize: 12, marginTop: 2 }}>
                      {CATEGORY_LABELS[v.category] ?? v.category}
                    </div>
                  </div>
                </div>

                {/* Footer: plate/year + price — exact design */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: "1px solid var(--ink-line)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      color: "var(--d-3)",
                      fontSize: 12,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {v.year} · {TRANSMISSION_LABELS[v.transmission] ?? v.transmission}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      color: "#fff",
                      fontSize: 16,
                    }}
                  >
                    {formatPrice(v.dailyRate)}
                    <span style={{ fontSize: 11, color: "var(--d-3)", fontWeight: 600 }}>/dia</span>
                  </span>
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    onClick={() => toggleAvailability(v)}
                    disabled={toggling}
                    style={{
                      flex: 1,
                      height: 32,
                      border: "1px solid",
                      borderRadius: "var(--r-sm)",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all .2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                      ...(v.available
                        ? { borderColor: "rgba(52,211,153,0.3)", color: "#34d399", background: "rgba(52,211,153,0.08)" }
                        : { borderColor: "rgba(248,113,113,0.3)", color: "#f87171", background: "rgba(248,113,113,0.08)" }),
                    }}
                  >
                    {toggling && <span className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin" aria-hidden />}
                    {v.available ? "Ativo" : "Inativo"}
                  </button>
                  <button
                    onClick={() => setEditing(v)}
                    style={{
                      flex: 1,
                      height: 32,
                      border: "1px solid var(--ink-line-2)",
                      borderRadius: "var(--r-sm)",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--d-2)",
                      background: "transparent",
                      cursor: "pointer",
                      transition: "all .2s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "var(--d-3)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--d-2)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--ink-line-2)"; }}
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {editing && (
          <VehicleEditModal
            key={editing.id}
            vehicle={editing}
            onClose={() => setEditing(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </>
  );
}
