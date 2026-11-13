"use client";

import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { AArea, AText } from "@/components/admin/fields";
import { MediaField } from "@/components/admin/MediaField";
import { Panel } from "@/components/admin/ui";
import { updateHomepage } from "../content/actions";
import type { WeddingSettings } from "@/types/database";

type Fallbacks = Record<"hero_image_path" | "welcome_image_path" | "bride_image_path" | "groom_image_path" | "secondary_image_path", string | null>;

function hint(fallback: string | null) {
  return fallback ? "Empty = AI illustration is shown. Upload a real photograph to replace it." : undefined;
}

export function HomepageForm({ wedding: w, fallbacks }: { wedding: WeddingSettings; fallbacks: Fallbacks }) {
  const v = (x: string | null) => x ?? "";
  return (
    <ActionForm action={updateHomepage} className="flex flex-col gap-6">
      <Panel title="Hero">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <AText name="announcement" label="Line above the names" defaultValue={v(w.announcement)} maxLength={160} optionalLabel hint='e.g. "Together with their families"' />
            <AText name="hero_heading" label="Line below the names" defaultValue={v(w.hero_heading)} maxLength={160} hint='e.g. "Are getting married"' />
            <AArea name="hero_subheading" label="Short invitation message" defaultValue={v(w.hero_subheading)} maxLength={400} rows={3} />
            <AText name="hero_image_alt" label="Hero image description (alt text)" defaultValue={v(w.hero_image_alt)} maxLength={200} />
          </div>
          <div className="flex flex-col gap-6">
            <MediaField name="hero_image_path" label="Hero photograph" purpose="hero" defaultValue={w.hero_image_path} ratio="16/9" hint={hint(fallbacks.hero_image_path)} />
            <MediaField name="hero_video_path" label="Hero video (optional, muted loop)" purpose="hero" kind="video" defaultValue={w.hero_video_path} ratio="16/9" />
          </div>
        </div>
      </Panel>

      <Panel title="Welcome">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <AText name="welcome_title" label="Welcome heading" defaultValue={v(w.welcome_title)} maxLength={160} />
            <AArea name="welcome_message" label="Welcome message" defaultValue={v(w.welcome_message)} maxLength={2000} rows={6} hint="Separate paragraphs with a blank line." />
            <AArea name="invitation_message" label="Highlighted quote" defaultValue={v(w.invitation_message)} maxLength={1000} rows={3} optionalLabel />
            <AText name="welcome_image_alt" label="Welcome image description" defaultValue={v(w.welcome_image_alt)} maxLength={200} />
          </div>
          <MediaField name="welcome_image_path" label="Couple portrait" purpose="hero" defaultValue={w.welcome_image_path} ratio="4/5" hint={hint(fallbacks.welcome_image_path)} />
        </div>
      </Panel>

      <Panel title="Couple introduction" description="Short, true introductions written by the couple. Leave empty to show names and photographs only.">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <MediaField name="bride_image_path" label="Bride photograph" purpose="hero" defaultValue={w.bride_image_path} ratio="4/5" hint={hint(fallbacks.bride_image_path)} />
            <AText name="bride_image_alt" label="Photo description" defaultValue={v(w.bride_image_alt)} maxLength={200} />
            <AArea name="bride_intro" label="About the bride" defaultValue={v(w.bride_intro)} maxLength={1000} rows={4} optionalLabel />
          </div>
          <div className="flex flex-col gap-5">
            <MediaField name="groom_image_path" label="Groom photograph" purpose="hero" defaultValue={w.groom_image_path} ratio="4/5" hint={hint(fallbacks.groom_image_path)} />
            <AText name="groom_image_alt" label="Photo description" defaultValue={v(w.groom_image_alt)} maxLength={200} />
            <AArea name="groom_intro" label="About the groom" defaultValue={v(w.groom_intro)} maxLength={1000} rows={4} optionalLabel />
          </div>
        </div>
      </Panel>

      <Panel title="Venue preview image" description="Shown beside the venue preview on the homepage.">
        <div className="grid gap-5 lg:grid-cols-2">
          <MediaField name="secondary_image_path" label="Venue / wedding environment photograph" purpose="hero" defaultValue={w.secondary_image_path} ratio="3/2" hint={hint(fallbacks.secondary_image_path)} />
          <AText name="secondary_image_alt" label="Image description" defaultValue={v(w.secondary_image_alt)} maxLength={200} />
        </div>
      </Panel>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <SubmitButton size="lg" className="shadow-[var(--shadow-lift)]">
          Save homepage
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
