import { NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripe, PRICE_TO_PLAN } from "@/lib/stripe";
import type { Plan } from "@/lib/claude";


export async function POST(req: NextRequest) {
  const sig     = req.headers.get("stripe-signature");
  const secret  = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook verification failed";
    console.error("[stripe webhook] verification error:", msg);
    return new Response(`Webhook Error: ${msg}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const plan       = session.metadata?.plan as Plan | undefined;
        const userId     = session.metadata?.userId;
        const customerId = session.customer as string;
        const subId      = session.subscription as string;

        if (plan && userId) {
          await handlePlanActivated({ userId, customerId, subscriptionId: subId, plan });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub     = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0]?.price.id;
        const plan    = priceId ? PRICE_TO_PLAN[priceId] : undefined;
        const userId  = sub.metadata?.userId;

        if (plan && userId) {
          await handlePlanActivated({
            userId,
            customerId:     sub.customer as string,
            subscriptionId: sub.id,
            plan,
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub    = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (userId) {
          await handlePlanCancelled({ userId, subscriptionId: sub.id });
        }
        break;
      }

      default:
        // Unhandled event type — safe to ignore
        break;
    }
  } catch (err) {
    console.error("[stripe webhook] handler error:", err);
    return new Response("Handler error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}

// ---------------------------------------------------------------------------
// DB handlers — wire these up once a database is added.
// ---------------------------------------------------------------------------

async function handlePlanActivated(params: {
  userId:         string;
  customerId:     string;
  subscriptionId: string;
  plan:           Plan;
}) {
  const { userId, customerId, subscriptionId, plan } = params;
  console.log(`[stripe] activating plan=${plan} for userId=${userId}`);

  // TODO: update User record in DB
  // await db.user.update({
  //   where: { id: userId },
  //   data:  { plan, stripeCustomerId: customerId },
  // });

  // TODO: upsert Subscription record in DB
  // await db.subscription.upsert({
  //   where:  { stripeSubscriptionId: subscriptionId },
  //   create: { userId, stripeSubscriptionId: subscriptionId, stripeCustomerId: customerId, plan, status: "active" },
  //   update: { plan, status: "active" },
  // });
}

async function handlePlanCancelled(params: {
  userId:         string;
  subscriptionId: string;
}) {
  const { userId, subscriptionId } = params;
  console.log(`[stripe] cancelling subscription=${subscriptionId} for userId=${userId}`);

  // TODO: revert User plan to "free"
  // await db.user.update({ where: { id: userId }, data: { plan: "free" } });

  // TODO: update Subscription status
  // await db.subscription.update({
  //   where: { stripeSubscriptionId: subscriptionId },
  //   data:  { status: "cancelled" },
  // });
}
