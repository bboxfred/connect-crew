"use client";

/**
 * HomeLoader — full-screen brand splash shown on the landing page
 * until the fonts + top visuals are ready. Fades out after the
 * longer of: fonts.ready, window load, and a 1.2s minimum so the
 * brand moment feels deliberate rather than a flicker.
 */

import { useEffect, useState } from "react";

export function HomeLoader() {
  const [mounted, setMounted] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const minDelay = new Promise<void>((r) => setTimeout(r, 1200));
    const fontsReady =
      typeof document !== "undefined" && document.fonts
        ? document.fonts.ready.then(() => undefined)
        : Promise.resolve();
    const windowLoad =
      typeof window !== "undefined" && document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((r) => {
            window.addEventListener("load", () => r(), { once: true });
          });

    Promise.all([minDelay, fontsReady, windowLoad]).then(() => {
      if (cancelled) return;
      setFading(true);
      setTimeout(() => {
        if (!cancelled) setMounted(false);
      }, 550);
    });

    // Hard cap at 4 seconds — if something goes wrong, don't trap the
    // user on the loader forever.
    const hardTimeout = window.setTimeout(() => {
      if (cancelled) return;
      setFading(true);
      setTimeout(() => setMounted(false), 550);
    }, 4000);

    return () => {
      cancelled = true;
      window.clearTimeout(hardTimeout);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 ease-out ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background:
          "radial-gradient(ellipse at center, #15204a 0%, #0a1230 70%, #05081a 100%)",
      }}
      aria-hidden={fading}
      role="status"
      aria-label="Loading Connect Crew"
    >
      <div className="flex flex-col items-center gap-7">
        {/* Logo (white wordmark) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/logo-white.png"
          alt="Connect Crew"
          className="h-8 md:h-10 w-auto drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]"
          draggable={false}
        />

        {/* Spinner — concentric rings + rotating arc */}
        <div className="relative h-12 w-12">
          {/* Faint ring */}
          <div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: "rgba(255,255,255,0.10)" }}
          />
          {/* Rotating arc */}
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
            style={{
              borderTopColor: "rgba(255,255,255,0.75)",
              borderRightColor: "rgba(255,255,255,0.25)",
              animationDuration: "900ms",
            }}
          />
        </div>

        {/* Subtle loading hint */}
        <div
          className="font-mono text-[10px] uppercase tracking-widest text-white/40"
          aria-hidden
        >
          Preparing the Crew…
        </div>
      </div>
    </div>
  );
}
