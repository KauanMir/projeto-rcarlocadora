"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/brand/LogoMark";

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
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--ink)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10 gap-3">
          <LogoMark size={36} />
          <div
            className="text-[9px] font-bold tracking-[0.22em] uppercase"
            style={{ color: "var(--d-3)", fontFamily: "var(--font-body)" }}
          >
            Painel Administrativo
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            padding: 2,
            borderRadius: "calc(var(--r-md) + 4px)",
            background: "linear-gradient(160deg, rgba(255,184,0,0.3), rgba(255,255,255,0.04) 60%)",
          }}
        >
          <div
            style={{
              background: "var(--ink-card)",
              borderRadius: "var(--r-md)",
              padding: 28,
            }}
          >
            <h1
              className="mb-1"
              style={{
                color: "#fff",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 20,
                letterSpacing: "-0.01em",
              }}
            >
              Entrar
            </h1>
            <p
              className="mb-6"
              style={{ color: "var(--d-2)", fontSize: 13.5 }}
            >
              Acesso restrito a administradores.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="admin-password"
                  style={{
                    color: "var(--d-2)",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Senha
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setStatus("idle"); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--ink-line-2)",
                    borderRadius: "var(--r-sm)",
                    color: "#fff",
                    fontSize: 15,
                    padding: "13px 14px",
                    outline: "none",
                    colorScheme: "dark",
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                    transition: "border-color .2s",
                  }}
                />
              </div>

              {status === "error" && (
                <p role="alert" style={{ color: "#f87171", fontSize: 12.5 }}>
                  Senha incorreta. Tente novamente.
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading" || !password.trim()}
                style={{
                  width: "100%",
                  height: 50,
                  background: "var(--gold)",
                  color: "#181203",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 15,
                  borderRadius: "var(--r-sm)",
                  border: "none",
                  cursor: "pointer",
                  transition: "background .2s, transform .15s",
                  boxShadow: "0 8px 24px rgba(255,184,0,0.22)",
                  opacity: status === "loading" || !password.trim() ? 0.4 : 1,
                  marginTop: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {status === "loading" ? (
                  <>
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(24,18,3,0.3)",
                        borderTopColor: "#181203",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    Verificando...
                  </>
                ) : (
                  "Entrar"
                )}
              </button>
            </form>
          </div>
        </div>

        <p
          className="text-center mt-6"
          style={{ color: "var(--d-4)", fontSize: 11.5 }}
        >
          RCAR · Acesso restrito
        </p>
      </div>
    </div>
  );
}
