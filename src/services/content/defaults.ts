import { WEDDING_IDENTITY } from "@/config/wedding";
import type { AppSettings, WeddingSettings } from "@/types/database";

/** Fallbacks used only when the database is unreachable (see config/wedding.ts). */
export const DEFAULT_WEDDING: WeddingSettings = {
  bride_name: WEDDING_IDENTITY.brideName,
  groom_name: WEDDING_IDENTITY.groomName,
  monogram: null,
  wedding_date: WEDDING_IDENTITY.weddingDateIso,
  wedding_end_at: null,
  timezone: WEDDING_IDENTITY.timezone,
  website_title: WEDDING_IDENTITY.websiteTitle,
  website_subtitle: WEDDING_IDENTITY.websiteSubtitle,
  wedding_time_confirmed: false,
  cta_primary_label: "Register Now",
  cta_secondary_label: "View Our Story",
  bride_intro: null,
  groom_intro: null,
  bride_image_path: null,
  bride_image_alt: null,
  groom_image_path: null,
  groom_image_alt: null,
  secondary_image_path: null,
  secondary_image_alt: null,
  announcement: null,
  hero_heading: "Are getting married",
  hero_subheading: "With joyful hearts, we invite you to celebrate the beginning of our forever.",
  hero_image_path: null,
  hero_image_alt: null,
  hero_video_path: null,
  welcome_title: "Welcome to our wedding celebration",
  welcome_message:
    "With the blessings of our families, we invite you to share in the joy of our wedding.\n\n" +
    "Here you will find the ceremonies, venues and everything you need for the celebrations. Your presence and blessings will make our day complete.",
  invitation_message: null,
  welcome_image_path: null,
  welcome_image_alt: null,
  story_intro: null,
  story_closing: null,
  footer_note: null,
  contact_name: null,
  contact_phone: null,
  contact_email: null,
  social_links: [],
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  registration_open: true,
  verification_enabled: true,
  winners_public: false,
  live_section_visible: true,
  consent_policy_version: "unconfigured",
  consent_text:
    "I agree that the wedding organisers may store my details to manage the wedding lucky draw and contact me if I win. My details will not be shared publicly.",
};

