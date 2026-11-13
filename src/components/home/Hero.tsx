import { ButtonLink } from "@/components/buttons/Button";
import { Container } from "@/components/layout/Container";
import { HeroMedia } from "@/components/media/HeroMedia";
import { Countdown } from "@/components/countdown/Countdown";
import { HeroText } from "./HeroText";
import { coupleNames } from "@/lib/utils/names";
import { weddingSchedule } from "@/lib/utils/wedding";
import { mediaUrl } from "@/lib/storage/media";
import { pickAlt, pickImage } from "@/lib/storage/imagery";
import type { AppSettings, WeddingSettings } from "@/types/database";

/**
 * Hero: masthead (names, announcement, date, CTAs), the large editorial
 * photograph, and the live countdown card overlapping its lower edge.
 */
export function Hero({ wedding, app }: { wedding: WeddingSettings; app: AppSettings }) {
  const names = coupleNames(wedding);
  const schedule = weddingSchedule(wedding);
  const heroRef = pickImage(wedding.hero_image_path, "hero");
  const registerLabel = app.registration_open ? (wedding.cta_primary_label ?? "Register Now") : "Lucky Draw Winners";

  return (
    <section aria-labelledby="hero-title" className="pt-10 pb-16 sm:pt-14 lg:pt-16 lg:pb-24">
      <Container width="wide">
        <HeroText>
          {wedding.announcement ? <p className="mb-6 text-meta text-muted-gold">{wedding.announcement}</p> : null}
          <h1 id="hero-title" className="text-display text-dark-walnut">
            {names.bride} <span className="text-primary italic">&amp;</span> {names.groom}
          </h1>
          <p className="mt-4 font-serif text-[22px] leading-snug text-secondary-text italic sm:text-[26px]">
            {wedding.hero_heading ?? "Are getting married"}
          </p>
          <div className="mx-auto mt-7 flex max-w-[520px] items-center gap-4">
            <span aria-hidden className="h-px flex-1 bg-champagne-gold/70" />
            <p className="text-meta text-dark-walnut">{schedule?.dateOnlyLabel ?? "Date to be announced"}</p>
            <span aria-hidden className="h-px flex-1 bg-champagne-gold/70" />
          </div>
          {wedding.hero_subheading ? (
            <p className="mx-auto mt-6 max-w-[56ch] text-body text-secondary-text text-pretty">{wedding.hero_subheading}</p>
          ) : null}
          <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <ButtonLink href={app.registration_open ? "/register" : "/lucky-draw/winners"} variant="filled" size="lg">
              {registerLabel}
            </ButtonLink>
            <ButtonLink href="/story" variant="primary" size="lg">
              {wedding.cta_secondary_label ?? "View Our Story"}
            </ButtonLink>
          </div>
        </HeroText>

        <div className="mt-12 sm:mt-16">
          <HeroMedia
            imageRef={heroRef}
            imageUrl={mediaUrl(heroRef)}
            videoUrl={mediaUrl(wedding.hero_video_path)}
            alt={pickAlt(heroRef, wedding.hero_image_alt, names.joined)}
          />
        </div>

        {schedule ? (
          <div
            id="countdown"
            className="relative z-10 mx-auto -mt-12 w-[calc(100%-24px)] max-w-[920px] rounded-[var(--radius-surface)] border border-soft-border bg-card-surface px-3 py-9 shadow-[var(--shadow-lift)] sm:-mt-24 sm:w-[calc(100%-64px)] sm:px-8 sm:py-12"
          >
            <Countdown
              targetIso={schedule.targetIso}
              dayStartIso={schedule.dayStartIso}
              dayEndIso={schedule.dayEndIso}
              timeConfirmed={schedule.timeConfirmed}
              endIso={schedule.endIso}
              dateLabel={schedule.dateLabel}
              headingId="countdown-title"
            />
          </div>
        ) : null}
      </Container>
    </section>
  );
}
