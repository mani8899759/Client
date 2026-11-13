import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { GalleryExperience } from "@/components/gallery/GalleryExperience";
import { getGalleryCategories, getGalleryPage } from "@/services/content";
import { presentAiAssets } from "@/config/ai-assets";
import type { GalleryMedia } from "@/types/database";

export const revalidate = 60;
export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const [categories, first] = await Promise.all([getGalleryCategories(), getGalleryPage({})]);
  // Until real photographs are published, show the imported AI illustrations (flagged as such).
  const items: GalleryMedia[] = first.items.length
    ? first.items
    : presentAiAssets()
        .filter((a) => a.group === "gallery" || a.group === "events")
        .map((a, i) => ({
          id: a.slot, category_id: null, media_type: "photo", title: null, caption: null, alt_text: a.alt,
          storage_path: a.ref, thumbnail_path: null, width: a.width, height: a.height, video_source: null, video_url: null,
          is_featured: false, sort_order: i, is_published: true, is_ai_generated: true, is_placeholder: true, created_at: "",
        }));
  return (
    <>
      <PageHeader eyebrow="Photo & Video Gallery" title="Moments, kept" intro="Photographs and films from every celebration. Select any image to view it in full." />
      <section aria-label="Gallery" className="pb-20 lg:pb-28">
        <Container width="wide">
          <GalleryExperience categories={categories} initialItems={items} initialHasMore={first.hasMore} />
        </Container>
      </section>
    </>
  );
}
