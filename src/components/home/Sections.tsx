import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { Container, Section } from "@/components/layout/Container";
import { SectionHeading, Eyebrow } from "@/components/typography/Headings";
import { ButtonLink } from "@/components/buttons/Button";
import { ImageFrame } from "@/components/media/ImageFrame";
import { Reveal, ImageReveal } from "@/components/motion/Reveal";
import { EventRow, directionsUrl } from "@/components/events/EventParts";
import { EmptyState } from "@/components/feedback/States";
import { StreamStatusBadge } from "@/components/media/StreamStatusBadge";
import { formatDateTimeInZone } from "@/lib/utils/datetime";
import { getYouTubeId, youTubeThumbnail } from "@/lib/utils/youtube";
import { coupleNames } from "@/lib/utils/names";
import { weddingSchedule } from "@/lib/utils/wedding";
import { pickAlt, pickImage } from "@/lib/storage/imagery";
import { presentAiAssets } from "@/config/ai-assets";
import { cn } from "@/lib/utils/cn";
import type { VenueWithEvents } from "@/services/content";
import type { AppSettings, GalleryMedia, LiveStream, StoryEntry, WeddingEvent, WeddingSettings } from "@/types/database";

function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {text.split(/\n{2,}/).map((p, i) => (
        <p key={i} className="text-pretty">
          {p}
        </p>
      ))}
    </div>
  );
}

export function WelcomeSection({ wedding }: { wedding: WeddingSettings }) {
  const ref = pickImage(wedding.welcome_image_path, "couple-editorial-portrait");
  const schedule = weddingSchedule(wedding);
  return (
    <Section labelledBy="welcome-title" className="pt-24! sm:pt-28! lg:pt-32!">
      <Container width="wide">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <ImageReveal className="lg:col-span-5">
            <ImageFrame
              mediaRef={ref}
              alt={pickAlt(ref, wedding.welcome_image_alt, "The couple")}
              ratio="4/5"
              sizes="(min-width: 1024px) 40vw, 100vw"
              placeholderLabel="Couple photograph"
              placeholderHint="Upload in Admin › Homepage"
            />
          </ImageReveal>
          <Reveal className="lg:col-span-6 lg:col-start-7">
            <Eyebrow>Welcome</Eyebrow>
            <h2 id="welcome-title" className="mt-4 text-h1 text-balance text-dark-walnut sm:text-[36px] sm:leading-[1.12]">
              {wedding.welcome_title ?? "Welcome to our wedding celebration"}
            </h2>
            {wedding.welcome_message ? <Paragraphs text={wedding.welcome_message} className="mt-6 text-body text-secondary-text" /> : null}
            {wedding.invitation_message ? (
              <blockquote className="mt-10 border-l border-champagne-gold pl-6 font-serif text-[22px] leading-snug text-dark-walnut italic">
                {wedding.invitation_message}
              </blockquote>
            ) : null}
            <div className="mt-10 border-t border-soft-border pt-6">
              <p className="text-meta text-secondary-text">Wedding date</p>
              <p className="mt-1 font-serif text-[24px] text-dark-walnut">{schedule?.dateLabel ?? "To be announced"}</p>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

function Person({ role, name, intro, imageRef, imageAlt, delay }: { role: string; name: string; intro: string | null; imageRef: string | null; imageAlt: string; delay: number }) {
  return (
    <Reveal delay={delay} className="flex flex-col items-center text-center">
      <ImageFrame
        mediaRef={imageRef}
        alt={imageAlt}
        ratio="4/5"
        sizes="(min-width: 768px) 30vw, 80vw"
        placeholderLabel={`${role} photograph`}
        className="w-full max-w-[360px]"
      />
      <p className="mt-8 text-meta text-muted-gold">{role}</p>
      <p className="mt-2 font-serif text-[40px] leading-none text-dark-walnut sm:text-[48px]">{name}</p>
      {intro ? <p className="mt-5 max-w-[42ch] text-body text-secondary-text">{intro}</p> : null}
    </Reveal>
  );
}

export function CoupleSection({ wedding }: { wedding: WeddingSettings }) {
  const names = coupleNames(wedding);
  const brideRef = pickImage(wedding.bride_image_path, "bride-detail");
  const groomRef = pickImage(wedding.groom_image_path, "groom-detail");
  return (
    <Section tone="cream" labelledBy="couple-title">
      <Container width="default">
        <SectionHeading align="center" eyebrow="The Couple" title={<span id="couple-title">Two families, one celebration</span>} />
        <div className="mt-14 grid items-start gap-14 md:grid-cols-[1fr_auto_1fr] md:gap-8 lg:mt-20">
          <Person role="The Bride" name={names.bride} intro={wedding.bride_intro} imageRef={brideRef} imageAlt={pickAlt(brideRef, wedding.bride_image_alt, names.bride)} delay={0} />
          <span aria-hidden className="hidden self-center font-serif text-[64px] text-champagne-gold italic md:block">
            &amp;
          </span>
          <Person role="The Groom" name={names.groom} intro={wedding.groom_intro} imageRef={groomRef} imageAlt={pickAlt(groomRef, wedding.groom_image_alt, names.groom)} delay={0.1} />
        </div>
      </Container>
    </Section>
  );
}

export function StoryPreviewSection({ wedding, entries }: { wedding: WeddingSettings; entries: StoryEntry[] }) {
  const withImages = entries.filter((e) => e.image_path);
  const primary = withImages[0] ?? entries[0] ?? null;
  const secondary = withImages[1] ?? null;
  const intro = wedding.story_intro ?? primary?.description ?? null;
  const primaryRef = pickImage(primary?.image_path, "couple-prewedding");
  const secondaryRef = pickImage(secondary?.image_path, "wedding-details");

  return (
    <Section labelledBy="story-preview-title">
      <Container width="wide">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
          <Reveal className="order-2 lg:order-1 lg:col-span-5">
            <SectionHeading
              eyebrow="Our Love Story"
              title={<span id="story-preview-title">{primary?.title ?? "How our story began"}</span>}
              intro={intro ? <p className="line-clamp-6">{intro}</p> : <p>The chapters of our story — from the first hello to forever.</p>}
            />
            <div className="mt-8">
              <ButtonLink href="/story" variant="ghost">
                Read our story
              </ButtonLink>
            </div>
          </Reveal>
          <div className="relative order-1 pb-10 lg:order-2 lg:col-span-6 lg:col-start-7">
            <ImageReveal className="w-[82%]">
              <ImageFrame
                mediaRef={primaryRef}
                alt={pickAlt(primaryRef, primary?.image_alt, primary?.title ?? "Our story")}
                ratio="4/5"
                sizes="(min-width: 1024px) 40vw, 80vw"
                placeholderLabel="Story photograph"
                placeholderHint="Add story chapters in Admin › Our Love Story"
                imageClassName="object-[60%_center]"
              />
            </ImageReveal>
            <ImageReveal delay={0.2} className="absolute right-0 bottom-0 w-[42%] border-[6px] border-warm-ivory sm:border-8">
              <ImageFrame
                mediaRef={secondaryRef}
                alt={pickAlt(secondaryRef, secondary?.image_alt, "Wedding details")}
                ratio="3/4"
                sizes="(min-width: 1024px) 20vw, 40vw"
                placeholderLabel="Second photograph"
                rounded={false}
                aiTag={false}
              />
            </ImageReveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export function EventsPreviewSection({ events }: { events: WeddingEvent[] }) {
  const shown = events.slice(0, 5);
  return (
    <Section tone="cream" labelledBy="events-preview-title">
      <Container width="wide">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Wedding Events"
            title={<span id="events-preview-title">The celebrations</span>}
            intro="Each ceremony has its own rhythm, colour and tradition. Here is how the days unfold."
          />
          {events.length ? (
            <ButtonLink href="/events" variant="ghost" className="shrink-0">
              View all events
            </ButtonLink>
          ) : null}
        </div>
        {shown.length ? (
          <ol className="mt-12 lg:mt-16">
            {shown.map((e, i) => (
              <EventRow key={e.id} event={e} index={i} />
            ))}
          </ol>
        ) : (
          <EmptyState title="Event details will be announced soon" description="Ceremony dates, timings and venues will appear here." />
        )}
      </Container>
    </Section>
  );
}

const GALLERY_LAYOUT = [
  "col-span-12 sm:col-span-7 sm:row-span-2 aspect-[4/5] sm:aspect-auto",
  "col-span-6 sm:col-span-5 aspect-[4/5] sm:aspect-[5/4]",
  "col-span-6 sm:col-span-5 aspect-[4/5] sm:aspect-[5/4]",
  "col-span-6 sm:col-span-4 aspect-square",
  "col-span-6 sm:col-span-4 aspect-square",
  "col-span-12 sm:col-span-4 aspect-[4/3] sm:aspect-square",
];

export function GalleryPreviewSection({ media }: { media: GalleryMedia[] }) {
  // Published gallery items first; AI illustrations fill the preview until real photographs exist.
  const items: Array<{ id: string; ref: string | null; alt: string }> = media.map((m) => ({
    id: m.id,
    ref: m.storage_path,
    alt: m.alt_text ?? m.title ?? "Wedding photograph",
  }));
  if (items.length < 6) {
    for (const a of presentAiAssets().filter((x) => x.group === "gallery" || x.group === "events")) {
      if (items.length >= 6) break;
      if (!items.some((i) => i.ref === a.ref)) items.push({ id: a.slot, ref: a.ref, alt: a.alt });
    }
  }
  const slots = GALLERY_LAYOUT.slice(0, Math.max(3, Math.min(items.length, 6)));
  return (
    <Section labelledBy="gallery-preview-title">
      <Container width="wide">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow="Gallery" title={<span id="gallery-preview-title">Moments, kept</span>} />
          <ButtonLink href="/gallery" variant="ghost" className="shrink-0">
            View the gallery
          </ButtonLink>
        </div>
        <div className="mt-12 grid grid-cols-12 gap-3 sm:gap-4 lg:mt-16 lg:gap-5">
          {slots.map((cls, i) => {
            const m = items[i];
            return (
              <ImageReveal key={m?.id ?? `slot-${i}`} delay={i * 0.05} className={cn("relative", cls)}>
                <Link href="/gallery" className="group block h-full w-full" aria-label={m?.alt ?? "Open the gallery"} tabIndex={m ? 0 : -1}>
                  <ImageFrame
                    mediaRef={m?.ref}
                    alt={m?.alt ?? "Wedding photograph"}
                    fill
                    sizes={i === 0 ? "(min-width: 640px) 58vw, 100vw" : "(min-width: 640px) 33vw, 50vw"}
                    placeholderLabel="Gallery photograph"
                    imageClassName="transition-transform duration-[1.4s] ease-[var(--ease-editorial)] group-hover:scale-[1.03]"
                  />
                </Link>
              </ImageReveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

export function VenuePreviewSection({ wedding, venues }: { wedding: WeddingSettings; venues: VenueWithEvents[] }) {
  const v = venues[0] ?? null;
  const ref = pickImage(wedding.secondary_image_path, "wedding-environment");
  const directions = directionsUrl(v);
  return (
    <Section tone="cream" labelledBy="venue-title">
      <Container width="wide">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <ImageReveal className="lg:col-span-7">
            <ImageFrame
              mediaRef={ref}
              alt={pickAlt(ref, wedding.secondary_image_alt, "The wedding venue")}
              ratio="3/2"
              sizes="(min-width: 1024px) 55vw, 100vw"
              placeholderLabel="Venue photograph"
              placeholderHint="Upload in Admin › Homepage"
            />
          </ImageReveal>
          <Reveal className="lg:col-span-4 lg:col-start-9">
            <Eyebrow>The Venue</Eyebrow>
            <h2 id="venue-title" className="mt-4 text-h1 text-dark-walnut sm:text-[36px] sm:leading-[1.12]">
              {v?.name ?? "Where we celebrate"}
            </h2>
            {v ? (
              <>
                {v.address || v.city ? (
                  <address className="mt-4 text-body text-secondary-text not-italic">{[v.address, v.city, v.state].filter(Boolean).join(", ")}</address>
                ) : null}
                {v.events.length ? <p className="mt-4 text-support text-secondary-text">Hosting {v.events.map((e) => e.name).join(", ")}.</p> : null}
              </>
            ) : (
              <p className="mt-4 text-body text-secondary-text">Venue details and directions will be announced soon.</p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              {directions ? (
                <ButtonLink href={directions} external variant="filled">
                  Get directions
                </ButtonLink>
              ) : null}
              <ButtonLink href="/locations" variant="ghost">
                {venues.length > 1 ? `All ${venues.length} locations` : "Location details"}
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

export function LiveTeaserSection({ stream, timezone }: { stream: LiveStream | null; timezone: string }) {
  if (!stream) return null;
  const url = stream.status === "ended" ? (stream.replay_url ?? stream.youtube_url) : stream.youtube_url;
  const id = getYouTubeId(url);
  const when = formatDateTimeInZone(stream.scheduled_at, timezone);
  const cta = stream.status === "live" ? "Watch live" : stream.status === "ended" ? "Watch the replay" : "Live stream details";

  return (
    <Section labelledBy="live-title" className="border-t border-soft-border">
      <Container width="wide">
        <div className="grid items-center gap-10 rounded-[var(--radius-surface)] border border-soft-border bg-card-surface p-5 sm:p-8 lg:grid-cols-12 lg:gap-14 lg:p-12">
          <Reveal className="lg:col-span-5">
            <StreamStatusBadge status={stream.status} />
            <h2 id="live-title" className="mt-5 text-h1 text-dark-walnut sm:text-[36px] sm:leading-[1.12]">
              {stream.title}
            </h2>
            <p className="mt-4 text-body text-secondary-text">
              {stream.status === "upcoming"
                ? `Can't be there in person? Watch the ceremony live${when ? ` from ${when}` : ""}.`
                : stream.status === "live"
                  ? "We are live right now. Join the celebration from wherever you are."
                  : "Missed the moment? The full ceremony is available to watch again."}
            </p>
            <div className="mt-8">
              <ButtonLink href="/live" variant={stream.status === "live" ? "filled" : "primary"}>
                {cta}
              </ButtonLink>
            </div>
          </Reveal>
          <Link href="/live" className="group relative block overflow-hidden rounded-[var(--radius-control)] lg:col-span-7" aria-label={cta}>
            <div className="relative aspect-video bg-dark-walnut">
              {id ? (
                <Image src={youTubeThumbnail(id)} alt="" fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover opacity-90 transition-transform duration-[1.2s] group-hover:scale-[1.03]" />
              ) : null}
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-16 items-center justify-center rounded-full border border-soft-cream/70 bg-dark-walnut/40 text-soft-cream transition-colors group-hover:bg-dark-walnut/70">
                  <Play className="ml-0.5 size-5" strokeWidth={1.5} aria-hidden />
                </span>
              </span>
            </div>
          </Link>
        </div>
      </Container>
    </Section>
  );
}

const STEPS = [
  { title: "Register for Draw", text: "Add your details and choose Bride Side or Groom Side. It takes a minute." },
  { title: "Verify at Venue", text: "Scan the common event QR code at the wedding and enter your registered mobile number." },
  { title: "Win a Special Gift", text: "Verified guests enter our wedding lucky draw. 11 special gifts will be presented to drawn winners!" },
];

export function LuckyDrawCtaSection({ app, wedding }: { app: AppSettings; wedding: WeddingSettings }) {
  const registerLabel = wedding.cta_primary_label ?? "Win a Special Gift";
  return (
    <Section labelledBy="lucky-draw-title">
      <Container width="wide">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <SectionHeading
              eyebrow="Wedding Lucky Draw"
              title={<span id="lucky-draw-title">Join our wedding gift draw</span>}
              intro={
                app.registration_open
                  ? "Join our wedding gift draw for a chance to win a special gift. Open for every guest — from the Bride's side and the Groom's side alike."
                  : "Registration for the lucky draw is now closed. Thank you to everyone who took part."
              }
            />
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              {app.registration_open ? (
                <ButtonLink href="/register" variant="filled" size="lg">
                  {registerLabel}
                </ButtonLink>
              ) : null}
              <ButtonLink href="/lucky-draw/winners" variant="ghost">
                See the winners
              </ButtonLink>
            </div>
            <p className="mt-4 text-[13px] text-secondary-text">
              * Note: Participation offers an opportunity to win a special gift, not a guarantee that every registrant will receive one.
            </p>
          </Reveal>
          <ol className="grid gap-px overflow-hidden rounded-[var(--radius-control)] border border-soft-border bg-soft-border sm:grid-cols-3 lg:col-span-7">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 0.08} className="flex flex-col bg-card-surface p-6 sm:p-7">
                <span className="text-numeral text-[40px] leading-none text-champagne-gold">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-8 font-serif text-[24px] leading-tight text-dark-walnut">{s.title}</h3>
                <p className="mt-3 text-support text-secondary-text">{s.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
