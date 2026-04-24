import { cn, warmthTier, type WarmthTier } from "@/lib/utils";

const tierLabel: Record<WarmthTier, string> = {
  hot: "hot",
  warm: "warm",
  neutral: "neutral",
  cold: "cold",
};

const tierBg: Record<WarmthTier, string> = {
  hot: "bg-warmth-hot",
  warm: "bg-warmth-warm",
  neutral: "bg-warmth-neutral",
  cold: "bg-warmth-cold",
};

export function WarmthBar({
  score,
  className,
  animated = true,
}: {
  score: number;
  className?: string;
  animated?: boolean;
}) {
  const tier = warmthTier(score);
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="h-1.5 w-full rounded-full bg-[var(--hairline)] overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500",
            tierBg[tier],
            animated && "anim-bar-fill",
          )}
          style={{ width: `${Math.max(4, Math.min(100, score))}%` }}
        />
      </div>
      <div className="font-mono text-xs tabular-nums flex items-center gap-1.5 shrink-0">
        <span className="text-[var(--foreground)] font-medium">{score}</span>
        <span className="text-[var(--muted)]">· {tierLabel[tier]}</span>
      </div>
    </div>
  );
}
