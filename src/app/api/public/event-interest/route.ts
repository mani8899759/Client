import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getServiceSupabase } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

const VISITOR_COOKIE = "wedding_visitor_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
const bodySchema = z.object({
  eventId: z.string().uuid("Invalid event ID."),
});

function isValidVisitorId(value: string | undefined): value is string {
  return !!value && /^[a-zA-Z0-9_-]{8,128}$/.test(value);
}

/**
 * Returns the list of event IDs this visitor has already marked as Interested,
 * based strictly on their httpOnly visitor cookie. Never exposes counts or other visitors' data.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const visitorId = cookieStore.get(VISITOR_COOKIE)?.value;
    if (!isValidVisitorId(visitorId)) {
      return NextResponse.json({ interestedEventIds: [] });
    }

    const supabase = getServiceSupabase();
    if (!supabase) {
      return NextResponse.json({ interestedEventIds: [] });
    }

    const { data, error } = await supabase
      .from("event_interests")
      .select("event_id")
      .eq("visitor_id", visitorId);

    if (error || !data) {
      return NextResponse.json({ interestedEventIds: [] });
    }

    return NextResponse.json({
      interestedEventIds: data.map((row) => row.event_id as string),
    });
  } catch {
    return NextResponse.json({ interestedEventIds: [] });
  }
}

/**
 * Records a genuine visitor's interest for a specific published event.
 * Deduplicated at the database level via UNIQUE (event_id, visitor_id).
 */
export async function POST(request: Request) {
  try {
    const raw = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid event request." }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
    }

    const { eventId } = parsed.data;

    // Verify the event exists and is published
    const { data: eventRow, error: eventErr } = await supabase
      .from("events")
      .select("id")
      .eq("id", eventId)
      .eq("is_published", true)
      .maybeSingle();

    if (eventErr || !eventRow) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const cookieStore = await cookies();
    const existingVisitorId = cookieStore.get(VISITOR_COOKIE)?.value;
    const visitorId = isValidVisitorId(existingVisitorId) ? existingVisitorId : crypto.randomUUID();

    // Upsert with ignoreDuplicates enforces uniqueness without inflating counts on repeat clicks
    const { error: insertErr } = await supabase
      .from("event_interests")
      .upsert(
        { event_id: eventId, visitor_id: visitorId },
        { onConflict: "event_id,visitor_id", ignoreDuplicates: true },
      );

    if (insertErr) {
      return NextResponse.json({ error: "Unable to record interest." }, { status: 500 });
    }

    const res = NextResponse.json({ ok: true, interested: true, eventId });
    if (!isValidVisitorId(existingVisitorId)) {
      res.cookies.set(VISITOR_COOKIE, visitorId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });
    }
    return res;
  } catch {
    return NextResponse.json({ error: "Unable to process request." }, { status: 500 });
  }
}
