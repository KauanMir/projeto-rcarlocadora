"use client";

import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Check, MessageCircle, AlertTriangle } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";
import { useToastStore } from "@/store/toastStore";
import { buildWhatsAppUrl } from "@/utils/whatsapp";
import { formatPrice, formatDateLong } from "@/utils/format";
import { Skeleton } from "@/components/ui/Skeleton";
import type { CreateReservationRequest } from "@/types/api";

type SubmitStatus = "idle" | "loading" | "conflict" | "error";

// ─── Sub-components ───────────────────────────────────────────

function SummaryCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      style={{
        background: "var(--ink-card)",
        border: "1px solid var(--ink-line)",
        borderRadius: "var(--r-md)",
        padding: "18px 20px",
      }}
    >
      <h3
        style={{
          color: "var(--d-3)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          marginBottom: 14,
          fontFamily: "var(--font-body)",
        }}
      >
        {title}
      </h3>
      <dl style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</dl>
    </div>
  );
}

function SummaryRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
      <dt style={{ fontSize: 13.5, color: highlight ? "var(--d-fg)" : "var(--d-2)", fontWeight: highlight ? 600 : 400 }}>{label}</dt>
      <dd style={{ fontSize: 13.5, fontWeight: 600, flexShrink: 0, color: highlight ? "#fff" : "var(--d-1)" }}>{value}</dd>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid var(--ink-line-2)",
  borderRadius: "var(--r-sm)",
  color: "#fff",
  fontSize: 14.5,
  padding: "13px 14px",
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
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label htmlFor={id} style={labelStyle}>{label}</label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={type === "tel" ? "tel" : "name"}
        style={inputStyle}
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
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: "48px 0", textAlign: "center", maxWidth: 400, margin: "0 auto" }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -12 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 16, stiffness: 260, delay: 0.1 }}
        style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--wa)", display: "grid", placeItems: "center" }}
      >
        <Check size={32} strokeWidth={3} style={{ color: "#fff" }} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, color: "#fff", letterSpacing: "-0.02em" }}>Reserva Enviada!</h2>
        <p style={{ color: "var(--d-2)", fontSize: 14.5, marginTop: 8, lineHeight: 1.6 }}>
          Sua reserva foi registrada. Aguarde a confirmação pelo WhatsApp.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <p style={{ color: "var(--d-3)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "var(--font-body)", fontWeight: 700 }}>
          Número de referência
        </p>
        <button
          onClick={handleCopy}
          aria-label={`Copiar referência ${ref}. ${copied ? "Copiado!" : "Clique para copiar."}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: "var(--ink-card)",
            border: "1px solid var(--ink-line-2)",
            borderRadius: "var(--r-md)",
            padding: "14px 22px",
            cursor: "pointer",
            transition: "background .2s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--ink-card-2)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--ink-card)")}
        >
          <span style={{ color: "var(--gold)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, letterSpacing: "0.12em" }}>{ref}</span>
          <span style={{ color: copied ? "#34d399" : "var(--d-3)", fontSize: 12, transition: "color .25s" }}>
            {copied ? "✓ Copiado" : "Copiar"}
          </span>
        </button>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={onReset}
        style={{
          marginTop: 8,
          padding: "0 28px",
          height: 42,
          border: "1px solid var(--ink-line-2)",
          color: "var(--d-1)",
          borderRadius: "var(--r-sm)",
          fontSize: 13.5,
          fontWeight: 600,
          fontFamily: "var(--font-display)",
          cursor: "pointer",
          background: "transparent",
          transition: "all .2s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "var(--d-3)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--d-1)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--ink-line-2)"; }}
      >
        Fazer Nova Reserva
      </motion.button>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────

export function BookingSummary() {
  const router = useRouter();
  const { vehicle, pickupDate, returnDate, rentalDays, insurance, selectedAddons, priceBreakdown, setStep, reset, serverPricing, serverPricingLoading: pricingLoading } =
    useBookingStore();
  const addToast = useToastStore((s) => s.add);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [reservationId, setReservationId] = useState<string | null>(null);

  if (reservationId) {
    return (
      <SuccessScreen
        reservationId={reservationId}
        onReset={() => { reset(); router.push("/"); }}
      />
    );
  }

  if (!vehicle || !pickupDate || !returnDate) {
    return (
      <div style={{ color: "var(--d-3)", textAlign: "center", padding: "64px 0" }}>
        Dados incompletos. Volte e preencha todas as etapas.
      </div>
    );
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
    <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 600 }}>
      {/* Heading */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ width: 22, height: 2, background: "var(--gold)", borderRadius: 2 }} />
          <span style={{ color: "var(--gold)", fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
            Etapa 5
          </span>
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.9rem, 4vw, 2.8rem)", color: "#fff", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 10 }}>
          Resumo da reserva
        </h2>
        <p style={{ color: "var(--d-2)", fontSize: 15 }}>Confirme os detalhes e finalize pelo WhatsApp.</p>
      </div>

      {/* Conflict alert */}
      <AnimatePresence>
        {submitStatus === "conflict" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              background: "rgba(251,191,36,0.08)",
              border: "1px solid rgba(251,191,36,0.25)",
              borderRadius: "var(--r-md)",
              padding: "14px 16px",
            }}
          >
            <AlertTriangle size={18} style={{ color: "#fbbf24", flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ color: "#fff", fontWeight: 600, fontSize: 13.5 }}>Veículo indisponível</p>
              <p style={{ color: "var(--d-2)", fontSize: 12.5, marginTop: 2 }}>O veículo foi reservado. Escolha outro ou altere as datas.</p>
              <button
                onClick={() => { setSubmitStatus("idle"); setStep(2); }}
                style={{ marginTop: 6, color: "var(--gold)", fontSize: 12, fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                Escolher outro veículo →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary cards */}
      <SummaryCard title="Veículo">
        <SummaryRow label="Modelo" value={`${vehicle.brand} ${vehicle.name}`} />
        <SummaryRow label="Diária base" value={formatPrice(vehicle.pricePerDay)} />
        <SummaryRow label={`${rentalDays} dia${rentalDays > 1 ? "s" : ""}`} value={formatPrice(priceBreakdown.vehicleSubtotal)} highlight />
      </SummaryCard>

      <SummaryCard title="Período">
        <SummaryRow label="Retirada" value={formatDateLong(pickupDate)} />
        <SummaryRow label="Devolução" value={formatDateLong(returnDate)} />
      </SummaryCard>

      {insurance && (
        <SummaryCard title="Cobertura">
          <SummaryRow
            label={insurance.name}
            value={priceBreakdown.insuranceCost === 0 ? "Incluso" : formatPrice(priceBreakdown.insuranceCost)}
          />
        </SummaryCard>
      )}

      {selectedAddons.length > 0 && (
        <SummaryCard title="Adicionais">
          {selectedAddons.map((addon) => (
            <SummaryRow key={addon.id} label={addon.name} value={formatPrice(addon.pricePerDay * rentalDays)} />
          ))}
        </SummaryCard>
      )}

      {(hasSeasonalSurcharge || hasDiscount) && serverPricing && (
        <SummaryCard title="Ajustes de Preço">
          {hasSeasonalSurcharge && (
            <SummaryRow
              label={`Alta temporada — ${serverPricing.seasonalName} (+${Math.round((serverPricing.seasonalMultiplier - 1) * 100)}%)`}
              value={`+${formatPrice(Math.round(serverPricing.vehicleSubtotal * (serverPricing.seasonalMultiplier - 1)))}`}
            />
          )}
          {hasDiscount && (
            <SummaryRow
              label={`Desconto antecipado (−${Math.round(serverPricing.finalDiscount * 100)}%)`}
              value={`−${formatPrice(Math.round(serverPricing.vehicleSubtotal * serverPricing.seasonalMultiplier * serverPricing.finalDiscount))}`}
            />
          )}
        </SummaryCard>
      )}

      {/* Total */}
      <div
        style={{
          padding: 2,
          borderRadius: "calc(var(--r-md) + 2px)",
          background: "linear-gradient(135deg, rgba(255,184,0,0.5), rgba(255,184,0,0.05) 60%)",
        }}
      >
        <div
          style={{
            background: "var(--ink-card)",
            borderRadius: "var(--r-md)",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ color: "var(--d-2)", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
            Total estimado
          </span>
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
                style={{
                  color: "var(--gold)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 32,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                {formatPrice(displayPrice)}
              </motion.span>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Customer info */}
      <div
        style={{
          background: "var(--ink-card)",
          border: "1px solid var(--ink-line)",
          borderRadius: "var(--r-md)",
          padding: "18px 20px",
        }}
      >
        <p style={{ color: "var(--d-2)", fontSize: 13, marginBottom: 14 }}>
          Informe seus dados para finalizar a reserva:
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
      </div>

      {/* WhatsApp CTA */}
      <motion.button
        onClick={handleSubmit}
        disabled={!canSubmit || submitStatus === "loading"}
        whileHover={canSubmit ? { scale: 1.015 } : {}}
        whileTap={canSubmit ? { scale: 0.985 } : {}}
        aria-busy={submitStatus === "loading"}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          width: "100%",
          height: 58,
          borderRadius: "var(--r-sm)",
          background: "var(--wa)",
          color: "#fff",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 16,
          transition: "background .18s, box-shadow .18s",
          boxShadow: canSubmit ? "0 10px 30px rgba(37,211,102,0.3)" : "none",
          opacity: !canSubmit || submitStatus === "loading" ? 0.45 : 1,
          cursor: !canSubmit || submitStatus === "loading" ? "not-allowed" : "pointer",
          border: "none",
        }}
        onMouseEnter={(e) => { if (canSubmit) (e.currentTarget as HTMLElement).style.background = "var(--wa-deep)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--wa)"; }}
      >
        {submitStatus === "loading" ? (
          <>
            <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} aria-hidden />
            Processando…
          </>
        ) : (
          <>
            <MessageCircle size={20} />
            Finalizar pelo WhatsApp
          </>
        )}
      </motion.button>

      {!canSubmit && (customerName || customerPhone) && (
        <p role="status" style={{ color: "var(--d-3)", fontSize: 12, textAlign: "center" }}>
          Preencha seu nome (mín. 2 caracteres) e WhatsApp (mín. 8 dígitos).
        </p>
      )}

      <p style={{ color: "var(--d-4)", fontSize: 11.5, textAlign: "center", lineHeight: 1.6 }}>
        Sua reserva será salva e você será redirecionado ao WhatsApp.
        Nenhuma cobrança é feita nesta etapa.
      </p>
    </div>
  );
}
