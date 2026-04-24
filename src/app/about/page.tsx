import { PageShell } from "@/components/page-shell";

const story = [
  {
    year: "2023",
    title: "The problem, felt first-hand",
    body: "Freddy was running Asia Blockchain Association events, Web3 SG, and Claude Code SG in parallel. Every month, hundreds of new contacts across Telegram, WhatsApp, LinkedIn, email, and business cards. A tidal wave no CRM could absorb.",
  },
  {
    year: "2025",
    title: "The insight",
    body: "A personal CRM is a filing cabinet. What operators need is a staff — agents that classify, enrich, and draft in the background, and a single daily ritual that keeps humans in control.",
  },
  {
    year: "2026",
    title: "The Crew",
    body: "Six AI Crew members running in the background, reading from one shared relationship graph, governed by user-set autonomy. Debuting at Push to Prod, Singapore, April 2026.",
  },
];

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title={
        <>
          Built by an operator,
          <br />
          <span style={{ color: "var(--copper)" }}>for operators</span>.
        </>
      }
      lede="Connect Crew started as Freddy Lim's own tool for running four organisations in parallel. It became a product when too many people asked for access."
      accent="var(--copper)"
    >
      <section className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-10 md:gap-16 mb-16">
        <div className="space-y-5 text-[var(--foreground)]/85 leading-relaxed text-sm md:text-base">
          <p>
            Freddy Lim is a multi-hyphenate operator based in Singapore — he
            runs Asia Blockchain Association events, Web3 SG, and Claude Code
            SG, and he's an artist whose Hungry Hamster collectibles have been
            shown at the National Museum Singapore.
          </p>
          <p>
            Across those four contexts, he meets the same kind of people:
            founders, investors, policymakers, artists, builders. The
            relationships don't fit neatly into any one CRM. The context gets
            lost the moment an event ends.
          </p>
          <p>
            Connect Crew is what he built for himself first. The beta cohort —
            Web3 SG organisers, Claude Code SG alumni, ABA EXCO colleagues,
            SEA founder friends — validated that the pattern is not unique.
          </p>
        </div>

        <div
          className="rounded-2xl p-8 border"
          style={{
            backgroundColor: "color-mix(in srgb, var(--copper) 6%, white)",
            borderColor: "color-mix(in srgb, var(--copper) 25%, transparent)",
          }}
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--copper)] mb-5">
            Privacy posture
          </div>
          <p className="font-editorial text-xl leading-snug mb-4" style={{ fontWeight: 600 }}>
            &ldquo;Classification is local. The graph is yours. Every action is
            human-approved or user-authorised. No training on user data, ever.&rdquo;
          </p>
          <p className="text-xs text-[var(--muted-strong)] leading-relaxed">
            PDPA + GDPR by default. SOC 2 Type II on the 6-12 month roadmap. Data
            residency configurable.
          </p>
        </div>
      </section>

      <h2 className="font-editorial text-2xl md:text-3xl tracking-tight mb-8">
        How we got here
      </h2>
      <ol className="space-y-0">
        {story.map((s, i) => (
          <li
            key={s.year}
            className="grid grid-cols-[70px_1fr] md:grid-cols-[120px_1fr] gap-6 md:gap-10 py-8 border-t border-[var(--hairline)] last:border-b reveal-on-scroll"
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            <div
              className="font-editorial text-2xl md:text-3xl tabular-nums"
              style={{ color: "var(--copper)", fontWeight: 700 }}
            >
              {s.year}
            </div>
            <div>
              <h3 className="font-editorial text-lg md:text-xl tracking-tight mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-[var(--muted-strong)] leading-relaxed max-w-2xl">
                {s.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </PageShell>
  );
}
