"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight, ArrowRight,
  Presentation, Search, TrendingUp,
  Megaphone, Compass, Rocket,
  Star, CircleDollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

export function ToolSections() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="space-y-px">
      {SECTIONS.map(({ label, tools }) => {
        const isOpen = open === label;
        return (
          <div key={label}>
            <button
              onClick={() => setOpen(isOpen ? null : label)}
              className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors hover:bg-field-900"
            >
              <span className="text-sm font-medium text-field-300">{label}</span>
              <ChevronRight
                className={cn(
                  "h-4 w-4 text-field-600 transition-transform duration-200",
                  isOpen && "rotate-90",
                )}
              />
            </button>

            {isOpen && (
              <div className="grid gap-3 px-1 pb-4 pt-1 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map(({ href, icon: Icon, title, desc }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex flex-col gap-3 rounded-xl border border-field-800 bg-field-900/50 p-5 transition-all hover:border-field-700 hover:bg-field-900"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-field-700 bg-field-800">
                      <Icon className="h-4 w-4 text-sage-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-field-200 transition-colors group-hover:text-field-100">
                        {title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-field-600">{desc}</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium text-sage-500 transition-colors group-hover:text-sage-400">
                      Open <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
