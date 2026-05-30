"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ArrowRight, ArrowLeft, Star } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";
import { todayLocal } from "@/utils/dates";
import { SHOWROOM_CATEGORIES, HERO_STATS } from "@/utils/constants";
import { formatPrice } from "@/utils/format";

const CAROUSEL_IDS = [
  "suv-especial",
  "picape-especial",
  "picape-luxo",
  "intermediario-automatico",
  "economico-especial",
  "minivan-automatica",
];

const CAROUSEL_FLEET = CAROUSEL_IDS
  .map((id) => SHOWROOM_CATEGORIES.find((c) => c.id === id))
  .filter(Boolean) as typeof SHOWROOM_CATEGORIES;

function VehicleCarousel() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = CAROUSEL_FLEET.length;

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % n), 6000);
    return () => clearInterval(t);
  }, [paused, n]);

  const go = (d: number) => setIdx((i) => (i + d + n) % n);
  const cur = CAROUSEL_FLEET[idx];

  const arrowStyle: React.CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid var(--ink-line-2)",
    color: "#fff",
    backdropFilter: "blur(8px)",
    transition: "all .25s",
    cursor: "pointer",
    flexShrink: 0,
  };

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 420 }}
    >
      {/* Category label + price */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 4, minHeight: 78 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            {cur.tag && (
              <span style={{ background: "var(--gold)", color: "#181203", fontSize: 9.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 9px", borderRadius: "var(--r-xs)" }}>
                {cur.tag}
              </span>
            )}
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--d-2)" }}>
              Categoria {String(idx + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </span>
          </div>
          <h3 style={{ color: "#fff", fontSize: 26, marginTop: 10, fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
            {cur.name}
          </h3>
          <p style={{ color: "var(--d-2)", fontSize: 13.5, marginTop: 4 }}>
            {cur.models.slice(0, 3).join(" · ")}
          </p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ color: "var(--d-3)", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>a partir de</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--gold)", lineHeight: 1.1 }}>
            {formatPrice(cur.pricePerDay)}<span style={{ fontSize: 13, color: "var(--d-3)", fontWeight: 400 }}>/dia</span>
          </div>
        </div>
      </div>

      {/* Car stage */}
      <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        {/* Gold glow */}
        <div style={{ position: "absolute", width: "94%", height: "62%", borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(255,184,0,0.16), transparent 64%)", filter: "blur(10px)", pointerEvents: "none" }} />
        {/* RCAR watermark */}
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(80px, 16vw, 180px)", color: "rgba(255,255,255,0.022)", letterSpacing: "-0.04em", userSelect: "none" }}>RCAR</div>

        {/* Vehicle images — crossfade */}
        <div style={{ position: "relative", width: "100%", maxWidth: 520, aspectRatio: "16 / 10" }}>
          <div className="animate-floaty" style={{ position: "absolute", inset: 0 }}>
            {CAROUSEL_FLEET.map((v, i) => (
              v.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={v.id}
                  src={v.image}
                  alt={v.name}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    filter: "drop-shadow(0 38px 46px rgba(0,0,0,0.7))",
                    opacity: i === idx ? 1 : 0,
                    transform: i === idx ? "scale(1)" : "scale(0.965)",
                    transition: "opacity .8s cubic-bezier(0.4,0,0.2,1), transform .9s cubic-bezier(0.22,1,0.36,1)",
                    pointerEvents: "none",
                  }}
                />
              )
            ))}
          </div>
        </div>

        {/* Ground shadow */}
        <div style={{ position: "absolute", bottom: "10%", width: "60%", height: 24, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,0,0,0.6), transparent 70%)", filter: "blur(8px)", pointerEvents: "none" }} />
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginTop: 6 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => go(-1)}
            style={arrowStyle}
            aria-label="Anterior"
            onMouseEnter={(e) => { const el = e.currentTarget; el.style.background = "var(--gold)"; el.style.color = "#181203"; el.style.borderColor = "var(--gold)"; }}
            onMouseLeave={(e) => { const el = e.currentTarget; el.style.background = "rgba(255,255,255,0.06)"; el.style.color = "#fff"; el.style.borderColor = "var(--ink-line-2)"; }}
          >
            <ArrowLeft size={18} />
          </button>
          <button
            onClick={() => go(1)}
            style={arrowStyle}
            aria-label="Próximo"
            onMouseEnter={(e) => { const el = e.currentTarget; el.style.background = "var(--gold)"; el.style.color = "#181203"; el.style.borderColor = "var(--gold)"; }}
            onMouseLeave={(e) => { const el = e.currentTarget; el.style.background = "rgba(255,255,255,0.06)"; el.style.color = "#fff"; el.style.borderColor = "var(--ink-line-2)"; }}
          >
            <ArrowRight size={18} />
          </button>
        </div>
        <div style={{ display: "flex", gap: 7 }}>
          {CAROUSEL_FLEET.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Veículo ${i + 1}`}
              style={{
                width: i === idx ? 26 : 8,
                height: 8,
                borderRadius: "var(--r-pill)",
                background: i === idx ? "var(--gold)" : "rgba(255,255,255,0.18)",
                transition: "all .4s cubic-bezier(0.22,1,0.36,1)",
                padding: 0,
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroBookingCard() {
  const router = useRouter();
  const { setPickupDate, setReturnDate, setStep } = useBookingStore();
  const [pickup, setPickup] = useState("");
  const [ret, setRet] = useState("");
  const [category, setCategory] = useState("");
  const today = todayLocal();

  function handleSearch() {
    if (pickup) setPickupDate(pickup);
    if (ret) setReturnDate(ret);
    setStep(pickup && ret ? 2 : 1);
    const query = category ? `?category=${category}` : "";
    router.push(`/booking${query}`);
  }

  const fieldStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid var(--ink-line-2)",
    borderRadius: "var(--r-sm)",
    color: "#fff",
    fontSize: 14.5,
    padding: "14px 14px",
    outline: "none",
    width: "100%",
    colorScheme: "dark",
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    transition: "border-color .2s",
  };

  const labelStyle: React.CSSProperties = {
    color: "var(--d-2)",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    marginBottom: 8,
    display: "block",
  };

  return (
    /* gradient border wrapper */
    <div style={{
      position: "relative",
      borderRadius: "calc(var(--r-md) + 4px)",
      padding: 2,
      background: "linear-gradient(160deg, rgba(255,184,0,0.55), rgba(255,184,0,0.05) 42%, rgba(255,255,255,0.05))",
      boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.02)",
    }}>
      <div style={{
        background: "linear-gradient(180deg, rgba(22,22,26,0.96), rgba(14,14,17,0.97))",
        borderRadius: "var(--r-md)",
        padding: 22,
        backdropFilter: "blur(20px)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 38, height: 38, borderRadius: "var(--r-sm)", background: "var(--gold)", color: "#181203", display: "grid", placeItems: "center" }}>
              <MapPin size={18} />
            </div>
            <div>
              <div style={{ color: "#fff", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17 }}>Reserve seu veículo</div>
              <div style={{ color: "var(--d-2)", fontSize: 12, marginTop: 1 }}>Resposta em minutos pelo WhatsApp</div>
            </div>
          </div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.3)", color: "var(--wa)", fontSize: 11, fontWeight: 700, borderRadius: "var(--r-pill)", padding: "5px 11px" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--wa)" }} /> Online
          </span>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Fixed location */}
          <div>
            <label style={labelStyle}>Local de retirada</label>
            <div style={{ ...fieldStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <MapPin size={16} style={{ color: "var(--gold)" }} /> Loja RCAR — Gama-DF
              </span>
              <span style={{ color: "var(--d-3)", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Único ponto</span>
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Retirada</label>
              <input
                type="date"
                min={today}
                value={pickup}
                onChange={(e) => { setPickup(e.target.value); if (ret && e.target.value > ret) setRet(""); }}
                style={fieldStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Devolução</label>
              <input
                type="date"
                min={pickup || today}
                value={ret}
                onChange={(e) => setRet(e.target.value)}
                style={fieldStyle}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={labelStyle}>Categoria desejada</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                ...fieldStyle,
                cursor: "pointer",
                appearance: "none",
                backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round'><path d='M4 6l4 4 4-4'/></svg>\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 14px center",
              }}
            >
              <option value="" style={{ background: "#16161a" }}>Todos os veículos</option>
              <option value="economy" style={{ background: "#16161a" }}>Econômico</option>
              <option value="sedan" style={{ background: "#16161a" }}>Sedan</option>
              <option value="suv" style={{ background: "#16161a" }}>SUV</option>
              <option value="minivan" style={{ background: "#16161a" }}>Minivan</option>
              <option value="pickup" style={{ background: "#16161a" }}>Picape</option>
            </select>
          </div>

          {/* CTA */}
          <button
            onClick={handleSearch}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              height: 56,
              width: "100%",
              borderRadius: "var(--r-sm)",
              background: "var(--gold)",
              color: "#181203",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 15.5,
              marginTop: 4,
              transition: "background .2s, transform .15s",
              boxShadow: "0 8px 26px rgba(255,184,0,0.22)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--gold-soft)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--gold)"; (e.currentTarget as HTMLElement).style.transform = ""; }}
          >
            Buscar veículos disponíveis <ArrowRight size={18} />
          </button>
        </div>

        {/* Trust signals */}
        <div style={{ display: "flex", gap: 18, marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--ink-line)", flexWrap: "wrap" }}>
          {["Sem cartão de crédito", "Sem análise de crédito", "Cancele quando quiser"].map((s) => (
            <span key={s} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--d-1)", fontSize: 12, fontWeight: 600 }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--gold-tint)", border: "1px solid rgba(255,184,0,0.3)", display: "grid", placeItems: "center" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--gold)" }} />
              </span>
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section id="inicio" style={{ position: "relative", background: "var(--ink)", overflow: "hidden", paddingTop: 120, paddingBottom: 64 }}>
      {/* Ambient gold glow top-right */}
      <div className="animate-ambient" style={{ position: "absolute", top: -160, right: -120, width: 760, height: 760, borderRadius: "50%", pointerEvents: "none", background: "radial-gradient(circle, rgba(255,184,0,0.10) 0%, transparent 62%)" }} />
      {/* Soft secondary glow bottom-left */}
      <div style={{ position: "absolute", bottom: -200, left: -160, width: 520, height: 520, borderRadius: "50%", pointerEvents: "none", background: "radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 70%)" }} />

      {/* Perspective floor grid */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 280, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "70px 70px",
        maskImage: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
        WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
      }} />

      {/* Top gradient line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,184,0,0.4), transparent)" }} />

      <div className="max-w-[var(--maxw,1240px)] mx-auto px-7" style={{ position: "relative", zIndex: 2 }}>
        {/* Headline */}
        <div style={{ maxWidth: 720, marginBottom: 38 }}>
          <div className="reveal" style={{ display: "inline-flex", alignItems: "center", gap: 9, border: "1px solid var(--ink-line-2)", borderRadius: "var(--r-pill)", padding: "7px 15px", width: "fit-content", background: "rgba(255,255,255,0.03)", marginBottom: 22 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--gold)", boxShadow: "0 0 10px var(--gold)" }} />
            <span style={{ color: "var(--d-1)", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>Locadora mais bem avaliada do Gama-DF</span>
          </div>
          <h1 style={{ fontSize: "clamp(2.6rem, 5.6vw, 4.6rem)", color: "#fff", textWrap: "balance" as React.CSSProperties["textWrap"], fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 0.98, margin: 0 }}>
            Alugue seu carro,<br /><span style={{ color: "var(--gold)" }}>sem burocracia.</span>
          </h1>
          <p style={{ color: "var(--d-1)", fontSize: 18, lineHeight: 1.6, maxWidth: 520, marginTop: 22 }}>
            Carros revisados, prontos para rodar. Sem análise de crédito. Reserve em minutos e finalize direto pelo WhatsApp.
          </p>
        </div>

        {/* Two-column: booking card + carousel */}
        <div id="reserva" style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 48, alignItems: "center" }} className="hero-grid">
          <HeroBookingCard />
          <VehicleCarousel />
        </div>

        {/* Trust bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 30, flexWrap: "wrap", marginTop: 52, paddingTop: 30, borderTop: "1px solid var(--ink-line)" }}>
          {HERO_STATS.map((s) => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, color: "#fff", letterSpacing: "-0.02em" }}>{s.value}</span>
                {s.star && <Star size={15} style={{ color: "var(--gold)" }} fill="var(--gold)" />}
              </div>
              <div style={{ color: "var(--d-2)", fontSize: 12, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            {[1,2,3,4,5].map((i) => <Star key={i} size={14} fill="var(--gold)" style={{ color: "var(--gold)" }} />)}
            <span style={{ color: "var(--d-1)", fontSize: 13, fontWeight: 600 }}>Avaliado no Google</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 720px) {
          .hero-grid { gap: 28px !important; }
        }
      `}</style>
    </section>
  );
}
