const VEHICLE_COL = 176;
const DAY_W = 36;
const DAYS = 31;

export default function CalendarLoading() {
  return (
    <div className="px-6 py-8">
      {/* Page header skeleton */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="h-7 w-28 bg-white/[0.06] rounded animate-pulse" />
          <div className="h-3.5 w-48 bg-white/[0.03] rounded animate-pulse mt-2" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-white/[0.04] rounded animate-pulse" />
          <div className="h-8 w-32 bg-white/[0.06] rounded animate-pulse" />
          <div className="h-8 w-8 bg-white/[0.04] rounded animate-pulse" />
        </div>
      </div>

      {/* Calendar skeleton */}
      <div className="flex rounded-xl overflow-hidden border border-white/[0.07]">
        {/* Vehicle column */}
        <div style={{ minWidth: VEHICLE_COL, width: VEHICLE_COL }} className="shrink-0 border-r border-white/[0.07]">
          {/* header cell */}
          <div className="h-14 border-b border-white/[0.07] bg-white/[0.02]" />
          {[120, 100, 140, 110].map((w, i) => (
            <div key={i} className="h-14 border-b border-white/[0.04] px-4 flex items-center">
              <div className="h-3.5 bg-white/[0.05] rounded animate-pulse" style={{ width: w }} />
            </div>
          ))}
        </div>

        {/* Days area */}
        <div className="flex-1 overflow-hidden">
          {/* Day header */}
          <div className="flex h-14 border-b border-white/[0.07] bg-white/[0.02]">
            {Array.from({ length: DAYS }, (_, i) => (
              <div key={i} style={{ minWidth: DAY_W, width: DAY_W }} className="flex flex-col items-center justify-end pb-2 gap-0.5">
                <div className="h-3 w-4 bg-white/[0.06] rounded animate-pulse" />
                <div className="h-2 w-5 bg-white/[0.03] rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Vehicle rows */}
          {[
            { left: "5%",  width: "25%" },
            { left: "35%", width: "30%" },
            { left: "10%", width: "20%" },
            { left: "55%", width: "22%" },
          ].map((bar, i) => (
            <div key={i} className="relative h-14 border-b border-white/[0.04]">
              <div
                className="absolute h-8 rounded-md bg-white/[0.05] animate-pulse"
                style={{ left: bar.left, width: bar.width, top: 11 }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
