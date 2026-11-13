"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Film, FileText, ExternalLink } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { BUCKETS, buildObjectPath, mediaUrl, validateMediaFile, type MediaPurpose } from "@/lib/storage/media";
import { useFieldError } from "./forms";
import { cn } from "@/lib/utils/cn";

function readImageSize(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export type UploadedMedia = { ref: string; width: number | null; height: number | null };

/** Upload a validated file directly to Supabase Storage as the signed-in admin (storage RLS enforces admin). */
export async function uploadMedia(file: File, purpose: MediaPurpose, kind: "image" | "video" | "pdf"): Promise<UploadedMedia> {
  const problem = validateMediaFile(file, kind);
  if (problem) throw new Error(problem);
  const bucket = kind === "video" ? BUCKETS.videos : BUCKETS.images;
  const path = buildObjectPath(purpose, file.type);
  const { error } = await getBrowserSupabase().storage.from(bucket).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message.includes("row-level security") ? "You are not allowed to upload files." : "Upload failed. Please try again.");
  const size = kind === "image" ? await readImageSize(file) : null;
  return { ref: `${bucket}/${path}`, width: size?.width ?? null, height: size?.height ?? null };
}

/**
 * Form field holding a stored media reference. Uploads on file selection and
 * writes the reference into a hidden input submitted with the form.
 */
export function MediaField({
  name,
  label,
  purpose,
  kind = "image",
  defaultValue,
  hint,
  ratio = "4/3",
}: {
  name: string;
  label: string;
  purpose: MediaPurpose;
  kind?: "image" | "video" | "pdf";
  defaultValue?: string | null;
  hint?: string;
  ratio?: string;
}) {
  const id = useId();
  const [value, setValue] = useState<string>(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const serverError = useFieldError(name);
  const url = mediaUrl(value);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const uploaded = await uploadMedia(file, purpose, kind);
      setValue(uploaded.ref);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-support text-dark-walnut" id={`${id}-label`}>
        {label}
      </span>
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="relative w-full overflow-hidden rounded-[var(--radius-control)] border border-soft-border bg-soft-cream sm:w-[220px]" style={{ aspectRatio: ratio }}>
          {url && kind === "image" ? (
            <Image src={url} alt="" fill sizes="220px" className="object-cover" />
          ) : url && kind === "video" ? (
            <video src={url} className="absolute inset-0 h-full w-full object-cover" muted preload="metadata" />
          ) : url && kind === "pdf" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-3 text-center">
              <FileText className="size-6 text-primary" strokeWidth={1.5} aria-hidden />
              <span className="text-[12px] font-medium text-dark-walnut">PDF Document</span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary underline"
              >
                <span>View</span>
                <ExternalLink className="size-3" aria-hidden />
              </a>
            </div>
          ) : (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[12px] text-secondary-text">
              {kind === "image" ? (
                <ImagePlus className="size-5 text-muted-gold" strokeWidth={1.5} aria-hidden />
              ) : kind === "video" ? (
                <Film className="size-5 text-muted-gold" strokeWidth={1.5} aria-hidden />
              ) : (
                <FileText className="size-5 text-muted-gold" strokeWidth={1.5} aria-hidden />
              )}
              No {kind} selected
            </span>
          )}
          {busy ? (
            <span className="absolute inset-0 flex items-center justify-center bg-card-surface/80">
              <Loader2 className="size-5 animate-spin text-primary" aria-hidden />
              <span className="sr-only">Uploading</span>
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <label
            htmlFor={id}
            className={cn(
              "inline-flex h-9 cursor-pointer items-center rounded-[var(--radius-control)] border border-primary/70 px-4 text-[13px] text-dark-walnut hover:bg-soft-cream",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary",
              busy && "pointer-events-none opacity-50",
            )}
          >
            {value ? "Replace" : "Upload"}
            <input
              ref={inputRef}
              id={id}
              type="file"
              className="sr-only"
              aria-labelledby={`${id}-label`}
              accept={kind === "image" ? "image/jpeg,image/png,image/webp" : kind === "video" ? "video/mp4" : "application/pdf"}
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
          </label>
          {value ? (
            <button
              type="button"
              onClick={() => setValue("")}
              className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-control)] px-3 text-[13px] text-secondary-text hover:text-secondary"
            >
              <Trash2 className="size-4" strokeWidth={1.5} aria-hidden /> Remove
            </button>
          ) : null}
        </div>
      </div>
      {error || serverError ? (
        <p role="alert" className="text-[13px] text-secondary">
          {error ?? serverError}
        </p>
      ) : (
        <p className="text-[12px] text-secondary-text">
          {hint ?? (kind === "image" ? "JPG, PNG or WebP, up to 15 MB." : kind === "video" ? "MP4, up to 50 MB." : "PDF document, up to 25 MB.")} Changes apply when you save.
        </p>
      )}
    </div>
  );
}
