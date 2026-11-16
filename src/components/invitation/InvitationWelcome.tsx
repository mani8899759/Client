"use client";

import Image from "next/image";
import type { WeddingSettings } from "@/types/database";
import { coupleNames } from "@/lib/utils/names";
import { mediaUrl } from "@/lib/storage/media";
import { pickImage } from "@/lib/storage/imagery";
import { TempleArchMotif, FloralDivider, GarlandWreath } from "./TraditionalMotifs";
import { MandalaDecoration } from "./MandalaDecoration";

export function InvitationWelcome({ wedding }: { wedding: WeddingSettings }) {
  const names = coupleNames(wedding);
  const brideImg = mediaUrl(pickImage(wedding.bride_image_path, "bride")) ?? "/images/ai/bride-detail.webp";
  const groomImg = mediaUrl(pickImage(wedding.groom_image_path, "groom")) ?? "/images/ai/groom-detail.webp";

  return (
    <section aria-labelledby="welcome-heading" className="relative overflow-hidden py-16 sm:py-24 bg-[#fdf5e6]">
      {/* Decorative Golden Mandalas in the corners */}
      <MandalaDecoration
        size={300}
        className="absolute -top-16 -left-16"
        opacity={0.16}
      />
      <MandalaDecoration
        size={300}
        className="absolute -bottom-16 -right-16"
        opacity={0.16}
      />

      <div className="relative z-10 mx-auto max-w-[880px] px-4 text-center sm:px-6">
        {/* Traditional Royal Elephant & Kalash Procession Motif */}
        <TempleArchMotif className="mb-4" />

        <p className="font-[family-name:var(--font-script)] text-[30px] text-[#8b1a1a] sm:text-[38px]">
          Dear Friends &amp; Family
        </p>

        <h2
          id="welcome-heading"
          className="mt-1 font-[family-name:var(--font-playfair)] text-[34px] font-bold text-[#3d1c00] sm:text-[46px]"
        >
          Meet The Couple
        </h2>

        <FloralDivider className="my-4" />

        <p className="mx-auto mt-2 max-w-[56ch] font-[family-name:var(--font-serif)] text-[18px] leading-relaxed text-[#5c4033] sm:text-[21px]">
          {wedding.invitation_intro_message ||
            "With the blessings of our families, we warmly invite you to celebrate the beginning of our new journey together. Your presence will make this special occasion even more memorable."}
        </p>

        {wedding.invitation_family_names ? (
          <p className="mt-2 text-[14px] tracking-wide text-[#7b6a58] sm:text-[15px]">
            {wedding.invitation_family_names}
          </p>
        ) : null}

        {/* Circular Garland Portrait Composition — matching reference screenshot */}
        <div className="mt-12 flex flex-col items-center justify-center gap-10 sm:flex-row sm:gap-14 lg:gap-20">
          {/* Priya — The Bride */}
          <div className="flex flex-col items-center text-center">
            <GarlandWreath size={220}>
              <Image
                src={brideImg}
                alt={`${names.bride} - The Bride`}
                fill
                sizes="220px"
                className="object-cover object-center"
              />
            </GarlandWreath>

            <h3 className="mt-4 font-[family-name:var(--font-playfair)] text-[24px] font-bold text-[#8b1a1a] sm:text-[28px]">
              {names.bride}
            </h3>
            <p className="text-[12px] font-semibold tracking-[0.16em] text-[#d4a843] uppercase">
              The Bride
            </p>
            {wedding.bride_intro ? (
              <p className="mt-2 max-w-[26ch] text-[13px] leading-relaxed text-[#5c4033]">
                {wedding.bride_intro}
              </p>
            ) : null}
          </div>

          {/* Decorative & separator */}
          <div className="hidden sm:flex flex-col items-center justify-center text-[#d4a843]">
            <span className="font-[family-name:var(--font-script)] text-[44px] text-[#8b1a1a]">&amp;</span>
          </div>

          {/* Arjun — The Groom */}
          <div className="flex flex-col items-center text-center">
            <GarlandWreath size={220}>
              <Image
                src={groomImg}
                alt={`${names.groom} - The Groom`}
                fill
                sizes="220px"
                className="object-cover object-center"
              />
            </GarlandWreath>

            <h3 className="mt-4 font-[family-name:var(--font-playfair)] text-[24px] font-bold text-[#8b1a1a] sm:text-[28px]">
              {names.groom}
            </h3>
            <p className="text-[12px] font-semibold tracking-[0.16em] text-[#d4a843] uppercase">
              The Groom
            </p>
            {wedding.groom_intro ? (
              <p className="mt-2 max-w-[26ch] text-[13px] leading-relaxed text-[#5c4033]">
                {wedding.groom_intro}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
