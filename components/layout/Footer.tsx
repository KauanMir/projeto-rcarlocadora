import Link from "next/link";
import { SITE_NAME } from "@/utils/constants";

const FOOTER_LINKS = {
  Empresa: [
    { label: "Sobre Nós", href: "#" },
    { label: "Carreiras", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Imprensa", href: "#" },
  ],
  Serviços: [
    { label: "Aluguel por Dia", href: "#" },
    { label: "Mensal", href: "#" },
    { label: "Para Empresas", href: "#" },
    { label: "Aeroporto", href: "#" },
  ],
  Suporte: [
    { label: "Central de Ajuda", href: "#" },
    { label: "Contato", href: "#" },
    { label: "Termos de Uso", href: "#" },
    { label: "Privacidade", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
                <span className="text-black font-black text-sm">R</span>
              </div>
              <span className="text-white font-bold text-xl tracking-widest uppercase">
                {SITE_NAME}
              </span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Mobilidade premium com tecnologia, transparência e frota sempre moderna.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm tracking-widest uppercase mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
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
          ))}
        </div>

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
            <Link href="#" className="text-white/30 hover:text-white text-xs transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
