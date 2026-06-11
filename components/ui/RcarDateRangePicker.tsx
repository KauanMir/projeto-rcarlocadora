"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import { todayLocal } from "@/utils/dates";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseDateStr(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDisplay(s: string): string {
  if (!s) return "";
  return parseDateStr(s).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}

function firstDowOfMonth(y: number, m: number) {
  return new Date(y, m, 1).getDay();
}

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const CAL_W = 400;
const CAL_H = 460; // approximate height for flip logic

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  pickupDate: string;
  returnDate: string;
  onPickupChange: (d: string) => void;
  onReturnChange: (d: string) => void;
  minDate?: string;
}

type CalLayout =
  | { mode: "desktop"; top: number; left: number }
  | { mode: "mobile" };

// ─── NavBtn ───────────────────────────────────────────────────────────────────

function NavBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 36, height: 36, borderRadius: "50%",
        display: "grid", placeItems: "center",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        color: "#fff", cursor: "pointer",
        transition: "all .22s", padding: 0, flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.background = "#FFB800";
        el.style.color = "#181203";
        el.style.borderColor = "#FFB800";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.background = "rgba(255,255,255,0.06)";
        el.style.color = "#fff";
        el.style.borderColor = "rgba(255,255,255,0.10)";
      }}
    >
      {children}
    </button>
  );
}

// ─── FieldBtn ─────────────────────────────────────────────────────────────────

function FieldBtn({
  label, value, placeholder, active, onClick,
}: {
  label: string; value: string; placeholder: string;
  active: boolean; onClick: () => void;
}) {
  return (
    <div>
      <label style={{
        color: "var(--d-2)", fontSize: 10, fontWeight: 700,
        letterSpacing: "0.16em", textTransform: "uppercase",
        marginBottom: 8, display: "block",
      }}>
        {label}
      </label>
      <button
        type="button"
        onClick={onClick}
        style={{
          width: "100%",
          background: active ? "rgba(255,184,0,0.07)" : "rgba(255,255,255,0.05)",
          border: active ? "1px solid rgba(255,184,0,0.45)" : "1px solid var(--ink-line-2)",
          borderRadius: "var(--r-sm)",
          color: value ? "#fff" : "var(--d-3)",
          fontSize: 14, padding: "13px 14px",
          outline: "none", textAlign: "left", cursor: "pointer",
          fontFamily: "var(--font-body)", fontWeight: 600,
          transition: "border-color .2s, background .2s",
          display: "flex", alignItems: "center", gap: 9,
        }}
      >
        <Calendar
          size={14}
          style={{ color: active ? "#FFB800" : "var(--d-2)", flexShrink: 0, transition: "color .2s" }}
        />
        <span style={{ flex: 1 }}>{value || placeholder}</span>
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function RcarDateRangePicker({
  pickupDate, returnDate,
  onPickupChange, onReturnChange,
  minDate,
}: Props) {
  const today = todayLocal();
  const min = minDate ?? today;

  // Hydration guard — portal needs document
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"pickup" | "return">("pickup");
  const [hover, setHover] = useState<string | null>(null);
  const [layout, setLayout] = useState<CalLayout>({ mode: "desktop", top: 0, left: 0 });

  const now = new Date();
  const [viewY, setViewY] = useState(now.getFullYear());
  const [viewM, setViewM] = useState(now.getMonth());

  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Close on click-outside / scroll / Escape ─────────────────────────────
  useEffect(() => {
    if (!open) return;

    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (
        !triggerRef.current?.contains(t) &&
        !dropdownRef.current?.contains(t)
      ) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onScroll() {
      setOpen(false);
    }

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, [open]);

  // ── Compute position ──────────────────────────────────────────────────────
  function computeLayout(): CalLayout {
    if (!triggerRef.current) return { mode: "desktop", top: 0, left: 0 };
    const r = triggerRef.current.getBoundingClientRect();

    // Mobile: width < 640 → bottom-sheet
    if (window.innerWidth < 640) return { mode: "mobile" };

    // Horizontal: center on trigger, clamp to viewport edges
    const left = Math.max(
      8,
      Math.min(r.left + r.width / 2 - CAL_W / 2, window.innerWidth - CAL_W - 8)
    );

    // Vertical: open below if enough space, else flip above
    const spaceBelow = window.innerHeight - r.bottom;
    const top =
      spaceBelow >= CAL_H + 16
        ? r.bottom + 8
        : Math.max(8, r.top - CAL_H - 8);

    return { mode: "desktop", top, left };
  }

  // ── Open ──────────────────────────────────────────────────────────────────
  function openWith(field: "pickup" | "return") {
    const newStep: "pickup" | "return" =
      field === "return" && pickupDate ? "return" : "pickup";
    setStep(newStep);

    const ref =
      newStep === "return" && returnDate
        ? parseDateStr(returnDate)
        : pickupDate
          ? parseDateStr(pickupDate)
          : new Date();
    setViewY(ref.getFullYear());
    setViewM(ref.getMonth());
    setLayout(computeLayout());
    setOpen(true);
  }

  // ── Month navigation ──────────────────────────────────────────────────────
  function prevMonth() {
    if (viewM === 0) { setViewY((y) => y - 1); setViewM(11); }
    else setViewM((m) => m - 1);
  }
  function nextMonth() {
    if (viewM === 11) { setViewY((y) => y + 1); setViewM(0); }
    else setViewM((m) => m + 1);
  }

  // ── Day click ─────────────────────────────────────────────────────────────
  function handleDayClick(dateStr: string) {
    if (dateStr < min) return;
    if (step === "pickup") {
      onPickupChange(dateStr);
      onReturnChange("");
      setStep("return");
    } else {
      if (!pickupDate || dateStr >= pickupDate) {
        onReturnChange(dateStr);
        setOpen(false);
      } else {
        // Clicked before pickup → restart
        onPickupChange(dateStr);
        onReturnChange("");
        setStep("return");
      }
    }
  }

  // ── Range highlight ───────────────────────────────────────────────────────
  const effectiveEnd =
    returnDate ||
    (step === "return" && hover && pickupDate && hover > pickupDate
      ? hover
      : null);

  // ── Calendar grid ─────────────────────────────────────────────────────────
  const totalDays = daysInMonth(viewY, viewM);
  const leadingEmpty = firstDowOfMonth(viewY, viewM);

  // ── Calendar panel (shared JSX) ───────────────────────────────────────────
  const calendarPanel = (
    <div
      ref={dropdownRef}
      style={{
        ...(layout.mode === "desktop"
          ? {
              position: "fixed" as const,
              top: layout.top,
              left: layout.left,
              width: CAL_W,
            }
          : {
              position: "fixed" as const,
              bottom: 0,
              left: 0,
              right: 0,
              borderRadius: "20px 20px 0 0",
            }),
        background: "#141416",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: layout.mode === "mobile" ? "20px 20px 0 0" : 20,
        boxShadow:
          "0 -4px 40px rgba(0,0,0,0.6), 0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.02)",
        padding: layout.mode === "mobile" ? "24px 20px 32px" : "22px 22px 18px",
        zIndex: 99999,
      }}
    >
      {/* Step hint */}
      <div style={{
        textAlign: "center", marginBottom: 16,
        fontSize: 10.5, fontWeight: 700,
        letterSpacing: "0.12em", textTransform: "uppercase" as const,
        color: "#FFB800", opacity: 0.85,
      }}>
        {step === "pickup" ? "Selecione a data de retirada" : "Selecione a data de devolução"}
      </div>

      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <NavBtn onClick={prevMonth}><ArrowLeft size={15} /></NavBtn>
        <span style={{
          color: "#fff", fontFamily: "var(--font-display)",
          fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em",
        }}>
          {MONTHS[viewM]} {viewY}
        </span>
        <NavBtn onClick={nextMonth}><ArrowRight size={15} /></NavBtn>
      </div>

      {/* Weekday row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 8 }}>
        {WEEKDAYS.map((w) => (
          <div key={w} style={{
            textAlign: "center", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.07em", color: "rgba(255,255,255,0.28)",
            padding: "2px 0 6px",
          }}>
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {Array.from({ length: leadingEmpty }).map((_, i) => <div key={`blank-${i}`} />)}

        {Array.from({ length: totalDays }).map((_, i) => {
          const day = i + 1;
          const dateStr = toDateStr(viewY, viewM, day);

          const isPickup = dateStr === pickupDate;
          const isReturn = dateStr === returnDate;
          const isSelected = isPickup || isReturn;
          const isToday = dateStr === today;
          const isDisabled = dateStr < min;

          const hasRange = !!(pickupDate && effectiveEnd);
          const isRangeStart = hasRange && dateStr === pickupDate;
          const isRangeEnd = hasRange && dateStr === effectiveEnd;
          const isInRange = hasRange && dateStr > pickupDate! && dateStr < effectiveEnd!;

          let wrapBg: React.CSSProperties = {};
          if (isRangeStart && !isRangeEnd) {
            wrapBg = { background: "linear-gradient(to right, transparent 50%, rgba(255,184,0,0.12) 50%)" };
          } else if (isRangeEnd && !isRangeStart) {
            wrapBg = { background: "linear-gradient(to left, transparent 50%, rgba(255,184,0,0.12) 50%)" };
          } else if (isInRange) {
            wrapBg = { background: "rgba(255,184,0,0.12)" };
          }

          return (
            <div
              key={dateStr}
              style={{ ...wrapBg, padding: "2px 0" }}
              onMouseEnter={() => setHover(dateStr)}
              onMouseLeave={() => setHover(null)}
            >
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => handleDayClick(dateStr)}
                style={{
                  width: "100%", aspectRatio: "1",
                  borderRadius: "50%",
                  display: "grid", placeItems: "center",
                  fontSize: 13,
                  fontWeight: isSelected ? 700 : 400,
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  color: isDisabled
                    ? "rgba(255,255,255,0.18)"
                    : isSelected ? "#181203" : "#fff",
                  background: isSelected ? "#FFB800" : "transparent",
                  border: isToday && !isSelected
                    ? "1px solid rgba(255,184,0,0.55)"
                    : "1px solid transparent",
                  transition: "background .14s, color .14s",
                  padding: 0, position: "relative" as const, zIndex: 1,
                }}
                onMouseEnter={(e) => {
                  if (!isDisabled && !isSelected)
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,184,0,0.22)";
                }}
                onMouseLeave={(e) => {
                  if (!isDisabled && !isSelected)
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginTop: 16, paddingTop: 14,
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <button
          type="button"
          onClick={() => { onPickupChange(""); onReturnChange(""); setStep("pickup"); }}
          style={{
            color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600,
            background: "none", border: "none", cursor: "pointer",
            padding: "5px 8px", borderRadius: 6, transition: "color .15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)")}
        >
          Limpar seleção
        </button>
        <button
          type="button"
          onClick={() => handleDayClick(today)}
          style={{
            color: "#FFB800", fontSize: 12, fontWeight: 700,
            background: "rgba(255,184,0,0.08)",
            border: "1px solid rgba(255,184,0,0.22)",
            cursor: "pointer", padding: "5px 16px",
            borderRadius: 8, transition: "background .15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,184,0,0.18)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,184,0,0.08)")}
        >
          Hoje
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Trigger fields */}
      <div
        ref={triggerRef}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
      >
        <FieldBtn
          label="Retirada"
          value={pickupDate ? formatDisplay(pickupDate) : ""}
          placeholder="dd / mm / aaaa"
          active={open && step === "pickup"}
          onClick={() => openWith("pickup")}
        />
        <FieldBtn
          label="Devolução"
          value={returnDate ? formatDisplay(returnDate) : ""}
          placeholder="dd / mm / aaaa"
          active={open && step === "return"}
          onClick={() => openWith("return")}
        />
      </div>

      {/* Portal: escapes all overflow/transform/backdrop-filter ancestors */}
      {mounted && open && createPortal(
        <>
          {/* Mobile backdrop */}
          {layout.mode === "mobile" && (
            <div
              onClick={() => setOpen(false)}
              style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.6)",
                zIndex: 99998,
                backdropFilter: "blur(2px)",
              }}
            />
          )}
          {calendarPanel}
        </>,
        document.body
      )}
    </>
  );
}
