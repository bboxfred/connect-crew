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

      {/* Note to hackathon judges — first-person from Freddy */}
      <aside
        className="rounded-2xl border p-5 md:p-6 anim-fade-up"
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
              className="font-mono text-[10px] uppercase tracking-widest mb-3"
              style={{ color: "var(--indigo)" }}
            >
              Note to hackathon judges
            </div>

            <p className="text-sm text-[var(--foreground)] leading-relaxed mb-4">
              Hey — quick context on why this page is marked{" "}
              <em>demo mode</em> instead of fully live.
            </p>

            <div className="space-y-4 mb-4">
              <div>
                <div
                  className="font-mono text-[10px] uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--indigo)" }}
                >
                  What I want to ship
                </div>
                <p className="text-sm text-[var(--foreground)] leading-relaxed">
                  I&apos;m chatting with Sofia on Telegram. I drop my cue{" "}
                  <code className="font-mono text-[12px] px-1 py-0.5 rounded bg-[var(--paper)]">
                    Hi!!
                  </code>{" "}
                  in my outbound message. Connect Crew catches it and drafts
                  a richer follow-up — my deck attached, a calendar link,
                  calibrated to what we just discussed. It lands in Morning
                  Connect for my approval, or auto-sends if I&apos;ve set
                  green-tier autonomy on her contact.
                </p>
              </div>

              <div>
                <div
                  className="font-mono text-[10px] uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--indigo)" }}
                >
                  The wall I ran into
                </div>
                <p className="text-sm text-[var(--foreground)] leading-relaxed">
                  Every major messaging protocol deliberately blocks
                  peer-to-peer outbound capture for privacy reasons.
                  Telegram&apos;s Bot API (what&apos;s live below) only sees
                  messages sent <em>to</em> the bot — my DMs to Sofia are
                  invisible to it. WhatsApp&apos;s official Business / Cloud
                  API is built for B2C inbound to a verified business number,
                  which is the wrong shape for personal relationships. To
                  read my own outbound I&apos;d need Telegram MTProto
                  (user-login, 4-6 hrs, gray area under their bot policies)
                  or WhatsApp&apos;s unofficial Baileys library
                  (account-ban risk — not safe for my primary number).
                </p>
              </div>

              <div>
                <div
                  className="font-mono text-[10px] uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--indigo)" }}
                >
                  The tradeoff I made
                </div>
                <p className="text-sm text-[var(--foreground)] leading-relaxed">
                  Burn the remaining hackathon window getting MTProto wired
                  for one demo beat — or ship three acts that actually work
                  end-to-end (Scanner, the Messenger classifier below, and
                  Master Connect) plus this honest roadmap for the cue UX.
                  I picked honest over complete.
                </p>
              </div>

              <div>
                <div
                  className="font-mono text-[10px] uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--indigo)" }}
                >
                  How to see it working today
                </div>
                <ul className="space-y-1.5 text-sm text-[var(--foreground)] leading-relaxed list-disc pl-5">
                  <li>
                    Use the <strong>Simulate</strong> buttons above — they
                    fire real Claude classification against the real
                    11-signal taxonomy, on canned cue messages.
                  </li>
                  <li>
                    Or DM{" "}
                    <code className="font-mono text-[12px] px-1 py-0.5 rounded bg-[var(--paper)]">
                      @ConnectC_bot
                    </code>{" "}
                    directly — same classifier, triggered by inbound-to-bot
                    DMs instead of my outbound.
                  </li>
                  <li>
                    The <strong>cue-branching</strong> section on the landing
                    page shows the output side: the same inbound word{" "}
                    <code className="font-mono text-[11px]">Hi</code> /{" "}
                    <code className="font-mono text-[11px]">Hi!</code> /{" "}
                    <code className="font-mono text-[11px]">Hi!!</code>{" "}
                    branches to three different calibrated reply drafts. That
                    visual is the whole thesis.
                  </li>
                </ul>
              </div>

              <div>
                <div
                  className="font-mono text-[10px] uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--indigo)" }}
                >
                  Post-hackathon path
                </div>
                <p className="text-sm text-[var(--foreground)] leading-relaxed">
                  Gmail&apos;s official API has no such wall. My first real
                  customer probably cares more about email cue detection
                  than Telegram anyway — Composio&apos;s already wired for
                  the draft side, I just need to watch the sent folder. That
                  ships next. MTProto for Telegram follows when a beta user
                  actually asks for it.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--hairline)] font-editorial text-sm text-[var(--muted-strong)] italic">
              — Freddy
            </div>
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

