import Link from "next/link";
import Image from "next/image";
import { requireAdminPage } from "@/lib/auth/admin";
import { AdminPageHeader, Badge, Panel } from "@/components/admin/ui";
import { SiteImageSlot } from "./SiteImageSlot";
import { LogoSettingsForm } from "./LogoSettingsForm";
import { AI_SLOTS, AI_STYLE, aiAsset, aiRef } from "@/config/ai-assets";
import { DEFAULT_WEDDING } from "@/services/content/defaults";
import { isAiRef, mediaUrl } from "@/lib/storage/media";
import type { WeddingSettings } from "@/types/database";

export const metadata = { title: "Media" };

const SITE_SLOTS = [
  { field: "hero_image_path", alt: "hero_image_alt", label: "Homepage hero", ai: "hero", ratio: "16/9" },
  { field: "welcome_image_path", alt: "welcome_image_alt", label: "Welcome — couple portrait", ai: "couple-editorial-portrait", ratio: "4/5" },
  { field: "bride_image_path", alt: "bride_image_alt", label: "Couple introduction — bride", ai: "bride-detail", ratio: "4/5" },
  { field: "groom_image_path", alt: "groom_image_alt", label: "Couple introduction — groom", ai: "groom-detail", ratio: "4/5" },
  { field: "secondary_image_path", alt: "secondary_image_alt", label: "Venue preview", ai: "wedding-environment", ratio: "3/2" },
] as const;

export default async function MediaPage() {
  const { supabase } = await requireAdminPage();
  const [wRes, galleryRes] = await Promise.all([
    supabase.from("wedding_settings").select("*").single<WeddingSettings>(),
    supabase.from("gallery_media").select("id, is_ai_generated, is_published"),
  ]);
  const w = { ...DEFAULT_WEDDING, ...(wRes.data ?? {}) };
  const gallery = (galleryRes.data as Array<{ id: string; is_ai_generated: boolean; is_published: boolean }> | null) ?? [];
  const aiGallery = gallery.filter((g) => g.is_ai_generated);
  const present = AI_SLOTS.filter((s) => aiRef(s.slot));

  return (
    <>
      <AdminPageHeader
        eyebrow="Gallery & Media"
        title="Site imagery & AI illustrations"
        description="See where every image on the website comes from. AI illustrations depict a fictional couple and are placeholders until real photographs are uploaded — a real upload always takes precedence."
        actions={
          <Link href="/admin/gallery" className="inline-flex h-9 items-center rounded-[var(--radius-control)] border border-primary/70 px-4 text-[13px]">
            Gallery manager
          </Link>
        }
      />

      <Panel
        title="Official wedding logo"
        className="mb-6"
        description="Manage the official wedding logo across the website header, mobile bottom-right floating badge, and YouTube Live placeholder."
      >
        <LogoSettingsForm wedding={w} />
      </Panel>

      <Panel title="Site images" description="Upload a real photograph to replace the illustration. Clearing an image falls back to the illustration (or a labelled placeholder).">
        <ul className="grid gap-5 lg:grid-cols-2">
          {SITE_SLOTS.map((s) => {
            const uploaded = w[s.field];
            const fallback = aiRef(s.ai);
            const effective = uploaded || fallback;
            const source = !effective ? "empty" : isAiRef(effective) ? "ai" : "photo";
            return (
              <SiteImageSlot
                key={s.field}
                field={s.field}
                label={s.label}
                ratio={s.ratio}
                uploaded={uploaded}
                uploadedAlt={w[s.alt]}
                effectiveUrl={mediaUrl(effective)}
                source={source}
                hasFallback={!!fallback}
              />
            );
          })}
        </ul>
        <p className="mt-5 text-[13px] text-secondary-text">
          Event photographs and invitations are managed per event in{" "}
          <Link href="/admin/events" className="underline underline-offset-4">
            Wedding Events
          </Link>
          ; events without a photo use the AI illustration for their ceremony type.
        </p>
      </Panel>

      <Panel
        title="AI illustration library"
        className="mt-6"
        description={`${present.length} of ${AI_SLOTS.length} illustrations imported · ${aiGallery.length} AI items in the gallery (${aiGallery.filter((g) => g.is_published).length} published).`}
      >
        {present.length === 0 ? (
          <p className="mb-6 rounded-[var(--radius-control)] border border-champagne-gold/50 bg-soft-cream p-4 text-[14px] text-secondary-text">
            No AI illustrations have been imported yet. Generate them with the prompts below, then run{" "}
            <code className="text-dark-walnut">npm run ai-assets:import -- &lt;folder&gt;</code> and redeploy. See docs/AI_IMAGE_MANIFEST.md.
          </p>
        ) : null}
        <details className="mb-6 rounded-[var(--radius-control)] border border-soft-border bg-soft-cream p-4">
          <summary className="cursor-pointer text-[14px] text-dark-walnut">Shared style prompt</summary>
          <p className="mt-3 text-[13px] text-secondary-text">{AI_STYLE}</p>
        </details>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AI_SLOTS.map((s) => {
            const a = aiAsset(s.slot);
            return (
              <li key={s.slot} className="flex flex-col overflow-hidden rounded-[var(--radius-control)] border border-soft-border bg-warm-ivory">
                <div className="relative aspect-[4/3] bg-soft-cream">
                  {a ? <Image src={mediaUrl(a.ref)!} alt={a.alt} fill sizes="(min-width: 1024px) 30vw, 90vw" className="object-cover" /> : null}
                  <span className="absolute top-2 left-2 flex gap-1.5">
                    {a ? <Badge tone="warning">AI-generated</Badge> : <Badge>Not imported</Badge>}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-3">
                  <p className="text-[14px] text-dark-walnut">{s.usedFor}</p>
                  <p className="text-[12px] text-secondary-text">
                    <code>{s.file}</code> · {s.ratio}
                    {a ? ` · ${a.width}×${a.height}` : ""}
                  </p>
                  <details className="mt-auto pt-1">
                    <summary className="cursor-pointer text-[12px] text-secondary-text">Prompt</summary>
                    <p className="mt-2 text-[12px] leading-relaxed text-secondary-text">{s.prompt}</p>
                  </details>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>
    </>
  );
}
