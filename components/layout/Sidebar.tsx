"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Presentation,
  Search,
  TrendingUp,
  Megaphone,
  Compass,
  Star,
  ChevronLeft,
  ChevronRight,
  Zap,
  MessageSquare,
  Trash2,
  BarChart2,
  Rocket,
  CircleDollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Plan } from "@/lib/claude";

const NAV = [
  { href: "/dashboard",  label: "Dashboard",         icon: LayoutDashboard, group: "main"  },
  { href: "/build",      label: "Pitch Deck",         icon: Presentation,    group: "tools" },
  { href: "/review",     label: "Review Deck",        icon: Search,          group: "tools" },
  { href: "/financial",  label: "Financial Model",    icon: TrendingUp,      group: "tools" },
  { href: "/model",      label: "Model Playground",   icon: BarChart2,       group: "tools" },
  { href: "/marketing",  label: "Marketing Plan",     icon: Megaphone,       group: "tools" },
  { href: "/strategy",   label: "Business Strategy",  icon: Compass,         group: "tools" },
  { href: "/investor",   label: "Investor Readiness", icon: Star,            group: "tools" },
  { href: "/growth",     label: "Growth Strategy",    icon: Rocket,              group: "tools" },
  { href: "/funding",    label: "Funding Finder",     icon: CircleDollarSign,    group: "tools" },
] as const;

const PLAN_LABELS: Record<Plan, string> = {
  free: "Free", starter: "Starter", pro: "Pro", enterprise: "Enterprise",
};

const PLAN_LIMITS: Record<Plan, number> = {
  free: 10, starter: 100, pro: 500, enterprise: Infinity,
};

const MODE_LABELS: Record<string, string> = {
  build: "Pitch Deck", review: "Deck Review", financial: "Financial Model",
  marketing: "Marketing Plan", strategy: "Strategy", investor: "Investor Readiness",
  growth: "Growth Strategy",
  funding: "Funding Finder",
};

const MODE_COLORS: Record<string, string> = {
  build:     "text-blue-400",
  review:    "text-purple-400",
  financial: "text-emerald-400",
  marketing: "text-orange-400",
  strategy:  "text-yellow-400",
  investor:  "text-pink-400",
  growth:    "text-cyan-400",
  funding:   "text-lime-400",
};

interface ConversationItem {
  id: string; mode: string; title: string | null; updatedAt: string;
}

interface Props { plan: Plan; usageCount: number; }

export function Sidebar({ plan, usageCount }: Props) {
  const pathname = usePathname();
  const limit    = PLAN_LIMITS[plan];
  const atLimit  = limit !== Infinity && usageCount >= limit;
  const pct      = limit === Infinity ? 0 : Math.min(100, (usageCount / limit) * 100);

  const [collapsed,     setCollapsed]     = useState(false);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [deletingId,    setDeletingId]    = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((c) => {
      localStorage.setItem("sidebar-collapsed", String(!c));
      return !c;
    });
  }

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.ok ? r.json() : [])
      .then((data: ConversationItem[]) => setConversations(data))
      .catch(() => {});
  }, [pathname]);

  async function deleteConversation(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(id);
    try {
      await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      setConversations((c) => c.filter((x) => x.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  const mainLinks = NAV.filter((n) => n.group === "main");
  const toolLinks = NAV.filter((n) => n.group === "tools");

  return (
    <aside
      className={cn(
        "relative flex h-full shrink-0 flex-col border-r border-field-800 bg-field-950 transition-[width] duration-200",
        collapsed ? "w-14" : "w-56",
      )}
    >
      {/* Logo */}
      <div className={cn("flex h-12 items-center border-b border-field-800", collapsed ? "justify-center" : "px-4")}>
        <span className="font-serif text-sm font-semibold text-field-300">
          {collapsed ? "F" : "Folio"}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {mainLinks.map(({ href, label, icon: Icon }) => (
          <NavLink key={href} href={href} icon={Icon} label={label}
            active={pathname === href} collapsed={collapsed} />
        ))}

        {!collapsed
          ? <p className="px-3 pt-4 pb-1 text-[10px] font-medium uppercase tracking-widest text-field-700">Tools</p>
          : <div className="my-2 h-px bg-field-800 mx-2" />
        }

        {toolLinks.map(({ href, label, icon: Icon }) => (
          <NavLink key={href} href={href} icon={Icon} label={label}
            active={pathname.startsWith(href)} collapsed={collapsed} />
        ))}

        {!collapsed && conversations.length > 0 && (
          <>
            <p className="px-3 pt-4 pb-1 text-[10px] font-medium uppercase tracking-widest text-field-700">Your Work</p>
            {(() => {
              // Group by mode, preserving recency order within each group
              const groups: Record<string, ConversationItem[]> = {};
              const order: string[] = [];
              for (const c of conversations.slice(0, 30)) {
                if (!groups[c.mode]) { groups[c.mode] = []; order.push(c.mode); }
                if (groups[c.mode].length < 5) groups[c.mode].push(c);
              }
              return order.map((mode) => (
                <div key={mode} className="mt-1">
                  <p className={cn("px-3 pb-0.5 text-[9px] font-semibold uppercase tracking-widest", MODE_COLORS[mode] ?? "text-field-600")}>
                    {MODE_LABELS[mode] ?? mode}
                  </p>
                  {groups[mode].map((c) => (
                    <div key={c.id} className="group relative flex items-center">
                      <Link
                        href={`/chat/${c.id}`}
                        className={cn(
                          "flex flex-1 items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors min-w-0",
                          pathname === `/chat/${c.id}`
                            ? "bg-field-800 text-field-200"
                            : "text-field-600 hover:bg-field-900 hover:text-field-400",
                        )}
                      >
                        <MessageSquare className="h-3 w-3 shrink-0 opacity-40" />
                        <span className="flex-1 truncate">
                          {c.title ?? "Untitled session"}
                        </span>
                      </Link>
                      <button
                        onClick={(e) => deleteConversation(c.id, e)}
                        disabled={deletingId === c.id}
                        className="absolute right-1.5 hidden rounded p-0.5 text-field-700 hover:text-red-400 group-hover:flex"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ));
            })()}
          </>
        )}
      </nav>

      {/* Usage + plan */}
      {!collapsed && (
        <div className="border-t border-field-800 px-4 py-4 space-y-3">
          {limit !== Infinity && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className={atLimit ? "text-amber-400 font-medium" : "text-field-500"}>
                  {atLimit ? "Limit reached" : "Usage"}
                </span>
                <span className="text-field-600">{usageCount} / {limit}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-field-800">
                <div
                  className={cn("h-full rounded-full transition-all duration-500",
                    atLimit ? "bg-amber-400" : pct > 75 ? "bg-amber-500/70" : "bg-sage-500")}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {atLimit && <p className="text-xs text-amber-400/80">Upgrade to continue</p>}
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-field-700 bg-field-900 px-2 py-0.5 text-xs text-field-500">
              {PLAN_LABELS[plan]}
            </span>
            {(plan === "free" || plan === "starter") && (
              <Link href="/upgrade"
                className="flex items-center gap-1 text-xs font-medium text-sage-400 hover:text-sage-300 transition-colors">
                <Zap className="h-3 w-3" /> Upgrade
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Collapse toggle button */}
      <button
        onClick={toggleCollapsed}
        className={cn(
          "absolute -right-3.5 top-16 z-20 flex h-7 w-7 items-center justify-center",
          "rounded-full border border-field-800 bg-field-900 text-field-600 shadow-sm",
          "hover:border-field-600 hover:text-field-300 transition-colors",
        )}
      >
        {collapsed
          ? <ChevronRight className="h-3.5 w-3.5" />
          : <ChevronLeft  className="h-3.5 w-3.5" />
        }
      </button>
    </aside>
  );
}

function NavLink({
  href, icon: Icon, label, active, collapsed,
}: {
  href: string; icon: React.ElementType; label: string; active: boolean; collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-lg py-2 text-sm transition-colors",
        collapsed ? "justify-center px-0" : "px-3",
        active
          ? "bg-field-800 text-field-100"
          : "text-field-500 hover:bg-field-900 hover:text-field-300",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && label}
    </Link>
  );
}
