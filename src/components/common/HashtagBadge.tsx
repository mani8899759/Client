"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface HashtagBadgeProps {
  hashtag?: string;
  className?: string;
  variant?: "default" | "invitation" | "footer";
}

export function HashtagBadge({
  hashtag = "#Kanmani",
  className,
  variant = "default",
}: HashtagBadgeProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(hashtag);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = hashtag;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  if (variant === "footer") {
    return (
      <button
        type="button"
        onClick={() => void copyToClipboard()}
        aria-label={`Copy hashtag ${hashtag}`}
        title="Click to copy hashtag"
        className={cn(
          "group inline-flex items-center gap-1.5 rounded-full border border-champagne-gold/40 bg-dark-walnut/90 px-3 py-1 font-serif text-[15px] font-medium tracking-wide text-champagne-gold transition-all hover:border-champagne-gold hover:bg-dark-walnut active:scale-95 cursor-pointer",
          className
        )}
      >
        <span>{hashtag}</span>
        {copied ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-sans text-emerald-400">
            <Check className="size-3" /> Copied!
          </span>
        ) : (
          <Copy className="size-3 text-champagne-gold/70 transition-opacity group-hover:opacity-100" />
        )}
      </button>
    );
  }

  if (variant === "invitation") {
    return (
      <button
        type="button"
        onClick={() => void copyToClipboard()}
        aria-label={`Copy hashtag ${hashtag}`}
        title="Click to copy hashtag"
        className={cn(
          "group relative inline-flex items-center gap-2 rounded-full border border-[#d4a843] bg-[#fffcf7] px-4 py-1.5 font-[family-name:var(--font-playfair)] text-[17px] font-bold tracking-wider text-[#8b1a1a] shadow-xs transition-all hover:bg-[#fdf5e6] hover:border-[#8b1a1a] active:scale-95 cursor-pointer sm:text-[19px]",
          className
        )}
      >
        <span>{hashtag}</span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-sans text-[11px] font-medium tracking-normal transition-all",
            copied
              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
              : "bg-[#f5ebd5] text-[#996515] group-hover:bg-[#ecdcb9]"
          )}
        >
          {copied ? (
            <>
              <Check className="size-3 text-emerald-600" />
              <span>Hashtag copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3 text-[#996515]" />
              <span>Copy</span>
            </>
          )}
        </span>
      </button>
    );
  }

  // Default variant (e.g. PhotoAccess section on homepage)
  return (
    <button
      type="button"
      onClick={() => void copyToClipboard()}
      aria-label={`Copy hashtag ${hashtag}`}
      title="Click to copy hashtag"
      className={cn(
        "group relative inline-flex items-center gap-2.5 rounded-full border border-champagne-gold bg-card-surface px-4 py-1.5 font-serif text-[18px] font-semibold tracking-wide text-primary shadow-xs transition-all hover:bg-soft-cream hover:border-primary active:scale-95 cursor-pointer sm:text-[20px]",
        className
      )}
    >
      <span>{hashtag}</span>
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-sans text-[12px] font-medium tracking-normal transition-all",
          copied
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-warm-ivory text-muted-gold group-hover:bg-soft-cream group-hover:text-dark-walnut"
        )}
      >
        {copied ? (
          <>
            <Check className="size-3 text-emerald-600" />
            <span>Hashtag copied!</span>
          </>
        ) : (
          <>
            <Copy className="size-3" />
            <span>Copy</span>
          </>
        )}
      </span>
    </button>
  );
}
