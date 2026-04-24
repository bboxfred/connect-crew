import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Send,
  MessageSquareShare,
  Calendar,
  ShieldAlert,
  ExternalLink,
  RefreshCw,
  Mail,
  MessageCircle,
  Link2,
  AtSign,
} from "lucide-react";
import {
  contactById,
  enrichmentFor,
  interactionsFor,
  warmthTimelineFor,
  CREW,
  type Channel,
} from "@/lib/fixtures";
import { warmthTier } from "@/lib/utils";
import { WarmthTimelineChart } from "@/components/warmth-timeline-chart";

const WARMTH_HEX: Record<string, string> = {
  hot: "#e85a3c",
  warm: "#e8a33a",
  neutral: "#6a9b8f",
  cold: "#8a8680",
};

const CHANNEL_ICON: Record<Channel, typeof Mail> = {
  email: Mail,
  telegram: MessageCircle,
  linkedin: Link2,
  whatsapp: MessageCircle,
  card: Link2,
  social: AtSign,
};

const CHANNEL_LABEL: Record<Channel, string> = {
  email: "Gmail",
  telegram: "Telegram",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  card: "Card scan",
  social: "Social DM",
};

export default async function ContactDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const contact = contactById(id);
  if (!contact) notFound();

  const tier = warmthTier(contact.warmth);
  const tierColor = WARMTH_HEX[tier];
  const enrichment = enrichmentFor(contact.id);
  const interactions = interactionsFor(contact.id);
  const timeline = warmthTimelineFor(contact.id);
  const crew = CREW[contact.last_crew];

  const autonomyLabel: Record<string, string> = {
    green: "Green · auto-send",
    yellow: "Yellow · Morning Connect",
    red: "Red · never auto-drafted",
  };
  const autonomyColor: Record<string, string> = {
    green: "var(--sage)",
    yellow: "var(--gold)",
    red: "var(--indigo)",
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back link */}
      <Link
        href="/app/contacts"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-strong)] hover:text-[var(--foreground)] transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Back to contacts
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-14">
        {/* ─── Left column (content) ─── */}
        <div>
          {/* Contact header */}
          <header className="mb-10 flex items-start gap-5">
            <div
              className="h-20 w-20 md:h-24 md:w-24 rounded-full flex items-center justify-center text-lg md:text-xl font-medium shrink-0"
              style={{
                backgroundColor: `color-mix(in srgb, ${crew.color} 14%, white)`,
                color: crew.color,
                border: `1px solid color-mix(in srgb, ${crew.color} 25%, transparent)`,
              }}
            >
              {contact.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">
                Met at {contact.met_at}
                {contact.met_date ? ` · ${formatDate(contact.met_date)}` : null}
              </div>
              <h1
                className="font-editorial text-3xl md:text-4xl leading-[1.05] tracking-tight"
                style={{ fontWeight: 700, letterSpacing: "-0.025em" }}
              >
                {contact.name}
              </h1>
              <div className="mt-1 text-[var(--muted-strong)]">
                {contact.title} · {contact.company}
              </div>
              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-mono uppercase tracking-wider"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${tierColor} 14%, white)`,
                    color: tierColor,
                    border: `1px solid color-mix(in srgb, ${tierColor} 28%, transparent)`,
                  }}
                >
                  Warmth {contact.warmth} · {tier}
                </span>
                {contact.org_tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted-strong)] bg-[var(--paper)] rounded px-2 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </header>

          {/* Warmth timeline */}
          <section className="mb-10 rounded-2xl border border-[var(--border)] bg-white p-6 md:p-8">
            <div className="mb-4 flex items-baseline justify-between flex-wrap gap-2">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-1">
                  Warmth timeline
                </div>
                <h2
                  className="font-editorial text-xl md:text-2xl tracking-tight"
                  style={{ fontWeight: 600 }}
                >
                  Last 90 days.
                </h2>
              </div>
              {timeline.length >= 3 ? (
                <div className="font-mono text-[11px] text-[var(--muted)]">
                  Hover a dot to see the event
                </div>
              ) : null}
            </div>
            <WarmthTimelineChart points={timeline} height={240} />
          </section>

          {/* Enrichment */}
          {enrichment ? (
            <section className="mb-10 rounded-2xl border border-[var(--border)] bg-white p-6 md:p-8">
              <div className="mb-4 flex items-baseline justify-between flex-wrap gap-2">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-1">
                    Enrichment · from Genspark Super Agent
                  </div>
                  <h2
                    className="font-editorial text-xl md:text-2xl tracking-tight"
                    style={{ fontWeight: 600 }}
                  >
                    What the web says.
                  </h2>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--muted-strong)] hover:text-[var(--foreground)] transition-colors"
                >
                  <RefreshCw className="h-3 w-3" strokeWidth={2} />
                  Refresh
                </button>
              </div>

              <dl className="space-y-4">
                {enrichment.linkedin_summary ? (
                  <EnrichmentRow
                    label="LinkedIn"
                    value={enrichment.linkedin_summary}
                  />
                ) : null}
                {enrichment.company_summary ? (
                  <EnrichmentRow
                    label={contact.company}
                    value={enrichment.company_summary}
                  />
                ) : null}
                {enrichment.mutual_connections.length > 0 ? (
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">
                      Mutual connections
                    </dt>
                    <dd className="flex items-center gap-2 flex-wrap">
                      {enrichment.mutual_connections.map((m) => (
                        <Link
                          key={m.name}
                          href={m.contact_id ? `/app/contacts/${m.contact_id}` : "#"}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--paper)] border border-[var(--hairline)] px-3 py-1 text-sm hover:bg-white transition-colors"
                        >
                          {m.name}
                          {m.contact_id ? (
                            <ExternalLink className="h-3 w-3 text-[var(--muted)]" strokeWidth={2} />
                          ) : null}
                        </Link>
                      ))}
                    </dd>
                  </div>
                ) : null}
                {enrichment.recent_news.length > 0 ? (
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">
                      Recent signal
                    </dt>
                    <dd className="space-y-2">
                      {enrichment.recent_news.map((n) => (
                        <div key={n.title} className="text-sm">
                          <div className="text-[var(--foreground)]">{n.title}</div>
                          <div className="font-mono text-[10px] text-[var(--muted)] mt-0.5">
                            {n.date}
                          </div>
                        </div>
                      ))}
                    </dd>
                  </div>
                ) : null}
              </dl>

              <div className="mt-6 pt-4 border-t border-[var(--hairline)] flex items-center justify-between font-mono text-[10px] text-[var(--muted)] flex-wrap gap-2">
                <div>Sourced from {enrichment.sourced_from.join(" · ")}</div>
                <div>Last refreshed {formatRelative(enrichment.last_refreshed)}</div>
              </div>
            </section>
          ) : null}

          {/* Conversations */}
          <section className="rounded-2xl border border-[var(--border)] bg-white p-6 md:p-8">
            <div className="mb-5">
              <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-1">
                Conversations
              </div>
              <h2
                className="font-editorial text-xl md:text-2xl tracking-tight"
                style={{ fontWeight: 600 }}
              >
                Every touchpoint.
              </h2>
            </div>
            {interactions.length > 0 ? (
              <ol className="space-y-0">
                {interactions.map((it) => (
                  <li
                    key={it.id}
                    className="grid grid-cols-[auto_1fr] gap-4 py-4 border-b border-[var(--hairline)] last:border-b-0"
                  >
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: it.direction === "inbound"
                            ? "color-mix(in srgb, var(--teal) 14%, white)"
                            : "color-mix(in srgb, var(--terracotta) 14%, white)",
                          color: it.direction === "inbound" ? "var(--teal)" : "var(--terracotta)",
                        }}
                      >
                        {(() => {
                          const Icon = CHANNEL_ICON[it.channel];
                          return <Icon className="h-4 w-4" strokeWidth={1.75} />;
                        })()}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                          {it.day_label} · {CHANNEL_LABEL[it.channel]} · {it.direction}
                        </span>
                        {it.crew ? (
                          <span
                            className="font-mono text-[10px] uppercase tracking-widest"
                            style={{ color: CREW[it.crew].color }}
                          >
                            [{CREW[it.crew].name}]
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-[var(--foreground)] leading-snug">
                        {it.preview}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-[var(--muted-strong)] leading-relaxed">
                No interactions logged yet. Once you message {contact.name} or
                scan their card, the history lands here.
              </p>
            )}
          </section>
        </div>

        {/* ─── Right column (sidebar actions) ─── */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-4">
              Quick actions
            </div>
            <div className="space-y-2">
              <ActionButton
                icon={<Send className="h-4 w-4" strokeWidth={1.75} />}
                label="Draft new message"
                primary
              />
              <ActionButton
                icon={<MessageSquareShare className="h-4 w-4" strokeWidth={1.75} />}
                label="Warm intro…"
              />
              <ActionButton
                icon={<Calendar className="h-4 w-4" strokeWidth={1.75} />}
                label="Schedule call"
              />
              <ActionButton
                icon={<ShieldAlert className="h-4 w-4" strokeWidth={1.75} />}
                label="Mark VIP (Red)"
                danger
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-4">
              Channels
            </div>
            <ul className="space-y-2.5">
              {contact.handles?.telegram ? (
                <ChannelRow
                  icon={<MessageCircle className="h-4 w-4" strokeWidth={1.75} />}
                  label="Telegram"
                  value={contact.handles.telegram}
                  href={`https://t.me/${contact.handles.telegram.replace(/^@/, "")}`}
                />
              ) : null}
              {contact.handles?.email ? (
                <ChannelRow
                  icon={<Mail className="h-4 w-4" strokeWidth={1.75} />}
                  label="Gmail"
                  value={contact.handles.email}
                  href={`mailto:${contact.handles.email}`}
                />
              ) : null}
              {contact.handles?.linkedin ? (
                <ChannelRow
                  icon={<Link2 className="h-4 w-4" strokeWidth={1.75} />}
                  label="LinkedIn"
                  value={contact.handles.linkedin}
                  href={`https://linkedin.com${contact.handles.linkedin}`}
                />
              ) : null}
            </ul>
          </div>

          {contact.org_tags.length > 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
              <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-3">
                Crew tags
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {contact.org_tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-[var(--paper)] border border-[var(--hairline)] px-3 py-1 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-3">
              Autonomy
            </div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm"
              style={{
                backgroundColor: `color-mix(in srgb, ${autonomyColor[contact.autonomy]} 14%, white)`,
                color: autonomyColor[contact.autonomy],
                border: `1px solid color-mix(in srgb, ${autonomyColor[contact.autonomy]} 28%, transparent)`,
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: autonomyColor[contact.autonomy] }}
              />
              {autonomyLabel[contact.autonomy]}
            </div>
            <p className="mt-3 text-xs text-[var(--muted-strong)] leading-relaxed">
              {contact.autonomy === "green"
                ? "Drafts auto-send for this contact. You'll still see the audit trail."
                : contact.autonomy === "yellow"
                  ? "Drafts stage for your approval in Morning Connect."
                  : "No drafts are ever prepared for this contact."}
            </p>
            <button
              type="button"
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-mono uppercase tracking-wider text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors"
            >
              Change tier
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Subcomponents ─────────────────────────────────────────────────────────

function EnrichmentRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-1">
        {label}
      </dt>
      <dd className="text-sm text-[var(--foreground)] leading-relaxed">
        {value}
      </dd>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  primary = false,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
        primary
          ? "bg-[var(--ink)] text-[var(--background)] hover:opacity-90"
          : danger
            ? "text-[var(--indigo)] hover:bg-[var(--paper)]"
            : "text-[var(--foreground)] hover:bg-[var(--paper)]"
      }`}
    >
      <span
        className="shrink-0"
        style={{ color: primary ? "inherit" : danger ? "var(--indigo)" : "var(--muted)" }}
      >
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
}

function ChannelRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 text-sm hover:bg-[var(--paper)] -mx-2 px-2 py-1.5 rounded-md transition-colors"
      >
        <span className="text-[var(--muted)] shrink-0">{icon}</span>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
            {label}
          </div>
          <div className="text-[var(--foreground)] truncate">{value}</div>
        </div>
        <ExternalLink className="h-3 w-3 text-[var(--muted)] shrink-0" strokeWidth={2} />
      </a>
    </li>
  );
}

// ─── Utils ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function formatRelative(iso: string) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const hours = Math.max(0, Math.floor((now - then) / (1000 * 60 * 60)));
  if (hours < 1) return "moments ago";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
