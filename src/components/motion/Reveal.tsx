"use client";

import { MotionConfig, motion, useReducedMotion } from "framer-motion";
import { EDITORIAL_EASE, getPresetVariants, type AnimationPreset } from "@/lib/animations/presets";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/**
 * Editorial scroll-triggered entrance with support for directional slides,
 * zoom reveals, and replay on re-entry when scrolling back up and down.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  y = 24,
  as = "div",
  preset,
  replay = true,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
  as?: "div" | "li" | "section" | "article";
  preset?: AnimationPreset;
  replay?: boolean;
}) {
  const reduce = useReducedMotion();
  const Comp =
    as === "li"
      ? motion.li
      : as === "section"
      ? motion.section
      : as === "article"
      ? motion.article
      : motion.div;

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  // If a preset is explicitly passed, use it, else default to y rise + fade
  const variants = preset
    ? getPresetVariants(preset, y)
    : {
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0 },
      };

  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: !replay, amount: 0.15, margin: "0px 0px -6% 0px" }}
      variants={variants}
      transition={{ duration: 0.85, delay, ease: EDITORIAL_EASE }}
    >
      {children}
    </Comp>
  );
}

/**
 * Editorial image reveal: unmasks from the bottom edge with a subtle
 * settling scale transition. Supports replay on re-entry.
 */
export function ImageReveal({
  children,
  className,
  delay = 0,
  preset,
  replay = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  preset?: AnimationPreset;
  replay?: boolean;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  const variants = preset
    ? getPresetVariants(preset, 32)
    : {
        hidden: { opacity: 0, clipPath: "inset(12% 0% 0% 0%)", scale: 0.98 },
        visible: { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", scale: 1 },
      };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: !replay, amount: 0.15, margin: "0px 0px -6% 0px" }}
      variants={variants}
      transition={{ duration: 1.1, delay, ease: EDITORIAL_EASE }}
    >
      {children}
    </motion.div>
  );
}
