import Link from "next/link";
import {
  Users,
  Share2,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Handshake,
  Gem,
  Clock,
  UserPlus,
  LogOut,
} from "lucide-react";

// ─── /teams — marketing page, full-width ──────────────────────────────────

const TEAL = "var(--teal)";

export default function TeamsPage() {
  return (
    <main className="flex-1 flex flex-col paper-grain relative">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute top-[12%] -left-24 h-96 w-96 rounded-full blur-3xl opacity-[0.09] anim-drift-1"
          style={{ backgroundColor: TEAL }}
        />
        <div
          className="absolute top-[55%] -right-20 h-80 w-80 rounded-full blur-3xl opacity-[0.07] anim-drift-2"
          style={{ backgroundColor: "var(--coral)" }}
        />
      </div>
      <div className="h-1 w-full rail-animated" aria-hidden />

      {/* Hero */}
      <section className="relative w-full">
        <div className="mx-auto max-w-7xl px-6 pt-20 md:pt-28 pb-20 md:pb-24">
          <div
            className="font-mono text-[10px] md:text-xs tracking-widest uppercase mb-6 anim-fade-up inline-flex items-center gap-2 px-3 py-1 rounded-full"
            style={{
              color: TEAL,
              backgroundColor: `color-mix(in srgb, ${TEAL} 12%, white)`,
              border: `1px solid color-mix(in srgb, ${TEAL} 24%, transparent)`,
            }}
          >
            <Users className="h-3 w-3" strokeWidth={1.75} />
            Tier 02 · Teams
          </div>
          <h1
            className="font-editorial text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight anim-fade-up max-w-5xl"
            style={{ animationDelay: "0.05s", fontWeight: 700 }}
          >
            One graph. One Crew.{" "}
            <span style={{ color: TEAL }}>The whole team</span> working the same people.
          </h1>
          <p
            className="mt-6 text-base md:text-xl text-[var(--muted-strong)] leading-relaxed anim-fade-up max-w-2xl"
            style={{ animationDelay: "0.12s" }}
          >
            Founders, partners, BD, IR, community leads. Every teammate&apos;s
            inbox, card pile, and Telegram funnels into one shared relationship
            graph. Master Connect answers questions anyone can ask. No more
            double-touches, no more tribal knowledge stuck in someone&apos;s head.
          </p>
          <div
            className="mt-8 flex items-center gap-4 anim-fade-up flex-wrap"
            style={{ animationDelay: "0.18s" }}
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: TEAL }}
            >
              Book a team demo
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
            <Link
              href="/app/dashboard/teams"
              className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-colors hover:bg-[var(--paper)]"
              style={{ borderColor: TEAL, color: TEAL }}
            >
              See the team dashboard
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>

      {/* Shared-graph visualization */}
      <section className="border-t border-[var(--border)] w-full">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-3xl mb-14">
            <div className="font-mono text-xs tracking-widest uppercase mb-5" style={{ color: TEAL }}>
              The shared graph
            </div>
            <h2 className="font-editorial text-3xl md:text-5xl leading-[1.05] tracking-tight">
              Four people. One view of every relationship.
            </h2>
            <p className="mt-5 text-base md:text-lg text-[var(--muted-strong)] leading-relaxed">
              Before: four inboxes, four Telegrams, four spreadsheets, and constant &ldquo;did anyone ever talk to X?&rdquo; Slack pings. After: one graph every teammate contributes to and queries through Master Connect.
            </p>
          </div>
          <div
            className="rounded-3xl border-2 p-6 md:p-10 overflow-hidden relative"
            style={{
              backgroundColor: `color-mix(in srgb, ${TEAL} 4%, white)`,
              borderColor: `color-mix(in srgb, ${TEAL} 22%, transparent)`,
            }}
          >
            <SharedGraphDiagram />
          </div>
        </div>
      </section>

      {/* Feature tiles */}
      <section className="border-t border-[var(--border)] w-full">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-3xl mb-12">
            <div className="font-mono text-xs tracking-widest uppercase mb-5" style={{ color: TEAL }}>
              What teams get
            </div>
            <h2 className="font-editorial text-3xl md:text-5xl leading-[1.05] tracking-tight">
              The shape of a team that never double-touches.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureTile Icon={Share2} title="One shared graph" body="Every contact, every interaction, visible to every teammate. When Sarah meets someone Monday, Ahmed knows Tuesday." />
            <FeatureTile Icon={AlertTriangle} title="Duplicate-touch alerts" body="If you and a teammate both have pending drafts to the same person, Master Connect surfaces the conflict before either of you hits send." />
            <FeatureTile Icon={Sparkles} title="Team Master Connect" body={"Ask the graph across the whole team: \u201cWho knows someone at Sequoia?\u201d — ranked answers with owner attribution."} />
            <FeatureTile Icon={ShieldCheck} title="SSO · SCIM · audit log" body="SAML/OIDC identity provider integration. Per-seat permissions. Full audit trail of every draft, approval, and send." />
          </div>
        </div>
      </section>

      {/* Morning workflow timeline */}
      <section
        className="border-t border-[var(--border)] w-full"
        style={{
          background: `linear-gradient(180deg, transparent 0%, color-mix(in srgb, ${TEAL} 5%, transparent) 50%, transparent 100%)`,
        }}
      >
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-3xl mb-14">
            <div className="font-mono text-xs tracking-widest uppercase mb-5" style={{ color: TEAL }}>
              The morning ritual · team edition
            </div>
            <h2 className="font-editorial text-3xl md:text-5xl leading-[1.05] tracking-tight">
              Ten minutes. Four brains. Zero overlap.
            </h2>
            <p className="mt-5 text-base md:text-lg text-[var(--muted-strong)] leading-relaxed">
              Each teammate&apos;s Crew stages drafts overnight. Morning Connect
              shows everyone&apos;s pending work side-by-side, tagged by owner.
              Duplicate-touch alerts surface before sends.
            </p>
          </div>
          <TimelineFlow />
        </div>
      </section>

      {/* Duplicate-touch before/after */}
      <section className="border-t border-[var(--border)] w-full">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-3xl mb-14">
            <div className="font-mono text-xs tracking-widest uppercase mb-5" style={{ color: TEAL }}>
              The duplicate-touch problem
            </div>
            <h2 className="font-editorial text-3xl md:text-5xl leading-[1.05] tracking-tight">
              The awkward email you&apos;ll never send again.
            </h2>
            <p className="mt-5 text-base md:text-lg text-[var(--muted-strong)] leading-relaxed">
              Two teammates mailing the same contact within 48 hours is the #1 relationship-damage event at a growing team. Master Connect catches it before it happens.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div
              className="rounded-3xl border-2 p-6 md:p-8"
              style={{
                borderColor: "color-mix(in srgb, var(--warmth-cold) 30%, transparent)",
                backgroundColor: "color-mix(in srgb, var(--warmth-cold) 5%, white)",
              }}
            >
              <div className="font-mono text-[10px] uppercase tracking-widest mb-4" style={{ color: "var(--warmth-cold)" }}>
                Without Connect Crew
              </div>
              <div className="space-y-3 text-sm">
                <ConvoLine who="Sarah" time="Mon 10:02" msg="Hey Priya — want to grab coffee this week to talk Sequoia SEA partnership?" />
                <ConvoLine who="Ahmed" time="Mon 14:47" msg="Hi Priya! Wondering if you'd be open to a chat about our fintech angle?" />
                <ConvoLine who="Priya" time="Mon 14:58" msg={"\uD83D\uDC40 are you all... the same company?"} italic />
                <ConvoLine who="—" time="Priya → mute" msg="Relationship temperature drops" negative />
              </div>
            </div>
            <div
              className="rounded-3xl border-2 p-6 md:p-8"
              style={{
                borderColor: `color-mix(in srgb, ${TEAL} 30%, transparent)`,
                backgroundColor: `color-mix(in srgb, ${TEAL} 5%, white)`,
              }}
            >
              <div className="font-mono text-[10px] uppercase tracking-widest mb-4 flex items-center gap-1.5" style={{ color: TEAL }}>
                <Sparkles className="h-3 w-3" strokeWidth={1.75} />
                With Connect Crew
              </div>
              <div className="space-y-3 text-sm">
                <ConvoLine who="Ahmed" time="Mon 14:47" msg="drafts reply to Priya on Sequoia SEA partnership" pending />
                <div
                  className="rounded-xl p-3 text-xs flex items-start gap-2"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--warmth-warm) 10%, white)",
                    border: "1px solid color-mix(in srgb, var(--warmth-warm) 28%, transparent)",
                  }}
                >
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={1.75} style={{ color: "var(--warmth-warm)" }} />
                  <div>
                    <span className="font-medium">Duplicate-touch alert.</span> Sarah has a pending Priya draft from 2h ago. Coordinate before sending?
                  </div>
                </div>
                <ConvoLine who="Ahmed" time="Mon 14:48" msg="yields. Sarah sends her draft first. Ahmed queues a follow-up for next week." />
                <ConvoLine who="Priya" time="Mon 15:20" msg="Loved that — let's talk Thursday 3pm!" positive />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Master Connect query cards */}
      <section className="border-t border-[var(--border)] w-full">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-3xl mb-12">
            <div className="font-mono text-xs tracking-widest uppercase mb-5" style={{ color: "var(--plum)" }}>
              Master Connect · scoped to your team
            </div>
            <h2 className="font-editorial text-3xl md:text-5xl leading-[1.05] tracking-tight">
              Ask the team graph anything.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QueryCard query="Who on the team has warm contacts at Sequoia SEA?" />
            <QueryCard query="Which teammate last spoke to someone at METI Japan?" />
            <QueryCard query="Find duplicate-touch risks across this week's drafts" />
            <QueryCard query="Top warm contacts across the whole team" />
            <QueryCard query="Who should we re-engage for Series B outreach?" />
            <QueryCard query="Rank our top fintech prospects by team-wide warmth" />
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="border-t border-[var(--border)] w-full">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-3xl mb-12">
            <div className="font-mono text-xs tracking-widest uppercase mb-5" style={{ color: TEAL }}>
              Built for
            </div>
            <h2 className="font-editorial text-3xl md:text-5xl leading-[1.05] tracking-tight">
              Teams where relationships are the asset.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UseCaseCard
              Icon={Briefcase}
              persona="Founding teams"
              title="Three people chasing the same fifty angels"
              body="Two co-founders + head of BD courting identical fundraising targets. One shared graph. Master Connect routes hot intros to whoever's warmest."
              color={TEAL}
            />
            <UseCaseCard
              Icon={Handshake}
              persona="Partnerships + BD"
              title="Long-cycle nurture without the handoff tax"
              body="Deals take quarters, not weeks. Pass relationships between hunters and farmers without the contact ever noticing the handoff."
              color="var(--copper)"
            />
            <UseCaseCard
              Icon={Gem}
              persona="Investment teams"
              title="Deal flow + LP engagement on one graph"
              body="Every partner sees every touchpoint. Never double-pitch an LP. Never miss a warm intro because it lived in the wrong partner's inbox."
              color="var(--plum)"
            />
          </div>
        </div>
      </section>

      {/* Offboarding feature block */}
      <section className="border-t border-[var(--border)] w-full">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div
            className="rounded-3xl border-2 p-8 md:p-12 relative overflow-hidden"
            style={{
              backgroundColor: `color-mix(in srgb, ${TEAL} 5%, white)`,
              borderColor: `color-mix(in srgb, ${TEAL} 25%, transparent)`,
            }}
          >
            <div
              aria-hidden
              className="absolute -top-20 -right-20 h-64 w-64 rounded-full blur-3xl opacity-30"
              style={{ backgroundColor: TEAL }}
            />
            <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: TEAL }}>
                  Offboarding without loss
                </div>
                <h3 className="font-editorial text-2xl md:text-4xl tracking-tight" style={{ fontWeight: 700, letterSpacing: "-0.025em" }}>
                  When someone leaves, the relationships stay.
                </h3>
                <p className="mt-4 text-base md:text-lg text-[var(--muted-strong)] leading-relaxed max-w-3xl">
                  Traditional CRMs lose whatever the departing teammate didn&apos;t log. Connect Crew&apos;s shared graph keeps every contact, every Warmth score, every interaction trace. The next hire onboards into context, not a vacuum.
                </p>
              </div>
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div
                    className="h-14 w-14 rounded-2xl flex items-center justify-center"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${TEAL} 14%, white)`,
                      border: `1px solid color-mix(in srgb, ${TEAL} 30%, transparent)`,
                    }}
                  >
                    <LogOut className="h-6 w-6" strokeWidth={1.5} style={{ color: TEAL }} />
                  </div>
                  <ArrowRight className="h-5 w-5" strokeWidth={1.75} style={{ color: "var(--muted)" }} />
                  <div
                    className="h-14 w-14 rounded-2xl flex items-center justify-center"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${TEAL} 14%, white)`,
                      border: `1px solid color-mix(in srgb, ${TEAL} 30%, transparent)`,
                    }}
                  >
                    <UserPlus className="h-6 w-6" strokeWidth={1.5} style={{ color: TEAL }} />
                  </div>
                </div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  Graph persists · context preserved
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance strip */}
      <section className="border-t border-[var(--border)] w-full">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "SSO · SAML/OIDC", note: "identity provider ready" },
              { label: "SCIM provisioning", note: "auto onboard/offboard" },
              { label: "Audit log", note: "every send, draft, approval" },
              { label: "PDPA · GDPR", note: "compliant by architecture" },
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
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: TEAL }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--border)] w-full">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28 text-center">
          <h2 className="font-editorial text-3xl md:text-5xl tracking-tight" style={{ fontWeight: 700 }}>
            Your team&apos;s graph is ready when you are.
          </h2>
          <p className="mt-5 text-base md:text-lg text-[var(--muted-strong)] max-w-2xl mx-auto leading-relaxed">
            Book a 30-minute demo. We&apos;ll walk you through Morning Connect with your actual team, then help you migrate your existing CRM within the first week.
          </p>
          <div className="mt-8">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-medium text-white hover:opacity-90 transition-opacity shadow-lg"
              style={{ backgroundColor: TEAL }}
            >
              Book a team demo
              <ArrowRight className="h-5 w-5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] w-full">
        <div className="mx-auto max-w-7xl px-6 py-10 flex items-center justify-between">
          <Link href="/" className="font-mono text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            ← connectcrew.ai
          </Link>
          <span className="font-mono text-xs text-[var(--muted)]">
            Tier 02 · Teams · Push to Prod
          </span>
        </div>
      </footer>
      <div className="h-1 w-full rail-animated" aria-hidden />
    </main>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────

function SharedGraphDiagram() {
  const teammates = [
    { id: "fl", name: "Freddy", initials: "FL", x: 15, y: 18, color: "var(--indigo)" },
    { id: "sc", name: "Sarah", initials: "SC", x: 85, y: 18, color: TEAL },
    { id: "ak", name: "Ahmed", initials: "AK", x: 15, y: 82, color: "var(--copper)" },
    { id: "mp", name: "Mira", initials: "MP", x: 85, y: 82, color: "var(--sage)" },
  ];
  const contacts = [
    { x: 35, y: 32 }, { x: 50, y: 25 }, { x: 65, y: 32 },
    { x: 30, y: 50 }, { x: 45, y: 50 }, { x: 60, y: 50 }, { x: 72, y: 52 },
    { x: 38, y: 68 }, { x: 52, y: 72 }, { x: 66, y: 68 },
    { x: 42, y: 42 }, { x: 58, y: 58 },
  ];
  return (
    <div className="w-full aspect-[16/9] relative">
      <svg
        viewBox="0 0 100 60"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        {teammates.flatMap((t, ti) =>
          contacts.map((c, ci) => (
            <line
              key={`${ti}-${ci}`}
              x1={t.x}
              y1={t.y * 0.6}
              x2={c.x}
              y2={c.y * 0.6}
              stroke={t.color}
              strokeWidth="0.15"
              opacity={(ci + ti) % 3 === 0 ? 0.45 : 0.15}
            />
          )),
        )}
        {contacts.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y * 0.6}
            r="1.2"
            fill="var(--warmth-warm)"
            stroke="white"
            strokeWidth="0.3"
          />
        ))}
        {teammates.map((t) => (
          <g key={t.id}>
            <circle cx={t.x} cy={t.y * 0.6} r="3.6" fill={t.color} stroke="white" strokeWidth="0.6" />
            <text
              x={t.x}
              y={t.y * 0.6 + 1}
              textAnchor="middle"
              fontSize="2"
              fill="white"
              fontWeight="600"
            >
              {t.initials}
            </text>
          </g>
        ))}
      </svg>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
        style={{ width: "min(260px, 42%)" }}
      >
        <div
          className="font-editorial text-2xl md:text-3xl"
          style={{ fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em" }}
        >
          847
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
          shared contacts
        </div>
      </div>
      {teammates.map((t) => (
        <div
          key={t.id}
          className="absolute font-mono text-[10px] md:text-xs uppercase tracking-wider"
          style={{
            left: `${t.x}%`,
            top: `${t.y}%`,
            transform: `translate(${t.x < 50 ? "10px" : "-110%"}, ${t.y < 50 ? "-18px" : "10px"})`,
            color: t.color,
            whiteSpace: "nowrap",
          }}
        >
          {t.name}
        </div>
      ))}
    </div>
  );
}

function TimelineFlow() {
  const steps = [
    { time: "06:00", who: "Claude", event: "Classifies overnight inbound across all 4 teammate channels" },
    { time: "08:00", who: "Sarah", event: "Arrives, opens Morning Connect — sees her 3 drafts + team context" },
    { time: "08:12", who: "Freddy", event: "Approves his 5 Messenger drafts with 'Approve all'" },
    { time: "08:15", who: "System", event: "Flags duplicate-touch: Ahmed + Freddy both on Priya" },
    { time: "08:18", who: "Ahmed", event: "Defers his draft, lets Freddy's go first" },
    { time: "08:30", who: "All", event: "Team fully caught up — 23 contacts touched, 0 conflicts" },
  ];
  return (
    <div className="relative">
      <div
        className="absolute left-[14px] md:left-[18px] top-0 bottom-0 border-l-2 border-dashed"
        style={{ borderColor: `color-mix(in srgb, ${TEAL} 30%, transparent)` }}
        aria-hidden
      />
      <ul className="space-y-5">
        {steps.map((s, i) => (
          <li
            key={i}
            className="relative pl-10 md:pl-12 anim-fade-up"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <span
              className="absolute left-0 top-1 h-7 w-7 md:h-9 md:w-9 rounded-full flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: TEAL }}
            >
              <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={1.75} />
            </span>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="font-mono text-sm tabular-nums font-medium" style={{ color: TEAL }}>
                {s.time}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                {s.who}
              </span>
            </div>
            <div className="text-base text-[var(--foreground)] leading-relaxed mt-1">
              {s.event}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeatureTile({
  Icon,
  title,
  body,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  title: string;
  body: string;
}) {
  return (
    <article
      className="rounded-2xl border p-6 flex flex-col gap-3 h-full"
      style={{
        borderColor: `color-mix(in srgb, ${TEAL} 22%, transparent)`,
        backgroundColor: "var(--surface)",
      }}
    >
      <div
        className="h-10 w-10 rounded-2xl flex items-center justify-center"
        style={{
          backgroundColor: `color-mix(in srgb, ${TEAL} 14%, white)`,
          border: `1px solid color-mix(in srgb, ${TEAL} 28%, transparent)`,
        }}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} style={{ color: TEAL }} />
      </div>
      <h3 className="font-editorial text-lg md:text-xl tracking-tight" style={{ fontWeight: 700 }}>
        {title}
      </h3>
      <p className="text-sm text-[var(--muted-strong)] leading-relaxed flex-1">
        {body}
      </p>
    </article>
  );
}

function ConvoLine({
  who,
  time,
  msg,
  italic,
  negative,
  positive,
  pending,
}: {
  who: string;
  time: string;
  msg: string;
  italic?: boolean;
  negative?: boolean;
  positive?: boolean;
  pending?: boolean;
}) {
  const tone = negative
    ? "var(--warmth-cold)"
    : positive
      ? "var(--warmth-hot)"
      : pending
        ? "var(--warmth-warm)"
        : "var(--ink)";
  return (
    <div className="flex gap-3 items-start">
      <div
        className="font-mono text-[10px] uppercase tracking-wider w-14 shrink-0 tabular-nums mt-0.5"
        style={{ color: tone }}
      >
        {who}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`text-[var(--foreground)] leading-snug${italic ? " italic text-[var(--muted-strong)]" : ""}${pending ? " text-[var(--muted-strong)]" : ""}`}
        >
          {msg}
        </div>
        <div className="font-mono text-[9px] text-[var(--muted)] mt-0.5">
          {time}
        </div>
      </div>
    </div>
  );
}

function QueryCard({ query }: { query: string }) {
  return (
    <article
      className="rounded-2xl border p-4 md:p-5 flex items-start gap-3"
      style={{
        borderColor: "color-mix(in srgb, var(--plum) 20%, transparent)",
        backgroundColor: "color-mix(in srgb, var(--plum) 4%, white)",
      }}
    >
      <Sparkles className="h-4 w-4 shrink-0 mt-1" strokeWidth={1.75} style={{ color: "var(--plum)" }} />
      <div className="font-editorial text-base md:text-lg leading-snug tracking-tight text-[var(--ink)]">
        {query}
      </div>
    </article>
  );
}

function UseCaseCard({
  Icon,
  persona,
  title,
  body,
  color,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  persona: string;
  title: string;
  body: string;
  color: string;
}) {
  return (
    <article
      className="rounded-2xl border-2 p-6 md:p-7 flex flex-col gap-4 h-full"
      style={{
        borderColor: `color-mix(in srgb, ${color} 25%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${color} 4%, white)`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: `color-mix(in srgb, ${color} 15%, white)`,
            border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
          }}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} style={{ color }} />
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color }}>
          {persona}
        </div>
      </div>
      <h3 className="font-editorial text-xl md:text-2xl tracking-tight leading-snug" style={{ fontWeight: 700 }}>
        {title}
      </h3>
      <p className="text-sm text-[var(--muted-strong)] leading-relaxed flex-1">
        {body}
      </p>
    </article>
  );
}
