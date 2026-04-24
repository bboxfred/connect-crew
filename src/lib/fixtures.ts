// Fixture data for the /app dashboard. Swapped for real Supabase queries on hackathon day.
// 5-Crew model (Scanner / Messenger / Mailbox / Social Media / Scribe).
// Relationship state (warm/cold) is a derived property of the graph,
// surfaced via Lead-O-Meter — it is NOT a Crew member.

export type CrewKey = "scan" | "signals" | "inbound" | "scribe" | "social";

export type Channel =
  | "telegram"
  | "email"
  | "linkedin"
  | "whatsapp"
  | "card"
  | "social";
export type AutonomyTier = "green" | "yellow" | "red";

export const CREW: Record<
  CrewKey,
  { name: string; color: string; tint: string; role: string }
> = {
  scan: {
    name: "Scanner",
    color: "var(--coral)",
    tint: "color-mix(in srgb, var(--coral) 12%, white)",
    role: "Business cards, photos, event lists → enriched contacts",
  },
  signals: {
    name: "Messenger",
    color: "var(--teal)",
    tint: "color-mix(in srgb, var(--teal) 12%, white)",
    role: "Watches Telegram and WhatsApp — reads tone, updates Warmth, drafts replies",
  },
  inbound: {
    name: "Mailbox",
    color: "var(--copper)",
    tint: "color-mix(in srgb, var(--copper) 12%, white)",
    role: "Watches email and LinkedIn — qualifies cold asks, drafts replies",
  },
  scribe: {
    name: "Scribe",
    color: "var(--sage)",
    tint: "color-mix(in srgb, var(--sage) 12%, white)",
    role: "Meetings, voice notes, conversations → structured memory + commitments",
  },
  social: {
    name: "Social Media",
    color: "var(--indigo)",
    tint: "color-mix(in srgb, var(--indigo) 12%, white)",
    role: "Watches Instagram, Facebook Messenger, and X DMs in real time. Stages replies for Morning Connect — you review the night's pile each morning.",
  },
};

// ─── Contacts ──────────────────────────────────────────────────────────────

export type FixtureContact = {
  id: string;
  name: string;
  title: string;
  company: string;
  initials: string;
  met_at: string;
  met_date?: string;
  last_contact: string;
  channel: Channel;
  warmth: number;
  signals: string[];
  last_crew: CrewKey;
  autonomy: AutonomyTier;
  org_tags: string[];
  handles?: { telegram?: string; linkedin?: string; email?: string };
};

export const fixtureContacts: FixtureContact[] = [
  // ─── HOT (≥75) ───
  {
    id: "sofia",
    name: "Sofia Alencar",
    title: "Head of Partnerships",
    company: "Helix Tech",
    initials: "SA",
    met_at: "TOKEN2049 Singapore",
    met_date: "2025-09-19",
    last_contact: "2h",
    channel: "telegram",
    warmth: 82,
    signals: ["Hi!!", "🔥", "2-min reply", "voice note"],
    last_crew: "signals",
    autonomy: "yellow",
    org_tags: ["Web3 SG", "TOKEN2049"],
    handles: {
      telegram: "@sofia_alencar",
      linkedin: "/in/sofia-alencar-helix",
      email: "sofia@helix.tech",
    },
  },
  {
    id: "priya",
    name: "Priya Raghavan",
    title: "Partner",
    company: "Sequoia SEA",
    initials: "PR",
    met_at: "TOKEN2049 Singapore",
    met_date: "2025-09-20",
    last_contact: "6h",
    channel: "telegram",
    warmth: 86,
    signals: ["Hi!!", "🔥", "2-min reply"],
    last_crew: "signals",
    autonomy: "yellow",
    org_tags: ["ABA", "TOKEN2049"],
    handles: { telegram: "@priya_raghavan", linkedin: "/in/priya-raghavan" },
  },
  {
    id: "marcus",
    name: "Marcus Low",
    title: "Founder & CEO",
    company: "Kite Commerce",
    initials: "ML",
    met_at: "Claude Code SG · April 10",
    met_date: "2026-04-10",
    last_contact: "18h",
    channel: "telegram",
    warmth: 88,
    signals: ["Hi!!", "weekend voice notes", "1-min reply"],
    last_crew: "signals",
    autonomy: "green",
    org_tags: ["Claude Code SG", "Web3 SG"],
    handles: { telegram: "@marcuslow", linkedin: "/in/marcuslow" },
  },
  {
    id: "rashid",
    name: "Rashid Nahas",
    title: "Angel investor",
    company: "Personal",
    initials: "RN",
    met_at: "Telegram DM intro",
    last_contact: "2d",
    channel: "telegram",
    warmth: 78,
    signals: ["Hi Hi!", "emojis", "voice note"],
    last_crew: "signals",
    autonomy: "yellow",
    org_tags: ["ABA"],
    handles: { telegram: "@rashidnahas" },
  },
  {
    id: "akiko",
    name: "Akiko Fujimoto",
    title: "Director, International Div.",
    company: "METI Japan",
    initials: "AF",
    met_at: "Tokyo partnership visit",
    met_date: "2025-11-14",
    last_contact: "3d",
    channel: "email",
    warmth: 77,
    signals: ["Hi Freddy-san,", "formal reliable", "within 4hr"],
    last_crew: "scribe",
    autonomy: "yellow",
    org_tags: ["ABA", "METI"],
    handles: { email: "a.fujimoto@meti.go.jp" },
  },
  {
    id: "diego",
    name: "Diego Alvarez",
    title: "GM, LATAM",
    company: "Grupo Santander",
    initials: "DA",
    met_at: "Inbound via Web3 SG talk · Feb 2026",
    last_contact: "5d",
    channel: "email",
    warmth: 76,
    signals: ["Hi Fred!!", "fast replies", "emoji-heavy"],
    last_crew: "inbound",
    autonomy: "yellow",
    org_tags: ["Web3 SG"],
    handles: {
      email: "diego.alvarez@santander.com",
      linkedin: "/in/diego-alvarez-santander",
    },
  },

  // ─── WARM (55-74) ───
  {
    id: "theo",
    name: "Theo Kostas",
    title: "VP Partnerships",
    company: "Polygon",
    initials: "TK",
    met_at: "ETHSG 2026",
    met_date: "2026-01-29",
    last_contact: "1d",
    channel: "telegram",
    warmth: 70,
    signals: ["Hi mate!", "Aussie casual", "reliable"],
    last_crew: "signals",
    autonomy: "yellow",
    org_tags: ["Web3 SG"],
    handles: { telegram: "@theo_polygon" },
  },
  {
    id: "sam",
    name: "Sam Harel",
    title: "Partner",
    company: "Y Combinator",
    initials: "SH",
    met_at: "YC SEA demo day",
    met_date: "2026-03-04",
    last_contact: "2d",
    channel: "email",
    warmth: 72,
    signals: ["Hi Freddy!", "one emoji per msg", "within 24hr"],
    last_crew: "inbound",
    autonomy: "yellow",
    org_tags: ["YC network"],
    handles: { email: "sam@ycombinator.com", linkedin: "/in/sam-harel-yc" },
  },
  {
    id: "kai",
    name: "Kai Jensen",
    title: "Partnerships",
    company: "Seedstars SEA",
    initials: "KJ",
    met_at: "Instagram DM · Web3 SG post",
    met_date: "2026-03-18",
    last_contact: "4d",
    channel: "social",
    warmth: 68,
    signals: ["Hi Fred!", "🙌", "quick reply", "Instagram"],
    last_crew: "social",
    autonomy: "yellow",
    org_tags: ["Web3 SG"],
    handles: { linkedin: "/in/kai-jensen-seedstars" },
  },
  {
    id: "naomi",
    name: "Naomi Park",
    title: "Reporter",
    company: "Blockworks",
    initials: "NP",
    met_at: "X DM · TOKEN2049 write-up",
    met_date: "2025-09-24",
    last_contact: "6d",
    channel: "social",
    warmth: 58,
    signals: ["Hi Freddy,", "journalist", "X DM"],
    last_crew: "social",
    autonomy: "yellow",
    org_tags: ["TOKEN2049"],
    handles: { linkedin: "/in/naomi-park-blockworks" },
  },
  {
    id: "catherine",
    name: "Catherine Liu",
    title: "Senior researcher",
    company: "METI Japan",
    initials: "CL",
    met_at: "Intro · Akio",
    last_contact: "8d",
    channel: "email",
    warmth: 68,
    signals: ["Hi [name],", "warm intro", "thoughtful"],
    last_crew: "scribe",
    autonomy: "yellow",
    org_tags: ["METI", "ABA"],
    handles: { email: "c.liu@meti.go.jp" },
  },
  {
    id: "leila",
    name: "Leila Okonkwo",
    title: "BD Lead",
    company: "Chainalysis APAC",
    initials: "LO",
    met_at: "Compliance Summit 2026",
    met_date: "2026-03-12",
    last_contact: "6d",
    channel: "email",
    warmth: 66,
    signals: ["Hi Freddy,", "polite", "within a day"],
    last_crew: "inbound",
    autonomy: "yellow",
    org_tags: ["Web3 SG"],
    handles: { linkedin: "/in/leila-okonkwo" },
  },
  {
    id: "akio",
    name: "Akio Tanaka",
    title: "Director",
    company: "METI Japan",
    initials: "AT",
    met_at: "Web3 SG dinner",
    met_date: "2026-04-12",
    last_contact: "11d",
    channel: "email",
    warmth: 62,
    signals: ["Hi [name],", "4-hr reply", "formal"],
    last_crew: "scribe",
    autonomy: "yellow",
    org_tags: ["METI", "ABA"],
    handles: { email: "a.tanaka@meti.go.jp" },
  },
  {
    id: "yuki",
    name: "Yuki Matsuda",
    title: "Creative director",
    company: "Freelance",
    initials: "YM",
    met_at: "Hungry Hamster launch",
    met_date: "2026-02-08",
    last_contact: "9d",
    channel: "email",
    warmth: 58,
    signals: ["Hi Fred :)", "helpful", "within a day"],
    last_crew: "inbound",
    autonomy: "yellow",
    org_tags: ["Hungry Hamster"],
    handles: { email: "yuki.matsuda@gmail.com", linkedin: "/in/yuki-matsuda-creative" },
  },
  {
    id: "maria",
    name: "Maria Chen",
    title: "PM",
    company: "Growth Labs",
    initials: "MC",
    met_at: "Inbound · Gmail",
    last_contact: "1d",
    channel: "email",
    warmth: 58,
    signals: ["polite", "qualified", "warm"],
    last_crew: "inbound",
    autonomy: "yellow",
    org_tags: ["Web3 SG"],
    handles: { email: "maria@growthlabs.io" },
  },

  // ─── NEUTRAL (35-54) ───
  {
    id: "rina",
    name: "Rina Patel",
    title: "Head of Events",
    company: "TOKEN2049",
    initials: "RP",
    met_at: "TOKEN2049 organisers' dinner",
    met_date: "2025-09-18",
    last_contact: "14d",
    channel: "email",
    warmth: 54,
    signals: ["transactional", "warm-ish", "calendar-driven"],
    last_crew: "inbound",
    autonomy: "yellow",
    org_tags: ["TOKEN2049"],
    handles: { email: "rina@token2049.com" },
  },
  {
    id: "ben",
    name: "Ben Turnbull",
    title: "Associate",
    company: "a16z crypto",
    initials: "BT",
    met_at: "SF intro · Oct 2025",
    met_date: "2025-10-22",
    last_contact: "22d",
    channel: "email",
    warmth: 52,
    signals: ["measured", "calendar-only", "business hours"],
    last_crew: "inbound",
    autonomy: "yellow",
    org_tags: ["Web3 SG"],
    handles: { linkedin: "/in/ben-turnbull-a16z" },
  },
  {
    id: "zhang",
    name: "Zhang Yu",
    title: "Founder",
    company: "Mercury Labs",
    initials: "ZY",
    met_at: "Shanghai meetup",
    met_date: "2025-12-11",
    last_contact: "31d",
    channel: "telegram",
    warmth: 50,
    signals: ["declining", "last 2 convos drifted", "short replies"],
    last_crew: "signals",
    autonomy: "yellow",
    org_tags: ["Web3 SG"],
    handles: { telegram: "@zhang_mercury" },
  },
  {
    id: "oluwaseun",
    name: "Oluwaseun Adebayo",
    title: "Partner",
    company: "Africa Blockchain Fund",
    initials: "OA",
    met_at: "Warm intro · introduced by Marcus",
    last_contact: "17d",
    channel: "email",
    warmth: 48,
    signals: ["warm intro", "fit", "paced"],
    last_crew: "inbound",
    autonomy: "yellow",
    org_tags: ["ABA"],
    handles: {
      email: "oluwaseun@africablockchainfund.com",
      linkedin: "/in/oluwaseun-adebayo",
    },
  },
  {
    id: "eric",
    name: "Eric Tham",
    title: "Managing Director",
    company: "ST Engineering",
    initials: "ET",
    met_at: "Temasek partner event",
    met_date: "2026-01-18",
    last_contact: "42d",
    channel: "email",
    warmth: 42,
    signals: ["event intro", "slow", "business hours"],
    last_crew: "inbound",
    autonomy: "yellow",
    org_tags: ["Temasek"],
    handles: { email: "eric.tham@ste.com.sg", linkedin: "/in/eric-tham-ste" },
  },
  {
    id: "hassan",
    name: "Hassan Malik",
    title: "Event curator",
    company: "Breakpoint",
    initials: "HM",
    met_at: "X DM · speaker outreach",
    met_date: "2026-03-02",
    last_contact: "29d",
    channel: "social",
    warmth: 42,
    signals: ["X DM", "cold ask", "speaker pitch"],
    last_crew: "social",
    autonomy: "yellow",
    org_tags: [],
    handles: {},
  },
  {
    id: "karim",
    name: "Karim El-Masri",
    title: "Advisor",
    company: "Personal",
    initials: "KE",
    met_at: "Dubai intro · Rashid",
    met_date: "2026-02-15",
    last_contact: "38d",
    channel: "email",
    warmth: 40,
    signals: ["polite silence", "one-line replies"],
    last_crew: "inbound",
    autonomy: "yellow",
    org_tags: [],
    handles: { linkedin: "/in/karim-elmasri" },
  },
  {
    id: "arun",
    name: "Arun Balaji",
    title: "Head of BD",
    company: "Nova Ventures",
    initials: "AB",
    met_at: "Inbound · Gmail",
    last_contact: "3d",
    channel: "email",
    warmth: 38,
    signals: ["no-fit", "polite pass"],
    last_crew: "inbound",
    autonomy: "yellow",
    org_tags: [],
    handles: { email: "arun@novavc.co" },
  },
  {
    id: "finley",
    name: "Finley Booker",
    title: "Correspondent",
    company: "Bloomberg",
    initials: "FB",
    met_at: "TOKEN2049 media lounge",
    met_date: "2025-09-20",
    last_contact: "48d",
    channel: "email",
    warmth: 38,
    signals: ["work-hours only", "short", "measured"],
    last_crew: "inbound",
    autonomy: "yellow",
    org_tags: ["TOKEN2049"],
    handles: { email: "fbooker@bloomberg.net" },
  },

  // ─── COLD (<35) ───
  {
    id: "aria",
    name: "Aria Mehta",
    title: "Founder",
    company: "Cosmic Protocol",
    initials: "AM",
    met_at: "ETHDenver 2025",
    met_date: "2025-02-28",
    last_contact: "62d",
    channel: "telegram",
    warmth: 30,
    signals: ["asymmetric interest", "lurker", "no reply"],
    last_crew: "signals",
    autonomy: "yellow",
    org_tags: ["Web3 SG"],
    handles: { telegram: "@aria_cosmic" },
  },
  {
    id: "jamal",
    name: "Jamal Idris",
    title: "Associate",
    company: "Outlier Ventures",
    initials: "JI",
    met_at: "ETHSG 2026",
    met_date: "2026-01-30",
    last_contact: "83d",
    channel: "email",
    warmth: 28,
    signals: ["no reply", "drift", "owe follow-up"],
    last_crew: "inbound",
    autonomy: "yellow",
    org_tags: ["Web3 SG"],
    handles: { email: "jamal@outlierventures.io" },
  },
  {
    id: "daniel",
    name: "Daniel O'Brien",
    title: "Partner",
    company: "Irish Tech Fund",
    initials: "DO",
    met_at: "Dublin web3 summit",
    met_date: "2025-10-05",
    last_contact: "88d",
    channel: "email",
    warmth: 25,
    signals: ["silent", "Easter silence"],
    last_crew: "inbound",
    autonomy: "yellow",
    org_tags: [],
    handles: { linkedin: "/in/daniel-obrien-itf" },
  },
  {
    id: "kenji",
    name: "Kenji Nakamura",
    title: "Director",
    company: "MUFG Innovation Hub",
    initials: "KN",
    met_at: "Tokyo fintech roundtable",
    met_date: "2025-09-15",
    last_contact: "127d",
    channel: "email",
    warmth: 22,
    signals: ["127d silent", "formal intro, no continuation"],
    last_crew: "inbound",
    autonomy: "yellow",
    org_tags: ["METI"],
    handles: { email: "k.nakamura@mufg-innov.com" },
  },
  {
    id: "wei",
    name: "Wei Lin Chen",
    title: "Founder",
    company: "NodeOne",
    initials: "WL",
    met_at: "Founders circle",
    met_date: "2025-12-20",
    last_contact: "104d",
    channel: "telegram",
    warmth: 18,
    signals: ["silent", "weekend ghost"],
    last_crew: "signals",
    autonomy: "yellow",
    org_tags: ["Web3 SG"],
    handles: { telegram: "@weilinchen" },
  },
  {
    id: "priscilla",
    name: "Priscilla Wang",
    title: "Head of Communications",
    company: "Binance APAC",
    initials: "PW",
    met_at: "Consensus HK 2025",
    met_date: "2025-07-08",
    last_contact: "274d",
    channel: "email",
    warmth: 12,
    signals: ["dormant 9 months", "no signal"],
    last_crew: "inbound",
    autonomy: "yellow",
    org_tags: [],
    handles: {
      email: "priscilla.w@binance.com",
      linkedin: "/in/priscilla-wang-binance",
    },
  },
];

// ─── Drafts (Morning Connect queue) ────────────────────────────────────────

export type DraftStatus = "pending" | "approved" | "skipped" | "never";

export type ReasoningLine = { crew: CrewKey; note: string };

export type FixtureDraft = {
  id: string;
  contact_id: string;
  contact: string;
  company: string;
  initials: string;
  crew: CrewKey; // origin Crew — the one that drafted this
  channel:
    | "Telegram"
    | "Gmail"
    | "WhatsApp"
    | "LinkedIn"
    | "Instagram"
    | "X"
    | "Facebook";
  warmth: number;
  // Optional: the inbound message that triggered this draft (undefined if outbound-initiated)
  inbound_message?: { text: string; timestamp: string };
  signal_chips: string[];
  draft: string;
  reasoning: string;
  reasoning_trail: ReasoningLine[];
  status?: DraftStatus;
};

export const fixtureDrafts: FixtureDraft[] = [
  {
    id: "d1",
    contact_id: "sofia",
    contact: "Sofia Alencar",
    company: "Helix Tech",
    initials: "SA",
    crew: "signals",
    channel: "Telegram",
    warmth: 82,
    inbound_message: {
      text: "Hi Freddy!! Loved your talk at TOKEN. Let's grab coffee this week?? 🔥",
      timestamp: "10:42",
    },
    signal_chips: ["Hi!!", "🔥", "2-min reply", "weekend evening"],
    draft:
      "Sofia — so good to hear from you! Thursday 3pm at Common Man Stan Rd works for me. Or happy to come to your side of town. The TOKEN talk made me realise we're thinking about the same compliance problem from opposite ends — want to properly swap notes.",
    reasoning:
      "Met 14 hours ago at a flagged event. Warmth 82 (hot). Her last message referenced the TOKEN talk — that context is mirrored. Thursday 3pm is free on your calendar and matches your preferred slot.",
    reasoning_trail: [
      { crew: "signals", note: "Hi!! + 🔥 + 2-min reply → hot" },
      { crew: "scan", note: "Met at TOKEN2049, Sep 2025 (re-met Sat)" },
      { crew: "signals", note: "Drafted in your casual Telegram voice" },
    ],
  },
  {
    id: "d2",
    contact_id: "priya",
    contact: "Priya Raghavan",
    company: "Sequoia SEA",
    initials: "PR",
    crew: "signals",
    channel: "Telegram",
    warmth: 86,
    inbound_message: {
      text: "Hi!! Fred — amazing to reconnect. Let me know when you're free this week?",
      timestamp: "09:14",
    },
    signal_chips: ["Hi!!", "2-min reply", "TOKEN2049"],
    draft:
      "Priya — same! Thursday 3pm for coffee? Loved your point on AI × SEA; want to dig into it properly. Happy to come to your side of town.",
    reasoning:
      "Warmth 86 (hot). Her message referenced AI × SEA — that phrase is mirrored. Thursday 3pm is your preferred slot and free on the calendar.",
    reasoning_trail: [
      { crew: "signals", note: "Hi!! + 2-min reply → hot" },
      { crew: "scan", note: "Met at TOKEN2049 Sep 2025" },
      { crew: "signals", note: "Drafted in Telegram-casual voice" },
    ],
  },
  {
    id: "d3",
    contact_id: "maria",
    contact: "Maria Chen",
    company: "Growth Labs",
    initials: "MC",
    crew: "inbound",
    channel: "Gmail",
    warmth: 58,
    inbound_message: {
      text: "Hi Freddy, I'm Maria from Growth Labs. We're building tooling for founders and I think there might be something interesting between our products...",
      timestamp: "08:02",
    },
    signal_chips: ["polite", "Hi Freddy,", "business hours"],
    draft:
      "Hi Maria — thanks for the note. Growth Labs looks interesting; reminds me a little of what we did with a Web3 SG partner last year. Happy to jump on a 20-min call — Thursday 3pm SGT work?",
    reasoning:
      "Inbound cold ask from Growth Labs. Qualified as fit — real company, Series A last year, aligned space. Approval required since the draft proposes a meeting on your calendar.",
    reasoning_trail: [
      { crew: "inbound", note: "Qualified · Web3 SG ICP fit · Series A co." },
      { crew: "scan", note: "Genspark enriched: Sequoia-backed, Mar 2025" },
      { crew: "inbound", note: "Staged for Morning Connect — meeting proposed" },
    ],
  },
  {
    id: "d4",
    contact_id: "jamal",
    contact: "Jamal Idris",
    company: "Outlier Ventures",
    initials: "JI",
    crew: "inbound",
    channel: "Gmail",
    warmth: 28,
    signal_chips: ["83d silent", "ETHSG", "dropped ball"],
    draft:
      "Jamal — been way too long. I know I dropped the ball after ETHSG. Here for a proper catch-up if you are — what does Thursday look like?",
    reasoning:
      "83 days silent. Last meaningful exchange was at ETHSG. Owning the silence is the right tone; proposing a concrete day reopens the door without pressure.",
    reasoning_trail: [
      { crew: "inbound", note: "83d silent · last touch ETHSG Jan 2026" },
      { crew: "scribe", note: "Last convo: he asked for a demo, never sent" },
      { crew: "inbound", note: "Ownership tone · concrete day proposed" },
    ],
  },
  {
    id: "d5",
    contact_id: "rashid",
    contact: "Rashid Nahas",
    company: "Personal",
    initials: "RN",
    crew: "signals",
    channel: "Telegram",
    warmth: 78,
    signal_chips: ["Hi Hi!", "voice note", "Dubai circle"],
    draft:
      "Rashid! You mentioned intros to the Dubai circle last week — I'm in UAE 6–8 May, worth looping in?",
    reasoning:
      "Warmth 78 (hot-warm). He offered intros earlier; this surfaces the commitment while it's still fresh. UAE dates pulled from your calendar.",
    reasoning_trail: [
      { crew: "signals", note: "Hi Hi! + voice note → warming" },
      { crew: "scribe", note: "Captured: 'Rashid offered Dubai intros'" },
      { crew: "signals", note: "Surfaces commitment before it goes stale" },
    ],
  },
  {
    id: "d6",
    contact_id: "catherine",
    contact: "Catherine Liu",
    company: "METI Japan",
    initials: "CL",
    crew: "scribe",
    channel: "Gmail",
    warmth: 68,
    signal_chips: ["Tuesday call", "commitment", "SEA reg deck"],
    draft:
      "Catherine — following up on Tuesday's call. Per your ask, attached the SEA regulatory framework deck. Happy to set time if useful.",
    reasoning:
      "Scribe extracted an action item from Tuesday's call: 'send Catherine SEA reg deck.' This closes the loop on that commitment.",
    reasoning_trail: [
      { crew: "scribe", note: "Extracted commitment from 18-min Plaud" },
      { crew: "inbound", note: "Drafted in slightly formal email voice" },
      { crew: "scribe", note: "Attaches deck referenced in call" },
    ],
  },
  {
    id: "d7",
    contact_id: "arun",
    contact: "Arun Balaji",
    company: "Nova Ventures",
    initials: "AB",
    crew: "inbound",
    channel: "Gmail",
    warmth: 38,
    inbound_message: {
      text: "Hello Freddy, I'm reaching out from Nova Ventures. We're rolling out a creator platform and I'd love to explore a partnership...",
      timestamp: "07:41",
    },
    signal_chips: ["cold outreach", "no-fit", "polite"],
    draft:
      "Arun — appreciate the note. Not quite the right fit for what we're doing right now, but thank you for thinking of me. Keep in touch.",
    reasoning:
      "Inbound cold outreach. No-fit against your current ICP. Polite pass prepared; no meeting proposed.",
    reasoning_trail: [
      { crew: "inbound", note: "Scored no-fit against current ICP" },
      { crew: "inbound", note: "Polite-pass template, warm tone" },
      { crew: "inbound", note: "No meeting proposed — safe to auto-send" },
    ],
  },
  {
    id: "d8",
    contact_id: "marcus",
    contact: "Marcus Low",
    company: "Kite Commerce",
    initials: "ML",
    crew: "signals",
    channel: "Telegram",
    warmth: 88,
    inbound_message: {
      text: "[voice note 42s]",
      timestamp: "Sat 21:30",
    },
    signal_chips: ["voice note", "Saturday", "42s"],
    draft:
      "Marcus — quick one, yes I'm in for breakfast Tuesday. Same place? Also the thing you mentioned about the escrow flow — would love to see a whiteboard of it when we meet.",
    reasoning:
      "Warmth 88 (hot). He sent a weekend voice note proposing breakfast Tuesday. Acknowledges + references his commerce-escrow comment. Auto-send is enabled for Marcus (Green tier), but a draft is surfaced for confirmation since it proposes a calendar commitment.",
    reasoning_trail: [
      { crew: "scribe", note: "Transcribed 42s voice note · Tue breakfast ask" },
      { crew: "signals", note: "Weekend voice note → hot signal" },
      { crew: "signals", note: "Short, casual — matches Marcus voice pattern" },
    ],
  },
  {
    id: "d9",
    contact_id: "diego",
    contact: "Diego Alvarez",
    company: "Grupo Santander",
    initials: "DA",
    crew: "inbound",
    channel: "Gmail",
    warmth: 76,
    inbound_message: {
      text: "Hi Fred!! Loved the Web3 SG talk in Feb. We're looking at on-ramp partnerships for LATAM and I think you'd have strong opinions 🙂",
      timestamp: "yesterday 22:10",
    },
    signal_chips: ["Hi Fred!!", "🙂", "fast replies"],
    draft:
      "Diego — great to hear from you! On-ramps in LATAM is a space I'm following closely. Would love to compare notes — 30-min call next week?",
    reasoning:
      "Warmth 76 (hot-warm). Inbound from a real partnerships GM; clear ICP fit. Proposes a call — approval required in Morning Connect.",
    reasoning_trail: [
      { crew: "inbound", note: "Qualified · LATAM fintech · Santander" },
      { crew: "scan", note: "Genspark enriched · 4 mutuals · Web3 SG" },
      { crew: "inbound", note: "Meeting proposed → Yellow tier review" },
    ],
  },
  {
    id: "d10",
    contact_id: "kenji",
    contact: "Kenji Nakamura",
    company: "MUFG Innovation Hub",
    initials: "KN",
    crew: "inbound",
    channel: "Gmail",
    warmth: 22,
    signal_chips: ["127d silent", "Tokyo", "formal"],
    draft:
      "Kenji-san — it's been too long since our Tokyo roundtable. I remember you mentioning the MUFG stablecoin pilot; I'd be keen to hear where it landed. If you're open to a short call, happy to work around your timezone.",
    reasoning:
      "127 days silent. Last substantive touch was the Tokyo fintech roundtable. Formal Japanese-business register is required. References a specific point from the original conversation to demonstrate memory.",
    reasoning_trail: [
      { crew: "inbound", note: "127d silent · Tokyo fintech roundtable" },
      { crew: "scribe", note: "Past convo: MUFG stablecoin pilot mentioned" },
      { crew: "inbound", note: "Register adjusted → formal JP-business English" },
    ],
  },
  {
    id: "d11",
    contact_id: "theo",
    contact: "Theo Kostas",
    company: "Polygon",
    initials: "TK",
    crew: "signals",
    channel: "Telegram",
    warmth: 70,
    signal_chips: ["ETHSG", "partnerships", "due"],
    draft:
      "Theo — following up from ETHSG. You mentioned the Polygon partnerships RFP; I'd like to submit a proposal with a Web3 SG angle. Worth 30-min this week to align on scope?",
    reasoning:
      "Warmth 70 (warm). He opened the door to an RFP at ETHSG; 24-hour post-event window has passed, so this is the 1-week follow-up nudge. Specific ask, not a general 'catch up'.",
    reasoning_trail: [
      { crew: "signals", note: "1-week ETHSG follow-up window" },
      { crew: "scribe", note: "Captured RFP mention from ETHSG booth chat" },
      { crew: "signals", note: "Drafted specific not generic — proposal ask" },
    ],
  },
  {
    id: "d12",
    contact_id: "leila",
    contact: "Leila Okonkwo",
    company: "Chainalysis APAC",
    initials: "LO",
    crew: "scribe",
    channel: "Gmail",
    warmth: 66,
    signal_chips: ["commitment", "Compliance Summit"],
    draft:
      "Leila — attaching the PDPA memo we talked about. Also flagging the Helix Tech deck since you mentioned you were evaluating privacy infrastructure; happy to intro.",
    reasoning:
      "Scribe captured two commitments from Compliance Summit: send PDPA memo, flag privacy-infra options. Both close out in one email.",
    reasoning_trail: [
      { crew: "scribe", note: "2 commitments from Compliance Summit 12 Mar" },
      { crew: "inbound", note: "Drafted slightly formal — Chainalysis voice" },
      { crew: "scribe", note: "Bundles both commitments into one reply" },
    ],
  },
  {
    id: "d13",
    contact_id: "sam",
    contact: "Sam Harel",
    company: "Y Combinator",
    initials: "SH",
    crew: "inbound",
    channel: "Gmail",
    warmth: 72,
    inbound_message: {
      text: "Hi Freddy! Demo day was great seeing you. Remind me — did you want to be on the mentor list for batch S26?",
      timestamp: "yesterday 17:22",
    },
    signal_chips: ["Hi Freddy!", "YC", "batch S26"],
    draft:
      "Sam — yes please, I'd love to be on the S26 mentor list. Happy to bias toward SEA-based founders if useful. Let me know what you need from me.",
    reasoning:
      "Warmth 72 (warm). He's offering a low-friction commitment with no meeting proposed. Simple yes with a helpful qualifier.",
    reasoning_trail: [
      { crew: "inbound", note: "Hi Freddy! · one emoji-per-msg pattern" },
      { crew: "inbound", note: "Low-friction ask, no calendar commit" },
      { crew: "inbound", note: "Yes + SEA-focus qualifier to steer matching" },
    ],
  },
  {
    id: "d15",
    contact_id: "kai",
    contact: "Kai Jensen",
    company: "Seedstars SEA",
    initials: "KJ",
    crew: "social",
    channel: "Instagram",
    warmth: 68,
    inbound_message: {
      text: "Hey Fred! Saw your Web3 SG post — would love to chat about Seedstars doing something joint. DM open?",
      timestamp: "6am sweep · yesterday",
    },
    signal_chips: ["Hey Fred!", "🙌", "IG DM", "partnership ask"],
    draft:
      "Kai — yes definitely, always keen to chat Seedstars. Would 30-min next Tues work? Ping me on TG if easier — @bboxfred.",
    reasoning:
      "Inbound IG DM from real partnerships contact. ICP fit — Seedstars has an active SEA portfolio. Offers to move to TG (a channel we actually automate), so future exchanges leave IG.",
    reasoning_trail: [
      { crew: "social", note: "Captured 6am · IG DM window open" },
      { crew: "signals", note: "Hey Fred! + 🙌 + quick reply → warm" },
      { crew: "social", note: "Offered TG as upgrade channel" },
    ],
  },
  {
    id: "d16",
    contact_id: "naomi",
    contact: "Naomi Park",
    company: "Blockworks",
    initials: "NP",
    crew: "social",
    channel: "X",
    warmth: 58,
    inbound_message: {
      text: "Hi Freddy, working on a piece about SEA web3 infrastructure — would love a quote on the Claude Code SG community. Email ok?",
      timestamp: "6am sweep · yesterday",
    },
    signal_chips: ["Hi Freddy,", "press ask", "X DM"],
    draft:
      "Naomi — happy to contribute a quote. Email is better for quotes — fred@collecter.club. Quick turnaround or a few days?",
    reasoning:
      "Inbound X DM from Blockworks reporter. Legitimate press ask. Routing to email is the right register for a quote attribution flow.",
    reasoning_trail: [
      { crew: "social", note: "Captured 6am · X DM · press" },
      { crew: "inbound", note: "Press-ask pattern · offer email upgrade" },
      { crew: "social", note: "Polite, measured register for journalist" },
    ],
  },
  {
    id: "d17",
    contact_id: "hassan",
    contact: "Hassan Malik",
    company: "Breakpoint",
    initials: "HM",
    crew: "social",
    channel: "X",
    warmth: 42,
    inbound_message: {
      text: "Hi, looking for speakers for Breakpoint Singapore 2026. Web3 community focus. Would you be interested?",
      timestamp: "6am sweep · yesterday",
    },
    signal_chips: ["cold ask", "no context", "X DM"],
    draft:
      "Hi Hassan — thanks for the note. Speaker slots are locked in for 2026 on my side. Keep me in mind for 2027 and I'll do the same.",
    reasoning:
      "Inbound X DM · cold outreach · no personal context. Polite pass, reciprocal offer to stay in touch.",
    reasoning_trail: [
      { crew: "social", note: "Captured 6am · X DM · cold" },
      { crew: "inbound", note: "No-fit for 2026 · polite pass template" },
      { crew: "social", note: "Door left open for 2027 · reciprocal" },
    ],
  },
  {
    id: "d14",
    contact_id: "akiko",
    contact: "Akiko Fujimoto",
    company: "METI Japan",
    initials: "AF",
    crew: "inbound",
    channel: "Gmail",
    warmth: 77,
    inbound_message: {
      text: "Dear Freddy, thank you for the thoughtful introduction to Catherine. Much appreciated.",
      timestamp: "yesterday 09:04",
    },
    signal_chips: ["formal", "thank-you", "acknowledgment"],
    draft:
      "Dear Akiko-san, thank you — happy to have made the introduction. Catherine mentioned the regulatory framework work; I will be in Tokyo 18–22 May and would welcome a coffee if your schedule allows.",
    reasoning:
      "Warmth 77 (hot). Thank-you acknowledgement is low-friction; this is also the right moment to reference the upcoming Tokyo trip from the calendar.",
    reasoning_trail: [
      { crew: "scribe", note: "Catherine mentioned reg framework work" },
      { crew: "inbound", note: "Formal register · Japanese-business appropriate" },
      { crew: "inbound", note: "Surfaces Tokyo trip dates from calendar" },
    ],
  },
];

// ─── Sofia's 90-day Warmth history (for Contact Detail timeline) ───────────

export type WarmthPoint = {
  day: number; // 0 = 90 days ago, 90 = today
  date: string; // ISO date
  warmth: number;
  event?: string;
  channel?: Channel;
};

export const fixtureSofiaTimeline: WarmthPoint[] = [
  { day: 0, date: "2026-01-23", warmth: 62, event: "Baseline · post-TOKEN2049 warm lead" },
  { day: 4, date: "2026-01-27", warmth: 60 },
  { day: 9, date: "2026-02-01", warmth: 58 },
  { day: 15, date: "2026-02-07", warmth: 55, event: "Response slowing · 2-day gap" },
  { day: 20, date: "2026-02-12", warmth: 52 },
  { day: 28, date: "2026-02-20", warmth: 48, event: "Drift flagged by Messenger" },
  { day: 35, date: "2026-02-27", warmth: 44 },
  { day: 42, date: "2026-03-06", warmth: 42, event: "Long silence begins" },
  { day: 48, date: "2026-03-12", warmth: 40 },
  { day: 54, date: "2026-03-18", warmth: 40, event: "Lead-O-Meter flagged for resurrection" },
  { day: 56, date: "2026-03-20", warmth: 68, event: "Reconnected at SGInnovate dinner", channel: "telegram" },
  { day: 58, date: "2026-03-22", warmth: 70, event: "First warm reply · Hi!", channel: "telegram" },
  { day: 60, date: "2026-03-24", warmth: 73 },
  { day: 65, date: "2026-03-29", warmth: 75, event: "Hi!! + 🔥 on Telegram · hot tier", channel: "telegram" },
  { day: 70, date: "2026-04-03", warmth: 77 },
  { day: 76, date: "2026-04-09", warmth: 79, event: "Sent voice note", channel: "telegram" },
  { day: 81, date: "2026-04-14", warmth: 80 },
  { day: 85, date: "2026-04-18", warmth: 82, event: "Steady hot pattern", channel: "telegram" },
  { day: 88, date: "2026-04-21", warmth: 82, event: "Pinged about Thursday coffee" },
  { day: 90, date: "2026-04-23", warmth: 82, event: "Today · draft staged for Morning Connect" },
];

// ─── Interactions log (Sofia's conversations tab) ──────────────────────────

export type Interaction = {
  id: string;
  contact_id: string;
  timestamp: string;
  day_label: string;
  channel: Channel;
  direction: "inbound" | "outbound";
  kind: "message" | "voice_note" | "card_scan" | "meeting";
  preview: string;
  crew?: CrewKey;
};

export const fixtureInteractions: Interaction[] = [
  {
    id: "i1",
    contact_id: "sofia",
    timestamp: "2026-04-23T10:42:00+08:00",
    day_label: "Today",
    channel: "telegram",
    direction: "inbound",
    kind: "message",
    preview:
      "Hi Freddy!! Loved your talk at TOKEN. Let's grab coffee this week?? 🔥",
    crew: "signals",
  },
  {
    id: "i2",
    contact_id: "sofia",
    timestamp: "2026-04-21T14:12:00+08:00",
    day_label: "Mon 21 April",
    channel: "telegram",
    direction: "inbound",
    kind: "message",
    preview: "Hey Fred, you around this week? Want to bounce something off you.",
    crew: "signals",
  },
  {
    id: "i3",
    contact_id: "sofia",
    timestamp: "2026-04-09T20:47:00+08:00",
    day_label: "Thu 9 April",
    channel: "telegram",
    direction: "inbound",
    kind: "voice_note",
    preview: "[voice note · 1m 04s · Sofia on Helix's privacy stack]",
    crew: "scribe",
  },
  {
    id: "i4",
    contact_id: "sofia",
    timestamp: "2026-03-29T21:15:00+08:00",
    day_label: "Sat 29 March",
    channel: "telegram",
    direction: "inbound",
    kind: "message",
    preview: "Hi!! That was fantastic 🔥 let me know when you're next in town",
    crew: "signals",
  },
  {
    id: "i5",
    contact_id: "sofia",
    timestamp: "2026-03-20T19:30:00+08:00",
    day_label: "Thu 20 March",
    channel: "telegram",
    direction: "outbound",
    kind: "message",
    preview:
      "Great running into you at SGInnovate. Let's grab coffee soon — I owe you a proper catch-up.",
    crew: "signals",
  },
  {
    id: "i6",
    contact_id: "sofia",
    timestamp: "2025-09-19T15:20:00+08:00",
    day_label: "TOKEN2049 · Sep 2025",
    channel: "card",
    direction: "inbound",
    kind: "card_scan",
    preview: "Business card scanned · Helix Tech · Head of Partnerships",
    crew: "scan",
  },
];

// ─── Activity log (Dashboard feed) ─────────────────────────────────────────

export type ActivityEntry = {
  id: string;
  timestamp: string;
  crew: CrewKey;
  action: string;
  detail: string;
  contact_id?: string;
};

export const fixtureActivityLog: ActivityEntry[] = [
  {
    id: "a1",
    timestamp: "15:02",
    crew: "inbound",
    action: "Queued partnership reply for Diego Alvarez",
    detail: "Genspark: Santander LATAM · Series A announcement Feb 2026 · 4 mutuals",
    contact_id: "diego",
  },
  {
    id: "a2",
    timestamp: "14:45",
    crew: "signals",
    action: "Warmed Sofia Alencar +3 after Hi!!",
    detail: "Hi!! + 🔥 + 2-min reply · hot tier maintained (82)",
    contact_id: "sofia",
  },
  {
    id: "a3",
    timestamp: "14:27",
    crew: "scan",
    action: "24-hour post-event follow-up window opens · 4 contacts",
    detail: "Theo (Polygon), Diego (Santander), Priya (Sequoia), Sofia (Helix) · flagged for Morning Connect",
  },
  {
    id: "a4",
    timestamp: "14:12",
    crew: "inbound",
    action: "Flagged Priscilla Wang (dormant 9 months)",
    detail: "Binance APAC · last touch Consensus HK July 2025 · surfaced via Lead-O-Meter",
    contact_id: "priscilla",
  },
  {
    id: "a5",
    timestamp: "13:58",
    crew: "scribe",
    action: "Captured commitment — send Catherine SEA reg deck",
    detail: "From Tuesday's Plaud recording · 18:04 mark · draft routed to Morning Connect",
    contact_id: "catherine",
  },
  {
    id: "a6",
    timestamp: "13:32",
    crew: "signals",
    action: "Detected Hi Hi! in Rashid's voice note",
    detail: "Transcribed by Scribe · 42s · intent to reconnect · warmth +4",
    contact_id: "rashid",
  },
  {
    id: "a7",
    timestamp: "13:19",
    crew: "inbound",
    action: "Staged reply for Sam Harel (YC)",
    detail: "Qualified · low-friction mentor-list commitment · no meeting proposed",
    contact_id: "sam",
  },
  {
    id: "a8",
    timestamp: "13:01",
    crew: "scan",
    action: "Read business card stack · 3 cards · TOKEN2049 archive",
    detail: "Claude extracted 21 fields · Genspark enriched 3 profiles · 1 duplicate merged",
  },
  {
    id: "a9",
    timestamp: "12:44",
    crew: "signals",
    action: "Drafted Dubai intro for Rashid Nahas",
    detail: "Surfaced commitment 'Rashid offered Dubai intros' from prior voice note",
    contact_id: "rashid",
  },
  {
    id: "a10",
    timestamp: "12:25",
    crew: "signals",
    action: "Tier change · Leila Okonkwo → Warm (66)",
    detail: "Hi Freddy, + within-day reply pattern · crossed threshold from neutral",
    contact_id: "leila",
  },
  {
    id: "a11",
    timestamp: "12:10",
    crew: "inbound",
    action: "Prepared 83-day check-in for Jamal Idris",
    detail: "ETHSG last touch · ownership tone · references demo commitment from Jan",
    contact_id: "jamal",
  },
  {
    id: "a12",
    timestamp: "11:47",
    crew: "scribe",
    action: "Transcribed 18-min Plaud recording (SEA reg chat)",
    detail: "2 commitments extracted · Catherine × SEA deck, Marcus × escrow intro",
  },
  {
    id: "a13",
    timestamp: "11:33",
    crew: "inbound",
    action: "Rejected Arun Balaji (no-fit, Nova Ventures)",
    detail: "Polite-pass template · Yellow tier (surfaced for review, no meeting)",
    contact_id: "arun",
  },
  {
    id: "a14",
    timestamp: "11:18",
    crew: "signals",
    action: "Staged follow-up for Marcus Low",
    detail: "Saturday 42s voice note · Tue breakfast ask · Green tier (auto-send eligible)",
    contact_id: "marcus",
  },
  {
    id: "a15",
    timestamp: "11:04",
    crew: "signals",
    action: "Detected drift on Wei Lin Chen (−7)",
    detail: "104d silent · weekend ghost pattern confirmed · warmth 25 → 18",
    contact_id: "wei",
  },
  {
    id: "a16",
    timestamp: "10:42",
    crew: "scan",
    action: "Filed Sofia Alencar from Helix Tech",
    detail: "7 fields · Genspark: Crunchbase + press + company site · 2 graph mutuals",
    contact_id: "sofia",
  },
  {
    id: "a17",
    timestamp: "10:23",
    crew: "inbound",
    action: "Queued resurrection draft for Kenji Nakamura (127d silent)",
    detail: "Tokyo fintech roundtable · register adjusted → formal JP-business",
    contact_id: "kenji",
  },
  {
    id: "a18",
    timestamp: "10:15",
    crew: "scribe",
    action: "Extracted 2 action items from Catherine Liu call",
    detail: "Send SEA reg deck · Intro Catherine × Marcus Low · both routed to Morning Connect",
    contact_id: "catherine",
  },
  {
    id: "a19",
    timestamp: "10:02",
    crew: "inbound",
    action: "Qualified Maria Chen (Growth Labs)",
    detail: "Yellow tier · ICP fit · Series A backed · draft staged for Morning Connect",
    contact_id: "maria",
  },
  {
    id: "a20",
    timestamp: "09:41",
    crew: "signals",
    action: "Drafted TOKEN2049 follow-up for Sofia",
    detail: "Warmth 82 · casual Telegram voice · Thursday 3pm proposed",
    contact_id: "sofia",
  },
  {
    id: "a21",
    timestamp: "09:22",
    crew: "signals",
    action: "Warmed Priya +6 after Hi!!",
    detail: "Hi!! + 2-min reply → hot tier (86) · draft routed to Morning Connect",
    contact_id: "priya",
  },
  {
    id: "a22",
    timestamp: "09:15",
    crew: "scan",
    action: "Processed Sofia Alencar's TOKEN2049 archive card",
    detail: "Queued overnight · read 08:42 · enriched 09:14 · filed 09:15",
    contact_id: "sofia",
  },
  {
    id: "a23",
    timestamp: "06:04",
    crew: "social",
    action: "6am sweep · pulled 3 new DMs from Instagram + X",
    detail: "Kai Jensen (IG · Seedstars) · Naomi Park (X · Blockworks) · Hassan Malik (X · Breakpoint)",
  },
  {
    id: "a24",
    timestamp: "06:18",
    crew: "social",
    action: "Qualified Naomi Park (Blockworks press ask)",
    detail: "Routed to email for quote attribution · draft staged for Morning Connect",
    contact_id: "naomi",
  },
];

// ─── Enrichment (Genspark Super Agent output) ──────────────────────────────

export type Enrichment = {
  contact_id: string;
  linkedin_url?: string;
  linkedin_summary?: string;
  company_url?: string;
  company_summary?: string;
  mutual_connections: { name: string; contact_id?: string }[];
  recent_news: { title: string; date: string; url?: string }[];
  location?: string;
  sourced_from: string[];
  last_refreshed: string;
};

export const fixtureEnrichments: Record<string, Enrichment> = {
  sofia: {
    contact_id: "sofia",
    linkedin_url: "https://linkedin.com/in/sofia-alencar-helix",
    linkedin_summary:
      "Head of Partnerships at Helix Tech since Aug 2024 (via TechInAsia coverage). Focus: privacy-preserving compliance infrastructure for SEA fintech.",
    company_url: "https://helix.tech",
    company_summary:
      "Helix Tech · Series A $18M (Sequoia SEA lead, Feb 2025). Building privacy-preserving compliance infrastructure for fintech in SEA. Team of 28 across Singapore, Jakarta, Manila.",
    mutual_connections: [
      { name: "Marcus Low", contact_id: "marcus" },
      { name: "Priya Raghavan", contact_id: "priya" },
    ],
    recent_news: [
      {
        title: "Helix Tech closes $18M Series A led by Sequoia SEA",
        date: "Feb 2025",
        url: "https://techinasia.com/helix-series-a",
      },
      {
        title: "Sofia Alencar speaks at TOKEN2049 on privacy compliance",
        date: "Sep 2025",
      },
    ],
    location: "Singapore",
    sourced_from: ["Crunchbase", "helix.tech", "TechInAsia", "TOKEN2049 archive"],
    last_refreshed: "2026-04-22T14:30:00+08:00",
  },
  priya: {
    contact_id: "priya",
    linkedin_url: "https://linkedin.com/in/priya-raghavan",
    linkedin_summary:
      "Partner at Sequoia SEA since 2023 (per Sequoia site). Thesis: AI × SEA infrastructure.",
    company_url: "https://sequoiacap.com/sea",
    company_summary:
      "Sequoia Capital Southeast Asia — early-stage venture. Fund III active ($2.85B AUM). Investments include Helix Tech, Tonik, Ninja Van.",
    mutual_connections: [
      { name: "Sofia Alencar", contact_id: "sofia" },
      { name: "Sam Harel", contact_id: "sam" },
      { name: "Theo Kostas", contact_id: "theo" },
    ],
    recent_news: [
      {
        title: "Sequoia SEA leads Helix Tech Series A",
        date: "Feb 2025",
      },
      {
        title: "Priya Raghavan on 'AI × SEA' at TOKEN2049",
        date: "Sep 2025",
      },
    ],
    location: "Singapore",
    sourced_from: ["Sequoia site", "Crunchbase", "TOKEN2049 archive"],
    last_refreshed: "2026-04-20T09:15:00+08:00",
  },
  marcus: {
    contact_id: "marcus",
    linkedin_url: "https://linkedin.com/in/marcuslow",
    linkedin_summary:
      "Founder & CEO at Kite Commerce. Previously Head of Product at Shopee SEA (2020–2023). Stanford GSB 2020. SEA commerce + escrow.",
    company_url: "https://kitecommerce.io",
    company_summary:
      "Kite Commerce · Seed $4.5M (Peak XV, Jan 2025). Cross-border escrow and commerce infrastructure for SEA SMBs.",
    mutual_connections: [
      { name: "Sofia Alencar", contact_id: "sofia" },
      { name: "Catherine Liu", contact_id: "catherine" },
    ],
    recent_news: [
      {
        title: "Kite Commerce launches cross-border escrow pilot",
        date: "Mar 2026",
      },
    ],
    location: "Singapore",
    sourced_from: ["Crunchbase", "kitecommerce.io", "TechCrunch"],
    last_refreshed: "2026-04-12T11:05:00+08:00",
  },
  diego: {
    contact_id: "diego",
    linkedin_url: "https://linkedin.com/in/diego-alvarez-santander",
    linkedin_summary:
      "GM, LATAM Innovation at Grupo Santander. 12 years at Santander across Mexico, Chile, Brazil. Focus: digital banking partnerships.",
    company_url: "https://santander.com",
    company_summary:
      "Grupo Santander · global bank, LATAM division HQ in São Paulo. Active Web3 on-ramp partnerships across Mexico and Argentina.",
    mutual_connections: [
      { name: "Leila Okonkwo", contact_id: "leila" },
      { name: "Priya Raghavan", contact_id: "priya" },
    ],
    recent_news: [
      {
        title: "Santander opens LATAM Web3 innovation lab",
        date: "Jan 2026",
      },
    ],
    location: "São Paulo, BR",
    sourced_from: ["Santander press room", "Web3 SG attendee list", "Crunchbase"],
    last_refreshed: "2026-04-18T16:42:00+08:00",
  },
  kenji: {
    contact_id: "kenji",
    linkedin_url: "https://linkedin.com/in/kenji-nakamura-mufg",
    linkedin_summary:
      "Director, Innovation Hub at MUFG Bank. 18 years at MUFG. Leads stablecoin and digital asset pilots.",
    company_url: "https://www.mufg.jp/english/innovation",
    company_summary:
      "MUFG Innovation Hub · Tokyo. Stablecoin (JPYC pilot), tokenised deposits, digital identity initiatives. Opened Singapore node Mar 2026.",
    mutual_connections: [
      { name: "Akio Tanaka", contact_id: "akio" },
      { name: "Akiko Fujimoto", contact_id: "akiko" },
    ],
    recent_news: [
      {
        title: "MUFG expands JPYC stablecoin pilot to cross-border",
        date: "Mar 2026",
      },
    ],
    location: "Tokyo, JP",
    sourced_from: ["MUFG press", "Nikkei Asia", "Tokyo fintech roundtable notes"],
    last_refreshed: "2026-03-28T10:00:00+08:00",
  },
};

// ─── Voice notes / meetings (Scribe) ───────────────────────────────────────

export type VoiceNote = {
  id: string;
  source: "plaud" | "meeting" | "manual";
  date: string;
  duration_sec: number;
  transcript_preview: string;
  commitments: string[];
  contact_ids: string[];
  title: string;
};

export const fixtureVoiceNotes: VoiceNote[] = [
  {
    id: "v1",
    source: "plaud",
    date: "2026-04-22",
    duration_sec: 1080,
    title: "Catherine Liu · SEA regulatory framework chat",
    transcript_preview:
      "Catherine walked through the upcoming SEA regulatory framework that METI is drafting. Key concern is data residency requirements for cross-border financial messaging. She mentioned MUFG is already running a pilot, and asked whether Helix's compliance infra could be relevant...",
    commitments: [
      "Send Catherine the SEA reg deck",
      "Intro Catherine × Marcus Low (Kite Commerce escrow)",
    ],
    contact_ids: ["catherine", "marcus"],
  },
  {
    id: "v2",
    source: "plaud",
    date: "2026-04-20",
    duration_sec: 240,
    title: "Sofia Alencar · voice note reply",
    transcript_preview:
      "Hey Fred, just thinking through your question about the Helix privacy stack. The short answer is yes, we're thinking about it the same way — the zero-knowledge claim paths are where we diverge from the obvious playbook. Would love to whiteboard when you're in town...",
    commitments: ["Whiteboard session with Sofia (in town week of Apr 23)"],
    contact_ids: ["sofia"],
  },
  {
    id: "v3",
    source: "meeting",
    date: "2026-04-18",
    duration_sec: 2760,
    title: "ABA EXCO weekly · 46 min",
    transcript_preview:
      "Standing EXCO agenda. Updates from the Tokyo delegation (Akio presenting), TOKEN Dubai preparation, Q3 research budget. Freddy volunteered to draft the Q3 partnership deck by end of week. Akiko flagged two potential sponsors from METI network...",
    commitments: [
      "Draft Q3 partnership deck by end of week",
      "Follow up with Akiko on METI sponsors",
    ],
    contact_ids: ["akio", "akiko"],
  },
  {
    id: "v4",
    source: "plaud",
    date: "2026-04-13",
    duration_sec: 622,
    title: "Marcus Low · Saturday breakfast call",
    transcript_preview:
      "Marcus talking through the Kite escrow redesign. Wants to map out the edge cases for cross-border disputes. Asked if Freddy could sit in on a whiteboard session with his CTO on Tuesday. Also mentioned wanting an intro to Sofia at Helix...",
    commitments: [
      "Breakfast Tuesday at Toby's · whiteboard with CTO",
      "Intro Marcus × Sofia (privacy-infra overlap)",
    ],
    contact_ids: ["marcus", "sofia"],
  },
  {
    id: "v5",
    source: "manual",
    date: "2026-04-10",
    duration_sec: 180,
    title: "Self-note after Claude Code SG April 10",
    transcript_preview:
      "Quick note to self after the event — really strong SEA founder contingent tonight. Marcus pitched his escrow thing, got the whole room nodding. Priya showed up unexpectedly, we chatted about TOKEN2049 Dubai prep. Met three new founders I need to file properly...",
    commitments: [
      "File three new founder contacts from Apr 10 event",
      "Follow up with Priya re: TOKEN2049 Dubai",
    ],
    contact_ids: ["marcus", "priya"],
  },
];

// ─── Cards in processing (Scan screen) ─────────────────────────────────────

export type CardInProcessing = {
  id: string;
  state: "queued" | "reading" | "enriching" | "complete" | "error";
  filename: string;
  captured_at: string;
  extracted?: {
    name?: string;
    title?: string;
    company?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
  };
  error_reason?: string;
};

export const fixtureCards: CardInProcessing[] = [
  {
    id: "c1",
    state: "complete",
    filename: "sofia-alencar-helix.jpg",
    captured_at: "2026-04-23T09:15:00+08:00",
    extracted: {
      name: "Sofia Alencar",
      title: "Head of Partnerships",
      company: "Helix Tech",
      email: "sofia@helix.tech",
      phone: "+65 9123 4567",
      linkedin: "/in/sofia-alencar-helix",
    },
  },
  {
    id: "c2",
    state: "enriching",
    filename: "live-capture.jpg",
    captured_at: "2026-04-23T14:58:00+08:00",
    extracted: {
      name: "Yael Bergstein",
      title: "Head of DevRel",
      company: "Tessera Labs",
      email: "yael@tessera.xyz",
    },
  },
  {
    id: "c3",
    state: "reading",
    filename: "capture-2.jpg",
    captured_at: "2026-04-23T14:59:00+08:00",
  },
  {
    id: "c4",
    state: "queued",
    filename: "capture-3.jpg",
    captured_at: "2026-04-23T14:59:30+08:00",
  },
  {
    id: "c5",
    state: "error",
    filename: "blurry-capture.jpg",
    captured_at: "2026-04-23T13:47:00+08:00",
    error_reason: "Text below OCR-confidence threshold · manual review required",
  },
];

// ─── Today's Warmth updates (Dashboard sparkline) ──────────────────────────

export type WarmthTier = "hot" | "warm" | "neutral" | "cold";

export type WarmthUpdateToday = {
  time: string;
  hour: number;
  minute: number;
  contact_id: string;
  contact_name: string;
  delta: number;
  reason: string;
  tier: WarmthTier;
};

export const fixtureWarmthUpdatesToday: WarmthUpdateToday[] = [
  { time: "07:48", hour: 7, minute: 48, contact_id: "marcus", contact_name: "Marcus Low", delta: 4, reason: "Weekend voice note (42s)", tier: "hot" },
  { time: "08:12", hour: 8, minute: 12, contact_id: "diego", contact_name: "Diego Alvarez", delta: 2, reason: "Hi Fred!! + 🙂", tier: "hot" },
  { time: "09:22", hour: 9, minute: 22, contact_id: "priya", contact_name: "Priya Raghavan", delta: 6, reason: "Hi!! + 2-min reply", tier: "hot" },
  { time: "09:41", hour: 9, minute: 41, contact_id: "sofia", contact_name: "Sofia Alencar", delta: 3, reason: "Re-engaged after TOKEN2049", tier: "hot" },
  { time: "10:15", hour: 10, minute: 15, contact_id: "theo", contact_name: "Theo Kostas", delta: 2, reason: "Replied within 24h", tier: "warm" },
  { time: "10:42", hour: 10, minute: 42, contact_id: "sofia", contact_name: "Sofia Alencar", delta: 0, reason: "Inbound message logged", tier: "hot" },
  { time: "11:04", hour: 11, minute: 4, contact_id: "wei", contact_name: "Wei Lin Chen", delta: -7, reason: "104d silent · weekend ghost confirmed", tier: "cold" },
  { time: "11:18", hour: 11, minute: 18, contact_id: "marcus", contact_name: "Marcus Low", delta: 1, reason: "Acknowledged breakfast ask", tier: "hot" },
  { time: "12:10", hour: 12, minute: 10, contact_id: "jamal", contact_name: "Jamal Idris", delta: -2, reason: "83d silent · decay continues", tier: "cold" },
  { time: "12:25", hour: 12, minute: 25, contact_id: "leila", contact_name: "Leila Okonkwo", delta: 4, reason: "Hi Freddy, + same-day reply → warm tier", tier: "warm" },
  { time: "13:04", hour: 13, minute: 4, contact_id: "rashid", contact_name: "Rashid Nahas", delta: 5, reason: "Hi Hi! + voice note from Dubai", tier: "hot" },
  { time: "13:32", hour: 13, minute: 32, contact_id: "rashid", contact_name: "Rashid Nahas", delta: 2, reason: "Follow-up voice note", tier: "hot" },
  { time: "14:12", hour: 14, minute: 12, contact_id: "priscilla", contact_name: "Priscilla Wang", delta: -1, reason: "Dormant 9 months · decay", tier: "cold" },
  { time: "14:45", hour: 14, minute: 45, contact_id: "sofia", contact_name: "Sofia Alencar", delta: 3, reason: "Hi!! + 🔥 in new message", tier: "hot" },
  { time: "15:02", hour: 15, minute: 2, contact_id: "diego", contact_name: "Diego Alvarez", delta: 2, reason: "Partnership inbound qualified", tier: "hot" },
];

// ─── Analytics (Contacts page) ─────────────────────────────────────────────

export type AnalyticsMonth = {
  month: string; // short label "Oct"
  full: string;  // full label "October 2025"
  new_contacts: number;
  cumulative: number;
};

export const fixtureGrowth: AnalyticsMonth[] = [
  { month: "Oct", full: "October 2025", new_contacts: 18, cumulative: 155 },
  { month: "Nov", full: "November 2025", new_contacts: 24, cumulative: 179 },
  { month: "Dec", full: "December 2025", new_contacts: 22, cumulative: 201 },
  { month: "Jan", full: "January 2026", new_contacts: 31, cumulative: 232 },
  { month: "Feb", full: "February 2026", new_contacts: 28, cumulative: 260 },
  { month: "Mar", full: "March 2026", new_contacts: 35, cumulative: 295 },
  { month: "Apr", full: "April 2026 · MTD", new_contacts: 33, cumulative: 328 },
];

export type CrewActivityThisMonth = {
  crew: CrewKey;
  count: number; // items handled this month
  caption: string;
};

export const fixtureCrewActivity: CrewActivityThisMonth[] = [
  { crew: "signals", count: 284, caption: "messages classified on TG + WA" },
  { crew: "social", count: 71, caption: "DMs swept from IG, FB, X at 6am daily" },
  { crew: "inbound", count: 47, caption: "cold emails triaged" },
  { crew: "scan", count: 22, caption: "cards + voice notes filed" },
  { crew: "scribe", count: 18, caption: "recordings transcribed" },
];

export type ChannelShare = {
  channel: Channel;
  label: string;
  count: number;
  color: string;
};

export const fixtureChannelShare: ChannelShare[] = [
  { channel: "email", label: "Gmail / Email", count: 164, color: "var(--copper)" },
  { channel: "telegram", label: "Telegram", count: 128, color: "var(--teal)" },
  { channel: "social", label: "Social (IG / FB / X)", count: 49, color: "var(--indigo)" },
  { channel: "card", label: "Card scans", count: 36, color: "var(--coral)" },
];

export type TopActiveContact = {
  contact_id: string;
  name: string;
  company: string;
  initials: string;
  channel: Channel;
  warmth: number;
  interactions_this_month: number;
  last_crew: CrewKey;
};

export const fixtureAllActive: TopActiveContact[] = [
  { contact_id: "marcus", name: "Marcus Low", company: "Kite Commerce", initials: "ML", channel: "telegram", warmth: 88, interactions_this_month: 23, last_crew: "signals" },
  { contact_id: "priya", name: "Priya Raghavan", company: "Sequoia SEA", initials: "PR", channel: "telegram", warmth: 86, interactions_this_month: 19, last_crew: "signals" },
  { contact_id: "sofia", name: "Sofia Alencar", company: "Helix Tech", initials: "SA", channel: "telegram", warmth: 82, interactions_this_month: 14, last_crew: "signals" },
  { contact_id: "rashid", name: "Rashid Nahas", company: "Personal", initials: "RN", channel: "telegram", warmth: 78, interactions_this_month: 12, last_crew: "signals" },
  { contact_id: "akiko", name: "Akiko Fujimoto", company: "METI Japan", initials: "AF", channel: "email", warmth: 77, interactions_this_month: 11, last_crew: "scribe" },
  { contact_id: "diego", name: "Diego Alvarez", company: "Grupo Santander", initials: "DA", channel: "email", warmth: 76, interactions_this_month: 9, last_crew: "inbound" },
  { contact_id: "catherine", name: "Catherine Liu", company: "METI Japan", initials: "CL", channel: "email", warmth: 68, interactions_this_month: 8, last_crew: "scribe" },
  { contact_id: "theo", name: "Theo Kostas", company: "Polygon", initials: "TK", channel: "telegram", warmth: 70, interactions_this_month: 7, last_crew: "signals" },
  { contact_id: "leila", name: "Leila Okonkwo", company: "Chainalysis APAC", initials: "LO", channel: "email", warmth: 66, interactions_this_month: 7, last_crew: "inbound" },
  { contact_id: "kai", name: "Kai Jensen", company: "Seedstars SEA", initials: "KJ", channel: "social", warmth: 68, interactions_this_month: 6, last_crew: "social" },
  { contact_id: "sam", name: "Sam Harel", company: "Y Combinator", initials: "SH", channel: "email", warmth: 72, interactions_this_month: 6, last_crew: "inbound" },
  { contact_id: "akio", name: "Akio Tanaka", company: "METI Japan", initials: "AT", channel: "email", warmth: 62, interactions_this_month: 5, last_crew: "scribe" },
  { contact_id: "yuki", name: "Yuki Matsuda", company: "Freelance", initials: "YM", channel: "email", warmth: 58, interactions_this_month: 4, last_crew: "inbound" },
  { contact_id: "maria", name: "Maria Chen", company: "Growth Labs", initials: "MC", channel: "email", warmth: 58, interactions_this_month: 4, last_crew: "inbound" },
  { contact_id: "naomi", name: "Naomi Park", company: "Blockworks", initials: "NP", channel: "social", warmth: 58, interactions_this_month: 4, last_crew: "social" },
  { contact_id: "rina", name: "Rina Patel", company: "TOKEN2049", initials: "RP", channel: "email", warmth: 54, interactions_this_month: 3, last_crew: "inbound" },
  { contact_id: "ben", name: "Ben Turnbull", company: "a16z crypto", initials: "BT", channel: "email", warmth: 52, interactions_this_month: 3, last_crew: "inbound" },
  { contact_id: "oluwaseun", name: "Oluwaseun Adebayo", company: "Africa Blockchain Fund", initials: "OA", channel: "email", warmth: 48, interactions_this_month: 3, last_crew: "inbound" },
  { contact_id: "hassan", name: "Hassan Malik", company: "Breakpoint", initials: "HM", channel: "social", warmth: 42, interactions_this_month: 2, last_crew: "social" },
  { contact_id: "zhang", name: "Zhang Yu", company: "Mercury Labs", initials: "ZY", channel: "telegram", warmth: 50, interactions_this_month: 2, last_crew: "signals" },
  { contact_id: "eric", name: "Eric Tham", company: "ST Engineering", initials: "ET", channel: "email", warmth: 42, interactions_this_month: 2, last_crew: "inbound" },
  { contact_id: "karim", name: "Karim El-Masri", company: "Personal", initials: "KE", channel: "email", warmth: 40, interactions_this_month: 1, last_crew: "inbound" },
  { contact_id: "arun", name: "Arun Balaji", company: "Nova Ventures", initials: "AB", channel: "email", warmth: 38, interactions_this_month: 1, last_crew: "inbound" },
  { contact_id: "finley", name: "Finley Booker", company: "Bloomberg", initials: "FB", channel: "email", warmth: 38, interactions_this_month: 1, last_crew: "inbound" },
  { contact_id: "aria", name: "Aria Mehta", company: "Cosmic Protocol", initials: "AM", channel: "telegram", warmth: 30, interactions_this_month: 0, last_crew: "signals" },
  { contact_id: "jamal", name: "Jamal Idris", company: "Outlier Ventures", initials: "JI", channel: "email", warmth: 28, interactions_this_month: 0, last_crew: "inbound" },
  { contact_id: "daniel", name: "Daniel O'Brien", company: "Irish Tech Fund", initials: "DO", channel: "email", warmth: 25, interactions_this_month: 0, last_crew: "inbound" },
  { contact_id: "kenji", name: "Kenji Nakamura", company: "MUFG Innovation Hub", initials: "KN", channel: "email", warmth: 22, interactions_this_month: 0, last_crew: "inbound" },
  { contact_id: "wei", name: "Wei Lin Chen", company: "NodeOne", initials: "WL", channel: "telegram", warmth: 18, interactions_this_month: 0, last_crew: "signals" },
  { contact_id: "priscilla", name: "Priscilla Wang", company: "Binance APAC", initials: "PW", channel: "email", warmth: 12, interactions_this_month: 0, last_crew: "inbound" },
];

export const fixtureAnalyticsSummary = {
  total_graph: 328,
  new_this_month: 33,
  new_last_month: 35,
  active_conversations: 47, // people in hot/warm tiers right now
  dormant: 62, // cold tier
  avg_warmth: 54.3,
  drafts_sent_this_month: 89,
  drafts_staged_this_month: 106,
  events_this_month: 4,
};

// ─── Helpers ───────────────────────────────────────────────────────────────

export function crewCountsToday(): Record<CrewKey, number> {
  const base: Record<CrewKey, number> = {
    scan: 0,
    signals: 0,
    inbound: 0,
    scribe: 0,
    social: 0,
  };
  for (const a of fixtureActivityLog) base[a.crew] += 1;
  return base;
}

export function pendingDraftsCount(): number {
  return fixtureDrafts.filter((d) => !d.status || d.status === "pending").length;
}

export function latestByCrew(): Record<CrewKey, ActivityEntry | undefined> {
  const out: Partial<Record<CrewKey, ActivityEntry>> = {};
  for (const a of fixtureActivityLog) if (!out[a.crew]) out[a.crew] = a;
  return out as Record<CrewKey, ActivityEntry | undefined>;
}

export function contactsByWarmth(): FixtureContact[] {
  return [...fixtureContacts].sort((a, b) => b.warmth - a.warmth);
}

export function contactById(id: string): FixtureContact | undefined {
  return fixtureContacts.find((c) => c.id === id);
}

export function enrichmentFor(contactId: string): Enrichment | undefined {
  return fixtureEnrichments[contactId];
}

export function interactionsFor(contactId: string): Interaction[] {
  return fixtureInteractions
    .filter((i) => i.contact_id === contactId)
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}

export function warmthTimelineFor(contactId: string): WarmthPoint[] {
  return contactId === "sofia" ? fixtureSofiaTimeline : [];
}

// ─── Enterprise · portfolio / verticals / intro requests ───────────────────
// Fixture data for /app/dashboard/enterprise. Represents a Temasek-style
// parent entity overseeing a portfolio of companies, grouped by vertical.

export type Vertical = {
  slug: string;
  name: string;
  color: string; // CSS var
  portco_count: number;
  warm_contacts: number;
  active_intros: number;
};

export const fixtureVerticals: Vertical[] = [
  { slug: "fintech", name: "Fintech", color: "var(--copper)", portco_count: 8, warm_contacts: 142, active_intros: 12 },
  { slug: "enterprise-saas", name: "Enterprise SaaS", color: "var(--teal)", portco_count: 12, warm_contacts: 210, active_intros: 9 },
  { slug: "biotech", name: "Biotech", color: "var(--sage)", portco_count: 6, warm_contacts: 78, active_intros: 3 },
  { slug: "climate", name: "Climate", color: "var(--warmth-neutral)", portco_count: 4, warm_contacts: 54, active_intros: 2 },
  { slug: "deep-tech", name: "Deep Tech", color: "var(--indigo)", portco_count: 9, warm_contacts: 101, active_intros: 8 },
];

export type Portco = {
  id: string;
  name: string;
  vertical: string;
  region: string;
  total_contacts: number;
  warm_contacts: number;
  drifting: boolean;
  last_active_days: number;
  ecosystem_participation: "active" | "moderate" | "silent";
};

export const fixturePortcos: Portco[] = [
  { id: "helix", name: "Helix Tech", vertical: "enterprise-saas", region: "Singapore", total_contacts: 284, warm_contacts: 42, drifting: false, last_active_days: 0, ecosystem_participation: "active" },
  { id: "kite", name: "Kite Commerce", vertical: "fintech", region: "Singapore", total_contacts: 318, warm_contacts: 58, drifting: false, last_active_days: 1, ecosystem_participation: "active" },
  { id: "polygon-labs", name: "Polygon Labs", vertical: "fintech", region: "APAC", total_contacts: 412, warm_contacts: 67, drifting: false, last_active_days: 0, ecosystem_participation: "active" },
  { id: "santander-ops", name: "Grupo Santander", vertical: "fintech", region: "LATAM", total_contacts: 196, warm_contacts: 29, drifting: false, last_active_days: 3, ecosystem_participation: "moderate" },
  { id: "nebius-ai", name: "Nebius AI", vertical: "deep-tech", region: "EU", total_contacts: 144, warm_contacts: 31, drifting: false, last_active_days: 2, ecosystem_participation: "active" },
  { id: "seedstars", name: "Seedstars SEA", vertical: "enterprise-saas", region: "SEA", total_contacts: 256, warm_contacts: 38, drifting: false, last_active_days: 1, ecosystem_participation: "active" },
  { id: "blockworks", name: "Blockworks Media", vertical: "fintech", region: "US", total_contacts: 178, warm_contacts: 22, drifting: false, last_active_days: 4, ecosystem_participation: "moderate" },
  { id: "claritas-bio", name: "Claritas Bio", vertical: "biotech", region: "US", total_contacts: 92, warm_contacts: 14, drifting: true, last_active_days: 34, ecosystem_participation: "silent" },
  { id: "sora-climate", name: "Sora Climate", vertical: "climate", region: "Singapore", total_contacts: 68, warm_contacts: 11, drifting: false, last_active_days: 6, ecosystem_participation: "moderate" },
  { id: "atlas-robotics", name: "Atlas Robotics", vertical: "deep-tech", region: "JP", total_contacts: 124, warm_contacts: 19, drifting: true, last_active_days: 41, ecosystem_participation: "silent" },
  { id: "meridian-ai", name: "Meridian AI", vertical: "deep-tech", region: "Singapore", total_contacts: 208, warm_contacts: 36, drifting: false, last_active_days: 2, ecosystem_participation: "active" },
  { id: "verdant-bio", name: "Verdant Bio", vertical: "biotech", region: "EU", total_contacts: 74, warm_contacts: 9, drifting: true, last_active_days: 52, ecosystem_participation: "silent" },
  { id: "tidalwave", name: "Tidalwave Energy", vertical: "climate", region: "APAC", total_contacts: 51, warm_contacts: 8, drifting: false, last_active_days: 5, ecosystem_participation: "moderate" },
  { id: "orbit-trade", name: "Orbit Trade", vertical: "enterprise-saas", region: "Singapore", total_contacts: 187, warm_contacts: 27, drifting: false, last_active_days: 1, ecosystem_participation: "active" },
];

export type IntroRequestStatus = "pending_gate1" | "approved_gate1" | "pending_gate2" | "approved" | "denied" | "completed";
export type IntroRequestUrgency = "low" | "medium" | "high";

export type IntroRequest = {
  id: string;
  requester_portco_id: string;
  holder_portco_id: string;
  target_company: string;
  target_person?: string; // only visible to holder + fund admin post-approval
  purpose: string;
  vertical_match: boolean;
  urgency: IntroRequestUrgency;
  status: IntroRequestStatus;
  requested_at: string;
  reasoning: string;
};

export const fixtureIntroRequests: IntroRequest[] = [
  {
    id: "ir1",
    requester_portco_id: "kite",
    holder_portco_id: "helix",
    target_company: "Stripe",
    target_person: "Marcus Alvarez",
    purpose: "Payment rail partnership — exploring API integration for SEA corridor",
    vertical_match: true,
    urgency: "high",
    status: "pending_gate1",
    requested_at: "2026-04-24T08:14:00Z",
    reasoning: "Kite Commerce is expanding payment integrations. Helix has a warm contact at Stripe (Warmth 82). Same fintech vertical — low competitive risk. Auto-approve candidate.",
  },
  {
    id: "ir2",
    requester_portco_id: "santander-ops",
    holder_portco_id: "polygon-labs",
    target_company: "Blockworks",
    target_person: "Naomi Park",
    purpose: "Press + thought-leadership for LATAM Web3 strategy launch",
    vertical_match: true,
    urgency: "medium",
    status: "pending_gate1",
    requested_at: "2026-04-24T07:42:00Z",
    reasoning: "Santander pushing regional comms. Polygon has 3 warm Blockworks contacts. Flagged: cross-region but non-competitive. Manual review recommended.",
  },
  {
    id: "ir3",
    requester_portco_id: "seedstars",
    holder_portco_id: "helix",
    target_company: "Sequoia SEA",
    target_person: "Priya Raghavan",
    purpose: "Series B conversations — raising $12M",
    vertical_match: false,
    urgency: "high",
    status: "pending_gate1",
    requested_at: "2026-04-24T06:58:00Z",
    reasoning: "Seedstars funding round. Helix has a Sequoia SEA partner contact (Warmth 86). Cross-vertical — needs manual review. Competitive check: neither company is a current Sequoia portfolio.",
  },
  {
    id: "ir4",
    requester_portco_id: "kite",
    holder_portco_id: "santander-ops",
    target_company: "YC",
    target_person: "Sam Harel",
    purpose: "Founder referral for upcoming YC W27 batch",
    vertical_match: true,
    urgency: "low",
    status: "approved",
    requested_at: "2026-04-22T14:00:00Z",
    reasoning: "Same vertical, low stakes, founder-to-founder — auto-approved by policy. Intro draft in Santander's voice ready.",
  },
  {
    id: "ir5",
    requester_portco_id: "nebius-ai",
    holder_portco_id: "meridian-ai",
    target_company: "METI Japan",
    target_person: "Akiko Fujimoto",
    purpose: "Regulatory partnership for APAC AI deployment",
    vertical_match: true,
    urgency: "medium",
    status: "completed",
    requested_at: "2026-04-20T10:30:00Z",
    reasoning: "Same vertical, both deep-tech APAC presence, Meridian has warm METI contact (Warmth 77). Auto-approved. Intro made, meeting booked for May 2.",
  },
];

export type EcosystemActivity = {
  id: string;
  timestamp: string;
  type: "intro_requested" | "intro_approved_gate1" | "intro_approved_gate2" | "intro_sent" | "meeting_booked" | "policy_changed";
  summary: string;
};

export const fixtureEcosystemActivity: EcosystemActivity[] = [
  { id: "ea1", timestamp: "2026-04-24T08:14:00Z", type: "intro_requested", summary: "Kite → Helix · intro at Stripe (payment partnership)" },
  { id: "ea2", timestamp: "2026-04-24T07:42:00Z", type: "intro_requested", summary: "Santander → Polygon · intro at Blockworks (press)" },
  { id: "ea3", timestamp: "2026-04-24T06:58:00Z", type: "intro_requested", summary: "Seedstars → Helix · intro at Sequoia SEA (fundraise)" },
  { id: "ea4", timestamp: "2026-04-23T16:22:00Z", type: "meeting_booked", summary: "Nebius × METI (Akiko Fujimoto) · May 2, Tokyo" },
  { id: "ea5", timestamp: "2026-04-23T14:08:00Z", type: "intro_sent", summary: "Meridian drafted intro for Nebius → Akiko Fujimoto" },
  { id: "ea6", timestamp: "2026-04-23T11:45:00Z", type: "intro_approved_gate2", summary: "Meridian approved Gate 2 · intro to METI Japan" },
  { id: "ea7", timestamp: "2026-04-23T09:30:00Z", type: "intro_approved_gate1", summary: "Fund admin approved Nebius → Meridian (regulatory partnership)" },
  { id: "ea8", timestamp: "2026-04-22T14:00:00Z", type: "intro_approved_gate1", summary: "Auto-approved · Kite → Santander · YC referral" },
];

export type EcosystemSummary = {
  portco_count: number;
  vertical_count: number;
  total_warm_contacts: number;
  active_intros_this_quarter: number;
  ecosystem_roi_usd_formatted: string;
  intros_approved_this_quarter: number;
  partnerships_formed: number;
  drifting_portcos: number;
};

export const fixtureEcosystemSummary: EcosystemSummary = {
  portco_count: 14,
  vertical_count: 5,
  total_warm_contacts: 2847,
  active_intros_this_quarter: 34,
  ecosystem_roi_usd_formatted: "$2.1M ARR influence",
  intros_approved_this_quarter: 147,
  partnerships_formed: 34,
  drifting_portcos: 3,
};

export type GovernanceRule = {
  category: "auto_approve" | "manual_review" | "hard_block";
  description: string;
};

export const fixtureGovernanceRules: GovernanceRule[] = [
  { category: "auto_approve", description: "Same-vertical intros between active portcos" },
  { category: "auto_approve", description: "Founder-to-founder introductions within verticals" },
  { category: "auto_approve", description: "Non-competitive low-stakes asks (press, hiring, advice)" },
  { category: "manual_review", description: "Cross-vertical introductions" },
  { category: "manual_review", description: "Partnership, customer, or investment requests" },
  { category: "manual_review", description: "Asks involving portcos above $50M revenue" },
  { category: "hard_block", description: "Competing portcos in the same product category" },
  { category: "hard_block", description: "Compliance-restricted combinations (banking ↔ gambling)" },
  { category: "hard_block", description: "Legal-flagged companies on the exclusion list" },
];

// ─── Teams — fixture teammates ─────────────────────────────────────────────

export type Teammate = {
  id: string;
  name: string;
  initials: string;
  role: string;
  region: string;
  avatar_color: string; // CSS var
  drafts_today: number;
  last_active_relative: string;
  warmth_sparkline: number[];
};

export const fixtureTeammates: Teammate[] = [
  {
    id: "freddy",
    name: "Freddy Lim",
    initials: "FL",
    role: "Founder · Partnerships lead",
    region: "Singapore",
    avatar_color: "var(--indigo)",
    drafts_today: 5,
    last_active_relative: "now",
    warmth_sparkline: [62, 64, 61, 66, 68, 65, 70, 72, 71, 74],
  },
  {
    id: "sarah",
    name: "Sarah Chen",
    initials: "SC",
    role: "BD · Tokyo",
    region: "Japan",
    avatar_color: "var(--teal)",
    drafts_today: 3,
    last_active_relative: "12m",
    warmth_sparkline: [58, 60, 62, 61, 64, 66, 63, 65, 68, 70],
  },
  {
    id: "ahmed",
    name: "Ahmed Khan",
    initials: "AK",
    role: "BD · SEA",
    region: "Dubai/Singapore",
    avatar_color: "var(--copper)",
    drafts_today: 2,
    last_active_relative: "1h",
    warmth_sparkline: [52, 55, 58, 56, 60, 62, 59, 61, 63, 66],
  },
  {
    id: "mira",
    name: "Mira Patel",
    initials: "MP",
    role: "Community · Growth",
    region: "Singapore",
    avatar_color: "var(--sage)",
    drafts_today: 4,
    last_active_relative: "3h",
    warmth_sparkline: [48, 50, 53, 51, 55, 58, 56, 60, 62, 64],
  },
];

export const fixtureSharedGraphStats = {
  total_contacts: 847,
  warm: 156,
  today_interactions: 23,
  drifting_30d: 12,
};

// Helper: portcos grouped by vertical
export function portcosByVertical(): Record<string, Portco[]> {
  const grouped: Record<string, Portco[]> = {};
  for (const p of fixturePortcos) {
    if (!grouped[p.vertical]) grouped[p.vertical] = [];
    grouped[p.vertical].push(p);
  }
  return grouped;
}

export function portcoById(id: string): Portco | undefined {
  return fixturePortcos.find((p) => p.id === id);
}

export function pendingIntroRequests(): IntroRequest[] {
  return fixtureIntroRequests.filter((r) => r.status === "pending_gate1");
}

// ─── Secret Signals — the IP surfaced as user-editable rules ──────────────
// The 11 behavioural signal categories from CLAUDE.md §5. Each rule has a
// condition (what Claude looks for) and a delta (what it adds/subtracts to
// Warmth). Users can add, edit, delete, and scope by channel.

export type SignalCategory =
  | "punctuation"
  | "greeting"
  | "emoji"
  | "response_time"
  | "length"
  | "channel"
  | "timing"
  | "silence"
  | "event_proximity"
  | "voice"
  | "social";

export type SignalScope = "all" | Channel;

export type SecretSignalRule = {
  id: string;
  category: SignalCategory;
  condition: string;
  delta: number;
  scope: SignalScope;
  active: boolean;
  is_default?: boolean; // shipped with Connect Crew (informational only — user can edit / delete)
  /** Preset reply that fires when this signal matches. Empty = Claude drafts dynamically. */
  reply_template?: string;
};

// Label per category — used in the UI panel
export const SIGNAL_CATEGORY_LABEL: Record<SignalCategory, string> = {
  punctuation: "Punctuation",
  greeting: "Greeting style",
  emoji: "Emoji usage",
  response_time: "Response time",
  length: "Length + effort",
  channel: "Channel choice",
  timing: "Timing",
  silence: "Meta silence",
  event_proximity: "Event proximity",
  voice: "Voice / call",
  social: "Public social",
};

export const fixtureSecretSignals: SecretSignalRule[] = [
  // ─── Messenger (Telegram / WhatsApp) keyword triggers ───
  // Each trigger is the literal inbound text. Replies are presets the
  // user can edit inline; leave blank and Claude drafts dynamically.
  {
    id: "sig-msg-hi2",
    category: "punctuation",
    condition: "Hi!!",
    delta: 6,
    scope: "telegram",
    active: true,
    reply_template:
      "Hey! 🔥 Great to hear from you — let's make time this week. What does Thursday or Friday look like for you?\n\nFreddy",
  },
  {
    id: "sig-msg-hi1",
    category: "punctuation",
    condition: "Hi!",
    delta: 3,
    scope: "telegram",
    active: true,
    reply_template:
      "Hi! Great to hear from you. Happy to chat more — what did you have in mind?\n\nFreddy",
  },
  {
    id: "sig-msg-hi0",
    category: "punctuation",
    condition: "Hi",
    delta: 1,
    scope: "telegram",
    active: true,
    reply_template:
      "Hi — thanks for reaching out. What can I help with?\n\nFreddy",
  },
  {
    id: "sig-msg-hidots",
    category: "punctuation",
    condition: "Hi...",
    delta: -2,
    scope: "telegram",
    active: true,
    reply_template: "",
  },

  // ─── Social Media — three cue triggers, each with a preset reply ───
  // Per user: just Hi / Hi! / Hi!! for Social. Cold → very warm.
  {
    id: "sig-soc-hi0",
    category: "punctuation",
    condition: "Hi",
    delta: 0,
    scope: "social",
    active: true,
    reply_template:
      "Hi there. Thanks for reaching out — I don't think we've connected before. What can I help with?",
  },
  {
    id: "sig-soc-hi1",
    category: "punctuation",
    condition: "Hi!",
    delta: 3,
    scope: "social",
    active: true,
    reply_template:
      "Hi! Great to hear from you. What's on your mind? Happy to chat more.",
  },
  {
    id: "sig-soc-hi2",
    category: "punctuation",
    condition: "Hi!!",
    delta: 6,
    scope: "social",
    active: true,
    reply_template:
      "Hi! 🙌 Awesome to hear from you — let's jump on a quick call this week. Which day works for you?",
  },
];

export function secretSignalsForScope(scope: SignalScope): SecretSignalRule[] {
  if (scope === "all") return fixtureSecretSignals;
  return fixtureSecretSignals.filter(
    (r) => r.scope === scope || r.scope === "all",
  );
}
