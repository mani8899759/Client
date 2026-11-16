"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EDITORIAL_EASE } from "@/lib/animations/presets";

export function StaggerGroup({
  children,
  stagger = 0.08,
  delay = 0,
  replay = true,
  className = "",
  as = "div",
}: {
  children: React.ReactNode;
  stagger?: number;
  delay?: number;
  replay?: boolean;
  className?: string;
  as?: "div" | "ul" | "ol" | "section";
}) {
  const reduce = useReducedMotion();

  const Comp =
    as === "ul"
      ? motion.ul
      : as === "ol"
      ? motion.ol
      : as === "section"
      ? motion.section
      : motion.div;

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: !replay, amount: 0.15 }}
      variants={containerVariants}
    >
      {children}
    </Comp>
  );
}

export function StaggerItem({
  children,
  className = "",
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const reduce = useReducedMotion();
  const Comp = as === "li" ? motion.li : motion.div;

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: EDITORIAL_EASE },
    },
  };

  return (
    <Comp className={className} variants={itemVariants}>
      {children}
    </Comp>
  );
}
