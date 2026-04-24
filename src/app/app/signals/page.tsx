import Link from "next/link";
import { ArrowLeft, MessageCircle, Info } from "lucide-react";
import { CREW } from "@/lib/fixtures";
import { SecretSignalsPanel } from "@/components/secret-signals-panel";
import { LiveClassificationCard } from "@/components/live-classification-card";

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

      {/* Live classification + simulate controls */}
      <div className="anim-fade-up" style={{ animationDelay: "0.14s" }}>
        <LiveClassificationCard accentColor={crew.color} />
      </div>

      {/* Roadmap notice — outbound cue detection requires MTProto */}
      <aside
        className="rounded-2xl border p-4 md:p-5 anim-fade-up"
        style={{
          animationDelay: "0.18s",
          borderColor: "color-mix(in srgb, var(--indigo) 22%, transparent)",
          backgroundColor: "color-mix(in srgb, var(--indigo) 4%, white)",
        }}
      >
        <div className="flex items-start gap-3">
          <Info
            className="h-4 w-4 mt-0.5 shrink-0"
            strokeWidth={1.75}
            style={{ color: "var(--indigo)" }}
          />
          <div className="min-w-0">
            <div
              className="font-mono text-[10px] uppercase tracking-widest mb-1.5"
              style={{ color: "var(--indigo)" }}
            >
              Roadmap · Outbound cue detection
            </div>
            <p className="text-sm text-[var(--foreground)] leading-relaxed mb-2">
              The full Secret Signals experience — typing <code className="font-mono text-[12px] px-1 py-0.5 rounded bg-[var(--paper)]">Hi!!</code> directly
              to your contact on Telegram and having Connect Crew detect it,
              then auto-draft a richer follow-up — requires MTProto user-API
              integration, not the Bot API. Telegram&apos;s Bot API cannot read
              DMs you send to other users; that&apos;s a protocol wall, not a
              bug.
            </p>
            <p className="text-sm text-[var(--muted-strong)] leading-relaxed">
              MTProto wiring is a 4–6 hour task — scoped into the post-beta
              roadmap. For today&apos;s hackathon demo, use the <strong>Simulate</strong>
              {" "}buttons above to run the classifier against canned messages,
              or DM the bot directly to watch inbound classification work live.
            </p>
          </div>
        </div>
      </aside>
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

