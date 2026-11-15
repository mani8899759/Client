"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Gift, Heart, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { GalleryMedia, StoryEntry, Venue, WeddingEvent, WeddingSettings } from "@/types/database";
import { mediaUrl } from "@/lib/storage/media";
import { InvitationCover } from "./InvitationCover";
import { InvitationAudioPlayer } from "./InvitationAudioPlayer";
import { InvitationWelcome } from "./InvitationWelcome";
import { InvitationCountdown } from "./InvitationCountdown";
import { InvitationStory } from "./InvitationStory";
import { InvitationEvents } from "./InvitationEvents";
import { InvitationDocumentViewer } from "./InvitationDocumentViewer";
import { InvitationGallery } from "./InvitationGallery";
import { InvitationLocations } from "./InvitationLocations";
import { InvitationClosing } from "./InvitationClosing";

export function InvitationPageClient({
  wedding,
  story,
  events,
  venues,
  gallery,
  siteUrl,
}: {
  wedding: WeddingSettings;
  story: StoryEntry[];
  events: WeddingEvent[];
  venues: Venue[];
  gallery: GalleryMedia[];
  siteUrl: string;
}) {
  const [isOpened, setIsOpened] = useState(false);
  const [musicTrigger, setMusicTrigger] = useState(false);
  const mainContentRef = useRef<HTMLDivElement | null>(null);

  const audioUrl = wedding.invitation_music_path ? mediaUrl(wedding.invitation_music_path) : null;
  const invitationUrl = `${siteUrl}/invitation`;

  function handleOpen() {
    setIsOpened(true);
    setMusicTrigger(true);
    // Smooth scroll down to main content if needed
    setTimeout(() => {
      mainContentRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  }

  return (
    <div className="invitation-theme min-h-screen bg-[#fdf5e6] text-[#3d1c00]">
      {/* Top minimal bar to return to wedding site */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#d4a843]/40 bg-[#fffcf7]/95 px-4 backdrop-blur-md sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#8b1a1a] transition-colors hover:text-[#721515]"
        >
          <ArrowLeft className="size-4" />
          <span>Wedding Website</span>
        </Link>

        <div className="font-[family-name:var(--font-playfair)] text-[16px] font-semibold text-[#3d1c00]">
          {wedding.bride_name} <span className="font-[family-name:var(--font-script)] text-[#8b1a1a]">&amp;</span> {wedding.groom_name}
        </div>

        <Link
          href="/register"
          className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#8b1a1a] px-3.5 py-1.5 text-[12px] font-medium text-[#fdf5e6] shadow-2xs hover:bg-[#721515]"
        >
          <Gift className="size-3.5" />
          <span className="hidden sm:inline">Win a Gift</span>
        </Link>
      </header>

      {/* Screen 1: Cover Experience */}
      {!isOpened ? (
        <InvitationCover wedding={wedding} onOpen={handleOpen} isOpened={isOpened} />
      ) : null}

      {/* Screen 2–11: Invitation Content Revealed */}
      <div ref={mainContentRef}>
        <AnimatePresence>
          {isOpened ? (
            <motion.main
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
            >
              {/* Screen 2: Welcome and Couple introduction */}
              <InvitationWelcome wedding={wedding} />

              {/* Screen 3: Wedding Countdown */}
              {wedding.invitation_section_countdown !== false ? (
                <InvitationCountdown wedding={wedding} />
              ) : null}

              {/* Screen 4: Our Story */}
              {wedding.invitation_section_story !== false ? (
                <InvitationStory story={story} wedding={wedding} />
              ) : null}

              {/* Screen 5: Events and Schedule */}
              {wedding.invitation_section_events !== false ? (
                <InvitationEvents events={events} timezone={wedding.timezone} />
              ) : null}

              {/* Screen 6: Official Invitation File (PDF / Card viewer) */}
              {wedding.invitation_section_document !== false ? (
                <InvitationDocumentViewer wedding={wedding} />
              ) : null}

              {/* Screen 7: Photo Gallery */}
              {wedding.invitation_section_gallery !== false ? (
                <InvitationGallery media={gallery} />
              ) : null}

              {/* Screen 9: Wedding Venues & Google Maps */}
              {wedding.invitation_section_venues !== false ? (
                <InvitationLocations venues={venues} />
              ) : null}

              {/* Screens 10 & 11: Call to Action & Sharing */}
              <InvitationClosing wedding={wedding} invitationUrl={invitationUrl} />
            </motion.main>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Persistent Floating Music Controller */}
      <InvitationAudioPlayer
        audioUrl={audioUrl}
        title={wedding.invitation_music_title}
        autoPlayTrigger={musicTrigger}
        enabled={wedding.invitation_music_enabled !== false}
        defaultVolume={Number(wedding.invitation_music_volume ?? 0.7)}
      />
    </div>
  );
}
