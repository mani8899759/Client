"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import { mediaUrl } from "@/lib/storage/media";
import { getYouTubeId, youTubeEmbedUrl } from "@/lib/utils/youtube";
import type { GalleryMedia } from "@/types/database";

const SLIDE_MS = 4500;

/**
 * Full-screen lightbox: keyboard (←/→/Esc/Space), swipe, focus trap,
 * slideshow. Images are scaled with object-contain so the original aspect
 * ratio is never distorted. Videos never autoplay with sound.
 */
export function Lightbox({
  items,
  index,
  onIndexChange,
  onClose,
}: {
  items: GalleryMedia[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const item = items[index]!;
  const count = items.length;

  const go = useCallback((delta: number) => onIndexChange((index + delta + count) % count), [index, count, onIndexChange]);

  // Focus management: focus the dialog on open, restore on close.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === " " && (e.target as HTMLElement)?.tagName !== "BUTTON") {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key === "Tab" && rootRef.current) {
        const f = rootRef.current.querySelectorAll<HTMLElement>("button, iframe, video");
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  // Slideshow advances over photographs; it pauses itself on a video.
  useEffect(() => {
    if (!playing || item.media_type === "video" || count < 2) return;
    const t = window.setTimeout(() => go(1), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [playing, index, item.media_type, count, go]);

  const ytId = item.media_type === "video" && item.video_source === "youtube" ? getYouTubeId(item.video_url) : null;
  const videoSrc = item.media_type === "video" && item.video_source === "upload" ? mediaUrl(item.storage_path) : null;
  const photoSrc = item.media_type === "photo" ? mediaUrl(item.storage_path) : null;
  const label = item.alt_text ?? item.title ?? "Wedding photograph";

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Gallery viewer"
      className="fixed inset-0 z-[90] flex flex-col bg-[#2c2018]/[0.97] text-soft-cream"
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6">
        <p className="text-meta text-soft-border" aria-live="polite">
          {index + 1} / {count}
        </p>
        <div className="flex items-center gap-1">
          {count > 1 ? (
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="flex h-11 items-center gap-2 rounded-[var(--radius-control)] px-3 text-[13px] text-soft-border hover:bg-soft-cream/10 hover:text-soft-cream"
              aria-pressed={playing}
            >
              {playing ? <Pause className="size-4" strokeWidth={1.5} aria-hidden /> : <Play className="size-4" strokeWidth={1.5} aria-hidden />}
              <span className="hidden xs:inline">{playing ? "Pause slideshow" : "Start slideshow"}</span>
              <span className="sr-only xs:hidden">{playing ? "Pause slideshow" : "Start slideshow"}</span>
            </button>
          ) : null}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex size-11 items-center justify-center rounded-[var(--radius-control)] text-soft-border hover:bg-soft-cream/10 hover:text-soft-cream"
          >
            <X className="size-5" strokeWidth={1.5} aria-hidden />
            <span className="sr-only">Close viewer</span>
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 px-2 sm:px-20">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={item.id}
            className="absolute inset-0 flex items-center justify-center px-2 sm:px-20"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {photoSrc ? (
              <div className="relative h-full w-full">
                <Image src={photoSrc} alt={label} fill sizes="100vw" className="object-contain" priority />
              </div>
            ) : ytId ? (
              <div className="aspect-video w-full max-w-[1200px]">
                <iframe
                  src={youTubeEmbedUrl(ytId)}
                  title={item.title ?? "Wedding video"}
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-full w-full rounded-[var(--radius-control)] border-0"
                />
              </div>
            ) : videoSrc ? (
              <video src={videoSrc} controls playsInline preload="metadata" className="max-h-full max-w-full rounded-[var(--radius-control)]">
                Your browser does not support embedded video.
              </video>
            ) : (
              <p className="text-support text-soft-border">This item is unavailable.</p>
            )}
          </motion.div>
        </AnimatePresence>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute top-1/2 left-2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full border border-soft-cream/25 text-soft-border hover:border-soft-cream/60 hover:text-soft-cream sm:flex"
            >
              <ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden />
              <span className="sr-only">Previous</span>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute top-1/2 right-2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full border border-soft-cream/25 text-soft-border hover:border-soft-cream/60 hover:text-soft-cream sm:flex"
            >
              <ChevronRight className="size-5" strokeWidth={1.5} aria-hidden />
              <span className="sr-only">Next</span>
            </button>
          </>
        ) : null}
      </div>

      <div className="flex min-h-20 shrink-0 items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="min-w-0">
          {item.title ? <p className="truncate font-serif text-[20px] text-soft-cream">{item.title}</p> : null}
          {item.caption ? <p className="line-clamp-2 text-[13px] text-soft-border/80">{item.caption}</p> : null}
          {item.is_ai_generated ? <p className="text-[11px] tracking-[0.12em] text-soft-border/60 uppercase">AI-generated illustration</p> : null}
        </div>
        {count > 1 ? (
          <div className="flex shrink-0 gap-2 sm:hidden">
            <button type="button" onClick={() => go(-1)} className="flex size-11 items-center justify-center rounded-full border border-soft-cream/25">
              <ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden />
              <span className="sr-only">Previous</span>
            </button>
            <button type="button" onClick={() => go(1)} className="flex size-11 items-center justify-center rounded-full border border-soft-cream/25">
              <ChevronRight className="size-5" strokeWidth={1.5} aria-hidden />
              <span className="sr-only">Next</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
