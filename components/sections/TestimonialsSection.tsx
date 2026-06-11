"use client";

import { ShieldCheck, Star } from "lucide-react";
import { TESTIMONIALS } from "@/utils/constants";

function GoogleG({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flexShrink: 0 }} aria-hidden="true">
      <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2c-.3 1.4-1.1 2.6-2.3 3.4v2.8h3.7C21.7 18.6 23 15.8 23 12.3z" />
      <path fill="#34A853" d="M12 23c3.1 0 5.7-1 7.6-2.8l-3.7-2.8c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.7v2.9C3.6 20.5 7.5 23 12 23z" />
      <path fill="#FBBC05" d="M5.6 13.8c-.2-.7-.4-1.4-.4-2.3s.1-1.6.4-2.3V6.3H1.7C1 7.7.5 9.3.5 11.5s.5 3.8 1.2 5.2l3.9-2.9z" />
      <path fill="#EA4335" d="M12 4.9c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.4 15.1.5 12 .5 7.5.5 3.6 3 1.7 6.3l3.9 2.9C6.5 6.5 9 4.9 12 4.9z" />
    </svg>
  );
}

function StarRow({ n }: { n: number }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} fill={i < n ? "var(--gold)" : "transparent"} style={{ color: i < n ? "var(--gold)" : "var(--d-3)" }} />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section style={{ background: "var(--ink)", padding: "116px 0", position: "relative", overflow: "hidden" }}>
      {/* Glow */}
      <div style={{ position: "absolute", top: "30%", right: "-8%", width: 460, height: 460, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,184,0,0.05), transparent 65%)", pointerEvents: "none" }} />

      <div className="max-w-[var(--maxw,1240px)] mx-auto px-7" style={{ position: "relative" }}>
        {/* Header row: title + Google rating */}
        <div className="testi-head" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 40, alignItems: "center", marginBottom: 50 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <span style={{ width: 26, height: 2, background: "var(--gold)", borderRadius: 2 }} />
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)" }}>Depoimentos</span>
            </div>
            <h2 style={{ fontSize: "clamp(2.1rem, 4.2vw, 3.4rem)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 0.98, textWrap: "balance" as React.CSSProperties["textWrap"] }}>
              Clientes que confiam na <span style={{ color: "var(--d-3)" }}>RCAR</span>
            </h2>
            <p style={{ color: "var(--d-1)", fontSize: 16.5, lineHeight: 1.6, marginTop: 18, maxWidth: 560 }}>
              Avaliações reais de quem já alugou com a gente no Gama-DF e região.
            </p>
          </div>

          {/* Google rating card */}
          <div style={{ background: "var(--ink-card)", border: "1px solid var(--ink-line)", borderRadius: "var(--r-md)", padding: 24, display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 46, color: "#fff", lineHeight: 1 }}>4.9</div>
              <StarRow n={5} />
            </div>
            <div style={{ width: 1, alignSelf: "stretch", background: "var(--ink-line)" }} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <GoogleG size={18} />
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Google Reviews</span>
              </div>
              <p style={{ color: "var(--d-1)", fontSize: 13, lineHeight: 1.5 }}>
                Baseado em <strong style={{ color: "#fff" }}>127 avaliações</strong> verificadas de clientes.
              </p>
            </div>
          </div>
        </div>

        {/* Testimonial cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              style={{
                background: "var(--ink-card)",
                border: "1px solid var(--ink-line)",
                borderRadius: "var(--r-md)",
                padding: 24,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                transition: "border-color .25s",
                cursor: "default",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--ink-line-2)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--ink-line)")}
            >
              {/* Reviewer */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--gold)", color: "#181203", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17 }}>{t.initial}</div>
                  <div style={{ position: "absolute", bottom: -2, right: -2, width: 18, height: 18, borderRadius: "50%", background: "var(--ink-card)", display: "grid", placeItems: "center" }}>
                    <GoogleG size={12} />
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 14.5 }}>{t.name}</span>
                    <ShieldCheck size={13} style={{ color: "#60a5fa" }} />
                  </div>
                  <div style={{ color: "var(--d-3)", fontSize: 12, marginTop: 1 }}>{t.date}</div>
                </div>
              </div>

              <StarRow n={t.rating} />
              <p style={{ color: "var(--d-fg)", fontSize: 14.5, lineHeight: 1.65, flex: 1 }}>{t.text}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .testi-head { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
