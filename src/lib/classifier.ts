/**
 * Messenger classifier — the Warmth Index IP.
 *
 * Reads one inbound message and scores it against the behavioural
 * signal taxonomy (CLAUDE.md §5). For the MVP we evaluate 5 of the 11
 * categories — the remaining 6 are architecture-slide-only.
 *
 * Output is structured JSON via Claude's tool_use — never prose.
 * Cross-cultural calibration is prompt-level (Claude already knows
 * language conventions; we just instruct it to calibrate).
 */

import type { Anthropic } from "@anthropic-ai/sdk";
import { anthropic, CLAUDE_MODEL } from "./anthropic";
import { clampDelta } from "./warmth";

export type Channel = "telegram" | "whatsapp" | "gmail" | "linkedin" | "card";

export type Classification = {
  deltas: {
    punctuation: number | null;
    greeting: number | null;
    emoji: number | null;
    response_time: number | null;
    channel: number | null;
  };
  /** Sum of non-null deltas, clamped to ±10 per-event. */
  net_delta: number;
  classification: "hot" | "warm" | "neutral" | "cooling" | "reactivation";
  /** User-facing explanation — ≤ 60 words, no "score" / "delta" jargon. */
  reasoning: string;
  confidence: number;
  confidence_warning: boolean;
  /** Short chip labels for the UI. */
  signals_detected: string[];
  /** BCP47 tag; "und" if unknown. */
  language_detected: string;
};

const CLASSIFY_TOOL: Anthropic.Messages.Tool = {
  name: "classify_signal",
  description:
    "File the classification of an inbound Messenger message against the 11-category behavioural taxonomy. Score only the 5 MVP categories — leave others at null.",
  input_schema: {
    type: "object",
    properties: {
      deltas: {
        type: "object",
        properties: {
          punctuation: {
            type: ["integer", "null"],
            minimum: -6,
            maximum: 6,
            description:
              "Punctuation: Hi!! +6 · Hi! +3 · Hi +1 · Hi. 0 · Hi... -1 · Hi.. -2. Calibrate for non-English.",
          },
          greeting: {
            type: ["integer", "null"],
            minimum: -3,
            maximum: 3,
            description:
              "Greeting style: 'Hey [name]' +1 · 'Hi [name]' 0 · 'Dear [name]' -1 · '[name],' -2. null if no greeting.",
          },
          emoji: {
            type: ["integer", "null"],
            minimum: -3,
            maximum: 3,
            description:
              "Emoji sentiment + density. 🔥🙏😂👍 +1..+3 · none 0 · sarcastic (🙃👀) -2. null if ambiguous.",
          },
          response_time: {
            type: ["integer", "null"],
            minimum: -3,
            maximum: 3,
            description:
              "Against the user's last outbound: <5min +2 · <1hr +1 · <24hr 0 · <3d -1 · >7d -3. null if no prior context.",
          },
          channel: {
            type: ["integer", "null"],
            minimum: -2,
            maximum: 2,
            description:
              "Channel choice: Telegram / WhatsApp personal +1 or +2 · LinkedIn 0 · calendar-only -1. null if unclear.",
          },
        },
        required: [
          "punctuation",
          "greeting",
          "emoji",
          "response_time",
          "channel",
        ],
      },
      net_delta: {
        type: "integer",
        description:
          "Sum of all non-null deltas, clamped to ±10 per-event (caller will re-clamp defensively).",
      },
      classification: {
        type: "string",
        enum: ["hot", "warm", "neutral", "cooling", "reactivation"],
        description:
          "Overall tier: hot (net>=+5), warm (+2..+4), neutral (-1..+1), cooling (-2..-4), reactivation (<=-5 AND first-in-a-while).",
      },
      reasoning: {
        type: "string",
        description:
          "≤60 words, user-facing plain English. Reference the observed behaviour, not the scoring system. Never use the words 'score', 'delta', 'warmth', 'classification'.",
      },
      confidence: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description:
          "How confident you are in the classification. <0.6 if the message is very short / ambiguous / culturally hard to calibrate.",
      },
      confidence_warning: {
        type: "boolean",
        description:
          "True when confidence<0.6 — caller will clamp deltas to ±2 and flag in the UI.",
      },
      signals_detected: {
        type: "array",
        items: { type: "string" },
        description:
          "Short labels (≤24 chars each) for UI chips. Examples: 'Hi!!', '🔥', '2-min reply', 'Telegram', 'post-event'. Order from most to least salient.",
      },
      language_detected: {
        type: "string",
        description:
          "BCP47 tag (en, ja, zh-Hans, ko, ...). 'und' if you cannot tell.",
      },
    },
    required: [
      "deltas",
      "net_delta",
      "classification",
      "reasoning",
      "confidence",
      "confidence_warning",
      "signals_detected",
      "language_detected",
    ],
  },
};

const SYSTEM_PROMPT = [
  "You are the Messenger classifier for Connect Crew. You read inbound messages for the user and score them on behavioural signals that feed a 0-100 Warmth Index per contact.",
  "",
  "Call the `classify_signal` tool with structured output — never return prose.",
  "",
  "For the MVP, you score ONLY these 5 of 11 categories. Leave the others at null. Do not invent categories.",
  "  1. Punctuation     Hi!! +6 · Hi! +3 · Hi +1 · Hi. 0 · Hi... -1 · Hi.. -2",
  "  2. Greeting style  'Hey [name]' +1 · 'Hi [name]' 0 · 'Dear [name]' -1 · '[name],' -2",
  "  3. Emoji usage     🔥🙏😂👍 positive +1..+3 by density · none 0 · sarcastic (🙃👀) -2",
  "  4. Response time   <5min +2 · <1hr +1 · <24hr 0 · <3d -1 · >7d -3 (null if no last-outbound context given)",
  "  5. Channel choice  Telegram/WhatsApp personal +1 or +2 · LinkedIn 0 · calendar-only -1",
  "",
  "Cross-cultural calibration:",
  "  · For Japanese/Chinese/Korean messages, `!!` reads differently than in English — Japanese `!!` can be effusive to the point of informal-rude in business contexts. Don't apply English `!!=+6` blindly.",
  "  · 'お疲れ様です' is a warm professional Japanese greeting — treat as +1 greeting, not punctuation.",
  "  · Chinese formal greetings are terser by default — score baseline neutral rather than cold.",
  "",
  "Safety:",
  "  · Never score a category you don't have evidence for — return null.",
  "  · If confidence < 0.6, clamp each non-null delta to max ±2 and set confidence_warning: true.",
  "  · In `reasoning`, reference the observed behaviour (e.g. 'double exclamation + 🔥 + reply under 2 minutes'), never the scoring jargon.",
].join("\n");

type ClassifyInput = {
  text: string;
  channel: Channel;
  /** Seconds since the user's last outbound to this contact. Null if unknown. */
  response_time_seconds?: number | null;
  /** Contact's display name — helps Claude recognise greetings like "Hi Freddy". */
  user_first_name?: string | null;
};

export async function classifyMessage(
  input: ClassifyInput,
): Promise<Classification> {
  const userMessage = [
    `Channel: ${input.channel}`,
    input.response_time_seconds != null
      ? `Reply came ${formatResponseTime(input.response_time_seconds)} after the user's last outbound message.`
      : `No prior outbound from the user — cannot score response_time; return null for that category.`,
    input.user_first_name
      ? `The user's first name is "${input.user_first_name}" — use this to recognise personal greetings.`
      : null,
    ``,
    `Inbound message (verbatim):`,
    `"""`,
    input.text,
    `"""`,
    ``,
    `Call the classify_signal tool now.`,
  ]
    .filter(Boolean)
    .join("\n");

  const ant = anthropic();
  const response = await ant.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 768,
    system: SYSTEM_PROMPT,
    tools: [CLASSIFY_TOOL],
    tool_choice: { type: "tool", name: "classify_signal" },
    messages: [{ role: "user", content: userMessage }],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.Messages.ToolUseBlock =>
      block.type === "tool_use" && block.name === "classify_signal",
  );

  if (!toolUse) {
    throw new Error("Claude did not return a structured classification.");
  }

  const raw = toolUse.input as Classification;

  // Defensive normalisation — re-clamp deltas in case the model drifted,
  // and apply confidence_warning clamp on the server side (belt-and-suspenders).
  const clamp = (v: number | null | undefined, warning: boolean): number | null => {
    if (v == null) return null;
    const capped = warning ? Math.max(-2, Math.min(2, v)) : v;
    return Math.round(capped);
  };

  const warning = !!raw.confidence_warning || (raw.confidence ?? 0) < 0.6;

  const deltas = {
    punctuation: clamp(raw.deltas?.punctuation ?? null, warning),
    greeting: clamp(raw.deltas?.greeting ?? null, warning),
    emoji: clamp(raw.deltas?.emoji ?? null, warning),
    response_time: clamp(raw.deltas?.response_time ?? null, warning),
    channel: clamp(raw.deltas?.channel ?? null, warning),
  };

  const sum = Object.values(deltas).reduce<number>(
    (acc, v) => acc + (v ?? 0),
    0,
  );
  const net_delta = clampDelta(sum);

  return {
    deltas,
    net_delta,
    classification: raw.classification,
    reasoning:
      typeof raw.reasoning === "string" && raw.reasoning.trim().length > 0
        ? raw.reasoning.trim()
        : "Classified from message tone.",
    confidence: typeof raw.confidence === "number" ? raw.confidence : 0.7,
    confidence_warning: warning,
    signals_detected: Array.isArray(raw.signals_detected)
      ? raw.signals_detected.slice(0, 8).map((s) => String(s).slice(0, 24))
      : [],
    language_detected:
      typeof raw.language_detected === "string" ? raw.language_detected : "und",
  };
}

function formatResponseTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86_400) return `${Math.round(seconds / 3600)} hours`;
  const days = seconds / 86_400;
  if (days < 14) return `${days.toFixed(1)} days`;
  return `${Math.round(days)} days`;
}
