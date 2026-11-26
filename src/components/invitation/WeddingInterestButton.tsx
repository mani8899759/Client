"use client";

import { useEffect, useState } from "react";
import { Heart, Check } from "lucide-react";

const STORAGE_KEY = "manikanta_sravika_guest_interest_status";

type GuestStatus = "idle" | "interested" | "declined";

export function WeddingInterestButton({ className = "" }: { className?: string }) {
  const [status, setStatus] = useState<GuestStatus>("idle");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as GuestStatus | null;
      if (stored === "interested") {
        setStatus("interested");
      }
    } catch {}
  }, []);

  async function handleInterestedClick() {
    if (status === "interested" || loading) return;

    setLoading(true);
    setStatus("interested");

    try {
      localStorage.setItem(STORAGE_KEY, "interested");
    } catch {}

    try {
      await fetch("/api/public/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      // Non-blocking
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`mt-6 flex w-full justify-center ${className}`}>
      {status === "interested" ? (
        <div
          role="status"
          aria-live="polite"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#d4a843]/70 bg-[#fffcf7] px-6 py-2 text-[14px] font-medium text-[#3d1c00]"
        >
          <Check className="size-4 shrink-0 text-[#8b1a1a]" strokeWidth={2.5} aria-hidden />
          <span>Thank you for your interest!</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => void handleInterestedClick()}
          disabled={loading}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#d4a843] bg-[#8b1a1a] px-7 py-2.5 text-[14px] font-medium text-[#fdf5e6] transition-colors hover:bg-[#721515] active:scale-[0.98] cursor-pointer"
        >
          <Heart className="size-4 fill-[#fdf5e6] text-[#fdf5e6]" aria-hidden />
          <span>Interested</span>
        </button>
      )}
    </div>
  );
}
