import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ShieldCheck } from "lucide-react";

type Variant = "light" | "dark";

export function TierBlock({
  name,
  label,
  heading,
  subtitle,
  gains,
  stopsLosing,
  color,
  Icon,
  variant = "light",
  emphasized = false,
  compact = false,
}: {
  name?: string;
  label: string;
  heading: string;
  subtitle: string;
  gains: string[];
  stopsLosing: string[];
  color: string;
  Icon: LucideIcon;
  variant?: Variant;
  emphasized?: boolean;
  compact?: boolean;
}) {
  const isDark = variant === "dark";

  return (
    <article
      className={`relative rounded-2xl overflow-hidden border flex flex-col h-full transition-shadow duration-300 hover:shadow-xl ${
        emphasized ? "shadow-[0_24px_60px_-24px_rgba(61,78,126,0.35)]" : ""
      }`}
      style={{
        backgroundColor: isDark
          ? color
          : "color-mix(in srgb, " + color + " 6%, white)",
        borderColor: isDark
          ? `color-mix(in srgb, ${color} 75%, black)`
          : `color-mix(in srgb, ${color} 25%, transparent)`,
        color: isDark ? "white" : undefined,
      }}
    >
      {/* Faint pattern on dark variant */}
      {isDark ? (
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 10%, white 1px, transparent 1px), radial-gradient(circle at 60% 80%, white 1px, transparent 1px)",
            backgroundSize: "24px 24px, 18px 18px",
          }}
        />
      ) : null}

      {/* Header */}
      <div
        className={`relative ${
          compact ? "p-6" : "p-7 md:p-9 pb-6"
        } flex items-start justify-between gap-4`}
      >
        <div className="flex-1 min-w-0">
          <div
            className="font-mono text-[10px] uppercase tracking-widest mb-2"
            style={{
              color: isDark ? "rgba(255,255,255,0.6)" : "var(--muted)",
            }}
          >
            {label}
          </div>
          {name ? (
            <div
              className={`font-editorial tracking-tight leading-none mb-4 ${
                compact ? "text-4xl md:text-5xl" : "text-5xl md:text-6xl"
              }`}
              style={{
                color: isDark ? "white" : color,
                fontWeight: 700,
                letterSpacing: "-0.03em",
              }}
            >
              {name}
            </div>
          ) : null}
          <h3
            className={`font-editorial leading-[1.15] tracking-tight ${
              compact ? "text-base md:text-lg" : "text-xl md:text-2xl"
            }`}
            style={{
              color: isDark ? "white" : "var(--ink)",
              fontWeight: 600,
            }}
          >
            {heading}
          </h3>
          <p
            className={`mt-3 leading-relaxed ${
              compact ? "text-sm" : "text-sm md:text-[15px]"
            }`}
            style={{
              color: isDark ? "rgba(255,255,255,0.78)" : "var(--muted-strong)",
            }}
          >
            {subtitle}
          </p>
        </div>
        <div
          className={`rounded-xl flex items-center justify-center shrink-0 ${
            compact ? "h-10 w-10" : "h-12 w-12 md:h-14 md:w-14"
          }`}
          style={{
            backgroundColor: isDark
              ? "rgba(255,255,255,0.12)"
              : `color-mix(in srgb, ${color} 14%, white)`,
            border: isDark
              ? "1px solid rgba(255,255,255,0.18)"
              : `1px solid color-mix(in srgb, ${color} 28%, transparent)`,
          }}
        >
          <Icon
            className={compact ? "h-5 w-5" : "h-6 w-6 md:h-7 md:w-7"}
            style={{ color: isDark ? "white" : color }}
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* Value content */}
      <div
        className="relative border-t flex-1"
        style={{
          borderColor: isDark
            ? "rgba(255,255,255,0.14)"
            : "var(--hairline)",
        }}
      >
        <div
          className={
            compact
              ? "grid grid-cols-1"
              : "grid grid-cols-1 md:grid-cols-2"
          }
        >
          <Column
            title="What you gain"
            items={gains}
            isDark={isDark}
            color={color}
            accent="gain"
            compact={compact}
          />
          {!compact ? (
            <div
              className="hidden md:block"
              style={{
                borderLeft: isDark
                  ? "1px solid rgba(255,255,255,0.14)"
                  : "1px solid var(--hairline)",
              }}
            />
          ) : null}
          <Column
            title="What you stop losing"
            items={stopsLosing}
            isDark={isDark}
            color={color}
            accent="preserve"
            topBorderMobile
            compact={compact}
          />
        </div>
      </div>
    </article>
  );
}

function Column({
  title,
  items,
  isDark,
  color,
  accent,
  topBorderMobile = false,
  compact = false,
}: {
  title: string;
  items: string[];
  isDark: boolean;
  color: string;
  accent: "gain" | "preserve";
  topBorderMobile?: boolean;
  compact?: boolean;
}) {
  const Icon = accent === "gain" ? ArrowUpRight : ShieldCheck;
  const borderCls = compact
    ? isDark
      ? "border-t border-white/14"
      : "border-t border-[var(--hairline)]"
    : topBorderMobile
      ? isDark
        ? "border-t border-white/14 md:border-t-0"
        : "border-t border-[var(--hairline)] md:border-t-0"
      : "";
  return (
    <div
      className={`${compact ? "p-6" : "p-7 md:p-9 pt-6"} ${accent === "preserve" ? borderCls : ""}`}
    >
      <div className="flex items-center gap-2 mb-5">
        <Icon
          className="h-4 w-4 shrink-0"
          strokeWidth={1.75}
          style={{ color: isDark ? "rgba(255,255,255,0.7)" : color }}
        />
        <span
          className="font-mono text-[10px] uppercase tracking-widest"
          style={{
            color: isDark ? "rgba(255,255,255,0.7)" : "var(--muted-strong)",
          }}
        >
          {title}
        </span>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2.5 text-sm leading-relaxed"
            style={{
              color: isDark ? "rgba(255,255,255,0.92)" : "var(--foreground)",
            }}
          >
            <span
              className="mt-[7px] h-1.5 w-1.5 rounded-full shrink-0"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.6)" : color,
              }}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
