"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// ─── Crew hero ───────────────────────────────────────────────────────────────
// Five gradient rectangle slots ready for user-provided media (images or
// videos) — one per Crew member. Each rectangle fades from its Crew signature
// colour into the paper background at the edges, so media sits visually
// "in" the page rather than on top of it.
//
// Media drop-in spec (for Freddy to fill later):
//   Path:        /public/crew/{slug}.jpg | .png | .webm | .mp4
//   Slugs:       scan · signals · inbound · social · scribe
//   Aspect:      2:3 portrait
//   Source size: 720 × 1080 px (3× retina, displays at ~240 × 360)
//   Max size:    2MB image · 10MB video
//   Transparent PNG welcome — gradient frame shows through.
//
// When ready, flip the MEDIA_FILES record below from `null` to the
// extension (e.g. `"png"` or `"mp4"`) and the <img>/<video> element will
// render on top of the gradient slot.

type MediaKind = "image" | "video" | null;
const MEDIA_FILES: Record<string, { ext: string; kind: MediaKind }> = {
  "master-connect": { ext: "", kind: null },
  scan: { ext: "", kind: null },
  signals: { ext: "", kind: null },
  inbound: { ext: "", kind: null },
  social: { ext: "", kind: null },
  scribe: { ext: "", kind: null },
};

type CrewChar = {
  slug: string;
  name: string;
  color: string;
  greeting: string;
  blurb: string;
};

const characters: CrewChar[] = [
  {
    slug: "master-connect",
    name: "Master Connect",
    color: "var(--plum)",
    greeting: "Hi! I'm Master Connect.",
    blurb:
      "I'm the Chief. I read your whole graph and answer questions. \"Who on my team has warm contacts at Sequoia?\" — ranked answers with reasoning, in plain English. I sit above the five specialists.",
  },
  {
    slug: "scan",
    name: "Scanner",
    color: "var(--coral)",
    greeting: "Hi! I'm Scanner.",
    blurb:
      "I turn business cards and photos into enriched contacts — Claude reads the card, Genspark pulls Crunchbase + press, and you have a filed record before you've left the venue.",
  },
  {
    slug: "signals",
    name: "Messenger",
    color: "var(--teal)",
    greeting: "Hi! I'm Messenger.",
    blurb:
      "I watch your Telegram and WhatsApp. Hi. vs Hi Hi! vs Hi!! — three completely different relationships from the same two letters. I read the signal and draft the reply.",
  },
  {
    slug: "inbound",
    name: "Mailbox",
    color: "var(--copper)",
    greeting: "Hi! I'm Mailbox.",
    blurb:
      "I filter every cold email, qualify it against your criteria, and prepare the draft. You approve in Morning Connect. I never book meetings without you.",
  },
  {
    slug: "social",
    name: "Social Media",
    color: "var(--indigo)",
    greeting: "Hi! I'm Social Media.",
    blurb:
      "I watch DMs on Instagram, Facebook Messenger, and X — in real time. Same Signal rules as Telegram. I never cold-DM strangers on your behalf.",
  },
  {
    slug: "scribe",
    name: "Scribe",
    color: "var(--sage)",
    greeting: "Hi! I'm Scribe.",
    blurb:
      "I ingest from Plaud, Granola, Otter, or a voice memo you drop in — turn audio into structured memory, extract commitments, and stage them as follow-up drafts.",
  },
];

export function CrewHero() {
  const [greetedId, setGreetedId] = useState<string | null>(null);

  // Auto-dismiss the speech bubble after 6s
  useEffect(() => {
    if (!greetedId) return;
    const t = setTimeout(() => setGreetedId(null), 6000);
    return () => clearTimeout(t);
  }, [greetedId]);

  function handleClick(slug: string) {
    setGreetedId(slug);
  }

  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 md:px-6 pt-8 md:pt-10 pb-10 md:pb-12">
      {/* Decorative blobs in the background */}
      <div
        aria-hidden
        className="absolute -top-8 left-1/4 h-56 w-56 rounded-full opacity-[0.06] blur-3xl"
        style={{ backgroundColor: "var(--coral)" }}
      />
      <div
        aria-hidden
        className="absolute top-24 right-1/4 h-72 w-72 rounded-full opacity-[0.05] blur-3xl"
        style={{ backgroundColor: "var(--teal)" }}
      />

      <div className="relative text-center max-w-3xl mx-auto mb-6 md:mb-8">
        <h1
          className="font-editorial text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-balance anim-fade-up"
          style={{ animationDelay: "0.05s", fontWeight: 700 }}
        >
          Say hi to your{" "}
          <span
            className="gradient-animated"
            style={{
              background:
                "linear-gradient(100deg, var(--coral), var(--copper) 25%, var(--terracotta) 45%, var(--plum) 60%, var(--indigo) 80%, var(--teal))",
              backgroundSize: "260% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Connect Crew.
          </span>
        </h1>
        <p
          className="mt-4 text-xs md:text-sm text-[var(--muted-strong)] leading-relaxed anim-fade-up max-w-xl mx-auto"
          style={{ animationDelay: "0.15s" }}
        >
          Never lose a connection again — the events you fly to, the emails you
          forget to answer, the WhatsApp chat that trails off, the Telegram
          group you joined and ghosted. Five AI Crew members look after all of
          it in the background.
        </p>
      </div>

      {/* Five gradient rectangle slots · large, even, full-width */}
      <div
        className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 anim-fade-up"
        style={{ animationDelay: "0.3s" }}
      >
        {characters.map((c, i) => {
          const greeted = greetedId === c.slug;
          const media = MEDIA_FILES[c.slug];
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => handleClick(c.slug)}
              className="relative group text-center focus:outline-none focus-visible:outline-2"
              aria-label={`Say hi to ${c.name}`}
            >
              {/* Speech bubble — pops above on click */}
              {greeted ? (
                <div
                  className="absolute left-1/2 -top-4 z-20 -translate-x-1/2 -translate-y-full w-56 md:w-64 anim-bubble-in"
                  style={{ pointerEvents: "none" }}
                >
                  <div
                    className="rounded-2xl p-4 text-left shadow-lg border bg-white"
                    style={{
                      borderColor: `color-mix(in srgb, ${c.color} 40%, transparent)`,
                    }}
                  >
                    <div
                      className="font-editorial text-base leading-snug mb-1"
                      style={{ color: c.color }}
                    >
                      {c.greeting}
                    </div>
                    <div className="text-xs text-[var(--muted-strong)] leading-relaxed">
                      {c.blurb}
                    </div>
                  </div>
                  <svg
                    viewBox="0 0 20 12"
                    className="absolute left-1/2 -bottom-[10px] -translate-x-1/2"
                    width="20"
                    height="12"
                    aria-hidden
                  >
                    <path
                      d="M0 0 L10 12 L20 0 Z"
                      fill="white"
                      stroke={`color-mix(in srgb, ${c.color}, transparent 60%)`}
                      strokeWidth="0.5"
                    />
                  </svg>
                </div>
              ) : null}

              {/* Gradient rectangle slot — media goes here */}
              <div
                className="aspect-[2/3] relative overflow-hidden rounded-2xl md:rounded-3xl transition-transform duration-300 group-hover:-translate-y-1"
                style={{
                  background: `linear-gradient(180deg, color-mix(in srgb, ${c.color} 22%, transparent) 0%, color-mix(in srgb, ${c.color} 4%, transparent) 45%, color-mix(in srgb, ${c.color} 2%, transparent) 70%, color-mix(in srgb, ${c.color} 18%, transparent) 100%)`,
                }}
              >
                {/* Media slot — renders user-provided image or video when configured */}
                {media.kind === "image" && media.ext ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={`/crew/${c.slug}.${media.ext}`}
                    alt={c.name}
                    className="absolute inset-0 h-full w-full object-cover select-none"
                    draggable={false}
                  />
                ) : null}
                {media.kind === "video" && media.ext ? (
                  <video
                    src={`/crew/${c.slug}.${media.ext}`}
                    className="absolute inset-0 h-full w-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : null}

                {/* Placeholder content when no media yet */}
                {media.kind === null ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-between p-5 text-center">
                    <div
                      className="font-mono text-[10px] uppercase tracking-widest self-start"
                      style={{ color: c.color, opacity: 0.85 }}
                    >
                      0{i + 1}
                    </div>
                    <div>
                      <div
                        className="font-editorial text-lg md:text-xl tracking-tight"
                        style={{ color: c.color, fontWeight: 700 }}
                      >
                        {c.name}
                      </div>
                    </div>
                    <div
                      className="font-mono text-[9px] uppercase tracking-widest"
                      style={{ color: c.color, opacity: 0.55 }}
                    >
                      media slot
                    </div>
                  </div>
                ) : null}

                {/* Subtle inner edge highlight */}
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-2xl md:rounded-3xl pointer-events-none"
                  style={{
                    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${c.color} 18%, transparent)`,
                  }}
                />
              </div>

              {/* Name caption below */}
              <div
                className={cn(
                  "mt-3 font-editorial text-sm md:text-base tracking-tight text-[var(--ink)] transition-colors",
                  greeted && "underline underline-offset-4",
                )}
                style={{
                  textDecorationColor: greeted ? c.color : undefined,
                  fontWeight: 600,
                }}
              >
                {c.name}
              </div>
              <div
                className="font-mono text-[9px] uppercase tracking-widest mt-0.5 opacity-0 group-hover:opacity-70 transition-opacity"
                style={{ color: c.color }}
              >
                click to learn more
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
