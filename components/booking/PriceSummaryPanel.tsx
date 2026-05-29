"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useBookingStore } from "@/store/bookingStore";
import { formatPrice } from "@/utils/format";

function LineItem({
  label,
  sublabel,
  value,
}: {
  label: string;
  sublabel: string;
  value: number;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: "auto", marginBottom: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex items-start justify-between gap-3 overflow-hidden"
    >
      <div className="flex flex-col min-w-0 py-1">
        <span className="text-white/75 text-sm font-medium truncate leading-none">{label}</span>
        <span className="text-white/25 text-xs mt-0.5">{sublabel}</span>
      </div>
      <span className="text-white/50 text-sm shrink-0 py-1">{formatPrice(value)}</span>
    </motion.div>
  );
}

export function PriceSummaryPanel() {
  const { vehicle, rentalDays, insurance, selectedAddons, priceBreakdown, serverPricing, serverPricingLoading } = useBookingStore();
  const displayTotal = serverPricing?.total ?? priceBreakdown.total;

  return (
    <div
      className="sticky top-24 rounded-xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.025)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.065)",
      }}
    >
      {/* Inner top highlight */}
      <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

      <div className="p-6 flex flex-col gap-5">
        <h3 className="text-white/35 text-[10px] tracking-[0.18em] uppercase font-semibold">
          Resumo do Pedido
        </h3>

        <AnimatePresence mode="popLayout">
          {!vehicle ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-8"
            >
              <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <span className="text-white/20 text-lg">🚗</span>
              </div>
              <p className="text-white/20 text-xs text-center leading-relaxed">
                Selecione um veículo
                <br />para ver o resumo.
              </p>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-1">
              <LineItem
                label={`${vehicle.brand} ${vehicle.model}`}
                sublabel={`${rentalDays} dia${rentalDays !== 1 ? "s" : ""} × ${formatPrice(vehicle.pricePerDay)}`}
                value={priceBreakdown.vehicleSubtotal}
              />
              <AnimatePresence>
                {insurance && (
                  <LineItem
                    key="insurance"
                    label={insurance.name}
                    sublabel="Cobertura"
                    value={priceBreakdown.insuranceCost}
                  />
                )}
                {selectedAddons.map((addon) => (
                  <LineItem
                    key={addon.id}
                    label={addon.name}
                    sublabel="Adicional"
                    value={addon.pricePerDay * rentalDays}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {vehicle && priceBreakdown.total > 0 && (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-4 border-t border-white/[0.07] flex items-baseline justify-between"
          >
            <span className="text-white/30 text-[10px] tracking-[0.16em] uppercase">Total</span>
            {serverPricingLoading ? (
              <span className="text-white/25 text-sm">Calculando...</span>
            ) : (
              <AnimatePresence mode="wait">
                <motion.span
                  key={displayTotal}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="text-white font-black text-2xl tracking-tight"
                >
                  {formatPrice(displayTotal)}
                </motion.span>
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
