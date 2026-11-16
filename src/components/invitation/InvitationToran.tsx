import { useId } from "react";

/**
 * Traditional South Indian Mango Leaf & Marigold Flower Toran
 * Rendered as an authentic, responsive vector garland with glossy green
 * mango leaves (maavilai) and radiant saffron-orange marigold blossoms (genda phool).
 */
export function InvitationToran({
  className = "",
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  const id = useId();

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none w-full overflow-hidden select-none ${className} ${
        flip ? "rotate-180" : ""
      }`}
    >
      <style>{`
        @keyframes toranLeafSway {
          0%, 100% { transform-origin: top center; transform: rotate(0deg); }
          50% { transform-origin: top center; transform: rotate(1.2deg); }
        }
        .toran-leaf-sway-1 {
          animation: toranLeafSway 5s ease-in-out infinite;
        }
        .toran-leaf-sway-2 {
          animation: toranLeafSway 6.5s ease-in-out infinite 1.5s;
        }
        .toran-leaf-sway-3 {
          animation: toranLeafSway 5.8s ease-in-out infinite 2.8s;
        }
        @media (prefers-reduced-motion: reduce) {
          .toran-leaf-sway-1, .toran-leaf-sway-2, .toran-leaf-sway-3 {
            animation: none !important;
          }
        }
      `}</style>
      <svg
        viewBox="0 0 1200 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="h-12 w-full sm:h-16 md:h-18"
      >
        <defs>
          {/* Leaf Gradients */}
          <linearGradient id={`${id}-leaf-dark`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e5c22" />
            <stop offset="60%" stopColor="#2e7d32" />
            <stop offset="100%" stopColor="#1b4d1c" />
          </linearGradient>
          <linearGradient id={`${id}-leaf-light`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#388e3c" />
            <stop offset="70%" stopColor="#4caf50" />
            <stop offset="100%" stopColor="#2e7d32" />
          </linearGradient>
          {/* Marigold Orange & Gold Gradients */}
          <radialGradient id={`${id}-marigold-orange`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffe082" />
            <stop offset="35%" stopColor="#ffa000" />
            <stop offset="75%" stopColor="#f57c00" />
            <stop offset="100%" stopColor="#e65100" />
          </radialGradient>
          <radialGradient id={`${id}-marigold-yellow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff9c4" />
            <stop offset="40%" stopColor="#ffeb3b" />
            <stop offset="80%" stopColor="#fbc02d" />
            <stop offset="100%" stopColor="#f57f17" />
          </radialGradient>
          {/* Gold string */}
          <linearGradient id={`${id}-gold-thread`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#d4a843" />
            <stop offset="50%" stopColor="#ffd54f" />
            <stop offset="100%" stopColor="#d4a843" />
          </linearGradient>

          {/* Reusable Mango Leaf Shape */}
          <g id={`${id}-mango-leaf`}>
            {/* Outer Leaf Body */}
            <path
              d="M0,0 C12,15 18,35 0,56 C-18,35 -12,15 0,0 Z"
              fill={`url(#${id}-leaf-dark)`}
            />
            {/* Center spine */}
            <path d="M0,0 L0,53" stroke="#81c784" strokeWidth="1" opacity="0.75" />
            {/* Side veins */}
            <path
              d="M0,12 Q5,16 9,20 M0,22 Q6,27 10,31 M0,32 Q5,37 8,41 M0,12 Q-5,16 -9,20 M0,22 Q-6,27 -10,31 M0,32 Q-5,37 -8,41"
              stroke="#81c784"
              strokeWidth="0.75"
              opacity="0.55"
            />
          </g>

          {/* Reusable Marigold Flower */}
          <g id={`${id}-marigold-cluster`}>
            <circle cx="0" cy="0" r="10.5" fill={`url(#${id}-marigold-orange)`} />
            <circle cx="-3" cy="-2" r="4.5" fill={`url(#${id}-marigold-yellow)`} opacity="0.8" />
            <circle cx="3" cy="-2" r="4.5" fill={`url(#${id}-marigold-yellow)`} opacity="0.8" />
            <circle cx="0" cy="3" r="4" fill={`url(#${id}-marigold-yellow)`} opacity="0.85" />
            <circle cx="0" cy="0" r="2.5" fill="#e65100" />
          </g>
        </defs>

        {/* Hanging Golden Thread Arc */}
        <path
          d="M0,4 Q150,14 300,4 Q450,14 600,4 Q750,14 900,4 Q1050,14 1200,4"
          stroke={`url(#${id}-gold-thread)`}
          strokeWidth="3.5"
          fill="none"
        />

        {/* Repeating Mango Leaves Array (24 Leaves spaced across 1200px) */}
        {Array.from({ length: 25 }).map((_, i) => {
          const x = i * 50;
          const yOffset = Math.round((Math.sin((i / 3) * Math.PI) * 3 + 4) * 100) / 100;
          const rotation = ((i % 3) - 1) * 7;
          const swayClass =
            i % 3 === 0
              ? "toran-leaf-sway-1"
              : i % 3 === 1
              ? "toran-leaf-sway-2"
              : "toran-leaf-sway-3";
          return (
            <g
              key={i}
              transform={`translate(${x}, ${yOffset}) rotate(${rotation})`}
              className={swayClass}
            >
              <use href={`#${id}-mango-leaf`} />
            </g>
          );
        })}

        {/* Marigold Flower Accents placed at intervals */}
        {Array.from({ length: 13 }).map((_, i) => {
          const x = i * 100;
          const yOffset = Math.round((Math.sin((i / 1.5) * Math.PI) * 2 + 5) * 100) / 100;
          return (
            <g key={i} transform={`translate(${x}, ${yOffset})`}>
              <use href={`#${id}-marigold-cluster`} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
