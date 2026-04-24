/**
 * Scribe contact-email drafter.
 *
 * Takes a transcript of the user's voice note (about someone they need
 * to follow up with) PLUS the user's existing contacts list. Asks Claude
 * to identify WHICH contact the note is about and draft a follow-up
 * email TO them based on the note's content.
 *
 * If the referenced person isn't in the contact list, match_contact_id
 * is null and the UI prompts the user to Scan the card first.
 *
 * Used by /api/scribe — the upstream transcription step lives in
 * genspark-cli.ts.
 */

import type { Anthropic } from "@anthropic-ai/sdk";
import { anthropic, CLAUDE_MODEL } from "./anthropic";

export type ScribeContactCandidate = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  telegram_handle: string | null;
  met_at: string | null;
};

export type ScribeDraft = {
  matched_contact_id: string | null;
  match_confidence: number;
  why_this_contact: string;
  subject: string;
  body: string;
  reasoning: string;
};

const DRAFT_TOOL: Anthropic.Messages.Tool = {
  name: "draft_contact_email",
  description:
    "Identify which contact this voice note is about and draft a follow-up email to them. Return null for matched_contact_id if the referenced person isn't in the provided contact list.",
  input_schema: {
    type: "object",
    properties: {
      matched_contact_id: {
        type: ["string", "null"],
        description:
          "The id of the contact this voice note is about. Use null if no contact in the provided list clearly matches — don't guess.",
      },
      match_confidence: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description:
          "How confident you are in the match. 0 when matched_contact_id is null.",
      },
      why_this_contact: {
        type: "string",
        description:
          "One short sentence explaining WHY you matched this contact (e.g. 'name + company both mentioned', 'first-name match with recent Scanner entry'). Shown to the user so they can verify.",
      },
      subject: {
        type: "string",
        description:
          "Email subject line. Short, specific. Under 70 chars. Examples: 'Following up on the deck', 'Thursday coffee?', 'Re: your team hiring plans'.",
      },
      body: {
        type: "string",
        description:
          "Email body in the user's voice. Under 120 words. Addresses the contact by first name. Covers what the voice note asked — delivering a promised doc, proposing a meeting, answering a question, etc. Ends with 'Freddy' on its own line. No specific calendar slots (say 'this week' or 'Thursday').",
      },
      reasoning: {
        type: "string",
        description:
          "One paragraph (≤60 words) explaining why this email, why this tone. Shown in Morning Connect.",
      },
    },
    required: [
      "matched_contact_id",
      "match_confidence",
      "why_this_contact",
      "subject",
      "body",
      "reasoning",
    ],
  },
};

const SYSTEM_PROMPT = [
  "You are Scribe, the Connect Crew member who turns voice notes into follow-up emails.",
  "",
  "The user records a voice note about someone they need to follow up with — 'Met Sofia at Standard Chartered, need to send her the deck'. Your job:",
  "  1. Identify WHICH of the user's existing contacts the note is about",
  "  2. Draft a short follow-up email TO that contact covering what the note asked for",
  "",
  "Call the `draft_contact_email` tool — never return prose.",
  "",
  "Matching rules:",
  "  · ONLY match to a contact in the provided list. If the referenced person isn't in the list, return matched_contact_id=null with confidence 0. Do NOT hallucinate a contact_id.",
  "  · Match on first name + any of (company, context, topic). Single-name-only matches only work if there's exactly one contact with that first name.",
  "  · If two contacts share a name, look for disambiguating context (company, where they met).",
  "  · why_this_contact should cite the evidence (e.g. 'name + company both match').",
  "",
  "Draft rules:",
  "  · Under 120 words, in the user's voice (Freddy — warm, direct, no corporate jargon, '!' sparingly, never '!!').",
  "  · Open with their first name.",
  "  · Cover what the voice note asked for: deliver the promised thing, propose the meeting, answer the question.",
  "  · End with 'Freddy' on its own line.",
  "  · NEVER propose a specific calendar slot — say 'this week', 'Thursday', etc.",
  "  · No em-dashes for decoration. No AI-tells.",
].join("\n");

export async function draftContactEmailFromNote(input: {
  transcript: string;
  contacts: ScribeContactCandidate[];
  userFirstName?: string;
}): Promise<ScribeDraft> {
  if (!input.transcript || input.transcript.trim().length < 10) {
    throw new Error("Transcript too short to extract anything actionable.");
  }
  const userFirstName = input.userFirstName ?? "Freddy";

  // Compact contact list to save tokens. Include only the fields that
  // matter for matching + drafting.
  const contactLines = input.contacts.slice(0, 80).map((c) => {
    const parts = [
      `id=${c.id}`,
      `name=${c.name}`,
      c.company ? `company=${c.company}` : null,
      c.email ? `email=${c.email}` : null,
      c.met_at ? `met=${c.met_at}` : null,
    ].filter(Boolean);
    return `  · ${parts.join(" | ")}`;
  });

  const userMessage = [
    `## Existing contacts (${input.contacts.length} total, showing up to 80)`,
    contactLines.length > 0 ? contactLines.join("\n") : "  (no contacts yet)",
    "",
    `## The user's voice note (verbatim transcript)`,
    `"""`,
    input.transcript.slice(0, 8000),
    `"""`,
    "",
    `User signs off as: "${userFirstName}"`,
    "",
    `Call the draft_contact_email tool now.`,
  ].join("\n");

  const ant = anthropic();
  const response = await ant.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1200,
    system: SYSTEM_PROMPT,
    tools: [DRAFT_TOOL],
    tool_choice: { type: "tool", name: "draft_contact_email" },
    messages: [{ role: "user", content: userMessage }],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.Messages.ToolUseBlock =>
      block.type === "tool_use" && block.name === "draft_contact_email",
  );
  if (!toolUse) {
    throw new Error("Claude did not return a structured email draft.");
  }
  const raw = toolUse.input as ScribeDraft;

  const matched_contact_id =
    typeof raw.matched_contact_id === "string" &&
    raw.matched_contact_id.trim().length > 0
      ? raw.matched_contact_id.trim()
      : null;

  // Guardrail: ensure returned id is actually one of the provided contacts.
  const validIds = new Set(input.contacts.map((c) => c.id));
  const verifiedId =
    matched_contact_id && validIds.has(matched_contact_id)
      ? matched_contact_id
      : null;

  return {
    matched_contact_id: verifiedId,
    match_confidence:
      typeof raw.match_confidence === "number"
        ? Math.max(0, Math.min(1, raw.match_confidence))
        : 0,
    why_this_contact:
      typeof raw.why_this_contact === "string" && raw.why_this_contact.trim()
        ? raw.why_this_contact.trim()
        : verifiedId
          ? "Name match against your contacts."
          : "No clear match — add the contact via Scanner and try again.",
    subject:
      typeof raw.subject === "string" && raw.subject.trim()
        ? raw.subject.trim().slice(0, 90)
        : "Quick follow-up",
    body:
      typeof raw.body === "string" && raw.body.trim()
        ? raw.body.trim()
        : "",
    reasoning:
      typeof raw.reasoning === "string" && raw.reasoning.trim()
        ? raw.reasoning.trim()
        : "Draft generated from your voice note.",
  };
}
