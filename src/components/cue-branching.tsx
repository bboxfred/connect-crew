import { ArrowDown } from "lucide-react";

// ─── Cue Branching ──────────────────────────────────────────────────────────
// Three-column visual proof of the Secret Signal thesis.
//
// Same inbound phrase, three different punctuations — Hi / Hi! / Hi!! —
// classified as cold / warm / hot, branched through the user's rules into
// three distinctly calibrated reply drafts. Sits on the landing page right
// after the USP panels as the "show, don't tell" for the hero promise:
// "Reads the cues. You set the rules. Matches the reply."

type Branch = {
  tier: "cold" | "warm" | "hot";
  cueLabel: string;
  cueNumber: string;
  inbound: string;
  delta: string;
  read: string;
  reply: string;
  color: string;
  bubbleBg: string;
};

const branches: Branch[] = [
  {
    tier: "cold",
    cueNumber: "01",
    cueLabel: "Measured",
    inbound: "Hi",
    delta: "+0",
    read: "Polite. Neutral. No punctuation signal.",
    reply:
      "Great to meet you yesterday — are we able to explore potential collaborations? Here is my deck.",
    color: "var(--warmth-cold)",
    bubbleBg: "color-mix(in srgb, var(--warmth-cold) 10%, white)",
  },
  {
    tier: "warm",
    cueNumber: "02",
    cueLabel: "Engaged",
    inbound: "Hi!",
    delta: "+3",
    read: "One exclamation. Open door. Leaning in.",
    reply:
      "Great to meet you yesterday! I'd really like a more in-depth discussion on what we talked about — here is my deck so you know more about me.",
    color: "var(--warmth-warm)",
    bubbleBg: "color-mix(in srgb, var(--warmth-warm) 12%, white)",
  },
  {
    tier: "hot",
    cueNumber: "03",
    cueLabel: "Hot",
    inbound: "Hi!!",
    delta: "+6",
    read: "Double exclamation. High energy. Green light.",
    reply:
      "Great to meet you yesterday! Shall we talk more about the collaboration details on what we discussed? Are you free this week? Here's my deck as a reminder btw!",
    color: "var(--warmth-hot)",
    bubbleBg: "color-mix(in srgb, var(--warmth-hot) 12%, white)",
  },
];

export function CueBranching() {
  return (
    <section className="border-t border-[var(--border)] mx-auto w-full max-w-7xl px-6 py-24 md:py-28">
      <div className="max-w-3xl mb-14">
        <div
          className="font-mono text-xs tracking-widest uppercase mb-6"
          style={{ color: "var(--coral)" }}
        >
          Secret cues · your rules · calibrated actions
        </div>
        <h2 className="font-editorial text-3xl md:text-5xl leading-[1.05] tracking-tight">
          Set your own secret chat{" "}
          <span className="font-mono" style={{ color: "var(--warmth-cold)" }}>
            cues
          </span>
          .<br />
          Different{" "}
          <span className="font-mono" style={{ color: "var(--warmth-warm)" }}>
            cues
          </span>{" "}
          trigger different{" "}
          <span className="font-mono" style={{ color: "var(--warmth-hot)" }}>
            actions
          </span>{" "}
          in your Telegram / WhatsApp.
        </h2>
        <p className="mt-6 text-base md:text-lg text-[var(--muted-strong)] leading-relaxed max-w-2xl">
          The person who wrote{" "}
          <span className="font-mono text-[var(--foreground)]">Hi</span> at you
          is not the same person who wrote{" "}
          <span className="font-mono text-[var(--foreground)]">Hi!!</span>. You
          define the cues that matter, Claude reads every inbound against
          them, and Messenger drafts the reply that matches.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {branches.map((b, i) => (
          <article
            key={b.cueNumber}
            className="flex flex-col reveal-on-scroll"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {/* Column header · cue number + tier label */}
            <div className="flex items-center justify-between mb-4">
              <div
                className="font-mono text-[10px] uppercase tracking-widest"
                style={{ color: b.color }}
              >
                Secret cue · {b.cueNumber}
              </div>
              <div
                className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `color-mix(in srgb, ${b.color} 14%, white)`,
                  color: b.color,
                }}
              >
                {b.cueLabel} · {b.delta}
              </div>
            </div>

            {/* Phone-style inbound bubble */}
            <div
              className="rounded-2xl border p-5 md:p-6 relative"
              style={{
                backgroundColor: b.bubbleBg,
                borderColor: `color-mix(in srgb, ${b.color} 30%, transparent)`,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: b.color }}
                />
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                  Inbound · Telegram · 23:14
                </span>
              </div>
              <div
                className="font-editorial text-3xl md:text-4xl tracking-tight leading-tight"
                style={{ color: b.color, fontWeight: 700 }}
              >
                {b.inbound}
              </div>
              <div className="mt-3 text-xs text-[var(--muted-strong)] leading-relaxed">
                <span
                  className="font-mono uppercase tracking-widest mr-2"
                  style={{ color: b.color, fontSize: "10px" }}
                >
                  Crew reads
                </span>
                {b.read}
              </div>
            </div>

            {/* Branch connector · SVG curve + arrow */}
            <div className="relative flex items-center justify-center py-4">
              <svg
                viewBox="0 0 2 48"
                preserveAspectRatio="none"
                className="h-12 w-px"
                aria-hidden
              >
                <line
                  x1="1"
                  y1="0"
                  x2="1"
                  y2="48"
                  stroke={b.color}
                  strokeWidth="1.5"
                  strokeDasharray="2 3"
                  opacity="0.5"
                />
              </svg>
              <div
                className="absolute inset-0 flex items-center justify-center"
                aria-hidden
              >
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${b.color} 16%, white)`,
                    border: `1px solid color-mix(in srgb, ${b.color} 35%, transparent)`,
                  }}
                >
                  <ArrowDown
                    className="h-3 w-3"
                    strokeWidth={2}
                    style={{ color: b.color }}
                  />
                </div>
              </div>
            </div>

            {/* Outbound calibrated draft */}
            <div
              className="rounded-2xl border bg-white p-5 md:p-6 flex-1 flex flex-col min-h-[220px] shadow-[0_1px_0_rgba(26,24,22,0.03),0_16px_40px_-28px_rgba(26,24,22,0.14)]"
              style={{
                borderColor: `color-mix(in srgb, ${b.color} 22%, transparent)`,
                borderTopWidth: 3,
                borderTopColor: b.color,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                  Draft · Morning Connect
                </span>
                <span
                  className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${b.color} 10%, white)`,
                    color: b.color,
                  }}
                >
                  {b.tier}
                </span>
              </div>
              <p className="font-editorial text-[15px] md:text-base leading-relaxed tracking-tight text-[var(--ink)] flex-1">
                &ldquo;{b.reply}&rdquo;
              </p>
              <div
                className="mt-4 pt-3 border-t flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]"
                style={{
                  borderColor: `color-mix(in srgb, ${b.color} 16%, transparent)`,
                }}
              >
                <span>+ deck attached</span>
                <span style={{ color: b.color }}>ready to approve</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-12 text-center font-editorial text-lg md:text-xl tracking-tight text-[var(--muted-strong)] max-w-3xl mx-auto">
        One inbound word. Three completely different relationships. The Crew
        writes the reply that matches — every time.
      </p>
    </section>
  );
}
