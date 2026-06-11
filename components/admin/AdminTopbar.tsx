"use client";

import { Search, Bell } from "lucide-react";

export function AdminTopbar() {
  return (
    <div
      style={{
        height: 64,
        borderBottom: "1px solid var(--ink-line)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        background: "rgba(10,10,11,0.8)",
        backdropFilter: "blur(14px)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      {/* Search bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid var(--ink-line)",
          borderRadius: "var(--r-sm)",
          padding: "9px 14px",
          width: 280,
          maxWidth: "40vw",
        }}
      >
        <Search size={16} style={{ color: "var(--d-3)", flexShrink: 0 }} />
        <span style={{ color: "var(--d-3)", fontSize: 13 }}>Buscar reservas, clientes…</span>
      </div>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Bell notification */}
        <button
          style={{
            position: "relative",
            color: "var(--d-1)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
          }}
          aria-label="Notificações"
        >
          <Bell size={19} />
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--gold)",
            }}
          />
        </button>

        {/* User avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--gold)",
              color: "#181203",
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            RC
          </div>
          <span
            className="hidden md:block"
            style={{ color: "var(--d-1)", fontSize: 13, fontWeight: 600 }}
          >
            Admin RCAR
          </span>
        </div>
      </div>
    </div>
  );
}
