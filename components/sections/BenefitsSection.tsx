"use client";

import { ShieldCheck, Wrench, Zap, Tag, MapPin } from "lucide-react";
import { BENEFITS } from "@/utils/constants";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

const ICONS = { ShieldCheck, Wrench, Zap, Tag, MapPin, MessageCircle: WhatsAppIcon } as const;

export function BenefitsSection() {
  return (
    <section id="vantagens" style={{ background: "var(--ink)", padding: "116px 0", position: "relative", overflow: "hidden" }}>
      {/* Ambient glow */}
      <div style={{ position: "absolute", top: "20%", left: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,184,0,0.06), transparent 65%)", pointerEvents: "none" }} />

      <div className="max-w-[var(--maxw,1240px)] mx-auto px-7" style={{ position: "relative" }}>
        {/* Section header */}
        <div style={{ marginBottom: 54, maxWidth: 760 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <span style={{ width: 26, height: 2, background: "var(--gold)", borderRadius: 2 }} />
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)" }}>Vantagens</span>
          </div>
          <h2 style={{ fontSize: "clamp(2.1rem, 4.2vw, 3.4rem)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 0.98, textWrap: "balance" as React.CSSProperties["textWrap"] }}>
            Por que escolher a <span style={{ color: "var(--d-3)" }}>RCAR?</span>
          </h2>
          <p style={{ color: "var(--d-1)", fontSize: 16.5, lineHeight: 1.6, marginTop: 18, maxWidth: 560 }}>
            Facilitamos tudo para você sair dirigindo o mais rápido possível, com total tranquilidade.
          </p>
        </div>

        {/* Benefits grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {BENEFITS.map((b) => {
            const Icon = ICONS[b.icon as keyof typeof ICONS];
            return (
              <div
                key={b.title}
                style={{
                  background: "var(--ink-card)",
                  border: "1px solid var(--ink-line)",
                  borderRadius: "var(--r-md)",
                  padding: 26,
                  height: "100%",
                  transition: "border-color .25s, transform .25s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,184,0,0.4)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--ink-line)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
              >
                <div style={{ width: 46, height: 46, borderRadius: "var(--r-sm)", background: "var(--gold-tint)", border: "1px solid rgba(255,184,0,0.25)", display: "grid", placeItems: "center", color: "var(--gold)", marginBottom: 18 }}>
                  {Icon && <Icon size={22} />}
                </div>
                <h3 style={{ fontSize: 17.5, color: "#fff", marginBottom: 9, fontWeight: 700, fontFamily: "var(--font-display)" }}>{b.title}</h3>
                <p style={{ color: "var(--d-1)", fontSize: 14, lineHeight: 1.6 }}>{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
