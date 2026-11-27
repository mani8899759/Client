"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Volume2, VolumeX, ExternalLink, Calendar, Radio } from "lucide-react";
import { Container, Section } from "@/components/layout/Container";
import { SectionHeading } from "@/components/typography/Headings";
import { StreamStatusBadge } from "@/components/media/StreamStatusBadge";
import { OFFICIAL_LOGO } from "@/config/logo";
import { formatDateTimeInZone } from "@/lib/utils/datetime";
import { getYouTubeId, youTubeThumbnail } from "@/lib/utils/youtube";
import type { LiveStream } from "@/types/database";

export function WatchCelebrationLiveSection({
  stream,
  timezone,
  weddingDateLabel = "December 13, 2026",
  logoUrl = OFFICIAL_LOGO.src,
}: {
  stream: LiveStream | null;
  timezone: string;
  weddingDateLabel?: string;
  logoUrl?: string | null;
  logoEnabled?: boolean;
}) {
  const [isMuted, setIsMuted] = useState(true);
  const [manualPlay, setManualPlay] = useState(false);

  const videoUrl = stream
    ? stream.status === "ended"
      ? (stream.replay_url ?? stream.youtube_url)
      : stream.youtube_url
    : null;

  // Validate YouTube URL before rendering any video
  const ytId = getYouTubeId(videoUrl);
  const when = stream?.scheduled_at ? formatDateTimeInZone(stream.scheduled_at, timezone) : null;
  const isLive = stream?.status === "live";
  const isEnded = stream?.status === "ended";
  const isUpcoming = stream?.status === "upcoming";

  // Autoplay only when live and valid YouTube ID exists, or when user explicitly clicks play
  const shouldPlayIframe = Boolean((isLive || manualPlay) && ytId);

  function toggleMute() {
    setIsMuted((prev) => !prev);
  }

  const activeLogo = logoUrl || OFFICIAL_LOGO.src;

  return (
    <Section id="live-stream" tone="cream" labelledBy="watch-live-title" className="border-t border-soft-border">
      <Container width="wide">
        <div className="flex flex-col gap-4 text-center sm:text-left sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Broadcast"
            title={<span id="watch-live-title">Watch Our Celebration Live</span>}
            intro="Our wedding celebration will be shared here. Stay connected and be part of our special moments."
          />
          {stream && ytId && stream.status === "live" ? (
            <div className="flex items-center gap-2 self-center sm:self-end">
              <span className="relative flex size-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex size-3 rounded-full bg-secondary" />
              </span>
              <span className="text-[13px] font-semibold tracking-wider text-secondary uppercase">
                Broadcasting Live Now
              </span>
            </div>
          ) : stream && ytId ? (
            <div className="self-center sm:self-end">
              <StreamStatusBadge status={stream.status} />
            </div>
          ) : (
            <div className="self-center sm:self-end">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-champagne-gold/60 bg-champagne-gold/10 px-3.5 py-1 text-[12px] font-medium text-dark-walnut">
                <Radio className="size-3.5 text-muted-gold" />
                <span>Livestream Channel</span>
              </span>
            </div>
          )}
        </div>

        <div className="mt-10 overflow-hidden rounded-[var(--radius-surface)] border border-soft-border bg-card-surface sm:mt-12 shadow-xs">
          {stream && ytId ? (
            /* Mode A: Valid YouTube Livestream Configured */
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
                      className="object-cover opacity-85"
                      priority={isLive}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-walnut/90 via-dark-walnut/40 to-transparent flex flex-col items-center justify-center p-6 text-center">
                      <button
                        type="button"
                        onClick={() => setManualPlay(true)}
                        className="group flex size-20 items-center justify-center rounded-full border border-soft-cream/80 bg-champagne-gold/90 text-soft-cream shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-champagne-gold cursor-pointer"
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
                      className="flex h-11 items-center gap-2 rounded-[var(--radius-control)] border border-soft-border bg-soft-cream px-4 text-[13px] font-medium text-dark-walnut transition hover:border-champagne-gold cursor-pointer"
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
            /* Mode B: No YouTube URL configured — Official S&D Wedding Logo in exact video area */
            <div>
              {/* Media Player Viewport Replacement */}
              <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-b from-[#FAF7F2] via-[#F7F0E4] to-[#EFE7D8] flex flex-col items-center justify-center p-6 text-center select-none sm:p-12">
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/60 via-transparent to-transparent pointer-events-none"
                />

                <div className="relative z-10 flex flex-col items-center justify-center max-w-[540px] w-full px-4">
                  {/* Official S&D Wedding Logo: crisp, uncropped, preserved 765:168 aspect ratio */}
                  <div className="relative w-full max-w-[260px] xs:max-w-[320px] sm:max-w-[420px] md:max-w-[480px] flex items-center justify-center py-2 sm:py-5">
                    <Image
                      src={activeLogo}
                      alt={OFFICIAL_LOGO.alt}
                      width={OFFICIAL_LOGO.width}
                      height={OFFICIAL_LOGO.height}
                      priority
                      className="h-auto w-full object-contain filter drop-shadow-xs"
                    />
                  </div>

                  <div className="mt-3 sm:mt-5 flex items-center gap-2">
                    <span className="h-px w-8 sm:w-16 bg-champagne-gold/60" />
                    <span className="text-[11px] sm:text-[13px] font-sans uppercase tracking-[0.2em] text-[#8b1a1a] font-medium">
                      Official Wedding Livestream
                    </span>
                    <span className="h-px w-8 sm:w-16 bg-champagne-gold/60" />
                  </div>

                  <p className="mt-2 sm:mt-3 max-w-[42ch] font-serif text-[15px] sm:text-[19px] text-dark-walnut leading-relaxed">
                    Live broadcast will stream here on the wedding day.
                  </p>

                  <div className="mt-3 sm:mt-5 inline-flex items-center gap-2 rounded-full border border-champagne-gold/60 bg-warm-ivory/90 px-4 py-1.5 text-[12px] sm:text-[13px] text-dark-walnut shadow-2xs">
                    <Calendar className="size-3.5 sm:size-4 text-muted-gold" />
                    <span>Wedding Date: {weddingDateLabel}</span>
                  </div>
                </div>
              </div>

              {/* Informative metadata footer bar matching player layout */}
              <div className="flex flex-col gap-4 border-t border-soft-border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8 bg-card-surface">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-meta text-muted-gold">Wedding Ceremony · Virtual Broadcast</span>
                    <span aria-hidden className="text-secondary-text">·</span>
                    <span className="text-meta text-secondary-text">{weddingDateLabel}</span>
                  </div>
                  <h3 className="mt-1 font-serif text-[24px] text-dark-walnut sm:text-[28px]">
                    Manikanta &amp; Sravika Wedding Ceremony
                  </h3>
                  <p className="mt-1.5 max-w-[65ch] text-[14px] text-secondary-text">
                    The wedding livestream will automatically activate in this player as soon as broadcasting begins.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-champagne-gold/60 bg-champagne-gold/10 px-3.5 py-1.5 text-[12px] font-medium text-dark-walnut">
                    <span className="size-2 rounded-full bg-champagne-gold" />
                    Upcoming Broadcast
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
