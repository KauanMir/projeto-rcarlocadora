export default function LeadsLoading() {
  return (
    <div className="px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="h-7 w-20 bg-white/[0.06] rounded animate-pulse" />
        <div className="h-3.5 w-52 bg-white/[0.03] rounded animate-pulse mt-2" />
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-8 bg-white/[0.04] rounded-lg animate-pulse"
            style={{ width: [52, 68, 80, 90, 68, 72][i] }}
          />
        ))}
      </div>

      {/* Search */}
      <div className="h-10 w-80 bg-white/[0.04] rounded-xl animate-pulse mb-5" />

      {/* Table */}
      <div className="rounded-xl border border-white/[0.08] overflow-hidden">
        {/* Header */}
        <div
          className="flex border-b border-white/[0.07] px-5 py-3.5 gap-4"
          style={{ background: "rgba(255,255,255,0.015)" }}
        >
          {[120, 140, 90, 100, 80].map((w, i) => (
            <div
              key={i}
              className="h-2.5 bg-white/[0.05] rounded animate-pulse"
              style={{ width: w }}
            />
          ))}
        </div>

        {/* Rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center px-5 py-4 border-b border-white/[0.04] last:border-0 gap-4"
          >
            <div className="flex flex-col gap-1.5" style={{ minWidth: 120 }}>
              <div className="h-3.5 w-28 bg-white/[0.06] rounded animate-pulse" />
              <div className="h-2.5 w-24 bg-white/[0.03] rounded animate-pulse" />
            </div>
            <div className="flex flex-col gap-1.5" style={{ minWidth: 140 }}>
              <div className="h-3 w-32 bg-white/[0.05] rounded animate-pulse" />
              <div className="h-2.5 w-24 bg-white/[0.03] rounded animate-pulse" />
            </div>
            <div className="h-6 w-24 bg-white/[0.04] rounded-md animate-pulse" />
            <div className="h-3 w-28 bg-white/[0.03] rounded animate-pulse" />
            <div className="h-3 w-20 bg-white/[0.03] rounded animate-pulse" />
            <div className="w-8 h-8 bg-white/[0.04] rounded-lg animate-pulse ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
