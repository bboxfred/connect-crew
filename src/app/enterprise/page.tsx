import Link from "next/link";
import {
  Building2,
  Network,
  Lock,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  CheckCircle2,
  XCircle,
  Gem,
  Landmark,
  Briefcase,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  ClipboardCheck,
} from "lucide-react";
import {
  fixtureEcosystemSummary,
  fixtureVerticals,
  fixturePortcos,
} from "@/lib/fixtures";

// ─── /enterprise — marketing page, full-width, visual ─────────────────────

const INDIGO = "var(--indigo)";
const PLUM = "var(--plum)";

export default function EnterprisePage() {
  return (
    <main className="flex-1 flex flex-col paper-grain relative">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute top-[15%] -left-20 h-96 w-96 rounded-full blur-3xl opacity-[0.09] anim-drift-1"
          style={{ backgroundColor: INDIGO }}
        />
        <div
          className="absolute top-[55%] -right-20 h-80 w-80 rounded-full blur-3xl opacity-[0.06] anim-drift-2"
          style={{ backgroundColor: PLUM }}
        />
      </div>
      <div className="h-1 w-full rail-animated" aria-hidden />

      {/* Hero */}
      <section className="relative w-full">
        <div className="mx-auto max-w-7xl px-6 pt-20 md:pt-28 pb-20 md:pb-24">
          <div
            className="font-mono text-[10px] md:text-xs tracking-widest uppercase mb-6 anim-fade-up inline-flex items-center gap-2 px-3 py-1 rounded-full"
            style={{
              color: INDIGO,
              backgroundColor: `color-mix(in srgb, ${INDIGO} 12%, white)`,
              border: `1px solid color-mix(in srgb, ${INDIGO} 24%, transparent)`,
            }}
          >
            <Building2 className="h-3 w-3" strokeWidth={1.75} />
            Tier 03 · Enterprise · Funds + Family Offices + Portfolios
          </div>
          <h1
            className="font-editorial text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight anim-fade-up max-w-5xl"
            style={{ animationDelay: "0.05s", fontWeight: 700 }}
          >
            Your ecosystem,{" "}
            <span style={{ color: INDIGO }}>made queryable</span>.
            <br />
            Without breaking the walls between entities.
          </h1>
          <p
            className="mt-6 text-base md:text-xl text-[var(--muted-strong)] leading-relaxed anim-fade-up max-w-3xl"
            style={{ animationDelay: "0.12s" }}
          >
            Every portfolio company runs its own Connect Crew in its own private
            graph. You — the fund — see aggregate metadata only. Master Connect
            answers fund-level questions. Intro requests flow through a two-gate
            governance model: your approval, then the contact owner&apos;s. The
            operating-partner role, productised.
          </p>
          <div
            className="mt-8 flex items-center gap-4 anim-fade-up flex-wrap"
            style={{ animationDelay: "0.18s" }}
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: INDIGO }}
            >
              Book a fund demo
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
            <Link
              href="/app/dashboard/enterprise"
              className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-colors hover:bg-[var(--paper)]"
              style={{ borderColor: INDIGO, color: INDIGO }}
            >
              See the admin console
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>

          {/* Hero stat row */}
          <div
            className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 anim-fade-up"
            style={{ animationDelay: "0.24s" }}
          >
            <HeroStat value="14" label="portfolio companies" />
            <HeroStat value="5" label="verticals · ecosystem" />
            <HeroStat value="2,847" label="aggregate warm contacts" />
            <HeroStat value={fixtureEcosystemSummary.ecosystem_roi_usd_formatted} label="ROI · this quarter" />
          </div>
        </div>
      </section>

      {/* Ecosystem hierarchy */}
      <section className="border-t border-[var(--border)] w-full">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-3xl mb-14">
            <div className="font-mono text-xs tracking-widest uppercase mb-5" style={{ color: INDIGO }}>
              The ecosystem shape
            </div>
            <h2 className="font-editorial text-3xl md:text-5xl leading-[1.05] tracking-tight">
              Parent · verticals · portcos. Queryable without merging.
            </h2>
            <p className="mt-5 text-base md:text-lg text-[var(--muted-strong)] leading-relaxed">
              Each portco is an independent tenant with its own private graph.
              The parent entity sees only what each portco opts in to publish to
              the ecosystem directory. Master Connect routes fund-level
              questions through this directory — aggregate metadata, not names.
            </p>
          </div>
          <div
            className="rounded-3xl border-2 p-6 md:p-10 overflow-hidden relative"
            style={{
              backgroundColor: `color-mix(in srgb, ${INDIGO} 4%, white)`,
              borderColor: `color-mix(in srgb, ${INDIGO} 22%, transparent)`,
            }}
          >
            <EcosystemHierarchy />
          </div>
        </div>
      </section>

      {/* Two-gate flow diagram */}
      <section
        className="border-t border-[var(--border)] w-full"
        style={{
          background: `linear-gradient(180deg, transparent 0%, color-mix(in srgb, ${INDIGO} 5%, transparent) 50%, transparent 100%)`,
        }}
      >
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-3xl mb-14">
            <div className="font-mono text-xs tracking-widest uppercase mb-5" style={{ color: INDIGO }}>
              Two-gate intro governance
            </div>
            <h2 className="font-editorial text-3xl md:text-5xl leading-[1.05] tracking-tight">
              The operating-partner role, productised.
            </h2>
            <p className="mt-5 text-base md:text-lg text-[var(--muted-strong)] leading-relaxed">
              Portco asks. Fund approves at Gate 1 (governance). Contact-holding
              portco approves at Gate 2 (ownership). Both must agree. Neither
              can force the other.
            </p>
          </div>

          <TwoGateFlow />
        </div>
      </section>

      {/* Visibility pyramid */}
      <section className="border-t border-[var(--border)] w-full">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-3xl mb-14">
            <div className="font-mono text-xs tracking-widest uppercase mb-5" style={{ color: INDIGO }}>
              Aggregate by default · granular by opt-in
            </div>
            <h2 className="font-editorial text-3xl md:text-5xl leading-[1.05] tracking-tight">
              Three layers of visibility. Each portco controls their own.
            </h2>
            <p className="mt-5 text-base md:text-lg text-[var(--muted-strong)] leading-relaxed">
              If the fund could see everything by default, no portco would opt
              in. The walls ARE the feature. What&apos;s novel is that the walls
              are queryable.
            </p>
          </div>
          <VisibilityPyramid />
        </div>
      </section>

      {/* Feature tiles */}
      <section className="border-t border-[var(--border)] w-full">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-3xl mb-12">
            <div className="font-mono text-xs tracking-widest uppercase mb-5" style={{ color: INDIGO }}>
              What funds get
            </div>
            <h2 className="font-editorial text-3xl md:text-5xl leading-[1.05] tracking-tight">
              Strategic oversight. Zero leakage. Measurable ROI.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureTile
              Icon={Network}
              title="Ecosystem Directory"
              body="Aggregate metadata from every portco — vertical coverage, warm-contact counts, ecosystem health. No individual contacts visible."
            />
            <FeatureTile
              Icon={ClipboardCheck}
              title="Gate 1 approval queue"
              body="Every cross-portco intro request lands in your admin console. Approve, deny, or request context. Configurable auto-approve rules."
            />
            <FeatureTile
              Icon={Lock}
              title="Cross-entity lockdown"
              body="Sister portcos can't message each other without explicit Gate 1 approval. Isolation is architectural — not policy."
            />
            <FeatureTile
              Icon={TrendingUp}
              title="Ecosystem ROI tracking"
              body="Every approved intro → meeting booked → partnership formed is tracked and rolled up quarterly for LP reporting."
            />
          </div>
        </div>
      </section>

      {/* Vertical breakdown */}
      <section className="border-t border-[var(--border)] w-full">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-3xl mb-12">
            <div className="font-mono text-xs tracking-widest uppercase mb-5" style={{ color: INDIGO }}>
              Vertical breakdown · live shape
            </div>
            <h2 className="font-editorial text-3xl md:text-5xl leading-[1.05] tracking-tight">
              A sample ecosystem: 14 portcos, 5 verticals.
            </h2>
            <p className="mt-5 text-base md:text-lg text-[var(--muted-strong)] leading-relaxed">
              This is what the fund admin sees at a glance. Each vertical rolls
              up portco count, aggregate warm contacts, and active intros.
              Click any vertical to drill into its portcos.
            </p>
          </div>
          <VerticalBreakdown />
        </div>
      </section>

      {/* Use cases */}
      <section className="border-t border-[var(--border)] w-full">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-3xl mb-12">
            <div className="font-mono text-xs tracking-widest uppercase mb-5" style={{ color: INDIGO }}>
              Built for
            </div>
            <h2 className="font-editorial text-3xl md:text-5xl leading-[1.05] tracking-tight">
              Where portfolio networks are the real asset.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UseCaseCard
              Icon={Gem}
              persona="Venture funds"
              title="Mapping the portfolio's network, not merging it"
              body="Portfolio founder asks for a warm Stripe intro. Fund admin sees: Kite + Polygon have warm contacts. Routes through whichever portco is warmest. Two gates approve. Intro flows in the portco's voice, not the fund's."
              color={INDIGO}
            />
            <UseCaseCard
              Icon={Landmark}
              persona="Family offices"
              title="One relationship view across every operating entity"
              body="12 operating companies, 40+ investments, principal wants the big picture. Each operating CEO sees only their entity. Legal sees the audit trail. Succession inherits every relationship intact."
              color={PLUM}
            />
            <UseCaseCard
              Icon={Briefcase}
              persona="Holding companies"
              title="Subsidiaries benefit from the parent's network"
              body="Parallel businesses under one roof, sometimes overlapping customers. Shared ecosystem for favourable intros. Hard walls where subsidiaries compete. Configurable per relationship pair."
              color="var(--coral)"
            />
          </div>
        </div>
      </section>

      {/* Compliance stack */}
      <section className="border-t border-[var(--border)] w-full">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-3xl mb-12">
            <div className="font-mono text-xs tracking-widest uppercase mb-5" style={{ color: INDIGO }}>
              Compliance + privacy posture
            </div>
            <h2 className="font-editorial text-3xl md:text-5xl leading-[1.05] tracking-tight">
              22-word privacy. Real enterprise guarantees underneath.
            </h2>
            <blockquote
              className="mt-6 pl-6 border-l-4 font-editorial text-xl md:text-2xl leading-snug tracking-tight text-[var(--ink)]"
              style={{ borderColor: INDIGO, fontWeight: 500 }}
            >
              Classification is local. The graph is the user&apos;s. Every action
              is human-approved or user-authorised. No training on user data,
              ever.
            </blockquote>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <ComplianceCard label="PDPA" note="Singapore · compliant" active />
            <ComplianceCard label="GDPR" note="EU · compliant" active />
            <ComplianceCard label="SOC 2 Type II" note="on roadmap · H2 2026" />
            <ComplianceCard label="Data residency" note="configurable per entity" active />
            <ComplianceCard label="Custom DPAs" note="per legal relationship" active />
            <ComplianceCard label="SSO · SAML / OIDC" note="identity provider ready" active />
            <ComplianceCard label="SCIM provisioning" note="auto onboard + offboard" active />
            <ComplianceCard label="Audit log" note="every action, every entity" active />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--border)] w-full">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28 text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-widest mb-6"
            style={{
              backgroundColor: `color-mix(in srgb, ${INDIGO} 12%, white)`,
              color: INDIGO,
              border: `1px solid color-mix(in srgb, ${INDIGO} 24%, transparent)`,
            }}
          >
            Enterprise
          </div>
          <h2 className="font-editorial text-3xl md:text-5xl tracking-tight" style={{ fontWeight: 700 }}>
            Your ecosystem is ready to be queried.
          </h2>
          <p className="mt-5 text-base md:text-lg text-[var(--muted-strong)] max-w-2xl mx-auto leading-relaxed">
            30-minute fund demo. We&apos;ll walk you through the admin console,
            the two-gate flow, and the compliance posture. Then propose a pilot
            with three of your portfolio companies.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-medium text-white hover:opacity-90 transition-opacity shadow-lg"
              style={{ backgroundColor: INDIGO }}
            >
              Book a fund demo
              <ArrowRight className="h-5 w-5" strokeWidth={2} />
            </Link>
            <Link
              href="/app/dashboard/enterprise"
              className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-colors hover:bg-[var(--paper)]"
              style={{ borderColor: INDIGO, color: INDIGO }}
            >
              Walk the admin console
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
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
            Tier 03 · Enterprise · Push to Prod
          </span>
        </div>
      </footer>
      <div className="h-1 w-full rail-animated" aria-hidden />
    </main>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        borderColor: `color-mix(in srgb, ${INDIGO} 22%, transparent)`,
        backgroundColor: "var(--surface)",
      }}
    >
      <div
        className="font-editorial text-2xl md:text-3xl tabular-nums"
        style={{ fontWeight: 700, letterSpacing: "-0.02em", color: INDIGO }}
      >
        {value}
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[var(--muted-strong)]">
        {label}
      </div>
    </div>
  );
}

function EcosystemHierarchy() {
  // Simple tree: Temasek at top → 5 vertical columns → portcos beneath
  return (
    <div className="w-full">
      {/* Parent node */}
      <div className="flex justify-center mb-8">
        <div
          className="rounded-2xl px-6 py-4 text-center shadow-lg"
          style={{
            backgroundColor: INDIGO,
            color: "white",
            boxShadow: `0 12px 40px -12px ${INDIGO}`,
          }}
        >
          <div className="font-mono text-[10px] uppercase tracking-widest opacity-80 mb-1">
            Parent entity · fund admin
          </div>
          <div className="font-editorial text-xl md:text-2xl tracking-tight" style={{ fontWeight: 700 }}>
            Temasek
          </div>
        </div>
      </div>
      {/* Connector lines down to verticals */}
      <div className="flex justify-center mb-4">
        <div
          className="h-8 w-px border-l-2 border-dashed"
          style={{ borderColor: `color-mix(in srgb, ${INDIGO} 40%, transparent)` }}
          aria-hidden
        />
      </div>
      {/* Vertical columns */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {fixtureVerticals.map((v) => (
          <div
            key={v.slug}
            className="rounded-xl border p-3 text-center"
            style={{
              borderColor: `color-mix(in srgb, ${v.color} 30%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${v.color} 8%, white)`,
            }}
          >
            <div
              className="font-mono text-[9px] uppercase tracking-widest mb-1"
              style={{ color: v.color }}
            >
              {v.portco_count} portcos
            </div>
            <div
              className="font-editorial text-sm md:text-base tracking-tight mb-2"
              style={{ fontWeight: 700, color: v.color }}
            >
              {v.name}
            </div>
            <div className="font-mono text-[10px] text-[var(--muted-strong)] tabular-nums">
              {v.warm_contacts} warm
            </div>
          </div>
        ))}
      </div>
      {/* Connector down to portcos */}
      <div className="flex justify-center mb-3">
        <div
          className="h-6 w-px border-l-2 border-dashed"
          style={{ borderColor: `color-mix(in srgb, ${INDIGO} 40%, transparent)` }}
          aria-hidden
        />
      </div>
      {/* Portco dots */}
      <div className="rounded-2xl p-4 bg-white border border-[var(--border)]">
        <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-3 text-center">
          14 portfolio companies · each runs its own private graph
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {fixturePortcos.map((p) => {
            const vertical = fixtureVerticals.find((v) => v.slug === p.vertical);
            const color = vertical?.color || INDIGO;
            return (
              <div
                key={p.id}
                className="rounded-lg px-2 py-2 text-center"
                style={{
                  backgroundColor: `color-mix(in srgb, ${color} 10%, white)`,
                  border: `1px solid color-mix(in srgb, ${color} 22%, transparent)`,
                }}
              >
                <div
                  className="font-editorial text-xs md:text-sm tracking-tight truncate"
                  style={{ fontWeight: 600, color: color }}
                >
                  {p.name}
                </div>
                <div className="font-mono text-[9px] text-[var(--muted)] tabular-nums mt-0.5">
                  {p.warm_contacts}w · {p.region}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TwoGateFlow() {
  const steps = [
    {
      actor: "Portco B",
      title: "Asks via Master Connect",
      body: "\u201cWho in the ecosystem knows someone at Stripe?\u201d — queries the directory (metadata only).",
      color: "var(--teal)",
    },
    {
      actor: "Portco B",
      title: "Submits intro request",
      body: "Target · purpose · urgency. Request enters Gate 1 queue.",
      color: "var(--teal)",
    },
    {
      actor: "Fund admin · Gate 1",
      title: "Governance review",
      body: "Approve · deny · request more context. Auto-approve policies skip manual review for same-vertical, low-stakes asks.",
      color: INDIGO,
    },
    {
      actor: "Portco A · Gate 2",
      title: "Contact ownership decides",
      body: "Portco A sees the approved request. They approve, deny, or suggest a different contact. Full final say.",
      color: PLUM,
    },
    {
      actor: "Portco A's Crew",
      title: "Intro drafted in Portco A's voice",
      body: "Messenger Crew drafts the intro, routes to Portco A's Morning Connect for final approval.",
      color: PLUM,
    },
    {
      actor: "All parties",
      title: "Intro sent · tracked",
      body: "Fund sees the outcome (meeting booked / deal closed). ROI rolls up to the ecosystem dashboard.",
      color: "var(--sage)",
    },
  ];
  return (
    <div className="space-y-3 max-w-4xl mx-auto">
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <div key={i}>
            <div
              className="rounded-2xl border-l-4 p-5 md:p-6 flex items-start gap-4 anim-fade-up"
              style={{
                borderLeftColor: s.color,
                borderColor: "var(--border)",
                borderWidth: 1,
                borderLeftWidth: 4,
                backgroundColor: `color-mix(in srgb, ${s.color} 5%, white)`,
                animationDelay: `${i * 0.06}s`,
              }}
            >
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-white font-mono text-sm shrink-0"
                style={{ backgroundColor: s.color }}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="font-mono text-[10px] uppercase tracking-widest mb-1"
                  style={{ color: s.color }}
                >
                  {s.actor}
                </div>
                <div
                  className="font-editorial text-lg md:text-xl tracking-tight mb-1"
                  style={{ fontWeight: 700 }}
                >
                  {s.title}
                </div>
                <div className="text-sm text-[var(--muted-strong)] leading-relaxed">
                  {s.body}
                </div>
              </div>
              {i === 2 ? (
                <ShieldCheck
                  className="h-5 w-5 shrink-0 self-center"
                  strokeWidth={1.75}
                  style={{ color: s.color }}
                />
              ) : null}
              {i === 3 ? (
                <ShieldAlert
                  className="h-5 w-5 shrink-0 self-center"
                  strokeWidth={1.75}
                  style={{ color: s.color }}
                />
              ) : null}
            </div>
            {!last ? (
              <div className="flex justify-center py-1">
                <div
                  className="h-5 w-px border-l-2 border-dashed"
                  style={{
                    borderColor: `color-mix(in srgb, ${INDIGO} 25%, transparent)`,
                  }}
                  aria-hidden
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function VisibilityPyramid() {
  const layers = [
    {
      label: "Aggregate metadata",
      note: "default ON · portco can opt out",
      detail: "Vertical coverage. Portco health. Ecosystem stats.",
      color: "var(--sage)",
      width: "w-full",
      Icon: ShieldCheck,
    },
    {
      label: "Directory metadata",
      note: "opt-in per relationship class",
      detail: "\u201cPortco X has 5 warm contacts at company Y\u201d — no names.",
      color: "var(--warmth-warm)",
      width: "md:w-[82%]",
      Icon: ShieldAlert,
    },
    {
      label: "Contact-level visibility",
      note: "explicit opt-in per intro request",
      detail: "Only revealed to the fund admin when the holder portco approves at Gate 2.",
      color: "var(--warmth-cold)",
      width: "md:w-[64%]",
      Icon: ShieldOff,
    },
  ];
  return (
    <div className="flex flex-col items-center gap-3 md:gap-4 max-w-5xl mx-auto">
      {layers.map((l, i) => {
        const { Icon } = l;
        return (
          <div
            key={l.label}
            className={`rounded-2xl border-2 p-5 md:p-6 w-full ${l.width} anim-fade-up`}
            style={{
              borderColor: `color-mix(in srgb, ${l.color} 30%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${l.color} 6%, white)`,
              animationDelay: `${i * 0.08}s`,
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `color-mix(in srgb, ${l.color} 16%, white)`,
                  border: `1px solid color-mix(in srgb, ${l.color} 32%, transparent)`,
                }}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} style={{ color: l.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap mb-1">
                  <div
                    className="font-editorial text-lg md:text-xl tracking-tight"
                    style={{ fontWeight: 700, color: l.color }}
                  >
                    {l.label}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                    {l.note}
                  </div>
                </div>
                <div className="text-sm text-[var(--muted-strong)] leading-relaxed">
                  {l.detail}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VerticalBreakdown() {
  const max = Math.max(...fixtureVerticals.map((v) => v.warm_contacts));
  return (
    <div className="space-y-3">
      {fixtureVerticals.map((v) => {
        const pct = (v.warm_contacts / max) * 100;
        return (
          <div
            key={v.slug}
            className="rounded-2xl border p-5 relative overflow-hidden"
            style={{
              borderColor: `color-mix(in srgb, ${v.color} 22%, transparent)`,
              backgroundColor: "var(--surface)",
            }}
          >
            <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${v.color} 14%, white)`,
                    border: `1px solid color-mix(in srgb, ${v.color} 30%, transparent)`,
                  }}
                >
                  <Building2 className="h-4 w-4" strokeWidth={1.75} style={{ color: v.color }} />
                </div>
                <div>
                  <div
                    className="font-editorial text-lg tracking-tight"
                    style={{ fontWeight: 700 }}
                  >
                    {v.name}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
                    {v.portco_count} portcos · {v.active_intros} active intros
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-right">
                <div>
                  <div
                    className="font-editorial text-xl tabular-nums"
                    style={{ fontWeight: 700, color: v.color }}
                  >
                    {v.warm_contacts.toLocaleString()}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
                    warm contacts
                  </div>
                </div>
              </div>
            </div>
            {/* Horizontal bar */}
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: `color-mix(in srgb, ${v.color} 8%, white)` }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  backgroundColor: v.color,
                }}
              />
            </div>
          </div>
        );
      })}
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
        borderColor: `color-mix(in srgb, ${INDIGO} 22%, transparent)`,
        backgroundColor: "var(--surface)",
      }}
    >
      <div
        className="h-10 w-10 rounded-2xl flex items-center justify-center"
        style={{
          backgroundColor: `color-mix(in srgb, ${INDIGO} 14%, white)`,
          border: `1px solid color-mix(in srgb, ${INDIGO} 28%, transparent)`,
        }}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} style={{ color: INDIGO }} />
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

function ComplianceCard({
  label,
  note,
  active,
}: {
  label: string;
  note: string;
  active?: boolean;
}) {
  return (
    <div
      className="rounded-xl border px-4 py-3 flex items-center justify-between"
      style={{
        borderColor: active
          ? `color-mix(in srgb, var(--sage) 30%, transparent)`
          : "var(--border)",
        backgroundColor: active
          ? "color-mix(in srgb, var(--sage) 4%, white)"
          : "white",
      }}
    >
      <div className="min-w-0">
        <div className="font-editorial text-sm tracking-tight" style={{ fontWeight: 600 }}>
          {label}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] mt-0.5 truncate">
          {note}
        </div>
      </div>
      {active ? (
        <CheckCircle2
          className="h-4 w-4 shrink-0"
          strokeWidth={1.75}
          style={{ color: "var(--sage)" }}
        />
      ) : (
        <XCircle
          className="h-4 w-4 shrink-0 text-[var(--muted)]"
          strokeWidth={1.75}
        />
      )}
    </div>
  );
}
