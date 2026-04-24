"use client";

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
// All 6 activated Apr 24 — cinematic portraits generated via
// Genspark nano-banana-pro, served from /public/hero/{slug}.png
const MEDIA_FILES: Record<string, { ext: string; kind: MediaKind }> = {
  "master-connect": { ext: "png", kind: "image" },
  scan: { ext: "mp4", kind: "video" },
  signals: { ext: "png", kind: "image" },
  inbound: { ext: "png", kind: "image" },
  social: { ext: "png", kind: "image" },
  scribe: { ext: "png", kind: "image" },
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
      "Set your own secret cues — e.g. drop \"Hi!\" in your opening message to a contact — and I'll fire a richer follow-up draft the next day, staged in Gmail for your approval.",
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
          const media = MEDIA_FILES[c.slug];
          // Stagger which float cadence each card uses so the 6 don't
          // move in lockstep.
          const floatClass =
            i % 3 === 0
              ? "anim-crew-float-a"
              : i % 3 === 1
                ? "anim-crew-float-b"
                : "anim-crew-float-c";
          return (
            <div
              key={c.slug}
              className={cn(
                "relative group text-center",
                floatClass,
              )}
            >
              {/* 3D flip container — hover flips to back face with blurb */}
              <div
                className="aspect-[2/3] relative [perspective:1200px]"
              >
                <div
                  className="absolute inset-0 transition-transform duration-700 ease-out group-hover:[transform:rotateY(180deg)]"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* FRONT face — portrait media */}
                  <div
                    className="absolute inset-0 rounded-2xl md:rounded-3xl overflow-hidden"
                    style={{
                      WebkitBackfaceVisibility: "hidden",
                      backfaceVisibility: "hidden",
                      background: `linear-gradient(180deg, color-mix(in srgb, ${c.color} 22%, transparent) 0%, color-mix(in srgb, ${c.color} 4%, transparent) 45%, color-mix(in srgb, ${c.color} 2%, transparent) 70%, color-mix(in srgb, ${c.color} 18%, transparent) 100%)`,
                    }}
                  >
                    {media.kind === "image" && media.ext ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={`/hero/${c.slug}.${media.ext}`}
                        alt={c.name}
                        className="absolute inset-0 h-full w-full object-cover select-none"
                        draggable={false}
                      />
                    ) : null}
                    {media.kind === "video" && media.ext ? (
                      <video
                        src={`/hero/${c.slug}.${media.ext}`}
                        className="absolute inset-0 h-full w-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : null}

                    {media.kind === null ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-between p-5 text-center">
                        <div
                          className="font-mono text-[10px] uppercase tracking-widest self-start"
                          style={{ color: c.color, opacity: 0.85 }}
                        >
                          0{i + 1}
                        </div>
                        <div
                          className="font-editorial text-lg md:text-xl tracking-tight"
                          style={{ color: c.color, fontWeight: 700 }}
                        >
                          {c.name}
                        </div>
                        <div
                          className="font-mono text-[9px] uppercase tracking-widest"
                          style={{ color: c.color, opacity: 0.55 }}
                        >
                          media slot
                        </div>
                      </div>
                    ) : null}

                    {/* Inner edge highlight */}
                    <div
                      aria-hidden
                      className="absolute inset-0 rounded-2xl md:rounded-3xl pointer-events-none"
                      style={{
                        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${c.color} 18%, transparent)`,
                      }}
                    />
                    {/* Subtle "hover to flip" hint — fades out on hover */}
                    <div
                      className="absolute bottom-3 left-0 right-0 text-center font-mono text-[9px] uppercase tracking-widest pointer-events-none transition-opacity duration-300 group-hover:opacity-0"
                      style={{
                        color: "white",
                        textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                        opacity: 0.85,
                      }}
                    >
                      hover
                    </div>
                  </div>

                  {/* BACK face — greeting + blurb on a solid crew-tinted
                      card so text reads clearly */}
                  <div
                    className="absolute inset-0 rounded-2xl md:rounded-3xl overflow-hidden p-4 md:p-5 flex flex-col justify-center text-left"
                    style={{
                      WebkitBackfaceVisibility: "hidden",
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      background: `linear-gradient(165deg, color-mix(in srgb, ${c.color} 95%, black) 0%, color-mix(in srgb, ${c.color} 70%, black) 100%)`,
                      boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${c.color} 60%, white)`,
                    }}
                  >
                    <div
                      className="font-mono text-[9px] uppercase tracking-widest text-white/70 mb-2"
                    >
                      0{i + 1} · {c.name}
                    </div>
                    <div
                      className="font-editorial text-sm md:text-base leading-snug text-white mb-2"
                      style={{ fontWeight: 600 }}
                    >
                      {c.greeting}
                    </div>
                    <div className="text-[11px] md:text-xs leading-relaxed text-white/85">
                      {c.blurb}
                    </div>
                  </div>
                </div>
              </div>

              {/* Name caption below */}
              <div
                className="mt-3 font-editorial text-sm md:text-base tracking-tight text-[var(--ink)]"
                style={{ fontWeight: 600 }}
              >
                {c.name}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
