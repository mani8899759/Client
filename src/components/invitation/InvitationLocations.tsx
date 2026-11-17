"use client";

import { MapPin, Navigation } from "lucide-react";
import type { Venue } from "@/types/database";
import { TraditionalMotifDivider } from "./TraditionalMotifDivider";
import { MandalaDecoration } from "./MandalaDecoration";

export function InvitationLocations({ venues }: { venues: Venue[] }) {
  if (!venues || venues.length === 0) return null;

  return (
    <section aria-labelledby="venues-heading" className="relative overflow-hidden py-14 sm:py-20 bg-[#fdf5e6]">
      <div className="absolute top-10 left-2">
        <MandalaDecoration size={200} opacity={0.12} />
      </div>

      <div className="relative z-10 mx-auto max-w-[980px] px-4 sm:px-6">
        <div className="text-center">
          <p className="font-[family-name:var(--font-script)] text-[28px] text-[#8b1a1a] sm:text-[32px]">
            Celebration Destinations
          </p>
          <h2
            id="venues-heading"
            className="mt-1 font-[family-name:var(--font-playfair)] text-[34px] font-bold text-[#3d1c00] sm:text-[44px]"
          >
            Find Our Venue
          </h2>
          <div className="mx-auto my-4 max-w-[320px]">
            <TraditionalMotifDivider size="sm" />
          </div>
          <p className="mx-auto max-w-[56ch] font-[family-name:var(--font-serif)] text-[18px] text-[#5c4033]">
            We look forward to welcoming you at our heritage celebration venue in the historic royal city of Jaipur.
          </p>
        </div>

        {/* Venues Grid with Map Previews */}
        <div className="mt-12 space-y-8 sm:mt-16">
          {venues.map((venue) => {
            const dest =
              venue.latitude && venue.longitude
                ? `${venue.latitude},${venue.longitude}`
                : [venue.name, venue.address, venue.city, venue.state, venue.country].filter(Boolean).join(", ");
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
            const mapEmbedUrl = venue.latitude && venue.longitude
              ? `https://maps.google.com/maps?q=${venue.latitude},${venue.longitude}&hl=en&z=14&output=embed`
              : `https://maps.google.com/maps?q=${encodeURIComponent(dest)}&hl=en&z=14&output=embed`;

            return (
              <div
                key={venue.id}
                className="overflow-hidden rounded-[16px] border border-[#d4a843]/60 bg-[#fffcf7] shadow-[0_4px_24px_rgba(61,28,0,0.06)]"
              >
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Left Column: Venue Info & Directions */}
                  <div className="flex flex-col justify-between p-6 sm:p-8">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-full bg-[#f5ebd5] text-[#8b1a1a]">
                          <MapPin className="size-5" strokeWidth={1.75} />
                        </div>
                        <span className="text-[12px] font-semibold tracking-wider text-[#8b1a1a] uppercase">
                          Official Venue
                        </span>
                      </div>

                      <h3 className="mt-4 font-[family-name:var(--font-playfair)] text-[24px] font-bold text-[#3d1c00] sm:text-[28px]">
                        {venue.name}
                      </h3>

                      <p className="mt-2 text-[15px] leading-relaxed text-[#5c4033]">
                        {[venue.address, venue.city, venue.state, venue.country].filter(Boolean).join(", ")}
                      </p>

                      {venue.notes ? (
                        <p className="mt-3 rounded-[6px] bg-[#f5ebd5]/50 p-3 text-[13px] text-[#7b6a58] italic border-l-2 border-[#d4a843]">
                          {venue.notes}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-8 pt-4 border-t border-[#e5d5bd]/60">
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#d4a843] bg-[#8b1a1a] px-6 py-3.5 text-[14px] font-medium tracking-wide text-[#fdf5e6] shadow-sm transition-all hover:bg-[#721515] hover:shadow-md active:scale-98 sm:w-auto"
                      >
                        <Navigation className="size-4" />
                        <span>Get Directions</span>
                      </a>
                    </div>
                  </div>

                  {/* Right Column: Embedded Map View */}
                  <div className="relative min-h-[220px] w-full border-t border-[#d4a843]/30 bg-[#f5ebd5]/40 md:border-t-0 md:border-l">
                    <iframe
                      title={`${venue.name} location map`}
                      src={mapEmbedUrl}
                      className="absolute inset-0 h-full w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
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
