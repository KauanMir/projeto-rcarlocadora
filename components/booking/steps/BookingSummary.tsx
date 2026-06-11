"use client";

import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Check, AlertTriangle,
  Car, CalendarDays, Shield, Package,
  MapPinned, Baby, UserRoundPlus, Wifi,
  type LucideIcon,
} from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";
import { useToastStore } from "@/store/toastStore";
import { CouponCard } from "@/components/booking/CouponCard";
import { buildWhatsAppUrl } from "@/utils/whatsapp";
import { formatPrice, formatDateLong } from "@/utils/format";
import { Skeleton } from "@/components/ui/Skeleton";
import type { CreateReservationRequest } from "@/types/api";

// ─── WhatsApp SVG icon ────────────────────────────────────────

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Addon icons ──────────────────────────────────────────────

const ADDON_ICONS: Record<string, LucideIcon> = {
  MapPinned, Baby, UserRoundPlus, Wifi,
};

// ─── Vehicle category labels ──────────────────────────────────

const VEHICLE_CATEGORY_MAP: Record<string, string> = {
  economy: "Econômico", ECONOMY: "Econômico",
  sedan: "Sedan",       SEDAN: "Sedan",
  suv: "SUV",           SUV: "SUV",
  premium: "Premium",   PREMIUM: "Premium",
  pickup: "Picape",     PICKUP: "Picape",
  minivan: "Minivan",   MINIVAN: "Minivan",
};

// ─── SummaryCard ──────────────────────────────────────────────

function SummaryCard({
  icon: Icon, title, children,
}: {
  icon: LucideIcon; title: string; children: ReactNode;
}) {
  return (
    <div style={{
      background: "var(--ink-card)",
      border: "1px solid var(--ink-line)",
      borderRadius: "var(--r-md)",
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "11px 18px",
        borderBottom: "1px solid var(--ink-line)",
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: "var(--r-xs)",
          background: "var(--gold-tint)",
          border: "1px solid rgba(255,184,0,0.2)",
          display: "grid", placeItems: "center",
          color: "var(--gold)", flexShrink: 0,
        }}>
          <Icon size={13} />
        </div>
        <span style={{
          color: "var(--d-3)", fontSize: 9.5, fontWeight: 700,
          letterSpacing: "0.18em", textTransform: "uppercase",
          fontFamily: "var(--font-body)",
        }}>
          {title}
        </span>
      </div>
      <div style={{ padding: "14px 18px" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Shared form styles ───────────────────────────────────────

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

// ─── InputField ───────────────────────────────────────────────

function InputField({
  id, label, value, onChange, placeholder, type = "text", inputMode,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  placeholder: string; type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label htmlFor={id} style={labelStyle}>{label}</label>
      <input
        id={id} type={type} inputMode={inputMode}
        value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={type === "tel" ? "tel" : "name"}
        style={inputStyle}
      />
    </div>
  );
}

// ─── SuccessScreen ────────────────────────────────────────────

function SuccessScreen({ reservationId, onReset }: { reservationId: string; onReset: () => void }) {
  const [copied, setCopied] = useState(false);
  const ref = `RCAR-${reservationId.slice(-6).toUpperCase()}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(ref);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API unavailable
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
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, color: "#fff", letterSpacing: "-0.02em" }}>
          Reserva Enviada!
        </h2>
        <p style={{ color: "var(--d-2)", fontSize: 14.5, marginTop: 8, lineHeight: 1.6 }}>
          Sua reserva foi registrada. Aguarde a confirmação pelo WhatsApp.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
      >
        <p style={{ color: "var(--d-3)", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "var(--font-body)", fontWeight: 700 }}>
          Número de referência
        </p>
        <button
          onClick={handleCopy}
          aria-label={`${copied ? "Copiado!" : "Clique para copiar"} referência ${ref}`}
          style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--ink-card)", border: "1px solid var(--ink-line-2)", borderRadius: "var(--r-md)", padding: "14px 22px", cursor: "pointer", transition: "background .2s" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--ink-card-2)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--ink-card)")}
        >
          <span style={{ color: "var(--gold)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, letterSpacing: "0.12em" }}>
            {ref}
          </span>
          <span style={{ color: copied ? "#34d399" : "var(--d-3)", fontSize: 12, transition: "color .25s" }}>
            {copied ? "Copiado" : "Copiar"}
          </span>
        </button>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        onClick={onReset}
        style={{ marginTop: 8, padding: "0 28px", height: 42, border: "1px solid var(--ink-line-2)", color: "var(--d-1)", borderRadius: "var(--r-sm)", fontSize: 13.5, fontWeight: 600, fontFamily: "var(--font-display)", cursor: "pointer", background: "transparent", transition: "all .2s" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "var(--d-3)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--d-1)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--ink-line-2)"; }}
      >
        Fazer Nova Reserva
      </motion.button>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────

type SubmitStatus = "idle" | "loading" | "conflict" | "error";

export function BookingSummary() {
  const router = useRouter();
  const {
    vehicle, pickupDate, returnDate, rentalDays,
    insurance, selectedAddons, priceBreakdown,
    setStep, reset,
    serverPricing, serverPricingLoading: pricingLoading,
    appliedCoupon,
  } = useBookingStore();
  const addToast = useToastStore((s) => s.add);

  const [customerName,  setCustomerName]  = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [submitStatus,  setSubmitStatus]  = useState<SubmitStatus>("idle");
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
  const canSubmit    = customerName.trim().length >= 2 && customerPhone.trim().length >= 8;

  async function handleSubmit() {
    if (!canSubmit || !insurance || !vehicle || !pickupDate || !returnDate) return;
    setSubmitStatus("loading");

    const safePickup  = pickupDate;
    const safeReturn  = returnDate;
    const safeVehicle = vehicle;

    const payload: CreateReservationRequest = {
      vehicleId:     safeVehicle.id,
      pickupDate:    safePickup,
      returnDate:    safeReturn,
      rentalDays,
      insuranceType: insurance.id,
      addons:        selectedAddons.map((a) => a.id),
      subtotal:      serverPricing?.vehicleSubtotal ?? priceBreakdown.vehicleSubtotal,
      totalPrice:    displayPrice,
      customerName:  customerName.trim(),
      customerPhone: customerPhone.trim(),
      ...(appliedCoupon
        ? { couponCode: appliedCoupon.code, couponDiscount: serverPricing?.couponDiscount ?? 0 }
        : {}),
    };

    try {
      const res  = await fetch("/api/reservations", {
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
      addToast({ type: "success", title: "Reserva confirmada!", message: `Referência: RCAR-${data.id.slice(-6).toUpperCase()}` });

      const whatsappUrl = buildWhatsAppUrl({
        vehicle: safeVehicle, pickupDate: safePickup, returnDate: safeReturn,
        rentalDays, insurance, addons: selectedAddons,
        totalPrice: displayPrice, reservationId: data.id,
      });
      setTimeout(() => window.open(whatsappUrl, "_blank", "noopener,noreferrer"), 300);
    } catch {
      setSubmitStatus("error");
      addToast({ type: "error", title: "Falha de conexão", message: "Verifique sua internet e tente novamente." });
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 600 }}>

      {/* ── Heading ──────────────────────────────────────────── */}
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
        <p style={{ color: "var(--d-2)", fontSize: 15 }}>
          Confirme os detalhes e finalize pelo WhatsApp.
        </p>
      </div>

      {/* ── Conflict alert ────────────────────────────────────── */}
      <AnimatePresence>
        {submitStatus === "conflict" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            role="alert"
            style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)", borderRadius: "var(--r-md)", padding: "14px 16px" }}
          >
            <AlertTriangle size={18} style={{ color: "#fbbf24", flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ color: "#fff", fontWeight: 600, fontSize: 13.5 }}>Veículo indisponível</p>
              <p style={{ color: "var(--d-2)", fontSize: 12.5, marginTop: 2 }}>
                O veículo foi reservado. Escolha outro ou altere as datas.
              </p>
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

      {/* ── Veículo ──────────────────────────────────────────── */}
      <SummaryCard icon={Car} title="Veículo">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <div style={{ color: "#fff", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, lineHeight: 1.2 }}>
              {vehicle.brand} {vehicle.name}
            </div>
            <div style={{ color: "var(--d-3)", fontSize: 11.5, marginTop: 3 }}>
              {VEHICLE_CATEGORY_MAP[vehicle.category] ?? vehicle.category} · {vehicle.year}
            </div>
          </div>
          <div style={{ paddingTop: 10, borderTop: "1px solid var(--ink-line)", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--d-3)", fontSize: 12 }}>Diária</span>
              <span style={{ color: "var(--d-1)", fontSize: 12.5, fontWeight: 600 }}>
                {formatPrice(vehicle.pricePerDay)}/dia
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--d-2)", fontSize: 13, fontWeight: 600 }}>
                {rentalDays} dia{rentalDays !== 1 ? "s" : ""}
              </span>
              <span style={{ color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "var(--font-display)" }}>
                {formatPrice(priceBreakdown.vehicleSubtotal)}
              </span>
            </div>
          </div>
        </div>
      </SummaryCard>

      {/* ── Período ──────────────────────────────────────────── */}
      <SummaryCard icon={CalendarDays} title="Período">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "var(--d-3)", fontSize: 12.5 }}>Retirada</span>
            <span style={{ color: "#fff", fontSize: 13.5, fontWeight: 700 }}>
              {formatDateLong(pickupDate)}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "var(--d-3)", fontSize: 12.5 }}>Devolução</span>
            <span style={{ color: "#fff", fontSize: 13.5, fontWeight: 700 }}>
              {formatDateLong(returnDate)}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 8, marginTop: 2, borderTop: "1px solid var(--ink-line)" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "var(--gold-tint)",
              border: "1px solid rgba(255,184,0,0.25)",
              borderRadius: "var(--r-pill)",
              padding: "5px 16px",
              color: "var(--gold)", fontSize: 11.5, fontWeight: 700,
              fontFamily: "var(--font-display)",
            }}>
              {rentalDays} dia{rentalDays !== 1 ? "s" : ""} de locação
            </span>
          </div>
        </div>
      </SummaryCard>

      {/* ── Cobertura ────────────────────────────────────────── */}
      {insurance && (
        <SummaryCard icon={Shield} title="Cobertura">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <div style={{ color: "#fff", fontSize: 14.5, fontWeight: 700 }}>{insurance.name}</div>
              <div style={{ color: "var(--d-3)", fontSize: 11.5, marginTop: 2 }}>{insurance.description}</div>
            </div>
            {priceBreakdown.insuranceCost === 0 ? (
              <span style={{ color: "#34d399", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>Incluso</span>
            ) : (
              <span style={{ color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "var(--font-display)", flexShrink: 0 }}>
                {formatPrice(priceBreakdown.insuranceCost)}
              </span>
            )}
          </div>
        </SummaryCard>
      )}

      {/* ── Adicionais ───────────────────────────────────────── */}
      {selectedAddons.length > 0 && (
        <SummaryCard icon={Package} title="Adicionais">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {selectedAddons.map((addon) => {
              const AddonIcon = ADDON_ICONS[addon.icon] ?? Package;
              return (
                <div key={addon.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: "var(--r-xs)",
                    background: "rgba(255,184,0,0.07)",
                    border: "1px solid rgba(255,184,0,0.15)",
                    display: "grid", placeItems: "center", flexShrink: 0,
                  }}>
                    <AddonIcon size={14} style={{ color: "var(--gold)" }} />
                  </div>
                  <span style={{ flex: 1, color: "var(--d-1)", fontSize: 13 }}>{addon.name}</span>
                  <span style={{ color: "#fff", fontSize: 13.5, fontWeight: 700, flexShrink: 0 }}>
                    {formatPrice(addon.pricePerDay * rentalDays)}
                  </span>
                </div>
              );
            })}
          </div>
        </SummaryCard>
      )}

      {/* ── Total estimado ───────────────────────────────────── */}
      <div style={{ marginTop: 4, padding: 2, borderRadius: "calc(var(--r-md) + 2px)", background: "linear-gradient(135deg, rgba(255,184,0,0.60), rgba(255,184,0,0.08) 55%)", boxShadow: "0 0 56px rgba(255,184,0,0.12), 0 8px 32px rgba(0,0,0,0.45)" }}>
        <div style={{ background: "linear-gradient(160deg, rgba(20,20,24,0.98), rgba(12,12,16,0.99))", borderRadius: "var(--r-md)", padding: "24px 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, textAlign: "center" }}>
          <span style={{ color: "var(--d-3)", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
            Total estimado
          </span>
          {pricingLoading ? (
            <Skeleton className="h-14 w-44 rounded mt-2" />
          ) : (
            <AnimatePresence mode="wait">
              <motion.span
                key={displayPrice}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18 }}
                aria-live="polite"
                style={{ color: "var(--gold)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 44, letterSpacing: "-0.03em", lineHeight: 1, marginTop: 8, marginBottom: 2 }}
              >
                {formatPrice(displayPrice)}
              </motion.span>
            </AnimatePresence>
          )}
          <span style={{ color: "var(--d-4)", fontSize: 11, lineHeight: 1.4 }}>
            Valor total da locação
          </span>
        </div>
      </div>

      {/* ── Cupom (mobile only — desktop shows it in the sidebar) ── */}
      <div className="booking-coupon-mobile">
        <CouponCard />
      </div>

      {/* ── Dados do cliente ─────────────────────────────────── */}
      <div style={{ background: "var(--ink-card)", border: "1px solid var(--ink-line)", borderRadius: "var(--r-md)", padding: "18px 20px" }}>
        <p style={{ color: "var(--d-2)", fontSize: 13, marginBottom: 14 }}>
          Informe seus dados para finalizar a reserva:
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <InputField
            id="customer-name" label="Seu Nome"
            value={customerName} onChange={setCustomerName}
            placeholder="Nome completo"
          />
          <InputField
            id="customer-phone" label="WhatsApp"
            value={customerPhone} onChange={setCustomerPhone}
            placeholder="(61) 9 9999-9999"
            type="tel" inputMode="tel"
          />
        </div>
      </div>

      {/* ── WhatsApp CTA ──────────────────────────────────────── */}
      <motion.button
        onClick={handleSubmit}
        disabled={!canSubmit || submitStatus === "loading"}
        whileHover={canSubmit ? { scale: 1.015 } : {}}
        whileTap={canSubmit ? { scale: 0.985 } : {}}
        aria-busy={submitStatus === "loading"}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
          width: "100%", height: 58,
          borderRadius: "var(--r-sm)",
          background: "var(--wa)", color: "#fff",
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16,
          transition: "background .18s, box-shadow .18s",
          boxShadow: canSubmit ? "0 10px 30px rgba(37,211,102,0.30)" : "none",
          opacity: !canSubmit || submitStatus === "loading" ? 0.45 : 1,
          cursor: !canSubmit || submitStatus === "loading" ? "not-allowed" : "pointer",
          border: "none",
        }}
        onMouseEnter={(e) => {
          if (!canSubmit) return;
          (e.currentTarget as HTMLElement).style.background = "var(--wa-deep)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 14px 42px rgba(37,211,102,0.42)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "var(--wa)";
          (e.currentTarget as HTMLElement).style.boxShadow = canSubmit ? "0 10px 30px rgba(37,211,102,0.30)" : "none";
        }}
      >
        {submitStatus === "loading" ? (
          <>
            <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} aria-hidden />
            Processando…
          </>
        ) : (
          <>
            <WhatsAppIcon size={20} />
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
