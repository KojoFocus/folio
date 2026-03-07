"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    key:      "starter" as const,
    featured: false,
    name:     "Starter",
    price:    19,
    tagline:  "Everything you need to get investor-ready.",
    features: [
      "Unlimited deck reviews",
      "AI pitch deck builder",
      "Financial model assistant",
      "PDF & PPTX uploads",
      "PPTX export",
    ],
  },
  {
    key:      "pro" as const,
    name:     "Pro",
    price:    49,
    tagline:  "Sharper analysis, faster responses, more depth.",
    featured: true,
    features: [
      "Everything in Starter",
      "More thorough, detailed analysis",
      "Priority response speed",
      "Excel financial export",
      "Early access to new features",
    ],
  },
  {
    key:      "enterprise" as const,
    featured: false,
    name:     "Enterprise",
    price:    199,
    tagline:  "For teams and advisors managing multiple decks.",
    features: [
      "Everything in Pro",
      "Up to 10 team seats",
      "Shared document workspace",
      "Custom branding on exports",
      "Dedicated support",
    ],
  },
] as const;

type PlanKey = (typeof PLANS)[number]["key"];

export default function UpgradePage() {
  const [loading, setLoading] = useState<PlanKey | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  async function handleUpgrade(plan: PlanKey) {
    setLoading(plan);
    setError(null);

    try {
      const res = await fetch("/api/create-checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ plan }),
      });

      if (res.status === 401) {
        window.location.href = `/login?callbackUrl=/upgrade`;
        return;
      }

      const data = await res.json() as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-field-950 text-field-200">
      <header className="flex items-center gap-4 border-b border-field-800 px-5 py-3.5">
        <Link href="/" className="text-field-600 hover:text-field-300 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="font-serif text-sm font-semibold text-field-300">Folio</span>
        <span className="text-field-700">/</span>
        <span className="text-sm text-field-500">Upgrade</span>
      </header>

      <main className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          {/* Heading */}
          <div className="mb-14 text-center">
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-field-100 md:text-5xl">
              Simple, honest pricing
            </h1>
            <p className="mt-4 text-base text-field-500">
              Cancel any time. No hidden fees.
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="mb-8 rounded-lg border border-red-800/40 bg-red-900/20 px-4 py-3 text-center text-sm text-red-400">
              {error}
            </p>
          )}

          {/* Cards */}
          <div className="grid gap-5 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.key}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-7 transition-colors",
                  plan.featured
                    ? "border-sage-500/60 bg-field-900"
                    : "border-field-800 bg-field-900/60",
                )}
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-sage-500 px-3 py-0.5 text-xs font-semibold text-field-950">
                    Most popular
                  </span>
                )}

                {/* Plan name & price */}
                <div className="mb-6">
                  <p className="text-xs font-medium uppercase tracking-widest text-field-500 mb-3">
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-4xl font-semibold text-field-100">
                      ${plan.price}
                    </span>
                    <span className="text-sm text-field-500">/mo</span>
                  </div>
                  <p className="mt-2 text-sm text-field-500">{plan.tagline}</p>
                </div>

                {/* Features */}
                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-field-300">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage-400" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handleUpgrade(plan.key)}
                  disabled={loading !== null}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors disabled:opacity-60",
                    plan.featured
                      ? "bg-sage-400 text-field-950 hover:bg-sage-300"
                      : "border border-field-700 text-field-200 hover:border-field-600 hover:text-field-100",
                  )}
                >
                  {loading === plan.key && <Loader2 className="h-4 w-4 animate-spin" />}
                  Get started
                </button>
              </div>
            ))}
          </div>

          {/* Free plan note */}
          <p className="mt-10 text-center text-sm text-field-600">
            Not ready to commit?{" "}
            <Link href="/" className="text-field-400 hover:text-field-300 underline underline-offset-2">
              Continue with the free plan
            </Link>{" "}
            — no credit card needed.
          </p>
        </div>
      </main>
    </div>
  );
}
