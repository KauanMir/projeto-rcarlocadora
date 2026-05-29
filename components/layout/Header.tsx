"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { NAV_LINKS, SITE_NAME } from "@/utils/constants";
import { LogoMark } from "@/components/brand/LogoMark";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
      style={scrolled ? { background: "rgba(8,8,8,0.94)", backdropFilter: "blur(20px)" } : {}}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="transition-transform duration-200 group-hover:scale-95">
            <LogoMark size={32} />
          </div>
          <span className="text-white font-bold text-lg tracking-[0.22em] uppercase">
            {SITE_NAME}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/50 hover:text-white text-sm font-medium transition-colors duration-200 tracking-[0.06em]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="#reserva"
            className={cn(
              buttonVariants({ size: "default" }),
              "bg-[#ffb800] hover:bg-[#e0a200] text-black active:scale-[0.97] font-semibold tracking-[0.06em] rounded-sm px-6 transition-all"
            )}
          >
            Reserve Agora
          </Link>
        </div>

        <button
          className="md:hidden text-white p-2"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Menu"
        >
          <div className="w-5 space-y-1.5">
            <span
              className={`block h-px bg-white transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block h-px bg-white transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-px bg-white transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </div>
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-black/95 border-t border-white/10 px-6 py-4 flex flex-col gap-4"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/70 hover:text-white text-sm font-medium py-2 border-b border-white/5"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#reserva"
            className={cn(
              buttonVariants({ size: "default" }),
              "bg-[#ffb800] hover:bg-[#e0a200] text-black font-semibold tracking-wide rounded-sm mt-2"
            )}
          >
            Reserve Agora
          </Link>
        </motion.div>
      )}
    </motion.header>
  );
}
