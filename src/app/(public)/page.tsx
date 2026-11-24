import { Hero } from "@/components/home/Hero";
import {
  CoupleSection,
  EventsPreviewSection,
  GalleryPreviewSection,
  LuckyDrawCtaSection,
  StoryPreviewSection,
  VenuePreviewSection,
  WelcomeSection,
} from "@/components/home/Sections";
import { WatchCelebrationLiveSection } from "@/components/home/WatchCelebrationLiveSection";
import { PhotoAccessSection } from "@/components/home/PhotoAccessSection";
import { weddingSchedule } from "@/lib/utils/wedding";
import {
  getAppSettings,
  getEvents,
  getFeaturedGallery,
  getLiveStreams,
  getLocations,
  getStoryEntries,
  getWeddingSettings,
  pickFeaturedStream,
} from "@/services/content";

export const revalidate = 60;

export default async function HomePage() {
  const [wedding, app, story, events, gallery, streams, venues] = await Promise.all([
    getWeddingSettings(),
    getAppSettings(),
    getStoryEntries(),
    getEvents(),
    getFeaturedGallery(6),
    getLiveStreams(),
    getLocations(),
  ]);

  const featuredStream = pickFeaturedStream(streams);
  const schedule = weddingSchedule(wedding);

  return (
    <>
      {/* 1. Homepage Hero with Manikanta & Sravika, Family Branding, date and live countdown */}
      <Hero wedding={wedding} app={app} />

      {/* 2. Welcome message & Couple introduction */}
      <WelcomeSection wedding={wedding} />
      <CoupleSection wedding={wedding} />

      {/* 3. Our Story */}
      <StoryPreviewSection wedding={wedding} entries={story} />

      {/* 4. Wedding Events */}
      <EventsPreviewSection events={events} />

      {/* 5. Photo Gallery */}
      <GalleryPreviewSection media={gallery} />

      {/* 6. Wedding Venue / Locations and Get Directions */}
      <VenuePreviewSection wedding={wedding} venues={venues} />

      {/* 7. YouTube Live Wedding Video */}
      {app.live_section_visible ? (
        <WatchCelebrationLiveSection
          stream={featuredStream}
          timezone={wedding.timezone}
          weddingDateLabel={schedule?.dateOnlyLabel ?? "December 13, 2026"}
        />
      ) : null}

      {/* 8. Access Your Wedding Photos — NEW SECTION */}
      <PhotoAccessSection wedding={wedding} />

      {/* 9. Win a Special Gift CTA section & Lucky Draw verification */}
      <LuckyDrawCtaSection app={app} wedding={wedding} />
    </>
  );
}
