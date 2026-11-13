"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ImageFrame } from "./ImageFrame";

/**
 * Hero photograph or muted looping video. Video never plays sound and is
 * paused for visitors who prefer reduced motion (the poster frame remains).
 */
export function HeroMedia({
  imageRef,
  imageUrl,
  videoUrl,
  alt,
}: {
  imageRef: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  alt: string;
}) {
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (reduce) videoRef.current?.pause();
  }, [reduce]);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, clipPath: "inset(8% 4% 0% 4%)" }}
      animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
      transition={{ duration: 1.4, delay: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
      className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-control)] xs:aspect-[5/6] sm:aspect-[16/10] lg:aspect-[21/9]"
    >
      {videoUrl ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={videoUrl}
          poster={imageUrl ?? undefined}
          autoPlay={!reduce}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={alt}
        />
      ) : (
        <ImageFrame
          mediaRef={imageRef}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1440px) 1360px, 100vw"
          imageClassName="object-cover object-[center_30%]"
          placeholderLabel="Hero photograph"
          placeholderHint="Upload the couple's main photograph in Admin › Content"
        />
      )}
    </motion.div>
  );
}
