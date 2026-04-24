"use client";

/**
 * LiveClassificationCard — shows the most recent Telegram classification
 * from Supabase, updates in real time via Supabase Realtime, and offers
 * a "Simulate" control for demo-safety.
 *
 * Data source: `interactions` table (channel=telegram, direction=inbound).
 * Reads the `signals` jsonb column for deltas + reasoning + chips.
 *
 * Fallback: if the table is empty (fresh demo), renders a neutral empty
 * state inviting the user to DM the bot or click Simulate.
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

const SIMULATE_VARIANTS: Array<{ label: string; text: string; hint: string }> =
  [
    { label: "Hi!!", text: "Hi!! 🔥 Free for a coffee this week?", hint: "hot" },
    { label: "Hi!", text: "Hi! Great seeing you — want to catch up soon?", hint: "warm" },
    { label: "Hi.", text: "Hi. Noted.", hint: "neutral" },
    { label: "Hi...", text: "Hi... been a while.", hint: "cooling" },
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

  // Initial fetch + realtime subscription
  useEffect(() => {
    if (!supabase) {
      setFetching(false);
      return;
    }
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("interactions")
        .select(
          "id, contact_id, channel, direction, content, classification, created_at, signals",
        )
        .eq("channel", "telegram")
        .eq("direction", "inbound")
        .order("created_at", { ascending: false })
        .limit(1);
      if (!cancelled) {
        setLatest((data?.[0] as InteractionRow | undefined) ?? null);
        setFetching(false);
      }
    })();

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
      cancelled = true;
      if (flashRef.current) window.clearTimeout(flashRef.current);
      supabase.removeChannel(channel);
    };
  }, [supabase, triggerFlash]);

  const refetchLatest = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("interactions")
      .select(
        "id, contact_id, channel, direction, content, classification, created_at, signals",
      )
      .eq("channel", "telegram")
      .eq("direction", "inbound")
      .order("created_at", { ascending: false })
      .limit(1);
    const row = data?.[0] as InteractionRow | undefined;
    if (row) {
      setLatest(row);
      triggerFlash();
    }
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
        } else {
          // Refetch covers the case where Supabase Realtime replication
          // isn't enabled on `interactions`. If it IS enabled, the
          // subscription fires too — state update is idempotent.
          await refetchLatest();
        }
      } catch (err) {
        setSimError(err instanceof Error ? err.message : "network error");
      } finally {
        setSimulating(null);
      }
    },
    [refetchLatest],
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
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Activity
            className="h-4 w-4"
            strokeWidth={1.75}
            style={{ color: accentColor }}
          />
          <div
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color: accentColor }}
          >
            {latest ? "Last classification" : "No classifications yet"}
            {latest ? ` · ${relativeTime(latest.created_at)}` : ""}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] mr-1">
            Simulate
          </span>
          {SIMULATE_VARIANTS.map((v) => {
            const active = simulating === v.label;
            return (
              <button
                key={v.label}
                type="button"
                onClick={() => simulate(v)}
                disabled={active}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors disabled:opacity-50"
                title={v.text}
              >
                {active ? (
                  <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} />
                ) : (
                  <Zap className="h-3 w-3" strokeWidth={2} />
                )}
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

      {simError ? (
        <div
          className="mb-3 inline-flex items-center gap-1.5 font-mono text-[11px] rounded px-2 py-1"
          style={{
            backgroundColor: "color-mix(in srgb, var(--indigo) 10%, white)",
            color: "var(--indigo)",
          }}
        >
          <AlertCircle className="h-3 w-3" strokeWidth={2} />
          Simulate failed: {simError}
        </div>
      ) : null}

      {fetching ? (
        <div className="font-mono text-xs text-[var(--muted)] py-4">
          Loading latest classification…
        </div>
      ) : !latest ? (
        <div className="font-mono text-xs text-[var(--muted)] leading-relaxed max-w-xl">
          No Telegram messages classified yet. DM your bot with
          {" "}
          <code className="px-1.5 py-0.5 rounded bg-[var(--paper)] text-[var(--muted-strong)]">
            Hi!!
          </code>
          {" "}
          — or click a Simulate variant above to run the classifier
          against a canned message.
        </div>
      ) : (
        <>
          <div className="font-editorial text-lg md:text-xl leading-snug tracking-tight text-[var(--ink)] mb-2">
            &ldquo;{latest.content ?? ""}&rdquo;
          </div>
          <div className="font-mono text-[11px] text-[var(--muted)] mb-3">
            From · {senderName} · Telegram
            {previousWarmth != null && newWarmth != null
              ? ` · Warmth before: ${previousWarmth} → ${newWarmth}`
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

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const ms = now - then;
  if (ms < 60_000) return "just now";
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
  return `${Math.floor(ms / 86_400_000)}d ago`;
}
