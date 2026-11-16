import Link from "next/link";
import { Gift, Sparkles } from "lucide-react";
import type { WeddingSettings } from "@/types/database";
import { TraditionalMotifDivider } from "./TraditionalMotifDivider";
import { MandalaDecoration } from "./MandalaDecoration";

export function InvitationGiftSection({ wedding }: { wedding: WeddingSettings }) {
  if (wedding.invitation_section_gift_draw === false) return null;

  return (
    <section aria-labelledby="invitation-gift-heading" className="relative overflow-hidden py-16 sm:py-20 bg-[#fdf5e6]">
      <div className="absolute top-1/2 left-4 -translate-y-1/2">
        <MandalaDecoration size={180} opacity={0.10} />
      </div>

      <div className="relative z-10 mx-auto max-w-[720px] px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[20px] border-2 border-[#d4a843]/70 bg-[#fffcf7] p-8 text-center shadow-[0_10px_35px_rgba(139,26,26,0.08)] sm:p-12">
          {/* Decorative Corner Flairs */}
          <div className="pointer-events-none absolute top-3 left-3 size-6 border-t-2 border-l-2 border-[#d4a843]" />
          <div className="pointer-events-none absolute top-3 right-3 size-6 border-t-2 border-r-2 border-[#d4a843]" />
          <div className="pointer-events-none absolute bottom-3 left-3 size-6 border-b-2 border-l-2 border-[#d4a843]" />
          <div className="pointer-events-none absolute bottom-3 right-3 size-6 border-b-2 border-r-2 border-[#d4a843]" />

          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#f5ebd5] text-[#8b1a1a]">
            <Gift className="size-7" />
          </div>

          <p className="font-[family-name:var(--font-script)] text-[26px] text-[#8b1a1a] sm:text-[32px]">
            Guest Appreciation
          </p>

          <h2
            id="invitation-gift-heading"
            className="mt-1 font-[family-name:var(--font-playfair)] text-[32px] font-bold text-[#3d1c00] sm:text-[40px]"
          >
            Join Our Celebration
          </h2>

          <div className="mx-auto my-3 max-w-[280px]">
            <TraditionalMotifDivider size="sm" />
          </div>

          <p className="mx-auto mt-2 max-w-[48ch] font-[family-name:var(--font-serif)] text-[18px] leading-relaxed text-[#5c4033] sm:text-[21px]">
            Be part of our special day and take a chance to win a special gift. Register your details to participate in our commemorative wedding celebration draw.
          </p>

          <div className="mt-8">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2.5 rounded-[8px] border border-[#d4a843] bg-[#8b1a1a] px-9 py-4 text-[16px] font-medium tracking-[0.04em] text-[#fdf5e6] shadow-[0_4px_16px_rgba(139,26,26,0.25)] transition-all duration-300 hover:bg-[#721515] hover:shadow-[0_6px_24px_rgba(139,26,26,0.35)] active:scale-98"
            >
              <Sparkles className="size-4 text-[#d4a843] transition-transform group-hover:rotate-12" />
              <span>Win a Special Gift</span>
            </Link>
          </div>

          <p className="mt-3 text-[12px] text-[#7b6a58]">
            Open to all registered Bride Side &amp; Groom Side guests.
          </p>
        </div>
      </div>
    </section>
  );
}
