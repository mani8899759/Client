"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";
import type { StoryEntry, WeddingSettings } from "@/types/database";
import { mediaUrl } from "@/lib/storage/media";
import { cn } from "@/lib/utils/cn";

export function InvitationStory({
  story,
  wedding,
}: {
  story: StoryEntry[];
  wedding: WeddingSettings;
}) {
  if (!story || story.length === 0) return null;

  return (
    <section aria-labelledby="story-heading" className="py-14 sm:py-20 bg-[#f5ebd5]/40">
      <div className="mx-auto max-w-[920px] px-4 sm:px-6">
        <div className="text-center">
          <p className="font-[family-name:var(--font-script)] text-[28px] text-[#8b1a1a]">
            Our Love Story
          </p>
          <h2 id="story-heading" className="mt-1 font-[family-name:var(--font-playfair)] text-[34px] font-bold text-[#3d1c00] sm:text-[44px]">
            A Journey Together
          </h2>
          <div className="mx-auto my-4 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-[#d4a843]" />
            <Sparkles className="size-4 text-[#d4a843]" />
            <span className="h-px w-12 bg-[#d4a843]" />
          </div>
          {wedding.story_intro ? (
            <p className="mx-auto max-w-[64ch] font-[family-name:var(--font-serif)] text-[18px] text-[#5c4033]">
              {wedding.story_intro}
            </p>
          ) : null}
        </div>

        {/* Story chapters alternating */}
        <div className="mt-12 space-y-12 sm:mt-16 sm:space-y-16">
          {story.map((entry, index) => {
            const isEven = index % 2 === 1;
            const imgUrl = mediaUrl(entry.image_path) ?? "/images/ai/couple-prewedding.webp";

            return (
              <div
                key={entry.id}
                className={cn(
                  "flex flex-col items-center gap-8 rounded-[16px] border border-[#d4a843]/40 bg-[#fffcf7] p-6 shadow-sm sm:p-8 lg:flex-row",
                  isEven && "lg:flex-row-reverse"
                )}
              >
                {/* Story Image */}
                <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-[12px] border border-[#d4a843]/50 shadow-md sm:aspect-[16/10] lg:w-[45%]">
                  <Image
                    src={imgUrl}
                    alt={entry.image_alt || entry.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 400px"
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3 rounded-full bg-[#8b1a1a]/90 px-3 py-1 text-[11px] font-medium tracking-wider text-[#fdf5e6] uppercase">
                    Chapter 0{index + 1}
                  </div>
                </div>

                {/* Story Content */}
                <div className="flex flex-col text-left lg:w-[55%]">
                  {entry.entry_date ? (
                    <span className="text-[12px] tracking-[0.14em] text-[#8b1a1a] uppercase font-semibold">
                      {entry.entry_date}
                    </span>
                  ) : null}
                  <h3 className="mt-1 font-[family-name:var(--font-playfair)] text-[24px] font-bold text-[#3d1c00] sm:text-[28px]">
                    {entry.title}
                  </h3>
                  <div className="mt-3 font-[family-name:var(--font-serif)] text-[16px] leading-relaxed text-[#5c4033] sm:text-[18px]">
                    {entry.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {wedding.story_closing ? (
          <div className="mt-12 text-center">
            <p className="font-[family-name:var(--font-script)] text-[22px] text-[#8b1a1a] sm:text-[26px]">
              &ldquo;{wedding.story_closing}&rdquo;
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
