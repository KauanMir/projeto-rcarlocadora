"use client";

import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/store/bookingStore";
import { useToastStore } from "@/store/toastStore";
import { buildWhatsAppUrl } from "@/utils/whatsapp";
import { formatPrice, formatDateLong } from "@/utils/format";
import { Skeleton } from "@/components/ui/Skeleton";
import type { PricingApiResponse, CreateReservationRequest } from "@/types/api";

type SubmitStatus = "idle" | "loading" | "conflict" | "error";

// ─── Sub-components ───────────────────────────────────────────

function SummaryCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-5">
      <h3 className="text-white/25 text-[10px] tracking-[0.18em] uppercase font-semibold mb-4">{title}</h3>
      <dl className="flex flex-col gap-2.5">{children}</dl>
    </div>
  );
}

function SummaryRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className={`text-sm ${highlight ? "text-white font-medium" : "text-white/45"}`}>{label}</dt>
      <dd className={`text-sm font-semibold shrink-0 ${highlight ? "text-white" : "text-white/65"}`}>{value}</dd>
    </div>
  );
}

function InputField({
  id, label, value, onChange, placeholder, type = "text", inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-white/40 text-[10px] tracking-[0.16em] uppercase font-semibold">
        {label}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={type === "tel" ? "tel" : "name"}
        className="w-full bg-white/[0.04] border border-white/[0.08] hover:border-white/20 focus:border-white/25 rounded-sm text-white text-sm px-4 py-3.5 outline-none transition-colors placeholder:text-white/20 focus-visible:ring-0"
      />
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────

function SuccessScreen({ reservationId, onReset }: { reservationId: string; onReset: () => void }) {
  const [copied, setCopied] = useState(false);
  const ref = `RCAR-${reservationId.slice(-6).toUpperCase()}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(ref);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API not available — silent fail
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-6 py-12 text-center max-w-sm mx-auto"
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 18, stiffness: 280, delay: 0.1 }}
        className="w-18 h-18 w-[72px] h-[72px] bg-[#25D366] rounded-full flex items-center justify-center"
        aria-hidden="true"
      >
        <span className="text-white text-3xl font-black">✓</span>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-white font-black text-2xl">Reserva Enviada!</h2>
        <p className="text-white/40 text-sm mt-2 leading-relaxed">
          Sua reserva foi registrada. Aguarde a confirmação pelo WhatsApp.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center gap-2"
      >
        <p className="text-white/30 text-[10px] tracking-[0.18em] uppercase">Número de referência</p>
        <button
          onClick={handleCopy}
          aria-label={`Copiar referência ${ref}. ${copied ? "Copiado!" : "Clique para copiar."}`}
          className="flex items-center gap-3 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg px-5 py-3 transition-colors active:scale-[0.97]"
        >
          <span className="text-white font-mono font-bold text-xl tracking-widest">{ref}</span>
          <span className="text-white/30 text-xs transition-all">
            {copied ? "✓ Copiado" : "Copiar"}
          </span>
        </button>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={onReset}
        className="mt-2 px-8 h-11 border border-white/15 text-white/50 hover:text-white hover:border-white/30 active:scale-[0.97] rounded-sm text-sm font-medium transition-all"
      >
        Fazer Nova Reserva
      </motion.button>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────

export function BookingSummary() {
  const router = useRouter();
  const { vehicle, pickupDate, returnDate, rentalDays, insurance, selectedAddons, priceBreakdown, setStep, reset } =
    useBookingStore();
  const addToast = useToastStore((s) => s.add);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [serverPricing, setServerPricing] = useState<PricingApiResponse | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [reservationId, setReservationId] = useState<string | null>(null);

  const addonFingerprint = selectedAddons.map((a) => a.id).sort().join(",");

  // Fetch server-calculated pricing whenever the booking selection changes.
  // Deps are stable primitives — safe to include.
  useEffect(() => {
    if (!vehicle || !pickupDate || !returnDate || !insurance) return;

    let cancelled = false;
    setPricingLoading(true);
    setServerPricing(null);

    fetch("/api/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleId: vehicle.id,
        pickupDate,
        returnDate,
        insuranceType: insurance.id,
        addons: selectedAddons.map((a) => a.id),
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: PricingApiResponse | null) => { if (!cancelled && data) setServerPricing(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setPricingLoading(false); });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle?.id, pickupDate, returnDate, insurance?.id, addonFingerprint]);

  if (reservationId) {
    return (
      <SuccessScreen
        reservationId={reservationId}
        onReset={() => {
          reset();
          router.push("/");
        }}
      />
    );
  }

  if (!vehicle || !pickupDate || !returnDate) {
    return <div className="text-white/30 text-center py-16">Dados incompletos. Volte e preencha todas as etapas.</div>;
  }

  const displayPrice = serverPricing?.total ?? priceBreakdown.total;
  const hasSeasonalSurcharge = serverPricing && serverPricing.seasonalMultiplier > 1;
  const hasDiscount = serverPricing && serverPricing.finalDiscount > 0;
  const canSubmit = customerName.trim().length >= 2 && customerPhone.trim().length >= 8;

  async function handleSubmit() {
    if (!canSubmit || !insurance || !vehicle || !pickupDate || !returnDate) return;

    setSubmitStatus("loading");

    const safePickup = pickupDate;
    const safeReturn = returnDate;
    const safeVehicle = vehicle;

    const payload: CreateReservationRequest = {
      vehicleId: safeVehicle.id,
      pickupDate: safePickup,
      returnDate: safeReturn,
      rentalDays,
      insuranceType: insurance.id,
      addons: selectedAddons.map((a) => a.id),
      subtotal: serverPricing?.vehicleSubtotal ?? priceBreakdown.vehicleSubtotal,
      totalPrice: displayPrice,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
    };

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 409) {
        setSubmitStatus("conflict");
        addToast({ type: "warning", title: "Veículo reservado", message: "Selecione outro veículo ou tente novas datas." });
        return;
      }

      if (!res.ok) {
        setSubmitStatus("error");
        addToast({ type: "error", title: "Erro ao processar", message: "Tente novamente em instantes." });
        return;
      }

      setReservationId(data.id);
      setSubmitStatus("idle");

      addToast({
        type: "success",
        title: "Reserva confirmada!",
        message: `Referência: RCAR-${data.id.slice(-6).toUpperCase()}`,
      });

      const whatsappUrl = buildWhatsAppUrl({
        vehicle: safeVehicle,
        pickupDate: safePickup,
        returnDate: safeReturn,
        rentalDays,
        insurance,
        addons: selectedAddons,
        totalPrice: displayPrice,
        reservationId: data.id,
      });

      setTimeout(() => window.open(whatsappUrl, "_blank", "noopener,noreferrer"), 300);
    } catch {
      setSubmitStatus("error");
      addToast({ type: "error", title: "Falha de conexão", message: "Verifique sua internet e tente novamente." });
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div>
        <h2 className="text-white font-black text-3xl md:text-4xl mb-2">Resumo da reserva</h2>
        <p className="text-white/40">Confirme os detalhes e finalize pelo WhatsApp.</p>
      </div>

      {/* ── Conflict / error inline states ── */}
      <AnimatePresence>
        {submitStatus === "conflict" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4"
          >
            <span className="text-xl mt-0.5" aria-hidden="true">⚠️</span>
            <div>
              <p className="text-white font-semibold text-sm">Veículo indisponível</p>
              <p className="text-white/50 text-xs mt-0.5">O veículo foi reservado. Escolha outro ou altere as datas.</p>
              <button
                onClick={() => { setSubmitStatus("idle"); setStep(2); }}
                className="mt-2 text-white/60 hover:text-white text-xs underline underline-offset-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
              >
                Escolher outro veículo →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Price breakdown ── */}
      <SummaryCard title="Veículo">
        <SummaryRow label="Modelo" value={`${vehicle.brand} ${vehicle.name}`} />
        <SummaryRow label="Diária base" value={formatPrice(vehicle.pricePerDay)} />
        <SummaryRow label={`${rentalDays} dia${rentalDays > 1 ? "s" : ""}`} value={formatPrice(priceBreakdown.vehicleSubtotal)} highlight />
      </SummaryCard>

      <SummaryCard title="Período">
        <SummaryRow label="Retirada"  value={formatDateLong(pickupDate)} />
        <SummaryRow label="Devolução" value={formatDateLong(returnDate)} />
      </SummaryCard>

      {insurance && (
        <SummaryCard title="Cobertura">
          <SummaryRow label={insurance.name} value={priceBreakdown.insuranceCost === 0 ? "Incluso" : formatPrice(priceBreakdown.insuranceCost)} />
        </SummaryCard>
      )}

      {selectedAddons.length > 0 && (
        <SummaryCard title="Adicionais">
          {selectedAddons.map((addon) => (
            <SummaryRow key={addon.id} label={addon.name} value={formatPrice(addon.pricePerDay * rentalDays)} />
          ))}
        </SummaryCard>
      )}

      {(hasSeasonalSurcharge || hasDiscount) && (
        <SummaryCard title="Ajustes de Preço">
          {hasSeasonalSurcharge && serverPricing && (
            <SummaryRow label={`Alta temporada — ${serverPricing.seasonalName}`} value={`×${serverPricing.seasonalMultiplier.toFixed(2)}`} />
          )}
          {hasDiscount && serverPricing && (
            <SummaryRow label="Desconto aplicado" value={`-${Math.round(serverPricing.finalDiscount * 100)}%`} />
          )}
        </SummaryCard>
      )}

      {/* Total */}
      <div className="bg-white/[0.04] border border-white/[0.1] rounded-xl p-5 flex items-center justify-between">
        <span className="text-white/40 text-xs tracking-[0.16em] uppercase">Total</span>
        {pricingLoading ? (
          <Skeleton className="h-9 w-32 rounded" />
        ) : (
          <AnimatePresence mode="wait">
            <motion.span
              key={displayPrice}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18 }}
              aria-live="polite"
              aria-label={`Total: ${formatPrice(displayPrice)}`}
              className="text-white font-black text-3xl tracking-tight"
            >
              {formatPrice(displayPrice)}
            </motion.span>
          </AnimatePresence>
        )}
      </div>

      {/* ── Customer info ── */}
      <fieldset>
        <legend className="text-white/40 text-sm mb-3">
          Informe seus dados para finalizar a reserva:
        </legend>
        <div className="grid sm:grid-cols-2 gap-3">
          <InputField
            id="customer-name"
            label="Seu Nome"
            value={customerName}
            onChange={setCustomerName}
            placeholder="Nome completo"
          />
          <InputField
            id="customer-phone"
            label="WhatsApp"
            value={customerPhone}
            onChange={setCustomerPhone}
            placeholder="(61) 9 9999-9999"
            type="tel"
            inputMode="tel"
          />
        </div>
      </fieldset>

      {/* ── WhatsApp CTA ── */}
      <motion.button
        onClick={handleSubmit}
        disabled={!canSubmit || submitStatus === "loading"}
        whileHover={canSubmit ? { scale: 1.01 } : {}}
        whileTap={canSubmit ? { scale: 0.98 } : {}}
        aria-busy={submitStatus === "loading"}
        aria-disabled={!canSubmit}
        className="flex items-center justify-center gap-3 w-full h-14 bg-[#25D366] hover:bg-[#1eb558] text-white font-bold text-base rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#25D366]/60 focus-visible:outline-none"
      >
        {submitStatus === "loading" ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
            Processando...
          </>
        ) : (
          <>
            <span className="text-xl" aria-hidden="true">💬</span>
            Finalizar pelo WhatsApp
          </>
        )}
      </motion.button>

      {!canSubmit && (customerName || customerPhone) && (
        <p role="status" className="text-white/25 text-xs text-center">
          Preencha seu nome (mín. 2 caracteres) e WhatsApp (mín. 8 dígitos).
        </p>
      )}

      <p className="text-white/20 text-[11px] text-center">
        Sua reserva será salva e você será redirecionado ao WhatsApp.
        Nenhuma cobrança é feita nesta etapa.
      </p>
    </div>
  );
}
