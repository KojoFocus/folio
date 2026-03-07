import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { UpgradeBanner } from "@/components/UpgradeBanner";
import { ToolSections } from "@/components/ToolSections";
import {
  Presentation, Search, TrendingUp, Megaphone, Compass, Star,
  LogOut, Rocket, CircleDollarSign,
} from "lucide-react";

const PLAN_LABELS: Record<string, string> = {
  free: "Free", starter: "Starter", pro: "Pro", enterprise: "Enterprise",
};

const SECTIONS = [
  {
    label: "Create",
    tools: [
      { href: "/build",     icon: Presentation,     title: "Build Deck",      desc: "Generate an investor-grade pitch deck from your idea." },
      { href: "/review",    icon: Search,           title: "Review Deck",     desc: "VC-style feedback + a revised, downloadable deck." },
      { href: "/financial", icon: TrendingUp,       title: "Financial Model", desc: "3-year projections in plain English. Download as Excel." },
    ],
  },
  {
    label: "Strategy",
    tools: [
      { href: "/marketing", icon: Megaphone,        title: "Marketing",       desc: "90-day plan with channels, messaging, and success metrics." },
      { href: "/strategy",  icon: Compass,          title: "Strategy",        desc: "Situation assessment + the 2–3 moves that matter most." },
      { href: "/growth",    icon: Rocket,           title: "Growth",          desc: "Find the levers that move revenue — acquisition, retention, scaling." },
    ],
  },
  {
    label: "Raise",
    tools: [
      { href: "/investor",  icon: Star,             title: "Investor Ready",  desc: "Readiness score across 6 dimensions + 30-day prep checklist." },
      { href: "/funding",   icon: CircleDollarSign, title: "Funding Finder",  desc: "Grants, accelerators, and investors matched to your stage and location — with direct links to apply." },
    ],
  },
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string; plan?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");

  const params     = await searchParams;
  const didUpgrade = params.upgraded === "true";
  const planParam  = params.plan ?? session.user.plan ?? "free";
  const planLabel  = PLAN_LABELS[planParam] ?? planParam;
  const firstName  = session.user.name?.split(" ")[0];

  return (
    <div className="min-h-screen bg-field-950 text-field-200">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-field-800 px-6 py-3.5">
        <span className="font-serif text-sm font-semibold text-field-300">Folio</span>
        <div className="flex items-center gap-4">
          {session.user.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.user.image} alt="" className="h-7 w-7 rounded-full" />
          )}
          <span className="hidden text-xs text-field-600 sm:block">{session.user.email}</span>
          <span className="rounded-full border border-sage-600/40 bg-sage-600/10 px-2.5 py-0.5 text-xs font-medium text-sage-400">
            {PLAN_LABELS[session.user.plan ?? "free"]}
          </span>
          {(session.user.plan === "free" || !session.user.plan) && (
            <Link href="/upgrade"
              className="rounded-lg bg-sage-400 px-3 py-1.5 text-xs font-semibold text-field-950 hover:bg-sage-300 transition-colors">
              Upgrade
            </Link>
          )}
          <Link href="/api/auth/signout"
            className="flex items-center gap-1.5 text-xs text-field-600 hover:text-field-400 transition-colors">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Link>
        </div>
      </header>

      <main className="px-6 py-10">
        <div className="mx-auto max-w-4xl space-y-10">
          {didUpgrade && <UpgradeBanner planLabel={planLabel} />}

          <div>
            <h1 className="font-serif text-3xl font-semibold text-field-100">
              {firstName ? `Welcome back, ${firstName}.` : "Welcome back."}
            </h1>
            <p className="mt-1 text-sm text-field-500">What would you like to work on today?</p>
          </div>

          <ToolSections sections={SECTIONS} />
        </div>
      </main>
    </div>
  );
}
