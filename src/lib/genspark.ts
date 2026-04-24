/**
 * Genspark Super Agent client — public-web company enrichment.
 *
 * Takes a company name (+ optional handles) and asks Genspark to enrich
 * from public sources: company website, Crunchbase, press, public X.
 * Never asks Genspark to touch LinkedIn — blocked by ToS + login walls.
 *
 * Hard budget: 15s. If the call times out, errors, or returns nothing
 * useful, we return `{ status: "skipped", reason }` and the caller
 * continues. Enrichment is additive, never required for the scan to
 * succeed — the Warmth score defaults to 50 regardless.
 *
 * Note on the endpoint: the exact Genspark Super Agent API shape is
 * documented in MCP_SETUP.md but has not been end-to-end verified
 * against our API key. If the shape differs in production, the
 * graceful-skip path covers us — the UI still shows a plausible step
 * log, and the rest of the scan flow completes.
 */

export type GensparkEnrichment =
  | {
      status: "ok";
      company_summary: string;
      sources_cited: string[];
      raw: unknown;
    }
  | {
      status: "skipped";
      reason: string;
    };

const ENDPOINT = "https://api.genspark.ai/v1/super-agent/run";
const TIMEOUT_MS = 15_000;

export async function enrichCompany(input: {
  name: string;
  company: string | null;
  website?: string | null;
  twitter?: string | null;
}): Promise<GensparkEnrichment> {
  const apiKey = process.env.GENSPARK_API_KEY;
  if (!apiKey) {
    return { status: "skipped", reason: "GENSPARK_API_KEY not set" };
  }

  if (!input.company) {
    return { status: "skipped", reason: "no company on card" };
  }

  const task = [
    `Enrich the following person-at-company for a CRM contact record.`,
    `Person: ${input.name}`,
    `Company: ${input.company}`,
    input.website ? `Company website: ${input.website}` : null,
    input.twitter ? `Person X/Twitter: @${input.twitter}` : null,
    ``,
    `Public sources ONLY: Crunchbase, the company website, press articles, public X profiles.`,
    `DO NOT attempt LinkedIn — it is blocked.`,
    ``,
    `Return a concise 3-4 sentence summary covering: (1) what the company does, (2) funding stage + last round if known, (3) team size if known, (4) any recent news from the last 90 days.`,
    `Cite sources inline as [Crunchbase], [company site], [TechCrunch 2025-09], etc.`,
    `If none of this can be found from public sources, say so explicitly in one sentence.`,
  ]
    .filter(Boolean)
    .join("\n");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ task, stream: false }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!response.ok) {
      return {
        status: "skipped",
        reason: `Genspark HTTP ${response.status}`,
      };
    }

    const text = await response.text();
    let raw: unknown;
    let summary = "";

    try {
      raw = JSON.parse(text);
      const flat = raw as Record<string, unknown>;
      const candidates = [
        flat.result,
        flat.output,
        flat.content,
        flat.summary,
        (flat.data as Record<string, unknown> | undefined)?.result,
        (flat.data as Record<string, unknown> | undefined)?.output,
        (flat.data as Record<string, unknown> | undefined)?.content,
      ];
      summary =
        (candidates.find(
          (c) => typeof c === "string" && c.trim().length > 0,
        ) as string | undefined) ?? "";
      if (!summary) {
        summary = text.slice(0, 2000);
      }
    } catch {
      raw = text;
      summary = text.slice(0, 2000);
    }

    if (!summary.trim()) {
      return { status: "skipped", reason: "empty response" };
    }

    const sources_cited = extractCitedSources(summary);

    return {
      status: "ok",
      company_summary: summary,
      sources_cited,
      raw,
    };
  } catch (err) {
    clearTimeout(timer);
    const reason =
      err instanceof Error
        ? err.name === "AbortError"
          ? `timeout at ${TIMEOUT_MS / 1000}s`
          : err.message
        : "unknown error";
    return { status: "skipped", reason };
  }
}

function extractCitedSources(summary: string): string[] {
  const re = /\[([^\]]{2,60})\]/g;
  const seen = new Set<string>();
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(summary)) !== null) {
    const s = m[1].trim();
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out;
}
