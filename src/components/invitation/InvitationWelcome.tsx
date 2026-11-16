"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { WeddingSettings } from "@/types/database";
import { coupleNames } from "@/lib/utils/names";
import { mediaUrl } from "@/lib/storage/media";
import { pickImage } from "@/lib/storage/imagery";
import { CoupleGarlandFrame } from "./CoupleGarlandFrame";
import { TraditionalMotifDivider } from "./TraditionalMotifDivider";
import { MandalaDecoration } from "./MandalaDecoration";

export function InvitationWelcome({ wedding }: { wedding: WeddingSettings }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const topDividerRef = useRef<HTMLDivElement | null>(null);
  const headingGroupRef = useRef<HTMLDivElement | null>(null);
  const groomCardRef = useRef<HTMLDivElement | null>(null);
  const ampersandRef = useRef<HTMLDivElement | null>(null);
  const brideCardRef = useRef<HTMLDivElement | null>(null);
  const bottomDividerRef = useRef<HTMLDivElement | null>(null);

  const names = coupleNames(wedding);
  const brideImg =
    mediaUrl(pickImage(wedding.bride_image_path, "bride")) ?? "/images/ai/bride-detail.webp";
  const groomImg =
    mediaUrl(pickImage(wedding.groom_image_path, "groom")) ?? "/images/ai/groom-detail.webp";

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          id: "invitation-welcome-reveal",
          trigger: sectionRef.current,
          start: "top 78%",
          toggleActions: "play none none none",
        },
        defaults: { ease: "power3.out" },
      });

      if (topDividerRef.current) {
        tl.fromTo(
          topDividerRef.current,
          { opacity: 0, scale: 0.9, y: 15 },
          { opacity: 1, scale: 1, y: 0, duration: 0.7 }
        );
      }

      if (headingGroupRef.current) {
        tl.fromTo(
          headingGroupRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.4"
        );
      }

      // Staggered couple profiles: Groom enters from left, Bride from right
      if (groomCardRef.current) {
        tl.fromTo(
          groomCardRef.current,
          { opacity: 0, x: -35, scale: 0.92 },
          { opacity: 1, x: 0, scale: 1, duration: 0.85 },
          "-=0.4"
        );
      }

      if (ampersandRef.current) {
        tl.fromTo(
          ampersandRef.current,
          { opacity: 0, scale: 0.6 },
          { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.5)" },
          "-=0.5"
        );
      }

      if (brideCardRef.current) {
        tl.fromTo(
          brideCardRef.current,
          { opacity: 0, x: 35, scale: 0.92 },
          { opacity: 1, x: 0, scale: 1, duration: 0.85 },
          "-=0.6"
        );
      }

      if (bottomDividerRef.current) {
        tl.fromTo(
          bottomDividerRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.3"
        );
      }
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="welcome-heading"
      className="relative overflow-hidden py-14 sm:py-18 md:py-24 bg-[#fdf5e6]"
    >
      {/* Background Subtle Mandalas */}
      <div className="absolute top-10 -left-16 sm:left-4 pointer-events-none">
        <MandalaDecoration size={220} opacity={0.12} />
      </div>
      <div className="absolute bottom-10 -right-16 sm:right-4 pointer-events-none">
        <MandalaDecoration size={220} opacity={0.12} />
      </div>

      <div className="relative z-10 mx-auto max-w-[880px] px-4 text-center sm:px-6">
        {/* Top Traditional Elephant & Kalash Divider */}
        <div ref={topDividerRef} className="mb-6">
          <TraditionalMotifDivider size="md" />
        </div>

        {/* Section Headings */}
        <div ref={headingGroupRef}>
          <p className="font-[family-name:var(--font-script)] text-[28px] text-[#8b1a1a] sm:text-[34px]">
            Dear Friends &amp; Family
          </p>

          <h2
            id="welcome-heading"
            className="mt-1 font-[family-name:var(--font-playfair)] text-[32px] font-bold text-[#3d1c00] sm:text-[44px]"
          >
            Meet The Couple
          </h2>

          {wedding.invitation_family_names ? (
            <p className="mt-2 text-[14px] tracking-wide text-[#7b6a58]">
              {wedding.invitation_family_names}
            </p>
          ) : null}

          <p className="mx-auto mt-4 max-w-[56ch] font-[family-name:var(--font-serif)] text-[18px] leading-relaxed text-[#5c4033] sm:text-[21px]">
            {wedding.invitation_intro_message ||
              "With the blessings of our families, we warmly invite you to celebrate the beginning of our new journey together. Your presence will make this special occasion even more memorable."}
          </p>
        </div>

        {/* Couple Profile Circles with South Indian Garland Frames */}
        <div className="mt-12 flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-14 md:gap-20">
          {/* Groom Profile */}
          <div ref={groomCardRef} className="flex flex-col items-center">
            <CoupleGarlandFrame>
              <Image
                src={groomImg}
                alt={`${names.groom} - The Groom`}
                fill
                sizes="(max-width: 640px) 140px, 180px"
                className="object-cover"
              />
            </CoupleGarlandFrame>
            <h3 className="mt-3 font-[family-name:var(--font-playfair)] text-[24px] font-bold text-[#3d1c00] sm:text-[28px]">
              {names.groom}
            </h3>
            <p className="text-[12px] font-semibold tracking-[0.16em] text-[#8b1a1a] uppercase">
              The Groom
            </p>
            {wedding.groom_intro ? (
              <p className="mt-2 max-w-[28ch] text-[13px] leading-relaxed text-[#7b6a58]">
                {wedding.groom_intro}
              </p>
            ) : null}
          </div>

          {/* Center Auspicious Ampersand */}
          <div
            ref={ampersandRef}
            className="hidden sm:block font-[family-name:var(--font-script)] text-[44px] text-[#d4a843]"
          >
            &amp;
          </div>

          {/* Bride Profile */}
          <div ref={brideCardRef} className="flex flex-col items-center">
            <CoupleGarlandFrame>
              <Image
                src={brideImg}
                alt={`${names.bride} - The Bride`}
                fill
                sizes="(max-width: 640px) 140px, 180px"
                className="object-cover"
              />
            </CoupleGarlandFrame>
            <h3 className="mt-3 font-[family-name:var(--font-playfair)] text-[24px] font-bold text-[#3d1c00] sm:text-[28px]">
              {names.bride}
            </h3>
            <p className="text-[12px] font-semibold tracking-[0.16em] text-[#8b1a1a] uppercase">
              The Bride
            </p>
            {wedding.bride_intro ? (
              <p className="mt-2 max-w-[28ch] text-[13px] leading-relaxed text-[#7b6a58]">
                {wedding.bride_intro}
              </p>
            ) : null}
          </div>
        </div>

        {/* Bottom Traditional Elephant & Kalash Divider */}
        <div ref={bottomDividerRef} className="mt-12 sm:mt-16">
          <TraditionalMotifDivider size="md" />
        </div>
      </div>
    </section>
  );
}
