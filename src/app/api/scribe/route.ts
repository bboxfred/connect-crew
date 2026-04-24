/**
 * POST /api/scribe — voice-note → contact-specific follow-up email.
 *
 *   1. Multipart: audio file (File), up to 4MB.
 *   2. Upload to Genspark AI Drive.
 *   3. Transcribe via `gsk transcribe -m whisper-1`.
 *   4. Pull the user's contacts from Supabase.
 *   5. Claude draft_contact_email — identify the referenced contact +
 *      draft the follow-up email in the user's voice.
 *   6. If a contact matched AND they have an email, stage the draft as
 *      a real Gmail Draft via Composio + insert into `drafts` table
 *      so it lands in Morning Connect.
 *   7. Return { transcript, matched_contact, draft, steps[] }.
 *
 * If no contact matched (person referenced isn't in the graph yet),
 * we return the transcript + suggestion to add via Scanner — still
 * useful as a captured note.
 */

import { uploadAudioToDrive, transcribeAudio } from "@/lib/genspark-cli";
import {
  draftContactEmailFromNote,
  type ScribeContactCandidate,
  type ScribeDraft,
} from "@/lib/scribe-extractor";
import { supabaseServer } from "@/lib/supabase";
import { createGmailDraft } from "@/lib/composio";

export const runtime = "nodejs";
export const maxDuration = 180;

type ScribeResponse =
  | {
      ok: true;
      transcript: string;
      matched_contact: {
        id: string;
        name: string;
        company: string | null;
        email: string | null;
      } | null;
      match_confidence: number;
      why_this_contact: string;
      draft: {
        subject: string;
        body: string;
        reasoning: string;
        gmail_url: string | null;
        supabase_draft_id: string | null;
      };
      steps: string[];
      ai_drive_path: string;
    }
  | {
      ok: false;
      error: string;
      steps: string[];
      transcript?: string;
    };

const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: Request): Promise<Response> {
  const steps: string[] = [];

  // 1. Parse multipart ─────────────────────────────────────────────────
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json(
      { ok: false, error: "Body must be multipart/form-data.", steps },
      { status: 400 },
    );
  }

  const audio = form.get("audio");
  if (!(audio instanceof File)) {
    return Response.json(
      { ok: false, error: "`audio` file field is required.", steps },
      { status: 400 },
    );
  }
  if (audio.size === 0) {
    return Response.json(
      { ok: false, error: "Audio file is empty.", steps },
      { status: 400 },
    );
  }
  if (audio.size > MAX_BYTES) {
    return Response.json(
      {
        ok: false,
        error: `Audio is ${Math.round(audio.size / 1024)}KB — max is ${MAX_BYTES / 1024}KB.`,
        steps,
      },
      { status: 413 },
    );
  }

  const ext = (audio.name.split(".").pop() || "mp3").toLowerCase().slice(0, 5);
  const uploadPath = `/scribe/note-${Date.now()}.${ext}`;
  steps.push(
    `Received audio · ${Math.round(audio.size / 1024)}KB (${audio.type || ext})`,
  );

  // 2. Upload to AI Drive ──────────────────────────────────────────────
  steps.push("Uploading to Genspark AI Drive");
  const buffer = Buffer.from(await audio.arrayBuffer());
  const uploadResult = await uploadAudioToDrive({ bytes: buffer, uploadPath });
  if (uploadResult.status !== "ok") {
    steps.push(`AI Drive upload skipped: ${uploadResult.reason}`);
    return Response.json(
      {
        ok: false,
        error: `Upload to AI Drive failed: ${uploadResult.reason}`,
        steps,
      },
      { status: 500 },
    );
  }
  const aiDrivePath = uploadResult.path;
  steps.push(`AI Drive path · ${aiDrivePath}`);

  // 3. Transcribe ──────────────────────────────────────────────────────
  steps.push("Genspark transcribing · whisper-1");
  const transcribeResult = await transcribeAudio({
    audioPath: aiDrivePath,
    model: "whisper-1",
  });
  if (transcribeResult.status !== "ok") {
    steps.push(`Transcription skipped: ${transcribeResult.reason}`);
    return Response.json(
      {
        ok: false,
        error: `Transcription failed: ${transcribeResult.reason}`,
        steps,
      },
      { status: 500 },
    );
  }
  const transcript = transcribeResult.transcript;
  steps.push(
    `Transcript ready · ${transcript.length} chars, ${transcript.split(/\s+/).length} words`,
  );

  // 4. Pull contacts ───────────────────────────────────────────────────
  const sb = supabaseServer();
  const { data: contactRows } = await sb
    .from("contacts")
    .select("id, name, company, email, telegram_handle, met_at")
    .order("last_contact_at", { ascending: false, nullsFirst: false })
    .limit(80);
  const contacts: ScribeContactCandidate[] = (contactRows ?? []).map((c) => ({
    id: c.id,
    name: c.name ?? "(unnamed)",
    company: c.company ?? null,
    email: c.email ?? null,
    telegram_handle: c.telegram_handle ?? null,
    met_at: c.met_at ?? null,
  }));
  steps.push(`Searching ${contacts.length} contacts in your graph`);

  // 5. Claude draft ────────────────────────────────────────────────────
  steps.push("Claude matching contact + drafting email");
  let draft: ScribeDraft;
  try {
    draft = await draftContactEmailFromNote({
      transcript,
      contacts,
      userFirstName: process.env.DEMO_USER_NAME?.split(/\s+/)[0] ?? "Freddy",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "extract failed";
    console.error("[/api/scribe] drafter failed:", err);
    steps.push(`Drafter failed: ${msg}`);
    return Response.json({
      ok: false,
      error: msg,
      steps,
      transcript,
    });
  }

  const matchedContact =
    draft.matched_contact_id != null
      ? contacts.find((c) => c.id === draft.matched_contact_id) ?? null
      : null;

  if (matchedContact) {
    steps.push(
      `Matched · ${matchedContact.name}${matchedContact.company ? ` · ${matchedContact.company}` : ""} (confidence ${Math.round(
        draft.match_confidence * 100,
      )}%)`,
    );
  } else {
    steps.push(
      "No contact match — voice note captured but no follow-up email staged",
    );
  }

  // 6. If matched + has email, stage Gmail draft + insert drafts row ───
  let gmailUrl: string | null = null;
  let externalId: string | null = null;
  let supabaseDraftId: string | null = null;

  if (matchedContact?.email) {
    try {
      steps.push("Composio staging Gmail draft");
      const gmail = await createGmailDraft({
        to: matchedContact.email,
        subject: draft.subject,
        body: draft.body,
      });
      gmailUrl = gmail.gmail_url;
      externalId = gmail.draft_id || null;
    } catch (err) {
      console.error(
        "[/api/scribe] Gmail draft failed (non-fatal):",
        err,
      );
      steps.push(
        `Gmail stage skipped: ${err instanceof Error ? err.message : "unknown"}`,
      );
    }

    steps.push("Adding draft to Morning Connect");
    const { data: draftRow, error: draftError } = await sb
      .from("drafts")
      .insert({
        contact_id: matchedContact.id,
        channel: "gmail",
        draft_content: draft.body,
        reasoning: JSON.stringify({
          reasoning: draft.reasoning,
          why_this_contact: draft.why_this_contact,
          subject: draft.subject,
          transcript_excerpt: transcript.slice(0, 200),
          match_confidence: draft.match_confidence,
          gmail_url: gmailUrl,
          external_id: externalId,
          source: "scribe",
        }),
        status: "pending",
      })
      .select("id")
      .single();
    if (!draftError && draftRow) {
      supabaseDraftId = draftRow.id;
    } else {
      console.error("[/api/scribe] drafts insert failed:", draftError);
    }
  } else if (matchedContact && !matchedContact.email) {
    steps.push(
      `${matchedContact.name} has no email on file — can't stage a Gmail draft`,
    );
  }

  const payload: ScribeResponse = {
    ok: true,
    transcript,
    matched_contact: matchedContact
      ? {
          id: matchedContact.id,
          name: matchedContact.name,
          company: matchedContact.company,
          email: matchedContact.email,
        }
      : null,
    match_confidence: draft.match_confidence,
    why_this_contact: draft.why_this_contact,
    draft: {
      subject: draft.subject,
      body: draft.body,
      reasoning: draft.reasoning,
      gmail_url: gmailUrl,
      supabase_draft_id: supabaseDraftId,
    },
    steps,
    ai_drive_path: aiDrivePath,
  };

  return Response.json(payload);
}
