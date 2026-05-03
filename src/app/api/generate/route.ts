import Replicate from "replicate";
import { NextRequest, NextResponse } from "next/server";

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

async function streamToBuffer(stream: ReadableStream): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
}

const DELAY_BETWEEN_REQUESTS_MS = 8000;

export async function POST(request: NextRequest) {
  const { prompt, style, count } = await request.json();

  if (!prompt || typeof prompt !== "string" || prompt.length > 200) {
    return NextResponse.json(
      { error: "Prompt is required and must be under 200 characters" },
      { status: 400 }
    );
  }

  const stickerCount = Math.min(Math.max(Number(count) || 4, 1), 8);
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

      console.log(`Sticker ${i + 1} done:`, finalPrediction.status, finalPrediction.output);
    }

    if (results.length === 0) {
      return NextResponse.json(
        { error: "ไม่สามารถสร้าง sticker ได้ ลองใหม่อีกครั้ง" },
        { status: 500 }
      );
    }

    return NextResponse.json({ images: results });
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
