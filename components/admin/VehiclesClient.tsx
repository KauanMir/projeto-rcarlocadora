"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/utils/format";

interface AdminVehicle {
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

const CATEGORY_LABELS: Record<string, string> = {
  ECONOMY: "Econômico", SEDAN: "Sedan", SUV: "SUV", PREMIUM: "Premium",
};

// ─── Edit modal ───────────────────────────────────────────────

function VehicleEditModal({
  vehicle,
  onClose,
  onSave,
}: {
  vehicle: AdminVehicle;
  onClose: () => void;
  onSave: (id: string, data: Partial<Pick<AdminVehicle, "name" | "dailyRate" | "available" | "featured">>) => Promise<void>;
}) {
  const [name, setName] = useState(vehicle.name);
  const [rate, setRate] = useState(String(vehicle.dailyRate));
  const [available, setAvailable] = useState(vehicle.available);
  const [featured, setFeatured] = useState(vehicle.featured);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    const parsed = parseFloat(rate);
    if (!name.trim() || isNaN(parsed) || parsed <= 0) {
      setError("Verifique os campos.");
      return;
    }
    setSaving(true);
    setError("");
    await onSave(vehicle.id, { name: name.trim(), dailyRate: parsed, available, featured });
    setSaving(false);
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
        className="relative w-full sm:max-w-md bg-[#0c0c0c] border border-white/[0.08] sm:rounded-2xl overflow-hidden z-10"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 340 }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <div>
            <div className="text-white font-bold">{vehicle.brand} {vehicle.model}</div>
            <div className="text-white/35 text-xs">{vehicle.year} · {CATEGORY_LABELS[vehicle.category]}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white transition-colors">✕</button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-white/40 text-[10px] tracking-[0.16em] uppercase font-semibold">Nome do veículo</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] hover:border-white/20 focus:border-white/25 rounded-sm text-white text-sm px-4 py-3 outline-none transition-colors"
            />
          </div>

          {/* Daily rate */}
          <div className="flex flex-col gap-1.5">
            <label className="text-white/40 text-[10px] tracking-[0.16em] uppercase font-semibold">Diária (R$)</label>
            <input
              type="number"
              inputMode="decimal"
              min="1"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] hover:border-white/20 focus:border-white/25 rounded-sm text-white text-sm px-4 py-3 outline-none transition-colors"
            />
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Disponível para locação", value: available, set: setAvailable },
              { label: "Destaque na frota", value: featured, set: setFeatured },
            ].map(({ label, value, set }) => (
              <button
                key={label}
                onClick={() => set(!value)}
                className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all text-xs font-medium ${
                  value
                    ? "bg-white/10 border-white/30 text-white"
                    : "bg-white/[0.02] border-white/[0.07] text-white/35 hover:border-white/15"
                }`}
              >
                <span className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${value ? "bg-white border-white" : "border-white/20"}`}>
                  {value && <span className="text-black text-[10px] font-black">✓</span>}
                </span>
                {label}
              </button>
            ))}
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 h-11 border border-white/10 text-white/40 hover:text-white hover:border-white/25 active:scale-[0.97] rounded-sm text-sm transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 h-11 bg-white text-black hover:bg-white/90 active:scale-[0.97] font-bold rounded-sm text-sm transition-all disabled:opacity-40"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────

export function VehiclesClient({ vehicles: initial }: { vehicles: AdminVehicle[] }) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState(initial);
  const [editing, setEditing] = useState<AdminVehicle | null>(null);

  async function handleSave(
    id: string,
    data: Partial<Pick<AdminVehicle, "name" | "dailyRate" | "available" | "featured">>
  ) {
    const res = await fetch(`/api/admin/vehicles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setVehicles((prev) => prev.map((v) => v.id === id ? { ...v, ...updated } : v));
      router.refresh();
    }
  }

  async function toggleAvailability(vehicle: AdminVehicle) {
    const res = await fetch(`/api/admin/vehicles/${vehicle.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !vehicle.available }),
    });
    if (res.ok) {
      setVehicles((prev) =>
        prev.map((v) => v.id === vehicle.id ? { ...v, available: !vehicle.available } : v)
      );
      router.refresh();
    }
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.07]">
              {["Veículo", "Categoria", "Diária", "Reservas", "Disponível", "Destaque", ""].map((h) => (
                <th key={h} className="text-left text-white/25 text-[9px] tracking-[0.16em] uppercase font-semibold pb-3 pr-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 pr-4">
                  <div className="text-white font-medium">{v.brand} {v.model}</div>
                  <div className="text-white/35 text-xs mt-0.5">{v.name} · {v.year}</div>
                </td>
                <td className="py-3.5 pr-4 text-white/50 text-xs">{CATEGORY_LABELS[v.category]}</td>
                <td className="py-3.5 pr-4 text-white font-semibold">{formatPrice(v.dailyRate)}</td>
                <td className="py-3.5 pr-4 text-white/50">{v.reservationCount}</td>
                <td className="py-3.5 pr-4">
                  <button
                    onClick={() => toggleAvailability(v)}
                    className={`px-2.5 py-1 rounded-sm text-[10px] font-bold tracking-[0.12em] uppercase border transition-all ${
                      v.available
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/25"
                        : "bg-red-500/15 text-red-400 border-red-500/25 hover:bg-red-500/25"
                    }`}
                  >
                    {v.available ? "Ativo" : "Inativo"}
                  </button>
                </td>
                <td className="py-3.5 pr-4">
                  <span className={`px-2.5 py-1 rounded-sm text-[10px] font-bold tracking-[0.12em] uppercase border ${v.featured ? "bg-amber-500/15 text-amber-400 border-amber-500/25" : "text-white/20 border-white/[0.07]"}`}>
                    {v.featured ? "Sim" : "Não"}
                  </span>
                </td>
                <td className="py-3.5">
                  <button
                    onClick={() => setEditing(v)}
                    className="px-3 py-1.5 border border-white/10 text-white/40 hover:text-white hover:border-white/25 rounded-sm text-xs font-medium transition-all"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {vehicles.map((v) => (
          <div key={v.id} className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-white font-medium">{v.brand} {v.model}</div>
                <div className="text-white/35 text-xs mt-0.5">{v.name} · {v.year} · {CATEGORY_LABELS[v.category]}</div>
              </div>
              <span className="text-white font-bold shrink-0">{formatPrice(v.dailyRate)}</span>
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <button
                onClick={() => toggleAvailability(v)}
                className={`px-2.5 py-1 rounded-sm text-[10px] font-bold tracking-[0.12em] uppercase border transition-all ${
                  v.available
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                    : "bg-red-500/15 text-red-400 border-red-500/25"
                }`}
              >
                {v.available ? "Ativo" : "Inativo"}
              </button>
              <span className="text-white/30 text-xs">{v.reservationCount} reserva{v.reservationCount !== 1 ? "s" : ""}</span>
              <button
                onClick={() => setEditing(v)}
                className="ml-auto px-3 py-1 border border-white/10 text-white/40 hover:text-white hover:border-white/25 rounded-sm text-xs font-medium transition-all"
              >
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
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
