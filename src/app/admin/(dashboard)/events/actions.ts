"use server";

import { z } from "zod";
import { bool, fail, num, ok, revalidatePublic, str, uuid, withAdmin, type ActionState } from "@/lib/admin/actions";
import { mediaRefField, removeMedia, replacedRefs } from "@/lib/admin/media";
import { moveRow, nextSortOrder, setPublished } from "@/lib/admin/crud";
import { friendlyDbError } from "@/lib/auth/errors";
import { slugify } from "@/lib/utils/slug";
import type { WeddingEvent } from "@/types/database";

const time = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time.").nullable();

const eventSchema = z.object({
  name: z.string({ error: "Enter the event name." }).min(1, "Enter the event name.").max(120),
  event_type: z.enum(["engagement", "haldi", "mehendi", "sangeet", "wedding", "reception", "other"]),
  short_description: z.string().max(300).nullable(),
  description: z.string().max(5000).nullable(),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date.").nullable(),
  start_time: time,
  end_time: time,
  time_period: z.enum(["morning", "afternoon", "evening", "all_day"]).nullable().optional(),
  time_label: z.string().max(100).nullable().optional(),
  dress_code: z.string().max(200).nullable(),
  image_alt: z.string().max(200).nullable(),
  contact_info: z.string().max(300).nullable(),
});

const EVENT_MEDIA = ["image_path", "invitation_pdf_path", "invitation_image_path", "invitation_video_path"] as const;

export async function saveEvent(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    const parsed = eventSchema.safeParse({
      ...Object.fromEntries(Object.keys(eventSchema.shape).map((k) => [k, str(fd, k)])),
      event_type: str(fd, "event_type") ?? "other",
    });
    if (!parsed.success) return fail("Please correct the highlighted fields.", z.flattenError(parsed.error).fieldErrors);

    const slug = slugify(str(fd, "slug") ?? parsed.data.name);
    if (!slug) return fail("Enter a valid web address (slug).", { slug: ["Use letters and numbers."] });

    const media: Record<string, string | null> = {};
    for (const key of EVENT_MEDIA) {
      const r = mediaRefField(str(fd, key));
      if (!r.ok) return fail("Invalid media. Please upload it again.");
      media[key] = r.value;
    }

    const row = {
      ...parsed.data,
      ...media,
      slug,
      venue_id: uuid(fd, "venue_id"),
      is_published: bool(fd, "is_published"),
    };

    if (id) {
      const { data: before } = await supabase.from("events").select("*").eq("id", id).maybeSingle<WeddingEvent>();
      const { error } = await supabase.from("events").update(row).eq("id", id);
      if (error) {
        if (error.code === "23505") return fail("Another event already uses this web address.", { slug: ["Already in use."] });
        return fail(friendlyDbError(error));
      }
      await removeMedia(supabase, replacedRefs(before, row as Partial<WeddingEvent>, [...EVENT_MEDIA]));
    } else {
      const { error } = await supabase.from("events").insert({ ...row, sort_order: await nextSortOrder(supabase, "events") });
      if (error) {
        if (error.code === "23505") return fail("Another event already uses this web address.", { slug: ["Already in use."] });
        return fail(friendlyDbError(error));
      }
    }
    revalidatePublic();
    return ok(id ? "Event updated." : "Event created.");
  });
}

export async function deleteEvent(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    if (!id) return fail("Invalid event.");
    const { data: before } = await supabase.from("events").select("*").eq("id", id).maybeSingle<WeddingEvent>();
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return fail(friendlyDbError(error));
    await removeMedia(supabase, EVENT_MEDIA.map((k) => before?.[k]));
    revalidatePublic();
    return ok("Event deleted.");
  });
}

export async function moveEvent(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    if (!id) return fail("Invalid event.");
    const { error } = await moveRow(supabase, "events", id, str(fd, "direction") === "up" ? "up" : "down");
    if (error) return fail(error);
    revalidatePublic();
    return ok("Order updated.");
  });
}

export async function publishEvent(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    if (!id) return fail("Invalid event.");
    const published = str(fd, "published") === "true";
    const { error } = await setPublished(supabase, "events", id, published);
    if (error) return fail(error);
    revalidatePublic();
    return ok(published ? "Event published." : "Event unpublished.");
  });
}

const venueSchema = z.object({
  name: z.string({ error: "Enter the venue name." }).min(1, "Enter the venue name.").max(160),
  address: z.string().max(400).nullable(),
  city: z.string().max(80).nullable(),
  state: z.string().max(80).nullable(),
  country: z.string().max(80).nullable(),
  google_maps_url: z.string().max(500).regex(/^https:\/\/\S+$/, "Use a full https:// link.").nullable(),
  notes: z.string().max(1000).nullable(),
});

export async function saveVenue(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    const parsed = venueSchema.safeParse(Object.fromEntries(Object.keys(venueSchema.shape).map((k) => [k, str(fd, k)])));
    if (!parsed.success) return fail("Please correct the highlighted fields.", z.flattenError(parsed.error).fieldErrors);
    const latitude = num(fd, "latitude");
    const longitude = num(fd, "longitude");
    if ((latitude === null) !== (longitude === null)) {
      return fail("Enter both latitude and longitude, or neither.", { latitude: ["Both are required together."] });
    }
    if (latitude !== null && (latitude < -90 || latitude > 90)) return fail("Latitude must be between -90 and 90.", { latitude: ["Out of range."] });
    if (longitude !== null && (longitude < -180 || longitude > 180)) return fail("Longitude must be between -180 and 180.", { longitude: ["Out of range."] });

    const row = { ...parsed.data, latitude, longitude };
    const { error } = id ? await supabase.from("venues").update(row).eq("id", id) : await supabase.from("venues").insert(row);
    if (error) return fail(friendlyDbError(error));
    revalidatePublic();
    return ok(id ? "Venue updated." : "Venue added.");
  });
}

export async function deleteVenue(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    if (!id) return fail("Invalid venue.");
    const { error } = await supabase.from("venues").delete().eq("id", id);
    if (error) return fail(friendlyDbError(error));
    revalidatePublic();
    return ok("Venue deleted. Events that used it now have no venue.");
  });
}
