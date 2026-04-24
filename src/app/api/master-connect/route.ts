import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import {
  fixtureContacts,
  fixtureInteractions,
  fixtureTeammates,
  fixturePortcos,
  fixtureVerticals,
} from "@/lib/fixtures";
import type { ViewMode as Mode } from "@/components/view-mode-provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── Master Connect API ───────────────────────────────────────────────────
// POST { query: string, mode: "personal" | "teams" | "enterprise" }
//
// Passes a structured, mode-filtered graph context + the user's query to
// Claude Opus 4.7. Asks for ranked candidates with reasoning. Returns the
// parsed JSON payload.

type MasterConnectRequestBody = {
  query: string;
  mode?: Mode;
};

type Candidate = {
  contact_id: string | null;
  name: string;
  company: string;
  warmth_score: number | null;
  owner: string;
  last_interaction: string | null;
  why: string;
  suggested_action: "draft_intro" | "re_engage" | "review" | "none";
};

type MasterConnectResponse = {
  summary: string;
  candidates: Candidate[];
  reasoning: string;
  omitted_red: number;
  mode: Mode;
  elapsed_ms: number;
};

export async function POST(req: Request) {
  const started = Date.now();

  let body: MasterConnectRequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Invalid JSON body.");
  }

  const query = (body?.query || "").trim();
  const mode: Mode = body?.mode && ["personal", "teams", "enterprise"].includes(body.mode)
    ? body.mode
    : "personal";

  if (!query) {
    return jsonError(400, "Query is required.");
  }

  // Build context scoped to the active view mode.
  const context = buildGraphContext(mode);

  try {
    const resp = await anthropic().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1500,
      system: systemPrompt(mode),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `QUERY: ${query}\n\nGRAPH CONTEXT:\n${JSON.stringify(context, null, 2)}`,
            },
          ],
        },
      ],
    });

    const raw = resp.content
      .map((block) =>
        block.type === "text" && "text" in block ? block.text : "",
      )
      .join("\n")
      .trim();

    const parsed = safeParseJson(raw);

    if (!parsed) {
      return Response.json(
        {
          summary: "Claude returned an unstructured response. Check server logs.",
          candidates: [],
          reasoning: raw.slice(0, 500),
          omitted_red: 0,
          mode,
          elapsed_ms: Date.now() - started,
        } satisfies MasterConnectResponse,
        { status: 200 },
      );
    }

    const payload: MasterConnectResponse = {
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      candidates: Array.isArray(parsed.candidates) ? parsed.candidates.slice(0, 10) : [],
      reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : "",
      omitted_red: typeof parsed.omitted_red === "number" ? parsed.omitted_red : 0,
      mode,
      elapsed_ms: Date.now() - started,
    };

    return Response.json(payload, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    return Response.json(
      {
        summary: "Master Connect failed to call Claude.",
        candidates: [],
        reasoning: message,
        omitted_red: 0,
        mode,
        elapsed_ms: Date.now() - started,
      } satisfies MasterConnectResponse,
      { status: 500 },
    );
  }
}

// ─── helpers ──────────────────────────────────────────────────────────────

function jsonError(status: number, message: string) {
  return Response.json({ error: message }, { status });
}

function safeParseJson(raw: string): Record<string, unknown> | null {
  // Claude sometimes wraps JSON in ```json fences — strip them.
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to find the first `{` and last `}` as a fallback
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

// Build a compact JSON context of the graph scoped to the mode. Keeps token
// usage low and answers targeted.
function buildGraphContext(mode: Mode) {
  if (mode === "enterprise") {
    return {
      scope: "ecosystem_directory",
      parent_entity: "Temasek",
      verticals: fixtureVerticals,
      portcos: fixturePortcos.map((p) => ({
        id: p.id,
        name: p.name,
        vertical: p.vertical,
        region: p.region,
        warm_contacts: p.warm_contacts,
        total_contacts: p.total_contacts,
        drifting: p.drifting,
        participation: p.ecosystem_participation,
      })),
      directory_note:
        "Fund admin sees metadata only — individual contacts are NOT visible. Queries return portco candidates + aggregate shapes of their relationships. The two-gate intro flow is how contacts actually get shared.",
    };
  }

  // Personal + Teams both reason over the contact-level graph.
  const contacts = fixtureContacts.map((c) => ({
    id: c.id,
    name: c.name,
    title: c.title,
    company: c.company,
    warmth_score: c.warmth,
    signals: c.signals,
    org_tags: c.org_tags,
    last_contact_relative: c.last_contact,
    met_at: c.met_at,
    channel: c.channel,
    autonomy: c.autonomy,
    last_crew: c.last_crew,
    // Owner: for Teams mode we fan out ownership across teammates by a stable
    // deterministic split. Personal mode attributes everything to Freddy.
    owner:
      mode === "teams"
        ? ["freddy", "sarah", "ahmed", "mira"][
            hashToIndex(c.id, fixtureTeammates.length)
          ]
        : "freddy",
  }));

  const interactions = fixtureInteractions.slice(0, 40).map((i) => ({
    contact_id: i.contact_id,
    channel: i.channel,
    direction: i.direction,
    timestamp: i.timestamp,
    day_label: i.day_label,
    kind: i.kind,
    preview: i.preview,
  }));

  return {
    scope: mode === "teams" ? "shared_team_graph" : "personal_graph",
    user: { id: "freddy", name: "Freddy Lim" },
    teammates:
      mode === "teams"
        ? fixtureTeammates.map((t) => ({ id: t.id, name: t.name, role: t.role }))
        : undefined,
    contacts,
    recent_interactions: interactions,
  };
}

// Simple deterministic bucket hash so the same contact always maps to the
// same teammate in demo data.
function hashToIndex(key: string, modulo: number): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return Math.abs(h) % modulo;
}

function systemPrompt(mode: Mode): string {
  const scopeNote =
    mode === "enterprise"
      ? `SCOPE: fund admin / enterprise view. You are answering for Temasek-style oversight.
You see ONLY portco-level metadata — NEVER individual contacts. Rank PORTCOS that could
facilitate an intro based on aggregate warmth, vertical match, and participation health.
Every answer must reinforce the two-gate flow: Temasek approves → portco decides.`
      : mode === "teams"
        ? `SCOPE: shared team graph (Freddy + Sarah + Ahmed + Mira). Contacts may be owned
by any teammate. Surface cross-teammate matches aggressively — that's the product's value.`
        : `SCOPE: Freddy's personal graph. Contacts owned by Freddy only.`;

  return `You are Master Connect, the Chief of the Connect Crew. You answer natural-language
questions about a relationship graph.

${scopeNote}

RULES:
- Rank candidates by relevance to the query
- For each candidate, include a one-sentence "why" grounded in the graph data
- Never hallucinate contacts or relationships that aren't in the input
- If no strong matches exist, say so honestly — do not invent
- Respect Red-tier autonomy: contacts marked autonomy="red" are omitted from
  suggestions; count them and surface the count in omitted_red
- Prioritise: (1) high warmth_score · (2) recent interaction · (3) org_tags match ·
  (4) company match · (5) signal patterns (Hi!! etc)
- Keep the summary to ONE sentence. Keep reasoning to 2-3 sentences max.
- Return 3-8 candidates — quality over quantity

OUTPUT: a single JSON object, no prose before or after, no markdown fences. Shape:

{
  "summary": "one-sentence answer to the query",
  "candidates": [
    {
      "contact_id": "string or null (use portco id in enterprise mode)",
      "name": "full contact/portco name",
      "company": "company (or vertical for portcos)",
      "warmth_score": <number or null>,
      "owner": "freddy | sarah | ahmed | mira  (or portco id in enterprise mode)",
      "last_interaction": "relative-time string or null",
      "why": "one-sentence rationale",
      "suggested_action": "draft_intro | re_engage | review | none"
    }
  ],
  "reasoning": "2-3 sentences on how you ranked",
  "omitted_red": <integer>
}`;
}
