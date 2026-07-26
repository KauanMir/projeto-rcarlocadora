"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Fuel, Settings, Users } from "lucide-react";
import { SHOWROOM_CATEGORIES, FLEET_FILTERS } from "@/utils/constants";
import { formatPrice } from "@/utils/format";
import { buildVehicleQuoteWhatsAppUrl } from "@/utils/whatsapp";
import { BOOKING_ENABLED } from "@/lib/feature-flags";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import type { ShowroomCategory } from "@/types/vehicle";

function FleetCard({ category, index }: { category: ShowroomCategory; index: number }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "var(--paper-2)",
        border: "1px solid",
        borderColor: hov ? "rgba(255,184,0,0.6)" : "var(--l-line)",
        borderRadius: "var(--r-md)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "transform .35s cubic-bezier(0.16,1,0.3,1), box-shadow .35s, border-color .35s",
        transform: hov ? "translateY(-7px)" : "none",
        boxShadow: hov ? "0 28px 60px rgba(20,18,14,0.16)" : "var(--shadow-card)",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 200, background: "radial-gradient(ellipse at 50% 40%, #ffffff, #ebeae4)", overflow: "hidden", flexShrink: 0 }}>
        {/* Subtle grid overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(20,18,14,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(20,18,14,0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse at center, black, transparent 72%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black, transparent 72%)",
        }} />

        {/* Index number watermark */}
        <span style={{ position: "absolute", top: 14, right: 16, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, color: "rgba(20,18,14,0.12)", letterSpacing: "0.04em" }}>
          {String(index + 1).padStart(2, "0")}
        </span>

        {category.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={category.image}
            alt={category.name}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "contain", padding: "26px 24px 30px",
              transition: "transform .55s cubic-bezier(0.16,1,0.3,1)",
              transform: hov
                ? `scale(${(category.imageScale ?? 1) * 1.07}) translateY(-2px)`
                : category.imageScale ? `scale(${category.imageScale})` : "none",
              filter: "drop-shadow(0 18px 22px rgba(20,18,14,0.22))",
              mixBlendMode: category.imageScale ? "multiply" : undefined,
            }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 66, color: "rgba(20,18,14,0.05)" }}>
            {category.name.split(" ")[0].toUpperCase()}
          </div>
        )}

        {/* Ground reflection */}
        <div style={{ position: "absolute", bottom: 16, left: "20%", right: "20%", height: 14, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(20,18,14,0.16), transparent 70%)", filter: "blur(4px)" }} />

        {/* Tag badge */}
        {category.tag && (
          <span style={{ position: "absolute", top: 14, left: 16, background: "var(--gold)", color: "#181203", fontSize: 9.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", padding: "5px 10px", borderRadius: "var(--r-xs)", whiteSpace: "nowrap" }}>
            {category.tag}
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", gap: 16, flex: 1, borderTop: "1px solid var(--l-line)" }}>
        <div>
          <h3 style={{ fontSize: 19, color: "var(--graphite)", fontWeight: 800, fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>
            {category.name}
          </h3>
          <p style={{ color: "var(--l-2)", fontSize: 12.5, marginTop: 6, lineHeight: 1.5 }}>
            {category.models.slice(0, 4).join(" · ")}
          </p>
        </div>

        {/* Specs */}
        {(category.fuel || category.transmission || category.seats) && (
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {category.fuel && (
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--l-1)" }}>
                <Fuel size={15} style={{ color: "var(--l-3)" }} /> {category.fuel}
              </span>
            )}
            {category.transmission && (
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--l-1)" }}>
                <Settings size={15} style={{ color: "var(--l-3)" }} /> {category.transmission}
              </span>
            )}
            {category.seats && (
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--l-1)" }}>
                <Users size={15} style={{ color: "var(--l-3)" }} /> {category.seats} lug.
              </span>
            )}
          </div>
        )}

        {/* Price + CTA */}
        <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--l-line)", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
          <div>
            {BOOKING_ENABLED ? (
              <>
                <div style={{ color: "var(--l-3)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>a partir de</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 27, color: "var(--graphite)", lineHeight: 1.1 }}>
                  {formatPrice(category.pricePerDay)}<span style={{ fontSize: 13, color: "var(--l-3)", fontWeight: 600 }}>/dia</span>
                </div>
              </>
            ) : (
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15.5, color: "var(--graphite)", lineHeight: 1.3 }}>
                Consulte disponibilidade
              </div>
            )}
          </div>
          {BOOKING_ENABLED ? (
            <Link
              href={`/booking?category=${category.dbCategory}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 16px 9px 18px",
                borderRadius: "var(--r-sm)",
                background: hov ? "var(--gold)" : "rgba(255,184,0,0.10)",
                border: `1px solid ${hov ? "var(--gold)" : "rgba(255,184,0,0.35)"}`,
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 13.5,
                color: hov ? "#181203" : "var(--gold)",
                transition: "all .2s",
                textDecoration: "none",
                boxShadow: hov ? "0 4px 18px rgba(255,184,0,0.22)" : "none",
              }}
            >
              Reservar
              <ArrowRight
                size={15}
                style={{
                  transition: "transform .2s",
                  transform: hov ? "translateX(3px)" : "none",
                  flexShrink: 0,
                }}
              />
            </Link>
          ) : (
            <a
              href={buildVehicleQuoteWhatsAppUrl(category.name)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 16px 9px 18px",
                borderRadius: "var(--r-sm)",
                background: hov ? "var(--gold)" : "rgba(255,184,0,0.10)",
                border: `1px solid ${hov ? "var(--gold)" : "rgba(255,184,0,0.35)"}`,
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 13.5,
                color: hov ? "#181203" : "var(--gold)",
                transition: "all .2s",
                textDecoration: "none",
                boxShadow: hov ? "0 4px 18px rgba(255,184,0,0.22)" : "none",
              }}
            >
              Solicitar cotação
              <WhatsAppIcon size={15} style={{ flexShrink: 0 }} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function VehiclesSection() {
  const [filter, setFilter] = useState("all");
  const visible = filter === "all" ? SHOWROOM_CATEGORIES : SHOWROOM_CATEGORIES.filter((c) => c.dbCategory === filter);

  return (
    <section id="frota" style={{ background: "var(--paper)", padding: "116px 0", borderTop: "1px solid var(--l-line)", position: "relative" }}>
      <div className="max-w-[var(--maxw,1240px)] mx-auto px-7">
        {/* Section header + filters */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24, marginBottom: 40 }}>
          <div style={{ maxWidth: 560 }}>
            {/* Eyebrow */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <span style={{ width: 26, height: 2, background: "var(--gold)", borderRadius: 2 }} />
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)" }}>Nossa Frota</span>
            </div>
            <h2 style={{ fontSize: "clamp(2.1rem, 4.2vw, 3.4rem)", color: "var(--graphite)", fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 0.98, textWrap: "balance" as React.CSSProperties["textWrap"] }}>
              Encontre o carro <span style={{ color: "var(--l-3)" }}>da sua viagem.</span>
            </h2>
            <p style={{ color: "var(--l-2)", fontSize: 16.5, lineHeight: 1.6, marginTop: 18 }}>
              {BOOKING_ENABLED
                ? "Reserve a categoria e receba o melhor modelo disponível — todos com ar-condicionado, manutenção em dia e documentação regularizada."
                : "Consulte a categoria ideal e receba uma cotação personalizada — todos com ar-condicionado, manutenção em dia e documentação regularizada."}
            </p>
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            {FLEET_FILTERS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                style={{
                  padding: "9px 16px",
                  borderRadius: "var(--r-pill)",
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  transition: "all .2s",
                  background: filter === id ? "var(--graphite)" : "transparent",
                  color: filter === id ? "#fff" : "var(--l-1)",
                  border: "1px solid",
                  borderColor: filter === id ? "var(--graphite)" : "var(--l-line-2)",
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 22 }}>
          {visible.map((category, i) => (
            <FleetCard key={category.id} category={category} index={i} />
          ))}
        </div>

        <p style={{ textAlign: "center", marginTop: 44, color: "var(--l-3)", fontSize: 12.5, fontWeight: 600, letterSpacing: "0.06em" }}>
          {BOOKING_ENABLED
            ? "* Valores não incluem taxas do contrato. Diárias a partir do valor indicado por categoria."
            : "* Consulte a disponibilidade e as condições de cada categoria pelo WhatsApp."}
        </p>
      </div>
    </section>
  );
}
