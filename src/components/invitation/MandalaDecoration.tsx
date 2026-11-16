import React from "react";

export function MandalaDecoration({
  size = 240,
  className = "",
  opacity = 0.22,
}: {
  size?: number;
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      style={{ width: size, height: size, opacity }}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-[#d4a843]"
      >
        <g stroke="currentColor" strokeWidth="1.2">
          {/* Outer circle rings */}
          <circle cx="100" cy="100" r="92" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="85" />
          <circle cx="100" cy="100" r="72" strokeWidth="0.8" />
          <circle cx="100" cy="100" r="54" />
          <circle cx="100" cy="100" r="32" strokeWidth="0.8" />
          <circle cx="100" cy="100" r="16" />
          <circle cx="100" cy="100" r="4" fill="currentColor" />

          {/* 16 Petals / Rays */}
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i * 360) / 16;
            return (
              <g key={i} transform={`rotate(${angle} 100 100)`}>
                <path d="M 100 28 C 94 45, 94 65, 100 84 C 106 65, 106 45, 100 28 Z" fill="currentColor" fillOpacity="0.08" />
                <path d="M 100 15 C 96 22, 96 25, 100 32 C 104 25, 104 22, 100 15 Z" fill="currentColor" fillOpacity="0.2" />
                <circle cx="100" cy="10" r="2" fill="currentColor" />
                <line x1="100" y1="32" x2="100" y2="54" strokeWidth="0.8" />
              </g>
            );
          })}

          {/* 8 Inner decorative diamond florets */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 360) / 8 + 22.5;
            return (
              <g key={i} transform={`rotate(${angle} 100 100)`}>
                <path d="M 100 68 L 96 74 L 100 80 L 104 74 Z" fill="currentColor" fillOpacity="0.25" />
                <circle cx="100" cy="62" r="1.5" fill="currentColor" />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
