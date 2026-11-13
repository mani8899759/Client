"use server";

import { z } from "zod";
import { bool, fail, ok, revalidatePublic, str, uuid, withAdmin, type ActionState } from "@/lib/admin/actions";
import { mediaRefField, removeMedia, replacedRefs } from "@/lib/admin/media";
import { moveRow, nextSortOrder, setPublished } from "@/lib/admin/crud";
import { friendlyDbError } from "@/lib/auth/errors";
import { isStorageRef } from "@/lib/storage/media";
import { slugify } from "@/lib/utils/slug";
import { getYouTubeId } from "@/lib/utils/youtube";
import type { GalleryMedia } from "@/types/database";

// ── Categories ──────────────────────────────────────────────────────────────
export async function saveCategory(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    const name = str(fd, "name");
    if (!name || name.length > 60) return fail("Enter a category name (60 characters max).", { name: ["Required."] });
    const slug = slugify(str(fd, "slug") ?? name).slice(0, 60);
    if (!slug) return fail("Enter a valid category name.", { name: ["Use letters or numbers."] });
    const row = { name, slug, description: str(fd, "description"), is_published: id ? bool(fd, "is_published") : true };
    const { error } = id
      ? await supabase.from("gallery_categories").update(row).eq("id", id)
      : await supabase.from("gallery_categories").insert({ ...row, sort_order: await nextSortOrder(supabase, "gallery_categories") });
    if (error) return fail(error.code === "23505" ? "A category with this name already exists." : friendlyDbError(error));
    revalidatePublic();
    return ok(id ? "Category updated." : "Category added.");
  });
}

export async function deleteCategory(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    if (!id) return fail("Invalid category.");
    const { error } = await supabase.from("gallery_categories").delete().eq("id", id);
    if (error) return fail(friendlyDbError(error));
    revalidatePublic();
    return ok("Category deleted. Its media is now uncategorised.");
  });
}

export async function moveCategory(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    if (!id) return fail("Invalid category.");
    const { error } = await moveRow(supabase, "gallery_categories", id, str(fd, "direction") === "up" ? "up" : "down");
    if (error) return fail(error);
    revalidatePublic();
    return ok("Order updated.");
  });
}

export async function publishCategory(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    if (!id) return fail("Invalid category.");
    const { error } = await setPublished(supabase, "gallery_categories", id, str(fd, "published") === "true");
    if (error) return fail(error);
    revalidatePublic();
    return ok("Category visibility updated.");
  });
}

// ── Media ───────────────────────────────────────────────────────────────────
const uploadedSchema = z
  .array(
    z.object({
      ref: z.string().refine((r) => isStorageRef(r), "Invalid file."),
      width: z.number().int().positive().nullable(),
      height: z.number().int().positive().nullable(),
      kind: z.enum(["image", "video"]),
    }),
  )
  .min(1)
  .max(50);

/** Create records for files the admin already uploaded to Storage from the browser. */
export async function createUploadedMedia(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    let files: unknown;
    try {
      files = JSON.parse(String(fd.get("files") ?? "[]"));
    } catch {
      return fail("Invalid upload data.");
    }
    const parsed = uploadedSchema.safeParse(files);
    if (!parsed.success) return fail("Some uploads were invalid. Please try again.");
    const category_id = uuid(fd, "category_id");
    const is_published = bool(fd, "is_published");
    let order = await nextSortOrder(supabase, "gallery_media");
    const rows = parsed.data.map((f) => ({
      category_id,
      is_published,
      media_type: f.kind === "image" ? ("photo" as const) : ("video" as const),
      video_source: f.kind === "video" ? ("upload" as const) : null,
      storage_path: f.ref,
      width: f.width,
      height: f.height,
      sort_order: (order += 10),
    }));
    const { error } = await supabase.from("gallery_media").insert(rows);
    if (error) {
      await removeMedia(supabase, rows.map((r) => r.storage_path));
      return fail(friendlyDbError(error));
    }
    revalidatePublic();
    return ok(`${rows.length} item${rows.length === 1 ? "" : "s"} added to the gallery.`);
  });
}

export async function addYouTubeVideo(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const url = str(fd, "video_url");
    if (!url || !getYouTubeId(url)) return fail("Enter a valid YouTube link.", { video_url: ["Use a youtube.com or youtu.be link."] });
    const title = str(fd, "title");
    if (title && title.length > 160) return fail("Title is too long.", { title: ["160 characters max."] });
    const { error } = await supabase.from("gallery_media").insert({
      media_type: "video",
      video_source: "youtube",
      video_url: url,
      title,
      category_id: uuid(fd, "category_id"),
      is_published: bool(fd, "is_published"),
      sort_order: await nextSortOrder(supabase, "gallery_media"),
    });
    if (error) return fail(friendlyDbError(error));
    revalidatePublic();
    return ok("Video added.");
  });
}

const mediaSchema = z.object({
  title: z.string().max(160).nullable(),
  caption: z.string().max(600).nullable(),
  alt_text: z.string().max(200).nullable(),
});

export async function updateMedia(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    if (!id) return fail("Invalid item.");
    const parsed = mediaSchema.safeParse({ title: str(fd, "title"), caption: str(fd, "caption"), alt_text: str(fd, "alt_text") });
    if (!parsed.success) return fail("Please correct the highlighted fields.", z.flattenError(parsed.error).fieldErrors);
    const { data: before } = await supabase.from("gallery_media").select("*").eq("id", id).maybeSingle<GalleryMedia>();
    if (!before) return fail("Item not found.");

    const update: Partial<GalleryMedia> = {
      ...parsed.data,
      category_id: uuid(fd, "category_id"),
      is_published: bool(fd, "is_published"),
      is_featured: bool(fd, "is_featured"),
    };
    if (before.media_type === "video") {
      const thumb = mediaRefField(str(fd, "thumbnail_path"));
      if (!thumb.ok) return fail("Invalid thumbnail.");
      update.thumbnail_path = thumb.value;
      if (before.video_source === "youtube") {
        const url = str(fd, "video_url");
        if (!url || !getYouTubeId(url)) return fail("Enter a valid YouTube link.", { video_url: ["Invalid link."] });
        update.video_url = url;
      }
    }
    const { error } = await supabase.from("gallery_media").update(update).eq("id", id);
    if (error) return fail(friendlyDbError(error));
    await removeMedia(supabase, replacedRefs(before, update, ["thumbnail_path"]));
    revalidatePublic();
    return ok("Item updated.");
  });
}

export async function deleteMedia(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    if (!id) return fail("Invalid item.");
    const { data: before } = await supabase.from("gallery_media").select("*").eq("id", id).maybeSingle<GalleryMedia>();
    const { error } = await supabase.from("gallery_media").delete().eq("id", id);
    if (error) return fail(friendlyDbError(error));
    await removeMedia(supabase, [before?.storage_path, before?.thumbnail_path]);
    revalidatePublic();
    return ok("Item deleted.");
  });
}

export async function moveMedia(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    if (!id) return fail("Invalid item.");
    const { error } = await moveRow(supabase, "gallery_media", id, str(fd, "direction") === "up" ? "up" : "down");
    if (error) return fail(error);
    revalidatePublic();
    return ok("Order updated.");
  });
}

export async function publishMedia(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const id = uuid(fd, "id");
    if (!id) return fail("Invalid item.");
    const { error } = await setPublished(supabase, "gallery_media", id, str(fd, "published") === "true");
    if (error) return fail(error);
    revalidatePublic();
    return ok("Visibility updated.");
  });
}
