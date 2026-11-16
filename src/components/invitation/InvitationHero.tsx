"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { WeddingSettings } from "@/types/database";
import { coupleNames } from "@/lib/utils/names";
import { mediaUrl } from "@/lib/storage/media";
import { InvitationToran } from "./InvitationToran";

export function InvitationHero({ wedding }: { wedding: WeddingSettings }) {
  const reduce = useReducedMotion();
  const names = coupleNames(wedding);

  const heroImageSrc = wedding.invitation_cover_image_path
    ? mediaUrl(wedding.invitation_cover_image_path) ?? "/images/watercolor-gopuram-hero.webp"
    : "/images/watercolor-gopuram-hero.webp";

  return (
    <section aria-label="Wedding Invitation Header" className="relative w-full overflow-hidden bg-[#fdf5e6]">
      {/* Traditional Mango Leaf & Marigold Toran Garland along the top edge */}
      <div className="absolute top-0 inset-x-0 z-20">
        <InvitationToran position="top" />
      </div>

      {/* Hero Visual Container */}
      <div className="relative min-h-[580px] sm:min-h-[680px] lg:min-h-[760px] w-full flex flex-col items-center justify-center pt-16 pb-12 px-4">
        {/* Watercolor Gopuram Temple Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div
            initial={reduce ? { scale: 1 } : { scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="relative size-full"
          >
            <Image
              src={heroImageSrc}
              alt="Hand-painted South Indian Temple Gopuram in a watercolor landscape"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_35%]"
            />
          </motion.div>

          {/* Translucent Watercolor Wash Overlays */}
          {/* Top soft cream wash */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#fdf5e6]/80 via-[#fdf5e6]/30 to-transparent" />
          {/* Bottom fade blending seamlessly into the rest of the invitation page */}
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#fdf5e6] via-[#fdf5e6]/70 to-transparent" />
        </div>

        {/* Central Couple Names & Announcement Overlay */}
        <motion.div
          initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
          className="relative z-10 mx-auto max-w-[620px] text-center"
        >
          {/* Subtle translucent warm ivory/gold backing ensuring maximum legibility */}
          <div className="rounded-[20px] border border-[#d4a843]/40 bg-[#fffcf7]/75 px-6 py-8 shadow-[0_8px_32px_rgba(61,28,0,0.08)] backdrop-blur-[3px] sm:px-10 sm:py-10">
            {/* Auspicious top invocation line */}
            <p className="font-[family-name:var(--font-script)] text-[26px] text-[#8b1a1a] sm:text-[32px]">
              Shree Ganeshay Namah
            </p>

            {/* Couple Names */}
            <div className="mt-3 flex flex-col items-center justify-center">
              <h1 className="font-[family-name:var(--font-playfair)] text-[40px] font-bold tracking-tight text-[#8b1a1a] sm:text-[56px] lg:text-[64px] drop-shadow-xs">
                {names.bride.toUpperCase()}
              </h1>
              <span className="my-1 font-[family-name:var(--font-script)] text-[34px] font-normal text-[#d4a843] sm:text-[44px]">
                &amp;
              </span>
              <h2 className="font-[family-name:var(--font-playfair)] text-[40px] font-bold tracking-tight text-[#8b1a1a] sm:text-[56px] lg:text-[64px] drop-shadow-xs">
                {names.groom.toUpperCase()}
              </h2>
            </div>

            {/* Decorative divider */}
            <div className="mx-auto my-4 flex items-center justify-center gap-3 text-[#d4a843]">
              <span className="h-px w-12 bg-[#d4a843]" />
              <span className="text-[12px] tracking-widest text-[#8b1a1a] uppercase">• • •</span>
              <span className="h-px w-12 bg-[#d4a843]" />
            </div>

            {/* Subheading Announcement */}
            <p className="font-[family-name:var(--font-playfair)] text-[15px] font-semibold tracking-[0.2em] text-[#3d1c00] uppercase sm:text-[18px]">
              Are Getting Married
            </p>

            {/* Date Pill */}
            <div className="mt-3 inline-block rounded-full border border-[#d4a843] bg-[#f5ebd5]/90 px-6 py-1.5 shadow-2xs">
              <p className="font-[family-name:var(--font-serif)] text-[16px] font-bold tracking-[0.1em] text-[#8b1a1a] sm:text-[18px]">
                DECEMBER 1, 2026
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
