import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getWeddingSettings } from "@/services/content";
import { coupleNames } from "@/lib/utils/names";
import { mediaUrl } from "@/lib/storage/media";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const wedding = await getWeddingSettings();
  const invitationPath = wedding.invitation_pdf_path || wedding.invitation_image_path || null;
  const invitationUrl = wedding.invitation_published !== false ? mediaUrl(invitationPath) : null;
  const invitationType = wedding.invitation_pdf_path ? "pdf" : wedding.invitation_image_path ? "image" : null;

  return (
    <>
      <SiteHeader
        brand={wedding.website_title ?? coupleNames(wedding).joined}
        coupleLabel={coupleNames(wedding).joined}
        ctaLabel={wedding.cta_primary_label ?? "Win a Special Gift"}
        invitationUrl={invitationUrl}
        invitationType={invitationType}
      />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter wedding={wedding} />
    </>
  );
}
