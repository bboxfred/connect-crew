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
          className="flex items-center shrink-0"
          aria-label="Connect Crew — home"
        >
          {/* Logo wordmark (color colorway) — source 2219x270, rendered at h=24
              so it reads at nav height. Next handles responsive scaling. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-color.png"
            alt="Connect Crew"
            height={24}
            className="h-6 w-auto"
            draggable={false}
          />
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
