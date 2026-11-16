"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { WeddingSettings } from "@/types/database";
import { coupleNames } from "@/lib/utils/names";
import { InvitationToran } from "./InvitationToran";

export function InvitationHero({ wedding }: { wedding: WeddingSettings }) {
  const reduce = useReducedMotion();
  const names = coupleNames(wedding);

  return (
    <section
      aria-label="Priya & Arjun Wedding Invitation Hero"
      className="relative w-full overflow-hidden bg-[#fdf5e6]"
    >
      {/* Traditional Mango Leaf & Marigold Toran Garland along the top edge */}
      <div className="absolute top-0 inset-x-0 z-20 pointer-events-none">
        <InvitationToran position="top" />
      </div>

      {/* 
        Full-Width South Indian Gopuram Temple Background:
        - 100% viewport width edge-to-edge
        - Zero side margins, zero boxed containers
        - Full central Gopuram preserved with left & right towers visible
        - Responsive <picture> loading portrait-optimized for mobile & wide landscape for desktop
      */}
      <div className="relative min-h-[660px] sm:min-h-[760px] md:min-h-[840px] lg:min-h-[920px] w-full flex flex-col items-center justify-center pt-20 pb-16 px-4">
        {/* Edge-to-edge Gopuram Temple Illustration */}
        <div className="absolute inset-0 z-0 flex items-end justify-center pointer-events-none select-none overflow-hidden">
          <picture className="size-full">
            <source
              media="(max-width: 640px)"
              srcSet="/images/south-indian-gopuram-hero-mobile.webp"
              type="image/webp"
            />
            <source
              media="(max-width: 640px)"
              srcSet="/images/south-indian-gopuram-hero-mobile.png"
              type="image/png"
            />
            <source
              media="(min-width: 641px)"
              srcSet="/images/south-indian-gopuram-hero-desktop.webp"
              type="image/webp"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/south-indian-gopuram-hero-desktop.png"
              alt="South Indian Temple Gopuram Background"
              className="size-full object-cover sm:object-contain object-bottom"
              loading="eager"
            />
          </picture>
        </div>

        {/* 
          Typography placed DIRECTLY over the Gopuram artwork:
          - Completely removed white panel, backdrop-blur, border, and shadows
          - Exact typography, colors, gold ampersand, and date pill preserved
          - Subtle text shadow provides flawless contrast without any obscuring box
        */}
        <motion.div
          initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 0.61, 0.36, 1] }}
          className="relative z-10 mx-auto max-w-[680px] text-center"
        >
          {/* 1. Auspicious invocation */}
          <motion.p
            initial={reduce ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="font-[family-name:var(--font-script)] text-[32px] sm:text-[40px] text-[#8b1a1a] drop-shadow-[0_1px_3px_rgba(253,245,230,0.95)]"
          >
            Shree Ganeshaya Namah
          </motion.p>

          {/* 2. Couple Names with Gold Ampersand */}
          <div className="mt-3 flex flex-col items-center justify-center">
            <h1 className="font-[family-name:var(--font-playfair)] text-[46px] sm:text-[66px] lg:text-[76px] font-bold tracking-tight text-[#8b1a1a] drop-shadow-[0_2px_4px_rgba(253,245,230,0.9)]">
              {names.bride.toUpperCase()}
            </h1>

            <span className="my-0.5 font-[family-name:var(--font-script)] text-[38px] sm:text-[54px] font-normal text-[#d4a843] drop-shadow-[0_1px_3px_rgba(253,245,230,0.95)]">
              &amp;
            </span>

            <h2 className="font-[family-name:var(--font-playfair)] text-[46px] sm:text-[66px] lg:text-[76px] font-bold tracking-tight text-[#8b1a1a] drop-shadow-[0_2px_4px_rgba(253,245,230,0.9)]">
              {names.groom.toUpperCase()}
            </h2>
          </div>

          {/* 3. Decorative Divider */}
          <div className="mx-auto my-4 flex items-center justify-center gap-3 text-[#d4a843]">
            <span className="h-px w-14 bg-[#d4a843] shadow-[0_1px_1px_rgba(253,245,230,0.9)]" />
            <span className="text-[12px] tracking-widest text-[#8b1a1a] uppercase font-bold drop-shadow-[0_1px_2px_rgba(253,245,230,0.95)]">
              • • •
            </span>
            <span className="h-px w-14 bg-[#d4a843] shadow-[0_1px_1px_rgba(253,245,230,0.9)]" />
          </div>

          {/* 4. Subheading */}
          <p className="font-[family-name:var(--font-playfair)] text-[15px] sm:text-[18px] font-semibold tracking-[0.22em] text-[#3d1c00] uppercase drop-shadow-[0_1px_3px_rgba(253,245,230,0.95)]">
            Are Getting Married
          </p>

          {/* 5. Date Pill */}
          <div className="mt-4 inline-block rounded-full border border-[#d4a843] bg-[#f5ebd5]/90 px-7 py-2 shadow-2xs">
            <p className="font-[family-name:var(--font-serif)] text-[16px] sm:text-[18px] font-bold tracking-[0.12em] text-[#8b1a1a]">
              DECEMBER 1, 2026
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
