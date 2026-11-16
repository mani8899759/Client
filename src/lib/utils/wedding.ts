import { safeTimeZone, utcIsoToZonedLocal, zonedLocalToUtcIso } from "./datetime";
import type { WeddingSettings } from "@/types/database";

export type WeddingSchedule = {
  targetIso: string;
  dayStartIso: string;
  dayEndIso: string;
  timeConfirmed: boolean;
  endIso: string | null;
  /** "December 13, 2026" or "December 13, 2026 · 7:00 pm IST". */
  dateLabel: string;
  /** "December 13, 2026". */
  dateOnlyLabel: string;
  timezone: string;
};

function nextDay(ymd: string): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Every wedding date/time shown on the site derives from the central
 * `wedding_settings` row through this function (timezone-correct, server-side).
 */
export function weddingSchedule(
  w: Pick<WeddingSettings, "wedding_date" | "wedding_end_at" | "timezone" | "wedding_time_confirmed">,
): WeddingSchedule | null {
  if (!w.wedding_date) return null;
  const tz = safeTimeZone(w.timezone);
  const local = utcIsoToZonedLocal(w.wedding_date, tz); // YYYY-MM-DDTHH:mm in the wedding timezone
  if (!local) return null;
  const ymd = local.slice(0, 10);
  const dayStartIso = zonedLocalToUtcIso(`${ymd}T00:00`, tz)!;
  const dayEndIso = zonedLocalToUtcIso(`${nextDay(ymd)}T00:00`, tz)!;
  const instant = new Date(w.wedding_date);

  const dateOnlyLabel = new Intl.DateTimeFormat("en-US", { timeZone: tz, month: "long", day: "numeric", year: "numeric" }).format(instant);
  let dateLabel = dateOnlyLabel;
  if (w.wedding_time_confirmed) {
    const time = new Intl.DateTimeFormat("en-IN", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true, timeZoneName: "short" })
      .format(instant)
      .replace(/\b(AM|PM)\b/, (m) => m.toLowerCase())
      .replace("GMT+5:30", "IST");
    dateLabel = `${dateOnlyLabel} · ${time}`;
  }

  return {
    targetIso: w.wedding_time_confirmed ? instant.toISOString() : dayStartIso,
    dayStartIso,
    dayEndIso,
    timeConfirmed: w.wedding_time_confirmed,
    endIso: w.wedding_end_at,
    dateLabel,
    dateOnlyLabel,
    timezone: tz,
  };
}
