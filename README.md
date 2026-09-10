# PARSA TAK — WEB

Live site: https://parsaetak.github.io/WEB/

Repository: https://github.com/Parsaetak/WEB

Version: 2.1.0 — memory lifecycle, data pipeline throughput, loading
orchestration, and the living organism upgrade.

## Stack

- Next.js 16 (App Router, `output: "export"`, static only)
- React 19, TypeScript
- GitHub Pages deployment (no server, no runtime backend)
- Zero runtime content dependencies — the data layer is custom and typed

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
- `WorldBackground` (CSS ambient) and `RedCursor` (native CSS cursor)
  are mounted once from the shell

### Blog (routes)

`/blog/` and `/blog/<slug>/` are real statically exported routes:

- `app/blog/layout.tsx` — shared shell (background, cursor, header, footer)
- `app/blog/page.tsx` — index: featured article + search/tag island
- `app/blog/[slug]/page.tsx` — article pages with full metadata,
  Open Graph/Twitter cards, JSON-LD `BlogPosting`, prev/next and
  related posts
- `components/blog/BlogIndex.tsx` — the only client island on the
  index; it receives article **metadata only** (no HTML bodies)
- RSS feed: `/blog/feed.xml`, generated from the same content index

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
- SHORT — energy wisps (31–61 s, alternating directions)
- MEDIUM — orbital rings (34–82 s, mixed directions)
- LONG — atmospheric masses + aura (28–57 s)
- HEART — core + nucleus breathing (8.5–19 s)
- EVENT — transition pulse + click ripples (controller-triggered)

Coherence and state flow through one attribute set on the root
(`data-scene` mood, `data-quality` tier, `data-hidden`, `data-reduced`)
plus three shared CSS variables (`--organism-energy`,
`--organism-pointer-x/y`) written by a single self-suspending rAF
controller in `lib/worldSignals.ts` + `WorldBackground.tsx`. The
controller writes CSS custom properties only (transform/opacity
consumers), allocates nothing per frame, and stops entirely when the
organism settles — a calm organism costs zero JavaScript per frame.

Scene moods (home balanced / about calmer / systems structured / magic
high energy / work focused / library + blog archival) are static
attribute selectors — no remount, no per-frame cost. Hidden tabs pause
the whole organism; `prefers-reduced-motion` keeps the slowest
breathing layers at reduced amplitude and disables interaction layers
(calm, not dead). Quality tiers (low / medium / high) trim peripheral
layers on constrained devices while preserving identity.

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
