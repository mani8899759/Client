import React from "react";

/**
 * Auspicious Indian Wedding Motifs inspired by traditional South Indian ceremonies
 * - Royal elephants with ceremonial kalash arch
 * - Floral vine dividers
 * - Traditional marigold & mango leaf garland wreath for circular portraits
 */

export function TempleArchMotif({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none mx-auto flex items-center justify-center text-[#8b1a1a] ${className}`}>
      <svg
        viewBox="0 0 180 50"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-auto max-w-[180px]"
      >
        {/* Central Sacred Kalash / Floral Arch */}
        <g transform="translate(90, 25)">
          {/* Central Pot (Kalash) */}
          <ellipse cx="0" cy="4" rx="7" ry="5" fill="#8b1a1a" />
          <path d="M-5 1 C-5 -3 5 -3 5 1 Z" fill="#d4a843" />
          {/* Coconut & Mango Leaves on Kalash */}
          <circle cx="0" cy="-4" r="3.5" fill="#8b1a1a" />
          <path d="M-3 -3 L0 -10 L3 -3 Z" fill="#2d6a4f" />
          <path d="M-5 -2 L-8 -7 L-2 -3 Z" fill="#2d6a4f" />
          <path d="M5 -2 L8 -7 L2 -3 Z" fill="#2d6a4f" />
          {/* Decorative halo around Kalash */}
          <path d="M-12 10 Q 0 -14 12 10" stroke="#d4a843" strokeWidth="1.2" fill="none" />
        </g>

        {/* Left Royal Elephant facing right */}
        <g transform="translate(48, 12) scale(-1, 1)">
          {/* Elephant body */}
          <path
            d="M 12 18 C 12 6, 26 6, 32 12 C 34 8, 38 7, 40 10 C 42 12, 41 18, 41 24 C 40 28, 38 30, 36 30 L 34 26 L 31 26 L 30 30 L 22 30 L 24 24 L 18 24 L 17 30 L 12 30 C 11 26, 10 22, 12 18 Z"
            fill="#8b1a1a"
          />
          {/* Trunk raised with garland */}
          <path
            d="M 40 12 C 44 14, 46 8, 44 4 C 43 1, 46 2, 47 5 C 49 11, 44 20, 39 18 Z"
            fill="#8b1a1a"
          />
          {/* Ear */}
          <path d="M 28 11 C 32 10, 34 16, 30 18 C 27 19, 26 14, 28 11 Z" fill="#a82323" />
          {/* Tusk */}
          <path d="M 40 18 Q 43 16 44 14" stroke="#fffcf7" strokeWidth="1.5" strokeLinecap="round" />
          {/* Decorative saddle blanket (Howdah) */}
          <path d="M 20 12 L 28 12 L 27 22 L 21 22 Z" fill="#d4a843" />
          <circle cx="24" cy="17" r="1.5" fill="#8b1a1a" />
        </g>

        {/* Right Royal Elephant facing left */}
        <g transform="translate(132, 12)">
          {/* Elephant body */}
          <path
            d="M 12 18 C 12 6, 26 6, 32 12 C 34 8, 38 7, 40 10 C 42 12, 41 18, 41 24 C 40 28, 38 30, 36 30 L 34 26 L 31 26 L 30 30 L 22 30 L 24 24 L 18 24 L 17 30 L 12 30 C 11 26, 10 22, 12 18 Z"
            fill="#8b1a1a"
          />
          {/* Trunk raised with garland */}
          <path
            d="M 40 12 C 44 14, 46 8, 44 4 C 43 1, 46 2, 47 5 C 49 11, 44 20, 39 18 Z"
            fill="#8b1a1a"
          />
          {/* Ear */}
          <path d="M 28 11 C 32 10, 34 16, 30 18 C 27 19, 26 14, 28 11 Z" fill="#a82323" />
          {/* Tusk */}
          <path d="M 40 18 Q 43 16 44 14" stroke="#fffcf7" strokeWidth="1.5" strokeLinecap="round" />
          {/* Decorative saddle blanket */}
          <path d="M 20 12 L 28 12 L 27 22 L 21 22 Z" fill="#d4a843" />
          <circle cx="24" cy="17" r="1.5" fill="#8b1a1a" />
        </g>
      </svg>
    </div>
  );
}

export function FloralDivider({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none my-3 flex items-center justify-center gap-3 text-[#d4a843] ${className}`}>
      <span className="h-px w-14 bg-gradient-to-r from-transparent to-[#d4a843]" />
      <svg viewBox="0 0 40 20" fill="currentColor" className="h-4 w-8 text-[#8b1a1a]">
        <path d="M20 2 C16 8 8 10 2 10 C8 10 16 12 20 18 C24 12 32 10 38 10 C32 10 24 8 20 2 Z" fill="#8b1a1a" />
        <circle cx="20" cy="10" r="2.5" fill="#d4a843" />
        <circle cx="10" cy="10" r="1.5" fill="#d4a843" />
        <circle cx="30" cy="10" r="1.5" fill="#d4a843" />
      </svg>
      <span className="h-px w-14 bg-gradient-to-l from-transparent to-[#d4a843]" />
    </div>
  );
}

export function GarlandWreath({
  children,
  size = 200,
  className = "",
}: {
  children: React.ReactNode;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Decorative Wreath of Mango Leaves and Marigolds */}
      <svg
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none absolute inset-0 size-full z-10 select-none"
      >
        <defs>
          <linearGradient id="garlandLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2e7d32" />
            <stop offset="100%" stopColor="#0d3c13" />
          </linearGradient>
          <radialGradient id="garlandMarigold" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffd166" />
            <stop offset="60%" stopColor="#fb8500" />
            <stop offset="100%" stopColor="#c85000" />
          </radialGradient>
        </defs>

        {/* 16 Leaves around the circumference */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * 360) / 16;
          return (
            <g key={i} transform={`rotate(${angle} 120 120)`}>
              {/* Mango leaf pointing outward */}
              <path
                d="M 120 14 C 114 26, 114 40, 120 54 C 126 40, 126 26, 120 14 Z"
                fill="url(#garlandLeaf)"
                stroke="#1b5e20"
                strokeWidth="0.8"
              />
              <line x1="120" y1="18" x2="120" y2="50" stroke="#4caf50" strokeWidth="0.6" opacity="0.6" />
            </g>
          );
        })}

        {/* 16 Marigold flowers at the joints */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * 360) / 16 + 11.25;
          return (
            <g key={i} transform={`rotate(${angle} 120 120)`}>
              <circle cx="120" cy="30" r="6" fill="url(#garlandMarigold)" stroke="#b8860b" strokeWidth="0.8" />
              <circle cx="120" cy="30" r="3.5" fill="#ffd166" />
              <circle cx="120" cy="30" r="1.5" fill="#fff" opacity="0.8" />
            </g>
          );
        })}

        {/* Gold inner border ring */}
        <circle cx="120" cy="120" r="76" stroke="#d4a843" strokeWidth="2" strokeDasharray="4 2" />
        <circle cx="120" cy="120" r="72" stroke="#8b1a1a" strokeWidth="1" />
      </svg>

      {/* Inner Circular Child Container */}
      <div className="relative size-[64%] overflow-hidden rounded-full border-2 border-[#fffcf7] shadow-inner">
        {children}
      </div>
    </div>
  );
}
