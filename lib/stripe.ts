import Stripe from "stripe";
import type { Plan } from "@/lib/claude";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

/** Price ID → Plan mapping (populated from env vars at runtime). */
export const PRICE_TO_PLAN: Record<string, Plan> = {};

function loadPriceMap() {
  if (process.env.STRIPE_PRICE_STARTER)    PRICE_TO_PLAN[process.env.STRIPE_PRICE_STARTER]    = "starter";
  if (process.env.STRIPE_PRICE_PRO)        PRICE_TO_PLAN[process.env.STRIPE_PRICE_PRO]        = "pro";
  if (process.env.STRIPE_PRICE_ENTERPRISE) PRICE_TO_PLAN[process.env.STRIPE_PRICE_ENTERPRISE] = "enterprise";
}
loadPriceMap();

/** Resolves the Stripe price ID for a given plan key from env vars. */
export function priceIdForPlan(plan: "starter" | "pro" | "enterprise"): string {
  const map: Record<string, string | undefined> = {
    starter:    process.env.STRIPE_PRICE_STARTER,
    pro:        process.env.STRIPE_PRICE_PRO,
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
  };
  const id = map[plan];
  if (!id) throw new Error(`Missing STRIPE_PRICE_${plan.toUpperCase()} env var`);
  return id;
}

/**
 * Finds an existing Stripe customer by email, or creates one.
 * Replace the TODO comments with DB writes once a database is wired up.
 */
export async function getOrCreateStripeCustomer(
  email: string,
  name?: string,
): Promise<string> {
  // Search for an existing customer with this email
  const existing = await stripe.customers.search({
    query: `email:"${email}"`,
    limit: 1,
  });

  if (existing.data.length > 0) {
    return existing.data[0].id;
  }

  // Create a new customer
  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: { source: "folio" },
  });

  // TODO: persist customer.id to your DB
  // await db.user.update({ where: { email }, data: { stripeCustomerId: customer.id } });

  return customer.id;
}
