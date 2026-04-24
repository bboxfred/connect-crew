"use client";

/**
 * WarmthTimelineChart — the hero visual on the Contact Detail page.
 *
 * 90-day line chart with tier-coloured reference bands (hot / warm /
 * neutral / cold), a single Warmth line, and interaction dots. Built
 * with recharts.
 */

import { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  ReferenceArea,
  ReferenceDot,
} from "recharts";
import type { WarmthPoint } from "@/lib/fixtures";
import { warmthTier } from "@/lib/utils";

const TIER_COLOR = {
  hot: "#e85a3c",
  warm: "#e8a33a",
  neutral: "#6a9b8f",
  cold: "#8a8680",
};

function formatDay(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

type Props = {
  points: WarmthPoint[];
  /** chart height in px (default 220) */
  height?: number;
};

function CustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ payload: WarmthPoint }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  const tier = warmthTier(p.warmth);
  return (
    <div className="rounded-lg bg-[var(--ink)] text-white shadow-xl px-3 py-2 min-w-[200px]">
      <div className="flex items-center justify-between gap-3 mb-0.5">
        <span className="font-mono text-[10px] uppercase tracking-wider text-white/70">
          {formatDay(p.date)}
        </span>
        <span
          className="font-mono text-xs tabular-nums"
          style={{ color: TIER_COLOR[tier] }}
        >
          {p.warmth}
        </span>
      </div>
      {p.event ? (
        <div className="font-mono text-[10px] text-white/80 leading-relaxed mt-1">
          {p.event}
        </div>
      ) : null}
    </div>
  );
}

export function WarmthTimelineChart({ points, height = 220 }: Props) {
  const data = useMemo(
    () =>
      points.map((p) => ({
        ...p,
        // Add numeric X for recharts
        dayIdx: p.day,
      })),
    [points],
  );

  const eventPoints = useMemo(() => points.filter((p) => !!p.event), [points]);

  if (points.length < 3) {
    return (
      <div
        className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--paper)]/40 flex items-center justify-center text-center p-8"
        style={{ minHeight: height }}
      >
        <div>
          <div className="font-editorial text-lg tracking-tight mb-2">
            Not enough history yet.
          </div>
          <p className="text-sm text-[var(--muted-strong)] leading-relaxed">
            Secret Signals is watching. Once you exchange a few messages the
            Warmth timeline will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 12, right: 16, left: 0, bottom: 12 }}
        >
          {/* Reference bands for each Warmth tier */}
          <ReferenceArea y1={75} y2={100} fill={TIER_COLOR.hot} fillOpacity={0.06} />
          <ReferenceArea y1={55} y2={75} fill={TIER_COLOR.warm} fillOpacity={0.06} />
          <ReferenceArea y1={35} y2={55} fill={TIER_COLOR.neutral} fillOpacity={0.06} />
          <ReferenceArea y1={0} y2={35} fill={TIER_COLOR.cold} fillOpacity={0.06} />

          <CartesianGrid stroke="var(--hairline)" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="dayIdx"
            type="number"
            domain={[0, 90]}
            ticks={[0, 15, 30, 45, 60, 75, 90]}
            tickFormatter={(v) =>
              v === 0
                ? "90d"
                : v === 90
                  ? "Today"
                  : `${90 - v}d`
            }
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
            tick={{ fontSize: 10, fill: "var(--muted)", fontFamily: "var(--font-mono)" }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 35, 55, 75, 100]}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
            tick={{ fontSize: 10, fill: "var(--muted)", fontFamily: "var(--font-mono)" }}
            width={30}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--ink)", strokeDasharray: "3 3" }} />

          {/* The Warmth line itself */}
          <Line
            type="monotone"
            dataKey="warmth"
            stroke="var(--ink)"
            strokeWidth={2}
            dot={(props: { cx?: number; cy?: number; payload?: WarmthPoint; index?: number }) => {
              const { cx, cy, payload, index } = props;
              if (cx === undefined || cy === undefined || !payload) {
                return <g key={`nodot-${index ?? 0}`} />;
              }
              const tier = warmthTier(payload.warmth);
              const isEvent = !!payload.event;
              return (
                <circle
                  key={`dot-${payload.day}`}
                  cx={cx}
                  cy={cy}
                  r={isEvent ? 4.5 : 3}
                  fill={TIER_COLOR[tier]}
                  stroke="white"
                  strokeWidth={1.5}
                />
              );
            }}
            activeDot={{ r: 6, strokeWidth: 2, stroke: "white" }}
            isAnimationActive={false}
          />

          {/* Explicit reference dots for labelled events (larger, coloured) */}
          {eventPoints.slice(0, 6).map((p) => {
            const tier = warmthTier(p.warmth);
            return (
              <ReferenceDot
                key={`ev-${p.day}`}
                x={p.day}
                y={p.warmth}
                r={5}
                fill={TIER_COLOR[tier]}
                stroke="white"
                strokeWidth={1.5}
                ifOverflow="extendDomain"
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend strip */}
      <div className="mt-3 flex items-center gap-4 flex-wrap font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
        {(["hot", "warm", "neutral", "cold"] as const).map((t) => (
          <div key={t} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: TIER_COLOR[t] }}
            />
            <span>{t}</span>
            <span className="text-[var(--muted)]/60 normal-case">
              {t === "hot"
                ? "≥75"
                : t === "warm"
                  ? "55-74"
                  : t === "neutral"
                    ? "35-54"
                    : "<35"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
