"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";
import type { BookingStep } from "@/types/booking";

const STEPS: { step: BookingStep; label: string }[] = [
  { step: 1, label: "Datas" },
  { step: 2, label: "Veículo" },
  { step: 3, label: "Seguro" },
  { step: 4, label: "Extras" },
  { step: 5, label: "Resumo" },
];

export function BookingProgress() {
  const currentStep = useBookingStore((s) => s.step);

  return (
    <div className="flex items-center w-full">
      {STEPS.map(({ step, label }, index) => {
        const isCompleted = currentStep > step;
        const isActive = currentStep === step;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              {/* Circle */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all .3s ease",
                  ...(isCompleted
                    ? { background: "var(--gold)", color: "#181203" }
                    : isActive
                    ? {
                        background: "var(--gold)",
                        color: "#181203",
                        boxShadow: "0 0 0 4px rgba(255,184,0,0.18)",
                      }
                    : {
                        background: "var(--ink-card)",
                        color: "var(--d-3)",
                        border: "1px solid var(--ink-line-2)",
                      }),
                }}
              >
                {isCompleted ? (
                  <Check size={15} strokeWidth={3} />
                ) : (
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: 13,
                    }}
                  >
                    {step}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className="hidden sm:block text-[10px] tracking-[0.14em] uppercase transition-colors duration-300"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  color: isActive
                    ? "var(--gold)"
                    : isCompleted
                    ? "var(--d-2)"
                    : "var(--d-4)",
                }}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {index < STEPS.length - 1 && (
              <div
                className="flex-1 mx-3 mb-5 sm:mb-0 overflow-hidden"
                style={{ height: 1, background: "var(--ink-line-2)" }}
              >
                {isCompleted && (
                  <motion.div
                    style={{ height: "100%", background: "var(--gold)", transformOrigin: "left" }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
