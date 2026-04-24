"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

const navLinks = [
  { href: "/#crew", label: "The Crew" },
  { href: "/teams", label: "Teams" },
  { href: "/enterprise", label: "Enterprise" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();
  // Hide the marketing top-nav inside the dashboard — AppSidebar owns nav there.
  if (pathname.startsWith("/app")) return null;

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-[color-mix(in_srgb,var(--background)_82%,transparent)] border-b border-[var(--border)]">
      <div className="mx-auto max-w-7xl px-4 md:px-6 h-14 flex items-center justify-between gap-6">
        <Link
          href="/"
          className="font-editorial text-lg tracking-tight flex items-center gap-2 shrink-0"
        >
          <span
            className="inline-block h-2.5 w-2.5 rounded-full anim-rotate-slow"
            style={{
              background:
                "conic-gradient(from 0deg, var(--coral), var(--teal), var(--copper), var(--terracotta), var(--indigo), var(--sage), var(--coral))",
            }}
          />
          Connect Crew
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[var(--muted-strong)] hover:text-[var(--foreground)] transition-colors relative group"
            >
              {l.label}
              <span
                className="absolute left-0 right-0 -bottom-1 h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform"
                style={{ backgroundColor: "var(--foreground)" }}
              />
            </Link>
          ))}
        </div>
        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ink)] text-white px-3.5 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity shrink-0"
        >
          Open Dashboard <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
        </Link>
      </div>
    </nav>
  );
}
