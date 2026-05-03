import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      if (userId) {
        await supabaseAdmin
          .from("profiles")
          .upsert({
            id: userId,
            is_pro: true,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const { data } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("stripe_subscription_id", subscription.id)
        .single();

      if (data) {
        await supabaseAdmin
          .from("profiles")
          .update({ is_pro: false })
          .eq("id", data.id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
