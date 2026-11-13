/**
 * Owner-supplied wedding identity.
 *
 * The database (`wedding_settings`, seeded by migration 0007) is the source
 * of truth and admins edit it in Admin › Website Content. These values mirror
 * that seed and are used only as a fallback when the database cannot be
 * reached, so the site never shows generic placeholder names.
 */
export const WEDDING_IDENTITY = {
  brideName: "Priya",
  groomName: "Arjun",
  websiteTitle: "Priya & Arjun",
  websiteSubtitle: "Wedding Celebration",
  /** Midnight, 1 December 2026, Asia/Kolkata (date-only until a ceremony time is confirmed). */
  weddingDateIso: "2026-11-30T18:30:00.000Z",
  timezone: "Asia/Kolkata",
} as const;
