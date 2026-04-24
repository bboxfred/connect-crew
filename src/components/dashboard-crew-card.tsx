import Link from "next/link";
import { CREW, type CrewKey, type ActivityEntry } from "@/lib/fixtures";

type Props = {
  crewKey: CrewKey;
  count: number;
  stat: string;
  latest?: ActivityEntry;
  rotation: number;
};

const crewHref: Record<CrewKey, string> = {
  scan: "/app/scan",
  signals: "/app/signals",
  inbound: "/app/inbound",
  scribe: "/app/scribe",
  social: "/app/social",
};

export function DashboardCrewCard({
  crewKey,
  count,
  stat,
  latest,
  rotation,
}: Props) {
  const crew = CREW[crewKey];
  const isQuiet = count === 0;

  return (
    <Link
      href={crewHref[crewKey]}
      className="group block rounded-2xl border bg-white p-6 md:p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg md:rotate-[var(--rot)] md:hover:rotate-0"
      style={{
        borderColor: `color-mix(in srgb, ${crew.color} 40%, var(--border))`,
        // @ts-expect-error custom property
        "--rot": `${rotation}deg`,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: crew.color }}
            aria-hidden
          />
          <span
            className="font-editorial text-lg tracking-tight"
            style={{ fontWeight: 600, color: "var(--ink)" }}
          >
            {crew.name}
          </span>
        </div>
        <span
          className="font-mono text-[10px] uppercase tracking-wider tabular-nums"
          style={{
            color: isQuiet ? "var(--muted)" : crew.color,
          }}
        >
          {isQuiet ? "all quiet" : `${count} today`}
        </span>
      </div>

      <p
        className="text-sm leading-relaxed mb-4"
        style={{ color: isQuiet ? "var(--muted)" : "var(--foreground)" }}
      >
        {stat}
      </p>

      {latest && !isQuiet ? (
        <div className="pt-4 border-t border-[var(--hairline)]">
          <div className="flex items-baseline gap-2 mb-1">
            <span
              className="font-mono text-[10px] tabular-nums shrink-0"
              style={{ color: crew.color }}
            >
              {latest.timestamp}
            </span>
            <span className="text-xs text-[var(--foreground)] leading-snug line-clamp-2">
              {latest.action}
            </span>
          </div>
          <div className="font-mono text-[10px] text-[var(--muted)] leading-relaxed line-clamp-2">
            {latest.detail}
          </div>
        </div>
      ) : null}
    </Link>
  );
}
