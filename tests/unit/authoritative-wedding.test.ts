import { describe, expect, it } from "vitest";
import { AUTHORITATIVE_WEDDING_CONFIG, getAuthoritativeTargetTimestamp } from "@/lib/wedding-config";
import { weddingSchedule } from "@/lib/utils/wedding";
import { DEFAULT_WEDDING } from "@/services/content/defaults";
import { remainingUntil } from "@/components/countdown/countdown-math";
import { dateOnlyParts, formatDateOnly, formatDateTimeInZone } from "@/lib/utils/datetime";

describe("Authoritative Wedding Date Configuration & Countdown", () => {
  it("has the authoritative configuration values", () => {
    expect(AUTHORITATIVE_WEDDING_CONFIG.bride).toBe("Priya");
    expect(AUTHORITATIVE_WEDDING_CONFIG.groom).toBe("Arjun");
    expect(AUTHORITATIVE_WEDDING_CONFIG.weddingDate).toBe("2026-12-13");
    expect(AUTHORITATIVE_WEDDING_CONFIG.weddingDateDisplay).toBe("December 13, 2026");
    expect(AUTHORITATIVE_WEDDING_CONFIG.weddingDay).toBe("Sunday");
    expect(AUTHORITATIVE_WEDDING_CONFIG.timezone).toBe("Asia/Kolkata");
    expect(AUTHORITATIVE_WEDDING_CONFIG.timezoneOffset).toBe("UTC+05:30");
    expect(AUTHORITATIVE_WEDDING_CONFIG.ceremonyPeriod).toBe("Morning");
  });

  it("calculates midnight December 13, 2026 in Asia/Kolkata without time drift", () => {
    // 2026-12-13T00:00:00+05:30 is 2026-12-12T18:30:00.000Z in UTC
    const targetIso = AUTHORITATIVE_WEDDING_CONFIG.weddingDateIso;
    expect(targetIso).toBe("2026-12-12T18:30:00.000Z");

    const targetTs = AUTHORITATIVE_WEDDING_CONFIG.targetTimestamp;
    expect(targetTs).toBe(new Date("2026-12-13T00:00:00+05:30").getTime());
    expect(targetTs).toBe(new Date("2026-12-12T18:30:00.000Z").getTime());
  });

  it("produces correct schedule and date labels from DEFAULT_WEDDING", () => {
    const schedule = weddingSchedule(DEFAULT_WEDDING);
    expect(schedule).not.toBeNull();
    expect(schedule?.dateOnlyLabel).toBe("December 13, 2026");
    expect(schedule?.targetIso).toBe("2026-12-12T18:30:00.000Z");
    expect(schedule?.timezone).toBe("Asia/Kolkata");
  });

  it("calculates countdown units accurately for a mocked current timestamp", () => {
    const target = AUTHORITATIVE_WEDDING_CONFIG.targetTimestamp;
    // Exactly 10 days, 5 hours, 30 minutes, 15 seconds before midnight Dec 13, 2026
    const offsetMs = (10 * 86400 + 5 * 3600 + 30 * 60 + 15) * 1000;
    const mockedNow = target - offsetMs;

    const remaining = remainingUntil(target, mockedNow);
    expect(remaining).toEqual({
      days: 10,
      hours: 5,
      minutes: 30,
      seconds: 15,
    });
  });

  it("never returns negative numbers when the date has arrived", () => {
    const target = AUTHORITATIVE_WEDDING_CONFIG.targetTimestamp;
    const afterTarget = target + 5000;
    const remaining = remainingUntil(target, afterTarget);
    expect(remaining).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  it("formats dates and timezones consistently across helper utilities", () => {
    expect(formatDateOnly("2026-12-13", "long")).toBe("Sunday, 13 December 2026");
    const parts = dateOnlyParts("2026-12-13");
    expect(parts?.weekday).toBe("Sunday");
    expect(parts?.day).toBe("13");
    expect(parts?.month).toBe("December");
    expect(parts?.year).toBe("2026");
  });

  it("preserves other ceremony event dates", () => {
    expect(dateOnlyParts("2026-12-04")?.day).toBe("04");
    expect(dateOnlyParts("2026-12-11")?.day).toBe("11");
    expect(dateOnlyParts("2026-12-12")?.day).toBe("12");
    expect(dateOnlyParts("2026-12-13")?.day).toBe("13");
  });
});
