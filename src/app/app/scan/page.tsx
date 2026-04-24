"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Camera,
  Upload,
  X,
  RotateCcw,
  Sparkles,
  Check,
  AlertCircle,
  Mail,
  ExternalLink,
} from "lucide-react";
import { fixtureCards } from "@/lib/fixtures";
import { useGensparkPanel } from "@/components/genspark-side-panel";

type Mode = "idle" | "camera" | "preview" | "processing" | "done" | "error";

// Result shape returned by /api/scan on success.
type ScanResult = {
  ok: true;
  contact: {
    id: string;
    name: string;
    title: string | null;
    company: string | null;
    email: string | null;
    phone: string | null;
    linkedin: string | null;
    telegram_handle: string | null;
    warmth_index: number;
    met_at: string | null;
  };
  enrichment:
    | { status: "ok"; company_summary: string; sources_cited: string[] }
    | { status: "skipped"; reason: string };
  extract: { confidence: "high" | "medium" | "low"; found: number; total: number };
  draft:
    | {
        status: "created";
        id: string;
        subject: string;
        body: string;
        gmail_url: string | null;
        reasoning: string;
      }
    | { status: "skipped"; reason: string };
  steps: string[];
};

type ScanErrorResponse = { ok: false; error: string; steps: string[] };

// Shown in the side panel while the API roundtrip is in flight. Long
// stepMs keeps the panel visible until the real server steps arrive.
const WAITING_STEPS = [
  "Claude reading card image",
  "Claude extracting fields",
  "Genspark enriching via public web",
  "Filing in your graph",
];

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>("idle");
  const [image, setImage] = useState<string | null>(null);
  const [metContext, setMetContext] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const panel = useGensparkPanel();

  useEffect(() => {
    return () => stopCamera();
  }, []);

  async function startCamera() {
    setCameraError(null);
    setMode("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Camera unavailable";
      setCameraError(msg);
      setMode("idle");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // jpeg 0.85 — keeps payload under Vercel's 4.5MB body limit for
    // ~720p cards, well under Anthropic's 5MB vision cap.
    setImage(canvas.toDataURL("image/jpeg", 0.85));
    stopCamera();
    setMode("preview");
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setMode("preview");
    };
    reader.readAsDataURL(file);
  }

  async function process() {
    if (!image) return;
    setMode("processing");
    setErrorMessage(null);

    // Long-stepped "working" panel — gives Claude + Genspark time to return
    // without the panel finishing early. On real response we replace with
    // the server's step log.
    panel.run({
      crew: "scan",
      title: "Scan · Claude + Genspark",
      steps: WAITING_STEPS,
      stepMs: 4500,
      autoDismissMs: null,
    });

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageDataUrl: image,
          metContext: metContext.trim() || null,
        }),
      });

      const json = (await res.json()) as ScanResult | ScanErrorResponse;

      if (!json.ok) {
        // Replay the server's partial steps (e.g. "Claude vision failed: ...")
        panel.run({
          crew: "scan",
          title: "Scan · couldn't read card",
          steps: json.steps.length > 0 ? json.steps : ["Couldn't process card"],
          stepMs: 350,
          autoDismissMs: 1500,
        });
        setErrorMessage(json.error);
        setMode("error");
        return;
      }

      // Success — replace the waiting animation with the real step log.
      panel.run({
        crew: "scan",
        title: "Scan · Claude + Genspark",
        steps: json.steps,
        stepMs: 450,
        autoDismissMs: null,
        onDone: () => setMode("done"),
      });
      setResult(json);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Network error. Try again.";
      panel.run({
        crew: "scan",
        title: "Scan · network error",
        steps: [`Request failed: ${msg}`],
        stepMs: 400,
        autoDismissMs: 1500,
      });
      setErrorMessage(msg);
      setMode("error");
    }
  }

  function reset() {
    stopCamera();
    panel.close();
    setImage(null);
    setMetContext("");
    setResult(null);
    setErrorMessage(null);
    setMode("idle");
    setCameraError(null);
  }

  const processedToday = fixtureCards.filter(
    (c) => c.state === "complete",
  ).length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-10">
        <div
          className="font-mono text-[10px] uppercase tracking-widest mb-3"
          style={{ color: "var(--coral)" }}
        >
          Crew · 01 · Scanner
        </div>
        <h1
          className="font-editorial text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight"
          style={{ fontWeight: 700, letterSpacing: "-0.03em" }}
        >
          Scan a card.
          <br />
          <span className="text-[var(--muted-strong)]">
            The Crew does the rest.
          </span>
        </h1>
        <p className="mt-4 text-sm md:text-base text-[var(--muted-strong)] leading-relaxed max-w-2xl">
          Snap a photo with your camera or drop a file. Claude reads the card,
          the web is searched for context, and — if there's an email — a warm
          follow-up is staged in your Gmail drafts for you to review in Morning
          Connect.
        </p>
      </header>

      {/* Main stage */}
      <div className="rounded-2xl border border-[var(--border)] bg-white overflow-hidden min-h-[480px] flex flex-col">
        {/* ─── Idle ─── */}
        {mode === "idle" ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 md:p-14 text-center">
            <div
              className="h-20 w-20 rounded-2xl flex items-center justify-center mb-6"
              style={{
                backgroundColor: "color-mix(in srgb, var(--coral) 14%, white)",
                border:
                  "1px solid color-mix(in srgb, var(--coral) 30%, transparent)",
              }}
            >
              <Camera
                className="h-8 w-8"
                style={{ color: "var(--coral)" }}
                strokeWidth={1.5}
              />
            </div>
            <h2
              className="font-editorial text-2xl md:text-3xl tracking-tight"
              style={{ fontWeight: 600 }}
            >
              Add a business card
            </h2>
            <p className="mt-3 text-sm text-[var(--muted-strong)] max-w-md leading-relaxed">
              Use your camera or upload a file. Both work on desktop and
              mobile. If camera permission is denied, upload still works.
            </p>
            {cameraError ? (
              <div
                className="mt-4 inline-flex items-center gap-2 text-xs font-mono rounded px-3 py-1.5"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--indigo) 10%, white)",
                  color: "var(--indigo)",
                }}
              >
                <AlertCircle className="h-3 w-3" strokeWidth={2} />
                {cameraError} · try Upload file
              </div>
            ) : null}
            <div className="mt-8 flex items-center gap-3 flex-wrap justify-center">
              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center gap-2 rounded-full text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "var(--coral)" }}
              >
                <Camera className="h-4 w-4" strokeWidth={2} /> Use camera
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors"
              >
                <Upload className="h-4 w-4" strokeWidth={2} /> Upload file
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFile}
                className="hidden"
              />
            </div>

            <div className="mt-8 font-mono text-[11px] uppercase tracking-widest text-[var(--muted)]">
              Processed today · {processedToday}
            </div>
          </div>
        ) : null}

        {/* ─── Camera ─── */}
        {mode === "camera" ? (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 bg-black relative overflow-hidden aspect-video max-h-[70vh]">
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                playsInline
                muted
              />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[70%] h-[45%] border-2 border-white/40 rounded-lg" />
              </div>
              <div className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-widest text-white/80 bg-black/40 backdrop-blur-sm rounded px-2 py-1">
                Align card within the guide
              </div>
            </div>
            <div className="p-5 flex items-center justify-center gap-6 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
              <button
                type="button"
                onClick={capture}
                className="h-14 w-14 rounded-full border-4 border-[var(--foreground)] bg-white hover:scale-105 transition-transform"
                aria-label="Capture"
              />
              <div className="w-[84px]" aria-hidden />
            </div>
          </div>
        ) : null}

        {/* ─── Preview / Processing / Done ─── */}
        {(mode === "preview" || mode === "processing" || mode === "done") &&
        image ? (
          <div className="flex-1 flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-8 p-6 md:p-8 flex-1">
              {/* Card preview */}
              <div
                className={`${mode === "preview" ? "md:w-[360px]" : "md:w-[220px]"} w-full transition-all`}
              >
                <div className="relative rounded-xl overflow-hidden shadow-md bg-[var(--paper)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt="captured card"
                    className="w-full h-auto"
                  />
                  {mode === "done" ? (
                    <div
                      className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--sage) 95%, white)",
                        color: "white",
                      }}
                    >
                      <Check className="h-3 w-3" strokeWidth={3} /> Filed
                    </div>
                  ) : null}
                </div>
                {mode === "processing" ? (
                  <div className="mt-3 flex items-center gap-2 font-mono text-xs text-[var(--muted-strong)]">
                    <Sparkles
                      className="h-3.5 w-3.5 anim-pulse-hot"
                      style={{ color: "var(--coral)" }}
                    />
                    Claude + Genspark working…
                  </div>
                ) : null}
              </div>

              {/* Result / preview */}
              <div className="min-w-0">
                {mode === "preview" ? (
                  <div className="h-full flex flex-col">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-3">
                        Ready to process
                      </div>
                      <h3
                        className="font-editorial text-xl md:text-2xl tracking-tight leading-tight mb-3"
                        style={{ fontWeight: 600 }}
                      >
                        Send this card to the Crew?
                      </h3>
                      <p className="text-sm text-[var(--muted-strong)] leading-relaxed mb-5">
                        Claude reads the card. Genspark enriches the company
                        from public web. If there&apos;s an email, a warm
                        follow-up is staged in Gmail drafts.
                      </p>

                      {/* Where did we meet? */}
                      <label className="block mb-5">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] block mb-1.5">
                          Where did you meet? <span className="normal-case tracking-normal">(optional)</span>
                        </span>
                        <input
                          type="text"
                          value={metContext}
                          onChange={(e) => setMetContext(e.target.value)}
                          placeholder="e.g. TOKEN2049 · reception · ABA dinner"
                          className="w-full rounded-lg border border-[var(--border)] bg-[var(--paper)]/40 p-2.5 text-sm focus:outline-none focus:border-[var(--coral)] transition-colors"
                        />
                        <span className="block mt-1.5 text-[11px] text-[var(--muted)] leading-relaxed">
                          Claude uses this to calibrate the follow-up draft. Skip if you don&apos;t want a draft.
                        </span>
                      </label>
                    </div>
                  </div>
                ) : null}

                {mode === "processing" ? (
                  <div className="font-mono text-xs text-[var(--muted-strong)] space-y-2">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-3">
                      In progress
                    </div>
                    <p className="leading-relaxed">
                      Watch the Genspark side panel on the right for live
                      progress. Claude + Genspark + Composio exchange ~6 steps
                      before the contact + draft land.
                    </p>
                  </div>
                ) : null}

                {mode === "done" && result ? (
                  <DoneView result={result} />
                ) : null}
              </div>
            </div>

            <div className="p-5 border-t border-[var(--border)] flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors"
                >
                  <RotateCcw className="h-4 w-4" strokeWidth={2} /> Scan another
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {mode === "preview" ? (
                  <button
                    type="button"
                    onClick={process}
                    className="inline-flex items-center gap-2 rounded-full text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "var(--coral)" }}
                  >
                    <Sparkles className="h-4 w-4" strokeWidth={2} /> Read with
                    Claude
                  </button>
                ) : null}
                {mode === "done" && result ? (
                  <>
                    <Link
                      href="/app/morning-connect"
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors"
                    >
                      Review in Morning Connect{" "}
                      <Mail className="h-4 w-4" strokeWidth={2} />
                    </Link>
                    <button
                      type="button"
                      onClick={reset}
                      className="inline-flex items-center gap-2 rounded-full text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: "var(--coral)" }}
                    >
                      <Camera className="h-4 w-4" strokeWidth={2} /> Next card
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {/* ─── Error state ─── */}
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
              Couldn&apos;t read this card clearly.
            </h2>
            <p className="mt-3 text-sm text-[var(--muted-strong)] max-w-md leading-relaxed">
              {errorMessage ??
                "Text was below the OCR-confidence threshold. Try another photo with better lighting, or enter the fields manually."}
            </p>

            <div className="mt-7 flex items-center gap-2">
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-mono uppercase tracking-wider text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors"
              >
                Try another photo
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Queue strip */}
      {mode !== "camera" && mode !== "error" ? (
        <section className="mt-8">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-4">
            Today&apos;s queue · {fixtureCards.length} cards
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {fixtureCards.map((card) => (
              <div
                key={card.id}
                className="rounded-xl border border-[var(--border)] bg-white p-3"
              >
                <div
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{
                    color:
                      card.state === "complete"
                        ? "var(--sage)"
                        : card.state === "error"
                          ? "var(--indigo)"
                          : "var(--coral)",
                  }}
                >
                  {card.state}
                </div>
                <div className="mt-1 text-xs text-[var(--foreground)] truncate">
                  {card.extracted?.name ?? card.filename}
                </div>
                {card.extracted?.company ? (
                  <div className="text-[10px] text-[var(--muted)] truncate">
                    {card.extracted.company}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function DoneView({ result }: { result: ScanResult }) {
  const { contact, enrichment, draft, extract } = result;

  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--sage)] mb-3 flex items-center gap-1.5">
        <Check className="h-3 w-3" strokeWidth={3} />
        Claude extracted {extract.found}/{extract.total} · confidence{" "}
        {extract.confidence}
      </div>
      <h3
        className="font-editorial text-xl md:text-2xl tracking-tight leading-tight mb-5"
        style={{ fontWeight: 600 }}
      >
        {contact.name}
      </h3>

      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mb-5">
        {(
          [
            ["title", contact.title],
            ["company", contact.company],
            ["email", contact.email],
            ["phone", contact.phone],
            ["linkedin", contact.linkedin],
            ["telegram", contact.telegram_handle],
          ] as const
        )
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div
              key={k}
              className="grid grid-cols-[88px_1fr] gap-3 items-start"
            >
              <dt className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] pt-0.5">
                {k}
              </dt>
              <dd className="text-sm text-[var(--foreground)] break-all">
                {v}
              </dd>
            </div>
          ))}
      </dl>

      {enrichment.status === "ok" ? (
        <div
          className="rounded-lg p-3 border font-mono text-[11px] leading-relaxed mb-3"
          style={{
            backgroundColor: "color-mix(in srgb, var(--sage) 6%, white)",
            borderColor: "color-mix(in srgb, var(--sage) 25%, transparent)",
            color: "var(--foreground)",
          }}
        >
          <span className="uppercase tracking-wider text-[var(--sage)] mr-1">
            Genspark:
          </span>
          {enrichment.company_summary}
        </div>
      ) : (
        <div className="rounded-lg p-3 border border-[var(--border)] font-mono text-[11px] leading-relaxed mb-3 text-[var(--muted)]">
          <span className="uppercase tracking-wider mr-1">Genspark:</span>
          skipped — {enrichment.reason}
        </div>
      )}

      {draft.status === "created" ? (
        <div
          className="rounded-lg p-3 border font-mono text-[11px] leading-relaxed"
          style={{
            backgroundColor: "color-mix(in srgb, var(--copper) 8%, white)",
            borderColor: "color-mix(in srgb, var(--copper) 28%, transparent)",
            color: "var(--foreground)",
          }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Mail
              className="h-3 w-3"
              style={{ color: "var(--copper)" }}
              strokeWidth={2.5}
            />
            <span className="uppercase tracking-wider text-[var(--copper)]">
              Gmail draft staged · review in Morning Connect
            </span>
            {draft.gmail_url ? (
              <a
                href={draft.gmail_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1 text-[var(--muted)] hover:text-[var(--copper)] transition-colors"
              >
                Open in Gmail
                <ExternalLink className="h-3 w-3" strokeWidth={2} />
              </a>
            ) : null}
          </div>
          <div className="text-[var(--muted-strong)] font-sans text-xs leading-relaxed whitespace-pre-wrap">
            <div className="mb-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
                Subject ·
              </span>{" "}
              {draft.subject}
            </div>
            {draft.body}
          </div>
        </div>
      ) : (
        <div className="rounded-lg p-3 border border-[var(--border)] font-mono text-[11px] leading-relaxed text-[var(--muted)]">
          <span className="uppercase tracking-wider mr-1">Draft:</span>
          skipped — {draft.reason}
        </div>
      )}
    </div>
  );
}
