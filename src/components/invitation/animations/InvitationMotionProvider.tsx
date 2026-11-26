"use client";

import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type MotionContextValue = {
  lenis: Lenis | null;
  scrollTo: (target: string | HTMLElement, offset?: number) => void;
  isReducedMotion: boolean;
};

const MotionContext = createContext<MotionContextValue>({
  lenis: null,
  scrollTo: () => {},
  isReducedMotion: false,
});

export function useInvitationMotion() {
  return useContext(MotionContext);
}

function subscribeReducedMotion(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener?.("change", cb);
  return () => mq.removeEventListener?.("change", cb);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function InvitationMotionProvider({
  children,
  active = true,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const isReduced = useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, () => false);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || isReduced || !active) return;

    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis smooth scroll specifically for the invitation experience
    // Preserve native touch scrolling on mobile to avoid stutter/lag
    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
      syncTouch: false,
      autoRaf: false, // Explicitly false: driven by GSAP ticker for frame-perfect sync
    });

    lenisRef.current = lenis;
    const initTimer = setTimeout(() => setLenisInstance(lenis), 0);

    // Sync Lenis scroll events to GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis from GSAP unified ticker
    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    // Delayed refresh to handle initial layout measurements
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 400);

    return () => {
      clearTimeout(initTimer);
      clearTimeout(refreshTimer);

      // Clean up GSAP ticker callback
      gsap.ticker.remove(onTick);

      // Destroy Lenis
      lenis.destroy();
      lenisRef.current = null;

      // Kill all invitation-scoped ScrollTriggers
      ScrollTrigger.getAll().forEach((trigger) => {
        const id = trigger.vars.id;
        if (!id || id.startsWith("invitation-")) {
          trigger.kill();
        }
      });
      ScrollTrigger.clearMatchMedia?.();
    };
  }, [active, isReduced]);

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
    <MotionContext.Provider
      value={{
        lenis: lenisInstance,
        scrollTo,
        isReducedMotion: isReduced,
      }}
    >
      <div className="invitation-motion-scope">{children}</div>
    </MotionContext.Provider>
  );
}
