import QRCode from "qrcode";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/auth/admin";
import { publicEnv } from "@/lib/env";
import { coupleNames } from "@/lib/utils/names";
import type { WeddingSettings } from "@/types/database";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** The single common event QR. It encodes only the public verification URL — never participant data. */
function verificationUrl(): string {
  return `${publicEnv.siteUrl}/verify`;
}

const WALNUT = rgb(0x49 / 255, 0x36 / 255, 0x28 / 255);
const SECONDARY = rgb(0x7b / 255, 0x6a / 255, 0x58 / 255);
const GOLD = rgb(0xc5 / 255, 0xa3 / 255, 0x6b / 255);
const IVORY = rgb(0xf7 / 255, 0xf0 / 255, 0xe4 / 255);

function centered(page: import("pdf-lib").PDFPage, text: string, font: import("pdf-lib").PDFFont, size: number, y: number, color = WALNUT) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (page.getWidth() - w) / 2, y, size, font, color });
}

/** Admin-only: GET ?format=png|pdf — download the common event QR (PNG) or a print-ready A4 poster (PDF). */
export async function GET(request: Request) {
  const ctx = await getAdminContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const format = new URL(request.url).searchParams.get("format") === "pdf" ? "pdf" : "png";
  const url = verificationUrl();
  const png = await QRCode.toBuffer(url, {
    type: "png",
    errorCorrectionLevel: "H",
    margin: 2,
    width: 1600,
    color: { dark: "#493628", light: "#FFFFFF" },
  });
  const headers = { "Cache-Control": "private, no-store" };

  if (format === "png") {
    return new NextResponse(new Uint8Array(png), {
      headers: { ...headers, "Content-Type": "image/png", "Content-Disposition": 'attachment; filename="wedding-verification-qr.png"' },
    });
  }

  const { data } = await ctx.supabase.from("wedding_settings").select("bride_name, groom_name").single<Pick<WeddingSettings, "bride_name" | "groom_name">>();
  const names = coupleNames(data ?? null);

  const pdf = await PDFDocument.create();
  pdf.setTitle("Wedding Guest Verification QR");
  const page = pdf.addPage([595.28, 841.89]); // A4 portrait
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const serifItalic = await pdf.embedFont(StandardFonts.TimesRomanItalic);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const { width, height } = page.getSize();

  page.drawRectangle({ x: 0, y: 0, width, height, color: IVORY });
  page.drawRectangle({ x: 28, y: 28, width: width - 56, height: height - 56, borderColor: GOLD, borderWidth: 0.75 });

  centered(page, "WEDDING GUEST VERIFICATION", sans, 10, height - 110, SECONDARY);
  centered(page, names.isPlaceholder ? "Our Wedding" : `${names.bride} & ${names.groom}`, serif, 34, height - 160);
  page.drawLine({ start: { x: width / 2 - 40, y: height - 185 }, end: { x: width / 2 + 40, y: height - 185 }, thickness: 0.75, color: GOLD });

  const qr = await pdf.embedPng(png);
  const size = 330;
  const qrY = height - 215 - size;
  page.drawRectangle({ x: (width - size) / 2 - 14, y: qrY - 14, width: size + 28, height: size + 28, color: rgb(1, 1, 1), borderColor: GOLD, borderWidth: 0.5 });
  page.drawImage(qr, { x: (width - size) / 2, y: qrY, width: size, height: size });

  centered(page, "Scan with your phone camera", serifItalic, 22, qrY - 60);
  centered(page, "Enter the mobile number you registered with to confirm", sans, 11, qrY - 88, SECONDARY);
  centered(page, "your participation in the wedding lucky draw.", sans, 11, qrY - 104, SECONDARY);
  centered(page, url.replace(/^https?:\/\//, ""), sans, 10, 70, SECONDARY);

  const bytes = await pdf.save();
  return new NextResponse(new Uint8Array(bytes), {
    headers: { ...headers, "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="wedding-verification-qr.pdf"' },
  });
}
