import { Hero } from "@/components/home/Hero";
import {
  CoupleSection,
  EventsPreviewSection,
  GalleryPreviewSection,
  LiveTeaserSection,
  LuckyDrawCtaSection,
  StoryPreviewSection,
  VenuePreviewSection,
  WelcomeSection,
} from "@/components/home/Sections";
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

  return (
    <>
      {/* 1–2. Hero with live countdown */}
      <Hero wedding={wedding} app={app} />
      {/* 3. Welcome */}
      <WelcomeSection wedding={wedding} />
      {/* 4. Couple introduction */}
      <CoupleSection wedding={wedding} />
      {/* 5. Love story preview */}
      <StoryPreviewSection wedding={wedding} entries={story} />
      {/* 6. Events preview */}
      <EventsPreviewSection events={events} />
      {/* 7. Gallery preview */}
      <GalleryPreviewSection media={gallery} />
      {/* 8. Venue preview */}
      <VenuePreviewSection wedding={wedding} venues={venues} />
      {/* 9. Lucky draw registration CTA */}
      <LuckyDrawCtaSection app={app} wedding={wedding} />
      {/* 10. Live streaming preview */}
      {app.live_section_visible ? <LiveTeaserSection stream={pickFeaturedStream(streams)} timezone={wedding.timezone} /> : null}
    </>
  );
}
