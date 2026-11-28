"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { WeddingSettings } from "@/types/database";
import { coupleNames } from "@/lib/utils/names";
import { weddingSchedule } from "@/lib/utils/wedding";
import { InvitationToran } from "../InvitationToran";
import { useInvitationMotion } from "./InvitationMotionProvider";

export function InvitationHeroAnimation({
  wedding,
  isOpened = false,
  isReducedMotion: isReducedMotionProp,
}: {
  wedding: WeddingSettings;
  isOpened?: boolean;
  isReducedMotion?: boolean;
}) {
  const { isReducedMotion: contextReducedMotion } = useInvitationMotion();
  const isReducedMotion = isReducedMotionProp ?? contextReducedMotion;
  const heroRef = useRef<HTMLElement | null>(null);
  const templeBgRef = useRef<HTMLDivElement | null>(null);
  const toranRef = useRef<HTMLDivElement | null>(null);
  const invocationRef = useRef<HTMLParagraphElement | null>(null);
  const dividerTopRef = useRef<HTMLDivElement | null>(null);
  const familyHeadingRef = useRef<HTMLParagraphElement | null>(null);
  const groomContainerRef = useRef<HTMLDivElement | null>(null);
  const groomNameRef = useRef<HTMLHeadingElement | null>(null);
  const ampersandRef = useRef<HTMLDivElement | null>(null);
  const brideContainerRef = useRef<HTMLDivElement | null>(null);
  const brideNameRef = useRef<HTMLHeadingElement | null>(null);
  const dividerBottomRef = useRef<HTMLDivElement | null>(null);
  const marryingTextRef = useRef<HTMLParagraphElement | null>(null);
  const dateBadgeRef = useRef<HTMLDivElement | null>(null);
  const namesContainerRef = useRef<HTMLDivElement | null>(null);

  const names = coupleNames(wedding);
  const schedule = weddingSchedule(wedding);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // ─────────────────────────────────────────────────────────────────────────
      // 1. Hero Reveal Animation Sequence
      // ─────────────────────────────────────────────────────────────────────────
      if (!isReducedMotion) {
        const revealTl = gsap.timeline({
          delay: isOpened ? 0.05 : 0.2,
          defaults: { ease: "power3.out" },
        });

        // Background temple scale & fade
        if (templeBgRef.current) {
          revealTl.fromTo(
            templeBgRef.current,
            { scale: 1.12, opacity: 0.35, y: 25 },
            { scale: 1.0, opacity: 1, y: 0, duration: 1.2, ease: "power2.out" },
            0
          );
        }

        // Toran downward slide & settling
        if (toranRef.current) {
          revealTl.fromTo(
            toranRef.current,
            { yPercent: -100, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 1.0, ease: "back.out(1.1)" },
            0.15
          );
        }

        // 1. Top invocation
        if (invocationRef.current) {
          revealTl.fromTo(
            invocationRef.current,
            { opacity: 0, y: -16 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
            0.25
          );
        }
        if (dividerTopRef.current) {
          revealTl.fromTo(
            dividerTopRef.current,
            { opacity: 0, scaleX: 0.6 },
            { opacity: 1, scaleX: 1, duration: 0.7, ease: "power2.out" },
            0.35
          );
        }

        if (familyHeadingRef.current) {
          revealTl.fromTo(
            familyHeadingRef.current,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
            0.38
          );
        }

        // 2. Groom label & MANIKANTA move gently in from the left
        if (groomContainerRef.current) {
          revealTl.fromTo(
            groomContainerRef.current,
            { opacity: 0, x: -35 },
            { opacity: 1, x: 0, duration: 0.9, ease: "power2.out" },
            0.4
          );
        }

        // 3. Ampersand fades into the center
        if (ampersandRef.current) {
          revealTl.fromTo(
            ampersandRef.current,
            { opacity: 0, scale: 0.75 },
            { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.4)" },
            0.48
          );
        }

        // 4. Bride label & PRIYA move gently in from the right
        if (brideContainerRef.current) {
          revealTl.fromTo(
            brideContainerRef.current,
            { opacity: 0, x: 35 },
            { opacity: 1, x: 0, duration: 0.9, ease: "power2.out" },
            0.4
          );
        }

        // 5. Wedding date and supporting info below
        const bottomElements = [
          dividerBottomRef.current,
          marryingTextRef.current,
          dateBadgeRef.current,
        ].filter(Boolean);

        if (bottomElements.length) {
          revealTl.fromTo(
            bottomElements,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, stagger: 0.08, duration: 0.8, ease: "power2.out" },
            0.6
          );
        }
      }

      // ─────────────────────────────────────────────────────────────────────────
      // 2. Scroll-Triggered Hero Zoom & Parallax Scene
      // ─────────────────────────────────────────────────────────────────────────
      if (!isReducedMotion && heroRef.current) {
        const mm = gsap.matchMedia();

        // Desktop / Large screen configuration
        mm.add("(min-width: 768px)", () => {
          const scrollTl = gsap.timeline({
            scrollTrigger: {
              id: "invitation-hero-zoom",
              trigger: heroRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          });

          // Zoom into temple spires and courtyard
          if (templeBgRef.current) {
            scrollTl.to(
              templeBgRef.current,
              {
                scale: 1.18,
                y: -35,
                transformOrigin: "center 28%",
                ease: "none",
              },
              0
            );
          }

          // Names float upwards faster for 3D parallax depth
          if (namesContainerRef.current) {
            scrollTl.to(
              namesContainerRef.current,
              {
                y: -65,
                opacity: 0.88,
                ease: "none",
              },
              0
            );
          }

          // Toran small movement
          if (toranRef.current) {
            scrollTl.to(
              toranRef.current,
              {
                y: -20,
                ease: "none",
              },
              0
            );
          }
        });

        // Mobile (< 768px): scrub parallax intentionally disabled to guarantee 60fps native touch scrolling
      }
    }, heroRef);

    return () => {
      ctx.revert();
    };
  }, [isOpened, isReducedMotion]);

  return (
    <section
      ref={heroRef}
      aria-label="Wedding Invitation Hero"
      className="relative min-h-[600px] w-full overflow-hidden bg-[#fdf5e6] pb-8 sm:min-h-[680px] md:min-h-[740px] md:[perspective:1200px] lg:min-h-[780px]"
    >
      {/* 1. Traditional Hanging Mango Leaf & Marigold Toran */}
      <div ref={toranRef} className="absolute top-0 inset-x-0 z-20">
        <InvitationToran />
      </div>

      {/* 2. Grand South Indian Watercolor Temple Gopuram Background (scaled ~15% smaller below top headings) */}
      <div
        ref={templeBgRef}
        className="absolute inset-x-0 top-[96px] bottom-0 z-0 overflow-hidden will-change-transform sm:top-[128px] lg:top-[152px]"
      >
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
            className="object-cover object-bottom sm:object-[center_85%]"
          />
        </picture>

        {/* Subtle edge-only cream blend so top sky is seamless without fading the Gopuram spire */}
        <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-[#fdf5e6] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#fdf5e6] via-[#fdf5e6]/65 to-transparent" />
      </div>

      {/* 3. Balanced Hero Composition: Top Headings above Gopuram + Clean Couple Names Flanking Temple */}
      <div className="relative z-10 mx-auto flex min-h-[600px] w-full max-w-[1450px] flex-col items-center justify-between px-4 pt-12 pb-6 text-center sm:min-h-[680px] sm:px-8 sm:pt-14 sm:pb-8 md:min-h-[740px] lg:min-h-[780px] lg:px-12">
        {/* Top Group: A Special Invitation + GUDLA & PADAKANTI FAMILIES */}
        <div className="w-full pt-1 sm:pt-2">
          <p
            ref={invocationRef}
            className="font-[family-name:var(--font-script)] text-[28px] font-semibold text-[#8b1a1a] drop-shadow-[0_1px_3px_rgba(253,245,230,0.95)] sm:text-[36px]"
          >
            {wedding.invitation_cover_heading || "Our Wedding Invitation"}
          </p>

          <div
            ref={dividerTopRef}
            className="mx-auto my-1.5 flex items-center justify-center gap-3 sm:my-2"
          >
            <span className="h-px w-10 bg-[#d4a843]" />
            <span className="size-1.5 rounded-full bg-[#8b1a1a]" />
            <span className="h-px w-10 bg-[#d4a843]" />
          </div>

          <p
            ref={familyHeadingRef}
            className="font-sans text-[11px] xs:text-[12px] sm:text-[13px] md:text-[14px] font-semibold tracking-[0.2em] sm:tracking-[0.24em] text-[#996515] uppercase drop-shadow-[0_1px_2px_rgba(253,245,230,0.95)]"
          >
            {wedding.family_heading || "Gudla & Padakanti Families"}
          </p>
        </div>

        {/* Lower-Middle Group: MANIKANTA & SRAVIKA + Announcement & Date */}
        <div
          ref={namesContainerRef}
          className="relative mt-auto w-full pt-16 text-center will-change-transform sm:pt-20 lg:pt-24"
        >
          {/* Grand 3-Column Outward Flanking Layout: MANIKANTA (Left) — & (Center) — SRAVIKA (Right) */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full max-w-[1400px] mx-auto">
            {/* LEFT: MANIKANTA */}
            <div
              ref={groomContainerRef}
              className="justify-self-end text-right pr-2 xs:pr-4 sm:pr-8 md:pr-[clamp(30px,6vw,120px)] lg:pr-[clamp(40px,7vw,140px)] bg-transparent border-0 shadow-none backdrop-blur-none"
            >
              <h1
                ref={groomNameRef}
                className="font-[family-name:var(--font-playfair)] text-[20px] xs:text-[26px] sm:text-[46px] md:text-[54px] lg:text-[66px] xl:text-[74px] font-bold tracking-[0.04em] sm:tracking-[0.06em] text-[#8b1a1a] drop-shadow-[0_2px_6px_rgba(253,245,230,0.95)] uppercase leading-none"
              >
                {names.groom}
              </h1>
            </div>

            {/* CENTER: Ampersand floating naturally over Gopuram */}
            <div
              ref={ampersandRef}
              className="justify-self-center text-center px-1.5 xs:px-2 sm:px-4 bg-transparent border-0 shadow-none"
            >
              <span className="font-[family-name:var(--font-script)] text-[26px] xs:text-[34px] sm:text-[52px] md:text-[62px] lg:text-[74px] font-normal leading-none text-[#d4a843] drop-shadow-[0_2px_5px_rgba(61,28,0,0.3)]">
                &amp;
              </span>
            </div>

            {/* RIGHT: SRAVIKA */}
            <div
              ref={brideContainerRef}
              className="justify-self-start text-left pl-2 xs:pl-4 sm:pl-8 md:pl-[clamp(30px,6vw,120px)] lg:pl-[clamp(40px,7vw,140px)] bg-transparent border-0 shadow-none backdrop-blur-none"
            >
              <h1
                ref={brideNameRef}
                className="font-[family-name:var(--font-playfair)] text-[20px] xs:text-[26px] sm:text-[46px] md:text-[54px] lg:text-[66px] xl:text-[74px] font-bold tracking-[0.04em] sm:tracking-[0.06em] text-[#8b1a1a] drop-shadow-[0_2px_6px_rgba(253,245,230,0.95)] uppercase leading-none"
              >
                {names.bride}
              </h1>
            </div>
          </div>

          {/* Announcement and Main Date */}
          <div
            ref={dividerBottomRef}
            className="mx-auto mt-9 max-w-[540px] border-t border-[#d4a843]/60 pt-5 sm:mt-12 sm:pt-6"
          >
            <div className="inline-block rounded-full bg-[#fdf5e6]/85 px-6 py-1.5 backdrop-blur-xs border border-[#d4a843]/40 shadow-[0_2px_8px_rgba(212,168,67,0.12)]">
              <p
                ref={marryingTextRef}
                className="font-[family-name:var(--font-serif)] text-[14px] xs:text-[15px] sm:text-[17px] md:text-[18px] font-extrabold tracking-[0.28em] sm:tracking-[0.32em] text-[#721515] uppercase drop-shadow-[0_1px_2px_rgba(253,245,230,1)]"
              >
                Are Getting Married
              </p>
            </div>
            <div
              ref={dateBadgeRef}
              className="mt-3.5 inline-block rounded-full border border-[#d4a843] bg-[#fdf5e6]/75 px-7 sm:px-9 py-1.5 backdrop-blur-[4px] shadow-[0_2px_8px_rgba(212,168,67,0.15)]"
            >
              <p className="font-[family-name:var(--font-playfair)] text-[15px] font-bold text-[#8b1a1a] drop-shadow-[0_1px_2px_rgba(253,245,230,0.9)] sm:text-[18px]">
                {schedule?.dateOnlyLabel ?? "December 13, 2026"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
