"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import type { GalleryMedia } from "@/types/database";
import { mediaUrl } from "@/lib/storage/media";
import { AI_SLOTS } from "@/config/ai-assets";
import { FloralDivider } from "./TraditionalMotifs";
import { MandalaDecoration } from "./MandalaDecoration";

export function InvitationGallery({ media }: { media: GalleryMedia[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const galleryItems =
    media && media.length > 0
      ? media.map((m) => ({
          id: m.id,
          url: mediaUrl(m.storage_path) ?? "/images/ai/gallery-01.webp",
          caption: m.caption ?? m.title ?? "Wedding Celebration",
          alt: m.alt_text ?? "Priya & Arjun Wedding Celebration",
        }))
      : AI_SLOTS.filter((s) => s.group === "gallery").map((s) => ({
          id: s.slot,
          url: `/images/ai/${s.file}`,
          caption: s.usedFor,
          alt: s.alt,
        }));

  function handlePrev() {
    if (activeIdx === null) return;
    setActiveIdx((prev) => (prev! > 0 ? prev! - 1 : galleryItems.length - 1));
  }

  function handleNext() {
    if (activeIdx === null) return;
    setActiveIdx((prev) => (prev! < galleryItems.length - 1 ? prev! + 1 : 0));
  }

  return (
    <section aria-labelledby="gallery-heading" className="relative overflow-hidden py-16 sm:py-24 bg-[#fdf5e6]">
      {/* Background Mandala Accents */}
      <MandalaDecoration size={260} className="absolute -top-12 -right-12" opacity={0.14} />

      <div className="relative z-10 mx-auto max-w-[1040px] px-4 sm:px-6">
        <div className="text-center">
          <p className="font-[family-name:var(--font-script)] text-[30px] text-[#8b1a1a] sm:text-[36px]">
            Moments in Time
          </p>
          <h2
            id="gallery-heading"
            className="mt-1 font-[family-name:var(--font-playfair)] text-[34px] font-bold text-[#3d1c00] sm:text-[44px]"
          >
            Photo Gallery
          </h2>
          <FloralDivider className="my-3" />
          <p className="mx-auto max-w-[56ch] font-[family-name:var(--font-serif)] text-[18px] text-[#5c4033] sm:text-[20px]">
            A glimpse into the cherished celebrations, pre-wedding rituals and joyful memories of Priya &amp; Arjun.
          </p>
        </div>

        {/* Mixed Editorial Collage Layout — matching reference blueprint */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5">
          {galleryItems.slice(0, 6).map((item, idx) => {
            // Give item 0 a featured 2-column or prominent presence
            const isFeatured = idx === 0;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`group relative overflow-hidden rounded-[14px] border-2 border-[#d4a843]/50 bg-[#fffcf7] shadow-xs transition-all duration-300 hover:border-[#8b1a1a] hover:shadow-md cursor-pointer ${
                  isFeatured ? "col-span-2 aspect-[16/10] md:col-span-2 md:aspect-[16/10]" : "aspect-[1/1]"
                }`}
              >
                <Image
                  src={item.url}
                  alt={item.alt}
                  fill
                  sizes={isFeatured ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 640px) 50vw, 33vw"}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3d1c00]/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-4">
                  <div className="flex w-full items-center justify-between text-[#fffcf7]">
                    <span className="truncate text-[13px] font-medium font-[family-name:var(--font-serif)]">
                      {item.caption}
                    </span>
                    <Maximize2 className="size-4 shrink-0 text-[#d4a843]" />
                  </div>
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
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-[16px] border-2 border-[#d4a843] bg-[#2b1604] p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveIdx(null)}
              className="absolute top-4 right-4 z-10 flex size-9 items-center justify-center rounded-full bg-[#3d1c00]/80 text-[#fdf5e6] hover:bg-[#8b1a1a]"
              aria-label="Close image preview"
            >
              <X className="size-5" />
            </button>

            <div className="relative aspect-[4/3] max-h-[75vh] w-[80vw] max-w-[800px]">
              <Image
                src={galleryItems[activeIdx].url}
                alt={galleryItems[activeIdx].alt}
                fill
                className="object-contain"
                priority
              />
            </div>

            <div className="flex items-center justify-between p-3 text-[#fdf5e6]">
              <p className="font-[family-name:var(--font-serif)] text-[16px]">
                {galleryItems[activeIdx].caption}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex size-8 items-center justify-center rounded-full border border-[#d4a843] text-[#d4a843] hover:bg-[#d4a843]/20"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <span className="text-[12px] text-[#f5ebd5]">
                  {activeIdx + 1} / {galleryItems.length}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex size-8 items-center justify-center rounded-full border border-[#d4a843] text-[#d4a843] hover:bg-[#d4a843]/20"
                  aria-label="Next photo"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
