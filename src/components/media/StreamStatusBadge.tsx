import { STREAM_STATUS_LABEL } from "@/config/site";
import { cn } from "@/lib/utils/cn";
import type { StreamStatus } from "@/types/database";

export function StreamStatusBadge({ status, className }: { status: StreamStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-meta",
        status === "live" ? "border-secondary/40 text-secondary" : "border-soft-border text-secondary-text",
        className,
      )}
    >
      <span aria-hidden className="relative flex size-1.5">
        {status === "live" ? <span className="absolute inset-0 animate-ping rounded-full bg-secondary/60" /> : null}
        <span className={cn("relative size-1.5 rounded-full", status === "live" ? "bg-secondary" : status === "upcoming" ? "bg-champagne-gold" : "bg-muted-sage")} />
      </span>
      {STREAM_STATUS_LABEL[status]}
    </span>
  );
}
