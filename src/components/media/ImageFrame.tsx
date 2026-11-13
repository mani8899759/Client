import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { isAiRef, mediaUrl } from "@/lib/storage/media";

/**
 * Editorial image frame. Renders an optimised next/image when a media
 * reference exists; otherwise a clearly labelled placeholder that tells the
 * owner where to supply the photograph. No stock or invented imagery.
 */
export function ImageFrame({
  src,
  mediaRef,
  alt,
  ratio = "4/5",
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  placeholderLabel = "Photograph",
  placeholderHint,
  className,
  imageClassName,
  fill = false,
  rounded = true,
  aiTag = true,
}: {
  /** Show a discreet “Illustration” tag on AI-generated assets (default on — never pass them off as real photos). */
  aiTag?: boolean;
  /** Absolute URL (e.g. YouTube thumbnail). Takes precedence over mediaRef. */
  src?: string | null;
  /** Stored Supabase media reference ("bucket/path"). */
  mediaRef?: string | null;
  alt: string;
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  placeholderLabel?: string;
  placeholderHint?: string;
  className?: string;
  imageClassName?: string;
  /** Fill the parent instead of using an aspect ratio. */
  fill?: boolean;
  rounded?: boolean;
}) {
  const url = src ?? mediaUrl(mediaRef);
  return (
    <div
      className={cn("relative overflow-hidden bg-soft-cream", rounded && "rounded-[var(--radius-control)]", fill && "h-full w-full", className)}
      style={fill ? undefined : { aspectRatio: ratio }}
    >
      {url ? (
        <Image
          src={url}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-cover", imageClassName)}
        />
      ) : null}
      {url && aiTag && isAiRef(mediaRef) ? (
        <span className="pointer-events-none absolute right-2 bottom-2 rounded-full bg-card-surface/85 px-2 py-0.5 text-[10px] tracking-[0.12em] text-secondary-text uppercase">
          Illustration
        </span>
      ) : null}
      {url ? null : (
        <div
          role="img"
          aria-label={`${placeholderLabel} placeholder`}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 border border-soft-border bg-[repeating-linear-gradient(135deg,var(--color-soft-cream)_0_14px,#fbf3e6_14px_15px)] p-6 text-center"
        >
          <span className="text-meta text-muted-gold">{placeholderLabel}</span>
          {placeholderHint ? <span className="max-w-[28ch] text-[12px] leading-snug text-secondary-text">{placeholderHint}</span> : null}
        </div>
      )}
    </div>
  );
}
