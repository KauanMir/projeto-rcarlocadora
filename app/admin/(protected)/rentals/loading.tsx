const FILTERS = [52, 80, 60, 80, 80];

export default function RentalsLoading() {
  return (
    <div className="px-6 py-8">
      <div className="mb-8">
        <div className="h-7 w-24 bg-white/[0.06] rounded animate-pulse" />
        <div className="h-3.5 w-52 bg-white/[0.03] rounded animate-pulse mt-2" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {FILTERS.map((w, i) => (
          <div key={i} className="h-8 bg-white/[0.04] rounded-lg animate-pulse" style={{ width: w }} />
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/[0.08] overflow-hidden">
        <div className="flex px-5 py-3.5 border-b border-white/[0.07]" style={{ background: "rgba(255,255,255,0.015)" }}>
          {[80, 110, 120, 100, 80, 100].map((w, i) => (
            <div key={i} className="h-2.5 bg-white/[0.05] rounded animate-pulse mr-8" style={{ width: w }} />
          ))}
        </div>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center px-5 py-4 border-b border-white/[0.04] last:border-0 gap-8">
            <div className="flex flex-col gap-1.5" style={{ minWidth: 80 }}>
              <div className="h-3.5 w-24 bg-white/[0.06] rounded animate-pulse" />
              <div className="h-2.5 w-20 bg-white/[0.03] rounded animate-pulse" />
            </div>
            <div className="flex flex-col gap-1.5" style={{ minWidth: 110 }}>
              <div className="h-3 w-28 bg-white/[0.05] rounded animate-pulse" />
              <div className="h-2.5 w-20 bg-white/[0.03] rounded animate-pulse" />
            </div>
            <div className="h-3 w-28 bg-white/[0.04] rounded animate-pulse" />
            <div className="h-3 w-20 bg-white/[0.04] rounded animate-pulse" />
            <div className="h-6 w-20 bg-white/[0.04] rounded-md animate-pulse" />
            <div className="flex gap-1.5 ml-auto">
              <div className="h-7 w-16 bg-white/[0.04] rounded-md animate-pulse" />
              <div className="h-7 w-16 bg-white/[0.04] rounded-md animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
