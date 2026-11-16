import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { ImageFrame } from "@/components/media/ImageFrame";
import { Reveal, ImageReveal } from "@/components/motion/Reveal";
import { EmptyState } from "@/components/feedback/States";
import { ButtonLink } from "@/components/buttons/Button";
import { getStoryEntries, getWeddingSettings } from "@/services/content";
import { formatDateOnly } from "@/lib/utils/datetime";
import { coupleNames } from "@/lib/utils/names";
import { cn } from "@/lib/utils/cn";
import { pickAlt, pickImage } from "@/lib/storage/imagery";
import type { StoryEntry } from "@/types/database";

export const revalidate = 60;
export const metadata: Metadata = { title: "Our Story" };

function dateLabel(e: StoryEntry) {
  return e.date_label ?? formatDateOnly(e.entry_date, "short");
}

const STORY_SLOTS = ["story-first-meeting", "couple-prewedding", "engagement-editorial", "story-portrait"];

function TimelineEntry({ entry, index }: { entry: StoryEntry; index: number }) {
  const flip = index % 2 === 1;
  const hasSecondary = !!entry.secondary_image_path;
  const slot = STORY_SLOTS[index % STORY_SLOTS.length] ?? "story-portrait";
  const ref = pickImage(entry.image_path, slot);
  return (
    <li className="relative grid gap-8 pb-20 last:pb-0 lg:grid-cols-12 lg:gap-16 lg:pb-28">
      {/* Timeline spine marker */}
      <span aria-hidden className="absolute top-2 left-0 size-[9px] -translate-x-1/2 rounded-full border border-primary bg-warm-ivory lg:left-1/2" />

      <div className={cn("pl-8 lg:col-span-5 lg:pl-0", flip ? "lg:order-2 lg:col-start-8" : "lg:col-start-1")}>
        <ImageReveal preset={flip ? "slide-right" : "slide-left"} className="relative">
          <ImageFrame
            mediaRef={ref}
            alt={pickAlt(ref, entry.image_alt, entry.title)}
            ratio={index % 2 === 0 ? "4/5" : "1/1"}
            sizes="(min-width: 1024px) 40vw, 100vw"
            placeholderLabel="Chapter photograph"
          />
          {hasSecondary ? (
            <Reveal
              preset="zoom-reveal"
              delay={0.2}
              className={cn("absolute -bottom-8 w-[44%] border-[6px] border-warm-ivory shadow-md", flip ? "-left-6" : "-right-6")}
            >
              <ImageFrame
                mediaRef={entry.secondary_image_path}
                alt={entry.secondary_image_alt ?? entry.title}
                ratio="3/4"
                sizes="20vw"
                rounded={false}
              />
            </Reveal>
          ) : null}
        </ImageReveal>
      </div>

      <Reveal
        preset={flip ? "slide-left" : "slide-right"}
        delay={0.12}
        className={cn("pl-8 lg:col-span-5 lg:pl-0", flip ? "lg:order-1 lg:col-start-1 lg:text-right" : "lg:col-start-8", hasSecondary && "mt-6 lg:mt-0")}
      >
        <div className={cn("flex flex-wrap items-baseline gap-x-4 gap-y-1", flip && "lg:justify-end")}>
          {entry.chapter ? <span className="text-meta text-muted-gold">{entry.chapter}</span> : null}
          {dateLabel(entry) ? <span className="text-meta text-secondary-text">{dateLabel(entry)}</span> : null}
        </div>
        <h2 className="mt-4 text-h1 text-dark-walnut sm:text-[36px] sm:leading-[1.12]">{entry.title}</h2>
        {entry.description ? (
          <div className="mt-5 space-y-4 text-body text-secondary-text">
            {entry.description.split(/\n{2,}/).map((p, i) => (
              <p key={i} className="text-pretty">
                {p}
              </p>
            ))}
          </div>
        ) : null}
      </Reveal>
    </li>
  );
}

export default async function StoryPage() {
  const [wedding, entries] = await Promise.all([getWeddingSettings(), getStoryEntries()]);
  const names = coupleNames(wedding);

  return (
    <>
      <PageHeader
        eyebrow="Our Love Story"
        title={
          <>
            {names.bride} <span className="text-primary italic">&amp;</span> {names.groom}
          </>
        }
        intro={wedding.story_intro ?? undefined}
      />

      <section aria-label="Timeline" className="pb-20 lg:pb-28">
        <Container width="wide">
          {entries.length ? (
            <ol className="relative">
              <span aria-hidden className="absolute top-2 bottom-0 left-0 w-px bg-soft-border lg:left-1/2" />
              {entries.map((e, i) => (
                <TimelineEntry key={e.id} entry={e} index={i} />
              ))}
            </ol>
          ) : (
            <>
              {pickImage(null, "couple-prewedding") ? (
                <ImageReveal className="mx-auto mb-4 max-w-[960px]">
                  <ImageFrame mediaRef={pickImage(null, "couple-prewedding")} alt={pickAlt(pickImage(null, "couple-prewedding"), null, names.joined)} ratio="3/2" sizes="(min-width: 1024px) 960px, 100vw" />
                </ImageReveal>
              ) : null}
            <EmptyState
              title="Our story is being written"
              description="Chapters of how we met, our milestones and the proposal will be shared here soon."
            />
            </>
          )}
        </Container>
      </section>

      <section className="bg-soft-cream py-20 lg:py-28" aria-label="Closing message">
        <Container width="narrow" className="text-center">
          <Reveal>
            <span aria-hidden className="mx-auto mb-8 block h-12 w-px bg-champagne-gold" />
            {wedding.story_closing ? (
              <p className="font-serif text-[26px] leading-snug text-dark-walnut italic sm:text-[30px]">{wedding.story_closing}</p>
            ) : (
              <p className="font-serif text-[26px] leading-snug text-dark-walnut italic sm:text-[30px]">
                And now, the next chapter — we would love for you to be there.
              </p>
            )}
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/events" variant="filled">
                See the events
              </ButtonLink>
              <ButtonLink href="/gallery" variant="primary">
                Visit the gallery
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
