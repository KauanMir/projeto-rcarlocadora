import type { ReactNode } from "react";

interface StatChip {
  label: string;
  value: string | number;
  color?: string;
}

export function AdminPageHeader({
  eyebrow = "Admin",
  title,
  subtitle,
  stats,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  stats?: StatChip[];
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ width: 22, height: 2, background: "var(--gold)", borderRadius: 2 }} />
        <span
          style={{
            color: "var(--gold)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontFamily: "var(--font-body)",
          }}
        >
          {eyebrow}
        </span>
      </div>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 28,
          color: "#fff",
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p style={{ color: "var(--d-2)", fontSize: 14, marginTop: 6 }}>{subtitle}</p>
      )}
      {stats && stats.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", marginTop: 12 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: s.color ?? "var(--d-2)",
                  flexShrink: 0,
                }}
              />
              <span style={{ color: "var(--d-2)", fontSize: 13 }}>{s.label}</span>
              <span
                style={{
                  color: "#fff",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminKpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: "var(--ink-card)",
        border: "1px solid var(--ink-line)",
        borderRadius: "var(--r-md)",
        padding: "16px 20px",
        ...(accent ? { borderLeft: `3px solid ${accent}` } : {}),
      }}
    >
      <div
        style={{
          color: "var(--d-3)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          fontFamily: "var(--font-body)",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: accent ?? "#fff",
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 26,
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
    </div>
  );
}
