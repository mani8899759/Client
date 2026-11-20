"use client";

import { useEffect, useState } from "react";
import { Heart, Check, Users, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "manikanta_sravika_guest_interest_status";
const DEFAULT_INITIAL_COUNT = 142;

type GuestStatus = "idle" | "interested" | "declined";

export function WeddingInterestButton({ className = "" }: { className?: string }) {
  const [status, setStatus] = useState<GuestStatus>("idle");
  const [count, setCount] = useState<number>(DEFAULT_INITIAL_COUNT);
  const [loading, setLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as GuestStatus | null;
      if (stored === "interested" || stored === "declined") {
        setStatus(stored);
      }
    } catch {}

    void fetch("/api/public/interest")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { count?: number } | null) => {
        if (data && typeof data.count === "number") {
          setCount(data.count);
        }
      })
      .catch(() => {});
  }, []);

  async function handleInterestedClick() {
    if (status === "interested" || loading) return;

    setLoading(true);
    setStatus("interested");
    setCount((prev) => prev + 1);

    try {
      localStorage.setItem(STORAGE_KEY, "interested");
    } catch {}

    try {
      const res = await fetch("/api/public/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = (await res.json()) as { count?: number };
        if (data && typeof data.count === "number") {
          setCount(data.count);
        }
      }
    } catch {} finally {
      setLoading(false);
    }
  }

  function handleDeclineClick() {
    // Cross mark: do NOT increment count
    setStatus("declined");
    try {
      localStorage.setItem(STORAGE_KEY, "declined");
    } catch {}
  }

  return (
    <div className={`mt-6 w-full ${className}`}>
      {/* Live Counter Display */}
      <div className="flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#d4a843]/50 bg-[#f5ebd5]/70 px-4 py-1.5 text-[12px] font-medium text-[#5c4033] shadow-2xs sm:text-[13px]">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
          </span>
          <Users className="size-3.5 text-[#8b1a1a]" />
          <span>
            <strong className="font-semibold text-[#8b1a1a]">{mounted ? count : DEFAULT_INITIAL_COUNT}</strong> People Coming / Interested
          </span>
        </div>

        {/* Action Buttons & Confirmation States */}
        <div className="mt-3.5 min-h-[46px] w-full max-w-[360px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {status === "idle" ? (
              <motion.div
                key="idle-buttons"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className="flex w-full items-center justify-center gap-2"
              >
                {/* Primary Interested Button */}
                <button
                  type="button"
                  onClick={() => void handleInterestedClick()}
                  disabled={loading}
                  className="group relative flex flex-1 items-center justify-center gap-2 rounded-full border border-[#d4a843] bg-gradient-to-r from-[#8b1a1a] via-[#9e1c1c] to-[#8b1a1a] px-5 py-2.5 text-[14px] font-semibold text-[#fdf5e6] shadow-[0_4px_16px_rgba(139,26,26,0.25)] transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Heart className="size-4 fill-[#fdf5e6] text-[#fdf5e6] transition-transform duration-300 group-hover:scale-125" />
                  <span>I Am Interested</span>
                </button>

                {/* Cross / Wrong Mark Button (does not count) */}
                <button
                  type="button"
                  onClick={handleDeclineClick}
                  className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#d4a843]/50 bg-[#f5ebd5]/70 text-[#7b6a58] transition-colors hover:border-[#8b1a1a] hover:bg-rose-50 hover:text-rose-700"
                  aria-label="Cannot attend / Cross out"
                  title="Cannot attend (will not be counted)"
                >
                  <X className="size-4" strokeWidth={2.2} />
                </button>
              </motion.div>
            ) : status === "interested" ? (
              /* Green Tick Mark Confirmation */
              <motion.div
                key="interested-confirmed"
                initial={{ opacity: 0, y: 8, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-emerald-600/40 bg-emerald-50/90 px-5 py-2.5 text-[13px] font-medium text-emerald-800 shadow-2xs sm:text-[14px]"
              >
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <Check className="size-3 stroke-[3]" />
                </div>
                <span>✓ I Am Interested — Looking forward to seeing you!</span>
              </motion.div>
            ) : (
              /* Declined / Cross mark state */
              <motion.div
                key="declined-confirmed"
                initial={{ opacity: 0, y: 8, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="flex items-center gap-2 rounded-full border border-stone-300 bg-stone-100 px-4 py-2 text-[12px] font-medium text-stone-600"
              >
                <X className="size-3.5 text-stone-500" strokeWidth={2.5} />
                <span>Marked as unable to attend (not counted)</span>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="ml-1 text-[11px] font-semibold text-[#8b1a1a] underline"
                >
                  Change
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {status === "idle" ? (
          <p className="mt-2 text-[11px] text-[#7b6a58] sm:text-[12px]">
            Tap to confirm your interest, or tap cross if unable to attend.
          </p>
        ) : null}
      </div>
    </div>
  );
}
