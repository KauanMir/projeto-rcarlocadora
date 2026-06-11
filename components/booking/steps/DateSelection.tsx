"use client";

import { motion } from "framer-motion";
import { MapPin, AlertCircle } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";
import { todayLocal, MAX_RENTAL_DAYS } from "@/utils/dates";
import { RcarDateRangePicker } from "@/components/ui/RcarDateRangePicker";

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "var(--d-2)",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  marginBottom: 8,
  fontFamily: "var(--font-body)",
};

export function DateSelection() {
  const { pickupDate, returnDate, rentalDays, setPickupDate, setReturnDate } = useBookingStore();

  const today = todayLocal();
  const exceedsMaxDays = rentalDays > MAX_RENTAL_DAYS;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 600 }}>
      {/* Heading */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ width: 22, height: 2, background: "var(--gold)", borderRadius: 2 }} />
          <span style={{ color: "var(--gold)", fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
            Etapa 1
          </span>
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.9rem, 4vw, 2.8rem)", color: "#fff", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 10 }}>
          Quando você precisa do veículo?
        </h2>
        <p style={{ color: "var(--d-2)", fontSize: 15, lineHeight: 1.6 }}>Selecione o período da sua locação.</p>
      </div>

      {/* Card container */}
      <div
        style={{
          padding: 2,
          borderRadius: "calc(var(--r-md) + 4px)",
          background: "linear-gradient(160deg, rgba(255,184,0,0.35), rgba(255,184,0,0.03) 50%, rgba(255,255,255,0.03))",
        }}
      >
        <div
          style={{
            background: "var(--ink-card)",
            borderRadius: "var(--r-md)",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Location — informational card, not editable */}
          <div>
            <label style={labelStyle}>Local de retirada</label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(255,184,0,0.05)",
                border: "1px solid rgba(255,184,0,0.2)",
                borderLeft: "3px solid var(--gold)",
                borderRadius: "var(--r-sm)",
                padding: "12px 14px",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <MapPin size={18} style={{ color: "var(--gold)", flexShrink: 0 }} />
                <span>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "var(--font-body)" }}>
                    Loja RCAR — Gama/DF
                  </div>
                  <div style={{ color: "var(--d-3)", fontSize: 11, marginTop: 1 }}>
                    Único ponto de retirada
                  </div>
                </span>
              </span>
            </div>
          </div>

          {/* Premium date range picker — same component as Hero */}
          <RcarDateRangePicker
            pickupDate={pickupDate ?? ""}
            returnDate={returnDate ?? ""}
            onPickupChange={(d) => setPickupDate(d || null)}
            onReturnChange={(d) => setReturnDate(d || null)}
            minDate={today}
          />
        </div>
      </div>

      {/* Rental days badge */}
      {rentalDays > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            padding: "16px 20px",
            borderRadius: "var(--r-md)",
            border: "1px solid",
            width: "fit-content",
            ...(exceedsMaxDays
              ? { background: "rgba(248,113,113,0.08)", borderColor: "rgba(248,113,113,0.3)" }
              : { background: "var(--gold-tint)", borderColor: "rgba(255,184,0,0.25)" }),
          }}
        >
          {exceedsMaxDays ? (
            <AlertCircle size={24} style={{ color: "#f87171", flexShrink: 0 }} />
          ) : (
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--r-sm)",
                background: "var(--gold)",
                color: "#181203",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              {rentalDays}
            </div>
          )}
          <div>
            {exceedsMaxDays ? (
              <>
                <div style={{ color: "#f87171", fontWeight: 600, fontSize: 14 }}>
                  {rentalDays} dias — período muito longo
                </div>
                <div style={{ color: "rgba(248,113,113,0.6)", fontSize: 12.5, marginTop: 2 }}>
                  Máximo permitido: {MAX_RENTAL_DAYS} dias
                </div>
              </>
            ) : (
              <>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "var(--font-display)" }}>
                  {rentalDays} dia{rentalDays > 1 ? "s" : ""} de locação
                </div>
                <div style={{ color: "var(--d-2)", fontSize: 12.5, marginTop: 2 }}>
                  Período confirmado
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
