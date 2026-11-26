"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type SmoothScrollContextValue = {
  lenis: Lenis | null;
  scrollTo: (target: string | HTMLElement, offset?: number) => void;
  isReducedMotion: boolean;
};

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  scrollTo: () => {},
  isReducedMotion: false,
});

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

// Routes where Lenis must NOT hijack scroll (forms, admin inputs, verification, or dedicated invitation motion provider)
const EXCLUDED_PREFIXES = ["/admin", "/register", "/verify", "/invitation"];

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const [isReduced, setIsReduced] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  const isExcluded = EXCLUDED_PREFIXES.some((prefix) =>
    pathname?.startsWith(prefix)
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReduced(mediaQuery.matches);

    const onMotionChange = (e: MediaQueryListEvent) => {
      setIsReduced(e.matches);
    };
    mediaQuery.addEventListener?.("change", onMotionChange);

    // If user prefers reduced motion or is on an excluded route, use native scrolling
    if (mediaQuery.matches || isExcluded) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        setLenisInstance(null);
      }
      return () => {
        mediaQuery.removeEventListener?.("change", onMotionChange);
      };
    }

    gsap.registerPlugin(ScrollTrigger);

    // Single unified Lenis instance for the public site (native touch preserved on mobile)
    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      syncTouch: false, // Preserve native 60fps mobile touch scrolling
      autoRaf: false, // Driven by GSAP ticker for frame-perfect sync
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);

    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    // Refresh layout measurements after page load / route change
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 450);

    return () => {
      mediaQuery.removeEventListener?.("change", onMotionChange);
      clearTimeout(timer);
      gsap.ticker.remove(onTick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [pathname, isExcluded]);

  const scrollTo = (target: string | HTMLElement, offset: number = 0) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset, duration: 1.2 });
    } else if (typeof window !== "undefined") {
      if (typeof target === "string") {
        const el = document.querySelector(target);
        el?.scrollIntoView({ behavior: "smooth" });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <SmoothScrollContext.Provider
      value={{
        lenis: lenisInstance,
        scrollTo,
        isReducedMotion: isReduced,
      }}
    >
      {children}
    </SmoothScrollContext.Provider>
  );
}
