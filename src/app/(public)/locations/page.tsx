import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/buttons/Button";
import { EmptyState } from "@/components/feedback/States";
import { Reveal } from "@/components/motion/Reveal";
import { directionsUrl } from "@/components/events/EventParts";
import { getLocations } from "@/services/content";
import { ImageFrame } from "@/components/media/ImageFrame";
import { pickAlt, pickImage } from "@/lib/storage/imagery";
import { formatDateOnly, formatTimeOnly } from "@/lib/utils/datetime";
import type { Venue } from "@/types/database";

export const revalidate = 60;
export const metadata: Metadata = { title: "Locations" };

/** Keyless Google Maps embed — only rendered when coordinates are configured. */
function MapEmbed({ venue }: { venue: Venue }) {
  if (venue.latitude === null || venue.longitude === null) return null;
  const src = `https://maps.google.com/maps?q=${venue.latitude},${venue.longitude}&z=15&output=embed`;
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-control)] border border-soft-border bg-soft-cream lg:aspect-auto lg:h-full lg:min-h-[320px]">
      <iframe
        src={src}
        title={`Map showing ${venue.name}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 h-full w-full border-0 [filter:sepia(0.18)_saturate(0.85)]"
      />
    </div>
  );
}

export default async function LocationsPage() {
  const venues = await getLocations();
  const locationVisual = pickImage(null, "location-venue");

  return (
    <>
      <PageHeader
        eyebrow="Wedding Locations"
        title="Finding your way"
        intro="Venues for each ceremony, with directions. Please allow extra time for parking and arrival."
      />
      {locationVisual ? (
        <Container width="wide" className="-mt-4 mb-16 lg:mb-20">
          <Reveal preset="zoom-reveal">
            <ImageFrame mediaRef={locationVisual} alt={pickAlt(locationVisual, null, "The wedding venue")} ratio="21/9" sizes="(min-width: 1440px) 1360px, 100vw" />
          </Reveal>
        </Container>
      ) : null}
      <section aria-label="Venues" className="pb-20 lg:pb-28">
        <Container width="wide">
          {venues.length ? (
            <ol className="flex flex-col gap-16 lg:gap-20">
              {venues.map((v, i) => {
                const directions = directionsUrl(v);
                const address = [v.address, v.city, v.state, v.country].filter(Boolean);
                const hasMap = v.latitude !== null && v.longitude !== null;
                return (
                  <li key={v.id} className="grid gap-8 border-t border-soft-border pt-10 lg:grid-cols-12 lg:gap-16">
                    <Reveal preset="slide-left" className={hasMap ? "lg:col-span-5" : "lg:col-span-8"}>
                      <span className="text-numeral text-[20px] text-champagne-gold">{String(i + 1).padStart(2, "0")}</span>
                      <h2 className="mt-4 text-h1 text-dark-walnut sm:text-[36px] sm:leading-[1.12]">{v.name}</h2>
                      {address.length ? (
                        <address className="mt-4 text-body text-secondary-text not-italic">
                          {address.map((line, idx) => (
                            <span key={idx} className="block">
                              {line}
                            </span>
                          ))}
                        </address>
                      ) : null}
                      {v.notes ? <p className="mt-4 text-support text-secondary-text">{v.notes}</p> : null}

                      <div className="mt-8">
                        <p className="text-meta text-secondary-text">Hosting</p>
                        <ul className="mt-3 flex flex-col">
                          {v.events.map((e) => (
                            <li key={e.id} className="border-b border-soft-border last:border-b-0">
                              <Link href={`/events/${e.slug}`} className="flex items-baseline justify-between gap-4 py-3 hover:text-primary">
                                <span className="font-serif text-[22px]">{e.name}</span>
                                <span className="text-right text-[13px] text-secondary-text">
                                  {[formatDateOnly(e.event_date, "short"), formatTimeOnly(e.start_time)].filter(Boolean).join(" · ")}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {directions ? (
                        <div className="mt-8">
                          <ButtonLink href={directions} external variant="filled">
                            Get directions
                          </ButtonLink>
                        </div>
                      ) : null}
                    </Reveal>
                    {hasMap ? (
                      <Reveal preset="slide-right" delay={0.15} className="lg:col-span-7">
                        <MapEmbed venue={v} />
                      </Reveal>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          ) : (
            <EmptyState title="Venues will be announced soon" description="Addresses and directions will appear here once the events are published." />
          )}
        </Container>
      </section>
    </>
  );
}
