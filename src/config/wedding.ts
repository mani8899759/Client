import { AUTHORITATIVE_WEDDING_CONFIG } from "@/lib/wedding-config";

/**
 * Owner-supplied wedding identity.
 *
 * Sourced from the central AUTHORITATIVE_WEDDING_CONFIG and database (`wedding_settings`).
 */
export const WEDDING_IDENTITY = {
  brideName: AUTHORITATIVE_WEDDING_CONFIG.bride,
  groomName: AUTHORITATIVE_WEDDING_CONFIG.groom,
  websiteTitle: `${AUTHORITATIVE_WEDDING_CONFIG.bride} & ${AUTHORITATIVE_WEDDING_CONFIG.groom}`,
  websiteSubtitle: "Wedding Celebration",
  weddingDateIso: AUTHORITATIVE_WEDDING_CONFIG.weddingDateIso,
  weddingDateDisplay: AUTHORITATIVE_WEDDING_CONFIG.weddingDateDisplay,
  weddingDay: AUTHORITATIVE_WEDDING_CONFIG.weddingDay,
  timezone: AUTHORITATIVE_WEDDING_CONFIG.timezone,
} as const;
