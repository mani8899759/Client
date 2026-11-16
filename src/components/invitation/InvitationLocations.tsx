"use client";

import { MapPin, Navigation, ExternalLink } from "lucide-react";
import type { Venue } from "@/types/database";
import { FloralDivider } from "./TraditionalMotifs";

export function InvitationLocations({ venues }: { venues: Venue[] }) {
  if (!venues || venues.length === 0) return null;

  return (
    <section aria-labelledby="venues-heading" className="py-16 sm:py-24 bg-[#fdf5e6]">
      <div className="mx-auto max-w-[1000px] px-4 sm:px-6">
        <div className="text-center">
          <p className="font-[family-name:var(--font-script)] text-[30px] text-[#8b1a1a] sm:text-[36px]">
            Ceremony Location
          </p>
          <h2
            id="venues-heading"
            className="mt-1 font-[family-name:var(--font-playfair)] text-[34px] font-bold text-[#3d1c00] sm:text-[44px]"
          >
            Find Our Venue
          </h2>
          <FloralDivider className="my-3" />
          <p className="mx-auto max-w-[56ch] font-[family-name:var(--font-serif)] text-[18px] text-[#5c4033] sm:text-[20px]">
            We look forward to welcoming you at our heritage celebration venue in the historic pink city of Jaipur.
          </p>
        </div>

        {/* Venues Grid with Map Preview Card — matching reference blueprint */}
        <div className="mt-12 space-y-8 sm:mt-16">
          {venues.map((venue) => {
            const dest =
              venue.latitude && venue.longitude
                ? `${venue.latitude},${venue.longitude}`
                : [venue.name, venue.address, venue.city, venue.state, venue.country].filter(Boolean).join(", ");
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
            const mapSearchUrl = `https://maps.google.com/maps?q=${encodeURIComponent(dest)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

            return (
              <div
                key={venue.id}
                className="overflow-hidden rounded-[16px] border-2 border-[#d4a843]/60 bg-[#fffcf7] shadow-sm"
              >
                <div className="grid lg:grid-cols-12">
                  {/* Left: Venue Info & Directions CTA */}
                  <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-7">
                    <div>
                      <div className="flex items-center gap-2 text-[#8b1a1a]">
                        <MapPin className="size-5" />
                        <span className="text-[12px] font-semibold tracking-wider uppercase">
                          Official Venue
                        </span>
                      </div>

                      <h3 className="mt-2 font-[family-name:var(--font-playfair)] text-[26px] font-bold text-[#3d1c00] sm:text-[30px]">
                        {venue.name}
                      </h3>

                      <p className="mt-3 text-[15px] leading-relaxed text-[#5c4033]">
                        {[venue.address, venue.city, venue.state, venue.country].filter(Boolean).join(", ")}
                      </p>

                      {venue.notes ? (
                        <p className="mt-3 text-[13px] italic text-[#7b6a58] border-l-2 border-[#d4a843] pl-3">
                          {venue.notes}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-[8px] border border-[#d4a843] bg-[#8b1a1a] px-6 py-3 text-[14px] font-medium tracking-[0.04em] text-[#fdf5e6] shadow-sm transition-all hover:bg-[#721515] hover:shadow-md active:scale-98"
                      >
                        <Navigation className="size-4" />
                        <span>Get Directions</span>
                      </a>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#d4a843]/60 bg-[#fffcf7] px-4 py-3 text-[13px] font-medium text-[#3d1c00] hover:bg-[#f5ebd5]"
                      >
                        <span>Open in Google Maps</span>
                        <ExternalLink className="size-3.5 text-[#8b1a1a]" />
                      </a>
                    </div>
                  </div>

                  {/* Right: Embedded Interactive Map Preview */}
                  <div className="relative min-h-[260px] w-full border-t border-[#d4a843]/30 bg-[#f5ebd5]/50 lg:col-span-5 lg:min-h-[320px] lg:border-t-0 lg:border-l">
                    <iframe
                      title={`Map of ${venue.name}`}
                      src={mapSearchUrl}
                      className="absolute inset-0 size-full border-0"
                      loading="lazy"
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
