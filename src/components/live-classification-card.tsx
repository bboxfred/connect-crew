"use client";

/**
 * LiveClassificationCard — shows the most recent Telegram classification,
 * with a "Simulate" control for demo-safety.
 *
 * Data source: GET /api/telegram/latest (server-side Supabase query using
 * the service-role key — bypasses browser-side env var resolution).
 *
 * Simulate flow: POST /api/telegram/simulate returns the full classification
 * result; we build an InteractionRow from it and setState optimistically
 * — no round-trip back to Supabase required. This makes the card work even
 * if NEXT_PUBLIC_SUPABASE_* isn't in the client bundle.
 *
 * Supabase Realtime: kept as a best-effort progressive enhancement. If the
 * browser client fails to init, it silently no-ops; the simulate path still
 * works because it doesn't depend on realtime for UI updates.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, Zap, Loader2, AlertCircle } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import { SignalChips } from "./signal-chips";

type InteractionRow = {
  id: string;
  contact_id: string | null;
  channel: string | null;
  direction: string | null;
  content: string | null;
  classification: string | null;
  created_at: string;
  signals: {
    deltas?: Record<string, number | null>;
    signals_detected?: string[];
    language_detected?: string;
    confidence?: number;
    confidence_warning?: boolean;
    reasoning?: string;
    previous_warmth?: number;
    new_warmth?: number;
    sender_name?: string;
  } | null;
};

type SimulateTone = "hot" | "warm" | "neutral" | "cooling";

// Each simulate variant fires the LITERAL trigger text as the inbound.
// That way the pipeline's trigger matcher finds the matching Secret
// Signals rule and fires ITS preset reply_template verbatim — so
// what you see back matches exactly what you set in the panel above.
const SIMULATE_VARIANTS: Array<{
  label: string;
  text: string;
  hint: SimulateTone;
}> = [
  { label: "Hi!!", text: "Hi!!", hint: "hot" },
  { label: "Hi!", text: "Hi!", hint: "warm" },
  { label: "Hi", text: "Hi", hint: "neutral" },
  { label: "Hi...", text: "Hi...", hint: "cooling" },
];

export function LiveClassificationCard({
  accentColor,
}: {
  accentColor: string;
}) {
  const [latest, setLatest] = useState<InteractionRow | null>(null);
  const [fetching, setFetching] = useState(true);
  const [simulating, setSimulating] = useState<string | null>(null);
  const [simError, setSimError] = useState<string | null>(null);
  const [justLanded, setJustLanded] = useState(false);
  const [firedDraft, setFiredDraft] = useState<{
    body: string;
    reasoning: string;
    calibration_trace: string[];
    gmail_url: string | null;
    matched_trigger: string | null;
  } | null>(null);

  const supabase = useMemo(() => {
    try {
      return supabaseBrowser();
    } catch {
      return null;
    }
  }, []);

  const flashRef = useRef<number | null>(null);
  const triggerFlash = useCallback(() => {
    setJustLanded(true);
    if (flashRef.current) window.clearTimeout(flashRef.current);
    flashRef.current = window.setTimeout(() => setJustLanded(false), 1600);
  }, []);

  // Initial fetch via server-side API (doesn't rely on browser Supabase client)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/telegram/latest", { cache: "no-store" });
        const json = (await res.json()) as
          | { ok: true; row: InteractionRow | null }
          | { ok: false; error: string };
        if (!cancelled) {
          if ("ok" in json && json.ok) {
            setLatest(json.row);
          }
          setFetching(false);
        }
      } catch (err) {
        console.error("[live-classification] initial fetch failed:", err);
        if (!cancelled) setFetching(false);
      }
    })();

    return () => {
      cancelled = true;
      if (flashRef.current) window.clearTimeout(flashRef.current);
    };
  }, []);

  // Best-effort Supabase Realtime subscription for live bot DMs.
  // If the browser client can't init (NEXT_PUBLIC_* not in bundle), this
  // silently no-ops — simulate still works via optimistic update below.
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel("messenger-classifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "interactions",
          filter: "channel=eq.telegram",
        },
        (payload) => {
          const row = payload.new as InteractionRow;
          if (row.direction !== "inbound") return;
          setLatest(row);
          triggerFlash();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, triggerFlash]);

  const simulate = useCallback(
    async (variant: (typeof SIMULATE_VARIANTS)[number]) => {
      setSimulating(variant.label);
      setSimError(null);
      try {
        const res = await fetch("/api/telegram/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: variant.text }),
        });
        const json = await res.json();

        if (!json.ok) {
          setSimError(json.error ?? "simulate failed");
          console.error("[simulate] backend returned error:", json);
          return;
        }

        // Optimistic update — build an InteractionRow from the response
        // so the UI updates immediately, even without Supabase Realtime
        // and even if the browser Supabase client can't init.
        const cls = json.classification;
        const row: InteractionRow = {
          id: `sim-${Date.now()}`,
          contact_id: json.contact_id ?? null,
          channel: "telegram",
          direction: "inbound",
          content: variant.text,
          classification: cls?.classification ?? null,
          created_at: new Date().toISOString(),
          signals: {
            deltas: cls?.deltas ?? {},
            signals_detected: cls?.signals_detected ?? [],
            language_detected: cls?.language_detected ?? "und",
            confidence: cls?.confidence ?? 0,
            confidence_warning: cls?.confidence_warning ?? false,
            reasoning: cls?.reasoning ?? "",
            previous_warmth: json.previous_warmth,
            new_warmth: json.new_warmth,
            sender_name: json.contact_name ?? "Simulated sender",
          },
        };
        setLatest(row);

        // Capture the drafted reply so the UI shows exactly what will fire.
        // On a trigger match, this is the user's preset reply_template
        // verbatim. Otherwise Claude drafts dynamically.
        if (json.draft && json.draft.status === "created") {
          const matched = (json.draft.calibration_trace ?? []).find((s: string) =>
            s.startsWith("matched trigger:"),
          );
          setFiredDraft({
            body: json.draft.body ?? "",
            reasoning: json.draft.reasoning ?? "",
            calibration_trace: json.draft.calibration_trace ?? [],
            gmail_url: json.draft.gmail_url ?? null,
            matched_trigger: matched
              ? matched.replace(/^matched trigger:\s*"?|"?$/g, "")
              : null,
          });
        } else {
          setFiredDraft(null);
        }
        triggerFlash();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "network error";
        console.error("[simulate] fetch threw:", err);
        setSimError(msg);
      } finally {
        setSimulating(null);
      }
    },
    [triggerFlash],
  );

  const signals = latest?.signals ?? null;
  const deltas = signals?.deltas ?? {};
  const previousWarmth = signals?.previous_warmth;
  const newWarmth = signals?.new_warmth;
  const senderName = signals?.sender_name ?? "Unknown sender";
  const chipsTone = classificationTone(latest?.classification ?? null);

  return (
    <section
      className={`rounded-2xl border bg-[var(--surface)] p-5 md:p-6 transition-shadow duration-500 ${
        justLanded ? "shadow-[0_0_0_3px_color-mix(in_srgb,var(--teal)_30%,transparent)]" : "shadow-none"
      }`}
      style={{ borderColor: "var(--border)" }}
    >
      {/* ── DEMO SIMULATE section — prominent, chunky buttons ─────────── */}
      <div className="mb-6 pb-6 border-b border-[var(--hairline)]">
        <div
          className="font-mono text-[10px] uppercase tracking-widest mb-1"
          style={{ color: accentColor }}
        >
          Demo · Simulate a cue
        </div>
        <h3
          className="font-editorial text-xl md:text-2xl tracking-tight leading-tight mb-2"
          style={{ fontWeight: 700, letterSpacing: "-0.02em" }}
        >
          Fire a cue → watch Claude classify it live.
        </h3>
        <p className="text-sm text-[var(--muted-strong)] leading-relaxed mb-4 max-w-xl">
          Each button sends a canned message through the real classifier
          pipeline (Claude + the 11-signal taxonomy + Supabase). Result
          populates below in ~3 seconds.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3">
          {SIMULATE_VARIANTS.map((v) => {
            const active = simulating === v.label;
            const toneColor = simulateToneColor(v.hint);
            return (
              <button
                key={v.label}
                type="button"
                onClick={() => simulate(v)}
                disabled={!!simulating}
                className="group relative flex flex-col items-start rounded-xl border-2 px-4 py-3 md:py-3.5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
                style={{
                  borderColor: `color-mix(in srgb, ${toneColor} 42%, transparent)`,
                  backgroundColor: `color-mix(in srgb, ${toneColor} 8%, white)`,
                }}
                title={v.text}
                aria-label={`Simulate "${v.label}" cue — classifies as ${v.hint}`}
              >
                <span
                  className="flex items-center gap-1.5 font-editorial text-xl md:text-2xl tabular-nums"
                  style={{ fontWeight: 700, color: toneColor }}
                >
                  {active ? (
                    <Loader2
                      className="h-4 w-4 md:h-5 md:w-5 animate-spin"
                      strokeWidth={2.25}
                    />
                  ) : (
                    <Zap
                      className="h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:scale-110"
                      strokeWidth={2.5}
                    />
                  )}
                  {v.label}
                </span>
                <span
                  className="mt-0.5 font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: toneColor, opacity: 0.85 }}
                >
                  {v.hint}
                </span>
              </button>
            );
          })}
        </div>

        {simError ? (
          <div
            className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] rounded px-2 py-1"
            style={{
              backgroundColor: "color-mix(in srgb, var(--indigo) 10%, white)",
              color: "var(--indigo)",
            }}
          >
            <AlertCircle className="h-3 w-3" strokeWidth={2} />
            Simulate failed: {simError}
          </div>
        ) : null}

        {/* Message-fires card — shown IMMEDIATELY after firing a cue,
            right below the simulate buttons, so judges see the
            outgoing message without scrolling. */}
        {firedDraft ? (
          <div
            className="mt-5 rounded-xl border p-4"
            style={{
              borderColor: `color-mix(in srgb, ${accentColor} 40%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${accentColor} 7%, white)`,
            }}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
              <div
                className="font-mono text-[10px] uppercase tracking-widest flex items-center gap-1.5"
                style={{ color: accentColor }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  className="h-3 w-3"
                  aria-hidden
                >
                  <path d="M22 2 11 13" />
                  <path d="m22 2-7 20-4-9-9-4 20-7z" />
                </svg>
                {firedDraft.matched_trigger
                  ? "Sent automatically to "
                  : "Message fires to "}
                {latest?.signals?.sender_name ?? "your contact"}
                {firedDraft.matched_trigger ? (
                  <span className="normal-case tracking-normal text-[var(--muted-strong)]">
                    · matched &ldquo;{firedDraft.matched_trigger}&rdquo; · no approval needed
                  </span>
                ) : (
                  <span className="normal-case tracking-normal text-[var(--muted-strong)]">
                    · Claude drafted · needs approval in Morning Connect
                  </span>
                )}
              </div>
              {firedDraft.gmail_url ? (
                <a
                  href={firedDraft.gmail_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Open in Gmail →
                </a>
              ) : null}
            </div>
            <p className="text-sm leading-relaxed text-[var(--foreground)] whitespace-pre-wrap">
              {firedDraft.body}
            </p>
            {firedDraft.reasoning ? (
              <p className="mt-2 font-mono text-[11px] text-[var(--muted)] leading-relaxed">
                {firedDraft.reasoning}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* ── Last Classification section ──────────────────────────────── */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Activity
          className="h-4 w-4"
          strokeWidth={1.75}
          style={{ color: accentColor }}
        />
        <div
          className="font-mono text-[10px] uppercase tracking-widest"
          style={{ color: accentColor }}
        >
          {latest ? "Last cue fired" : "No cues fired yet"}
          {latest ? ` · ${relativeTime(latest.created_at)}` : ""}
        </div>
      </div>

      {fetching ? (
        <div className="font-mono text-xs text-[var(--muted)] py-4">
          Loading latest cue…
        </div>
      ) : !latest ? (
        <div className="font-mono text-xs text-[var(--muted)] leading-relaxed max-w-xl">
          No cues fired yet. Click a Simulate button above to run the
          classifier against a canned cue — or once MTProto is wired,
          every{" "}
          <code className="px-1.5 py-0.5 rounded bg-[var(--paper)] text-[var(--muted-strong)]">
            Hi!!
          </code>
          {" "}
          you type to a contact fires the matched trigger automatically.
        </div>
      ) : (
        <>
          <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] mb-1">
            You typed
          </div>
          <div className="font-editorial text-lg md:text-xl leading-snug tracking-tight text-[var(--ink)] mb-2">
            &ldquo;{latest.content ?? ""}&rdquo;
          </div>
          <div className="font-mono text-[11px] text-[var(--muted)] mb-3">
            To · {senderName} · Telegram
            {previousWarmth != null && newWarmth != null
              ? ` · their Warmth ${previousWarmth} → ${newWarmth}`
              : ""}
            {signals?.language_detected && signals.language_detected !== "und"
              ? ` · ${signals.language_detected}`
              : ""}
          </div>

          {signals?.signals_detected &&
          signals.signals_detected.length > 0 ? (
            <div className="mb-4">
              <SignalChips
                chips={signals.signals_detected.map((label) => ({
                  label,
                  tone: chipsTone,
                }))}
                accentColor={accentColor}
              />
            </div>
          ) : null}

          <ul className="space-y-1.5 text-sm leading-relaxed">
            {renderReasoningLines(deltas, accentColor)}
          </ul>

          <div className="mt-4 pt-4 border-t border-[var(--hairline)] flex items-center justify-between flex-wrap gap-3">
            <div className="font-mono text-xs text-[var(--muted-strong)]">
              Classification:{" "}
              <span
                className="font-medium uppercase tabular-nums tracking-wider"
                style={{
                  color:
                    latest.classification === "hot"
                      ? "var(--warmth-hot)"
                      : latest.classification === "warm"
                        ? "var(--warmth-warm)"
                        : latest.classification === "cooling"
                          ? "var(--warmth-cold)"
                          : "var(--muted)",
                }}
              >
                {latest.classification ?? "—"}
              </span>
              {signals?.confidence_warning ? (
                <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-[var(--indigo)]">
                  · low confidence — manual review
                </span>
              ) : null}
            </div>
          </div>

          {signals?.reasoning ? (
            <p className="mt-3 text-sm text-[var(--muted-strong)] leading-relaxed">
              {signals.reasoning}
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}

function renderReasoningLines(
  deltas: Record<string, number | null>,
  accentColor: string,
) {
  const rows: Array<{ key: string; label: string; delta: number | null }> = [
    { key: "punctuation", label: "Punctuation", delta: deltas.punctuation ?? null },
    { key: "greeting", label: "Greeting", delta: deltas.greeting ?? null },
    { key: "emoji", label: "Emoji", delta: deltas.emoji ?? null },
    { key: "response_time", label: "Response time", delta: deltas.response_time ?? null },
    { key: "channel", label: "Channel", delta: deltas.channel ?? null },
  ];
  return rows.map((row) => {
    const scored = row.delta != null;
    const sign = scored ? (row.delta! > 0 ? `+${row.delta}` : `${row.delta}`) : "—";
    const deltaColor =
      !scored
        ? "var(--muted)"
        : row.delta! > 0
          ? "var(--warmth-hot)"
          : row.delta! < 0
            ? "var(--warmth-cold)"
            : "var(--muted)";
    return (
      <li key={row.key} className="flex items-center gap-3 text-sm">
        <span
          className="font-mono text-[10px] uppercase tracking-wider w-28 shrink-0"
          style={{ color: scored ? accentColor : "var(--muted)" }}
        >
          {row.label}
        </span>
        <span className="flex-1 text-[var(--foreground)]">
          {scored ? "Scored" : "Not evaluated this turn"}
        </span>
        <span
          className="font-mono tabular-nums text-xs px-2 py-0.5 rounded"
          style={{
            backgroundColor: `color-mix(in srgb, ${deltaColor} 12%, white)`,
            color: deltaColor,
          }}
        >
          {sign}
        </span>
      </li>
    );
  });
}

function classificationTone(
  cls: string | null,
): "hot" | "warm" | "neutral" | "cooling" {
  switch (cls) {
    case "hot":
      return "hot";
    case "warm":
      return "warm";
    case "cooling":
    case "reactivation":
      return "cooling";
    default:
      return "neutral";
  }
}

function simulateToneColor(
  hint: "hot" | "warm" | "neutral" | "cooling",
): string {
  switch (hint) {
    case "hot":
      return "var(--warmth-hot)";
    case "warm":
      return "var(--warmth-warm)";
    case "cooling":
      return "var(--warmth-cold)";
    case "neutral":
    default:
      return "var(--muted-strong)";
  }
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const ms = now - then;
  if (ms < 60_000) return "just now";
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
  return `${Math.floor(ms / 86_400_000)}d ago`;
}
