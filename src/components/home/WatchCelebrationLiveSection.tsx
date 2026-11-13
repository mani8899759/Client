"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Volume2, VolumeX, Maximize2, ExternalLink, Calendar, Video } from "lucide-react";
import { Container, Section } from "@/components/layout/Container";
import { SectionHeading } from "@/components/typography/Headings";
import { StreamStatusBadge } from "@/components/media/StreamStatusBadge";
import { formatDateTimeInZone } from "@/lib/utils/datetime";
import { getYouTubeId, youTubeThumbnail } from "@/lib/utils/youtube";
import type { LiveStream } from "@/types/database";

export function WatchCelebrationLiveSection({
  stream,
  timezone,
}: {
  stream: LiveStream | null;
  timezone: string;
}) {
  const [isMuted, setIsMuted] = useState(true);
  const [manualPlay, setManualPlay] = useState(false);

  const videoUrl = stream
    ? stream.status === "ended"
      ? (stream.replay_url ?? stream.youtube_url)
      : stream.youtube_url
    : null;

  const ytId = getYouTubeId(videoUrl);
  const when = stream?.scheduled_at ? formatDateTimeInZone(stream.scheduled_at, timezone) : null;
  const isLive = stream?.status === "live";
  const isEnded = stream?.status === "ended";
  const isUpcoming = stream?.status === "upcoming";

  // Autoplay when live, or when user clicks play
  const shouldPlayIframe = (isLive || manualPlay) && !!ytId;

  function toggleMute() {
    setIsMuted((prev) => !prev);
  }

  return (
    <Section id="live-stream" tone="cream" labelledBy="watch-live-title" className="border-t border-soft-border">
      <Container width="wide">
        <div className="flex flex-col gap-4 text-center sm:text-left sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Broadcast"
            title={<span id="watch-live-title">Watch Our Celebration Live</span>}
            intro="Be part of our special moments, wherever you are. Join us as we celebrate this beautiful occasion."
          />
          {stream?.status === "live" ? (
            <div className="flex items-center gap-2 self-center sm:self-end">
              <span className="relative flex size-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex size-3 rounded-full bg-secondary" />
              </span>
              <span className="text-[13px] font-semibold tracking-wider text-secondary uppercase">
                Broadcasting Live Now
              </span>
            </div>
          ) : stream ? (
            <div className="self-center sm:self-end">
              <StreamStatusBadge status={stream.status} />
            </div>
          ) : null}
        </div>

        <div className="mt-10 overflow-hidden rounded-[var(--radius-surface)] border border-soft-border bg-card-surface shadow-[var(--shadow-lift)] sm:mt-12">
          {stream && ytId ? (
            <div>
              {/* Media Player Area */}
              <div className="relative aspect-video w-full overflow-hidden bg-dark-walnut">
                {shouldPlayIframe ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=${
                      isMuted ? "1" : "0"
                    }&playsinline=1&controls=1&rel=0`}
                    title={stream.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                  />
                ) : (
                  <div className="relative h-full w-full">
                    <Image
                      src={youTubeThumbnail(ytId)}
                      alt={stream.title}
                      fill
                      sizes="(min-width: 1440px) 1360px, 100vw"
                      className="object-cover opacity-80"
                      priority={isLive}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-walnut/90 via-dark-walnut/40 to-transparent flex flex-col items-center justify-center p-6 text-center">
                      <button
                        type="button"
                        onClick={() => setManualPlay(true)}
                        className="group flex size-20 items-center justify-center rounded-full border border-soft-cream/80 bg-champagne-gold/90 text-soft-cream shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-champagne-gold"
                        aria-label="Start video playback"
                      >
                        <Play className="ml-1 size-8" strokeWidth={1.5} />
                      </button>
                      <p className="mt-4 font-serif text-[24px] text-soft-cream">
                        {isUpcoming ? "Broadcast Starts Soon" : isEnded ? "Watch Celebration Replay" : "Click to Watch Live"}
                      </p>
                      {when ? (
                        <p className="mt-1 text-meta text-soft-cream/80">Scheduled for {when}</p>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>

              {/* Player Metadata & Controls Bar */}
              <div className="flex flex-col gap-4 border-t border-soft-border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-meta text-muted-gold">
                      {stream.event?.name ?? "Wedding Ceremony"}
                    </span>
                    {when ? (
                      <>
                        <span aria-hidden className="text-secondary-text">·</span>
                        <span className="text-meta text-secondary-text">{when}</span>
                      </>
                    ) : null}
                  </div>
                  <h3 className="mt-1 font-serif text-[26px] text-dark-walnut sm:text-[30px]">
                    {stream.title}
                  </h3>
                  {stream.description ? (
                    <p className="mt-2 max-w-[65ch] text-body text-secondary-text">{stream.description}</p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {shouldPlayIframe ? (
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="flex h-11 items-center gap-2 rounded-[var(--radius-control)] border border-soft-border bg-soft-cream px-4 text-[13px] font-medium text-dark-walnut transition hover:border-champagne-gold"
                    >
                      {isMuted ? (
                        <>
                          <VolumeX className="size-4 text-muted-gold" />
                          <span>Unmute sound</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="size-4 text-primary" />
                          <span>Mute sound</span>
                        </>
                      )}
                    </button>
                  ) : null}

                  {videoUrl ? (
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-11 items-center gap-2 rounded-[var(--radius-control)] border border-champagne-gold/60 bg-transparent px-4 text-[13px] font-medium text-dark-walnut transition hover:bg-soft-cream"
                    >
                      <ExternalLink className="size-4" />
                      <span>Watch on YouTube</span>
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            /* Graceful Fallback when no stream configured */
            <div className="flex flex-col items-center justify-center p-12 text-center sm:p-16">
              <div className="flex size-16 items-center justify-center rounded-full border border-champagne-gold/40 bg-soft-cream text-muted-gold">
                <Video className="size-7" strokeWidth={1.5} />
              </div>
              <p className="mt-6 text-meta uppercase tracking-[0.14em] text-muted-gold">Live Stream</p>
              <h3 className="mt-2 font-serif text-[28px] text-dark-walnut sm:text-[32px]">
                Our live celebration will appear here
              </h3>
              <p className="mx-auto mt-3 max-w-[48ch] text-body text-secondary-text">
                The live video broadcast will be connected prior to the wedding ceremonies. Guests will be able to watch
                the celebrations live directly on this page.
              </p>
              <div className="mt-8 flex items-center gap-2 rounded-full border border-soft-border bg-soft-cream px-4 py-2 text-support text-dark-walnut">
                <Calendar className="size-4 text-muted-gold" />
                <span>Wedding Date: December 1, 2026</span>
              </div>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
