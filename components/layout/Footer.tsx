import Link from "next/link";
import { SITE_NAME } from "@/utils/constants";
import { LogoMark } from "@/components/brand/LogoMark";

const WHATSAPP_HREF = "https://wa.link/jn6p0u";
const INSTAGRAM_HREF = "https://www.instagram.com/rcar.alugueldecarros/";
const INSTAGRAM_HANDLE = "@rcar.alugueldecarros";

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* ── Brand ── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <LogoMark size={32} />
              <span className="text-white font-bold text-xl tracking-widest uppercase">
                {SITE_NAME}
              </span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Aluguel de veículos em Gama-DF. Reservas rápidas e atendimento direto pelo WhatsApp.
            </p>

            {/* Social */}
            <div className="flex flex-col gap-2.5 mt-5">
              <a
                href={INSTAGRAM_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-white/40 hover:text-white text-sm transition-colors w-fit"
              >
                <span aria-hidden className="text-base">📸</span>
                <span>{INSTAGRAM_HANDLE}</span>
              </a>
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-white/40 hover:text-white text-sm transition-colors w-fit"
              >
                <span aria-hidden className="text-base">💬</span>
                <span>Fale conosco pelo WhatsApp</span>
              </a>
            </div>
          </div>

          {/* ── Navegação ── */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-widest uppercase mb-4">
              Navegação
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Ver Frota",       href: "/#frota"          },
                { label: "Como Funciona",   href: "/#como-funciona"  },
                { label: "Reservar",        href: "/booking"         },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/50 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contato ── */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-widest uppercase mb-4">
              Contato
            </h4>
            <ul className="space-y-3">
              <li className="text-white/50 text-sm flex items-start gap-2">
                <span aria-hidden className="mt-0.5">📍</span>
                Gama-DF
              </li>
              <li>
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/50 hover:text-white text-sm transition-colors duration-200 flex items-start gap-2"
                >
                  <span aria-hidden className="mt-0.5">💬</span>
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={INSTAGRAM_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/50 hover:text-white text-sm transition-colors duration-200 flex items-start gap-2"
                >
                  <span aria-hidden className="mt-0.5">📸</span>
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            &copy; {new Date().getFullYear()} {SITE_NAME}. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-white/30 hover:text-white text-xs transition-colors">
              Termos
            </Link>
            <Link href="#" className="text-white/30 hover:text-white text-xs transition-colors">
              Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
