import { ComingSoonShell } from "@/components/coming-soon-shell";
import { CREW } from "@/lib/fixtures";

export default function ScribePage() {
  return (
    <ComingSoonShell
      eyebrow="Crew · 05 · Scribe"
      title="Scribe turns conversations into memory."
      lede={CREW.scribe.role}
      crewKey="scribe"
    />
  );
}
