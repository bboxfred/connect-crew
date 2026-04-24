// Small, editorial SVG + CSS infographics — one per Crew member.
// Restrained motion. Tokens come from globals.css (--color-*).

export function ScanInfographic() {
  return (
    <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-7 overflow-hidden">
      <div className="font-mono text-[10px] tracking-widest uppercase text-[var(--muted)] mb-6">
        Scan · from photo to enriched record
      </div>
      <div className="grid grid-cols-[auto_1fr_auto] gap-5 items-center">
        {/* Card photo */}
        <div className="relative">
          <div className="w-20 h-28 rounded-md border border-[var(--border)] bg-gradient-to-br from-[var(--paper)] to-white shadow-sm flex flex-col justify-between p-2">
            <div className="space-y-1">
              <div className="h-1 w-12 bg-[var(--ink)]/80 rounded" />
              <div className="h-0.5 w-10 bg-[var(--muted)]/60 rounded" />
              <div className="h-0.5 w-14 bg-[var(--muted)]/40 rounded" />
            </div>
            <div className="h-0.5 w-8 bg-[var(--warmth-hot)]/60 rounded" />
          </div>
        </div>

        {/* Flow */}
        <svg
          viewBox="0 0 200 100"
          className="w-full h-24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M0 50 C 50 50, 70 20, 100 20 L 200 20"
            stroke="var(--warmth-hot)"
            strokeWidth="1"
            className="anim-dash"
          />
          <path
            d="M0 50 C 50 50, 70 50, 100 50 L 200 50"
            stroke="var(--sage)"
            strokeWidth="1"
            className="anim-dash"
            style={{ animationDelay: "0.4s" }}
          />
          <path
            d="M0 50 C 50 50, 70 80, 100 80 L 200 80"
            stroke="var(--gold)"
            strokeWidth="1"
            className="anim-dash"
            style={{ animationDelay: "0.8s" }}
          />
        </svg>

        {/* Enriched record */}
        <div className="w-32 rounded-md border border-[var(--border)] bg-white p-3 space-y-1.5">
          <div className="font-mono text-[10px] text-[var(--foreground)] font-medium">
            Priya Raghavan
          </div>
          <div className="font-mono text-[9px] text-[var(--muted)]">
            Partner · Sequoia SEA
          </div>
          <div className="flex gap-1 pt-1">
            <span className="inline-block h-1 w-6 rounded bg-[var(--warmth-hot)]/70" />
            <span className="inline-block h-1 w-3 rounded bg-[var(--sage)]" />
            <span className="inline-block h-1 w-4 rounded bg-[var(--gold)]" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 pt-4 border-t border-[var(--hairline)]">
        <Step n="1" label="Photo read" color="warmth-hot" />
        <Step n="2" label="Web enriched" color="sage" />
        <Step n="3" label="Filed to graph" color="gold" />
      </div>
    </div>
  );
}

export function SignalsInfographic() {
  const samples = [
    { text: "Hi.", delta: 0, bar: 12, tone: "muted" as const, label: "flat" },
    { text: "Hi Hi!", delta: 2, bar: 42, tone: "warm" as const, label: "warming" },
    { text: "Hi!!", delta: 6, bar: 86, tone: "hot" as const, label: "hot" },
  ];
  return (
    <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-7 overflow-hidden">
      <div className="font-mono text-[10px] tracking-widest uppercase text-[var(--muted)] mb-6">
        Secret Signals · three greetings, three readings
      </div>
      <div className="grid grid-cols-3 gap-5">
        {samples.map((s, i) => (
          <div key={s.text} className="space-y-3">
            <div
              className={`rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm font-editorial ${
                s.tone === "hot"
                  ? "bg-[var(--warmth-hot)]/10 text-[var(--warmth-hot)] anim-pulse-hot"
                  : s.tone === "warm"
                    ? "bg-[var(--warmth-warm)]/15 text-[var(--ink)]"
                    : "bg-[var(--paper)] text-[var(--muted-strong)]"
              }`}
              style={{
                animationDelay: s.tone === "hot" ? `${i * 0.15}s` : undefined,
              }}
            >
              {s.text}
            </div>
            <div className="h-1 w-full rounded-full bg-[var(--hairline)] overflow-hidden">
              <div
                className={`h-full anim-bar-fill ${
                  s.tone === "hot"
                    ? "bg-[var(--warmth-hot)]"
                    : s.tone === "warm"
                      ? "bg-[var(--warmth-warm)]"
                      : "bg-[var(--warmth-cold)]"
                }`}
                style={{
                  width: `${s.bar}%`,
                  animationDelay: `${0.2 + i * 0.15}s`,
                }}
              />
            </div>
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span className="text-[var(--muted)] uppercase tracking-wider">
                {s.label}
              </span>
              <span
                className={`tabular-nums ${
                  s.delta > 0
                    ? "text-[var(--warmth-hot)]"
                    : "text-[var(--muted)]"
                }`}
              >
                {s.delta > 0 ? `+${s.delta}` : s.delta}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 pt-4 border-t border-[var(--hairline)] text-xs text-[var(--muted)] leading-relaxed">
        Same two letters. Three completely different relationships — and the
        sender has no idea which one you see.
      </p>
    </div>
  );
}

export function InboundInfographic() {
  const rows = [
    { from: "acme.com", fit: true, label: "fit" },
    { from: "growthlabs.io", fit: true, label: "fit" },
    { from: "nova-ventures.xyz", fit: false, label: "no-fit" },
    { from: "helixtech.co", fit: true, label: "fit" },
    { from: "meridian.ai", fit: false, label: "no-fit" },
  ];
  return (
    <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-7 overflow-hidden">
      <div className="font-mono text-[10px] tracking-widest uppercase text-[var(--muted)] mb-6">
        Inbound Connections · qualified before it reaches you
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-5 items-center">
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div
              key={r.from}
              className="flex items-center gap-2 anim-fade-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  r.fit ? "bg-[var(--sage)]" : "bg-[var(--muted)]/40"
                }`}
              />
              <span className="font-mono text-[11px] text-[var(--muted-strong)]">
                {r.from}
              </span>
              <span
                className={`ml-auto font-mono text-[9px] uppercase tracking-wider ${
                  r.fit ? "text-[var(--sage)]" : "text-[var(--muted)]/70"
                }`}
              >
                {r.label}
              </span>
            </div>
          ))}
        </div>

        <svg
          viewBox="0 0 40 140"
          className="w-10 h-32"
          fill="none"
          aria-hidden
        >
          <path
            d="M2 10 L 38 60 L 38 80 L 2 130"
            stroke="var(--border)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M38 60 L 38 80"
            stroke="var(--warmth-hot)"
            strokeWidth="1"
            className="anim-dash"
          />
        </svg>

        <div className="space-y-2">
          <div className="rounded-md border border-[var(--border)] bg-[var(--paper)] p-2.5">
            <div className="font-mono text-[10px] text-[var(--foreground)] font-medium mb-1">
              Draft · acme.com
            </div>
            <div className="font-mono text-[9px] text-[var(--muted)] leading-relaxed">
              Thursday 3pm works. 20 mins OK?
            </div>
          </div>
          <div className="rounded-md border border-[var(--border)] bg-[var(--paper)] p-2.5">
            <div className="font-mono text-[10px] text-[var(--foreground)] font-medium mb-1">
              Draft · growthlabs.io
            </div>
            <div className="font-mono text-[9px] text-[var(--muted)] leading-relaxed">
              Intrigued. Send deck?
            </div>
          </div>
          <div className="rounded-md border border-[var(--border)] bg-[var(--paper)] p-2.5">
            <div className="font-mono text-[10px] text-[var(--foreground)] font-medium mb-1">
              Draft · helixtech.co
            </div>
            <div className="font-mono text-[9px] text-[var(--muted)] leading-relaxed">
              Polite pass — not a fit yet.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SocialInfographic() {
  const dms = [
    { platform: "Instagram", who: "Kai · Seedstars", msg: "Hey! saw your Web3 SG post 🙌", tone: "hot" as const, color: "var(--warmth-hot)" },
    { platform: "X", who: "Naomi · Blockworks", msg: "working on a piece — quote ok?", tone: "warm" as const, color: "var(--warmth-warm)" },
    { platform: "X", who: "Hassan · Breakpoint", msg: "speaker for 2026?", tone: "cold" as const, color: "var(--warmth-cold)" },
  ];
  return (
    <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-7 overflow-hidden">
      <div className="font-mono text-[10px] tracking-widest uppercase text-[var(--muted)] mb-6">
        Social Media · real-time DM capture + reply drafts
      </div>
      <ul className="space-y-2.5">
        {dms.map((dm, i) => (
          <li
            key={dm.who}
            className="grid grid-cols-[auto_1fr_auto] gap-3 items-center rounded-lg border p-2.5 anim-fade-up"
            style={{
              borderColor: `color-mix(in srgb, ${dm.color} 28%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${dm.color} 6%, white)`,
              animationDelay: `${i * 0.08}s`,
            }}
          >
            <span
              className="font-mono text-[9px] uppercase tracking-wider rounded px-1.5 py-0.5 shrink-0"
              style={{
                backgroundColor: `color-mix(in srgb, var(--indigo) 14%, white)`,
                color: "var(--indigo)",
              }}
            >
              {dm.platform}
            </span>
            <div className="min-w-0">
              <div className="font-mono text-[11px] text-[var(--foreground)] font-medium truncate">
                {dm.who}
              </div>
              <div className="font-mono text-[10px] text-[var(--muted-strong)] truncate">
                &ldquo;{dm.msg}&rdquo;
              </div>
            </div>
            <span
              className="font-mono text-[9px] uppercase tracking-wider shrink-0"
              style={{ color: dm.color }}
            >
              {dm.tone}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-3 border-t border-[var(--hairline)] flex items-center justify-between font-mono text-[10px] text-[var(--muted)]">
        <span>Captured in real time · classified with Signal rules</span>
        <span
          className="font-medium"
          style={{ color: "var(--indigo)" }}
        >
          3 drafts staged
        </span>
      </div>
    </div>
  );
}

export function ScribeInfographic() {
  const bars = [30, 60, 45, 85, 70, 40, 95, 55, 72, 38, 62, 80, 48, 66, 42];
  return (
    <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-7 overflow-hidden">
      <div className="font-mono text-[10px] tracking-widest uppercase text-[var(--muted)] mb-6">
        Scribe · voice and meeting → structured memory
      </div>
      <div className="grid grid-cols-[auto_1fr_auto] gap-5 items-center">
        <div className="flex items-center gap-0.5 h-12">
          {bars.map((h, i) => (
            <span
              key={i}
              className="w-1 rounded-full bg-[var(--sage)]"
              style={{
                height: `${h}%`,
                animation: `wave 1.4s ease-in-out ${i * 0.06}s infinite`,
                transformOrigin: "center",
              }}
            />
          ))}
        </div>

        <svg viewBox="0 0 120 40" className="w-full h-10" aria-hidden>
          <path d="M0 20 L 120 20" stroke="var(--sage)" strokeWidth="1" className="anim-dash" />
        </svg>

        <div className="w-40 rounded-md border border-[var(--border)] bg-[var(--paper)] p-3 space-y-1.5">
          <div className="font-mono text-[9px] uppercase tracking-wider text-[var(--sage)]">
            transcript excerpt
          </div>
          <div className="h-1 w-full bg-[var(--muted)]/25 rounded" />
          <div className="h-1 w-4/5 bg-[var(--muted)]/25 rounded" />
          <div className="h-1 w-3/5 bg-[var(--muted)]/25 rounded" />
          <div className="pt-1.5 border-t border-[var(--hairline)] space-y-1">
            <div className="font-mono text-[9px] text-[var(--foreground)] font-medium">
              Action: intro to Akio
            </div>
            <div className="font-mono text-[9px] text-[var(--foreground)] font-medium">
              Action: follow up Thurs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── helpers ───
const tokenColor: Record<string, string> = {
  "warmth-hot": "var(--warmth-hot)",
  sage: "var(--sage)",
  gold: "var(--gold)",
};

function Step({
  n,
  label,
  color,
}: {
  n: string;
  label: string;
  color: "warmth-hot" | "sage" | "gold";
}) {
  const c = tokenColor[color];
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-5 w-5 rounded-full flex items-center justify-center font-mono text-[10px] font-medium"
        style={{
          backgroundColor: `color-mix(in srgb, ${c} 15%, transparent)`,
          color: c,
        }}
      >
        {n}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted-strong)]">
        {label}
      </span>
    </div>
  );
}
