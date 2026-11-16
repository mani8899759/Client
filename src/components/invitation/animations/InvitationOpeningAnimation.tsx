"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MailOpen, Sparkles } from "lucide-react";
import gsap from "gsap";
import type { WeddingSettings } from "@/types/database";
import { coupleNames } from "@/lib/utils/names";
import { mediaUrl } from "@/lib/storage/media";
import { pickImage } from "@/lib/storage/imagery";

export function InvitationOpeningAnimation({
  wedding,
  onOpen,
  isReducedMotion = false,
}: {
  wedding: WeddingSettings;
  onOpen: () => void;
  isReducedMotion?: boolean;
}) {
  const [opening, setOpening] = useState(false);
  const [finished, setFinished] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const leftDoorRef = useRef<HTMLDivElement | null>(null);
  const rightDoorRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const sealRef = useRef<HTMLDivElement | null>(null);

  const names = coupleNames(wedding);
  const coverImageRef = wedding.invitation_cover_image_path || wedding.hero_image_path || pickImage(null, "hero");
  const coverImageUrl = mediaUrl(coverImageRef) ?? "/images/ai/priya-arjun-hero.webp";

  function handleTriggerOpen() {
    if (opening || finished) return;
    setOpening(true);

    // Call onOpen immediately to trigger music in the user gesture event loop
    onOpen();

    if (isReducedMotion) {
      setFinished(true);
      return;
    }

    const card = cardRef.current;
    const leftDoor = leftDoorRef.current;
    const rightDoor = rightDoorRef.current;
    const content = contentRef.current;
    const seal = sealRef.current;
    const container = containerRef.current;

    if (!card || !leftDoor || !rightDoor || !content) {
      setFinished(true);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setFinished(true);
      },
    });

    // 1. Fade the open button & seal
    if (seal) {
      tl.to(seal, {
        scale: 1.1,
        opacity: 0,
        duration: 0.35,
        ease: "power2.out",
      });
    }

    // 2. 3D Gate Opening: Left & Right doors swing outward
    tl.to(
      leftDoor,
      {
        rotateY: -105,
        opacity: 0.15,
        duration: 1.0,
        ease: "power3.inOut",
      },
      "-=0.15"
    );

    tl.to(
      rightDoor,
      {
        rotateY: 105,
        opacity: 0.15,
        duration: 1.0,
        ease: "power3.inOut",
      },
      "<"
    );

    // 3. Subtle camera forward push into the scene
    tl.to(
      card,
      {
        scale: 1.06,
        z: 60,
        duration: 1.0,
        ease: "power2.inOut",
      },
      "<"
    );

    // 4. Fade container out seamlessly to reveal Gopuram hero underneath
    tl.to(
      container,
      {
        opacity: 0,
        duration: 0.45,
        ease: "power2.in",
      },
      "-=0.35"
    );
  }

  if (finished) return null;

  return (
    <section
      ref={containerRef}
      aria-label="Invitation Card Cover"
      className="relative z-40 flex min-h-[92vh] w-full items-center justify-center p-4 sm:p-6 lg:p-10 select-none overflow-hidden"
      style={{
        perspective: "1400px",
      }}
    >
      {/* Background warm cream texture and subtle vignette */}
      <div className="absolute inset-0 bg-[#fdf5e6] bg-[radial-gradient(#d4a843_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-75" />

      {/* 3D Card Scene */}
      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-[680px] overflow-hidden rounded-[16px] border-2 border-[#d4a843]/70 bg-[#fffcf7] p-6 shadow-[0_18px_50px_-10px_rgba(139,26,26,0.22)] sm:p-10 lg:p-12 transition-shadow"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Left 3D Panel Door Overlay for authentic physical card opening */}
        <div
          ref={leftDoorRef}
          className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#fffcf7] via-[#fdf5e6] to-[#f5ebd5]/60 border-r border-[#d4a843]/40 z-20"
          style={{
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
            boxShadow: "inset -10px 0 20px -8px rgba(139, 26, 26, 0.08)",
          }}
        >
          <div className="absolute top-4 left-4 size-8 border-t-2 border-l-2 border-[#8b1a1a]" />
          <div className="absolute bottom-4 left-4 size-8 border-b-2 border-l-2 border-[#8b1a1a]" />
        </div>

        {/* Right 3D Panel Door Overlay */}
        <div
          ref={rightDoorRef}
          className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-[#fffcf7] via-[#fdf5e6] to-[#f5ebd5]/60 border-l border-[#d4a843]/40 z-20"
          style={{
            transformOrigin: "right center",
            transformStyle: "preserve-3d",
            boxShadow: "inset 10px 0 20px -8px rgba(139, 26, 26, 0.08)",
          }}
        >
          <div className="absolute top-4 right-4 size-8 border-t-2 border-r-2 border-[#8b1a1a]" />
          <div className="absolute bottom-4 right-4 size-8 border-b-2 border-r-2 border-[#8b1a1a]" />
        </div>

        {/* Card Content Interior */}
        <div ref={contentRef} className="relative z-10 text-center">
          {/* Top traditional auspicious invocation */}
          <div>
            <p className="font-[family-name:var(--font-script)] text-[26px] text-[#8b1a1a] sm:text-[32px]">
              {wedding.invitation_cover_heading || "A Special Invitation"}
            </p>

            <div className="mx-auto my-3 flex items-center justify-center gap-3">
              <span className="h-px w-12 bg-[#d4a843]" />
              <Sparkles className="size-4 text-[#d4a843]" />
              <span className="h-px w-12 bg-[#d4a843]" />
            </div>

            <h1 className="mt-2 font-[family-name:var(--font-playfair)] text-[38px] font-bold tracking-tight text-[#3d1c00] sm:text-[54px] lg:text-[60px]">
              {names.bride}{" "}
              <span className="font-[family-name:var(--font-script)] font-normal text-[#8b1a1a]">
                &amp;
              </span>{" "}
              {names.groom}
            </h1>

            <p className="mt-3 font-[family-name:var(--font-serif)] text-[17px] tracking-[0.12em] text-[#5c4033] uppercase sm:text-[19px]">
              {wedding.invitation_cover_subheading || "We're Getting Married"}
            </p>
          </div>

          {/* Couple Imagery Card */}
          <div className="relative mx-auto mt-7 aspect-[16/10] w-full max-w-[480px] overflow-hidden rounded-[10px] border border-[#d4a843]/60 shadow-md">
            <Image
              src={coverImageUrl}
              alt={`${names.bride} and ${names.groom} wedding portrait`}
              fill
              sizes="(max-width: 640px) 100vw, 480px"
              priority
              className="object-cover object-[center_35%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3d1c00]/40 via-transparent to-transparent" />
            <div className="absolute right-3 bottom-2 text-[10px] tracking-[0.12em] text-[#fffcf7]/95 uppercase">
              Jaipur, Rajasthan
            </div>
          </div>

          {/* Date Announcement */}
          <div className="mt-7">
            <div className="inline-block rounded-full border border-[#d4a843]/80 bg-[#f5ebd5] px-6 py-2 shadow-xs">
              <p className="font-[family-name:var(--font-playfair)] text-[18px] font-semibold text-[#3d1c00] sm:text-[20px]">
                December 1, 2026
              </p>
            </div>
            <p className="mt-2 text-[13px] text-[#7b6a58]">
              {wedding.wedding_time_confirmed
                ? "Ceremony details below"
                : "Celebration begins in Asia/Kolkata timezone"}
            </p>
          </div>

          {/* "Open Invitation" CTA */}
          <div ref={sealRef} className="mt-8">
            <button
              type="button"
              onClick={handleTriggerOpen}
              disabled={opening}
              className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-[8px] border border-[#d4a843] bg-[#8b1a1a] px-8 py-3.5 text-[16px] font-medium tracking-[0.06em] text-[#fdf5e6] shadow-[0_4px_18px_rgba(139,26,26,0.32)] transition-all duration-300 hover:bg-[#721515] hover:shadow-[0_8px_24px_rgba(139,26,26,0.42)] active:scale-98 cursor-pointer"
            >
              <MailOpen className="size-5 transition-transform duration-300 group-hover:scale-110" />
              <span>{opening ? "Opening Celebration..." : "Open Invitation"}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
