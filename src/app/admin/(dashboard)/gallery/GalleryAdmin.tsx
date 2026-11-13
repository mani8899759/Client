"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { AArea, ACheck, ASelect, AText } from "@/components/admin/fields";
import { MediaField, uploadMedia, type UploadedMedia } from "@/components/admin/MediaField";
import { Panel } from "@/components/admin/ui";
import { ButtonLink } from "@/components/buttons/Button";
import { Checkbox, SelectInput } from "@/components/forms/Fields";
import { useToast } from "@/components/feedback/Toast";
import { addYouTubeVideo, createUploadedMedia, saveCategory, updateMedia } from "./actions";
import type { GalleryCategory, GalleryMedia } from "@/types/database";

export function BulkUploader({ categories }: { categories: GalleryCategory[] }) {
  const [category, setCategory] = useState("");
  const [publish, setPublish] = useState(true);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const { notify } = useToast();
  const router = useRouter();

  async function onFiles(list: FileList | null) {
    if (!list?.length) return;
    const files = [...list].slice(0, 50);
    setErrors([]);
    setProgress({ done: 0, total: files.length });
    const uploaded: Array<UploadedMedia & { kind: "image" | "video" }> = [];
    const problems: string[] = [];
    // Upload sequentially to stay gentle on mobile connections.
    for (const file of files) {
      const kind = file.type.startsWith("video/") ? "video" : "image";
      try {
        const u = await uploadMedia(file, "gallery", kind);
        uploaded.push({ ...u, kind });
      } catch (e) {
        problems.push(`${file.name}: ${(e as Error).message}`);
      }
      setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
    }
    setErrors(problems);
    if (inputRef.current) inputRef.current.value = "";
    if (!uploaded.length) {
      setProgress(null);
      return;
    }
    const fd = new FormData();
    fd.set("files", JSON.stringify(uploaded));
    fd.set("category_id", category);
    if (publish) fd.set("is_published", "on");
    startTransition(async () => {
      const r = await createUploadedMedia(null, fd);
      if (r) notify(r.message, r.ok ? "success" : "error");
      setProgress(null);
      router.refresh();
    });
  }

  const busy = progress !== null;
  return (
    <Panel title="Upload photos & videos" description="JPG, PNG or WebP up to 15 MB; MP4 up to 50 MB. Up to 50 files at a time.">
      <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
        <SelectInput
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Uncategorised"
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
        />
        <Checkbox label="Publish immediately" checked={publish} onChange={(e) => setPublish(e.target.checked)} className="pb-3" />
      </div>
      <label
        className={`mt-5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[var(--radius-surface)] border border-dashed border-champagne-gold bg-soft-cream px-6 py-10 text-center transition-colors hover:bg-card-surface has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary ${busy ? "pointer-events-none opacity-70" : ""}`}
      >
        <UploadCloud className="size-6 text-muted-gold" strokeWidth={1.5} aria-hidden />
        <span className="text-support text-dark-walnut">
          {busy ? `Uploading ${progress.done} of ${progress.total}…` : "Choose files to upload"}
        </span>
        <span className="text-[12px] text-secondary-text">Original aspect ratios are preserved in the gallery.</span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,video/mp4"
          className="sr-only"
          onChange={(e) => void onFiles(e.target.files)}
          disabled={busy}
        />
      </label>
      {errors.length ? (
        <ul role="alert" className="mt-4 list-disc pl-5 text-[13px] text-secondary">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}
    </Panel>
  );
}

export function YouTubeForm({ categories }: { categories: GalleryCategory[] }) {
  return (
    <Panel title="Add a YouTube video" description="Public or unlisted YouTube videos. Unlisted videos are not private — anyone with the link can watch.">
      <ActionForm action={addYouTubeVideo} resetOnSuccess>
        <div className="grid gap-5 sm:grid-cols-2">
          <AText name="video_url" label="YouTube link" type="url" required placeholder="https://www.youtube.com/watch?v=…" className="sm:col-span-2" />
          <AText name="title" label="Title" maxLength={160} optionalLabel />
          <ASelect name="category_id" label="Category" placeholder="Uncategorised" options={categories.map((c) => ({ value: c.id, label: c.name }))} />
          <ACheck name="is_published" label="Publish immediately" defaultChecked />
        </div>
        <div className="mt-6 flex justify-end">
          <SubmitButton>Add video</SubmitButton>
        </div>
      </ActionForm>
    </Panel>
  );
}

export function CategoryForm({ category }: { category: GalleryCategory | null }) {
  const router = useRouter();
  return (
    <ActionForm action={saveCategory} resetOnSuccess={!category} onSuccess={() => category && router.push("/admin/gallery")}>
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <AText name="name" label={category ? "Name" : "New category"} defaultValue={category?.name ?? ""} maxLength={60} required />
        <AText name="description" label="Description" defaultValue={category?.description ?? ""} maxLength={300} optionalLabel />
        {category ? <input type="hidden" name="is_published" value={category.is_published ? "on" : ""} /> : null}
        <SubmitButton variant={category ? "filled" : "primary"} className="h-12">
          {category ? "Save" : "Add category"}
        </SubmitButton>
      </div>
    </ActionForm>
  );
}

export function MediaEditForm({ item, categories }: { item: GalleryMedia; categories: GalleryCategory[] }) {
  const router = useRouter();
  return (
    <Panel title="Edit gallery item">
      <ActionForm action={updateMedia} onSuccess={() => router.push("/admin/gallery")}>
        <input type="hidden" name="id" value={item.id} />
        <div className="grid gap-5 sm:grid-cols-2">
          <AText name="title" label="Title" defaultValue={item.title ?? ""} maxLength={160} optionalLabel />
          <ASelect
            name="category_id"
            label="Category"
            defaultValue={item.category_id ?? ""}
            placeholder="Uncategorised"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
          <AText name="alt_text" label="Description for screen readers (alt text)" defaultValue={item.alt_text ?? ""} maxLength={200} className="sm:col-span-2" />
          <AArea name="caption" label="Caption" defaultValue={item.caption ?? ""} maxLength={600} rows={2} optionalLabel className="sm:col-span-2" />
          {item.video_source === "youtube" ? (
            <AText name="video_url" label="YouTube link" type="url" defaultValue={item.video_url ?? ""} className="sm:col-span-2" />
          ) : null}
          {item.media_type === "video" ? (
            <div className="sm:col-span-2">
              <MediaField name="thumbnail_path" label="Custom thumbnail (optional)" purpose="gallery" defaultValue={item.thumbnail_path} ratio="16/9" />
            </div>
          ) : null}
          <ACheck name="is_published" label="Published" defaultChecked={item.is_published} />
          <ACheck name="is_featured" label="Feature on the homepage" defaultChecked={item.is_featured} />
        </div>
        <div className="mt-8 flex justify-end gap-3 border-t border-soft-border pt-6">
          <ButtonLink href="/admin/gallery" variant="primary">
            Cancel
          </ButtonLink>
          <SubmitButton>Save item</SubmitButton>
        </div>
      </ActionForm>
    </Panel>
  );
}
