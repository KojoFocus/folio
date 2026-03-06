import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { UpgradeBanner } from "@/components/UpgradeBanner";
import {
  Presentation, Search, TrendingUp, Megaphone, Compass, Star,
  BarChart2, ArrowRight, LogOut, Rocket, CircleDollarSign,
} from "lucide-react";

const PLAN_LABELS: Record<string, string> = {
  free: "Free", starter: "Starter", pro: "Pro", enterprise: "Enterprise",
};

const TOOLS = [
  { href: "/build",     icon: Presentation,      title: "Pitch Deck Builder", desc: "Generate a full investor-grade deck from your idea." },
  { href: "/review",    icon: Search,            title: "Deck Review",        desc: "Get honest VC-style feedback + a revised downloadable deck." },
  { href: "/financial", icon: TrendingUp,        title: "Financial Model",    desc: "Build a 3-year projection in plain English. Download as Excel." },
  { href: "/marketing", icon: Megaphone,         title: "Marketing Plan",     desc: "90-day plan with channels, messaging, and success metrics." },
  { href: "/strategy",  icon: Compass,           title: "Business Strategy",  desc: "Situation assessment + the 2–3 moves that matter most." },
  { href: "/investor",  icon: Star,              title: "Investor Readiness", desc: "Readiness score across 6 dimensions + 30-day prep checklist." },
  { href: "/growth",    icon: Rocket,            title: "Growth Strategy",    desc: "Find the levers that move revenue — acquisition, retention, and scaling." },
  { href: "/funding",   icon: CircleDollarSign,  title: "Funding Finder",     desc: "Matched grants, investors, and accelerators for your location, stage, and sector." },
  { href: "/model",     icon: BarChart2,         title: "Model Playground",   desc: "Adjust assumptions and see projections update live." },
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map(({ href, icon: Icon, title, desc }) => (
              <Link key={href} href={href}
                className="group flex flex-col gap-3 rounded-xl border border-field-800 bg-field-900/50 p-5 transition-all hover:border-field-700 hover:bg-field-900">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-field-700 bg-field-800">
                  <Icon className="h-4 w-4 text-sage-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-field-200 transition-colors group-hover:text-field-100">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-field-600">{desc}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-sage-500 transition-colors group-hover:text-sage-400">
                  Open <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
