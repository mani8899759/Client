"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Play } from "lucide-react";
import { Lightbox } from "./Lightbox";
import { EmptyState, ErrorState } from "@/components/feedback/States";
import { Button } from "@/components/buttons/Button";
import { thumbnailFor } from "@/lib/storage/thumbnail";
import { cn } from "@/lib/utils/cn";
import type { GalleryCategory, GalleryMedia } from "@/types/database";

type Filter = { key: string; label: string; type?: "photo" | "video"; category?: string };

function ratioOf(item: GalleryMedia): number {
  if (item.width && item.height) return Math.min(1.8, Math.max(0.55, item.width / item.height));
  return item.media_type === "video" ? 16 / 9 : 4 / 5;
}

export function GalleryExperience({
  categories,
  initialItems,
  initialHasMore,
}: {
  categories: GalleryCategory[];
  initialItems: GalleryMedia[];
  initialHasMore: boolean;
}) {
  const filters: Filter[] = [
    { key: "all", label: "All" },
    { key: "photos", label: "Photos", type: "photo" },
    { key: "videos", label: "Videos", type: "video" },
    ...categories.map((c) => ({ key: c.id, label: c.name, category: c.id })),
  ];

  const [active, setActive] = useState("all");
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);
  const reduce = useReducedMotion();

  const load = useCallback(
    async (filterKey: string, offset: number) => {
      const f = filters.find((x) => x.key === filterKey) ?? filters[0]!;
      const params = new URLSearchParams({ offset: String(offset) });
      if (f.type) params.set("type", f.type);
      if (f.category) params.set("category", f.category);
      const id = ++requestId.current;
      setLoading(true);
      setFailed(false);
      try {
        const res = await fetch(`/api/public/gallery?${params.toString()}`);
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { items: GalleryMedia[]; hasMore: boolean };
        if (id !== requestId.current) return;
        setItems((prev) => (offset === 0 ? data.items : [...prev, ...data.items]));
        setHasMore(data.hasMore);
      } catch {
        if (id === requestId.current) setFailed(true);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    // filters is derived from props; categories identity is stable per render of the server page
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categories],
  );

  const selectFilter = (key: string) => {
    if (key === active) return;
    setActive(key);
    setItems([]);
    void load(key, 0);
  };

  // Progressive loading when the sentinel scrolls into view.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loading) void load(active, items.length);
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading, active, items.length, load]);

  return (
    <div>
      <div role="tablist" aria-label="Gallery categories" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0">
        {filters.map((f) => {
          const selected = f.key === active;
          return (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => selectFilter(f.key)}
              className={cn(
                "h-10 shrink-0 rounded-full border px-5 text-[14px] whitespace-nowrap transition-colors duration-300",
                selected
                  ? "border-dark-walnut bg-dark-walnut text-soft-cream"
                  : "border-soft-border bg-card-surface text-secondary-text hover:border-champagne-gold hover:text-dark-walnut",
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="mt-10" aria-live="polite" aria-busy={loading}>
        {items.length ? (
          <ul className="columns-2 gap-3 sm:gap-4 lg:columns-3 lg:gap-5">
            {items.map((item, i) => {
              const thumb = thumbnailFor(item);
              const label = item.alt_text ?? item.title ?? (item.media_type === "video" ? "Wedding video" : "Wedding photograph");
              return (
                <motion.li
                  key={item.id}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: Math.min(i % 24, 8) * 0.04 }}
                  className="mb-3 break-inside-avoid sm:mb-4 lg:mb-5"
                >
                  <button
                    type="button"
                    onClick={() => setOpen(i)}
                    className="group relative block w-full overflow-hidden rounded-[var(--radius-control)] bg-soft-cream text-left"
                    style={{ aspectRatio: String(ratioOf(item)) }}
                    aria-label={`${item.media_type === "video" ? "Play video" : "View photograph"}: ${label}`}
                  >
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={label}
                        fill
                        sizes="(min-width: 1024px) 33vw, 50vw"
                        className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-editorial)] group-hover:scale-[1.03]"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center bg-dark-walnut/90 text-meta text-soft-border">Video</span>
                    )}
                    {item.is_ai_generated ? (
                      <span className="pointer-events-none absolute right-2 bottom-2 rounded-full bg-card-surface/85 px-2 py-0.5 text-[10px] tracking-[0.12em] text-secondary-text uppercase">
                        Illustration
                      </span>
                    ) : null}
                    {item.media_type === "video" ? (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="flex size-14 items-center justify-center rounded-full border border-soft-cream/70 bg-dark-walnut/40 text-soft-cream transition-colors group-hover:bg-dark-walnut/70">
                          <Play className="ml-0.5 size-5" strokeWidth={1.5} aria-hidden />
                        </span>
                      </span>
                    ) : null}
                    {item.title ? (
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-dark-walnut/70 to-transparent px-4 pt-10 pb-3 text-[13px] text-soft-cream opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                        {item.title}
                      </span>
                    ) : null}
                  </button>
                </motion.li>
              );
            })}
          </ul>
        ) : !loading && !failed ? (
          <EmptyState title="Nothing here yet" description="Photographs and videos for this collection will be added soon." />
        ) : null}

        {failed ? (
          <ErrorState
            title="The gallery could not load"
            description="Please check your connection and try again."
            action={
              <Button variant="primary" onClick={() => void load(active, items.length)}>
                Try again
              </Button>
            }
          />
        ) : null}

        {loading ? (
          <div className="grid grid-cols-2 gap-3 pt-2 sm:gap-4 lg:grid-cols-3 lg:gap-5" aria-hidden>
            {[0, 1, 2].map((k) => (
              <div key={k} className="aspect-[4/5] animate-pulse rounded-[var(--radius-control)] bg-soft-cream" />
            ))}
          </div>
        ) : null}

        <div ref={sentinel} />
        {hasMore && !loading && !failed ? (
          <div className="mt-10 flex justify-center">
            <Button variant="primary" onClick={() => void load(active, items.length)}>
              Load more
            </Button>
          </div>
        ) : null}
      </div>

      {open !== null && items[open] ? (
        <Lightbox items={items} index={open} onIndexChange={setOpen} onClose={() => setOpen(null)} />
      ) : null}
    </div>
  );
}
