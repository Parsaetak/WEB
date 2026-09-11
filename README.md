# PARSA TAK — WEB

Live site: https://parsaetak.github.io/WEB/

Repository: https://github.com/Parsaetak/WEB

Version: 2.4.0 — the full regression / UI-cleanup / SEO-hardening
edition: dead interactive affordances repaired (every control that
promises an action now performs it, and inert cards no longer look
clickable), incorrect internal links fixed, the short-label
punctuation rule enforced site-wide, and the identity terms SHEYTAN
and Red illuminati integrated truthfully (visible metadata, one
mention each — never hidden keyword text).

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

## Interaction law (2.4)

Every visible affordance must tell the truth:

- **Buttons act, links navigate.** A `<button>` performs a UI action
  (state change, modal, filter); navigation destinations are real
  `<a>`/`<Link>` elements. No clickable `<div>`s where a semantic
  button or link exists.
- **No dead affordances.** An element with hover motion, an arrow
  glyph, or a "link" shape must navigate somewhere real. Cards
  without destinations are informational panels and carry no
  hover-lift/arrow affordance (see `data-linked` / `data-article`
  scoping in the Work and Systems scenes).
- **Full-card links.** Where a card's summary and its destination
  coincide, the whole card is one link (no nested `<a>` inside
  `<a>`) — Home system rows, the Systems AI-INSTRUCTIONS module,
  and the Work RED MAGIC project.
- **No untruthful status text.** Loading/error surfaces only claim
  what the code actually offers (the ERROR phase suggests a reload
  because that is the real recovery path).
- **Keyboard parity.** Every newly-linked card has a
  `:focus-visible` outline in the site's quiet outline language.

## Text style rule (2.4)

One editorial rule, applied site-wide and enforced by
`verify-seo.mjs` on the exported HTML:

- **Short UI / labels** (kickers, buttons, nav, status chips,
  uppercase metadata, stacked display headings): no terminal `.`.
- **Full prose sentences** (body copy, article text): normal
  punctuation.
- **Technical values / versions / statuses**: the component's
  intended format.

## SEO architecture (2.3)

Principle: **technical SEO improves machine understanding without
damaging human understanding.** No keyword walls, no hidden text, no
SEO-only sections — every signal corresponds to real content, and
all of it is generated at build time into static HTML (no client
SEO framework, no backend).

### Canonical strategy

- One canonical base for the whole site: `metadataBase =
  https://parsaetak.github.io/WEB/` (absolute, HTTPS, stable,
  `/WEB`-aware).
- Every indexable route emits exactly one canonical URL: `/`,
  `/blog/`, and each `/blog/<slug>/` — absolute, trailing-slash,
  production host. Hash scenes are interaction states of `/`, never
  separate documents; concepts that deserve indexing get real
  `/blog/<slug>/` routes instead.
- Root-relative metadata URLs resolve against `metadataBase`; only
  article-page `<img>` srcs are basePath-prefixed (by the blog
  pipeline, which mirrors `next.config.ts`).

### Entity identity (lib/seo.tsx)

One coherent entity model for the whole site, emitted once in the
root layout as a `@graph` of `Person` + `WebSite`:

- `Person` @id `…/WEB/#person` — name, URL, description, `sameAs`
  (selected from `lib/links.ts` profile URLs only — nothing
  invented; contact channels are deliberately excluded).
- `WebSite` @id `…/WEB/#website` — references the Person as
  author/publisher.
- Route-specific objects interlock through these @id anchors
  instead of redefining entities: home adds `WebPage`, `/blog/` adds
  `Blog` (with `BlogPosting` stubs whose @ids match the article
  graphs), articles add `BlogPosting` + `BreadcrumbList`.
- Article `BlogPosting` carries headline, description, url, real
  `datePublished`/`dateModified` (from the content model — ISO
dates, never manufactured), author/publisher (Person @id + name),
  cover image, keywords, wordCount, articleSection, inLanguage.
  `BreadcrumbList` mirrors the real navigation: Home → Blog →
  article.

### Sitemap + robots + feed

All three are generated from the SAME content index that produces
the routes (`scripts/build-blog.mjs`) — there is no separately
maintained URL list:

- `public/sitemap.xml`: `/`, `/blog/`, every `/blog/<slug>/`.
  `lastmod` is the article's own `updated ?? date` (the blog index
  reflects the newest article date); the home route omits `lastmod`
  rather than fake freshness. No priority/changefreq speculation.
- `public/robots.txt`: standard directives only (`User-agent: *`,
  `Allow: /`, `Sitemap:` absolute production URL). CSS/JS/images
  stay crawlable.
- `public/blog/feed.xml` (RSS 2.0) with autodiscovery
  `<link rel="alternate">` on `/blog/` (emitted by the page, not
  just the layout — Next shallow-merges `alternates`, so the page
  must repeat `types`).

Generated SEO files are committed (like posts.json/feed.xml) and
regenerated on every build; the workflow validates them after the
export.

### Social previews

- Every route emits `og:image` + `twitter:card` metadata. Articles
  use their cover; home and blog index use `public/og-default.png`
  (1200×630).
- Cover convention: each `public/blog/images/<name>.svg` cover has
  a PNG twin at the same path (1200×630) — social crawlers render
  PNG, not SVG. The build validates the twin exists and fails
  loudly otherwise; the twin path is exposed as `cover.ogSrc`
  (root-relative, metadata-only) in posts.json.
- Image URLs in metadata are production-absolute under
  `metadataBase`; JSON-LD images are explicitly absolute.

### Identity keywords (2.4)

SHEYTAN and "Red illuminati" are legitimate identity terms for this
project (claimed marks / artistic labels). They are integrated
truthfully and sparsely:

- **SHEYTAN** — one mention in the site `<meta name="keywords">`,
  one in the `Person` entity description (as part of the real
  framework/experiment family). It corresponds to a mark claimed in
  `TRADEMARKS.md`.
- **Red illuminati** — one mention in the site keywords and one
  visible tag on the RED MAGIC article (which the term actually
  labels). It appears in the article's visible tag list, JSON-LD
  `keywords`, Open Graph `article:tag`, and the RSS category — all
  generated from the same single source of truth.
- **Never** as hidden text, off-screen text, opacity-0 keyword
  blocks, or repeated dozens of times. Every term names something
  the site actually presents.

### Verification

`npm run verify:seo` (scripts/verify-seo.mjs, zero dependencies)
inspects the EXPORTED artifacts after `next build`: exactly one
`<title>` per route, meta descriptions, canonical/og URLs
(production HTTPS, `/WEB`-aware), JSON-LD parses with expected
types, article dates/author match the content index, sitemap URL
set equals the exported route set, robots references the sitemap,
feed contains every article, no `localhost` / `/blog/undefined`
anywhere — plus, since 2.4, an **interaction audit** (no `href="#"`,
no empty `href`, no `javascript:` URLs, and every root-relative
href resolves to an exported route) and a **text-QA audit** (no
uppercase label-style text ending in a terminal period). CI runs it
on every deploy.

The site is Search-Console-ready (sitemap submission, URL
inspection, rich-results testing), but indexing itself is a
 crawler-side decision that happens after deployment.

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
              + public/sitemap.xml (from the same route source)
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

All five articles are the September 10, 2026 edition — `date` and
`updated` set to `2026-09-10` — written around one thesis: **AI
supplies capability, Will supplies direction, Systems convert the two
into execution.** Each article has a distinct purpose (reasoning
frameworks / AI Instructions architecture / living-interface
philosophy / time architecture / constraint-first system building),
draws its factual claims about the 2026 AI landscape from attributed
public sources, and separates FACT from ANALYSIS from POSITION in
the text. The AI Instructions article summarises the canonical
source `Parsaetak/Contents@AI-frameworks/Ai-instructions-Sep2026.md`
and links to it; further project articles (REP, USEF, and others)
will follow the same convention as research completes. Claims about
this site are backed by this repository; no achievement is claimed
beyond what the code demonstrates.

## Writing an article

1. Create `content/blog/<slug>.md` (slug: lowercase kebab-case).
2. Frontmatter requires `title`, `excerpt`, `date` (YYYY-MM-DD),
   `author`, `category` (kebab-case), and optionally `subtitle`,
   `description`, `updated`, `tags`, `featured`, `cover`
   (`src` under `/blog/images/`, `alt`, `width`, `height`).
3. If the cover is an SVG, commit a 1200×630 PNG twin at the same
   path (`<name>.png`) — the build fails without it because
   `og:image` needs a crawler-renderable format. The twin is used
   for social metadata only; the visible page keeps the SVG.
4. Markdown subset supported: `##`–`####` headings, paragraphs,
   **bold**, *italic*, `` `code` ``, fenced code blocks, links,
   images, blockquotes, lists, `---` rules.
5. Internal links point at real routes (`/blog/<slug>/`, `/`,
   `/#systems` for scenes) with descriptive anchors — the build
   validates `/blog/…` links against known slugs and fails on
   unknown ones.
6. Run `npm run build` (or `npm run blog`). A malformed article fails
   the build with the file and reason.
7. Commit the article and the regenerated
   `data/blog/posts.json` / `public/blog/feed.xml` /
   `public/sitemap.xml`.

Generated files (`data/blog/posts.json`, `public/blog/feed.xml`,
`public/sitemap.xml`) are committed so a fresh clone works
immediately; CI regenerates them on every build, so production never
serves a stale hand-edited copy.

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
blog content validation (posts.json + feed + sitemap) → Next.js
build → static SEO verification (`verify-seo.mjs`) → export
verification (blog routes, feed, sitemap, robots, og image present;
 sitemap URL count matches article count) → deployment manifest →
Pages artifact → deploy → deployed-revision verification.

## Verification

```bash
npm ci
npm run lint
npm run build
npm run verify:seo   # static SEO checks against out/
ls out/blog/ out/blog/<any-slug>/ out/sitemap.xml out/robots.txt
```
