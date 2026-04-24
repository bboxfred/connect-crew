"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Send } from "lucide-react";
import type { ViewMode } from "@/components/view-mode-provider";

// ─── Master Connect Hero ─────────────────────────────────────────────────
// Compact query input surface that lives at the top of each dashboard.
// Submitting routes to /app/master-connect?q=<query> where the full page
// picks up the query and renders the Claude-powered response.
//
// Used on: /app/dashboard, /app/dashboard/teams, /app/dashboard/enterprise

const PLUM = "var(--plum)";

const EXAMPLES: Record<ViewMode, string[]> = {
  personal: [
    "Who should I re-engage this week?",
    "Top 5 VCs in my graph by warmth",
    "Who are my hottest contacts at TOKEN2049?",
    "Which contacts have drifted past 30 days?",
  ],
  teams: [
    "Who on the team has warm contacts at Sequoia SEA?",
    "Top warm contacts across the whole team",
    "Which teammate last spoke to someone at METI Japan?",
    "Find duplicate-touch risks this week",
  ],
  enterprise: [
    "Which portcos have warm contacts at Stripe?",
    "Which fintech portcos are drifting?",
    "Ecosystem health across verticals this quarter",
    "Best portco to intro Santander's LATAM team",
  ],
};

const HEADLINE: Record<ViewMode, string> = {
  personal: "Ask your graph.",
  teams: "Ask the team graph.",
  enterprise: "Ask the ecosystem.",
};

const SCOPE_LABEL: Record<ViewMode, string> = {
  personal: "Personal graph · 30 contacts",
  teams: "Shared team graph · 4 teammates · 847 contacts",
  enterprise: "Ecosystem directory · 14 portcos · 5 verticals",
};

export function MasterConnectHero({ mode }: { mode: ViewMode }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const examples = EXAMPLES[mode];

  // Cycle placeholder every 4s when input is empty
  useEffect(() => {
    if (query) return;
    const i = setInterval(() => {
      setPlaceholderIdx((v) => (v + 1) % examples.length);
    }, 4000);
    return () => clearInterval(i);
  }, [query, examples.length]);

  const go = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    router.push(`/app/master-connect?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section
      className="rounded-3xl border-2 overflow-hidden relative anim-fade-up"
      style={{
        borderColor: `color-mix(in srgb, ${PLUM} 30%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${PLUM} 4%, white)`,
        animationDelay: "0.02s",
      }}
    >
      {/* Plum glow background accent */}
      <div
        aria-hidden
        className="absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ backgroundColor: PLUM }}
      />

      <div className="relative p-5 md:p-6">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded flex items-center gap-1.5"
            style={{
              backgroundColor: `color-mix(in srgb, ${PLUM} 14%, white)`,
              color: PLUM,
            }}
          >
            <Sparkles className="h-3 w-3" strokeWidth={1.75} />
            Master Connect
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
            {SCOPE_LABEL[mode]}
          </span>
        </div>

        <h2
          className="font-editorial text-2xl md:text-3xl tracking-tight mb-4"
          style={{ fontWeight: 700, letterSpacing: "-0.025em" }}
        >
          {HEADLINE[mode]}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            go(query);
          }}
          className="flex items-start gap-3 rounded-2xl border-2 bg-[var(--surface)] p-3 md:p-4"
          style={{
            borderColor: `color-mix(in srgb, ${PLUM} 25%, transparent)`,
          }}
        >
          <Sparkles
            className="h-5 w-5 mt-1.5 shrink-0"
            strokeWidth={1.75}
            style={{ color: PLUM }}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={examples[placeholderIdx]}
            className="flex-1 bg-transparent border-0 outline-none font-editorial text-base md:text-lg leading-snug tracking-tight text-[var(--foreground)] placeholder:text-[var(--muted)]"
            style={{ fontWeight: 500 }}
          />
          <button
            type="submit"
            disabled={!query.trim()}
            className="shrink-0 rounded-full px-4 h-10 flex items-center gap-1.5 text-sm font-medium text-white transition-opacity disabled:opacity-40 hover:opacity-90"
            style={{ backgroundColor: PLUM }}
          >
            Ask
            <Send className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mr-1">
            try
          </span>
          {examples.slice(0, 3).map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => go(ex)}
              className="font-mono text-[10px] rounded-full px-2.5 py-1 border text-[var(--muted-strong)] hover:text-[var(--foreground)] transition-colors"
              style={{
                borderColor: `color-mix(in srgb, ${PLUM} 18%, transparent)`,
                backgroundColor: "white",
              }}
            >
              {ex}
            </button>
          ))}
          <a
            href="/app/master-connect"
            className="ml-auto font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1"
          >
            Open full Master Connect
            <ArrowRight className="h-3 w-3" strokeWidth={1.75} />
          </a>
        </div>
      </div>
    </section>
  );
}
