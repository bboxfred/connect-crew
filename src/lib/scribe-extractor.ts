/**
 * Scribe extractor — takes a transcript (from Genspark CLI transcription),
 * asks Claude to extract structured memory: summary, people, topics,
 * commitments (with owners + deadlines), key quotes, and a next step.
 *
 * Used by /api/scribe. The upstream transcription step lives in
 * scribe-audio.ts; this module only handles the text→structure layer.
 */

import type { Anthropic } from "@anthropic-ai/sdk";
import { anthropic, CLAUDE_MODEL } from "./anthropic";

export type ScribeCommitment = {
  what: string;
  who: string;
  by_when: string | null;
};

export type ScribeExtract = {
  summary: string;
  people: string[];
  topics: string[];
  commitments: ScribeCommitment[];
  key_quotes: string[];
  next_step: string;
};

const EXTRACT_TOOL: Anthropic.Messages.Tool = {
  name: "extract_meeting_memory",
  description:
    "Extract structured memory from a meeting or voice-note transcript. Identify people, topics, commitments with owners + deadlines, memorable quotes, and the single most important next step.",
  input_schema: {
    type: "object",
    properties: {
      summary: {
        type: "string",
        description:
          "2-3 sentence summary of what the conversation was about. User-facing plain English.",
      },
      people: {
        type: "array",
        items: { type: "string" },
        description:
          "People mentioned by name (e.g. 'Sofia Alencar', 'Marcus'). Include the user only if they speak in first person. Skip generic roles.",
      },
      topics: {
        type: "array",
        items: { type: "string" },
        description:
          "3-6 short topic labels. Each under 30 chars. Examples: 'Series A fundraise', 'SEA partnerships', 'Q3 pricing'.",
      },
      commitments: {
        type: "array",
        items: {
          type: "object",
          properties: {
            what: {
              type: "string",
              description: "What was promised, in imperative form. Under 90 chars.",
            },
            who: {
              type: "string",
              description:
                "Who owns this commitment. Use 'You' for the user's own commitments, or a named person for theirs.",
            },
            by_when: {
              type: ["string", "null"],
              description:
                "Deadline if explicitly mentioned (e.g. 'by Friday', 'before EOM', 'next week'). null if none.",
            },
          },
          required: ["what", "who", "by_when"],
        },
        description:
          "Every explicit commitment made during the conversation. Include both the user's own and others'. Don't invent commitments that weren't made.",
      },
      key_quotes: {
        type: "array",
        items: { type: "string" },
        description:
          "Up to 3 memorable direct quotes worth keeping. Verbatim from the transcript. Each under 140 chars.",
      },
      next_step: {
        type: "string",
        description:
          "One sentence describing the single most important next action the user should take. Under 100 chars.",
      },
    },
    required: [
      "summary",
      "people",
      "topics",
      "commitments",
      "key_quotes",
      "next_step",
    ],
  },
};

const SYSTEM_PROMPT = [
  "You are Scribe, the Connect Crew member that turns conversations into memory.",
  "You read meeting / voice-note transcripts and call the `extract_meeting_memory` tool with structured output — never prose.",
  "",
  "Principles:",
  "  · NEVER invent commitments that weren't made. If nothing was promised, return an empty commitments array.",
  "  · Treat 'you' / 'I will' / first-person promises as commitments owned by 'You'.",
  "  · Treat other speakers' promises ('I'll send that over', 'let me check with Karen') as commitments owned by the named person.",
  "  · If a deadline isn't specified, by_when is null — don't infer one.",
  "  · Quotes should be memorable because of their content, not because they're long.",
  "  · next_step should be the user's single most valuable follow-up action, not a vague 'stay in touch'.",
].join("\n");

export async function extractMeetingMemory(
  transcript: string,
): Promise<ScribeExtract> {
  if (!transcript || transcript.trim().length < 20) {
    throw new Error(
      "Transcript too short to extract memory from (< 20 characters).",
    );
  }

  const ant = anthropic();
  const response = await ant.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    tools: [EXTRACT_TOOL],
    tool_choice: { type: "tool", name: "extract_meeting_memory" },
    messages: [
      {
        role: "user",
        content: [
          `Extract structured memory from this transcript.`,
          ``,
          `Transcript (verbatim):`,
          `"""`,
          transcript.slice(0, 40_000),
          `"""`,
          ``,
          `Call the extract_meeting_memory tool now.`,
        ].join("\n"),
      },
    ],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.Messages.ToolUseBlock =>
      block.type === "tool_use" && block.name === "extract_meeting_memory",
  );

  if (!toolUse) {
    throw new Error(
      "Claude did not return a structured extraction for this transcript.",
    );
  }

  const raw = toolUse.input as ScribeExtract;

  return {
    summary:
      typeof raw.summary === "string" && raw.summary.trim()
        ? raw.summary.trim()
        : "Transcript captured but no summary could be generated.",
    people: Array.isArray(raw.people)
      ? raw.people.map((p) => String(p).trim()).filter(Boolean).slice(0, 12)
      : [],
    topics: Array.isArray(raw.topics)
      ? raw.topics
          .map((t) => String(t).trim().slice(0, 40))
          .filter(Boolean)
          .slice(0, 8)
      : [],
    commitments: Array.isArray(raw.commitments)
      ? raw.commitments
          .filter(
            (c) =>
              c &&
              typeof c.what === "string" &&
              c.what.trim().length > 0 &&
              typeof c.who === "string",
          )
          .map((c) => ({
            what: c.what.trim().slice(0, 140),
            who: c.who.trim() || "You",
            by_when:
              typeof c.by_when === "string" && c.by_when.trim().length > 0
                ? c.by_when.trim()
                : null,
          }))
          .slice(0, 12)
      : [],
    key_quotes: Array.isArray(raw.key_quotes)
      ? raw.key_quotes
          .map((q) => String(q).trim().slice(0, 200))
          .filter(Boolean)
          .slice(0, 3)
      : [],
    next_step:
      typeof raw.next_step === "string" && raw.next_step.trim()
        ? raw.next_step.trim().slice(0, 140)
        : "Review the transcript and decide a follow-up.",
  };
}
