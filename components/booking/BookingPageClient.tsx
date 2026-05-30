"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";
import { MAX_RENTAL_DAYS, MIN_RENTAL_DAYS } from "@/utils/dates";
import { formatPrice } from "@/utils/format";
import { BookingProgress } from "./BookingProgress";
import { PriceSummaryPanel } from "./PriceSummaryPanel";
import { DateSelection } from "./steps/DateSelection";
import { VehicleSelection } from "./steps/VehicleSelection";
import { InsuranceSelection } from "./steps/InsuranceSelection";
import { AddonsSelection } from "./steps/AddonsSelection";
import { BookingSummary } from "./steps/BookingSummary";
import { Header } from "@/components/layout/Header";
import type { BookingStep } from "@/types/booking";

const STEP_COMPONENTS: Record<BookingStep, React.ComponentType> = {
  1: DateSelection,
  2: VehicleSelection,
  3: InsuranceSelection,
  4: AddonsSelection,
  5: BookingSummary,
};

const backBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "0 22px",
  height: 46,
  border: "1px solid var(--ink-line-2)",
  borderRadius: "var(--r-sm)",
  color: "var(--d-1)",
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: 14,
  background: "transparent",
  cursor: "pointer",
  transition: "all .2s",
};

const nextBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "0 28px",
  height: 46,
  borderRadius: "var(--r-sm)",
  background: "var(--gold)",
  color: "#181203",
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: 14,
  border: "none",
  cursor: "pointer",
  transition: "background .2s, transform .15s, box-shadow .2s",
  boxShadow: "0 8px 24px rgba(255,184,0,0.22)",
};

const nextBtnDisabled: React.CSSProperties = {
  ...nextBtn,
  opacity: 0.3,
  cursor: "not-allowed",
  boxShadow: "none",
};

export function BookingPageClient() {
  const {
    step, setStep,
    pickupDate, returnDate, rentalDays,
    vehicle, insurance, priceBreakdown,
    serverPricing, serverPricingLoading,
  } = useBookingStore();

  const [direction, setDirection] = useState<1 | -1>(1);

  function canProceed(): boolean {
    switch (step) {
      case 1: return !!pickupDate && !!returnDate && rentalDays >= MIN_RENTAL_DAYS && rentalDays <= MAX_RENTAL_DAYS;
      case 2: return !!vehicle;
      case 3: return !!insurance;
      case 4: return true;
      case 5: return false;
    }
  }

  function handleNext() {
    if (step < 5 && canProceed()) {
      setDirection(1);
      setStep((step + 1) as BookingStep);
    }
  }

  function handleBack() {
    if (step > 1) {
      setDirection(-1);
      setStep((step - 1) as BookingStep);
    }
  }

  const StepComponent = STEP_COMPONENTS[step];
  const able = canProceed();
  const showMobilePrice = !!vehicle && priceBreakdown.total > 0;

  return (
    <>
      <Header />

      <main
        id="booking-main"
        aria-label="Fluxo de reserva"
        style={{ minHeight: "100vh", background: "var(--ink)", color: "#fff", paddingTop: 96, paddingBottom: 120 }}
      >
        <div style={{ maxWidth: "var(--maxw, 1240px)", margin: "0 auto", padding: "0 28px" }}>
          {/* Progress */}
          <div style={{ marginBottom: 52 }}>
            <BookingProgress />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 40, alignItems: "start" }} className="booking-layout">
            {/* ── Step content ── */}
            <div>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -20 }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                >
                  <StepComponent />
                </motion.div>
              </AnimatePresence>

              {/* Desktop navigation */}
              <nav
                role="navigation"
                aria-label="Navegação entre etapas"
                className="booking-nav-desktop"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 48,
                  paddingTop: 28,
                  borderTop: "1px solid var(--ink-line)",
                }}
              >
                <button
                  onClick={handleBack}
                  disabled={step === 1}
                  aria-label="Voltar para a etapa anterior"
                  style={{ ...backBtn, opacity: step === 1 ? 0.2 : 1, pointerEvents: step === 1 ? "none" : "auto" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--d-3)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--ink-line-2)"; (e.currentTarget as HTMLElement).style.color = "var(--d-1)"; }}
                >
                  <ArrowLeft size={16} /> Voltar
                </button>

                {step < 5 && (
                  <button
                    onClick={handleNext}
                    disabled={!able}
                    aria-label="Continuar para a próxima etapa"
                    style={able ? nextBtn : nextBtnDisabled}
                    onMouseEnter={(e) => { if (able) { (e.currentTarget as HTMLElement).style.background = "var(--gold-soft)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; } }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--gold)"; (e.currentTarget as HTMLElement).style.transform = ""; }}
                  >
                    Continuar <ArrowRight size={16} />
                  </button>
                )}
              </nav>
            </div>

            {/* Desktop price summary */}
            <div className="booking-panel-desktop">
              <PriceSummaryPanel />
            </div>
          </div>
        </div>
      </main>

      {/* ── Mobile: floating price strip ── */}
      <AnimatePresence>
        {showMobilePrice && (
          <motion.div
            initial={{ y: 56 }}
            animate={{ y: 0 }}
            exit={{ y: 56 }}
            transition={{ type: "spring", stiffness: 400, damping: 36 }}
            className="booking-mobile-price"
            style={{
              position: "fixed",
              bottom: 64,
              left: 0,
              right: 0,
              zIndex: 40,
              background: "rgba(10,10,11,0.96)",
              backdropFilter: "blur(16px)",
              borderTop: "1px solid var(--ink-line)",
              padding: "10px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ color: "var(--d-3)", fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" }}>Total estimado</div>
              {serverPricingLoading ? (
                <div style={{ color: "var(--d-3)", fontSize: 14, marginTop: 2 }}>Calculando…</div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={serverPricing?.total ?? priceBreakdown.total}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.16 }}
                    style={{ color: "var(--gold)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, lineHeight: 1, marginTop: 2 }}
                  >
                    {formatPrice(serverPricing?.total ?? priceBreakdown.total)}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
            {vehicle && (
              <div style={{ color: "var(--d-3)", fontSize: 12 }}>
                {rentalDays} dia{rentalDays !== 1 ? "s" : ""}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile: bottom navigation bar ── */}
      <div
        role="navigation"
        aria-label="Navegação entre etapas"
        className="booking-mobile-nav"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "12px 16px",
          paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))",
          background: "rgba(10,10,11,0.97)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid var(--ink-line)",
        }}
      >
        <button
          onClick={handleBack}
          disabled={step === 1}
          style={{
            ...backBtn,
            height: 44,
            minWidth: 88,
            opacity: step === 1 ? 0.2 : 1,
            pointerEvents: step === 1 ? "none" : "auto",
            padding: "0 14px",
          }}
        >
          <ArrowLeft size={15} /> Voltar
        </button>

        <div style={{ color: "var(--d-3)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {step} / 5
        </div>

        {step < 5 ? (
          <button
            onClick={handleNext}
            disabled={!able}
            style={{
              ...(able ? nextBtn : nextBtnDisabled),
              height: 44,
              minWidth: 120,
              padding: "0 18px",
            }}
          >
            Continuar <ArrowRight size={15} />
          </button>
        ) : (
          <div style={{ minWidth: 120 }} />
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .booking-layout { grid-template-columns: 1fr !important; }
          .booking-panel-desktop { display: none !important; }
          .booking-nav-desktop { display: none !important; }
        }
        @media (min-width: 901px) {
          .booking-mobile-price { display: none !important; }
          .booking-mobile-nav { display: none !important; }
        }
        @media (max-width: 540px) {
          .booking-layout { padding: 0 4px; }
        }
      `}</style>
    </>
  );
}
