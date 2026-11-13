import slotData from "./ai-slots.json";
import manifest from "./ai-assets.manifest.json";

/**
 * AI-generated illustrative imagery.
 *
 * These images depict a FICTIONAL couple. They are design placeholders, not
 * photographs of Priya and Arjun, and are always flagged as AI-generated in
 * the admin. Slot definitions and generation prompts live in ai-slots.json
 * (also read by scripts/import-ai-assets.mjs). Generate each slot, put the
 * files in a folder and run `npm run ai-assets:import -- <folder>`.
 * Any slot an admin fills with a real photograph takes precedence.
 */

export type AiSlotGroup = "homepage" | "story" | "events" | "gallery" | "location";

export type AiSlot = {
  slot: string;
  file: string;
  group: AiSlotGroup;
  ratio: string;
  usedFor: string;
  alt: string;
  prompt: string;
};

export const AI_STYLE: string = slotData.style;
export const AI_SLOTS = slotData.slots as AiSlot[];

type ManifestEntry = { slot: string; file: string; width: number; height: number };
const PRESENT = new Map((manifest.assets as ManifestEntry[]).map((a) => [a.slot, a]));

/** Reference for an AI asset if its file has been generated and imported, else null. */
export function aiRef(slot: string): string | null {
  const a = PRESENT.get(slot);
  return a ? `static/ai/${a.file}` : null;
}

export function aiAsset(slot: string): (AiSlot & { ref: string; width: number; height: number }) | null {
  const def = AI_SLOTS.find((s) => s.slot === slot);
  const a = PRESENT.get(slot);
  return def && a ? { ...def, ref: `static/ai/${a.file}`, width: a.width, height: a.height } : null;
}

export function presentAiAssets() {
  return AI_SLOTS.flatMap((s) => {
    const a = aiAsset(s.slot);
    return a ? [a] : [];
  });
}

/** Alt text for an AI asset reference, if it is one. */
export function aiAltFor(ref: string | null | undefined): string | null {
  if (!ref?.startsWith("static/ai/")) return null;
  const file = ref.slice("static/ai/".length);
  return AI_SLOTS.find((s) => s.file === file)?.alt ?? null;
}

export const EVENT_AI_SLOT: Record<string, string> = {
  engagement: "event-engagement",
  haldi: "event-haldi",
  mehendi: "event-mehendi",
  wedding: "event-wedding",
  reception: "event-reception",
};
