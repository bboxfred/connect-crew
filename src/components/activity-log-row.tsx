import Link from "next/link";
import { CREW, type ActivityEntry } from "@/lib/fixtures";

type Props = { entry: ActivityEntry };

export function ActivityLogRow({ entry }: Props) {
  const crew = CREW[entry.crew];
  const hasContact = !!entry.contact_id;
  const Wrapper = (hasContact ? Link : "div") as React.ElementType;
  const wrapperProps = hasContact
    ? { href: `/app/contacts/${entry.contact_id}` }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`grid grid-cols-[auto_auto_1fr] gap-3 md:gap-4 items-start py-4 border-b border-[var(--hairline)] last:border-b-0 ${
        hasContact ? "hover:bg-[var(--paper)]/50 -mx-4 px-4 transition-colors" : ""
      }`}
    >
      <span
        className="mt-1.5 h-2 w-2 rounded-full shrink-0"
        style={{ backgroundColor: crew.color }}
        aria-hidden
      />
      <span className="font-mono text-xs tabular-nums text-[var(--muted)] shrink-0 mt-[2px]">
        {entry.timestamp}
      </span>
      <div className="min-w-0">
        <div className="text-sm text-[var(--foreground)] leading-snug">
          <span
            className="font-mono text-[10px] uppercase tracking-wider mr-2"
            style={{ color: crew.color }}
          >
            {crew.name}
          </span>
          <span>{entry.action}</span>
        </div>
        <div className="font-mono text-[11px] text-[var(--muted)] leading-relaxed mt-1">
          {entry.detail}
        </div>
      </div>
    </Wrapper>
  );
}
