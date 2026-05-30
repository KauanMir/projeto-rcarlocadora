"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Car } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";
import { formatPrice } from "@/utils/format";

function LineItem({ label, sublabel, value }: { label: string; sublabel: string; value: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="overflow-hidden"
    >
      <div className="flex items-start justify-between gap-3 py-1.5">
        <div className="flex flex-col min-w-0">
          <span style={{ color: "var(--d-fg)", fontSize: 13.5, fontWeight: 600, lineHeight: 1.3 }}>{label}</span>
          <span style={{ color: "var(--d-3)", fontSize: 11, marginTop: 2 }}>{sublabel}</span>
        </div>
        <span style={{ color: "var(--d-1)", fontSize: 13.5, fontWeight: 600, flexShrink: 0 }}>
          {formatPrice(value)}
        </span>
      </div>
    </motion.div>
  );
}

export function PriceSummaryPanel() {
  const { vehicle, rentalDays, insurance, selectedAddons, priceBreakdown, serverPricing, serverPricingLoading } =
    useBookingStore();
  const displayTotal = serverPricing?.total ?? priceBreakdown.total;
  const hasDiscount = serverPricing && serverPricing.finalDiscount > 0;
  const hasSeasonalSurcharge = serverPricing && serverPricing.seasonalMultiplier > 1;

  return (
    /* gold-angle gradient border */
    <div
      className="sticky top-24"
      style={{
        borderRadius: "calc(var(--r-md) + 4px)",
        padding: 2,
        background:
          "linear-gradient(160deg, rgba(255,184,0,0.45), rgba(255,184,0,0.04) 50%, rgba(255,255,255,0.04))",
        boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
      }}
    >
      <div
        style={{
          background: "linear-gradient(180deg, var(--ink-card) 0%, var(--ink-2) 100%)",
          borderRadius: "var(--r-md)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--ink-line)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "var(--r-xs)",
              background: "var(--gold-tint)",
              border: "1px solid rgba(255,184,0,0.25)",
              display: "grid",
              placeItems: "center",
              color: "var(--gold)",
              flexShrink: 0,
            }}
          >
            <Car size={15} />
          </div>
          <span
            style={{
              color: "var(--d-2)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              fontFamily: "var(--font-body)",
            }}
          >
            Resumo do Pedido
          </span>
        </div>

        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
          <AnimatePresence mode="popLayout">
            {!vehicle ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "28px 0" }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "var(--ink-card-2)",
                    border: "1px solid var(--ink-line)",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--d-4)",
                  }}
                >
                  <Car size={20} />
                </div>
                <p style={{ color: "var(--d-3)", fontSize: 12.5, textAlign: "center", lineHeight: 1.5 }}>
                  Selecione um veículo
                  <br />para ver o resumo.
                </p>
              </motion.div>
            ) : (
              <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
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
                  {hasSeasonalSurcharge && serverPricing && (
                    <motion.div
                      key="seasonal"
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center justify-between py-1.5">
                        <span style={{ color: "#fbbf24", fontSize: 12.5, fontWeight: 600 }}>
                          {serverPricing.seasonalName} (+{Math.round((serverPricing.seasonalMultiplier - 1) * 100)}%)
                        </span>
                        <span style={{ color: "#fbbf24", fontSize: 12.5, fontWeight: 700 }}>
                          +{formatPrice(Math.round(serverPricing.vehicleSubtotal * (serverPricing.seasonalMultiplier - 1)))}
                        </span>
                      </div>
                    </motion.div>
                  )}
                  {hasDiscount && serverPricing && (
                    <motion.div
                      key="discount"
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center justify-between py-1.5">
                        <span style={{ color: "#34d399", fontSize: 12.5, fontWeight: 600 }}>
                          Desconto (−{Math.round(serverPricing.finalDiscount * 100)}%)
                        </span>
                        <span style={{ color: "#34d399", fontSize: 12.5, fontWeight: 700 }}>
                          −{formatPrice(Math.round(serverPricing.vehicleSubtotal * serverPricing.seasonalMultiplier * serverPricing.finalDiscount))}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Total row */}
        {vehicle && priceBreakdown.total > 0 && (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              margin: "0 20px 20px",
              padding: "14px 16px",
              borderRadius: "var(--r-sm)",
              background: "var(--gold-tint)",
              border: "1px solid rgba(255,184,0,0.2)",
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                color: "var(--d-2)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontFamily: "var(--font-body)",
              }}
            >
              Total
            </span>
            {serverPricingLoading ? (
              <span style={{ color: "var(--d-3)", fontSize: 14 }}>Calculando…</span>
            ) : (
              <AnimatePresence mode="wait">
                <motion.span
                  key={displayTotal}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    color: "var(--gold)",
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 26,
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
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
