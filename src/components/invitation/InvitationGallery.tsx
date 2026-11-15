"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, Sparkles, X } from "lucide-react";
import type { GalleryMedia } from "@/types/database";
import { mediaUrl } from "@/lib/storage/media";
import { AI_SLOTS } from "@/config/ai-assets";

export function InvitationGallery({ media }: { media: GalleryMedia[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Combine database gallery media with static AI assets if database has fewer items
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
    <section aria-labelledby="gallery-heading" className="py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1020px] px-4 sm:px-6">
        <div className="text-center">
          <p className="font-[family-name:var(--font-script)] text-[28px] text-[#8b1a1a]">
            Moments in Time
          </p>
          <h2 id="gallery-heading" className="mt-1 font-[family-name:var(--font-playfair)] text-[34px] font-bold text-[#3d1c00] sm:text-[44px]">
            Wedding Visual Gallery
          </h2>
          <div className="mx-auto my-4 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-[#d4a843]" />
            <Sparkles className="size-4 text-[#d4a843]" />
            <span className="h-px w-12 bg-[#d4a843]" />
          </div>
          <p className="mx-auto max-w-[56ch] font-[family-name:var(--font-serif)] text-[18px] text-[#5c4033]">
            A glimpse into the cherished celebrations, pre-wedding rituals and joyful memories.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
          {galleryItems.slice(0, 9).map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className="group relative aspect-[4/5] w-full overflow-hidden rounded-[12px] border border-[#d4a843]/40 bg-[#fffcf7] shadow-sm transition-all duration-300 hover:border-[#8b1a1a] hover:shadow-md cursor-pointer"
            >
              <Image
                src={item.url}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3d1c00]/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute right-2 bottom-2 left-2 truncate text-left text-[12px] font-medium text-[#fffcf7] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {item.caption}
              </div>
            </button>
          ))}
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
            <div className="relative h-[65vh] w-[85vw] max-w-[900px] overflow-hidden rounded-[12px] shadow-2xl">
              <Image
                src={galleryItems[activeIdx].url}
                alt={galleryItems[activeIdx].alt}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Caption */}
            <p className="mt-3 text-center text-[14px] text-[#fdf5e6]">
              {galleryItems[activeIdx].caption} ({activeIdx + 1} of {galleryItems.length})
            </p>

            {/* Prev / Next */}
            <button
              type="button"
              onClick={handlePrev}
              className="absolute top-1/2 -left-12 -translate-y-1/2 rounded-full bg-[#fffcf7]/20 p-2 text-white hover:bg-[#fffcf7]/40 sm:-left-16"
              aria-label="Previous photo"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute top-1/2 -right-12 -translate-y-1/2 rounded-full bg-[#fffcf7]/20 p-2 text-white hover:bg-[#fffcf7]/40 sm:-right-16"
              aria-label="Next photo"
            >
              <ChevronRight className="size-6" />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
