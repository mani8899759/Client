"use client";

import { useEffect, useState } from "react";
import { Sparkles, Calendar } from "lucide-react";
import type { WeddingSettings } from "@/types/database";
import { weddingSchedule } from "@/lib/utils/wedding";
import { remainingUntil } from "@/components/countdown/countdown-math";
import { AUTHORITATIVE_WEDDING_CONFIG } from "@/lib/wedding-config";
import { WeddingInterestButton } from "./WeddingInterestButton";

export function InvitationCountdown({ wedding }: { wedding: WeddingSettings }) {
  const schedule = weddingSchedule(wedding);
  const targetTime = schedule ? new Date(schedule.targetIso).getTime() : AUTHORITATIVE_WEDDING_CONFIG.targetTimestamp;
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const r = now === null ? null : remainingUntil(targetTime, now);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section aria-labelledby="countdown-heading" className="py-12 sm:py-16">
      <div className="mx-auto max-w-[760px] px-4 text-center sm:px-6">
        <div className="rounded-[16px] border-2 border-[#d4a843]/50 bg-[#fffcf7] p-8 shadow-[0_8px_30px_rgba(139,26,26,0.06)] sm:p-10">
          <p className="font-[family-name:var(--font-script)] text-[26px] text-[#8b1a1a]">
            Counting Down to Forever
          </p>

          <h2 id="countdown-heading" className="mt-1 font-[family-name:var(--font-playfair)] text-[26px] font-bold text-[#3d1c00] sm:text-[34px]">
            {schedule?.dateOnlyLabel ?? AUTHORITATIVE_WEDDING_CONFIG.weddingDateDisplay}
          </h2>

          <div className="mx-auto my-6 grid grid-cols-4 gap-1.5 xs:gap-2 sm:gap-4">
            {/* Days */}
            <div className="flex flex-col items-center rounded-[8px] sm:rounded-[10px] border border-[#e5d5bd] bg-[#f5ebd5]/60 p-2 xs:p-3 sm:p-4">
              <span className="font-[family-name:var(--font-playfair)] text-[22px] xs:text-[28px] font-bold text-[#8b1a1a] sm:text-[42px]">
                {r ? pad(r.days) : "--"}
              </span>
              <span className="mt-1 text-[9px] xs:text-[11px] tracking-wider text-[#5c4033] uppercase font-medium sm:text-[13px]">
                Days
              </span>
            </div>

            {/* Hours */}
            <div className="flex flex-col items-center rounded-[8px] sm:rounded-[10px] border border-[#e5d5bd] bg-[#f5ebd5]/60 p-2 xs:p-3 sm:p-4">
              <span className="font-[family-name:var(--font-playfair)] text-[22px] xs:text-[28px] font-bold text-[#8b1a1a] sm:text-[42px]">
                {r ? pad(r.hours) : "--"}
              </span>
              <span className="mt-1 text-[9px] xs:text-[11px] tracking-wider text-[#5c4033] uppercase font-medium sm:text-[13px]">
                Hours
              </span>
            </div>

            {/* Minutes */}
            <div className="flex flex-col items-center rounded-[8px] sm:rounded-[10px] border border-[#e5d5bd] bg-[#f5ebd5]/60 p-2 xs:p-3 sm:p-4">
              <span className="font-[family-name:var(--font-playfair)] text-[22px] xs:text-[28px] font-bold text-[#8b1a1a] sm:text-[42px]">
                {r ? pad(r.minutes) : "--"}
              </span>
              <span className="mt-1 text-[9px] xs:text-[11px] tracking-wider text-[#5c4033] uppercase font-medium sm:text-[13px]">
                Minutes
              </span>
            </div>

            {/* Seconds */}
            <div className="flex flex-col items-center rounded-[8px] sm:rounded-[10px] border border-[#e5d5bd] bg-[#f5ebd5]/60 p-2 xs:p-3 sm:p-4">
              <span className="font-[family-name:var(--font-playfair)] text-[22px] xs:text-[28px] font-bold text-[#8b1a1a] sm:text-[42px]">
                {r ? pad(r.seconds) : "--"}
              </span>
              <span className="mt-1 text-[9px] xs:text-[11px] tracking-wider text-[#5c4033] uppercase font-medium sm:text-[13px]">
                Seconds
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[13px] text-[#7b6a58]">
            <Calendar className="size-4 text-[#8b1a1a]" />
            <span>Eco Villagio Resorts, Hyderabad · &apos;P&apos; Conventions, Visakhapatnam</span>
          </div>

          {/* Interactive "I Am Interested" Button with Live Guest Counter */}
          <WeddingInterestButton />
        </div>
      </div>
    </section>
  );
}
