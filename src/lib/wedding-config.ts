/**
 * Single Authoritative Wedding Configuration
 *
 * Central source of truth for Manikanta & Sravika's Wedding Date & Identity.
 * All public pages, digital invitation, admin forms, and countdowns derive from this.
 */

export const AUTHORITATIVE_WEDDING_CONFIG = {
  bride: "Sravika",
  groom: "Manikanta",
  formalBride: "Chy. La. Sow. Lakshmi Sravika",
  formalGroom: "Chy. Neela Manikanta",
  weddingDate: "2026-12-13",
  weddingDateDisplay: "December 13, 2026",
  weddingDay: "Sunday",
  timezone: "Asia/Kolkata",
  timezoneOffset: "UTC+05:30",
  ceremonyPeriod: "Morning",
  exactCeremonyTime: "08:08 AM",
  /**
   * Deterministic UTC ISO string representing midnight December 13, 2026 in Asia/Kolkata (UTC+05:30):
   * 2026-12-13T00:00:00+05:30 == 2026-12-12T18:30:00.000Z
   */
  weddingDateIso: "2026-12-12T18:30:00.000Z",
  /** Epoch milliseconds for countdown calculation */
  targetTimestamp: new Date("2026-12-13T00:00:00+05:30").getTime(),
} as const;

export function getAuthoritativeTargetTimestamp(
  weddingDateIso?: string | null,
  timezone: string = AUTHORITATIVE_WEDDING_CONFIG.timezone,
  timeConfirmed: boolean = false
): number {
  if (!weddingDateIso) {
    return AUTHORITATIVE_WEDDING_CONFIG.targetTimestamp;
  }
  const parsed = new Date(weddingDateIso).getTime();
  return Number.isNaN(parsed) ? AUTHORITATIVE_WEDDING_CONFIG.targetTimestamp : parsed;
}
