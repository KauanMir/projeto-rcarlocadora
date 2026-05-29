const SKELETON_BAR_HEIGHTS = [35, 55, 40, 72, 45, 68, 82, 50, 62, 78, 57, 90];

export default function DashboardLoading() {
  return (
    <div className="px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="h-7 w-28 bg-white/[0.06] rounded animate-pulse" />
        <div className="h-3.5 w-44 bg-white/[0.03] rounded animate-pulse mt-2" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-2.5 w-20 bg-white/[0.05] rounded animate-pulse" />
              <div className="h-5 w-5 bg-white/[0.04] rounded animate-pulse" />
            </div>
            <div>
              <div className="h-8 w-24 bg-white/[0.06] rounded animate-pulse" />
              <div className="h-2.5 w-28 bg-white/[0.03] rounded animate-pulse mt-2" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-6"
          >
            <div className="mb-6">
              <div className="h-2.5 w-32 bg-white/[0.04] rounded animate-pulse mb-2" />
              <div className="h-8 w-28 bg-white/[0.06] rounded animate-pulse" />
              <div className="h-2.5 w-24 bg-white/[0.03] rounded animate-pulse mt-2" />
            </div>
            <div className="flex items-end gap-[3px] h-28">
              {SKELETON_BAR_HEIGHTS.map((h, j) => (
                <div
                  key={j}
                  className="flex-1 bg-white/[0.05] rounded-sm animate-pulse"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-6"
          >
            <div className="h-4 w-32 bg-white/[0.06] rounded animate-pulse mb-5" />
            {Array.from({ length: 5 }).map((_, j) => (
              <div
                key={j}
                className="flex items-center gap-3 py-3 border-b border-white/[0.05] last:border-0"
              >
                <div className="h-3 w-4 bg-white/[0.04] rounded animate-pulse" />
                <div className="flex-1">
                  <div className="h-3 w-28 bg-white/[0.05] rounded animate-pulse mb-1.5" />
                  <div className="h-2.5 w-20 bg-white/[0.03] rounded animate-pulse" />
                </div>
                <div className="h-3 w-14 bg-white/[0.04] rounded animate-pulse" />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="bg-white/[0.025] border border-white/[0.07] rounded-2xl p-6"
          >
            <div className="h-4 w-36 bg-white/[0.06] rounded animate-pulse mb-5" />
            {Array.from({ length: 5 }).map((_, j) => (
              <div
                key={j}
                className="flex items-start gap-3 py-3 border-b border-white/[0.05] last:border-0"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white/[0.1] mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="h-3 w-32 bg-white/[0.05] rounded animate-pulse mb-1.5" />
                  <div className="h-2.5 w-40 bg-white/[0.03] rounded animate-pulse" />
                </div>
                <div className="h-3 w-16 bg-white/[0.04] rounded animate-pulse" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
