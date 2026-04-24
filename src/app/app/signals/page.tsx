import Link from "next/link";
import { ArrowLeft, MessageCircle, Activity } from "lucide-react";
import { CREW } from "@/lib/fixtures";
import { SecretSignalsPanel } from "@/components/secret-signals-panel";

// ─── Messenger (/app/signals) ──────────────────────────────────────────────
// Watches Telegram + WhatsApp, classifies every inbound with the 11 signal
// categories, updates Warmth, drafts replies. Secret Signals panel is the
// user-facing IP surface — edit the rules that drive classification.

export default function MessengerPage() {
  const crew = CREW.signals;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {/* Breadcrumb */}
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
          Crew · 02 · Messenger
        </div>
        <h1
          className="font-editorial text-4xl md:text-5xl tracking-tight"
          style={{ fontWeight: 700, letterSpacing: "-0.025em" }}
        >
          Messenger watches how people chat.
        </h1>
        <p className="mt-4 text-[var(--muted-strong)] max-w-2xl leading-relaxed text-base md:text-lg">
          {crew.role} Reads every inbound on Telegram and WhatsApp against the
          Secret Signals below. Adjusts Warmth silently. Drafts replies that
          match the energy your contact just sent.
        </p>
      </header>

      {/* Channel tiles */}
      <section
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 anim-fade-up"
        style={{ animationDelay: "0.04s" }}
      >
        <ChannelTile
          name="Telegram"
          status="live"
          color={crew.color}
          stats={[
            { label: "Classified today", value: "23" },
            { label: "Warmth ↑", value: "+14" },
            { label: "Drafts queued", value: "6" },
          ]}
        />
        <ChannelTile
          name="WhatsApp"
          status="roadmap"
          color={crew.color}
          stats={[
            { label: "Meta API", value: "pending" },
            { label: "Signal rules", value: "shared" },
            { label: "ETA", value: "post-beta" },
          ]}
        />
      </section>

      {/* Secret Signals — Messenger scope */}
      <section className="anim-fade-up" style={{ animationDelay: "0.1s" }}>
        <SecretSignalsPanel
          scope="telegram"
          mode="full"
          accentColor={crew.color}
          title="Messenger · Secret Signals"
          eyebrow="Telegram + WhatsApp · your rule matrix"
          description="These are the rules Claude runs on every Telegram or WhatsApp inbound. Each rule adds or subtracts from the contact's Warmth Index. Rules with a lock ship with Connect Crew — adjust or disable them, but not delete. Custom rules are yours to add, tune, and remove."
        />
      </section>

      {/* Last classification reasoning trail */}
      <section
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 md:p-6 anim-fade-up"
        style={{ animationDelay: "0.14s" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Activity
            className="h-4 w-4"
            strokeWidth={1.75}
            style={{ color: crew.color }}
          />
          <div
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color: crew.color }}
          >
            Last classification · 2h ago
          </div>
        </div>
        <div className="font-editorial text-lg md:text-xl leading-snug tracking-tight text-[var(--ink)] mb-2">
          &ldquo;Hi Freddy!! 🔥 Free for a coffee this week?&rdquo;
        </div>
        <div className="font-mono text-[11px] text-[var(--muted)] mb-4">
          From · Sofia Alencar · Telegram · Warmth before: 76 → 82
        </div>
        <ul className="space-y-1.5 text-sm leading-relaxed">
          <ReasoningLine label="Punctuation" note='"Hi!!" matched — double-exclamation' delta="+6" color={crew.color} />
          <ReasoningLine label="Emoji" note="🔥 detected" delta="+3" color={crew.color} />
          <ReasoningLine label="Greeting" note='"Hi [name]" casual' delta="+0" color={crew.color} />
          <ReasoningLine label="Response time" note="reply within 8 min to your last" delta="+2" color={crew.color} />
          <ReasoningLine label="Channel" note="Telegram (personal)" delta="+2" color={crew.color} />
        </ul>
        <div className="mt-4 pt-4 border-t border-[var(--hairline)] flex items-center justify-between flex-wrap gap-3">
          <div className="font-mono text-xs text-[var(--muted-strong)]">
            Net delta:{" "}
            <span className="font-medium tabular-nums" style={{ color: "var(--warmth-hot)" }}>
              +13
            </span>{" "}
            · clamped to <span className="font-medium tabular-nums">+6</span> per-event cap
          </div>
          <Link
            href="/app/contacts/sofia"
            className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted-strong)] hover:text-[var(--foreground)] flex items-center gap-1 transition-colors"
          >
            Open contact
            <ArrowLeft className="h-3 w-3 rotate-180" strokeWidth={1.75} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function ChannelTile({
  name,
  status,
  color,
  stats,
}: {
  name: string;
  status: "live" | "roadmap";
  color: string;
  stats: { label: string; value: string }[];
}) {
  const live = status === "live";
  return (
    <article
      className="rounded-2xl border p-5"
      style={{
        borderColor: `color-mix(in srgb, ${color} ${live ? 28 : 18}%, transparent)`,
        backgroundColor: live
          ? `color-mix(in srgb, ${color} 6%, white)`
          : "color-mix(in srgb, var(--muted) 4%, white)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageCircle
            className="h-4 w-4"
            strokeWidth={1.75}
            style={{ color: live ? color : "var(--muted)" }}
          />
          <div className="font-editorial text-lg tracking-tight" style={{ fontWeight: 700 }}>
            {name}
          </div>
        </div>
        <span
          className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded"
          style={{
            backgroundColor: live
              ? `color-mix(in srgb, ${color} 14%, white)`
              : "color-mix(in srgb, var(--muted) 10%, white)",
            color: live ? color : "var(--muted)",
          }}
        >
          {live ? "Live" : "Roadmap"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="font-editorial text-lg tabular-nums">{s.value}</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function ReasoningLine({
  label,
  note,
  delta,
  color,
}: {
  label: string;
  note: string;
  delta: string;
  color: string;
}) {
  const deltaNum = parseInt(delta, 10);
  const deltaColor =
    deltaNum > 0
      ? "var(--warmth-hot)"
      : deltaNum < 0
        ? "var(--warmth-cold)"
        : "var(--muted)";
  return (
    <li className="flex items-center gap-3 text-sm">
      <span
        className="font-mono text-[10px] uppercase tracking-wider w-28 shrink-0"
        style={{ color }}
      >
        {label}
      </span>
      <span className="flex-1 text-[var(--foreground)]">{note}</span>
      <span
        className="font-mono tabular-nums text-xs px-2 py-0.5 rounded"
        style={{
          backgroundColor: `color-mix(in srgb, ${deltaColor} 12%, white)`,
          color: deltaColor,
        }}
      >
        {delta}
      </span>
    </li>
  );
}
