"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin, Navigation, Sparkles } from "lucide-react";
import type { WeddingEvent } from "@/types/database";
import { mediaUrl } from "@/lib/storage/media";
import { pickImage } from "@/lib/storage/imagery";
import { formatTimeRange } from "@/lib/utils/datetime";

export function InvitationEvents({
  events,
  timezone,
}: {
  events: WeddingEvent[];
  timezone: string;
}) {
  if (!events || events.length === 0) return null;

  return (
    <section aria-labelledby="events-heading" className="py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6">
        <div className="text-center">
          <p className="font-[family-name:var(--font-script)] text-[28px] text-[#8b1a1a]">
            Celebrations &amp; Ceremonies
          </p>
          <h2 id="events-heading" className="mt-1 font-[family-name:var(--font-playfair)] text-[34px] font-bold text-[#3d1c00] sm:text-[44px]">
            Wedding Events &amp; Schedule
          </h2>
          <div className="mx-auto my-4 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-[#d4a843]" />
            <Sparkles className="size-4 text-[#d4a843]" />
            <span className="h-px w-12 bg-[#d4a843]" />
          </div>
          <p className="mx-auto max-w-[56ch] font-[family-name:var(--font-serif)] text-[18px] text-[#5c4033]">
            Join us in commemorating every ritual and celebratory occasion as two families become one.
          </p>
        </div>

        {/* Events list */}
        <div className="mt-12 grid gap-8 sm:mt-16 sm:grid-cols-2">
          {events.map((event) => {
            const imgRef = event.image_path || pickImage(null, `event-${event.event_type}`);
            const imgUrl = mediaUrl(imgRef) ?? "/images/ai/wedding-ceremony.webp";
            const timeStr = formatTimeRange(event.start_time, event.end_time);
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
                className="group flex flex-col overflow-hidden rounded-[16px] border border-[#d4a843]/50 bg-[#fffcf7] shadow-sm transition-all duration-300 hover:border-[#8b1a1a]/60 hover:shadow-md"
              >
                {/* Event Photo */}
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={imgUrl}
                    alt={event.image_alt || event.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 460px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3d1c00]/60 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 rounded-full bg-[#8b1a1a]/95 px-3 py-1 text-[11px] font-medium tracking-wider text-[#fdf5e6] uppercase">
                    {event.event_type}
                  </span>
                </div>

                {/* Event Details */}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-[family-name:var(--font-playfair)] text-[24px] font-bold text-[#3d1c00]">
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
                      <span className="font-medium">
                        {event.event_date
                          ? new Date(event.event_date + "T00:00:00").toLocaleDateString("en-IN", {
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
                        <span>{timeStr} (IST)</span>
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
                      <div className="mt-3 rounded-[6px] bg-[#f5ebd5]/50 px-3 py-1.5 text-[12px] text-[#5c4033]">
                        <span className="font-medium text-[#8b1a1a]">Dress Code:</span> {event.dress_code}
                      </div>
                    ) : null}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex items-center gap-3 pt-3 border-t border-[#e5d5bd]/60">
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
                        <span>Directions</span>
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
