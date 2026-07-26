"use client";

import { WHATSAPP_HREF } from "@/utils/constants";
import { BOOKING_ENABLED } from "@/lib/feature-flags";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

export function CTASection() {
  return (
    <section id="contato" style={{ position: "relative", background: "var(--gold)", overflow: "hidden", padding: "104px 0" }}>
      {/* Grid overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse at center, black, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black, transparent 75%)",
        pointerEvents: "none",
      }} />

      <div className="max-w-[var(--maxw,1240px)] mx-auto px-7" style={{ position: "relative", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(24,18,3,0.1)", border: "1px solid rgba(24,18,3,0.18)", borderRadius: "var(--r-pill)", padding: "7px 16px" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#181203" }} />
          <span style={{ color: "#181203", fontSize: 11.5, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>Pronto para rodar</span>
        </div>

        {/* Headline */}
        <h2 style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.4rem)", color: "#181203", textWrap: "balance" as React.CSSProperties["textWrap"], fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 0.98, margin: 0 }}>
          {BOOKING_ENABLED ? (
            <>Reserve agora e saia<br />dirigindo hoje mesmo.</>
          ) : (
            <>Solicite sua cotação<br />e saia dirigindo em breve.</>
          )}
        </h2>

        {/* Subtext */}
        <p style={{ color: "rgba(24,18,3,0.72)", fontSize: 18, maxWidth: 520, lineHeight: 1.6, fontWeight: 600 }}>
          Fale com a gente pelo WhatsApp e garanta seu veículo. Alta demanda esta semana — garanta já o seu.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 6 }}>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              height: 54,
              padding: "0 26px",
              borderRadius: "var(--r-sm)",
              background: "var(--wa)",
              color: "#fff",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 15,
              transition: "all .18s ease",
              boxShadow: "0 10px 30px rgba(37,211,102,0.25)",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => { const el = e.currentTarget; el.style.background = "var(--wa-deep)"; el.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { const el = e.currentTarget; el.style.background = "var(--wa)"; el.style.transform = ""; }}
          >
            <WhatsAppIcon size={20} /> Falar no WhatsApp agora
          </a>
          <a
            href="#frota"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              height: 54,
              padding: "0 26px",
              borderRadius: "var(--r-sm)",
              border: "1.5px solid #181203",
              color: "#181203",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
              transition: "opacity .18s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.7")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          >
            Ver a frota
          </a>
        </div>
      </div>
    </section>
  );
}
