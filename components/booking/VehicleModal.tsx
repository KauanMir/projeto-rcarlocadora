"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/store/bookingStore";
import { CATEGORY_LABELS, FUEL_LABELS } from "@/utils/constants";
import { formatPrice } from "@/utils/format";

const BRAND_TINT: Record<string, string> = {
  Hyundai:   "radial-gradient(ellipse at top, rgba(40,60,120,0.2) 0%, transparent 60%)",
  Chevrolet: "radial-gradient(ellipse at top, rgba(120,80,20,0.18) 0%, transparent 60%)",
  Toyota:    "radial-gradient(ellipse at top, rgba(20,80,60,0.18) 0%, transparent 60%)",
  Jeep:      "radial-gradient(ellipse at top, rgba(100,60,20,0.2) 0%, transparent 60%)",
};

export function VehicleModal() {
  const router = useRouter();
  const { modalVehicle, closeModal, pickupDate, returnDate, setStep } = useBookingStore();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const reserveButtonRef = useRef<HTMLButtonElement>(null);

  // Focus first element on open, restore on close
  useEffect(() => {
    if (modalVehicle) {
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    }
  }, [modalVehicle]);

  // Focus trap + Escape handler
  useEffect(() => {
    if (!modalVehicle) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { closeModal(); return; }
      if (e.key !== "Tab") return;

      const focusable = [closeButtonRef.current, reserveButtonRef.current].filter(Boolean) as HTMLElement[];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [modalVehicle, closeModal]);

  function handleReserve() {
    if (!modalVehicle) return;
    // Do NOT pre-set the vehicle here — home page uses mocked IDs that don't
    // match real DB CUIDs. The user selects from real DB vehicles at step 2.
    setStep(pickupDate && returnDate ? 2 : 1);
    closeModal();
    router.push("/booking");
  }

  return (
    <AnimatePresence>
      {modalVehicle && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={closeModal}
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-vehicle-name"
            className="relative w-full sm:max-w-lg bg-[#0c0c0c] border border-white/[0.08] sm:rounded-2xl overflow-hidden z-10"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", damping: 30, stiffness: 340 }}
          >
            {/* ── Showroom image area ── */}
            <div className="relative h-52 bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
              <div
                className="absolute inset-0"
                aria-hidden="true"
                style={{ background: BRAND_TINT[modalVehicle.brand] ?? "none" }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0c0c0c]/80" aria-hidden="true" />

              <div
                className="absolute inset-0 flex items-center justify-center overflow-hidden select-none pointer-events-none"
                aria-hidden="true"
              >
                <span
                  className="text-white font-black leading-none whitespace-nowrap tracking-tighter"
                  style={{ fontSize: "clamp(80px, 14vw, 104px)", opacity: 0.045 }}
                >
                  {modalVehicle.model.toUpperCase()}
                </span>
              </div>

              <div className="absolute bottom-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" aria-hidden="true" />

              <div className="absolute top-4 left-4 flex gap-2 flex-wrap z-10" aria-hidden="true">
                {modalVehicle.tags.map((tag) => (
                  <span key={tag} className="text-[9px] font-black tracking-[0.15em] uppercase bg-white text-black px-2 py-0.5 rounded-sm">
                    {tag}
                  </span>
                ))}
              </div>

              <button
                ref={closeButtonRef}
                onClick={closeModal}
                aria-label="Fechar detalhes do veículo"
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.07] hover:bg-white/15 border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white active:scale-95 transition-all z-10 text-xs focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
              >
                ✕
              </button>
            </div>

            {/* ── Content ── */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 id="modal-vehicle-name" className="text-white font-black text-2xl leading-none tracking-tight">
                    {modalVehicle.model}
                  </h2>
                  <p className="text-white/35 text-sm mt-1.5">
                    {modalVehicle.name} · {modalVehicle.year}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-white font-black text-2xl leading-none" aria-label={`${formatPrice(modalVehicle.pricePerDay)} por dia`}>
                    {formatPrice(modalVehicle.pricePerDay)}
                  </div>
                  <div className="text-white/25 text-xs mt-1" aria-hidden="true">por dia</div>
                  <div className="text-white/20 text-[9px] tracking-[0.15em] uppercase mt-0.5">
                    {CATEGORY_LABELS[modalVehicle.category]}
                  </div>
                </div>
              </div>

              {/* Specs */}
              <dl className="grid grid-cols-4 gap-2 mb-6">
                {[
                  { icon: "👥", label: "Lugares",    value: `${modalVehicle.specs.seats}` },
                  { icon: "🚪", label: "Portas",     value: `${modalVehicle.specs.doors}` },
                  { icon: "⛽", label: "Combustível", value: FUEL_LABELS[modalVehicle.specs.fuel] },
                  { icon: "⚙️", label: "Câmbio",     value: modalVehicle.specs.transmission === "automatic" ? "Auto" : "Manual" },
                ].map((spec) => (
                  <div
                    key={spec.label}
                    className="flex flex-col items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg p-3"
                  >
                    <dt className="sr-only">{spec.label}</dt>
                    <span className="text-lg leading-none" aria-hidden="true">{spec.icon}</span>
                    <dd className="text-white/35 text-[10px] text-center leading-tight">{spec.value}</dd>
                  </div>
                ))}
              </dl>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  aria-label="Fechar sem reservar"
                  className="flex-1 h-11 border border-white/10 text-white/40 hover:text-white hover:border-white/25 active:scale-[0.97] rounded-sm text-sm transition-all focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
                >
                  Fechar
                </button>
                <button
                  ref={reserveButtonRef}
                  onClick={handleReserve}
                  aria-label={`Reservar ${modalVehicle.brand} ${modalVehicle.model}`}
                  className="flex-1 h-11 bg-white text-black hover:bg-white/90 active:scale-[0.97] font-bold rounded-sm text-sm transition-all focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
                >
                  Reservar Este Veículo
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
