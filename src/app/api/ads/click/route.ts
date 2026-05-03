import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// POST /api/ads/click — track ad click
export async function POST(request: NextRequest) {
  const { adId } = await request.json();

  if (!adId || typeof adId !== "string") {
    return NextResponse.json({ error: "Missing adId" }, { status: 400 });
  }

  // Increment clicks (simple approach)
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

  return NextResponse.json({ success: true });
}
