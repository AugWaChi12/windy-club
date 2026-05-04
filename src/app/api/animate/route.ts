import Replicate from "replicate";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const ANIMATE_DAILY_LIMIT = 10;
const ADMIN_EMAIL = "supakorn@windy-club.com";

// POST: Start animation → returns predictionId immediately (no waiting)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "กรุณาเข้าสู่ระบบก่อน" },
      { status: 401 }
    );
  }

  const rl = rateLimit(`anim:${user.id}`, 3, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "คำขอถี่เกินไป รอสักครู่แล้วลองใหม่" },
      { status: 429 }
    );
  }

  const { imageUrl } = await request.json();

  if (!imageUrl || typeof imageUrl !== "string") {
    return NextResponse.json(
      { error: "imageUrl is required" },
      { status: 400 }
    );
  }

  // Validate URL domain
  const allowedHosts = [
    "replicate.delivery",
    "pbxt.replicate.delivery",
    "cujhbssftphcdqubalru.supabase.co",
  ];
  try {
    const parsedUrl = new URL(imageUrl);
    if (!allowedHosts.some((h) => parsedUrl.hostname.endsWith(h))) {
      return NextResponse.json({ error: "URL ไม่ถูกต้อง" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "URL ไม่ถูกต้อง" }, { status: 400 });
  }

  // Pro check
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro")
    .eq("id", user.id)
    .single();

  const isPro = profile?.is_pro === true || user.email === ADMIN_EMAIL;
  if (!isPro) {
    return NextResponse.json(
      { error: "ฟีเจอร์ Animated Sticker สำหรับ Pro เท่านั้น", upgrade: true },
      { status: 403 }
    );
  }

  // Daily limit
  const today = new Date().toISOString().split("T")[0];
  const { data: todayAnims } = await supabase
    .from("generations")
    .select("count")
    .eq("user_id", user.id)
    .eq("style", "animated")
    .gte("created_at", `${today}T00:00:00`);

  const animUsage = todayAnims?.reduce((sum, g) => sum + (g.count || 0), 0) ?? 0;
  if (animUsage >= ANIMATE_DAILY_LIMIT) {
    return NextResponse.json(
      { error: `ครบโควต้า Animate ${ANIMATE_DAILY_LIMIT} ครั้ง/วัน` },
      { status: 429 }
    );
  }

  try {
    // Start prediction — return immediately, do NOT wait
    const prediction = await replicate.predictions.create({
      model: "stability-ai/stable-video-diffusion",
      input: {
        input_image: imageUrl,
        motion_bucket_id: 80,
        fps: 10,
        cond_aug: 0.02,
        decoding_t: 14,
        sizing_strategy: "maintain_aspect_ratio",
      },
    });

    // Reserve quota
    await supabase.from("generations").insert({
      user_id: user.id,
      prompt: "animated",
      style: "animated",
      count: 1,
      is_pro: true,
    });

    return NextResponse.json({
      predictionId: prediction.id,
      status: "starting",
    });
  } catch (error) {
    console.error("Animate start error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "สร้าง animation ไม่สำเร็จ ลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}

// GET: Poll prediction status
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const predictionId = new URL(request.url).searchParams.get("id");
  if (!predictionId) {
    return NextResponse.json({ error: "Missing prediction ID" }, { status: 400 });
  }

  try {
    const prediction = await replicate.predictions.get(predictionId);

    if (prediction.status === "failed" || prediction.status === "canceled") {
      console.error("Prediction failed:", prediction.error);
      return NextResponse.json({
        status: "failed",
        error: "สร้าง animation ไม่สำเร็จ ลองใหม่",
      });
    }

    if (prediction.status !== "succeeded") {
      return NextResponse.json({ status: prediction.status });
    }

    // Extract video URL
    const videoUrl =
      typeof prediction.output === "string"
        ? prediction.output
        : Array.isArray(prediction.output)
          ? prediction.output[0]
          : null;

    if (!videoUrl || typeof videoUrl !== "string") {
      return NextResponse.json({ status: "failed", error: "ไม่ได้ผลลัพธ์วิดีโอ" });
    }

    // Upload to Supabase Storage
    try {
      const videoResponse = await fetch(videoUrl);
      const videoBuffer = await videoResponse.arrayBuffer();
      const fileName = `${user.id}/${Date.now()}-${crypto.randomUUID()}.mp4`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("stickers")
        .upload(fileName, videoBuffer, {
          contentType: "video/mp4",
          upsert: false,
        });

      if (!uploadError) {
        const { data: urlData } = supabaseAdmin.storage
          .from("stickers")
          .getPublicUrl(fileName);
        return NextResponse.json({ status: "succeeded", videoUrl: urlData.publicUrl });
      }
    } catch (uploadErr) {
      console.error("Upload failed:", uploadErr);
    }

    return NextResponse.json({ status: "succeeded", videoUrl });
  } catch (error) {
    console.error("Poll error:", error);
    return NextResponse.json({ error: "ตรวจสอบสถานะไม่ได้" }, { status: 500 });
  }
}
