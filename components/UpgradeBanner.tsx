"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

interface Props {
  planLabel: string;
}

export function UpgradeBanner({ planLabel }: Props) {
  const router  = useRef(useRouter());
  const removed = useRef(false);

  // Strip ?upgraded=true from the URL after a short delay so a page
  // refresh doesn't show the banner again.
  useEffect(() => {
    if (removed.current) return;
    removed.current = true;

    const timer = setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.delete("upgraded");
      url.searchParams.delete("plan");
      router.current.replace(url.pathname + (url.search || ""), { scroll: false });
    }, 4000); // let the user read it first

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-start gap-3 rounded-xl border border-sage-500/40 bg-sage-600/10 px-5 py-4">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sage-400" />
      <div>
        <p className="text-sm font-medium text-field-100">
          You&apos;re now on <span className="text-sage-400">{planLabel}</span>.
        </p>
        <p className="mt-0.5 text-xs text-field-500">
          Enjoy unlimited access. Your upgraded features are active right now.
        </p>
      </div>
    </div>
  );
}
