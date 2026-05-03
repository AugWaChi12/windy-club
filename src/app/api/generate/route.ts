import Replicate from "replicate";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const STYLE_PROMPTS: Record<string, string> = {
  kawaii: "kawaii style, chibi, cute, pastel colors, simple shapes",
  comic: "comic book style, bold lines, vibrant colors, pop art",
  minimal: "minimalist style, clean lines, flat design, simple",
  anime: "anime style, manga, japanese illustration, detailed",
  pixel: "pixel art style, retro, 8-bit, game style",
};

const FREE_DAILY_LIMIT = 3;
const DELAY_BETWEEN_REQUESTS_MS = 8000;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "กรุณาเข้าสู่ระบบก่อนสร้าง Sticker" },
      { status: 401 }
    );
  }

  // Check if user is Pro
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro")
    .eq("id", user.id)
    .single();

  const isPro = profile?.is_pro === true;

  // Check daily usage for free users
  if (!isPro) {
    const today = new Date().toISOString().split("T")[0];
    const { count } = await supabase
      .from("generations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", `${today}T00:00:00`);

    if ((count ?? 0) >= FREE_DAILY_LIMIT) {
      return NextResponse.json(
        { error: `ครบโควต้าฟรี ${FREE_DAILY_LIMIT} ครั้ง/วัน อัปเกรด Pro เพื่อสร้างไม่จำกัด!`, upgrade: true },
        { status: 429 }
      );
    }
  }

  const { prompt, style, count } = await request.json();

  if (!prompt || typeof prompt !== "string" || prompt.length > 200) {
    return NextResponse.json(
      { error: "Prompt is required and must be under 200 characters" },
      { status: 400 }
    );
  }

  const stickerCount = Math.min(Math.max(Number(count) || 4, 1), isPro ? 8 : 4);
  const styleModifier = STYLE_PROMPTS[style] || STYLE_PROMPTS.kawaii;

  const fullPrompt = `A sticker of ${prompt}, ${styleModifier}, white background, no text, isolated object, high quality, digital art, sticker design`;

  try {
    const results: string[] = [];

    for (let i = 0; i < stickerCount; i++) {
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_REQUESTS_MS));
      }

      const prediction = await replicate.predictions.create({
        model: "black-forest-labs/flux-schnell",
        input: {
          prompt: fullPrompt,
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "png",
          output_quality: 90,
        },
      });

      const finalPrediction = await replicate.wait(prediction);

      if (finalPrediction.output && Array.isArray(finalPrediction.output)) {
        for (const item of finalPrediction.output) {
          if (typeof item === "string") {
            results.push(item);
          }
        }
      }
    }

    if (results.length === 0) {
      return NextResponse.json(
        { error: "ไม่สามารถสร้าง sticker ได้ ลองใหม่อีกครั้ง" },
        { status: 500 }
      );
    }

    // Log generation for usage tracking
    await supabase.from("generations").insert({
      user_id: user.id,
      prompt,
      style,
      count: results.length,
      is_pro: isPro,
    });

    return NextResponse.json({ images: results, isPro });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Replicate API error:", errorMessage);

    if (errorMessage.includes("429") || errorMessage.includes("throttled")) {
      return NextResponse.json(
        { error: "คำขอถี่เกินไป รอสักครู่แล้วลองใหม่" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate stickers. Please try again." },
      { status: 500 }
    );
  }
}
