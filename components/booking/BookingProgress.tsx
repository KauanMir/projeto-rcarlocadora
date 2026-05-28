"use client";

import { motion } from "framer-motion";
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
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shrink-0 ${
                  isCompleted
                    ? "bg-white text-black"
                    : isActive
                    ? "bg-white text-black ring-4 ring-white/20"
                    : "bg-white/[0.06] text-white/25 border border-white/10"
                }`}
              >
                {isCompleted ? "✓" : step}
              </div>
              <span
                className={`text-[10px] tracking-widest uppercase font-medium hidden sm:block transition-colors duration-300 ${
                  isActive ? "text-white" : isCompleted ? "text-white/50" : "text-white/20"
                }`}
              >
                {label}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div className="flex-1 h-px mx-3 mb-5 sm:mb-0 bg-white/10 relative overflow-hidden">
                {isCompleted && (
                  <motion.div
                    className="absolute inset-0 bg-white/40"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    style={{ transformOrigin: "left" }}
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
