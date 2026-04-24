"use client";

import { useMemo, useState } from "react";
import {
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Check,
  X as XIcon,
  Lock,
  MessageSquareReply,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  fixtureSecretSignals,
  SIGNAL_CATEGORY_LABEL,
  type SecretSignalRule,
  type SignalCategory,
  type SignalScope,
} from "@/lib/fixtures";
import { cn } from "@/lib/utils";

// ─── Secret Signals Panel ──────────────────────────────────────────────────
// Reusable UI surface for the Warmth rule matrix. Used in:
//   · /app/dashboard (scope="all", compact)
//   · /app/signals (scope="telegram", full)
//   · /app/social (scope="social", full)
//
// State is local/ephemeral (demo-only). Real persistence lands in Supabase
// during Phase 3B backend wiring.

type Mode = "compact" | "full";

// How much "space" each scope shows on its panel. Compact = 5 rules max,
// full = all rules for the scope.
const COMPACT_LIMIT = 5;

export function SecretSignalsPanel({
  scope = "all",
  mode = "full",
  accentColor = "var(--teal)",
  title = "Secret Signals",
  eyebrow = "The Warmth IP · your rule matrix",
  description,
}: {
  scope?: SignalScope;
  mode?: Mode;
  accentColor?: string;
  title?: string;
  eyebrow?: string;
  description?: string;
}) {
  // Local in-memory copy so add/edit/delete/toggle feel real during demo.
  const initial = useMemo(() => {
    if (scope === "all") return fixtureSecretSignals;
    return fixtureSecretSignals.filter(
      (r) => r.scope === scope || r.scope === "all",
    );
  }, [scope]);

  const [rules, setRules] = useState<SecretSignalRule[]>(initial);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{
    condition: string;
    delta: number;
  } | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  // Per-rule reply templates — what gets sent when THIS signal fires.
  // Empty template = Claude drafts dynamically. Set template = use it as
  // the basis for the drafted reply.
  const [replyTemplates, setReplyTemplates] = useState<Record<string, string>>(
    {},
  );
  const [replyOpen, setReplyOpen] = useState<Record<string, boolean>>({});
  const [newRule, setNewRule] = useState<{
    category: SignalCategory;
    condition: string;
    delta: number;
  }>({
    category: "punctuation",
    condition: "",
    delta: 0,
  });

  // Group rules by category for the UI
  const byCategory = useMemo(() => {
    const groups: Partial<Record<SignalCategory, SecretSignalRule[]>> = {};
    for (const r of rules) {
      if (!groups[r.category]) groups[r.category] = [];
      groups[r.category]!.push(r);
    }
    return groups;
  }, [rules]);

  const toggleExpanded = (cat: SignalCategory) => {
    setExpanded((e) => ({ ...e, [cat]: !e[cat] }));
  };

  const toggleActive = (id: string) => {
    setRules((rs) =>
      rs.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
    );
  };

  const startEdit = (r: SecretSignalRule) => {
    setEditingId(r.id);
    setEditDraft({ condition: r.condition, delta: r.delta });
  };

  const saveEdit = (id: string) => {
    if (!editDraft) return;
    setRules((rs) =>
      rs.map((r) =>
        r.id === id
          ? { ...r, condition: editDraft.condition, delta: editDraft.delta }
          : r,
      ),
    );
    setEditingId(null);
    setEditDraft(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const deleteRule = (id: string) => {
    setRules((rs) => rs.filter((r) => r.id !== id));
  };

  const addRule = () => {
    if (!newRule.condition.trim()) return;
    const id = `sig-custom-${Date.now().toString(36)}`;
    setRules((rs) => [
      ...rs,
      {
        id,
        category: newRule.category,
        condition: newRule.condition.trim(),
        delta: newRule.delta,
        scope: scope === "all" ? "all" : scope,
        active: true,
      },
    ]);
    setNewRule({ category: "punctuation", condition: "", delta: 0 });
    setShowAdd(false);
    setExpanded((e) => ({ ...e, [newRule.category]: true }));
  };

  // Total impact stats (net delta sum of active rules)
  const activeCount = rules.filter((r) => r.active).length;
  const sumPositive = rules
    .filter((r) => r.active && r.delta > 0)
    .reduce((s, r) => s + r.delta, 0);
  const sumNegative = rules
    .filter((r) => r.active && r.delta < 0)
    .reduce((s, r) => s + r.delta, 0);

  const categoryOrder: SignalCategory[] = [
    "punctuation",
    "greeting",
    "emoji",
    "response_time",
    "channel",
    "social",
    "timing",
    "length",
    "silence",
    "event_proximity",
    "voice",
  ];

  return (
    <section
      className="rounded-2xl border relative overflow-hidden"
      style={{
        borderColor: `color-mix(in srgb, ${accentColor} 28%, transparent)`,
        backgroundColor: "var(--surface)",
      }}
    >
      {/* Header */}
      <header
        className="px-5 md:px-6 py-4 md:py-5 border-b"
        style={{
          borderColor: `color-mix(in srgb, ${accentColor} 18%, transparent)`,
          backgroundColor: `color-mix(in srgb, ${accentColor} 6%, white)`,
        }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div
              className="font-mono text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5"
              style={{ color: accentColor }}
            >
              <Sparkles className="h-3 w-3" strokeWidth={1.75} />
              {eyebrow}
            </div>
            <h3
              className="font-editorial text-xl md:text-2xl tracking-tight"
              style={{ fontWeight: 700, letterSpacing: "-0.02em" }}
            >
              {title}
            </h3>
            {description ? (
              <p className="mt-2 text-sm text-[var(--muted-strong)] leading-relaxed max-w-2xl">
                {description}
              </p>
            ) : (
              <p className="mt-2 text-sm text-[var(--muted-strong)] leading-relaxed max-w-2xl">
                Claude reads every inbound against these rules and adjusts the
                Warmth Index. You own the rule matrix. Add, tune, toggle, or
                delete any signal.
              </p>
            )}
          </div>

          {/* Impact stats */}
          <div className="flex items-center gap-3">
            <StatChip
              label={`${activeCount} active`}
              color={accentColor}
            />
            <StatChip
              label={`+${sumPositive}`}
              color="var(--warmth-hot)"
            />
            <StatChip
              label={`${sumNegative}`}
              color="var(--warmth-cold)"
            />
          </div>
        </div>

        {/* Add button */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          {!showAdd ? (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Add custom signal
            </button>
          ) : (
            <AddRuleForm
              accentColor={accentColor}
              rule={newRule}
              onChange={setNewRule}
              onSubmit={addRule}
              onCancel={() => {
                setShowAdd(false);
                setNewRule({ category: "punctuation", condition: "", delta: 0 });
              }}
            />
          )}
        </div>
      </header>

      {/* Body: categorized rule list */}
      <div className="divide-y divide-[var(--hairline)]">
        {categoryOrder
          .filter((cat) => (byCategory[cat]?.length || 0) > 0)
          .map((cat) => {
            const catRules = byCategory[cat]!;
            const isExpanded = expanded[cat] ?? mode === "full";
            const limit = mode === "compact" && !isExpanded ? COMPACT_LIMIT : catRules.length;
            const shown = catRules.slice(0, limit);
            return (
              <div key={cat} className="px-5 md:px-6 py-4">
                <button
                  type="button"
                  onClick={() => toggleExpanded(cat)}
                  className="w-full flex items-center justify-between text-left mb-3 group"
                >
                  <div
                    className="font-mono text-[11px] uppercase tracking-widest"
                    style={{ color: accentColor }}
                  >
                    {SIGNAL_CATEGORY_LABEL[cat]}{" "}
                    <span className="text-[var(--muted)] ml-1">
                      · {catRules.length} rule{catRules.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-[var(--muted)] opacity-0 group-hover:opacity-100 transition-opacity">
                    {isExpanded ? "collapse" : "expand"}
                  </div>
                </button>

                <ul className="space-y-2">
                  {shown.map((r) => (
                    <RuleRow
                      key={r.id}
                      rule={r}
                      editing={editingId === r.id}
                      editDraft={editDraft}
                      onEditDraftChange={setEditDraft}
                      onToggle={() => toggleActive(r.id)}
                      onStartEdit={() => startEdit(r)}
                      onSaveEdit={() => saveEdit(r.id)}
                      onCancelEdit={cancelEdit}
                      onDelete={() => deleteRule(r.id)}
                      accentColor={accentColor}
                      replyTemplate={replyTemplates[r.id] ?? ""}
                      replyOpen={!!replyOpen[r.id]}
                      onReplyChange={(text) =>
                        setReplyTemplates((t) => ({ ...t, [r.id]: text }))
                      }
                      onReplyToggle={() =>
                        setReplyOpen((o) => ({ ...o, [r.id]: !o[r.id] }))
                      }
                    />
                  ))}
                  {catRules.length > limit ? (
                    <li>
                      <button
                        type="button"
                        onClick={() => toggleExpanded(cat)}
                        className="w-full text-left font-mono text-[10px] uppercase tracking-wider text-[var(--muted-strong)] hover:text-[var(--foreground)] px-2 py-1 transition-colors"
                      >
                        + {catRules.length - limit} more
                      </button>
                    </li>
                  ) : null}
                </ul>
              </div>
            );
          })}
      </div>
    </section>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────

function StatChip({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded tabular-nums"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 14%, white)`,
        color,
      }}
    >
      {label}
    </span>
  );
}

function RuleRow({
  rule,
  editing,
  editDraft,
  onEditDraftChange,
  onToggle,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  accentColor,
  replyTemplate,
  replyOpen,
  onReplyChange,
  onReplyToggle,
}: {
  rule: SecretSignalRule;
  editing: boolean;
  editDraft: { condition: string; delta: number } | null;
  onEditDraftChange: (d: { condition: string; delta: number }) => void;
  onToggle: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  accentColor: string;
  replyTemplate: string;
  replyOpen: boolean;
  onReplyChange: (text: string) => void;
  onReplyToggle: () => void;
}) {
  const deltaColor =
    rule.delta > 0
      ? "var(--warmth-hot)"
      : rule.delta < 0
        ? "var(--warmth-cold)"
        : "var(--muted)";
  const hasTemplate = replyTemplate.trim().length > 0;

  if (editing && editDraft) {
    return (
      <li
        className="flex items-center gap-2 rounded-lg px-3 py-2"
        style={{
          backgroundColor: `color-mix(in srgb, ${accentColor} 6%, white)`,
        }}
      >
        <input
          type="text"
          value={editDraft.condition}
          onChange={(e) =>
            onEditDraftChange({ ...editDraft, condition: e.target.value })
          }
          className="flex-1 bg-transparent border-0 outline-none text-sm text-[var(--foreground)] font-medium focus:ring-0"
        />
        <input
          type="number"
          value={editDraft.delta}
          onChange={(e) =>
            onEditDraftChange({
              ...editDraft,
              delta: Number(e.target.value) || 0,
            })
          }
          className="w-16 rounded border border-[var(--border)] bg-white px-2 py-1 text-center font-mono text-xs tabular-nums"
        />
        <button
          type="button"
          onClick={onSaveEdit}
          className="h-7 w-7 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: "var(--sage)" }}
          aria-label="Save"
        >
          <Check className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={onCancelEdit}
          className="h-7 w-7 rounded-full flex items-center justify-center border border-[var(--border)] text-[var(--muted-strong)]"
          aria-label="Cancel"
        >
          <XIcon className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </li>
    );
  }

  return (
    <li
      className={cn(
        "rounded-lg border transition-all",
        rule.active
          ? "bg-white border-[var(--border)]"
          : "bg-[var(--paper)]/30 border-[var(--hairline)] opacity-70",
      )}
      style={{
        borderColor:
          rule.active && hasTemplate
            ? `color-mix(in srgb, ${accentColor} 35%, transparent)`
            : undefined,
      }}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Big iOS-style toggle */}
        <button
          type="button"
          onClick={onToggle}
          role="switch"
          aria-checked={rule.active}
          aria-label={rule.active ? "Disable this signal" : "Enable this signal"}
          className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
          style={{
            backgroundColor: rule.active
              ? accentColor
              : "color-mix(in srgb, var(--muted) 28%, white)",
            boxShadow: rule.active
              ? `inset 0 1px 2px color-mix(in srgb, ${accentColor} 55%, black)`
              : "inset 0 1px 2px rgba(0,0,0,0.08)",
          }}
        >
          <span
            className="inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200"
            style={{
              transform: rule.active ? "translateX(24px)" : "translateX(4px)",
            }}
          />
        </button>

        <span
          className={cn(
            "flex-1 text-sm font-medium truncate",
            rule.active
              ? "text-[var(--foreground)]"
              : "text-[var(--muted)] line-through",
          )}
        >
          {rule.condition}
        </span>

        <span
          className="font-mono text-xs font-semibold tabular-nums px-2.5 py-1 rounded-full shrink-0"
          style={{
            backgroundColor: `color-mix(in srgb, ${deltaColor} 14%, white)`,
            color: deltaColor,
          }}
        >
          {rule.delta > 0 ? `+${rule.delta}` : rule.delta}
        </span>

        {/* Reply template toggle — always visible (unlike hover-hidden edit/delete) */}
        <button
          type="button"
          onClick={onReplyToggle}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors shrink-0",
            hasTemplate
              ? "text-white"
              : "text-[var(--muted-strong)] border border-[var(--border)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]",
          )}
          style={
            hasTemplate
              ? { backgroundColor: accentColor }
              : undefined
          }
          aria-expanded={replyOpen}
          aria-label={replyOpen ? "Collapse reply template" : "Edit reply template"}
          title={hasTemplate ? "Reply template set" : "Set a reply template"}
        >
          <MessageSquareReply className="h-3 w-3" strokeWidth={2.25} />
          <span className="hidden sm:inline">
            {hasTemplate ? "Reply set" : "Reply"}
          </span>
          {replyOpen ? (
            <ChevronUp className="h-3 w-3" strokeWidth={2} />
          ) : (
            <ChevronDown className="h-3 w-3" strokeWidth={2} />
          )}
        </button>

        {/* Edit / delete — still hover-hidden on desktop, visible on touch */}
        <div className="flex items-center gap-0.5 shrink-0 opacity-40 md:opacity-0 md:group-hover:opacity-100 hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onStartEdit}
            className="h-7 w-7 rounded flex items-center justify-center text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:bg-[var(--paper)]"
            aria-label="Edit rule condition or delta"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
          {rule.is_default ? (
            <span
              className="h-7 w-7 rounded flex items-center justify-center text-[var(--muted)]"
              title="Default rule — can be adjusted or disabled, not deleted"
            >
              <Lock className="h-3.5 w-3.5" strokeWidth={1.75} />
            </span>
          ) : (
            <button
              type="button"
              onClick={onDelete}
              className="h-7 w-7 rounded flex items-center justify-center text-[var(--muted-strong)] hover:text-[var(--warmth-hot)] hover:bg-[var(--paper)]"
              aria-label="Delete rule"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>

      {/* Reply template editor — expands on click */}
      {replyOpen ? (
        <div
          className="px-3 pb-3 pt-1 border-t"
          style={{
            borderColor: `color-mix(in srgb, ${accentColor} 18%, transparent)`,
          }}
        >
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--muted-strong)] mb-2 mt-1">
            <MessageSquareReply
              className="h-3 w-3"
              strokeWidth={2}
              style={{ color: accentColor }}
            />
            When this signal fires, send this reply
          </div>
          <textarea
            value={replyTemplate}
            onChange={(e) => onReplyChange(e.target.value)}
            placeholder={`e.g. "Great seeing you — want to catch up soon?" · leave blank to let Claude draft dynamically from this signal`}
            rows={3}
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm leading-relaxed outline-none transition-colors resize-y"
            style={{
              borderColor: `color-mix(in srgb, ${accentColor} 24%, transparent)`,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = accentColor;
              e.currentTarget.style.boxShadow = `0 0 0 3px color-mix(in srgb, ${accentColor} 18%, transparent)`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = `color-mix(in srgb, ${accentColor} 24%, transparent)`;
              e.currentTarget.style.boxShadow = "";
            }}
          />
          <div className="mt-1.5 flex items-center justify-between flex-wrap gap-2 font-mono text-[10px] text-[var(--muted)]">
            <span>
              {hasTemplate
                ? "Template will be used as the base for Claude's reply on this signal."
                : "Empty = Claude drafts dynamically from voice + context."}
            </span>
            {hasTemplate ? (
              <button
                type="button"
                onClick={() => onReplyChange("")}
                className="uppercase tracking-wider text-[var(--muted-strong)] hover:text-[var(--warmth-hot)] transition-colors"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </li>
  );
}

function AddRuleForm({
  accentColor,
  rule,
  onChange,
  onSubmit,
  onCancel,
}: {
  accentColor: string;
  rule: {
    category: SignalCategory;
    condition: string;
    delta: number;
  };
  onChange: (r: {
    category: SignalCategory;
    condition: string;
    delta: number;
  }) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const categories: SignalCategory[] = [
    "punctuation",
    "greeting",
    "emoji",
    "response_time",
    "length",
    "channel",
    "timing",
    "silence",
    "event_proximity",
    "voice",
    "social",
  ];
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex items-center gap-2 flex-wrap w-full rounded-xl px-3 py-3"
      style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 6%, white)` }}
    >
      <select
        value={rule.category}
        onChange={(e) =>
          onChange({ ...rule, category: e.target.value as SignalCategory })
        }
        className="rounded border border-[var(--border)] bg-white px-2 py-1.5 text-xs font-mono"
      >
        {categories.map((c) => (
          <option key={c} value={c}>
            {SIGNAL_CATEGORY_LABEL[c]}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={rule.condition}
        onChange={(e) => onChange({ ...rule, condition: e.target.value })}
        placeholder="Condition — e.g. 'Hi Fred!' or 'voice note > 30s'"
        className="flex-1 min-w-[220px] rounded border border-[var(--border)] bg-white px-3 py-1.5 text-sm outline-none focus:border-[var(--foreground)]"
      />
      <div className="flex items-center gap-1">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
          delta
        </span>
        <input
          type="number"
          value={rule.delta}
          onChange={(e) =>
            onChange({ ...rule, delta: Number(e.target.value) || 0 })
          }
          className="w-16 rounded border border-[var(--border)] bg-white px-2 py-1.5 text-center font-mono text-xs tabular-nums"
        />
      </div>
      <button
        type="submit"
        disabled={!rule.condition.trim()}
        className="rounded-full px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-white transition-opacity disabled:opacity-40 hover:opacity-90"
        style={{ backgroundColor: accentColor }}
      >
        <Check className="h-3.5 w-3.5 inline mr-1" strokeWidth={2} />
        Add
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors"
      >
        Cancel
      </button>
    </form>
  );
}
