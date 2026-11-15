"use client";

import { useEffect, useRef, useState } from "react";
import { Music, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function InvitationAudioPlayer({
  audioUrl,
  title = "Wedding Celebration Music",
  autoPlayTrigger,
  enabled = true,
  defaultVolume = 0.7,
}: {
  audioUrl?: string | null;
  title?: string | null;
  autoPlayTrigger?: boolean;
  enabled?: boolean;
  defaultVolume?: number;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(defaultVolume);
  const [showVolume, setShowVolume] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  // When user clicks "Open Invitation", initiate playback
  useEffect(() => {
    if (!autoPlayTrigger || !enabled || !audioUrl || !audioRef.current) return;
    audioRef.current.volume = volume;
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        // Autoplay may be blocked by browser policy without active user gesture
        setIsPlaying(false);
      });
  }, [autoPlayTrigger, enabled, audioUrl]);

  function togglePlay() {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }

  function toggleMute() {
    if (!audioRef.current) return;
    const next = !isMuted;
    audioRef.current.muted = next;
    setIsMuted(next);
  }

  if (!enabled || !audioUrl) {
    return null;
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="auto"
        loop
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

      {/* Floating Audio Controller */}
      <div className="fixed right-4 bottom-5 z-40 flex items-center gap-2 rounded-full border border-[#d4a843]/60 bg-[#fffcf7]/95 px-3.5 py-2 shadow-[0_4px_20px_-2px_rgba(139,26,26,0.15)] backdrop-blur-md transition-all sm:right-6 sm:bottom-6">
        {/* Animated sound equalizer bars when playing */}
        <div className="flex items-center gap-0.5">
          <span
            className={cn(
              "h-3 w-0.5 rounded-full bg-[#8b1a1a] transition-all",
              isPlaying ? "animate-pulse" : "opacity-40"
            )}
          />
          <span
            className={cn(
              "h-4 w-0.5 rounded-full bg-[#8b1a1a] transition-all",
              isPlaying ? "animate-[pulse_0.8s_ease-in-out_infinite]" : "opacity-40"
            )}
          />
          <span
            className={cn(
              "h-2 w-0.5 rounded-full bg-[#8b1a1a] transition-all",
              isPlaying ? "animate-[pulse_1.2s_ease-in-out_infinite]" : "opacity-40"
            )}
          />
        </div>

        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="flex size-7 items-center justify-center rounded-full bg-[#8b1a1a] text-[#fdf5e6] shadow-sm transition-transform hover:scale-105 active:scale-95"
          aria-label={isPlaying ? "Pause wedding music" : "Play wedding music"}
        >
          {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5 ml-0.5" />}
        </button>

        {/* Music Title (desktop) */}
        <div className="hidden max-w-[150px] truncate text-[11px] font-medium text-[#3d1c00] sm:block">
          {title || "Wedding Music"}
        </div>

        {/* Mute/Unmute */}
        <button
          type="button"
          onClick={toggleMute}
          className="text-[#5c4033] transition-colors hover:text-[#8b1a1a]"
          aria-label={isMuted ? "Unmute music" : "Mute music"}
        >
          {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>

        {/* Volume Popover trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowVolume((prev) => !prev)}
            className="flex items-center text-[10px] text-[#5c4033] hover:text-[#8b1a1a]"
            title="Adjust volume"
          >
            {Math.round(volume * 100)}%
          </button>

          {showVolume ? (
            <div className="absolute right-0 bottom-full mb-3 rounded-lg border border-[#e5d5bd] bg-[#fffcf7] p-2.5 shadow-lg">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="h-1.5 w-24 accent-[#8b1a1a]"
                aria-label="Volume slider"
              />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
