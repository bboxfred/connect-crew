/**
 * Messenger inbound pipeline — shared between the real Telegram webhook
 * (/api/telegram/webhook) and the demo-safety "Simulate Hi!!" endpoint
 * (/api/telegram/simulate). Both paths run the same Claude classify →
 * Supabase upsert → warmth update sequence.
 */

import { supabaseServer } from "./supabase";
import { classifyMessage } from "./classifier";
import type { Classification } from "./classifier";
import { applyDelta } from "./warmth";

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
};

export async function processInbound(input: {
  text: string;
  sender: TelegramSender;
  sentAt: Date;
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
    .select("id, name, warmth_index")
    .eq("telegram_handle", handle)
    .limit(1)
    .maybeSingle();

  let contactId: string;
  let previousWarmth: number;
  let contactName: string;

  if (existing) {
    contactId = existing.id;
    previousWarmth = existing.warmth_index ?? 50;
    contactName = existing.name ?? senderName;
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

  return {
    contact_id: contactId,
    contact_name: contactName,
    previous_warmth: previousWarmth,
    new_warmth: newWarmth,
    classification,
  };
}
