"use client";

import { useEffect, useState } from "react";
import { AUTHORITATIVE_WEDDING_CONFIG } from "@/lib/wedding-config";
import { remainingUntil } from "./countdown-math";

/**
 * Standard reusable wedding countdown component implementing the authoritative
 * countdown calculation targeting Sunday, December 13, 2026.
 */
export function WeddingCountdown({
  targetTimestamp = AUTHORITATIVE_WEDDING_CONFIG.targetTimestamp,
  dateLabel = AUTHORITATIVE_WEDDING_CONFIG.weddingDateDisplay,
  className = "",
}: {
  targetTimestamp?: number;
  dateLabel?: string;
  className?: string;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const r = now === null ? null : remainingUntil(targetTimestamp, now);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className={`text-center ${className}`}>
      <p className="font-serif text-[18px] text-muted-gold tracking-widest uppercase">
        {dateLabel}
      </p>
      <div className="mt-4 flex items-center justify-center gap-4 sm:gap-8">
        <div className="flex flex-col items-center">
          <span className="font-serif text-3xl sm:text-5xl font-bold text-dark-walnut">
            {r ? pad(r.days) : "--"}
          </span>
          <span className="text-xs uppercase tracking-wider text-secondary-text">Days</span>
        </div>
        <span className="text-2xl text-muted-gold/60">:</span>
        <div className="flex flex-col items-center">
          <span className="font-serif text-3xl sm:text-5xl font-bold text-dark-walnut">
            {r ? pad(r.hours) : "--"}
          </span>
          <span className="text-xs uppercase tracking-wider text-secondary-text">Hours</span>
        </div>
        <span className="text-2xl text-muted-gold/60">:</span>
        <div className="flex flex-col items-center">
          <span className="font-serif text-3xl sm:text-5xl font-bold text-dark-walnut">
            {r ? pad(r.minutes) : "--"}
          </span>
          <span className="text-xs uppercase tracking-wider text-secondary-text">Minutes</span>
        </div>
        <span className="text-2xl text-muted-gold/60">:</span>
        <div className="flex flex-col items-center">
          <span className="font-serif text-3xl sm:text-5xl font-bold text-dark-walnut">
            {r ? pad(r.seconds) : "--"}
          </span>
          <span className="text-xs uppercase tracking-wider text-secondary-text">Seconds</span>
        </div>
      </div>
    </div>
  );
}
