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
  Sparkles,
  Check,
  FileAudio,
  MessageSquareReply,
  Users,
  Tags,
  Quote,
  ArrowRight,
} from "lucide-react";
import { CREW } from "@/lib/fixtures";
import { useGensparkPanel } from "@/components/genspark-side-panel";
import type { ScribeExtract } from "@/lib/scribe-extractor";

type Mode = "idle" | "recording" | "processing" | "done" | "error";

type ScribeResponse =
  | {
      ok: true;
      transcript: string;
      extract: ScribeExtract;
      steps: string[];
      ai_drive_path: string;
    }
  | { ok: false; error: string; steps: string[] };

const WAITING_STEPS = [
  "Receiving audio",
  "Uploading to Genspark AI Drive",
  "Genspark transcribing · whisper-1",
  "Claude extracting memory + commitments",
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
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
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
      stepMs: 12_000,
      autoDismissMs: null,
    });

    const form = new FormData();
    form.append("audio", blob, filename);

    try {
      const res = await fetch("/api/scribe", {
        method: "POST",
        body: form,
      });
      const json = (await res.json()) as ScribeResponse;

      if (!json.ok) {
        panel.run({
          crew: "scribe",
          title: "Scribe · couldn't process",
          steps:
            json.steps.length > 0 ? json.steps : ["Couldn't process audio"],
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
        stepMs: 400,
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
          Scribe turns conversations into memory.
        </h1>
        <p className="mt-4 text-[var(--muted-strong)] max-w-2xl leading-relaxed text-base md:text-lg">
          Record a voice note or upload audio. Genspark transcribes via
          whisper-1, Claude extracts the structured memory — summary,
          people, topics, every commitment with who owes what by when.
          Lands in your graph, ready to reference.
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
              Give Scribe something to remember.
            </h2>
            <p className="mt-3 text-sm text-[var(--muted-strong)] max-w-md leading-relaxed">
              Record a voice note directly or upload an audio file (mp3,
              m4a, webm, wav — up to 4MB). Works great for post-meeting
              memos and voice notes to yourself.
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
              Powered by Genspark whisper-1 · Claude Opus 4.7
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
              <Mic
                className="h-10 w-10"
                style={{ color: crew.color }}
                strokeWidth={2}
              />
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
              Recording · speak naturally
            </div>
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center gap-2 rounded-full text-white px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "var(--ink)" }}
            >
              <Square className="h-4 w-4" strokeWidth={2.5} fill="white" />
              Stop & transcribe
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
              Claude + Genspark working…
            </h2>
            <p className="mt-1 text-sm text-[var(--muted-strong)] max-w-md leading-relaxed">
              Watch the Genspark side panel on the right. Transcription
              usually completes in 15–40 seconds depending on audio length.
            </p>
            {uploadedName ? (
              <div className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] text-[var(--muted)] px-3 py-1.5 rounded-full border border-[var(--border)]">
                <FileAudio className="h-3 w-3" strokeWidth={2} />
                {uploadedName}
                {uploadedSize != null
                  ? ` · ${Math.round(uploadedSize / 1024)}KB`
                  : ""}
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
  result: { transcript: string; extract: ScribeExtract };
  accentColor: string;
  onReset: () => void;
}) {
  const { transcript, extract } = result;
  return (
    <div className="flex-1 flex flex-col">
      <div className="p-5 md:p-6 border-b border-[var(--hairline)] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Check
            className="h-4 w-4"
            strokeWidth={2.5}
            style={{ color: "var(--sage)" }}
          />
          <div
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color: "var(--sage)" }}
          >
            Transcribed + extracted
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

      <div className="p-5 md:p-6 space-y-6">
        <section>
          <div
            className="font-mono text-[10px] uppercase tracking-widest mb-2"
            style={{ color: accentColor }}
          >
            Summary
          </div>
          <p className="text-base md:text-lg leading-relaxed text-[var(--foreground)] max-w-3xl">
            {extract.summary}
          </p>
        </section>

        {extract.commitments.length > 0 ? (
          <section>
            <div
              className="font-mono text-[10px] uppercase tracking-widest mb-3 flex items-center gap-1.5"
              style={{ color: accentColor }}
            >
              <MessageSquareReply className="h-3 w-3" strokeWidth={2} />
              Commitments · {extract.commitments.length}
            </div>
            <ul className="space-y-2">
              {extract.commitments.map((c, i) => (
                <li
                  key={i}
                  className="rounded-xl border p-3 flex items-start gap-3"
                  style={{
                    borderColor: `color-mix(in srgb, ${accentColor} 22%, transparent)`,
                    backgroundColor: `color-mix(in srgb, ${accentColor} 4%, white)`,
                  }}
                >
                  <span
                    className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${accentColor} 18%, white)`,
                      color: accentColor,
                    }}
                  >
                    {c.who}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-[var(--foreground)] leading-snug font-medium">
                      {c.what}
                    </div>
                    {c.by_when ? (
                      <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
                        by {c.by_when}
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section
          className="rounded-xl p-4 border"
          style={{
            borderColor: `color-mix(in srgb, ${accentColor} 28%, transparent)`,
            backgroundColor: `color-mix(in srgb, ${accentColor} 8%, white)`,
          }}
        >
          <div
            className="font-mono text-[10px] uppercase tracking-widest mb-1.5 flex items-center gap-1.5"
            style={{ color: accentColor }}
          >
            <ArrowRight className="h-3 w-3" strokeWidth={2} />
            Next step
          </div>
          <p className="text-sm leading-relaxed text-[var(--foreground)] font-medium">
            {extract.next_step}
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {extract.people.length > 0 ? (
            <section>
              <div
                className="font-mono text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5"
                style={{ color: accentColor }}
              >
                <Users className="h-3 w-3" strokeWidth={2} />
                People
              </div>
              <ul className="flex flex-wrap gap-1.5">
                {extract.people.map((p) => (
                  <li
                    key={p}
                    className="inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[11px] border"
                    style={{
                      borderColor: `color-mix(in srgb, ${accentColor} 22%, transparent)`,
                      color: "var(--foreground)",
                    }}
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {extract.topics.length > 0 ? (
            <section>
              <div
                className="font-mono text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5"
                style={{ color: accentColor }}
              >
                <Tags className="h-3 w-3" strokeWidth={2} />
                Topics
              </div>
              <ul className="flex flex-wrap gap-1.5">
                {extract.topics.map((t) => (
                  <li
                    key={t}
                    className="inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[11px]"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${accentColor} 10%, white)`,
                      color: accentColor,
                    }}
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        {extract.key_quotes.length > 0 ? (
          <section>
            <div
              className="font-mono text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5"
              style={{ color: accentColor }}
            >
              <Quote className="h-3 w-3" strokeWidth={2} />
              Memorable quotes
            </div>
            <ul className="space-y-2">
              {extract.key_quotes.map((q, i) => (
                <li
                  key={i}
                  className="text-sm leading-relaxed text-[var(--muted-strong)] italic border-l-2 pl-3"
                  style={{
                    borderColor: `color-mix(in srgb, ${accentColor} 35%, transparent)`,
                  }}
                >
                  &ldquo;{q}&rdquo;
                </li>
              ))}
            </ul>
          </section>
        ) : null}

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
