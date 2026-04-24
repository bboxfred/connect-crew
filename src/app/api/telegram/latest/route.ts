/**
 * GET /api/telegram/latest
 *
 * Server-side fetch of the most recent inbound Telegram classification.
 * Exists so the LiveClassificationCard doesn't have to depend on a
 * browser-side Supabase client — which fails silently on prod if the
 * NEXT_PUBLIC_SUPABASE_* env vars haven't baked into the client bundle.
 *
 * Uses the service-role key server-side, returns the single latest row
 * (or null if no classifications have been logged yet).
 */

import { supabaseServer } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  try {
    const sb = supabaseServer();
    const { data, error } = await sb
      .from("interactions")
      .select(
        "id, contact_id, channel, direction, content, classification, created_at, signals",
      )
      .eq("channel", "telegram")
      .eq("direction", "inbound")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("[/api/telegram/latest] supabase select failed:", error);
      return Response.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return Response.json({ ok: true, row: data?.[0] ?? null });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    console.error("[/api/telegram/latest] handler failed:", err);
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
