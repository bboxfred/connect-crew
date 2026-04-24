import Link from "next/link";
import { Sparkles, ArrowRight, Send } from "lucide-react";
import { WarmthBar } from "@/components/warmth-bar";

// ─── Master Connect — landing page section ───────────────────────────────
// A static showcase of the Master Connect query experience on the homepage.
// Shows a sample query + 3 candidate cards to demonstrate what the Chief
// does without requiring a live Claude call. Sits between CueBranching and
// the tier ladder.

const PLUM = "var(--plum)";

export function MasterConnectLanding() {
  return (
    <section className="border-t border-[var(--border)] mx-auto w-full max-w-7xl px-6 py-24 md:py-28">
      {/* Section intro */}
      <div className="max-w-3xl mb-14">
        <div
          className="font-mono text-xs tracking-widest uppercase mb-6 flex items-center gap-2"
          style={{ color: PLUM }}
        >
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
          The Chief · 00
        </div>
        <h2 className="font-editorial text-3xl md:text-5xl leading-[1.05] tracking-tight">
          Meet <span style={{ color: PLUM }}>Master Connect</span>.
          <br />
          Ask the graph, in plain English.
        </h2>
        <p className="mt-6 text-base md:text-lg text-[var(--muted-strong)] leading-relaxed max-w-2xl">
          Five specialists keep your graph current. One Chief lets anyone on
          the team — or across a whole portfolio — ask it anything. Ranked
          answers, with reasoning, in under 5 seconds.
        </p>
      </div>

      {/* Static demo card */}
      <div
        className="rounded-3xl border-2 overflow-hidden relative max-w-5xl mx-auto"
        style={{
          borderColor: `color-mix(in srgb, ${PLUM} 30%, transparent)`,
          backgroundColor: `color-mix(in srgb, ${PLUM} 3%, white)`,
          boxShadow: `0 1px 0 rgba(26,24,22,0.03), 0 32px 80px -24px color-mix(in srgb, ${PLUM} 28%, transparent)`,
        }}
      >
        {/* Plum glow accents */}
        <div
          aria-hidden
          className="absolute -top-24 -right-20 h-64 w-64 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: PLUM }}
        />
        <div
          aria-hidden
          className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: PLUM }}
        />

        <div className="relative p-6 md:p-8">
          {/* Query line */}
          <div className="flex items-start gap-3 rounded-2xl border-2 bg-white p-4 md:p-5 mb-6"
            style={{ borderColor: `color-mix(in srgb, ${PLUM} 25%, transparent)` }}
          >
            <Sparkles
              className="h-5 w-5 mt-1 shrink-0"
              strokeWidth={1.75}
              style={{ color: PLUM }}
            />
            <div className="flex-1 min-w-0">
              <div
                className="font-editorial text-lg md:text-2xl leading-snug tracking-tight"
                style={{ fontWeight: 500 }}
              >
                Who on my team has warm contacts at Sequoia SEA?
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                Scope · shared team graph · 4 teammates · 847 contacts
              </div>
            </div>
            <div
              className="shrink-0 rounded-full px-4 h-10 flex items-center gap-1.5 text-sm font-medium text-white"
              style={{ backgroundColor: PLUM }}
              aria-hidden
            >
              Ask
              <Send className="h-3.5 w-3.5" strokeWidth={2} />
            </div>
          </div>

          {/* Answer card */}
          <div
            className="rounded-2xl bg-white p-5 md:p-6 mb-5"
            style={{
              borderTop: `3px solid ${PLUM}`,
              border: "1px solid var(--border)",
              borderTopWidth: 3,
              borderTopColor: PLUM,
            }}
          >
            <div
              className="font-mono text-[10px] uppercase tracking-widest mb-3"
              style={{ color: PLUM }}
            >
              Master Connect · teams · 2,847 ms
            </div>
            <p className="font-editorial text-lg md:text-2xl leading-snug tracking-tight text-[var(--ink)]">
              Three candidates across the team. Priya (owned by you, Warmth 86)
              is the hottest direct path. Karen is Sarah&apos;s strongest Sequoia
              China contact.
            </p>
            <div className="mt-4 pt-4 border-t border-[var(--hairline)] text-sm text-[var(--muted-strong)] leading-relaxed">
              <span
                className="font-mono text-[10px] uppercase tracking-widest mr-2"
                style={{ color: PLUM }}
              >
                Reasoning
              </span>
              Ranked by warmth × recency × company match. Priya&apos;s{" "}
              <span className="font-mono">Hi!!</span> from 6 hours ago gave her
              a decisive edge. Sarah&apos;s Karen Chen contact (Sequoia China)
              offers a lateral path if APAC-China access matters more than
              SEA-specific reach.
            </div>
          </div>

          {/* 3 candidate cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <DemoCandidate
              name="Priya Raghavan"
              company="Sequoia SEA · Partner"
              warmth={86}
              owner="you"
              last="6h ago"
              why="Hi!! 6h ago + 2-min reply. Warmth 86 (hot). Direct TOKEN2049 context."
              action="Draft an intro"
            />
            <DemoCandidate
              name="Karen Chen"
              company="Sequoia China · Associate"
              warmth={71}
              owner="Sarah"
              last="3d ago"
              why="Sarah's contact via Tokyo ABA circuit. APAC-wide role. Warmth 71."
              action="Request intro"
            />
            <DemoCandidate
              name="Jamal Idris"
              company="Outlier Ventures (Seq LP)"
              warmth={44}
              owner="you"
              last="83d silent"
              why="Indirect Sequoia path via LP relationship. Cold but viable if reactivated."
              action="Re-engage"
            />
          </div>

          {/* CTA row */}
          <div className="mt-7 pt-5 border-t border-[var(--hairline)] flex items-center justify-between flex-wrap gap-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
              Same query. Three scales.{" "}
              <span style={{ color: PLUM }}>Personal</span> · team ·{" "}
              <span style={{ color: PLUM }}>ecosystem</span>.
            </div>
            <Link
              href="/app/master-connect"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: PLUM }}
            >
              Open Master Connect
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoCandidate({
  name,
  company,
  warmth,
  owner,
  last,
  why,
  action,
}: {
  name: string;
  company: string;
  warmth: number;
  owner: string;
  last: string;
  why: string;
  action: string;
}) {
  return (
    <article
      className="rounded-2xl border border-[var(--border)] bg-white p-4 flex flex-col gap-3"
      style={{ minHeight: 180 }}
    >
      <div>
        <div className="font-medium text-[var(--foreground)] leading-tight">
          {name}
        </div>
        <div className="font-mono text-[11px] text-[var(--muted)] truncate mt-0.5">
          {company}
        </div>
      </div>
      <div className="w-full">
        <WarmthBar score={warmth} />
      </div>
      <p className="text-sm text-[var(--muted-strong)] leading-relaxed flex-1">
        {why}
      </p>
      <div className="flex items-center justify-between pt-3 border-t border-[var(--hairline)]">
        <div className="font-mono text-[10px] text-[var(--muted)]">
          owned by {owner} · {last}
        </div>
        <span
          className="font-mono text-[10px] uppercase tracking-wider rounded-full px-2.5 py-1 text-white"
          style={{ backgroundColor: PLUM }}
        >
          {action}
        </span>
      </div>
    </article>
  );
}
