import { aiAltFor, aiRef } from "@/config/ai-assets";

/**
 * Resolve the image for a slot: an uploaded photograph always wins; otherwise
 * the AI illustration for that slot if it has been imported; otherwise null
 * (the frame shows a labelled placeholder).
 */
export function pickImage(uploaded: string | null | undefined, slot: string): string | null {
  return uploaded || aiRef(slot);
}

export function pickAlt(ref: string | null | undefined, uploadedAlt: string | null | undefined, fallback: string): string {
  return uploadedAlt || aiAltFor(ref) || fallback;
}
