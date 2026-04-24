import { redirect } from "next/navigation";

// "Warm" was a Crew member in an earlier taxonomy (deprecated April 23, 2026).
// Relationship temperature is now a graph property surfaced via Lead-O-Meter.
export default function DeprecatedWarmRoute() {
  redirect("/app/lead-o-meter");
}
