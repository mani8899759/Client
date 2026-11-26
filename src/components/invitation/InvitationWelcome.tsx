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
    mediaUrl(pickImage(wedding.bride_image_path, "bride")) ?? "/images/sravika-bride.webp";
  const groomImg =
    mediaUrl(pickImage(wedding.groom_image_path, "groom")) ?? "/images/manikanta-groom.webp";

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Desktop (>= 768px): full staggered horizontal & scale reveal
      mm.add("(min-width: 768px)", () => {
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
      });

      // Mobile (< 768px): lightweight transform + opacity reveal for smooth 60fps scrolling
      mm.add("(max-width: 767px)", () => {
        const tlMobile = gsap.timeline({
          scrollTrigger: {
            id: "invitation-welcome-reveal-mobile",
            trigger: sectionRef.current,
            start: "top 86%",
            toggleActions: "play none none none",
          },
          defaults: { ease: "power2.out", duration: 0.45 },
        });

        const mobileTargets = [
          topDividerRef.current,
          headingGroupRef.current,
          groomCardRef.current,
          ampersandRef.current,
          brideCardRef.current,
          bottomDividerRef.current,
        ].filter(Boolean);

        if (mobileTargets.length) {
          tlMobile.fromTo(
            mobileTargets,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, stagger: 0.06 }
          );
        }
      });
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

          <div className="mt-2.5">
            <p className="font-sans text-[12px] sm:text-[14px] font-semibold tracking-[0.2em] uppercase text-[#8b1a1a]">
              {wedding.family_heading || "Gudla & Padakanti Families"}
            </p>
          </div>

          <p className="mx-auto mt-4 max-w-[58ch] font-[family-name:var(--font-serif)] text-[18px] leading-relaxed text-[#5c4033] sm:text-[21px]">
            {wedding.family_invitation_message ||
              wedding.invitation_intro_message ||
              "Together with the blessings of our families, we cordially invite you to celebrate the wedding of Manikanta & Sravika."}
          </p>
        </div>

        {/* Couple Profile Circles with South Indian Garland Frames - Side by side on mobile & desktop */}
        <div className="mt-10 grid grid-cols-2 items-start justify-center gap-3 sm:flex sm:flex-row sm:items-center sm:gap-14 md:gap-20">
          {/* Groom Profile */}
          <div ref={groomCardRef} className="flex flex-col items-center">
            <CoupleGarlandFrame>
              <Image
                src={groomImg}
                alt={`${names.groom} - The Groom`}
                fill
                sizes="(max-width: 640px) 130px, 180px"
                className="object-cover object-[center_15%]"
              />
            </CoupleGarlandFrame>
            <h3 className="mt-2.5 font-[family-name:var(--font-playfair)] text-[18px] font-bold text-[#3d1c00] sm:mt-3 sm:text-[28px]">
              {names.groom}
            </h3>
            <p className="text-[10px] font-semibold tracking-[0.14em] text-[#8b1a1a] uppercase sm:text-[12px] sm:tracking-[0.16em]">
              The Groom
            </p>
            <p className="mt-0.5 font-serif text-[12px] text-[#996515] italic sm:text-[15px]">
              Chy. Neela Manikanta
            </p>
            <div className="mt-2.5 rounded-[8px] border border-[#d4a843]/40 bg-[#fffcf7]/90 px-3 py-2 text-[11px] leading-snug text-[#5c4033] sm:text-[13px] text-center max-w-[220px]">
              <p className="text-[10px] font-semibold tracking-wider uppercase text-[#8b1a1a]">Son of</p>
              <p className="mt-0.5 font-medium text-[#3d1c00]">Sri Gudla Venu Venkata Parameswara Reddy</p>
              <p className="text-[#5c4033]">&amp; Smt. Nagendra Lakshmi</p>
            </div>
            {wedding.groom_intro ? (
              <p className="mt-1.5 max-w-[28ch] text-[11px] leading-relaxed text-[#7b6a58] sm:mt-2 sm:text-[13px]">
                {wedding.groom_intro}
              </p>
            ) : null}
          </div>

          {/* Center Auspicious Ampersand for Desktop */}
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
                sizes="(max-width: 640px) 130px, 180px"
                className="object-cover object-[center_15%]"
              />
            </CoupleGarlandFrame>
            <h3 className="mt-2.5 font-[family-name:var(--font-playfair)] text-[18px] font-bold text-[#3d1c00] sm:mt-3 sm:text-[28px]">
              {names.bride}
            </h3>
            <p className="text-[10px] font-semibold tracking-[0.14em] text-[#8b1a1a] uppercase sm:text-[12px] sm:tracking-[0.16em]">
              The Bride
            </p>
            <p className="mt-0.5 font-serif text-[12px] text-[#996515] italic sm:text-[15px]">
              Chy. La. Sow. Lakshmi Sravika
            </p>
            <div className="mt-2.5 rounded-[8px] border border-[#d4a843]/40 bg-[#fffcf7]/90 px-3 py-2 text-[11px] leading-snug text-[#5c4033] sm:text-[13px] text-center max-w-[220px]">
              <p className="text-[10px] font-semibold tracking-wider uppercase text-[#8b1a1a]">Daughter of</p>
              <p className="mt-0.5 font-medium text-[#3d1c00]">Smt. Padakanti Saroja</p>
              <p className="text-[#5c4033]">Wife of late Bhrahma Chari</p>
            </div>
            {wedding.bride_intro ? (
              <p className="mt-1.5 max-w-[28ch] text-[11px] leading-relaxed text-[#7b6a58] sm:mt-2 sm:text-[13px]">
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
