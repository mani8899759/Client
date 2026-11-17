import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { EventFeature } from "@/components/events/EventParts";
import { EmptyState } from "@/components/feedback/States";
import { getEvents, getWeddingSettings } from "@/services/content";
import { formatDateOnly } from "@/lib/utils/datetime";
import { coupleNames } from "@/lib/utils/names";

export const revalidate = 60;
export const metadata: Metadata = { title: "Wedding Events" };

export default async function EventsPage() {
  const [events, wedding] = await Promise.all([getEvents(), getWeddingSettings()]);
  const names = coupleNames(wedding);

  return (
    <>
      <PageHeader
        eyebrow="Schedule"
        title="Wedding Celebrations"
        intro={`Join us as we celebrate every special moment leading up to the wedding of ${names.joined}.`}
      >
        {events.length > 1 ? (
          <nav aria-label="Jump to event" className="mt-10 -mx-4 overflow-x-auto px-4 scrollbar-none">
            <ul className="flex gap-2">
              {events.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`#${e.slug}`}
                    className="flex h-11 flex-col justify-center rounded-full border border-soft-border bg-card-surface px-5 whitespace-nowrap transition-colors hover:border-champagne-gold"
                  >
                    <span className="text-[14px] leading-tight text-dark-walnut">{e.name}</span>
                    {e.event_date ? <span className="text-[11px] leading-tight text-secondary-text">{formatDateOnly(e.event_date, "short")}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </PageHeader>

      <section aria-label="Events" className="pb-20 lg:pb-28">
        <Container width="wide">
          {events.length ? (
            <div className="flex flex-col gap-24 lg:gap-32">
              {events.map((e, i) => (
                <EventFeature key={e.id} event={e} index={i} />
              ))}
            </div>
          ) : (
            <EmptyState title="Event details will be announced soon" description="Ceremony dates, timings and venues will appear here." />
          )}
        </Container>
      </section>
    </>
  );
}
