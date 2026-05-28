"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin/reservations");
        router.refresh();
      } else {
        setStatus("error");
        setPassword("");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-white font-black text-3xl tracking-tight">RCAR</div>
          <div className="text-white/30 text-xs tracking-[0.2em] uppercase mt-1">Painel Administrativo</div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.025)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.07), 0 24px 80px rgba(0,0,0,0.6)",
          }}
        >
          <div className="p-8">
            <h1 className="text-white font-bold text-lg mb-1">Entrar</h1>
            <p className="text-white/35 text-sm mb-6">Acesso restrito a administradores.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="admin-password" className="text-white/40 text-[10px] tracking-[0.16em] uppercase font-semibold">
                  Senha
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setStatus("idle"); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-white/[0.04] border border-white/[0.08] hover:border-white/20 focus:border-white/25 rounded-sm text-white text-sm px-4 py-3.5 outline-none transition-colors placeholder:text-white/20"
                />
              </div>

              {status === "error" && (
                <p role="alert" className="text-red-400 text-xs">
                  Senha incorreta. Tente novamente.
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading" || !password.trim()}
                className="w-full h-12 bg-white text-black hover:bg-white/90 active:scale-[0.98] font-bold rounded-sm text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-1"
              >
                {status === "loading" ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Verificando...
                  </span>
                ) : (
                  "Entrar"
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-white/15 text-xs mt-6">
          RCAR · Acesso restrito
        </p>
      </div>
    </div>
  );
}
