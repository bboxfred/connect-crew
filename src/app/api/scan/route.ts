/**
 * POST /api/scan — the Scanner pipeline endpoint.
 *
 * Accepts a card image (as a base64 data URL) and optional "where did we
 * meet?" context. Runs:
 *   1. Claude Vision → structured card fields
 *   2. Claude web search → public-web company enrichment (graceful skip
 *      on failure — Plan B after Genspark's REST API turned out not to
 *      exist publicly; see claude-websearch.ts for the full context)
 *   3. Supabase insert into `contacts` (warmth = 50)
 *   4. If email present: Claude drafts a warm follow-up → Composio stages
 *      it in Gmail Drafts → Supabase insert into `drafts`
 *
 * Returns the resulting contact + enrichment + draft + a flat array of
 * step labels the client replays into the side panel.
 *
 * Runtime: nodejs (we need @composio/core + Anthropic SDK + Supabase full
 * client — none of which target the Edge runtime cleanly).
 */

import { extractCardFields, countExtractedFields } from "@/lib/claude-vision";
import type { CardExtract } from "@/lib/claude-vision";
import { researchCompany } from "@/lib/claude-websearch";
import type { CompanyResearch } from "@/lib/claude-websearch";
import { draftScannerFollowup } from "@/lib/claude-draft";
import { createGmailDraft } from "@/lib/composio";
import { supabaseServer } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 30;

type ScanResponse = {
  ok: true;
  contact: {
    id: string;
    name: string;
    title: string | null;
    company: string | null;
    email: string | null;
    phone: string | null;
    linkedin: string | null;
    telegram_handle: string | null;
    warmth_index: number;
    met_at: string | null;
  };
  enrichment: CompanyResearch;
  extract: {
    confidence: CardExtract["confidence"];
    found: number;
    total: number;
  };
  draft:
    | {
        status: "created";
        id: string;
        subject: string;
        body: string;
        gmail_url: string | null;
        reasoning: string;
      }
    | {
        status: "skipped";
        reason: string;
      };
  steps: string[];
};

type ScanError = {
  ok: false;
  error: string;
  steps: string[];
};

export async function POST(req: Request): Promise<Response> {
  const steps: string[] = [];

  let body: { imageDataUrl?: string; metContext?: string | null };
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { ok: false, error: "Body must be JSON.", steps },
      { status: 400 },
    );
  }

  const imageDataUrl = body.imageDataUrl;
  const metContext = body.metContext?.trim() || null;

  if (!imageDataUrl || typeof imageDataUrl !== "string") {
    return Response.json(
      { ok: false, error: "imageDataUrl is required.", steps },
      { status: 400 },
    );
  }

  // ── Step 1: Claude Vision ────────────────────────────────────────────
  let extract: CardExtract;
  try {
    steps.push("Claude reading card image");
    extract = await extractCardFields(imageDataUrl);
    const { found, total } = countExtractedFields(extract);
    steps.push(
      `Claude extracted ${found}/${total} fields · confidence ${extract.confidence}`,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Vision call failed.";
    console.error("[/api/scan] claude vision failed:", err);
    steps.push(`Claude vision failed: ${msg}`);
    return Response.json(
      {
        ok: false,
        error: msg,
        steps,
      } satisfies ScanError,
      { status: 422 },
    );
  }

  if (!extract.name || extract.confidence === "low") {
    // Not a usable card — let the UI fall back to manual entry.
    const reason =
      !extract.name ? "no recognisable name on card" : "low confidence on all fields";
    steps.push(`Needs manual entry: ${reason}`);
    return Response.json(
      {
        ok: false,
        error: `Couldn't read this card clearly (${reason}).`,
        steps,
      } satisfies ScanError,
      { status: 422 },
    );
  }

  // ── Step 2: Claude web search enrichment (best-effort) ───────────────
  steps.push(
    extract.company
      ? `Claude searching the web for ${extract.company}`
      : "Web research skipped — no company on card",
  );
  const enrichment = await researchCompany({
    name: extract.name,
    company: extract.company,
    website: extract.website,
    twitter: extract.twitter,
  });
  if (enrichment.status === "ok") {
    const srcNote =
      enrichment.sources_cited.length > 0
        ? ` · ${enrichment.sources_cited.slice(0, 3).join(", ")}`
        : "";
    steps.push(`Claude returned enrichment${srcNote}`);
  } else {
    steps.push(`Web research skipped: ${enrichment.reason}`);
  }

  // ── Step 3: Supabase insert contact ──────────────────────────────────
  steps.push(`Filing ${extract.name} in your graph`);
  const sb = supabaseServer();

  const contactRow = {
    // user_id left null for the single-user demo — multi-tenant wiring
    // lands in Phase 3B / post-hackathon.
    name: extract.name,
    title: extract.title,
    company: extract.company,
    email: extract.email,
    phone: extract.phone,
    linkedin: extract.linkedin,
    telegram_handle: extract.telegram,
    met_at: metContext,
    met_date: null as string | null,
    notes: extract.notes,
    warmth_index: 50, // neutral, never-interacted default
    enrichment:
      enrichment.status === "ok"
        ? {
            company_summary: enrichment.company_summary,
            sources_cited: enrichment.sources_cited,
            source: "claude_web_search",
          }
        : {
            status: "skipped",
            reason: enrichment.reason,
          },
  };

  const { data: contact, error: insertError } = await sb
    .from("contacts")
    .insert(contactRow)
    .select(
      "id, name, title, company, email, phone, linkedin, telegram_handle, warmth_index, met_at",
    )
    .single();

  if (insertError || !contact) {
    const msg = insertError?.message ?? "Supabase insert failed.";
    console.error("[/api/scan] supabase contact insert failed:", insertError);
    steps.push(`Supabase insert failed: ${msg}`);
    return Response.json(
      { ok: false, error: msg, steps } satisfies ScanError,
      { status: 500 },
    );
  }

  steps.push(
    `Filed ${contact.name}${contact.company ? ` at ${contact.company}` : ""} · warmth 50`,
  );

  // ── Step 4: Gmail draft (only if we have an email) ────────────────────
  let draftOut: ScanResponse["draft"];
  if (!extract.email) {
    steps.push("Skipping draft — no email on card");
    draftOut = { status: "skipped", reason: "no email on card" };
  } else {
    try {
      steps.push("Claude drafting a warm follow-up");
      const written = await draftScannerFollowup({
        contact: extract,
        metContext,
        userName: process.env.DEMO_USER_NAME ?? "Freddy",
      });

      steps.push("Composio staging draft in Gmail");
      const gmail = await createGmailDraft({
        to: extract.email,
        subject: written.subject,
        body: written.body,
      });

      steps.push("Adding draft to Morning Connect");
      const { data: draftRow, error: draftError } = await sb
        .from("drafts")
        .insert({
          contact_id: contact.id,
          channel: "gmail",
          draft_content: written.body,
          reasoning: `${written.reasoning} · Gmail draft ${gmail.draft_id}`,
          status: "pending",
        })
        .select("id")
        .single();

      if (draftError || !draftRow) {
        // Gmail draft already exists — don't fail. Just note the Supabase miss.
        steps.push(
          `Saved to Gmail but Supabase draft row failed: ${draftError?.message ?? "unknown"}`,
        );
        draftOut = {
          status: "created",
          id: gmail.draft_id,
          subject: written.subject,
          body: written.body,
          gmail_url: gmail.gmail_url,
          reasoning: written.reasoning,
        };
      } else {
        draftOut = {
          status: "created",
          id: draftRow.id,
          subject: written.subject,
          body: written.body,
          gmail_url: gmail.gmail_url,
          reasoning: written.reasoning,
        };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Draft step failed.";
      console.error("[/api/scan] draft step failed:", err);
      steps.push(`Draft step skipped: ${msg}`);
      draftOut = { status: "skipped", reason: msg };
    }
  }

  const { found, total } = countExtractedFields(extract);

  const payload: ScanResponse = {
    ok: true,
    contact,
    enrichment,
    extract: { confidence: extract.confidence, found, total },
    draft: draftOut,
    steps,
  };

  return Response.json(payload);
}
