import Link from "next/link";
import {
  ArrowRight,
  User,
  Users,
  Building2,
} from "lucide-react";
import { CrewHero } from "@/components/crew-hero";
import { CueBranching } from "@/components/cue-branching";
import { CrewGrid } from "@/components/crew-grid";
import { MasterConnectLanding } from "@/components/master-connect-landing";
import { TierBlock } from "@/components/tier-block";
import { HomeLoader } from "@/components/home-loader";

const soloTier = {
  name: "Solo",
  label: "Tier · 01",
  heading: "A six-member Crew, running in your voice.",
  subtitle:
    "For the operator running their own relationships — founders, partners, creators, community leads juggling overlapping networks.",
  icon: User,
  color: "var(--terracotta)",
  gains: [
    "Six AI Crew members trained on your voice, your ICP, your Profile",
    "Every contact across Telegram, WhatsApp, Gmail, LinkedIn in one graph",
    "A ten-minute Morning Connect that keeps you on top of everyone",
    "Per-contact autonomy — auto-send, approve, or never-auto-draft",
  ],
  stopsLosing: [
    "Business cards buried in your camera roll",
    "Follow-ups you meant to send within 24 hours, but didn't",
    "Conversation context from three weeks ago",
    "Relationships that drift silently past the 60-day mark",
  ],
};

const teamTier = {
  name: "Team",
  label: "Tier · 02",
  heading: "Where the whole team works from one shared graph.",
  subtitle:
    "For founders, partners, BD, and IR — everyone who touches the same deal flow, collaborating on the same people instead of from separate inboxes.",
  icon: Users,
  color: "var(--teal)",
  gains: [
    "One shared graph across every teammate — the team sees the same contacts",
    "Coordinated outreach — the Crew knows who has already been in touch",
    "Per-seat autonomy, one unified Morning Connect stack for the whole team",
    "SSO, SCIM provisioning, audit log of every draft and send",
  ],
  stopsLosing: [
    "Years of relationships when a teammate leaves for a new venture",
    "Context when a new hire joins — the graph onboards them in a day",
    "Trust with contacts from clumsy, duplicated outreach",
    "Time rebuilding the same contact fields across three separate CRMs",
  ],
};

const enterpriseTier = {
  name: "Enterprise",
  label: "Tier · 03",
  heading: "One network, many companies. Shared intelligence, strict privacy.",
  subtitle:
    "For VCs, family offices, and holding companies. See who's connected to whom across everyone in your portfolio — without leaking contacts between the separate entities.",
  icon: Building2,
  color: "var(--indigo)",
  gains: [
    "See mutual connections across every company you own — who already knows the person you're trying to reach",
    "Strict walls between entities — each portfolio company's contacts stay private to them",
    "One admin console to decide who sees what, entity by entity",
    "Compliance-ready: custom agreements, data residency, SOC 2 on the roadmap",
    "We migrate your existing contact lists on day one",
  ],
  stopsLosing: [
    "Relationships when operators move between portfolio companies",
    "Valuable intros buried in individual partners' inboxes",
    "\"Who knows whom\" knowledge trapped in partners' heads",
    "Audit trail when a compliance or investor question comes up",
    "Strategic connections when companies merge, exit, or restructure",
  ],
};

export default function Home() {
  return (
    <main className="flex flex-col paper-grain">
      {/* Brand loading splash — fades out once fonts + visuals are ready */}
      <HomeLoader />

      {/* Top color rail — five Crew colors with a shimmer sweep */}
      <div className="h-1 w-full rail-animated" aria-hidden />

      {/* Live-activity ticker — subtle marquee of what the Crew is doing */}
      <div className="marquee border-b border-[var(--hairline)] bg-[var(--paper)]/40 py-2.5 font-mono text-[11px] text-[var(--muted-strong)]">
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, dup) => (
            <div key={dup} className="flex items-center gap-10 pr-10">
              {[
                ["Scanner", "filed Sofia Alencar from Helix Tech", "var(--coral)"],
                ["Messenger", "warmed Priya +6 after a Hi!!", "var(--teal)"],
                ["Mailbox", "qualified 3 cold emails overnight", "var(--copper)"],
                ["Social Media", "captured Kai Jensen DM from Instagram", "var(--indigo)"],
                ["Scribe", "captured 2 action items from your call", "var(--sage)"],
                ["Messenger", "detected drift on Wei Lin Chen (−7)", "var(--teal)"],
                ["Scanner", "read a voice note at 23:14", "var(--coral)"],
                ["Mailbox", "prepared 83-day check-in for Jamal Idris", "var(--copper)"],
              ].map(([crewName, msg, color], i) => (
                <span key={`${dup}-${i}`} className="flex items-center gap-2 whitespace-nowrap">
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: color as string }} />
                  <span className="uppercase tracking-wider" style={{ color: color as string }}>
                    {crewName}
                  </span>
                  <span>{msg}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ───────── Hero — animated Crew character line-up ───────── */}
      <CrewHero />

      {/* Primary CTA — jump straight into the product */}
      <div className="mx-auto w-full max-w-5xl px-6 pb-16 flex items-center justify-center">
        <Link
          href="/app"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-7 py-3.5 text-base font-medium text-[var(--background)] hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl"
        >
          Open Dashboard{" "}
          <ArrowRight className="h-5 w-5" strokeWidth={2} />
        </Link>
      </div>

      {/* ───────── What is Connect Crew · one-liner + paragraph ─────────
          Background: a looping Networking.mp4 with a warm-paper tint
          overlay so text reads cleanly on top. */}
      <section className="border-t border-[var(--border)] relative overflow-hidden">
        {/* Looping networking video backdrop */}
        <video
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
          src="/video/networking.mp4"
          autoPlay
          loop
          muted
          playsInline
          aria-hidden
        />
        {/* Readability overlay — warm-paper tint at partial opacity so
            the video is visible but text stays legible on any frame */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--background) 82%, transparent) 0%, color-mix(in srgb, var(--background) 68%, transparent) 45%, color-mix(in srgb, var(--background) 78%, transparent) 100%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-4xl px-6 py-20 md:py-24">
          <div
            className="font-mono text-xs tracking-widest uppercase mb-5"
            style={{ color: "var(--coral)" }}
          >
            What is Connect Crew
          </div>
          <h2 className="font-editorial text-3xl md:text-5xl leading-[1.05] tracking-tight mb-6">
            A Chief and a Crew of AI specialists that keep every
            relationship you&apos;ve ever made{" "}
            <span
              className="gradient-animated"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, var(--coral), var(--teal), var(--indigo))",
              }}
            >
              alive, warm, and queryable
            </span>
            .
          </h2>
          <p className="text-lg md:text-xl text-[var(--muted-strong)] leading-relaxed max-w-3xl">
            Scanner files the card. Messenger reads the cue. Mailbox
            qualifies the inbound. Social Media catches the DM. Scribe turns
            the voice note into a follow-up email. The Chief — Master
            Connect — lets anyone on your team ask the whole graph a
            question:{" "}
            <em>&ldquo;who has a warm contact at Sequoia?&rdquo;</em>
            &nbsp;Ten minutes in Morning Connect each day, and your
            relationships stop slipping through the cracks.
          </p>
        </div>
      </section>

      {/* ───────── The problem · narrow scrolling-marquee quote banner ───────── */}
      <section
        className="marquee border-t border-b border-[var(--border)] w-full py-4 md:py-5"
        style={{
          background:
            "linear-gradient(90deg, color-mix(in srgb, var(--coral) 6%, white) 0%, color-mix(in srgb, var(--terracotta) 4%, white) 100%)",
        }}
        aria-label="The problem"
      >
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, dup) => (
            <div
              key={dup}
              className="flex items-center gap-12 pr-12 whitespace-nowrap font-editorial text-xl md:text-2xl tracking-tight text-[var(--ink)]"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={`${dup}-${i}`}
                  className="flex items-center gap-4"
                  style={{ fontWeight: 500 }}
                >
                  <span className="text-[var(--coral)]">&ldquo;</span>You met{" "}
                  <span style={{ color: "var(--coral)" }}>forty-seven</span>{" "}
                  people this month. You will remember{" "}
                  <span style={{ color: "var(--ink)", fontWeight: 700 }}>eight</span>.
                  Your team of four will have lost another hundred and fifty
                  between you.
                  <span className="text-[var(--coral)]">&rdquo;</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mx-4">
                    · the problem ·
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Cue branching · Hi / Hi! / Hi!! → three replies ───────── */}
      <CueBranching />

      {/* ───────── The Crew · 2x3 grid with Master Connect as Chief ───────── */}
      <CrewGrid />

      {/* ───────── Master Connect · static demo section ───────── */}
      <MasterConnectLanding />

      {/* ───────── Morning Connect ───────── */}
      <section
        className="border-t border-[var(--border)] mx-auto w-full max-w-5xl px-6 py-24 md:py-28"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--butter) 45%, transparent) 40%, transparent 100%)",
        }}
      >
        <div className="max-w-2xl mb-14">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[10px] tracking-widest uppercase mb-6"
            style={{
              backgroundColor: "color-mix(in srgb, var(--gold) 14%, white)",
              color: "var(--gold)",
              border: "1px solid color-mix(in srgb, var(--gold) 30%, transparent)",
            }}
          >
            The daily ritual
          </div>
          <h2 className="font-editorial text-3xl md:text-5xl leading-[1.08] tracking-tight">
            Morning Connect.
            <br />
            Everything worth approving, in one place.
          </h2>
          <p className="mt-6 text-[var(--muted-strong)] leading-relaxed">
            The Crew compiles every draft you asked to review — Inbound
            replies, Warm follow-ups, Cold resurrections — into one stack for
            a single daily pass. Autonomy for the easy stuff, approval for
            anything that books your time. Ten minutes, or ten seconds, up to
            you.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 md:p-10 shadow-[0_1px_0_rgba(26,24,22,0.03),0_24px_60px_-32px_rgba(26,24,22,0.18)]">
          <div className="flex items-center justify-between mb-6 font-mono text-[10px] tracking-widest uppercase text-[var(--muted)]">
            <span>Morning Connect · draft 3 of 12</span>
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--terracotta) 14%, white)",
                color: "var(--terracotta)",
              }}
            >
              Warm · Telegram
            </span>
          </div>
          <div className="text-sm text-[var(--muted-strong)] mb-3">
            to · Priya Raghavan · Sequoia SEA
          </div>
          <p className="font-editorial text-2xl md:text-3xl leading-relaxed tracking-tight text-[var(--ink)]">
            &ldquo;Priya — great meeting at TOKEN2049. Loved your point about AI
            in SEA. Thursday 3pm for coffee? Happy to come to your side of
            town.&rdquo;
          </p>
          <div className="mt-8 pt-6 border-t border-[var(--hairline)] grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start md:items-center">
            <p className="text-sm text-[var(--muted-strong)] leading-relaxed">
              <span className="text-[var(--foreground)] font-medium">
                Why this draft ·{" "}
              </span>
              met 14 hours ago at a flagged event. Warmth 86 (hot). Her last
              message referenced AI × SEA — that phrase is mirrored. Thursday
              3pm is free on your calendar and matches your preferred slot.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-mono uppercase tracking-wider text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors">
                skip
              </button>
              <button className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-mono uppercase tracking-wider text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors">
                edit
              </button>
              <button
                className="rounded-full px-4 py-2 text-xs font-mono uppercase tracking-wider text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "var(--terracotta)" }}
              >
                approve
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* ───────── Three narratives: Solo → Team → Portfolio ───────── */}
      <section className="border-t border-[var(--border)] mx-auto w-full max-w-7xl px-6 py-24 md:py-28">
        <div className="max-w-3xl mb-14">
          <div className="font-mono text-xs tracking-widest uppercase text-[var(--muted)] mb-6">
            From solo to portfolio
          </div>
          <h2 className="font-editorial text-3xl md:text-5xl leading-[1.05] tracking-tight">
            <span style={{ color: "var(--terracotta)" }}>Works</span> for one.{" "}
            <span style={{ color: "var(--teal)" }}>Scales</span> for a team.{" "}
            <span style={{ color: "var(--indigo)" }}>Anchors</span> a whole
            portfolio.
          </h2>
          <p className="mt-6 text-base md:text-lg text-[var(--muted-strong)] leading-relaxed max-w-2xl">
            The same five Crew members and the same graph architecture,
            calibrated to three very different scales — a solo operator's
            phone, a small team's shared deal flow, a fund's entire portfolio.
            One product. Three jobs. Same daily ritual.
          </p>

          {/* Tier progression indicator */}
          <div className="mt-8 flex items-center gap-3 text-xs font-mono uppercase tracking-wider">
            <span
              className="inline-flex items-center gap-2"
              style={{ color: "var(--terracotta)" }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: "var(--terracotta)" }}
              />
              Solo
            </span>
            <span className="text-[var(--muted)]">→</span>
            <span
              className="inline-flex items-center gap-2"
              style={{ color: "var(--teal)" }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: "var(--teal)" }}
              />
              Team
            </span>
            <span className="text-[var(--muted)]">→</span>
            <span
              className="inline-flex items-center gap-2"
              style={{ color: "var(--indigo)" }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: "var(--indigo)" }}
              />
              Portfolio
            </span>
          </div>
        </div>

        {/* Three equal tier blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="reveal-on-scroll" style={{ animationDelay: "0s" }}>
            <TierBlock
              name={soloTier.name}
              label={soloTier.label}
              heading={soloTier.heading}
              subtitle={soloTier.subtitle}
              gains={soloTier.gains}
              stopsLosing={soloTier.stopsLosing}
              color={soloTier.color}
              Icon={soloTier.icon}
              variant="light"
              compact
            />
          </div>
          <div className="reveal-on-scroll" style={{ animationDelay: "0.12s" }}>
            <TierBlock
              name={teamTier.name}
              label={teamTier.label}
              heading={teamTier.heading}
              subtitle={teamTier.subtitle}
              gains={teamTier.gains}
              stopsLosing={teamTier.stopsLosing}
              color={teamTier.color}
              Icon={teamTier.icon}
              variant="light"
              compact
            />
          </div>
          <div className="reveal-on-scroll" style={{ animationDelay: "0.24s" }}>
            <TierBlock
              name={enterpriseTier.name}
              label={enterpriseTier.label}
              heading={enterpriseTier.heading}
              subtitle={enterpriseTier.subtitle}
              gains={enterpriseTier.gains}
              stopsLosing={enterpriseTier.stopsLosing}
              color={enterpriseTier.color}
              Icon={enterpriseTier.icon}
              variant="light"
              compact
            />
          </div>
        </div>

        {/* Compliance / trust strip */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "PDPA", note: "compliant" },
            { label: "GDPR", note: "compliant" },
            { label: "SOC 2 Type II", note: "on roadmap" },
            { label: "Data residency", note: "per-entity" },
          ].map((c) => (
            <div
              key={c.label}
              className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 flex items-center justify-between"
            >
              <div>
                <div className="font-editorial text-sm tracking-tight" style={{ fontWeight: 600 }}>
                  {c.label}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] mt-0.5">
                  {c.note}
                </div>
              </div>
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: "var(--sage)" }}
              />
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-[var(--muted)] text-center">
          Want the full Enterprise scoping pack?{" "}
          <a href="/contact" className="underline hover:text-[var(--foreground)] transition-colors">
            Book a 30-minute call
          </a>
          .
        </p>
      </section>

      <footer className="border-t border-[var(--border)] mx-auto w-full max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-[var(--muted)]">
            connectcrew.ai
          </span>
          <span className="font-mono text-xs text-[var(--muted)]">
            Push to Prod · April 24, 2026
          </span>
        </div>
      </footer>

      {/* Bottom color rail mirrors the top */}
      <div className="h-1 w-full rail-animated" aria-hidden />

      {/* Decorative drifting blobs — dynamic background motion */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute top-[20%] -left-16 h-72 w-72 rounded-full blur-3xl opacity-[0.08] anim-drift-1"
          style={{ backgroundColor: "var(--coral)" }}
        />
        <div
          className="absolute top-[60%] -right-20 h-80 w-80 rounded-full blur-3xl opacity-[0.07] anim-drift-2"
          style={{ backgroundColor: "var(--teal)" }}
        />
        <div
          className="absolute bottom-[10%] left-1/3 h-64 w-64 rounded-full blur-3xl opacity-[0.06] anim-drift-3"
          style={{ backgroundColor: "var(--copper)" }}
        />
      </div>
    </main>
  );
}
