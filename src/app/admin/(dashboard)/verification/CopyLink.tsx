"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-[var(--radius-control)] border border-soft-border bg-soft-cream px-3 py-2">
      <code className="min-w-0 flex-1 truncate text-[13px] text-dark-walnut">{url}</code>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          } catch {
            /* clipboard unavailable */
          }
        }}
        className="flex size-8 shrink-0 items-center justify-center rounded-[4px] text-secondary-text hover:bg-card-surface hover:text-dark-walnut"
      >
        {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" strokeWidth={1.5} aria-hidden />}
        <span className="sr-only">{copied ? "Copied" : "Copy verification link"}</span>
      </button>
    </div>
  );
}
