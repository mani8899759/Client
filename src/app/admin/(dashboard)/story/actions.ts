"use server";

import { z } from "zod";
import { bool, fail, ok, revalidatePublic, str, uuid, withAdmin, type ActionState } from "@/lib/admin/actions";
import { mediaRefField, removeMedia, replacedRefs } from "@/lib/admin/media";
import { moveRow, nextSortOrder, setPublished } from "@/lib/admin/crud";
import { friendlyDbError } from "@/lib/auth/errors";
import type { StoryEntry } from "@/types/database";

const schema = z.object({
  title: z.string({ error: "Enter a title." }).min(1, "Enter a title.").max(160),
  chapter: z.string().max(60).nullable(),
  date_label: z.string().max(60).nullable(),
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date.").nullable(),
  description: z.string().max(4000).nullable(),
  image_alt: z.string().max(200).nullable(),
  secondary_image_alt: z.string().max(200).nullable(),
});

export async function saveStoryEntry(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    const parsed = schema.safeParse(Object.fromEntries(Object.keys(schema.shape).map((k) => [k, str(fd, k)])));
    if (!parsed.success) return fail("Please correct the highlighted fields.", z.flattenError(parsed.error).fieldErrors);
    const image = mediaRefField(str(fd, "image_path"));
    const image2 = mediaRefField(str(fd, "secondary_image_path"));
    if (!image.ok || !image2.ok) return fail("Invalid image. Please upload it again.");

    const row = {
      ...parsed.data,
      image_path: image.value,
      secondary_image_path: image2.value,
      is_published: bool(fd, "is_published"),
    };

    if (id) {
      const { data: before } = await supabase.from("story_entries").select("*").eq("id", id).maybeSingle<StoryEntry>();
      const { error } = await supabase.from("story_entries").update(row).eq("id", id);
      if (error) return fail(friendlyDbError(error));
      await removeMedia(supabase, replacedRefs(before, row, ["image_path", "secondary_image_path"]));
    } else {
      const { error } = await supabase.from("story_entries").insert({ ...row, sort_order: await nextSortOrder(supabase, "story_entries") });
      if (error) return fail(friendlyDbError(error));
    }
    revalidatePublic();
    return ok(id ? "Story entry updated." : "Story entry added.");
  });
}

export async function deleteStoryEntry(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    if (!id) return fail("Invalid entry.");
    const { data: before } = await supabase.from("story_entries").select("*").eq("id", id).maybeSingle<StoryEntry>();
    const { error } = await supabase.from("story_entries").delete().eq("id", id);
    if (error) return fail(friendlyDbError(error));
    await removeMedia(supabase, [before?.image_path, before?.secondary_image_path]);
    revalidatePublic();
    return ok("Story entry deleted.");
  });
}

export async function moveStoryEntry(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    if (!id) return fail("Invalid entry.");
    const { error } = await moveRow(supabase, "story_entries", id, str(fd, "direction") === "up" ? "up" : "down");
    if (error) return fail(error);
    revalidatePublic();
    return ok("Order updated.");
  });
}

export async function publishStoryEntry(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    if (!id) return fail("Invalid entry.");
    const published = str(fd, "published") === "true";
    const { error } = await setPublished(supabase, "story_entries", id, published);
    if (error) return fail(error);
    revalidatePublic();
    return ok(published ? "Entry published." : "Entry unpublished.");
  });
}
