"use client";

import { useState } from "react";
import type { WarmthUpdateToday, WarmthTier } from "@/lib/fixtures";

const TIER_COLOR: Record<WarmthTier, string> = {
  hot: "var(--warmth-hot)",
  warm: "var(--warmth-warm)",
  neutral: "var(--warmth-neutral)",
  cold: "var(--warmth-cold)",
};

type Props = {
  updates: WarmthUpdateToday[];
  /** vertical pixels for the chart band (default 80) */
  height?: number;
};

export function WarmthSparkline({ updates, height = 80 }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Layout: 24-hour X axis. Y is delta range (auto-scaled with symmetric padding).
  const padX = 12;
  const padY = 12;
  const viewW = 800;
  const viewH = height;

  const maxAbs = Math.max(
    6,
    ...updates.map((u) => Math.abs(u.delta)),
  );

  const xFor = (hour: number, minute: number) => {
    const mins = hour * 60 + minute;
    return padX + (mins / (24 * 60)) * (viewW - padX * 2);
  };
  const yFor = (delta: number) => {
    const mid = viewH / 2;
    const range = viewH / 2 - padY;
    return mid - (delta / maxAbs) * range;
  };

  const midY = viewH / 2;

  // Build a polyline of deltas connecting in chronological order
  const sorted = [...updates].sort(
    (a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute),
  );

  const linePoints = sorted
    .map((u) => `${xFor(u.hour, u.minute)},${yFor(u.delta)}`)
    .join(" ");

  const positiveCount = updates.filter((u) => u.delta > 0).length;
  const negativeCount = updates.filter((u) => u.delta < 0).length;

  return (
    <div className="w-full">
      <div
        className="relative w-full"
        style={{ height: `${viewH}px` }}
        onMouseLeave={() => setHoveredId(null)}
      >
        <svg
          viewBox={`0 0 ${viewW} ${viewH}`}
          preserveAspectRatio="none"
          className="w-full h-full"
          aria-label={`Warmth updates today — ${updates.length} events`}
        >
          {/* Zero baseline */}
          <line
            x1={padX}
            y1={midY}
            x2={viewW - padX}
            y2={midY}
            stroke="var(--border)"
            strokeDasharray="3 3"
          />

          {/* Hour gridlines (every 6 hours) */}
          {[6, 12, 18].map((h) => {
            const x = xFor(h, 0);
            return (
              <g key={h}>
                <line
                  x1={x}
                  y1={padY}
                  x2={x}
                  y2={viewH - padY}
                  stroke="var(--hairline)"
                />
              </g>
            );
          })}

          {/* Delta polyline */}
          <polyline
            points={linePoints}
            fill="none"
            stroke="color-mix(in srgb, var(--ink) 35%, transparent)"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />

          {/* Dots — one per update, coloured by tier */}
          {updates.map((u) => {
            const cx = xFor(u.hour, u.minute);
            const cy = yFor(u.delta);
            const isHover = hoveredId === u.time + u.contact_id;
            return (
              <g key={u.time + u.contact_id}>
                {/* Drop-line to baseline for context */}
                <line
                  x1={cx}
                  y1={midY}
                  x2={cx}
                  y2={cy}
                  stroke={TIER_COLOR[u.tier]}
                  strokeWidth="1"
                  opacity="0.35"
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHover ? 5.5 : 3.5}
                  fill={TIER_COLOR[u.tier]}
                  stroke="white"
                  strokeWidth="1.25"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredId(u.time + u.contact_id)}
                  onClick={() => setHoveredId(u.time + u.contact_id)}
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredId
          ? (() => {
              const u = updates.find((x) => x.time + x.contact_id === hoveredId);
              if (!u) return null;
              const xPct = ((u.hour * 60 + u.minute) / (24 * 60)) * 100;
              const above = yFor(u.delta) < viewH / 2;
              return (
                <div
                  className="absolute z-10 px-2.5 py-2 rounded-lg bg-[var(--ink)] text-white shadow-xl pointer-events-none"
                  style={{
                    left: `${xPct}%`,
                    top: above ? "calc(100% + 8px)" : "auto",
                    bottom: above ? "auto" : "calc(100% + 8px)",
                    transform: "translateX(-50%)",
                    minWidth: "180px",
                  }}
                >
                  <div className="flex items-center justify-between gap-3 mb-0.5">
                    <span className="font-medium text-sm truncate">
                      {u.contact_name}
                    </span>
                    <span
                      className="font-mono text-xs tabular-nums"
                      style={{
                        color:
                          u.delta > 0
                            ? "var(--warmth-hot)"
                            : u.delta < 0
                              ? "var(--warmth-cold)"
                              : "rgba(255,255,255,0.6)",
                      }}
                    >
                      {u.delta > 0 ? `+${u.delta}` : u.delta}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-white/70 leading-relaxed">
                    {u.time} · {u.reason}
                  </div>
                </div>
              );
            })()
          : null}
      </div>

      {/* Hour ticks below the chart */}
      <div className="relative mt-1 h-4 font-mono text-[10px] text-[var(--muted)]">
        <span style={{ position: "absolute", left: 0 }}>00</span>
        <span style={{ position: "absolute", left: "25%" }}>06</span>
        <span style={{ position: "absolute", left: "50%" }}>12</span>
        <span style={{ position: "absolute", left: "75%" }}>18</span>
        <span style={{ position: "absolute", right: 0 }}>24</span>
      </div>

      <p className="mt-3 font-mono text-[11px] text-[var(--muted)] leading-relaxed">
        {updates.length} warmth updates today · {positiveCount} warming, {negativeCount} cooling
      </p>
    </div>
  );
}
