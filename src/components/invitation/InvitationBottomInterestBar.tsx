"use client";

import { useEffect, useState } from "react";
import { Check, X, Users, Heart, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RESOLVED_KEY = "manikanta_sravika_guest_interest_resolved";
const STATUS_KEY = "manikanta_sravika_guest_interest_status";
const DEFAULT_INITIAL_COUNT = 142;

type GuestAction = "idle" | "interested" | "declined";

export function InvitationBottomInterestBar() {
  const [action, setAction] = useState<GuestAction>("idle");
  const [count, setCount] = useState<number>(DEFAULT_INITIAL_COUNT);
  const [loading, setLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    setMounted(true);

    // If guest has already interacted (either clicked interested or cross mark), DO NOT SHOW ON ANY PAGE!
    try {
      const isResolved = localStorage.getItem(RESOLVED_KEY);
      if (isResolved === "true") {
        setIsVisible(false);
        return;
      }
    } catch {
      // LocalStorage access may fail in private browsing
    }

    // Fetch latest live counter from server
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
    if (action === "interested" || loading) return;

    setLoading(true);
    setAction("interested");
    setCount((prev) => prev + 1);

    // Store in localStorage that user has expressed interest and resolved the prompt
    try {
      localStorage.setItem(STATUS_KEY, "interested");
      localStorage.setItem(RESOLVED_KEY, "true");
      localStorage.setItem("manikanta_sravika_interested_submitted", "true");
    } catch {}

    // Send increment to backend
    try {
      void fetch("/api/public/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch {}

    // Automatically close and slide away after brief thank-you feedback (1.8 seconds)
    setTimeout(() => {
      setIsVisible(false);
    }, 1800);
  }

  function handleDecline() {
    // Cross mark: close immediately and do NOT increment counter per user instruction!
    setAction("declined");

    try {
      localStorage.setItem(STATUS_KEY, "declined");
      localStorage.setItem(RESOLVED_KEY, "true");
    } catch {}

    // Immediately close so it never appears again on any page
    setIsVisible(false);
  }

  // If not mounted or already resolved, render nothing
  if (!mounted || !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <aside
          aria-label="Wedding Attendance & Interest Bar"
          className="fixed inset-x-0 bottom-0 z-50 pointer-events-none sm:bottom-6 sm:px-4"
        >
          {/*
            RESPONSIVE DESIGN:
            • Mobile (<640px): Full-width pinned bottom dock with safe-area padding
            • Desktop (≥640px): Centered floating royal pill with gold border and deep shadow
          */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50, transition: { duration: 0.3 } }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="pointer-events-auto mx-auto w-full border-t border-[#d4a843]/70 bg-[#fffdf9]/95 px-3.5 py-2.5 shadow-[0_-6px_28px_rgba(61,28,0,0.16)] backdrop-blur-md sm:max-w-[720px] sm:rounded-full sm:border sm:border-[#d4a843]/80 sm:px-6 sm:py-3 sm:shadow-[0_12px_40px_rgba(61,28,0,0.22)]"
            style={{ paddingBottom: "max(0.65rem, env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-center justify-between gap-2.5 sm:gap-4">
              {/* Left / Center: Live Counter & Context */}
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                <span className="relative flex size-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-600" />
                </span>

                <div className="truncate text-left">
                  <p className="flex items-center gap-1.5 text-[11px] xs:text-[12px] font-semibold text-[#3d1c00] sm:text-[14px]">
                    <Users className="size-3.5 shrink-0 text-[#8b1a1a]" />
                    <span className="font-bold text-[#8b1a1a]">{count}</span>
                    <span className="truncate hidden xs:inline">People Interested in Attending</span>
                    <span className="truncate xs:hidden">Interested</span>
                  </p>
                  <p className="hidden truncate text-[11px] text-[#7b6a58] sm:block">
                    {action === "interested"
                      ? "Thank you! We can't wait to celebrate with you!"
                      : "Let Manikanta & Sravika know you are excited to celebrate!"}
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <AnimatePresence mode="wait">
                  {action === "idle" ? (
                    <motion.div
                      key="idle-buttons"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center gap-1.5 sm:gap-2"
                    >
                      {/* Primary "I Am Interested" Button */}
                      <button
                        type="button"
                        onClick={() => void handleInterested()}
                        disabled={loading}
                        className="inline-flex h-9.5 items-center gap-1.5 rounded-full border border-[#d4a843] bg-gradient-to-r from-[#8b1a1a] via-[#9e1c1c] to-[#8b1a1a] px-3 xs:px-3.5 py-1.5 text-[11px] xs:text-[12px] font-semibold text-[#fdf5e6] shadow-[0_3px_12px_rgba(139,26,26,0.25)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] sm:h-10 sm:px-5 sm:text-[13px] cursor-pointer"
                      >
                        <Heart className="size-3.5 fill-[#fdf5e6] text-[#fdf5e6]" />
                        <span className="hidden xs:inline">I Am Interested</span>
                        <span className="xs:hidden">Interested</span>
                      </button>

                      {/* Cross Mark (❌ / ✕) - Dismisses immediately without incrementing counter */}
                      <button
                        type="button"
                        onClick={handleDecline}
                        className="flex size-9 items-center justify-center rounded-full border border-[#d4a843]/50 bg-[#f5ebd5]/70 text-[#7b6a58] transition-colors hover:border-[#8b1a1a] hover:bg-rose-50 hover:text-rose-700 sm:size-10"
                        aria-label="Cannot attend or close"
                        title="Dismiss (will not be counted)"
                      >
                        <X className="size-4" strokeWidth={2.4} />
                      </button>
                    </motion.div>
                  ) : (
                    /* Confirmed state with Green Tick Mark (✓) and Thank You message */
                    <motion.div
                      key="confirmed-tick"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex h-9.5 items-center gap-1.5 rounded-full border border-emerald-600/50 bg-emerald-50 px-3.5 py-1 text-[12px] font-semibold text-emerald-800 shadow-2xs sm:h-10 sm:px-4 sm:text-[13px]"
                    >
                      <div className="flex size-4.5 items-center justify-center rounded-full bg-emerald-600 text-white">
                        <Check className="size-3 stroke-[3]" />
                      </div>
                      <span>✓ Thank you for confirming!</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </aside>
      )}
    </AnimatePresence>
  );
}
