"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import type { WeddingSettings } from "@/types/database";
import { coupleNames } from "@/lib/utils/names";
import { weddingSchedule } from "@/lib/utils/wedding";

interface GopuramClosingSectionProps {
  wedding: WeddingSettings;
}

/**
 * South Indian Gopuram Footer Scroll Reveal
 *
 * Positioned as the final homepage section directly preceding the footer.
 * Gradually reveals the intricate temple illustration as visitors scroll
 * towards the end of the celebration journey.
 */
export function GopuramClosingSection({ wedding }: { wedding?: WeddingSettings }) {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const names = wedding ? coupleNames(wedding) : { bride: "Priya", groom: "Arjun" };
  const schedule = wedding ? weddingSchedule(wedding) : null;
  const dateLabel = schedule?.dateLabel ?? "December 1, 2026";

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end end"],
  });

  // Closing content animations: appears first as the section enters the viewport
  const contentOpacityTransform = useTransform(scrollYProgress, [0.08, 0.35], [0, 1]);
  const contentYTransform = useTransform(scrollYProgress, [0.08, 0.35], [28, 0]);

  // Temple artwork animations: upper spires emerge, followed by the full gopuram
  const templeOpacityTransform = useTransform(scrollYProgress, [0.15, 0.7], [0.2, 1]);
  const templeYTransform = useTransform(scrollYProgress, [0.15, 0.95], [60, 0]);

  const contentOpacity = shouldReduceMotion ? 1 : contentOpacityTransform;
  const contentY = shouldReduceMotion ? 0 : contentYTransform;
  const templeOpacity = shouldReduceMotion ? 1 : templeOpacityTransform;
  const templeY = shouldReduceMotion ? 0 : templeYTransform;

  return (
    <section
      ref={sectionRef}
      aria-label="Wedding celebration conclusion"
      className="relative w-full overflow-hidden bg-warm-ivory pt-20 pb-0 sm:pt-28 lg:pt-36"
    >
      {/* 6. Closing content above the temple artwork */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <motion.div style={{ opacity: contentOpacity, y: contentY }}>
          {/* Subtle Champagne Gold Flourish */}
          <div
            aria-hidden="true"
            className="mx-auto mb-6 flex items-center justify-center gap-3 text-champagne-gold select-none"
          >
            <span className="h-px w-10 sm:w-14 bg-champagne-gold/40" />
            <span className="text-[12px] tracking-[0.3em] font-serif">✦</span>
            <span className="h-px w-10 sm:w-14 bg-champagne-gold/40" />
          </div>

          <h2 className="font-serif text-[34px] leading-tight text-dark-walnut sm:text-[46px] lg:text-[54px] tracking-tight">
            With Love,{" "}
            <span className="italic font-normal">
              {names.bride} &amp; {names.groom}
            </span>
          </h2>

          <p className="mt-4 font-sans text-body text-secondary-text sm:text-[17px] max-w-[44ch] mx-auto text-balance">
            Thank you for being part of our special celebration.
          </p>

          <p className="mt-4 font-serif text-[14px] sm:text-[15px] tracking-[0.25em] text-champagne-gold uppercase">
            {dateLabel}
          </p>
        </motion.div>
      </div>

      {/* 4 & 5. Gopuram Temple Illustration Container */}
      <div className="relative mt-8 sm:mt-12 lg:mt-14 w-full flex justify-center overflow-hidden">
        <motion.div
          style={{
            opacity: templeOpacity,
            y: templeY,
          }}
          className="relative w-full flex justify-center"
        >
          {/*
            Illustration composition:
            - Desktop: Full available width (up to 1400px), central Gopuram as focal point.
            - Mobile: Responsive sizing preserving central Gopuram height and readability.
            - Bottom alignment: Image rests naturally along the bottom of the section.
          */}
          <div className="relative w-full max-w-[1400px] flex justify-center [mask-image:linear-gradient(to_right,transparent_0%,black_3%,black_97%,transparent_100%)]">
            <Image
              src="/images/gopuram-illustration.webp"
              alt="Traditional South Indian temple Gopuram illustration celebrating Priya and Arjun's wedding"
              width={1240}
              height={721}
              loading="lazy"
              decoding="async"
              sizes="(min-width: 1400px) 1400px, 100vw"
              className="w-auto h-[320px] min-w-[620px] max-w-none sm:h-auto sm:w-full sm:min-w-0 object-contain object-bottom select-none pointer-events-none"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
