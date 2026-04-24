"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Send,
  User2,
  RefreshCw,
  MessageSquareShare,
  Clock,
  Shield,
} from "lucide-react";
import { useViewMode, type ViewMode } from "@/components/view-mode-provider";
import { WarmthBar } from "@/components/warmth-bar";
import { fixtureTeammates } from "@/lib/fixtures";

// ─── Master Connect (the Chief) ──────────────────────────────────────────
// Natural-language query over the graph. Scope changes with ViewMode:
//   Personal   → your graph
//   Teams      → shared team graph
//   Enterprise → ecosystem directory (portco-level metadata only)

const PLUM = "var(--plum)";

// Mode-specific example queries that cycle in the placeholder.
const EXAMPLES: Record<ViewMode, string[]> = {
  personal: [
    "Who should I re-engage this week?",
    "Who are my hottest contacts at TOKEN2049?",
    "Which contacts have drifted past 30 days?",
    "Top 5 VCs in my graph by warmth",
  ],
  teams: [
    "Who on the team has warm contacts at Sequoia SEA?",
    "Which teammate last spoke to someone at METI Japan?",
    "Find duplicate-touch risks across this week's drafts",
    "Top warm contacts across the whole team",
  ],
  enterprise: [
    "Which portcos have warm contacts at Stripe?",
    "Which fintech portcos are drifting?",
    "Best portco to intro Santander's LATAM partnership team",
    "Ecosystem health across verticals this quarter",
  ],
};

const MODE_LABEL: Record<ViewMode, string> = {
  personal: "Personal graph",
  teams: "Shared team graph",
  enterprise: "Ecosystem directory",
};

type Candidate = {
  contact_id: string | null;
  name: string;
  company: string;
  warmth_score: number | null;
  owner: string;
  last_interaction: string | null;
  why: string;
  suggested_action: "draft_intro" | "re_engage" | "review" | "none";
};

type MasterConnectResponse = {
  summary: string;
  candidates: Candidate[];
  reasoning: string;
  omitted_red: number;
  mode: ViewMode;
  elapsed_ms: number;
};

type RecentQuery = {
  id: string;
  query: string;
  mode: ViewMode;
  summary: string;
  when: string;
};

export default function MasterConnectPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MasterConnectInner />
    </Suspense>
  );
}

function MasterConnectInner() {
  const { mode } = useViewMode();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<MasterConnectResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<RecentQuery[]>(SEED_RECENT);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Cycle the placeholder every 4s when input is empty
  useEffect(() => {
    if (query) return;
    const i = setInterval(() => {
      setPlaceholderIdx((v) => (v + 1) % EXAMPLES[mode].length);
    }, 4000);
    return () => clearInterval(i);
  }, [query, mode]);

  // Hydrate from ?q= URL param (used by dashboard/landing entry points)
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && q !== query) {
      setQuery(q);
      // Fire immediately
      setTimeout(() => doQuery(q), 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const doQuery = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/master-connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trimmed, mode }),
        });
        const data = (await res.json()) as MasterConnectResponse;
        if (!res.ok) {
          setError(data.reasoning || "Master Connect returned an error.");
        }
        setResponse(data);
        setRecent((prev) =>
          [
            {
              id: `r${Date.now()}`,
              query: trimmed,
              mode,
              summary: data.summary || "—",
              when: "just now",
            },
            ...prev,
          ].slice(0, 6),
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Network error.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [mode],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doQuery(query);
  };

  const onExampleClick = (example: string) => {
    setQuery(example);
    setTimeout(() => doQuery(example), 30);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-10">
      {/* Header */}
      <header className="anim-fade-up">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded"
            style={{
              backgroundColor: `color-mix(in srgb, ${PLUM} 14%, white)`,
              color: PLUM,
            }}
          >
            The Chief · 00
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
            Scope: {MODE_LABEL[mode]}
          </span>
        </div>
        <h1
          className="font-editorial text-4xl md:text-5xl lg:text-6xl tracking-tight"
          style={{ fontWeight: 700, letterSpacing: "-0.025em" }}
        >
          Ask the graph.
        </h1>
        <p className="mt-3 text-[var(--muted-strong)] max-w-2xl leading-relaxed">
          Master Connect reads your{" "}
          {mode === "enterprise"
            ? "ecosystem directory (aggregate metadata only — individual contacts stay private to each portco)"
            : mode === "teams"
              ? "shared team graph across 4 teammates"
              : "personal graph of 30 contacts across 5 channels"}{" "}
          and answers questions with ranked, reasoned candidates. Every answer
          shows its reasoning trail.
        </p>
      </header>

      {/* Query hero */}
      <form
        onSubmit={onSubmit}
        className="rounded-3xl border-2 p-5 md:p-6 anim-fade-up"
        style={{
          borderColor: `color-mix(in srgb, ${PLUM} 35%, transparent)`,
          backgroundColor: "var(--surface)",
          animationDelay: "0.05s",
          boxShadow: `0 1px 0 rgba(26,24,22,0.03), 0 24px 60px -24px color-mix(in srgb, ${PLUM} 30%, transparent)`,
        }}
      >
        <div className="flex items-start gap-3">
          <Sparkles
            className="h-5 w-5 mt-2 shrink-0"
            strokeWidth={1.75}
            style={{ color: PLUM }}
          />
          <textarea
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                doQuery(query);
              }
            }}
            placeholder={EXAMPLES[mode][placeholderIdx]}
            rows={2}
            className="flex-1 resize-none bg-transparent border-0 outline-none font-editorial text-xl md:text-2xl leading-snug tracking-tight text-[var(--foreground)] placeholder:text-[var(--muted)]"
            style={{ fontWeight: 500 }}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="shrink-0 rounded-full px-5 h-11 flex items-center gap-2 text-sm font-medium text-white transition-opacity disabled:opacity-40 hover:opacity-90"
            style={{ backgroundColor: PLUM }}
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" strokeWidth={2} />
                Thinking
              </>
            ) : (
              <>
                Ask
                <Send className="h-4 w-4" strokeWidth={2} />
              </>
            )}
          </button>
        </div>

        {/* Example chips */}
        {!response && !loading ? (
          <div className="mt-5 pt-5 border-t border-[var(--hairline)]">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">
              Try one of these
            </div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES[mode].map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => onExampleClick(ex)}
                  className="font-mono text-[11px] rounded-full px-3 py-1.5 border text-[var(--muted-strong)] hover:text-[var(--foreground)] transition-colors"
                  style={{
                    borderColor: `color-mix(in srgb, ${PLUM} 20%, transparent)`,
                    backgroundColor: `color-mix(in srgb, ${PLUM} 4%, white)`,
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </form>

      {/* Error banner */}
      {error ? (
        <div
          className="rounded-2xl border p-4 text-sm leading-relaxed anim-fade-up"
          style={{
            borderColor: "color-mix(in srgb, var(--warmth-hot) 30%, transparent)",
            backgroundColor: "color-mix(in srgb, var(--warmth-hot) 8%, white)",
            color: "var(--warmth-hot)",
          }}
        >
          {error}
        </div>
      ) : null}

      {/* Response */}
      {response ? (
        <section className="anim-fade-up space-y-6" style={{ animationDelay: "0.1s" }}>
          <div
            className="rounded-2xl border p-6 md:p-7"
            style={{
              borderTopWidth: 3,
              borderTopColor: PLUM,
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <div
              className="font-mono text-[10px] uppercase tracking-widest mb-3"
              style={{ color: PLUM }}
            >
              Master Connect · {response.mode} · {response.elapsed_ms}ms
            </div>
            <p className="font-editorial text-xl md:text-2xl leading-snug tracking-tight text-[var(--ink)]">
              {response.summary || "No summary returned."}
            </p>
            {response.reasoning ? (
              <p className="mt-4 pt-4 border-t border-[var(--hairline)] text-sm text-[var(--muted-strong)] leading-relaxed">
                <span
                  className="font-mono text-[10px] uppercase tracking-widest mr-2"
                  style={{ color: PLUM }}
                >
                  Reasoning
                </span>
                {response.reasoning}
              </p>
            ) : null}
            {response.omitted_red > 0 ? (
              <div className="mt-3 flex items-center gap-2 text-xs text-[var(--muted)] font-mono">
                <Shield className="h-3.5 w-3.5" strokeWidth={1.75} />
                {response.omitted_red} contact{response.omitted_red === 1 ? "" : "s"} omitted (Red-tier autonomy)
              </div>
            ) : null}
          </div>

          {/* Candidate cards */}
          {response.candidates.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <div
                  className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]"
                >
                  {response.candidates.length} candidate{response.candidates.length === 1 ? "" : "s"}
                </div>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {response.candidates.map((c, i) => (
                  <CandidateCard key={`${c.contact_id || c.name}-${i}`} candidate={c} mode={response.mode} />
                ))}
              </ul>
            </div>
          ) : (
            !error ? (
              <p className="text-center text-[var(--muted-strong)] py-4 font-mono text-xs">
                No candidates — try rephrasing or broadening the query.
              </p>
            ) : null
          )}
        </section>
      ) : null}

      {/* Recent queries rail */}
      <section className="anim-fade-up" style={{ animationDelay: "0.18s" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
            Recent queries
          </div>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recent.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onExampleClick(r.query)}
                className="w-full text-left rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:bg-[var(--paper)]/60 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${PLUM} 10%, white)`,
                      color: PLUM,
                    }}
                  >
                    {r.mode}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--muted)] flex items-center gap-1">
                    <Clock className="h-3 w-3" strokeWidth={1.75} />
                    {r.when}
                  </span>
                </div>
                <div className="text-sm font-medium text-[var(--foreground)] leading-snug">
                  {r.query}
                </div>
                <div className="mt-2 text-xs text-[var(--muted-strong)] leading-relaxed line-clamp-2">
                  {r.summary}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────

function CandidateCard({
  candidate,
  mode,
}: {
  candidate: Candidate;
  mode: ViewMode;
}) {
  const ownerLabel = ownerDisplayName(candidate.owner, mode);
  const actionLabel = ACTION_LABEL[candidate.suggested_action] || "Review";
  const actionColor = ACTION_COLOR[candidate.suggested_action] || PLUM;
  return (
    <li
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-3"
      style={{ minHeight: 160 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium text-[var(--foreground)] leading-tight">
            {candidate.name}
          </div>
          <div className="font-mono text-[11px] text-[var(--muted)] truncate">
            {candidate.company}
          </div>
        </div>
        {candidate.warmth_score !== null && candidate.warmth_score !== undefined ? (
          <div className="shrink-0 w-28">
            <WarmthBar score={candidate.warmth_score} />
          </div>
        ) : null}
      </div>

      <p className="text-sm text-[var(--muted-strong)] leading-relaxed flex-1">
        {candidate.why}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-[var(--hairline)]">
        <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--muted)]">
          <User2 className="h-3 w-3" strokeWidth={1.75} />
          owned by {ownerLabel}
          {candidate.last_interaction ? (
            <>
              <span>·</span>
              <span>{candidate.last_interaction}</span>
            </>
          ) : null}
        </div>
        <Link
          href={candidate.contact_id ? `/app/contacts/${candidate.contact_id}` : "/app/morning-connect"}
          className="font-mono text-[10px] uppercase tracking-wider rounded-full px-3 py-1.5 text-white transition-opacity hover:opacity-90 flex items-center gap-1.5"
          style={{ backgroundColor: actionColor }}
        >
          <MessageSquareShare className="h-3 w-3" strokeWidth={1.75} />
          {actionLabel}
        </Link>
      </div>
    </li>
  );
}

const ACTION_LABEL: Record<Candidate["suggested_action"], string> = {
  draft_intro: "Draft an intro",
  re_engage: "Re-engage",
  review: "Review",
  none: "Open",
};

const ACTION_COLOR: Record<Candidate["suggested_action"], string> = {
  draft_intro: "var(--plum)",
  re_engage: "var(--warmth-warm)",
  review: "var(--muted-strong)",
  none: "var(--muted)",
};

function ownerDisplayName(owner: string, mode: ViewMode): string {
  if (mode === "enterprise") {
    return owner; // portco id from API
  }
  if (owner === "freddy") return "you";
  const teammate = fixtureTeammates.find((t) => t.id === owner);
  return teammate ? teammate.name.split(" ")[0] : owner;
}

const SEED_RECENT: RecentQuery[] = [
  {
    id: "s1",
    query: "Who should I re-engage this week?",
    mode: "personal",
    summary: "6 contacts drifting 30+ days with warmth between 40 and 65 — Marcus Low + Wei Lin Chen highest priority.",
    when: "2h ago",
  },
  {
    id: "s2",
    query: "Who on the team has warm contacts at Sequoia SEA?",
    mode: "teams",
    summary: "Priya Raghavan (Warmth 86) owned by Freddy is hottest. Karen Chen owned by Sarah is the shortest path from Sarah's side.",
    when: "yesterday",
  },
  {
    id: "s3",
    query: "Which fintech portcos have warm Stripe contacts?",
    mode: "enterprise",
    summary: "Kite Commerce (2 warm contacts) and Polygon Labs (3 warm contacts) both in the fintech vertical. Helix Tech has 1 contact via enterprise-SaAS.",
    when: "yesterday",
  },
  {
    id: "s4",
    query: "Top 5 VCs in my graph by warmth",
    mode: "personal",
    summary: "Priya Raghavan (Sequoia SEA · 86), Rashid Nahas (78), Sam Harel (YC · 72), Theo Kostas (Polygon · 70), Jamal Idris (Outlier · 44).",
    when: "3d ago",
  },
];

function PageSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-10">
      <div className="h-12 w-48 rounded bg-[var(--paper)] animate-pulse" />
      <div className="h-40 rounded-3xl bg-[var(--paper)] animate-pulse" />
    </div>
  );
}
