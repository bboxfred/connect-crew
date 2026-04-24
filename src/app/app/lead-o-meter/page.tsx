"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import {
  ArrowUpRight,
  Mail,
  MessageCircle,
  ScanLine,
  Thermometer,
  AtSign,
} from "lucide-react";
import {
  fixtureContacts,
  CREW,
  type FixtureContact,
  type Channel,
} from "@/lib/fixtures";
import { WarmthBar } from "@/components/warmth-bar";
import { cn } from "@/lib/utils";

type TierKey = "hot" | "warm" | "neutral" | "cold";

const TIERS: {
  key: TierKey;
  label: string;
  min: number;
  max: number;
  color: string; // hex-style for blending
}[] = [
  { key: "hot", label: "Hot", min: 75, max: 100, color: "var(--warmth-hot)" },
  { key: "warm", label: "Warm", min: 55, max: 74, color: "var(--warmth-warm)" },
  { key: "neutral", label: "Neutral", min: 35, max: 54, color: "var(--warmth-neutral)" },
  { key: "cold", label: "Cold", min: 0, max: 34, color: "var(--indigo)" },
];

const CHANNEL_ICON: Record<Channel, typeof Mail> = {
  email: Mail,
  telegram: MessageCircle,
  linkedin: ScanLine, // unused — LinkedIn is not a primary channel
  whatsapp: MessageCircle,
  card: ScanLine,
  social: AtSign,
};

const CHANNEL_LABEL: Record<Channel, string> = {
  email: "Gmail",
  telegram: "Telegram",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  card: "Card scan",
  social: "Social",
};

function tierFor(score: number): TierKey {
  if (score >= 75) return "hot";
  if (score >= 55) return "warm";
  if (score >= 35) return "neutral";
  return "cold";
}

export default function LeadOMeterPage() {
  const [channelFilter, setChannelFilter] = useState<Channel | "all">("all");

  const grouped = useMemo(() => {
    const filtered = channelFilter === "all"
      ? fixtureContacts
      : fixtureContacts.filter((c) => c.channel === channelFilter);

    const map: Record<TierKey, FixtureContact[]> = {
      hot: [],
      warm: [],
      neutral: [],
      cold: [],
    };
    for (const c of filtered) map[tierFor(c.warmth)].push(c);
    for (const k of Object.keys(map) as TierKey[]) {
      map[k].sort((a, b) => b.warmth - a.warmth);
    }
    return map;
  }, [channelFilter]);

  const totals = {
    hot: grouped.hot.length,
    warm: grouped.warm.length,
    neutral: grouped.neutral.length,
    cold: grouped.cold.length,
  };
  const totalAll = totals.hot + totals.warm + totals.neutral + totals.cold;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest mb-3"
          style={{ color: "var(--warmth-hot)" }}
        >
          <Thermometer className="h-3 w-3" strokeWidth={2} />
          Lead-O-Meter
        </div>
        <h1
          className="font-editorial text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight"
          style={{ fontWeight: 700, letterSpacing: "-0.03em" }}
        >
          Everyone, sorted by how{" "}
          <span style={{ color: "var(--warmth-hot)" }}>warm</span> they are.
        </h1>
        <p className="mt-4 text-base md:text-lg text-[var(--muted-strong)] leading-relaxed max-w-2xl">
          A live warmth score per contact — punctuation, timing, emoji,
          channel, silence. Hot at the top. Cold at the bottom.
        </p>

        {/* Tier totals strip */}
        <div className="mt-7 grid grid-cols-4 gap-2 max-w-xl">
          {TIERS.map((t) => (
            <div
              key={t.key}
              className="rounded-lg border px-3 py-2 text-center"
              style={{
                borderColor: `color-mix(in srgb, ${t.color} 25%, transparent)`,
                backgroundColor: `color-mix(in srgb, ${t.color} 8%, white)`,
              }}
            >
              <div
                className="font-editorial text-2xl tabular-nums"
                style={{ color: t.color, fontWeight: 700 }}
              >
                {totals[t.key]}
              </div>
              <div
                className="font-mono text-[10px] uppercase tracking-widest mt-0.5"
                style={{ color: t.color }}
              >
                {t.label}
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Channel filter */}
      <div className="mb-8 flex items-center gap-2 flex-wrap">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mr-1">
          Channel:
        </span>
        <ChannelFilterChip
          active={channelFilter === "all"}
          label={`All · ${fixtureContacts.length}`}
          onClick={() => setChannelFilter("all")}
        />
        {(["telegram", "email", "social"] as Channel[]).map((ch) => {
          const Icon = CHANNEL_ICON[ch];
          const n = fixtureContacts.filter((c) => c.channel === ch).length;
          return (
            <ChannelFilterChip
              key={ch}
              active={channelFilter === ch}
              icon={<Icon className="h-3 w-3" strokeWidth={2} />}
              label={`${CHANNEL_LABEL[ch]} · ${n}`}
              onClick={() => setChannelFilter(ch)}
            />
          );
        })}
      </div>

      {/* Gradient-backed tier stack */}
      <div
        className="rounded-3xl overflow-hidden border border-[var(--border)]"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--warmth-hot) 14%, white) 0%, color-mix(in srgb, var(--warmth-warm) 12%, white) 30%, color-mix(in srgb, var(--warmth-neutral) 12%, white) 62%, color-mix(in srgb, var(--indigo) 14%, white) 100%)",
        }}
      >
        {TIERS.map((tier, i) => {
          const contacts = grouped[tier.key];
          return (
            <TierBand
              key={tier.key}
              tier={tier}
              contacts={contacts}
              isLast={i === TIERS.length - 1}
            />
          );
        })}
      </div>

      {totalAll === 0 ? (
        <div className="mt-8 text-center py-16 border border-dashed border-[var(--border)] rounded-2xl">
          <p className="text-[var(--muted-strong)]">No contacts match this filter.</p>
        </div>
      ) : null}

      <p className="mt-10 text-center font-mono text-[11px] text-[var(--muted)]">
        Tap any contact to open its detail + Warmth timeline.
      </p>
    </div>
  );
}

// ─── Tier band ─────────────────────────────────────────────────────────────

function TierBand({
  tier,
  contacts,
  isLast,
}: {
  tier: (typeof TIERS)[number];
  contacts: FixtureContact[];
  isLast: boolean;
}) {
  return (
    <section
      className={cn(
        "flex gap-3 md:gap-5 p-4 md:p-6",
        !isLast ? "border-b border-white/30" : "",
      )}
    >
      {/* Sideways tier label */}
      <div className="shrink-0 w-8 md:w-10 flex items-center justify-center">
        <div
          className="font-editorial uppercase whitespace-nowrap select-none"
          style={{
            color: tier.color,
            fontSize: "1.25rem",
            fontWeight: 700,
            letterSpacing: "0.3em",
            transform: "rotate(-90deg)",
            transformOrigin: "center",
          }}
          aria-label={`${tier.label} tier`}
        >
          {tier.label}
        </div>
      </div>

      {/* Cards grid */}
      <div className="flex-1 min-w-0">
        {contacts.length === 0 ? (
          <div className="py-6 text-sm text-[var(--muted)] italic">
            None in this tier right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {contacts.map((c) => (
              <LeadCard key={c.id} contact={c} tierColor={tier.color} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Lead card ─────────────────────────────────────────────────────────────

function LeadCard({
  contact,
  tierColor,
}: {
  contact: FixtureContact;
  tierColor: string;
}) {
  const lastCrew = CREW[contact.last_crew];
  const ChannelIcon = CHANNEL_ICON[contact.channel];

  return (
    <Link
      href={`/app/contacts/${contact.id}`}
      className="group relative block rounded-xl border bg-white p-3 md:p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md overflow-hidden"
      style={{
        borderColor: `color-mix(in srgb, ${tierColor} 22%, var(--border))`,
      }}
    >
      {/* Coloured left spine — last-touch Crew */}
      <div
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
        style={{ backgroundColor: lastCrew.color }}
      />

      <div className="pl-2 space-y-2">
        {/* Contact header */}
        <div className="flex items-start gap-2.5">
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0"
            style={{
              backgroundColor: `color-mix(in srgb, ${lastCrew.color} 14%, white)`,
              color: lastCrew.color,
            }}
          >
            {contact.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-[var(--foreground)] truncate text-sm">
              {contact.name}
            </div>
            <div className="text-xs text-[var(--muted)] truncate">
              {contact.company}
            </div>
          </div>
          <ArrowUpRight
            className="h-3.5 w-3.5 text-[var(--muted)] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            strokeWidth={2}
          />
        </div>

        {/* Warmth bar */}
        <WarmthBar score={contact.warmth} animated={false} />

        {/* Bottom meta */}
        <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-[var(--muted)]">
          <span className="inline-flex items-center gap-1 shrink-0">
            <ChannelIcon className="h-3 w-3" strokeWidth={2} />
            <span>{CHANNEL_LABEL[contact.channel]}</span>
          </span>
          <span>{contact.last_contact} ago</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Channel filter chip ──────────────────────────────────────────────────

function ChannelFilterChip({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all",
        active
          ? "bg-[var(--ink)] text-white"
          : "bg-white border border-[var(--border)] text-[var(--muted-strong)] hover:border-[var(--foreground)]",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
