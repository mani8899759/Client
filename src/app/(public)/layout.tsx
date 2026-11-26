import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SmoothScrollProvider } from "@/components/animations/SmoothScrollProvider";
import { InvitationBottomInterestBar } from "@/components/invitation/InvitationBottomInterestBar";
import { MobileFloatingLogo } from "@/components/layout/MobileFloatingLogo";
import { OFFICIAL_LOGO } from "@/config/logo";
import { getWeddingSettings } from "@/services/content";
import { coupleNames } from "@/lib/utils/names";
import { mediaUrl } from "@/lib/storage/media";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const wedding = await getWeddingSettings();
  const invitationPath = wedding.invitation_pdf_path || wedding.invitation_image_path || null;
  const invitationUrl = wedding.invitation_published !== false ? mediaUrl(invitationPath) : null;
  const invitationType = wedding.invitation_pdf_path ? "pdf" : wedding.invitation_image_path ? "image" : null;
  const logoUrl = mediaUrl(wedding.logo_path) ?? OFFICIAL_LOGO.src;

  return (
    <SmoothScrollProvider>
      <SiteHeader
        brand={wedding.website_title ?? coupleNames(wedding).joined}
        coupleLabel={coupleNames(wedding).joined}
        familyHeading={wedding.family_heading ?? "Gudla & Padakanti Families"}
        ctaLabel={wedding.cta_primary_label ?? "Win a Special Gift"}
        invitationUrl={invitationUrl}
        invitationType={invitationType}
        logoUrl={logoUrl}
        logoEnabled={wedding.logo_header_enabled !== false}
        logoHeight={wedding.logo_header_size ?? OFFICIAL_LOGO.defaultHeaderSize}
      />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter wedding={wedding} />
      <MobileFloatingLogo
        logoUrl={logoUrl}
        enabled={wedding.logo_mobile_floating_enabled !== false}
        width={wedding.logo_mobile_size ?? OFFICIAL_LOGO.defaultMobileSize}
        bottom={wedding.logo_mobile_bottom ?? OFFICIAL_LOGO.defaultMobileBottom}
        right={wedding.logo_mobile_right ?? OFFICIAL_LOGO.defaultMobileRight}
      />
      <InvitationBottomInterestBar />
    </SmoothScrollProvider>
  );
}
