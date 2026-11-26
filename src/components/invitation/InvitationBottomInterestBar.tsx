"use client";

import { useEffect, useState } from "react";
import { Check, Heart, X } from "lucide-react";

const RESOLVED_KEY = "manikanta_sravika_guest_interest_resolved";
const STATUS_KEY = "manikanta_sravika_guest_interest_status";

type GuestAction = "idle" | "interested" | "declined";

export function InvitationBottomInterestBar() {
  const [action, setAction] = useState<GuestAction>("idle");
  const [loading, setLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    setMounted(true);

    try {
      const isResolved = localStorage.getItem(RESOLVED_KEY);
      if (isResolved === "true") {
        setIsVisible(false);
        return;
      }
    } catch {
      // LocalStorage access may fail in private browsing
    }
  }, []);

  async function handleInterested() {
    if (action === "interested" || loading) return;

    setLoading(true);
    setAction("interested");

    try {
      localStorage.setItem(STATUS_KEY, "interested");
      localStorage.setItem(RESOLVED_KEY, "true");
      localStorage.setItem("manikanta_sravika_interested_submitted", "true");
    } catch {}

    try {
      void fetch("/api/public/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch {}

    setTimeout(() => {
      setIsVisible(false);
      window.dispatchEvent(new Event("wedding:interest-bar-resolved"));
    }, 1800);
  }

  function handleDecline() {
    setAction("declined");

    try {
      localStorage.setItem(STATUS_KEY, "declined");
      localStorage.setItem(RESOLVED_KEY, "true");
    } catch {}

    setIsVisible(false);
    window.dispatchEvent(new Event("wedding:interest-bar-resolved"));
  }

  if (!mounted || !isVisible) return null;

  return (
    <aside
      aria-label="Wedding Interest"
      className="fixed inset-x-0 bottom-0 z-50 pointer-events-none sm:bottom-6 sm:px-4"
    >
      <div
        className="pointer-events-auto mx-auto flex w-full items-center justify-center gap-2.5 border-t border-[#d4a843]/70 bg-[#fffdf9]/98 px-4 py-2.5 shadow-[0_-4px_18px_rgba(61,28,0,0.12)] sm:w-fit sm:rounded-full sm:border sm:border-[#d4a843]/80 sm:bg-[#fffdf9]/95 sm:px-5 sm:py-2.5 sm:backdrop-blur-sm sm:shadow-[0_10px_30px_rgba(61,28,0,0.16)]"
        style={{ paddingBottom: "max(0.65rem, env(safe-area-inset-bottom))" }}
      >
        {action === "idle" ? (
          <>
            <button
              type="button"
              onClick={() => void handleInterested()}
              disabled={loading}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full border border-[#d4a843] bg-[#8b1a1a] px-6 py-2 text-[14px] font-medium text-[#fdf5e6] transition-colors hover:bg-[#721515] active:scale-[0.98] sm:flex-initial cursor-pointer"
            >
              <Heart className="size-4 fill-[#fdf5e6] text-[#fdf5e6]" aria-hidden />
              <span>Interested</span>
            </button>

            <button
              type="button"
              onClick={handleDecline}
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#d4a843]/50 bg-[#f5ebd5]/70 text-[#7b6a58] transition-colors hover:border-[#8b1a1a] hover:text-[#8b1a1a] cursor-pointer"
              aria-label="Dismiss"
              title="Dismiss"
            >
              <X className="size-4" strokeWidth={2.2} />
            </button>
          </>
        ) : (
          <div
            role="status"
            aria-live="polite"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-emerald-600/40 bg-emerald-50 px-5 py-2 text-[14px] font-medium text-emerald-800"
          >
            <Check className="size-4 shrink-0 text-emerald-700" strokeWidth={2.5} aria-hidden />
            <span>Thank you for your interest!</span>
          </div>
        )}
      </div>
    </aside>
  );
}
