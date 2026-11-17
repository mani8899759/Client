"use client";

import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { AArea, ACheck, ASelect, AText } from "@/components/admin/fields";
import { MediaField } from "@/components/admin/MediaField";
import { Panel } from "@/components/admin/ui";
import { updateWebsiteContent } from "./actions";
import type { WeddingSettings } from "@/types/database";

const TIMEZONES = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Australia/Sydney",
].map((t) => ({ value: t, label: t.replace("_", " ") }));

export function ContentForm({
  wedding: w,
  weddingDay,
  ceremonyTime,
  weddingEndLocal,
}: {
  wedding: WeddingSettings;
  weddingDay: string;
  ceremonyTime: string;
  weddingEndLocal: string;
}) {
  const socials = [...w.social_links, ...Array.from({ length: 6 }, () => ({ label: "", url: "" }))].slice(0, 6);
  const v = (x: string | null) => x ?? "";

  return (
    <ActionForm action={updateWebsiteContent} className="flex flex-col gap-6">
      <Panel title="The couple & website identity" description="Used in the header, hero, footer, page titles and search/social previews.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AText name="bride_name" label="Bride's name" defaultValue={v(w.bride_name)} maxLength={80} required />
          <AText name="groom_name" label="Groom's name" defaultValue={v(w.groom_name)} maxLength={80} required />
          <AText name="monogram" label="Monogram" defaultValue={v(w.monogram)} maxLength={12} optionalLabel hint="e.g. P & A" />
          <AText name="website_title" label="Website title" defaultValue={v(w.website_title)} maxLength={120} hint="e.g. Manikanta & Sravika" />
          <AText name="website_subtitle" label="Website subtitle" defaultValue={v(w.website_subtitle)} maxLength={120} hint="e.g. Wedding Celebration" />
        </div>
      </Panel>

      <Panel
        title="Wedding date & countdown"
        description="Leave the ceremony time empty for a date-only countdown to the start of the wedding day. Add it later to count down to the exact time."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <AText name="wedding_day" label="Wedding date" type="date" defaultValue={weddingDay} required />
          <AText name="ceremony_time" label="Ceremony time" type="time" defaultValue={ceremonyTime} optionalLabel />
          <ASelect name="timezone" label="Timezone" defaultValue={w.timezone} options={TIMEZONES} />
          <AText name="wedding_end_at" label="Celebration ends" type="datetime-local" defaultValue={weddingEndLocal} optionalLabel hint="Defaults to the end of the day." />
        </div>
      </Panel>

      <Panel
        title="Official wedding invitation"
        description="Upload a PDF or image invitation for guests to open via the 'View Invitation' button. PDFs open directly in the browser; images open in an elegant preview."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <MediaField
            name="invitation_pdf_path"
            label="Invitation PDF Document"
            purpose="invitations"
            kind="pdf"
            defaultValue={w.invitation_pdf_path}
            hint="Official wedding PDF invitation. Opens directly in browser without forced download."
          />
          <MediaField
            name="invitation_image_path"
            label="Invitation Card Image (Alternative/Secondary)"
            purpose="invitations"
            kind="image"
            defaultValue={w.invitation_image_path}
            ratio="3/4"
            hint="Digital invitation card image (JPG, PNG or WebP)."
          />
        </div>
        <div className="mt-6 border-t border-soft-border/60 pt-4">
          <ACheck
            name="invitation_published"
            label="Publish invitation to website visitors"
            defaultChecked={w.invitation_published !== false}
          />
          <p className="mt-1 text-[12px] text-secondary-text">
            When published, the header and hero &quot;View Invitation&quot; buttons open the document. If unselected or empty, visitors see a graceful &quot;Invitation Coming Soon&quot; notice.
          </p>
        </div>
      </Panel>

      <Panel title="Button labels">
        <div className="grid gap-5 sm:grid-cols-2">
          <AText name="cta_primary_label" label="Registration button" defaultValue={v(w.cta_primary_label)} maxLength={40} hint="e.g. Register Now" />
          <AText name="cta_secondary_label" label="Story button" defaultValue={v(w.cta_secondary_label)} maxLength={40} hint="e.g. View Our Story" />
        </div>
      </Panel>

      <Panel title="Love story text" description="Chapters are managed under Our Love Story.">
        <div className="grid gap-5 lg:grid-cols-2">
          <AArea name="story_intro" label="Story introduction" defaultValue={v(w.story_intro)} maxLength={2000} rows={5} />
          <AArea name="story_closing" label="Closing message" defaultValue={v(w.story_closing)} maxLength={2000} rows={5} />
        </div>
      </Panel>

      <Panel title="Footer & contact">
        <div className="grid gap-5 sm:grid-cols-3">
          <AText name="contact_name" label="Contact name" defaultValue={v(w.contact_name)} maxLength={120} optionalLabel />
          <AText name="contact_phone" label="Contact phone" type="tel" defaultValue={v(w.contact_phone)} maxLength={40} optionalLabel />
          <AText name="contact_email" label="Contact email" type="email" defaultValue={v(w.contact_email)} maxLength={254} optionalLabel />
          <AArea name="footer_note" label="Footer note" defaultValue={v(w.footer_note)} maxLength={400} rows={2} optionalLabel className="sm:col-span-3" />
        </div>
        <div className="mt-8">
          <p className="text-support text-dark-walnut">Social links</p>
          <div className="mt-3 grid gap-3">
            {socials.map((s, i) => (
              <div key={i} className="grid gap-3 sm:grid-cols-[200px_1fr]">
                <AText name={`social_label_${i}`} label={`Label ${i + 1}`} defaultValue={s.label} maxLength={40} placeholder="Instagram" />
                <AText name={`social_url_${i}`} label={`Link ${i + 1}`} type="url" defaultValue={s.url} maxLength={300} placeholder="https://" />
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <SubmitButton size="lg" className="shadow-[var(--shadow-lift)]">
          Save website content
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
