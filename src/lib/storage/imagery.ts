import { aiAltFor } from "@/config/ai-assets";

/** Authentic wedding shoot mapping for default slots when no manual upload exists */
const REAL_SHOOT_SLOTS: Record<string, { path: string; alt: string }> = {
  hero: { path: "/images/wedding-shoot/optimised/photo-13.webp", alt: "Manikanta & Sravika — Together in Love" },
  "couple-editorial-portrait": { path: "/images/wedding-shoot/optimised/photo-05.webp", alt: "Manikanta & Sravika — Couple Portrait" },
  "bride-detail": { path: "/images/sravika-bride.webp", alt: "Chy. La. Sow. Lakshmi Sravika — The Bride" },
  "groom-detail": { path: "/images/manikanta-groom.webp", alt: "Chy. Neela Manikanta — The Groom" },
  "couple-prewedding": { path: "/images/wedding-shoot/optimised/photo-03.webp", alt: "Manikanta & Sravika — Pre-Wedding Walk" },
  "wedding-details": { path: "/images/wedding-shoot/optimised/photo-08.webp", alt: "Manikanta & Sravika — Celebration Moments" },
  "story-first-meeting": { path: "/images/wedding-shoot/optimised/photo-01.webp", alt: "Manikanta & Sravika — How Our Journey Began" },
  "engagement-editorial": { path: "/images/wedding-shoot/optimised/photo-08.webp", alt: "Manikanta & Sravika — A Promise for Forever" },
  "story-portrait": { path: "/images/wedding-shoot/optimised/photo-11.webp", alt: "Manikanta & Sravika — Counting Down to Forever" },
  "event-engagement": { path: "/images/wedding-shoot/optimised/photo-02.webp", alt: "Engagement Ceremony" },
  "event-haldi": { path: "/images/wedding-shoot/optimised/photo-04.webp", alt: "Haldi Ceremony" },
  "event-mehendi": { path: "/images/wedding-shoot/optimised/photo-07.webp", alt: "Mehendi Ceremony" },
  "event-wedding": { path: "/images/wedding-shoot/optimised/photo-10.webp", alt: "Wedding Muhurtham" },
  "event-reception": { path: "/images/wedding-shoot/optimised/photo-12.webp", alt: "Wedding Reception" },
};

/**
 * Resolve the image for a slot: an uploaded photograph always wins; otherwise
 * the authentic wedding shoot photograph for that slot; otherwise fallback.
 */
export function pickImage(uploaded: string | null | undefined, slot: string): string | null {
  if (uploaded && !uploaded.startsWith("static/ai/")) return uploaded;
  const shoot = REAL_SHOOT_SLOTS[slot];
  if (shoot) return shoot.path;
  return uploaded || null;
}

export function pickAlt(ref: string | null | undefined, uploadedAlt: string | null | undefined, fallback: string): string {
  if (uploadedAlt) return uploadedAlt;
  for (const item of Object.values(REAL_SHOOT_SLOTS)) {
    if (item.path === ref) return item.alt;
  }
  return aiAltFor(ref) || fallback;
}
