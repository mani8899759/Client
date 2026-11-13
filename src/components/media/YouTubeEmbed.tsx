import { getYouTubeId, youTubeEmbedUrl } from "@/lib/utils/youtube";
import { cn } from "@/lib/utils/cn";

/** Privacy-enhanced YouTube embed (youtube-nocookie). Renders nothing for an invalid URL. */
export function YouTubeEmbed({ url, title, className }: { url: string | null | undefined; title: string; className?: string }) {
  const id = getYouTubeId(url);
  if (!id) return null;
  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-[var(--radius-control)] bg-dark-walnut", className)}>
      <iframe
        src={youTubeEmbedUrl(id)}
        title={title}
        loading="lazy"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
