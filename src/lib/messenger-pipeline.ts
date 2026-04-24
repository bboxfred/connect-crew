/**
 * Messenger inbound pipeline — shared between the real Telegram webhook
 * (/api/telegram/webhook) and the demo-safety "Simulate Hi!!" endpoint
 * (/api/telegram/simulate). Both paths run the same Claude classify →
 * Supabase upsert → warmth update sequence.
 *
 * Phase 3 extension: after classify, if tier is hot or warm, the drafter
 * fires and stages a reply draft. Gmail-channel drafts go through Composio
 * to land in real Gmail Drafts; Telegram-channel drafts stay in Supabase
 * until approved. Yellow-tier autonomy (approve to send) is the default.
 */

import { supabaseServer } from "./supabase";
import { classifyMessage } from "./classifier";
import type { Classification } from "./classifier";
import { applyDelta } from "./warmth";
import { draftMessengerReply } from "./messenger-drafter";
import type { MessengerDraft } from "./messenger-drafter";
import { createGmailDraft } from "./composio";

export type TelegramSender = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
};

export type ProcessInboundResult = {
  contact_id: string;
  contact_name: string;
  previous_warmth: number;
  new_warmth: number;
  classification: Classification;
  draft:
    | {
        status: "created";
        id: string;
        channel: "telegram" | "gmail";
        subject: string | null;
        body: string;
        reasoning: string;
        calibration_trace: string[];
        gmail_url: string | null;
      }
    | {
        status: "skipped";
        reason: string;
      };
};

const DRAFTABLE_TIERS = new Set(["hot", "warm"]);

export async function processInbound(input: {
  text: string;
  sender: TelegramSender;
  sentAt: Date;
  /** Telegram chat.id for sendMessage on approval. Null for simulate. */
  chatId?: number | null;
}): Promise<ProcessInboundResult> {
  const sb = supabaseServer();

  const senderName =
    [input.sender.first_name, input.sender.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    (input.sender.username ? `@${input.sender.username}` : "Telegram user");
  const handle = input.sender.username ?? String(input.sender.id);

  // ── Upsert contact by telegram_handle ────────────────────────────────
  const { data: existing } = await sb
    .from("contacts")
    .select("id, name, warmth_index, company, email, met_at, enrichment")
    .eq("telegram_handle", handle)
    .limit(1)
    .maybeSingle();

  let contactId: string;
  let previousWarmth: number;
  let contactName: string;
  let contactCompany: string | null = null;
  let contactEmail: string | null = null;
  let contactMetAt: string | null = null;

  if (existing) {
    contactId = existing.id;
    previousWarmth = existing.warmth_index ?? 50;
    contactName = existing.name ?? senderName;
    contactCompany = existing.company ?? null;
    contactEmail = existing.email ?? null;
    contactMetAt = existing.met_at ?? null;
  } else {
    const { data: created, error: insertError } = await sb
      .from("contacts")
      .insert({
        name: senderName,
        telegram_handle: handle,
        warmth_index: 50,
        met_at: "Telegram",
      })
      .select("id, name, warmth_index")
      .single();

    if (insertError || !created) {
      throw new Error(
        `supabase contact insert failed: ${insertError?.message ?? "unknown"}`,
      );
    }
    contactId = created.id;
    previousWarmth = 50;
    contactName = created.name ?? senderName;
    contactMetAt = "Telegram";
  }

  // Save the chat_id on the contact's enrichment so the approve route can
  // later sendMessage. Only on real DMs (simulate passes null).
  if (input.chatId != null && existing) {
    const enrichment = {
      ...(existing.enrichment ?? {}),
      telegram_chat_id: input.chatId,
    };
    await sb
      .from("contacts")
      .update({ enrichment })
      .eq("id", contactId);
  } else if (input.chatId != null && !existing) {
    await sb
      .from("contacts")
      .update({ enrichment: { telegram_chat_id: input.chatId } })
      .eq("id", contactId);
  }

  // ── Response-time context vs last outbound ──────────────────────────
  const { data: lastOutbound } = await sb
    .from("interactions")
    .select("created_at")
    .eq("contact_id", contactId)
    .eq("direction", "outbound")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const responseTimeSeconds = lastOutbound?.created_at
    ? Math.max(
        0,
        Math.floor(
          (input.sentAt.getTime() -
            new Date(lastOutbound.created_at).getTime()) /
            1000,
        ),
      )
    : null;

  // ── Classify ────────────────────────────────────────────────────────
  const classification = await classifyMessage({
    text: input.text,
    channel: "telegram",
    response_time_seconds: responseTimeSeconds,
    user_first_name: process.env.DEMO_USER_NAME?.split(/\s+/)[0] ?? null,
  });

  // ── Apply delta, insert interaction, update warmth ─────────────────
  const newWarmth = applyDelta(previousWarmth, classification.net_delta);

  const { error: interactionError } = await sb.from("interactions").insert({
    contact_id: contactId,
    channel: "telegram",
    direction: "inbound",
    content: input.text,
    signals: {
      deltas: classification.deltas,
      signals_detected: classification.signals_detected,
      language_detected: classification.language_detected,
      confidence: classification.confidence,
      confidence_warning: classification.confidence_warning,
      reasoning: classification.reasoning,
      previous_warmth: previousWarmth,
      new_warmth: newWarmth,
      sender_name: contactName,
    },
    classification: classification.classification,
  });
  if (interactionError) {
    console.error(
      "[messenger-pipeline] interactions insert failed:",
      interactionError,
    );
  }

  const { error: updateError } = await sb
    .from("contacts")
    .update({
      warmth_index: newWarmth,
      last_contact_at: input.sentAt.toISOString(),
    })
    .eq("id", contactId);
  if (updateError) {
    console.error("[messenger-pipeline] contacts update failed:", updateError);
  }

  // ── Phase 3: draft a reply if tier is hot or warm ───────────────────
  const draft = await maybeDraftReply({
    classification,
    contactId,
    contactName,
    contactCompany,
    contactEmail,
    contactMetAt,
    inboundText: input.text,
    newWarmth,
  });

  return {
    contact_id: contactId,
    contact_name: contactName,
    previous_warmth: previousWarmth,
    new_warmth: newWarmth,
    classification,
    draft,
  };
}

async function maybeDraftReply(input: {
  classification: Classification;
  contactId: string;
  contactName: string;
  contactCompany: string | null;
  contactEmail: string | null;
  contactMetAt: string | null;
  inboundText: string;
  newWarmth: number;
}): Promise<ProcessInboundResult["draft"]> {
  const tier = input.classification.classification;
  if (!DRAFTABLE_TIERS.has(tier)) {
    return { status: "skipped", reason: `tier=${tier} — drafter only fires on hot/warm` };
  }
  if (input.classification.confidence_warning) {
    return {
      status: "skipped",
      reason: "low-confidence classification — manual review only",
    };
  }

  // Prefer Gmail channel when contact has an email (richer draft surface).
  const channel: "telegram" | "gmail" = input.contactEmail ? "gmail" : "telegram";

  let written: MessengerDraft;
  try {
    written = await draftMessengerReply({
      contactName: input.contactName,
      contactCompany: input.contactCompany,
      contactEmail: input.contactEmail,
      metAt: input.contactMetAt,
      inboundText: input.inboundText,
      channel,
      tier,
      signalsDetected: input.classification.signals_detected,
      reasoning: input.classification.reasoning,
      warmthScore: input.newWarmth,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "drafter failed";
    console.error("[messenger-pipeline] drafter failed:", err);
    return { status: "skipped", reason: msg };
  }

  // If Gmail channel + email present, stage in Gmail Drafts via Composio.
  let gmailUrl: string | null = null;
  let externalId: string | null = null;
  if (channel === "gmail" && input.contactEmail) {
    try {
      const gmail = await createGmailDraft({
        to: input.contactEmail,
        subject: written.subject ?? `Re: your message`,
        body: written.body,
      });
      gmailUrl = gmail.gmail_url;
      externalId = gmail.draft_id || null;
    } catch (err) {
      console.error(
        "[messenger-pipeline] Composio Gmail draft failed (non-fatal):",
        err,
      );
      // Continue — Supabase row still gets inserted, approve flow can retry.
    }
  }

  const sb = supabaseServer();
  const { data: draftRow, error: draftError } = await sb
    .from("drafts")
    .insert({
      contact_id: input.contactId,
      channel,
      draft_content: written.body,
      reasoning: buildDraftReasoning(
        written,
        input.classification,
        gmailUrl,
        externalId,
      ),
      status: "pending",
    })
    .select("id")
    .single();

  if (draftError || !draftRow) {
    console.error(
      "[messenger-pipeline] drafts insert failed:",
      draftError,
    );
    return {
      status: "skipped",
      reason: draftError?.message ?? "drafts insert failed",
    };
  }

  return {
    status: "created",
    id: draftRow.id,
    channel,
    subject: written.subject,
    body: written.body,
    reasoning: written.reasoning,
    calibration_trace: written.calibration_trace,
    gmail_url: gmailUrl,
  };
}

/**
 * Pack the drafter's reasoning + calibration trace + any external-draft
 * ids into the `drafts.reasoning` jsonb-as-string column so the
 * Morning Connect UI can render chips + the "Open in Gmail" link.
 */
function buildDraftReasoning(
  written: MessengerDraft,
  classification: Classification,
  gmailUrl: string | null,
  externalId: string | null,
): string {
  const payload = {
    reasoning: written.reasoning,
    calibration_trace: written.calibration_trace,
    classifier_reasoning: classification.reasoning,
    signals_detected: classification.signals_detected,
    classifier_tier: classification.classification,
    subject: written.subject,
    gmail_url: gmailUrl,
    external_id: externalId,
    source: "messenger_pipeline",
  };
  return JSON.stringify(payload);
}
