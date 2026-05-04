import Replicate from "replicate";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const STYLE_PROMPTS: Record<string, string> = {
  kawaii: "kawaii chibi sticker, thick black outlines, flat cel-shaded coloring, soft pastel palette, rounded simple shapes, no gradients, consistent 2D cartoon look",
  comic: "American comic book sticker, bold uniform black ink outlines, flat cel-shaded vibrant colors, halftone dots, pop art style, consistent 2D cartoon look",
  minimal: "minimalist flat design sticker, thin uniform outlines, solid flat colors, geometric simple shapes, no shadows no gradients, consistent 2D vector look",
  anime: "anime manga sticker, clean uniform black outlines, flat cel-shaded coloring, big expressive eyes, Japanese illustration style, consistent 2D anime look",
  pixel: "pixel art sticker, crisp 16-bit retro style, limited color palette, sharp pixel edges, no anti-aliasing, consistent retro game sprite look",
  watercolor: "watercolor painting sticker, soft wet edges, translucent color washes, gentle brush strokes, delicate floral tones, artistic watercolor illustration on white background",
  retro: "vintage retro 70s sticker, groovy psychedelic colors, thick rounded typography style, warm sunset palette, disco era aesthetic, nostalgic vintage illustration",
  doodle: "hand-drawn doodle sticker, sketchy pen ink lines, casual notebook scribble style, black ink on white, playful imperfect hand-drawn look, simple fun doodle art",
  threed: "3D rendered cute sticker, soft clay render, smooth rounded surfaces, subtle shadows, Pixar-style 3D character, glossy plastic toy look, isometric 3D illustration",
  neon: "neon glow sticker, vibrant glowing neon outlines, dark background with bright electric colors, cyberpunk neon sign aesthetic, glowing LED light art style",
};

const FREE_DAILY_LIMIT = 3;
const PRO_DAILY_LIMIT = 50;
const MAX_ACCOUNTS_PER_IP = 3;
const MAX_OUTPUTS_PER_CALL = 3;

const NON_LATIN_PATTERN = /[^\u0000-\u007F]/;

// Generate multiple varied prompts for batch generation
async function generateVariedPrompts(
  text: string,
  styleName: string,
  batchCount: number
): Promise<string[]> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return Array(batchCount).fill(text);

  try {
    const needsTranslation = NON_LATIN_PATTERN.test(text);

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are a sticker prompt engineer. Your job:
1. ${needsTranslation ? "Translate the input to English." : "Keep the English input as-is."}
2. Generate exactly ${batchCount} different prompt variation(s) for a "${styleName}" style sticker.
3. Each variation should depict the SAME subject but with DIFFERENT: pose, expression, angle, action, or mood.
4. Keep each prompt under 60 words, detailed and specific.
5. Output as a JSON array of strings ONLY. No markdown, no explanation.

Example input: "orange cat eating ramen"
Example output for 3 variations:
["a chubby orange tabby cat sitting upright, happily slurping ramen from a bowl with chopsticks, eyes closed with joy, steam rising","an orange tabby cat lying on its belly, licking lips after finishing ramen, empty bowl beside it, satisfied sleepy expression","a playful orange tabby cat standing on hind legs, holding a ramen bowl above its head triumphantly, big sparkling eyes"]`,
          },
          { role: "user", content: text },
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      console.error("Groq enhance error:", response.status);
      return Array(batchCount).fill(text);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return Array(batchCount).fill(text);

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return Array(batchCount).fill(content);

    const prompts: string[] = JSON.parse(jsonMatch[0]);
    while (prompts.length < batchCount) prompts.push(prompts[0] || text);
    return prompts.slice(0, batchCount);
  } catch (error) {
    console.error("Prompt generation failed:", error);
    return Array(batchCount).fill(text);
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "กรุณาเข้าสู่ระบบก่อนสร้าง Sticker" },
      { status: 401 }
    );
  }

  // Per-user rate limit: max 5 requests per 30 seconds
  const rl = rateLimit(`gen:${user.id}`, 5, 30_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "คำขอถี่เกินไป รอสักครู่แล้วลองใหม่" },
      { status: 429 }
    );
  }

  // --- IP-based account limiting ---
  const forwarded = request.headers.get("x-forwarded-for");
  const clientIp =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (
    clientIp !== "unknown" &&
    clientIp !== "127.0.0.1" &&
    clientIp !== "::1"
  ) {
    const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
    const { data: recentGens } = await supabaseAdmin
      .from("generations")
      .select("user_id, client_ip")
      .eq("client_ip", clientIp)
      .gte("created_at", oneDayAgo);

    if (recentGens) {
      const uniqueUsers = new Set(recentGens.map((g) => g.user_id));
      uniqueUsers.add(user.id);
      if (uniqueUsers.size > MAX_ACCOUNTS_PER_IP) {
        return NextResponse.json(
          {
            error:
              "IP นี้มีผู้ใช้งานเกินจำนวนที่กำหนด กรุณาติดต่อทีมงาน",
          },
          { status: 403 }
        );
      }
    }
  }

  // Check if user is Pro
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro")
    .eq("id", user.id)
    .single();

  const isPro = profile?.is_pro === true;
  const dailyLimit = isPro ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;

  // Check daily usage (sum the count column = total images generated)
  const today = new Date().toISOString().split("T")[0];
  const { data: todayGens } = await supabase
    .from("generations")
    .select("count")
    .eq("user_id", user.id)
    .gte("created_at", `${today}T00:00:00`);

  const currentUsage =
    todayGens?.reduce((sum, g) => sum + (g.count || 0), 0) ?? 0;

  if (currentUsage >= dailyLimit) {
    return NextResponse.json(
      {
        error: isPro
          ? `ครบโควต้า Pro ${PRO_DAILY_LIMIT} รูป/วัน พรุ่งนี้สร้างต่อได้เลย!`
          : `ครบโควต้าฟรี ${FREE_DAILY_LIMIT} รูป/วัน อัปเกรด Pro เพื่อสร้าง ${PRO_DAILY_LIMIT} รูป/วัน!`,
        upgrade: !isPro,
        remaining: 0,
        dailyLimit,
      },
      { status: 429 }
    );
  }

  const { prompt, style, count } = await request.json();

  if (!prompt || typeof prompt !== "string" || prompt.length > 200) {
    return NextResponse.json(
      { error: "Prompt is required and must be under 200 characters" },
      { status: 400 }
    );
  }

  // Clamp batch count: free=1-2, pro=1-9, never exceed remaining quota
  const remaining = dailyLimit - currentUsage;
  const maxBatch = isPro ? 9 : 2;
  const allowedCounts = isPro ? [1, 2, 4, 9] : [1, 2];
  const requested = Number(count) || 1;
  const closestAllowed = allowedCounts.reduce((prev, curr) =>
    Math.abs(curr - requested) < Math.abs(prev - requested) ? curr : prev
  );
  const stickerCount = Math.min(closestAllowed, maxBatch, remaining);

  const styleModifier = STYLE_PROMPTS[style] || STYLE_PROMPTS.kawaii;

  // Reserve quota BEFORE calling Replicate to prevent race condition
  const insertData: Record<string, unknown> = {
    user_id: user.id,
    prompt,
    style,
    count: stickerCount,
    is_pro: isPro,
  };
  if (clientIp !== "unknown") {
    insertData.client_ip = clientIp;
  }
  const { data: reservedGen, error: reserveError } = await supabase
    .from("generations")
    .insert(insertData)
    .select("id")
    .single();

  if (reserveError) {
    console.error("Failed to reserve quota:", reserveError.message);
    return NextResponse.json(
      { error: "ไม่สามารถสร้าง sticker ได้ ลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }

  // Generate varied prompts — one per parallel API call
  const numCalls = Math.ceil(stickerCount / MAX_OUTPUTS_PER_CALL);
  const variedPrompts = await generateVariedPrompts(
    prompt,
    style || "kawaii",
    numCalls
  );

  try {
    // Split into parallel calls, each producing up to MAX_OUTPUTS_PER_CALL images
    const numCalls = Math.ceil(stickerCount / MAX_OUTPUTS_PER_CALL);
    const callPromises = [];

    for (let callIdx = 0; callIdx < numCalls; callIdx++) {
      const startImg = callIdx * MAX_OUTPUTS_PER_CALL;
      const outputsThisCall = Math.min(MAX_OUTPUTS_PER_CALL, stickerCount - startImg);
      const callPrompt = variedPrompts[callIdx] || variedPrompts[0];

      const fullPrompt = `A sticker of ${callPrompt}, ${styleModifier}, pure white background, no text, isolated object, high quality, digital art, sticker design, die-cut sticker`;

      callPromises.push(
        replicate.predictions.create({
          model: "black-forest-labs/flux-schnell",
          input: {
            prompt: fullPrompt,
            num_outputs: outputsThisCall,
            aspect_ratio: "1:1",
            output_format: "png",
            output_quality: 90,
          },
        }).then((prediction) => replicate.wait(prediction))
      );
    }

    const predictions = await Promise.all(callPromises);

    const results: string[] = [];
    for (const finalPrediction of predictions) {
      if (
        finalPrediction.output &&
        Array.isArray(finalPrediction.output)
      ) {
        for (const item of finalPrediction.output) {
          if (typeof item === "string") {
            results.push(item);
          }
        }
      }
    }

    if (results.length === 0) {
      // Rollback reserved quota on failure
      if (reservedGen?.id) {
        await supabase.from("generations").delete().eq("id", reservedGen.id);
      }
      return NextResponse.json(
        { error: "ไม่สามารถสร้าง sticker ได้ ลองใหม่อีกครั้ง" },
        { status: 500 }
      );
    }

    // Upload images to Supabase Storage for persistence
    const permanentUrls: string[] = [];
    for (const replicateUrl of results) {
      try {
        const imageResponse = await fetch(replicateUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const fileName = `${user.id}/${Date.now()}-${crypto.randomUUID()}.png`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from("stickers")
          .upload(fileName, imageBuffer, {
            contentType: "image/png",
            upsert: false,
          });

        if (uploadError) {
          console.error("Storage upload error:", uploadError.message);
          permanentUrls.push(replicateUrl);
        } else {
          const { data: urlData } = supabaseAdmin.storage
            .from("stickers")
            .getPublicUrl(fileName);
          permanentUrls.push(urlData.publicUrl);
        }
      } catch {
        permanentUrls.push(replicateUrl);
      }
    }

    // Update reserved generation with actual count (may differ if some failed)
    if (results.length !== stickerCount && reservedGen?.id) {
      await supabase
        .from("generations")
        .update({ count: results.length })
        .eq("id", reservedGen.id);
    }

    return NextResponse.json({
      images: permanentUrls,
      isPro,
      remaining: remaining - results.length,
      dailyLimit,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Replicate API error:", errorMessage);

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
      { error: "Failed to generate stickers. Please try again." },
      { status: 500 }
    );
  }
}
