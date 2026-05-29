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
}: {
  data: MonthStat[];
  getValue: (d: MonthStat) => number;
  formatter: (v: number) => string;
  accentColor: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...data.map(getValue), 1);
  const currentIdx = data.length - 1;

  return (
    <div className="flex items-end gap-[3px] h-28">
      {data.map((d, i) => {
        const val = getValue(d);
        const pct = (val / max) * 100;
        const isCurrent = i === currentIdx;
        const isHovered = hovered === i;

        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center justify-end gap-1.5 relative cursor-default"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.1 }}
                className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-20 pointer-events-none whitespace-nowrap"
                style={{
                  background: "rgba(10,10,12,0.97)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.09)",
                  borderRadius: 8,
                }}
              >
                <div className="px-3 py-2">
                  <div className="text-white text-xs font-bold">{formatter(val)}</div>
                  <div className="text-white/40 text-[10px]">{d.label}</div>
                </div>
              </motion.div>
            )}

            <div
              className="w-full rounded-sm transition-all duration-300"
              style={{
                height: `${Math.max(pct, val > 0 ? 3 : 0)}%`,
                minHeight: val > 0 ? 3 : 0,
                backgroundColor: accentColor,
                opacity: isCurrent ? 1 : isHovered ? 0.85 : 0.4,
              }}
            />

            <span
              className="text-[8px] leading-none transition-colors"
              style={{
                color:
                  isCurrent || isHovered
                    ? "rgba(255,255,255,0.55)"
                    : "rgba(255,255,255,0.2)",
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-6">
        <div className="mb-6">
          <div className="text-white/20 text-[9px] tracking-[0.18em] uppercase mb-2">
            Reservas por mês
          </div>
          <div className="text-white font-black text-3xl leading-none">{totalReservations}</div>
          <div className="text-white/25 text-xs mt-1.5">últimos 12 meses</div>
        </div>
        <BarChart
          data={monthlyStats}
          getValue={(d) => d.reservations}
          formatter={(v) => `${v} reserva${v !== 1 ? "s" : ""}`}
          accentColor="#6366f1"
        />
      </div>

      <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-6">
        <div className="mb-6">
          <div className="text-white/20 text-[9px] tracking-[0.18em] uppercase mb-2">
            Receita por mês
          </div>
          <div className="text-white font-black text-3xl leading-none">
            {formatPrice(totalRevenue)}
          </div>
          <div className="text-white/25 text-xs mt-1.5">últimos 12 meses</div>
        </div>
        <BarChart
          data={monthlyStats}
          getValue={(d) => d.revenue}
          formatter={(v) => formatPrice(v)}
          accentColor="#10b981"
        />
      </div>
    </div>
  );
}
