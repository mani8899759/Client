import { AUTHORITATIVE_WEDDING_CONFIG } from "@/lib/wedding-config";

/**
 * Owner-supplied wedding identity.
 *
 * Sourced from the central AUTHORITATIVE_WEDDING_CONFIG and database (`wedding_settings`).
 */
export const WEDDING_IDENTITY = {
  brideName: AUTHORITATIVE_WEDDING_CONFIG.bride,
  groomName: AUTHORITATIVE_WEDDING_CONFIG.groom,
  formalBrideName: AUTHORITATIVE_WEDDING_CONFIG.formalBride,
  formalGroomName: AUTHORITATIVE_WEDDING_CONFIG.formalGroom,
  websiteTitle: `${AUTHORITATIVE_WEDDING_CONFIG.groom} & ${AUTHORITATIVE_WEDDING_CONFIG.bride}`,
  websiteSubtitle: "Wedding Celebration",
  weddingDateIso: AUTHORITATIVE_WEDDING_CONFIG.weddingDateIso,
  weddingDateDisplay: AUTHORITATIVE_WEDDING_CONFIG.weddingDateDisplay,
  weddingDay: AUTHORITATIVE_WEDDING_CONFIG.weddingDay,
  timezone: AUTHORITATIVE_WEDDING_CONFIG.timezone,
} as const;
