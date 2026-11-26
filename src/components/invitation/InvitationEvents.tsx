"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Calendar, Clock, MapPin, Navigation, Sparkles } from "lucide-react";
import type { WeddingEvent } from "@/types/database";
import { mediaUrl } from "@/lib/storage/media";
import { pickImage } from "@/lib/storage/imagery";
import { formatTimeRange } from "@/lib/utils/datetime";
import { cn } from "@/lib/utils/cn";
import { TraditionalMotifDivider } from "./TraditionalMotifDivider";
import { MandalaDecoration } from "./MandalaDecoration";

const INVITATION_EVENT_ARTWORK: Record<string, string> = {
  mehndi: "/images/events/realistic/mehndi.webp",
  haldi: "/images/events/realistic/haldi.webp",
  sangeet: "/images/events/realistic/sangeet.webp",
  "wedding-ceremony": "/images/events/realistic/wedding.webp",
  reception: "/images/events/realistic/reception.webp",
};

export function InvitationEvents({
  events,
  timezone: _timezone,
}: {
  events: WeddingEvent[];
  timezone: string;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !events?.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        gsap.utils.toArray<HTMLElement>("[data-inv-event-card]").forEach((card) => {
          gsap.from(card, {
            y: 26,
            opacity: 0.25,
            duration: 0.7,
            ease: "power2.out",
            clearProps: "transform,opacity",
            scrollTrigger: {
              id: `invitation-event-${card.dataset.invEventCard ?? ""}`,
              trigger: card,
              start: "top 86%",
              toggleActions: "play none none none",
            },
          });
        });
      });

      mm.add("(max-width: 767px)", () => {
        gsap.utils.toArray<HTMLElement>("[data-inv-event-card]").forEach((card) => {
          gsap.from(card, {
            y: 16,
            opacity: 0.35,
            duration: 0.45,
            ease: "power2.out",
            clearProps: "transform,opacity",
            scrollTrigger: {
              id: `invitation-event-mobile-${card.dataset.invEventCard ?? ""}`,
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          });
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [events]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="events-heading"
      className="relative overflow-hidden bg-[#fdf5e6] py-14 sm:py-20 lg:py-24"
    >
      {/* Subtle Mandala Accents */}
      <div className="pointer-events-none absolute top-1/3 -left-24 hidden sm:block">
        <MandalaDecoration size={240} opacity={0.1} />
      </div>
      <div className="pointer-events-none absolute bottom-1/4 -right-24 hidden sm:block">
        <MandalaDecoration size={240} opacity={0.1} />
      </div>

      <div className="relative z-10 mx-auto max-w-[1080px] px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="font-[family-name:var(--font-script)] text-[28px] text-[#8b1a1a] sm:text-[34px]">
            Sacred Ceremonies
          </p>
          <h2
            id="events-heading"
            className="mt-1 font-serif text-[34px] font-normal tracking-[-0.01em] text-[#493628] sm:text-[46px]"
          >
            Wedding Celebrations
          </h2>
          <div className="mx-auto my-4 max-w-[320px]">
            <TraditionalMotifDivider size="sm" />
          </div>
          <p className="mx-auto max-w-[56ch] font-serif text-[18px] leading-relaxed text-[#7b6a58] sm:text-[20px]">
            Join us in commemorating every ritual and celebratory occasion as two families become one.
          </p>
        </div>

        {events && events.length > 0 ? (
          <div className="relative mt-12 space-y-10 pl-5 before:absolute before:top-3 before:bottom-3 before:left-1.5 before:w-px before:bg-[#c5a36b]/45 sm:mt-16 lg:space-y-14 lg:pl-0 lg:before:hidden">
            {events.map((event, idx) => {
              const artworkPath = INVITATION_EVENT_ARTWORK[event.slug];
              const imgRef = artworkPath || event.image_path || pickImage(null, `event-${event.event_type}`);
              const imgUrl = mediaUrl(imgRef) ?? artworkPath ?? "/images/wedding-shoot/optimised/photo-10.webp";
              const rawTime = formatTimeRange(event.start_time, event.end_time);
              const timeStr = event.time_label || (rawTime ? `${rawTime} (IST)` : null);
              const venue = event.venue;
              const dest = venue
                ? venue.latitude && venue.longitude
                  ? `${venue.latitude},${venue.longitude}`
                  : [venue.name, venue.address, venue.city, venue.state, venue.country].filter(Boolean).join(", ")
                : null;
              const directionsUrl = dest
                ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`
                : null;
              const isMainWedding = event.event_type === "wedding" || event.slug === "wedding-ceremony";
              const flipDesktop = idx % 2 === 1;
              const numLabel = String(idx + 1).padStart(2, "0");

              return (
                <article
                  key={event.id}
                  data-inv-event-card={event.slug}
                  className={cn(
                    "group relative rounded-[16px] border p-4 transition-colors sm:p-6 lg:grid lg:grid-cols-12 lg:items-center lg:gap-10 lg:p-8",
                    isMainWedding
                      ? "border-[#c5a36b] bg-gradient-to-br from-[#fff9f0] via-[#fffcf7] to-[#f7f0e4]/70 shadow-[0_10px_32px_rgba(197,163,107,0.16)]"
                      : "border-[#e5d5bd] bg-[#fffcf7] shadow-[0_4px_20px_rgba(73,54,40,0.05)] hover:border-[#c5a36b]",
                  )}
                >
                  {/* Mobile Timeline Node */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-8 -left-[22px] size-3 rounded-full border-2 border-[#fdf5e6] lg:hidden",
                      isMainWedding ? "bg-[#8b1a1a]" : "bg-[#c5a36b]",
                    )}
                  />

                  {/* Event Photograph / Illustration */}
                  <div
                    className={cn(
                      "relative aspect-[4/3] w-full overflow-hidden rounded-[12px] border border-[#e5d5bd] bg-[#f7f0e4] lg:col-span-6",
                      flipDesktop && "lg:order-2",
                    )}
                  >
                    <Image
                      src={imgUrl}
                      alt={event.image_alt || `${event.name} celebration photograph`}
                      fill
                      sizes="(max-width: 1023px) 100vw, 500px"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#493628]/45 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 rounded-full border border-[#c5a36b]/60 bg-[#8b1a1a]/95 px-3 py-1 text-[11px] font-semibold tracking-wider text-[#fdf5e6] uppercase">
                      {event.event_type}
                    </span>
                    {isMainWedding ? (
                      <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full border border-[#c5a36b] bg-[#fffcf7]/95 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#8b1a1a]">
                        <Sparkles className="size-3 text-[#c5a36b]" aria-hidden />
                        Main Ceremony
                      </span>
                    ) : null}
                  </div>

                  {/* Event Details */}
                  <div
                    className={cn(
                      "mt-5 flex flex-col lg:col-span-6 lg:mt-0",
                      flipDesktop && "lg:order-1",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-[22px] font-normal text-[#c5a36b]">{numLabel}</span>
                      <span className="h-px flex-1 bg-[#e5d5bd]" aria-hidden />
                    </div>

                    <h3 className="mt-3 font-serif text-[28px] font-normal leading-tight text-[#493628] sm:text-[32px]">
                      {event.name}
                    </h3>

                    {event.description || event.short_description ? (
                      <p className="mt-3 text-[15px] leading-relaxed text-[#7b6a58]">
                        {event.description || event.short_description}
                      </p>
                    ) : null}

                    <div className="mt-5 space-y-2.5 border-t border-[#e5d5bd]/80 pt-4 text-[14px] text-[#493628]">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="size-4 shrink-0 text-[#8b1a1a]" aria-hidden />
                        <span className="font-medium">
                          {event.event_date
                            ? new Date(event.event_date + "T00:00:00Z").toLocaleDateString("en-IN", {
                                timeZone: "UTC",
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "Date to be announced"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Clock className="size-4 shrink-0 text-[#8b1a1a]" aria-hidden />
                        <span className="text-[#7b6a58]">{timeStr || "Time to be announced"}</span>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-[#8b1a1a]" aria-hidden />
                        {venue ? (
                          <div>
                            <p className="font-medium text-[#493628]">{venue.name}</p>
                            {venue.address || venue.city ? (
                              <p className="text-[13px] text-[#7b6a58]">
                                {[venue.address, venue.city, venue.state].filter(Boolean).join(", ")}
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-[#7b6a58]">Venue details to be announced</span>
                        )}
                      </div>

                      {event.dress_code ? (
                        <div className="mt-2 rounded-[6px] border border-[#c5a36b]/40 bg-[#fff9f0] px-3 py-1.5 text-[12px] text-[#493628]">
                          <span className="font-semibold text-[#8b1a1a]">Dress Code:</span> {event.dress_code}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#e5d5bd]/60 pt-4">
                      <Link
                        href={`/events/${event.slug}`}
                        className="inline-flex min-h-[44px] items-center justify-center rounded-[6px] border border-[#c5a36b] bg-transparent px-4 py-2 text-[13px] font-medium text-[#493628] transition-colors hover:bg-[#fff9f0]"
                      >
                        View Details
                      </Link>

                      {directionsUrl ? (
                        <a
                          href={directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[6px] bg-[#8b1a1a] px-4 py-2 text-[13px] font-medium text-[#fdf5e6] transition-colors hover:bg-[#721515]"
                        >
                          <Navigation className="size-3.5" aria-hidden />
                          <span>Get Directions</span>
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="mt-10 text-center font-serif text-[18px] text-[#7b6a58]">
            Ceremony schedule details will be announced soon.
          </p>
        )}
      </div>
    </section>
  );
}
