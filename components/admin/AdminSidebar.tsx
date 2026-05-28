"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/admin/reservations", label: "Reservas", icon: "📋" },
  { href: "/admin/vehicles",     label: "Veículos",  icon: "🚗" },
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
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-56 bg-[#0a0a0a] border-r border-white/[0.07] z-30">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/[0.07]">
          <div className="text-white font-black text-xl tracking-tight">RCAR</div>
          <div className="text-white/30 text-[10px] tracking-[0.18em] uppercase mt-0.5">
            Painel Admin
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <span className="text-base" aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/[0.07]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/30 hover:text-white hover:bg-white/[0.05] transition-all"
          >
            <span aria-hidden="true">→</span>
            Sair
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom nav ── */}
      <div
        role="navigation"
        aria-label="Navegação admin"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center bg-[#0a0a0a] border-t border-white/[0.07]"
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))" }}
      >
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 pt-3 pb-1 text-[10px] font-semibold tracking-wide uppercase transition-colors ${
                active ? "text-white" : "text-white/30"
              }`}
            >
              <span className="text-xl" aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center gap-1 pt-3 pb-1 text-[10px] font-semibold tracking-wide uppercase text-white/30 hover:text-white transition-colors"
        >
          <span className="text-xl" aria-hidden="true">→</span>
          Sair
        </button>
      </div>
    </>
  );
}
