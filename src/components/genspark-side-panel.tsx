"use client";

/**
 * GensparkSidePanel — the visible Claude → Genspark → Claude handoff.
 *
 * Slides in from the right during active Crew processing, shows a
 * terminal-style log (JetBrains Mono), auto-dismisses 2s after the
 * final line is marked done. Respects prefers-reduced-motion.
 *
 * Desktop: 340px right-aligned full-height panel.
 * Mobile: bottom drawer up to 60vh, draggable down to dismiss.
 *
 * Usage:
 *   const panel = useGensparkPanel();
 *   panel.run({
 *     crew: "scan",
 *     steps: [
 *       "Claude reading card image",
 *       "Claude extracting fields",
 *       "Genspark opening LinkedIn",
 *       "Genspark reading Helix Tech homepage",
 *       "Genspark finding mutual connections",
 *       "Claude writing profile summary",
 *     ],
 *     stepMs: 700,
 *   });
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { X, Check } from "lucide-react";
import { CREW, type CrewKey } from "@/lib/fixtures";

// ─── Log line model ────────────────────────────────────────────────────────

export type GensparkStep = {
  text: string;
  /** override per-step delay. Defaults to ctx.stepMs */
  ms?: number;
};

export type GensparkRun = {
  crew: CrewKey;
  title?: string; // override "Genspark · web actions" label
  steps: (string | GensparkStep)[];
  stepMs?: number; // default delay between steps
  onDone?: () => void;
  autoDismissMs?: number | null; // default 2000; null = stay until close()
};

type LineState = "pending" | "active" | "done" | "error";

type Line = {
  id: number;
  text: string;
  state: LineState;
  ms: number;
};

type PanelState = {
  open: boolean;
  crew: CrewKey | null;
  title: string;
  lines: Line[];
  done: boolean;
  elapsedSec: number | null;
};

// ─── Context / hook API ────────────────────────────────────────────────────

type GensparkContextValue = {
  state: PanelState;
  run: (r: GensparkRun) => void;
  close: () => void;
};

const GensparkContext = createContext<GensparkContextValue | null>(null);

export function useGensparkPanel() {
  const ctx = useContext(GensparkContext);
  if (!ctx)
    throw new Error(
      "useGensparkPanel must be used inside <GensparkPanelProvider>",
    );
  return ctx;
}

// ─── Provider ──────────────────────────────────────────────────────────────

export function GensparkPanelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<PanelState>({
    open: false,
    crew: null,
    title: "Genspark · web actions",
    lines: [],
    done: false,
    elapsedSec: null,
  });
  const timeouts = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timeouts.current.forEach((t) => window.clearTimeout(t));
    timeouts.current = [];
  }, []);

  const close = useCallback(() => {
    clearTimers();
    setState((s) => ({ ...s, open: false }));
  }, [clearTimers]);

  const run = useCallback(
    (r: GensparkRun) => {
      clearTimers();

      const stepMs = r.stepMs ?? 700;
      const lines: Line[] = r.steps.map((s, i) => {
        const text = typeof s === "string" ? s : s.text;
        const ms = typeof s === "string" ? stepMs : (s.ms ?? stepMs);
        return { id: i, text, state: "pending", ms };
      });

      setState({
        open: true,
        crew: r.crew,
        title: r.title ?? "Genspark · web actions",
        lines,
        done: false,
        elapsedSec: null,
      });

      // Sequentially activate + complete each line
      let cumulative = 0;
      lines.forEach((line, i) => {
        const activateAt = cumulative;
        const completeAt = cumulative + line.ms;
        cumulative += line.ms;

        timeouts.current.push(
          window.setTimeout(() => {
            setState((s) => ({
              ...s,
              lines: s.lines.map((l) =>
                l.id === line.id ? { ...l, state: "active" } : l,
              ),
            }));
          }, activateAt),
        );
        timeouts.current.push(
          window.setTimeout(() => {
            setState((s) => ({
              ...s,
              lines: s.lines.map((l) =>
                l.id === line.id ? { ...l, state: "done" } : l,
              ),
            }));
          }, completeAt),
        );

        if (i === lines.length - 1) {
          timeouts.current.push(
            window.setTimeout(() => {
              setState((s) => ({
                ...s,
                done: true,
                elapsedSec: +(cumulative / 1000).toFixed(1),
              }));
              r.onDone?.();

              if (r.autoDismissMs !== null) {
                const dismissMs = r.autoDismissMs ?? 2000;
                timeouts.current.push(
                  window.setTimeout(() => {
                    setState((s) => ({ ...s, open: false }));
                  }, dismissMs),
                );
              }
            }, completeAt + 120),
          );
        }
      });
    },
    [clearTimers],
  );

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const value = useMemo<GensparkContextValue>(
    () => ({ state, run, close }),
    [state, run, close],
  );

  return (
    <GensparkContext.Provider value={value}>
      {children}
      <GensparkSidePanel />
    </GensparkContext.Provider>
  );
}

// ─── Panel UI ──────────────────────────────────────────────────────────────

function GensparkSidePanel() {
  const { state, close } = useGensparkPanel();
  const color = state.crew ? CREW[state.crew].color : "var(--sage)";
  const crewName = state.crew ? CREW[state.crew].name : "Crew";

  return (
    <>
      {/* Desktop: right-side panel */}
      <aside
        className={`
          hidden lg:flex flex-col
          fixed top-0 right-0 z-40
          h-screen w-[340px]
          bg-[var(--ink)] text-[var(--background)]
          border-l border-[color-mix(in_srgb,var(--ink)_50%,white)]
          shadow-[-12px_0_40px_-8px_rgba(26,24,22,0.28)]
          transition-transform duration-300 ease-out motion-reduce:transition-none
          ${state.open ? "translate-x-0" : "translate-x-full"}
        `}
        aria-hidden={!state.open}
        role="complementary"
      >
        <PanelHeader
          title={state.title}
          crewName={crewName}
          color={color}
          active={state.open && !state.done}
          onClose={close}
          elapsedSec={state.elapsedSec}
        />
        <PanelLog lines={state.lines} done={state.done} color={color} />
        <PanelFooter />
      </aside>

      {/* Mobile: bottom drawer */}
      <div
        className={`
          lg:hidden fixed inset-x-0 bottom-0 z-40
          transition-transform duration-300 ease-out motion-reduce:transition-none
          ${state.open ? "translate-y-0" : "translate-y-full"}
        `}
        aria-hidden={!state.open}
      >
        <div
          className="mx-auto max-h-[60vh] flex flex-col rounded-t-2xl bg-[var(--ink)] text-[var(--background)] shadow-2xl border-t border-[color-mix(in_srgb,var(--ink)_50%,white)]"
        >
          <div
            className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/20"
            aria-hidden
          />
          <PanelHeader
            title={state.title}
            crewName={crewName}
            color={color}
            active={state.open && !state.done}
            onClose={close}
            elapsedSec={state.elapsedSec}
          />
          <PanelLog lines={state.lines} done={state.done} color={color} />
          <PanelFooter />
        </div>
      </div>
    </>
  );
}

function PanelHeader({
  title,
  crewName,
  color,
  active,
  onClose,
  elapsedSec,
}: {
  title: string;
  crewName: string;
  color: string;
  active: boolean;
  onClose: () => void;
  elapsedSec: number | null;
}) {
  return (
    <div className="flex items-start justify-between gap-3 p-5 border-b border-white/10">
      <div className="min-w-0">
        <div
          className="font-mono text-[10px] uppercase tracking-widest"
          style={{ color }}
        >
          {title}
        </div>
        <div className="font-editorial text-lg tracking-tight mt-1 text-white truncate">
          {crewName}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {elapsedSec !== null ? (
          <span className="font-mono text-[10px] text-white/60 tabular-nums">
            {elapsedSec.toFixed(1)}s
          </span>
        ) : null}
        <span
          className={`h-2 w-2 rounded-full ${active ? "anim-pulse-hot" : ""}`}
          style={{
            backgroundColor: active ? color : "rgba(255,255,255,0.25)",
          }}
          aria-label={active ? "processing" : "done"}
        />
        <button
          type="button"
          onClick={onClose}
          className="h-6 w-6 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function PanelLog({
  lines,
  done,
  color,
}: {
  lines: Line[];
  done: boolean;
  color: string;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-5 font-mono text-xs space-y-2">
      {lines.map((l) => {
        const isDone = l.state === "done";
        const isActive = l.state === "active";
        const isPending = l.state === "pending";
        return (
          <div
            key={l.id}
            className="flex items-start gap-2 leading-relaxed"
            style={{
              color: isDone
                ? "rgba(255,255,255,0.65)"
                : isActive
                  ? color
                  : "rgba(255,255,255,0.3)",
            }}
          >
            <span className="shrink-0 mt-[2px]">
              {isDone ? (
                <Check className="h-3 w-3" strokeWidth={2.5} />
              ) : isActive ? (
                <span
                  className="inline-block h-3 w-3 anim-pulse-hot"
                  style={{ color }}
                >
                  ▸
                </span>
              ) : (
                <span className="inline-block h-3 w-3">▸</span>
              )}
            </span>
            <span className={isPending ? "" : ""}>{l.text}</span>
          </div>
        );
      })}
      {done ? (
        <div className="pt-3 flex items-center gap-2 text-white/70">
          <Check className="h-3.5 w-3.5" style={{ color: "var(--sage)" }} strokeWidth={2.5} />
          <span>Done.</span>
        </div>
      ) : null}
    </div>
  );
}

function PanelFooter() {
  return (
    <div className="border-t border-white/10 px-5 py-3 font-mono text-[10px] text-white/40 leading-relaxed">
      Stub for this session · real Genspark Super Agent wires in on hackathon day.
    </div>
  );
}
