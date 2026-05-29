"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/toastStore";
import { uploadImage, validateImage, isCloudinaryConfigured } from "@/lib/image-service";
import type { RentalRow } from "./RentalsClient";

// ─── Types ────────────────────────────────────────────────────

type ChecklistType = "PICKUP" | "RETURN";
type FuelLevel = "E" | "1/4" | "1/2" | "3/4" | "F";

export interface ChecklistData {
  type: string;
  fuelLevel: string;
  mileage: number | null;
  notes: string | null;
  photos: string[];
  createdAt: string;
}

// ─── Fuel level config ────────────────────────────────────────

const FUEL_LEVELS: { value: FuelLevel; label: string; active: string; inactive: string }[] = [
  { value: "E",   label: "E",  active: "border-red-400/60 text-red-300 bg-red-500/15",           inactive: "border-white/[0.08] text-white/25" },
  { value: "1/4", label: "¼",  active: "border-orange-400/60 text-orange-300 bg-orange-500/15",  inactive: "border-white/[0.08] text-white/25" },
  { value: "1/2", label: "½",  active: "border-amber-400/60 text-amber-300 bg-amber-500/15",     inactive: "border-white/[0.08] text-white/25" },
  { value: "3/4", label: "¾",  active: "border-lime-400/60 text-lime-300 bg-lime-500/15",        inactive: "border-white/[0.08] text-white/25" },
  { value: "F",   label: "F",  active: "border-emerald-400/60 text-emerald-300 bg-emerald-500/15", inactive: "border-white/[0.08] text-white/25" },
];

function FuelPicker({
  value,
  onChange,
  readonly,
}: {
  value: string;
  onChange?: (v: FuelLevel) => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex gap-2">
      {FUEL_LEVELS.map((f) => {
        const isActive = f.value === value;
        return (
          <button
            key={f.value}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(f.value)}
            className={`w-11 h-11 flex items-center justify-center rounded-xl border text-sm font-bold transition-all ${
              isActive ? f.active : `${f.inactive} ${readonly ? "" : "hover:border-white/20 hover:text-white/50"}`
            } ${readonly ? "cursor-default" : "active:scale-[0.95]"}`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Drag-and-drop photo area ─────────────────────────────────

function PhotoArea({
  photos,
  onChange,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      setErrors([]);
      for (const file of files) {
        const err = validateImage(file);
        if (err) { setErrors((p) => [...p, err]); continue; }
        setUploading((n) => n + 1);
        try {
          const result = await uploadImage(file, undefined, "rcar/checklists");
          onChange([...photos, result.url]);
        } catch (e) {
          setErrors((p) => [...p, e instanceof Error ? e.message : "Falha no upload."]);
        } finally {
          setUploading((n) => n - 1);
        }
      }
    },
    [photos, onChange]
  );

  if (!isCloudinaryConfigured()) {
    return (
      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400/70 text-xs leading-relaxed">
        Configure <code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> e{" "}
        <code>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code> para habilitar upload de fotos.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          uploadFiles(Array.from(e.dataTransfer.files));
        }}
        className={`border-2 border-dashed rounded-xl transition-all ${
          dragging ? "border-white/30 bg-white/[0.05]" : "border-white/[0.08] bg-white/[0.02]"
        }`}
      >
        {photos.length > 0 || uploading > 0 ? (
          <div className="p-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
            {photos.map((url, i) => (
              <div
                key={`${url}-${i}`}
                className="relative aspect-square rounded-lg overflow-hidden bg-white/[0.04] group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => onChange(photos.filter((_, idx) => idx !== i))}
                  aria-label={`Remover foto ${i + 1}`}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-all"
                >
                  ✕
                </button>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0"
                  aria-label="Ver foto em tamanho real"
                />
              </div>
            ))}

            {Array.from({ length: uploading }).map((_, i) => (
              <div
                key={`loading-${i}`}
                className="aspect-square rounded-lg bg-white/[0.04] flex items-center justify-center"
              >
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            ))}

            {photos.length < 10 && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading > 0}
                aria-label="Adicionar foto"
                className="aspect-square rounded-lg border-2 border-dashed border-white/[0.1] hover:border-white/20 hover:bg-white/[0.03] flex items-center justify-center transition-all disabled:opacity-40"
              >
                <span className="text-white/25 text-xl leading-none">+</span>
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading > 0}
            className="w-full py-8 flex flex-col items-center gap-2 cursor-pointer hover:bg-white/[0.02] transition-colors rounded-xl disabled:opacity-40"
          >
            <span className="text-3xl opacity-20" aria-hidden>📷</span>
            <span className="text-white/30 text-xs text-center leading-relaxed">
              Arraste as fotos aqui
              <br />
              ou clique para selecionar
            </span>
            <span className="text-white/15 text-[10px]">JPEG, PNG, WebP · máx 10 MB cada</span>
          </button>
        )}
      </div>

      {errors.map((err, i) => (
        <p key={i} role="alert" className="text-red-400 text-xs">{err}</p>
      ))}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          if (e.target.files) uploadFiles(Array.from(e.target.files));
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Read-only view ───────────────────────────────────────────

function ChecklistView({ checklist }: { checklist: ChecklistData }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="text-white/20 text-[9px] tracking-[0.18em] uppercase mb-2">Combustível</div>
        <FuelPicker value={checklist.fuelLevel} readonly />
      </div>

      {checklist.mileage !== null && (
        <div>
          <div className="text-white/20 text-[9px] tracking-[0.18em] uppercase mb-1">Quilometragem</div>
          <div className="text-white/70 text-sm font-semibold">
            {checklist.mileage.toLocaleString("pt-BR")} km
          </div>
        </div>
      )}

      {checklist.notes && (
        <div>
          <div className="text-white/20 text-[9px] tracking-[0.18em] uppercase mb-1">Observações</div>
          <p className="text-white/55 text-sm leading-relaxed">{checklist.notes}</p>
        </div>
      )}

      {checklist.photos.length > 0 && (
        <div>
          <div className="text-white/20 text-[9px] tracking-[0.18em] uppercase mb-2">
            Fotos ({checklist.photos.length})
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {checklist.photos.map((url, i) => (
              <a
                key={`${url}-${i}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square rounded-lg overflow-hidden bg-white/[0.04] block"
                aria-label={`Abrir foto ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Foto ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="text-white/20 text-[10px] pt-2 border-t border-white/[0.05]">
        Registrado em{" "}
        {new Date(checklist.createdAt).toLocaleString("pt-BR", {
          day: "2-digit", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        })}
      </div>
    </div>
  );
}

// ─── Form ────────────────────────────────────────────────────

function ChecklistForm({
  type,
  onSubmit,
  saving,
}: {
  type: ChecklistType;
  onSubmit: (data: {
    fuelLevel: string;
    mileage: number | null;
    notes: string;
    photos: string[];
  }) => Promise<void>;
  saving: boolean;
}) {
  const [fuelLevel, setFuelLevel] = useState<FuelLevel>("1/2");
  const [mileage, setMileage] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="text-white/20 text-[9px] tracking-[0.18em] uppercase mb-2">
          Combustível <span className="text-white/15 normal-case tracking-normal font-normal">*</span>
        </div>
        <FuelPicker value={fuelLevel} onChange={setFuelLevel} />
      </div>

      <div>
        <label className="text-white/20 text-[9px] tracking-[0.18em] uppercase block mb-2">
          Quilometragem{" "}
          <span className="text-white/15 normal-case tracking-normal font-normal">(opcional)</span>
        </label>
        <input
          type="number"
          min={0}
          value={mileage}
          onChange={(e) => setMileage(e.target.value)}
          placeholder="Ex: 45200"
          className="w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 text-white/80 text-sm placeholder:text-white/20 focus:outline-none focus:border-white/[0.18] transition-colors"
        />
      </div>

      <div>
        <label className="text-white/20 text-[9px] tracking-[0.18em] uppercase block mb-2">
          Observações{" "}
          <span className="text-white/15 normal-case tracking-normal font-normal">(opcional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Riscos, amassados, nível de limpeza, avarias…"
          rows={3}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white/80 text-sm placeholder:text-white/20 resize-none focus:outline-none focus:border-white/[0.18] transition-colors"
        />
      </div>

      <div>
        <div className="text-white/20 text-[9px] tracking-[0.18em] uppercase mb-2">
          Fotos{" "}
          <span className="text-white/15 normal-case tracking-normal font-normal">(opcional)</span>
        </div>
        <PhotoArea photos={photos} onChange={setPhotos} />
      </div>

      <button
        type="button"
        onClick={() =>
          onSubmit({
            fuelLevel,
            mileage: mileage ? parseInt(mileage, 10) : null,
            notes,
            photos,
          })
        }
        disabled={saving}
        className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white text-sm font-semibold transition-all disabled:opacity-40 mt-1"
      >
        {saving && (
          <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
        )}
        Salvar checklist de {type === "PICKUP" ? "retirada" : "devolução"}
      </button>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────

export function ChecklistModal({
  rental,
  onClose,
  onCreated,
}: {
  rental: RentalRow;
  onClose: () => void;
  onCreated: (rentalId: string, checklist: ChecklistData) => void;
}) {
  const addToast = useToastStore((s) => s.add);
  const [activeTab, setActiveTab] = useState<ChecklistType>("PICKUP");
  const [saving, setSaving] = useState(false);
  const [checklists, setChecklists] = useState<ChecklistData[]>(rental.checklists);

  const pickupChecklist = checklists.find((c) => c.type === "PICKUP") ?? null;
  const returnChecklist = checklists.find((c) => c.type === "RETURN") ?? null;
  const activeChecklist = activeTab === "PICKUP" ? pickupChecklist : returnChecklist;

  async function handleSubmit(data: {
    fuelLevel: string;
    mileage: number | null;
    notes: string;
    photos: string[];
  }) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/rentals/${rental.id}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: activeTab, ...data }),
      });
      if (res.ok) {
        const created: ChecklistData & { type: string } = await res.json();
        setChecklists((prev) => [...prev, created]);
        onCreated(rental.id, created);
        addToast({
          type: "success",
          title: "Checklist salvo",
          message: activeTab === "PICKUP" ? "Retirada registrada" : "Devolução registrada",
        });
      } else {
        const err = await res.json().catch(() => ({}));
        addToast({
          type: "error",
          title: "Erro",
          message: (err as { error?: string }).error ?? "Tente novamente.",
        });
      }
    } catch {
      addToast({ type: "error", title: "Falha de conexão" });
    } finally {
      setSaving(false);
    }
  }

  const tabs = [
    { type: "PICKUP" as ChecklistType,  label: "Retirada",  done: !!pickupChecklist  },
    { type: "RETURN" as ChecklistType,  label: "Devolução", done: !!returnChecklist  },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />

      <motion.div
        role="dialog"
        aria-modal
        aria-label={`Checklist — ${rental.vehicleBrand} ${rental.vehicleModel}`}
        className="relative w-full sm:max-w-lg bg-[#0c0c0c] border border-white/[0.08] sm:rounded-2xl z-10 flex flex-col overflow-hidden max-h-[90dvh]"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 340 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] shrink-0">
          <div>
            <div className="text-white font-bold">
              {rental.vehicleBrand} {rental.vehicleModel}
            </div>
            <div className="text-white/30 text-xs mt-0.5">{rental.customerName} · Checklist</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.07] shrink-0">
          {tabs.map(({ type, label, done }) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                activeTab === type
                  ? "border-white/35 text-white"
                  : "border-transparent text-white/30 hover:text-white/60"
              }`}
            >
              {label}
              {done ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-label="Preenchido" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-white/15" aria-label="Pendente" />
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === "PICKUP" ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              {activeChecklist ? (
                <ChecklistView checklist={activeChecklist} />
              ) : (
                <ChecklistForm type={activeTab} onSubmit={handleSubmit} saving={saving} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
