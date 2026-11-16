import { useId, type ReactNode } from "react";

/**
 * Traditional South Indian Circular Floral Garland Frame
 * Wraps portrait photographs with a ceremonial wreath of radiating
 * green mango leaves and saffron marigold flowers, as seen in the reference invitation.
 */
export function CoupleGarlandFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const id = useId();

  return (
    <div className={`relative flex items-center justify-center p-5 sm:p-7 ${className}`}>
      {/* Radiating Mango Leaf & Marigold SVG Wreath */}
      <svg
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
      >
        <defs>
          <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e5c22" />
            <stop offset="60%" stopColor="#2e7d32" />
            <stop offset="100%" stopColor="#1b4d1c" />
          </linearGradient>
          <radialGradient id={`${id}-flower`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffe082" />
            <stop offset="40%" stopColor="#ffa000" />
            <stop offset="85%" stopColor="#f57c00" />
            <stop offset="100%" stopColor="#e65100" />
          </radialGradient>
        </defs>

        {/* 16 Radiating Mango Leaves around circumference */}
        {Array.from({ length: 16 }).map((_, i) => {
          const deg = i * 22.5;
          return (
            <g key={`leaf-${i}`} transform={`rotate(${deg} 120 120)`}>
              <path
                d="M120,6 C126,18 130,34 120,50 C110,34 114,18 120,6 Z"
                fill={`url(#${id}-leaf)`}
              />
              <path d="M120,6 L120,48" stroke="#81c784" strokeWidth="0.8" opacity="0.6" />
            </g>
          );
        })}

        {/* 16 Marigold flowers at inner leaf bases */}
        {Array.from({ length: 16 }).map((_, i) => {
          const deg = i * 22.5 + 11.25;
          return (
            <g key={`flower-${i}`} transform={`rotate(${deg} 120 120)`}>
              <circle cx="120" cy="34" r="7" fill={`url(#${id}-flower)`} />
              <circle cx="120" cy="34" r="2.5" fill="#ffd54f" />
            </g>
          );
        })}

        {/* Inner Gold Beaded Border */}
        <circle cx="120" cy="120" r="78" stroke="#d4a843" strokeWidth="2.5" />
        <circle cx="120" cy="120" r="74" stroke="#8b1a1a" strokeWidth="1" strokeDasharray="3 3" />
      </svg>

      {/* Portrait Content Slot */}
      <div className="relative size-32 overflow-hidden rounded-full border-2 border-[#d4a843] shadow-[0_4px_20px_rgba(61,28,0,0.12)] sm:size-40 md:size-44">
        {children}
      </div>
    </div>
  );
}
