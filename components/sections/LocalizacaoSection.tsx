import Link from "next/link";

const WHATSAPP_HREF = "https://wa.link/jn6p0u";
const INSTAGRAM_HREF = "https://www.instagram.com/rcar.alugueldecarros/";

export function LocalizacaoSection() {
  return (
    <section id="contato" className="bg-[#080808] border-t border-white/[0.04] py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ── Foto da loja ── */}
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.07]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/fachada.png"
              alt="Fachada da RCAR Locadora — Gama, DF"
              className="w-full object-cover"
              style={{ aspectRatio: "4/3" }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to top, rgba(8,8,8,0.4) 0%, transparent 50%)",
              }}
            />
          </div>

          {/* ── Informações ── */}
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-white/25 text-[10px] tracking-[0.2em] uppercase font-semibold mb-3">
                Nossa Localização
              </p>
              <h2
                className="text-white font-black leading-[0.95] tracking-tight"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
              >
                Venha nos
                <br />
                <span className="text-white/25">visitar.</span>
              </h2>
            </div>

            {/* Endereço */}
            <div className="flex flex-col gap-1.5">
              <span className="text-white/25 text-[10px] tracking-[0.16em] uppercase font-semibold">
                Endereço
              </span>
              <p className="text-white/70 text-base leading-relaxed">
                Q 36 Comércio Local A/E
                <br />
                Setor Leste — Gama, DF
              </p>
            </div>

            {/* Contatos */}
            <div className="flex flex-col gap-3">
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-4 rounded-xl border border-white/[0.07] hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "rgba(37,211,102,0.15)" }}
                >
                  <span className="text-lg" aria-hidden>💬</span>
                </div>
                <div>
                  <div className="text-white/70 text-sm font-semibold group-hover:text-white transition-colors">
                    WhatsApp
                  </div>
                  <div className="text-white/30 text-xs">Reservas e atendimento</div>
                </div>
                <span className="ml-auto text-white/20 group-hover:text-white/50 transition-colors text-sm">
                  →
                </span>
              </a>

              <a
                href={INSTAGRAM_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-4 rounded-xl border border-white/[0.07] hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "rgba(131,58,180,0.12)" }}
                >
                  <span className="text-lg" aria-hidden>📸</span>
                </div>
                <div>
                  <div className="text-white/70 text-sm font-semibold group-hover:text-white transition-colors">
                    @rcar.alugueldecarros
                  </div>
                  <div className="text-white/30 text-xs">Siga no Instagram</div>
                </div>
                <span className="ml-auto text-white/20 group-hover:text-white/50 transition-colors text-sm">
                  →
                </span>
              </a>
            </div>

            {/* Reserve CTA */}
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-sm font-semibold text-sm tracking-wide text-black bg-[#ffb800] hover:bg-[#e0a200] transition-all active:scale-[0.98] w-fit"
            >
              Fazer reserva
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
