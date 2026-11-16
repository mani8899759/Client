"use client";

import Image from "next/image";
import type { WeddingSettings } from "@/types/database";
import { coupleNames } from "@/lib/utils/names";
import { mediaUrl } from "@/lib/storage/media";
import { pickImage } from "@/lib/storage/imagery";
import { CoupleGarlandFrame } from "./CoupleGarlandFrame";
import { TraditionalMotifDivider } from "./TraditionalMotifDivider";
import { MandalaDecoration } from "./MandalaDecoration";

export function InvitationWelcome({ wedding }: { wedding: WeddingSettings }) {
  const names = coupleNames(wedding);
  const brideImg = mediaUrl(pickImage(wedding.bride_image_path, "bride")) ?? "/images/ai/bride-detail.webp";
  const groomImg = mediaUrl(pickImage(wedding.groom_image_path, "groom")) ?? "/images/ai/groom-detail.webp";

  return (
    <section aria-labelledby="welcome-heading" className="relative overflow-hidden py-12 sm:py-16 md:py-20 bg-[#fdf5e6]">
      {/* Background Subtle Mandalas */}
      <div className="absolute top-10 -left-16 sm:left-4">
        <MandalaDecoration size={220} opacity={0.12} />
      </div>
      <div className="absolute bottom-10 -right-16 sm:right-4">
        <MandalaDecoration size={220} opacity={0.12} />
      </div>

      <div className="relative z-10 mx-auto max-w-[880px] px-4 text-center sm:px-6">
        {/* Top Traditional Elephant & Kalash Divider */}
        <div className="mb-6">
          <TraditionalMotifDivider size="md" />
        </div>

        {/* Section Headings */}
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

        {/* Couple Profile Circles with South Indian Garland Frames */}
        <div className="mt-10 flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-14 md:gap-20">
          {/* Groom Profile */}
          <div className="flex flex-col items-center">
            <CoupleGarlandFrame>
              <Image
                src={groomImg}
                alt={`${names.groom} - The Groom`}
                fill
                sizes="(max-width: 640px) 140px, 180px"
                className="object-cover"
              />
            </CoupleGarlandFrame>
            <h3 className="mt-2 font-[family-name:var(--font-playfair)] text-[24px] font-bold text-[#3d1c00] sm:text-[28px]">
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
          <div className="hidden sm:block font-[family-name:var(--font-script)] text-[44px] text-[#d4a843]">
            &amp;
          </div>

          {/* Bride Profile */}
          <div className="flex flex-col items-center">
            <CoupleGarlandFrame>
              <Image
                src={brideImg}
                alt={`${names.bride} - The Bride`}
                fill
                sizes="(max-width: 640px) 140px, 180px"
                className="object-cover"
              />
            </CoupleGarlandFrame>
            <h3 className="mt-2 font-[family-name:var(--font-playfair)] text-[24px] font-bold text-[#3d1c00] sm:text-[28px]">
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
        <div className="mt-12 sm:mt-16">
          <TraditionalMotifDivider size="md" />
        </div>
      </div>
    </section>
  );
}
