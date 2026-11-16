import { getWeddingSettings as fetchWeddingSettings } from "@/services/content";
import { AUTHORITATIVE_WEDDING_CONFIG } from "@/lib/wedding-config";
import { weddingSchedule, type WeddingSchedule } from "@/lib/utils/wedding";
import type { WeddingSettings } from "@/types/database";

/**
 * Reusable wedding settings service.
 * Guarantees that whether fetched from Supabase or fallback,
 * the wedding date and countdown targets consistently align with the authoritative date.
 */
export async function getAuthoritativeWeddingSettings(): Promise<{
  wedding: WeddingSettings;
  schedule: WeddingSchedule;
}> {
  try {
    const wedding = await fetchWeddingSettings();
    const schedule = weddingSchedule(wedding);
    if (!schedule) {
      throw new Error("Unable to build wedding schedule from settings");
    }
    return { wedding, schedule };
  } catch (error) {
    console.error("[wedding-settings] Failed to load wedding settings, using authoritative fallback:", error);
    const { DEFAULT_WEDDING } = await import("@/services/content/defaults");
    const fallbackSchedule = weddingSchedule(DEFAULT_WEDDING)!;
    return {
      wedding: DEFAULT_WEDDING,
      schedule: fallbackSchedule,
    };
  }
}
