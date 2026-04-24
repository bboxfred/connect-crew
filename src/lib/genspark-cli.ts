/**
 * Genspark CLI wrapper — shells out to @genspark/cli (gsk binary).
 *
 * The Genspark REST API isn't publicly documented, but the official
 * @genspark/cli npm package (published April 23, 2026 by mainfunc.ai)
 * wraps it and emits JSON on stdout. We spawn it as a Node subprocess,
 * capture stdout, parse JSON, and return a typed result.
 *
 * Used for company enrichment during Scanner (web search) and for image
 * generation (nano-banana-pro, nano-banana-2, etc.) for Crew portraits.
 *
 * Auth: reads GSK_API_KEY from process.env. If only GENSPARK_API_KEY is
 * set (legacy env name), we fall back to that and pass it as GSK_API_KEY
 * to the child.
 *
 * Serverless note: the CLI binary lives at
 * node_modules/@genspark/cli/dist/index.js. next.config.ts has
 * outputFileTracingIncludes + serverExternalPackages entries to ensure
 * it's present on Vercel at runtime.
 */

import { spawn } from "node:child_process";
import path from "node:path";

const CLI_BIN = path.join(
  process.cwd(),
  "node_modules",
  "@genspark",
  "cli",
  "dist",
  "index.js",
);

type GskRunResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; reason: string; code: number | null };

async function runGsk<T = unknown>(
  args: string[],
  timeoutMs = 30_000,
): Promise<GskRunResult<T>> {
  return new Promise((resolve) => {
    const gskKey = process.env.GSK_API_KEY ?? process.env.GENSPARK_API_KEY;
    if (!gskKey) {
      resolve({
        ok: false,
        reason: "GSK_API_KEY not set (or GENSPARK_API_KEY fallback)",
        code: null,
      });
      return;
    }

    const child = spawn(process.execPath, [CLI_BIN, ...args], {
      env: {
        ...process.env,
        GSK_API_KEY: gskKey,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      setTimeout(() => {
        if (!child.killed) child.kill("SIGKILL");
      }, 3000).unref();
    }, timeoutMs);

    child.stdout.on("data", (d: Buffer) => stdoutChunks.push(d));
    child.stderr.on("data", (d: Buffer) => stderrChunks.push(d));

    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({
        ok: false,
        reason: `spawn error: ${err.message}`,
        code: null,
      });
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      const stdout = Buffer.concat(stdoutChunks).toString("utf8");
      const stderr = Buffer.concat(stderrChunks).toString("utf8");

      if (code !== 0) {
        const snippet = (stderr || stdout)
          .trim()
          .split("\n")
          .slice(-3)
          .join(" · ")
          .slice(0, 240);
        resolve({
          ok: false,
          reason: snippet || `gsk exited with code ${code}`,
          code,
        });
        return;
      }

      try {
        const data = JSON.parse(stdout) as T;
        resolve({ ok: true, data });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "parse error";
        resolve({
          ok: false,
          reason: `stdout not JSON (${msg})`,
          code,
        });
      }
    });
  });
}

// ── Web search → company enrichment ───────────────────────────────────────

export type CompanyResearch =
  | {
      status: "ok";
      company_summary: string;
      sources_cited: string[];
      top_results: Array<{
        title: string;
        link: string;
        snippet: string;
        date: string;
      }>;
    }
  | {
      status: "skipped";
      reason: string;
    };

type GskSearchResponse = {
  status?: string;
  data?: {
    organic_results?: Array<{
      title?: string;
      link?: string;
      snippet?: string;
      date?: string;
    }>;
  };
};

export async function researchCompany(input: {
  name: string;
  company: string | null;
  website?: string | null;
  twitter?: string | null;
}): Promise<CompanyResearch> {
  if (!input.company) {
    return { status: "skipped", reason: "no company on card" };
  }

  // Construct a narrow, context-rich query. The CLI search returns
  // standard SERP results — we pick top 3 and format them as the
  // enrichment summary.
  const query = `${input.company} ${input.name} company funding news overview`;

  const result = await runGsk<GskSearchResponse>(["search", query], 25_000);

  if (!result.ok) {
    console.error("[genspark-cli] search failed:", result.reason);
    return { status: "skipped", reason: result.reason };
  }

  const organic = result.data?.data?.organic_results ?? [];
  if (organic.length === 0) {
    return {
      status: "skipped",
      reason: "no search results for this company",
    };
  }

  const top = organic.slice(0, 3).map((r) => ({
    title: (r.title ?? "(untitled)").trim(),
    link: (r.link ?? "").trim(),
    snippet: (r.snippet ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 260),
    date: (r.date ?? "").trim(),
  }));

  // Build a readable 3-point summary from the SERP. Narrative: "top
  // sources Genspark found, in reading order".
  const summary = top
    .map((r, i) => {
      const dateNote = r.date ? ` (${r.date})` : "";
      return `${i + 1}. ${r.title}${dateNote} — ${r.snippet}`;
    })
    .join("\n");

  const hostnames = new Set<string>();
  for (const r of top) {
    if (!r.link) continue;
    try {
      hostnames.add(new URL(r.link).hostname.replace(/^www\./, ""));
    } catch {
      /* ignore malformed URLs */
    }
  }

  return {
    status: "ok",
    company_summary: summary,
    sources_cited: [...hostnames],
    top_results: top,
  };
}

// ── Image generation (for Crew portraits / ad-hoc assets) ────────────────

export type ImageGenResult =
  | { status: "ok"; path: string; model: string }
  | { status: "skipped"; reason: string };

/**
 * Generate an image via Genspark CLI. Defaults to nano-banana-pro
 * (Gemini 3 Pro Image — SOTA for generation + editing). Output is
 * written to the given filesystem path by the CLI itself.
 */
export async function generateImage(input: {
  prompt: string;
  outPath: string;
  model?: "nano-banana-pro" | "nano-banana-2" | "gpt-image-2" | "imagen4";
}): Promise<ImageGenResult> {
  const model = input.model ?? "nano-banana-pro";
  const result = await runGsk<unknown>(
    ["img", input.prompt, "-m", model, "-o", input.outPath],
    90_000,
  );
  if (!result.ok) {
    return { status: "skipped", reason: result.reason };
  }
  return { status: "ok", path: input.outPath, model };
}
