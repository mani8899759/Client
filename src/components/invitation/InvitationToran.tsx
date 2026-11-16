import React from "react";

export function InvitationToran({ position = "top", className = "" }: { position?: "top" | "bottom"; className?: string }) {
  // A traditional Indian wedding toran featuring mango leaves and marigold blossoms
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none w-full overflow-hidden ${
        position === "top" ? "top-0 left-0" : "bottom-0 left-0 rotate-180"
      } ${className}`}
    >
      <svg
        viewBox="0 0 1200 68"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto min-w-[700px] object-cover"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Leaf gradient */}
          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2e7d32" />
            <stop offset="60%" stopColor="#1b5e20" />
            <stop offset="100%" stopColor="#0d3c13" />
          </linearGradient>
          {/* Marigold orange gradient */}
          <radialGradient id="marigoldOrange" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffb703" />
            <stop offset="65%" stopColor="#fb8500" />
            <stop offset="100%" stopColor="#c85000" />
          </radialGradient>
          {/* Marigold yellow gradient */}
          <radialGradient id="marigoldYellow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff3b0" />
            <stop offset="65%" stopColor="#ffd166" />
            <stop offset="100%" stopColor="#d4a843" />
          </radialGradient>
        </defs>

        {/* Supporting garland twine rope across the top */}
        <path d="M0 6 Q 300 14, 600 6 Q 900 14, 1200 6" stroke="#b8860b" strokeWidth="3" strokeDasharray="6 3" />
        <path d="M0 6 Q 300 14, 600 6 Q 900 14, 1200 6" stroke="#8b1a1a" strokeWidth="1.5" />

        {/* Repeating Mango Leaves and Marigolds */}
        {Array.from({ length: 24 }).map((_, i) => {
          const x = i * 50 + 12;
          const isAlt = i % 2 === 0;
          return (
            <g key={i} transform={`translate(${x}, 6)`}>
              {/* Mango Leaf */}
              <path
                d="M 0 0 C -8 18, -12 36, 0 54 C 12 36, 8 18, 0 0 Z"
                fill="url(#leafGrad)"
                stroke="#145214"
                strokeWidth="0.8"
                filter="drop-shadow(0 2px 3px rgba(0,0,0,0.15))"
              />
              {/* Leaf central vein */}
              <line x1="0" y1="2" x2="0" y2="48" stroke="#4caf50" strokeWidth="0.7" opacity="0.7" />

              {/* Marigold Blossom hanging at the joint */}
              <circle
                cx="0"
                cy="10"
                r="7"
                fill={isAlt ? "url(#marigoldOrange)" : "url(#marigoldYellow)"}
                stroke="#9a3412"
                strokeWidth="0.6"
              />
              <circle
                cx="0"
                cy="10"
                r="4.5"
                fill={isAlt ? "#ffa200" : "#ffe66d"}
                stroke="#e85d04"
                strokeWidth="0.5"
                strokeDasharray="1.5 1"
              />
              <circle
                cx="0"
                cy="10"
                r="2"
                fill="#ffffff"
                opacity="0.8"
              />

              {/* Secondary floral bead dropping slightly lower */}
              {isAlt && (
                <circle
                  cx="0"
                  cy="20"
                  r="3.5"
                  fill="url(#marigoldYellow)"
                  stroke="#b8860b"
                  strokeWidth="0.5"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
