import { PLACEHOLDER } from "@/config/site";
import type { WeddingSettings } from "@/types/database";

export function coupleNames(s: Pick<WeddingSettings, "bride_name" | "groom_name"> | null) {
  const bride = s?.bride_name?.trim() || null;
  const groom = s?.groom_name?.trim() || null;
  return {
    bride: bride ?? PLACEHOLDER.bride,
    groom: groom ?? PLACEHOLDER.groom,
    isPlaceholder: !bride || !groom,
    joined: `${groom ?? PLACEHOLDER.groom} & ${bride ?? PLACEHOLDER.bride}`,
  };
}

export function monogramOf(s: Pick<WeddingSettings, "bride_name" | "groom_name" | "monogram"> | null): string {
  if (s?.monogram?.trim()) return s.monogram.trim();
  const b = s?.bride_name?.trim()?.[0];
  const g = s?.groom_name?.trim()?.[0];
  return g && b ? `${g.toUpperCase()} & ${b.toUpperCase()}` : "M & S";
}
