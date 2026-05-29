"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
        className="min-h-screen bg-[#080808] text-white pt-24 pb-32 lg:pb-16"
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Progress */}
          <div className="mb-12">
            <BookingProgress />
          </div>

          <div className="grid lg:grid-cols-[1fr_300px] gap-10 items-start">
            {/* ── Step content ── */}
            <div>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -20 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <StepComponent />
                </motion.div>
              </AnimatePresence>

              {/* Desktop navigation */}
              <nav
                role="navigation"
                aria-label="Navegação entre etapas"
                className="hidden lg:flex items-center justify-between mt-12 pt-8 border-t border-white/[0.07]"
              >
                <button
                  onClick={handleBack}
                  disabled={step === 1}
                  aria-label="Voltar para a etapa anterior"
                  className="px-8 h-11 border border-white/10 text-white/40 hover:text-white hover:border-white/25 active:scale-[0.97] rounded-sm text-sm font-medium transition-all disabled:opacity-20 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
                >
                  ← Voltar
                </button>
                {step < 5 && (
                  <button
                    onClick={handleNext}
                    disabled={!able}
                    aria-label="Continuar para a próxima etapa"
                    className="px-10 h-11 bg-white text-black hover:bg-white/90 active:scale-[0.97] font-bold rounded-sm text-sm transition-all disabled:opacity-20 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
                  >
                    Continuar →
                  </button>
                )}
              </nav>
            </div>

            {/* Desktop price summary */}
            <div className="hidden lg:block relative">
              <PriceSummaryPanel />
            </div>
          </div>
        </div>
      </main>

      {/* ── Mobile: floating price strip ── */}
      <AnimatePresence>
        {showMobilePrice && (
          <motion.div
            initial={{ y: 48 }}
            animate={{ y: 0 }}
            exit={{ y: 48 }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
            className="lg:hidden fixed z-40"
            style={{ bottom: "64px", left: 0, right: 0 }}
          >
            <div
              className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]"
              style={{
                background: "rgba(10,10,10,0.96)",
                backdropFilter: "blur(16px)",
              }}
            >
              <div>
                <div className="text-white/30 text-[9px] tracking-[0.16em] uppercase">Total estimado</div>
                {serverPricingLoading ? (
                  <div className="text-white/25 text-sm leading-none mt-1">Calculando...</div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={serverPricing?.total ?? priceBreakdown.total}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.16 }}
                      className="text-white font-black text-xl leading-none mt-0.5"
                    >
                      {formatPrice(serverPricing?.total ?? priceBreakdown.total)}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
              {vehicle && (
                <div className="text-white/20 text-xs">
                  {rentalDays} dia{rentalDays !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile: bottom navigation bar ── */}
      <div
        role="navigation"
        aria-label="Navegação entre etapas"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 px-4 pt-3 border-t border-white/[0.07]"
        style={{
          background: "rgba(8,8,8,0.97)",
          backdropFilter: "blur(16px)",
          paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))",
        }}
      >
        <button
          onClick={handleBack}
          disabled={step === 1}
          className="px-5 h-11 min-w-[88px] border border-white/10 text-white/40 hover:text-white rounded-sm text-sm font-medium transition-all disabled:opacity-20 disabled:pointer-events-none active:scale-[0.97]"
        >
          ← Voltar
        </button>

        <div className="flex-1 text-center">
          <div className="text-white/20 text-[10px] tracking-[0.16em] uppercase">
            {step} / 5
          </div>
        </div>

        {step < 5 ? (
          <button
            onClick={handleNext}
            disabled={!able}
            className="px-7 h-11 min-w-[120px] bg-white text-black hover:bg-white/90 active:scale-[0.97] font-bold rounded-sm text-sm transition-all disabled:opacity-20 disabled:pointer-events-none"
          >
            Continuar →
          </button>
        ) : (
          <div className="min-w-[120px]" />
        )}
      </div>
    </>
  );
}
