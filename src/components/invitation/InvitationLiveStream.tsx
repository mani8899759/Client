"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Volume2, VolumeX, Maximize2, ExternalLink, Calendar, Video, Radio } from "lucide-react";
import type { LiveStream } from "@/types/database";
import { getYouTubeId, youTubeThumbnail } from "@/lib/utils/youtube";
import { formatDateTimeInZone } from "@/lib/utils/datetime";

export function InvitationLiveStream({
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

  const shouldPlayIframe = (isLive || manualPlay) && !!ytId;

  return (
    <section aria-labelledby="invitation-live-heading" className="py-16 sm:py-24 bg-[#fdf5e6]">
      <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <p className="font-[family-name:var(--font-script)] text-[28px] text-[#8b1a1a] sm:text-[34px]">
            Live Broadcast
          </p>
          <h2
            id="invitation-live-heading"
            className="mt-1 font-[family-name:var(--font-playfair)] text-[32px] font-bold text-[#3d1c00] sm:text-[42px]"
          >
            Watch Our Celebration Live
          </h2>
          <p className="mx-auto mt-3 max-w-[54ch] font-[family-name:var(--font-serif)] text-[18px] text-[#5c4033] sm:text-[20px]">
            Be part of our special moments, wherever you are. Join us virtually as we exchange our sacred vows.
          </p>
        </div>

        {/* Live Stream Card */}
        <div className="mt-10 overflow-hidden rounded-[16px] border-2 border-[#d4a843]/60 bg-[#fffcf7] shadow-[0_8px_30px_rgba(61,28,0,0.06)]">
          {stream && ytId ? (
            <div>
              {/* Media Player Viewport */}
              <div className="relative aspect-video w-full overflow-hidden bg-[#2b1604]">
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
                      sizes="(min-width: 1024px) 960px, 100vw"
                      className="object-cover opacity-85"
                      priority={isLive}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3d1c00]/90 via-[#3d1c00]/40 to-transparent flex flex-col items-center justify-center p-6 text-center">
                      <button
                        type="button"
                        onClick={() => setManualPlay(true)}
                        className="group flex size-20 items-center justify-center rounded-full border-2 border-[#d4a843] bg-[#8b1a1a]/95 text-[#fdf5e6] shadow-xl transition-all duration-300 hover:scale-105 hover:bg-[#721515]"
                        aria-label="Start wedding live broadcast"
                      >
                        <Play className="ml-1 size-9 fill-current" />
                      </button>
                      <p className="mt-4 font-[family-name:var(--font-playfair)] text-[20px] font-semibold text-[#fffcf7] sm:text-[24px]">
                        {isEnded ? "Play Ceremony Replay" : "Click to Watch Stream"}
                      </p>
                      {when ? (
                        <p className="mt-1 text-[13px] text-[#f5ebd5]">Scheduled: {when}</p>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>

              {/* Stream Meta Footer */}
              <div className="flex flex-col gap-4 border-t border-[#d4a843]/30 bg-[#fffcf7] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <div className="flex items-center gap-2">
                    {isLive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8b1a1a] px-3 py-1 text-[12px] font-semibold text-[#fdf5e6] uppercase tracking-wider">
                        <span className="size-2 rounded-full bg-red-300 animate-ping" />
                        Live Now
                      </span>
                    ) : isUpcoming ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#f5ebd5] px-3 py-1 text-[12px] font-medium text-[#5c4033]">
                        <Calendar className="size-3.5" />
                        Upcoming Broadcast
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#f5ebd5] px-3 py-1 text-[12px] font-medium text-[#5c4033]">
                        Replay Available
                      </span>
                    )}
                    {stream.event ? (
                      <span className="text-[13px] font-medium text-[#8b1a1a]">
                        • {stream.event.name}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-2 font-[family-name:var(--font-playfair)] text-[20px] font-semibold text-[#3d1c00]">
                    {stream.title}
                  </h3>
                  {stream.description ? (
                    <p className="mt-1 text-[14px] text-[#7b6a58] max-w-[65ch]">
                      {stream.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                  {shouldPlayIframe ? (
                    <button
                      type="button"
                      onClick={() => setIsMuted((m) => !m)}
                      className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#d4a843] bg-[#fffcf7] px-3.5 py-2 text-[13px] font-medium text-[#3d1c00] hover:bg-[#f5ebd5]"
                    >
                      {isMuted ? <VolumeX className="size-4 text-[#8b1a1a]" /> : <Volume2 className="size-4" />}
                      <span>{isMuted ? "Unmute" : "Mute"}</span>
                    </button>
                  ) : null}

                  {videoUrl ? (
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#8b1a1a] px-4 py-2 text-[13px] font-medium text-[#fdf5e6] shadow-2xs hover:bg-[#721515]"
                    >
                      <span>Open on YouTube</span>
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center sm:p-12">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#f5ebd5] text-[#8b1a1a]">
                <Radio className="size-7" />
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-[22px] font-semibold text-[#3d1c00]">
                Live Stream Schedule
              </h3>
              <p className="mx-auto mt-2 max-w-[50ch] font-[family-name:var(--font-serif)] text-[16px] text-[#5c4033]">
                The wedding broadcast channel will be linked closer to December 1, 2026. Guests around the world will be able to watch our ceremony live right here.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
