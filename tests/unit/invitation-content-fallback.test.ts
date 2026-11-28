import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { DEFAULT_WEDDING } from "@/services/content/defaults";
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

  it("provides 6 wedding celebration events with Mehndi unpublished", () => {
    expect(FALLBACK_EVENTS).toHaveLength(6);
    expect(FALLBACK_EVENTS.map((e) => e.slug)).toEqual([
      "engagement",
      "mehndi",
      "haldi",
      "sangeet",
      "wedding-ceremony",
      "reception",
    ]);
    const publishedEvents = FALLBACK_EVENTS.filter((e) => e.is_published);
    expect(publishedEvents).toHaveLength(5);
    expect(publishedEvents.map((e) => e.slug)).toEqual([
      "engagement",
      "haldi",
      "sangeet",
      "wedding-ceremony",
      "reception",
    ]);

    const orders = FALLBACK_EVENTS.map((e) => e.sort_order);
    expect(orders).toEqual([10, 20, 30, 40, 50, 60]);
  });

  it("has correct event dates, times and labels", () => {
    const engagement = FALLBACK_EVENTS.find((e) => e.slug === "engagement")!;
    expect(engagement.event_date).toBe("2026-12-04");
    expect(engagement.time_label).toBe("To be announced");

    const mehndi = FALLBACK_EVENTS.find((e) => e.slug === "mehndi")!;
    expect(mehndi.event_date).toBe("2026-12-11");
    expect(mehndi.is_published).toBe(false);

    const haldi = FALLBACK_EVENTS.find((e) => e.slug === "haldi")!;
    expect(haldi.event_date).toBe("2026-12-12");
    expect(haldi.time_label).toBe("Around 10:00 AM");

    const sangeet = FALLBACK_EVENTS.find((e) => e.slug === "sangeet")!;
    expect(sangeet.event_date).toBe("2026-12-12");
    expect(sangeet.time_label).toBe("Around 6:00 PM");

    const wedding = FALLBACK_EVENTS.find((e) => e.slug === "wedding-ceremony")!;
    expect(wedding.event_date).toBe("2026-12-13");
    expect(wedding.start_time).toBe("08:08:00");
    expect(wedding.time_label).toBe("08:08 AM");
    expect(wedding.venue?.name).toBe("Eco Villagio Resorts, Hyderabad");

    const reception = FALLBACK_EVENTS.find((e) => e.slug === "reception")!;
    expect(reception.event_date).toBe("2026-12-15");
    expect(reception.time_label).toBe("12:00 PM onwards");
    expect(reception.venue?.name).toBe("'P' Conventions");
    expect(reception.venue?.city).toBe("Visakhapatnam");
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
    const wedding = FALLBACK_EVENTS.find((e) => e.slug === "wedding-ceremony")!;
    expect(wedding.venue).toEqual(FALLBACK_VENUE_ECO_VILLAGIO);
    expect(wedding.venue?.city).toBe("Kandukur");
    expect(wedding.venue?.state).toBe("Telangana");
  });

  it("ensures no duplicate IDs or slugs exist in fallback content", () => {
    const storyIds = FALLBACK_STORY_ENTRIES.map((s) => s.id);
    expect(new Set(storyIds).size).toBe(storyIds.length);

    const eventSlugs = FALLBACK_EVENTS.map((e) => e.slug);
    expect(new Set(eventSlugs).size).toBe(eventSlugs.length);

    const eventIds = FALLBACK_EVENTS.map((e) => e.id);
    expect(new Set(eventIds).size).toBe(eventIds.length);
  });

  it("verifies all photorealistic event photographs exist in public/images/events/realistic", () => {
    const realisticDir = path.join(process.cwd(), "public/images/events/realistic");
    const requiredFiles = ["haldi.webp", "sangeet.webp", "wedding.webp", "reception.webp", "manifest.json"];

    for (const f of requiredFiles) {
      expect(fs.existsSync(path.join(realisticDir, f)), `File ${f} must exist`).toBe(true);
    }

    const manifest = JSON.parse(fs.readFileSync(path.join(realisticDir, "manifest.json"), "utf8"));
    expect(manifest.is_photorealistic).toBe(true);
    expect(manifest.is_illustration).toBe(false);
    expect(manifest.events).toHaveLength(4);
    expect(manifest.events.map((i: { eventSlug: string }) => i.eventSlug)).toEqual([
      "haldi",
      "sangeet",
      "wedding-ceremony",
      "reception",
    ]);
  });

  it("filters out engagement ceremony and unpublished mehndi for the invitation route", () => {
    const invitationEvents = FALLBACK_EVENTS
      .filter((e) => e.slug !== "engagement" && e.is_published)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    expect(invitationEvents).toHaveLength(4);
    expect(invitationEvents.map((e) => e.slug)).toEqual([
      "haldi",
      "sangeet",
      "wedding-ceremony",
      "reception",
    ]);
  });

  it("filters out engagement ceremony and mehndi for homepage preview while displaying all 4 celebrations", () => {
    const homepageEvents = FALLBACK_EVENTS
      .filter((e) => e.slug !== "engagement" && e.is_published && !e.slug.includes("mehndi"))
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    expect(homepageEvents).toHaveLength(4);
    expect(homepageEvents.map((e) => e.slug)).toEqual([
      "haldi",
      "sangeet",
      "wedding-ceremony",
      "reception",
    ]);
  });

  it("verifies the authentic Eco Villagio Resorts venue photograph exists in public/images/venues/", () => {
    const venueWebp = path.join(process.cwd(), "public/images/venues/eco-villagio-resorts.webp");
    expect(fs.existsSync(venueWebp), "Eco Villagio Resorts webp photograph must exist").toBe(true);
    expect(DEFAULT_WEDDING.secondary_image_path).toBe("/images/venues/eco-villagio-resorts.webp");
    expect(DEFAULT_WEDDING.secondary_image_alt).toBe("Eco Villagio Resorts wedding venue");
  });

  it("configures official wedding hashtag #Kanmani with copy defaults", () => {
    expect(DEFAULT_WEDDING.hashtag).toBe("#Kanmani");
    expect(DEFAULT_WEDDING.hashtag_title).toBe("Celebrate With Us");
    expect(DEFAULT_WEDDING.hashtag_message).toBe(
      "Share your favourite moments from our celebrations with our wedding hashtag."
    );
    expect(DEFAULT_WEDDING.hashtag_homepage_visible).toBe(true);
    expect(DEFAULT_WEDDING.hashtag_invitation_visible).toBe(true);
  });
});
