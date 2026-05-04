import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET /api/ads?position=xxx — fetch active ads for a position
export async function GET(request: NextRequest) {
  const position = request.nextUrl.searchParams.get("position") || "home-hero";

  const { data: ads, error } = await supabaseAdmin
    .from("ads")
    .select("id, title, image_url, link_url")
    .eq("position", position)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ads: [] });
  }

  // Increment impressions atomically (fire and forget)
  if (ads && ads.length > 0) {
    for (const ad of ads) {
      supabaseAdmin.rpc("increment_ad_impressions", { ad_id: ad.id }).then(({ error: rpcErr }) => {
        if (rpcErr) {
          // Fallback: direct update if RPC doesn't exist yet
          supabaseAdmin
            .from("ads")
            .update({ impressions: ((ad as Record<string, number>).impressions || 0) + 1 })
            .eq("id", ad.id)
            .then(() => {});
        }
      });
    }
  }

  return NextResponse.json(
    { ads: ads || [] },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    }
  );
}

// POST /api/ads — create new ad (admin only)
export async function POST(request: NextRequest) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if admin (hardcoded admin email for now)
  const ADMIN_EMAILS = ["supakorn@windy-club.com"];
  if (!ADMIN_EMAILS.includes(user.email || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, image_url, link_url, position } = await request.json();

  if (!title || !image_url || !link_url || !position) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Validate URLs to prevent XSS via malicious protocols
  const ALLOWED_URL_PATTERN = /^https?:\/\//;
  if (!ALLOWED_URL_PATTERN.test(image_url) || !ALLOWED_URL_PATTERN.test(link_url)) {
    return NextResponse.json({ error: "URLs must start with http:// or https://" }, { status: 400 });
  }

  const VALID_POSITIONS = ["home-hero", "create-top", "create-bottom"];
  if (!VALID_POSITIONS.includes(position)) {
    return NextResponse.json({ error: "Invalid position" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("ads")
    .insert({
      title,
      image_url,
      link_url,
      position,
      is_active: true,
      impressions: 0,
      clicks: 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ad: data });
}

// DELETE /api/ads — delete ad (admin only)
export async function DELETE(request: NextRequest) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ADMIN_EMAILS = ["supakorn@windy-club.com"];
  if (!ADMIN_EMAILS.includes(user.email || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Missing ad id" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("ads").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// PATCH /api/ads — toggle active status (admin only)
export async function PATCH(request: NextRequest) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ADMIN_EMAILS = ["supakorn@windy-club.com"];
  if (!ADMIN_EMAILS.includes(user.email || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, is_active } = await request.json();
  if (!id || typeof is_active !== "boolean") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("ads")
    .update({ is_active })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
