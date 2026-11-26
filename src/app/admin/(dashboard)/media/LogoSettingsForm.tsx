"use client";

import Image from "next/image";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { ACheck, AText } from "@/components/admin/fields";
import { MediaField } from "@/components/admin/MediaField";
import { OFFICIAL_LOGO } from "@/config/logo";
import { mediaUrl } from "@/lib/storage/media";
import { updateLogoSettings } from "../content/actions";
import type { WeddingSettings } from "@/types/database";

export function LogoSettingsForm({ wedding: w }: { wedding: WeddingSettings }) {
  const effectiveLogoUrl = mediaUrl(w.logo_path) ?? OFFICIAL_LOGO.src;

  return (
    <ActionForm action={updateLogoSettings} className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-support text-dark-walnut">Current logo preview</span>
            <div className="flex min-h-[120px] items-center justify-center rounded-[var(--radius-control)] border border-soft-border bg-warm-ivory p-6">
              <Image
                src={effectiveLogoUrl}
                alt={OFFICIAL_LOGO.alt}
                width={OFFICIAL_LOGO.width}
                height={OFFICIAL_LOGO.height}
                className="max-h-[64px] w-auto object-contain"
              />
            </div>
            <p className="text-[12px] text-secondary-text">
              Transparent RGBA PNG/WebP preserved with original colours and aspect ratio.
            </p>
          </div>

          <MediaField
            name="logo_path"
            label="Replace or upload new logo"
            purpose="hero"
            defaultValue={w.logo_path ?? OFFICIAL_LOGO.src}
            ratio="16/5"
            hint="Clearing the uploaded image restores the official default logo."
          />
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 rounded-[var(--radius-control)] border border-soft-border bg-soft-cream/60 p-4">
            <p className="text-[14px] font-medium text-dark-walnut">Display locations</p>
            <ACheck
              name="logo_header_enabled"
              label="Show logo in website header (beside Manikanta & Sravika)"
              defaultChecked={w.logo_header_enabled !== false}
            />
            <ACheck
              name="logo_mobile_floating_enabled"
              label="Show floating logo at mobile bottom-right corner"
              defaultChecked={w.logo_mobile_floating_enabled !== false}
            />
            <ACheck
              name="logo_youtube_enabled"
              label="Show logo in YouTube Live section until a stream URL is configured"
              defaultChecked={w.logo_youtube_enabled !== false}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AText
              name="logo_header_size"
              label="Desktop header height (px)"
              type="number"
              min={18}
              max={48}
              defaultValue={String(w.logo_header_size ?? OFFICIAL_LOGO.defaultHeaderSize)}
              hint="18–48 px (scales automatically on mobile)"
            />
            <AText
              name="logo_mobile_size"
              label="Mobile floating width (px)"
              type="number"
              min={64}
              max={180}
              defaultValue={String(w.logo_mobile_size ?? OFFICIAL_LOGO.defaultMobileSize)}
              hint="64–180 px (height scales to aspect ratio)"
            />
            <AText
              name="logo_mobile_bottom"
              label="Mobile bottom offset (px)"
              type="number"
              min={8}
              max={120}
              defaultValue={String(w.logo_mobile_bottom ?? OFFICIAL_LOGO.defaultMobileBottom)}
              hint="8–120 px above safe-area"
            />
            <AText
              name="logo_mobile_right"
              label="Mobile right offset (px)"
              type="number"
              min={8}
              max={64}
              defaultValue={String(w.logo_mobile_right ?? OFFICIAL_LOGO.defaultMobileRight)}
              hint="8–64 px from right edge"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SubmitButton size="md">Save logo settings</SubmitButton>
      </div>
    </ActionForm>
  );
}
