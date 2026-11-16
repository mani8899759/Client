"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, Heart, Send, Share2, ArrowLeft } from "lucide-react";
import type { WeddingSettings } from "@/types/database";
import { coupleNames } from "@/lib/utils/names";

export function InvitationClosing({
  wedding,
  invitationUrl,
}: {
  wedding: WeddingSettings;
  invitationUrl: string;
}) {
  const names = coupleNames(wedding);
  const [copied, setCopied] = useState(false);

  const defaultShareText =
    wedding.invitation_whatsapp_message ||
    `You're warmly invited to celebrate the wedding of ${names.bride} & ${names.groom} on December 1, 2026. We would love to have you with us!`;

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
          title: `${names.bride} & ${names.groom} — Wedding Invitation`,
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
          className="mt-1 font-[family-name:var(--font-playfair)] text-[32px] font-bold text-[#3d1c00] sm:text-[44px]"
        >
          {wedding.invitation_closing_heading || "Your Presence Would Mean the World to Us"}
        </h2>

        <p className="mx-auto mt-4 max-w-[56ch] font-[family-name:var(--font-serif)] text-[19px] leading-relaxed text-[#5c4033] sm:text-[22px]">
          {wedding.invitation_closing_message ||
            "We look forward to celebrating this beautiful beginning with our family and friends. Your presence and blessings would make our celebration even more special."}
        </p>

        {/* Couple Signature */}
        <div className="mt-8 border-t border-b border-[#d4a843]/40 py-5">
          <p className="font-[family-name:var(--font-script)] text-[24px] text-[#5c4033]">
            With Love,
          </p>
          <div className="mt-1 font-[family-name:var(--font-playfair)] text-[26px] font-bold tracking-wide text-[#8b1a1a] sm:text-[32px]">
            {names.bride} &amp; {names.groom}
          </div>
          <p className="mt-1 text-[13px] tracking-widest text-[#7b6a58] uppercase">
            December 1, 2026
          </p>
        </div>

        {/* WhatsApp & Invitation Sharing Card */}
        <div className="mt-10 rounded-[14px] border border-[#d4a843]/50 bg-[#fffcf7] p-6 shadow-xs sm:p-8">
          <h3 className="font-[family-name:var(--font-playfair)] text-[20px] font-semibold text-[#3d1c00]">
            Share Our Wedding Invitation
          </h3>
          <p className="mt-1 text-[13px] text-[#7b6a58]">
            Forward this digital invitation to your loved ones via WhatsApp or copy the link.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {/* WhatsApp button - distinct green accent as specified */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#25d366] px-5 py-2.5 text-[14px] font-medium text-white shadow-xs transition-colors hover:bg-[#20ba59]"
            >
              <Send className="size-4" />
              <span>Share on WhatsApp</span>
            </a>

            {/* Native device share */}
            {typeof navigator !== "undefined" && typeof navigator.share === "function" ? (
              <button
                type="button"
                onClick={() => void handleNativeShare()}
                className="inline-flex items-center gap-2 rounded-[8px] border border-[#d4a843] bg-transparent px-5 py-2.5 text-[14px] font-medium text-[#3d1c00] hover:bg-[#d4a843]/15"
              >
                <Share2 className="size-4" />
                <span>Share</span>
              </button>
            ) : null}

            {/* Copy Link */}
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#d4a843] bg-[#fffcf7] px-5 py-2.5 text-[14px] font-medium text-[#3d1c00] shadow-2xs hover:bg-[#f5ebd5]"
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
