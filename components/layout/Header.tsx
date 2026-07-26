"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LogoMark } from "@/components/brand/LogoMark";
import { NAV_LINKS } from "@/utils/constants";
import { BOOKING_ENABLED } from "@/lib/feature-flags";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(10,10,11,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(18px)" : "none",
        borderBottom: scrolled ? "1px solid var(--ink-line)" : "1px solid transparent",
      }}
    >
      {/* Desktop bar */}
      <div
        className="max-w-[var(--maxw,1240px)] mx-auto px-7 flex items-center justify-between"
        style={{ height: 88 }}
      >
        <Link href="/" aria-label="RCAR — Início">
          <LogoMark size={68} />
        </Link>

        {/* Nav links — desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors duration-200"
              style={{ color: "var(--d-1)", fontSize: 14, fontWeight: 600, letterSpacing: "0.01em" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--d-1)")}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions — desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/admin/login"
            className="transition-colors duration-200"
            style={{ color: "var(--d-2)", fontSize: 13, fontWeight: 600, padding: "8px 6px" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--d-2)")}
          >
            Área Admin
          </Link>
          <a
            href="#reserva"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: 44,
              padding: "0 22px",
              borderRadius: "var(--r-sm)",
              background: "var(--gold)",
              color: "#181203",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 13.5,
              transition: "background .2s, transform .15s",
              boxShadow: "0 8px 26px rgba(255,184,0,0.22)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--gold-soft)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--gold)"; (e.currentTarget as HTMLElement).style.transform = ""; }}
          >
            {BOOKING_ENABLED ? "Reservar Agora" : "Solicitar Cotação"}
          </a>
        </div>

        {/* Hamburger — mobile */}
        <button
          className="md:hidden p-2 text-white"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden flex flex-col gap-1 px-5 pb-5"
          style={{
            background: "rgba(10,10,11,0.97)",
            borderTop: "1px solid var(--ink-line)",
          }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-3 text-sm font-semibold transition-colors"
              style={{
                color: "var(--d-1)",
                borderBottom: "1px solid var(--ink-line)",
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#reserva"
            onClick={() => setOpen(false)}
            className="mt-3 flex items-center justify-center font-bold text-sm"
            style={{
              height: 52,
              borderRadius: "var(--r-sm)",
              background: "var(--gold)",
              color: "#181203",
              fontFamily: "var(--font-display)",
            }}
          >
            {BOOKING_ENABLED ? "Reservar Agora" : "Solicitar Cotação"}
          </a>
          <Link
            href="/admin/login"
            onClick={() => setOpen(false)}
            className="py-3 text-xs font-semibold text-center"
            style={{ color: "var(--d-2)" }}
          >
            Área Admin
          </Link>
        </div>
      )}
    </header>
  );
}
