"use client";

import { motion } from "framer-motion";
import { useBookingStore } from "@/store/bookingStore";
import { ADDONS } from "@/utils/constants";
import { formatPrice } from "@/utils/format";

export function AddonsSelection() {
  const { selectedAddons, toggleAddon } = useBookingStore();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-white font-black text-3xl md:text-4xl mb-2">
          Adicione extras à reserva
        </h2>
        <p className="text-white/40">Opcional — personalize sua experiência.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {ADDONS.map((addon, index) => {
          const isSelected = selectedAddons.some((a) => a.id === addon.id);

          return (
            <motion.button
              key={addon.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.07 }}
              onClick={() => toggleAddon(addon)}
              className={`text-left border rounded-xl p-5 transition-all duration-200 ${
                isSelected
                  ? "bg-white/10 border-white/40"
                  : "bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl leading-none mt-0.5 shrink-0">{addon.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="text-white font-semibold">{addon.name}</div>
                    <div className="text-white/60 text-sm font-medium shrink-0">
                      + {formatPrice(addon.pricePerDay)}/dia
                    </div>
                  </div>
                  <div className="text-white/40 text-sm">{addon.description}</div>
                </div>
              </div>

              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 ml-[52px] text-[10px] font-bold tracking-widest uppercase text-white bg-white/10 rounded-sm px-2 py-1 w-fit"
                >
                  ✓ Adicionado
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <p className="text-white/20 text-xs">
        Você pode pular esta etapa — adicionais são opcionais.
      </p>
    </div>
  );
}
