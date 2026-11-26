/** Row shapes for the shared Supabase schema (see supabase/migrations). */

export type Side = "bride" | "groom";
export type Gender = "male" | "female";
export type RegistrationStatus = "registered" | "cancelled";
export type VerificationStatus = "pending" | "verified";
export type EventType = "engagement" | "haldi" | "mehendi" | "sangeet" | "wedding" | "reception" | "other";
export type MediaType = "photo" | "video";
export type VideoSource = "upload" | "youtube";
export type StreamStatus = "upcoming" | "live" | "ended";
export type GiftStatus = "pending" | "contacted" | "delivered";
export type EligibilityRule = "verified_only" | "all_registered";
export type AdminRole = "owner" | "admin";

export interface SocialLink {
  label: string;
  url: string;
}

export interface WeddingSettings {
  bride_name: string | null;
  groom_name: string | null;
  monogram: string | null;
  wedding_date: string | null;
  wedding_end_at: string | null;
  timezone: string;
  announcement: string | null;
  hero_heading: string | null;
  hero_subheading: string | null;
  hero_image_path: string | null;
  hero_image_alt: string | null;
  hero_video_path: string | null;
  welcome_title: string | null;
  welcome_message: string | null;
  invitation_message: string | null;
  welcome_image_path: string | null;
  welcome_image_alt: string | null;
  story_intro: string | null;
  story_closing: string | null;
  footer_note: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  social_links: SocialLink[];
  website_title: string | null;
  website_subtitle: string | null;
  /** false = date-only wedding (countdown to the start of the day). */
  wedding_time_confirmed: boolean;
  cta_primary_label: string | null;
  cta_secondary_label: string | null;
  bride_intro: string | null;
  groom_intro: string | null;
  bride_image_path: string | null;
  bride_image_alt: string | null;
  groom_image_path: string | null;
  groom_image_alt: string | null;
  secondary_image_path: string | null;
  secondary_image_alt: string | null;
  invitation_pdf_path?: string | null;
  invitation_image_path?: string | null;
  invitation_published?: boolean;
  invitation_cover_heading?: string | null;
  invitation_cover_subheading?: string | null;
  invitation_cover_image_path?: string | null;
  invitation_intro_heading?: string | null;
  invitation_intro_message?: string | null;
  invitation_family_names?: string | null;
  invitation_closing_heading?: string | null;
  invitation_closing_message?: string | null;
  invitation_whatsapp_message?: string | null;
  invitation_music_path?: string | null;
  invitation_music_title?: string | null;
  invitation_music_enabled?: boolean;
  invitation_music_volume?: number;
  invitation_auto_play_on_open?: boolean;
  invitation_section_countdown?: boolean;
  invitation_section_story?: boolean;
  invitation_section_events?: boolean;
  invitation_section_document?: boolean;
  invitation_section_gallery?: boolean;
  invitation_section_livestream?: boolean;
  invitation_section_venues?: boolean;
  invitation_section_gift_draw?: boolean;
  invitation_gopuram_enabled?: boolean;
  invitation_gopuram_image_path?: string | null;
  groom_family_name?: string | null;
  bride_family_name?: string | null;
  family_heading?: string | null;
  family_invitation_message?: string | null;
  photo_access_enabled?: boolean;
  photo_access_heading?: string | null;
  photo_access_subheading?: string | null;
  photo_access_description?: string | null;
  photo_access_url?: string | null;
  photo_access_cta_label?: string | null;
  photo_access_supporting_text?: string | null;
  photo_access_qr_visible?: boolean;
  logo_path?: string | null;
  logo_header_enabled?: boolean;
  logo_mobile_floating_enabled?: boolean;
  logo_youtube_enabled?: boolean;
  logo_header_size?: number;
  logo_mobile_size?: number;
  logo_mobile_bottom?: number;
  logo_mobile_right?: number;
  hashtag?: string | null;
  hashtag_title?: string | null;
  hashtag_message?: string | null;
  hashtag_homepage_visible?: boolean;
  hashtag_invitation_visible?: boolean;
  updated_at?: string;
}

export interface AppSettings {
  registration_open: boolean;
  verification_enabled: boolean;
  winners_public: boolean;
  live_section_visible: boolean;
  consent_policy_version: string;
  consent_text: string;
}

export interface StoryEntry {
  id: string;
  chapter: string | null;
  title: string;
  date_label: string | null;
  entry_date: string | null;
  description: string | null;
  image_path: string | null;
  image_alt: string | null;
  secondary_image_path: string | null;
  secondary_image_alt: string | null;
  sort_order: number;
  is_published: boolean;
}

export interface Venue {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  notes: string | null;
}

export interface WeddingEvent {
  id: string;
  slug: string;
  event_type: EventType;
  name: string;
  short_description: string | null;
  description: string | null;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  time_period?: "morning" | "afternoon" | "evening" | "all_day" | null;
  time_label?: string | null;
  venue_id: string | null;
  dress_code: string | null;
  image_path: string | null;
  image_alt: string | null;
  invitation_image_path: string | null;
  invitation_pdf_path?: string | null;
  invitation_video_path: string | null;
  contact_info: string | null;
  sort_order: number;
  is_published: boolean;
  venue?: Venue | null;
}

export interface GalleryCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_published: boolean;
}

export interface GalleryMedia {
  id: string;
  category_id: string | null;
  media_type: MediaType;
  title: string | null;
  caption: string | null;
  alt_text: string | null;
  storage_path: string | null;
  thumbnail_path: string | null;
  width: number | null;
  height: number | null;
  video_source: VideoSource | null;
  video_url: string | null;
  is_featured: boolean;
  sort_order: number;
  is_published: boolean;
  is_ai_generated: boolean;
  is_placeholder: boolean;
  created_at: string;
}

export interface LiveStream {
  id: string;
  title: string;
  description: string | null;
  event_id: string | null;
  youtube_url: string | null;
  replay_url: string | null;
  scheduled_at: string | null;
  status: StreamStatus;
  sort_order: number;
  is_published: boolean;
  event?: Pick<WeddingEvent, "id" | "name" | "slug"> | null;
}

export interface Participant {
  id: string;
  full_name: string;
  mobile_number: string;
  normalized_mobile: string;
  email: string;
  normalized_email: string;
  gender: Gender;
  address: string;
  side: Side;
  consent: boolean;
  consent_timestamp: string;
  consent_policy_version: string;
  registration_status: RegistrationStatus;
  verification_status: VerificationStatus;
  registered_at: string;
  verified_at: string | null;
}

export interface Checkin {
  id: string;
  participant_id: string;
  verification_method: "common_qr_mobile_match" | "admin_manual";
  verified_at: string;
  verified_by: string | null;
  reason: string | null;
}

export interface LuckyDrawConfig {
  winner_count: number;
  eligibility_rule: EligibilityRule;
  event_id: string | null;
}

export interface LuckyDraw {
  id: string;
  event_id: string | null;
  status: "completed" | "voided";
  winner_count: number;
  eligibility_rule: EligibilityRule;
  eligible_count: number;
  executed_by: string;
  executed_at: string;
  voided_at: string | null;
  void_reason: string | null;
}

export interface LuckyDrawWinner {
  id: string;
  draw_id: string;
  participant_id: string;
  winner_position: number;
  public_display_name: string;
  gift_status: GiftStatus;
  gift_notes: string | null;
  participant?: Pick<Participant, "full_name" | "mobile_number" | "email" | "side"> | null;
}

export interface AuditLog {
  id: string;
  admin_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  reason: string | null;
  created_at: string;
}

export interface AdminProfile {
  user_id: string;
  full_name: string;
  role: AdminRole;
  is_active: boolean;
}

export interface DashboardStats {
  total_registered: number;
  total_cancelled: number;
  bride_registered: number;
  groom_registered: number;
  total_verified: number;
  total_pending: number;
  bride_verified: number;
  groom_verified: number;
  male_registered: number;
  female_registered: number;
  winner_count: number;
  failed_verifications_24h: number;
  rate_limited_24h: number;
}

export interface PublicWinners {
  status: "pending" | "announced";
  announced_at?: string;
  winners?: Array<{ position: number; display_name: string; side: Side }>;
}
