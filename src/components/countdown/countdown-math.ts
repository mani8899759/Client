/**
 * Countdown phases
 *   counting  – before the wedding day (counting to the ceremony time, or to the
 *               start of the day when no ceremony time is configured)
 *   today     – it is the wedding day in the wedding timezone, ceremony not yet begun
 *               (date-only weddings stay in this phase for the whole day)
 *   started   – a confirmed ceremony time has passed: “The celebration has begun!”
 *   completed – the celebration window is over
 */
export type CountdownPhase = "counting" | "today" | "started" | "completed";

export type Remaining = { days: number; hours: number; minutes: number; seconds: number };

export type CountdownSchedule = {
  /** Instant the countdown targets (ceremony time, or start of the wedding day). */
  target: number;
  /** Start and end of the wedding day in the wedding timezone. */
  dayStart: number;
  dayEnd: number;
  /** Whether an exact ceremony time is configured. */
  timeConfirmed: boolean;
  /** End of the celebration (defaults to the end of the wedding day, or target + 12h if later). */
  end: number;
};

const SECOND = 1000;
const HOUR = 3600 * SECOND;

export function buildSchedule(input: {
  targetIso: string;
  dayStartIso: string;
  dayEndIso: string;
  timeConfirmed: boolean;
  endIso?: string | null;
}): CountdownSchedule | null {
  const target = Date.parse(input.targetIso);
  const dayStart = Date.parse(input.dayStartIso);
  const dayEnd = Date.parse(input.dayEndIso);
  if ([target, dayStart, dayEnd].some(Number.isNaN) || dayEnd <= dayStart) return null;
  const explicitEnd = input.endIso ? Date.parse(input.endIso) : Number.NaN;
  const end = !Number.isNaN(explicitEnd) && explicitEnd > target ? explicitEnd : Math.max(dayEnd, target + 12 * HOUR);
  return { target: input.timeConfirmed ? target : dayStart, dayStart, dayEnd, timeConfirmed: input.timeConfirmed, end };
}

export function phaseAt(now: number, s: CountdownSchedule): CountdownPhase {
  if (now >= s.end) return "completed";
  if (s.timeConfirmed && now >= s.target) return "started";
  if (now >= s.dayStart) return "today";
  return "counting";
}

/** Whole days, hours, minutes and seconds until `target`; never negative. */
export function remainingUntil(target: number, now: number): Remaining {
  const total = Math.max(0, Math.floor((target - now) / SECOND));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

/** Milliseconds until the displayed second next changes (keeps ticks aligned to real seconds). */
export function msUntilNextSecond(target: number, now: number): number {
  const rem = (target - now) % SECOND;
  return (rem > 0 ? rem : SECOND + rem) + 15;
}

export function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}
