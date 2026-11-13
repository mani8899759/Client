import Link from "next/link";
import Image from "next/image";
import { Play, Star } from "lucide-react";
import { requireAdminPage } from "@/lib/auth/admin";
import { AdminPageHeader, Badge, Panel } from "@/components/admin/ui";
import { ConfirmActionButton } from "@/components/admin/forms";
import { MoveButtons, PublishToggle } from "@/components/admin/RowActions";
import { EmptyState } from "@/components/feedback/States";
import { BulkUploader, CategoryForm, MediaEditForm, YouTubeForm } from "./GalleryAdmin";
import { deleteCategory, deleteMedia, moveCategory, moveMedia, publishCategory, publishMedia } from "./actions";
import { thumbnailFor } from "@/lib/storage/thumbnail";
import { cn } from "@/lib/utils/cn";
import type { GalleryCategory, GalleryMedia } from "@/types/database";

export const metadata = { title: "Gallery" };

type Props = { searchParams: Promise<{ category?: string; media?: string; editCategory?: string }> };

export default async function GalleryAdminPage({ searchParams }: Props) {
  const { supabase } = await requireAdminPage();
  const sp = await searchParams;
  const [catRes, mediaRes] = await Promise.all([
    supabase.from("gallery_categories").select("*").order("sort_order"),
    supabase.from("gallery_media").select("*").order("sort_order").order("created_at", { ascending: false }).limit(500),
  ]);
  const categories = (catRes.data as GalleryCategory[] | null) ?? [];
  const all = (mediaRes.data as GalleryMedia[] | null) ?? [];
  const filter = sp.category ?? "all";
  const media =
    filter === "all"
      ? all
      : filter === "none"
        ? all.filter((m) => !m.category_id)
        : filter === "ai"
          ? all.filter((m) => m.is_ai_generated)
          : all.filter((m) => m.category_id === filter);
  const editing = sp.media ? all.find((m) => m.id === sp.media) : undefined;
  const editingCategory = sp.editCategory ? categories.find((c) => c.id === sp.editCategory) : undefined;
  const catName = new Map(categories.map((c) => [c.id, c.name]));
  const counts = new Map<string, number>();
  for (const m of all) if (m.category_id) counts.set(m.category_id, (counts.get(m.category_id) ?? 0) + 1);

  return (
    <>
      <AdminPageHeader
        eyebrow="Website"
        title="Gallery & Media"
        actions={
          <Link href="/admin/media" className="inline-flex h-9 items-center rounded-[var(--radius-control)] border border-primary/70 px-4 text-[13px]">
            Site imagery & AI illustrations
          </Link>
        }
        description="Photographs and videos for the public gallery. Unpublished items are never shown to guests."
      />

      {editing ? (
        <div className="mb-8">
          <MediaEditForm key={editing.id} item={editing} categories={categories} />
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <BulkUploader categories={categories} />
        <YouTubeForm categories={categories} />
      </div>

      <Panel title="Categories" className="mt-6" description="Shown as filters on the Gallery page, in this order.">
        <ul className="divide-y divide-soft-border">
          {categories.map((c, i) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0">
              <MoveButtons action={moveCategory} id={c.id} isFirst={i === 0} isLast={i === categories.length - 1} />
              <span className="min-w-0 flex-1">
                <span className="text-[15px]">{c.name}</span>
                <span className="ml-2 text-[12px] text-secondary-text">{counts.get(c.id) ?? 0} items</span>
              </span>
              <PublishToggle action={publishCategory} id={c.id} published={c.is_published} />
              <Link href={`/admin/gallery?editCategory=${c.id}`} className="text-[13px] underline underline-offset-4">
                Rename
              </Link>
              <ConfirmActionButton
                action={deleteCategory}
                fields={{ id: c.id }}
                label="Delete"
                title={`Delete "${c.name}"?`}
                description="Items in this category are kept and become uncategorised."
                tone="danger"
                variant="ghost"
                className="text-secondary!"
              />
            </li>
          ))}
        </ul>
        <div className="mt-5 border-t border-soft-border pt-5">
          <CategoryForm key={editingCategory?.id ?? "new"} category={editingCategory ?? null} />
        </div>
      </Panel>

      <Panel
        title="Media library"
        className="mt-6"
        description={`${all.length} item${all.length === 1 ? "" : "s"} · ${all.filter((m) => m.is_published).length} published`}
      >
        <nav aria-label="Filter by category" className="-mx-1 mb-6 flex flex-wrap gap-2">
          {[{ id: "all", name: "All" }, ...categories, { id: "none", name: "Uncategorised" }, { id: "ai", name: "AI illustrations" }].map((c) => (
            <Link
              key={c.id}
              href={c.id === "all" ? "/admin/gallery" : `/admin/gallery?category=${c.id}`}
              aria-current={filter === c.id ? "page" : undefined}
              className={cn(
                "h-8 rounded-full border px-3 text-[13px] leading-[30px]",
                filter === c.id ? "border-dark-walnut bg-dark-walnut text-soft-cream" : "border-soft-border bg-soft-cream text-secondary-text hover:border-champagne-gold",
              )}
            >
              {c.name}
            </Link>
          ))}
        </nav>
        {media.length ? (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {media.map((m, i) => {
              const thumb = thumbnailFor(m);
              return (
                <li key={m.id} className="flex flex-col overflow-hidden rounded-[var(--radius-control)] border border-soft-border bg-warm-ivory">
                  <div className="relative aspect-[4/3] bg-soft-cream">
                    {thumb ? <Image src={thumb} alt={m.alt_text ?? ""} fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-cover" /> : null}
                    {m.media_type === "video" ? (
                      <span className="absolute top-2 left-2 flex size-7 items-center justify-center rounded-full bg-dark-walnut/70 text-soft-cream">
                        <Play className="size-3.5" aria-hidden />
                        <span className="sr-only">Video</span>
                      </span>
                    ) : null}
                    {m.is_featured ? (
                      <span className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-card-surface/90 text-primary" title="Featured on homepage">
                        <Star className="size-3.5" aria-hidden />
                        <span className="sr-only">Featured</span>
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <p className="truncate text-[13px] text-dark-walnut">{m.title ?? (m.media_type === "video" ? "Untitled video" : "Untitled photo")}</p>
                    <p className="truncate text-[12px] text-secondary-text">{m.category_id ? catName.get(m.category_id) : "Uncategorised"}</p>
                    {m.is_ai_generated ? <Badge tone="warning">AI illustration{m.is_placeholder ? " · placeholder" : ""}</Badge> : null}
                    {!m.alt_text && m.media_type === "photo" ? <Badge tone="warning">Needs alt text</Badge> : null}
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-1 pt-1">
                      <PublishToggle action={publishMedia} id={m.id} published={m.is_published} />
                      {filter === "all" ? <MoveButtons action={moveMedia} id={m.id} isFirst={i === 0} isLast={i === media.length - 1} /> : null}
                    </div>
                    <div className="flex items-center justify-between border-t border-soft-border pt-2">
                      <Link href={`/admin/gallery?media=${m.id}${filter !== "all" ? `&category=${filter}` : ""}`} className="text-[13px] underline underline-offset-4">
                        Edit
                      </Link>
                      <ConfirmActionButton
                        action={deleteMedia}
                        fields={{ id: m.id }}
                        label="Delete"
                        title="Delete this item?"
                        description="The file is permanently removed from storage."
                        tone="danger"
                        variant="ghost"
                        className="text-secondary! text-[13px]!"
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState title="No media here yet" description="Upload photographs or add a YouTube link above." />
        )}
      </Panel>
    </>
  );
}
