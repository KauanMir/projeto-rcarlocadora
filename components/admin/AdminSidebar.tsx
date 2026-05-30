"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Target, ClipboardList, Key, Calendar, Car, LogOut,
} from "lucide-react";
import { LogoMark } from "@/components/brand/LogoMark";

const NAV = [
  { href: "/admin/dashboard",    label: "Dashboard",  Icon: LayoutDashboard },
  { href: "/admin/leads",        label: "Leads",      Icon: Target          },
  { href: "/admin/reservations", label: "Reservas",   Icon: ClipboardList   },
  { href: "/admin/rentals",      label: "Locações",   Icon: Key             },
  { href: "/admin/calendar",     label: "Calendário", Icon: Calendar        },
  { href: "/admin/vehicles",     label: "Veículos",   Icon: Car             },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-30"
        style={{
          width: 232,
          background: "#0c0c0e",
          borderRight: "1px solid var(--ink-line)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "22px 22px 20px",
            borderBottom: "1px solid var(--ink-line)",
          }}
        >
          <LogoMark size={22} />
          <div
            style={{
              color: "var(--d-3)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginTop: 10,
              fontFamily: "var(--font-body)",
            }}
          >
            Painel Admin
          </div>
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            padding: "14px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 13px",
                  borderRadius: "var(--r-sm)",
                  fontSize: 13.5,
                  fontWeight: 600,
                  transition: "all .18s",
                  textDecoration: "none",
                  color: active ? "#fff" : "var(--d-2)",
                  background: active ? "rgba(255,255,255,0.07)" : "transparent",
                  fontFamily: "var(--font-display)",
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = "var(--d-2)";
                }}
              >
                <Icon
                  size={18}
                  style={{
                    color: active ? "var(--gold)" : "currentColor",
                    flexShrink: 0,
                    transition: "color .18s",
                  }}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: "14px 12px", borderTop: "1px solid var(--ink-line)" }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              padding: "10px 13px",
              borderRadius: "var(--r-sm)",
              fontSize: 13.5,
              fontWeight: 600,
              color: "var(--d-2)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              transition: "color .18s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--d-2)")}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            Sair do painel
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom nav ── */}
      <div
        role="navigation"
        aria-label="Navegação admin"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center"
        style={{
          paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))",
          background: "#0c0c0e",
          borderTop: "1px solid var(--ink-line)",
          overflowX: "auto",
          gap: 4,
          padding: "8px 12px",
        }}
      >
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 13px",
                borderRadius: "var(--r-pill)",
                fontSize: 12.5,
                fontWeight: 600,
                whiteSpace: "nowrap",
                flexShrink: 0,
                textDecoration: "none",
                background: active ? "var(--gold)" : "rgba(255,255,255,0.04)",
                color: active ? "#181203" : "var(--d-1)",
              }}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "8px 13px",
            borderRadius: "var(--r-pill)",
            fontSize: 12.5,
            fontWeight: 600,
            whiteSpace: "nowrap",
            flexShrink: 0,
            background: "rgba(255,255,255,0.04)",
            color: "var(--d-1)",
            border: "none",
            cursor: "pointer",
          }}
        >
          <LogOut size={15} />
          Sair
        </button>
      </div>
    </>
  );
}
