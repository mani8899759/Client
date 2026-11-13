import { NextResponse } from "next/server";
import { getGalleryPage } from "@/services/content";
import { GALLERY_PAGE_SIZE } from "@/config/site";

/** Progressive loading for the public gallery (published media only, enforced by RLS). */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const offset = Math.max(0, Math.min(10_000, Number.parseInt(url.searchParams.get("offset") ?? "0", 10) || 0));
  const categoryParam = url.searchParams.get("category");
  const typeParam = url.searchParams.get("type");
  const category = categoryParam && /^[0-9a-f-]{36}$/i.test(categoryParam) ? categoryParam : null;
  const type = typeParam === "photo" || typeParam === "video" ? typeParam : null;

  const page = await getGalleryPage({ category, type }, offset, GALLERY_PAGE_SIZE);
  return NextResponse.json(page, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
