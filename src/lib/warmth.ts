/**
 * Warmth Index math — the 0-100 per-contact score that drives the
 * classification tiers (hot / warm / neutral / cold).
 *
 * Kept lightweight on purpose: caller applies deltas, clamps, picks
 * the right tier colour. The heavy lifting (behavioural classification
 * of what produced the delta) lives in classifier.ts.
 */

export type WarmthTier = "hot" | "warm" | "neutral" | "cold";

/**
 * Cap per-event warmth swing. Keeps one aggressive `Hi!! 🔥🔥🔥` from
 * shooting a contact from 30 → 90 in a single message.
 */
export const PER_EVENT_DELTA_CAP = 10;

export function clampWarmth(value: number): number {
  if (!Number.isFinite(value)) return 50;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return Math.round(value);
}

export function clampDelta(delta: number): number {
  if (!Number.isFinite(delta)) return 0;
  if (delta > PER_EVENT_DELTA_CAP) return PER_EVENT_DELTA_CAP;
  if (delta < -PER_EVENT_DELTA_CAP) return -PER_EVENT_DELTA_CAP;
  return Math.round(delta);
}

/**
 * Apply a signed delta to a current warmth, respecting caps at both
 * the per-event level (±10) and the 0-100 bounds.
 */
export function applyDelta(current: number, delta: number): number {
  const safeCurrent = clampWarmth(current);
  const safeDelta = clampDelta(delta);
  return clampWarmth(safeCurrent + safeDelta);
}

/**
 * Canonical tier mapping. Mirrors the `warmthTier()` discipline called
 * out in CLAUDE.md §5:
 *    >= 75 hot · 55-74 warm · 35-54 neutral · < 35 cold
 */
export function warmthTier(score: number): WarmthTier {
  const v = clampWarmth(score);
  if (v >= 75) return "hot";
  if (v >= 55) return "warm";
  if (v >= 35) return "neutral";
  return "cold";
}

/**
 * CSS variable name for a tier — use as `var(${tierVar(t)})`.
 */
export function tierVar(tier: WarmthTier): string {
  return `--warmth-${tier}`;
}
