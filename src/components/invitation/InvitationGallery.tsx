"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryMedia } from "@/types/database";
import { mediaUrl } from "@/lib/storage/media";
import { AI_SLOTS } from "@/config/ai-assets";
import { TraditionalMotifDivider } from "./TraditionalMotifDivider";
import { MandalaDecoration } from "./MandalaDecoration";

export function InvitationGallery({ media }: { media: GalleryMedia[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Combine database gallery media with authentic wedding shoot photos if database has fewer items
  const galleryItems =
    media && media.length > 0
      ? media.map((m) => ({
          id: m.id,
          url: mediaUrl(m.storage_path) ?? "/images/wedding-shoot/optimised/photo-01.webp",
          caption: m.caption ?? m.title ?? "Wedding Celebration",
          alt: m.alt_text ?? "Manikanta & Sravika Wedding Celebration",
        }))
      : [
          { id: "shoot-13", url: "/images/wedding-shoot/optimised/photo-13.webp", caption: "Manikanta & Sravika — Together in Love", alt: "Manikanta & Sravika wedding portrait" },
          { id: "shoot-05", url: "/images/wedding-shoot/optimised/photo-05.webp", caption: "Ceremonial Couple Portrait", alt: "Manikanta & Sravika ceremonial portrait" },
          { id: "shoot-06", url: "/images/wedding-shoot/optimised/photo-06.webp", caption: "Joyful Beginnings", alt: "Manikanta & Sravika portrait" },
          { id: "shoot-01", url: "/images/wedding-shoot/optimised/photo-01.webp", caption: "A Golden Afternoon", alt: "Manikanta & Sravika candid" },
          { id: "shoot-03", url: "/images/wedding-shoot/optimised/photo-03.webp", caption: "Walking into Forever", alt: "Manikanta & Sravika pre-wedding walk" },
          { id: "shoot-08", url: "/images/wedding-shoot/optimised/photo-08.webp", caption: "Moments of Happiness", alt: "Manikanta & Sravika outdoor" },
        ];

  function handlePrev() {
    if (activeIdx === null) return;
    setActiveIdx((prev) => (prev! > 0 ? prev! - 1 : galleryItems.length - 1));
  }

  function handleNext() {
    if (activeIdx === null) return;
    setActiveIdx((prev) => (prev! < galleryItems.length - 1 ? prev! + 1 : 0));
  }

  return (
    <section aria-labelledby="gallery-heading" className="relative overflow-hidden py-14 sm:py-20 lg:py-24 bg-[#fdf5e6]">
      <div className="absolute top-10 right-2">
        <MandalaDecoration size={200} opacity={0.12} />
      </div>

      <div className="relative z-10 mx-auto max-w-[1020px] px-4 sm:px-6">
        <div className="text-center">
          <p className="font-[family-name:var(--font-script)] text-[28px] text-[#8b1a1a] sm:text-[32px]">
            Moments in Time
          </p>
          <h2
            id="gallery-heading"
            className="mt-1 font-[family-name:var(--font-playfair)] text-[34px] font-bold text-[#3d1c00] sm:text-[44px]"
          >
            Cherished Moments
          </h2>
          <div className="mx-auto my-4 max-w-[320px]">
            <TraditionalMotifDivider size="sm" />
          </div>
          <p className="mx-auto max-w-[56ch] font-[family-name:var(--font-serif)] text-[18px] text-[#5c4033]">
            A glimpse into the cherished celebrations, pre-wedding rituals and joyful memories.
          </p>
        </div>

        {/* Editorial Collage Grid matching Reference Blueprint */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          {galleryItems.slice(0, 6).map((item, idx) => {
            // Give varied aspect ratios to create that editorial collage feel
            const aspectClass =
              idx === 0
                ? "col-span-2 aspect-[16/10] md:col-span-2"
                : idx === 1
                ? "col-span-1 aspect-square md:col-span-1"
                : idx === 2
                ? "col-span-1 aspect-[4/5]"
                : idx === 3
                ? "col-span-1 aspect-square"
                : idx === 4
                ? "col-span-1 aspect-[4/5]"
                : "col-span-2 aspect-[16/9] md:col-span-3";

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`group relative overflow-hidden rounded-[12px] border border-[#d4a843]/60 bg-[#fffcf7] shadow-sm transition-all duration-300 hover:border-[#8b1a1a] hover:shadow-md cursor-pointer ${aspectClass}`}
              >
                <Image
                  src={item.url}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 500px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3d1c00]/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute right-3 bottom-3 left-3 truncate text-left text-[12px] font-medium text-[#fffcf7] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {item.caption}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeIdx !== null && galleryItems[activeIdx] ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#3d1c00]/90 p-4 backdrop-blur-sm"
          onClick={() => setActiveIdx(null)}
        >
          <div
            className="relative flex max-h-[90vh] max-w-[90vw] flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setActiveIdx(null)}
              className="absolute -top-11 right-0 rounded-full bg-[#fffcf7]/20 p-2 text-white hover:bg-[#fffcf7]/40"
              aria-label="Close photo preview"
            >
              <X className="size-5" />
            </button>

            {/* Main Image */}
            <div className="relative aspect-[4/3] max-h-[75vh] w-[85vw] max-w-[960px] overflow-hidden rounded-[8px] border-2 border-[#d4a843]">
              <Image
                src={galleryItems[activeIdx].url}
                alt={galleryItems[activeIdx].alt}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>

            {/* Caption */}
            <p className="mt-3 text-center font-[family-name:var(--font-playfair)] text-[16px] text-[#fdf5e6]">
              {galleryItems[activeIdx].caption}
            </p>

            {/* Navigation buttons */}
            <button
              type="button"
              onClick={handlePrev}
              className="absolute top-1/2 -left-4 -translate-y-1/2 rounded-full border border-[#d4a843] bg-[#3d1c00]/80 p-2 text-[#fdf5e6] shadow-md hover:bg-[#8b1a1a] sm:-left-12"
              aria-label="Previous photo"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute top-1/2 -right-4 -translate-y-1/2 rounded-full border border-[#d4a843] bg-[#3d1c00]/80 p-2 text-[#fdf5e6] shadow-md hover:bg-[#8b1a1a] sm:-right-12"
              aria-label="Next photo"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
