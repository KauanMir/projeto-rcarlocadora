"use client";

import { Car, Sliders, MessageCircle, ArrowRight } from "lucide-react";
import { HOW_STEPS, WHATSAPP_HREF } from "@/utils/constants";

const ICONS = { Car, Sliders, MessageCircle } as const;

export function HowSection() {
  return (
    <section id="como-funciona" style={{ background: "var(--paper-2)", padding: "116px 0", borderTop: "1px solid var(--l-line)" }}>
      <div className="max-w-[var(--maxw,1240px)] mx-auto px-7">
        {/* Section header — centered */}
        <div style={{ marginBottom: 54, textAlign: "center", maxWidth: 640, marginLeft: "auto", marginRight: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 18 }}>
            <span style={{ width: 26, height: 2, background: "var(--gold)", borderRadius: 2 }} />
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)" }}>Simples e Rápido</span>
          </div>
          <h2 style={{ fontSize: "clamp(2.1rem, 4.2vw, 3.4rem)", color: "var(--graphite)", fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 0.98, textWrap: "balance" as React.CSSProperties["textWrap"] }}>
            Da escolha à estrada em <span style={{ color: "var(--l-3)" }}>3 passos</span>
          </h2>
          <p style={{ color: "var(--l-2)", fontSize: 16.5, lineHeight: 1.6, marginTop: 18, maxWidth: 560, margin: "18px auto 0" }}>
            Um processo pensado para ser rápido e sem burocracia. Você reserva online e finaliza com uma pessoa de verdade.
          </p>
        </div>

        {/* Steps */}
        <div className="how-grid" style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", alignItems: "stretch", gap: 0 }}>
          {HOW_STEPS.map((s, i) => {
            const Icon = ICONS[s.icon as keyof typeof ICONS];
            return (
              <div key={s.n} style={{ display: "contents" }}>
                <div
                  style={{
                    position: "relative",
                    height: "100%",
                    background: "var(--paper)",
                    border: "1px solid var(--l-line)",
                    borderRadius: "var(--r-md)",
                    padding: "32px 28px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                    transition: "transform .28s cubic-bezier(0.16,1,0.3,1), border-color .25s, box-shadow .25s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "rgba(255,184,0,0.55)";
                    el.style.transform = "translateY(-6px)";
                    el.style.boxShadow = "0 24px 50px rgba(20,18,14,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "var(--l-line)";
                    el.style.transform = "none";
                    el.style.boxShadow = "none";
                  }}
                >
                  {/* Watermark number */}
                  <span style={{ position: "absolute", top: -24, right: 4, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 130, color: "rgba(20,18,14,0.04)", lineHeight: 1, userSelect: "none" }}>{s.n}</span>

                  {/* Icon with badge */}
                  <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
                    <div style={{ width: 64, height: 64, borderRadius: "var(--r-md)", background: "linear-gradient(155deg, #1f1e22, var(--graphite))", color: "var(--gold)", display: "grid", placeItems: "center", boxShadow: "0 14px 30px rgba(20,18,14,0.22), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
                      {Icon && <Icon size={28} />}
                    </div>
                    <span style={{ position: "absolute", top: -7, right: -7, width: 24, height: 24, borderRadius: "50%", background: "var(--gold)", color: "#181203", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12, border: "3px solid var(--paper-2)" }}>{i + 1}</span>
                  </div>

                  <div style={{ position: "relative" }}>
                    <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold-deep)" }}>{s.tag}</span>
                    <h3 style={{ fontSize: 22, color: "var(--graphite)", margin: "12px 0 10px", fontWeight: 800, fontFamily: "var(--font-display)" }}>{s.title}</h3>
                    <p style={{ color: "var(--l-2)", fontSize: 14.5, lineHeight: 1.6 }}>{s.detail}</p>
                  </div>
                </div>

                {i < HOW_STEPS.length - 1 && (
                  <div className="how-arrow" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
                    <span style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--paper)", border: "1px solid var(--l-line-2)", display: "grid", placeItems: "center", color: "var(--l-2)" }}>
                      <ArrowRight size={18} />
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* WhatsApp CTA */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 44 }}>
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
            <MessageCircle size={19} /> Começar minha reserva
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .how-grid { grid-template-columns: 1fr !important; }
          .how-arrow { display: none !important; }
        }
      `}</style>
    </section>
  );
}
