export const PUBLIC_NAV = [
  { href: "/", label: "Home" },
  { href: "/story", label: "Our Story" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/locations", label: "Location" },
  { href: "/live", label: "Live" },
] as const;

export const PRIMARY_CTA = { href: "/register", label: "Win a Special Gift" } as const;

export const SIDE_LABEL = { bride: "Bride Side", groom: "Groom Side" } as const;
export const GENDER_LABEL = { male: "Male", female: "Female" } as const;
export const GIFT_STATUS_LABEL = { pending: "Pending", contacted: "Contacted", delivered: "Delivered" } as const;
export const STREAM_STATUS_LABEL = { upcoming: "Upcoming", live: "Live Now", ended: "Replay" } as const;

export const EVENT_TYPE_LABEL = {
  engagement: "Engagement",
  haldi: "Haldi",
  mehendi: "Mehendi",
  sangeet: "Sangeet",
  wedding: "Wedding",
  reception: "Reception",
  other: "Celebration",
} as const;

/** Placeholder labels used when the owner has not supplied content yet. Never invented details. */
export const PLACEHOLDER = {
  bride: "Bride",
  groom: "Groom",
  date: "Date to be announced",
} as const;

export const GALLERY_PAGE_SIZE = 24;
export const ADMIN_PAGE_SIZE = 25;

