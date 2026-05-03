import Replicate from "replicate";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

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
};

const FREE_DAILY_LIMIT = 999;
const DELAY_BETWEEN_REQUESTS_MS = 8000;

// Detect if text contains non-ASCII (Thai, Japanese, etc.)
const NON_LATIN_PATTERN = /[^\u0000-\u007F]/;

async function enhancePrompt(text: string, styleName: string): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return text;

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
2. Rewrite it as a detailed, specific image generation prompt for a "${styleName}" style sticker.
3. Include specific details about the subject: pose, expression, colors, props.
4. Keep the description under 60 words.
5. Output ONLY the prompt text, nothing else.

Example input: "orange cat eating ramen"
Example output: "a chubby orange tabby cat sitting upright, happily slurping ramen noodles from a white bowl with chopsticks, eyes closed with joy, steam rising, warm orange fur with darker stripes"`,
          },
          { role: "user", content: text },
        ],
        temperature: 0.2,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      console.error("Groq enhance error:", response.status);
      return NON_LATIN_PATTERN.test(text) ? text : text;
    }

    const data = await response.json();
    const enhanced = data.choices?.[0]?.message?.content?.trim();
    return enhanced || text;
  } catch (error) {
    console.error("Prompt enhancement failed:", error);
    return text;
  }
}

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

  // Enhance + translate prompt via Groq for better & more consistent results
  const enhancedPrompt = await enhancePrompt(prompt, style || "kawaii");

  const fullPrompt = `A sticker of ${enhancedPrompt}, ${styleModifier}, pure white background, no text, isolated object, high quality, digital art, sticker design, die-cut sticker`;

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
          permanentUrls.push(replicateUrl); // fallback to temp URL
        } else {
          const { data: urlData } = supabaseAdmin.storage
            .from("stickers")
            .getPublicUrl(fileName);
          permanentUrls.push(urlData.publicUrl);
        }
      } catch {
        permanentUrls.push(replicateUrl); // fallback to temp URL
      }
    }

    // Log generation for usage tracking
    await supabase.from("generations").insert({
      user_id: user.id,
      prompt,
      style,
      count: results.length,
      is_pro: isPro,
    });

    return NextResponse.json({ images: permanentUrls, isPro });
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
