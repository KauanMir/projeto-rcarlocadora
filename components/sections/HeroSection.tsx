"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useBookingStore } from "@/store/bookingStore";
import { todayLocal } from "@/utils/dates";

export function HeroSection() {
  const router = useRouter();
  const { setPickupDate, setReturnDate, setStep } = useBookingStore();

  const [heroPickup, setHeroPickup] = useState("");
  const [heroReturn, setHeroReturn] = useState("");
  const today = todayLocal();

  function handleSearch() {
    if (heroPickup) setPickupDate(heroPickup);
    if (heroReturn) setReturnDate(heroReturn);
    setStep(heroPickup && heroReturn ? 2 : 1);
    router.push("/booking");
  }

  return (
    <section id="inicio" className="relative min-h-screen flex flex-col justify-center bg-[#080808] overflow-hidden">

      {/* ── Ambient spotlight (top-right) ── */}
      <div className="animate-ambient absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.035) 0%, transparent 70%)", filter: "blur(1px)" }}
      />

      {/* ── Warm secondary ambient (bottom-left) ── */}
      <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full pointer-events-none opacity-60"
        style={{ background: "radial-gradient(circle, rgba(255,245,220,0.018) 0%, transparent 70%)" }}
      />

      {/* ── Perspective floor grid ── */}
      <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)",
        }}
      />

      {/* ── Vignette overlay ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)" }}
      />

      {/* ── Top edge gradient line ── */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* ── Horizontal sweep line ── */}
      <div className="absolute bottom-32 left-0 right-0 h-px overflow-hidden pointer-events-none">
        <div className="animate-sweep h-full w-40 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: copy ── */}
          <div className="flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center gap-2.5 border border-white/15 rounded-full px-4 py-1.5 w-fit backdrop-blur-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
              <span className="text-white/60 text-xs tracking-[0.18em] uppercase font-medium">
                Frota 100% Revisada
              </span>
            </motion.div>

            <div className="overflow-hidden">
              <motion.h1
                initial={{ opacity: 0, y: 48 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                className="text-[clamp(3rem,7vw,5.5rem)] font-black text-white leading-[0.95] tracking-tight"
              >
                Aluguel
                <br />
                <span className="text-white/25">de Veículos.</span>
                <br />
                Gama-DF.
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="text-white/45 text-lg leading-relaxed max-w-md"
            >
              Reserve o veículo ideal para sua viagem. Frota variada e
              atendimento pelo WhatsApp.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link
                href="#frota"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-white text-black hover:bg-white/90 active:scale-[0.98] font-semibold tracking-wide rounded-sm px-8 h-12 transition-all"
                )}
              >
                Ver Frota
              </Link>
              <Link
                href="#como-funciona"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-white/15 text-white/70 hover:text-white hover:bg-white/[0.06] hover:border-white/30 active:scale-[0.98] font-medium tracking-wide rounded-sm px-8 h-12 bg-transparent transition-all"
                )}
              >
                Como Funciona
              </Link>
            </motion.div>
          </div>

          {/* ── Right: reservation form ── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            id="reserva"
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.025)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.07), 0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
              backdropFilter: "blur(24px)",
            }}
          >
            {/* inner glow top edge */}
            <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="p-8">
              <div className="mb-7">
                <h2 className="text-white font-bold text-xl mb-1 tracking-tight">
                  Reserve seu veículo
                </h2>
                <p className="text-white/35 text-sm">
                  Rápido, seguro e sem burocracia.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {/* Location — single point, Gama-DF */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-white/40 text-[10px] tracking-[0.16em] uppercase font-semibold">
                    Local de Retirada
                  </label>
                  <div className="w-full bg-white/[0.05] border border-white/[0.08] rounded-sm text-white text-sm px-4 py-3.5 flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" aria-hidden />
                    Gama-DF
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Retirada", value: heroPickup, min: today, onChange: setHeroPickup },
                    { label: "Devolução", value: heroReturn, min: heroPickup || today, onChange: setHeroReturn },
                  ].map((field) => (
                    <div key={field.label} className="flex flex-col gap-1.5">
                      <label className="text-white/40 text-[10px] tracking-[0.16em] uppercase font-semibold">
                        {field.label}
                      </label>
                      <input
                        type="date"
                        min={field.min}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-full bg-white/[0.05] border border-white/[0.08] hover:border-white/20 rounded-sm text-white text-sm px-4 py-3.5 outline-none focus:border-white/25 transition-colors [color-scheme:dark]"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-white/40 text-[10px] tracking-[0.16em] uppercase font-semibold">
                    Categoria
                  </label>
                  <select
                    className="w-full bg-white/[0.05] border border-white/[0.08] hover:border-white/20 rounded-sm text-white text-sm px-4 py-3.5 outline-none focus:border-white/25 transition-colors appearance-none cursor-pointer"
                    style={{ colorScheme: "dark" }}
                  >
                    <option value="" className="bg-zinc-950">Todos os veículos</option>
                    <option value="economy" className="bg-zinc-950">Econômico</option>
                    <option value="sedan" className="bg-zinc-950">Sedan</option>
                    <option value="suv" className="bg-zinc-950">SUV</option>
                    <option value="minivan" className="bg-zinc-950">Minivan</option>
                    <option value="pickup" className="bg-zinc-950">Picape</option>
                  </select>
                </div>

                <button
                  onClick={handleSearch}
                  className="w-full bg-white text-black hover:bg-white/90 active:scale-[0.98] font-bold tracking-wide rounded-sm h-12 mt-1 text-sm transition-all"
                >
                  Buscar Veículos
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1.5"
        >
          <div className="w-px h-9 bg-gradient-to-b from-white/20 to-transparent" />
          <span className="text-white/15 text-[9px] tracking-[0.2em] uppercase">Scroll</span>
        </motion.div>
      </div>
    </section>
  );
}
