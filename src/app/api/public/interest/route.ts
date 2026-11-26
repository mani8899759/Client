import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

const BUCKET_KEY = "wedding_interested_counter";
const BASE_TIMESTAMP = "2026-11-20T00:00:00Z";
const DEFAULT_INITIAL_COUNT = 0;

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    if (!supabase) {
      return NextResponse.json({ count: DEFAULT_INITIAL_COUNT });
    }

    const { data, error } = await supabase
      .from("rate_limit_buckets")
      .select("hits")
      .eq("bucket_key", BUCKET_KEY)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ count: DEFAULT_INITIAL_COUNT });
    }

    return NextResponse.json({ count: data.hits ?? DEFAULT_INITIAL_COUNT });
  } catch {
    return NextResponse.json({ count: DEFAULT_INITIAL_COUNT });
  }
}

export async function POST() {
  try {
    const supabase = getServiceSupabase();
    if (!supabase) {
      return NextResponse.json({ success: true, count: DEFAULT_INITIAL_COUNT + 1 });
    }

    // 1. Fetch current counter
    const { data: current } = await supabase
      .from("rate_limit_buckets")
      .select("hits")
      .eq("bucket_key", BUCKET_KEY)
      .maybeSingle();

    const currentHits = current?.hits ?? DEFAULT_INITIAL_COUNT;
    const newHits = currentHits + 1;

    // 2. Upsert updated counter
    const { error } = await supabase
      .from("rate_limit_buckets")
      .upsert({
        bucket_key: BUCKET_KEY,
        window_start: BASE_TIMESTAMP,
        hits: newHits,
      });

    if (error) {
      return NextResponse.json({ success: true, count: newHits });
    }

    return NextResponse.json({ success: true, count: newHits });
  } catch {
    return NextResponse.json({ success: true, count: DEFAULT_INITIAL_COUNT + 1 });
  }
}
