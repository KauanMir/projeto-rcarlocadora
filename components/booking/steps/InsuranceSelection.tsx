"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Shield } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";
import { INSURANCE_OPTIONS } from "@/utils/constants";
import { formatPrice } from "@/utils/format";

export function InsuranceSelection() {
  const { insurance: selectedInsurance, setInsurance } = useBookingStore();
  const [hov, setHov] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 640 }}>
      {/* Heading */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ width: 22, height: 2, background: "var(--gold)", borderRadius: 2 }} />
          <span style={{ color: "var(--gold)", fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
            Etapa 3
          </span>
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.9rem, 4vw, 2.8rem)", color: "#fff", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 10 }}>
          Escolha sua cobertura
        </h2>
        <p style={{ color: "var(--d-2)", fontSize: 15, lineHeight: 1.6 }}>Proteção para viajar com tranquilidade.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {INSURANCE_OPTIONS.map((option, index) => {
          const isSelected = selectedInsurance?.id === option.id;
          const isHov = hov === option.id;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setInsurance(option)}
              onMouseEnter={() => setHov(option.id)}
              onMouseLeave={() => setHov(null)}
              style={{
                textAlign: "left",
                position: "relative",
                overflow: "hidden",
                borderRadius: "var(--r-md)",
                border: "1px solid",
                padding: "22px 22px",
                transition: "border-color .25s, background .25s, transform .25s, box-shadow .25s",
                cursor: "pointer",
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
                      boxShadow: "0 12px 32px rgba(0,0,0,0.3)",
                    }
                  : {
                      borderColor: "var(--ink-line)",
                      background: "var(--ink-card)",
                    }),
              }}
            >
              {/* Recommended badge */}
              {option.recommended && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    background: "var(--gold)",
                    color: "#181203",
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    padding: "5px 14px",
                    borderBottomLeftRadius: "var(--r-sm)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Recomendado
                </div>
              )}

              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                {/* Icon */}
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "var(--r-sm)",
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    marginTop: 2,
                    transition: "background .25s, border-color .25s",
                    ...(isSelected
                      ? { background: "var(--gold-tint)", border: "1px solid rgba(255,184,0,0.3)", color: "var(--gold)" }
                      : { background: "var(--ink-card-2)", border: "1px solid var(--ink-line)", color: "var(--d-3)" }),
                  }}
                >
                  <Shield size={20} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 8 }}>
                    <div>
                      <div style={{ color: "#fff", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, lineHeight: 1.1 }}>{option.name}</div>
                      <div style={{ color: "var(--d-2)", fontSize: 13, marginTop: 4 }}>{option.description}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      {option.pricePerDay === 0 ? (
                        <div style={{ color: "#34d399", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16 }}>Incluso</div>
                      ) : (
                        <>
                          <div style={{ color: isSelected ? "var(--gold)" : "#fff", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, lineHeight: 1, transition: "color .25s" }}>
                            + {formatPrice(option.pricePerDay)}
                          </div>
                          <div style={{ color: "var(--d-3)", fontSize: 11, marginTop: 3 }}>por dia</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {option.features.map((feature) => (
                      <span
                        key={feature}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 12,
                          fontWeight: 600,
                          color: isSelected ? "rgba(255,184,0,0.85)" : "var(--d-2)",
                          background: isSelected ? "rgba(255,184,0,0.08)" : "rgba(255,255,255,0.04)",
                          border: "1px solid",
                          borderColor: isSelected ? "rgba(255,184,0,0.2)" : "var(--ink-line-2)",
                          borderRadius: "var(--r-xs)",
                          padding: "4px 9px",
                          transition: "all .25s",
                        }}
                      >
                        {isSelected && <Check size={10} strokeWidth={3} style={{ color: "var(--gold)" }} />}
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: "1px solid rgba(255,184,0,0.15)",
                  }}
                >
                  <Check size={12} strokeWidth={3} style={{ color: "var(--gold)" }} />
                  <span style={{ color: "var(--gold)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
                    Selecionado
                  </span>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
