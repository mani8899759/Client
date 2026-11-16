"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin, Navigation } from "lucide-react";
import type { WeddingEvent } from "@/types/database";
import { mediaUrl } from "@/lib/storage/media";
import { pickImage } from "@/lib/storage/imagery";
import { formatTimeRange } from "@/lib/utils/datetime";
import { TempleArchMotif, FloralDivider } from "./TraditionalMotifs";

export function InvitationEvents({
  events,
  timezone,
}: {
  events: WeddingEvent[];
  timezone: string;
}) {
  if (!events || events.length === 0) return null;

  return (
    <section aria-labelledby="events-heading" className="py-16 sm:py-24 bg-[#fdf5e6]">
      <div className="mx-auto max-w-[1000px] px-4 sm:px-6">
        <div className="text-center">
          <TempleArchMotif className="mb-3" />
          <p className="font-[family-name:var(--font-script)] text-[30px] text-[#8b1a1a] sm:text-[36px]">
            Auspicious Ceremonies
          </p>
          <h2
            id="events-heading"
            className="mt-1 font-[family-name:var(--font-playfair)] text-[34px] font-bold text-[#3d1c00] sm:text-[44px]"
          >
            Wedding Celebrations
          </h2>
          <FloralDivider className="my-3" />
          <p className="mx-auto max-w-[56ch] font-[family-name:var(--font-serif)] text-[18px] text-[#5c4033] sm:text-[20px]">
            Join us in commemorating every ritual and celebratory occasion as two families become one.
          </p>
        </div>

        {/* 2-Column Responsive Events Grid — matching reference blueprint */}
        <div className="mt-12 grid gap-6 sm:mt-16 sm:grid-cols-2">
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
                className="group relative flex flex-col overflow-hidden rounded-[14px] border-2 border-[#d4a843]/50 bg-[#fffcf7] p-6 shadow-xs transition-all duration-300 hover:border-[#8b1a1a] hover:shadow-md"
              >
                {/* Decorative corner accent */}
                <div className="pointer-events-none absolute top-2 right-2 size-4 border-t border-r border-[#d4a843]" />
                <div className="pointer-events-none absolute bottom-2 left-2 size-4 border-b border-l border-[#d4a843]" />

                <div className="flex items-center justify-between gap-2 border-b border-[#d4a843]/30 pb-3">
                  <span className="font-[family-name:var(--font-playfair)] text-[22px] font-bold text-[#8b1a1a]">
                    {event.name}
                  </span>
                  <span className="rounded-full bg-[#f5ebd5] px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-[#5c4033] uppercase">
                    {event.event_type}
                  </span>
                </div>

                {event.short_description ? (
                  <p className="mt-3 text-[14px] leading-relaxed text-[#7b6a58]">
                    {event.short_description}
                  </p>
                ) : null}

                <div className="mt-4 space-y-2 text-[13px] text-[#5c4033]">
                  {/* Date */}
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 shrink-0 text-[#8b1a1a]" />
                    <span className="font-semibold text-[#3d1c00]">
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
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 shrink-0 text-[#8b1a1a]" />
                      <span>{timeStr}</span>
                    </div>
                  ) : null}

                  {/* Venue */}
                  {venue ? (
                    <div className="flex items-start gap-2">
                      <MapPin className="size-4 shrink-0 text-[#8b1a1a] mt-0.5" />
                      <div>
                        <span className="font-medium text-[#3d1c00]">{venue.name}</span>
                        {venue.address ? (
                          <p className="text-[12px] text-[#7b6a58]">{venue.address}</p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {/* Dress Code */}
                  {event.dress_code ? (
                    <div className="mt-2 text-[12px] text-[#7b6a58]">
                      <span className="font-medium text-[#8b1a1a]">Dress Code:</span> {event.dress_code}
                    </div>
                  ) : null}
                </div>

                {/* Get Directions Link */}
                {directionsUrl ? (
                  <div className="mt-5 border-t border-[#d4a843]/30 pt-3">
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#8b1a1a] hover:underline"
                    >
                      <Navigation className="size-3.5" />
                      <span>Get Directions</span>
                    </a>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
