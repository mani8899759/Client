"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, Gift, Heart, Send, Share2, Sparkles } from "lucide-react";
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
      // Fallback
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
    <section aria-labelledby="closing-heading" className="py-16 sm:py-24 bg-[#fdf5e6]">
      <div className="mx-auto max-w-[800px] px-4 text-center sm:px-6">
        {/* Decorative heart icon */}
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#f5ebd5] text-[#8b1a1a]">
          <Heart className="size-7 fill-[#8b1a1a]" strokeWidth={1.5} />
        </div>

        <p className="font-[family-name:var(--font-script)] text-[30px] text-[#8b1a1a] sm:text-[36px]">
          With Gratitude &amp; Love
        </p>

        <h2 id="closing-heading" className="mt-1 font-[family-name:var(--font-playfair)] text-[32px] font-bold text-[#3d1c00] sm:text-[44px]">
          {wedding.invitation_closing_heading || "Your Presence Would Mean the World to Us"}
        </h2>

        <p className="mx-auto mt-4 max-w-[58ch] font-[family-name:var(--font-serif)] text-[19px] leading-relaxed text-[#5c4033] sm:text-[21px]">
          {wedding.invitation_closing_message ||
            "We look forward to celebrating this special beginning with our family and friends. We would be delighted to have you with us."}
        </p>

        <div className="mt-4 font-[family-name:var(--font-playfair)] text-[22px] font-semibold text-[#8b1a1a]">
          {names.bride} &amp; {names.groom}
        </div>
        <p className="text-[13px] tracking-widest text-[#7b6a58] uppercase">December 1, 2026</p>

        {/* Gift Draw CTA */}
        {wedding.invitation_section_gift_draw !== false ? (
          <div className="mx-auto mt-10 max-w-[540px] rounded-[16px] border-2 border-[#d4a843]/60 bg-[#fffcf7] p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-center gap-2 text-[#8b1a1a]">
              <Gift className="size-5" />
              <span className="font-[family-name:var(--font-playfair)] text-[18px] font-semibold">
                Wedding Celebration Gift Draw
              </span>
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-[#7b6a58]">
              Register your attendance and participate in our special wedding gift draw for a chance to receive a commemorative keepsake.
            </p>
            <div className="mt-5">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#8b1a1a] px-8 py-3.5 text-[15px] font-medium tracking-[0.04em] text-[#fdf5e6] shadow-sm transition-all hover:bg-[#721515] hover:shadow-md active:scale-98"
              >
                <span>Win a Special Gift</span>
              </Link>
            </div>
            <p className="mt-2 text-[11px] text-[#7b6a58]">
              Open to both Bride Side &amp; Groom Side guests.
            </p>
          </div>
        ) : null}

        {/* WhatsApp & Sharing Actions */}
        <div className="mt-12 rounded-[14px] border border-[#e5d5bd] bg-[#f5ebd5]/40 p-6 sm:p-8">
          <h3 className="font-[family-name:var(--font-playfair)] text-[20px] font-semibold text-[#3d1c00]">
            Share Invitation with Family &amp; Friends
          </h3>
          <p className="mt-1 text-[13px] text-[#7b6a58]">
            Forward our wedding details directly over WhatsApp or copy the digital link.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {/* WhatsApp button - styled green accent as specified in reference */}
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

        {/* Back to main wedding website */}
        <div className="mt-12">
          <Link
            href="/"
            className="text-[14px] font-medium text-[#8b1a1a] underline decoration-[#d4a843] underline-offset-4 hover:text-[#721515]"
          >
            ← Return to Main Wedding Website
          </Link>
        </div>
      </div>
    </section>
  );
}
