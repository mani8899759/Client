import { describe, expect, it } from "vitest";
import { normalizeEmail, normalizeIndianMobile, registrationSchema, formatMobile } from "@/lib/validation/participant";
import { formatTimeOnly, utcIsoToZonedLocal, zonedLocalToUtcIso, formatDateOnly } from "@/lib/utils/datetime";
import { getYouTubeId } from "@/lib/utils/youtube";
import { csvCell, toCsv } from "@/lib/utils/csv";
import { slugify } from "@/lib/utils/slug";
import { isValidMediaRef, validateMediaFile } from "@/lib/storage/media";

describe("mobile normalisation", () => {
  it.each([
    ["9876543210", "+919876543210"],
    ["09876543210", "+919876543210"],
    ["919876543210", "+919876543210"],
    ["+91 98765 43210", "+919876543210"],
    ["(+91) 98765-43210", "+919876543210"],
    ["  6123456789 ", "+916123456789"],
  ])("%s → %s", (input, out) => expect(normalizeIndianMobile(input)).toBe(out));

  it.each(["", "12345", "5123456789", "98765432101", "98765abc10", "+1 415 555 0100", "919876"])("rejects %s", (input) => {
    expect(normalizeIndianMobile(input)).toBeNull();
  });

  it("formats for display", () => expect(formatMobile("+919876543210")).toBe("+91 98765 43210"));
});

describe("registration schema", () => {
  const valid = {
    fullName: "  Priya   Sharma ",
    mobile: "98765 43210",
    email: "Priya@Example.com ",
    gender: "female",
    address: "12 MG Road, Bengaluru",
    side: "bride",
    consent: true,
    requestId: "3f9a1c2e-5b6d-4e7f-8a9b-0c1d2e3f4a5b",
  };

  it("accepts and normalises a valid registration", () => {
    const r = registrationSchema.parse(valid);
    expect(r.fullName).toBe("Priya Sharma");
    expect(normalizeEmail(r.email)).toBe("priya@example.com");
  });

  it.each([
    ["fullName", ""],
    ["mobile", "12345"],
    ["email", "not-an-email"],
    ["address", ""],
    ["gender", "other"],
    ["side", ""],
    ["consent", false],
  ])("rejects invalid %s", (field, value) => {
    const r = registrationSchema.safeParse({ ...valid, [field]: value });
    expect(r.success).toBe(false);
  });

  it("rejects a filled honeypot", () => {
    expect(registrationSchema.safeParse({ ...valid, website: "spam" }).success).toBe(false);
  });
});

describe("datetime", () => {
  it("round-trips a wall-clock time in Asia/Kolkata", () => {
    const iso = zonedLocalToUtcIso("2026-12-12T18:30", "Asia/Kolkata");
    expect(iso).toBe("2026-12-12T13:00:00.000Z");
    expect(utcIsoToZonedLocal(iso, "Asia/Kolkata")).toBe("2026-12-12T18:30");
  });
  it("handles DST zones", () => {
    const iso = zonedLocalToUtcIso("2026-07-04T12:00", "America/New_York");
    expect(iso).toBe("2026-07-04T16:00:00.000Z");
  });
  it("formats date-only and time-only values without drift", () => {
    expect(formatDateOnly("2026-12-12", "short")).toMatch(/12 Dec 2026/);
    expect(formatTimeOnly("18:30:00")).toBe("6:30 pm");
  });
});

describe("youtube", () => {
  it.each([
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ?t=3", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/live/dQw4w9WgXcQ?si=x", "dQw4w9WgXcQ"],
    ["https://youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ])("%s", (url, id) => expect(getYouTubeId(url)).toBe(id));
  it.each(["http://youtu.be/dQw4w9WgXcQ", "https://evil.com/watch?v=dQw4w9WgXcQ", "javascript:alert(1)", "https://youtu.be/short"])(
    "rejects %s",
    (url) => expect(getYouTubeId(url)).toBeNull(),
  );
});

describe("csv export safety", () => {
  it("neutralises spreadsheet formulas", () => {
    expect(csvCell("=HYPERLINK(\"x\")")).toBe(`"'=HYPERLINK(""x"")"`);
    expect(csvCell("+91 98765")).toBe("'+91 98765");
    expect(csvCell("@sum")).toBe("'@sum");
  });
  it("quotes commas and newlines", () => {
    expect(toCsv([["a,b", "line\nbreak", null]])).toBe(`"a,b","line\nbreak",`);
  });
});

describe("media and slugs", () => {
  it("validates stored media references", () => {
    expect(isValidMediaRef("wedding-images/gallery/2026/3f9a1c2e-5b6d-4e7f-8a9b-0c1d2e3f4a5b.jpg")).toBe(true);
    expect(isValidMediaRef("wedding-images/../secret.jpg")).toBe(false);
    expect(isValidMediaRef("other-bucket/gallery/2026/3f9a1c2e-5b6d-4e7f-8a9b-0c1d2e3f4a5b.jpg")).toBe(false);
  });
  it("validates file type and size", () => {
    expect(validateMediaFile({ type: "image/jpeg", size: 1000 }, "image")).toBeNull();
    expect(validateMediaFile({ type: "image/gif", size: 1000 }, "image")).not.toBeNull();
    expect(validateMediaFile({ type: "image/png", size: 16 * 1024 * 1024 }, "image")).not.toBeNull();
    expect(validateMediaFile({ type: "video/mp4", size: 1000 }, "video")).toBeNull();
  });
  it("slugifies event names", () => expect(slugify("Haldi & Mehendi — Day 1")).toBe("haldi-mehendi-day-1"));
});
