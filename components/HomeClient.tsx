"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Presentation, Search, TrendingUp, Megaphone,
  Compass, Star, ArrowRight, Rocket, CircleDollarSign,
  MessageSquare, Download, Zap,
} from "lucide-react";

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const SECTIONS = [
  {
    label: "Create",
    color: "text-blue-400",
    tools: [
      { href: "/build",     icon: Presentation,     label: "Build Deck",   desc: "Describe your idea and get a full investor-grade pitch deck — slides, speaker notes, and a downloadable PPTX." },
      { href: "/review",    icon: Search,           label: "Review Deck",  desc: "Upload your deck (PDF or PPTX) and get honest VC-style feedback, then a fully revised downloadable version." },
      { href: "/financial", icon: TrendingUp,       label: "Financial Model", desc: "Answer 8 plain-English questions and get a 3-year model with runway, break-even, and unit economics." },
    ],
  },
  {
    label: "Strategy",
    color: "text-amber-400",
    tools: [
      { href: "/marketing", icon: Megaphone,        label: "Marketing",    desc: "Get a 90-day plan with specific channels, messaging, and KPIs tailored to your budget and market." },
      { href: "/strategy",  icon: Compass,          label: "Strategy",     desc: "Walk through your situation and leave with a clear diagnosis and the 2–3 moves that will actually change things." },
      { href: "/growth",    icon: Rocket,           label: "Growth",       desc: "Find your exact growth bottleneck — acquisition, conversion, or retention — and get a playbook to fix it." },
    ],
  },
  {
    label: "Raise",
    color: "text-sage-400",
    tools: [
      { href: "/investor",  icon: Star,             label: "Investor Ready", desc: "Get scored on 6 investor criteria, see what's missing, and leave with a 30-day prep checklist." },
      { href: "/funding",   icon: CircleDollarSign, label: "Funding Finder", desc: "Tell us where you are and what you do — get matched to real grants, accelerators, and investors with direct links to apply." },
    ],
  },
];

const HOW_IT_WORKS = [
  { icon: MessageSquare, step: "1", title: "Have a conversation", desc: "Each tool asks focused questions — no forms, no jargon. Just describe your business naturally." },
  { icon: Zap,           step: "2", title: "Get expert output",   desc: "The AI turns your answers into professional deliverables: decks, models, plans, and funding reports." },
  { icon: Download,      step: "3", title: "Download and act",    desc: "Export as PPTX or Excel, or copy your plan. Everything is built to be used, not just read." },
];

interface Props { isSignedIn: boolean; }

export function HomeClient({ isSignedIn }: Props) {
  const ctaHref = isSignedIn ? "/dashboard" : "/login";

  return (
    <div className="min-h-screen bg-field-950 text-field-200 selection:bg-sage-600/30">

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
        className="flex items-center justify-between px-6 py-5 mx-auto max-w-5xl"
      >
        <span className="font-serif text-base font-semibold tracking-tight text-field-100">Folio</span>
        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <Link href="/dashboard" className="text-sm text-field-400 hover:text-field-100 transition-colors">
              Dashboard <ArrowRight className="inline h-3 w-3" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-field-600 hover:text-field-300 transition-colors">Sign in</Link>
              <Link href="/login"
                className="rounded-lg bg-sage-400 px-4 py-1.5 text-sm font-medium text-field-950 hover:bg-sage-300 transition-colors">
                Get started free
              </Link>
            </>
          )}
        </div>
      </motion.nav>

      {/* Hero */}
      <motion.section
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        initial="hidden" animate="show"
        className="px-6 pt-16 pb-20 text-center mx-auto max-w-3xl"
      >
        <motion.p variants={fade}
          className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-field-800 bg-field-900 px-3 py-1 text-xs text-field-500">
          Built for founders in emerging markets
        </motion.p>
        <motion.h1 variants={fade}
          className="font-serif text-4xl font-semibold leading-[1.15] text-field-100 sm:text-5xl">
          Your AI co-pilot for<br />
          <span className="text-sage-400">building and funding</span><br />
          your business.
        </motion.h1>
        <motion.p variants={fade} className="mt-5 text-base leading-relaxed text-field-500 max-w-lg mx-auto">
          Professional pitch decks, financial models, growth strategies, and funding opportunities — the kind of guidance that used to cost thousands, now in one conversation.
        </motion.p>
        <motion.div variants={fade} className="mt-8 flex items-center justify-center gap-4">
          <Link href={ctaHref}
            className="inline-flex items-center gap-2 rounded-lg bg-sage-400 px-6 py-2.5 text-sm font-semibold text-field-950 hover:bg-sage-300 transition-colors">
            Start for free <ArrowRight className="h-4 w-4" />
          </Link>
          <span className="text-xs text-field-700">No credit card required</span>
        </motion.div>
      </motion.section>

      {/* How it works */}
      <section className="px-6 pb-20 mx-auto max-w-4xl">
        <p className="mb-8 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-field-700">How it works</p>
        <div className="grid gap-px bg-field-800 rounded-2xl overflow-hidden border border-field-800 sm:grid-cols-3">
          {HOW_IT_WORKS.map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="bg-field-950 p-6 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-field-800 bg-field-900 text-[10px] font-semibold text-field-600">{step}</span>
                <Icon className="h-4 w-4 text-field-600" />
              </div>
              <p className="text-sm font-medium text-field-200">{title}</p>
              <p className="text-xs leading-relaxed text-field-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tools */}
      <section className="px-6 pb-24 mx-auto max-w-5xl space-y-10">
        <p className="text-center text-[10px] font-medium uppercase tracking-[0.2em] text-field-700">What&apos;s inside</p>
        {SECTIONS.map(({ label, color, tools }) => (
          <div key={label}>
            <p className={`mb-3 text-xs font-semibold uppercase tracking-widest ${color}`}>{label}</p>
            <div className="grid gap-px bg-field-800 rounded-2xl overflow-hidden border border-field-800 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map(({ href, icon: Icon, label: toolLabel, desc }) => (
                <Link
                  key={href}
                  href={isSignedIn ? href : `/login?callbackUrl=${href}`}
                  className="group flex flex-col gap-4 bg-field-950 p-6 hover:bg-field-900 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-4 w-4 text-field-600 group-hover:text-sage-400 transition-colors" />
                    <ArrowRight className="h-3 w-3 text-field-800 group-hover:text-field-500 transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-field-300 group-hover:text-field-100 transition-colors">{toolLabel}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-field-600">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Bottom CTA */}
      <section className="px-6 pb-24 text-center">
        <div className="mx-auto max-w-md rounded-2xl border border-field-800 bg-field-900/50 px-8 py-10 space-y-4">
          <p className="font-serif text-2xl font-semibold text-field-100">Ready to get started?</p>
          <p className="text-sm text-field-500">Sign in with Google — free, no card needed. 10 conversations to try everything.</p>
          <Link href={ctaHref}
            className="inline-flex items-center gap-2 rounded-lg bg-sage-400 px-6 py-2.5 text-sm font-semibold text-field-950 hover:bg-sage-300 transition-colors">
            Start for free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-field-800/40 px-6 py-5 text-center text-xs text-field-800">
        Folio © {new Date().getFullYear()} · Built for emerging market founders
      </footer>
    </div>
  );
}
