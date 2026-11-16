"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import type { WeddingSettings } from "@/types/database";
import { mediaUrl } from "@/lib/storage/media";
import { InvitationToran } from "./InvitationToran";

export function InvitationGopuramSection({ wedding }: { wedding: WeddingSettings }) {
  const containerRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();

  // If disabled by administrator
  if (wedding.invitation_gopuram_enabled === false) {
    return null;
  }

  // Determine artwork path (admin configurable with default fallbacks)
  const gopuramImageRef = wedding.invitation_gopuram_image_path || "priyaa-arjun-invitation-gopuram.png";
  const gopuramSrc = gopuramImageRef.startsWith("http") || gopuramImageRef.startsWith("/")
    ? gopuramImageRef
    : gopuramImageRef.startsWith("static/")
    ? `/${gopuramImageRef.replace("static/", "")}`
    : `/images/${gopuramImageRef}`;

  // Scroll-linked smooth reveal
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.4, 0.9, 1], [0.15, 0.6, 0.95, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [80, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);

  return (
    <section
      ref={containerRef}
      aria-label="Traditional South Indian Gopuram Temple Finale"
      className="relative overflow-hidden bg-[#fdf5e6] pt-12 sm:pt-16 pb-0"
    >
      {/* Decorative Traditional Auspicious Header */}
      <div className="relative z-10 mx-auto max-w-[800px] px-4 text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#d4a843]" />
          <span className="font-[family-name:var(--font-script)] text-[24px] text-[#8b1a1a] sm:text-[28px]">
            Deva Devalayam
          </span>
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#d4a843]" />
        </div>
        <p className="mt-1 font-[family-name:var(--font-serif)] text-[16px] tracking-[0.08em] text-[#5c4033] uppercase sm:text-[17px]">
          Seeking the Eternal Blessings of the Divine
        </p>
      </div>

      {/* Scroll-Revealed Temple Illustration Container */}
      <motion.div
        style={
          reduceMotion
            ? { opacity: 1 }
            : {
                opacity,
                y,
                scale,
              }
        }
        className="relative mx-auto mt-6 flex w-full max-w-[1360px] items-end justify-center px-2 sm:px-6"
      >
        {/* Soft top gradient to blend clouds flawlessly into cream background */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-[#fdf5e6] to-transparent" />

        {/* 
          Responsive artwork wrapper:
          On desktop: natural wide aspect ratio (1240 x 721 ~ 1.72:1)
          On mobile: min-height ensures the central tower remains large, majestic, and prominent 
        */}
        <div className="relative aspect-[1240/721] w-full min-h-[340px] sm:min-h-[460px] md:min-h-[580px] lg:min-h-[660px]">
          <picture>
            <source
              srcSet="/images/priyaa-arjun-invitation-gopuram.webp"
              type="image/webp"
            />
            <Image
              src="/images/priyaa-arjun-invitation-gopuram.png"
              alt="Traditional South Indian Temple Gopuram illustration with golden towers, sacred architectural carvings, cream clouds, and traditional flourishes"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 1360px"
              priority={false}
              className="object-contain object-bottom"
            />
          </picture>
        </div>
      </motion.div>

      {/* Ultra subtle baseline trim seamlessly matching #fdf5e6 with traditional mango leaf toran finish */}
      <div className="w-full bg-[#fdf5e6] pt-1">
        <InvitationToran />
      </div>
    </section>
  );
}
