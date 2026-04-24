/**
 * Messenger reply drafter — given a classified inbound + context, Claude
 * drafts a calibrated reply in Freddy's voice. Returns subject, body,
 * reasoning, and a "calibration trace" of short chips explaining why
 * this tone.
 *
 * Used by the Messenger pipeline: after classify, if tier is hot or warm
 * AND autonomy is Yellow (default), call this, then stage the draft in
 * Gmail (if channel=gmail) or in Supabase only (if channel=telegram).
 *
 * Sibling of claude-draft.ts (Scanner follow-up). Different contexts,
 * different prompts — kept separate for clarity.
 */

import type { Anthropic } from "@anthropic-ai/sdk";
import { anthropic, CLAUDE_MODEL } from "./anthropic";

export type MessengerDraft = {
  subject: string | null;
  body: string;
  reasoning: string;
  calibration_trace: string[];
};

type DrafterTier = "hot" | "warm" | "neutral" | "cooling" | "reactivation";

const WRITE_REPLY_TOOL: Anthropic.Messages.Tool = {
  name: "write_reply",
  description:
    "Write ONE short reply from the user to a contact who just messaged them. Calibrated to the Warmth tier + detected signals. Never prose — always call this tool.",
  input_schema: {
    type: "object",
    properties: {
      subject: {
        type: ["string", "null"],
        description:
          "Subject line if channel=gmail, null for telegram. ≤60 chars. Specific, not generic.",
      },
      body: {
        type: "string",
        description:
          "Reply body, under 80 words. Match the inbound energy. Specific next step. End with 'Freddy' on its own line.",
      },
      reasoning: {
        type: "string",
        description:
          "One paragraph (≤60 words) for the Morning Connect UI — explains why this tone and phrasing. User-facing, no jargon like 'score' or 'delta'.",
      },
      calibration_trace: {
        type: "array",
        items: { type: "string" },
        description:
          "2-5 short chip labels describing calibration choices. Examples: 'matched Hi!! → hot template', 'reused their word: collaboration', 'proposed this week (no specific slot)', 'no emojis back — matches their register'. Each ≤40 chars.",
      },
    },
    required: ["subject", "body", "reasoning", "calibration_trace"],
  },
};

const SYSTEM_PROMPT = [
  "You are drafting a reply on behalf of the user to an inbound message that just arrived on Telegram or Gmail.",
  "",
  "Your job: write ONE short reply calibrated to the Warmth tier + signals the classifier just detected. Call the write_reply tool — never return prose.",
  "",
  "## User voice (Freddy Lim) — match register, don't copy verbatim",
  "",
  "Warm post-event:",
  '  "Hey Maya, great meeting you at TOKEN2049! Loved what you said about the stablecoin liquidity gap. Want to grab a coffee next week — Tuesday or Thursday works for me. Where in town are you?"',
  "",
  "Partnership inbound reply:",
  '  "Hi Karim, thanks for reaching out. Polygon Labs looks interesting — reminds me of what we did with Stripe last year. Worth a 20-min call? I have Thursday 3pm SGT open."',
  "",
  "Cold resurrection:",
  '  "Hey Priya — been way too long. I know I dropped the ball after DevConnect. Here for a proper catch up if you are too — what does your Thursday look like?"',
  "",
  "## Cue-branching templates",
  "",
  "If the inbound is exactly `Hi` / `Hi!` / `Hi!!` AND it's a recent-meeting context (within 7 days), use the matching template as a base and personalise:",
  "  Hi  → 'Great to meet you yesterday — are we able to explore potential collaborations? Here is my deck.'",
  "  Hi! → 'Great to meet you yesterday! I'd really like a more in-depth discussion on what we talked about — here is my deck so you know more about me.'",
  "  Hi!! → 'Great to meet you yesterday! Shall we talk more about the collaboration details on what we discussed? Are you free this week? Here's my deck as a reminder btw!'",
  "",
  "## Tier rules",
  "",
  "  hot         → short, warm, matches their energy. Emojis IF they used them. '!!' ONLY if they used '!!'. Concrete next step (no specific calendar slot — say 'this week' / 'Thursday').",
  "  warm        → friendly, one specific thought per line, low-commitment ask.",
  "  neutral     → polite professional, no assumed familiarity, single question.",
  "  cooling     → acknowledge the gap, own it, soft reconnect.",
  "  reactivation→ resurrection tone. Don't pretend continuity. Reference when you last interacted if known.",
  "",
  "## Hard rules",
  "",
  "  · Under 80 words body.",
  "  · Never reference 'Warmth', 'score', 'classified', 'signals', 'delta' — the machinery stays in the backend.",
  "  · No em-dashes for decoration. Plain hyphens if needed.",
  "  · NEVER propose a specific calendar slot (Mailbox rule — the user commits their own time).",
  "  · End the body with 'Freddy' on its own line (the user signs off as Freddy).",
  "  · If you don't have enough context to personalise, keep it generic but still calibrated in tone.",
].join("\n");

type DraftInput = {
  contactName: string | null;
  contactCompany: string | null;
  contactEmail: string | null;
  metAt: string | null;
  inboundText: string;
  channel: "telegram" | "gmail";
  tier: DrafterTier;
  signalsDetected: string[];
  reasoning: string;
  warmthScore: number | null;
};

export async function draftMessengerReply(
  input: DraftInput,
): Promise<MessengerDraft> {
  const firstName = input.contactName?.split(/\s+/)[0] ?? null;

  const userMessage = [
    `## Context`,
    `Channel: ${input.channel}`,
    `Tier the classifier produced: ${input.tier}`,
    input.warmthScore != null
      ? `Contact's current Warmth: ${input.warmthScore}`
      : null,
    `Detected signals: ${input.signalsDetected.length > 0 ? input.signalsDetected.join(", ") : "(none)"}`,
    `Classifier's reasoning: ${input.reasoning}`,
    ``,
    `## Contact`,
    input.contactName ? `Name: ${input.contactName}` : null,
    firstName ? `Address them as: "${firstName}" (first name only)` : null,
    input.contactCompany ? `Company: ${input.contactCompany}` : null,
    input.metAt
      ? `How we met: ${input.metAt}`
      : "No met-at context on file — if they greet with Hi/Hi!/Hi!!, treat it as general reconnect not post-event unless their message says otherwise.",
    ``,
    `## Their inbound (verbatim)`,
    `"""`,
    input.inboundText,
    `"""`,
    ``,
    `Call the write_reply tool now.`,
  ]
    .filter(Boolean)
    .join("\n");

  const ant = anthropic();
  const response = await ant.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 768,
    system: SYSTEM_PROMPT,
    tools: [WRITE_REPLY_TOOL],
    tool_choice: { type: "tool", name: "write_reply" },
    messages: [{ role: "user", content: userMessage }],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.Messages.ToolUseBlock =>
      block.type === "tool_use" && block.name === "write_reply",
  );

  if (!toolUse) {
    throw new Error("Claude did not return a structured reply draft.");
  }

  const raw = toolUse.input as MessengerDraft;

  if (typeof raw.body !== "string" || !raw.body.trim()) {
    throw new Error("Claude returned an empty draft body.");
  }

  return {
    subject:
      typeof raw.subject === "string" && raw.subject.trim().length > 0
        ? raw.subject.trim()
        : input.channel === "gmail"
          ? `Re: ${input.contactName ?? "your message"}`
          : null,
    body: raw.body.trim(),
    reasoning:
      typeof raw.reasoning === "string" && raw.reasoning.trim().length > 0
        ? raw.reasoning.trim()
        : `Calibrated reply for ${input.tier} tier.`,
    calibration_trace: Array.isArray(raw.calibration_trace)
      ? raw.calibration_trace
          .slice(0, 5)
          .map((c) => String(c).slice(0, 40))
          .filter(Boolean)
      : [],
  };
}
