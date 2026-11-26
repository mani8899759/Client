"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles } from "lucide-react";
import type { StoryEntry, WeddingSettings } from "@/types/database";
import { mediaUrl } from "@/lib/storage/media";
import { cn } from "@/lib/utils/cn";

const STORY_PHOTO_FALLBACKS = [
  "/images/wedding-shoot/optimised/photo-01.webp",
  "/images/wedding-shoot/optimised/photo-03.webp",
  "/images/wedding-shoot/optimised/photo-08.webp",
  "/images/wedding-shoot/optimised/photo-11.webp",
  "/images/wedding-shoot/optimised/photo-05.webp",
];

export function InvitationStory({
  story,
  wedding,
}: {
  story: StoryEntry[];
  wedding: WeddingSettings;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !story?.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        if (lineRef.current) {
          gsap.fromTo(
            lineRef.current,
            { scaleY: 0, transformOrigin: "top center" },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: {
                id: "invitation-story-line",
                trigger: sectionRef.current,
                start: "top 65%",
                end: "bottom 75%",
                scrub: 0.4,
              },
            },
          );
        }

        gsap.utils.toArray<HTMLElement>("[data-inv-story-node]").forEach((node, idx) => {
          const fromX = idx % 2 === 0 ? -24 : 24;
          gsap.from(node, {
            x: fromX,
            y: 16,
            opacity: 0.25,
            duration: 0.7,
            ease: "power2.out",
            clearProps: "transform,opacity",
            scrollTrigger: {
              id: `invitation-story-node-${idx}`,
              trigger: node,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          });
        });
      });

      mm.add("(max-width: 1023px)", () => {
        gsap.utils.toArray<HTMLElement>("[data-inv-story-node]").forEach((node, idx) => {
          gsap.from(node, {
            y: 16,
            opacity: 0.35,
            duration: 0.45,
            ease: "power2.out",
            clearProps: "transform,opacity",
            scrollTrigger: {
              id: `invitation-story-mobile-${idx}`,
              trigger: node,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          });
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [story]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="story-heading"
      className="relative overflow-hidden bg-[#fff9f0] py-14 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-[1040px] px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="font-[family-name:var(--font-script)] text-[28px] text-[#8b1a1a] sm:text-[34px]">
            Our Love Story
          </p>
          <h2
            id="story-heading"
            className="mt-1 font-serif text-[34px] font-normal tracking-[-0.01em] text-[#493628] sm:text-[46px]"
          >
            A Journey Together
          </h2>
          <div className="mx-auto my-4 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-[#c5a36b]" />
            <Sparkles className="size-4 text-[#c5a36b]" aria-hidden />
            <span className="h-px w-12 bg-[#c5a36b]" />
          </div>
          {wedding.story_intro ? (
            <p className="mx-auto max-w-[60ch] font-serif text-[18px] leading-relaxed text-[#7b6a58] sm:text-[20px]">
              {wedding.story_intro}
            </p>
          ) : null}
        </div>

        {story && story.length > 0 ? (
          <div className="relative mt-12 sm:mt-16">
            {/* Desktop Central Connecting Line */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-4 bottom-4 left-1/2 hidden w-px -translate-x-1/2 bg-[#e5d5bd] lg:block"
            >
              <div ref={lineRef} className="h-full w-full bg-[#c5a36b]" />
            </div>

            {/* Mobile Left Connecting Line */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-4 bottom-4 left-2.5 w-px bg-[#c5a36b]/45 lg:hidden"
            />

            <div className="space-y-12 lg:space-y-16">
              {story.map((entry, index) => {
                const isReversed = index % 2 === 1;
                const fallbackPhoto = STORY_PHOTO_FALLBACKS[index % STORY_PHOTO_FALLBACKS.length]!;
                const imgUrl = mediaUrl(entry.image_path) ?? fallbackPhoto;
                const milestoneBadge = entry.date_label || entry.entry_date || entry.chapter || `Chapter 0${index + 1}`;
                const numLabel = String(index + 1).padStart(2, "0");

                return (
                  <article
                    key={entry.id}
                    data-inv-story-node
                    className="relative pl-8 lg:grid lg:grid-cols-12 lg:items-center lg:gap-12 lg:pl-0"
                  >
                    {/* Mobile Timeline Marker */}
                    <span
                      aria-hidden
                      className="absolute top-6 left-[5px] size-3 rounded-full border-2 border-[#fff9f0] bg-[#8b1a1a] lg:hidden"
                    />

                    {/* Desktop Central Milestone Node */}
                    <div
                      aria-hidden
                      className="absolute top-1/2 left-1/2 z-10 hidden size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#c5a36b] bg-[#fffcf7] font-serif text-[13px] font-semibold text-[#8b1a1a] shadow-2xs lg:flex"
                    >
                      {numLabel}
                    </div>

                    {/* Photograph Column */}
                    <div
                      className={cn(
                        "lg:col-span-5",
                        isReversed ? "lg:col-start-8 lg:order-2" : "lg:col-start-1 lg:order-1",
                      )}
                    >
                      <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-[12px] border border-[#e5d5bd] bg-[#f7f0e4] shadow-[0_6px_22px_rgba(73,54,40,0.08)] sm:aspect-[16/11]">
                        <Image
                          src={imgUrl}
                          alt={entry.image_alt || entry.title}
                          fill
                          sizes="(max-width: 1023px) 100vw, 440px"
                          className="object-cover object-[center_20%] transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        <span className="absolute top-3 left-3 rounded-full border border-[#c5a36b]/60 bg-[#8b1a1a]/95 px-3 py-1 text-[11px] font-medium tracking-wider text-[#fdf5e6] uppercase">
                          {entry.chapter || `Chapter ${numLabel}`}
                        </span>
                      </div>
                    </div>

                    {/* Text Milestone Card */}
                    <div
                      className={cn(
                        "mt-4 lg:col-span-5 lg:mt-0",
                        isReversed ? "lg:col-start-1 lg:order-1 lg:text-right" : "lg:col-start-8 lg:order-2 lg:text-left",
                      )}
                    >
                      <div className="rounded-[12px] border border-[#e5d5bd] bg-[#fffcf7] p-5 shadow-[0_2px_14px_rgba(73,54,40,0.04)] sm:p-6">
                        <span className="inline-block rounded-full border border-[#c5a36b]/50 bg-[#fff9f0] px-3 py-0.5 text-[11px] font-semibold tracking-[0.14em] text-[#8b1a1a] uppercase">
                          {milestoneBadge}
                        </span>
                        <h3 className="mt-3 font-serif text-[26px] font-normal leading-snug text-[#493628] sm:text-[30px]">
                          {entry.title}
                        </h3>
                        {entry.description ? (
                          <p className="mt-2.5 text-[15px] leading-relaxed text-[#7b6a58]">
                            {entry.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="mt-10 text-center font-serif text-[18px] text-[#7b6a58]">
            Our story chapters will be shared here soon.
          </p>
        )}

        {wedding.story_closing ? (
          <div className="mt-12 text-center sm:mt-16">
            <p className="font-[family-name:var(--font-script)] text-[24px] text-[#8b1a1a] sm:text-[28px]">
              &ldquo;{wedding.story_closing}&rdquo;
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
