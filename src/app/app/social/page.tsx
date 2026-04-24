import Link from "next/link";
import {
  ArrowLeft,
  AtSign,
  Send,
  Inbox,
  Sparkles,
  MessageSquareReply,
} from "lucide-react";
import { CREW } from "@/lib/fixtures";
import { SecretSignalsPanel } from "@/components/secret-signals-panel";

// ─── Social Media (/app/social) ────────────────────────────────────────────
//
// Two modes, explicit in the UI:
//
//   1. OUTBOUND cues — same pattern as Messenger. When YOU type a cue
//      like "Hi!!" to a contact, the preset reply template fires (or
//      Claude drafts dynamically if no template is set).
//
//   2. INBOUND replies — NEW on the Social page. When a stranger DMs
//      you with almost no context (e.g. "Hi!"), Claude analyses the
//      message and drafts a careful, appropriate reply. No preset
//      template — Claude's full judgment.
//
// Both land in Morning Connect for approval. Never cold-DMs strangers.

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
          {crew.role} Two modes — outbound cues fire the reply templates
          you set, inbound DMs trigger fresh Claude drafts when context is
          thin. Everything lands in Morning Connect for your approval.
          Never cold-DMs strangers.
        </p>
      </header>

      {/* Platform tiles */}
      <section
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 anim-fade-up"
        style={{ animationDelay: "0.04s" }}
      >
        <PlatformTile
          index={1}
          name="Instagram"
          status="architecture"
          color={crew.color}
          stats={[
            { label: "Captured today", value: "4" },
            { label: "Warmest", value: "Kai J. · 68" },
          ]}
        />
        <PlatformTile
          index={2}
          name="X (Twitter)"
          status="architecture"
          color={crew.color}
          stats={[
            { label: "Captured today", value: "2" },
            { label: "Warmest", value: "Naomi P. · 58" },
          ]}
        />
        <PlatformTile
          index={3}
          name="FB Messenger"
          status="architecture"
          color={crew.color}
          stats={[
            { label: "Captured today", value: "0" },
            { label: "Meta API", value: "pending" },
          ]}
        />
      </section>

      {/* ─── Mode 1: Outbound cues ─────────────────────────────────── */}
      <section className="anim-fade-up" style={{ animationDelay: "0.08s" }}>
        <div className="flex items-start gap-3 mb-4">
          <div
            className="h-9 w-9 rounded-xl shrink-0 flex items-center justify-center"
            style={{
              backgroundColor: `color-mix(in srgb, ${crew.color} 14%, white)`,
              color: crew.color,
            }}
          >
            <Send className="h-4 w-4" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div
              className="font-mono text-[10px] uppercase tracking-widest mb-1"
              style={{ color: crew.color }}
            >
              Mode 1 · Outbound cues
            </div>
            <h2
              className="font-editorial text-xl md:text-2xl tracking-tight leading-tight"
              style={{ fontWeight: 700 }}
            >
              When YOU type a cue, fire a preset reply.
            </h2>
            <p className="mt-1.5 text-sm text-[var(--muted-strong)] leading-relaxed max-w-2xl">
              Same pattern as Messenger. Your outbound cue triggers the
              reply template you set below — or Claude drafts dynamically
              from tone + context if you leave the template blank.
            </p>
          </div>
        </div>
        <SecretSignalsPanel
          scope="social"
          mode="full"
          accentColor={crew.color}
          title="Social · Cue triggers"
          eyebrow="IG + FB + X · your rule matrix"
          description="Your outbound cues across social platforms. Each rule's reply template is what gets fired when you type the cue to a contact."
        />
      </section>

      {/* ─── Mode 2: Inbound Claude drafts ─────────────────────────── */}
      <section className="anim-fade-up" style={{ animationDelay: "0.12s" }}>
        <div className="flex items-start gap-3 mb-4">
          <div
            className="h-9 w-9 rounded-xl shrink-0 flex items-center justify-center"
            style={{
              backgroundColor: `color-mix(in srgb, ${crew.color} 14%, white)`,
              color: crew.color,
            }}
          >
            <Inbox className="h-4 w-4" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div
              className="font-mono text-[10px] uppercase tracking-widest mb-1"
              style={{ color: crew.color }}
            >
              Mode 2 · Inbound replies
            </div>
            <h2
              className="font-editorial text-xl md:text-2xl tracking-tight leading-tight"
              style={{ fontWeight: 700 }}
            >
              When someone DMs you, Claude drafts fresh.
            </h2>
            <p className="mt-1.5 text-sm text-[var(--muted-strong)] leading-relaxed max-w-2xl">
              On social, inbound DMs often arrive with almost no context —
              &ldquo;Hi!&rdquo; from a stranger tells you nothing about
              who they are or what they want. So we{" "}
              <strong>don&apos;t</strong> use preset templates here. Claude
              reads the message, considers what little context is available,
              and drafts a careful, appropriate reply. Always lands in
              Morning Connect for your approval before anything sends.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <div
            className="px-5 md:px-6 py-3 border-b border-[var(--hairline)]"
            style={{
              backgroundColor: `color-mix(in srgb, ${crew.color} 5%, white)`,
            }}
          >
            <div
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: crew.color }}
            >
              Recent inbound · Claude-drafted replies
            </div>
          </div>
          <ul className="divide-y divide-[var(--hairline)]">
            <InboundReplyRow
              platform="Instagram"
              who="Unknown · @kai_jensen"
              inbound="Hi!"
              draft="Hi there! Thanks for reaching out — I don't think we've connected before. What can I help with?"
              note="Minimal context. Claude defaults to a warm, open-ended question to surface intent before committing."
              when="4h ago"
              color={crew.color}
            />
            <InboundReplyRow
              platform="X"
              who="Naomi Park · Blockworks"
              inbound="Working on a piece on SEA founder network effects — quick quote?"
              draft="Hey Naomi — happy to. Can you send the angle and your deadline? I can turn around 2–3 sentences by email within a day."
              note="Journalist asking for a quote. Claude pivots to email (higher-fidelity channel) and asks for the specifics it needs before committing."
              when="yesterday"
              color={crew.color}
            />
            <InboundReplyRow
              platform="X"
              who="Hassan Okafor · Breakpoint"
              inbound="Are you open to speaking at Breakpoint 2026?"
              draft="Thanks Hassan! Short answer yes, interested. What's the theme, slot length, and rough audience size? Also happy to suggest topics if useful."
              note="Invitation with zero specifics. Claude says yes-in-principle + asks the three things needed to actually decide."
              when="3d ago"
              color={crew.color}
            />
          </ul>
          <div
            className="px-5 md:px-6 py-3 font-mono text-[11px] leading-relaxed border-t border-[var(--hairline)]"
            style={{
              backgroundColor: `color-mix(in srgb, ${crew.color} 5%, white)`,
              color: "var(--muted-strong)",
            }}
          >
            No templates fire in this mode · Claude drafts each reply
            fresh · you approve every one in Morning Connect · zero cold
            outbound · platform ToS respected.
          </div>
        </div>
      </section>
    </div>
  );
}

function PlatformTile({
  index,
  name,
  status,
  color,
  stats,
}: {
  index?: number;
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
        <div className="flex items-center gap-2.5">
          {index !== undefined ? (
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px] font-semibold tabular-nums"
              style={{
                backgroundColor: `color-mix(in srgb, ${color} 18%, white)`,
                color,
              }}
              aria-hidden
            >
              {index}
            </span>
          ) : (
            <AtSign className="h-4 w-4" strokeWidth={1.75} style={{ color }} />
          )}
          <div
            className="font-editorial text-base tracking-tight"
            style={{ fontWeight: 700 }}
          >
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
          <div
            key={s.label}
            className="flex items-center justify-between text-sm"
          >
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

function InboundReplyRow({
  platform,
  who,
  inbound,
  draft,
  note,
  when,
  color,
}: {
  platform: string;
  who: string;
  inbound: string;
  draft: string;
  note: string;
  when: string;
  color: string;
}) {
  return (
    <li className="px-5 md:px-6 py-4">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span
          className="font-mono text-[9px] uppercase tracking-wider rounded px-1.5 py-0.5"
          style={{
            backgroundColor: `color-mix(in srgb, ${color} 14%, white)`,
            color,
          }}
        >
          {platform}
        </span>
        <span className="font-medium text-sm text-[var(--foreground)] truncate">
          {who}
        </span>
        <span className="font-mono text-[10px] text-[var(--muted)] ml-auto">
          {when}
        </span>
      </div>

      {/* Inbound + draft stacked */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_auto_1fr] md:items-start gap-2 md:gap-3">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] mt-1">
          Inbound
        </span>
        <blockquote className="text-sm text-[var(--muted-strong)] leading-snug md:col-span-2">
          &ldquo;{inbound}&rdquo;
        </blockquote>

        <span
          className="font-mono text-[10px] uppercase tracking-wider mt-1 flex items-center gap-1"
          style={{ color }}
        >
          <Sparkles className="h-2.5 w-2.5" strokeWidth={2} />
          Draft
        </span>
        <div
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white w-fit h-5"
          style={{ backgroundColor: color }}
          title="No preset template — Claude drafted fresh from the inbound content"
        >
          <MessageSquareReply className="h-2.5 w-2.5" strokeWidth={2} />
          Claude · fresh
        </div>
        <p
          className="text-sm leading-snug font-medium"
          style={{ color: "var(--foreground)" }}
        >
          {draft}
        </p>
      </div>

      <p className="mt-2 font-mono text-[11px] text-[var(--muted)] leading-relaxed">
        {note}
      </p>
    </li>
  );
}
