export function TraditionalMotifDivider({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const heightClass =
    size === "sm" ? "h-8 sm:h-10" : size === "lg" ? "h-14 sm:h-20" : "h-10 sm:h-14";

  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center py-2 select-none ${className}`}
    >
      <svg
        viewBox="0 0 460 70"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={`${heightClass} w-auto text-[#8b1a1a] transition-colors`}
      >
        {/* Center Sacred Kalash & Coconut with Mango Leaves */}
        <g transform="translate(230, 35)">
          {/* Kalash pot */}
          <path
            d="M-10,5 C-12,14 12,14 10,5 C9,-1 -9,-1 -10,5 Z"
            fill="#8b1a1a"
          />
          {/* Kalash base */}
          <path d="M-6,14 L6,14 L4,17 L-4,17 Z" fill="#8b1a1a" />
          {/* Kalash neck & rim */}
          <path d="M-8,-1 L8,-1 L6,-4 L-6,-4 Z" fill="#8b1a1a" />
          {/* Mango leaves emerging from neck */}
          <path
            d="M-8,-4 Q-16,-14 -10,-19 Q-5,-12 -4,-4 Z"
            fill="#8b1a1a"
          />
          <path
            d="M8,-4 Q16,-14 10,-19 Q5,-12 4,-4 Z"
            fill="#8b1a1a"
          />
          <path
            d="M-3,-4 Q-6,-22 0,-25 Q6,-22 3,-4 Z"
            fill="#8b1a1a"
          />
          {/* Coconut on top */}
          <circle cx="0" cy="-14" r="5.5" fill="#8b1a1a" />
          <path d="M-1.5,-20 L1.5,-20 L0,-24 Z" fill="#8b1a1a" />
        </g>

        {/* Left Royal Caparisoned Wedding Elephant with Raised Trunk */}
        <g transform="translate(145, 12)">
          {/* Elephant Body */}
          <path
            d="M60,20 C60,8 46,2 32,2 C18,2 6,10 4,24 C2,34 3,46 5,50 C7,50 12,50 14,48 L14,38 C16,40 22,40 24,36 L24,48 L32,48 L32,36 C35,38 42,38 44,36 L44,48 L52,48 L52,32 C57,28 60,24 60,20 Z"
            fill="#8b1a1a"
          />
          {/* Head & Raised Trunk greeting the center */}
          <path
            d="M52,18 C58,16 66,10 70,2 C72,-4 76,-4 78,0 C80,6 74,16 66,22 C64,24 60,25 56,26 Z"
            fill="#8b1a1a"
          />
          {/* Tusk */}
          <path d="M64,22 C70,20 74,17 76,14 C73,17 68,19 62,20 Z" fill="#d4a843" />
          {/* Ear */}
          <path
            d="M48,10 C46,4 38,4 36,10 C34,18 42,22 46,20 C48,18 49,14 48,10 Z"
            fill="#8b1a1a"
            stroke="#fdf5e6"
            strokeWidth="0.8"
          />
          {/* Ornate Howdah / Blanket (Jhool) with decorative gold embroidery */}
          <path
            d="M20,12 L46,12 C48,22 46,28 42,30 L24,30 C20,28 18,22 20,12 Z"
            fill="#d4a843"
          />
          <circle cx="33" cy="21" r="3" fill="#8b1a1a" />
          {/* Tail */}
          <path d="M5,26 C2,32 1,38 3,42" stroke="#8b1a1a" strokeWidth="1.5" fill="none" />
        </g>

        {/* Right Royal Caparisoned Wedding Elephant (Mirrored) */}
        <g transform="translate(315, 12) scale(-1, 1)">
          {/* Elephant Body */}
          <path
            d="M60,20 C60,8 46,2 32,2 C18,2 6,10 4,24 C2,34 3,46 5,50 C7,50 12,50 14,48 L14,38 C16,40 22,40 24,36 L24,48 L32,48 L32,36 C35,38 42,38 44,36 L44,48 L52,48 L52,32 C57,28 60,24 60,20 Z"
            fill="#8b1a1a"
          />
          {/* Head & Raised Trunk */}
          <path
            d="M52,18 C58,16 66,10 70,2 C72,-4 76,-4 78,0 C80,6 74,16 66,22 C64,24 60,25 56,26 Z"
            fill="#8b1a1a"
          />
          {/* Tusk */}
          <path d="M64,22 C70,20 74,17 76,14 C73,17 68,19 62,20 Z" fill="#d4a843" />
          {/* Ear */}
          <path
            d="M48,10 C46,4 38,4 36,10 C34,18 42,22 46,20 C48,18 49,14 48,10 Z"
            fill="#8b1a1a"
            stroke="#fdf5e6"
            strokeWidth="0.8"
          />
          {/* Ornate Howdah / Blanket */}
          <path
            d="M20,12 L46,12 C48,22 46,28 42,30 L24,30 C20,28 18,22 20,12 Z"
            fill="#d4a843"
          />
          <circle cx="33" cy="21" r="3" fill="#8b1a1a" />
          {/* Tail */}
          <path d="M5,26 C2,32 1,38 3,42" stroke="#8b1a1a" strokeWidth="1.5" fill="none" />
        </g>

        {/* Left Ornate Filigree Scrollwork & Flourish */}
        <path
          d="M10,35 Q60,35 110,35 M20,35 Q40,24 60,35 Q80,46 100,35"
          stroke="#d4a843"
          strokeWidth="1.5"
          fill="none"
        />
        <circle cx="10" cy="35" r="3" fill="#8b1a1a" />
        <circle cx="30" cy="30" r="1.5" fill="#d4a843" />
        <circle cx="90" cy="40" r="1.5" fill="#d4a843" />

        {/* Right Ornate Filigree Scrollwork & Flourish */}
        <path
          d="M450,35 Q400,35 350,35 M440,35 Q420,24 400,35 Q380,46 360,35"
          stroke="#d4a843"
          strokeWidth="1.5"
          fill="none"
        />
        <circle cx="450" cy="35" r="3" fill="#8b1a1a" />
        <circle cx="430" cy="30" r="1.5" fill="#d4a843" />
        <circle cx="370" cy="40" r="1.5" fill="#d4a843" />
      </svg>
    </div>
  );
}
