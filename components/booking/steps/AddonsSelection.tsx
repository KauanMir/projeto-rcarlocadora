"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";
import { ADDONS } from "@/utils/constants";
import { formatPrice } from "@/utils/format";

export function AddonsSelection() {
  const { selectedAddons, toggleAddon } = useBookingStore();
  const [hov, setHov] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Heading */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ width: 22, height: 2, background: "var(--gold)", borderRadius: 2 }} />
          <span style={{ color: "var(--gold)", fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
            Etapa 4 — Opcional
          </span>
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.9rem, 4vw, 2.8rem)", color: "#fff", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 10 }}>
          Adicione extras à reserva
        </h2>
        <p style={{ color: "var(--d-2)", fontSize: 15, lineHeight: 1.6 }}>Personalize sua experiência. Todos são opcionais.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {ADDONS.map((addon, index) => {
          const isSelected = selectedAddons.some((a) => a.id === addon.id);
          const isHov = hov === addon.id;

          return (
            <motion.button
              key={addon.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => toggleAddon(addon)}
              onMouseEnter={() => setHov(addon.id)}
              onMouseLeave={() => setHov(null)}
              style={{
                textAlign: "left",
                border: "1px solid",
                borderRadius: "var(--r-md)",
                padding: "18px 18px",
                transition: "border-color .25s, background .25s, transform .25s, box-shadow .25s",
                cursor: "pointer",
                position: "relative",
                ...(isSelected
                  ? {
                      borderColor: "rgba(255,184,0,0.65)",
                      background: "rgba(255,184,0,0.07)",
                      boxShadow: "0 0 0 1px rgba(255,184,0,0.15)",
                    }
                  : isHov
                  ? {
                      borderColor: "var(--ink-line-2)",
                      background: "var(--ink-card)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
                    }
                  : {
                      borderColor: "var(--ink-line)",
                      background: "var(--ink-card)",
                    }),
              }}
            >
              {/* Toggle indicator top-right */}
              <div
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  transition: "all .25s",
                  ...(isSelected
                    ? { background: "var(--gold)", color: "#181203" }
                    : { background: "var(--ink-card-2)", border: "1px solid var(--ink-line-2)", color: "var(--d-3)" }),
                }}
              >
                {isSelected ? <Check size={12} strokeWidth={3} /> : <Plus size={12} />}
              </div>

              {/* Icon */}
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: "var(--r-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                  fontSize: 22,
                  transition: "background .25s, border-color .25s",
                  ...(isSelected
                    ? { background: "var(--gold-tint)", border: "1px solid rgba(255,184,0,0.25)" }
                    : { background: "var(--ink-card-2)", border: "1px solid var(--ink-line)" }),
                }}
              >
                {addon.icon}
              </div>

              {/* Name + price */}
              <div style={{ paddingRight: 28 }}>
                <div style={{ color: "#fff", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, lineHeight: 1.2, marginBottom: 4 }}>
                  {addon.name}
                </div>
                <div style={{ color: "var(--d-2)", fontSize: 12.5, lineHeight: 1.5, marginBottom: 10 }}>
                  {addon.description}
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "var(--font-display)",
                    transition: "color .25s",
                    color: isSelected ? "var(--gold)" : "var(--d-1)",
                  }}
                >
                  + {formatPrice(addon.pricePerDay)}
                  <span style={{ fontWeight: 400, fontSize: 11, color: "var(--d-3)" }}>/dia</span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <p style={{ color: "var(--d-4)", fontSize: 12, fontStyle: "italic" }}>
        Você pode pular esta etapa — adicionais são completamente opcionais.
      </p>
    </div>
  );
}
