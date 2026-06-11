"use client";

import { useState } from "react";
import { Tag, Check, X } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";
import { formatPrice } from "@/utils/format";
import type { CouponValidateResponse } from "@/types/api";

// ─── CouponField ──────────────────────────────────────────────

function CouponField() {
  const {
    rentalDays, vehicle,
    appliedCoupon, setAppliedCoupon,
    serverPricing,
  } = useBookingStore();
  const [inputCode, setInputCode] = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  async function handleApply() {
    const code = inputCode.trim().toUpperCase();
    if (!code) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, rentalDays, vehicleCategory: vehicle?.category ?? undefined }),
      });
      if (res.ok) {
        const coupon = (await res.json()) as CouponValidateResponse;
        setAppliedCoupon(coupon);
        setInputCode("");
      } else {
        const e = await res.json().catch(() => ({}));
        setError((e as { error?: string }).error ?? "Cupom inválido.");
      }
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // ── Applied ────────────────────────────────────────────────
  if (appliedCoupon) {
    const discount = serverPricing?.couponDiscount ?? 0;
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(167,139,250,0.08)",
          border: "1px solid rgba(167,139,250,0.25)",
          borderRadius: discount > 0 ? "var(--r-sm) var(--r-sm) 0 0" : "var(--r-sm)",
          padding: "9px 12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Check size={12} strokeWidth={3} style={{ color: "#a78bfa", flexShrink: 0 }} />
            <span style={{ color: "#a78bfa", fontWeight: 800, fontSize: 12.5, letterSpacing: "0.06em", fontFamily: "var(--font-display)" }}>
              {appliedCoupon.code}
            </span>
            <span style={{ color: "rgba(167,139,250,0.55)", fontSize: 10.5 }}>
              {appliedCoupon.type === "PERCENTAGE"
                ? `${appliedCoupon.value}% off`
                : `${formatPrice(appliedCoupon.value)} off`}
            </span>
          </div>
          <button
            onClick={() => setAppliedCoupon(null)}
            aria-label="Remover cupom"
            style={{ color: "var(--d-3)", background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", transition: "color .15s" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--d-3)")}
          >
            <X size={13} />
          </button>
        </div>

        {discount > 0 && (
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "rgba(167,139,250,0.04)",
            border: "1px solid rgba(167,139,250,0.15)",
            borderTop: "none",
            borderRadius: "0 0 var(--r-sm) var(--r-sm)",
            padding: "7px 12px",
          }}>
            <span style={{ color: "rgba(167,139,250,0.55)", fontSize: 11 }}>Desconto</span>
            <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: 12.5, fontFamily: "var(--font-display)" }}>
              −{formatPrice(discount)}
            </span>
          </div>
        )}
      </div>
    );
  }

  // ── Input ──────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={inputCode}
          onChange={(e) => { setInputCode(e.target.value.toUpperCase()); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleApply(); }}
          placeholder="Código do cupom"
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--ink-line-2)",
            borderRadius: "var(--r-sm)",
            color: "#fff", fontSize: 13,
            padding: "9px 12px", outline: "none",
            fontFamily: "var(--font-body)",
            letterSpacing: "0.06em", fontWeight: 600,
          }}
        />
        <button
          onClick={handleApply}
          disabled={loading || !inputCode.trim()}
          style={{
            height: 38, padding: "0 14px", flexShrink: 0,
            background: loading || !inputCode.trim() ? "transparent" : "var(--gold)",
            border: `1px solid ${loading || !inputCode.trim() ? "var(--ink-line-2)" : "var(--gold)"}`,
            borderRadius: "var(--r-sm)",
            color: loading || !inputCode.trim() ? "var(--d-3)" : "#181203",
            fontSize: 12, fontWeight: 700,
            fontFamily: "var(--font-display)",
            cursor: loading || !inputCode.trim() ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "all .2s",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          {loading
            ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            : "Aplicar"}
        </button>
      </div>
      {error && <p role="alert" style={{ color: "#f87171", fontSize: 11.5 }}>{error}</p>}
    </div>
  );
}

// ─── CouponCard ───────────────────────────────────────────────

export function CouponCard() {
  return (
    <div style={{
      borderRadius: "calc(var(--r-md) + 4px)",
      padding: 2,
      background: "linear-gradient(160deg, rgba(255,184,0,0.20), rgba(255,184,0,0.02) 50%, rgba(255,255,255,0.03))",
      boxShadow: "0 8px 24px rgba(0,0,0,0.30)",
    }}>
      <div style={{
        background: "linear-gradient(180deg, var(--ink-card) 0%, var(--ink-2) 100%)",
        borderRadius: "var(--r-md)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "14px 18px",
          borderBottom: "1px solid var(--ink-line)",
          display: "flex", alignItems: "center", gap: 9,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "var(--r-xs)",
            background: "rgba(167,139,250,0.10)",
            border: "1px solid rgba(167,139,250,0.20)",
            display: "grid", placeItems: "center",
            color: "#a78bfa", flexShrink: 0,
          }}>
            <Tag size={13} />
          </div>
          <span style={{
            color: "var(--d-2)", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.16em", textTransform: "uppercase",
            fontFamily: "var(--font-body)",
          }}>
            Cupom de desconto
          </span>
        </div>

        {/* Body */}
        <div style={{ padding: "14px 18px" }}>
          <CouponField />
        </div>
      </div>
    </div>
  );
}
