"use client";

import { useEffect, useState } from "react";
import { Check, X, Users, Heart, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "manikanta_sravika_guest_interest_status";
const DEFAULT_INITIAL_COUNT = 142;

type GuestStatus = "idle" | "interested" | "declined";

export function InvitationBottomInterestBar() {
  const [status, setStatus] = useState<GuestStatus>("idle");
  const [count, setCount] = useState<number>(DEFAULT_INITIAL_COUNT);
  const [loading, setLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    // Check saved state from localStorage
    try {
      const savedStatus = localStorage.getItem(STORAGE_KEY) as GuestStatus | null;
      if (savedStatus === "interested" || savedStatus === "declined") {
        setStatus(savedStatus);
      }
    } catch {
      // LocalStorage access may fail in private browsing
    }

    // Fetch live counter
    void fetch("/api/public/interest")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { count?: number } | null) => {
        if (data && typeof data.count === "number") {
          setCount(data.count);
        }
      })
      .catch(() => {});
  }, []);

  async function handleInterested() {
    if (status === "interested" || loading) return;

    setLoading(true);
    setStatus("interested");
    setCount((prev) => prev + 1);

    try {
      localStorage.setItem(STORAGE_KEY, "interested");
      localStorage.setItem("manikanta_sravika_interested_submitted", "true");
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
    } catch {
      // Optimistic increment holds
    } finally {
      setLoading(false);
    }
  }

  function handleDecline() {
    // Cross mark: do NOT increment counter per user requirement!
    setStatus("declined");
    try {
      localStorage.setItem(STORAGE_KEY, "declined");
    } catch {}
  }

  if (!mounted || isDismissed) return null;

  return (
    <aside
      aria-label="Wedding Attendance & Interest Bar"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#d4a843]/70 bg-[#fffdf9]/95 px-3 py-2.5 shadow-[0_-4px_24px_rgba(61,28,0,0.14)] backdrop-blur-md sm:px-6 sm:py-3.5"
    >
      <div className="mx-auto flex max-w-[960px] items-center justify-between gap-2.5 sm:gap-4">
        {/* Left: Counter & Status */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <span className="relative flex size-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-600" />
          </span>

          <div className="truncate text-left">
            <p className="flex items-center gap-1.5 text-[12px] font-semibold text-[#3d1c00] sm:text-[14px]">
              <Users className="size-3.5 shrink-0 text-[#8b1a1a]" />
              <span className="font-bold text-[#8b1a1a]">{count}</span>
              <span className="truncate">People Coming / Interested</span>
            </p>
            <p className="hidden truncate text-[11px] text-[#7b6a58] xs:block">
              {status === "interested"
                ? "Your interest is confirmed with Manikanta & Sravika!"
                : status === "declined"
                ? "Marked as unable to attend (not counted)."
                : "Let the couple know you are celebrating with them!"}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <AnimatePresence mode="wait">
            {status === "idle" ? (
              <motion.div
                key="idle-actions"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 sm:gap-2"
              >
                {/* 1. Primary Action: I Am Interested */}
                <button
                  type="button"
                  onClick={() => void handleInterested()}
                  disabled={loading}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#d4a843] bg-gradient-to-r from-[#8b1a1a] via-[#9e1c1c] to-[#8b1a1a] px-3.5 py-1.5 text-[12px] font-semibold text-[#fdf5e6] shadow-[0_2px_10px_rgba(139,26,26,0.25)] transition-all hover:scale-[1.03] active:scale-[0.97] sm:h-10 sm:px-5 sm:text-[13px]"
                >
                  <Heart className="size-3.5 fill-[#fdf5e6]" />
                  <span>I Am Interested</span>
                </button>

                {/* 2. Wrong / Cross Mark: Does NOT count towards counter */}
                <button
                  type="button"
                  onClick={handleDecline}
                  className="flex size-9 items-center justify-center rounded-full border border-[#d4a843]/50 bg-[#f5ebd5]/70 text-[#7b6a58] transition-colors hover:border-[#8b1a1a] hover:bg-rose-50 hover:text-rose-700 sm:size-10"
                  aria-label="Cannot attend / Cross out"
                  title="Cannot attend (will not be counted)"
                >
                  <X className="size-4" strokeWidth={2.2} />
                </button>
              </motion.div>
            ) : status === "interested" ? (
              /* Confirmed state with Green Tick Mark (✓) */
              <motion.div
                key="confirmed-actions"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-1.5 sm:gap-2"
              >
                <div className="inline-flex h-9 items-center gap-1.5 rounded-full border border-emerald-600/50 bg-emerald-50 px-3 py-1 text-[12px] font-semibold text-emerald-800 shadow-2xs sm:h-10 sm:px-4 sm:text-[13px]">
                  <div className="flex size-4.5 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <Check className="size-3 stroke-[3]" />
                  </div>
                  <span>I Am Interested</span>
                </div>

                {/* Dismiss button to hide bar once confirmed */}
                <button
                  type="button"
                  onClick={() => setIsDismissed(true)}
                  className="flex size-8 items-center justify-center rounded-full text-[#7b6a58] hover:text-[#3d1c00]"
                  aria-label="Dismiss bar"
                  title="Close"
                >
                  <X className="size-3.5" />
                </button>
              </motion.div>
            ) : (
              /* Declined / Cross marked state: Counter NOT incremented */
              <motion.div
                key="declined-actions"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-1.5 sm:gap-2"
              >
                <div className="inline-flex h-9 items-center gap-1.5 rounded-full border border-stone-300 bg-stone-100 px-3 py-1 text-[11px] font-medium text-stone-600 sm:h-10 sm:px-3.5 sm:text-[12px]">
                  <X className="size-3.5 text-stone-500" strokeWidth={2.5} />
                  <span>Can&apos;t Make It</span>
                </div>

                {/* Reset option if they change their mind */}
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="text-[11px] font-medium text-[#8b1a1a] underline underline-offset-2 hover:text-[#721515]"
                >
                  Change
                </button>

                <button
                  type="button"
                  onClick={() => setIsDismissed(true)}
                  className="flex size-7 items-center justify-center rounded-full text-[#7b6a58] hover:text-[#3d1c00]"
                  aria-label="Dismiss bar"
                  title="Close"
                >
                  <X className="size-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
}
