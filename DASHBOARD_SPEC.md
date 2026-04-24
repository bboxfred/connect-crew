# Connect Crew — Dashboard Spec

**Last updated:** April 23, 2026
**Status:** Full dashboard layout specification. Responsive (desktop + mobile). Feeds fixture data until live wiring in Phase 1–3. This is the spec Claude Code follows to build every screen.

---

## 1. Information architecture

```
/app                                   → 307 redirect to /app/morning-connect (unchanged)
/app/dashboard                         → NEW · Overview of all six Crew side-by-side
/app/morning-connect                   → The daily ritual · default for returning users
/app/contacts                          → Filterable grid · channel tabs + warmth filters
/app/contacts/[id]                     → NEW · Single contact detail w/ warmth timeline
/app/scan                              → Crew screen · capture flow + result state
/app/signals                           → NEW · Crew screen · live Secret Signals feed + classification log
/app/inbound                           → NEW · Crew screen · qualified cold-email drafts
/app/warm                              → NEW · Crew screen · post-event follow-up queue
/app/cold                              → NEW · Crew screen · resurrection candidates
/app/scribe                            → NEW · Crew screen · meetings + voice note capture
/app/settings                          → NEW · Autonomy tiers, channel toggles, profile
```

**Default landing behaviour:** `/app` → `/app/morning-connect`. Dashboard is the first sidebar item but **not the default route** — Freddy wants Morning Connect to be the muscle-memory destination every morning. Dashboard is where you go when you want to *observe the Crew*, not *act on the day's drafts*.

---

## 2. Sidebar — the Crew legend

`src/components/app-sidebar.tsx` — already exists, needs restructuring.

**Desktop (≥1024px) — 260px fixed left sidebar:**

```
┌──────────────────────────┐
│ Connect Crew    [logo dot rotates] │
│                          │
│ ── Home ──              │
│ ⬢ Dashboard             │  ← first item
│ ☀ Morning Connect  [12] │  ← badge = pending drafts
│ ⬡ Contacts              │
│                          │
│ ── Your Crew ──         │
│ 🟠 Scan                 │  ← signature colour dot
│ 🟢 Secret Signals [3]   │
│ 🟤 Inbound Connections  │
│ 🔴 Warm                 │
│ 🔵 Cold                 │
│ 🟢 Scribe               │
│                          │
│ ── Footer ──            │
│ ⚙ Settings              │
│ Freddy Lim [avatar]     │  ← collapses to profile menu
└──────────────────────────┘
```

**Mobile (<1024px):**
- Sidebar collapses to a bottom tab bar with 4 icons: Dashboard · Morning Connect · Contacts · More
- "More" opens a sheet from the bottom with the six Crew screens + Settings
- Individual Crew screens accessed via the "More" sheet, not primary nav

**Behaviour:**
- Each Crew item shows a **signature colour dot** on the left (6px diameter) using the locked CSS vars (`--coral`, `--teal`, `--copper`, `--terracotta`, `--indigo`, `--sage`)
- Active screen: item background gets a 6% tint of the colour, 1px hairline border on the left in full colour
- Hover (desktop): same tint at 3%
- Badge numbers in JetBrains Mono, muted grey when zero, signature colour when non-zero

---

## 3. Screen: Dashboard (`/app/dashboard`)

**The purpose:** One glance tells Freddy what his entire Crew is doing right now. This is the "department status" screen — ambient awareness, not action.

### Desktop layout (three-zone)

```
┌────────────────────────────────────────────────────────────────┐
│  Good morning, Freddy.                                         │
│  Your Crew has 12 things waiting for you.                     │
│  [Open Morning Connect →]                                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                       │
│  │ Scan     │ │ Signals  │ │ Inbound  │                       │
│  │ 3 today  │ │ 17 today │ │ 5 today  │                       │
│  │ [stat]   │ │ [stat]   │ │ [stat]   │                       │
│  │ [preview]│ │ [preview]│ │ [preview]│                       │
│  └──────────┘ └──────────┘ └──────────┘                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                       │
│  │ Warm     │ │ Cold     │ │ Scribe   │                       │
│  │ 4 today  │ │ 2 today  │ │ 1 today  │                       │
│  │ [stat]   │ │ [stat]   │ │ [stat]   │                       │
│  │ [preview]│ │ [preview]│ │ [preview]│                       │
│  └──────────┘ └──────────┘ └──────────┘                       │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  Today's Warmth shifts                                         │
│  [Sparkline chart: Warmth movements across all contacts]      │
├────────────────────────────────────────────────────────────────┤
│  Recent Crew activity                                          │
│  10:42 · Scan filed Sofia Alencar (Helix Tech)                │
│  10:15 · Secret Signals warmed Priya +6 after "Hi!!"           │
│  09:53 · Cold queued resurrection draft for Kenji (94d silent) │
│  …                                                             │
└────────────────────────────────────────────────────────────────┘
```

### Zone 1: Greeting header (full-width, ~120px)
- Large Bricolage Grotesque "Good morning, Freddy." (weight 700, `-0.03em`)
- One-sentence summary of pending work: *"Your Crew has 12 things waiting for you."*
- Primary CTA button: **Open Morning Connect** (dark pill, `--ink` background, → `/app/morning-connect`)
- Secondary CTA as a text link: *"See what the Crew did overnight"* → scrolls to activity log
- Time-of-day-aware: "Good morning" / "Good afternoon" / "Good evening" / "Working late"

### Zone 2: Crew grid (2 × 3 on desktop, 1 × 6 on mobile)

Each card:
- **Header row:** signature colour dot + Crew name (Bricolage Grotesque 600) + today's count in JetBrains Mono
- **Stat:** the most relevant metric for that Crew
  - Scan: "3 cards processed today"
  - Secret Signals: "17 messages classified · Warmth delta +42 across 9 contacts"
  - Inbound Connections: "5 cold emails qualified · 2 drafts staged"
  - Warm: "4 follow-ups due within 24hr"
  - Cold: "2 resurrection candidates (60+ day silence)"
  - Scribe: "1 meeting transcribed · 3 commitments extracted"
- **Preview:** the most recent single item from that Crew — sender/subject + 1-line reasoning, muted
- **Click target:** entire card → Crew's dedicated screen
- **Empty state:** if a Crew has nothing today, still show the card, with "All quiet" in muted grey

Card styling:
- Paper surface (`--surface: #ffffff`)
- Slight asymmetric rotation (±0.4°) consistent with the landing page Crew cards
- 1px hairline border in signature colour at 40% opacity
- Hover: lifts 2px with a subtle shadow
- Mobile: full width, stacked, no rotation

### Zone 3: Today's Warmth shifts (sparkline)

A horizontal sparkline showing Warmth Index changes today across all contacts:
- X axis: time (last 24 hours)
- Y axis: Warmth delta (positive up, negative down)
- Dots on the line: each individual Warmth update, coloured by the contact's current tier
- Hover (desktop) / tap (mobile): tooltip showing contact name + delta + reason
- Height: 80px — small, supplementary, not dominant
- Subtitle in JetBrains Mono: *"16 warmth updates today · 3 resurrections pending"*

### Zone 4: Recent Crew activity feed

Chronological reverse-order log of what the Crew has done today. Each row:

```
[icon+colour]  10:42  Scan filed Sofia Alencar from Helix Tech
                       └ Extracted 7 fields · Genspark enriched LinkedIn + Crunchbase · 2 mutual connections
```

- Icon = Crew signature colour dot
- Timestamp in JetBrains Mono
- Action sentence in body (Inter, subtle)
- Second line in JetBrains Mono muted — the Crew's reasoning/detail
- Show 10 items initially, "Load more" at the bottom
- Click any row → contact detail page

### Mobile adaptations
- Greeting header stays full-width but compresses to ~80px
- Crew grid becomes single-column stack
- Warmth sparkline remains full-width, 60px height
- Activity feed uses the same pattern

---

## 4. Screen: Morning Connect (`/app/morning-connect`)

**The purpose:** The 10-minute daily ritual. One draft at a time. Decisive. Clear.

### Desktop layout (centred single-column)

```
┌────────────────────────────────────────────────────┐
│  Morning Connect                                   │
│  Thursday · 24 April · 3 of 12                    │
│  [progress bar: 25%]                              │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │  [avatar] Sofia Alencar · Helix Tech         │ │
│  │  [🟢 Warmth 82] · [Telegram]                 │ │
│  │                                              │ │
│  │  Inbound message (10:42):                    │ │
│  │  "Hi Freddy!! Loved your talk at TOKEN.      │ │
│  │   Let's grab coffee this week?? 🔥"          │ │
│  │                                              │ │
│  │  ─────────── Draft reply ───────────         │ │
│  │  [editable text area with your voice draft]  │ │
│  │                                              │ │
│  │  ─────────── Crew reasoning ─────────        │ │
│  │  [Secret Signals] Hi!! + 🔥 + 2min reply     │ │
│  │  → hot · reactivation from TOKEN2049         │ │
│  │  [Scan] Met at TOKEN2049, Sep 2025           │ │
│  │  [Warm] Drafted in your casual Telegram voice│ │
│  │                                              │ │
│  │  [Skip]  [Never again]  [Edit]  [Approve ✓]  │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│                        [← prev] [next →]          │
│                                                    │
├────────────────────────────────────────────────────┤
│  [End ritual early]       [Send all 9 approved →] │
└────────────────────────────────────────────────────┘
```

### Header
- "Morning Connect" in Bricolage Grotesque 4xl weight 700
- Below: day + date + progress "3 of 12" in JetBrains Mono
- Progress bar: 3px tall, fills in `--coral` gradient, spans full content width

### Draft card (the focal element)
**Header row:**
- Avatar (32px round)
- Contact name + company (Inter 500)
- Warmth badge (coloured pill using `warmthTier()`) — e.g. `Warmth 82` in coral for hot
- Channel pill (Telegram / Gmail / LinkedIn / WhatsApp-stubbed)

**Message block:**
- Small mono eyebrow: "Inbound message (10:42)"
- The actual message text in a quote-style container (warm paper background, 1px hairline border)
- Signals detected shown as small chips underneath: `Hi!!` `🔥` `2min reply` `weekend evening`

**Draft block:**
- Editable textarea with the voice-matched draft pre-filled
- Default state: read-only looking (no visible border, just the text)
- On click/focus: becomes obviously editable with a subtle highlight
- Character count in the bottom-right for longer messages

**Reasoning block (the handoff visible):**
- Three lines in JetBrains Mono muted grey
- Each line: `[Crew name]` + brief reasoning
- Example:
  ```
  [Secret Signals] Hi!! + 🔥 + 2min reply → hot
  [Scan] Profile: met at TOKEN2049, Sep 2025
  [Warm] Drafted in Telegram-casual voice
  ```

**Action bar:**
- Four buttons, left-to-right weighted by destructiveness
- **Skip** — ghost button, sends it back to the queue for later today
- **Never again** — subtle danger styling, marks the contact Red-tier for this channel
- **Edit** — opens the draft textarea in full focus (keyboard shortcut: E)
- **Approve ✓** — primary action, dark pill, weight 600 (keyboard shortcut: A)

### Navigation
- Previous/Next arrows below the card (keyboard: ← →)
- Progress counter updates immediately on each action
- If user skips, card slides left with fade; if approved, slides right with a brief glow in the Warmth tier colour

### Bottom bar (persistent)
- **End ritual early** — text link, muted, returns to Dashboard
- **Send all N approved** — primary button only visible when ≥1 draft is in approved state; shows count; confirms before batch-sending

### Empty state
When all drafts are processed:
```
Morning Connect is complete.

You reviewed 12 drafts.
 · 9 sent
 · 2 skipped
 · 1 marked never-again

[See today's activity] [Return to Dashboard]
```
- No fallback to fixtures. Empty state is a reward, not a gap.

### Mobile adaptations
- Card spans full viewport width
- Action bar becomes swipe gestures:
  - Swipe right = Approve
  - Swipe left = Skip
  - Long-press = Edit
  - Tap "Never again" link below the card
- Bottom bar sticky at the bottom
- Full-screen "reviewing mode" — hides the sidebar/nav

---

## 5. Screen: Contacts (`/app/contacts`)

**The purpose:** The full relationship graph, queryable. Combines channel tabs with warmth filters.

### Desktop layout

```
┌────────────────────────────────────────────────────┐
│  Contacts                                          │
│  [search input — name, company, handle]           │
├────────────────────────────────────────────────────┤
│  Channels:  [All] [Telegram] [Gmail] [LinkedIn]    │
│             [Cards] [WhatsApp ⏳]                  │
│                                                    │
│  Warmth:    [All] [🟠 Hot] [🟡 Warm]               │
│             [🟢 Neutral] [⚪ Cold]                 │
│                                                    │
│  Sort by:   [Warmth ▼] [Last contact] [Name]       │
├────────────────────────────────────────────────────┤
│                                                    │
│  [Contact card] [Contact card] [Contact card]      │
│  [Contact card] [Contact card] [Contact card]      │
│  [Contact card] [Contact card] [Contact card]      │
│  ...                                               │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Filter bar behaviour
- **Channels row** — tabs, multi-select allowed. `[All]` deselects all specific channels.
  - `WhatsApp ⏳` shows as disabled with a tooltip: *"Meta Business verification pending (3–5 days)"*
- **Warmth row** — tier filters, multi-select. Each filter shows the count in parens: `[🟠 Hot (4)]`
- **Sort dropdown** — default Warmth descending
- Filters combine as AND — e.g. Telegram + Hot = only hot contacts from Telegram

### Contact card (reusable component — used here + Dashboard activity + detail)

```
┌──────────────────────┐
│ [avatar]             │
│ Sofia Alencar        │
│ Head of Partnerships │
│ Helix Tech           │
│                      │
│ [warmth bar: 82]     │
│                      │
│ Last: 2h · Telegram  │
└──────────────────────┘
```

- Avatar 48px round (from card scan if available, Genspark if enriched, placeholder glyph in signature colour otherwise)
- Name in Inter 500
- Title · Company in muted grey
- Warmth bar: 4px tall, fills 0–100 with tier colour
- Bottom row in JetBrains Mono muted: `Last: 2h · Telegram`
- Slight ±0.4° rotation for character
- Hover: lifts 2px, shadow tint matches warmth tier
- Click: → `/app/contacts/[id]`

### Grid
- Desktop: 4 columns at ≥1400px, 3 at ≥1024px, 2 at ≥768px
- Mobile: 2 columns at ≥480px, 1 column below

### Empty state
Per filter combination:
```
No hot Telegram contacts.

Your Crew is watching. Send or receive a message
and Secret Signals will pick it up.
```

---

## 6. Screen: Contact Detail (`/app/contacts/[id]`)

**The purpose:** Zoom into one person. Show the graph for this single contact. This is often the strongest single demo scene — proves Connect Crew's memory is real.

### Desktop layout (two-column, 60/40 split)

```
┌───────────────────────────────────┬─────────────────────┐
│ ← Back to contacts                │ Quick actions       │
│                                   │ ────────────        │
│ [avatar 96px]                     │ [Draft new message] │
│ Sofia Alencar                     │ [Warm intro…]       │
│ Head of Partnerships              │ [Schedule call]     │
│ Helix Tech                        │ [Mark VIP (Red)]    │
│ Met at TOKEN2049 · Sep 2025       │                     │
│                                   │ ────────────        │
│ [🟠 Warmth 82]                    │ Channels            │
│                                   │ · Telegram: @sofia_ │
│                                   │ · Email: s@helix.co │
│                                   │ · LinkedIn →        │
│                                   │                     │
│ ──── Warmth timeline ────         │ ────────────        │
│ [chart: 90 days of warmth]        │ Crew tags           │
│                                   │ · ABA circle        │
│                                   │ · Web3 SG member    │
│ ──── Enrichment ────              │                     │
│ From Genspark Super Agent         │ ────────────        │
│ · Current role: 2yrs at Helix     │ Autonomy            │
│ · Recent: Web3 compliance posts   │ · Current: Yellow   │
│ · Company: Series A, Sequoia      │ [Change tier]       │
│ · Mutual: Marcus, Priya           │                     │
│                                   │                     │
│ ──── Conversations ────           │                     │
│ [grouped chronological log of     │                     │
│  interactions across all channels]│                     │
│                                   │                     │
└───────────────────────────────────┴─────────────────────┘
```

### Left column (content)

**Contact header:**
- Avatar 96px round
- Name in Bricolage Grotesque 3xl weight 700
- Title + Company in Inter 500 muted
- "Met at X · date" eyebrow in JetBrains Mono
- Warmth badge — large pill showing current score + label (e.g. `Warmth 82 · Hot`)

**Warmth timeline (the key visual):**
- Line chart, 200px tall
- X axis: 90 days back to today
- Y axis: Warmth Index 0–100
- Line coloured by tier at each point (transitions through coral → amber → sage → slate)
- Dots at each interaction event — click reveals the interaction
- Horizontal reference bands: hot zone (≥75), warm (55–74), neutral (35–54), cold (<35)
- Empty state if <3 data points: "Not enough history yet. Secret Signals is watching."

**Enrichment block:**
- Header "Enrichment — from Genspark Super Agent"
- Structured bullets of the enrichment fields from `contacts.enrichment` jsonb
- Small source links at the bottom: "Sourced from LinkedIn · Crunchbase · helix.tech"
- If enrichment is stale (>7 days): "Refresh enrichment" button

**Conversations log:**
- Reverse-chronological, grouped by day
- Each entry: channel icon + timestamp + message text (if inbound) or draft summary (if outbound)
- Card scans shown as dedicated entries with thumbnails
- Voice notes shown with play button + transcript preview
- Each entry clickable to expand full details

### Right column (sidebar actions)

**Quick actions:**
- `[Draft new message]` — opens a compose drawer, Warm Crew drafts based on last context
- `[Warm intro…]` — opens a modal to pick a mutual connection, drafts an intro email
- `[Schedule call]` — stub for now, opens a "coming soon" toast
- `[Mark VIP (Red)]` — sets this contact to Red autonomy tier → no auto-drafts ever

**Channels block:**
- Lists all known channels for this contact
- Each with a direct action link (e.g. open in Telegram)

**Crew tags:**
- Automatic tags derived from Profile orgs (ABA circle, Web3 SG member, etc.)
- User can add/remove manually

**Autonomy block:**
- Current autonomy tier for this contact
- `[Change tier]` opens a small picker: Green / Yellow / Red
- Explanation text: what each tier means for this contact

### Mobile adaptations
- Single column
- Right-column sidebar becomes a drawer triggered by a "Actions" button in the header
- Warmth timeline remains full-width, stays as the hero visual
- Enrichment and conversations collapse to accordion sections

---

## 7. Screen: Scan (`/app/scan`)

**The purpose:** Capture a business card (or stack). See the Crew work. Land an enriched contact.

### Desktop/tablet layout (centred)

```
┌────────────────────────────────────────────────────┐
│  Scan                                              │
│  Capture a card. The Crew does the rest.          │
│                                                    │
│  ┌──────────────────────────────────┐             │
│  │                                  │             │
│  │     [Drop a card or click]       │             │
│  │     [camera icon]                │             │
│  │                                  │             │
│  │     or drag card here            │             │
│  │                                  │             │
│  └──────────────────────────────────┘             │
│                                                    │
│  [Use camera] [Upload file]                        │
│                                                    │
│  Processed today: 3                                │
└────────────────────────────────────────────────────┘
```

### Capture states

**Idle state:**
- Large drop-zone (400×300 desktop, full-width mobile)
- Dashed paper-texture border, 1px `--border`
- Camera + upload buttons
- Subtle "Processed today: N" counter

**Capturing state (mobile camera active):**
- Full-screen camera view with a visual guide rectangle
- Tap to capture, slight haptic
- Post-capture: preview with "Use this" / "Retake" buttons

**Processing state:**
- Card preview shrinks to top-left
- Genspark side panel slides in from the right (see §10)
- Progress indicator: the five processing steps animate in sequence
  - "Claude reading card…"
  - "Claude extracting fields…"
  - "Genspark opening LinkedIn…"
  - "Genspark reading company…"
  - "Claude writing profile summary…"

**Result state:**
- Card image stays visible top-left
- Side panel shows completed log
- Main area replaces with the fully-enriched Contact Card (same component as `/app/contacts`)
- Primary CTA: **Next card** (resets to idle)
- Secondary: **View contact** → `/app/contacts/[id]`
- Tertiary: **Edit fields** (opens inline editor if Claude got anything wrong)

### Error state
- If Claude vision can't extract: show the image + "Couldn't read this card clearly. Try again, or enter manually."
- Manual fallback form with the same field structure

### Mobile adaptations
- Drop-zone becomes a full-width capture button
- Camera opens native (no custom camera UI)
- Result state is full-screen card preview with bottom sheet for actions

---

## 8. Screens: Secret Signals, Inbound Connections, Warm, Cold, Scribe

These five Crew screens share a common pattern — they're all **filtered feeds** of that Crew's work with Crew-specific controls. Different contents, same shell.

### Shared layout pattern

```
┌────────────────────────────────────────────────────┐
│  [Crew icon+colour] Crew Name                     │
│  One-sentence role description                    │
│                                                    │
│  [Today] [This week] [All time]                   │
│                                                    │
│  [Filter controls specific to this Crew]          │
├────────────────────────────────────────────────────┤
│                                                    │
│  [Timeline/feed of this Crew's work]              │
│  Each entry: what happened + the contact card     │
│  + the Crew's reasoning + action buttons          │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Screen-specific details

**Secret Signals (`/app/signals`):**
- Header: "Secret Signals watches how people type."
- Filters: `[Hot now]` `[Warming up]` `[Cooling down]` `[Reactivations]`
- Each entry: contact + message excerpt + detected signals as chips + before/after Warmth Index
- Small sparkline alongside each entry showing that contact's warmth trajectory

**Inbound Connections (`/app/inbound`):**
- Header: "Inbound Connections filters cold emails so you don't have to."
- Filters: `[New this week]` `[Drafted]` `[Qualified]` `[Rejected]` `[Auto-declined]`
- Each entry: sender + subject + first 2 lines + qualification status + draft preview
- Action: approve draft → sends to Morning Connect

**Warm (`/app/warm`):**
- Header: "Warm reaches back within 24 hours."
- Filters: `[Due today]` `[Post-event]` `[General nudge]` `[Overdue]`
- Each entry: contact + meeting context (if from event) + time remaining + drafted follow-up
- Groupings: by event where applicable (TOKEN2049 attendees, etc.)

**Cold (`/app/cold`):**
- Header: "Cold revives relationships 60 days silent."
- Filters: `[60–90 days]` `[90–180 days]` `[180+ days]` `[Dormant > 1yr]`
- Each entry: contact + days silent + context from last interaction + resurrection draft
- Visual device: a small "decay indicator" showing how long since last contact (0–100% scale)

**Scribe (`/app/scribe`):**
- Header: "Scribe turns conversations into memory."
- Filters: `[Voice notes]` `[Meetings]` `[Commitments]` `[Unreviewed]`
- Each entry: recording source (Plaud / manual / meeting) + transcript preview + extracted commitments
- Sub-section: "Commitments pending" — a list of things you promised to do, with due-by dates

---

## 9. Screen: Settings (`/app/settings`)

**The purpose:** The autonomy tier control room. Plus profile, channel connections, compliance.

### Layout (tabs within page)

```
┌────────────────────────────────────────────────────┐
│  Settings                                          │
│                                                    │
│  [Profile] [Channels] [Autonomy] [Privacy] [Data] │
├────────────────────────────────────────────────────┤
│                                                    │
│  [Active tab content]                             │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Tab 1: Profile
- Editable fields: name, email, phone, LinkedIn, Telegram handle
- Org profiles — one block per org (ABA, Web3 SG, Claude Code SG, Hungry Hamster)
  - Each: name, tagline, ICP rules, signature, voice samples
- Voice style — a few toggles: `[casual/formal]` `[short/medium]` `[uses emoji]`

### Tab 2: Channels
- Each channel as a row with: channel name, connected account, status, toggle
  - Telegram: `@bboxfred` · ✅ Connected · [Disconnect]
  - Gmail: `fred@collecter.club` · ✅ Connected · [Disconnect]
  - LinkedIn: not yet · ⏳ [Connect]
  - WhatsApp Business: ⏳ Meta verification in progress (3–5 days)
  - Plaud: not connected · 🔜 Coming Q3 2026
- At the bottom: "Add another account" for multi-account support

### Tab 3: Autonomy
- Explanation at the top:
  > "Autonomy tiers control what your Crew does on your behalf.
  > Green = auto-send. Yellow = stage for Morning Connect. Red = never draft."

- **Default tier:** a big picker — Green / Yellow / Red. Default is Yellow. Contacts inherit this unless overridden.
- **Per-channel defaults:** a grid showing channel × tier. Example: LinkedIn DMs = Yellow, Telegram = Yellow, Gmail = Yellow, Cards = Yellow.
- **Per-contact overrides:** a searchable list showing every contact who has a non-default autonomy tier. Can edit inline.
- **Message-type rules:** opt into auto-send for specific categories — `[Birthday messages]` `[Event confirmations]` `[Standard acknowledgments]`
- **Cross-entity lockdown** (greyed out for Solo tier; active for Team/Enterprise): description only, "This is enforced at team level by admin."

### Tab 4: Privacy
- The 22-word privacy line as a large quote
- List of what Connect Crew does/doesn't do:
  - ✓ Classification is local-first
  - ✓ Graph is yours — export, delete, portable
  - ✓ OAuth only, never raw passwords
  - ✗ Never trains on your data
  - ✗ Never auto-sends at Red tier
- **Your data** — buttons for: Export graph (JSON) · Delete all data · Request my Warmth classifications

### Tab 5: Data
- Shows graph statistics: X contacts, Y interactions, Z drafts, W enrichment records
- Per-contact data: "Contacts can request their Warmth data under PDPA" — explanation
- Retention settings: default is forever; users can set auto-deletion for interactions older than N months

---

## 10. Shared component: Genspark side panel

`src/components/genspark-side-panel.tsx`

**Purpose:** The visible Claude → Genspark → Claude handoff. Slides in during active processing only. Slides out when done.

### Behaviour
- Slides in from the right when any Crew member is actively processing (Scan uploading, Secret Signals classifying, Warm drafting, etc.)
- Stays visible for the duration of processing
- Auto-dismisses 2 seconds after completion
- Respects `prefers-reduced-motion` — fades instead of slides

### Content
- Header: the active Crew member's name + signature colour
- Terminal-style log with monospace JetBrains Mono, one line per action:
  ```
  ▸ Claude reading card image
  ▸ Claude extracting fields
  ▸ Genspark opening LinkedIn
  ▸ Genspark reading Helix Tech homepage
  ▸ Genspark finding mutual connections
  ▸ Claude writing profile summary
  ✓ Done (3.2s)
  ```
- Active line: signature colour, subtle pulse
- Completed lines: muted grey with ✓
- Errors: red with a "retry" option

### Size
- Desktop: 340px wide, full height minus sidebar, right-aligned
- Mobile: full-width drawer from the bottom, max height 60vh, dismissible by drag-down

### Visibility discipline
- **Only visible during active processing.** Never persistent.
- **Visible from the back of the room.** Font size generous, colours high-contrast.
- **Log lines are specific, not generic.** "Opening LinkedIn" is good. "Processing…" is bad.

---

## 11. Responsive rules (summary)

**Desktop (≥1024px):**
- Left sidebar 260px fixed
- Content area flexible
- Multi-column grids (2–4 cols depending on content)
- Genspark side panel 340px right when active

**Tablet (768–1023px):**
- Sidebar collapses to hamburger → slides over content
- Grids become 2 columns
- Side panel becomes 280px overlay

**Mobile (<768px):**
- Bottom tab bar replaces sidebar
- Single-column everything
- Side panel becomes bottom drawer
- Morning Connect uses swipe gestures
- Scan uses native camera

---

## 12. Component inventory (what needs building)

**New components to build:**
- `dashboard-crew-card.tsx` — the 2×3 Crew overview cards
- `warmth-sparkline.tsx` — the small sparkline for Dashboard
- `warmth-timeline-chart.tsx` — the 90-day Warmth chart for Contact Detail
- `contact-card.tsx` — unified contact card (reuse across Contacts grid, detail header, Dashboard activity)
- `genspark-side-panel.tsx` — the handoff visualiser
- `draft-card.tsx` — the Morning Connect focal element
- `crew-feed-entry.tsx` — reusable entry for the five Crew screens
- `activity-log-row.tsx` — for Dashboard activity feed
- `filter-tab-bar.tsx` — the channel/warmth filters on Contacts
- `autonomy-picker.tsx` — Green/Yellow/Red selector with explanations
- `channel-row.tsx` — Settings channel connection rows

**Existing components (keep as-is):**
- `nav.tsx` — top nav unchanged
- `app-sidebar.tsx` — restructure per §2
- `crew-hero.tsx` — landing page, keep
- `warmth-bar.tsx` — keep, reuse
- `infographics.tsx` — landing page, keep
- `tier-block.tsx` — landing page, keep
- `page-shell.tsx` — keep

---

## 13. Fixture data needed (pre-hackathon)

To design and test every screen, `src/lib/fixtures.ts` should provide:
- 25+ contacts across all four Warmth tiers, spread across channels (Telegram, Gmail, LinkedIn, Cards)
- 12+ pending drafts for Morning Connect (variety: partnership, warm nudge, cold resurrection)
- 90 days of Warmth movements for a "hero" contact (Sofia Alencar) for the timeline chart
- 3–5 cards in various processing states for the Scan screen
- 20+ activity log entries for the Dashboard
- Enrichment data for at least 5 contacts (LinkedIn, company, mutuals)
- 5+ Plaud transcripts / voice notes for Scribe

---

## 14. What's out of scope for the dashboard (v0)

- Multi-user collaboration surfaces (Team tier)
- Cross-portfolio synergy views (Portfolio tier) — lives in `/enterprise` marketing page only
- Calendar integration
- Email compose (inbound email reading) — architecture slide only
- Mobile native app (web responsive only)
- Dark mode — locked to light
- Multiple profile switching — single-user for the hackathon

---

## 15. Demo flow through the dashboard

What a judge sees in the 3-minute demo, using this dashboard:

1. **Open /app → Morning Connect.** 12 drafts waiting. Sofia's `Hi!!` at the top. Show the draft card with the three-line Crew reasoning trail.
2. **Approve Sofia's draft.** Progress bar moves. Next draft appears.
3. **Cmd+K or sidebar click → /app/scan.** Drop a physical card. Genspark side panel slides in, processes live.
4. **Scan result appears.** Click through to contact detail. Warmth timeline visible. Enrichment populated.
5. **Sidebar → /app/dashboard.** Show the 2×3 Crew overview. Point at Secret Signals: "17 messages classified today."
6. **Close with architecture slide.** Connect Crew's mental model — department, not agent.

Every screen in this spec serves that demo flow.
