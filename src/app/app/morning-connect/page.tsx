"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Pencil,
  Send,
  Ban,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  CREW,
  fixtureDrafts,
  type CrewKey,
  type FixtureDraft,
  type DraftStatus,
} from "@/lib/fixtures";
import type { LiveDraft } from "@/app/api/drafts/live/route";
import { cn, warmthTier } from "@/lib/utils";

// ─── Live draft ingestion ─────────────────────────────────────────────────
// Live drafts come from /api/drafts/live (Messenger pipeline output).
// We convert them to the FixtureDraft shape so the existing UI renders
// them alongside fixtures, then track their ids in `liveIds` so the
// approve handlers fire real POSTs for them.

function initialsFor(name: string | null | undefined): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function channelLabel(
  raw: string | null,
): FixtureDraft["channel"] {
  switch ((raw ?? "").toLowerCase()) {
    case "telegram":
      return "Telegram";
    case "gmail":
      return "Gmail";
    case "whatsapp":
      return "WhatsApp";
    case "linkedin":
      return "LinkedIn";
    default:
      return "Telegram";
  }
}

function liveDraftToFixture(d: LiveDraft): FixtureDraft {
  const r = d.reasoning ?? {};
  const name = d.contact?.name ?? "Telegram contact";
  const signalChips = [
    ...(r.signals_detected ?? []),
    ...(r.calibration_trace ?? []),
  ].slice(0, 6);
  return {
    id: d.id,
    contact_id: d.contact?.id ?? d.contact_id ?? d.id,
    contact: name,
    company: d.contact?.company ?? "Direct",
    initials: initialsFor(name),
    crew: "signals",
    channel: channelLabel(d.channel),
    warmth: d.contact?.warmth_index ?? 50,
    signal_chips: signalChips,
    draft: d.draft_content,
    reasoning: r.reasoning ?? "Calibrated reply from Messenger classifier.",
    reasoning_trail: [
      {
        crew: "signals",
        note:
          r.classifier_reasoning ??
          `Classified as ${r.classifier_tier ?? "warm"} based on the inbound tone.`,
      },
      {
        crew: "signals",
        note:
          r.calibration_trace && r.calibration_trace.length > 0
            ? `Calibration: ${r.calibration_trace.slice(0, 3).join(" · ")}`
            : "Reply calibrated to the detected tier.",
      },
    ],
    status: "pending",
  };
}

function formatToday(): string {
  const now = new Date();
  return now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const CREW_ORDER_IN_REVIEW: CrewKey[] = [
  "signals",
  "inbound",
  "social",
  "scan",
  "scribe",
];

type ItemState = {
  checked: boolean;
  expanded: boolean;
  status: DraftStatus;
  editedText?: string;
};

export default function MorningConnectPage() {
  const [items, setItems] = useState<Record<string, ItemState>>(() =>
    Object.fromEntries(
      fixtureDrafts.map((d) => [
        d.id,
        { checked: true, expanded: false, status: "pending" as DraftStatus },
      ]),
    ),
  );
  const [sent, setSent] = useState(false);
  const [liveDrafts, setLiveDrafts] = useState<FixtureDraft[]>([]);
  const [liveIds, setLiveIds] = useState<Set<string>>(new Set());

  // Fetch live drafts from Supabase on mount (Messenger-pipeline output)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/drafts/live", { cache: "no-store" });
        const json = (await res.json()) as
          | { ok: true; drafts: LiveDraft[] }
          | { ok: false; error: string };
        if (cancelled || !("ok" in json) || !json.ok) return;
        const converted = json.drafts.map(liveDraftToFixture);
        setLiveDrafts(converted);
        setLiveIds(new Set(converted.map((d) => d.id)));
        setItems((prev) => {
          const next = { ...prev };
          for (const d of converted) {
            if (!next[d.id]) {
              next[d.id] = {
                checked: true,
                expanded: false,
                status: "pending",
              };
            }
          }
          return next;
        });
      } catch (err) {
        console.error("[morning-connect] live drafts fetch failed:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Merge live drafts (prepended) with fixtures — live land at the top of
  // their Crew section for a clear "just drafted" signal.
  const allDrafts = useMemo(
    () => [...liveDrafts, ...fixtureDrafts],
    [liveDrafts],
  );

  // Group drafts by Crew
  const groups = useMemo(() => {
    const map: Record<CrewKey, FixtureDraft[]> = {
      scan: [],
      signals: [],
      inbound: [],
      scribe: [],
      social: [],
    };
    for (const d of allDrafts) map[d.crew].push(d);
    return map;
  }, [allDrafts]);

  const activeCrews = CREW_ORDER_IN_REVIEW.filter((k) => groups[k].length > 0);

  const totalCount = allDrafts.length;
  const selectedCount = Object.values(items).filter((s) => s.checked).length;
  const sentCount = Object.values(items).filter((s) => s.status === "approved").length;

  /**
   * For any live draft being approved, fire POST /api/drafts/:id/approve
   * in parallel. Fire-and-forget — UI already flipped optimistically.
   */
  function sendLiveApprovals(ids: string[]) {
    const live = ids.filter((id) => liveIds.has(id));
    if (live.length === 0) return;
    for (const id of live) {
      fetch(`/api/drafts/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).catch((err) => {
        console.error(`[morning-connect] approve ${id} failed:`, err);
      });
    }
  }

  function toggleChecked(id: string) {
    setItems((p) => ({ ...p, [id]: { ...p[id], checked: !p[id].checked } }));
  }
  function toggleExpanded(id: string) {
    setItems((p) => ({ ...p, [id]: { ...p[id], expanded: !p[id].expanded } }));
  }
  function setEdited(id: string, text: string) {
    setItems((p) => ({ ...p, [id]: { ...p[id], editedText: text } }));
  }
  function neverAgain(id: string) {
    setItems((p) => ({
      ...p,
      [id]: { ...p[id], checked: false, status: "never" },
    }));
  }

  function approveAll() {
    const idsToSend: string[] = [];
    setItems((p) => {
      const next = { ...p };
      for (const id in next) {
        if (next[id].checked && next[id].status !== "never") {
          next[id] = { ...next[id], status: "approved" };
          idsToSend.push(id);
        }
      }
      return next;
    });
    sendLiveApprovals(idsToSend);
    setSent(true);
  }

  /** Approve all checked (non-never) drafts in a single Crew section. */
  function approveSection(crewKey: CrewKey) {
    const idsToSend: string[] = [];
    setItems((p) => {
      const next = { ...p };
      for (const d of allDrafts) {
        if (d.crew !== crewKey) continue;
        const state = next[d.id];
        if (state && state.checked && state.status !== "never") {
          next[d.id] = { ...state, status: "approved" };
          idsToSend.push(d.id);
        }
      }
      return next;
    });
    sendLiveApprovals(idsToSend);
  }

  function selectAll(check: boolean) {
    setItems((p) => {
      const next = { ...p };
      for (const id in next) {
        if (next[id].status !== "never") next[id] = { ...next[id], checked: check };
      }
      return next;
    });
  }

  // Counts per Crew
  const crewCounts: Record<CrewKey, number> = {
    scan: groups.scan.length,
    signals: groups.signals.length,
    inbound: groups.inbound.length,
    scribe: groups.scribe.length,
    social: groups.social.length,
  };

  // ─── Empty / success state after Approve All ───
  if (sent) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 md:py-24">
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6"
          style={{
            backgroundColor: "color-mix(in srgb, var(--sage) 14%, white)",
            color: "var(--sage)",
          }}
        >
          <Check className="h-4 w-4" strokeWidth={2.5} />
          <span className="font-mono text-[11px] uppercase tracking-widest">
            Sent
          </span>
        </div>
        <h1
          className="font-editorial text-4xl md:text-5xl leading-[0.95] tracking-tight"
          style={{ fontWeight: 700, letterSpacing: "-0.03em" }}
        >
          Morning Connect is complete.
        </h1>
        <p className="mt-6 text-[var(--muted-strong)] leading-relaxed max-w-md mx-auto">
          {sentCount} draft{sentCount === 1 ? "" : "s"} staged as Gmail and
          Telegram drafts · {totalCount - sentCount} held back.
        </p>
        <div className="mt-10 flex items-center gap-4 justify-center flex-wrap">
          <Link
            href="/app/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] text-[var(--background)] px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Return to Dashboard
          </Link>
          <a
            href="/app/dashboard#activity"
            className="text-sm text-[var(--muted-strong)] hover:text-[var(--foreground)] transition-colors"
          >
            See today's activity →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h1
          className="font-editorial text-4xl md:text-5xl leading-[0.95] tracking-tight"
          style={{ fontWeight: 700, letterSpacing: "-0.03em" }}
        >
          Morning Connect
        </h1>
        <div className="mt-3 font-mono text-xs text-[var(--muted-strong)]">
          {formatToday()}
        </div>
      </header>

      {/* Daily summary — visual block with big counts */}
      <section className="mb-10 rounded-3xl overflow-hidden border border-[var(--border)] shadow-sm">
        {/* Hero banner — the total */}
        <div
          className="p-8 md:p-12 text-center"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--gold) 16%, white) 0%, color-mix(in srgb, var(--terracotta) 10%, white) 100%)",
          }}
        >
          <div
            className="font-mono text-[10px] uppercase tracking-widest mb-4"
            style={{ color: "var(--gold)" }}
          >
            Overnight · Daily summary
          </div>
          <div
            className="font-editorial leading-none tabular-nums"
            style={{
              fontSize: "clamp(5rem, 12vw, 8rem)",
              fontWeight: 800,
              color: "var(--ink)",
              letterSpacing: "-0.05em",
            }}
          >
            {totalCount}
          </div>
          <div
            className="mt-3 font-editorial text-xl md:text-2xl tracking-tight text-[var(--ink)]"
            style={{ fontWeight: 600 }}
          >
            drafts waiting for your approval
          </div>
        </div>

        {/* Per-Crew count tiles — full-color blocks */}
        <div
          className="grid grid-cols-2 md:grid-cols-5 gap-px"
          style={{ backgroundColor: "var(--border)" }}
        >
          {(["scan", "signals", "inbound", "social", "scribe"] as CrewKey[]).map((k) => {
            const crew = CREW[k];
            const n = crewCounts[k];
            const hasItems = n > 0;
            return (
              <div
                key={k}
                className="p-5 md:p-6 text-white relative overflow-hidden transition-opacity"
                style={{
                  backgroundColor: crew.color,
                  opacity: hasItems ? 1 : 0.45,
                }}
              >
                <div className="font-mono text-[10px] uppercase tracking-widest opacity-80 mb-2">
                  {crew.name}
                </div>
                <div
                  className="font-editorial leading-none tabular-nums"
                  style={{
                    fontSize: "clamp(2.5rem, 6vw, 3.75rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {n}
                </div>
                <div className="mt-1.5 font-mono text-[10px] opacity-75">
                  {n === 0
                    ? "all quiet"
                    : `${n === 1 ? "item" : "items"} · awaiting review`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls bar */}
        <div className="p-4 md:p-5 flex items-center justify-between gap-3 flex-wrap bg-[var(--paper)]/50">
          <p className="text-sm text-[var(--muted-strong)] leading-relaxed max-w-2xl">
            All{" "}
            <span className="font-medium text-[var(--foreground)] tabular-nums">
              {totalCount}
            </span>{" "}
            drafts are pre-selected below. Uncheck anything you&apos;d rather
            skip. Per-section{" "}
            <span className="font-medium text-[var(--foreground)]">
              Approve all
            </span>{" "}
            buttons batch-approve a single Crew at a time, or hit the big one
            at the bottom.
          </p>
          <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest shrink-0">
            <button
              type="button"
              onClick={() => selectAll(true)}
              className="text-[var(--muted-strong)] hover:text-[var(--foreground)] transition-colors"
            >
              Select all
            </button>
            <span className="text-[var(--muted)]">·</span>
            <button
              type="button"
              onClick={() => selectAll(false)}
              className="text-[var(--muted-strong)] hover:text-[var(--foreground)] transition-colors"
            >
              Deselect all
            </button>
            <span className="text-[var(--muted)]">·</span>
            <span className="text-[var(--muted)] tabular-nums">
              {selectedCount}/{totalCount}
            </span>
          </div>
        </div>
      </section>

      {/* Crew-grouped sections */}
      <div className="space-y-10">
        {activeCrews.map((k) => {
          const crew = CREW[k];
          const drafts = groups[k];
          // Count how many drafts in this section are still checked-and-pending
          const sectionPendingChecked = drafts.filter(
            (d) => items[d.id].checked && items[d.id].status === "pending",
          ).length;
          return (
            <section key={k}>
              {/* Crew header with per-section approve button */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-white text-sm font-medium"
                  style={{ backgroundColor: crew.color }}
                >
                  {crew.name}
                </span>
                <span className="font-mono text-xs text-[var(--muted)]">
                  {drafts.length} {drafts.length === 1 ? "item" : "items"}
                </span>
                <button
                  type="button"
                  onClick={() => approveSection(k)}
                  disabled={sectionPendingChecked === 0}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider text-white hover:opacity-90 transition-opacity disabled:opacity-35 disabled:pointer-events-none"
                  style={{ backgroundColor: crew.color }}
                  title={`Approve ${sectionPendingChecked} checked draft${sectionPendingChecked === 1 ? "" : "s"} in ${crew.name}`}
                >
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                  Approve all {crew.name}
                  {sectionPendingChecked < drafts.length && sectionPendingChecked > 0 ? (
                    <span className="opacity-75 tabular-nums">
                      · {sectionPendingChecked}
                    </span>
                  ) : null}
                </button>
              </div>

              {/* Items — grid layout so more drafts fit on screen */}
              <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {drafts.map((d) => {
                  const state = items[d.id];
                  if (!state) return null;
                  return (
                    <DraftListItem
                      key={d.id}
                      draft={d}
                      state={state}
                      isLive={liveIds.has(d.id)}
                      onToggleChecked={() => toggleChecked(d.id)}
                      onToggleExpanded={() => toggleExpanded(d.id)}
                      onEdit={(t) => setEdited(d.id, t)}
                      onNeverAgain={() => neverAgain(d.id)}
                    />
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      {/* Bottom action bar */}
      <footer className="mt-14 mb-4">
        <div
          className="rounded-2xl border p-6 md:p-8 flex items-center justify-between gap-4 flex-wrap"
          style={{
            backgroundColor: "var(--ink)",
            borderColor: "var(--ink)",
          }}
        >
          <div className="text-white min-w-0">
            <div className="font-editorial text-2xl tracking-tight leading-tight" style={{ fontWeight: 600 }}>
              Ready when you are.
            </div>
            <div className="mt-1 font-mono text-xs text-white/70">
              {selectedCount} selected · {totalCount - selectedCount} skipped
            </div>
          </div>
          <button
            type="button"
            onClick={approveAll}
            disabled={selectedCount === 0}
            className="inline-flex items-center gap-2 rounded-full px-6 md:px-7 py-3 text-base font-medium text-[var(--ink)] bg-white hover:bg-white/95 transition-colors disabled:opacity-40 disabled:pointer-events-none shadow-lg"
          >
            <Send className="h-5 w-5" strokeWidth={2} />
            Approve all {selectedCount > 0 ? `${selectedCount} selected` : ""}
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/app/dashboard"
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            End ritual early
          </Link>
        </div>
      </footer>
    </div>
  );
}

// ─── Draft list item ───────────────────────────────────────────────────────

function DraftListItem({
  draft,
  state,
  isLive = false,
  onToggleChecked,
  onToggleExpanded,
  onEdit,
  onNeverAgain,
}: {
  draft: FixtureDraft;
  state: ItemState;
  isLive?: boolean;
  onToggleChecked: () => void;
  onToggleExpanded: () => void;
  onEdit: (text: string) => void;
  onNeverAgain: () => void;
}) {
  const crew = CREW[draft.crew];
  const tier = warmthTier(draft.warmth);
  const isNever = state.status === "never";
  const displayText = state.editedText ?? draft.draft;

  const tierColor: Record<string, string> = {
    hot: "var(--warmth-hot)",
    warm: "var(--warmth-warm)",
    neutral: "var(--warmth-neutral)",
    cold: "var(--warmth-cold)",
  };

  return (
    <li
      className={cn(
        "relative rounded-xl border bg-white overflow-hidden transition-opacity",
        // When expanded, span full grid width so the detail view doesn't cramp
        state.expanded ? "md:col-span-2 xl:col-span-3" : "",
      )}
      style={{
        borderColor: state.checked && !isNever
          ? `color-mix(in srgb, ${crew.color} 28%, var(--border))`
          : "var(--border)",
        opacity: isNever ? 0.5 : 1,
      }}
    >
      {/* Live "just drafted" badge */}
      {isLive ? (
        <div
          className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-white"
          style={{ backgroundColor: "var(--warmth-hot)" }}
        >
          <Zap className="h-2.5 w-2.5" strokeWidth={2.5} />
          Just drafted
        </div>
      ) : null}

      {/* Checkbox top-right */}
      <label
        className="absolute top-3 right-3 z-10 cursor-pointer select-none"
        aria-label={`${state.checked ? "Deselect" : "Select"} draft to ${draft.contact}`}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={state.checked}
          onChange={onToggleChecked}
          disabled={isNever}
        />
        <span
          className="flex items-center justify-center h-6 w-6 rounded-md border-2 transition-all"
          style={{
            backgroundColor:
              state.checked && !isNever ? crew.color : "white",
            borderColor:
              state.checked && !isNever
                ? crew.color
                : "var(--border)",
          }}
          aria-hidden
        >
          {state.checked && !isNever ? (
            <Check className="h-4 w-4 text-white" strokeWidth={3} />
          ) : null}
        </span>
      </label>

      {/* Top row — collapsed view */}
      <button
        type="button"
        onClick={onToggleExpanded}
        className="block w-full text-left p-4 pr-14 hover:bg-[var(--paper)]/40 transition-colors"
        aria-expanded={state.expanded}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0"
            style={{
              backgroundColor: `color-mix(in srgb, ${crew.color} 14%, white)`,
              color: crew.color,
            }}
          >
            {draft.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-[var(--foreground)] truncate text-sm">
              {draft.contact}
            </div>
            <div className="font-mono text-[10px] text-[var(--muted)] truncate">
              {draft.channel} · {draft.company} ·{" "}
              <span style={{ color: tierColor[tier] }}>
                Warmth {draft.warmth}
              </span>
            </div>
          </div>
          <span className="shrink-0 text-[var(--muted)]">
            {state.expanded ? (
              <ChevronUp className="h-4 w-4" strokeWidth={2} />
            ) : (
              <ChevronDown className="h-4 w-4" strokeWidth={2} />
            )}
          </span>
        </div>

        {!state.expanded ? (
          <p className="text-sm text-[var(--muted-strong)] leading-snug line-clamp-2 pr-2">
            &ldquo;{displayText}&rdquo;
          </p>
        ) : null}

        {isNever ? (
          <div className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--indigo)" }}>
            <Ban className="h-3 w-3" strokeWidth={2.5} />
            Never again from this contact
          </div>
        ) : null}
      </button>

      {/* Expanded view */}
      {state.expanded ? (
        <div className="px-4 pb-4 border-t border-[var(--hairline)] pt-4 space-y-4">
          {/* Inbound message (if present) */}
          {draft.inbound_message ? (
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">
                Inbound message · {draft.inbound_message.timestamp}
              </div>
              <blockquote
                className="rounded-lg px-3 py-2 border bg-[var(--paper)]/60 text-sm leading-relaxed"
                style={{ borderColor: "var(--hairline)" }}
              >
                &ldquo;{draft.inbound_message.text}&rdquo;
              </blockquote>
            </div>
          ) : null}

          {/* Signal chips */}
          {draft.signal_chips.length > 0 ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              {draft.signal_chips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wider"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--teal) 8%, white)",
                    color: "var(--teal)",
                    border: "1px solid color-mix(in srgb, var(--teal) 22%, transparent)",
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}

          {/* Editable draft */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2 flex items-center justify-between">
              <span>Draft</span>
              <span className="tabular-nums">{displayText.length} chars</span>
            </div>
            <textarea
              value={displayText}
              onChange={(e) => onEdit(e.target.value)}
              className="w-full font-editorial text-base md:text-lg leading-relaxed text-[var(--ink)] bg-[var(--paper)]/40 rounded-lg p-3 border focus:outline-none transition-colors min-h-[80px]"
              style={{
                borderColor: "var(--hairline)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = crew.color;
                e.currentTarget.style.boxShadow = `0 0 0 3px color-mix(in srgb, ${crew.color} 18%, transparent)`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--hairline)";
                e.currentTarget.style.boxShadow = "";
              }}
            />
            <div className="mt-1 font-mono text-[10px] text-[var(--muted)] flex items-center gap-1">
              <Pencil className="h-2.5 w-2.5" strokeWidth={2} />
              Edit inline · changes save locally for this session
            </div>
          </div>

          {/* Crew reasoning trail */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">
              <Sparkles className="inline h-3 w-3 mr-1" strokeWidth={2} />
              Crew reasoning
            </div>
            <ul className="space-y-1">
              {draft.reasoning_trail.map((line, i) => (
                <li
                  key={i}
                  className="font-mono text-[11px] text-[var(--muted-strong)] leading-relaxed"
                >
                  <span
                    className="inline-block uppercase tracking-wider mr-2"
                    style={{ color: CREW[line.crew].color }}
                  >
                    [{CREW[line.crew].name}]
                  </span>
                  {line.note}
                </li>
              ))}
            </ul>
          </div>

          {/* Per-item actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--hairline)]">
            <button
              type="button"
              onClick={onNeverAgain}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors"
              style={{
                borderColor: "color-mix(in srgb, var(--indigo) 30%, transparent)",
                color: "var(--indigo)",
              }}
              title="Never send drafts to this contact on this channel again"
            >
              <Ban className="h-3 w-3" strokeWidth={2.5} /> Never again
            </button>
          </div>
        </div>
      ) : null}
    </li>
  );
}
