import "server-only";
import { cache } from "react";
import { getPublicSupabase } from "@/lib/supabase/public";
import { GALLERY_PAGE_SIZE } from "@/config/site";
import type {
  AppSettings,
  GalleryCategory,
  GalleryMedia,
  LiveStream,
  PublicWinners,
  StoryEntry,
  Venue,
  WeddingEvent,
  WeddingSettings,
} from "@/types/database";

/**
 * Read-only content service for the public site. Every function degrades to
 * an empty/default value when Supabase is not configured or a query fails,
 * so one bad record or outage never takes the whole page down.
 */

export { DEFAULT_APP_SETTINGS, DEFAULT_WEDDING } from "./defaults";
import { DEFAULT_APP_SETTINGS, DEFAULT_WEDDING } from "./defaults";

type QueryErrorLike = { code?: string; message?: string; details?: string } | null;

function classifyQueryError(error: NonNullable<QueryErrorLike>): "rls_denied" | "network_error" | "query_error" {
  const msg = error.message ?? "";
  if (error.code === "42501" || /permission denied|row-level security/i.test(msg)) {
    return "rls_denied";
  }
  if (/fetch failed|network|timeout|ECONNREFUSED|ENOTFOUND/i.test(msg)) {
    return "network_error";
  }
  return "query_error";
}

function getConfiguredDb(scope: string) {
  const db = getPublicSupabase();
  if (!db) {
    console.error(
      `[content:${scope}] config_missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured`,
    );
    return null;
  }
  return db;
}

function logError(scope: string, error: QueryErrorLike) {
  if (!error) return;
  const kind = classifyQueryError(error);
  console.error(`[content:${scope}] ${kind}:`, error.code ? `[${error.code}]` : "", error.message ?? "Unknown error");
}

function logArrayResult(scope: string, data: unknown, error: QueryErrorLike) {
  if (error) {
    logError(scope, error);
    return;
  }
  if (!Array.isArray(data)) {
    console.error(`[content:${scope}] invalid_data: expected array result`);
    return;
  }
  if (data.length === 0) {
    console.info(`[content:${scope}] empty_published: query succeeded with 0 published rows`);
  }
}

export const getWeddingSettings = cache(async (): Promise<WeddingSettings> => {
  const db = getConfiguredDb("wedding");
  if (!db) return DEFAULT_WEDDING;
  const { data, error } = await db.from("wedding_settings").select("*").maybeSingle<WeddingSettings>();
  logError("wedding", error);
  if (!data) return DEFAULT_WEDDING;
  return {
    ...DEFAULT_WEDDING,
    ...data,
    invitation_music_path: data.invitation_music_path || DEFAULT_WEDDING.invitation_music_path,
    social_links: Array.isArray(data.social_links) ? data.social_links : [],
  };
});

export const getAppSettings = cache(async (): Promise<AppSettings> => {
  const db = getConfiguredDb("app");
  if (!db) return DEFAULT_APP_SETTINGS;
  const { data, error } = await db.from("app_settings").select("*").maybeSingle<AppSettings>();
  logError("app", error);
  return data ?? DEFAULT_APP_SETTINGS;
});

export const getStoryEntries = cache(async (): Promise<StoryEntry[]> => {
  const db = getConfiguredDb("story");
  if (!db) return [];
  const { data, error } = await db
    .from("story_entries")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("entry_date", { ascending: true, nullsFirst: false });
  logArrayResult("story", data, error);
  return Array.isArray(data) ? (data as StoryEntry[]) : [];
});

const EVENT_SELECT = "*, venue:venues(*)";

export const getEvents = cache(async (): Promise<WeddingEvent[]> => {
  const db = getConfiguredDb("events");
  if (!db) return [];
  const { data, error } = await db
    .from("events")
    .select(EVENT_SELECT)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("event_date", { ascending: true, nullsFirst: false })
    .order("start_time", { ascending: true, nullsFirst: false });
  logArrayResult("events", data, error);
  return Array.isArray(data) ? (data as WeddingEvent[]) : [];
});

export const getEventBySlug = cache(async (slug: string): Promise<WeddingEvent | null> => {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const db = getConfiguredDb("event");
  if (!db) return null;
  const { data, error } = await db
    .from("events")
    .select(EVENT_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle<WeddingEvent>();
  logError("event", error);
  return data ?? null;
});

export type VenueWithEvents = Venue & { events: Pick<WeddingEvent, "id" | "slug" | "name" | "event_date" | "start_time">[] };

/** Venues used by published events, each with its related events, in event order. */
export const getLocations = cache(async (): Promise<VenueWithEvents[]> => {
  const events = await getEvents();
  const map = new Map<string, VenueWithEvents>();
  for (const e of events) {
    if (!e.venue) continue;
    const entry = map.get(e.venue.id) ?? { ...e.venue, events: [] };
    entry.events.push({ id: e.id, slug: e.slug, name: e.name, event_date: e.event_date, start_time: e.start_time });
    map.set(e.venue.id, entry);
  }
  return [...map.values()];
});

export const getGalleryCategories = cache(async (): Promise<GalleryCategory[]> => {
  const db = getConfiguredDb("gallery-categories");
  if (!db) return [];
  const { data, error } = await db
    .from("gallery_categories")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  logArrayResult("gallery-categories", data, error);
  return Array.isArray(data) ? (data as GalleryCategory[]) : [];
});

export type GalleryFilter = { category?: string | null; type?: "photo" | "video" | null };

export async function getGalleryPage(
  filter: GalleryFilter,
  offset = 0,
  limit = GALLERY_PAGE_SIZE,
): Promise<{ items: GalleryMedia[]; hasMore: boolean }> {
  const db = getConfiguredDb("gallery");
  if (!db) return { items: [], hasMore: false };
  let q = db
    .from("gallery_media")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit);
  if (filter.type) q = q.eq("media_type", filter.type);
  if (filter.category) q = q.eq("category_id", filter.category);
  const { data, error } = await q;
  logArrayResult("gallery", data, error);
  const rows = Array.isArray(data) ? (data as GalleryMedia[]) : [];
  return { items: rows.slice(0, limit), hasMore: rows.length > limit };
}

export const getFeaturedGallery = cache(async (limit = 6): Promise<GalleryMedia[]> => {
  const db = getConfiguredDb("gallery-featured");
  if (!db) return [];
  const { data, error } = await db
    .from("gallery_media")
    .select("*")
    .eq("is_published", true)
    .eq("media_type", "photo")
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .limit(limit);
  logArrayResult("gallery-featured", data, error);
  return Array.isArray(data) ? (data as GalleryMedia[]) : [];
});

export const getLiveStreams = cache(async (): Promise<LiveStream[]> => {
  const db = getConfiguredDb("streams");
  if (!db) return [];
  const { data, error } = await db
    .from("live_streams")
    .select("*, event:events(id, name, slug)")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("scheduled_at", { ascending: true, nullsFirst: false });
  logArrayResult("streams", data, error);
  return Array.isArray(data) ? (data as LiveStream[]) : [];
});

/** The stream to feature: live first, then the next upcoming, then the latest replay. */
export function pickFeaturedStream(streams: LiveStream[]): LiveStream | null {
  return (
    streams.find((s) => s.status === "live") ??
    streams.find((s) => s.status === "upcoming") ??
    [...streams].reverse().find((s) => s.status === "ended" && (s.replay_url || s.youtube_url)) ??
    null
  );
}

export const getPublicWinners = cache(async (): Promise<PublicWinners> => {
  const db = getConfiguredDb("winners");
  if (!db) return { status: "pending" };
  const { data, error } = await db.rpc("get_public_winners");
  logError("winners", error);
  return (data as PublicWinners | null) ?? { status: "pending" };
});
