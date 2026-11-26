import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  FALLBACK_EVENTS,
  FALLBACK_STORY_ENTRIES,
  FALLBACK_VENUE_ECO_VILLAGIO,
} from "@/config/invitation-content";

describe("Authoritative Invitation Content & Fallback System", () => {
  it("provides 4 approved story milestones with correct order and chapters", () => {
    expect(FALLBACK_STORY_ENTRIES).toHaveLength(4);
    expect(FALLBACK_STORY_ENTRIES.map((s) => s.chapter)).toEqual([
      "Our Beginning",
      "Shared Memories",
      "A Special Bond",
      "Our New Beginning",
    ]);
    expect(FALLBACK_STORY_ENTRIES.map((s) => s.title)).toEqual([
      "A Beautiful Beginning",
      "Moments That Became Memories",
      "A Celebration of Togetherness",
      "Forever Begins",
    ]);
    expect(FALLBACK_STORY_ENTRIES.every((s) => s.is_published)).toBe(true);

    // Verify sort orders are ascending and unique
    const orders = FALLBACK_STORY_ENTRIES.map((s) => s.sort_order);
    expect(orders).toEqual([10, 20, 30, 40]);
  });

  it("provides 6 approved wedding celebration events with correct order and slugs", () => {
    expect(FALLBACK_EVENTS).toHaveLength(6);
    expect(FALLBACK_EVENTS.map((e) => e.slug)).toEqual([
      "engagement",
      "mehndi",
      "haldi",
      "sangeet",
      "wedding-ceremony",
      "reception",
    ]);
    expect(FALLBACK_EVENTS.every((e) => e.is_published)).toBe(true);

    const orders = FALLBACK_EVENTS.map((e) => e.sort_order);
    expect(orders).toEqual([10, 20, 30, 40, 50, 60]);
  });

  it("has correct event dates, times and labels", () => {
    const engagement = FALLBACK_EVENTS.find((e) => e.slug === "engagement")!;
    expect(engagement.event_date).toBe("2026-12-04");
    expect(engagement.time_label).toBe("To be announced");

    const mehndi = FALLBACK_EVENTS.find((e) => e.slug === "mehndi")!;
    expect(mehndi.event_date).toBe("2026-12-11");
    expect(mehndi.time_label).toBe("7:00 PM onwards");
    expect(mehndi.event_type).toBe("mehendi");

    const haldi = FALLBACK_EVENTS.find((e) => e.slug === "haldi")!;
    expect(haldi.event_date).toBe("2026-12-12");
    expect(haldi.time_label).toBe("Morning");

    const sangeet = FALLBACK_EVENTS.find((e) => e.slug === "sangeet")!;
    expect(sangeet.event_date).toBe("2026-12-12");
    expect(sangeet.time_label).toBe("Evening");

    const wedding = FALLBACK_EVENTS.find((e) => e.slug === "wedding-ceremony")!;
    expect(wedding.event_date).toBe("2026-12-13");
    expect(wedding.start_time).toBe("08:08:00");
    expect(wedding.time_label).toContain("08:08 AM");
    expect(wedding.venue?.name).toBe("Eco Villagio Resorts");

    const reception = FALLBACK_EVENTS.find((e) => e.slug === "reception")!;
    expect(reception.event_date).toBeNull();
    expect(reception.time_label).toBe("To be confirmed");
    expect(reception.venue).toBeNull();
  });

  it("verifies all referenced photographs exist as real files in public/", () => {
    const storyImages = FALLBACK_STORY_ENTRIES.map((s) => s.image_path).filter(Boolean);
    const eventImages = FALLBACK_EVENTS.map((e) => e.image_path).filter(Boolean);

    for (const imgPath of [...storyImages, ...eventImages]) {
      const fullPath = path.join(process.cwd(), "public", imgPath as string);
      expect(fs.existsSync(fullPath), `Image ${imgPath} must exist`).toBe(true);
    }
  });

  it("handles optional venues gracefully without crashing", () => {
    const eventsWithoutVenue = FALLBACK_EVENTS.filter((e) => !e.venue);
    expect(eventsWithoutVenue.length).toBeGreaterThan(0);

    const wedding = FALLBACK_EVENTS.find((e) => e.slug === "wedding-ceremony")!;
    expect(wedding.venue).toEqual(FALLBACK_VENUE_ECO_VILLAGIO);
    expect(wedding.venue?.city).toBe("Hyderabad");
  });

  it("ensures no duplicate IDs or slugs exist in fallback content", () => {
    const storyIds = FALLBACK_STORY_ENTRIES.map((s) => s.id);
    expect(new Set(storyIds).size).toBe(storyIds.length);

    const eventSlugs = FALLBACK_EVENTS.map((e) => e.slug);
    expect(new Set(eventSlugs).size).toBe(eventSlugs.length);

    const eventIds = FALLBACK_EVENTS.map((e) => e.id);
    expect(new Set(eventIds).size).toBe(eventIds.length);
  });

  it("verifies all 5 Gemini photorealistic event photographs exist in public/images/events/realistic", () => {
    const realisticDir = path.join(process.cwd(), "public/images/events/realistic");
    const requiredFiles = ["mehndi.webp", "haldi.webp", "sangeet.webp", "wedding.webp", "reception.webp", "manifest.json"];

    for (const f of requiredFiles) {
      expect(fs.existsSync(path.join(realisticDir, f)), `File ${f} must exist`).toBe(true);
    }

    const manifest = JSON.parse(fs.readFileSync(path.join(realisticDir, "manifest.json"), "utf8"));
    expect(manifest.is_photorealistic).toBe(true);
    expect(manifest.is_illustration).toBe(false);
    expect(manifest.events).toHaveLength(5);
    expect(manifest.events.map((i: { eventSlug: string }) => i.eventSlug)).toEqual([
      "mehndi",
      "haldi",
      "sangeet",
      "wedding-ceremony",
      "reception",
    ]);
  });

  it("filters out engagement ceremony for the invitation route while keeping 5 events", () => {
    const invitationEvents = FALLBACK_EVENTS
      .filter((e) => e.slug !== "engagement")
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    expect(invitationEvents).toHaveLength(5);
    expect(invitationEvents.map((e) => e.slug)).toEqual([
      "mehndi",
      "haldi",
      "sangeet",
      "wedding-ceremony",
      "reception",
    ]);
  });
});
