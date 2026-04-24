/**
 * POST /api/scribe — audio upload → Genspark transcribe → Claude extract.
 *
 * Pipeline:
 *   1. Multipart: audio file (File) — up to 4MB.
 *   2. Upload to Genspark AI Drive via `gsk drive upload --file_content base64:...`.
 *   3. Transcribe via `gsk transcribe -i <ai-drive-path>` (whisper-1).
 *   4. Claude extract_meeting_memory — summary, people, topics,
 *      commitments with owners + deadlines, key quotes, next step.
 *   5. Return { transcript, extract, steps[] } so the UI can render the
 *      side-panel step log.
 *
 * Graceful degrade: each stage is try/caught; caller sees which step
 * succeeded and which skipped. Claude extract is the terminal step and
 * errors bubble up to the client.
 */

import {
  uploadAudioToDrive,
  transcribeAudio,
} from "@/lib/genspark-cli";
import { extractMeetingMemory } from "@/lib/scribe-extractor";
import type { ScribeExtract } from "@/lib/scribe-extractor";

export const runtime = "nodejs";
export const maxDuration = 180;

type ScribeResponse =
  | {
      ok: true;
      transcript: string;
      extract: ScribeExtract;
      steps: string[];
      ai_drive_path: string;
    }
  | {
      ok: false;
      error: string;
      steps: string[];
    };

const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: Request): Promise<Response> {
  const steps: string[] = [];

  // ── 1. Parse multipart ────────────────────────────────────────────────
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json(
      { ok: false, error: "Body must be multipart/form-data.", steps },
      { status: 400 } satisfies ResponseInit,
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
        error: `Audio is ${Math.round(audio.size / 1024)}KB — max is ${MAX_BYTES / 1024}KB. Shorten or compress.`,
        steps,
      },
      { status: 413 },
    );
  }

  const ext = (audio.name.split(".").pop() || "mp3").toLowerCase().slice(0, 5);
  const uploadPath = `/scribe/note-${Date.now()}.${ext}`;

  steps.push(`Received audio · ${Math.round(audio.size / 1024)}KB (${audio.type || ext})`);

  // ── 2. Upload to AI Drive ────────────────────────────────────────────
  steps.push("Uploading to Genspark AI Drive");
  const buffer = Buffer.from(await audio.arrayBuffer());
  const uploadResult = await uploadAudioToDrive({
    bytes: buffer,
    uploadPath,
  });

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

  // ── 3. Transcribe ────────────────────────────────────────────────────
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

  // ── 4. Claude extract ────────────────────────────────────────────────
  steps.push("Claude extracting memory + commitments");
  let extract: ScribeExtract;
  try {
    extract = await extractMeetingMemory(transcript);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "extract failed";
    console.error("[/api/scribe] extract failed:", err);
    steps.push(`Extract failed: ${msg}`);
    // Still return the transcript — it's useful by itself.
    return Response.json({
      ok: false,
      error: msg,
      steps,
    });
  }
  steps.push(
    `Extracted · ${extract.commitments.length} commitment${
      extract.commitments.length === 1 ? "" : "s"
    } · ${extract.people.length} ${extract.people.length === 1 ? "person" : "people"} · ${extract.topics.length} topic${extract.topics.length === 1 ? "" : "s"}`,
  );

  const payload: ScribeResponse = {
    ok: true,
    transcript,
    extract,
    steps,
    ai_drive_path: aiDrivePath,
  };
  return Response.json(payload);
}
