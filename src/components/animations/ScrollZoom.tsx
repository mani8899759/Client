"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";

export function ScrollZoom({
  children,
  fromScale = 1.0,
  toScale = 1.12,
  className = "",
}: {
  children: React.ReactNode;
  fromScale?: number;
  toScale?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || reduce) return;

    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    const target = targetRef.current;
    if (!container || !target) return;

    const tween = gsap.fromTo(
      target,
      { scale: fromScale },
      {
        scale: toScale,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      }
    );

    return () => {
      tween.kill();
    };
  }, [fromScale, toScale, reduce]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <div ref={targetRef} className="h-full w-full will-change-transform">
        {children}
      </div>
    </div>
  );
}
