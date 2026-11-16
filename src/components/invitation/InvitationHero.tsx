"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { WeddingSettings } from "@/types/database";
import { coupleNames } from "@/lib/utils/names";
import { InvitationToran } from "./InvitationToran";

export function InvitationHero({ wedding }: { wedding: WeddingSettings }) {
  const reduce = useReducedMotion();
  const names = coupleNames(wedding);

  return (
    <section
      aria-label="Wedding Invitation Hero"
      className="relative min-h-[580px] w-full overflow-hidden bg-[#fdf5e6] pb-12 sm:min-h-[680px] md:min-h-[760px] lg:min-h-[820px]"
    >
      {/* 1. Traditional Hanging Mango Leaf & Marigold Toran across the top ceiling */}
      <div className="absolute top-0 inset-x-0 z-20">
        <InvitationToran />
      </div>

      {/* 2. Grand South Indian Watercolor Temple Gopuram Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <picture>
          <source
            srcSet="/images/south-indian-gopuram-hero-desktop.webp"
            type="image/webp"
          />
          <Image
            src="/images/south-indian-gopuram-hero-desktop.png"
            alt="Traditional South Indian Temple Gopuram Watercolor Scene with lush greenery and sacred spires"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center sm:object-top"
          />
        </picture>

        {/* Soft, warm cream vignettes to blend top and bottom naturally into #FDF5E6 */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#fdf5e6]/90 via-[#fdf5e6]/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#fdf5e6] via-[#fdf5e6]/70 to-transparent" />
      </div>

      {/* 3. Center Couple Name Plaque over Temple */}
      <div className="relative z-10 mx-auto flex min-h-[580px] max-w-[820px] flex-col items-center justify-center px-4 pt-16 text-center sm:min-h-[680px] md:min-h-[760px] lg:min-h-[820px]">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 25, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
          className="relative max-w-[560px] overflow-hidden rounded-[20px] border border-[#d4a843]/70 bg-[#fffcf7]/85 p-6 shadow-[0_12px_40px_rgba(61,28,0,0.12)] backdrop-blur-[3px] sm:p-10 md:p-12"
        >
          {/* Ornate corner flourishes */}
          <div className="pointer-events-none absolute top-2.5 left-2.5 size-6 border-t-2 border-l-2 border-[#8b1a1a]" />
          <div className="pointer-events-none absolute top-2.5 right-2.5 size-6 border-t-2 border-r-2 border-[#8b1a1a]" />
          <div className="pointer-events-none absolute bottom-2.5 left-2.5 size-6 border-b-2 border-l-2 border-[#8b1a1a]" />
          <div className="pointer-events-none absolute bottom-2.5 right-2.5 size-6 border-b-2 border-r-2 border-[#8b1a1a]" />

          {/* Auspicious Invocation */}
          <p className="font-[family-name:var(--font-script)] text-[24px] text-[#8b1a1a] sm:text-[30px]">
            {wedding.invitation_cover_heading || "A Special Invitation"}
          </p>

          <div className="mx-auto my-2 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-[#d4a843]" />
            <span className="size-1.5 rounded-full bg-[#8b1a1a]" />
            <span className="h-px w-10 bg-[#d4a843]" />
          </div>

          {/* Prominent Couple Names */}
          <div className="mt-2 space-y-1">
            <h1 className="font-[family-name:var(--font-playfair)] text-[42px] font-bold tracking-[0.06em] text-[#8b1a1a] sm:text-[58px] md:text-[66px] uppercase drop-shadow-2xs">
              {names.groom}
            </h1>
            <div className="font-[family-name:var(--font-script)] text-[36px] font-normal leading-none text-[#d4a843] sm:text-[46px]">
              &amp;
            </div>
            <h1 className="font-[family-name:var(--font-playfair)] text-[42px] font-bold tracking-[0.06em] text-[#8b1a1a] sm:text-[58px] md:text-[66px] uppercase drop-shadow-2xs">
              {names.bride}
            </h1>
          </div>

          {/* Announcement and Main Date */}
          <div className="mt-6 border-t border-[#d4a843]/50 pt-5">
            <p className="font-[family-name:var(--font-serif)] text-[15px] font-medium tracking-[0.2em] text-[#5c4033] uppercase sm:text-[17px]">
              Are Getting Married
            </p>
            <div className="mt-3 inline-block rounded-full border border-[#d4a843] bg-[#f5ebd5] px-6 py-1.5 shadow-2xs">
              <p className="font-[family-name:var(--font-playfair)] text-[16px] font-semibold text-[#3d1c00] sm:text-[18px]">
                December 1, 2026
              </p>
            </div>
            <p className="mt-2 text-[12px] tracking-wide text-[#7b6a58]">
              Asia / Kolkata (IST)
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
