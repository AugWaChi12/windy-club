import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";

const ADMIN_EMAIL = "supakorn@windy-club.com";
const VALID_POSITIONS = ["home-hero", "create-top", "create-bottom"];
const ALLOWED_URL_PATTERN = /^https?:\/\//;

// POST /api/ad-requests — submit a new ad request (any logged-in user)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  // Rate limit: 3 requests per 10 minutes per user
  const rl = rateLimit(`ad-request:${user.id}`, 3, 600_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "ส่งคำขอบ่อยเกินไป กรุณารอสักครู่" },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { brandName, contactEmail, contactLine, position, linkUrl, imageUrl, duration, note } =
    body;

  if (!brandName || !contactEmail || !position || !linkUrl || !imageUrl) {
    return NextResponse.json(
      { error: "กรุณากรอกข้อมูลให้ครบ" },
      { status: 400 }
    );
  }

  if (!VALID_POSITIONS.includes(position)) {
    return NextResponse.json(
      { error: "ตำแหน่งไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  if (!ALLOWED_URL_PATTERN.test(linkUrl)) {
    return NextResponse.json(
      { error: "URL ต้องเริ่มต้นด้วย http:// หรือ https://" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("ad_requests")
    .insert({
      user_id: user.id,
      brand_name: brandName,
      contact_email: contactEmail,
      contact_line: contactLine || null,
      position,
      link_url: linkUrl,
      image_url: imageUrl,
      duration: duration || "1 week",
      note: note || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, request: data });
}

// GET /api/ad-requests — list ad requests (admin: all, user: own)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = user.email === ADMIN_EMAIL;
  const status = request.nextUrl.searchParams.get("status");

  let query = supabaseAdmin
    .from("ad_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (!isAdmin) {
    query = query.eq("user_id", user.id);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ requests: data || [] });
}

// PATCH /api/ad-requests — admin: approve/reject a request
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { requestId, action, adminNote } = await request.json();

  if (!requestId || !action) {
    return NextResponse.json(
      { error: "Missing requestId or action" },
      { status: 400 }
    );
  }

  if (action === "approve") {
    // Get the request details
    const { data: adRequest, error: fetchErr } = await supabaseAdmin
      .from("ad_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (fetchErr || !adRequest) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    // Create the actual ad
    const { error: adErr } = await supabaseAdmin.from("ads").insert({
      title: adRequest.brand_name,
      image_url: adRequest.image_url,
      link_url: adRequest.link_url,
      position: adRequest.position,
      is_active: true,
      impressions: 0,
      clicks: 0,
    });

    if (adErr) {
      return NextResponse.json({ error: adErr.message }, { status: 500 });
    }

    // Update request status
    await supabaseAdmin
      .from("ad_requests")
      .update({
        status: "approved",
        admin_note: adminNote || "อนุมัติแล้ว",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    return NextResponse.json({ success: true, status: "approved" });
  }

  if (action === "reject") {
    await supabaseAdmin
      .from("ad_requests")
      .update({
        status: "rejected",
        admin_note: adminNote || "ไม่ผ่านการอนุมัติ",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    return NextResponse.json({ success: true, status: "rejected" });
  }

  return NextResponse.json(
    { error: `Unknown action: ${action}` },
    { status: 400 }
  );
}
