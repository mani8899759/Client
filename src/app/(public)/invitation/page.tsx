import type { Metadata } from "next";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import {
  getEvents,
  getFeaturedGallery,
  getLocations,
  getStoryEntries,
  getWeddingSettings,
} from "@/services/content";
import { coupleNames } from "@/lib/utils/names";
import { publicEnv } from "@/lib/env";
import { InvitationPageClient } from "@/components/invitation/InvitationPageClient";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const wedding = await getWeddingSettings();
  const names = coupleNames(wedding);
  const title = `${names.bride} & ${names.groom} — Official Wedding Invitation`;
  const description = `You are warmly invited to celebrate the wedding of ${names.bride} and ${names.groom} on December 1, 2026. Explore our celebrations, venues, story and RSVP.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${publicEnv.siteUrl}/invitation`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function InvitationPage() {
  const [wedding, story, events, venues, gallery] = await Promise.all([
    getWeddingSettings(),
    getStoryEntries(),
    getEvents(),
    getLocations(),
    getFeaturedGallery(12),
  ]);

  // Graceful state if invitation is marked unpublished by admin
  if (wedding.invitation_published === false) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center p-6 text-center bg-[#fdf5e6]">
        <div className="max-w-[480px] rounded-[16px] border-2 border-[#d4a843]/60 bg-[#fffcf7] p-8 shadow-md">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#f5ebd5] text-[#8b1a1a]">
            <Mail className="size-7" />
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-[28px] font-bold text-[#3d1c00]">
            Invitation Coming Soon
          </h1>
          <p className="mt-3 font-[family-name:var(--font-serif)] text-[17px] text-[#5c4033]">
            The official digital wedding invitation for Priya &amp; Arjun is being prepared and will be available shortly.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#8b1a1a] px-6 py-2.5 text-[14px] font-medium text-[#fdf5e6] shadow-xs hover:bg-[#721515]"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Wedding Website</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <InvitationPageClient
      wedding={wedding}
      story={story}
      events={events}
      venues={venues}
      gallery={gallery}
      siteUrl={publicEnv.siteUrl}
    />
  );
}
