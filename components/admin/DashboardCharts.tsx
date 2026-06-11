"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { formatPrice } from "@/utils/format";

export interface MonthStat {
  label: string;
  reservations: number;
  revenue: number;
}

export interface FleetMixItem {
  label: string;
  count: number;
  color: string;
}

export interface UtilItem {
  cat: string;
  fleet: number;
  pct: number;
}

// ─── Bar chart ────────────────────────────────────────────────

function BarChart({
  data,
  field,
  fmt,
  color,
}: {
  data: MonthStat[];
  field: "reservations" | "revenue";
  fmt: (v: number) => string;
  color: string;
}) {
  const [hov, setHov] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d[field]), 1);
  const cur = data.length - 1;

  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 4, height: 130 }}>
      {data.map((d, i) => {
        const val = d[field];
        const pct = (val / max) * 100;
        return (
          <div
            key={i}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 7, position: "relative", cursor: "default" }}
          >
            {hov === i && (
              <div
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 8px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                  background: "#0a0a0c",
                  border: "1px solid var(--ink-line-2)",
                  borderRadius: 8,
                  padding: "7px 11px",
                  zIndex: 5,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                  pointerEvents: "none",
                }}
              >
                <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{fmt(val)}</div>
                <div style={{ color: "var(--d-2)", fontSize: 10 }}>{d.label}</div>
              </div>
            )}
            <div
              style={{
                width: "100%",
                borderRadius: 4,
                height: `${Math.max(pct, val > 0 ? 4 : 0)}%`,
                background: color,
                opacity: i === cur ? 1 : hov === i ? 0.85 : 0.42,
                transition: "opacity .2s",
              }}
            />
            <span style={{ fontSize: 8.5, color: i === cur || hov === i ? "var(--d-1)" : "var(--d-3)" }}>
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Area / line chart (SVG) ──────────────────────────────────

function AreaChart({
  data,
  field,
  fmt,
  color = "#34d399",
  height = 160,
}: {
  data: MonthStat[];
  field: "revenue" | "reservations";
  fmt: (v: number) => string;
  color?: string;
  height?: number;
}) {
  const [hov, setHov] = useState<number | null>(null);
  const W = 560, H = height, pad = { l: 8, r: 8, t: 12, b: 22 };
  const maxVal = Math.max(...data.map((d) => d[field])) * 1.12 || 1;
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const xs = (i: number) => pad.l + (i / (data.length - 1)) * iw;
  const ys = (v: number) => pad.t + ih - (v / maxVal) * ih;
  const pts = data.map((d, i) => [xs(i), ys(d[field])] as [number, number]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = `${line} L ${pts[pts.length - 1][0].toFixed(1)} ${(pad.t + ih).toFixed(1)} L ${pts[0][0].toFixed(1)} ${(pad.t + ih).toFixed(1)} Z`;
  const gid = "ag" + field;

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        preserveAspectRatio="none"
        onMouseLeave={() => setHov(null)}
        style={{ overflow: "visible", display: "block" }}
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((g, i) => (
          <line
            key={i}
            x1={pad.l} x2={W - pad.r}
            y1={pad.t + g * ih} y2={pad.t + g * ih}
            stroke="rgba(255,255,255,0.05)" strokeWidth="1"
          />
        ))}

        <path d={area} fill={`url(#${gid})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {pts.map((p, i) => (
          <g key={i} onMouseEnter={() => setHov(i)} style={{ cursor: "pointer" }}>
            <rect
              x={p[0] - iw / data.length / 2}
              y={pad.t}
              width={iw / data.length}
              height={ih}
              fill="transparent"
            />
            <circle
              cx={p[0]} cy={p[1]}
              r={hov === i ? 5 : i === data.length - 1 ? 4 : 0}
              fill="#0c0c0e"
              stroke={color}
              strokeWidth="2.5"
            />
          </g>
        ))}

        {data.map((d, i) =>
          (i % 2 === 0 || i === data.length - 1) ? (
            <text key={i} x={xs(i)} y={H - 6} fill="var(--d-3)" fontSize="9" textAnchor="middle">
              {d.label}
            </text>
          ) : null
        )}
      </svg>

      {hov !== null && (
        <div
          style={{
            position: "absolute",
            left: `${(xs(hov) / W) * 100}%`,
            top: -6,
            transform: "translate(-50%,-100%)",
            background: "#0a0a0c",
            border: "1px solid var(--ink-line-2)",
            borderRadius: 8,
            padding: "7px 11px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
          }}
        >
          <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{fmt(data[hov][field])}</div>
          <div style={{ color: "var(--d-2)", fontSize: 10 }}>{data[hov].label}</div>
        </div>
      )}
    </div>
  );
}

// ─── Donut chart ──────────────────────────────────────────────

function Donut({
  data,
  total,
  size = 150,
  thickness = 22,
}: {
  data: FleetMixItem[];
  total: number;
  size?: number;
  thickness?: number;
}) {
  const [hov, setHov] = useState<number | null>(null);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2;
  let acc = 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg
          width={size} height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(-90deg)" }}
        >
          {data.map((d, i) => {
            const frac = d.count / total;
            const dash = frac * c;
            const off = acc * c;
            acc += frac;
            return (
              <circle
                key={i}
                cx={cx} cy={cx} r={r}
                fill="none"
                stroke={d.color}
                strokeWidth={hov === i ? thickness + 4 : thickness}
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-off}
                onMouseEnter={() => setHov(i)}
                onMouseLeave={() => setHov(null)}
                style={{ transition: "stroke-width .2s", cursor: "pointer" }}
              />
            );
          })}
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, color: "#fff", lineHeight: 1 }}>
              {hov === null ? total : data[hov].count}
            </div>
            <div style={{ color: "var(--d-3)", fontSize: 10, marginTop: 2 }}>
              {hov === null ? "veículos" : data[hov].label}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1, minWidth: 120 }}>
        {data.map((d, i) => (
          <div
            key={i}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              cursor: "pointer",
              opacity: hov === null || hov === i ? 1 : 0.5,
              transition: "opacity .2s",
            }}
          >
            <span style={{ width: 9, height: 9, borderRadius: 3, background: d.color, flexShrink: 0 }} />
            <span style={{ color: "var(--d-1)", fontSize: 12.5, flex: 1 }}>{d.label}</span>
            <span style={{ color: "#fff", fontSize: 12.5, fontWeight: 700 }}>{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Utilization bars ─────────────────────────────────────────

function UtilBars({ data }: { data: UtilItem[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {data.map((d) => {
        const col = d.pct >= 85 ? "#f87171" : d.pct >= 70 ? "var(--gold)" : "#34d399";
        return (
          <div key={d.cat}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ color: "var(--d-1)", fontSize: 13, fontWeight: 600 }}>
                {d.cat} <span style={{ color: "var(--d-3)", fontWeight: 400 }}>· {d.fleet} un.</span>
              </span>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{d.pct}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${d.pct}%`, borderRadius: 4, background: col }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Panel title helper ───────────────────────────────────────

function PanelTitle({ children, action }: { children: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
      <span style={{ color: "var(--d-1)", fontSize: 13.5, fontWeight: 700 }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: "var(--ink-line)" }} />
      {action}
    </div>
  );
}

// ─── Exports ──────────────────────────────────────────────────

export function DashboardCharts({
  monthlyStats,
  fleetMix,
  utilization,
}: {
  monthlyStats: MonthStat[];
  fleetMix: FleetMixItem[];
  utilization: UtilItem[];
}) {
  const totalRes = monthlyStats.reduce((s, d) => s + d.reservations, 0);
  const totalRev = monthlyStats.reduce((s, d) => s + d.revenue, 0);
  const fleetTotal = fleetMix.reduce((s, d) => s + d.count, 0);

  const aCard: React.CSSProperties = {
    background: "var(--ink-card)",
    border: "1px solid var(--ink-line)",
    borderRadius: "var(--r-md)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Row 1: Revenue area chart + Fleet mix donut */}
      <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 16 }} className="adm-2col">
        {/* Revenue area chart */}
        <div style={{ ...aCard, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div>
              <div style={{ color: "var(--d-3)", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8, fontFamily: "var(--font-body)" }}>
                Receita por mês
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "#fff" }}>
                  {formatPrice(totalRev)}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 2, color: "#34d399", fontSize: 12, fontWeight: 700 }}>
                  <TrendingUp size={13} /> +20%
                </span>
              </div>
              <div style={{ color: "var(--d-3)", fontSize: 12, marginTop: 3 }}>
                Acumulado · últimos 12 meses
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["12M", "6M", "3M"].map((t, i) => (
                <span
                  key={t}
                  style={{
                    padding: "5px 11px",
                    borderRadius: "var(--r-sm)",
                    fontSize: 11.5,
                    fontWeight: 700,
                    background: i === 0 ? "rgba(255,255,255,0.07)" : "transparent",
                    color: i === 0 ? "#fff" : "var(--d-3)",
                    border: "1px solid var(--ink-line)",
                    cursor: "pointer",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <AreaChart
            data={monthlyStats}
            field="revenue"
            fmt={(v) => formatPrice(v)}
            color="#34d399"
            height={160}
          />
        </div>

        {/* Fleet mix donut */}
        <div style={{ ...aCard, padding: 24 }}>
          <div style={{ color: "var(--d-3)", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 18, fontFamily: "var(--font-body)" }}>
            Composição da frota
          </div>
          {fleetTotal > 0 ? (
            <Donut data={fleetMix} total={fleetTotal} />
          ) : (
            <p style={{ color: "var(--d-4)", fontSize: 13, textAlign: "center", padding: "32px 0" }}>
              Sem dados de frota.
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Reservations bar chart + Utilization bars */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="adm-2col">
        {/* Reservations bar chart */}
        <div style={{ ...aCard, padding: 24 }}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ color: "var(--d-3)", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8, fontFamily: "var(--font-body)" }}>
              Reservas por mês
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "#fff" }}>
                {totalRes}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 2, color: "#34d399", fontSize: 12, fontWeight: 700 }}>
                <TrendingUp size={13} /> +15%
              </span>
            </div>
            <div style={{ color: "var(--d-3)", fontSize: 12, marginTop: 3 }}>últimos 12 meses</div>
          </div>
          <BarChart
            data={monthlyStats}
            field="reservations"
            fmt={(v) => `${v} reservas`}
            color="var(--gold)"
          />
        </div>

        {/* Utilization bars */}
        <div style={{ ...aCard, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <div>
              <div style={{ color: "var(--d-3)", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8, fontFamily: "var(--font-body)" }}>
                Taxa de ocupação
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "#fff" }}>
                  {utilization.length > 0
                    ? `${Math.round(utilization.reduce((s, d) => s + d.pct, 0) / utilization.length)}%`
                    : "0%"}
                </span>
                <span style={{ color: "var(--d-3)", fontSize: 12 }}>média da frota</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {([["#34d399", "Saudável"], ["var(--gold)", "Alta"], ["#f87171", "Crítica"]] as const).map(([c, l]) => (
                <span
                  key={l}
                  style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--d-3)", fontSize: 10.5 }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
                  {l}
                </span>
              ))}
            </div>
          </div>
          {utilization.length > 0 ? (
            <UtilBars data={utilization} />
          ) : (
            <p style={{ color: "var(--d-4)", fontSize: 13, textAlign: "center", padding: "24px 0" }}>Sem dados.</p>
          )}
        </div>
      </div>
    </div>
  );
}
