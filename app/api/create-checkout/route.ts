import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { stripe, getOrCreateStripeCustomer, priceIdForPlan } from "@/lib/stripe";

type UpgradePlan = "starter" | "pro" | "enterprise";

const PLAN_LABELS: Record<UpgradePlan, string> = {
  starter:    "Starter",
  pro:        "Pro",
  enterprise: "Enterprise",
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const body = await req.json() as { plan?: UpgradePlan };
  const plan = body.plan;
  if (!plan || !["starter", "pro", "enterprise"].includes(plan)) {
    return Response.json({ error: "Invalid plan" }, { status: 400 });
  }

  let priceId: string;
  try {
    priceId = priceIdForPlan(plan);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Price not configured";
    return Response.json({ error: msg }, { status: 500 });
  }

  const customerId = await getOrCreateStripeCustomer(
    session.user.email,
    session.user.name ?? undefined,
  );

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const checkout = await stripe.checkout.sessions.create({
    customer:   customerId,
    mode:       "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    metadata:   { plan, userId: session.user.id ?? "" },
    success_url: `${baseUrl}/dashboard?upgraded=true&plan=${plan}`,
    cancel_url:  `${baseUrl}/upgrade`,
    subscription_data: {
      metadata: { plan, userId: session.user.id ?? "" },
    },
    allow_promotion_codes: true,
    billing_address_collection: "auto",
  });

  return Response.json({ url: checkout.url });
}
