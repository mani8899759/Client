"use server";

import { z } from "zod";
import { bool, fail, ok, revalidatePublic, str, uuid, withAdmin, type ActionState } from "@/lib/admin/actions";
import { moveRow, nextSortOrder, setPublished } from "@/lib/admin/crud";
import { friendlyDbError } from "@/lib/auth/errors";
import { safeTimeZone, zonedLocalToUtcIso } from "@/lib/utils/datetime";
import { getYouTubeId } from "@/lib/utils/youtube";

const ytUrl = z
  .string()
  .max(500)
  .refine((u) => getYouTubeId(u) !== null, "Use a valid YouTube link (watch, youtu.be or /live/).")
  .nullable();

const schema = z.object({
  title: z.string({ error: "Enter a title." }).min(1, "Enter a title.").max(160),
  description: z.string().max(1000).nullable(),
  youtube_url: ytUrl,
  replay_url: ytUrl,
  status: z.enum(["upcoming", "live", "ended"]),
});

/** Manual stream status control — no automatic YouTube status detection is claimed. */
export async function saveStream(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    const parsed = schema.safeParse({
      title: str(fd, "title"),
      description: str(fd, "description"),
      youtube_url: str(fd, "youtube_url"),
      replay_url: str(fd, "replay_url"),
      status: str(fd, "status") ?? "upcoming",
    });
    if (!parsed.success) return fail("Please correct the highlighted fields.", z.flattenError(parsed.error).fieldErrors);
    if (parsed.data.status === "live" && !parsed.data.youtube_url) {
      return fail("A live stream needs a YouTube link.", { youtube_url: ["Required when live."] });
    }
    const { data: w } = await supabase.from("wedding_settings").select("timezone").single();
    const tz = safeTimeZone((w as { timezone: string } | null)?.timezone);
    const local = str(fd, "scheduled_at");
    const scheduled_at = local ? zonedLocalToUtcIso(local, tz) : null;
    if (local && !scheduled_at) return fail("Invalid date and time.", { scheduled_at: ["Invalid."] });

    const row = { ...parsed.data, scheduled_at, event_id: uuid(fd, "event_id"), is_published: bool(fd, "is_published") };
    const { error } = id
      ? await supabase.from("live_streams").update(row).eq("id", id)
      : await supabase.from("live_streams").insert({ ...row, sort_order: await nextSortOrder(supabase, "live_streams") });
    if (error) return fail(friendlyDbError(error));
    revalidatePublic();
    return ok(id ? "Stream updated." : "Stream added.");
  });
}

export async function setStreamStatus(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    const status = str(fd, "status");
    if (!id || (status !== "upcoming" && status !== "live" && status !== "ended")) return fail("Invalid request.");
    const { error } = await supabase.from("live_streams").update({ status }).eq("id", id);
    if (error) return fail(friendlyDbError(error));
    revalidatePublic();
    return ok(`Stream marked ${status === "live" ? "Live Now" : status === "ended" ? "Ended" : "Upcoming"}.`);
  });
}

export async function deleteStream(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    if (!id) return fail("Invalid stream.");
    const { error } = await supabase.from("live_streams").delete().eq("id", id);
    if (error) return fail(friendlyDbError(error));
    revalidatePublic();
    return ok("Stream deleted.");
  });
}

export async function moveStream(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    if (!id) return fail("Invalid stream.");
    const { error } = await moveRow(supabase, "live_streams", id, str(fd, "direction") === "up" ? "up" : "down");
    if (error) return fail(error);
    revalidatePublic();
    return ok("Order updated.");
  });
}

export async function publishStream(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    if (!id) return fail("Invalid stream.");
    const { error } = await setPublished(supabase, "live_streams", id, str(fd, "published") === "true");
    if (error) return fail(error);
    revalidatePublic();
    return ok("Visibility updated.");
  });
}
