"use client";

import {
  Users,
  MessageSquareShare,
  Sparkles,
  AlertTriangle,
  Activity,
  ArrowRight,
  Clock,
} from "lucide-react";
import {
  fixtureTeammates,
  fixtureSharedGraphStats,
  fixtureActivityLog,
  pendingDraftsCount,
} from "@/lib/fixtures";
import Link from "next/link";
import { MasterConnectHero } from "@/components/master-connect-hero";

// Tiny inline sparkline — takes an array of numbers, renders a smooth SVG
// polyline. Used for per-teammate warmth trend in the teammate cards.
function MiniSparkline({
  points,
  color,
  width = 88,
  height = 28,
}: {
  points: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (points.length === 0) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(1, max - min);
  const coords = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden
    >
      <polyline
        points={coords}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Teams dashboard ──────────────────────────────────────────────────────
// Fixture-only. Shows the shared graph experience for a 4-person team.
// Matches Enterprise dashboard's visual language (tiles, feed) but scoped
// to a team instead of a fund.

const TEAL = "var(--teal)";

export default function TeamsDashboardPage() {
  const teammates = fixtureTeammates;
  const stats = fixtureSharedGraphStats;
  const pending = pendingDraftsCount();
  const activity = fixtureActivityLog.slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-10">
      {/* Master Connect hero */}
      <MasterConnectHero mode="teams" />

      {/* Header */}
      <header className="anim-fade-up">
        <div
          className="font-mono text-[10px] uppercase tracking-widest mb-3"
          style={{ color: TEAL }}
        >
          Team overview · {teammates.length} active · shared graph
        </div>
        <h1
          className="font-editorial text-4xl md:text-5xl tracking-tight"
          style={{ fontWeight: 700, letterSpacing: "-0.025em" }}
        >
          Team dashboard.
        </h1>
        <p className="mt-3 text-[var(--muted-strong)] max-w-2xl leading-relaxed">
          One graph, four people. Every draft tagged by owner. Master Connect
          answers cross-teammate queries. Morning Connect surfaces everyone&apos;s
          pending work so you never double-touch a contact.
        </p>
      </header>

      {/* Teammates row */}
      <section
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 anim-fade-up"
        style={{ animationDelay: "0.05s" }}
      >
        {teammates.map((t, i) => (
          <article
            key={t.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 anim-fade-up shadow-[0_1px_0_rgba(26,24,22,0.03),0_12px_36px_-24px_rgba(26,24,22,0.14)]"
            style={{ animationDelay: `${0.07 + i * 0.04}s` }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium text-white shrink-0"
                style={{ backgroundColor: t.avatar_color }}
              >
                {t.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[var(--foreground)] truncate">
                  {t.name}
                </div>
                <div className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wider truncate">
                  {t.role}
                </div>
              </div>
            </div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="font-editorial text-2xl tabular-nums">
                  {t.drafts_today}
                </div>
                <div className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wider">
                  drafts · today
                </div>
              </div>
              <MiniSparkline points={t.warmth_sparkline} color={t.avatar_color} />
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-[var(--muted)]">
              <Clock className="h-3 w-3" strokeWidth={1.75} />
              active {t.last_active_relative}
              <span className="mx-1">·</span>
              {t.region}
            </div>
          </article>
        ))}
      </section>

      {/* Shared graph stats strip */}
      <section
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 anim-fade-up"
        style={{ animationDelay: "0.18s" }}
      >
        <ShareStat
          label="Total contacts"
          value={stats.total_contacts.toLocaleString()}
          color={TEAL}
          icon={<Users className="h-4 w-4" strokeWidth={1.75} />}
        />
        <ShareStat
          label="Warm (≥55)"
          value={stats.warm.toLocaleString()}
          color="var(--warmth-warm)"
          icon={<Sparkles className="h-4 w-4" strokeWidth={1.75} />}
        />
        <ShareStat
          label="Team interactions · today"
          value={String(stats.today_interactions)}
          color="var(--terracotta)"
          icon={<Activity className="h-4 w-4" strokeWidth={1.75} />}
        />
        <ShareStat
          label="Drifting · 30d+"
          value={String(stats.drifting_30d)}
          color="var(--warmth-cold)"
          icon={<AlertTriangle className="h-4 w-4" strokeWidth={1.75} />}
        />
      </section>

      {/* Coordinated outreach board */}
      <section className="anim-fade-up" style={{ animationDelay: "0.25s" }}>
        <div className="flex items-end justify-between mb-4 gap-4 flex-wrap">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-1">
              Coordinated outreach
            </div>
            <h2 className="font-editorial text-2xl md:text-3xl tracking-tight">
              What the team is drafting.
            </h2>
          </div>
          <Link
            href="/app/morning-connect"
            className="font-mono text-[11px] uppercase tracking-wider text-[var(--muted-strong)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1"
          >
            Open Morning Connect ({pending})
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DraftPreview
              owner={teammates[1]}
              to="Akiko Fujimoto · METI Japan"
              preview="Akiko-san, great to connect in Tokyo last week. Following up on the regulatory partnership conversation — sharing our deck + a Thursday 3pm JST slot if that works on your side."
              tone="formal"
            />
            <DraftPreview
              owner={teammates[2]}
              to="Diego Alvarez · Grupo Santander"
              preview="Hey Diego! Loved the LATAM web3 insights on your last X post. Shall we talk more in detail about what our partnerships could look like? Here's a reminder of what we've been building."
              tone="warm"
            />
            <DraftPreview
              owner={teammates[3]}
              to="Kai Jensen · Seedstars SEA"
              preview="Hi Kai 🙌 big thanks for the DM. Dropping our latest 1-pager and would love to grab a quick 15-min call this week — Tuesday or Thursday?"
              tone="casual"
            />
          </div>
        </div>
      </section>

      {/* Duplicate-touch alert */}
      <section
        className="rounded-2xl border p-5 md:p-6 anim-fade-up"
        style={{
          animationDelay: "0.3s",
          backgroundColor: "color-mix(in srgb, var(--warmth-warm) 8%, white)",
          borderColor: "color-mix(in srgb, var(--warmth-warm) 30%, transparent)",
        }}
      >
        <div className="flex items-start gap-4">
          <AlertTriangle
            className="h-5 w-5 shrink-0 mt-0.5"
            strokeWidth={1.75}
            style={{ color: "var(--warmth-warm)" }}
          />
          <div className="flex-1 min-w-0">
            <div
              className="font-mono text-[10px] uppercase tracking-widest mb-1"
              style={{ color: "var(--warmth-warm)" }}
            >
              Duplicate-touch alert
            </div>
            <div className="font-editorial text-lg tracking-tight text-[var(--foreground)] mb-1">
              You and Sarah both have pending drafts to Priya Raghavan.
            </div>
            <p className="text-sm text-[var(--muted-strong)] leading-relaxed">
              You drafted a TOKEN2049 follow-up 2 hours ago. Sarah queued a
              Tokyo fundraise intro 45 minutes ago. Coordinate to avoid
              double-contact.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="rounded-full border border-[var(--border)] px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors"
            >
              Let Sarah send
            </button>
            <button
              type="button"
              className="rounded-full px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "var(--warmth-warm)" }}
            >
              View both
            </button>
          </div>
        </div>
      </section>

      {/* Team activity feed */}
      <section className="anim-fade-up" style={{ animationDelay: "0.35s" }}>
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-1">
              Team activity
            </div>
            <h2 className="font-editorial text-2xl md:text-3xl tracking-tight">
              What everyone&apos;s been up to.
            </h2>
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden divide-y divide-[var(--hairline)]">
          {activity.map((a, i) => (
            <div
              key={a.id ?? i}
              className="px-5 py-4 flex items-center gap-4"
            >
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{
                  backgroundColor: "var(--teal)",
                }}
              />
              <div className="flex-1 text-sm text-[var(--foreground)]">
                <span className="font-medium">{a.action}</span>
                <span className="text-[var(--muted-strong)]"> · {a.detail}</span>
              </div>
              <div className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wider shrink-0">
                {a.timestamp}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────

function ShareStat({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-5 border"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 6%, white)`,
        borderColor: `color-mix(in srgb, ${color} 22%, transparent)`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="font-mono text-[10px] uppercase tracking-widest"
          style={{ color }}
        >
          {label}
        </div>
        <span style={{ color }}>{icon}</span>
      </div>
      <div
        className="font-editorial text-3xl md:text-4xl tracking-tight tabular-nums"
        style={{ fontWeight: 700, letterSpacing: "-0.025em" }}
      >
        {value}
      </div>
    </div>
  );
}

type Teammate = (typeof fixtureTeammates)[number];

function DraftPreview({
  owner,
  to,
  preview,
  tone,
}: {
  owner: Teammate;
  to: string;
  preview: string;
  tone: "formal" | "warm" | "casual";
}) {
  const toneColor =
    tone === "warm"
      ? "var(--warmth-warm)"
      : tone === "casual"
        ? "var(--warmth-hot)"
        : "var(--warmth-neutral)";
  return (
    <article
      className="rounded-2xl border p-4 flex flex-col gap-3"
      style={{
        borderColor: `color-mix(in srgb, ${owner.avatar_color} 22%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${owner.avatar_color} 4%, white)`,
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-medium text-white shrink-0"
          style={{ backgroundColor: owner.avatar_color }}
        >
          {owner.initials}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] truncate">
          {owner.name} · drafting
        </div>
        <span
          className="ml-auto font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{
            backgroundColor: `color-mix(in srgb, ${toneColor} 14%, white)`,
            color: toneColor,
          }}
        >
          {tone}
        </span>
      </div>
      <div className="text-xs font-mono text-[var(--muted-strong)] truncate">
        to · {to}
      </div>
      <p className="font-editorial text-sm leading-snug text-[var(--ink)] line-clamp-4">
        &ldquo;{preview}&rdquo;
      </p>
      <div className="flex items-center justify-between pt-2 border-t border-[var(--hairline)]">
        <button
          type="button"
          className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted-strong)] hover:text-[var(--foreground)] transition-colors"
        >
          View
        </button>
        <button
          type="button"
          className="font-mono text-[10px] uppercase tracking-wider"
          style={{ color: owner.avatar_color }}
        >
          Approve →
        </button>
      </div>
    </article>
  );
}
