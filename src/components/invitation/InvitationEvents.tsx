"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin, Navigation } from "lucide-react";
import type { WeddingEvent } from "@/types/database";
import { mediaUrl } from "@/lib/storage/media";
import { pickImage } from "@/lib/storage/imagery";
import { formatTimeRange } from "@/lib/utils/datetime";
import { TraditionalMotifDivider } from "./TraditionalMotifDivider";
import { MandalaDecoration } from "./MandalaDecoration";

export function InvitationEvents({
  events,
  timezone,
}: {
  events: WeddingEvent[];
  timezone: string;
}) {
  if (!events || events.length === 0) return null;

  return (
    <section aria-labelledby="events-heading" className="relative overflow-hidden py-14 sm:py-20 lg:py-24 bg-[#fdf5e6]">
      {/* Background Mandala Accents */}
      <div className="absolute top-1/2 -left-20 -translate-y-1/2">
        <MandalaDecoration size={240} opacity={0.10} />
      </div>
      <div className="absolute top-1/2 -right-20 -translate-y-1/2">
        <MandalaDecoration size={240} opacity={0.10} />
      </div>

      <div className="relative z-10 mx-auto max-w-[1040px] px-4 sm:px-6">
        <div className="text-center">
          <p className="font-[family-name:var(--font-script)] text-[28px] text-[#8b1a1a] sm:text-[32px]">
            Sacred Ceremonies
          </p>
          <h2
            id="events-heading"
            className="mt-1 font-[family-name:var(--font-playfair)] text-[34px] font-bold text-[#3d1c00] sm:text-[44px]"
          >
            Wedding Celebrations
          </h2>
          <div className="mx-auto my-4 max-w-[320px]">
            <TraditionalMotifDivider size="sm" />
          </div>
          <p className="mx-auto max-w-[56ch] font-[family-name:var(--font-serif)] text-[18px] text-[#5c4033]">
            Join us in commemorating every ritual and celebratory occasion as two families become one.
          </p>
        </div>

        {/* 2-Column Responsive Grid matching Blueprint */}
        <div className="mt-12 grid gap-6 sm:mt-16 sm:grid-cols-2 lg:gap-8">
          {events.map((event) => {
            const imgRef = event.image_path || pickImage(null, `event-${event.event_type}`);
            const imgUrl = mediaUrl(imgRef) ?? "/images/ai/wedding-ceremony.webp";
            const rawTime = formatTimeRange(event.start_time, event.end_time);
            const timeStr = event.time_label || (rawTime ? `${rawTime} (IST)` : null);
            const venue = event.venue;
            const dest = venue
              ? venue.latitude && venue.longitude
                ? `${venue.latitude},${venue.longitude}`
                : [venue.name, venue.address, venue.city, venue.state, venue.country].filter(Boolean).join(", ")
              : null;
            const directionsUrl = dest ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}` : null;

            return (
              <div
                key={event.id}
                className="group flex flex-col overflow-hidden rounded-[16px] border border-[#d4a843]/60 bg-[#fffcf7] shadow-[0_4px_20px_rgba(61,28,0,0.05)] transition-all duration-300 hover:border-[#8b1a1a] hover:shadow-[0_8px_30px_rgba(139,26,26,0.12)]"
              >
                {/* Event Photo */}
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={imgUrl}
                    alt={event.image_alt || event.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 480px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3d1c00]/65 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 rounded-full border border-[#d4a843]/50 bg-[#8b1a1a]/95 px-3.5 py-1 text-[11px] font-semibold tracking-wider text-[#fdf5e6] uppercase shadow-xs">
                    {event.event_type}
                  </span>
                </div>

                {/* Event Details */}
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <h3 className="font-[family-name:var(--font-playfair)] text-[24px] font-bold text-[#8b1a1a]">
                    {event.name}
                  </h3>

                  {event.short_description ? (
                    <p className="mt-2 text-[14px] leading-relaxed text-[#7b6a58]">
                      {event.short_description}
                    </p>
                  ) : null}

                  <div className="mt-5 space-y-2.5 text-[13px] text-[#5c4033] border-t border-[#e5d5bd]/60 pt-4">
                    {/* Date */}
                    <div className="flex items-center gap-2.5">
                      <Calendar className="size-4 shrink-0 text-[#8b1a1a]" />
                      <span className="font-semibold text-[#3d1c00]">
                        {event.event_date
                          ? new Date(event.event_date + "T00:00:00Z").toLocaleDateString("en-IN", {
                              timeZone: "UTC",
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Details will be announced soon"}
                      </span>
                    </div>

                    {/* Time */}
                    {timeStr ? (
                      <div className="flex items-center gap-2.5">
                        <Clock className="size-4 shrink-0 text-[#8b1a1a]" />
                        <span>{timeStr}</span>
                      </div>
                    ) : null}

                    {/* Venue */}
                    {venue ? (
                      <div className="flex items-start gap-2.5">
                        <MapPin className="size-4 shrink-0 text-[#8b1a1a] mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#3d1c00]">{venue.name}</p>
                          <p className="text-[12px] text-[#7b6a58]">{venue.address || venue.city}</p>
                        </div>
                      </div>
                    ) : null}

                    {/* Dress Code */}
                    {event.dress_code ? (
                      <div className="mt-3 rounded-[6px] border border-[#d4a843]/40 bg-[#f5ebd5]/40 px-3 py-1.5 text-[12px] text-[#5c4033]">
                        <span className="font-semibold text-[#8b1a1a]">Dress Code:</span> {event.dress_code}
                      </div>
                    ) : null}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex items-center justify-between gap-3 pt-3 border-t border-[#e5d5bd]/60">
                    <Link
                      href={`/events/${event.slug}`}
                      className="rounded-[6px] border border-[#d4a843] bg-transparent px-4 py-2 text-[12px] font-medium text-[#3d1c00] transition-colors hover:bg-[#d4a843]/15"
                    >
                      View Details
                    </Link>

                    {directionsUrl ? (
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#8b1a1a] px-4 py-2 text-[12px] font-medium text-[#fdf5e6] shadow-xs transition-colors hover:bg-[#721515]"
                      >
                        <Navigation className="size-3.5" />
                        <span>Get Directions</span>
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
