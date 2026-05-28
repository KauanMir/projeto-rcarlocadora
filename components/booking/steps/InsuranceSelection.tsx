"use client";

import { motion } from "framer-motion";
import { useBookingStore } from "@/store/bookingStore";
import { INSURANCE_OPTIONS } from "@/utils/constants";
import { formatPrice } from "@/utils/format";

export function InsuranceSelection() {
  const { insurance: selectedInsurance, setInsurance } = useBookingStore();

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <h2 className="text-white font-black text-3xl md:text-4xl mb-2">
          Escolha sua cobertura
        </h2>
        <p className="text-white/40">Proteção para viajar com tranquilidade.</p>
      </div>

      <div className="flex flex-col gap-4">
        {INSURANCE_OPTIONS.map((option, index) => {
          const isSelected = selectedInsurance?.id === option.id;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              onClick={() => setInsurance(option)}
              className={`text-left border rounded-xl p-6 transition-all duration-200 relative overflow-hidden ${
                isSelected
                  ? "bg-white/10 border-white/40"
                  : "bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.04]"
              }`}
            >
              {option.recommended && (
                <div className="absolute top-0 right-0 bg-white text-black text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-bl-xl">
                  Recomendado
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-white font-bold text-lg leading-none">{option.name}</div>
                  <div className="text-white/40 text-sm mt-1">{option.description}</div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  {option.pricePerDay === 0 ? (
                    <div className="text-white font-black text-lg leading-none">Incluso</div>
                  ) : (
                    <>
                      <div className="text-white font-black text-lg leading-none">
                        + {formatPrice(option.pricePerDay)}
                      </div>
                      <div className="text-white/30 text-xs mt-1">por dia</div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {option.features.map((feature) => (
                  <span
                    key={feature}
                    className="text-xs text-white/50 bg-white/[0.05] border border-white/10 rounded-sm px-2.5 py-1"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 text-[10px] font-bold tracking-widest uppercase text-white bg-white/10 rounded-sm px-2 py-1 w-fit"
                >
                  ✓ Selecionado
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
