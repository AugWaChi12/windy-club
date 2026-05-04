import Replicate from "replicate";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const MOTION_AMOUNT = 60; // subtle sticker-like bounce (1-255, lower = less motion)
const FRAMES_PER_SECOND = 8;
const ANIMATE_DAILY_LIMIT = 5;

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

  const { imageUrl } = await request.json();

  if (!imageUrl || typeof imageUrl !== "string") {
    return NextResponse.json(
      { error: "imageUrl is required" },
      { status: 400 }
    );
  }

  // Validate URL is from our allowed domains
  const allowedHosts = [
    "replicate.delivery",
    "pbxt.replicate.delivery",
    "cujhbssftphcdqubalru.supabase.co",
  ];
  try {
    const parsedUrl = new URL(imageUrl);
    const isAllowed = allowedHosts.some((host) =>
      parsedUrl.hostname.endsWith(host)
    );
    if (!isAllowed) {
      return NextResponse.json(
        { error: "URL ไม่ถูกต้อง" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "URL ไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  // Check if user is Pro (animate is Pro-only feature)
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro")
    .eq("id", user.id)
    .single();

  const isPro = profile?.is_pro === true;
  if (!isPro) {
    return NextResponse.json(
      {
        error: "ฟีเจอร์ Animated Sticker สำหรับ Pro เท่านั้น",
        upgrade: true,
      },
      { status: 403 }
    );
  }

  // Daily limit for animations to control cost
  const today = new Date().toISOString().split("T")[0];
  const { data: todayAnims } = await supabase
    .from("generations")
    .select("count")
    .eq("user_id", user.id)
    .eq("style", "animated")
    .gte("created_at", `${today}T00:00:00`);

  const animUsage =
    todayAnims?.reduce((sum, g) => sum + (g.count || 0), 0) ?? 0;

  if (animUsage >= ANIMATE_DAILY_LIMIT) {
    return NextResponse.json(
      {
        error: `ครบโควต้า Animate ${ANIMATE_DAILY_LIMIT} ครั้ง/วัน พรุ่งนี้ลองใหม่ได้!`,
        remaining: 0,
      },
      { status: 429 }
    );
  }

  try {
    const prediction = await replicate.predictions.create({
      model: "stability-ai/stable-video-diffusion",
      input: {
        input_image: imageUrl,
        motion_bucket_id: MOTION_AMOUNT,
        fps: FRAMES_PER_SECOND,
        cond_aug: 0.02,
        decoding_t: 14,
        sizing_strategy: "maintain_aspect_ratio",
      },
    });

    const finalPrediction = await replicate.wait(prediction);

    if (!finalPrediction.output) {
      return NextResponse.json(
        { error: "ไม่สามารถสร้าง animation ได้ ลองใหม่" },
        { status: 500 }
      );
    }

    // Output is a video URL (mp4)
    const videoUrl =
      typeof finalPrediction.output === "string"
        ? finalPrediction.output
        : Array.isArray(finalPrediction.output)
          ? finalPrediction.output[0]
          : null;

    if (!videoUrl || typeof videoUrl !== "string") {
      return NextResponse.json(
        { error: "ไม่สามารถสร้าง animation ได้ ลองใหม่" },
        { status: 500 }
      );
    }

    // Upload to Supabase Storage
    const videoResponse = await fetch(videoUrl);
    const videoBuffer = await videoResponse.arrayBuffer();
    const fileName = `${user.id}/${Date.now()}-${crypto.randomUUID()}.mp4`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("stickers")
      .upload(fileName, videoBuffer, {
        contentType: "video/mp4",
        upsert: false,
      });

    let permanentUrl = videoUrl;
    if (!uploadError) {
      const { data: urlData } = supabaseAdmin.storage
        .from("stickers")
        .getPublicUrl(fileName);
      permanentUrl = urlData.publicUrl;
    } else {
      console.error("Storage upload error:", uploadError.message);
    }

    // Log animation for daily limit tracking
    await supabase.from("generations").insert({
      user_id: user.id,
      prompt: "animated",
      style: "animated",
      count: 1,
      is_pro: true,
    });

    return NextResponse.json({ videoUrl: permanentUrl });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Animate API error:", errorMessage);

    if (
      errorMessage.includes("429") ||
      errorMessage.includes("throttled")
    ) {
      return NextResponse.json(
        { error: "คำขอถี่เกินไป รอสักครู่แล้วลองใหม่" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "สร้าง animation ไม่สำเร็จ ลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
