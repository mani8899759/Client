import { AUTHORITATIVE_WEDDING_CONFIG } from "@/lib/wedding-config";

/**
 * Owner-supplied wedding identity.
 *
 * Sourced from the central AUTHORITATIVE_WEDDING_CONFIG and database (`wedding_settings`).
 */
export const WEDDING_IDENTITY = {
  brideName: AUTHORITATIVE_WEDDING_CONFIG.bride,
  groomName: AUTHORITATIVE_WEDDING_CONFIG.groom,
  brideFormal: AUTHORITATIVE_WEDDING_CONFIG.brideFormal,
  groomFormal: AUTHORITATIVE_WEDDING_CONFIG.groomFormal,
  websiteTitle: `${AUTHORITATIVE_WEDDING_CONFIG.groom} & ${AUTHORITATIVE_WEDDING_CONFIG.bride}`,
  websiteSubtitle: AUTHORITATIVE_WEDDING_CONFIG.invitationTitle,
  weddingDateIso: AUTHORITATIVE_WEDDING_CONFIG.weddingDateIso,
  weddingDateDisplay: AUTHORITATIVE_WEDDING_CONFIG.weddingDateDisplay,
  weddingDay: AUTHORITATIVE_WEDDING_CONFIG.weddingDay,
  weddingTime: AUTHORITATIVE_WEDDING_CONFIG.weddingTime,
  timezone: AUTHORITATIVE_WEDDING_CONFIG.timezone,
} as const;
