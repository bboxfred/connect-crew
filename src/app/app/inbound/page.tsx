"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Check,
  X as XIcon,
  Inbox,
  Send,
  Info,
  Sparkles,
  Loader2,
} from "lucide-react";
import { CREW } from "@/lib/fixtures";

/**
 * Mailbox (/app/inbound) — cold-email qualification + retro-import shell.
 *
 * Pattern mirrors Messenger: header + connection state + rule matrix +
 * live classification card with Simulate controls. Fixture-backed for
 * the demo; real Gmail retro-import + ICP classifier is post-beta.
 */

const icpRules = [
  {
    id: "r1",
    label: "Operator at a Series A/B tech company",
    delta: 6,
    active: true,
  },
  {
    id: "r2",
    label: "Journalist or analyst from a known outlet",
    delta: 4,
    active: true,
  },
  {
    id: "r3",
    label: "Founder-to-founder reach-out with mutual connection",
    delta: 5,
    active: true,
  },
  { id: "r4", label: "Recruiter for a role not my function", delta: -4, active: true },
  { id: "r5", label: "Generic sales demo · no personalisation", delta: -6, active: true },
  {
    id: "r6",
    label: "Mentions a specific thing I wrote or built",
    delta: 5,
    active: true,
  },
];

type InboundExample = {
  id: string;
  from: string;
  company: string;
  subject: string;
  snippet: string;
  verdict: "qualified" | "decline" | "auto_dismiss";
  reasoning: string;
  draft: string | null;
  sentAt: string;
};

const examples: InboundExample[] = [
  {
    id: "ex1",
    from: "Hassan Okafor",
    company: "Blockworks",
    subject: "Quick quote on SEA founder network effects?",
    snippet:
      "Hi Freddy — working on a piece on SEA founder network effects. Saw your TOKEN2049 post and wanted 2-3 sentences from you by Friday…",
    verdict: "qualified",
    reasoning:
      "Journalist · known outlet · short specific ask with a deadline. Matches ICP rule: 'Journalist or analyst from a known outlet'. Warmth +4.",
    draft:
      "Hi Hassan — happy to contribute. Can you send the angle and the word count? I can turn around 2–3 sentences by Friday — probably better over email than a call for a tight quote.\n\nFreddy",
    sentAt: "2h ago",
  },
  {
    id: "ex2",
    from: "Jamie Park",
    company: "Atlas Recruiting",
    subject: "Head of Operations role at Series B fintech",
    snippet:
      "Hi there — we have an exciting VP Ops opportunity at a high-growth Series B fintech. Base $250k, 0.3% equity. Are you open to a chat?…",
    verdict: "decline",
    reasoning:
      "Recruiter for a role outside my function. Matches 'Recruiter for a role not my function' (-4). Polite decline drafted — no rudeness, no door-closing.",
    draft:
      "Hi Jamie — appreciate you thinking of me. I'm heads-down on my own thing right now so not the right fit, but good luck with the search.\n\nFreddy",
    sentAt: "5h ago",
  },
  {
    id: "ex3",
    from: "noreply@growthsaas.io",
    company: "GrowthSaaS (auto)",
    subject: "Double your LinkedIn leads this week with AI",
    snippet:
      "Hi there, my AI tool will 10x your LinkedIn outreach overnight. 1,000+ founders already using it. Can I send you a 5-min demo video?…",
    verdict: "auto_dismiss",
    reasoning:
      "Generic sales demo · no personalisation · automation-signal in sender domain. Matches 'Generic sales demo' (-6). Auto-dismissed without drafting.",
    draft: null,
    sentAt: "yesterday",
  },
  {
    id: "ex4",
    from: "Maya Okonkwo",
    company: "Polygon Labs",
    subject: "Loved your ABA talk — want to chat about Asia expansion",
    snippet:
      "Hey Fred! Marcus from Kite connected us on Telegram last week — saw your ABA talk on SEA compliance. We're mapping out Polygon's Asia GTM and would love your read…",
    verdict: "qualified",
    reasoning:
      "Founder-adjacent operator · mutual via Marcus (warm graph path) · references specific talk. Matches 'Mentions a specific thing I wrote or built' (+5) + mutual-connection rule (+5). Warmth +10, clamped +6.",
    draft:
      "Hey Maya! Great to hear from you via Marcus. Happy to swap notes — I have real views on what's working and what isn't in SEA compliance right now. Got 30 min Thursday or Friday? Either works.\n\nFreddy",
    sentAt: "1h ago",
  },
];

export default function InboundPage() {
  const crew = CREW.inbound;
  const [selectedId, setSelectedId] = useState<string>("ex1");
  const [simulating, setSimulating] = useState(false);

  const selected = examples.find((e) => e.id === selectedId) ?? examples[0];

  async function runSimulate() {
    setSimulating(true);
    // Purely decorative — mimics a ~1.5s classifier roundtrip then picks
    // a different example to foreground.
    await new Promise((r) => setTimeout(r, 1200));
    const others = examples.filter((e) => e.id !== selectedId);
    setSelectedId(others[Math.floor(Math.random() * others.length)].id);
    setSimulating(false);
  }

  const stats = {
    qualified: examples.filter((e) => e.verdict === "qualified").length,
    declined: examples.filter((e) => e.verdict === "decline").length,
    dismissed: examples.filter((e) => e.verdict === "auto_dismiss").length,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <Link
        href="/app/dashboard"
        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
      >
        <ArrowLeft className="h-3 w-3" strokeWidth={1.75} />
        Dashboard
      </Link>

      {/* Header */}
      <header className="anim-fade-up">
        <div
          className="font-mono text-[10px] uppercase tracking-widest mb-3"
          style={{ color: crew.color }}
        >
          Crew · 03 · Mailbox
        </div>
        <h1
          className="font-editorial text-4xl md:text-5xl tracking-tight"
          style={{ fontWeight: 700, letterSpacing: "-0.025em" }}
        >
          Mailbox qualifies cold emails.
        </h1>
        <p className="mt-4 text-[var(--muted-strong)] max-w-2xl leading-relaxed text-base md:text-lg">
          {crew.role} Runs every cold inbound against your ICP rules. Drafts a
          warm &apos;yes&apos; for the good ones, a polite &apos;no&apos; for the mis-matches,
          auto-dismisses the obvious spam. Never auto-books a meeting — your
          time stays yours.
        </p>
      </header>

      {/* Gmail connection + stats */}
      <section
        className="grid grid-cols-1 md:grid-cols-3 gap-3 anim-fade-up"
        style={{ animationDelay: "0.06s" }}
      >
        <div
          className="rounded-2xl border p-5 flex items-center gap-3"
          style={{
            borderColor: `color-mix(in srgb, ${crew.color} 30%, transparent)`,
            backgroundColor: `color-mix(in srgb, ${crew.color} 6%, white)`,
          }}
        >
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `color-mix(in srgb, ${crew.color} 18%, white)`,
              color: crew.color,
            }}
          >
            <Mail className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <div
              className="font-editorial text-base tracking-tight"
              style={{ fontWeight: 700 }}
            >
              Gmail
            </div>
            <div className="font-mono text-[11px] text-[var(--muted)] truncate">
              fred@collecter.club · connected
            </div>
          </div>
          <div
            className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white shrink-0"
            style={{ backgroundColor: "var(--sage)" }}
          >
            <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
            Live
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 grid grid-cols-3 gap-2">
          <Stat label="Qualified" value={stats.qualified} color={crew.color} />
          <Stat
            label="Declined"
            value={stats.declined}
            color="var(--muted-strong)"
          />
          <Stat
            label="Dismissed"
            value={stats.dismissed}
            color="var(--muted)"
          />
        </div>

        <div
          className="rounded-2xl border p-5"
          style={{
            borderColor: `color-mix(in srgb, var(--gold) 30%, transparent)`,
            backgroundColor: `color-mix(in srgb, var(--gold) 6%, white)`,
          }}
        >
          <div
            className="font-mono text-[10px] uppercase tracking-widest mb-1"
            style={{ color: "var(--gold)" }}
          >
            Retro-import
          </div>
          <div className="font-mono text-xs text-[var(--muted-strong)] leading-relaxed">
            90 days of Gmail history · 1,247 threads scanned · 34 contacts
            re-classified · 12 Warmth adjustments
          </div>
        </div>
      </section>

      {/* ICP rules */}
      <section
        className="rounded-2xl border bg-[var(--surface)] overflow-hidden anim-fade-up"
        style={{
          animationDelay: "0.1s",
          borderColor: `color-mix(in srgb, ${crew.color} 25%, transparent)`,
        }}
      >
        <header
          className="px-5 md:px-6 py-4 border-b"
          style={{
            borderColor: `color-mix(in srgb, ${crew.color} 18%, transparent)`,
            backgroundColor: `color-mix(in srgb, ${crew.color} 5%, white)`,
          }}
        >
          <div
            className="font-mono text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1.5"
            style={{ color: crew.color }}
          >
            <Sparkles className="h-3 w-3" strokeWidth={1.75} />
            Your ICP rules · {icpRules.length} active
          </div>
          <div
            className="font-editorial text-lg tracking-tight"
            style={{ fontWeight: 700 }}
          >
            What counts as a good inbound.
          </div>
        </header>
        <ul className="divide-y divide-[var(--hairline)]">
          {icpRules.map((r) => {
            const pos = r.delta > 0;
            return (
              <li
                key={r.id}
                className="px-5 md:px-6 py-3 flex items-center gap-3"
              >
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: pos
                      ? `color-mix(in srgb, var(--warmth-hot) 14%, white)`
                      : `color-mix(in srgb, var(--warmth-cold) 14%, white)`,
                    color: pos
                      ? "var(--warmth-hot)"
                      : "var(--warmth-cold)",
                  }}
                >
                  {pos ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ) : (
                    <XIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
                  )}
                </div>
                <span className="flex-1 text-sm text-[var(--foreground)] leading-snug">
                  {r.label}
                </span>
                <span
                  className="font-mono text-xs tabular-nums px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: pos
                      ? `color-mix(in srgb, var(--warmth-hot) 12%, white)`
                      : `color-mix(in srgb, var(--warmth-cold) 12%, white)`,
                    color: pos
                      ? "var(--warmth-hot)"
                      : "var(--warmth-cold)",
                  }}
                >
                  {r.delta > 0 ? `+${r.delta}` : r.delta}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Last classification card with Simulate */}
      <section
        className="rounded-2xl border bg-[var(--surface)] p-5 md:p-6 anim-fade-up"
        style={{
          animationDelay: "0.14s",
          borderColor: "var(--border)",
        }}
      >
        <div className="mb-6 pb-6 border-b border-[var(--hairline)]">
          <div
            className="font-mono text-[10px] uppercase tracking-widest mb-1"
            style={{ color: crew.color }}
          >
            Demo · Simulate an inbound
          </div>
          <h3
            className="font-editorial text-xl md:text-2xl tracking-tight leading-tight mb-2"
            style={{ fontWeight: 700 }}
          >
            Fire a cold inbound → watch Mailbox classify + draft.
          </h3>
          <p className="text-sm text-[var(--muted-strong)] leading-relaxed mb-4 max-w-xl">
            Pick any canned inbound below, or hit <strong>Simulate</strong> to
            cycle to a random example. Mailbox runs it against your ICP rules,
            renders a verdict + drafted reply.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={runSimulate}
              disabled={simulating}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60"
              style={{ backgroundColor: crew.color }}
            >
              {simulating ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              ) : (
                <Sparkles className="h-4 w-4" strokeWidth={2} />
              )}
              Simulate a random inbound
            </button>
            {examples.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setSelectedId(e.id)}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                  e.id === selectedId
                    ? "text-white"
                    : "text-[var(--muted-strong)] hover:text-[var(--foreground)]"
                }`}
                style={
                  e.id === selectedId
                    ? { backgroundColor: crew.color, borderColor: crew.color }
                    : { borderColor: "var(--border)" }
                }
              >
                {e.from.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Email card */}
        <InboundCard example={selected} accentColor={crew.color} />
      </section>

      {/* Roadmap note */}
      <aside
        className="rounded-2xl border p-4 md:p-5 anim-fade-up"
        style={{
          animationDelay: "0.18s",
          borderColor: "color-mix(in srgb, var(--warmth-hot) 35%, transparent)",
          backgroundColor: "color-mix(in srgb, var(--warmth-hot) 7%, white)",
        }}
      >
        <div className="flex items-start gap-3">
          <Info
            className="h-4 w-4 mt-0.5 shrink-0"
            strokeWidth={1.75}
            style={{ color: "var(--warmth-hot)" }}
          />
          <div className="min-w-0">
            <div
              className="font-mono text-[10px] uppercase tracking-widest mb-2"
              style={{ color: "var(--warmth-hot)" }}
            >
              Note to hackathon judges
            </div>
            <p className="text-sm text-[var(--foreground)] leading-relaxed">
              Mailbox here is fixture-backed for the demo. The live path uses
              Composio&apos;s Gmail API to (1) retro-import the last 90 days of
              threads and classify against these ICP rules, (2) watch the
              inbox in real time via webhook and fire a draft into Morning
              Connect when a good-fit lands. Both are built on the same
              Composio pipeline Scanner and Scribe already use.
            </p>
            <div className="mt-3 font-editorial text-sm text-[var(--muted-strong)] italic">
              — Freddy
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div
        className="font-editorial text-2xl md:text-3xl tabular-nums"
        style={{ fontWeight: 800, color }}
      >
        {value}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
        {label}
      </div>
    </div>
  );
}

function InboundCard({
  example,
  accentColor,
}: {
  example: InboundExample;
  accentColor: string;
}) {
  const verdictConfig = {
    qualified: {
      label: "Qualified · draft staged",
      color: "var(--sage)",
      icon: Check,
    },
    decline: {
      label: "Polite decline drafted",
      color: "var(--muted-strong)",
      icon: XIcon,
    },
    auto_dismiss: {
      label: "Auto-dismissed — no draft",
      color: "var(--muted)",
      icon: Inbox,
    },
  }[example.verdict];
  const VerdictIcon = verdictConfig.icon;

  return (
    <div className="space-y-4">
      {/* Email header */}
      <div
        className="rounded-xl border p-4"
        style={{
          borderColor: `color-mix(in srgb, ${verdictConfig.color} 28%, transparent)`,
          backgroundColor: `color-mix(in srgb, ${verdictConfig.color} 4%, white)`,
        }}
      >
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white"
            style={{ backgroundColor: verdictConfig.color }}
          >
            <VerdictIcon className="h-3 w-3" strokeWidth={2.5} />
            {verdictConfig.label}
          </span>
          <span className="font-mono text-[10px] text-[var(--muted)] ml-auto">
            {example.sentAt}
          </span>
        </div>
        <div className="font-editorial text-base md:text-lg leading-snug tracking-tight mt-2">
          {example.subject}
        </div>
        <div className="font-mono text-[11px] text-[var(--muted-strong)] mt-1">
          From · {example.from} · {example.company}
        </div>
        <blockquote
          className="mt-3 text-sm leading-relaxed text-[var(--muted-strong)] border-l-2 pl-3"
          style={{
            borderColor: `color-mix(in srgb, ${verdictConfig.color} 40%, transparent)`,
          }}
        >
          &ldquo;{example.snippet}&rdquo;
        </blockquote>
      </div>

      {/* Reasoning */}
      <div>
        <div
          className="font-mono text-[10px] uppercase tracking-widest mb-1.5"
          style={{ color: accentColor }}
        >
          Mailbox reasoning
        </div>
        <p className="text-sm text-[var(--foreground)] leading-relaxed">
          {example.reasoning}
        </p>
      </div>

      {/* Drafted reply (if any) */}
      {example.draft ? (
        <div
          className="rounded-xl border p-4"
          style={{
            borderColor: `color-mix(in srgb, ${accentColor} 30%, transparent)`,
            backgroundColor: `color-mix(in srgb, ${accentColor} 6%, white)`,
          }}
        >
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div
              className="font-mono text-[10px] uppercase tracking-widest flex items-center gap-1.5"
              style={{ color: accentColor }}
            >
              <Send className="h-3 w-3" strokeWidth={2} />
              Drafted reply · staged for Morning Connect
            </div>
            <Link
              href="/app/morning-connect"
              className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Review in Morning Connect →
            </Link>
          </div>
          <p className="text-sm leading-relaxed text-[var(--foreground)] whitespace-pre-wrap">
            {example.draft}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--paper)]/40 p-4 font-mono text-[11px] text-[var(--muted)] leading-relaxed">
          No draft. Auto-dismissed inbounds don&apos;t consume your attention.
        </div>
      )}
    </div>
  );
}
