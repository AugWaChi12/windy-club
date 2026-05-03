import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PRICE_ID } from "@/lib/stripe";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    metadata: { user_id: user.id },
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/create?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/create`,
  });

  return NextResponse.json({ url: session.url });
}
