"use client";

import Link from "next/link";
import {
  Sparkles,
  ScanLine,
  Activity,
  Mail,
  AtSign,
  Mic,
  ArrowRight,
} from "lucide-react";

// ─── Crew grid · 2×3 full-width ───────────────────────────────────────────
// Replaces the long alternating Crew stack on the landing page. Master
// Connect is tile #01 (plum, Chief). Five specialists follow.
//
// Each tile is self-contained with headline, tagline, and a "See it" CTA
// linking to the dedicated page inside /app/*.

type Tile = {
  slug: string;
  number: string;
  role: string; // "Chief" or "Specialist"
  name: string;
  color: string;
  headline: string;
  tagline: string;
  href: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
};

const tiles: Tile[] = [
  {
    slug: "master-connect",
    number: "00",
    role: "The Chief",
    name: "Master Connect",
    color: "var(--plum)",
    headline: "Ask the graph, in plain English.",
    tagline:
      "Natural-language query over every contact, every interaction. Ranked answers with reasoning. Works across personal, team, and portfolio scales.",
    href: "/app/master-connect",
    Icon: Sparkles,
  },
  {
    slug: "scan",
    number: "01",
    role: "Specialist",
    name: "Scanner",
    color: "var(--coral)",
    headline: "Business cards → enriched contacts.",
    tagline:
      "Claude reads the card. Genspark enriches from Crunchbase, press, company pages. Filed before you leave the venue.",
    href: "/app/scan",
    Icon: ScanLine,
  },
  {
    slug: "signals",
    number: "02",
    role: "Specialist",
    name: "Messenger",
    color: "var(--teal)",
    headline: "Reads every Telegram and WhatsApp inbound.",
    tagline:
      "Hi. vs Hi! vs Hi!! — three relationships, one word apart. Updates Warmth silently. Drafts replies that match the incoming energy.",
    href: "/app/signals",
    Icon: Activity,
  },
  {
    slug: "inbound",
    number: "03",
    role: "Specialist",
    name: "Mailbox",
    color: "var(--copper)",
    headline: "Cold email, qualified + drafted.",
    tagline:
      "Reads every unsolicited email against your ICP. Polite pass for no-fits. Draft-ready yes for good-fits. Never auto-books meetings.",
    href: "/app/inbound",
    Icon: Mail,
  },
  {
    slug: "social",
    number: "04",
    role: "Specialist",
    name: "Social Media",
    color: "var(--indigo)",
    headline: "Instagram · X · FB Messenger DMs.",
    tagline:
      "Captures inbound DMs in real time. Same Secret Signal rules as Messenger. Stages replies for Morning Connect. Never cold-DMs strangers.",
    href: "/app/social",
    Icon: AtSign,
  },
  {
    slug: "scribe",
    number: "05",
    role: "Specialist",
    name: "Scribe",
    color: "var(--sage)",
    headline: "Voice + meetings → structured memory.",
    tagline:
      "Plaud, Granola, Otter, a voice memo you drop in. Extracts commitments, links to contacts, stages follow-up drafts.",
    href: "/app/scribe",
    Icon: Mic,
  },
];

export function CrewGrid() {
  return (
    <section
      id="crew"
      className="border-t border-[var(--border)] w-full"
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-24 md:py-28">
        {/* Section header */}
        <div className="max-w-3xl mb-12 md:mb-14">
          <div className="font-mono text-xs tracking-widest uppercase text-[var(--muted)] mb-6">
            The Crew
          </div>
          <h2 className="font-editorial text-3xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
            A Chief + five specialists.
            <br />
            One graph. They never quit.
          </h2>
          <p className="mt-6 text-base md:text-lg text-[var(--muted-strong)] leading-relaxed">
            Each specialist has a narrow job and does it on every relevant
            input, forever. They write to the same graph. Master Connect sits
            above them and answers questions anyone on the team can ask.
          </p>
        </div>

        {/* 2×3 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {tiles.map((t, i) => (
            <CrewTile key={t.slug} tile={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CrewTile({ tile, index }: { tile: Tile; index: number }) {
  const { Icon } = tile;
  const isChief = tile.slug === "master-connect";
  return (
    <Link
      href={tile.href}
      className="group rounded-3xl border-2 p-7 md:p-8 relative overflow-hidden flex flex-col anim-fade-up transition-transform duration-300 hover:-translate-y-1"
      style={{
        borderColor: `color-mix(in srgb, ${tile.color} ${isChief ? 40 : 28}%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${tile.color} ${isChief ? 6 : 4}%, white)`,
        animationDelay: `${index * 0.06}s`,
        minHeight: 260,
        boxShadow: isChief
          ? `0 1px 0 rgba(26,24,22,0.03), 0 32px 80px -24px color-mix(in srgb, ${tile.color} 35%, transparent)`
          : `0 1px 0 rgba(26,24,22,0.03), 0 18px 48px -24px color-mix(in srgb, ${tile.color} 25%, transparent)`,
      }}
    >
      {/* Corner glow */}
      <div
        aria-hidden
        className="absolute -top-14 -right-14 h-40 w-40 rounded-full blur-3xl opacity-25 pointer-events-none"
        style={{ backgroundColor: tile.color }}
      />

      <div className="relative flex-1 flex flex-col">
        {/* Top row: number + role badge + icon */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: tile.color }}
            >
              {tile.role} · {tile.number}
            </span>
            {isChief ? (
              <span
                className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: tile.color,
                  color: "white",
                }}
              >
                ★ IP
              </span>
            ) : null}
          </div>
          <div
            className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `color-mix(in srgb, ${tile.color} 14%, white)`,
              border: `1px solid color-mix(in srgb, ${tile.color} 30%, transparent)`,
            }}
          >
            <Icon
              className="h-5 w-5"
              strokeWidth={1.75}
              style={{ color: tile.color }}
            />
          </div>
        </div>

        {/* Name */}
        <div
          className={`font-editorial tracking-tight mb-3 ${isChief ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"}`}
          style={{
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: tile.color,
          }}
        >
          {tile.name}
        </div>

        {/* Headline */}
        <p
          className="font-editorial text-lg md:text-xl leading-snug text-[var(--ink)] mb-3"
          style={{ fontWeight: 500 }}
        >
          {tile.headline}
        </p>

        {/* Tagline */}
        <p className="text-sm text-[var(--muted-strong)] leading-relaxed flex-1">
          {tile.tagline}
        </p>

        {/* CTA */}
        <div
          className="mt-6 pt-4 border-t flex items-center justify-between"
          style={{
            borderColor: `color-mix(in srgb, ${tile.color} 16%, transparent)`,
          }}
        >
          <span
            className="font-mono text-[10px] uppercase tracking-wider"
            style={{ color: tile.color }}
          >
            {isChief ? "Ask the graph" : `Open ${tile.name}`}
          </span>
          <span
            className="h-8 w-8 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1"
            style={{
              backgroundColor: tile.color,
            }}
          >
            <ArrowRight className="h-4 w-4 text-white" strokeWidth={2} />
          </span>
        </div>
      </div>
    </Link>
  );
}
