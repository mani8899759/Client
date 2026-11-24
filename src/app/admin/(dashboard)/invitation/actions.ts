"use server";

import { z } from "zod";
import { fail, ok, revalidatePublic, str, withAdmin, type ActionState } from "@/lib/admin/actions";
import { mediaRefField, removeMedia, replacedRefs } from "@/lib/admin/media";
import { friendlyDbError } from "@/lib/auth/errors";
import type { WeddingSettings } from "@/types/database";

const opt = (max: number) => z.string().max(max, `Must be ${max} characters or fewer.`).nullable();
const fields = <T extends z.ZodRawShape>(schema: z.ZodObject<T>, fd: FormData) =>
  schema.safeParse(Object.fromEntries(Object.keys(schema.shape).map((k) => [k, str(fd, k)])));

const invitationSchema = z.object({
  family_heading: opt(160),
  family_invitation_message: opt(1000),
  invitation_cover_heading: opt(120),
  invitation_cover_subheading: opt(160),
  invitation_intro_heading: opt(120),
  invitation_intro_message: opt(2000),
  invitation_family_names: opt(400),
  invitation_closing_heading: opt(160),
  invitation_closing_message: opt(2000),
  invitation_whatsapp_message: opt(1000),
  invitation_music_title: opt(160),
});

const INVITATION_MEDIA = [
  "invitation_cover_image_path",
  "invitation_pdf_path",
  "invitation_image_path",
  "invitation_music_path",
  "invitation_gopuram_image_path",
] as const;

export async function updateDigitalInvitation(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const parsed = fields(invitationSchema, fd);
    if (!parsed.success) {
      return fail("Please correct the highlighted fields.", z.flattenError(parsed.error).fieldErrors);
    }

    const media: Partial<Record<(typeof INVITATION_MEDIA)[number], string | null>> = {};
    for (const key of INVITATION_MEDIA) {
      const r = mediaRefField(str(fd, key));
      if (!r.ok) {
        return fail("Invalid media reference.", { [key]: ["Please upload the file again."] });
      }
      media[key] = r.value;
    }

    const volumeRaw = str(fd, "invitation_music_volume");
    const invitation_music_volume = volumeRaw ? Math.max(0, Math.min(1, parseFloat(volumeRaw))) : 0.7;

    const boolFields = {
      invitation_published: fd.get("invitation_published") === "on",
      invitation_music_enabled: fd.get("invitation_music_enabled") === "on",
      invitation_auto_play_on_open: fd.get("invitation_auto_play_on_open") === "on",
      invitation_section_countdown: fd.get("invitation_section_countdown") === "on",
      invitation_section_story: fd.get("invitation_section_story") === "on",
      invitation_section_events: fd.get("invitation_section_events") === "on",
      invitation_section_document: fd.get("invitation_section_document") === "on",
      invitation_section_gallery: fd.get("invitation_section_gallery") === "on",
      invitation_section_livestream: fd.get("invitation_section_livestream") === "on",
      invitation_section_venues: fd.get("invitation_section_venues") === "on",
      invitation_section_gift_draw: fd.get("invitation_section_gift_draw") === "on",
      invitation_gopuram_enabled: fd.get("invitation_gopuram_enabled") === "on",
    };

    const update = {
      ...parsed.data,
      ...media,
      ...boolFields,
      invitation_music_volume,
    };

    const { data: before } = await supabase.from("wedding_settings").select("*").single<WeddingSettings>();
    const { error } = await supabase.from("wedding_settings").update(update).eq("id", true);
    if (error) return fail(friendlyDbError(error));

    await removeMedia(supabase, replacedRefs(before, update, [...INVITATION_MEDIA]));
    revalidatePublic();
    return ok("Digital invitation settings saved.");
  });
}
