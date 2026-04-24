"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import {
  CREW,
  crewCountsToday,
  fixtureActivityLog,
  fixtureWarmthUpdatesToday,
  latestByCrew,
  pendingDraftsCount,
  type CrewKey,
} from "@/lib/fixtures";
import { DashboardCrewCard } from "@/components/dashboard-crew-card";
import { WarmthSparkline } from "@/components/warmth-sparkline";
import { ActivityLogRow } from "@/components/activity-log-row";
import { MasterConnectHero } from "@/components/master-connect-hero";
import { SecretSignalsPanel } from "@/components/secret-signals-panel";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Working late, Freddy";
  if (h < 12) return "Good morning, Freddy";
  if (h < 17) return "Good afternoon, Freddy";
  if (h < 22) return "Good evening, Freddy";
  return "Still up, Freddy";
}

// Per-Crew "stat" sentence for the 2×3 grid. Driven by fixture data so it
// stays in sync with activity log + drafts when those change.
function statFor(
  key: CrewKey,
  count: number,
  pending: number,
): string {
  if (count === 0) return "No activity today yet.";
  switch (key) {
    case "scan":
      return `${count} cards processed today · 1 queued, 1 enriching`;
    case "signals":
      return `${count} messages classified · Warmth delta +14 across 11 contacts`;
    case "inbound":
      return `${count} cold asks qualified · ${pending} drafts staged · Gmail`;
    case "scribe":
      return `${count} recordings processed · 4 commitments extracted`;
    case "social":
      return `${count} actions this session · 6am sweep next at 06:00`;
    default:
      return `${count} today`;
  }
}

const crewOrder: CrewKey[] = ["scan", "signals", "inbound", "social", "scribe"];
// Subtle per-card rotation matches landing page Crew cards (±0.4°)
const rotations = [-0.4, 0.4, -0.4, 0.4, -0.4];

export default function DashboardPage() {
  const counts = crewCountsToday();
  const latest = latestByCrew();
  const pending = pendingDraftsCount();

  // Per-Crew pending draft counts for the "stat" line
  const perCrewPending = useMemo(() => {
    const out: Record<CrewKey, number> = {
      scan: 0,
      signals: 0,
      inbound: 0,
      scribe: 0,
      social: 0,
    };
    return out;
  }, []);

  const [showAllActivity, setShowAllActivity] = useState(false);
  const visibleActivity = showAllActivity
    ? fixtureActivityLog
    : fixtureActivityLog.slice(0, 10);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Master Connect hero — the Chief, above everything */}
      <div className="mb-10 md:mb-12">
        <MasterConnectHero mode="personal" />
      </div>

      {/* Zone 1 — Greeting header */}
      <header className="mb-12 md:mb-14">
        <h1
          className="font-editorial text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight"
          style={{ fontWeight: 700, letterSpacing: "-0.03em" }}
        >
          {greeting()}.
        </h1>
        <p className="mt-4 text-base md:text-lg text-[var(--muted-strong)] leading-relaxed max-w-2xl">
          Your Crew has{" "}
          <span
            className="font-mono tabular-nums px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: "color-mix(in srgb, var(--terracotta) 14%, white)",
              color: "var(--terracotta)",
            }}
          >
            {pending}
          </span>{" "}
          {pending === 1 ? "thing" : "things"} waiting for you.
        </p>
        <div className="mt-7 flex items-center gap-5 flex-wrap">
          <Link
            href="/app/morning-connect"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-medium text-[var(--background)] hover:opacity-90 transition-opacity"
          >
            Open Morning Connect <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
          <a
            href="#activity"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-strong)] hover:text-[var(--foreground)] transition-colors"
          >
            See what the Crew did overnight <ArrowDown className="h-4 w-4" strokeWidth={2} />
          </a>
        </div>
      </header>

      {/* Zone 2 — Crew grid */}
      <section className="mb-14 md:mb-16">
        <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-4">
          Your Crew · Today
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {crewOrder.map((k, i) => (
            <DashboardCrewCard
              key={k}
              crewKey={k}
              count={counts[k]}
              stat={statFor(k, counts[k], perCrewPending[k])}
              latest={latest[k]}
              rotation={rotations[i]}
            />
          ))}
        </div>
      </section>

      {/* Zone 2b — Secret Signals (the IP, user-editable rule matrix) */}
      <section className="mb-14 md:mb-16">
        <SecretSignalsPanel
          scope="all"
          mode="compact"
          accentColor="var(--teal)"
          title="Your Secret Signals."
          eyebrow="The Warmth IP · 11 categories · edit any rule"
          description="Claude runs every inbound message through this rule matrix. You control which signals move Warmth, by how much, and for which contacts. Add a rule, adjust a delta, disable one you don't want. Same signals power Messenger, Mailbox, and Social Media — scope each one by channel on its Crew page."
        />
      </section>

      {/* Zone 3 — Today's Warmth shifts */}
      <section className="mb-14 md:mb-16 rounded-2xl border border-[var(--border)] bg-white p-6 md:p-8">
        <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">
              Today
            </div>
            <h2
              className="font-editorial text-2xl md:text-3xl tracking-tight leading-tight"
              style={{ fontWeight: 600 }}
            >
              Warmth shifts across the graph.
            </h2>
          </div>
          <div className="font-mono text-[11px] text-[var(--muted)]">
            Hover a dot to see the contact + reason
          </div>
        </div>
        <WarmthSparkline updates={fixtureWarmthUpdatesToday} height={96} />
      </section>

      {/* Zone 4 — Recent Crew activity */}
      <section id="activity" className="scroll-mt-16">
        <div className="mb-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">
            Activity feed
          </div>
          <h2
            className="font-editorial text-2xl md:text-3xl tracking-tight leading-tight"
            style={{ fontWeight: 600 }}
          >
            Recent Crew activity.
          </h2>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white px-6 md:px-8 py-2">
          {visibleActivity.map((entry) => (
            <ActivityLogRow key={entry.id} entry={entry} />
          ))}
        </div>
        {!showAllActivity && fixtureActivityLog.length > 10 ? (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowAllActivity(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors"
            >
              Load more · {fixtureActivityLog.length - 10} more entries
            </button>
          </div>
        ) : null}
      </section>

      {/* Secondary note */}
      <div className="mt-12 text-center">
        <p className="font-mono text-[11px] text-[var(--muted)]">
          Fixture data · hackathon-day wiring flips everything live.
        </p>
      </div>
    </div>
  );
}
