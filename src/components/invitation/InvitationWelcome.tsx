"use client";

import Image from "next/image";
import { Heart, Sparkles } from "lucide-react";
import type { WeddingSettings } from "@/types/database";
import { coupleNames } from "@/lib/utils/names";
import { mediaUrl } from "@/lib/storage/media";
import { pickImage } from "@/lib/storage/imagery";

export function InvitationWelcome({ wedding }: { wedding: WeddingSettings }) {
  const names = coupleNames(wedding);
  const welcomeImg = mediaUrl(pickImage(wedding.welcome_image_path, "welcome")) ?? "/images/ai/couple-editorial-portrait.webp";
  const brideImg = mediaUrl(pickImage(wedding.bride_image_path, "bride")) ?? "/images/ai/bride-detail.webp";
  const groomImg = mediaUrl(pickImage(wedding.groom_image_path, "groom")) ?? "/images/ai/groom-detail.webp";

  return (
    <section aria-labelledby="welcome-heading" className="py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[880px] px-4 text-center sm:px-6">
        {/* Decorative auspicious header */}
        <p className="font-[family-name:var(--font-script)] text-[28px] text-[#8b1a1a] sm:text-[34px]">
          {wedding.invitation_intro_heading || "Together With Our Families"}
        </p>

        <h2 id="welcome-heading" className="mt-2 font-[family-name:var(--font-playfair)] text-[34px] font-bold text-[#3d1c00] sm:text-[46px] lg:text-[52px]">
          {names.bride} <span className="font-[family-name:var(--font-script)] font-normal text-[#8b1a1a]">&amp;</span> {names.groom}
        </h2>

        {wedding.invitation_family_names ? (
          <p className="mt-3 text-[14px] tracking-wide text-[#7b6a58] sm:text-[15px]">
            {wedding.invitation_family_names}
          </p>
        ) : null}

        <div className="mx-auto my-6 flex items-center justify-center gap-3">
          <span className="h-px w-16 bg-[#d4a843]/60" />
          <Heart className="size-4 text-[#8b1a1a] fill-[#8b1a1a]" />
          <span className="h-px w-16 bg-[#d4a843]/60" />
        </div>

        {/* Invitation welcome letter */}
        <div className="relative rounded-[16px] border border-[#d4a843]/40 bg-[#fffcf7] p-6 shadow-sm sm:p-10">
          <p className="font-[family-name:var(--font-serif)] text-[19px] leading-relaxed text-[#5c4033] sm:text-[22px]">
            {wedding.invitation_intro_message ||
              "We warmly invite you to join us as we celebrate the beginning of our new journey together. Your presence will make our special day even more memorable."}
          </p>

          {/* Couple portrait cards */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col items-center">
              <div className="relative aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-[12px] border-2 border-[#d4a843]/50 shadow-md">
                <Image
                  src={brideImg}
                  alt={`${names.bride} - The Bride`}
                  fill
                  sizes="(max-width: 640px) 100vw, 280px"
                  className="object-cover"
                />
              </div>
              <h3 className="mt-3 font-[family-name:var(--font-playfair)] text-[22px] font-semibold text-[#3d1c00]">
                {names.bride}
              </h3>
              <p className="text-[12px] tracking-[0.14em] text-[#8b1a1a] uppercase font-medium">The Bride</p>
              {wedding.bride_intro ? (
                <p className="mt-2 text-center text-[13px] leading-relaxed text-[#7b6a58]">
                  {wedding.bride_intro}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col items-center">
              <div className="relative aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-[12px] border-2 border-[#d4a843]/50 shadow-md">
                <Image
                  src={groomImg}
                  alt={`${names.groom} - The Groom`}
                  fill
                  sizes="(max-width: 640px) 100vw, 280px"
                  className="object-cover"
                />
              </div>
              <h3 className="mt-3 font-[family-name:var(--font-playfair)] text-[22px] font-semibold text-[#3d1c00]">
                {names.groom}
              </h3>
              <p className="text-[12px] tracking-[0.14em] text-[#8b1a1a] uppercase font-medium">The Groom</p>
              {wedding.groom_intro ? (
                <p className="mt-2 text-center text-[13px] leading-relaxed text-[#7b6a58]">
                  {wedding.groom_intro}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
