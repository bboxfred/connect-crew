import type { ReactNode } from "react";

export function PageShell({
  eyebrow,
  title,
  lede,
  children,
  accent = "var(--coral)",
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: string;
  children?: ReactNode;
  accent?: string;
}) {
  return (
    <main className="flex-1 flex flex-col paper-grain relative">
      {/* drifting blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute top-[15%] -left-20 h-80 w-80 rounded-full blur-3xl opacity-[0.08] anim-drift-1"
          style={{ backgroundColor: accent }}
        />
        <div
          className="absolute bottom-[20%] -right-16 h-64 w-64 rounded-full blur-3xl opacity-[0.06] anim-drift-2"
          style={{ backgroundColor: "var(--teal)" }}
        />
      </div>

      <div className="h-1 w-full rail-animated" aria-hidden />

      <section className="mx-auto w-full max-w-5xl px-6 pt-16 md:pt-24 pb-10 md:pb-14">
        <div
          className="font-mono text-[10px] md:text-xs tracking-widest uppercase mb-5 anim-fade-up"
          style={{ color: accent }}
        >
          {eyebrow}
        </div>
        <h1
          className="font-editorial text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight anim-fade-up"
          style={{ animationDelay: "0.05s", fontWeight: 700 }}
        >
          {title}
        </h1>
        {lede ? (
          <p
            className="mt-5 text-base md:text-lg text-[var(--muted-strong)] leading-relaxed anim-fade-up max-w-2xl"
            style={{ animationDelay: "0.15s" }}
          >
            {lede}
          </p>
        ) : null}
      </section>

      <div className="mx-auto w-full max-w-5xl px-6 pb-24">{children}</div>

      <div className="h-1 w-full rail-animated mt-auto" aria-hidden />
    </main>
  );
}
