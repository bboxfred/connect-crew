import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { CREW, type CrewKey } from "@/lib/fixtures";

type Props = {
  eyebrow: string;
  title: string;
  lede: string;
  crewKey?: CrewKey;
  /** where to bounce the user back to (default /app/morning-connect) */
  fallbackHref?: string;
  fallbackLabel?: string;
  children?: React.ReactNode;
};

/**
 * Shared "Coming soon" shell for Crew + Settings stubs. Matches the
 * dashboard aesthetic so judges never land on a dead page.
 */
export function ComingSoonShell({
  eyebrow,
  title,
  lede,
  crewKey,
  fallbackHref = "/app/morning-connect",
  fallbackLabel = "Open Morning Connect",
  children,
}: Props) {
  const accent = crewKey ? CREW[crewKey].color : "var(--ink)";
  const accentTint = crewKey
    ? CREW[crewKey].tint
    : "color-mix(in srgb, var(--ink) 6%, white)";
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10">
        <div
          className="font-mono text-[10px] uppercase tracking-widest mb-3"
          style={{ color: accent }}
        >
          {eyebrow}
        </div>
        <h1
          className="font-editorial text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight"
          style={{ fontWeight: 700, letterSpacing: "-0.03em" }}
        >
          {title}
        </h1>
        <p className="mt-4 text-base md:text-lg text-[var(--muted-strong)] leading-relaxed max-w-2xl">
          {lede}
        </p>
      </header>

      <div
        className="rounded-2xl p-8 md:p-10 border text-center"
        style={{
          backgroundColor: accentTint,
          borderColor: `color-mix(in srgb, ${accent} 25%, transparent)`,
        }}
      >
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5"
          style={{
            backgroundColor: "white",
            color: accent,
            border: `1px solid color-mix(in srgb, ${accent} 30%, transparent)`,
          }}
        >
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
          <span className="font-mono text-[10px] uppercase tracking-widest">
            Coming soon
          </span>
        </div>
        <h2
          className="font-editorial text-2xl md:text-3xl tracking-tight leading-tight mb-3"
          style={{ fontWeight: 600 }}
        >
          This screen ships with the hackathon build.
        </h2>
        <p className="text-sm text-[var(--muted-strong)] leading-relaxed max-w-lg mx-auto">
          The Crew is already working in the background — you can see the
          latest items in Morning Connect or on the Dashboard.
        </p>

        {children ? <div className="mt-6">{children}</div> : null}

        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <Link
            href={fallbackHref}
            className="inline-flex items-center gap-2 rounded-full text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: accent }}
          >
            {fallbackLabel}
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
          <Link
            href="/app/dashboard"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted-strong)] hover:text-[var(--foreground)] transition-colors"
          >
            See the Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
