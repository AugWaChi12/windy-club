import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";

// POST /api/ads/click — track ad click
export async function POST(request: NextRequest) {
  const { adId } = await request.json();

  if (!adId || typeof adId !== "string") {
    return NextResponse.json({ error: "Missing adId" }, { status: 400 });
  }

  // Dedup: rate limit per IP + adId (max 1 click per ad per 60s per IP)
  const forwarded = request.headers.get("x-forwarded-for");
  const clientIp = forwarded?.split(",")[0]?.trim() || "unknown";
  const dedupKey = `adclick:${clientIp}:${adId}`;
  const rl = rateLimit(dedupKey, 1, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ success: true }); // silently ignore duplicates
  }

  // Atomic increment via RPC, fallback to direct update
  const { error: rpcError } = await supabaseAdmin.rpc("increment_ad_clicks", { ad_id: adId });
  if (rpcError) {
    const { data: ad } = await supabaseAdmin
      .from("ads")
      .select("clicks")
      .eq("id", adId)
      .single();

    if (ad) {
      await supabaseAdmin
        .from("ads")
        .update({ clicks: (ad.clicks || 0) + 1 })
        .eq("id", adId);
    }
  }

  return NextResponse.json({ success: true });
}
