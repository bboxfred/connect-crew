/**
 * SignalChips — small row of detected-signal chips, used on the
 * Messenger page's live classification card and (later) in Morning
 * Connect draft cards to justify why a draft was produced.
 *
 * Accepts either raw string labels ("Hi!!", "🔥", "2-min reply") or
 * tagged chips with a tier colour hint.
 */

"use client";

type Chip =
  | string
  | {
      label: string;
      tone?: "hot" | "warm" | "neutral" | "cooling";
    };

export function SignalChips({
  chips,
  accentColor = "var(--teal)",
  dense = false,
}: {
  chips: Chip[];
  accentColor?: string;
  dense?: boolean;
}) {
  if (chips.length === 0) return null;
  return (
    <ul
      className={`flex flex-wrap items-center ${dense ? "gap-1" : "gap-1.5"}`}
      aria-label="Signals detected"
    >
      {chips.map((chip, i) => {
        const label = typeof chip === "string" ? chip : chip.label;
        const tone = typeof chip === "string" ? "neutral" : (chip.tone ?? "neutral");
        const bg = toneBackground(tone, accentColor);
        const fg = toneForeground(tone, accentColor);
        return (
          <li
            key={`${label}-${i}`}
            className={`inline-flex items-center rounded-full font-mono tracking-wider uppercase tabular-nums ${
              dense ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5"
            }`}
            style={{ backgroundColor: bg, color: fg }}
            title={label}
          >
            {label}
          </li>
        );
      })}
    </ul>
  );
}

function toneBackground(
  tone: "hot" | "warm" | "neutral" | "cooling",
  accent: string,
): string {
  switch (tone) {
    case "hot":
      return `color-mix(in srgb, var(--warmth-hot) 14%, white)`;
    case "warm":
      return `color-mix(in srgb, var(--warmth-warm) 14%, white)`;
    case "cooling":
      return `color-mix(in srgb, var(--warmth-cold) 14%, white)`;
    case "neutral":
    default:
      return `color-mix(in srgb, ${accent} 10%, white)`;
  }
}

function toneForeground(
  tone: "hot" | "warm" | "neutral" | "cooling",
  accent: string,
): string {
  switch (tone) {
    case "hot":
      return "var(--warmth-hot)";
    case "warm":
      return "var(--warmth-warm)";
    case "cooling":
      return "var(--warmth-cold)";
    case "neutral":
    default:
      return accent;
  }
}
