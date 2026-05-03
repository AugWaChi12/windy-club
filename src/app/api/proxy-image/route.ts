import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = ["replicate.delivery", "pbxt.replicate.delivery"];

export async function GET(request: NextRequest) {
  const imageUrl = request.nextUrl.searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const parsedUrl = new URL(imageUrl);
    if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
      return NextResponse.json({ error: "Invalid image host" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const response = await fetch(imageUrl);
  if (!response.ok) {
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 });
  }

  const blob = await response.blob();
  return new NextResponse(blob, {
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "image/png",
      "Content-Disposition": "attachment; filename=windy-sticker.png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
