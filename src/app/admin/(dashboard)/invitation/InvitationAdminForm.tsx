"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Eye, Music, Send, Sparkles } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { AArea, ACheck, AText } from "@/components/admin/fields";
import { MediaField } from "@/components/admin/MediaField";
import { Panel } from "@/components/admin/ui";
import { updateDigitalInvitation } from "./actions";
import type { WeddingSettings } from "@/types/database";

export function InvitationAdminForm({
  wedding: w,
  siteUrl,
}: {
  wedding: WeddingSettings;
  siteUrl: string;
}) {
  const v = (x: string | null | undefined) => x ?? "";
  const [volume, setVolume] = useState<number>(Number(w.invitation_music_volume ?? 0.7));

  return (
    <ActionForm action={updateDigitalInvitation} className="flex flex-col gap-6">
      {/* Top action / preview bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-control)] border border-[#d4a843]/50 bg-[#fffcf7] p-4 shadow-xs">
        <div className="flex items-center gap-2 text-dark-walnut">
          <Sparkles className="size-5 text-primary" />
          <span className="font-serif text-[18px] font-medium">Digital Invitation Experience</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/invitation"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-primary/70 px-4 py-2 text-[13px] text-dark-walnut hover:bg-soft-cream"
          >
            <Eye className="size-4" />
            <span>Live Preview</span>
            <ExternalLink className="size-3" />
          </a>

          <SubmitButton size="md">Save changes</SubmitButton>
        </div>
      </div>

      {/* 1. Public Visibility & Sharing */}
      <Panel
        title="Public visibility & WhatsApp sharing"
        description="Control whether guests can view the digital invitation and customize the message sent when sharing via WhatsApp."
      >
        <div className="flex flex-col gap-5">
          <div className="rounded-[var(--radius-control)] border border-soft-border bg-soft-cream/60 p-4">
            <ACheck
              name="invitation_published"
              label="Publish digital invitation for guests"
              defaultChecked={w.invitation_published !== false}
            />
            <p className="mt-1 text-[12px] text-secondary-text">
              When unchecked, visitors see an elegant &quot;Invitation Coming Soon&quot; notice.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="text-support text-dark-walnut">Invitation web address</span>
              <div className="flex items-center gap-2 rounded-[var(--radius-control)] border border-soft-border bg-card-surface px-3 py-2 text-[14px] text-secondary-text">
                <span className="truncate">{siteUrl}/invitation</span>
              </div>
              <p className="text-[12px] text-secondary-text">
                This is the exact link opened when visitors click &quot;View Invitation&quot; on the website.
              </p>
            </div>

            <AArea
              name="invitation_whatsapp_message"
              label="Default WhatsApp sharing message"
              defaultValue={v(w.invitation_whatsapp_message)}
              maxLength={1000}
              rows={3}
              hint="Pre-filled text when guests tap 'Share on WhatsApp'."
            />
          </div>
        </div>
      </Panel>

      {/* 2. Cover Screen (Screen 1) */}
      <Panel
        title="Cover screen (Screen 1)"
        description="The opening experience visitors see before opening the full digital invitation."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <AText
              name="invitation_cover_heading"
              label="Auspicious top heading"
              defaultValue={v(w.invitation_cover_heading) || "A Special Invitation"}
              maxLength={120}
              hint="e.g. A Special Invitation or With the Blessings of God"
            />
            <AText
              name="invitation_cover_subheading"
              label="Cover announcement line"
              defaultValue={v(w.invitation_cover_subheading) || "We're Getting Married"}
              maxLength={160}
              hint="e.g. We're Getting Married or Royal Wedding Celebration"
            />
          </div>

          <div>
            <MediaField
              name="invitation_cover_image_path"
              label="Cover portrait or ceremony artwork"
              purpose="invitations"
              kind="image"
              defaultValue={w.invitation_cover_image_path}
              ratio="16/10"
              hint="High-resolution couple portrait or ceremonial artwork. If empty, the main hero image is used."
            />
          </div>
        </div>
      </Panel>

      {/* 3. Welcome & Couple Introductions (Screen 2) */}
      <Panel
        title="Welcome message & family introduction (Screen 2)"
        description="Personal welcome message and optional family names displayed after opening the invitation."
      >
        <div className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <AText
              name="family_heading"
              label="Family branding heading"
              defaultValue={v(w.family_heading) || "Gudla & Padakanti Families"}
              maxLength={160}
              hint='e.g. "Gudla & Padakanti Families"'
            />
            <AText
              name="invitation_intro_heading"
              label="Introductory heading"
              defaultValue={v(w.invitation_intro_heading) || "Together With Our Families"}
              maxLength={120}
            />
            <AText
              name="invitation_family_names"
              label="Formal family / parents note (optional)"
              defaultValue={v(w.invitation_family_names)}
              maxLength={400}
              optionalLabel
              className="sm:col-span-2"
              hint="e.g. Sri Gudla Venu Venkata Parameswara Reddy & Smt. Nagendra Lakshmi"
            />
          </div>

          <AArea
            name="family_invitation_message"
            label="Family invitation message"
            defaultValue={
              v(w.family_invitation_message) ||
              "Together with the blessings of our families, we cordially invite you to celebrate the wedding of Manikanta & Sravika."
            }
            maxLength={1000}
            rows={2}
          />

          <AArea
            name="invitation_intro_message"
            label="Wedding invitation letter"
            defaultValue={v(w.invitation_intro_message)}
            maxLength={2000}
            rows={4}
            hint="The primary heartfelt invitation letter to your guests."
          />
        </div>
      </Panel>

      {/* 4. Wedding Background Music Experience (Screen 8) */}
      <Panel
        title="Background music experience"
        description="Upload your own audio file to play in the background while guests view the invitation. Audio starts seamlessly when the guest taps 'Open Invitation'."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <MediaField
              name="invitation_music_path"
              label="Wedding music audio file"
              purpose="invitations"
              kind="audio"
              defaultValue={w.invitation_music_path}
              hint="MP3, M4A, AAC, WAV or OGG up to 25 MB."
            />
          </div>

          <div className="flex flex-col gap-4">
            <AText
              name="invitation_music_title"
              label="Audio track title"
              defaultValue={v(w.invitation_music_title) || "Traditional Wedding Celebration Music"}
              maxLength={160}
              hint="Displayed in the floating music controller pill."
            />

            <div className="flex flex-col gap-2 rounded-[var(--radius-control)] border border-soft-border bg-card-surface p-4">
              <div className="flex items-center justify-between">
                <span className="text-support text-dark-walnut">Default playback volume</span>
                <span className="text-[13px] font-medium text-primary">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                name="invitation_music_volume"
                min="0.05"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="h-2 w-full accent-primary"
              />
            </div>

            <div className="space-y-3 pt-2">
              <ACheck
                name="invitation_music_enabled"
                label="Enable background music player"
                defaultChecked={w.invitation_music_enabled !== false}
              />
              <div>
                <ACheck
                  name="invitation_auto_play_on_open"
                  label="Start music automatically when visitor clicks 'Open Invitation'"
                  defaultChecked={w.invitation_auto_play_on_open !== false}
                />
                <p className="mt-1 text-[12px] text-secondary-text">
                  Complies with browser autoplay policies through active user gesture.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* 5. Official Invitation File (PDF or Card) (Screen 6) */}
      <Panel
        title="Official printed invitation file (Screen 6)"
        description="Provide a ceremonial PDF or digital invitation card for guests to view, zoom and download."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <MediaField
            name="invitation_pdf_path"
            label="Invitation PDF document"
            purpose="invitations"
            kind="pdf"
            defaultValue={w.invitation_pdf_path}
            hint="PDF document guests can view directly in browser or download."
          />
          <MediaField
            name="invitation_image_path"
            label="Digital invitation card image"
            purpose="invitations"
            kind="image"
            defaultValue={w.invitation_image_path}
            ratio="3/4"
            hint="JPG, PNG, or WebP high-res ceremonial card."
          />
        </div>
      </Panel>

      {/* 6. Section Visibility Toggles */}
      <Panel
        title="Invitation section visibility"
        description="Choose which sections appear in the digital wedding invitation experience."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-[var(--radius-control)] border border-soft-border bg-card-surface p-3">
            <ACheck
              name="invitation_section_countdown"
              label="Wedding Countdown"
              defaultChecked={w.invitation_section_countdown !== false}
            />
            <p className="mt-1 text-[12px] text-secondary-text">Days, hours, minutes to Dec 1, 2026.</p>
          </div>

          <div className="rounded-[var(--radius-control)] border border-soft-border bg-card-surface p-3">
            <ACheck
              name="invitation_section_story"
              label="Our Story Chapters"
              defaultChecked={w.invitation_section_story !== false}
            />
            <p className="mt-1 text-[12px] text-secondary-text">5 storytelling milestones.</p>
          </div>

          <div className="rounded-[var(--radius-control)] border border-soft-border bg-card-surface p-3">
            <ACheck
              name="invitation_section_events"
              label="Wedding Events & Schedule"
              defaultChecked={w.invitation_section_events !== false}
            />
            <p className="mt-1 text-[12px] text-secondary-text">Ceremonies, timings &amp; dress codes.</p>
          </div>

          <div className="rounded-[var(--radius-control)] border border-soft-border bg-card-surface p-3">
            <ACheck
              name="invitation_section_document"
              label="Original Invitation Viewer"
              defaultChecked={w.invitation_section_document !== false}
            />
            <p className="mt-1 text-[12px] text-secondary-text">PDF or card image viewer.</p>
          </div>

          <div className="rounded-[var(--radius-control)] border border-soft-border bg-card-surface p-3">
            <ACheck
              name="invitation_section_gallery"
              label="Photo Gallery"
              defaultChecked={w.invitation_section_gallery !== false}
            />
            <p className="mt-1 text-[12px] text-secondary-text">Visual memories &amp; lightbox.</p>
          </div>

          <div className="rounded-[var(--radius-control)] border border-soft-border bg-card-surface p-3">
            <ACheck
              name="invitation_section_livestream"
              label="YouTube Live Stream"
              defaultChecked={w.invitation_section_livestream !== false}
            />
            <p className="mt-1 text-[12px] text-secondary-text">Broadcast ceremony and video replay.</p>
          </div>

          <div className="rounded-[var(--radius-control)] border border-soft-border bg-card-surface p-3">
            <ACheck
              name="invitation_section_venues"
              label="Venues & Google Maps"
              defaultChecked={w.invitation_section_venues !== false}
            />
            <p className="mt-1 text-[12px] text-secondary-text">Directions &amp; location details.</p>
          </div>

          <div className="rounded-[var(--radius-control)] border border-soft-border bg-card-surface p-3 sm:col-span-2 lg:col-span-3">
            <ACheck
              name="invitation_section_gift_draw"
              label="Win a Special Gift (Lucky Draw CTA)"
              defaultChecked={w.invitation_section_gift_draw !== false}
            />
            <p className="mt-1 text-[12px] text-secondary-text">Links guests directly to the registration page.</p>
          </div>

          <div className="rounded-[var(--radius-control)] border border-soft-border bg-card-surface p-3 sm:col-span-2 lg:col-span-3">
            <ACheck
              name="invitation_gopuram_enabled"
              label="South Indian Gopuram Temple Finale"
              defaultChecked={w.invitation_gopuram_enabled !== false}
            />
            <p className="mt-1 text-[12px] text-secondary-text">Scroll-triggered South Indian Gopuram artwork ending.</p>
          </div>
        </div>
      </Panel>

      {/* 7. Closing & Gratitude (Screen 10) */}
      <Panel
        title="Closing message & gratitude (Screen 10)"
        description="Warm closing remarks presented before the RSVP and sharing buttons."
      >
        <div className="flex flex-col gap-4">
          <AText
            name="invitation_closing_heading"
            label="Closing heading"
            defaultValue={v(w.invitation_closing_heading) || "Your Presence Would Mean the World to Us"}
            maxLength={160}
          />
          <AArea
            name="invitation_closing_message"
            label="Closing gratitude message"
            defaultValue={v(w.invitation_closing_message)}
            maxLength={2000}
            rows={3}
          />
        </div>
      </Panel>

      {/* 8. South Indian Gopuram Finale (Screen 12) */}
      <Panel
        title="South Indian Gopuram Temple Finale (Final Section)"
        description="The ceremonial ending artwork that smoothly reveals as guests reach the bottom of the digital invitation."
      >
        <div className="flex flex-col gap-5">
          <div className="rounded-[var(--radius-control)] border border-soft-border bg-soft-cream/60 p-4">
            <ACheck
              name="invitation_gopuram_enabled"
              label="Enable South Indian Gopuram finale section"
              defaultChecked={w.invitation_gopuram_enabled !== false}
            />
            <p className="mt-1 text-[12px] text-secondary-text">
              Displays the authentic South Indian Gopuram temple illustration with scroll-triggered upward reveal.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <MediaField
                name="invitation_gopuram_image_path"
                label="Custom Gopuram artwork file"
                purpose="invitations"
                kind="image"
                defaultValue={w.invitation_gopuram_image_path}
                ratio="1240/721"
                hint="Upload a replacement transparent PNG or high-res artwork if desired. Default is gopuram-illustration.png."
              />
            </div>

            <div className="flex flex-col justify-center rounded-[var(--radius-control)] border border-[#d4a843]/40 bg-[#fdf5e6] p-5 text-center">
              <span className="font-serif text-[16px] font-semibold text-[#3d1c00]">
                Current Final Section Artwork Preview
              </span>
              <p className="mt-1 text-[12px] text-[#5c4033]">
                Defringed transparent PNG blending seamlessly into #FDF5E6 cream background.
              </p>
              <div className="relative mx-auto mt-4 aspect-[1240/721] w-full max-w-[360px] overflow-hidden rounded-[8px] border border-[#d4a843]/60 bg-[#fdf5e6]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/gopuram-illustration.png"
                  alt="Gopuram preview"
                  className="h-full w-full object-contain object-bottom"
                />
              </div>
              <div className="mt-3">
                <a
                  href="/invitation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#8b1a1a] hover:underline"
                >
                  <span>Preview Scroll-Triggered Reveal in Invitation</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Sticky Save Bar */}
      <div className="sticky bottom-4 z-10 flex justify-end">
        <SubmitButton size="lg" className="shadow-[var(--shadow-lift)]">
          Save digital invitation settings
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
