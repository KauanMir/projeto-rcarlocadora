"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SHOWROOM_CATEGORIES } from "@/utils/constants";
import { formatPrice } from "@/utils/format";
import type { ShowroomCategory } from "@/types/vehicle";

function CategoryCard({ category, index }: { category: ShowroomCategory; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col bg-[#0a0a0a] border border-white/[0.07] rounded-xl overflow-hidden hover:border-white/20 hover:-translate-y-1 transition-all duration-300"
      style={{ willChange: "transform" }}
    >
      {/* Image area */}
      <div className="relative h-48 bg-[#0d0d0d] overflow-hidden flex-shrink-0">
        {category.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={category.image}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-contain p-5 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
            <span
              className="text-white font-black leading-none tracking-tighter"
              style={{ fontSize: "clamp(56px, 8vw, 72px)", opacity: 0.04 }}
            >
              {category.name.split(" ")[0].toUpperCase()}
            </span>
          </div>
        )}

        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/70 via-transparent to-transparent pointer-events-none" />

        {/* Tag badge */}
        {category.tag && (
          <div className="absolute top-3 left-3 z-10">
            <span className="text-[9px] font-black tracking-[0.15em] uppercase bg-[#ffb800] text-black px-2 py-1 rounded-sm">
              {category.tag}
            </span>
          </div>
        )}

        {/* Price pill */}
        <div
          className="absolute bottom-3 right-3 z-10 rounded-sm px-3 py-2 text-right"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="text-white/35 text-[9px] tracking-[0.12em] uppercase leading-none mb-0.5">a partir de</div>
          <div className="text-white font-black text-lg leading-none">
            {formatPrice(category.pricePerDay)}
            <span className="text-white/35 text-xs font-normal">/dia</span>
          </div>
        </div>
      </div>

      {/* Info area */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div>
          <h3 className="text-white font-bold text-base leading-snug">{category.name}</h3>
          <p className="text-white/30 text-xs mt-1.5 leading-relaxed">
            {category.models.join(" · ")}
          </p>
        </div>

        <div className="mt-auto pt-1">
          <Link
            href={`/booking?category=${category.dbCategory}`}
            className="flex w-full h-10 items-center justify-center bg-white text-black hover:bg-[#ffb800] active:scale-[0.97] font-semibold rounded-sm text-xs tracking-[0.06em] uppercase transition-all duration-200"
          >
            Reservar
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function VehiclesSection() {
  return (
    <section id="frota" className="bg-[#080808] py-28 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-white/25 text-[10px] tracking-[0.2em] uppercase font-semibold mb-4">
              Nossa Frota
            </p>
            <h2
              className="text-white font-black leading-[0.95] tracking-tight"
              style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)" }}
            >
              Escolha sua
              <br />
              <span className="text-white/25">categoria ideal.</span>
            </h2>
            <p className="text-white/35 text-sm mt-5 max-w-lg leading-relaxed">
              Trabalhamos com categorias de veículos — você reserva a categoria e
              recebe o melhor modelo disponível. Garantia de qualidade e conforto.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SHOWROOM_CATEGORIES.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-14 text-center"
        >
          <p className="text-white/20 text-xs tracking-[0.12em] uppercase">
            Todos os veículos com ar-condicionado · Manutenção em dia · Documentação regularizada
          </p>
        </motion.div>
      </div>
    </section>
  );
}
