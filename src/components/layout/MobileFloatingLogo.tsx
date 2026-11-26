"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { OFFICIAL_LOGO } from "@/config/logo";

const RESOLVED_KEY = "manikanta_sravika_guest_interest_resolved";

/**
 * Minimal, non-intrusive floating wedding logo pinned near the bottom-right
 * corner on mobile viewports. Respects safe-area insets, sits behind the
 * full-screen navigation overlay (z-40 < z-[100]), and shifts upward if the
 * global bottom interest bar is currently open.
 */
export function MobileFloatingLogo({
  logoUrl = OFFICIAL_LOGO.src,
  enabled = true,
  width = OFFICIAL_LOGO.defaultMobileSize,
  bottom = OFFICIAL_LOGO.defaultMobileBottom,
  right = OFFICIAL_LOGO.defaultMobileRight,
}: {
  logoUrl?: string | null;
  enabled?: boolean;
  width?: number;
  bottom?: number;
  right?: number;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [interestBarOpen, setInterestBarOpen] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setMounted(true);
      try {
        setInterestBarOpen(localStorage.getItem(RESOLVED_KEY) !== "true");
      } catch {
        setInterestBarOpen(false);
      }
    });

    const onResolved = () => setInterestBarOpen(false);
    window.addEventListener("wedding:interest-bar-resolved", onResolved);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wedding:interest-bar-resolved", onResolved);
    };
  }, []);

  if (!enabled || !logoUrl || !mounted) return null;
  // Never overlap invitation music player or admin screens
  if (pathname?.startsWith("/invitation") || pathname?.startsWith("/admin")) return null;

  const clampedWidth = Math.min(180, Math.max(64, width));
  const computedHeight = Math.round(clampedWidth / OFFICIAL_LOGO.aspectRatio);
  const clampedBottom = Math.min(120, Math.max(8, bottom));
  const clampedRight = Math.min(64, Math.max(8, right));
  const effectiveBottom = interestBarOpen ? Math.max(clampedBottom, 76) : clampedBottom;

  return (
    <div
      aria-hidden="true"
      className="mobile-floating-wedding-logo pointer-events-none fixed z-40 flex items-center justify-center select-none transition-[bottom] duration-300 lg:hidden"
      style={{
        right: `${clampedRight}px`,
        bottom: `calc(${effectiveBottom}px + env(safe-area-inset-bottom))`,
        width: `${clampedWidth}px`,
        height: `${computedHeight}px`,
      }}
    >
      <Image
        src={logoUrl}
        alt=""
        width={OFFICIAL_LOGO.width}
        height={OFFICIAL_LOGO.height}
        className="h-full w-full object-contain opacity-90"
      />
    </div>
  );
}
