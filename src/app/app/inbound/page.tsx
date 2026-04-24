import { ComingSoonShell } from "@/components/coming-soon-shell";
import { CREW } from "@/lib/fixtures";

export default function InboundPage() {
  return (
    <ComingSoonShell
      eyebrow="Crew · 03 · Mailbox"
      title="Mailbox qualifies cold emails so you don't have to."
      lede={CREW.inbound.role}
      crewKey="inbound"
    />
  );
}
