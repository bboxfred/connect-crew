/**
 * Claude Vision wrapper — business-card field extraction.
 *
 * Takes a data URL (from camera capture or file upload), hands the image
 * to Claude with a strict `file_contact` tool schema, and returns a typed
 * card extract. Uses tool_use for structured output — far more reliable
 * than JSON-in-prose.
 *
 * Rule: if Claude can't confidently read a field, it MUST return null.
 * Never invents. That's the contract the UI relies on for the "manual
 * fallback" error state.
 */

import type { Anthropic } from "@anthropic-ai/sdk";
import { anthropic, CLAUDE_MODEL } from "./anthropic";

export type CardExtract = {
  name: string | null;
  title: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  linkedin: string | null;
  twitter: string | null;
  telegram: string | null;
  whatsapp: string | null;
  notes: string | null;
  confidence: "high" | "medium" | "low";
  raw_text: string;
};

type MediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

const MAX_BYTES = 5 * 1024 * 1024; // Anthropic vision hard cap

const FILE_CONTACT_TOOL: Anthropic.Messages.Tool = {
  name: "file_contact",
  description:
    "File the fields extracted from a business card photograph. Use null for any field that cannot be confidently read — never invent.",
  input_schema: {
    type: "object",
    properties: {
      name: { type: ["string", "null"], description: "Person's full name" },
      title: { type: ["string", "null"], description: "Job title" },
      company: { type: ["string", "null"], description: "Company name" },
      email: { type: ["string", "null"], description: "Email address" },
      phone: {
        type: ["string", "null"],
        description: "Phone number in the format shown on the card",
      },
      website: {
        type: ["string", "null"],
        description: "Company website URL",
      },
      linkedin: {
        type: ["string", "null"],
        description:
          "LinkedIn handle or URL path (e.g. /in/sofia-alencar or the full URL)",
      },
      twitter: {
        type: ["string", "null"],
        description: "X/Twitter handle WITHOUT the @ prefix",
      },
      telegram: {
        type: ["string", "null"],
        description: "Telegram handle WITHOUT the @ prefix",
      },
      whatsapp: {
        type: ["string", "null"],
        description: "WhatsApp number if distinct from the main phone number",
      },
      notes: {
        type: ["string", "null"],
        description:
          "Tagline, event context, or other non-field text on the card",
      },
      confidence: {
        type: "string",
        enum: ["high", "medium", "low"],
        description:
          "Overall confidence in this extraction. low if the photo is blurry / the card is partial / you had to guess major fields.",
      },
      raw_text: {
        type: "string",
        description: "All text visible on the card, in reading order",
      },
    },
    required: [
      "name",
      "title",
      "company",
      "email",
      "phone",
      "website",
      "linkedin",
      "twitter",
      "telegram",
      "whatsapp",
      "notes",
      "confidence",
      "raw_text",
    ],
  },
};

function parseDataUrl(dataUrl: string): { mediaType: MediaType; data: string } {
  const match = dataUrl.match(
    /^data:(image\/(jpeg|jpg|png|gif|webp));base64,(.+)$/i,
  );
  if (!match) {
    throw new Error(
      "Invalid image: expected a base64 data URL (image/jpeg, png, gif, or webp).",
    );
  }
  // Normalize image/jpg → image/jpeg for the Anthropic API
  const raw = match[1].toLowerCase();
  const mediaType: MediaType = (
    raw === "image/jpg" ? "image/jpeg" : raw
  ) as MediaType;
  return { mediaType, data: match[3] };
}

export async function extractCardFields(
  dataUrl: string,
): Promise<CardExtract> {
  const { mediaType, data } = parseDataUrl(dataUrl);

  // base64 is ~33% larger than the underlying bytes; estimate bytes from length.
  const approxBytes = Math.floor((data.length * 3) / 4);
  if (approxBytes > MAX_BYTES) {
    throw new Error(
      `Image too large (${Math.round(approxBytes / 1024 / 1024)}MB, max 5MB). Take the photo from further away or reduce resolution.`,
    );
  }

  const ant = anthropic();
  const response = await ant.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    tools: [FILE_CONTACT_TOOL],
    tool_choice: { type: "tool", name: "file_contact" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data },
          },
          {
            type: "text",
            text: [
              "You are looking at a photograph of a business card.",
              "Read every visible piece of text, then call the file_contact tool with the structured extraction.",
              "Hard rules:",
              "- Use null for any field that is not clearly readable. NEVER invent a plausible value.",
              "- For handles (twitter, telegram, whatsapp), strip the @ prefix.",
              "- For linkedin, capture either the handle (/in/...) or the full URL as printed.",
              "- Set confidence=low if the image is blurry, partial, or you had to guess the company name.",
              "- raw_text should contain everything visible on the card, verbatim, in reading order.",
            ].join("\n"),
          },
        ],
      },
    ],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.Messages.ToolUseBlock =>
      block.type === "tool_use" && block.name === "file_contact",
  );

  if (!toolUse) {
    throw new Error(
      "Claude did not return a structured extraction. Try another photo.",
    );
  }

  const extract = toolUse.input as CardExtract;

  // Defensive: ensure the required discriminator keys exist so downstream
  // code can trust the shape.
  if (typeof extract.raw_text !== "string") extract.raw_text = "";
  if (!["high", "medium", "low"].includes(extract.confidence)) {
    extract.confidence = "low";
  }

  return extract;
}

/**
 * Count the non-null primary fields. Used to show "Claude extracted N of 7"
 * in the Genspark side panel.
 */
export function countExtractedFields(extract: CardExtract): {
  found: number;
  total: number;
} {
  const primary = [
    extract.name,
    extract.title,
    extract.company,
    extract.email,
    extract.phone,
    extract.website,
    extract.linkedin,
  ];
  return {
    found: primary.filter((v) => v !== null && v !== "").length,
    total: primary.length,
  };
}
