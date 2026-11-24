import { describe, expect, it } from "vitest";
import { DEFAULT_WEDDING } from "@/services/content/defaults";

describe("Family Branding & Wedding Photo Access Integration", () => {
  it("has authoritative family branding defaults", () => {
    expect(DEFAULT_WEDDING.groom_family_name).toBe("Gudla");
    expect(DEFAULT_WEDDING.bride_family_name).toBe("Padakanti");
    expect(DEFAULT_WEDDING.family_heading).toBe("Gudla & Padakanti Families");
    expect(DEFAULT_WEDDING.family_invitation_message).toContain(
      "Together with the blessings of our families"
    );
    expect(DEFAULT_WEDDING.family_invitation_message).toContain("Manikanta & Sravika");
  });

  it("has authoritative wedding photo access defaults", () => {
    expect(DEFAULT_WEDDING.photo_access_enabled).toBe(true);
    expect(DEFAULT_WEDDING.photo_access_heading).toBe("Your Wedding Memories");
    expect(DEFAULT_WEDDING.photo_access_subheading).toBe("Relive the Beautiful Moments");
    expect(DEFAULT_WEDDING.photo_access_url).toBe(
      "https://snapdiaries.ve.ai/gallery/manikanta-sravika"
    );
    expect(DEFAULT_WEDDING.photo_access_cta_label).toBe("View Wedding Photos");
    expect(DEFAULT_WEDDING.photo_access_supporting_text).toBe(
      "Access the complete wedding photo collection through our official photo gallery."
    );
    expect(DEFAULT_WEDDING.photo_access_qr_visible).toBe(true);
  });
});
