import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type WarmthTier = "hot" | "warm" | "neutral" | "cold";

export function warmthTier(score: number): WarmthTier {
  if (score >= 75) return "hot";
  if (score >= 55) return "warm";
  if (score >= 35) return "neutral";
  return "cold";
}

export const warmthColor: Record<WarmthTier, string> = {
  hot: "var(--warmth-hot)",
  warm: "var(--warmth-warm)",
  neutral: "var(--warmth-neutral)",
  cold: "var(--warmth-cold)",
};
