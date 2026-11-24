"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { MailOpen, Sparkles } from "lucide-react";
import gsap from "gsap";
import type { WeddingSettings } from "@/types/database";
import { coupleNames } from "@/lib/utils/names";
import { weddingSchedule } from "@/lib/utils/wedding";
import { mediaUrl } from "@/lib/storage/media";
import { pickImage } from "@/lib/storage/imagery";

export function InvitationOpeningAnimation({
  wedding,
  onStartOpen,
  onComplete,
  isReducedMotion = false,
}: {
  wedding: WeddingSettings;
  onStartOpen: () => void;
  onComplete: () => void;
  isReducedMotion?: boolean;
}) {
  const [opening, setOpening] = useState(false);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const sealRef = useRef<HTMLDivElement | null>(null);

  const names = coupleNames(wedding);
  const schedule = weddingSchedule(wedding);
  const coverImageRef =
    wedding.invitation_cover_image_path ||
    wedding.hero_image_path ||
    pickImage(null, "hero");
  const coverImageUrl =
    mediaUrl(coverImageRef) ?? "/images/wedding-shoot/optimised/photo-06.webp";

  function handleTriggerOpen() {
    if (opening) return;
    setOpening(true);

    // 1. Immediately trigger music playback in the trusted user-gesture event loop
    onStartOpen();

    if (isReducedMotion) {
      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.3,
          onComplete,
        });
      } else {
        onComplete();
      }
      return;
    }

    const card = cardRef.current;
    const overlay = overlayRef.current;
    const seal = sealRef.current;

    if (!card || !overlay) {
      onComplete();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        onComplete();
      },
    });

    // A. Seal button shimmer & pulse
    if (seal) {
      tl.to(seal, {
        scale: 1.12,
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }

    // B. Royal Card 3D Lift & Forward Push
    // Elevates towards camera in 3D perspective, parting smoothly into the scene
    tl.to(
      card,
      {
        scale: 1.08,
        z: 140,
        y: -30,
        opacity: 0,
        duration: 0.9,
        ease: "power2.inOut",
      },
      "-=0.1"
    );

    // C. Seamless background fade to reveal the Gopuram hero underneath
    tl.to(
      overlay,
      {
        opacity: 0,
        duration: 0.5,
        ease: "power1.in",
      },
      "-=0.4"
    );
  }

  return (
    <div
      ref={overlayRef}
      aria-label="Invitation Card Cover"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 select-none overflow-y-auto bg-[#fdf5e6]"
      style={{
        perspective: "1400px",
      }}
    >
      {/* Background warm cream texture with traditional gold stippling */}
      <div className="absolute inset-0 bg-[#fdf5e6] bg-[radial-gradient(#d4a843_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-85" />

      {/* Royal Card Container — Razor-sharp, high-contrast, pure royal luxury */}
      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-[620px] overflow-hidden rounded-[16px] border-2 border-[#d4a843] bg-[#fffdf9] p-6 shadow-[0_24px_60px_-15px_rgba(139,26,26,0.28)] sm:p-10 lg:p-12 transition-shadow"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Ornate Gold & Burgundy Corner Accents */}
        <div className="pointer-events-none absolute top-3 left-3 size-8 border-t-2 border-l-2 border-[#8b1a1a]" />
        <div className="pointer-events-none absolute top-3 right-3 size-8 border-t-2 border-r-2 border-[#8b1a1a]" />
        <div className="pointer-events-none absolute bottom-3 left-3 size-8 border-b-2 border-l-2 border-[#8b1a1a]" />
        <div className="pointer-events-none absolute bottom-3 right-3 size-8 border-b-2 border-r-2 border-[#8b1a1a]" />

        {/* Inner Gold Inset Border */}
        <div className="pointer-events-none absolute inset-2 rounded-[12px] border border-[#d4a843]/45" />

        {/* Card Content Interior */}
        <div className="relative z-10 text-center">
          {/* Top traditional auspicious invocation */}
          <div>
            <p className="font-[family-name:var(--font-script)] text-[28px] text-[#8b1a1a] sm:text-[34px]">
              {wedding.invitation_cover_heading || "A Special Invitation"}
            </p>

            <div className="mx-auto my-3 flex items-center justify-center gap-3">
              <span className="h-px w-14 bg-gradient-to-r from-transparent via-[#d4a843] to-[#d4a843]" />
              <span className="size-2 rotate-45 border border-[#d4a843] bg-[#8b1a1a]" />
              <span className="h-px w-14 bg-gradient-to-l from-transparent via-[#d4a843] to-[#d4a843]" />
            </div>

            {/* Family Invitation Branding */}
            <div className="mb-2">
              <p className="font-sans text-[11px] xs:text-[12px] sm:text-[13px] font-semibold tracking-[0.22em] text-[#996515] uppercase">
                {wedding.family_heading || "Gudla & Padakanti Families"}
              </p>
              <p className="mt-0.5 font-serif text-[12px] sm:text-[14px] italic text-[#5c4033]">
                cordially invite you to celebrate the wedding of
              </p>
            </div>

            {/* Prominent Couple Names */}
            <h1 className="mt-1 font-[family-name:var(--font-playfair)] text-[32px] xs:text-[40px] font-bold tracking-tight text-[#8b1a1a] sm:text-[52px] lg:text-[58px]">
              {names.groom}{" "}
              <span className="font-[family-name:var(--font-script)] font-normal text-[#d4a843]">
                &amp;
              </span>{" "}
              {names.bride}
            </h1>

            <p className="mt-2 font-[family-name:var(--font-serif)] text-[15px] font-medium tracking-[0.2em] text-[#5c4033] uppercase sm:text-[17px]">
              {wedding.invitation_cover_subheading || "Are Getting Married"}
            </p>
          </div>

          {/* Couple Imagery Portrait Frame - Responsive Mobile Portrait vs Desktop Landscape */}
          <div className="relative mx-auto mt-6 aspect-[4/3] xs:aspect-[5/4] sm:aspect-[16/10] w-full max-w-[460px] overflow-hidden rounded-[10px] border-2 border-[#d4a843] shadow-md">
            <picture className="absolute inset-0 h-full w-full">
              {/* Mobile (<640px): Full vertical couple portrait with zero cropping */}
              <source
                media="(max-width: 639px)"
                srcSet="/images/wedding-shoot/optimised/photo-05.webp"
                type="image/webp"
              />
              {/* Desktop (>=640px): Standard cover image */}
              <source
                media="(min-width: 640px)"
                srcSet={coverImageUrl}
                type="image/webp"
              />
              <img
                src={coverImageUrl}
                alt={`${names.groom} and ${names.bride} wedding portrait`}
                className="h-full w-full object-cover object-[center_20%] sm:object-[center_30%]"
                loading="eager"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-[#3d1c00]/50 via-transparent to-transparent pointer-events-none" />
            <div className="absolute right-3.5 bottom-2.5 text-[11px] font-medium tracking-[0.14em] text-[#fffdf9] drop-shadow-sm uppercase">
              Hyderabad · Visakhapatnam
            </div>
          </div>

          {/* Date Announcement */}
          <div className="mt-6">
            <div className="inline-block rounded-full border border-[#d4a843] bg-[#f5ebd5] px-7 py-2 shadow-xs">
              <p className="font-[family-name:var(--font-playfair)] text-[18px] font-bold text-[#3d1c00] sm:text-[20px]">
                {schedule?.dateOnlyLabel ?? "December 13, 2026"}
              </p>
            </div>
            <p className="mt-2 text-[12px] font-medium text-[#7b6a58]">
              {wedding.wedding_time_confirmed
                ? "Ceremony details inside"
                : "Celebration begins in Asia / Kolkata (IST)"}
            </p>
          </div>

          {/* "Open Invitation" CTA */}
          <div ref={sealRef} className="mt-6 sm:mt-8">
            <button
              type="button"
              onClick={handleTriggerOpen}
              disabled={opening}
              className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-3 overflow-hidden rounded-[8px] border-2 border-[#d4a843] bg-gradient-to-r from-[#8b1a1a] via-[#a32222] to-[#8b1a1a] px-6 sm:px-9 py-3.5 text-[15px] sm:text-[16px] font-medium tracking-[0.06em] text-[#fdf5e6] shadow-[0_6px_22px_rgba(139,26,26,0.35)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_28px_rgba(139,26,26,0.45)] active:scale-98 cursor-pointer"
            >
              <MailOpen className="size-5 text-[#fdf5e6] transition-transform duration-300 group-hover:scale-110" />
              <span className="font-semibold tracking-wide">
                {opening ? "Opening Celebration..." : "Open Invitation"}
              </span>
              <Sparkles className="size-4 text-[#ffd54f] transition-transform duration-300 group-hover:rotate-12" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
