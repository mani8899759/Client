"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";

export function ParallaxImage({
  children,
  speed = 0.12,
  className = "",
}: {
  children: React.ReactNode;
  speed?: number;
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

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const distance = container.offsetHeight * speed;

      const tween = gsap.fromTo(
        target,
        { y: -distance },
        {
          y: distance,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.0,
            invalidateOnRefresh: true,
          },
        }
      );

      return () => {
        tween.kill();
      };
    });

    return () => {
      mm.revert();
    };
  }, [speed, reduce]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <div ref={targetRef} className="h-full w-full will-change-transform">
        {children}
      </div>
    </div>
  );
}
