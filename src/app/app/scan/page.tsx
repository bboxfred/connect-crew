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
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { fixtureCards } from "@/lib/fixtures";
import { useGensparkPanel } from "@/components/genspark-side-panel";

type Mode = "idle" | "camera" | "preview" | "processing" | "done" | "error";

// The pre-scripted Genspark log for the demo. In live mode these come
// back from real Claude + Genspark calls. Sources are deliberately
// public-web-legal — no LinkedIn scraping, no gray-area data brokers.
const GENSPARK_STEPS = [
  "Claude reading card image",
  "Claude extracting fields · 7 found",
  "Genspark reading Helix Tech homepage",
  "Genspark checking Crunchbase · Series A Feb 2025",
  "Genspark searching recent press · 2 articles",
  "Genspark finding mutual connections in your graph",
  "Claude writing enriched profile",
];

// Pre-built fixture result Scan reveals on a successful stub run.
// Enrichment preview pulls only from public-web-legal sources —
// company site + Crunchbase + press + internal graph mutuals.
const RESULT = {
  name: "Sofia Alencar",
  title: "Head of Partnerships",
  company: "Helix Tech",
  email: "sofia@helix.tech",
  phone: "+65 9123 4567",
  linkedin: "/in/sofia-alencar-helix",
  enrichment_preview:
    "Sequoia SEA Series A, Feb 2025 (Crunchbase + press). 2 mutuals in your graph: Marcus Low, Priya Raghavan.",
  contact_id: "sofia",
};

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>("idle");
  const [image, setImage] = useState<string | null>(null);
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
    setImage(canvas.toDataURL("image/jpeg", 0.9));
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

  function process() {
    setMode("processing");
    panel.run({
      crew: "scan",
      title: "Scan · Claude + Genspark",
      steps: GENSPARK_STEPS,
      stepMs: 550,
      autoDismissMs: null, // keep visible until we reset
      onDone: () => {
        setMode("done");
      },
    });
  }

  function reset() {
    stopCamera();
    panel.close();
    setImage(null);
    setMode("idle");
    setCameraError(null);
  }

  function simulateError() {
    setMode("error");
  }

  const processedToday = fixtureCards.filter((c) => c.state === "complete").length;

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
          <span className="text-[var(--muted-strong)]">The Crew does the rest.</span>
        </h1>
        <p className="mt-4 text-sm md:text-base text-[var(--muted-strong)] leading-relaxed max-w-2xl">
          Snap a photo with your camera or drop a file. Claude reads the card,
          the web is searched for context, and the enriched record files
          itself into your graph.
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
                border: "1px solid color-mix(in srgb, var(--coral) 30%, transparent)",
              }}
            >
              <Camera className="h-8 w-8" style={{ color: "var(--coral)" }} strokeWidth={1.5} />
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
                  backgroundColor: "color-mix(in srgb, var(--indigo) 10%, white)",
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
              {/* Framing guide */}
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
              {/* Card preview (shrinks after processing starts) */}
              <div className={`${mode === "preview" ? "md:w-[360px]" : "md:w-[200px]"} w-full transition-all`}>
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
                        backgroundColor: "color-mix(in srgb, var(--sage) 95%, white)",
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
                    Claude is reading…
                  </div>
                ) : null}
              </div>

              {/* Result / empty */}
              <div className="min-w-0">
                {mode === "preview" ? (
                  <div className="h-full flex flex-col justify-between">
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
                      <p className="text-sm text-[var(--muted-strong)] leading-relaxed">
                        Claude will read the card and extract fields.
                        Genspark will enrich with LinkedIn, company, and
                        mutual-connection data. You'll see each step in the
                        side panel.
                      </p>
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
                      progress. Claude + Genspark will exchange ~6 steps
                      before the enriched profile lands.
                    </p>
                  </div>
                ) : null}

                {mode === "done" ? (
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--sage)] mb-3 flex items-center gap-1.5">
                      <Check className="h-3 w-3" strokeWidth={3} />
                      Claude extracted · Genspark enriched
                    </div>
                    <h3
                      className="font-editorial text-xl md:text-2xl tracking-tight leading-tight mb-5"
                      style={{ fontWeight: 600 }}
                    >
                      {RESULT.name}
                    </h3>

                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mb-5">
                      {(
                        [
                          ["title", RESULT.title],
                          ["company", RESULT.company],
                          ["email", RESULT.email],
                          ["phone", RESULT.phone],
                          ["linkedin", RESULT.linkedin],
                        ] as const
                      ).map(([k, v]) => (
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

                    <div
                      className="rounded-lg p-3 border font-mono text-[11px] leading-relaxed"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--sage) 6%, white)",
                        borderColor: "color-mix(in srgb, var(--sage) 25%, transparent)",
                        color: "var(--foreground)",
                      }}
                    >
                      <span className="uppercase tracking-wider text-[var(--sage)] mr-1">
                        Genspark note:
                      </span>
                      {RESULT.enrichment_preview}
                    </div>
                  </div>
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
                {mode === "preview" ? (
                  <button
                    type="button"
                    onClick={simulateError}
                    className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors ml-2"
                    title="Trigger error state (demo)"
                  >
                    demo: trigger error
                  </button>
                ) : null}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {mode === "preview" ? (
                  <button
                    type="button"
                    onClick={process}
                    className="inline-flex items-center gap-2 rounded-full text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "var(--coral)" }}
                  >
                    <Sparkles className="h-4 w-4" strokeWidth={2} /> Read with Claude
                  </button>
                ) : null}
                {mode === "done" ? (
                  <>
                    <Link
                      href={`/app/contacts/${RESULT.contact_id}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors"
                    >
                      View contact <ArrowRight className="h-4 w-4" strokeWidth={2} />
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
                border: "1px solid color-mix(in srgb, var(--indigo) 30%, transparent)",
              }}
            >
              <AlertCircle className="h-7 w-7" style={{ color: "var(--indigo)" }} strokeWidth={1.5} />
            </div>
            <h2
              className="font-editorial text-2xl tracking-tight"
              style={{ fontWeight: 600 }}
            >
              Couldn't read this card clearly.
            </h2>
            <p className="mt-3 text-sm text-[var(--muted-strong)] max-w-md leading-relaxed">
              Text was below the OCR-confidence threshold. Try another photo
              with better lighting, or enter the fields manually.
            </p>

            <form className="mt-7 w-full max-w-md space-y-3 text-left">
              <ManualField label="Name" />
              <ManualField label="Title" />
              <ManualField label="Company" />
              <ManualField label="Email" />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-mono uppercase tracking-wider text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full text-white px-4 py-2 text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "var(--coral)" }}
                >
                  Save manually
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </div>

      {/* Queue strip */}
      {mode !== "camera" && mode !== "error" ? (
        <section className="mt-8">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-4">
            Today's queue · {fixtureCards.length} cards
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

function ManualField({ label }: { label: string }) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] block mb-1.5">
        {label}
      </label>
      <input
        type="text"
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--paper)]/40 p-2 text-sm focus:outline-none focus:border-[var(--coral)] transition-colors"
      />
    </div>
  );
}
