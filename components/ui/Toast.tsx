"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useToastStore, type Toast, type ToastType } from "@/store/toastStore";

const TOAST_STYLES: Record<ToastType, { border: string; icon: string; iconColor: string }> = {
  success: { border: "border-l-[#25D366]", icon: "✓", iconColor: "text-[#25D366]" },
  error:   { border: "border-l-red-400",   icon: "✕", iconColor: "text-red-400" },
  warning: { border: "border-l-amber-400", icon: "⚠", iconColor: "text-amber-400" },
  info:    { border: "border-l-blue-400",  icon: "ℹ", iconColor: "text-blue-400" },
};

const DISMISS_DELAY = 4500;

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove);
  const { border, icon, iconColor } = TOAST_STYLES[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => remove(toast.id), DISMISS_DELAY);
    return () => clearTimeout(timer);
  }, [toast.id, remove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.97 }}
      transition={{ type: "spring", damping: 28, stiffness: 380 }}
      role="alert"
      aria-live="assertive"
      className={`flex items-start gap-3 pl-4 pr-3 py-3.5 rounded-xl border-l-[3px] ${border}`}
      style={{
        background: "rgba(10,10,10,0.94)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.065)",
      }}
    >
      <span className={`text-sm font-bold shrink-0 mt-0.5 ${iconColor}`} aria-hidden="true">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm leading-snug">{toast.title}</p>
        {toast.message && (
          <p className="text-white/45 text-xs mt-0.5 leading-relaxed">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => remove(toast.id)}
        aria-label="Fechar notificação"
        className="shrink-0 text-white/25 hover:text-white/60 transition-colors text-sm leading-none p-1 -mr-1"
      >
        ✕
      </button>
    </motion.div>
  );
}

export function ToastProvider() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      aria-label="Notificações"
      className="fixed z-[9999] flex flex-col gap-2 pointer-events-none
        bottom-24 left-3 right-3
        sm:bottom-6 sm:left-auto sm:right-5 sm:w-[340px]"
    >
      <AnimatePresence initial={false} mode="sync">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
