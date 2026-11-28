import Link from "next/link";
import { ArrowUpRight, Clock, MapPin, Shirt } from "lucide-react";
import { EVENT_TYPE_LABEL } from "@/config/site";
import { ImageFrame } from "@/components/media/ImageFrame";
import { ButtonLink } from "@/components/buttons/Button";
import { ViewInvitationButton } from "@/components/invitation/ViewInvitationButton";
import { EventInterestedButton } from "./EventInterestedButton";
import { Reveal, ImageReveal } from "@/components/motion/Reveal";
import { dateOnlyParts, formatDateOnly, formatTimeRange } from "@/lib/utils/datetime";
import { cn } from "@/lib/utils/cn";
import { pickAlt, pickImage } from "@/lib/storage/imagery";
import { mediaUrl } from "@/lib/storage/media";
import { EVENT_AI_SLOT } from "@/config/ai-assets";
import type { Venue, WeddingEvent } from "@/types/database";

/** Uploaded event photo → invitation image → AI illustration for the event type. */
export function eventImage(event: Pick<WeddingEvent, "image_path" | "invitation_image_path" | "event_type">): string | null {
  return pickImage(event.image_path ?? event.invitation_image_path, EVENT_AI_SLOT[event.event_type] ?? "event-wedding");
}

export function venueLine(v: Venue | null | undefined): string | null {
  if (!v) return null;
  return [v.name, v.city].filter(Boolean).join(", ");
}

export function directionsUrl(v: Venue | null | undefined): string | null {
  if (!v) return null;
  if (v.google_maps_url && /^https?:\/\//.test(v.google_maps_url)) {
    return v.google_maps_url;
  }
  if (v.latitude !== null && v.longitude !== null && !isNaN(Number(v.latitude)) && !isNaN(Number(v.longitude))) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${v.latitude},${v.longitude}`)}`;
  }
  const dest = [v.name, v.address, v.city, v.state, v.country].filter(Boolean).join(", ");
  if (dest) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
  }
  return null;
}

/** Large serif date block used across event layouts. */
export function DateBlock({ date, className }: { date: string | null; className?: string }) {
  const p = dateOnlyParts(date);
  if (!p) {
    return (
      <div className={cn("flex flex-col", className)}>
        <span className="text-numeral text-[44px] leading-none text-muted-gold">—</span>
        <span className="mt-2 text-meta text-secondary-text">Event details will be announced soon.</span>
      </div>
    );
  }
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="text-numeral text-[48px] leading-none text-dark-walnut">{p.day}</span>
      <span className="mt-2 text-meta text-secondary-text">
        {p.month} {p.year}
      </span>
    </div>
  );
}

/** Compact editorial row for the homepage events preview. Fully clickable and accessible. */
export function EventRow({ event, index }: { event: WeddingEvent; index: number }) {
  const time = event.time_label || formatTimeRange(event.start_time, event.end_time);
  const venue = venueLine(event.venue);
  return (
    <Reveal as="li" preset="fade-up" delay={index * 0.06} className="border-t border-soft-border last:border-b">
      <Link
        href={`/events/${event.slug}`}
        aria-label={`View full details for ${event.name}`}
        className="group -mx-4 block rounded-[var(--radius-card)] px-4 py-8 transition-colors duration-300 hover:bg-card-surface/75 active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-cream sm:-mx-6 sm:px-6 cursor-pointer"
      >
        <div className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-4 sm:grid-cols-[120px_1fr_auto] lg:grid-cols-[160px_1fr_240px_40px] lg:gap-x-10">
          <DateBlock date={event.event_date} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-meta text-muted-gold">{EVENT_TYPE_LABEL[event.event_type] ?? "Ceremony"}</p>
              {event.time_period ? (
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-gold/80">
                  · {event.time_period}
                </span>
              ) : null}
            </div>
            <h3 className="mt-2 font-serif text-[28px] leading-tight text-dark-walnut transition-colors group-hover:text-primary sm:text-[30px]">
              {event.name}
            </h3>
            <div className="mt-3 flex flex-col gap-1 text-support text-secondary-text sm:flex-row sm:flex-wrap sm:gap-x-6">
              {time ? <span>{time}</span> : null}
              {venue ? <span>{venue}</span> : <span>Venue details coming soon</span>}
            </div>
          </div>
          <div className="col-span-2 hidden sm:col-span-1 sm:block">
            <ImageFrame
              mediaRef={eventImage(event)}
              alt={pickAlt(eventImage(event), event.image_alt, event.name)}
              ratio="4/3"
              sizes="240px"
              placeholderLabel={event.name}
              className="w-full sm:w-[180px] lg:w-[240px]"
              imageClassName="transition-transform duration-[1.2s] ease-[var(--ease-editorial)] group-hover:scale-[1.03]"
            />
          </div>
          <ArrowUpRight
            aria-hidden
            className="col-span-2 size-5 justify-self-end text-muted-gold transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary sm:col-span-1"
            strokeWidth={1.5}
          />
        </div>
      </Link>
    </Reveal>
  );
}

/** Alternating image-and-text composition for the full Events page. */
export function EventFeature({ event, index }: { event: WeddingEvent; index: number }) {
  const flip = index % 2 === 1;
  const time = event.time_label || formatTimeRange(event.start_time, event.end_time);
  const date = formatDateOnly(event.event_date);
  const venue = venueLine(event.venue);
  const directions = directionsUrl(event.venue);
  const isMainCeremony = event.event_type === "wedding" || event.slug === "wedding-ceremony";

  return (
    <article
      id={event.slug}
      className={cn(
        "grid items-center gap-10 rounded-[var(--radius-card)] p-4 sm:p-6 lg:grid-cols-12 lg:gap-16 lg:p-10 transition-colors",
        isMainCeremony
          ? "border border-champagne-gold/40 bg-gradient-to-br from-cream/40 via-card-surface to-soft-cream/30 shadow-[0_8px_32px_rgba(201,160,80,0.08)]"
          : "border border-transparent"
      )}
      aria-labelledby={`event-${event.slug}`}
    >
      <ImageReveal preset={flip ? "slide-right" : "slide-left"} className={cn("lg:col-span-6", flip && "lg:order-2 lg:col-start-7")}>
        <ImageFrame
          mediaRef={eventImage(event)}
          alt={pickAlt(eventImage(event), event.image_alt, event.name)}
          ratio={index % 3 === 0 ? "4/5" : "5/4"}
          sizes="(min-width: 1024px) 45vw, 100vw"
          placeholderLabel={`${event.name} photograph`}
          placeholderHint="Upload an event photograph in Admin › Events"
        />
      </ImageReveal>

      <Reveal preset={flip ? "slide-left" : "slide-right"} delay={0.12} className={cn("lg:col-span-5", flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-8")}>
        <div className="flex items-baseline gap-4">
          <span className="text-numeral text-[20px] text-champagne-gold">{String(index + 1).padStart(2, "0")}</span>
          <span className="h-px flex-1 bg-soft-border" aria-hidden />
          <span className="text-meta text-muted-gold">{EVENT_TYPE_LABEL[event.event_type] ?? "Ceremony"}</span>
          {event.time_period ? (
            <span className="rounded-full border border-champagne-gold/30 bg-champagne-gold/10 px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-dark-walnut capitalize">
              {event.time_period}
            </span>
          ) : null}
        </div>
        <h2 id={`event-${event.slug}`} className="mt-6 text-h1 text-dark-walnut sm:text-[36px]">
          {event.name}
        </h2>
        {event.short_description ? <p className="mt-4 text-body text-secondary-text text-pretty">{event.short_description}</p> : null}

        <dl className="mt-8 grid gap-5 border-t border-soft-border pt-6 text-support">
          <div className="grid grid-cols-[24px_1fr] gap-3">
            <dt className="sr-only">Date and time</dt>
            <Clock aria-hidden className="mt-0.5 size-4 text-muted-gold" strokeWidth={1.5} />
            <dd className="text-dark-walnut">
              {date ?? "Date to be announced"}
              {time ? <span className="block text-secondary-text">{time}</span> : null}
            </dd>
          </div>
          <div className="grid grid-cols-[24px_1fr] gap-3">
            <dt className="sr-only">Venue</dt>
            <MapPin aria-hidden className="mt-0.5 size-4 text-muted-gold" strokeWidth={1.5} />
            <dd className="text-dark-walnut">
              {venue ? (
                <>
                  {event.venue?.name}
                  {event.venue?.address ? <span className="block text-secondary-text">{event.venue.address}</span> : null}
                </>
              ) : (
                <span className="text-secondary-text">Venue details coming soon</span>
              )}
            </dd>
          </div>
          {event.dress_code ? (
            <div className="grid grid-cols-[24px_1fr] gap-3">
              <dt className="sr-only">Dress code</dt>
              <Shirt aria-hidden className="mt-0.5 size-4 text-muted-gold" strokeWidth={1.5} />
              <dd className="text-dark-walnut">
                <span className="text-secondary-text">Dress code · </span>
                {event.dress_code}
              </dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
          <EventInterestedButton eventId={event.id} eventName={event.name} />
          <ButtonLink href={`/events/${event.slug}`} variant="primary">
            Event details
          </ButtonLink>
          <ViewInvitationButton
            invitationUrl={event.invitation_image_path || event.invitation_pdf_path ? mediaUrl(event.invitation_pdf_path ?? event.invitation_image_path) : null}
            invitationType={event.invitation_pdf_path ? "pdf" : "image"}
            variant="primary"
            size="md"
            eventSpecific={true}
          />
          {directions ? (
            <ButtonLink href={directions} variant="filled" external>
              Get directions
            </ButtonLink>
          ) : null}
        </div>
      </Reveal>
    </article>
  );
}

