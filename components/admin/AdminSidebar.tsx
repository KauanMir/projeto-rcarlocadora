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
        className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-56 z-30"
        style={{
          background: "var(--ink-1)",
          borderRight: "1px solid var(--ink-line)",
        }}
      >
        {/* Logo */}
        <div
          className="px-5 py-5"
          style={{ borderBottom: "1px solid var(--ink-line)" }}
        >
          <LogoMark size={28} />
          <div
            className="mt-2 text-[9px] font-bold tracking-[0.22em] uppercase"
            style={{ color: "var(--d-4)", fontFamily: "var(--font-body)" }}
          >
            Painel Admin
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
                style={
                  active
                    ? {
                        background: "var(--gold)",
                        color: "#181203",
                        fontFamily: "var(--font-display)",
                      }
                    : {
                        color: "var(--d-2)",
                        fontFamily: "var(--font-display)",
                      }
                }
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = "var(--ink-card)";
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <Icon
                  size={16}
                  style={{ color: active ? "#181203" : "var(--d-3)", flexShrink: 0 }}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div
          className="px-3 py-4"
          style={{ borderTop: "1px solid var(--ink-line)" }}
        >
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{ color: "var(--d-3)", fontFamily: "var(--font-display)", background: "transparent" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.background = "var(--ink-card)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--d-3)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} />
            Sair
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
          background: "var(--ink-1)",
          borderTop: "1px solid var(--ink-line)",
        }}
      >
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-1 pt-3 pb-1 transition-colors"
              style={{
                color: active ? "var(--gold)" : "var(--d-3)",
                fontFamily: "var(--font-body)",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center gap-1 pt-3 pb-1 transition-colors"
          style={{ color: "var(--d-4)", fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </>
  );
}
