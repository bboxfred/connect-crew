"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

// ─── View mode ─────────────────────────────────────────────────────────────
// Connect Crew's dashboard reshapes across three tiers: Personal, Teams,
// Enterprise. The sidebar exposes a 3-button switcher that routes between
// three dashboard pages AND also informs other /app/* pages of the current
// mode (via useViewMode()).
//
// Per project rule, no localStorage/sessionStorage. Mode persistence is
// purely URL-driven — /app/dashboard/teams sets mode=teams, /app/dashboard/
// enterprise sets mode=enterprise, anything else defaults to personal.

export type ViewMode = "personal" | "teams" | "enterprise";

type ViewModeContextValue = {
  mode: ViewMode;
  setMode: (next: ViewMode) => void;
};

const ViewModeContext = createContext<ViewModeContextValue | null>(null);

function modeFromPath(pathname: string): ViewMode {
  if (pathname.startsWith("/app/dashboard/enterprise")) return "enterprise";
  if (pathname.startsWith("/app/dashboard/teams")) return "teams";
  return "personal";
}

function pathForMode(mode: ViewMode): string {
  if (mode === "enterprise") return "/app/dashboard/enterprise";
  if (mode === "teams") return "/app/dashboard/teams";
  return "/app/dashboard";
}

export function ViewModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mode, setModeState] = useState<ViewMode>(() => modeFromPath(pathname));

  // Keep mode in sync with URL (e.g. user clicks a direct link)
  useEffect(() => {
    const next = modeFromPath(pathname);
    setModeState((prev) => (prev === next ? prev : next));
  }, [pathname]);

  const setMode = (next: ViewMode) => {
    setModeState(next);
    router.push(pathForMode(next));
  };

  const value = useMemo(() => ({ mode, setMode }), [mode]);

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode(): ViewModeContextValue {
  const ctx = useContext(ViewModeContext);
  if (!ctx) {
    // Graceful fallback — lets non-wrapped components still render.
    return { mode: "personal", setMode: () => {} };
  }
  return ctx;
}
