"use client";

import Image from "next/image";
import { MailOpen, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { WeddingSettings } from "@/types/database";
import { coupleNames } from "@/lib/utils/names";
import { mediaUrl } from "@/lib/storage/media";
import { pickImage } from "@/lib/storage/imagery";

export function InvitationCover({
  wedding,
  onOpen,
  isOpened,
}: {
  wedding: WeddingSettings;
  onOpen: () => void;
  isOpened: boolean;
}) {
  const reduce = useReducedMotion();
  const names = coupleNames(wedding);
  const coverImageRef = wedding.invitation_cover_image_path || wedding.hero_image_path || pickImage(null, "hero");
  const coverImageUrl = mediaUrl(coverImageRef) ?? "/images/ai/priya-arjun-hero.webp";

  return (
    <motion.section
      initial={false}
      animate={isOpened ? { opacity: 0, scale: 0.98, pointerEvents: "none" } : { opacity: 1, scale: 1 }}
      transition={{ duration: reduce ? 0.3 : 0.8, ease: [0.22, 0.61, 0.36, 1] }}
      className={`relative min-h-[92vh] w-full flex items-center justify-center p-4 sm:p-6 lg:p-10 ${
        isOpened ? "hidden" : "flex"
      }`}
    >
      {/* Background with warm cream texture and subtle vignette */}
      <div className="absolute inset-0 bg-[#fdf5e6] bg-[radial-gradient(#d4a843_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-70" />

      {/* Royal Card Container */}
      <div className="relative z-10 w-full max-w-[680px] overflow-hidden rounded-[16px] border-2 border-[#d4a843]/60 bg-[#fffcf7] p-6 shadow-[0_12px_45px_-10px_rgba(139,26,26,0.18)] sm:p-10 lg:p-12">
        {/* Ornate corner accents */}
        <div className="pointer-events-none absolute top-3 left-3 size-8 border-t-2 border-l-2 border-[#8b1a1a]" />
        <div className="pointer-events-none absolute top-3 right-3 size-8 border-t-2 border-r-2 border-[#8b1a1a]" />
        <div className="pointer-events-none absolute bottom-3 left-3 size-8 border-b-2 border-l-2 border-[#8b1a1a]" />
        <div className="pointer-events-none absolute bottom-3 right-3 size-8 border-b-2 border-r-2 border-[#8b1a1a]" />

        {/* Top traditional auspicious invocation */}
        <div className="text-center">
          <p className="font-[family-name:var(--font-script)] text-[26px] text-[#8b1a1a] sm:text-[32px]">
            {wedding.invitation_cover_heading || "A Special Invitation"}
          </p>

          <div className="mx-auto my-3 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-[#d4a843]" />
            <Sparkles className="size-4 text-[#d4a843]" />
            <span className="h-px w-12 bg-[#d4a843]" />
          </div>

          <h1 className="mt-2 font-[family-name:var(--font-playfair)] text-[38px] font-bold tracking-tight text-[#3d1c00] sm:text-[54px] lg:text-[60px]">
            {names.bride} <span className="font-[family-name:var(--font-script)] font-normal text-[#8b1a1a]">&amp;</span> {names.groom}
          </h1>

          <p className="mt-3 font-[family-name:var(--font-serif)] text-[18px] tracking-[0.1em] text-[#5c4033] uppercase sm:text-[20px]">
            {wedding.invitation_cover_subheading || "We're Getting Married"}
          </p>
        </div>

        {/* Couple Imagery Card */}
        <div className="relative mx-auto mt-8 aspect-[16/10] w-full max-w-[480px] overflow-hidden rounded-[10px] border border-[#d4a843]/50 shadow-md">
          <Image
            src={coverImageUrl}
            alt={`${names.bride} and ${names.groom} wedding portrait`}
            fill
            sizes="(max-width: 640px) 100vw, 480px"
            priority
            className="object-cover object-[center_35%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3d1c00]/40 via-transparent to-transparent" />
          <div className="absolute right-3 bottom-2 text-[10px] tracking-[0.12em] text-[#fffcf7]/90 uppercase">
            Jaipur, Rajasthan
          </div>
        </div>

        {/* Date Announcement */}
        <div className="mt-8 text-center">
          <div className="inline-block rounded-full border border-[#d4a843]/70 bg-[#f5ebd5] px-6 py-2 shadow-xs">
            <p className="font-[family-name:var(--font-playfair)] text-[18px] font-semibold text-[#3d1c00] sm:text-[20px]">
              December 1, 2026
            </p>
          </div>
          <p className="mt-2 text-[13px] text-[#7b6a58]">
            {wedding.wedding_time_confirmed ? "Ceremony details below" : "Celebration begins in Asia/Kolkata timezone"}
          </p>
        </div>

        {/* "Open Invitation" CTA */}
        <div className="mt-9 text-center">
          <button
            type="button"
            onClick={onOpen}
            className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-[8px] border border-[#d4a843] bg-[#8b1a1a] px-8 py-3.5 text-[16px] font-medium tracking-[0.06em] text-[#fdf5e6] shadow-[0_4px_16px_rgba(139,26,26,0.3)] transition-all duration-300 hover:bg-[#721515] hover:shadow-[0_6px_22px_rgba(139,26,26,0.4)] active:scale-98"
          >
            <MailOpen className="size-5 transition-transform group-hover:scale-110" />
            <span>Open Invitation</span>
          </button>
          <p className="mt-3 text-[12px] text-[#7b6a58]">
            Click to unfold our digital invitation &amp; celebrate with us
          </p>
        </div>
      </div>
    </motion.section>
  );
}
