"use client";

// Drop your official logo at public/logo.png and this component will pick it up automatically.
// Until then it renders the "R" fallback badge.

import { useState } from "react";

export function LogoMark({ size = 32 }: { size?: number }) {
  const [useFallback, setUseFallback] = useState(false);

  if (!useFallback) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/logo.png"
        alt="RCAR"
        // Preserve aspect ratio: height fixed, width auto (logo is 4000×2500 — horizontal)
        style={{ height: size, width: "auto", maxWidth: size * 5 }}
        className="object-contain shrink-0"
        onError={() => setUseFallback(true)}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="bg-white rounded-sm flex items-center justify-center shrink-0"
      aria-label="RCAR"
    >
      <span className="text-black font-black" style={{ fontSize: Math.round(size * 0.44) }}>
        R
      </span>
    </div>
  );
}
