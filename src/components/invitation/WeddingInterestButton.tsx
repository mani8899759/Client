"use client";

import { useEffect, useState } from "react";
import { Heart, Sparkles, Check, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "manikanta_sravika_interested_submitted";
const DEFAULT_INITIAL_COUNT = 142;

export function WeddingInterestButton({ className = "" }: { className?: string }) {
  const [hasExpressedInterest, setHasExpressedInterest] = useState<boolean>(false);
  const [count, setCount] = useState<number>(DEFAULT_INITIAL_COUNT);
  const [loading, setLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    // Check if user already submitted interest from this device
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "true") {
        setHasExpressedInterest(true);
      }
    } catch {
      // LocalStorage access may fail in private mode
    }

    // Fetch latest live counter from server
    void fetch("/api/public/interest")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { count?: number } | null) => {
        if (data && typeof data.count === "number") {
          setCount(data.count);
        }
      })
      .catch(() => {
        // Fallback to default
      });
  }, []);

  async function handleInterestedClick() {
    if (hasExpressedInterest || loading) return;

    setLoading(true);
    // Optimistically update UI
    setHasExpressedInterest(true);
    setCount((prev) => prev + 1);

    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Ignore storage errors
    }

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
    } catch {
      // Optimistic update holds
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`mt-6 w-full ${className}`}>
      {/* Live Counter Display */}
      <div className="flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#d4a843]/50 bg-[#f5ebd5]/70 px-4 py-1.5 text-[12px] font-medium text-[#5c4033] shadow-2xs sm:text-[13px]">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8b1a1a] opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-[#8b1a1a]" />
          </span>
          <Users className="size-3.5 text-[#8b1a1a]" />
          <span>
            <strong className="font-semibold text-[#8b1a1a]">{mounted ? count : DEFAULT_INITIAL_COUNT}</strong> Guests Are Interested &amp; Excited
          </span>
        </div>

        {/* Action Button & Confirmation Banner */}
        <div className="mt-3.5 min-h-[46px] w-full max-w-[360px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!hasExpressedInterest ? (
              <motion.button
                key="interested-button"
                type="button"
                onClick={() => void handleInterestedClick()}
                disabled={loading}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.25 } }}
                whileTap={{ scale: 0.96 }}
                className="group relative flex w-full items-center justify-center gap-2 rounded-full border border-[#d4a843] bg-gradient-to-r from-[#8b1a1a] via-[#9e1c1c] to-[#8b1a1a] px-6 py-3 text-[14px] font-semibold text-[#fdf5e6] shadow-[0_4px_16px_rgba(139,26,26,0.25)] transition-all duration-300 hover:shadow-[0_6px_22px_rgba(139,26,26,0.35)] active:scale-95 sm:text-[15px]"
              >
                <Heart className="size-4.5 fill-[#fdf5e6] text-[#fdf5e6] transition-transform duration-300 group-hover:scale-125" />
                <span>I Am Interested</span>
                <span className="text-[12px] opacity-80">✨</span>
              </motion.button>
            ) : (
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
                <span>Thank you! We look forward to celebrating together!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!hasExpressedInterest ? (
          <p className="mt-2 text-[11px] text-[#7b6a58] sm:text-[12px]">
            Tap to let Manikanta &amp; Sravika know you would love to attend.
          </p>
        ) : null}
      </div>
    </div>
  );
}
