import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Playfair_Display, Great_Vibes } from "next/font/google";
import { ToastProvider } from "@/components/feedback/Toast";
import { MotionProvider } from "@/components/motion/Reveal";
import { getWeddingSettings } from "@/services/content";
import { coupleNames } from "@/lib/utils/names";
import { publicEnv } from "@/lib/env";
import { weddingSchedule } from "@/lib/utils/wedding";
import { mediaUrl } from "@/lib/storage/media";
import { pickImage } from "@/lib/storage/imagery";
import "@/styles/globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-great-vibes",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const wedding = await getWeddingSettings();
  const names = coupleNames(wedding);
  const brand = wedding.website_title ?? names.joined;
  const title = `${brand} — ${wedding.website_subtitle ?? "Wedding Celebration"}`;
  const date = weddingSchedule(wedding)?.dateOnlyLabel;
  const description = `${names.joined} are getting married${date ? ` on ${date}` : ""}. ${wedding.hero_subheading ?? "Celebrate with us — events, story, gallery and live stream."}`;
  const ogImage = mediaUrl(pickImage(wedding.hero_image_path, "hero"));
  return {
    metadataBase: new URL(publicEnv.siteUrl),
    title: { default: title, template: `%s · ${brand}` },
    description,
    openGraph: { title, description, type: "website", siteName: brand, ...(ogImage ? { images: [{ url: ogImage }] } : {}) },
    twitter: { card: ogImage ? "summary_large_image" : "summary", title, description },
  };
}

export const viewport: Viewport = {
  themeColor: "#F7F0E4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning className={`${cormorant.variable} ${inter.variable} ${playfair.variable} ${greatVibes.variable}`}>
      <body suppressHydrationWarning>
        <MotionProvider>
          <ToastProvider>{children}</ToastProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
