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
      {/* 1–3. Header is in layout; Hero with Priya & Arjun, date and live countdown */}
      <Hero wedding={wedding} app={app} />

      {/* 4. Welcome message */}
      <WelcomeSection wedding={wedding} />

      {/* 5. Couple introduction */}
      <CoupleSection wedding={wedding} />

      {/* 6. Our Story */}
      <StoryPreviewSection wedding={wedding} entries={story} />

      {/* 7. Wedding Events */}
      <EventsPreviewSection events={events} />

      {/* 8. Photo Gallery */}
      <GalleryPreviewSection media={gallery} />

      {/* 9. Watch Our Celebration Live — directly after Gallery */}
      {app.live_section_visible ? (
        <WatchCelebrationLiveSection
          stream={featuredStream}
          timezone={wedding.timezone}
          weddingDateLabel={schedule?.dateOnlyLabel ?? "December 13, 2026"}
        />
      ) : null}

      {/* 10. Wedding Locations and Get Directions */}
      <VenuePreviewSection wedding={wedding} venues={venues} />

      {/* 11–12. Win a Special Gift CTA section & Lucky Draw verification */}
      <LuckyDrawCtaSection app={app} wedding={wedding} />
    </>
  );
}
