/**
 * Claude web-search enrichment — Plan B after Genspark's REST API
 * turned out not to exist publicly (DNS for api.genspark.ai returns
 * no answer; www.genspark.ai/api/* is a FastAPI backend with no
 * documented public paths). Rolled on April 24 morning.
 *
 * Uses Anthropic's built-in `web_search_20260209` server tool:
 * Anthropic runs the search internally and Claude returns a cited
 * summary. Same user-visible outcome as Genspark — Claude researches
 * the company from public web, panel shows the step log, contact
 * lands enriched.
 *
 * LinkedIn is blocked via `blocked_domains` — matches the original
 * policy from CLAUDE.md §3.
 *
 * Budget: Claude handles its own max_uses cap (5 searches). If the
 * whole call fails, the caller gracefully skips — enrichment is
 * additive, never required.
 */

import type { Anthropic } from "@anthropic-ai/sdk";
import { anthropic, CLAUDE_MODEL } from "./anthropic";

export type CompanyResearch =
  | {
      status: "ok";
      company_summary: string;
      sources_cited: string[];
    }
  | {
      status: "skipped";
      reason: string;
    };

const WEB_SEARCH_TOOL: Anthropic.Messages.WebSearchTool20260209 = {
  type: "web_search_20260209",
  name: "web_search",
  max_uses: 5,
  blocked_domains: ["linkedin.com", "www.linkedin.com"],
};

export async function researchCompany(input: {
  name: string;
  company: string | null;
  website?: string | null;
  twitter?: string | null;
}): Promise<CompanyResearch> {
  if (!input.company) {
    return { status: "skipped", reason: "no company on card" };
  }

  const prompt = [
    `Research the following company on the public web for a CRM contact record.`,
    ``,
    `Person: ${input.name}`,
    `Company: ${input.company}`,
    input.website ? `Company website: ${input.website}` : null,
    input.twitter ? `Person X/Twitter: @${input.twitter}` : null,
    ``,
    `Return a concise 3-4 sentence summary covering:`,
    `  (1) what the company does,`,
    `  (2) funding stage + most recent round if known,`,
    `  (3) approximate team size if known,`,
    `  (4) any notable press from the last 90 days.`,
    ``,
    `Prioritize Crunchbase, the company's own website, press articles, and public X/Twitter.`,
    `LinkedIn is blocked — don't attempt it.`,
    ``,
    `If public sources don't cover this company, say so in one plain sentence instead of padding.`,
    `Do not include a preamble like "Here is the summary" — just return the summary directly.`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const ant = anthropic();
    const response = await ant.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      tools: [WEB_SEARCH_TOOL],
      messages: [{ role: "user", content: prompt }],
    });

    const textBlocks = response.content.filter(
      (b): b is Anthropic.Messages.TextBlock => b.type === "text",
    );

    const summary = textBlocks
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (!summary) {
      return { status: "skipped", reason: "empty response from Claude" };
    }

    const hostnames = new Set<string>();
    for (const block of textBlocks) {
      const citations = block.citations ?? [];
      for (const cit of citations) {
        if (cit.type !== "web_search_result_location") continue;
        const url = (cit as { url?: string }).url;
        if (!url) continue;
        try {
          hostnames.add(new URL(url).hostname.replace(/^www\./, ""));
        } catch {
          // ignore malformed URLs
        }
      }
    }

    return {
      status: "ok",
      company_summary: summary,
      sources_cited: [...hostnames],
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "web search failed";
    console.error("[claude-websearch] researchCompany failed:", err);
    return { status: "skipped", reason };
  }
}
