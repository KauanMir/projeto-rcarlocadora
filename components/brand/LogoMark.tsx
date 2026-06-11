"use client";

// logo-v2.png: 1080×1080 square with transparent padding.
// Measured content area: x 12%–88%, y 30%–70%.
// background-image crop: sets background-size to render the full square at
// `fullSize` px, then offsets it so only the content region is visible.
// This guarantees no stretching — the image is always rendered at its natural
// 1:1 ratio, the wrapper is just a viewport into the content area.

const CROP = {
  top:    0.30,  // content starts 30% from top
  left:   0.12,  // content starts 12% from left
  height: 0.40,  // content occupies 40% of image height
  width:  0.76,  // content occupies 76% of image width
} as const;

export function LogoMark({ size = 32 }: { size?: number }) {
  const fullSize = Math.round(size / CROP.height);      // full image rendered size
  const wrapW    = Math.round(fullSize * CROP.width);   // visible wrapper width
  const offX     = Math.round(fullSize * CROP.left);    // horizontal crop offset
  const offY     = Math.round(fullSize * CROP.top);     // vertical crop offset

  return (
    <div
      role="img"
      aria-label="RCAR Locadora de Veículos"
      style={{
        display: "inline-block",
        flexShrink: 0,
        height: size,
        width: wrapW,
        backgroundImage: "url('/logo-v2.png')",
        backgroundSize: `${fullSize}px ${fullSize}px`,
        backgroundPosition: `-${offX}px -${offY}px`,
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}
