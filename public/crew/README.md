# Crew character assets

Placeholder + generated art for the 5 hero rectangle slots on `/`. The hero in `src/components/crew-hero.tsx` renders **gradient rectangles** by default — any file here is only displayed when you opt in via `MEDIA_FILES`.

## Canonical Crew roster (April 24, 2026 update)

**1 Chief + 5 specialists = 6 roles.** Master Connect sits above the 5 in the sidebar as "The Chief." The hero line-up on `/` still shows the 5 specialists as media rectangles — Master Connect has its own dedicated page at `/app/master-connect` and doesn't appear in the hero line-up.

| Slug | Crew member | Role | Signature colour | CSS var |
| --- | --- | --- | --- | --- |
| `master-connect` | **Master Connect** | Chief — queries the graph, imports contacts | Plum `#6e4a5f` | `--plum` |
| `scan` | Scanner | specialist | Coral `#e85a3c` | `--coral` |
| `signals` | Messenger | specialist | Teal `#2d7d7a` | `--teal` |
| `inbound` | Mailbox | specialist | Copper `#c07a2c` | `--copper` |
| `social` | Social Media | specialist | Indigo `#3d4e7e` | `--indigo` |
| `scribe` | Scribe | specialist | Sage `#7b9a8d` | `--sage` |

## Current files

- `scan.svg`, `signals.svg`, `inbound.svg`, `social.svg`, `scribe.svg` — initial placeholders (legacy inline SVGs)
- `scan.png`, `signals.png`, `inbound.png` — generated portraits (not yet activated — flip `MEDIA_FILES` below to use)
- `social.png`, `scribe.png` — not yet generated. Spec + brief below.

Pages `/app/warm` and `/app/cold` still exist but only as 307 redirects to `/app/lead-o-meter` for old-link back-compat. They don't render any images.

## Media drop-in spec

- **Path:** `/public/crew/{slug}.{ext}` using the 5 canonical slugs above
- **Aspect:** 2:3 portrait
- **Source size:** 720 × 1080 px (3× retina; displays at ~240 × 360)
- **Max:** 2MB image · 10MB video
- **Formats:** `jpg`, `png`, `webp`, `mp4`, `webm` (transparent PNG welcome — the gradient frame shows through)

## Activation procedure

Edit `MEDIA_FILES` in [`src/components/crew-hero.tsx`](../../src/components/crew-hero.tsx):

```ts
const MEDIA_FILES: Record<string, { ext: string; kind: MediaKind }> = {
  scan:    { ext: "png", kind: "image" },
  signals: { ext: "png", kind: "image" },
  inbound: { ext: "png", kind: "image" },
  social:  { ext: "",    kind: null     },  // keep gradient placeholder
  scribe:  { ext: "mp4", kind: "video"  },  // videos autoplay/loop/mute
};
```

That's the only code change. Videos autoplay, loop, mute, and play inline — no extra wiring needed.

## Character briefs (for Genspark image-gen on Day 1)

Target a clean neutral background — the gradient frame renders behind the image. No card frame, no border baked into the asset.

- **Scanner** — blank floating metal business card, coral tint
- **Messenger** — ninja holding a phone, teal tint
- **Mailbox** — cool futuristic mailman, mails fanned out, copper tint
- **Social Media** — smartphone with floating IG / FB Messenger / X bubbles, indigo tint
- **Scribe** — floating sound recorder with soft waveform, sage tint
