export function MandalaDecoration({
  className = "",
  size = 200,
  opacity = 0.14,
}: {
  className?: string;
  size?: number;
  opacity?: number;
}) {
  return (
    <div
      aria-hidden="true"
      style={{ width: size, height: size, opacity }}
      className={`pointer-events-none select-none text-[#d4a843] ${className}`}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        {/* Concentric rings */}
        <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
        <circle cx="100" cy="100" r="82" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="100" cy="100" r="68" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="100" cy="100" r="48" stroke="currentColor" strokeWidth="1" />
        <circle cx="100" cy="100" r="28" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="100" cy="100" r="10" stroke="currentColor" strokeWidth="1" />

        {/* 16 Radial Petals Outer */}
        {Array.from({ length: 16 }).map((_, i) => {
          const deg = i * 22.5;
          return (
            <g key={`outer-${i}`} transform={`rotate(${deg} 100 100)`}>
              <path
                d="M100,18 C108,35 106,60 100,75 C94,60 92,35 100,18 Z"
                stroke="currentColor"
                strokeWidth="0.8"
                fill="currentColor"
                fillOpacity="0.08"
              />
              <circle cx="100" cy="10" r="2" fill="currentColor" />
            </g>
          );
        })}

        {/* 8 Radial Petals Inner */}
        {Array.from({ length: 8 }).map((_, i) => {
          const deg = i * 45;
          return (
            <g key={`inner-${i}`} transform={`rotate(${deg} 100 100)`}>
              <path
                d="M100,52 C106,64 104,78 100,88 C96,78 94,64 100,52 Z"
                stroke="currentColor"
                strokeWidth="1"
                fill="currentColor"
                fillOpacity="0.15"
              />
            </g>
          );
        })}

        {/* Center Floral Core */}
        <circle cx="100" cy="100" r="5" fill="currentColor" fillOpacity="0.3" />
      </svg>
    </div>
  );
}
