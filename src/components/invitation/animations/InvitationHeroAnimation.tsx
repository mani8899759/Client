"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { WeddingSettings } from "@/types/database";
import { coupleNames } from "@/lib/utils/names";
import { InvitationToran } from "../InvitationToran";

export function InvitationHeroAnimation({
  wedding,
  isOpened = false,
  isReducedMotion = false,
}: {
  wedding: WeddingSettings;
  isOpened?: boolean;
  isReducedMotion?: boolean;
}) {
  const heroRef = useRef<HTMLElement | null>(null);
  const templeBgRef = useRef<HTMLDivElement | null>(null);
  const toranRef = useRef<HTMLDivElement | null>(null);
  const invocationRef = useRef<HTMLParagraphElement | null>(null);
  const dividerTopRef = useRef<HTMLDivElement | null>(null);
  const groomNameRef = useRef<HTMLHeadingElement | null>(null);
  const ampersandRef = useRef<HTMLDivElement | null>(null);
  const brideNameRef = useRef<HTMLHeadingElement | null>(null);
  const dividerBottomRef = useRef<HTMLDivElement | null>(null);
  const marryingTextRef = useRef<HTMLParagraphElement | null>(null);
  const dateBadgeRef = useRef<HTMLDivElement | null>(null);
  const timezoneRef = useRef<HTMLParagraphElement | null>(null);
  const namesContainerRef = useRef<HTMLDivElement | null>(null);

  const names = coupleNames(wedding);

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

        // Staggered couple names typography reveal
        const textElements = [
          invocationRef.current,
          dividerTopRef.current,
          groomNameRef.current,
          ampersandRef.current,
          brideNameRef.current,
          dividerBottomRef.current,
          marryingTextRef.current,
          dateBadgeRef.current,
          timezoneRef.current,
        ].filter(Boolean);

        if (textElements.length) {
          revealTl.fromTo(
            textElements,
            { opacity: 0, y: 20, scale: 0.96 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              stagger: 0.1,
              duration: 0.85,
              ease: "power2.out",
            },
            0.3
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

        // Mobile configuration: gentle zoom to preserve framing and performance
        mm.add("(max-width: 767px)", () => {
          const scrollTlMobile = gsap.timeline({
            scrollTrigger: {
              id: "invitation-hero-zoom-mobile",
              trigger: heroRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });

          if (templeBgRef.current) {
            scrollTlMobile.to(
              templeBgRef.current,
              {
                scale: 1.08,
                y: -20,
                transformOrigin: "center 25%",
                ease: "none",
              },
              0
            );
          }

          if (namesContainerRef.current) {
            scrollTlMobile.to(
              namesContainerRef.current,
              {
                y: -40,
                opacity: 0.9,
                ease: "none",
              },
              0
            );
          }
        });
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
      className="relative min-h-[580px] w-full overflow-hidden bg-[#fdf5e6] pb-12 sm:min-h-[680px] md:min-h-[760px] lg:min-h-[840px]"
      style={{
        perspective: "1200px",
      }}
    >
      {/* 1. Traditional Hanging Mango Leaf & Marigold Toran */}
      <div ref={toranRef} className="absolute top-0 inset-x-0 z-20">
        <InvitationToran />
      </div>

      {/* 2. Grand South Indian Watercolor Temple Gopuram Background */}
      <div
        ref={templeBgRef}
        className="absolute inset-0 z-0 overflow-hidden will-change-transform"
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
            className="object-cover object-center sm:object-top"
          />
        </picture>

        {/* Soft, warm cream vignettes to blend top and bottom naturally into #FDF5E6 */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#fdf5e6]/90 via-[#fdf5e6]/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#fdf5e6] via-[#fdf5e6]/70 to-transparent" />
      </div>

      {/* 3. Couple Names Flanking the Temple with Traditional Sandalwood-Gold Parchment Backing */}
      <div className="relative z-10 mx-auto flex min-h-[580px] w-full max-w-[1100px] flex-col items-center justify-center px-4 pt-16 pb-8 text-center sm:min-h-[680px] md:min-h-[760px] lg:min-h-[840px]">
        <div
          ref={namesContainerRef}
          className="relative w-full max-w-[980px] px-2 py-4 text-center will-change-transform"
        >
          {/* Top: Auspicious Invocation Header */}
          <div className="mb-4 sm:mb-6">
            <p
              ref={invocationRef}
              className="font-[family-name:var(--font-script)] text-[30px] font-semibold text-[#8b1a1a] drop-shadow-[0_1px_3px_rgba(253,245,230,0.95)] sm:text-[36px]"
            >
              {wedding.invitation_cover_heading || "A Special Invitation"}
            </p>

            <div
              ref={dividerTopRef}
              className="mx-auto my-2 flex items-center justify-center gap-3"
            >
              <span className="h-px w-12 bg-[#d4a843]" />
              <span className="size-1.5 rounded-full bg-[#8b1a1a]" />
              <span className="h-px w-12 bg-[#d4a843]" />
            </div>
          </div>

          {/* Flanking Couple Composition: ARJUN (Left) — & (Middle) — PRIYA (Right) */}
          <div className="mt-2 flex flex-col items-center justify-center gap-4 sm:gap-6 md:flex-row md:items-center md:justify-center lg:gap-8">
            {/* LEFT: ARJUN (Groom) */}
            <div className="relative w-full max-w-[320px] rounded-2xl border border-[#d4a843]/70 bg-gradient-to-b from-[#fffdf7]/95 via-[#faf3e2]/92 to-[#f5ead0]/95 px-6 py-5 shadow-[0_8px_24px_rgba(75,45,20,0.14)] backdrop-blur-sm sm:px-8 sm:py-6 md:w-[300px] lg:w-[350px]">
              {/* Traditional Auspicious Corner Marks */}
              <span className="absolute top-2 left-2 size-2.5 border-t-2 border-l-2 border-[#8b1a1a]/70" />
              <span className="absolute top-2 right-2 size-2.5 border-t-2 border-r-2 border-[#8b1a1a]/70" />
              <span className="absolute bottom-2 left-2 size-2.5 border-b-2 border-l-2 border-[#8b1a1a]/70" />
              <span className="absolute bottom-2 right-2 size-2.5 border-b-2 border-r-2 border-[#8b1a1a]/70" />

              <p className="text-[11px] font-semibold tracking-[0.24em] text-[#996515] uppercase">
                The Groom
              </p>
              <h1
                ref={groomNameRef}
                className="mt-1 font-[family-name:var(--font-playfair)] text-[36px] font-bold tracking-[0.06em] text-[#8b1a1a] drop-shadow-[0_1px_2px_rgba(253,245,230,0.9)] sm:text-[44px] lg:text-[50px] uppercase"
              >
                {names.groom}
              </h1>
            </div>

            {/* MIDDLE: Ampersand Medallion */}
            <div
              ref={ampersandRef}
              className="relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-[#d4a843] bg-gradient-to-br from-[#fffdf7] via-[#faf3e2] to-[#eeddbb] shadow-[0_4px_16px_rgba(180,130,50,0.24)] sm:size-16"
            >
              <span className="font-[family-name:var(--font-script)] text-[34px] font-bold leading-none text-[#8b1a1a] sm:text-[40px]">
                &amp;
              </span>
            </div>

            {/* RIGHT: PRIYA (Bride) */}
            <div className="relative w-full max-w-[320px] rounded-2xl border border-[#d4a843]/70 bg-gradient-to-b from-[#fffdf7]/95 via-[#faf3e2]/92 to-[#f5ead0]/95 px-6 py-5 shadow-[0_8px_24px_rgba(75,45,20,0.14)] backdrop-blur-sm sm:px-8 sm:py-6 md:w-[300px] lg:w-[350px]">
              {/* Traditional Auspicious Corner Marks */}
              <span className="absolute top-2 left-2 size-2.5 border-t-2 border-l-2 border-[#8b1a1a]/70" />
              <span className="absolute top-2 right-2 size-2.5 border-t-2 border-r-2 border-[#8b1a1a]/70" />
              <span className="absolute bottom-2 left-2 size-2.5 border-b-2 border-l-2 border-[#8b1a1a]/70" />
              <span className="absolute bottom-2 right-2 size-2.5 border-b-2 border-r-2 border-[#8b1a1a]/70" />

              <p className="text-[11px] font-semibold tracking-[0.24em] text-[#996515] uppercase">
                The Bride
              </p>
              <h1
                ref={brideNameRef}
                className="mt-1 font-[family-name:var(--font-playfair)] text-[36px] font-bold tracking-[0.06em] text-[#8b1a1a] drop-shadow-[0_1px_2px_rgba(253,245,230,0.9)] sm:text-[44px] lg:text-[50px] uppercase"
              >
                {names.bride}
              </h1>
            </div>
          </div>

          {/* Announcement and Main Date Pill */}
          <div
            ref={dividerBottomRef}
            className="mt-6 border-t border-[#d4a843]/60 pt-5 sm:mt-8"
          >
            <p
              ref={marryingTextRef}
              className="font-[family-name:var(--font-serif)] text-[14px] font-semibold tracking-[0.24em] text-[#3d1c00] drop-shadow-[0_1px_3px_rgba(253,245,230,0.95)] uppercase sm:text-[16px]"
            >
              Are Getting Married
            </p>
            <div
              ref={dateBadgeRef}
              className="mt-3 inline-block rounded-full border-2 border-[#d4a843] bg-gradient-to-r from-[#fffdf7]/95 via-[#faf3e2]/95 to-[#f5ead0]/95 px-8 py-2 shadow-[0_4px_14px_rgba(75,45,20,0.1)] backdrop-blur-sm"
            >
              <p className="font-[family-name:var(--font-playfair)] text-[16px] font-bold text-[#8b1a1a] drop-shadow-[0_1px_1px_rgba(253,245,230,0.9)] sm:text-[18px]">
                December 1, 2026
              </p>
            </div>
            <p
              ref={timezoneRef}
              className="mt-2 text-[12px] font-medium tracking-wide text-[#3d1c00] drop-shadow-[0_1px_2px_rgba(253,245,230,0.9)]"
            >
              Asia / Kolkata (IST)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
