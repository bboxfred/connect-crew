/**
 * Composio Gmail client — creates Gmail Drafts for Yellow-tier staging.
 *
 * We proved the `GMAIL_CREATE_EMAIL_DRAFT` slug works on April 24 morning
 * via the Composio MCP (see session notes in CLAUDE.md §10). This module
 * is the Node/runtime equivalent — same slug, same connected account id,
 * now callable from a Next.js route handler.
 *
 * Historical note: MCP_SETUP.md used to name the slug `GMAIL_CREATE_DRAFT`
 * and the account id `ca_le9u0vj7chsN`. Both are legacy shapes. Current
 * verified values are `GMAIL_CREATE_EMAIL_DRAFT` and `gmail_sekar-niobe`.
 * If this ever fails, re-auth via the Composio MCP and list connections
 * — do not guess. See CLAUDE.md §10 for the rollback recipe.
 */

import { Composio } from "@composio/core";

let client: Composio | null = null;

function composio(): Composio {
  if (client) return client;
  const apiKey = process.env.COMPOSIO_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing COMPOSIO_API_KEY. Paste into .env.local before staging Gmail drafts.",
    );
  }
  client = new Composio({ apiKey });
  return client;
}

export type GmailDraftResult = {
  draft_id: string;
  message_id: string | null;
  thread_id: string | null;
  gmail_url: string | null;
};

/**
 * Create a Gmail draft via Composio, targeting the single verified
 * connected account. Returns identifiers the UI can use to link back
 * to Gmail Drafts.
 */
export async function createGmailDraft(input: {
  to: string;
  subject: string;
  body: string;
  connectedAccountId?: string;
}): Promise<GmailDraftResult> {
  const accountId =
    input.connectedAccountId ?? process.env.COMPOSIO_GMAIL_CONNECTED_ACCOUNT_ID;

  if (!accountId) {
    throw new Error(
      "Missing COMPOSIO_GMAIL_CONNECTED_ACCOUNT_ID. Set it to the default Gmail connection id from Composio.",
    );
  }

  const result = await composio().tools.execute("GMAIL_CREATE_EMAIL_DRAFT", {
    connectedAccountId: accountId,
    arguments: {
      to: [input.to],
      subject: input.subject,
      body: input.body,
    },
  });

  if (!result.successful) {
    throw new Error(
      `Composio GMAIL_CREATE_EMAIL_DRAFT failed: ${result.error ?? "unknown error"}`,
    );
  }

  // Response shape (verified April 24 MCP call):
  // data: {
  //   id: "r-4424...", display_url: "https://mail.google.com/...",
  //   message: { id: "...", threadId: "...", display_url: "..." }
  // }
  const data = result.data as {
    id?: string;
    display_url?: string;
    message?: {
      id?: string;
      threadId?: string;
      display_url?: string;
    };
  };

  return {
    draft_id: data.id ?? "",
    message_id: data.message?.id ?? null,
    thread_id: data.message?.threadId ?? null,
    gmail_url: data.display_url ?? data.message?.display_url ?? null,
  };
}
