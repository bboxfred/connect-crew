/**
 * Claude draft writer — post-scan warm follow-up email.
 *
 * Called after Scanner extracts a card. If the contact has an email,
 * this drafts a short, voice-matched "great meeting you" email. The
 * draft goes to Gmail Drafts (via Composio) and lands in Morning
 * Connect for the user to approve / edit / delete. Never auto-sends.
 *
 * Voice is calibrated from CLAUDE.md §17 — warm, direct, references
 * specific event/context, ends with a concrete next step. "!" for
 * warm, "!!" reserved for genuinely hot (not used here — first meeting
 * is warm, not hot).
 */

import type { Anthropic } from "@anthropic-ai/sdk";
import { anthropic, CLAUDE_MODEL } from "./anthropic";
import type { CardExtract } from "./claude-vision";

export type ScannerDraft = {
  subject: string;
  body: string;
  reasoning: string;
};

const WRITE_DRAFT_TOOL: Anthropic.Messages.Tool = {
  name: "write_followup",
  description:
    "Write a short warm follow-up email from the user to the person whose business card was just scanned. Output subject + body + one-line reasoning.",
  input_schema: {
    type: "object",
    properties: {
      subject: {
        type: "string",
        description:
          "Email subject line. Short, specific. No exclamation marks. Examples: 'Great meeting you at TOKEN2049' · 'Following up — Helix Tech'",
      },
      body: {
        type: "string",
        description:
          "Email body. Under 80 words. Opens warmly with first name. References where they met if known. Mentions something specific from the card (role, company). Ends with a concrete next step (short call, coffee, specific follow-up). No corporate jargon. No em-dashes for decoration. Uses '!' sparingly — at most once, in the greeting. Never '!!'.",
      },
      reasoning: {
        type: "string",
        description:
          "One sentence explaining the tone + next-step choice. Will be shown to the user next to the draft in Morning Connect.",
      },
    },
    required: ["subject", "body", "reasoning"],
  },
};

// Freddy's voice samples from CLAUDE.md §17. Inlined so the lib is
// self-contained; will move to Profile table in Phase 3B.
const VOICE_EXAMPLES = [
  {
    scenario: "Warm follow-up after an event",
    text: "Hey Maya, great meeting you at TOKEN2049! Loved what you said about the stablecoin liquidity gap. Want to grab a coffee next week — Tuesday or Thursday works for me. Where in town are you?",
  },
  {
    scenario: "Partnership inbound reply",
    text: "Hi Karim, thanks for reaching out. Looks interesting — reminds me of what we did with Polygon last year. Worth a 20-min call? I have Thursday 3pm SGT open.",
  },
  {
    scenario: "Cold resurrection after long silence",
    text: "Hey Priya — been way too long. I know I dropped the ball after DevConnect. Here for a proper catch up if you are too — what does your Thursday look like?",
  },
];

export async function draftScannerFollowup(input: {
  contact: CardExtract;
  metContext?: string | null;
  userName?: string;
}): Promise<ScannerDraft> {
  const { contact, metContext, userName = "Freddy" } = input;

  if (!contact.email) {
    throw new Error(
      "Cannot draft a follow-up: no email on the card. Caller should skip the draft step.",
    );
  }
  if (!contact.name) {
    throw new Error(
      "Cannot draft a follow-up: no recipient name on the card.",
    );
  }

  const firstName = contact.name.split(/\s+/)[0];
  const metBlurb = metContext?.trim()
    ? `The user just met them at: ${metContext.trim()}.`
    : "The user just met them today — exact event is unknown, so keep the greeting generic (e.g. 'great meeting you today').";

  const userMessage = [
    "You're writing a warm follow-up email on behalf of the user to someone whose business card they just scanned.",
    "",
    "## Recipient",
    `Name: ${contact.name}`,
    contact.title ? `Title: ${contact.title}` : null,
    contact.company ? `Company: ${contact.company}` : null,
    contact.notes ? `Card tagline / extras: ${contact.notes}` : null,
    "",
    "## Context",
    metBlurb,
    "",
    "## Your voice (match the register, don't copy verbatim)",
    ...VOICE_EXAMPLES.map((v) => `- [${v.scenario}] ${v.text}`),
    "",
    "## Rules",
    `- Signed off by: ${userName} (do not include a full signature block — just the first name at the end)`,
    `- Address the recipient as "${firstName}" (first name only).`,
    "- Body strictly under 80 words.",
    "- One warm greeting. One specific line tied to their card or the meeting context. One concrete next-step offer.",
    "- Never reference the Warmth Index, classification, or that this was AI-drafted.",
    "- No em-dashes for decoration. Plain hyphens only if punctuation is needed.",
    "- '!' is fine once. Never '!!' (first meeting is warm, not hot).",
    "",
    "Call the write_followup tool.",
  ]
    .filter(Boolean)
    .join("\n");

  const ant = anthropic();
  const response = await ant.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 768,
    tools: [WRITE_DRAFT_TOOL],
    tool_choice: { type: "tool", name: "write_followup" },
    messages: [{ role: "user", content: userMessage }],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.Messages.ToolUseBlock =>
      block.type === "tool_use" && block.name === "write_followup",
  );

  if (!toolUse) {
    throw new Error(
      "Claude did not return a structured draft. Skipping draft step — user can draft manually later.",
    );
  }

  const draft = toolUse.input as ScannerDraft;

  // Defensive: ensure all fields are strings.
  if (typeof draft.subject !== "string" || !draft.subject.trim()) {
    draft.subject = `Great meeting you${contact.company ? ` — ${contact.company}` : ""}`;
  }
  if (typeof draft.body !== "string" || !draft.body.trim()) {
    throw new Error("Claude returned an empty draft body.");
  }
  if (typeof draft.reasoning !== "string") {
    draft.reasoning = "Warm first-meeting follow-up, low-commitment next step.";
  }

  return draft;
}
