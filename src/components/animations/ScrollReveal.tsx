"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EDITORIAL_EASE, getPresetVariants, type AnimationPreset } from "@/lib/animations/presets";

export function ScrollReveal({
  children,
  preset = "fade-up",
  delay = 0,
  duration = 0.8,
  distance = 32,
  replay = true,
  amount = 0.18,
  className = "",
  as = "div",
}: {
  children: React.ReactNode;
  preset?: AnimationPreset;
  delay?: number;
  duration?: number;
  distance?: number;
  replay?: boolean;
  amount?: number | "some" | "all";
  className?: string;
  as?: "div" | "li" | "section" | "article" | "header";
}) {
  const reduce = useReducedMotion();
  const variants = getPresetVariants(preset, distance);

  const Comp =
    as === "li"
      ? motion.li
      : as === "section"
      ? motion.section
      : as === "article"
      ? motion.article
      : as === "header"
      ? motion.header
      : motion.div;

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: !replay, amount, margin: "0px 0px -6% 0px" }}
      variants={variants}
      transition={{ duration, delay, ease: EDITORIAL_EASE }}
    >
      {children}
    </Comp>
  );
}
