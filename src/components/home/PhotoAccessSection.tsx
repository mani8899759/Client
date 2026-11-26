"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Camera, ExternalLink, QrCode, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading, Eyebrow } from "@/components/typography/Headings";
import { HashtagBadge } from "@/components/common/HashtagBadge";
import type { WeddingSettings } from "@/types/database";

const DEFAULT_GALLERY_URL = "https://snapdiaries.ve.ai/gallery/manikanta-sravika";

export function PhotoAccessSection({ wedding }: { wedding: WeddingSettings }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const isEnabled = wedding.photo_access_enabled !== false;
  const heading = wedding.photo_access_heading || "Your Wedding Memories";
  const subheading = wedding.photo_access_subheading || "Relive the Beautiful Moments";
  const description =
    wedding.photo_access_description ||
    "Be part of our celebration all over again. Explore the beautiful photographs captured during our wedding celebrations and find the memories you shared with us.";
  const galleryUrl = wedding.photo_access_url || DEFAULT_GALLERY_URL;
  const ctaLabel = wedding.photo_access_cta_label || "View Wedding Photos";
  const supportingText =
    wedding.photo_access_supporting_text ||
    "Access the complete wedding photo collection through our official photo gallery.";
  const showQr = wedding.photo_access_qr_visible !== false;

  useEffect(() => {
    if (!showQr || !galleryUrl) return;
    QRCode.toDataURL(galleryUrl, {
      width: 240,
      margin: 1.5,
      color: {
        dark: "#493628",
        light: "#FFFDF9",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Code generation error:", err));
  }, [galleryUrl, showQr]);

  if (!isEnabled) return null;

  return (
    <section
      id="wedding-photos"
      aria-labelledby="photo-access-title"
      className="relative overflow-hidden py-16 sm:py-20 lg:py-28 bg-warm-ivory border-t border-soft-border/70"
    >
      {/* Background delicate decorative accents */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 size-80 rounded-full bg-champagne-gold/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 size-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <Container width="wide">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Photograph Collage / Card from Authentic Wedding Shoot */}
          <div className="order-2 lg:order-1 lg:col-span-5">
            <Reveal preset="fade-up" delay={0.1}>
              <div className="relative mx-auto max-w-[420px] rounded-[var(--radius-surface)] border-2 border-champagne-gold/60 bg-card-surface p-3 shadow-[var(--shadow-lift)] sm:p-4">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[8px]">
                  <Image
                    src="/images/wedding-shoot/optimised/photo-07.webp"
                    alt="Manikanta & Sravika — Cherished Wedding Moments"
                    fill
                    sizes="(min-width: 1024px) 35vw, (min-width: 640px) 420px, 90vw"
                    className="object-cover object-center transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-walnut/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-soft-cream">
                    <span className="font-serif text-[15px] italic">Official Wedding Gallery</span>
                    <span className="flex items-center gap-1 text-[11px] font-sans tracking-widest uppercase text-champagne-gold">
                      <Camera className="size-3.5" /> High Resolution
                    </span>
                  </div>
                </div>

                {/* Optional QR Code Card embedded alongside photograph */}
                {showQr && qrDataUrl ? (
                  <div className="mt-4 flex items-center gap-3.5 rounded-[8px] border border-soft-border bg-soft-cream/70 p-3">
                    <div className="relative size-[72px] shrink-0 overflow-hidden rounded-[6px] border border-champagne-gold/50 bg-[#fffdf9] p-1 shadow-2xs">
                      <Image
                        src={qrDataUrl}
                        alt="Scan QR code to access wedding photos"
                        fill
                        className="object-contain p-0.5"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 font-serif text-[14px] font-semibold text-dark-walnut">
                        <QrCode className="size-3.5 text-primary" /> Scan with Phone
                      </p>
                      <p className="mt-0.5 text-[11px] leading-tight text-secondary-text">
                        Scan with your smartphone camera to view and download full photo collection.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </Reveal>
          </div>

          {/* Right Column: Headings, Description & Prominent Action CTA */}
          <div className="order-1 lg:order-2 lg:col-span-7">
            <Reveal preset="fade-up">
              <Eyebrow>{subheading}</Eyebrow>
              <h2
                id="photo-access-title"
                className="mt-3 font-serif text-[30px] xs:text-[36px] sm:text-[44px] lg:text-[48px] font-normal leading-[1.15] text-dark-walnut text-balance"
              >
                {heading}
              </h2>

              <p className="mt-5 text-body text-secondary-text max-w-[62ch] text-pretty leading-relaxed sm:text-[17px]">
                {description}
              </p>

              <div className="mt-6 flex items-center gap-3 text-secondary-text text-[13px] sm:text-[14px]">
                <Sparkles className="size-4 text-primary shrink-0" />
                <span className="italic">{supportingText}</span>
              </div>

              {/* Prominent Action Button: View Wedding Photos */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <a
                  href={galleryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[48px] sm:min-h-[52px] items-center justify-center gap-2.5 rounded-[var(--radius-control)] bg-dark-walnut px-8 py-3.5 font-sans text-[15px] font-medium text-soft-cream shadow-[var(--shadow-soft)] transition-all hover:bg-dark-walnut/90 hover:shadow-[var(--shadow-lift)] active:scale-[0.98] cursor-pointer"
                >
                  <Camera className="size-4 text-champagne-gold" />
                  <span>{ctaLabel}</span>
                  <ExternalLink className="size-3.5 text-champagne-gold opacity-80" />
                </a>

                <a
                  href="/gallery"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-control)] border border-soft-border bg-transparent px-5 py-2.5 font-sans text-[14px] text-dark-walnut transition-colors hover:bg-soft-cream"
                >
                  <span>Preview Highlights</span>
                </a>
              </div>

              <p className="mt-4 text-[12px] text-secondary-text">
                Opens our official guest gallery on SnapDiaries in a new tab.
              </p>

              {/* Official Wedding Hashtag */}
              {wedding.hashtag_homepage_visible !== false ? (
                <div className="mt-8 border-t border-soft-border/70 pt-6">
                  <p className="text-meta text-muted-gold uppercase tracking-wider">
                    {wedding.hashtag_title || "Celebrate With Us"}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <HashtagBadge hashtag={wedding.hashtag || "#Kanmani"} />
                    <p className="text-[13px] text-secondary-text italic max-w-[48ch]">
                      {wedding.hashtag_message || "Share your favourite moments from our celebrations with our wedding hashtag."}
                    </p>
                  </div>
                </div>
              ) : null}
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
