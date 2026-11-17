/**
 * Single Authoritative Wedding Configuration
 *
 * Central source of truth for Manikanta & Sravika's Wedding Date & Countdown.
 * Sourced directly from Gudla's Wedding Invitation PDF.
 * All public pages, digital invitation, admin forms, and countdowns derive from this.
 */

export const AUTHORITATIVE_WEDDING_CONFIG = {
  bride: "Sravika",
  groom: "Manikanta",
  brideFormal: "Chy. La. Sow. Lakshmi Sravika",
  groomFormal: "Chy. Neela Manikanta",
  brideParents: "Smt. Padakanti Saroja, W/o. (Late) Bhrahma Chari of Aminpur, Hyderabad",
  groomParents: "Sri Gudla Venu Venkata Parameswara Reddy & Smt. Nagendra Lakshmi",
  groomAddress: "D.No. 53-24-15, Chatla vari Veedhi, Near Fish Market, Maddilapalem, Visakhapatnam-530013",
  groomPhones: ["9848657487", "9550475579"],
  invitationTitle: "Gudla's Wedding Invitation",
  weddingDate: "2026-12-13",
  weddingDateDisplay: "December 13, 2026",
  weddingDay: "Sunday",
  weddingTime: "08:08 AM",
  weddingTimeConfirmed: true,
  ceremonyPeriod: "Morning",
  exactCeremonyTime: "08:08 AM",
  timezone: "Asia/Kolkata",
  timezoneOffset: "UTC+05:30",
  /**
   * Deterministic UTC ISO string representing 08:08 AM December 13, 2026 in Asia/Kolkata (UTC+05:30):
   * 2026-12-13T08:08:00+05:30 == 2026-12-13T02:38:00.000Z
   */
  weddingDateIso: "2026-12-13T02:38:00.000Z",
  /** Epoch milliseconds for countdown calculation */
  targetTimestamp: new Date("2026-12-13T08:08:00+05:30").getTime(),
  weddingVenue: "Eco Villagio Resorts, Kandukuru",
  receptionDate: "2026-12-15",
  receptionDateDisplay: "December 15, 2026",
  receptionDay: "Tuesday",
  receptionTime: "12:00 Noon onwards",
  receptionVenue: "'P' Conventions, Visakhapatnam",
} as const;

export function getAuthoritativeTargetTimestamp(
  weddingDateIso?: string | null,
  timezone: string = AUTHORITATIVE_WEDDING_CONFIG.timezone,
  timeConfirmed: boolean = true
): number {
  if (!weddingDateIso) {
    return AUTHORITATIVE_WEDDING_CONFIG.targetTimestamp;
  }
  const parsed = new Date(weddingDateIso).getTime();
  return Number.isNaN(parsed) ? AUTHORITATIVE_WEDDING_CONFIG.targetTimestamp : parsed;
}
