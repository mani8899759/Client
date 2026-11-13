"use client";

import { motion } from "framer-motion";

/** Hero entrance for the masthead copy. */
export function HeroText({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="mx-auto max-w-[760px] text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
