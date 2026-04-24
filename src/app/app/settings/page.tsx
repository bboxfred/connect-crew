"use client";

import { useState } from "react";
import { ComingSoonShell } from "@/components/coming-soon-shell";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "channels", label: "Channels" },
  { id: "autonomy", label: "Autonomy" },
  { id: "privacy", label: "Privacy" },
  { id: "data", label: "Data" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const tabCopy: Record<TabId, { lede: string }> = {
  profile: {
    lede: "Your identity across orgs — name, voice samples per context, ICP rules per org, signatures per channel. Swappable on the fly.",
  },
  channels: {
    lede: "OAuth-connected accounts for Telegram, Gmail, LinkedIn, and (soon) WhatsApp Business + Plaud. Never raw passwords.",
  },
  autonomy: {
    lede: "Green auto-sends, Yellow stages for Morning Connect, Red never drafts. Override per-contact, per-channel, or for entire message types.",
  },
  privacy: {
    lede: "Classification is local. The graph is yours. Every action is human-approved or user-authorised. No training on user data, ever.",
  },
  data: {
    lede: "Export your graph as JSON. Delete everything. Set retention windows for interaction history. Contacts can request their own Warmth classifications.",
  },
};

export default function SettingsPage() {
  const [tab, setTab] = useState<TabId>("profile");
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-3">
          Settings
        </div>
        <h1
          className="font-editorial text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight"
          style={{ fontWeight: 700, letterSpacing: "-0.03em" }}
        >
          Settings
        </h1>
      </header>

      {/* Tabs */}
      <div className="mb-8 flex items-center gap-1 overflow-x-auto border-b border-[var(--border)]">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              tab === t.id
                ? "text-[var(--foreground)]"
                : "text-[var(--muted-strong)] hover:text-[var(--foreground)]"
            }`}
          >
            {t.label}
            {tab === t.id ? (
              <span
                className="absolute left-2 right-2 bottom-0 h-[2px]"
                style={{ backgroundColor: "var(--ink)" }}
              />
            ) : null}
          </button>
        ))}
      </div>

      <ComingSoonShell
        eyebrow={`Settings · ${tabs.find((t) => t.id === tab)?.label}`}
        title={`${tabs.find((t) => t.id === tab)?.label} ships with the hackathon build.`}
        lede={tabCopy[tab].lede}
      />
    </div>
  );
}
