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
            media="(max-width: 640px)"
            srcSet="/images/south-indian-gopuram-hero-mobile.webp"
            type="image/webp"
          />
          <source
            srcSet="/images/south-indian-gopuram-hero-desktop.webp"
            type="image/webp"
          />
          <Image
            src="/images/south-indian-gopuram-hero-desktop.png"
            alt="Traditional South Indian Temple Gopuram Watercolor Scene with sacred spires, lotus pond, and lush palm landscape"
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

      {/* 3. Center Couple Names directly over Temple (without white card sheet) */}
      <div className="relative z-10 mx-auto flex min-h-[580px] max-w-[820px] flex-col items-center justify-center px-4 pt-16 text-center sm:min-h-[680px] md:min-h-[760px] lg:min-h-[820px]">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 25, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
          className="relative max-w-[620px] px-4 py-6 text-center"
        >
          {/* Auspicious Invocation */}
          <p className="font-[family-name:var(--font-script)] text-[28px] text-[#8b1a1a] drop-shadow-[0_1px_3px_rgba(253,245,230,0.95)] sm:text-[34px]">
            {wedding.invitation_cover_heading || "A Special Invitation"}
          </p>

          <div className="mx-auto my-3 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-[#d4a843]" />
            <span className="size-1.5 rounded-full bg-[#8b1a1a]" />
            <span className="h-px w-12 bg-[#d4a843]" />
          </div>

          {/* Prominent Couple Names */}
          <div className="mt-2 space-y-1">
            <h1 className="font-[family-name:var(--font-playfair)] text-[44px] font-bold tracking-[0.06em] text-[#8b1a1a] drop-shadow-[0_2px_10px_rgba(253,245,230,0.95)] sm:text-[60px] md:text-[68px] uppercase">
              {names.groom}
            </h1>
            <div className="font-[family-name:var(--font-script)] text-[38px] font-normal leading-none text-[#d4a843] drop-shadow-[0_2px_4px_rgba(61,28,0,0.25)] sm:text-[48px]">
              &amp;
            </div>
            <h1 className="font-[family-name:var(--font-playfair)] text-[44px] font-bold tracking-[0.06em] text-[#8b1a1a] drop-shadow-[0_2px_10px_rgba(253,245,230,0.95)] sm:text-[60px] md:text-[68px] uppercase">
              {names.bride}
            </h1>
          </div>

          {/* Announcement and Main Date */}
          <div className="mt-6 border-t border-[#d4a843]/60 pt-5">
            <p className="font-[family-name:var(--font-serif)] text-[15px] font-semibold tracking-[0.22em] text-[#3d1c00] drop-shadow-[0_1px_3px_rgba(253,245,230,0.95)] uppercase sm:text-[17px]">
              Are Getting Married
            </p>
            <div className="mt-3 inline-block rounded-full border border-[#d4a843] px-7 py-1.5 backdrop-blur-[2px]">
              <p className="font-[family-name:var(--font-playfair)] text-[16px] font-bold text-[#8b1a1a] drop-shadow-[0_1px_2px_rgba(253,245,230,0.9)] sm:text-[18px]">
                December 1, 2026
              </p>
            </div>
            <p className="mt-2 text-[12px] font-medium tracking-wide text-[#3d1c00] drop-shadow-[0_1px_2px_rgba(253,245,230,0.9)]">
              Asia / Kolkata (IST)
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
