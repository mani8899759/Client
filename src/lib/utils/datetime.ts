/**
 * Timezone-aware formatting. Event dates/times are wall-clock values in the
 * wedding's configured timezone; timestamps (wedding date, stream schedule)
 * are stored in UTC and displayed in that timezone.
 */
export const DEFAULT_TIMEZONE = "Asia/Kolkata";

export function safeTimeZone(tz: string | null | undefined): string {
  if (!tz) return DEFAULT_TIMEZONE;
  try {
    new Intl.DateTimeFormat("en-IN", { timeZone: tz });
    return tz;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

/** Format a date-only value (YYYY-MM-DD) without timezone drift. */
export function formatDateOnly(value: string | null | undefined, style: "long" | "short" = "long"): string | null {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "UTC",
    weekday: style === "long" ? "long" : undefined,
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
  }).format(d);
}

/** Parts of a date-only value for editorial date blocks. */
export function dateOnlyParts(value: string | null | undefined): { day: string; month: string; year: string; weekday: string } | null {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", ...o }).format(d);
  return { day: f({ day: "2-digit" }), month: f({ month: "long" }), year: f({ year: "numeric" }), weekday: f({ weekday: "long" }) };
}

/** Format a time-only value (HH:MM[:SS]) as "6:30 pm". */
export function formatTimeOnly(value: string | null | undefined): string | null {
  if (!value) return null;
  const m = /^(\d{2}):(\d{2})/.exec(value);
  if (!m) return null;
  const d = new Date(Date.UTC(2000, 0, 1, Number(m[1]), Number(m[2])));
  return new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", hour: "numeric", minute: "2-digit", hour12: true })
    .format(d)
    .toLowerCase();
}

export function formatTimeRange(start: string | null, end: string | null): string | null {
  const s = formatTimeOnly(start);
  const e = formatTimeOnly(end);
  if (s && e) return `${s} – ${e}`;
  return s ?? null;
}

export function formatInZone(
  iso: string | null | undefined,
  tz: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" },
): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-IN", { timeZone: safeTimeZone(tz), ...options }).format(d);
}

export function formatDateTimeInZone(iso: string | null | undefined, tz: string): string | null {
  return formatInZone(iso, tz, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Offset (ms) between the zone's wall clock and UTC at a given instant. */
function zoneOffsetMs(instant: number, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(instant));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - Math.floor(instant / 1000) * 1000;
}

/** Convert a `datetime-local` value (YYYY-MM-DDTHH:mm) in `tz` to a UTC ISO string. */
export function zonedLocalToUtcIso(local: string, tz: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (!m) return null;
  const zone = safeTimeZone(tz);
  const guess = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]));
  let result = guess - zoneOffsetMs(guess, zone);
  result = guess - zoneOffsetMs(result, zone);
  return new Date(result).toISOString();
}

/** Convert a UTC ISO timestamp to a `datetime-local` value in `tz`. */
export function utcIsoToZonedLocal(iso: string | null | undefined, tz: string): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const local = new Date(t + zoneOffsetMs(t, safeTimeZone(tz)));
  return local.toISOString().slice(0, 16);
}
