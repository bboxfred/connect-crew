"use client";

import { useState } from "react";
import {
  Network,
  Building2,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MessageSquareShare,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Activity,
  ChevronRight,
  Clock,
} from "lucide-react";
import {
  fixtureEcosystemSummary,
  fixtureVerticals,
  fixturePortcos,
  fixtureIntroRequests,
  fixtureEcosystemActivity,
  fixtureGovernanceRules,
  pendingIntroRequests,
  portcoById,
  type IntroRequest,
  type GovernanceRule,
} from "@/lib/fixtures";
import { cn } from "@/lib/utils";
import { MasterConnectHero } from "@/components/master-connect-hero";

// ─── Enterprise dashboard (fund admin console) ────────────────────────────
// Fixture-only. Represents Temasek-style parent oversight of a portfolio,
// with the two-gate intro governance described in CLAUDE.md §9.

const PENDING_COLOR = "var(--warmth-warm)";
const APPROVED_COLOR = "var(--sage)";
const DENIED_COLOR = "var(--warmth-cold)";
const INDIGO = "var(--indigo)";
const PLUM = "var(--plum)";

export default function EnterpriseDashboardPage() {
  const summary = fixtureEcosystemSummary;
  const verticals = fixtureVerticals;
  const portcos = fixturePortcos;
  const pendingRequests = pendingIntroRequests();
  const activity = fixtureEcosystemActivity.slice(0, 8);
  const drifting = portcos.filter((p) => p.drifting);

  const [activeRequest, setActiveRequest] = useState<IntroRequest | null>(null);
  const [governanceOpen, setGovernanceOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-10">
      {/* Master Connect hero */}
      <MasterConnectHero mode="enterprise" />

      {/* Header */}
      <header className="anim-fade-up">
        <div
          className="font-mono text-[10px] uppercase tracking-widest mb-3"
          style={{ color: INDIGO }}
        >
          Temasek · fund admin console · {summary.portco_count} portcos ·{" "}
          {summary.vertical_count} verticals
        </div>
        <h1
          className="font-editorial text-4xl md:text-5xl tracking-tight"
          style={{ fontWeight: 700, letterSpacing: "-0.025em" }}
        >
          Ecosystem dashboard.
        </h1>
        <p className="mt-3 text-[var(--muted-strong)] max-w-2xl leading-relaxed">
          Aggregate oversight of every portfolio company&apos;s relationship
          graph — without seeing individual contacts. Intro requests flow
          through two gates: your governance review, then the contact
          owner&apos;s final approval.
        </p>
      </header>

      {/* Ecosystem health tiles */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 anim-fade-up" style={{ animationDelay: "0.05s" }}>
        <StatTile
          label="Portfolio companies"
          value={String(summary.portco_count)}
          sub={`across ${summary.vertical_count} verticals`}
          color={INDIGO}
          icon={<Building2 className="h-4 w-4" strokeWidth={1.75} />}
        />
        <StatTile
          label="Aggregate warm contacts"
          value={summary.total_warm_contacts.toLocaleString()}
          sub="warmth ≥ 55, across ecosystem"
          color={"var(--warmth-warm)"}
          icon={<Sparkles className="h-4 w-4" strokeWidth={1.75} />}
        />
        <StatTile
          label="Active intros · this quarter"
          value={String(summary.active_intros_this_quarter)}
          sub={`${summary.partnerships_formed} partnerships formed`}
          color={PLUM}
          icon={<MessageSquareShare className="h-4 w-4" strokeWidth={1.75} />}
        />
        <StatTile
          label="Ecosystem ROI"
          value={summary.ecosystem_roi_usd_formatted}
          sub={`${summary.intros_approved_this_quarter} intros approved`}
          color="var(--sage)"
          icon={<TrendingUp className="h-4 w-4" strokeWidth={1.75} />}
        />
      </section>

      {/* Vertical breakdown */}
      <section id="directory" className="space-y-4 anim-fade-up" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-1">
              Ecosystem directory
            </div>
            <h2 className="font-editorial text-2xl md:text-3xl tracking-tight">
              Verticals across the portfolio.
            </h2>
          </div>
          <div className="text-sm text-[var(--muted-strong)]">
            Aggregate by default — no individual contacts visible.
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {verticals.map((v, i) => (
            <article
              key={v.slug}
              className="rounded-2xl border p-4 relative overflow-hidden anim-fade-up"
              style={{
                backgroundColor: `color-mix(in srgb, ${v.color} 8%, white)`,
                borderColor: `color-mix(in srgb, ${v.color} 22%, transparent)`,
                animationDelay: `${0.12 + i * 0.04}s`,
              }}
            >
              <div
                className="font-mono text-[9px] uppercase tracking-widest mb-2"
                style={{ color: v.color }}
              >
                {v.slug}
              </div>
              <div
                className="font-editorial text-lg tracking-tight mb-3"
                style={{ fontWeight: 700 }}
              >
                {v.name}
              </div>
              <div className="space-y-1 font-mono text-[11px] text-[var(--muted-strong)]">
                <StatRow label="Portcos" value={String(v.portco_count)} />
                <StatRow label="Warm contacts" value={v.warm_contacts.toLocaleString()} />
                <StatRow
                  label="Active intros"
                  value={String(v.active_intros)}
                  highlight={v.active_intros > 0}
                  highlightColor={v.color}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Intro approval queue — the Gate 1 mechanic */}
      <section id="approvals" className="anim-fade-up" style={{ animationDelay: "0.18s" }}>
        <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
          <div>
            <div
              className="font-mono text-[10px] uppercase tracking-widest mb-1"
              style={{ color: PENDING_COLOR }}
            >
              Gate 1 · your governance review
            </div>
            <h2 className="font-editorial text-2xl md:text-3xl tracking-tight">
              Pending intro approvals.
              <span
                className="ml-3 font-mono text-sm tabular-nums px-2 py-1 rounded align-middle"
                style={{
                  backgroundColor: `color-mix(in srgb, ${PENDING_COLOR} 14%, white)`,
                  color: PENDING_COLOR,
                }}
              >
                {pendingRequests.length} waiting
              </span>
            </h2>
          </div>
          <div className="text-sm text-[var(--muted-strong)] max-w-md">
            Both gates must approve. Temasek reviews first. The contact-owning
            portco has final say.
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <div className="grid grid-cols-[1.2fr_1.2fr_2fr_auto_auto] gap-3 px-5 py-3 border-b border-[var(--border)] font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] bg-[var(--paper)]">
            <div>Requester</div>
            <div>Holder · target</div>
            <div>Purpose</div>
            <div className="text-center">Urgency</div>
            <div className="text-right pr-1">Actions</div>
          </div>
          <ul className="divide-y divide-[var(--hairline)]">
            {pendingRequests.map((r) => (
              <IntroRequestRow
                key={r.id}
                request={r}
                onOpen={() => setActiveRequest(r)}
              />
            ))}
          </ul>
        </div>
      </section>

      {/* Governance policy panel (collapsible) */}
      <section className="anim-fade-up" style={{ animationDelay: "0.22s" }}>
        <button
          type="button"
          onClick={() => setGovernanceOpen((v) => !v)}
          className="w-full text-left rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-4 flex items-center justify-between hover:bg-[var(--paper)] transition-colors"
        >
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-1">
              Configurable governance
            </div>
            <div className="font-editorial text-xl tracking-tight">
              Policy matrix · auto-approve, manual review, hard-block
            </div>
          </div>
          <ChevronRight
            className={cn(
              "h-5 w-5 text-[var(--muted)] transition-transform duration-200",
              governanceOpen && "rotate-90",
            )}
            strokeWidth={1.75}
          />
        </button>
        {governanceOpen ? (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <GovernanceColumn
              title="Auto-approve"
              icon={<ShieldCheck className="h-4 w-4" strokeWidth={1.75} />}
              color="var(--sage)"
              rules={fixtureGovernanceRules.filter((r) => r.category === "auto_approve")}
            />
            <GovernanceColumn
              title="Manual review"
              icon={<ShieldAlert className="h-4 w-4" strokeWidth={1.75} />}
              color={PENDING_COLOR}
              rules={fixtureGovernanceRules.filter((r) => r.category === "manual_review")}
            />
            <GovernanceColumn
              title="Hard-block"
              icon={<ShieldOff className="h-4 w-4" strokeWidth={1.75} />}
              color={DENIED_COLOR}
              rules={fixtureGovernanceRules.filter((r) => r.category === "hard_block")}
            />
          </div>
        ) : null}
      </section>

      {/* Lower grid: portcos + drifting + activity */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 anim-fade-up" style={{ animationDelay: "0.26s" }}>
        {/* Portcos */}
        <div id="portcos">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-1">
                Portfolio companies
              </div>
              <h2 className="font-editorial text-2xl md:text-3xl tracking-tight">
                {portcos.length} portcos across the ecosystem.
              </h2>
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--hairline)] overflow-hidden">
            {portcos.map((p) => {
              const vertical = fixtureVerticals.find((v) => v.slug === p.vertical);
              return (
                <div
                  key={p.id}
                  className="grid grid-cols-[1.4fr_0.9fr_auto_auto] gap-3 items-center px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-[var(--foreground)] truncate">
                      {p.name}
                    </div>
                    <div className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wider">
                      {p.region}
                    </div>
                  </div>
                  <div>
                    {vertical ? (
                      <span
                        className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${vertical.color} 12%, white)`,
                          color: vertical.color,
                        }}
                      >
                        {vertical.name}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-right min-w-[150px]">
                    <div className="font-mono text-xs text-[var(--muted-strong)]">
                      <span className="text-[var(--foreground)] font-medium tabular-nums">
                        {p.warm_contacts}
                      </span>{" "}
                      warm · {p.total_contacts.toLocaleString()} total
                    </div>
                  </div>
                  <ParticipationDot participation={p.ecosystem_participation} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right rail: drifting + activity */}
        <div className="space-y-6">
          {/* Drifting alert */}
          <div
            className="rounded-2xl border p-5"
            style={{
              backgroundColor: `color-mix(in srgb, ${PENDING_COLOR} 8%, white)`,
              borderColor: `color-mix(in srgb, ${PENDING_COLOR} 30%, transparent)`,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle
                className="h-4 w-4"
                strokeWidth={1.75}
                style={{ color: PENDING_COLOR }}
              />
              <div
                className="font-mono text-[10px] uppercase tracking-widest"
                style={{ color: PENDING_COLOR }}
              >
                Drifting portcos · {drifting.length}
              </div>
            </div>
            <div className="font-editorial text-base tracking-tight text-[var(--foreground)] mb-3">
              These portcos need ecosystem outreach — activity declining 30d+.
            </div>
            <ul className="space-y-2">
              {drifting.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[var(--foreground)]">
                    {p.name}
                  </span>
                  <span className="font-mono text-[11px] text-[var(--muted-strong)]">
                    {p.last_active_days}d silent
                  </span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-4 w-full rounded-lg text-white text-xs font-mono uppercase tracking-wider py-2 transition-opacity hover:opacity-90"
              style={{ backgroundColor: PENDING_COLOR }}
            >
              Flag for fund outreach
            </button>
          </div>

          {/* Recent activity */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-[var(--muted)]" strokeWidth={1.75} />
              <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                Recent ecosystem activity
              </div>
            </div>
            <ul className="space-y-3">
              {activity.map((e) => (
                <li key={e.id} className="flex gap-3 items-start">
                  <ActivityDot type={e.type} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[var(--foreground)] leading-snug">
                      {e.summary}
                    </div>
                    <div className="font-mono text-[10px] text-[var(--muted)] mt-0.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" strokeWidth={1.75} />
                      {formatRelative(e.timestamp)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Approval modal */}
      {activeRequest ? (
        <ApprovalModal
          request={activeRequest}
          onClose={() => setActiveRequest(null)}
        />
      ) : null}
    </div>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────

function StatTile({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-5 border"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 6%, white)`,
        borderColor: `color-mix(in srgb, ${color} 22%, transparent)`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="font-mono text-[10px] uppercase tracking-widest"
          style={{ color }}
        >
          {label}
        </div>
        <span style={{ color }}>{icon}</span>
      </div>
      <div
        className="font-editorial text-3xl md:text-4xl tracking-tight tabular-nums"
        style={{ fontWeight: 700, letterSpacing: "-0.025em" }}
      >
        {value}
      </div>
      <div className="mt-2 text-[11px] font-mono text-[var(--muted-strong)]">
        {sub}
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  highlight,
  highlightColor,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  highlightColor?: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[var(--muted)]">{label}</span>
      <span
        className="tabular-nums font-medium"
        style={{
          color: highlight && highlightColor ? highlightColor : "var(--foreground)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function IntroRequestRow({
  request,
  onOpen,
}: {
  request: IntroRequest;
  onOpen: () => void;
}) {
  const requester = portcoById(request.requester_portco_id);
  const holder = portcoById(request.holder_portco_id);
  const urgencyColor =
    request.urgency === "high"
      ? "var(--warmth-hot)"
      : request.urgency === "medium"
        ? "var(--warmth-warm)"
        : "var(--warmth-neutral)";
  return (
    <li className="grid grid-cols-[1.2fr_1.2fr_2fr_auto_auto] gap-3 px-5 py-4 items-center hover:bg-[var(--paper)]/40 transition-colors">
      <div className="min-w-0">
        <div className="font-medium text-[var(--foreground)] truncate">
          {requester?.name || "—"}
        </div>
        <div className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wider truncate">
          requesting
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-sm text-[var(--foreground)] truncate">
          <span className="text-[var(--muted)]">via</span>{" "}
          <span className="font-medium">{holder?.name || "—"}</span>
        </div>
        <div className="font-mono text-[10px] text-[var(--muted-strong)] truncate">
          → {request.target_company}
        </div>
      </div>
      <div className="text-sm text-[var(--muted-strong)] leading-snug line-clamp-2">
        {request.purpose}
      </div>
      <div className="text-center">
        <span
          className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded"
          style={{
            backgroundColor: `color-mix(in srgb, ${urgencyColor} 14%, white)`,
            color: urgencyColor,
          }}
        >
          {request.urgency}
        </span>
      </div>
      <div className="flex items-center gap-2 pr-1">
        <button
          type="button"
          onClick={onOpen}
          className="rounded-full border border-[var(--border)] px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors"
        >
          Review
        </button>
        <button
          type="button"
          className="rounded-full px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: APPROVED_COLOR }}
        >
          Approve
        </button>
        <button
          type="button"
          className="rounded-full border px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors"
          style={{
            borderColor: DENIED_COLOR,
            color: DENIED_COLOR,
          }}
        >
          Deny
        </button>
      </div>
    </li>
  );
}

function GovernanceColumn({
  title,
  icon,
  color,
  rules,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  rules: GovernanceRule[];
}) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 5%, white)`,
        borderColor: `color-mix(in srgb, ${color} 20%, transparent)`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color }}>{icon}</span>
        <div
          className="font-mono text-[10px] uppercase tracking-widest"
          style={{ color }}
        >
          {title}
        </div>
      </div>
      <ul className="space-y-2 text-sm text-[var(--muted-strong)] leading-relaxed">
        {rules.map((r, i) => (
          <li key={i} className="flex gap-2">
            <span style={{ color }} className="shrink-0">·</span>
            <span>{r.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ParticipationDot({
  participation,
}: {
  participation: "active" | "moderate" | "silent";
}) {
  const map: Record<string, { color: string; label: string }> = {
    active: { color: "var(--sage)", label: "Active" },
    moderate: { color: "var(--warmth-warm)", label: "Moderate" },
    silent: { color: "var(--warmth-cold)", label: "Silent" },
  };
  const cfg = map[participation];
  return (
    <div className="flex items-center gap-1.5 whitespace-nowrap">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: cfg.color }}
      />
      <span
        className="font-mono text-[10px] uppercase tracking-wider"
        style={{ color: cfg.color }}
      >
        {cfg.label}
      </span>
    </div>
  );
}

function ActivityDot({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    intro_requested: "var(--warmth-warm)",
    intro_approved_gate1: PLUM,
    intro_approved_gate2: "var(--sage)",
    intro_sent: "var(--sage)",
    meeting_booked: "var(--warmth-hot)",
    policy_changed: "var(--muted)",
  };
  const color = colorMap[type] || "var(--muted)";
  return (
    <span
      className="h-2 w-2 rounded-full shrink-0 mt-1.5"
      style={{ backgroundColor: color }}
    />
  );
}

function ApprovalModal({
  request,
  onClose,
}: {
  request: IntroRequest;
  onClose: () => void;
}) {
  const requester = portcoById(request.requester_portco_id);
  const holder = portcoById(request.holder_portco_id);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative max-w-2xl w-full bg-[var(--surface)] rounded-3xl shadow-[0_24px_80px_-16px_rgba(26,24,22,0.4)] border border-[var(--border)] overflow-hidden max-h-[90vh] overflow-y-auto">
        <div
          className="px-8 py-6 border-b border-[var(--hairline)]"
          style={{
            backgroundColor: `color-mix(in srgb, ${INDIGO} 6%, white)`,
          }}
        >
          <div
            className="font-mono text-[10px] uppercase tracking-widest mb-2"
            style={{ color: INDIGO }}
          >
            Two-gate intro request
          </div>
          <h3
            className="font-editorial text-2xl md:text-3xl tracking-tight"
            style={{ fontWeight: 700 }}
          >
            {requester?.name} → {request.target_company}{" "}
            <span className="text-[var(--muted-strong)]">via {holder?.name}</span>
          </h3>
          <p className="mt-3 text-[var(--muted-strong)] leading-relaxed">
            {request.purpose}
          </p>
        </div>

        <div className="px-8 py-6 space-y-5">
          {/* Reasoning */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">
              Claude reasoning
            </div>
            <p className="text-sm text-[var(--foreground)] leading-relaxed">
              {request.reasoning}
            </p>
          </div>

          {/* Flow diagram */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-3">
              The two gates
            </div>
            <ol className="space-y-3">
              <GateStep
                step={1}
                title="Temasek governance review (you)"
                description="Checks competitive position, vertical match, policy matrix."
                status="pending"
                color={INDIGO}
              />
              <GateStep
                step={2}
                title={`${holder?.name} decides`}
                description="Contact owner has final say. Drafts intro in their voice if approved."
                status="queued"
                color={PLUM}
              />
              <GateStep
                step={3}
                title="Intro drafted + sent"
                description={`Through ${holder?.name}'s Messenger Crew, in their voice. Outcome tracked.`}
                status="queued"
                color="var(--sage)"
              />
            </ol>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[var(--hairline)]">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-mono uppercase tracking-wider text-[var(--muted-strong)] hover:text-[var(--foreground)] transition-colors"
            >
              Close
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-full border px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors"
                style={{
                  borderColor: DENIED_COLOR,
                  color: DENIED_COLOR,
                }}
              >
                <XCircle className="h-4 w-4 inline mr-1" strokeWidth={1.75} />
                Deny
              </button>
              <button
                type="button"
                className="rounded-full px-5 py-2 text-xs font-mono uppercase tracking-wider text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: APPROVED_COLOR }}
              >
                <CheckCircle2 className="h-4 w-4 inline mr-1" strokeWidth={1.75} />
                Approve · route to {holder?.name}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GateStep({
  step,
  title,
  description,
  status,
  color,
}: {
  step: number;
  title: string;
  description: string;
  status: "pending" | "queued" | "done";
  color: string;
}) {
  return (
    <li className="flex gap-3">
      <div
        className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-mono font-medium shrink-0"
        style={{
          backgroundColor:
            status === "pending"
              ? color
              : `color-mix(in srgb, ${color} 15%, white)`,
          color: status === "pending" ? "white" : color,
          border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
        }}
      >
        {step}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[var(--foreground)]">
          {title}
        </div>
        <div className="text-xs text-[var(--muted-strong)] leading-relaxed mt-0.5">
          {description}
        </div>
      </div>
      <div
        className="font-mono text-[9px] uppercase tracking-wider shrink-0 self-start mt-1"
        style={{ color: status === "pending" ? color : "var(--muted)" }}
      >
        {status}
      </div>
    </li>
  );
}

// Very small "relative time" formatter for the activity feed
function formatRelative(iso: string): string {
  const now = Date.now();
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return iso;
  const diffMin = Math.max(1, Math.round((now - then) / 60000));
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}
