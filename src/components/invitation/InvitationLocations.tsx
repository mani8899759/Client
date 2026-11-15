"use client";

import { MapPin, Navigation, Sparkles } from "lucide-react";
import type { Venue } from "@/types/database";

export function InvitationLocations({ venues }: { venues: Venue[] }) {
  if (!venues || venues.length === 0) return null;

  return (
    <section aria-labelledby="venues-heading" className="py-14 sm:py-20 bg-[#f5ebd5]/40">
      <div className="mx-auto max-w-[880px] px-4 sm:px-6">
        <div className="text-center">
          <p className="font-[family-name:var(--font-script)] text-[28px] text-[#8b1a1a]">
            Where Memories Will Be Made
          </p>
          <h2 id="venues-heading" className="mt-1 font-[family-name:var(--font-playfair)] text-[34px] font-bold text-[#3d1c00] sm:text-[44px]">
            Wedding Venues &amp; Locations
          </h2>
          <div className="mx-auto my-4 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-[#d4a843]" />
            <Sparkles className="size-4 text-[#d4a843]" />
            <span className="h-px w-12 bg-[#d4a843]" />
          </div>
          <p className="mx-auto max-w-[56ch] font-[family-name:var(--font-serif)] text-[18px] text-[#5c4033]">
            We look forward to welcoming you at our heritage celebration venue in the historic pink city of Jaipur.
          </p>
        </div>

        {/* Venues Grid */}
        <div className="mt-12 space-y-6 sm:mt-16">
          {venues.map((venue) => {
            const dest =
              venue.latitude && venue.longitude
                ? `${venue.latitude},${venue.longitude}`
                : [venue.name, venue.address, venue.city, venue.state, venue.country].filter(Boolean).join(", ");
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;

            return (
              <div
                key={venue.id}
                className="flex flex-col justify-between gap-6 rounded-[16px] border border-[#d4a843]/50 bg-[#fffcf7] p-6 shadow-sm sm:flex-row sm:items-center sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#f5ebd5] text-[#8b1a1a]">
                    <MapPin className="size-6" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-[family-name:var(--font-playfair)] text-[22px] font-bold text-[#3d1c00]">
                      {venue.name}
                    </h3>
                    <p className="mt-1 text-[14px] text-[#5c4033]">
                      {[venue.address, venue.city, venue.state, venue.country].filter(Boolean).join(", ")}
                    </p>
                    {venue.notes ? (
                      <p className="mt-2 text-[13px] text-[#7b6a58] italic">
                        {venue.notes}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="shrink-0">
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#8b1a1a] px-5 py-3 text-[14px] font-medium text-[#fdf5e6] shadow-sm transition-all hover:bg-[#721515] active:scale-98 sm:w-auto"
                  >
                    <Navigation className="size-4" />
                    <span>Get Directions</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
