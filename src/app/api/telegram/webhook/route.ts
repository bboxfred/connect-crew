/**
 * POST /api/telegram/webhook — Telegram Bot API webhook handler.
 *
 *   1. Verify X-Telegram-Bot-Api-Secret-Token header.
 *   2. Parse Telegram Update; skip non-text / bot senders.
 *   3. Run the shared Messenger pipeline (upsert contact, classify,
 *      update warmth, insert interaction).
 *   4. Return 200 regardless of pipeline success — Telegram retries
 *      forever on non-200 responses and we'd rather drop a single
 *      classification than loop.
 */

import { processInbound } from "@/lib/messenger-pipeline";

export const runtime = "nodejs";
export const maxDuration = 30;

type TelegramUser = {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
};

type TelegramMessage = {
  message_id: number;
  from?: TelegramUser;
  chat: { id: number; type: string };
  date: number;
  text?: string;
};

type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
};

export async function POST(req: Request): Promise<Response> {
  // Secret verification
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  const received = req.headers.get("x-telegram-bot-api-secret-token");
  if (!expected) {
    console.error("[telegram/webhook] TELEGRAM_WEBHOOK_SECRET not configured");
    return new Response("misconfigured", { status: 200 });
  }
  if (received !== expected) {
    console.warn("[telegram/webhook] secret header mismatch — rejecting");
    return new Response("unauthorized", { status: 401 });
  }

  // Parse update
  let update: TelegramUpdate;
  try {
    update = (await req.json()) as TelegramUpdate;
  } catch {
    return new Response("bad json", { status: 400 });
  }

  const message = update.message;
  if (!message || !message.text || !message.from) {
    return new Response("skipped: not a text message", { status: 200 });
  }
  if (message.from.is_bot) {
    return new Response("skipped: bot sender", { status: 200 });
  }

  try {
    await processInbound({
      text: message.text,
      sender: message.from,
      sentAt: new Date(message.date * 1000),
      chatId: message.chat.id,
    });
  } catch (err) {
    console.error("[telegram/webhook] processing failed:", err);
  }

  return new Response("ok", { status: 200 });
}
