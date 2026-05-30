"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Check, Fuel, Settings, Users } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";
import { useAvailableVehicles } from "@/hooks/useAvailableVehicles";
import { FUEL_LABELS } from "@/utils/constants";
import { formatPrice } from "@/utils/format";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Vehicle } from "@/types/vehicle";

function VehicleCardSkeleton() {
  return (
    <div style={{ border: "1px solid var(--ink-line)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
      <Skeleton className="h-40 w-full rounded-none" />
      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="flex justify-between">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}

function VehicleCard({
  vehicle,
  index,
  isSelected,
  onSelect,
}: {
  vehicle: Vehicle;
  index: number;
  isSelected: boolean;
  onSelect: (v: Vehicle) => void;
}) {
  const [hov, setHov] = useState(false);

  return (
    <motion.button
      role="option"
      aria-selected={isSelected}
      aria-label={`${vehicle.brand} ${vehicle.model} — ${formatPrice(vehicle.pricePerDay)} por dia`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onSelect(vehicle)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(vehicle); }
      }}
      style={{
        textAlign: "left",
        border: "1px solid",
        borderRadius: "var(--r-md)",
        overflow: "hidden",
        transition: "border-color .25s, transform .25s, box-shadow .25s",
        ...(isSelected
          ? {
              borderColor: "rgba(255,184,0,0.7)",
              background: "rgba(255,184,0,0.06)",
              boxShadow: "0 0 0 1px rgba(255,184,0,0.2)",
            }
          : hov
          ? {
              borderColor: "var(--ink-line-2)",
              background: "var(--ink-card)",
              transform: "translateY(-3px)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
            }
          : {
              borderColor: "var(--ink-line)",
              background: "var(--ink-card)",
            }),
      }}
    >
      {/* Image area */}
      <div
        style={{
          height: 160,
          position: "relative",
          background: vehicle.image
            ? "radial-gradient(ellipse at 50% 40%, #1e1e22, #0e0e10)"
            : "var(--ink-card-2)",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {vehicle.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vehicle.image}
            alt={`${vehicle.brand} ${vehicle.model}`}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              padding: "18px 20px 22px",
              transition: "transform .45s cubic-bezier(0.16,1,0.3,1)",
              transform: hov ? "scale(1.06)" : "none",
              filter: "drop-shadow(0 16px 20px rgba(0,0,0,0.5))",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 52,
              color: "rgba(255,255,255,0.04)",
            }}
          >
            {vehicle.model.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Gold glow if selected */}
        {isSelected && (
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%, rgba(255,184,0,0.12), transparent 70%)", pointerEvents: "none" }} />
        )}

        {/* Tags */}
        {vehicle.tags.length > 0 && (
          <div style={{ position: "absolute", top: 10, left: 12 }}>
            <span style={{ background: "var(--gold)", color: "#181203", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: "var(--r-xs)" }}>
              {vehicle.tags[0]}
            </span>
          </div>
        )}

        {/* Selected checkmark */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 18, stiffness: 300 }}
            style={{
              position: "absolute",
              top: 10,
              right: 12,
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "var(--gold)",
              color: "#181203",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Check size={13} strokeWidth={3} />
          </motion.div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
          <div>
            <div style={{ color: "#fff", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, lineHeight: 1.1 }}>{vehicle.model}</div>
            <div style={{ color: "var(--d-2)", fontSize: 12.5, marginTop: 3 }}>{vehicle.name}</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ color: isSelected ? "var(--gold)" : "#fff", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, lineHeight: 1, transition: "color .25s" }}>
              {formatPrice(vehicle.pricePerDay)}
            </div>
            <div style={{ color: "var(--d-3)", fontSize: 11, marginTop: 2 }}>por dia</div>
          </div>
        </div>

        {/* Specs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {[
            { icon: <Fuel size={12} />, label: FUEL_LABELS[vehicle.specs.fuel] },
            { icon: <Settings size={12} />, label: vehicle.specs.transmission === "automatic" ? "Automático" : "Manual" },
            { icon: <Users size={12} />, label: `${vehicle.specs.seats} lugares` },
          ].map(({ icon, label }) => (
            <span
              key={label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                fontWeight: 600,
                color: "var(--d-2)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--ink-line-2)",
                borderRadius: "var(--r-xs)",
                padding: "4px 8px",
              }}
            >
              <span style={{ color: "var(--d-3)" }}>{icon}</span>
              {label}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  );
}

export function VehicleSelection() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? undefined;
  const { vehicle: selectedVehicle, setVehicle, pickupDate, returnDate } = useBookingStore();
  const { vehicles, status, usingFallback } = useAvailableVehicles(pickupDate, returnDate, category);

  const isLoading = status === "loading";
  const isEmpty = status === "empty";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Heading */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ width: 22, height: 2, background: "var(--gold)", borderRadius: 2 }} />
          <span style={{ color: "var(--gold)", fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
            Etapa 2
          </span>
          {usingFallback && !isLoading && (
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--d-3)", border: "1px solid var(--ink-line)", borderRadius: "var(--r-xs)", padding: "3px 7px" }}>
              Demo
            </span>
          )}
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.9rem, 4vw, 2.8rem)", color: "#fff", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 10 }}>
          Qual veículo você prefere?
        </h2>
        <p style={{ color: "var(--d-2)", fontSize: 15 }}>
          {isLoading ? "Verificando disponibilidade…" : "Selecione o veículo para continuar."}
        </p>
      </div>

      {isEmpty ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "64px 0", textAlign: "center" }}
        >
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--ink-card)", border: "1px solid var(--ink-line)", display: "grid", placeItems: "center", fontSize: 28 }}>
            🚫
          </div>
          <div>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>Sem disponibilidade</p>
            <p style={{ color: "var(--d-2)", fontSize: 14, marginTop: 6, maxWidth: 300, lineHeight: 1.5 }}>
              Nenhum veículo disponível para o período selecionado. Tente outras datas.
            </p>
          </div>
          <button
            onClick={() => useBookingStore.getState().setStep(1)}
            style={{
              marginTop: 4,
              padding: "0 24px",
              height: 40,
              border: "1px solid var(--ink-line-2)",
              color: "var(--d-1)",
              borderRadius: "var(--r-sm)",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "var(--font-display)",
              transition: "all .2s",
              cursor: "pointer",
              background: "transparent",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--d-3)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--ink-line-2)"; (e.currentTarget as HTMLElement).style.color = "var(--d-1)"; }}
          >
            Alterar Datas
          </button>
        </motion.div>
      ) : (
        <div
          role="listbox"
          aria-label="Selecione um veículo"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}
        >
          {isLoading
            ? [1, 2, 3, 4].map((i) => <VehicleCardSkeleton key={i} />)
            : vehicles.map((vehicle, index) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  index={index}
                  isSelected={selectedVehicle?.id === vehicle.id}
                  onSelect={setVehicle}
                />
              ))}
        </div>
      )}
    </div>
  );
}
