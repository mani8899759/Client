import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { YouTubeEmbed } from "@/components/media/YouTubeEmbed";
import { StreamStatusBadge } from "@/components/media/StreamStatusBadge";
import { EmptyState } from "@/components/feedback/States";
import { ButtonLink } from "@/components/buttons/Button";
import { Reveal } from "@/components/motion/Reveal";
import { OFFICIAL_LOGO } from "@/config/logo";
import { mediaUrl } from "@/lib/storage/media";
import { getAppSettings, getLiveStreams, getWeddingSettings, pickFeaturedStream } from "@/services/content";
import { formatDateTimeInZone } from "@/lib/utils/datetime";
import { getYouTubeId } from "@/lib/utils/youtube";
import type { LiveStream } from "@/types/database";

export const revalidate = 30;
export const metadata: Metadata = { title: "Live" };

function playableUrl(s: LiveStream): string | null {
  if (s.status === "ended") return s.replay_url ?? s.youtube_url;
  if (s.status === "live") return s.youtube_url;
  return null;
}

export default async function LivePage() {
  const [app, wedding, streams] = await Promise.all([getAppSettings(), getWeddingSettings(), getLiveStreams()]);
  const visible = app.live_section_visible ? streams : [];
  const featured = pickFeaturedStream(visible);
  const others = visible.filter((s) => s.id !== featured?.id);
  const featuredUrl = featured ? playableUrl(featured) : null;
  const hasValidFeatured = !!(featured && getYouTubeId(featured.youtube_url));
  const tz = wedding.timezone;
  const logoUrl = mediaUrl(wedding.logo_path) ?? OFFICIAL_LOGO.src;
  const showLogoPlaceholder = wedding.logo_youtube_enabled !== false && !!logoUrl;

  return (
    <>
      <PageHeader
        eyebrow="Live Stream"
        title="Watch Our Celebration Live"
        intro="Our wedding celebration will be shared here. Stay connected and be part of our special moments."
      />
      <section aria-label="Live streams" className="pb-20 lg:pb-28">
        <Container width="wide">
          {hasValidFeatured && featured ? (
            <Reveal preset="zoom-reveal" className="grid gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-8">
                {featuredUrl && getYouTubeId(featuredUrl) ? (
                  <YouTubeEmbed url={featuredUrl} title={featured.title} />
                ) : (
                  <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-[var(--radius-control)] border border-soft-border bg-card-surface p-6 text-center">
                    <span className="text-meta text-muted-gold">{featured.status === "upcoming" ? "Starting soon" : "Stream unavailable"}</span>
                    <p className="font-serif text-[28px] leading-tight text-dark-walnut">
                      {featured.status === "upcoming"
                        ? (formatDateTimeInZone(featured.scheduled_at, tz) ?? "Time to be announced")
                        : "Please check back shortly"}
                    </p>
                    {featured.status === "upcoming" && featured.youtube_url ? (
                      <ButtonLink href={featured.youtube_url} external variant="primary" className="mt-3">
                        Open on YouTube
                      </ButtonLink>
                    ) : null}
                  </div>
                )}
              </div>
              <div className="lg:col-span-4">
                <StreamStatusBadge status={featured.status} />
                <h2 className="mt-5 text-h1 text-dark-walnut">{featured.title}</h2>
                {featured.event ? (
                  <Link href={`/events/${featured.event.slug}`} className="mt-2 inline-block text-support text-secondary-text underline decoration-champagne-gold underline-offset-4">
                    {featured.event.name}
                  </Link>
                ) : null}
                {featured.scheduled_at ? <p className="mt-4 text-support text-secondary-text">{formatDateTimeInZone(featured.scheduled_at, tz)}</p> : null}
                {featured.description ? <p className="mt-5 text-body text-secondary-text">{featured.description}</p> : null}
              </div>
            </Reveal>
          ) : showLogoPlaceholder ? (
            <div className="flex flex-col items-center justify-center rounded-[var(--radius-surface)] border border-soft-border bg-soft-cream/60 px-6 py-10 text-center sm:px-14 sm:py-14">
              <div className="flex w-full max-w-[340px] items-center justify-center py-4 sm:max-w-[420px] sm:py-6">
                <Image
                  src={logoUrl}
                  alt={OFFICIAL_LOGO.alt}
                  width={OFFICIAL_LOGO.width}
                  height={OFFICIAL_LOGO.height}
                  className="h-auto w-full object-contain"
                />
              </div>
              <p className="mt-5 text-[14px] text-secondary-text">
                Live streaming details will be available soon.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[var(--radius-surface)] border border-soft-border bg-soft-cream/60 px-6 py-10 text-center sm:px-14 sm:py-14">
              <div className="relative aspect-[3/2] w-full max-w-[540px] overflow-hidden rounded-[var(--radius-control)] border border-soft-border bg-warm-ivory">
                <Image
                  src="/images/wedding-shoot/optimised/photo-13.webp"
                  alt="Manikanta & Sravika — Real Wedding Shoot Photograph"
                  width={2304}
                  height={1536}
                  className="h-full w-full object-cover object-[center_25%]"
                />
              </div>
              <p className="mt-5 text-[14px] text-secondary-text">
                Live streaming details will be available soon.
              </p>
            </div>
          )}

          {others.length ? (
            <div className="mt-20 lg:mt-28">
              <h2 className="text-meta text-muted-gold">All streams</h2>
              <ul className="mt-6">
                {others.map((s, i) => {
                  const url = playableUrl(s) ?? s.youtube_url;
                  return (
                    <Reveal as="li" key={s.id} preset="fade-up" delay={i * 0.08} className="grid gap-3 border-t border-soft-border py-6 last:border-b sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <StreamStatusBadge status={s.status} />
                          {s.scheduled_at ? <span className="text-[13px] text-secondary-text">{formatDateTimeInZone(s.scheduled_at, tz)}</span> : null}
                        </div>
                        <p className="mt-3 font-serif text-[24px] leading-tight text-dark-walnut">{s.title}</p>
                      </div>
                      {url ? (
                        <ButtonLink href={url} external variant={s.status === "live" ? "filled" : "primary"} size="sm">
                          {s.status === "ended" ? "Watch replay" : s.status === "live" ? "Watch live" : "Open on YouTube"}
                        </ButtonLink>
                      ) : null}
                    </Reveal>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </Container>
      </section>
    </>
  );
}
