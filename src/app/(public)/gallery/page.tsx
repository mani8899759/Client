import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { GalleryExperience } from "@/components/gallery/GalleryExperience";
import { getGalleryCategories, getGalleryPage } from "@/services/content";
import { WEDDING_SHOOT_PHOTOS } from "@/config/wedding-shoot";
import { shuffleArray } from "@/lib/utils/shuffle";
import type { GalleryMedia } from "@/types/database";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const [categories, first] = await Promise.all([getGalleryCategories(), getGalleryPage({})]);
  // Use published real gallery media from Supabase, or authentic shoot photos as static fallback
  const rawItems: GalleryMedia[] = first.items.length
    ? first.items
    : WEDDING_SHOOT_PHOTOS.map((p, i) => ({
        id: p.id,
        category_id: null,
        media_type: "photo" as const,
        title: p.caption,
        caption: p.caption,
        alt_text: p.alt,
        storage_path: p.webp,
        thumbnail_path: p.thumbnail,
        width: p.width,
        height: p.height,
        video_source: null,
        video_url: null,
        is_featured: p.id === "shoot-13" || p.id === "shoot-05",
        sort_order: i,
        is_published: true,
        is_ai_generated: false,
        is_placeholder: false,
        created_at: "",
      }));

  // Shuffle photos freshly on each new page visit/load using Fisher-Yates
  const items = shuffleArray(rawItems);

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
