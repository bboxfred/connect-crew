import Link from "next/link";
import { ArrowLeft, AtSign, Activity } from "lucide-react";
import { CREW } from "@/lib/fixtures";
import { SecretSignalsPanel } from "@/components/secret-signals-panel";

// ─── Social Media (/app/social) ────────────────────────────────────────────
// Watches Instagram, Facebook Messenger, X DMs in real time. Classifies with
// the same Secret Signal rules, drafts replies, stages them for Morning
// Connect. Never cold-DMs strangers.

export default function SocialPage() {
  const crew = CREW.social;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <Link
        href="/app/dashboard"
        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
      >
        <ArrowLeft className="h-3 w-3" strokeWidth={1.75} />
        Dashboard
      </Link>

      <header className="anim-fade-up">
        <div
          className="font-mono text-[10px] uppercase tracking-widest mb-3"
          style={{ color: crew.color }}
        >
          Crew · 04 · Social Media
        </div>
        <h1
          className="font-editorial text-4xl md:text-5xl tracking-tight"
          style={{ fontWeight: 700, letterSpacing: "-0.025em" }}
        >
          Social Media watches DMs across platforms.
        </h1>
        <p className="mt-4 text-[var(--muted-strong)] max-w-2xl leading-relaxed text-base md:text-lg">
          {crew.role} Same Secret Signal rules as Messenger — but scoped to
          platform-specific patterns (Instagram replies, X DM etiquette, FB
          Messenger formality). Never cold-DMs strangers on your behalf.
        </p>
      </header>

      {/* Platform tiles */}
      <section
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 anim-fade-up"
        style={{ animationDelay: "0.04s" }}
      >
        <PlatformTile
          name="Instagram"
          status="architecture"
          color={crew.color}
          stats={[
            { label: "Captured today", value: "4" },
            { label: "Warmest", value: "Kai J. · 68" },
          ]}
        />
        <PlatformTile
          name="X (Twitter)"
          status="architecture"
          color={crew.color}
          stats={[
            { label: "Captured today", value: "2" },
            { label: "Warmest", value: "Naomi P. · 58" },
          ]}
        />
        <PlatformTile
          name="FB Messenger"
          status="architecture"
          color={crew.color}
          stats={[
            { label: "Captured today", value: "0" },
            { label: "Meta API", value: "pending" },
          ]}
        />
      </section>

      {/* Secret Signals — Social scope */}
      <section className="anim-fade-up" style={{ animationDelay: "0.1s" }}>
        <SecretSignalsPanel
          scope="social"
          mode="full"
          accentColor={crew.color}
          title="Social Media · Secret Signals"
          eyebrow="IG + FB + X · your rule matrix"
          description="Platform-specific rules Claude runs on every inbound DM. Emoji culture on Instagram is different from X; journalists reach out on X; FB Messenger leans formal. Tune each platform's signals to match how YOUR contacts actually use them."
        />
      </section>

      {/* Recent captures feed */}
      <section
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 md:p-6 anim-fade-up"
        style={{ animationDelay: "0.14s" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity
            className="h-4 w-4"
            strokeWidth={1.75}
            style={{ color: crew.color }}
          />
          <div
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color: crew.color }}
          >
            Recent DMs · captured + classified
          </div>
        </div>
        <ul className="space-y-3">
          <DMRow
            platform="Instagram"
            who="Kai Jensen · Seedstars SEA"
            message="Hey Fred! 🙌 saw your Web3 SG post — love what you're building"
            tier="hot"
            delta="+5"
            when="4h ago"
            color={crew.color}
          />
          <DMRow
            platform="X"
            who="Naomi Park · Blockworks"
            message="Working on a piece on SEA founder network effects — quick quote?"
            tier="warm"
            delta="+2"
            when="yesterday"
            color={crew.color}
          />
          <DMRow
            platform="X"
            who="Hassan Okafor · Breakpoint"
            message="Are you open to speaking at Breakpoint 2026?"
            tier="neutral"
            delta="+1"
            when="3d ago"
            color={crew.color}
          />
        </ul>
        <div className="mt-4 pt-4 border-t border-[var(--hairline)] font-mono text-[11px] text-[var(--muted-strong)]">
          All captures staged for your Morning Connect · zero cold-DM outbound
          · platform ToS respected
        </div>
      </section>
    </div>
  );
}

function PlatformTile({
  name,
  status,
  color,
  stats,
}: {
  name: string;
  status: "live" | "architecture";
  color: string;
  stats: { label: string; value: string }[];
}) {
  return (
    <article
      className="rounded-2xl border p-5"
      style={{
        borderColor: `color-mix(in srgb, ${color} 22%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${color} 5%, white)`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AtSign className="h-4 w-4" strokeWidth={1.75} style={{ color }} />
          <div className="font-editorial text-base tracking-tight" style={{ fontWeight: 700 }}>
            {name}
          </div>
        </div>
        <span
          className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded"
          style={{
            backgroundColor: `color-mix(in srgb, ${color} 12%, white)`,
            color,
          }}
        >
          {status === "live" ? "Live" : "Architecture"}
        </span>
      </div>
      <div className="space-y-1.5">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center justify-between text-sm">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
              {s.label}
            </span>
            <span className="font-medium text-[var(--foreground)] tabular-nums">
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

function DMRow({
  platform,
  who,
  message,
  tier,
  delta,
  when,
  color,
}: {
  platform: string;
  who: string;
  message: string;
  tier: "hot" | "warm" | "neutral" | "cold";
  delta: string;
  when: string;
  color: string;
}) {
  const tierColor = {
    hot: "var(--warmth-hot)",
    warm: "var(--warmth-warm)",
    neutral: "var(--warmth-neutral)",
    cold: "var(--warmth-cold)",
  }[tier];
  return (
    <li
      className="rounded-xl border p-3 md:p-4 flex items-start gap-3"
      style={{
        borderColor: `color-mix(in srgb, ${tierColor} 25%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${tierColor} 5%, white)`,
      }}
    >
      <span
        className="font-mono text-[9px] uppercase tracking-wider rounded px-1.5 py-0.5 shrink-0 self-start"
        style={{
          backgroundColor: `color-mix(in srgb, ${color} 14%, white)`,
          color,
        }}
      >
        {platform}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-[var(--foreground)] truncate">
          {who}
        </div>
        <div className="text-sm text-[var(--muted-strong)] leading-snug mt-0.5">
          &ldquo;{message}&rdquo;
        </div>
        <div className="mt-1 flex items-center gap-2 font-mono text-[10px] text-[var(--muted)]">
          <span>{when}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span
          className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{
            backgroundColor: `color-mix(in srgb, ${tierColor} 16%, white)`,
            color: tierColor,
          }}
        >
          {tier}
        </span>
        <span
          className="font-mono text-xs tabular-nums"
          style={{ color: tierColor }}
        >
          {delta}
        </span>
      </div>
    </li>
  );
}
