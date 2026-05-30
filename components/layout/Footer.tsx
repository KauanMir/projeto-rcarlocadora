"use client";

import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { LogoMark } from "@/components/brand/LogoMark";
import { WHATSAPP_HREF, INSTAGRAM_HREF, INSTAGRAM_HANDLE } from "@/utils/constants";

const NAV_COLS = [
  {
    heading: "Navegação",
    links: [
      { label: "Início", href: "#inicio" },
      { label: "Frota", href: "#frota" },
      { label: "Como Funciona", href: "#como-funciona" },
      { label: "Vantagens", href: "#vantagens" },
    ],
  },
  {
    heading: "Documentos",
    links: [
      { label: "Como funciona o aluguel", href: "#" },
      { label: "Contrato Rent a Car", href: "#" },
      { label: "Políticas de Privacidade", href: "#" },
    ],
  },
];

const linkStyle: React.CSSProperties = { color: "var(--d-1)", fontSize: 14, transition: "color .2s", textDecoration: "none" };

export function Footer() {
  return (
    <footer style={{ background: "#060607", borderTop: "1px solid var(--ink-line)", padding: "64px 0 32px" }}>
      <div className="max-w-[var(--maxw,1240px)] mx-auto px-7">
        <div className="foot-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1.2fr", gap: 40 }}>
          {/* Brand column */}
          <div>
            <LogoMark size={32} />
            <p style={{ color: "var(--d-2)", fontSize: 14, lineHeight: 1.7, maxWidth: 280, marginTop: 18 }}>
              Locadora de veículos no Gama-DF. Carros revisados, reservas rápidas e atendimento humanizado pelo WhatsApp.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                style={{ width: 40, height: 40, borderRadius: "var(--r-sm)", border: "1px solid var(--ink-line)", display: "grid", placeItems: "center", color: "var(--d-1)", transition: "all .2s", textDecoration: "none" }}
                onMouseEnter={(e) => { const el = e.currentTarget; el.style.color = "var(--gold)"; el.style.borderColor = "rgba(255,184,0,0.4)"; }}
                onMouseLeave={(e) => { const el = e.currentTarget; el.style.color = "var(--d-1)"; el.style.borderColor = "var(--ink-line)"; }}
              >
                <Phone size={18} />
              </a>
              <a
                href={INSTAGRAM_HREF}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                style={{ width: 40, height: 40, borderRadius: "var(--r-sm)", border: "1px solid var(--ink-line)", display: "grid", placeItems: "center", color: "var(--d-1)", transition: "all .2s", textDecoration: "none" }}
                onMouseEnter={(e) => { const el = e.currentTarget; el.style.color = "var(--gold)"; el.style.borderColor = "rgba(255,184,0,0.4)"; }}
                onMouseLeave={(e) => { const el = e.currentTarget; el.style.color = "var(--d-1)"; el.style.borderColor = "var(--ink-line)"; }}
              >
                <span style={{ fontSize: 16 }}>📸</span>
              </a>
            </div>
          </div>

          {/* Nav columns */}
          {NAV_COLS.map((col) => (
            <div key={col.heading}>
              <h4 style={{ color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 18 }}>{col.heading}</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      style={linkStyle}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--d-1)")}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Location column */}
          <div>
            <h4 style={{ color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 18 }}>Localização</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              <li style={{ display: "flex", gap: 10, color: "var(--d-1)", fontSize: 14, lineHeight: 1.5 }}>
                <MapPin size={16} style={{ color: "var(--gold)", marginTop: 2, flexShrink: 0 }} />
                <span>Q 36 Comércio Local A/E<br />Setor Leste — Gama, DF</span>
              </li>
              <li style={{ display: "flex", gap: 10, color: "var(--d-1)", fontSize: 14 }}>
                <Phone size={16} style={{ color: "var(--gold)", flexShrink: 0 }} />
                <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" style={{ color: "var(--d-1)", textDecoration: "none" }} onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--d-1)")}>
                  (61) 9 9999-9999
                </a>
              </li>
              <li style={{ display: "flex", gap: 10, color: "var(--d-1)", fontSize: 14 }}>
                <span style={{ color: "var(--gold)", flexShrink: 0, fontSize: 16, lineHeight: 1 }}>📸</span>
                <a href={INSTAGRAM_HREF} target="_blank" rel="noopener noreferrer" style={{ color: "var(--d-1)", textDecoration: "none" }} onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--d-1)")}>
                  {INSTAGRAM_HANDLE}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--ink-line)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <p style={{ color: "var(--d-3)", fontSize: 13 }}>© {new Date().getFullYear()} RCAR Locadora de Veículos. Todos os direitos reservados.</p>
          <div style={{ display: "flex", gap: 22 }}>
            <a href="#" style={{ color: "var(--d-3)", fontSize: 12.5, textDecoration: "none" }}>Termos</a>
            <a href="#" style={{ color: "var(--d-3)", fontSize: 12.5, textDecoration: "none" }}>Privacidade</a>
            <Link href="/admin/login" style={{ color: "var(--d-3)", fontSize: 12.5, textDecoration: "none" }}>Admin</Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .foot-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 560px) {
          .foot-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
