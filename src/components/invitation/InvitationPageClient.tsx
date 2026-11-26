"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Gift } from "lucide-react";
import type { LiveStream, StoryEntry, Venue, WeddingEvent, WeddingSettings } from "@/types/database";
import { mediaUrl } from "@/lib/storage/media";
import { weddingSchedule } from "@/lib/utils/wedding";
import { InvitationMotionProvider } from "./animations/InvitationMotionProvider";
import { InvitationHero } from "./InvitationHero";
import { InvitationAudioPlayer } from "./InvitationAudioPlayer";
import { InvitationWelcome } from "./InvitationWelcome";
import { InvitationStory } from "./InvitationStory";
import { InvitationEvents } from "./InvitationEvents";
import { InvitationLiveStream } from "./InvitationLiveStream";
import { InvitationLocations } from "./InvitationLocations";
import { InvitationGiftSection } from "./InvitationGiftSection";
import { InvitationClosing } from "./InvitationClosing";

export function InvitationPageClient({
  wedding,
  story,
  events,
  venues,
  featuredStream,
  siteUrl,
}: {
  wedding: WeddingSettings;
  story: StoryEntry[];
  events: WeddingEvent[];
  venues: Venue[];
  featuredStream?: LiveStream | null;
  siteUrl: string;
}) {
  const schedule = weddingSchedule(wedding);
  const audioUrl = wedding.invitation_music_path
    ? mediaUrl(wedding.invitation_music_path)
    : "/audio/priya-arjun-wedding-music.m4a";
  const invitationUrl = `${siteUrl}/invitation`;

  // If visitor arrives with a section hash, scroll smoothly to it
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash && hash !== "#invitation-card" && hash !== "#official-invitation") {
      setTimeout(() => {
        const el = document.querySelector(hash);
        el?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, []);

  return (
    <InvitationMotionProvider active={true}>
      <div className="invitation-theme min-h-screen bg-[#fdf5e6] text-[#3d1c00]">
        {/* Top minimal bar to return to wedding site */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#d4a843]/40 bg-[#fffcf7]/98 px-4 sm:bg-[#fffcf7]/95 sm:backdrop-blur-md sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[13px] font-medium text-[#8b1a1a] transition-colors hover:text-[#721515]"
          >
            <ArrowLeft className="size-4" />
            <span>Wedding Website</span>
          </Link>

          <div className="font-[family-name:var(--font-playfair)] text-[16px] font-semibold text-[#3d1c00]">
            {wedding.groom_name} <span className="font-[family-name:var(--font-script)] text-[#8b1a1a]">&amp;</span> {wedding.bride_name}
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#8b1a1a] px-3.5 py-1.5 text-[12px] font-medium text-[#fdf5e6] shadow-2xs hover:bg-[#721515]"
            >
              <Gift className="size-3.5" />
              <span className="hidden sm:inline">Win a Gift</span>
            </Link>
          </div>
        </header>

        {/* Complete Digital Wedding Invitation Content */}
        <div>
          <main>
            {/* Screen 1: Top Hero South Indian Gopuram Background + Toran + Names */}
            <InvitationHero wedding={wedding} isOpened={true} />

            {/* Screen 2: Welcome and Couple introduction */}
            <InvitationWelcome wedding={wedding} />

            {/* Screen 3: Our Love Story / A Journey Together */}
            <InvitationStory story={story} wedding={wedding} />

            {/* Screen 4: Sacred Ceremonies / Wedding Celebrations */}
            <InvitationEvents events={events} timezone={wedding.timezone} />

            {/* Screen 8: Wedding Live Video */}
            {wedding.invitation_section_livestream !== false ? (
              <InvitationLiveStream
                stream={featuredStream ?? null}
                timezone={wedding.timezone}
                weddingDateLabel={schedule?.dateOnlyLabel ?? "December 13, 2026"}
              />
            ) : null}

            {/* Screen 9: Wedding Venues & Google Maps */}
            {wedding.invitation_section_venues !== false ? (
              <InvitationLocations venues={venues} />
            ) : null}

            {/* Screen 10: Win a Special Gift */}
            {wedding.invitation_section_gift_draw !== false ? (
              <InvitationGiftSection wedding={wedding} />
            ) : null}

            {/* Screen 11: Invitation Closing Message & WhatsApp Sharing */}
            <InvitationClosing wedding={wedding} invitationUrl={invitationUrl} />
          </main>
        </div>

        {/* Persistent Floating Music Controller */}
        <InvitationAudioPlayer
          audioUrl={audioUrl}
          title={wedding.invitation_music_title}
          autoPlayTrigger={wedding.invitation_auto_play_on_open !== false}
          enabled={wedding.invitation_music_enabled !== false}
          defaultVolume={Number(wedding.invitation_music_volume ?? 0.7)}
        />
      </div>
    </InvitationMotionProvider>
  );
}
