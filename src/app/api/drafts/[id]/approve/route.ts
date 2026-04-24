/**
 * POST /api/drafts/[id]/approve
 *
 * Mark a draft approved + actually send it.
 *
 *   - channel=telegram → Telegram Bot API sendMessage to chat_id
 *     (stored in contact.enrichment.telegram_chat_id during the
 *      inbound webhook).
 *   - channel=gmail    → best-effort Composio GMAIL_SEND_DRAFT if we
 *     staged a draft and have its external_id. Graceful skip if not —
 *     the Gmail draft still exists for the user to send manually.
 *
 * Either way we insert an outbound `interactions` row + flip the draft
 * row's status to "approved". The UI renders an optimistic success on
 * approve, so worst case the send fails silently and the user checks
 * Gmail to confirm.
 */

import { supabaseServer } from "@/lib/supabase";
import { Composio } from "@composio/core";

export const runtime = "nodejs";
export const maxDuration = 30;

type DraftRow = {
  id: string;
  contact_id: string | null;
  channel: string | null;
  draft_content: string | null;
  reasoning: string | null;
  status: string | null;
};

type ContactRow = {
  id: string;
  name: string | null;
  email: string | null;
  telegram_handle: string | null;
  enrichment: Record<string, unknown> | null;
};

type ReasoningBlob = {
  subject?: string | null;
  gmail_url?: string | null;
  external_id?: string | null;
  calibration_trace?: string[];
};

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;

  if (!id) {
    return Response.json(
      { ok: false, error: "draft id required" },
      { status: 400 },
    );
  }

  const sb = supabaseServer();

  // ── Fetch draft ─────────────────────────────────────────────────────
  const { data: draft, error: draftError } = await sb
    .from("drafts")
    .select("id, contact_id, channel, draft_content, reasoning, status")
    .eq("id", id)
    .maybeSingle();

  if (draftError || !draft) {
    const msg = draftError?.message ?? "draft not found";
    return Response.json({ ok: false, error: msg }, { status: 404 });
  }

  const row = draft as DraftRow;
  if (row.status === "approved" || row.status === "sent") {
    return Response.json({
      ok: true,
      status: row.status,
      note: "already approved",
    });
  }

  if (!row.draft_content || !row.contact_id) {
    return Response.json(
      { ok: false, error: "draft is missing content or contact_id" },
      { status: 400 },
    );
  }

  // ── Parse reasoning blob (subject, external_id, gmail_url) ──────────
  let reasoning: ReasoningBlob = {};
  if (row.reasoning) {
    try {
      reasoning = JSON.parse(row.reasoning) as ReasoningBlob;
    } catch {
      /* plain text reasoning (Scanner drafts) — no structured fields */
    }
  }

  // ── Fetch contact for send targeting ────────────────────────────────
  const { data: contact } = await sb
    .from("contacts")
    .select("id, name, email, telegram_handle, enrichment")
    .eq("id", row.contact_id)
    .maybeSingle();

  const c = contact as ContactRow | null;

  // ── Send by channel ─────────────────────────────────────────────────
  let sendNote = "marked approved";
  let sendError: string | null = null;

  if (row.channel === "telegram") {
    const chatId = (c?.enrichment as { telegram_chat_id?: number } | null)
      ?.telegram_chat_id;
    if (!chatId) {
      sendNote =
        "approved — no live Telegram chat for this contact yet (simulate contact)";
    } else {
      try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
          throw new Error("TELEGRAM_BOT_TOKEN not set");
        }
        const res = await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: row.draft_content }),
          },
        );
        const body = await res.json();
        if (!body.ok) {
          throw new Error(
            `Telegram sendMessage failed: ${body.description ?? "unknown"}`,
          );
        }
        sendNote = "sent via Telegram";
      } catch (err) {
        sendError = err instanceof Error ? err.message : String(err);
        console.error("[/api/drafts/approve] telegram send failed:", err);
      }
    }
  } else if (row.channel === "gmail") {
    // Best-effort: if we staged in Gmail Drafts during classify, send that
    // draft via Composio. If not, skip — the Gmail draft row in Supabase
    // still marks pending→approved, and the Gmail draft (if staged) stays
    // in the user's Drafts folder for manual send.
    const accountId = process.env.COMPOSIO_GMAIL_CONNECTED_ACCOUNT_ID;
    const apiKey = process.env.COMPOSIO_API_KEY;
    if (reasoning.external_id && accountId && apiKey) {
      try {
        const composio = new Composio({ apiKey });
        const result = await composio.tools.execute("GMAIL_SEND_DRAFT", {
          connectedAccountId: accountId,
          arguments: { draft_id: reasoning.external_id },
        });
        if (!result.successful) {
          throw new Error(
            `Composio GMAIL_SEND_DRAFT failed: ${result.error ?? "unknown"}`,
          );
        }
        sendNote = "sent via Gmail (Composio)";
      } catch (err) {
        sendError = err instanceof Error ? err.message : String(err);
        console.error("[/api/drafts/approve] gmail send failed:", err);
        sendNote = "approved — Gmail draft staged, send from Gmail manually";
      }
    } else {
      sendNote = "approved — Gmail draft staged, send from Gmail manually";
    }
  } else {
    sendNote = `approved — channel ${row.channel ?? "(unknown)"} not wired for live send`;
  }

  // ── Flip status in Supabase ────────────────────────────────────────
  const finalStatus = sendError ? "approved" : sendNote.startsWith("sent") ? "sent" : "approved";
  await sb
    .from("drafts")
    .update({ status: finalStatus })
    .eq("id", id);

  // ── Record outbound interaction so Warmth/history reflects it ───────
  await sb.from("interactions").insert({
    contact_id: row.contact_id,
    channel: row.channel,
    direction: "outbound",
    content: row.draft_content,
    signals: {
      approved_at: new Date().toISOString(),
      send_note: sendNote,
      send_error: sendError,
      source: "morning_connect_approve",
    },
    classification: null,
  });

  return Response.json({
    ok: true,
    status: finalStatus,
    note: sendNote,
    error: sendError,
  });
}
