"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Mic,
  Square,
  Loader2,
  AlertCircle,
  Check,
  FileAudio,
  Mail,
  Sparkles,
  ExternalLink,
  UserSearch,
} from "lucide-react";
import { CREW } from "@/lib/fixtures";
import { useGensparkPanel } from "@/components/genspark-side-panel";

type Mode = "idle" | "recording" | "processing" | "done" | "error";

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
  | { ok: false; error: string; steps: string[]; transcript?: string };

const WAITING_STEPS = [
  "Receiving audio",
  "Uploading to Genspark AI Drive",
  "Genspark transcribing · whisper-1",
  "Searching your contacts",
  "Claude drafting the follow-up email",
];

export default function ScribePage() {
  const crew = CREW.scribe;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<Mode>("idle");
  const [result, setResult] = useState<ScribeResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [uploadedSize, setUploadedSize] = useState<number | null>(null);
  const [recordingSecs, setRecordingSecs] = useState(0);

  const panel = useGensparkPanel();

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (mode !== "recording") return;
    const id = window.setInterval(() => setRecordingSecs((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [mode]);

  async function startRecording() {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        await processAudio(blob, `note-${Date.now()}.webm`);
      };
      recorder.start();
      setMode("recording");
      setRecordingSecs(0);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Microphone access denied";
      setErrorMessage(msg);
      setMode("error");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await processAudio(file, file.name);
  }

  async function processAudio(blob: Blob, filename: string) {
    setMode("processing");
    setErrorMessage(null);
    setResult(null);
    setUploadedName(filename);
    setUploadedSize(blob.size);

    panel.run({
      crew: "scribe",
      title: "Scribe · Genspark + Claude",
      steps: WAITING_STEPS,
      stepMs: 10_000,
      autoDismissMs: null,
    });

    const form = new FormData();
    form.append("audio", blob, filename);

    try {
      const res = await fetch("/api/scribe", { method: "POST", body: form });
      // Defensive: if the serverless function times out, Vercel closes the
      // connection and the body is empty. res.json() throws 'Unexpected end
      // of JSON input' — surface a clearer error instead of crashing.
      const rawText = await res.text();
      let json: ScribeResponse;
      if (!rawText) {
        const msg = `Scribe pipeline took too long (HTTP ${res.status}) — try a shorter audio note (under 30 seconds).`;
        console.error("[scribe] empty response body", { status: res.status });
        panel.run({
          crew: "scribe",
          title: "Scribe · timed out",
          steps: [msg],
          stepMs: 400,
          autoDismissMs: 2500,
        });
        setErrorMessage(msg);
        setMode("error");
        return;
      }
      try {
        json = JSON.parse(rawText) as ScribeResponse;
      } catch (parseErr) {
        const msg = `Scribe returned a malformed response. Raw (first 200 chars): ${rawText.slice(0, 200)}`;
        console.error("[scribe] JSON parse failed:", parseErr, rawText.slice(0, 500));
        panel.run({
          crew: "scribe",
          title: "Scribe · bad response",
          steps: [msg.slice(0, 120)],
          stepMs: 400,
          autoDismissMs: 2500,
        });
        setErrorMessage(msg);
        setMode("error");
        return;
      }
      if (!json.ok) {
        panel.run({
          crew: "scribe",
          title: "Scribe · couldn't process",
          steps: json.steps.length > 0 ? json.steps : ["Couldn't process audio"],
          stepMs: 350,
          autoDismissMs: 2000,
        });
        setErrorMessage(json.error);
        setMode("error");
        return;
      }

      panel.run({
        crew: "scribe",
        title: "Scribe · Genspark + Claude",
        steps: json.steps,
        stepMs: 420,
        autoDismissMs: null,
        onDone: () => setMode("done"),
      });
      setResult(json);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "network error";
      console.error("[scribe] fetch threw:", err);
      panel.run({
        crew: "scribe",
        title: "Scribe · network error",
        steps: [`Request failed: ${msg}`],
        stepMs: 400,
        autoDismissMs: 1500,
      });
      setErrorMessage(msg);
      setMode("error");
    }
  }

  function reset() {
    panel.close();
    setMode("idle");
    setResult(null);
    setErrorMessage(null);
    setUploadedName(null);
    setUploadedSize(null);
    setRecordingSecs(0);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <Link
        href="/app/dashboard"
        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
      >
        <ArrowLeft className="h-3 w-3" strokeWidth={1.75} />
        Dashboard
      </Link>

      <header className="anim-fade-up">
        <div
          className="font-mono text-[10px] uppercase tracking-widest mb-3"
          style={{ color: crew.color }}
        >
          Crew · 05 · Scribe
        </div>
        <h1
          className="font-editorial text-4xl md:text-5xl tracking-tight"
          style={{ fontWeight: 700, letterSpacing: "-0.025em" }}
        >
          Talk to Scribe. Get a follow-up email.
        </h1>
        <p className="mt-4 text-[var(--muted-strong)] max-w-2xl leading-relaxed text-base md:text-lg">
          Record or upload a voice note about someone you need to follow up
          with — &ldquo;Met Sofia at Standard Chartered, need to send her
          the deck and propose coffee next week.&rdquo; Scribe finds the
          contact in your graph, drafts the email to them, and stages it in
          Gmail + Morning Connect for your approval.
        </p>
        <p className="mt-3 font-mono text-[11px] text-[var(--muted)] leading-relaxed max-w-2xl">
          The person needs to already be in your contacts. If they&apos;re
          not, scan their card first via Scanner.
        </p>
      </header>

      <div
        className="rounded-2xl border bg-[var(--surface)] overflow-hidden min-h-[420px] flex flex-col anim-fade-up"
        style={{
          animationDelay: "0.06s",
          borderColor: "var(--border)",
        }}
      >
        {mode === "idle" ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 md:p-14 text-center">
            <div
              className="h-20 w-20 rounded-2xl flex items-center justify-center mb-6"
              style={{
                backgroundColor: `color-mix(in srgb, ${crew.color} 14%, white)`,
                border: `1px solid color-mix(in srgb, ${crew.color} 30%, transparent)`,
              }}
            >
              <FileAudio
                className="h-8 w-8"
                style={{ color: crew.color }}
                strokeWidth={1.5}
              />
            </div>
            <h2
              className="font-editorial text-2xl md:text-3xl tracking-tight"
              style={{ fontWeight: 600 }}
            >
              Describe the follow-up out loud.
            </h2>
            <p className="mt-3 text-sm text-[var(--muted-strong)] max-w-md leading-relaxed">
              Name the person, say what you want to send or ask. Claude
              handles the rest — match, draft, stage in Gmail. Keep notes
              under ~45 seconds for the demo.
            </p>

            <div className="mt-8 flex items-center gap-3 flex-wrap justify-center">
              <button
                type="button"
                onClick={startRecording}
                className="inline-flex items-center gap-2 rounded-full text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: crew.color }}
              >
                <Mic className="h-4 w-4" strokeWidth={2} /> Record voice note
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors"
              >
                <Upload className="h-4 w-4" strokeWidth={2} /> Upload audio file
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/webm"
                onChange={handleFile}
                className="hidden"
              />
            </div>

            <div className="mt-8 font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
              Genspark whisper-1 · Claude Opus 4.7 · Composio Gmail
            </div>
          </div>
        ) : null}

        {mode === "recording" ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 md:p-14 text-center">
            <div
              className="h-24 w-24 rounded-full flex items-center justify-center mb-6 anim-pulse-hot"
              style={{
                backgroundColor: `color-mix(in srgb, ${crew.color} 25%, white)`,
                border: `3px solid ${crew.color}`,
              }}
            >
              <Mic className="h-10 w-10" style={{ color: crew.color }} strokeWidth={2} />
            </div>
            <div
              className="font-editorial text-5xl tabular-nums mb-2"
              style={{ fontWeight: 700, color: crew.color }}
            >
              {Math.floor(recordingSecs / 60)
                .toString()
                .padStart(2, "0")}
              :{(recordingSecs % 60).toString().padStart(2, "0")}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-8">
              Recording · name the contact, describe the follow-up
            </div>
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center gap-2 rounded-full text-white px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "var(--ink)" }}
            >
              <Square className="h-4 w-4" strokeWidth={2.5} fill="white" />
              Stop & draft email
            </button>
          </div>
        ) : null}

        {mode === "processing" ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 md:p-14 text-center">
            <div
              className="h-20 w-20 rounded-2xl flex items-center justify-center mb-6"
              style={{
                backgroundColor: `color-mix(in srgb, ${crew.color} 14%, white)`,
              }}
            >
              <Loader2
                className="h-8 w-8 animate-spin"
                style={{ color: crew.color }}
                strokeWidth={2}
              />
            </div>
            <h2
              className="font-editorial text-2xl tracking-tight mb-2"
              style={{ fontWeight: 600 }}
            >
              Scribe working…
            </h2>
            <p className="mt-1 text-sm text-[var(--muted-strong)] max-w-md leading-relaxed">
              Transcribing your note, matching the contact in your graph,
              drafting the email. Watch the Genspark side panel.
            </p>
            {uploadedName ? (
              <div className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] text-[var(--muted)] px-3 py-1.5 rounded-full border border-[var(--border)]">
                <FileAudio className="h-3 w-3" strokeWidth={2} />
                {uploadedName}
                {uploadedSize != null ? ` · ${Math.round(uploadedSize / 1024)}KB` : ""}
              </div>
            ) : null}
          </div>
        ) : null}

        {mode === "done" && result?.ok ? (
          <ScribeResultView
            result={result}
            accentColor={crew.color}
            onReset={reset}
          />
        ) : null}

        {mode === "error" ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 md:p-14 text-center">
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center mb-6"
              style={{
                backgroundColor: "color-mix(in srgb, var(--indigo) 10%, white)",
                border:
                  "1px solid color-mix(in srgb, var(--indigo) 30%, transparent)",
              }}
            >
              <AlertCircle
                className="h-7 w-7"
                style={{ color: "var(--indigo)" }}
                strokeWidth={1.5}
              />
            </div>
            <h2
              className="font-editorial text-2xl tracking-tight"
              style={{ fontWeight: 600 }}
            >
              Scribe couldn&apos;t process that.
            </h2>
            <p className="mt-3 text-sm text-[var(--muted-strong)] max-w-md leading-relaxed">
              {errorMessage ??
                "Something went wrong. Check the audio format and try again."}
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-mono uppercase tracking-wider text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors"
            >
              Try again
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ScribeResultView({
  result,
  accentColor,
  onReset,
}: {
  result: Extract<ScribeResponse, { ok: true }>;
  accentColor: string;
  onReset: () => void;
}) {
  const { transcript, matched_contact, draft, why_this_contact, match_confidence } = result;
  const hasMatch = matched_contact !== null;
  const staged = !!draft.supabase_draft_id;

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-5 md:p-6 border-b border-[var(--hairline)] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Check
            className="h-4 w-4"
            strokeWidth={2.5}
            style={{ color: hasMatch ? "var(--sage)" : "var(--muted)" }}
          />
          <div
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color: hasMatch ? "var(--sage)" : "var(--muted)" }}
          >
            {hasMatch
              ? `Drafted · ${staged ? "staged in Gmail + Morning Connect" : "no email on contact"}`
              : "No contact match found"}
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1 text-xs font-mono uppercase tracking-wider text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors"
        >
          Record another
        </button>
      </div>

      <div className="p-5 md:p-6 space-y-5">
        {/* Matched contact card */}
        {hasMatch && matched_contact ? (
          <section
            className="rounded-xl p-4 border"
            style={{
              borderColor: `color-mix(in srgb, ${accentColor} 30%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${accentColor} 5%, white)`,
            }}
          >
            <div
              className="font-mono text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5"
              style={{ color: accentColor }}
            >
              <UserSearch className="h-3 w-3" strokeWidth={2} />
              Matched contact · {Math.round(match_confidence * 100)}% confidence
            </div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span
                className="font-editorial text-lg md:text-xl tracking-tight"
                style={{ fontWeight: 700 }}
              >
                {matched_contact.name}
              </span>
              {matched_contact.company ? (
                <span className="text-sm text-[var(--muted-strong)]">
                  · {matched_contact.company}
                </span>
              ) : null}
              {matched_contact.email ? (
                <span className="font-mono text-[11px] text-[var(--muted)] break-all">
                  · {matched_contact.email}
                </span>
              ) : null}
            </div>
            <p className="mt-2 font-mono text-[11px] text-[var(--muted)] leading-relaxed">
              {why_this_contact}
            </p>
          </section>
        ) : (
          <section className="rounded-xl p-4 border border-[var(--border)] bg-[var(--paper)]/50">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2 flex items-center gap-1.5">
              <UserSearch className="h-3 w-3" strokeWidth={2} />
              No contact match
            </div>
            <p className="text-sm text-[var(--muted-strong)] leading-relaxed">
              {why_this_contact} Scan their card via{" "}
              <Link
                href="/app/scan"
                className="underline underline-offset-2 text-[var(--foreground)]"
              >
                Scanner
              </Link>
              {" "}
              then talk to Scribe again.
            </p>
          </section>
        )}

        {/* Drafted email */}
        {hasMatch ? (
          <section className="rounded-xl p-4 md:p-5 border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
              <div
                className="font-mono text-[10px] uppercase tracking-widest flex items-center gap-1.5"
                style={{ color: accentColor }}
              >
                <Mail className="h-3 w-3" strokeWidth={2} />
                Follow-up email drafted
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {draft.gmail_url ? (
                  <a
                    href={draft.gmail_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] hover:text-[var(--foreground)] transition-colors inline-flex items-center gap-1"
                  >
                    Open in Gmail <ExternalLink className="h-3 w-3" strokeWidth={2} />
                  </a>
                ) : null}
                {staged ? (
                  <Link
                    href="/app/morning-connect"
                    className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-full text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    Review in Morning Connect →
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] mb-1">
              Subject
            </div>
            <div
              className="font-editorial text-base md:text-lg tracking-tight mb-3"
              style={{ fontWeight: 600 }}
            >
              {draft.subject}
            </div>

            <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] mb-1">
              Body
            </div>
            <p className="text-sm leading-relaxed text-[var(--foreground)] whitespace-pre-wrap">
              {draft.body}
            </p>

            {draft.reasoning ? (
              <p className="mt-3 font-mono text-[11px] text-[var(--muted)] leading-relaxed border-t border-[var(--hairline)] pt-3">
                <span className="uppercase tracking-wider mr-1">
                  Why this draft:
                </span>
                {draft.reasoning}
              </p>
            ) : null}
          </section>
        ) : null}

        {/* Transcript collapsed */}
        <details className="rounded-xl border p-4 border-[var(--border)]">
          <summary className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted-strong)] cursor-pointer flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" strokeWidth={2} />
            Full transcript · {transcript.length} chars
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted-strong)] whitespace-pre-wrap">
            {transcript}
          </p>
        </details>
      </div>
    </div>
  );
}
