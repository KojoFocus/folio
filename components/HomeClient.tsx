"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Presentation, Search, TrendingUp, Megaphone, Compass, Star, ArrowRight, Rocket, CircleDollarSign,
} from "lucide-react";

const TOOLS = [
  { href: "/build",     icon: Presentation,     label: "Pitch Deck",         desc: "Build an investor-grade deck from your idea." },
  { href: "/review",    icon: Search,           label: "Deck Review",        desc: "Honest VC feedback on your existing deck." },
  { href: "/financial", icon: TrendingUp,       label: "Financial Model",    desc: "3-year projections in plain language." },
  { href: "/marketing", icon: Megaphone,        label: "Marketing Plan",     desc: "90-day go-to-market with channels and KPIs." },
  { href: "/strategy",  icon: Compass,          label: "Business Strategy",  desc: "The 2–3 moves that will change your trajectory." },
  { href: "/investor",  icon: Star,             label: "Investor Readiness", desc: "Know exactly where you stand before you pitch." },
  { href: "/growth",    icon: Rocket,           label: "Growth Strategy",    desc: "Find the levers that move revenue and retention." },
  { href: "/funding",   icon: CircleDollarSign, label: "Funding Finder",     desc: "Matched grants and investors for your location and stage." },
];

const fade = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0 },
};

interface Props {
  isSignedIn: boolean;
}

export function HomeClient({ isSignedIn }: Props) {
  return (
    <div className="min-h-screen bg-field-950 text-field-200 selection:bg-sage-600/30">
      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between px-6 py-5"
      >
        <span className="font-serif text-base font-semibold tracking-tight text-field-100">Folio</span>
        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <Link href="/dashboard"
              className="text-sm text-field-400 hover:text-field-100 transition-colors">
              Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-field-600 hover:text-field-300 transition-colors">
                Sign in
              </Link>
              <Link href="/login"
                className="rounded-lg border border-field-700 px-3.5 py-1.5 text-sm text-field-300 hover:border-field-500 hover:text-field-100 transition-colors">
                Get started
              </Link>
            </>
          )}
        </div>
      </motion.nav>

      {/* Hero */}
      <motion.section
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="show"
        className="px-6 pt-20 pb-16 text-center"
      >
        <motion.p variants={fade} className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-field-600">
          Business tools for founders
        </motion.p>
        <motion.h1 variants={fade}
          className="font-serif text-4xl font-semibold leading-[1.15] text-field-100 sm:text-5xl">
          Everything you need
          <br />
          <span className="text-field-500">to move faster.</span>
        </motion.h1>
        <motion.p variants={fade} className="mt-5 text-sm leading-relaxed text-field-600 max-w-sm mx-auto">
          Six focused tools. Each one does exactly one thing — and does it well.
        </motion.p>
        <motion.div variants={fade} className="mt-8">
          <Link
            href={isSignedIn ? "/dashboard" : "/login"}
            className="inline-flex items-center gap-2 rounded-lg bg-sage-400 px-5 py-2.5 text-sm font-medium text-field-950 hover:bg-sage-300 transition-colors"
          >
            Start free <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </motion.section>

      {/* Tools */}
      <motion.section
        variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } } }}
        initial="hidden"
        animate="show"
        className="px-6 pb-24"
      >
        <div className="mx-auto max-w-4xl grid gap-px bg-field-800 rounded-2xl overflow-hidden border border-field-800 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map(({ href, icon: Icon, label, desc }) => (
            <motion.div key={href} variants={fade}>
              <Link
                href={href}
                className="group flex flex-col gap-4 bg-field-950 p-6 hover:bg-field-900 transition-colors h-full"
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-4 w-4 text-field-600 group-hover:text-sage-400 transition-colors" />
                  <ArrowRight className="h-3 w-3 text-field-800 group-hover:text-field-500 transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-medium text-field-300 group-hover:text-field-100 transition-colors">
                    {label}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-field-600">{desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-field-800/40 px-6 py-5 text-center text-xs text-field-800">
        Folio © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
