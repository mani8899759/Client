"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronUp, Music, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const MUTED_KEY = "manikanta_sravika_invitation_music_muted";

export function InvitationAudioPlayer({
  audioUrl,
  title = "Traditional Wedding Celebration Music",
  autoPlayTrigger,
  enabled = true,
  defaultVolume = 0.65,
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
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fallback mp3 URL if m4a is provided
  const mp3Url = audioUrl?.endsWith(".m4a")
    ? audioUrl.replace(/\.m4a$/, ".mp3")
    : null;
  const m4aUrl = audioUrl?.endsWith(".mp3")
    ? audioUrl.replace(/\.mp3$/, ".m4a")
    : null;

  // Initialize client state & read saved mute preference
  useEffect(() => {
    setMounted(true);
    try {
      const savedMuted = sessionStorage.getItem(MUTED_KEY) === "true";
      if (savedMuted) {
        setIsMuted(true);
        if (audioRef.current) audioRef.current.muted = true;
      }
    } catch {
      // Storage access may be restricted in private browsing
    }
  }, []);

  // Update volume
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  // Update muted state on the audio element
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = isMuted;
  }, [isMuted]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Autoplay Strategy:
  // 1. Attempt automatic audible playback on mount.
  // 2. If browser blocks audible autoplay, show subtle prompt and listen for first gesture.
  // 3. Trigger playback immediately on "Open Invitation" or any user tap.
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !audioUrl || !audioRef.current) return;

    const audio = audioRef.current;
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = volume;
    audio.muted = isMuted;

    let hasInteracted = false;

    // Attempt direct autoplay
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch(() => {
          // Autoplay blocked by browser policy without user gesture
          setIsPlaying(false);
          setAutoplayBlocked(true);

          // One-time fallback: start audio on first document interaction
          const onFirstInteraction = () => {
            if (hasInteracted || !audioRef.current) return;
            hasInteracted = true;
            audioRef.current
              .play()
              .then(() => {
                setIsPlaying(true);
                setAutoplayBlocked(false);
              })
              .catch(() => {});

            window.removeEventListener("pointerdown", onFirstInteraction);
            window.removeEventListener("keydown", onFirstInteraction);
          };

          window.addEventListener("pointerdown", onFirstInteraction, { passive: true });
          window.addEventListener("keydown", onFirstInteraction, { passive: true });
        });
    }

    // Clean up audio on unmount (e.g. leaving /invitation)
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [enabled, audioUrl]);

  // When user clicks "Open Invitation", start immediately
  useEffect(() => {
    if (!autoPlayTrigger || !enabled || !audioRef.current) return;
    const audio = audioRef.current;
    if (audio.paused) {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch(() => {});
    }
  }, [autoPlayTrigger, enabled]);

  // Primary toggle: If playing, mute/unmute per prompt requirements.
  // If paused/blocked, starts playback.
  function handleMainAction() {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    if (autoplayBlocked || audio.paused) {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch(() => {});
      return;
    }

    // Toggle mute
    const nextMuted = !isMuted;
    audio.muted = nextMuted;
    setIsMuted(nextMuted);
    try {
      sessionStorage.setItem(MUTED_KEY, String(nextMuted));
    } catch {}
  }

  // Explicit Pause / Resume toggle in expanded panel
  function togglePausePlay(e: React.MouseEvent) {
    e.stopPropagation();
    if (!audioRef.current) return;
    const audio = audioRef.current;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch(() => {});
    }
  }

  // Explicit Mute toggle in expanded panel
  function toggleMute(e: React.MouseEvent) {
    e.stopPropagation();
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    try {
      sessionStorage.setItem(MUTED_KEY, String(nextMuted));
    } catch {}
  }

  if (!enabled || !audioUrl) {
    return null;
  }

  return (
    <>
      {/* Universal audio element with source fallbacks */}
      <audio
        ref={audioRef}
        preload="auto"
        loop
        playsInline
        onEnded={() => {
          // Continuous loop safety: immediately restart
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }
        }}
        onPause={() => setIsPlaying(false)}
        onPlay={() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        }}
      >
        <source src={audioUrl} type={audioUrl.endsWith(".mp3") ? "audio/mpeg" : "audio/mp4"} />
        {mp3Url ? <source src={mp3Url} type="audio/mpeg" /> : null}
        {m4aUrl ? <source src={m4aUrl} type="audio/mp4" /> : null}
      </audio>

      {/* Floating Audio Controller */}
      <aside
        aria-label="Wedding Invitation Background Music"
        className="fixed right-4 bottom-5 z-40 flex flex-col items-end gap-2 sm:right-6 sm:bottom-6"
      >
        {/* Subtle Tap-to-Play prompt when browser blocks initial autoplay */}
        {mounted && autoplayBlocked && !isPlaying ? (
          <button
            type="button"
            onClick={handleMainAction}
            className="animate-bounce flex items-center gap-2 rounded-full border border-[#d4a843] bg-gradient-to-r from-[#fffdf7] to-[#faf3e2] px-3.5 py-1.5 text-[11px] font-semibold text-[#8b1a1a] shadow-[0_4px_16px_rgba(75,45,20,0.18)] transition-all hover:scale-105 active:scale-95 sm:text-[12px]"
          >
            <Music className="size-3.5 animate-pulse text-[#8b1a1a]" />
            <span>Tap to play wedding music</span>
          </button>
        ) : null}

        {/* Expanded Panel for Pause/Resume, Track Title & Volume Slider */}
        {isExpanded ? (
          <div className="flex w-64 flex-col gap-3 rounded-2xl border border-[#d4a843]/60 bg-[#fffdf7]/95 p-3.5 shadow-[0_8px_28px_rgba(75,45,20,0.18)] backdrop-blur-md transition-all">
            <div className="flex items-center justify-between border-b border-[#d4a843]/30 pb-2">
              <span className="truncate text-[12px] font-medium text-[#3d1c00]">
                {title}
              </span>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="text-[11px] text-[#996515] hover:text-[#8b1a1a]"
                aria-label="Close music settings"
              >
                Done
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              {/* Secondary Play / Pause */}
              <button
                type="button"
                onClick={togglePausePlay}
                className="flex items-center gap-1.5 rounded-full bg-[#8b1a1a] px-3 py-1 text-[11px] font-medium text-[#fffdf7] hover:bg-[#721515]"
              >
                {isPlaying ? (
                  <>
                    <Pause className="size-3" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="size-3 ml-0.5" />
                    <span>Resume</span>
                  </>
                )}
              </button>

              {/* Mute toggle button */}
              <button
                type="button"
                onClick={toggleMute}
                className="flex items-center gap-1 text-[11px] font-medium text-[#5c4033] hover:text-[#8b1a1a]"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="size-3.5 text-[#8b1a1a]" />
                    <span>Unmute</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="size-3.5 text-[#8b1a1a]" />
                    <span>Mute</span>
                  </>
                )}
              </button>
            </div>

            {/* Volume range slider */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-[#5c4033]">Volume:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  if (isMuted && val > 0) setIsMuted(false);
                }}
                className="h-1.5 flex-1 accent-[#8b1a1a]"
                aria-label="Volume slider"
              />
              <span className="w-8 text-right text-[10px] font-medium text-[#8b1a1a]">
                {isMuted ? "0%" : `${Math.round(volume * 100)}%`}
              </span>
            </div>
          </div>
        ) : null}

        {/* Circular Floating Music Control Pill (44x44px minimum accessible touch target) */}
        <div className="flex items-center gap-1.5 rounded-full border border-[#d4a843]/80 bg-[#fffdf7]/95 p-1 shadow-[0_6px_22px_rgba(75,45,20,0.18)] backdrop-blur-md">
          {/* Main Action Button (44×44px hit-area): Clicking toggles Mute/Unmute when playing, or Play when stopped */}
          <button
            type="button"
            onClick={handleMainAction}
            className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-[#fffdf7] via-[#faf3e2] to-[#f5ead0] text-[#8b1a1a] shadow-xs transition-transform hover:scale-105 active:scale-95"
            aria-label={
              autoplayBlocked || !isPlaying
                ? "Play wedding music"
                : isMuted
                ? "Unmute wedding music"
                : "Mute wedding music"
            }
            title={
              autoplayBlocked || !isPlaying
                ? "Play wedding music"
                : isMuted
                ? "Click to unmute"
                : "Click to mute"
            }
          >
            {autoplayBlocked || !isPlaying ? (
              <Play className="ml-0.5 size-5 text-[#8b1a1a]" />
            ) : isMuted ? (
              <VolumeX className="size-5 text-[#8b1a1a]" />
            ) : (
              /* Animated South Indian gold/burgundy sound equalizer bars */
              <div className="flex items-center gap-0.5">
                <span className="h-3 w-0.5 rounded-full bg-[#8b1a1a] animate-[pulse_0.9s_ease-in-out_infinite]" />
                <span className="h-5 w-0.5 rounded-full bg-[#d4a843] animate-[pulse_0.6s_ease-in-out_infinite]" />
                <span className="h-3.5 w-0.5 rounded-full bg-[#8b1a1a] animate-[pulse_1.1s_ease-in-out_infinite]" />
              </div>
            )}
          </button>

          {/* Secondary Expand toggle (to access Pause/Resume & Volume) */}
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex size-8 items-center justify-center rounded-full text-[#996515] transition-colors hover:bg-[#faf3e2] hover:text-[#8b1a1a]"
            aria-label={isExpanded ? "Collapse music options" : "Expand music options"}
            title="Music settings"
          >
            <ChevronUp
              className={cn(
                "size-4 transition-transform duration-300",
                isExpanded ? "rotate-180" : ""
              )}
            />
          </button>
        </div>
      </aside>
    </>
  );
}
