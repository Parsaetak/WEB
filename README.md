# PARSA TAK — WEB

Live site: https://parsaetak.github.io/WEB/

Repository: https://github.com/Parsaetak/WEB

Version: 2.2.0 — the high-refresh smoothness upgrade: 120 Hz-class
frame pacing, refresh-rate-aware adaptive quality, a site-wide
fade/reveal motion language, an evolved living organism, and the
2026 AI + Will + Systems blog edition (all articles dated
September 10, 2026).

## Stack

- Next.js 16 (App Router, `output: "export"`, static only)
- React 19, TypeScript
- GitHub Pages deployment (no server, no runtime backend)
- Zero runtime content dependencies — the data layer is custom and typed

## High-refresh strategy (2.2)

The target is 120 Hz-class smoothness **where the display supports
it** — never a guaranteed frame-rate claim:

- **Delta-time simulation.** Every animated system advances by frame
  timestamps, never per-frame constants; extreme deltas are capped
  after tab switches. Motion is near-identical at 60/90/120/144 Hz.
- **Refresh-rate estimation.** `RedMagic` derives the display's native
  rate from its fastest sustained `requestAnimationFrame` interval and
  judges itself relative to it — a 60 Hz panel holding 60 keeps full
  quality; a 120 Hz panel losing a third of its frames is demoted.
- **Hysteresis.** Quality changes require sustained windows (2 bad to
  demote, 3 clean to promote) plus a cooldown, so tiers never
  oscillate.
- **Frame-budget hygiene.** Zero steady-state allocation in hot loops
  (cached sprites/gradients, quantised bounded colour-string cache),
  RAF-coalesced pointer input, CSS-first animation everywhere else.
- **Honest telemetry.** The RED MAGIC console reports measured frame
  rate against the measured refresh rate and the active quality tier.
  It never claims "120 FPS achieved".

## Motion system (2.2)

One transition vocabulary, defined as CSS custom properties in
`app/globals.css` (MICRO/SHORT/MEDIUM/LONG durations + easings +
stagger unit):

- **Reveal system.** Elements opt in with `data-reveal`; a single
  IntersectionObserver controller (`components/MotionReveal.tsx`,
  mounted once per route tree) marks them revealed with deterministic
  grid-position stagger. One-shot, self-draining, zero rAF loops.
- **No-JS safety.** The hidden state exists only under a pre-paint
  `reveal-js` class; without JavaScript nothing is ever hidden.
- **Scene transitions.** Outgoing scenes fade through the transition
  layer; incoming scenes settle with a keyed one-shot animation; the
  organism pulses once per scene change.
- **Blog filtering.** Cards enter with grid-position stagger; cards
  that survive a filter keep their state; new matches fade in via the
  same observer (no exit-animation framework).
- **Reduced motion.** Every reveal and transition degrades to a
  minimal crossfade with no travel; the organism keeps only its
  slowest breathing layers.

## Architecture

### World shell (scenes)

The home experience is a single route (`/`) driven by hash-based scene
routing inside `components/LivingShell.tsx`:

- `SceneRegistry` renders the active scene through `next/dynamic`
- `ScenePreloader` owns **the only dynamic import site per scene** —
  the registry's lazy components resolve through the same loader, so
  scene chunks exist exactly once and never download twice
- `SceneUrlSync` keeps scenes and browser history in sync
- `SceneLoadingScreen` exposes honest load phases
  (`INITIALIZING / LOADING / PREPARING / READY / ERROR`) and never
  fakes progress percentages
- `WorldBackground` (CSS ambient), `RedCursor` (native CSS cursor),
  and `MotionReveal` (the one reveal observer) are mounted once from
  the shell

### Blog (routes)

`/blog/` and `/blog/<slug>/` are real statically exported routes:

- `app/blog/layout.tsx` — shared shell (background, cursor, reveal
  controller, header, footer)
- `app/blog/page.tsx` — index: featured article + search/tag island
- `app/blog/[slug]/page.tsx` — article pages with full metadata,
  Open Graph/Twitter cards, JSON-LD `BlogPosting`, prev/next and
  related posts
- `components/blog/BlogIndex.tsx` — the only client island on the
  index; it receives article **metadata only** (no HTML bodies)
- RSS feed: `/blog/feed.xml`, generated from the same content index

Ordering law: posts are sorted date-descending with **slug-ascending
as the deterministic tiebreak**, so the September 10, 2026 edition
(all articles share one date) can never reorder randomly.

### Data pipeline

```
content/blog/*.md  (source of truth)
  scripts/build-blog.mjs
    → PARSE frontmatter
    → VALIDATE (fail loudly: file + reason)
    → RENDER markdown → HTML (escaped, subset)
    → NORMALIZE (reading time, covers, basePath-aware URLs)
    → INDEX (tags, categories, related, prev/next)
    → PRECOMPUTE (per-post search haystack for the client island)
    → EMIT data/blog/posts.json + public/blog/feed.xml
  lib/blog.ts (server-side typed access layer — imports posts.json)
    → app/blog/* pages (metadata as serialized props, article HTML
      rendered into static HTML at build time)
  lib/blogFormat.ts (client-safe: types + formatters, imports nothing)
    → components/blog/BlogIndex.tsx
```

**Client boundary law:** `data/blog/posts.json` is server-side only.
Client blog components import from `lib/blogFormat.ts` exclusively, so
no article body ever ships in a client bundle. The island filters
against the build-time `search` haystack instead of re-deriving it per
keystroke.

The Library follows the same build-once shape: the manifest is synced
from [Parsaetak/Contents](https://github.com/Parsaetak/Contents)
(branch `Projects`) during CI, validated in the workflow, and
normalized exactly once at module scope in `lib/contentRepository.ts`.

### Resource store and memory policy

`lib/resourceStore.ts` is the single async resource manager with an
explicit lifetime policy:

- `immutable` (default) — build-stamped data; retained until LRU eviction
- `short-lived` — refreshable metadata; requires `staleAfter` TTL
- `transient` — prediction/preload scratch; requires `staleAfter`

Guarantees: in-flight deduplication, failure cleanup with safe retry,
abort-aware entry dropping, TTL expiry sweeps, LRU bounding
(`RESOURCE_STORE_MAX_ENTRIES`), explicit invalidation, and
`releaseSettledResources()` for memory-pressure degradation.
Observability via `getResourceStoreStats()` (hits / misses / evictions
/ expiries, bounded counters only).

### Background scheduler

`lib/backgroundScheduler.ts` is the ONE coherent queue for all
non-urgent work (scene preload prediction lives there today):

- tasks carry `id` (dedup), `priority` (USER_NAVIGATION / NEAR_TERM /
  PREDICTIVE / BACKGROUND), and `owner` (wholesale cancellation)
- one idle pump executes at most one task per idle gap, then yields
- hidden tab → pump suspended; visible → resumed automatically
- save-data / 2G / constrained device memory drop speculative tasks
  at enqueue time — core work is never degraded
- user intent always wins: scene changes cancel the previous owner's
  speculative queue before anything new is considered

Scene prediction (`components/ScenePreloader.tsx`) is a small
deterministic frequency heuristic over recent transitions with
hit/miss counters (`getScenePredictionStats()`). Scene chunks are
code-split exactly once and cached intentionally (cheap code, not
runtime state).

### Living organism (WorldBackground)

The global background is ONE continuous living system with layered
looped timescales — all compositor-friendly CSS animation:

- MICRO — particles / sparks (6–17 s, per-element phase offsets)
- SHORT — energy wisps (31–61 s, alternating directions, phase-shifted)
- MEDIUM — orbital rings (34–82 s, mixed directions, phase-shifted)
- LONG — atmospheric masses + aura (28–57 s)
- HEART — core + nucleus breathing (8.5–19 s)
- EVENT — transition pulse + click ripples (controller-triggered)
- RESONANCE (2.2) — two energy-scaled heartbeat-echo rings; invisible
  while calm, hidden on low quality and reduced motion

Coherence and state flow through one attribute set on the root
(`data-scene` mood, `data-quality` tier, `data-hidden`, `data-reduced`)
plus shared CSS variables (`--organism-energy`,
`--organism-pointer-x/y`) written by a single self-suspending rAF
controller in `lib/worldSignals.ts` + `WorldBackground.tsx`. The
controller writes CSS custom properties only (transform/opacity
consumers), allocates nothing per frame, and stops entirely when the
organism settles — a calm organism costs zero JavaScript per frame.

Scene moods (home balanced / about calmer / systems structured / magic
high energy / work focused / library + blog archival) are static
attribute selectors — no remount, no per-frame cost. Layer groups
declare their mood base through `--mood-opacity`, and the shared
energy modulates the whole field around that base, so interaction
visibly wakes the organism as ONE system. Hidden tabs pause the whole
organism; `prefers-reduced-motion` keeps the slowest breathing layers
at reduced amplitude and disables interaction layers (calm, not dead).
Quality tiers (low / medium / high) trim peripheral layers on
constrained devices while preserving identity.

### Loading priorities

Defined in `lib/loadPhase.ts`:

- **P0** critical — shell, current scene, essential CSS
- **P1** near-critical — most probable next scene (after first idle)
- **P2** predictive — adjacent previous scene (after second idle)
- **P3** background — secondary metadata (nothing schedules this yet)
- **P4** user-triggered — PDFs / audio / video; **never** loaded
  without explicit intent

Background preloading is bounded, skips hidden tabs, and respects
`save-data` / 2G connections.

## Blog content policy (2026 edition)

All four articles are the September 10, 2026 edition — `date` and
`updated` set to `2026-09-10` — written around one thesis: **AI
supplies capability, Will supplies direction, Systems convert the two
into execution.** Each article has a distinct purpose (reasoning
frameworks / living-interface philosophy / time architecture /
constraint-first system building), draws its factual claims about the
2026 AI landscape from attributed public sources, and separates FACT
from ANALYSIS from POSITION in the text. Claims about this site are
backed by this repository; no achievement is claimed beyond what the
code demonstrates.

## Writing an article

1. Create `content/blog/<slug>.md` (slug: lowercase kebab-case).
2. Frontmatter requires `title`, `excerpt`, `date` (YYYY-MM-DD),
   `author`, `category` (kebab-case), and optionally `subtitle`,
   `description`, `updated`, `tags`, `featured`, `cover`
   (`src` under `/blog/images/`, `alt`, `width`, `height`).
3. Markdown subset supported: `##`–`####` headings, paragraphs,
   **bold**, *italic*, `` `code` ``, fenced code blocks, links,
   images, blockquotes, lists, `---` rules.
4. Run `npm run build` (or `npm run blog`). A malformed article fails
   the build with the file and reason.
5. Commit both the article and the regenerated
   `data/blog/posts.json` / `public/blog/feed.xml`.

Generated files (`data/blog/posts.json`, `public/blog/feed.xml`) are
committed so a fresh clone works immediately; CI regenerates them on
every build, so production never serves a stale hand-edited copy.

## Development

```bash
npm ci                # install
npm run dev           # blog pipeline + next dev (http://localhost:3000)
npm run lint          # eslint
npm run blog          # regenerate blog data + feed only
npm run build         # blog pipeline + static export into out/
```

The deployment environment is detected via `GITHUB_ACTIONS=true`
(→ `basePath: "/WEB"`), mirroring `next.config.ts` and
`scripts/build-blog.mjs`.

## Deployment

`.github/workflows/deploy.yml`: checkout → Node 22 + caches →
`npm ci` → Pages setup → Library manifest sync + validation →
blog content validation → Next.js build → static-export verification
(blog routes + feed present) → deployment manifest → Pages artifact →
deploy → deployed-revision verification.

## Verification

```bash
npm ci
npm run lint
npm run build
ls out/blog/ out/blog/<any-slug>/
```
