/**
 * GET /api/drafts/live
 *
 * Returns all pending drafts from Supabase, joined with their contact
 * record for display in Morning Connect. Drafts are merged with the
 * fixture drafts client-side — live drafts get a "just drafted" badge.
 *
 * Parses the jsonb-as-string `drafts.reasoning` column into its structured
 * shape (drafter reasoning + calibration trace + classifier reasoning +
 * signals detected + gmail_url + external_id).
 */

import { supabaseServer } from "@/lib/supabase";

export const runtime = "nodejs";

export type LiveDraftReasoning = {
  reasoning?: string;
  calibration_trace?: string[];
  classifier_reasoning?: string;
  signals_detected?: string[];
  classifier_tier?: string;
  subject?: string | null;
  gmail_url?: string | null;
  external_id?: string | null;
  source?: string;
};

export type LiveDraft = {
  id: string;
  contact_id: string | null;
  channel: string | null;
  draft_content: string;
  status: string;
  created_at: string;
  reasoning: LiveDraftReasoning;
  contact: {
    id: string;
    name: string | null;
    company: string | null;
    warmth_index: number | null;
    telegram_handle: string | null;
    email: string | null;
  } | null;
};

type DraftRow = {
  id: string;
  contact_id: string | null;
  channel: string | null;
  draft_content: string | null;
  reasoning: string | null;
  status: string | null;
  created_at: string;
};

type ContactRow = {
  id: string;
  name: string | null;
  company: string | null;
  warmth_index: number | null;
  telegram_handle: string | null;
  email: string | null;
};

export async function GET(): Promise<Response> {
  try {
    const sb = supabaseServer();

    const { data: drafts, error: draftsError } = await sb
      .from("drafts")
      .select("id, contact_id, channel, draft_content, reasoning, status, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(50);

    if (draftsError) {
      console.error("[/api/drafts/live] drafts select failed:", draftsError);
      return Response.json(
        { ok: false, error: draftsError.message },
        { status: 500 },
      );
    }

    const rows = (drafts ?? []) as DraftRow[];
    if (rows.length === 0) {
      return Response.json({ ok: true, drafts: [] });
    }

    const contactIds = Array.from(
      new Set(rows.map((r) => r.contact_id).filter(Boolean) as string[]),
    );

    const contactsById = new Map<string, ContactRow>();
    if (contactIds.length > 0) {
      const { data: contactRows } = await sb
        .from("contacts")
        .select("id, name, company, warmth_index, telegram_handle, email")
        .in("id", contactIds);
      for (const c of (contactRows ?? []) as ContactRow[]) {
        contactsById.set(c.id, c);
      }
    }

    const live: LiveDraft[] = rows.map((r) => {
      let parsed: LiveDraftReasoning = {};
      if (r.reasoning) {
        try {
          parsed = JSON.parse(r.reasoning) as LiveDraftReasoning;
        } catch {
          // Legacy rows (Scanner etc.) may have plain-text reasoning.
          parsed = { reasoning: r.reasoning };
        }
      }
      return {
        id: r.id,
        contact_id: r.contact_id,
        channel: r.channel,
        draft_content: r.draft_content ?? "",
        status: r.status ?? "pending",
        created_at: r.created_at,
        reasoning: parsed,
        contact: r.contact_id ? contactsById.get(r.contact_id) ?? null : null,
      };
    });

    return Response.json({ ok: true, drafts: live });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    console.error("[/api/drafts/live] handler failed:", err);
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
