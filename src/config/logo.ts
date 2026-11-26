/**
 * Central configuration for the official Manikanta & Sravika wedding logo.
 * Preserves the exact uploaded asset dimensions (765×168, transparent RGBA) and aspect ratio.
 */
export const OFFICIAL_LOGO = {
  src: "/images/wedding-logo.webp",
  fallbackSrc: "/images/wedding-logo.png",
  alt: "Snap Diaries Photography — Official Wedding Logo",
  width: 765,
  height: 168,
  aspectRatio: 765 / 168,
  defaultHeaderSize: 28,
  defaultMobileSize: 108,
  defaultMobileBottom: 16,
  defaultMobileRight: 16,
} as const;
