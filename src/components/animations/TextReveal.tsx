"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EDITORIAL_EASE } from "@/lib/animations/presets";

export function TextReveal({
  text,
  className = "",
  as = "h2",
  delay = 0,
  stagger = 0.05,
  replay = true,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  delay?: number;
  stagger?: number;
  replay?: boolean;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  const Tag = as;

  if (reduce) {
    return <Tag className={className}>{text}</Tag>;
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

  const wordVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: EDITORIAL_EASE },
    },
  };

  return (
    <Tag className={className} aria-label={text}>
      <motion.span
        className="inline-block"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: !replay, amount: 0.3 }}
        variants={containerVariants}
        aria-hidden="true"
      >
        {words.map((word, i) => (
          <motion.span
            key={i}
            variants={wordVariants}
            className="inline-block mr-[0.28em] last:mr-0"
          >
            {word}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}
