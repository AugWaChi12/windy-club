import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET /api/stickers — list user's saved stickers
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ images: [] });
  }

  const { data: files, error } = await supabaseAdmin.storage
    .from("stickers")
    .list(user.id, { sortBy: { column: "created_at", order: "desc" } });

  if (error || !files) {
    return NextResponse.json({ images: [] });
  }

  const images = files
    .filter((file) => !file.id.endsWith("/"))
    .map((file) => {
      const { data } = supabaseAdmin.storage
        .from("stickers")
        .getPublicUrl(`${user.id}/${file.name}`);
      return data.publicUrl;
    });

  return NextResponse.json({ images });
}

// DELETE /api/stickers — remove a sticker by its public URL
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url: imageUrl } = await request.json();

  if (!imageUrl || typeof imageUrl !== "string") {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  // Extract file path from public URL — only allow deleting own files
  // URL format: .../storage/v1/object/public/stickers/{userId}/{filename}
  const match = imageUrl.match(/\/stickers\/([^/]+\/[^/]+)$/);
  if (!match) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const filePath = match[1];

  // Security: verify the file belongs to the authenticated user
  if (!filePath.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabaseAdmin.storage
    .from("stickers")
    .remove([filePath]);

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
