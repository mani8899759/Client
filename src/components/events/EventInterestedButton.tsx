"use client";

import { useEffect, useState } from "react";
import { Check, Heart } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const STORAGE_KEY = "manikanta_sravika_event_interests";

let sharedFetchPromise: Promise<string[]> | null = null;

function fetchSavedEventInterests(): Promise<string[]> {
  if (!sharedFetchPromise) {
    sharedFetchPromise = fetch("/api/public/event-interest", { credentials: "same-origin" })
      .then((res) => (res.ok ? (res.json() as Promise<{ interestedEventIds?: string[] }>) : { interestedEventIds: [] }))
      .then((data) => (Array.isArray(data.interestedEventIds) ? data.interestedEventIds : []))
      .catch(() => []);
  }
  return sharedFetchPromise;
}

function readLocalInterests(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeLocalInterest(eventId: string) {
  try {
    const current = readLocalInterests();
    if (!current.includes(eventId)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, eventId]));
    }
  } catch {
    // Ignore storage errors in private browsing
  }
}

export function EventInterestedButton({
  eventId,
  eventName,
  className,
}: {
  eventId: string;
  eventName: string;
  className?: string;
}) {
  const [interested, setInterested] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const raf = requestAnimationFrame(() => {
      if (!active) return;
      const localIds = readLocalInterests();
      if (localIds.includes(eventId)) {
        setInterested(true);
      }
    });

    void fetchSavedEventInterests().then((serverIds) => {
      if (!active) return;
      if (serverIds.includes(eventId)) {
        setInterested(true);
        writeLocalInterest(eventId);
      }
    });

    return () => {
      active = false;
      cancelAnimationFrame(raf);
    };
  }, [eventId]);

  async function handleClick() {
    if (interested || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/event-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ eventId }),
      });
      if (res.ok) {
        setInterested(true);
        writeLocalInterest(eventId);
        sharedFetchPromise = null;
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (interested) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "inline-flex min-h-[44px] items-center gap-2 rounded-full border border-champagne-gold/60 bg-soft-cream px-5 py-2 text-[14px] font-medium text-dark-walnut",
          className,
        )}
      >
        <Check className="size-4 shrink-0 text-primary" strokeWidth={2} aria-hidden />
        <span>Thank you for your interest!</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={submitting}
      aria-busy={submitting}
      aria-label={`Mark yourself as interested in ${eventName}`}
      className={cn(
        "inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-full border border-champagne-gold bg-warm-ivory/80 px-5 py-2 text-[14px] font-medium text-dark-walnut transition-colors hover:bg-soft-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-gold disabled:cursor-wait disabled:opacity-70",
        className,
      )}
    >
      <Heart className="size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
      <span>{submitting ? "Saving..." : "Interested"}</span>
    </button>
  );
}
