import { describe, expect, it } from "vitest";
import { buildSchedule, msUntilNextSecond, phaseAt, remainingUntil } from "@/components/countdown/countdown-math";
import { weddingSchedule } from "@/lib/utils/wedding";
import { DEFAULT_WEDDING } from "@/services/content/defaults";

const S = 1000;
const H = 3600 * S;

describe("countdown maths", () => {
  it("splits remaining time into days, hours, minutes and seconds", () => {
    const t = Date.UTC(2026, 10, 30, 18, 30);
    const now = t - ((3 * 86400 + 5 * 3600 + 7 * 60 + 9) * S + 400);
    expect(remainingUntil(t, now)).toEqual({ days: 3, hours: 5, minutes: 7, seconds: 9 });
  });

  it("never goes negative", () => {
    const t = Date.UTC(2026, 10, 30, 18, 30);
    expect(remainingUntil(t, t + 10 * S)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });

  it("aligns ticks to whole seconds", () => {
    const t = 1_000_000_000;
    expect(msUntilNextSecond(t, t - 2_300)).toBe(315);
    expect(msUntilNextSecond(t, t - 2_000)).toBe(1_015);
  });
});

describe("wedding schedule — Manikanta & Sravika, 13 December 2026, Asia/Kolkata", () => {
  const dateOnly = weddingSchedule({ ...DEFAULT_WEDDING, wedding_date: "2026-12-12T18:30:00.000Z", wedding_time_confirmed: false })!;
  const confirmedMuhurtham = weddingSchedule(DEFAULT_WEDDING)!;

  it("targets the start of 13 December in India when no ceremony time is set", () => {
    expect(dateOnly.targetIso).toBe("2026-12-12T18:30:00.000Z");
    expect(dateOnly.dayStartIso).toBe("2026-12-12T18:30:00.000Z");
    expect(dateOnly.dayEndIso).toBe("2026-12-13T18:30:00.000Z");
    expect(dateOnly.dateLabel).toBe("December 13, 2026");
  });

  it("targets 08:08 AM Muhurtham with confirmed ceremony time", () => {
    expect(confirmedMuhurtham.targetIso).toBe("2026-12-13T02:38:00.000Z");
    expect(confirmedMuhurtham.dateLabel).toBe("December 13, 2026 · 8:08 am IST");
    expect(confirmedMuhurtham.dateOnlyLabel).toBe("December 13, 2026");
    expect(confirmedMuhurtham.timeConfirmed).toBe(true);
  });

  it("moves through counting → today → completed for a date-only wedding", () => {
    const s = buildSchedule({ ...dateOnly, timeConfirmed: false })!;
    expect(phaseAt(Date.parse("2026-12-12T18:29:59Z"), s)).toBe("counting");
    expect(phaseAt(Date.parse("2026-12-12T18:30:00Z"), s)).toBe("today"); // midnight IST
    expect(phaseAt(Date.parse("2026-12-13T18:29:59Z"), s)).toBe("today"); // 23:59:59 IST
    expect(phaseAt(Date.parse("2026-12-13T18:30:00Z"), s)).toBe("completed");
  });

  it("uses a confirmed ceremony time: today before it, started after it", () => {
    const s = buildSchedule(confirmedMuhurtham)!;
    expect(phaseAt(Date.parse("2026-12-12T18:00:00Z"), s)).toBe("counting");
    expect(phaseAt(Date.parse("2026-12-13T00:00:00Z"), s)).toBe("today");
    expect(phaseAt(Date.parse("2026-12-13T02:38:00Z"), s)).toBe("started");
    expect(phaseAt(s.end, s)).toBe("completed");
  });

  it("is the same instant for visitors in any timezone", () => {
    const s = buildSchedule(dateOnly)!;
    const now = Date.parse("2026-11-13T00:00:00Z");
    expect(remainingUntil(s.target, now)).toEqual({ days: 29, hours: 18, minutes: 30, seconds: 0 });
  });
});
