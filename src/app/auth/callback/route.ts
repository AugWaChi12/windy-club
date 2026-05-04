import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorParam)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }

    // Ensure profile row exists for this user
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabaseAdmin
        .from("profiles")
        .upsert(
          { id: user.id, is_pro: false },
          { onConflict: "id", ignoreDuplicates: true }
        );
    }
  }

  return NextResponse.redirect(`${origin}/create`);
}
