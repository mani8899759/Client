import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SmoothScrollProvider } from "@/components/animations/SmoothScrollProvider";
import { InvitationBottomInterestBar } from "@/components/invitation/InvitationBottomInterestBar";
import { getWeddingSettings } from "@/services/content";
import { coupleNames } from "@/lib/utils/names";
import { mediaUrl } from "@/lib/storage/media";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const wedding = await getWeddingSettings();
  const invitationPath = wedding.invitation_pdf_path || wedding.invitation_image_path || null;
  const invitationUrl = wedding.invitation_published !== false ? mediaUrl(invitationPath) : null;
  const invitationType = wedding.invitation_pdf_path ? "pdf" : wedding.invitation_image_path ? "image" : null;

  return (
    <SmoothScrollProvider>
      <SiteHeader
        brand={wedding.website_title ?? coupleNames(wedding).joined}
        coupleLabel={coupleNames(wedding).joined}
        familyHeading={wedding.family_heading ?? "Gudla & Padakanti Families"}
        ctaLabel={wedding.cta_primary_label ?? "Win a Special Gift"}
        invitationUrl={invitationUrl}
        invitationType={invitationType}
      />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter wedding={wedding} />
      <InvitationBottomInterestBar />
    </SmoothScrollProvider>
  );
}
