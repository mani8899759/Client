"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, Heart, Send, Share2, ArrowLeft } from "lucide-react";
import type { WeddingSettings } from "@/types/database";
import { coupleNames } from "@/lib/utils/names";
import { weddingSchedule } from "@/lib/utils/wedding";
import { HashtagBadge } from "@/components/common/HashtagBadge";

export function InvitationClosing({
  wedding,
  invitationUrl,
}: {
  wedding: WeddingSettings;
  invitationUrl: string;
}) {
  const names = coupleNames(wedding);
  const schedule = weddingSchedule(wedding);
  const dateLabel = schedule?.dateOnlyLabel ?? "December 13, 2026";
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      const raf = requestAnimationFrame(() => setCanShare(true));
      return () => cancelAnimationFrame(raf);
    }
  }, []);

  const defaultShareText =
    wedding.invitation_whatsapp_message ||
    `You're warmly invited to celebrate the wedding of ${names.groom} & ${names.bride} on ${dateLabel}. We would love to have you with us!`;

  const shareTextWithUrl = `${defaultShareText}\n${invitationUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTextWithUrl)}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  async function handleNativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${names.groom} & ${names.bride} — Wedding Invitation`,
          text: defaultShareText,
          url: invitationUrl,
        });
      } catch {
        // User dismissed share dialog
      }
    } else {
      void handleCopy();
    }
  }

  return (
    <section aria-labelledby="closing-heading" className="pt-16 pb-12 sm:pt-24 sm:pb-16 bg-[#fdf5e6]">
      <div className="mx-auto max-w-[760px] px-4 text-center sm:px-6">
        {/* Heart motif */}
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#f5ebd5] text-[#8b1a1a]">
          <Heart className="size-7 fill-[#8b1a1a]" strokeWidth={1.5} />
        </div>

        <p className="font-[family-name:var(--font-script)] text-[30px] text-[#8b1a1a] sm:text-[38px]">
          With Gratitude &amp; Joy
        </p>

        <h2
          id="closing-heading"
          className="mt-1 mb-8 font-[family-name:var(--font-playfair)] text-[32px] font-bold text-[#3d1c00] sm:mb-10 sm:text-[44px]"
        >
          {wedding.invitation_closing_heading || "Your Presence Would Mean the World to Us"}
        </h2>

        {/* Couple Signature */}
        <div className="border-t border-b border-[#d4a843]/40 py-5">
          <p className="font-[family-name:var(--font-script)] text-[24px] text-[#5c4033]">
            With Love,
          </p>
          <div className="mt-1 font-[family-name:var(--font-playfair)] text-[26px] font-bold tracking-wide text-[#8b1a1a] sm:text-[32px]">
            {names.groom} &amp; {names.bride}
          </div>
          <p className="mt-1 text-[13px] tracking-widest text-[#7b6a58] uppercase">
            {dateLabel}
          </p>
        </div>

        {/* Official Wedding Hashtag */}
        {wedding.hashtag_invitation_visible !== false ? (
          <div className="mt-7 flex flex-col items-center">
            <p className="font-sans text-[11px] font-semibold tracking-[0.2em] text-[#996515] uppercase">
              {wedding.hashtag_title || "Celebrate With Us"}
            </p>
            <div className="mt-2.5">
              <HashtagBadge
                hashtag={wedding.hashtag || "#Kanmani"}
                variant="invitation"
              />
            </div>
            <p className="mt-2 max-w-[44ch] font-[family-name:var(--font-serif)] text-[15px] italic text-[#7b6a58]">
              {wedding.hashtag_message || "Share your favourite moments from our celebrations with our wedding hashtag."}
            </p>
          </div>
        ) : null}

        {/* WhatsApp & Invitation Sharing Card */}
        <div className="mt-10 rounded-[14px] border border-[#d4a843]/50 bg-[#fffcf7] p-6 shadow-xs sm:p-8">
          <h3 className="font-[family-name:var(--font-playfair)] text-[20px] font-semibold text-[#3d1c00]">
            Share Our Wedding Invitation
          </h3>
          <p className="mt-1 text-[13px] text-[#7b6a58]">
            Forward this digital invitation to your loved ones via WhatsApp or copy the link.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3">
            {/* WhatsApp button - distinct green accent as specified */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-[8px] bg-[#25d366] px-5 py-3 sm:py-2.5 text-[14px] font-medium text-white shadow-xs transition-colors hover:bg-[#20ba59]"
            >
              <Send className="size-4" />
              <span>Share on WhatsApp</span>
            </a>

            {/* Native device share */}
            {canShare ? (
              <button
                type="button"
                onClick={() => void handleNativeShare()}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-[8px] border border-[#d4a843] bg-transparent px-5 py-3 sm:py-2.5 text-[14px] font-medium text-[#3d1c00] hover:bg-[#d4a843]/15 cursor-pointer"
              >
                <Share2 className="size-4" />
                <span>Share</span>
              </button>
            ) : null}

            {/* Copy Link */}
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-[8px] border border-[#d4a843] bg-[#fffcf7] px-5 py-3 sm:py-2.5 text-[14px] font-medium text-[#3d1c00] shadow-2xs hover:bg-[#f5ebd5] cursor-pointer"
            >
              {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
              <span>{copied ? "Link Copied!" : "Copy Link"}</span>
            </button>
          </div>
        </div>

        {/* Back to main wedding website link */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[14px] font-medium text-[#8b1a1a] underline decoration-[#d4a843] underline-offset-4 hover:text-[#721515]"
          >
            <ArrowLeft className="size-4" />
            <span>Return to Main Wedding Website</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
