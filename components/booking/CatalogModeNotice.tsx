"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { WHATSAPP_HREF } from "@/utils/constants";

const REDIRECT_DELAY_MS = 6000;

export function CatalogModeNotice() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace("/"), REDIRECT_DELAY_MS);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <>
      <Header />
      <main
        className="flex-1"
        style={{
          minHeight: "100vh",
          background: "var(--ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "140px 24px 64px",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(255,184,0,0.1)",
              border: "1px solid rgba(255,184,0,0.3)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <MessageCircle size={26} style={{ color: "var(--gold)" }} />
          </div>

          <h1
            style={{
              color: "#fff",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 26,
              letterSpacing: "-0.01em",
            }}
          >
            Reserva online temporariamente indisponível
          </h1>

          <p style={{ color: "var(--d-1)", fontSize: 15, lineHeight: 1.6 }}>
            No momento, nossas cotações são feitas diretamente pelo WhatsApp, com atendimento
            personalizado para escolher o melhor veículo e as melhores condições para você.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                height: 50,
                padding: "0 24px",
                borderRadius: "var(--r-sm)",
                background: "var(--wa)",
                color: "#fff",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 14.5,
                textDecoration: "none",
                boxShadow: "0 10px 30px rgba(37,211,102,0.25)",
              }}
            >
              <MessageCircle size={18} /> Solicitar cotação no WhatsApp
            </a>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 50,
                padding: "0 22px",
                borderRadius: "var(--r-sm)",
                border: "1px solid var(--ink-line-2)",
                color: "var(--d-1)",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 14.5,
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={16} /> Voltar para o catálogo
            </a>
          </div>

          <p style={{ color: "var(--d-3)", fontSize: 12.5, marginTop: 4 }}>
            Você será redirecionado para a página inicial em instantes.
          </p>
        </div>
      </main>
    </>
  );
}
