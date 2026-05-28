const CONFIG: Record<string, { label: string; className: string }> = {
  PENDING:   { label: "Pendente",   className: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
  CONFIRMED: { label: "Confirmada", className: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
  FINISHED:  { label: "Concluída",  className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  CANCELLED: { label: "Cancelada",  className: "bg-red-500/15 text-red-400 border-red-500/25" },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = CONFIG[status] ?? { label: status, className: "bg-white/10 text-white/40 border-white/10" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold tracking-[0.12em] uppercase border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
