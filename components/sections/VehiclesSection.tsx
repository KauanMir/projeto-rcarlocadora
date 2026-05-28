"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { MOCKED_VEHICLES, CATEGORY_LABELS, FUEL_LABELS } from "@/utils/constants";
import { useBookingStore } from "@/store/bookingStore";
import { formatPrice } from "@/utils/format";
import type { Vehicle } from "@/types/vehicle";

const CATEGORY_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "economy", label: "Econômico" },
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
];

// Brand-specific showroom gradient tints
const BRAND_TINT: Record<string, string> = {
  Hyundai: "radial-gradient(ellipse at top right, rgba(40,60,120,0.18) 0%, transparent 70%)",
  Chevrolet: "radial-gradient(ellipse at top right, rgba(120,80,20,0.15) 0%, transparent 70%)",
  Toyota: "radial-gradient(ellipse at top right, rgba(20,80,60,0.15) 0%, transparent 70%)",
  Jeep: "radial-gradient(ellipse at top right, rgba(100,60,20,0.18) 0%, transparent 70%)",
};

function VehicleCard({ vehicle, index }: { vehicle: Vehicle; index: number }) {
  const openModal = useBookingStore((s) => s.openModal);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay: index * 0.09, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col bg-[#0a0a0a] border border-white/[0.07] rounded-xl overflow-hidden hover:border-white/20 hover:-translate-y-1 transition-all duration-300"
      style={{ willChange: "transform" }}
    >
      {/* ── Showroom image area ── */}
      <div className="relative h-52 overflow-hidden bg-[#0a0a0a] flex-shrink-0">
        {/* Brand-specific ambient tint */}
        <div
          className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-150"
          style={{ background: BRAND_TINT[vehicle.brand] ?? "none" }}
        />

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.012] to-transparent" />

        {/* Giant ghost model name — art direction element */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden select-none pointer-events-none">
          <span
            className="text-white font-black leading-none whitespace-nowrap tracking-tighter transition-all duration-700 group-hover:opacity-[0.065]"
            style={{ fontSize: "clamp(72px, 12vw, 96px)", opacity: 0.04 }}
          >
            {vehicle.model.toUpperCase()}
          </span>
        </div>

        {/* Showroom floor reflection line */}
        <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent transition-opacity duration-300 group-hover:opacity-200" />

        {/* Tags */}
        <div className="absolute top-4 left-4 z-10 flex gap-1.5 flex-wrap">
          {vehicle.tags.map((tag) => (
            <span
              key={tag}
              className="text-[9px] font-black tracking-[0.15em] uppercase bg-white text-black px-2 py-0.5 rounded-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Price glass pill */}
        <div
          className="absolute bottom-4 right-4 z-10 text-right rounded-sm px-3 py-2"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="text-white/35 text-[9px] tracking-[0.12em] uppercase leading-none mb-0.5">a partir de</div>
          <div className="text-white font-black text-xl leading-none">
            {formatPrice(vehicle.pricePerDay)}
            <span className="text-white/35 text-xs font-normal">/dia</span>
          </div>
        </div>
      </div>

      {/* ── Info area ── */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-white font-bold text-lg leading-none">{vehicle.model}</h3>
            <p className="text-white/35 text-sm mt-1">{vehicle.name}</p>
          </div>
          <Badge
            variant="outline"
            className="border-white/12 text-white/30 text-[9px] tracking-[0.14em] uppercase rounded-sm shrink-0"
          >
            {CATEGORY_LABELS[vehicle.category]}
          </Badge>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: "👥", label: `${vehicle.specs.seats} lugares` },
            { icon: "⛽", label: FUEL_LABELS[vehicle.specs.fuel] },
            { icon: "⚙️", label: vehicle.specs.transmission === "automatic" ? "Auto" : "Manual" },
          ].map((spec) => (
            <div
              key={spec.label}
              className="flex flex-col items-center gap-1.5 bg-white/[0.025] border border-white/[0.06] rounded-md p-2.5"
            >
              <span className="text-sm leading-none">{spec.icon}</span>
              <span className="text-white/30 text-[10px] text-center leading-tight">{spec.label}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => openModal(vehicle)}
            className="flex-1 h-10 border border-white/12 text-white/45 hover:text-white hover:border-white/25 active:scale-[0.97] rounded-sm text-xs font-medium transition-all duration-200"
          >
            Detalhes
          </button>
          <button
            onClick={() => openModal(vehicle)}
            className="flex-1 h-10 bg-white text-black hover:bg-white/90 active:scale-[0.97] font-semibold rounded-sm text-xs transition-all duration-200"
          >
            Reservar
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function VehiclesSection() {
  return (
    <section id="frota" className="bg-[#080808] py-28 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-white/25 text-[10px] tracking-[0.2em] uppercase font-semibold mb-4">
              Nossa Frota
            </p>
            <h2 className="text-white font-black leading-[0.95] tracking-tight"
              style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)" }}>
              Escolha o seu
              <br />
              <span className="text-white/25">veículo ideal.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex gap-2 flex-wrap"
          >
            {CATEGORY_FILTERS.map((filter, i) => (
              <button
                key={filter.value}
                className={`px-4 py-2 text-[10px] font-bold tracking-[0.16em] uppercase rounded-sm transition-all duration-200 active:scale-[0.97] ${
                  i === 0
                    ? "bg-white text-black"
                    : "border border-white/12 text-white/35 hover:border-white/25 hover:text-white/70"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCKED_VEHICLES.map((vehicle, index) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-14 text-center"
        >
          <button className="px-12 h-11 border border-white/12 text-white/35 hover:text-white/70 hover:border-white/25 active:scale-[0.98] rounded-sm text-xs font-semibold tracking-[0.14em] uppercase transition-all duration-200">
            Ver Frota Completa
          </button>
        </motion.div>
      </div>
    </section>
  );
}
