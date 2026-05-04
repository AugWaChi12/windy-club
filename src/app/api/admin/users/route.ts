import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ADMIN_EMAIL = "supakorn@windy-club.com";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) return null;
  return user;
}

// GET /api/admin/users — list all users with profiles
export async function GET(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  // Get users from auth.users via admin API
  const {
    data: { users },
    error: usersError,
  } = await supabaseAdmin.auth.admin.listUsers({
    page,
    perPage: pageSize,
  });

  if (usersError) {
    return NextResponse.json(
      { error: usersError.message },
      { status: 500 }
    );
  }

  // Get profiles for these users
  const userIds = users.map((u) => u.id);
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, is_pro, stripe_customer_id, created_at")
    .in("id", userIds);

  // Get generation counts
  const { data: genCounts } = await supabaseAdmin
    .from("generations")
    .select("user_id, id")
    .in("user_id", userIds);

  const genCountMap = new Map<string, number>();
  if (genCounts) {
    for (const gen of genCounts) {
      genCountMap.set(
        gen.user_id,
        (genCountMap.get(gen.user_id) || 0) + 1
      );
    }
  }

  const profileMap = new Map(
    (profiles || []).map((p) => [p.id, p])
  );

  // Filter by search if provided
  const filteredUsers = search
    ? users.filter(
        (u) =>
          u.email?.toLowerCase().includes(search.toLowerCase()) ||
          (u.user_metadata?.full_name || "")
            .toLowerCase()
            .includes(search.toLowerCase())
      )
    : users;

  const combined = filteredUsers.map((u) => {
    const profile = profileMap.get(u.id);
    return {
      id: u.id,
      email: u.email || "",
      name: u.user_metadata?.full_name || u.user_metadata?.name || "",
      avatar: u.user_metadata?.avatar_url || "",
      isPro: profile?.is_pro || false,
      stripeCustomerId: profile?.stripe_customer_id || null,
      generations: genCountMap.get(u.id) || 0,
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at,
    };
  });

  return NextResponse.json({
    users: combined,
    page,
    pageSize,
    total: filteredUsers.length,
  });
}

// PATCH /api/admin/users — update user profile (toggle Pro, etc.)
export async function PATCH(request: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { userId, action } = body;

  if (!userId || !action) {
    return NextResponse.json(
      { error: "Missing userId or action" },
      { status: 400 }
    );
  }

  switch (action) {
    case "togglePro": {
      // Get current status
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("is_pro")
        .eq("id", userId)
        .single();

      const newStatus = !(profile?.is_pro || false);

      const { error } = await supabaseAdmin
        .from("profiles")
        .upsert(
          { id: userId, is_pro: newStatus },
          { onConflict: "id" }
        );

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, isPro: newStatus });
    }

    case "resetGenerations": {
      // Delete today's generations for this user
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { error } = await supabaseAdmin
        .from("generations")
        .delete()
        .eq("user_id", userId)
        .gte("created_at", today.toISOString());

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json(
        { error: `Unknown action: ${action}` },
        { status: 400 }
      );
  }
}
