/**
 * POST /api/telegram/simulate — demo-safety fallback for the Messenger
 * classifier. Runs the exact same pipeline as the real Telegram webhook
 * but bypasses Telegram entirely, so we can demo classification live on
 * stage even if the hackathon wifi can't reach Telegram's servers.
 *
 * Accepts JSON:
 *   { text: string, senderName?: string, senderHandle?: string }
 *
 * Defaults sender to a pre-seeded fixture contact ("Priya Raghavan",
 * handle "priya_r") so the flow always has somewhere to upsert into.
 *
 * Returns the full classification + before/after warmth so the UI can
 * render the result immediately (no need to re-query Supabase).
 */

import { processInbound } from "@/lib/messenger-pipeline";

export const runtime = "nodejs";
export const maxDuration = 30;

type SimulateBody = {
  text?: string;
  senderName?: string;
  senderHandle?: string;
};

export async function POST(req: Request): Promise<Response> {
  let body: SimulateBody;
  try {
    body = (await req.json()) as SimulateBody;
  } catch {
    return Response.json(
      { ok: false, error: "Body must be JSON." },
      { status: 400 },
    );
  }

  const text = body.text?.trim();
  if (!text) {
    return Response.json(
      { ok: false, error: "text is required." },
      { status: 400 },
    );
  }

  const senderName = body.senderName?.trim() || "Priya Raghavan";
  const senderHandle = body.senderHandle?.trim() || "priya_r";
  const [first, ...rest] = senderName.split(/\s+/);

  try {
    const result = await processInbound({
      text,
      sender: {
        // A deterministic numeric id derived from the handle so simulation
        // calls against the same handle always hit the same fallback id
        // if username is absent.
        id: hashHandle(senderHandle),
        first_name: first || senderName,
        last_name: rest.join(" ") || undefined,
        username: senderHandle,
      },
      sentAt: new Date(),
    });

    return Response.json({
      ok: true,
      ...result,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "simulate failed";
    console.error("[/api/telegram/simulate] failed:", err);
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}

function hashHandle(handle: string): number {
  // Simple deterministic hash → fits in a JS-safe int. Not cryptographic.
  let h = 0;
  for (let i = 0; i < handle.length; i++) {
    h = (h * 31 + handle.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}
