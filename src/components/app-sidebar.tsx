"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Users,
  Settings,
  Menu,
  X,
  ChevronRight,
  ClipboardCheck,
  Network,
  Building2,
  Sparkles,
} from "lucide-react";
import {
  CREW,
  crewCountsToday,
  pendingDraftsCount,
  type CrewKey,
} from "@/lib/fixtures";
import { cn } from "@/lib/utils";
import { useViewMode, type ViewMode } from "@/components/view-mode-provider";

// ─── nav model ─────────────────────────────────────────────────────────────

type HomeItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  showBadge?: boolean;
};

// Small gradient bar — warm → cold spectrum. Reflects Lead-O-Meter's job.
function WarmthMeterIcon() {
  return (
    <span
      className="inline-block rounded-[2px]"
      style={{
        width: "16px",
        height: "5px",
        background:
          "linear-gradient(90deg, var(--warmth-hot) 0%, var(--warmth-warm) 38%, var(--warmth-neutral) 68%, var(--indigo) 100%)",
        boxShadow: "0 0 0 0.5px rgba(255,255,255,0.15)",
      }}
      aria-hidden
    />
  );
}

// Home nav items per mode. The sidebar reshapes around the active mode
// — Personal shows the operator's own day, Teams shows the shared graph,
// Enterprise shows the fund admin console.

const personalHomeItems: HomeItem[] = [
  {
    href: "/app/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} />,
  },
  {
    href: "/app/morning-connect",
    label: "Morning Connect",
    icon: <Inbox className="h-4 w-4" strokeWidth={1.75} />,
    showBadge: true,
  },
  {
    href: "/app/lead-o-meter",
    label: "Lead-O-Meter",
    icon: <WarmthMeterIcon />,
  },
  {
    href: "/app/contacts",
    label: "Contacts",
    icon: <Users className="h-4 w-4" strokeWidth={1.75} />,
  },
];

const teamsHomeItems: HomeItem[] = [
  {
    href: "/app/dashboard/teams",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} />,
  },
  {
    href: "/app/morning-connect",
    label: "Morning Connect",
    icon: <Inbox className="h-4 w-4" strokeWidth={1.75} />,
    showBadge: true,
  },
  {
    href: "/app/lead-o-meter",
    label: "Lead-O-Meter",
    icon: <WarmthMeterIcon />,
  },
  {
    href: "/app/contacts",
    label: "Contacts",
    icon: <Users className="h-4 w-4" strokeWidth={1.75} />,
  },
];

const enterpriseHomeItems: HomeItem[] = [
  {
    href: "/app/dashboard/enterprise",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} />,
  },
  {
    href: "/app/dashboard/enterprise#directory",
    label: "Ecosystem Directory",
    icon: <Network className="h-4 w-4" strokeWidth={1.75} />,
  },
  {
    href: "/app/dashboard/enterprise#approvals",
    label: "Intro Approvals",
    icon: <ClipboardCheck className="h-4 w-4" strokeWidth={1.75} />,
    showBadge: true,
  },
  {
    href: "/app/dashboard/enterprise#portcos",
    label: "Portcos",
    icon: <Building2 className="h-4 w-4" strokeWidth={1.75} />,
  },
];

function homeItemsForMode(mode: ViewMode): HomeItem[] {
  if (mode === "teams") return teamsHomeItems;
  if (mode === "enterprise") return enterpriseHomeItems;
  return personalHomeItems;
}

// Crew are channel specialists — each ingests + drafts on its own channel.
const crewOrder: CrewKey[] = ["scan", "signals", "inbound", "social", "scribe"];

const crewHref = (key: CrewKey) =>
  `/app/${key === "signals" ? "signals" : key}`;

function isActive(pathname: string, href: string) {
  // Strip hash for active matching (hash anchors don't show in pathname)
  const [cleanHref] = href.split("#");
  if (cleanHref === "/app/contacts") return pathname.startsWith("/app/contacts");
  return pathname === cleanHref;
}

// Colour per mode for the active switcher button + profile pill
const MODE_COLOR: Record<ViewMode, string> = {
  personal: "var(--terracotta)",
  teams: "var(--teal)",
  enterprise: "var(--indigo)",
};

// Profile pill content per mode
const MODE_PROFILE: Record<
  ViewMode,
  { initials: string; name: string; role: string }
> = {
  personal: { initials: "FL", name: "Freddy Lim", role: "fred@collecter.club" },
  teams: { initials: "FL", name: "Freddy Lim · team lead", role: "4 teammates · 1 shared graph" },
  enterprise: { initials: "TS", name: "Temasek · fund admin", role: "14 portcos · 5 verticals" },
};

// ─── Desktop sidebar + Mobile bottom bar + More sheet ──────────────────────

export function AppSidebar() {
  const pathname = usePathname();
  const { mode, setMode } = useViewMode();
  const [moreOpen, setMoreOpen] = useState(false);
  const counts = crewCountsToday();
  const pending = pendingDraftsCount();
  const homeItems = homeItemsForMode(mode);
  const modeColor = MODE_COLOR[mode];
  const profile = MODE_PROFILE[mode];
  const showCrewSection = mode !== "enterprise";

  // Close the More sheet whenever the route changes
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ─── Desktop sidebar (≥1024px) ──────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-[260px] shrink-0 border-r border-[color-mix(in_srgb,var(--ink)_80%,white)] bg-[var(--ink)] text-white">
        {/* Brand (the top-nav is hidden on /app/* — see AppBrand note) */}
        <div className="px-6 py-4 border-b border-white/10">
          <Link
            href="/"
            className="flex items-center text-white"
            aria-label="Connect Crew — home"
          >
            {/* White wordmark on dark sidebar. Source 2219x270. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-white.png"
              alt="Connect Crew"
              height={24}
              className="h-6 w-auto"
              draggable={false}
            />
          </Link>
        </div>

        {/* View switcher — Personal / Teams / Enterprise */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="font-mono text-[9px] uppercase tracking-widest text-white/40 px-1 mb-1.5">
            View as
          </div>
          <ViewSwitcher mode={mode} onChange={setMode} />
        </div>

        {/* The Chief — Master Connect tile (plum, above Home, visible in all 3 modes) */}
        <div className="px-4 pt-4 pb-2">
          <div className="font-mono text-[9px] uppercase tracking-widest text-white/40 px-1 mb-1.5">
            The Chief
          </div>
          <Link
            href="/app/master-connect"
            className="group relative block rounded-xl overflow-hidden transition-transform duration-200 hover:-translate-y-px"
            style={{
              backgroundColor: "var(--plum)",
              boxShadow: isActive(pathname, "/app/master-connect")
                ? "inset 0 0 0 2px white, 0 8px 20px -8px var(--plum)"
                : "0 4px 12px -4px color-mix(in srgb, var(--plum) 70%, transparent)",
            }}
          >
            <div className="relative px-3 py-3 flex items-center gap-2.5">
              <span
                className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 bg-white/15"
                aria-hidden
              >
                <Sparkles className="h-4 w-4 text-white" strokeWidth={1.75} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-white leading-tight">
                  Master Connect
                </div>
                <div className="font-mono text-[10px] text-white/75 uppercase tracking-wider mt-0.5">
                  Ask the graph
                </div>
              </div>
              <span
                className="font-mono text-[10px] px-1.5 py-0.5 rounded tabular-nums bg-white/20 text-white/95"
                aria-hidden
              >
                00
              </span>
            </div>
            {/* subtle top-light gradient */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 50%)",
              }}
            />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
          <SidebarSection title="Home">
            {homeItems.map((item) => (
              <SidebarLink
                key={item.href}
                label={item.label}
                icon={item.icon}
                href={item.href}
                active={isActive(pathname, item.href)}
                accent="white"
                badge={
                  item.showBadge ? (
                    <Badge value={pending} color={modeColor} />
                  ) : undefined
                }
              />
            ))}
          </SidebarSection>

          {showCrewSection ? (
            <SidebarSection title="Your Crew">
              {crewOrder.map((key) => {
                const crew = CREW[key];
                const count = counts[key];
                const href = crewHref(key);
                return (
                  <CrewTile
                    key={key}
                    href={href}
                    label={crew.name}
                    color={crew.color}
                    count={count}
                    active={isActive(pathname, href)}
                  />
                );
              })}
            </SidebarSection>
          ) : (
            <SidebarSection title="Fund Admin">
              <div className="px-3 py-2 rounded-lg bg-white/5 text-white/70 text-xs leading-relaxed">
                <span className="font-medium text-white">Enterprise view.</span>{" "}
                Individual Crew specialists run inside each portco. From here
                you oversee the ecosystem — not the day-to-day inbox.
              </div>
            </SidebarSection>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 px-4 py-4 space-y-1">
          <SidebarLink
            href="/app/settings"
            label="Settings"
            icon={<Settings className="h-4 w-4" strokeWidth={1.75} />}
            active={isActive(pathname, "/app/settings")}
            accent="white"
          />
          <div className="flex items-center gap-3 px-3 py-2">
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium text-white shrink-0 transition-colors duration-200"
              style={{ backgroundColor: modeColor }}
            >
              {profile.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate text-white">{profile.name}</div>
              <div className="text-[10px] font-mono text-white/50 truncate">
                {profile.role}
              </div>
            </div>
            <ChevronRight
              className="h-4 w-4 text-white/50 shrink-0"
              strokeWidth={1.75}
            />
          </div>
        </div>
      </aside>

      {/* ─── Mobile bottom tab bar (<1024px) ────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[var(--background)]/95 backdrop-blur-md border-t border-[var(--border)] grid grid-cols-4"
        aria-label="Primary"
      >
        <MobileTab
          href="/app/dashboard"
          label="Home"
          icon={<LayoutDashboard className="h-5 w-5" strokeWidth={1.75} />}
          active={isActive(pathname, "/app/dashboard")}
        />
        <MobileTab
          href="/app/morning-connect"
          label="Connect"
          icon={<Inbox className="h-5 w-5" strokeWidth={1.75} />}
          active={isActive(pathname, "/app/morning-connect")}
          badge={pending > 0 ? pending : undefined}
        />
        <MobileTab
          href="/app/contacts"
          label="Contacts"
          icon={<Users className="h-5 w-5" strokeWidth={1.75} />}
          active={isActive(pathname, "/app/contacts")}
        />
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          className={cn(
            "flex flex-col items-center justify-center gap-1 text-[10px] font-mono uppercase tracking-widest",
            moreOpen ? "text-[var(--foreground)]" : "text-[var(--muted)]",
          )}
          aria-expanded={moreOpen}
          aria-label="More"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
          <span>More</span>
        </button>
      </nav>

      {/* ─── Mobile "More" sheet ────────────────────────────────────── */}
      {moreOpen ? (
        <div
          className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/25 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
            aria-label="Close"
          />
          <div className="relative bg-[var(--ink)] text-white rounded-t-2xl border-t border-white/10 shadow-2xl max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="font-editorial text-xl tracking-tight text-white">More</div>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/5 text-white/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-4 py-4 space-y-6">
              <SidebarSection title="Your Crew">
                {crewOrder.map((key) => {
                  const crew = CREW[key];
                  const count = counts[key];
                  return (
                    <CrewTile
                      key={key}
                      href={crewHref(key)}
                      label={crew.name}
                      color={crew.color}
                      count={count}
                      active={isActive(pathname, crewHref(key))}
                    />
                  );
                })}
              </SidebarSection>
              <SidebarSection title="Account">
                <SidebarLink
                  href="/app/settings"
                  label="Settings"
                  icon={<Settings className="h-4 w-4" strokeWidth={1.75} />}
                  active={isActive(pathname, "/app/settings")}
                  accent="white"
                />
              </SidebarSection>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

// ─── Subcomponents ─────────────────────────────────────────────────────────

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-white/45 px-3 mb-2">
        {title}
      </div>
      <ul className="space-y-0.5">{children}</ul>
    </div>
  );
}

function SidebarLink({
  href,
  label,
  icon,
  active,
  accent,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  /** dark sidebar · accent is almost always "white" */
  accent: string;
  badge?: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
          active
            ? "text-white font-medium"
            : "text-white/70 hover:text-white hover:bg-white/5",
        )}
        style={{
          backgroundColor: active ? "rgba(255,255,255,0.08)" : undefined,
          boxShadow: active ? `inset 2px 0 0 0 ${accent}` : undefined,
        }}
      >
        <span
          className="flex h-4 w-4 items-center justify-center shrink-0"
          style={{ color: active ? accent : "rgba(255,255,255,0.55)" }}
        >
          {icon}
        </span>
        <span className="flex-1 truncate">{label}</span>
        {badge}
      </Link>
    </li>
  );
}

function CrewTile({
  href,
  label,
  color,
  count,
  active,
}: {
  href: string;
  label: string;
  color: string;
  count: number;
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group relative flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:brightness-110"
        style={{
          backgroundColor: color,
          boxShadow: active
            ? `inset 0 0 0 2px white, 0 4px 14px -4px ${color}`
            : `0 1px 0 0 color-mix(in srgb, ${color} 35%, transparent)`,
        }}
      >
        <span className="truncate">{label}</span>
        {count > 0 ? (
          <span
            className="font-mono text-[10px] px-1.5 py-0.5 rounded tabular-nums bg-white/20 text-white/95"
            aria-label={`${count} today`}
          >
            {count}
          </span>
        ) : (
          <span
            className="font-mono text-[10px] px-1.5 py-0.5 rounded tabular-nums bg-white/10 text-white/60"
            aria-hidden
          >
            0
          </span>
        )}
      </Link>
    </li>
  );
}

function Badge({ value, color }: { value: number; color: string }) {
  const zero = value === 0;
  return (
    <span
      className="font-mono text-[10px] px-1.5 py-0.5 rounded tabular-nums"
      style={{
        backgroundColor: zero
          ? "rgba(255,255,255,0.08)"
          : `color-mix(in srgb, ${color} 85%, white)`,
        color: zero ? "rgba(255,255,255,0.5)" : "white",
      }}
    >
      {value}
    </span>
  );
}

// ─── View switcher (Personal / Teams / Enterprise) ────────────────────────

function ViewSwitcher({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (next: ViewMode) => void;
}) {
  const options: { id: ViewMode; label: string; color: string }[] = [
    { id: "personal", label: "Personal", color: "var(--terracotta)" },
    { id: "teams", label: "Teams", color: "var(--teal)" },
    { id: "enterprise", label: "Enterprise", color: "var(--indigo)" },
  ];
  return (
    <div
      role="tablist"
      aria-label="Dashboard view"
      className="grid grid-cols-3 gap-1 p-1 rounded-lg"
      style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
    >
      {options.map((opt) => {
        const active = mode === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            className={cn(
              "font-mono text-[10px] uppercase tracking-widest h-8 rounded-md transition-all duration-200",
              active ? "text-white font-medium" : "text-white/55 hover:text-white/80 hover:bg-white/5",
            )}
            style={{
              backgroundColor: active ? opt.color : undefined,
              boxShadow: active ? `0 1px 0 0 rgba(0,0,0,0.2), inset 0 0 0 1px color-mix(in srgb, ${opt.color} 50%, white)` : undefined,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function MobileTab({
  href,
  label,
  icon,
  active,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-1 text-[10px] font-mono uppercase tracking-widest relative",
        active ? "text-[var(--foreground)]" : "text-[var(--muted)]",
      )}
    >
      {active ? (
        <span
          aria-hidden
          className="absolute top-0 left-1/4 right-1/4 h-[2px]"
          style={{ backgroundColor: "var(--ink)" }}
        />
      ) : null}
      {icon}
      <span>{label}</span>
      {badge ? (
        <span
          className="absolute top-2 right-[25%] font-mono text-[9px] px-1.5 py-0.5 rounded-full tabular-nums"
          style={{
            backgroundColor: "var(--terracotta)",
            color: "white",
          }}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
