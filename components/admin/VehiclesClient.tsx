"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/toastStore";
import { formatPrice } from "@/utils/format";

// ─── Types ────────────────────────────────────────────────────

type Transmission = "MANUAL" | "AUTOMATIC";
type Fuel = "FLEX" | "GASOLINE" | "ELECTRIC" | "HYBRID";

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
  available: boolean;
  featured: boolean;
  tags: string[];
  reservationCount: number;
}

type EditableFields = Pick<AdminVehicle, "name" | "dailyRate" | "available" | "featured"> & {
  transmission: Transmission;
  fuel: Fuel;
};

// ─── Label maps ───────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  ECONOMY: "Econômico", SEDAN: "Sedan", SUV: "SUV", PREMIUM: "Premium",
};

const TRANSMISSION_LABELS: Record<string, string> = {
  MANUAL: "Manual", AUTOMATIC: "Automático",
};

const FUEL_LABELS: Record<string, string> = {
  FLEX: "Flex", GASOLINE: "Gasolina", ELECTRIC: "Elétrico", HYBRID: "Híbrido",
};

// ─── Small helpers ────────────────────────────────────────────

function FieldLabel({ children }: { children: string }) {
  return (
    <label className="text-white/40 text-[10px] tracking-[0.16em] uppercase font-semibold">
      {children}
    </label>
  );
}

function TextInput({
  value, onChange, type = "text", min, step,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  min?: string;
  step?: string;
}) {
  return (
    <input
      type={type}
      inputMode={type === "number" ? "decimal" : undefined}
      min={min}
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/[0.04] border border-white/[0.08] hover:border-white/20 focus:border-white/25 rounded-sm text-white text-sm px-4 py-3 outline-none transition-colors [color-scheme:dark]"
    />
  );
}

function SelectInput<T extends string>({
  value, onChange, options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="w-full bg-white/[0.04] border border-white/[0.08] hover:border-white/20 focus:border-white/25 rounded-sm text-white text-sm px-4 py-3 outline-none transition-colors appearance-none cursor-pointer [color-scheme:dark]"
      style={{ colorScheme: "dark" }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-[#111]">
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Toggle({
  label, sublabel, checked, onChange,
}: {
  label: string;
  sublabel?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-3 w-full p-3.5 rounded-lg border text-left transition-all ${
        checked
          ? "bg-white/[0.07] border-white/25"
          : "bg-white/[0.02] border-white/[0.07] hover:border-white/15"
      }`}
    >
      {/* Track */}
      <div className={`relative w-9 h-5 rounded-full shrink-0 transition-colors ${checked ? "bg-white" : "bg-white/15"}`}>
        <span
          className={`absolute top-0.5 w-4 h-4 bg-black rounded-full transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0.5"}`}
          style={{ background: checked ? "#080808" : "rgba(255,255,255,0.5)" }}
        />
      </div>
      <div>
        <div className={`text-xs font-semibold ${checked ? "text-white" : "text-white/40"}`}>{label}</div>
        {sublabel && <div className="text-white/25 text-[10px] mt-0.5">{sublabel}</div>}
      </div>
    </button>
  );
}

// ─── Edit modal ───────────────────────────────────────────────

function VehicleEditModal({
  vehicle,
  onClose,
  onSave,
}: {
  vehicle: AdminVehicle;
  onClose: () => void;
  onSave: (id: string, data: Partial<EditableFields>) => Promise<boolean>;
}) {
  const [name,         setName]         = useState(vehicle.name);
  const [rate,         setRate]         = useState(String(vehicle.dailyRate));
  const [transmission, setTransmission] = useState<Transmission>(vehicle.transmission as Transmission);
  const [fuel,         setFuel]         = useState<Fuel>(vehicle.fuel as Fuel);
  const [available,    setAvailable]    = useState(vehicle.available);
  const [featured,     setFeatured]     = useState(vehicle.featured);
  const [saving,       setSaving]       = useState(false);
  const [fieldError,   setFieldError]   = useState("");

  async function handleSave() {
    const parsedRate = parseFloat(rate);
    if (!name.trim()) { setFieldError("Nome é obrigatório."); return; }
    if (isNaN(parsedRate) || parsedRate <= 0) { setFieldError("Diária inválida."); return; }

    setSaving(true);
    setFieldError("");
    const ok = await onSave(vehicle.id, {
      name: name.trim(),
      dailyRate: parsedRate,
      transmission,
      fuel,
      available,
      featured,
    });
    setSaving(false);
    if (ok) onClose();
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
        role="dialog"
        aria-modal="true"
        aria-label={`Editar ${vehicle.brand} ${vehicle.model}`}
        className="relative w-full sm:max-w-lg bg-[#0c0c0c] border border-white/[0.08] sm:rounded-2xl z-10 max-h-[90dvh] flex flex-col overflow-hidden"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 340 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] shrink-0">
          <div>
            <div className="text-white font-bold">{vehicle.brand} {vehicle.model}</div>
            <div className="text-white/35 text-xs mt-0.5">
              {vehicle.year} · {CATEGORY_LABELS[vehicle.category] ?? vehicle.category}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4 overflow-y-auto">

          {/* Nome */}
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Nome do veículo</FieldLabel>
            <TextInput value={name} onChange={setName} />
          </div>

          {/* Diária */}
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Diária (R$)</FieldLabel>
            <TextInput value={rate} onChange={setRate} type="number" min="1" step="0.01" />
          </div>

          {/* Transmissão + Combustível */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Transmissão</FieldLabel>
              <SelectInput<Transmission>
                value={transmission}
                onChange={setTransmission}
                options={[
                  { value: "MANUAL",    label: "Manual" },
                  { value: "AUTOMATIC", label: "Automático" },
                ]}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Combustível</FieldLabel>
              <SelectInput<Fuel>
                value={fuel}
                onChange={setFuel}
                options={[
                  { value: "FLEX",     label: "Flex" },
                  { value: "GASOLINE", label: "Gasolina" },
                  { value: "ELECTRIC", label: "Elétrico" },
                  { value: "HYBRID",   label: "Híbrido" },
                ]}
              />
            </div>
          </div>

          {/* Disponível + Destaque */}
          <div className="flex flex-col gap-2">
            <Toggle
              label="Disponível para locação"
              sublabel={available ? "Aparece na busca e pode ser reservado" : "Oculto da busca — não pode ser reservado"}
              checked={available}
              onChange={setAvailable}
            />
            <Toggle
              label="Destaque na frota"
              sublabel={featured ? "Exibido em destaque na página inicial" : "Sem destaque"}
              checked={featured}
              onChange={setFeatured}
            />
          </div>

          {fieldError && (
            <p role="alert" className="text-red-400 text-xs">{fieldError}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 h-11 border border-white/10 text-white/40 hover:text-white hover:border-white/25 active:scale-[0.97] rounded-sm text-sm font-medium transition-all disabled:opacity-30"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 h-11 bg-white text-black hover:bg-white/90 active:scale-[0.97] font-bold rounded-sm text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black/25 border-t-black rounded-full animate-spin" aria-hidden />
                  Salvando...
                </>
              ) : (
                "Salvar alterações"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────

export function VehiclesClient({ vehicles: initial }: { vehicles: AdminVehicle[] }) {
  const router    = useRouter();
  const addToast  = useToastStore((s) => s.add);

  const [vehicles,    setVehicles]    = useState(initial);
  const [editing,     setEditing]     = useState<AdminVehicle | null>(null);
  const [togglingId,  setTogglingId]  = useState<string | null>(null);

  // ── Save from modal ──────────────────────────────────────────
  async function handleSave(id: string, data: Partial<EditableFields>): Promise<boolean> {
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
      addToast({ type: "error", title: "Erro ao salvar", message: err.error ?? "Tente novamente." });
      return false;
    } catch {
      addToast({ type: "error", title: "Falha de conexão", message: "Verifique sua internet." });
      return false;
    }
  }

  // ── Quick availability toggle ────────────────────────────────
  async function toggleAvailability(vehicle: AdminVehicle) {
    if (togglingId) return;
    setTogglingId(vehicle.id);
    const next = !vehicle.available;
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: next }),
      });

      if (res.ok) {
        setVehicles((prev) => prev.map((v) => v.id === vehicle.id ? { ...v, available: next } : v));
        addToast({
          type: "success",
          title: next ? "Veículo ativado" : "Veículo desativado",
          message: `${vehicle.brand} ${vehicle.model}`,
        });
        router.refresh();
      } else {
        addToast({ type: "error", title: "Erro ao alterar disponibilidade", message: "Tente novamente." });
      }
    } catch {
      addToast({ type: "error", title: "Falha de conexão", message: "Verifique sua internet." });
    } finally {
      setTogglingId(null);
    }
  }

  // ─────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Desktop table ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.07]">
              {["Veículo", "Diária", "Transmissão", "Combustível", "Reservas", "Status", ""].map((h) => (
                <th key={h} className="text-left text-white/25 text-[9px] tracking-[0.16em] uppercase font-semibold pb-3 pr-4 last:pr-0">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => {
              const toggling = togglingId === v.id;
              return (
                <tr key={v.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  {/* Vehicle */}
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-white font-medium leading-none">{v.brand} {v.model}</div>
                        <div className="text-white/35 text-xs mt-1">{v.name} · {v.year} · {CATEGORY_LABELS[v.category] ?? v.category}</div>
                        {v.featured && (
                          <span className="inline-flex mt-1 px-1.5 py-0.5 rounded-sm bg-amber-500/15 text-amber-400 border border-amber-500/25 text-[9px] font-bold tracking-wide uppercase">
                            Destaque
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Daily rate */}
                  <td className="py-4 pr-4 text-white font-semibold whitespace-nowrap">
                    {formatPrice(v.dailyRate)}
                    <div className="text-white/25 text-[10px] font-normal">por dia</div>
                  </td>

                  {/* Transmission */}
                  <td className="py-4 pr-4 text-white/50 text-xs whitespace-nowrap">
                    {TRANSMISSION_LABELS[v.transmission] ?? v.transmission}
                  </td>

                  {/* Fuel */}
                  <td className="py-4 pr-4 text-white/50 text-xs whitespace-nowrap">
                    {FUEL_LABELS[v.fuel] ?? v.fuel}
                  </td>

                  {/* Reservation count */}
                  <td className="py-4 pr-4 text-white/40 text-sm">{v.reservationCount}</td>

                  {/* Availability toggle */}
                  <td className="py-4 pr-4">
                    <button
                      onClick={() => toggleAvailability(v)}
                      disabled={toggling}
                      aria-label={v.available ? "Desativar veículo" : "Ativar veículo"}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-bold tracking-[0.12em] uppercase border transition-all disabled:opacity-50 ${
                        v.available
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/25"
                          : "bg-red-500/15 text-red-400 border-red-500/25 hover:bg-red-500/25"
                      }`}
                    >
                      {toggling && (
                        <span className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin shrink-0" aria-hidden />
                      )}
                      {v.available ? "Ativo" : "Inativo"}
                    </button>
                  </td>

                  {/* Edit */}
                  <td className="py-4">
                    <button
                      onClick={() => setEditing(v)}
                      className="px-3 py-1.5 border border-white/[0.08] text-white/30 hover:text-white hover:border-white/25 rounded-sm text-[10px] font-semibold tracking-wide uppercase transition-all active:scale-[0.97]"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards ── */}
      <div className="md:hidden flex flex-col gap-3">
        {vehicles.map((v) => {
          const toggling = togglingId === v.id;
          return (
            <div key={v.id} className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-4">
              {/* Top */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="text-white font-semibold leading-tight">{v.brand} {v.model}</div>
                  <div className="text-white/35 text-xs mt-0.5">{v.name} · {v.year}</div>
                  <div className="text-white/25 text-xs mt-0.5">
                    {CATEGORY_LABELS[v.category] ?? v.category}
                    {" · "}
                    {TRANSMISSION_LABELS[v.transmission] ?? v.transmission}
                    {" · "}
                    {FUEL_LABELS[v.fuel] ?? v.fuel}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-white font-bold">{formatPrice(v.dailyRate)}</div>
                  <div className="text-white/25 text-[10px]">por dia</div>
                </div>
              </div>

              {/* Chips */}
              <div className="flex items-center flex-wrap gap-2 mb-3">
                {v.featured && (
                  <span className="px-2 py-0.5 rounded-sm bg-amber-500/15 text-amber-400 border border-amber-500/25 text-[9px] font-bold tracking-wide uppercase">
                    Destaque
                  </span>
                )}
                <span className="text-white/25 text-[10px]">
                  {v.reservationCount} reserva{v.reservationCount !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2.5 border-t border-white/[0.05]">
                <button
                  onClick={() => toggleAvailability(v)}
                  disabled={toggling}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-[10px] font-bold tracking-[0.12em] uppercase border transition-all disabled:opacity-50 ${
                    v.available
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                      : "bg-red-500/15 text-red-400 border-red-500/25"
                  }`}
                >
                  {toggling && (
                    <span className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin" aria-hidden />
                  )}
                  {v.available ? "Ativo" : "Inativo"}
                </button>
                <button
                  onClick={() => setEditing(v)}
                  className="ml-auto px-3 py-1.5 border border-white/[0.08] text-white/30 hover:text-white hover:border-white/25 rounded-sm text-[10px] font-semibold tracking-wide uppercase transition-all"
                >
                  Editar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Edit modal ── */}
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
