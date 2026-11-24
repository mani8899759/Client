import { ButtonLink } from "@/components/buttons/Button";
import { Container } from "@/components/layout/Container";
import { HeroMedia } from "@/components/media/HeroMedia";
import { Countdown } from "@/components/countdown/Countdown";
import { ViewInvitationButton } from "@/components/invitation/ViewInvitationButton";
import { HeroText, HeroTextItem } from "./HeroText";
import { Reveal } from "@/components/motion/Reveal";
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
  const registerLabel = app.registration_open ? (wedding.cta_primary_label ?? "Win a Special Gift") : "Lucky Draw Winners";
  const invitationPath = wedding.invitation_pdf_path || wedding.invitation_image_path || null;
  const invitationUrl = wedding.invitation_published !== false ? mediaUrl(invitationPath) : null;
  const invitationType = wedding.invitation_pdf_path ? "pdf" : wedding.invitation_image_path ? "image" : null;

  return (
    <section aria-labelledby="hero-title" className="pt-10 pb-4 sm:pt-14 sm:pb-16 lg:pt-16 lg:pb-24">
      <Container width="wide">
        <HeroText>
          <HeroTextItem>
            <div className="mb-2 sm:mb-3">
              <p className="font-sans text-[11px] xs:text-[12px] sm:text-[13px] font-semibold tracking-[0.2em] sm:tracking-[0.24em] uppercase text-muted-gold">
                {wedding.family_heading || "Gudla & Padakanti Families"}
              </p>
              <p className="mt-0.5 font-serif text-[13px] xs:text-[14px] sm:text-[15px] italic text-secondary-text">
                cordially invite you to celebrate
              </p>
            </div>
          </HeroTextItem>
          {wedding.announcement ? (
            <HeroTextItem>
              <p className="mb-4 text-meta text-muted-gold sm:mb-6">{wedding.announcement}</p>
            </HeroTextItem>
          ) : null}
          <HeroTextItem>
            <h1 id="hero-title" className="font-serif text-[32px] xs:text-[38px] leading-[1.15] text-dark-walnut sm:text-display">
              {names.groom} <span className="text-primary italic font-serif">&amp;</span> {names.bride}
            </h1>
          </HeroTextItem>
          <HeroTextItem>
            <p className="mt-3 font-serif text-[18px] xs:text-[20px] leading-snug text-secondary-text italic sm:mt-4 sm:text-[26px]">
              {wedding.hero_heading ?? "Are getting married"}
            </p>
          </HeroTextItem>
          <HeroTextItem>
            <div className="mx-auto mt-6 flex max-w-[360px] xs:max-w-[420px] items-center gap-3 sm:mt-7 sm:max-w-[520px] sm:gap-4">
              <span aria-hidden className="h-px flex-1 bg-champagne-gold/70" />
              <p className="text-meta text-dark-walnut tracking-[0.16em] xs:tracking-[0.18em] text-[11px] xs:text-[12px] whitespace-nowrap">{schedule?.dateOnlyLabel ?? "December 13, 2026"}</p>
              <span aria-hidden className="h-px flex-1 bg-champagne-gold/70" />
            </div>
          </HeroTextItem>
          {wedding.hero_subheading ? (
            <HeroTextItem>
              <p className="mx-auto mt-5 max-w-[340px] text-[15px] xs:text-[16px] leading-[1.65] text-secondary-text text-pretty sm:mt-6 sm:max-w-[56ch] sm:text-body">
                {wedding.hero_subheading}
              </p>
            </HeroTextItem>
          ) : null}
          <HeroTextItem>
            <div className="mx-auto mt-8 flex w-full max-w-[360px] flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center">
              <ButtonLink
                href={app.registration_open ? "/register" : "/lucky-draw/winners"}
                variant="filled"
                size="lg"
                className="w-full min-h-[48px] sm:w-auto text-center justify-center font-medium"
              >
                {registerLabel}
              </ButtonLink>
              <ViewInvitationButton
                invitationUrl={invitationUrl}
                invitationType={invitationType}
                variant="primary"
                size="lg"
                className="w-full min-h-[48px] sm:w-auto px-6 text-center justify-center font-medium"
              />
              <ButtonLink
                href="/story"
                variant="ghost"
                size="lg"
                className="hidden sm:inline-flex w-full sm:w-auto text-center justify-center"
              >
                {wedding.cta_secondary_label ?? "View Our Story"}
              </ButtonLink>
            </div>
          </HeroTextItem>
          <HeroTextItem>
            <p className="mt-4 text-center text-[13px] text-secondary-text">
              Join our wedding gift draw for a chance to win a special gift.
            </p>
          </HeroTextItem>
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
          <Reveal
            preset="zoom-reveal"
            delay={0.15}
            className="relative z-10 mx-auto -mt-10 xs:-mt-14 w-full max-w-[920px] rounded-[var(--radius-surface)] border border-soft-border bg-card-surface px-2.5 xs:px-4 py-7 shadow-[var(--shadow-lift)] sm:-mt-24 sm:px-8 sm:py-12"
          >
            <div id="countdown">
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
          </Reveal>
        ) : null}
      </Container>
    </section>
  );
}
