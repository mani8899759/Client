import { mediaUrl } from "./media";
import { getYouTubeId, youTubeThumbnail } from "@/lib/utils/youtube";
import type { GalleryMedia } from "@/types/database";

/** Thumbnail URL for a gallery item: the photo itself, a custom video thumbnail, or YouTube's poster. */
export function thumbnailFor(item: Pick<GalleryMedia, "media_type" | "storage_path" | "thumbnail_path" | "video_source" | "video_url">): string | null {
  if (item.media_type === "photo") return mediaUrl(item.storage_path);
  if (item.thumbnail_path) return mediaUrl(item.thumbnail_path);
  const id = item.video_source === "youtube" ? getYouTubeId(item.video_url) : null;
  return id ? youTubeThumbnail(id) : null;
}
