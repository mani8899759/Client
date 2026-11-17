import { WEDDING_IDENTITY } from "@/config/wedding";
import type { AppSettings, WeddingSettings } from "@/types/database";

/** Fallbacks used only when the database is unreachable (see config/wedding.ts). */
export const DEFAULT_WEDDING: WeddingSettings = {
  bride_name: WEDDING_IDENTITY.brideName,
  groom_name: WEDDING_IDENTITY.groomName,
  monogram: "M & S",
  wedding_date: WEDDING_IDENTITY.weddingDateIso,
  wedding_end_at: null,
  timezone: WEDDING_IDENTITY.timezone,
  website_title: WEDDING_IDENTITY.websiteTitle,
  website_subtitle: WEDDING_IDENTITY.websiteSubtitle,
  wedding_time_confirmed: true,
  cta_primary_label: "Win a Special Gift",
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
  hero_subheading: "With the blessings of our families, we invite you to celebrate the beginning of our forever.",
  hero_image_path: null,
  hero_image_alt: "Manikanta & Sravika Wedding Celebration",
  hero_video_path: null,
  welcome_title: "Welcome to Gudla's Wedding Invitation",
  welcome_message:
    "Sri Gudla Venu Venkata Parameswara Reddy and Smt. Nagendra Lakshmi solicit your gracious presence with family and friends on the auspicious occasion of the marriage of their son, Chy. Neela Manikanta, with Chy. La. Sow. Lakshmi Sravika, youngest daughter of Smt. Padakanti Saroja and late Bhrahma Chari of Aminpur, Hyderabad.\n\n" +
    "Your presence and blessings will make our celebrations complete.",
  invitation_message: null,
  welcome_image_path: null,
  welcome_image_alt: null,
  story_intro:
    "Every beautiful journey begins with a sacred blessing. Cherished memories and milestones of Manikanta and Sravika as two lives and families unite.",
  story_closing:
    "We cannot wait to celebrate our wedding and begin this new chapter together with you on December 13, 2026.",
  footer_note: null,
  contact_name: "Sri GVVP Reddy / Smt. Nagendra Lakshmi",
  contact_phone: "+91 9848657487, +91 9550475579",
  contact_email: null,
  social_links: [],
  invitation_published: true,
  invitation_cover_heading: "Gudla's Wedding Invitation",
  invitation_cover_subheading: "We Are Getting Married",
  invitation_cover_image_path: null,
  invitation_intro_heading: "With the Blessings of Our Families",
  invitation_intro_message:
    "Sri Gudla Venu Venkata Parameswara Reddy and Smt. Nagendra Lakshmi solicit your gracious presence with family and friends on the auspicious occasion of the marriage of their son, Chy. Neela Manikanta, with Chy. La. Sow. Lakshmi Sravika, youngest daughter of Smt. Padakanti Saroja and late Bhrahma Chari of Aminpur, Hyderabad.",
  invitation_family_names: "Gudla & Padakanti Families",
  invitation_closing_heading: "Your Gracious Presence Means the World to Us",
  invitation_closing_message:
    "Sri Gudla Venu Venkata Parameswara Reddy, Smt. Nagendra Lakshmi, and family solicit your gracious presence and blessings on this joyous occasion.",
  invitation_whatsapp_message:
    "You're warmly invited to celebrate the wedding of Manikanta & Sravika on Sunday, December 13, 2026 at 08:08 AM. We look forward to celebrating with you!",
  invitation_music_path: "/audio/priya-arjun-wedding-music.m4a",
  invitation_music_title: "Traditional Wedding Celebration Music",
  invitation_music_enabled: true,
  invitation_music_volume: 0.65,
  invitation_auto_play_on_open: true,
  invitation_section_countdown: true,
  invitation_section_story: true,
  invitation_section_events: true,
  invitation_section_document: true,
  invitation_section_gallery: true,
  invitation_section_livestream: true,
  invitation_section_venues: true,
  invitation_section_gift_draw: true,
  invitation_gopuram_enabled: false,
  invitation_gopuram_image_path: null,
  invitation_pdf_path: "/documents/gudlas-wedding-invitation.pdf",
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

