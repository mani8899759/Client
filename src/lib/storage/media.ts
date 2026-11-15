import { publicEnv } from "@/lib/env";

/**
 * Storage conventions shared by public pages and the admin CMS.
 * A stored media reference is "<bucket>/<purpose>/<yyyy>/<uuid>.<ext>".
 */
export const BUCKETS = { images: "wedding-images", videos: "wedding-videos" } as const;
export type MediaPurpose = "hero" | "story" | "events" | "invitations" | "gallery";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const DOCUMENT_TYPES = ["application/pdf"] as const;
export const VIDEO_TYPES = ["video/mp4"] as const;
export const AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/aac", "audio/x-m4a", "audio/mp4", "audio/ogg"] as const;
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
export const MAX_PDF_BYTES = 25 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
export const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
  "video/mp4": "mp4",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/aac": "aac",
  "audio/x-m4a": "m4a",
  "audio/mp4": "m4a",
  "audio/ogg": "ogg",
};

export function validateMediaFile(file: { type: string; size: number }, kind: "image" | "video" | "pdf" | "audio"): string | null {
  if (kind === "pdf") {
    if (file.type !== "application/pdf") return "Use a PDF document.";
    if (file.size > MAX_PDF_BYTES) return `PDF is larger than ${Math.round(MAX_PDF_BYTES / 1024 / 1024)} MB.`;
    if (file.size === 0) return "File is empty.";
    return null;
  }
  if (kind === "audio") {
    if (!AUDIO_TYPES.includes(file.type as (typeof AUDIO_TYPES)[number])) {
      return "Use an MP3, M4A, AAC, WAV or OGG audio file.";
    }
    if (file.size > MAX_AUDIO_BYTES) return `Audio is larger than ${Math.round(MAX_AUDIO_BYTES / 1024 / 1024)} MB.`;
    if (file.size === 0) return "File is empty.";
    return null;
  }
  const types: readonly string[] = kind === "image" ? IMAGE_TYPES : VIDEO_TYPES;
  if (!types.includes(file.type as (typeof IMAGE_TYPES)[number])) {
    return kind === "image" ? "Use a JPG, PNG or WebP image." : "Use an MP4 video.";
  }
  const max = kind === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (file.size > max) return `File is larger than ${Math.round(max / 1024 / 1024)} MB.`;
  if (file.size === 0) return "File is empty.";
  return null;
}

export function buildObjectPath(purpose: MediaPurpose, mime: string): string {
  const ext = EXT[mime] ?? "bin";
  return `${purpose}/${new Date().getUTCFullYear()}/${crypto.randomUUID()}.${ext}`;
}

const STORAGE_REF = /^(wedding-images|wedding-videos)\/[a-z]+\/\d{4}\/[0-9a-f-]{36}\.(jpg|png|webp|mp4|pdf|mp3|wav|m4a|aac|ogg)$/;
/** Repository-bundled AI illustrations, served from /public/images/ai. */
const STATIC_AI_REF = /^static\/ai\/[a-z0-9]+(-[a-z0-9]+)*\.(webp|avif|jpg|png|pdf|mp3)$/;

export function isStorageRef(ref: string | null | undefined): ref is string {
  return !!ref && STORAGE_REF.test(ref);
}

/** AI-generated illustrative asset (never a real photograph of the couple). */
export function isAiRef(ref: string | null | undefined): ref is string {
  return !!ref && STATIC_AI_REF.test(ref);
}

export function isValidMediaRef(ref: string | null | undefined): ref is string {
  return isStorageRef(ref) || isAiRef(ref);
}

/** Public URL for a media reference (Supabase Storage, bundled AI asset, or absolute/relative URL), or null. */
export function mediaUrl(ref: string | null | undefined): string | null {
  if (!ref) return null;
  if (ref.startsWith("http://") || ref.startsWith("https://") || ref.startsWith("/")) return ref;
  if (isAiRef(ref)) return `/images/ai/${ref.slice("static/ai/".length)}`;
  if (!isStorageRef(ref) || !publicEnv.supabaseUrl) return null;
  return `${publicEnv.supabaseUrl}/storage/v1/object/public/${ref}`;
}

export function splitMediaRef(ref: string): { bucket: string; path: string } {
  const i = ref.indexOf("/");
  return { bucket: ref.slice(0, i), path: ref.slice(i + 1) };
}
