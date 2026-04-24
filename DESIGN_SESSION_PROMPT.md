# Connect Crew — Design Session Prompt (Pre-Hackathon)

**When to paste:** Tonight or tomorrow morning (April 23, 2026), before the hackathon. This is the **dashboard design session** — NOT the hackathon kickoff.

**What it does:** Walks Claude Code through building the full dashboard with fixture data, in priority order. No live APIs. No backend wiring. Just the visual + structural layer, ready for the April 24 phase prompts to swap in live data.

---

# PASTE THIS INTO CLAUDE CODE:

---

I'm Freddy, working on Connect Crew before the Push to Prod Hackathon on April 24, 2026. This is a **design and layout session** — we're building the visual structure of the dashboard with fixture data. No live API calls. No backend wiring. That comes on hackathon day.

## Step 1 — Read the spec (before anything else)

In order:
1. `CLAUDE.md` — product spec, strict terminology, "do not drift" rules
2. `SESSION_HANDOFF.md` — prior-session decisions, what was deliberately removed
3. `DESIGN_BRIEF.md` — warm-paper editorial aesthetic, Bricolage Grotesque, six Crew colours, motion language
4. **`DASHBOARD_SPEC.md` — the authoritative layout spec for every screen we're building tonight. Read all 15 sections carefully.**
5. Skim existing code: `src/app/page.tsx`, `src/components/crew-hero.tsx`, `src/lib/fixtures.ts`, `src/app/app/layout.tsx`
6. View `/mnt/skills/public/frontend-design/SKILL.md` before writing any UI

## Step 2 — Confirm what you understand

After reading, report back to me:
- [ ] I understand the six Crew (Scan, Secret Signals, Inbound Connections, Warm, Cold, Scribe) with their signature colours
- [ ] I understand the strict terminology rules (Crew not staff, Secret Signals not Signal, Hi!! not Bro!!)
- [ ] I understand the design lock (Bricolage Grotesque, light warm-paper, no shadcn, no pricing, no Linkedin lucide icon)
- [ ] I understand the dashboard IA — 11 routes listed in DASHBOARD_SPEC §1
- [ ] I understand the 4 must-ship screens vs 5 stubbed screens (see Step 3 below)
- [ ] I understand responsive rules — desktop, tablet, mobile

Do NOT start coding until I confirm you've read and understood.

## Step 3 — Prioritisation (cut this down ruthlessly)

DASHBOARD_SPEC describes 11 screens. We are NOT building all 11 tonight. That would take 10+ hours.

**Must-ship tonight (full build):**
1. **Sidebar redesign** per DASHBOARD_SPEC §2 — this unlocks navigation for everything
2. **Morning Connect** per DASHBOARD_SPEC §4 — the hero screen, the daily ritual
3. **Scan** per DASHBOARD_SPEC §7 — the Crew handoff moment, with side panel
4. **Contact Detail** per DASHBOARD_SPEC §6 — the Warmth timeline visual
5. **Dashboard overview** per DASHBOARD_SPEC §3 — the "department at work" screen
6. **Genspark side panel component** per DASHBOARD_SPEC §10 — reused across screens

**Stubbed for tonight (placeholder pages with "Coming soon" content):**
- `/app/signals` — Secret Signals feed
- `/app/inbound` — Inbound Connections queue
- `/app/warm` — Warm follow-ups
- `/app/cold` — Cold resurrections
- `/app/scribe` — Scribe meetings + voice notes
- `/app/settings` — Settings (all 5 tabs)
- Contacts grid filter bar can stay as-is if already functional; we'll enhance later

**For each stubbed route:** create the route file with a simple "Coming soon" shell that uses the same sidebar + nav. Judges won't navigate there; we just need the sidebar links to work.

## Step 4 — Build order (do NOT skip steps)

Work through this sequence. After each step, commit to git and report status before moving on.

### 4.1 — Update fixture data (20 min)
Open `src/lib/fixtures.ts`. Per DASHBOARD_SPEC §13, extend fixtures to include:
- 25+ contacts across all four Warmth tiers (Hot, Warm, Neutral, Cold), spread across channels (Telegram, Gmail, LinkedIn, Cards)
- 12+ pending drafts for Morning Connect, with variety: partnership inbound, warm post-event, cold resurrection
- 90 days of Warmth movement history for a "hero" contact (create one named Sofia Alencar, Head of Partnerships at Helix Tech, met at TOKEN2049 Sep 2025)
- 3–5 cards in various processing states for Scan
- 20+ activity log entries for the Dashboard activity feed
- Enrichment data for at least 5 contacts (LinkedIn URL, company profile, mutual connections, recent news)
- 5+ Plaud transcripts / voice notes for Scribe (placeholder only)

Strict terminology in fixture data too — "Crew" not "staff" or "agents", "Secret Signals" not "Signal", "Hi!!" as the canonical hot example. Sender voices should feel real, not generic.

Commit: `expand fixtures for dashboard build`

### 4.2 — Sidebar redesign (30 min)
Refactor `src/components/app-sidebar.tsx` per DASHBOARD_SPEC §2:
- Home section: Dashboard (first), Morning Connect (with pending-drafts badge), Contacts
- Your Crew section: all six Crew with signature colour dots
- Footer: Settings, profile menu
- Mobile: bottom tab bar with 4 items + "More" sheet for the rest

Use the locked signature colours (`--coral`, `--teal`, `--copper`, `--terracotta`, `--indigo`, `--sage`). Active-state styling per §2. No shadcn — plain Tailwind + lucide-react icons.

Commit: `redesign app sidebar with Crew legend`

### 4.3 — Genspark side panel component (30 min)
Create `src/components/genspark-side-panel.tsx` per DASHBOARD_SPEC §10:
- Slides in from the right during active processing
- Terminal-style JetBrains Mono log lines
- Auto-dismisses 2s after completion
- Respects `prefers-reduced-motion`
- Desktop: 340px right-side; Mobile: bottom drawer up to 60vh

For fixture state, take an array of log line objects (`{status: 'active'|'done'|'error', text: string, timestamp?: string}`) and animate them in sequence when the panel opens. Add a trigger function so any screen can open it.

Commit: `add Genspark side panel component`

### 4.4 — Dashboard overview screen (45 min)
Build `/app/dashboard` per DASHBOARD_SPEC §3:
- Greeting header (time-of-day-aware)
- 2×3 Crew grid (responsive to 1×6 on mobile)
- Warmth sparkline (80px tall, 24-hour view, dots coloured by tier)
- Activity feed (chronological, 10 items initial, "Load more")

New components: `dashboard-crew-card.tsx`, `warmth-sparkline.tsx`, `activity-log-row.tsx`.

Feeds from fixture data only. All interactive elements route correctly to the right Crew screens (even if those are stubs).

Commit: `build Dashboard overview with Crew grid, sparkline, activity feed`

### 4.5 — Morning Connect screen refresh (60 min)
Upgrade `/app/morning-connect` per DASHBOARD_SPEC §4:
- Header: day + date + "N of M" progress + progress bar
- Draft card with the full pattern: contact header, inbound message block, signals chips, editable draft textarea, three-line Crew reasoning trail, action bar (Skip / Never again / Edit / Approve)
- Previous/Next navigation + keyboard shortcuts (← → E A)
- Bottom bar: End ritual early / Send all approved (N)
- Empty state when all processed
- Mobile: swipe gestures (right=approve, left=skip, long-press=edit)

New component: `draft-card.tsx`. Uses the `Crew reasoning trail` pattern that matches the three-line JetBrains Mono structure from DASHBOARD_SPEC §4.

Wire the approve/skip/edit/never-again buttons to update fixture state in React — no Supabase calls. Persist state in memory only for the design phase (localStorage is banned per CLAUDE.md conventions).

Commit: `refresh Morning Connect to spec`

### 4.6 — Contact Detail screen (60 min)
Build `/app/contacts/[id]` per DASHBOARD_SPEC §6:
- Two-column layout (60/40 split desktop, single column mobile)
- Left column: contact header with large Warmth badge, 90-day Warmth timeline chart, Enrichment block, Conversations log
- Right column: Quick actions, Channels, Crew tags, Autonomy tier block

**The Warmth timeline chart is the hero visual.** Use a simple charting library (recharts or visx — whichever is already in dependencies; if neither, pick the lighter one). Line chart 200px tall, 90-day X-axis, 0-100 Y-axis, colour-shift through tiers, reference bands, interaction dots.

For the hero contact Sofia Alencar, make the timeline look story-rich — a cold patch, a warm reactivation after TOKEN2049, steady growth since.

New components: `contact-card.tsx` (reusable everywhere), `warmth-timeline-chart.tsx`.

Commit: `build Contact Detail with Warmth timeline`

### 4.7 — Scan screen refresh (45 min)
Upgrade `/app/scan` per DASHBOARD_SPEC §7:
- Idle state: drop-zone + camera/upload buttons + daily count
- Capturing state: camera preview
- Processing state: card preview top-left + Genspark side panel slides in
- Result state: enriched contact card displayed, "Next card" and "View contact" CTAs
- Error state: fallback manual entry form

No real Claude vision call — mock a 3-second processing delay, then show a pre-built fixture card with the Genspark side panel animation playing through the expected log lines.

Commit: `refresh Scan screen with four states`

### 4.8 — Stub the remaining Crew screens (30 min)
For each of these, create the route with a consistent "Coming soon" pattern using the sidebar/nav:
- `/app/signals`
- `/app/inbound`
- `/app/warm`
- `/app/cold`
- `/app/scribe`
- `/app/settings` (all five tabs as "Coming soon")

Each stub should:
- Show the Crew name and role description per DASHBOARD_SPEC §8 (or "Settings" for settings)
- Have a paper-surface card that says "Coming soon" with 1-sentence explanation
- Not break the sidebar navigation

Commit: `stub remaining Crew and Settings screens`

## Step 5 — Responsive + accessibility pass (30 min)

For each screen built in 4.2 through 4.7:
- [ ] Test at desktop (≥1400px), tablet (768–1023px), mobile (<768px)
- [ ] All interactive elements have keyboard focus states
- [ ] Colour contrast on Warmth badges is readable in all tiers
- [ ] `prefers-reduced-motion` respected on sway, waveHi, gradient-shift, marquee, drift, rotate, fadeUp
- [ ] No localStorage or sessionStorage used anywhere
- [ ] No `Linkedin` lucide icon used

Commit: `responsive and a11y pass`

## Step 6 — Hold here

Once all 7 build steps are done and committed, tell me:
- [ ] All four must-ship screens are built end-to-end with fixtures
- [ ] Genspark side panel component working
- [ ] Five Crew screens + Settings stubbed
- [ ] Responsive rules applied
- [ ] Git committed, nothing sitting uncommitted

Do NOT start wiring live APIs. That happens on April 24 with the phase prompts.

**After you report done, I'll review screenshots and decide whether we need refinement or we're ready for hackathon day.**

## Non-negotiables for this session

**Terminology — strict:**
- Always "Crew" or "Crew member" (never "staff" or "agents")
- Always "Secret Signals" (never just "Signal")
- Always "Inbound Connections" (never just "Inbound")
- Always "Hi!!" as the hot-signal example (never "Bro!!")
- Always "Morning Connect" as the daily ritual

**Design — strict:**
- Never revert to Fraunces (display font is Bricolage Grotesque)
- Never restore dark mode (light warm-paper aesthetic is locked)
- Never install shadcn/ui (plain Tailwind + lucide-react only)
- Never add pricing numbers anywhere
- Never re-add About to nav
- Never use the lucide `Linkedin` icon — use `Link2` or inline SVG

**Engineering:**
- Fixture data only — no live Claude, Genspark, Supabase, Telegram, or Composio calls in this session
- No localStorage or sessionStorage — keep state in React/component memory for the design phase
- Every Crew workflow must have the handoff visible via the Genspark side panel (even with fixture logs)
- Every Warmth Index classification must show its reasoning in the UI — no black boxes
- Verify `.env*.local` is in `.gitignore` before any commit

**Git rhythm:**
- Commit after each of the 7 build steps with the commit messages listed
- Push to the remote after Step 4.8 so I can review

**Push back on spec violations:**
- If I ask for something that contradicts CLAUDE.md, SESSION_HANDOFF.md, DESIGN_BRIEF.md, or DASHBOARD_SPEC.md — flag it and ask me to update the relevant doc before changing code
- The docs are the source of truth; don't drift quietly

Ready when you are. Start with Step 1 (read the specs) and Step 2 (confirm understanding).
