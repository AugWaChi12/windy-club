import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PRICE_ID } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: max 3 checkout attempts per 5 minutes
  const rl = rateLimit(`checkout:${user.id}`, 3, 300_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "คำขอถี่เกินไป รอสักครู่แล้วลองใหม่" },
      { status: 429 }
    );
  }

  // Prevent double-billing: check if user is already Pro
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro, stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (profile?.is_pro) {
    return NextResponse.json(
      { error: "คุณเป็น Pro อยู่แล้ว!", alreadyPro: true },
      { status: 400 }
    );
  }

  // Reuse existing Stripe customer if available
  const sessionParams: Record<string, unknown> = {
    metadata: { user_id: user.id },
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/create?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/create`,
  };

  if (profile?.stripe_customer_id) {
    sessionParams.customer = profile.stripe_customer_id;
  } else {
    sessionParams.customer_email = user.email;
  }

  const session = await stripe.checkout.sessions.create(
    sessionParams as Parameters<typeof stripe.checkout.sessions.create>[0]
  );

  return NextResponse.json({ url: session.url });
}
