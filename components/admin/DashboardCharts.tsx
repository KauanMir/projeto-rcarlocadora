"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { formatPrice } from "@/utils/format";

interface MonthStat {
  label: string;
  reservations: number;
  revenue: number;
}

function BarChart({
  data,
  getValue,
  formatter,
  accentColor,
  currentLabel,
}: {
  data: MonthStat[];
  getValue: (d: MonthStat) => number;
  formatter: (v: number) => string;
  accentColor: string;
  currentLabel?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...data.map(getValue), 1);
  const currentIdx = data.length - 1;

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 120 }}>
      {data.map((d, i) => {
        const val = getValue(d);
        const pct = (val / max) * 100;
        const isCurrent = i === currentIdx;
        const isHovered = hovered === i;

        return (
          <div
            key={i}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 6, position: "relative", cursor: "default" }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Tooltip */}
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.1 }}
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 8px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 20,
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                  background: "var(--ink-card-2)",
                  border: "1px solid var(--ink-line-2)",
                  borderRadius: "var(--r-sm)",
                  boxShadow: "var(--shadow-pop)",
                }}
              >
                <div style={{ padding: "8px 12px" }}>
                  <div style={{ color: "#fff", fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-display)" }}>{formatter(val)}</div>
                  <div style={{ color: "var(--d-3)", fontSize: 10.5 }}>{d.label}</div>
                </div>
              </motion.div>
            )}

            <div
              style={{
                width: "100%",
                borderRadius: "3px 3px 0 0",
                minHeight: val > 0 ? 3 : 0,
                height: `${Math.max(pct, val > 0 ? 3 : 0)}%`,
                background: isCurrent ? accentColor : accentColor,
                opacity: isCurrent ? 1 : isHovered ? 0.7 : 0.3,
                transition: "opacity .2s, height .3s ease",
                position: "relative",
              }}
            >
              {/* Shimmer on current month */}
              {isCurrent && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "inherit",
                    background: `linear-gradient(to top, transparent 50%, rgba(255,255,255,0.12))`,
                  }}
                />
              )}
            </div>

            <span
              style={{
                fontSize: 8.5,
                lineHeight: 1,
                transition: "color .2s",
                color: isCurrent || isHovered ? "var(--d-1)" : "var(--d-4)",
                fontFamily: "var(--font-body)",
                fontWeight: isCurrent ? 700 : 400,
              }}
            >
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function DashboardCharts({ monthlyStats }: { monthlyStats: MonthStat[] }) {
  const totalReservations = monthlyStats.reduce((s, d) => s + d.reservations, 0);
  const totalRevenue = monthlyStats.reduce((s, d) => s + d.revenue, 0);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
      {/* Reservations chart */}
      <div
        style={{
          background: "var(--ink-card)",
          border: "1px solid var(--ink-line)",
          borderRadius: "var(--r-md)",
          padding: "20px 22px",
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "var(--d-3)", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6, fontFamily: "var(--font-body)" }}>
            Reservas · 12 meses
          </div>
          <div style={{ color: "#fff", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, lineHeight: 1, letterSpacing: "-0.02em" }}>
            {totalReservations}
          </div>
          <div style={{ color: "var(--d-3)", fontSize: 11.5, marginTop: 4 }}>total de reservas</div>
        </div>
        <BarChart
          data={monthlyStats}
          getValue={(d) => d.reservations}
          formatter={(v) => `${v} reserva${v !== 1 ? "s" : ""}`}
          accentColor="#6366f1"
        />
      </div>

      {/* Revenue chart */}
      <div
        style={{
          background: "var(--ink-card)",
          border: "1px solid var(--ink-line)",
          borderLeft: "3px solid var(--gold)",
          borderRadius: "var(--r-md)",
          padding: "20px 22px",
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "var(--d-3)", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6, fontFamily: "var(--font-body)" }}>
            Receita · 12 meses
          </div>
          <div style={{ color: "var(--gold)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, lineHeight: 1, letterSpacing: "-0.02em" }}>
            {formatPrice(totalRevenue)}
          </div>
          <div style={{ color: "var(--d-3)", fontSize: 11.5, marginTop: 4 }}>excl. canceladas</div>
        </div>
        <BarChart
          data={monthlyStats}
          getValue={(d) => d.revenue}
          formatter={(v) => formatPrice(v)}
          accentColor="#ffb800"
        />
      </div>
    </div>
  );
}
