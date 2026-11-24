"use server";

import { z } from "zod";
import { fail, ok, revalidatePublic, str, withAdmin, type ActionState } from "@/lib/admin/actions";
import { mediaRefField, removeMedia, replacedRefs } from "@/lib/admin/media";
import { safeTimeZone, zonedLocalToUtcIso } from "@/lib/utils/datetime";
import { friendlyDbError } from "@/lib/auth/errors";
import type { SocialLink, WeddingSettings } from "@/types/database";

const opt = (max: number) => z.string().max(max, `Must be ${max} characters or fewer.`).nullable();
const fields = <T extends z.ZodRawShape>(schema: z.ZodObject<T>, fd: FormData) =>
  schema.safeParse(Object.fromEntries(Object.keys(schema.shape).map((k) => [k, str(fd, k)])));

// ── Website Content: identity, date, CTA labels, footer, contact, socials ──
const contentSchema = z.object({
  bride_name: z.string({ error: "Enter the bride's name." }).min(1, "Enter the bride's name.").max(80),
  groom_name: z.string({ error: "Enter the groom's name." }).min(1, "Enter the groom's name.").max(80),
  groom_family_name: opt(80),
  bride_family_name: opt(80),
  family_heading: opt(160),
  family_invitation_message: opt(1000),
  website_title: opt(120),
  website_subtitle: opt(120),
  monogram: opt(12),
  cta_primary_label: opt(40),
  cta_secondary_label: opt(40),
  story_intro: opt(2000),
  story_closing: opt(2000),
  footer_note: opt(400),
  contact_name: opt(120),
  contact_phone: opt(40),
  contact_email: z.string().max(254).regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address.").nullable(),
});

export async function updateWebsiteContent(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const parsed = fields(contentSchema, fd);
    if (!parsed.success) return fail("Please correct the highlighted fields.", z.flattenError(parsed.error).fieldErrors);

    // Wedding date: a date, plus an optional ceremony time. Without a time the
    // wedding is date-only and the countdown targets the start of that day.
    const timezone = safeTimeZone(str(fd, "timezone"));
    const day = str(fd, "wedding_day");
    const time = str(fd, "ceremony_time");
    if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return fail("Enter the wedding date.", { wedding_day: ["Required."] });
    if (time && !/^\d{2}:\d{2}$/.test(time)) return fail("Enter a valid ceremony time.", { ceremony_time: ["Invalid time."] });
    const wedding_date = zonedLocalToUtcIso(`${day}T${time ?? "00:00"}`, timezone);
    if (!wedding_date) return fail("Enter a valid wedding date.", { wedding_day: ["Invalid date."] });
    const endLocal = str(fd, "wedding_end_at");
    const wedding_end_at = endLocal ? zonedLocalToUtcIso(endLocal, timezone) : null;
    if (endLocal && !wedding_end_at) return fail("Invalid end time.", { wedding_end_at: ["Invalid."] });
    if (wedding_end_at && wedding_end_at <= wedding_date) {
      return fail("The celebration end must be after the start.", { wedding_end_at: ["Must be after the wedding start."] });
    }

    const social_links: SocialLink[] = [];
    for (let i = 0; i < 6; i += 1) {
      const label = str(fd, `social_label_${i}`);
      const url = str(fd, `social_url_${i}`);
      if (!label && !url) continue;
      if (!label || !url || !/^https:\/\/\S+$/.test(url) || label.length > 40 || url.length > 300) {
        return fail("Each social link needs a label and an https:// address.", { [`social_url_${i}`]: ["Use a full https:// link."] });
      }
      social_links.push({ label, url });
    }

    const invPdfRef = mediaRefField(str(fd, "invitation_pdf_path"));
    if (!invPdfRef.ok) return fail("Invalid invitation PDF reference.", { invitation_pdf_path: ["Please upload the PDF again."] });
    const invImgRef = mediaRefField(str(fd, "invitation_image_path"));
    if (!invImgRef.ok) return fail("Invalid invitation image reference.", { invitation_image_path: ["Please upload the image again."] });
    const invitation_published = fd.get("invitation_published") === "on";

    const { data: before } = await supabase.from("wedding_settings").select("*").single<WeddingSettings>();
    const invitationUpdate = {
      invitation_pdf_path: invPdfRef.value,
      invitation_image_path: invImgRef.value,
      invitation_published,
    };

    const { error } = await supabase
      .from("wedding_settings")
      .update({
        ...parsed.data,
        ...invitationUpdate,
        timezone,
        wedding_date,
        wedding_time_confirmed: !!time,
        wedding_end_at,
        social_links,
      })
      .eq("id", true);
    if (error) return fail(friendlyDbError(error));
    await removeMedia(supabase, replacedRefs(before, invitationUpdate, ["invitation_pdf_path", "invitation_image_path"]));
    revalidatePublic();
    return ok("Website content saved.");
  });
}

// ── Homepage: hero, welcome, couple introduction, secondary imagery ─────────
const homepageSchema = z.object({
  announcement: opt(160),
  hero_heading: opt(160),
  hero_subheading: opt(400),
  hero_image_alt: opt(200),
  welcome_title: opt(160),
  welcome_message: opt(2000),
  invitation_message: opt(1000),
  welcome_image_alt: opt(200),
  bride_intro: opt(1000),
  groom_intro: opt(1000),
  bride_image_alt: opt(200),
  groom_image_alt: opt(200),
  secondary_image_alt: opt(200),
  photo_access_heading: opt(160),
  photo_access_subheading: opt(160),
  photo_access_description: opt(1000),
  photo_access_url: z
    .string({ error: "Enter the external photo gallery URL." })
    .url("Enter a valid URL.")
    .regex(/^https:\/\//, "URL must start with https://")
    .nullable(),
  photo_access_cta_label: opt(80),
  photo_access_supporting_text: opt(300),
});

const HOMEPAGE_MEDIA = [
  "hero_image_path",
  "hero_video_path",
  "welcome_image_path",
  "bride_image_path",
  "groom_image_path",
  "secondary_image_path",
] as const;

export async function updateHomepage(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const parsed = fields(homepageSchema, fd);
    if (!parsed.success) return fail("Please correct the highlighted fields.", z.flattenError(parsed.error).fieldErrors);
    const media: Partial<Record<(typeof HOMEPAGE_MEDIA)[number], string | null>> = {};
    for (const key of HOMEPAGE_MEDIA) {
      const r = mediaRefField(str(fd, key));
      if (!r.ok) return fail("Invalid media reference.", { [key]: ["Please upload the file again."] });
      media[key] = r.value;
    }
    const boolFields = {
      photo_access_enabled: fd.get("photo_access_enabled") === "on",
      photo_access_qr_visible: fd.get("photo_access_qr_visible") === "on",
    };
    const { data: before } = await supabase.from("wedding_settings").select("*").single<WeddingSettings>();
    const update = { ...parsed.data, ...media, ...boolFields };
    const { error } = await supabase.from("wedding_settings").update(update).eq("id", true);
    if (error) return fail(friendlyDbError(error));
    await removeMedia(supabase, replacedRefs(before, update, [...HOMEPAGE_MEDIA]));
    revalidatePublic();
    return ok("Homepage saved.");
  });
}

const SITE_IMAGE_FIELDS = {
  hero_image_path: "hero_image_alt",
  welcome_image_path: "welcome_image_alt",
  bride_image_path: "bride_image_alt",
  groom_image_path: "groom_image_alt",
  secondary_image_path: "secondary_image_alt",
} as const;

/** Media manager: replace (or clear, to fall back to the AI illustration) one site image. */
export async function setSiteImage(_: ActionState, fd: FormData): Promise<ActionState> {
  return withAdmin(async ({ supabase }) => {
    const field = str(fd, "field") as keyof typeof SITE_IMAGE_FIELDS | null;
    if (!field || !(field in SITE_IMAGE_FIELDS)) return fail("Unknown image slot.");
    const r = mediaRefField(str(fd, "ref"));
    if (!r.ok) return fail("Invalid image. Please upload it again.");
    const alt = str(fd, "alt");
    if (alt && alt.length > 200) return fail("Description must be 200 characters or fewer.", { alt: ["Too long."] });
    const { data: before } = await supabase.from("wedding_settings").select("*").single<WeddingSettings>();
    const update = { [field]: r.value, [SITE_IMAGE_FIELDS[field]]: alt };
    const { error } = await supabase.from("wedding_settings").update(update).eq("id", true);
    if (error) return fail(friendlyDbError(error));
    await removeMedia(supabase, replacedRefs(before, update as Partial<WeddingSettings>, [field]));
    revalidatePublic();
    return ok(r.value ? "Image updated on the website." : "Image cleared — the illustration or placeholder is shown again.");
  });
}
