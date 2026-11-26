import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Eyebrow } from "@/components/typography/Headings";
import { ImageFrame } from "@/components/media/ImageFrame";
import { ButtonLink } from "@/components/buttons/Button";
import { ViewInvitationButton } from "@/components/invitation/ViewInvitationButton";
import { EventInterestedButton } from "@/components/events/EventInterestedButton";
import { Reveal, ImageReveal } from "@/components/motion/Reveal";
import { directionsUrl, eventImage } from "@/components/events/EventParts";
import { pickAlt } from "@/lib/storage/imagery";
import { EVENT_TYPE_LABEL } from "@/config/site";
import { getEventBySlug, getEvents } from "@/services/content";
import { formatDateOnly, formatTimeRange } from "@/lib/utils/datetime";
import { mediaUrl } from "@/lib/storage/media";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  return { title: event?.name ?? "Event", description: event?.short_description ?? undefined };
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-soft-border py-5 sm:grid-cols-[160px_1fr] sm:gap-6">
      <dt className="text-meta text-secondary-text sm:pt-1">{label}</dt>
      <dd className="text-body text-dark-walnut">{children}</dd>
    </div>
  );
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const all = await getEvents();
  const idx = all.findIndex((e) => e.id === event.id);
  const next = idx >= 0 ? all[idx + 1] : undefined;
  const date = formatDateOnly(event.event_date);
  const time = event.time_label || formatTimeRange(event.start_time, event.end_time);
  const v = event.venue;
  const directions = directionsUrl(v);
  const videoUrl = mediaUrl(event.invitation_video_path);
  const eventInvitationPath = event.invitation_image_path || event.invitation_pdf_path;
  const invitationUrl = eventInvitationPath ? mediaUrl(eventInvitationPath) : null;
  const invitationType = event.invitation_pdf_path ? "pdf" : "image";

  return (
    <article className="pb-20 lg:pb-28">
      <Container width="wide" className="pt-8 sm:pt-12">
        <Link href="/events" className="inline-flex items-center gap-2 text-support text-secondary-text hover:text-dark-walnut">
          <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden /> All events
        </Link>

        <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            <Eyebrow>{EVENT_TYPE_LABEL[event.event_type]}</Eyebrow>
            <h1 className="mt-5 text-display text-balance text-dark-walnut">{event.name}</h1>
            {event.short_description ? <p className="mt-6 text-body text-secondary-text">{event.short_description}</p> : null}

            <dl className="mt-10 border-b border-soft-border">
              <Detail label="Date">{date ?? "To be announced"}</Detail>
              {time ? <Detail label="Time">{time}</Detail> : null}
              <Detail label="Venue">
                {v ? (
                  <>
                    {v.name}
                    {v.address || v.city ? (
                      <span className="block text-support text-secondary-text">
                        {[v.address, v.city, v.state, v.country].filter(Boolean).join(", ")}
                      </span>
                    ) : null}
                  </>
                ) : (
                  <span className="text-secondary-text">Venue details coming soon</span>
                )}
              </Detail>
              {event.dress_code ? <Detail label="Dress code">{event.dress_code}</Detail> : null}
              {event.contact_info ? <Detail label="Contact">{event.contact_info}</Detail> : null}
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <EventInterestedButton eventId={event.id} eventName={event.name} />
              {directions ? (
                <ButtonLink href={directions} external variant="filled">
                  Get directions
                </ButtonLink>
              ) : null}
              <ViewInvitationButton
                invitationUrl={invitationUrl}
                invitationType={invitationType}
                variant="primary"
                size="md"
              />
              <ButtonLink href="/locations" variant="ghost">
                All locations
              </ButtonLink>
            </div>
          </Reveal>

          <ImageReveal className="lg:col-span-5 lg:col-start-8">
            <ImageFrame
              mediaRef={event.invitation_image_path ?? eventImage(event)}
              alt={event.invitation_image_path ? `${event.name} invitation` : pickAlt(eventImage(event), event.image_alt, event.name)}
              ratio="4/5"
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              placeholderLabel="Invitation"
              placeholderHint="Upload the invitation card in Admin › Events"
              imageClassName={event.invitation_image_path ? "object-contain bg-soft-cream" : undefined}
            />
            {event.invitation_image_path && mediaUrl(event.invitation_image_path) ? (
              <a
                href={mediaUrl(event.invitation_image_path)!}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-support text-secondary-text underline decoration-champagne-gold underline-offset-4 hover:text-dark-walnut"
              >
                Open the invitation in full size
              </a>
            ) : null}
          </ImageReveal>
        </div>

        {event.description ? (
          <Reveal className="mx-auto mt-20 max-w-[720px] lg:mt-28">
            <Eyebrow>About the ceremony</Eyebrow>
            <div className="mt-6 space-y-5 text-body text-secondary-text">
              {event.description.split(/\n{2,}/).map((p, i) => (
                <p key={i} className="text-pretty first:font-serif first:text-[22px] first:leading-snug first:text-dark-walnut">
                  {p}
                </p>
              ))}
            </div>
          </Reveal>
        ) : null}

        {videoUrl ? (
          <Reveal className="mx-auto mt-16 max-w-[960px]">
            <Eyebrow>Invitation video</Eyebrow>
            <video controls preload="metadata" playsInline className="mt-6 w-full rounded-[var(--radius-control)] bg-dark-walnut" src={videoUrl}>
              Your browser does not support embedded video.
            </video>
          </Reveal>
        ) : null}

        {next ? (
          <div className="mt-24 border-t border-soft-border pt-10">
            <Link href={`/events/${next.slug}`} className="group flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
              <span className="text-meta text-secondary-text">Next event</span>
              <span className="font-serif text-[30px] text-dark-walnut transition-colors group-hover:text-primary">{next.name} →</span>
            </Link>
          </div>
        ) : null}
      </Container>
    </article>
  );
}
