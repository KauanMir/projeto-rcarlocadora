"use client";

import { motion } from "framer-motion";
import { Calendar, AlertCircle } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";
import { todayLocal, MAX_RENTAL_DAYS } from "@/utils/dates";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid var(--ink-line-2)",
  borderRadius: "var(--r-sm)",
  color: "#fff",
  fontSize: 15,
  padding: "14px 14px",
  outline: "none",
  colorScheme: "dark",
  fontFamily: "var(--font-body)",
  fontWeight: 600,
  transition: "border-color .2s",
};

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

      {/* Date fields */}
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
          {/* Location — fixed */}
          <div>
            <label style={labelStyle}>Local de retirada</label>
            <div style={{ ...inputStyle, display: "flex", alignItems: "center", gap: 10, cursor: "default" }}>
              <Calendar size={16} style={{ color: "var(--gold)", flexShrink: 0 }} />
              <span>Loja RCAR — Gama-DF</span>
              <span style={{ marginLeft: "auto", color: "var(--d-3)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Único ponto</span>
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label htmlFor="pickup-date" style={labelStyle}>Retirada</label>
              <input
                id="pickup-date"
                type="date"
                min={today}
                value={pickupDate ?? ""}
                onChange={(e) => setPickupDate(e.target.value || null)}
                style={inputStyle}
                onFocus={(e) => ((e.target as HTMLElement).style.borderColor = "var(--ink-line-2)")}
              />
            </div>
            <div>
              <label htmlFor="return-date" style={labelStyle}>Devolução</label>
              <input
                id="return-date"
                type="date"
                min={pickupDate ?? today}
                value={returnDate ?? ""}
                onChange={(e) => setReturnDate(e.target.value || null)}
                style={inputStyle}
              />
            </div>
          </div>
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
