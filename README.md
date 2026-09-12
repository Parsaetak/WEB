# PARSA TAK — WEB

Live site: https://parsaetak.github.io/WEB/

Repository: https://github.com/Parsaetak/WEB

Version: 2.6.1 — mobile navigation, a working Blog control, and
project-connected writing, on top of the v2.5 RSS-removal /
related-content / SEO-link-graph / reading-motion base and the
v2.5.1–v2.5.7 reading-instrument rounds (TOC, J / K navigation,
copy-link, "/" search, category accents, "Referenced by" reverse
graph, "?" shortcuts dialog, inbound badges, shared-signal hints,
UPDATED chips, click-to-filter card tags, T back-to-top, the
inbound-graph Δ ledger, the text-size control, and Enter-to-open
search). New in 2.6.1: phones and narrow portrait tablets get a
touch-first compact menu in the HUD — one discoverable 44px trigger
expanding a red/black panel of all scenes plus BLOG and GITHUB, with
roving arrow-key focus, Escape / outside-click / selection closing,
no scroll locking, and reduced-motion collapse; the blog header's
top-right BLOG item stops being a dead span and becomes a real link
(aria-current="page" on the index, a return-to-index control on
articles) via a tiny pathname-aware island; and four new articles —
Measuring Machine Intelligence (UHIT), Red Theory and the Living
Web, SHEYTAN: The Local-First Engineering Laboratory, and FreeIran
Engineering Notes — connect the Work projects to the blog through
the existing related-content machinery, with the Work scene's
project cards now routing to their field notes where a real
destination exists.

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
  and the linked Work project cards (RED MAGIC → the Magic scene;
  UHIT, RED THEORY, and AI SYSTEMS → their field-notes articles,
  with plain anchors carrying the deployment basePath explicitly).
- **No untruthful status text.** Loading/error surfaces only claim
  what the code actually offers (the ERROR phase suggests a reload
  because that is the real recovery path).
- **Keyboard parity.** Every newly-linked card has a
  `:focus-visible` outline in the site's quiet outline language.

## Responsive navigation (2.6.1)

One navigation system, two honest modes, switched by viewport
capability (media queries only — no user-agent detection):

- **Compact mode (≤860px — phones and narrow portrait tablets).**
  The horizontal scene track stands down and a shared
  `CompactMenu` island appears in the HUD (world shell) or the blog
  header: one 44px trigger expanding a dark panel with the scene
  list, BLOG, and GITHUB. Real buttons and links only —
  `aria-expanded` / `aria-controls` / `aria-haspopup` on the
  trigger, `aria-current="page"` on the active entry. Opening
  focuses the active entry; Arrow keys / Home / End rove focus;
  Escape closes and restores the trigger; pointer-down outside
  closes; selecting an entry always closes; Tab-past closes. No
  scroll locking, ever. Motion is opacity + transform through the
  global motion tokens and collapses under `prefers-reduced-motion`.
- **Full mode (>860px).** The desktop scene track and the
  full header rows render exactly as before — tablet landscape and
  desktop keep the existing navigation untouched.
- **Blog header parity.** The blog header uses the same compact
  mode; GITHUB rides inside the menu on phones, BLOG stays visible
  as the working area control, and safe-area insets join the
  ≤760px header widths on both shells.

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

### Sitemap + robots

Both are generated from the SAME content index that produces
the routes (`scripts/build-blog.mjs`) — there is no separately
maintained URL list:

- `public/sitemap.xml`: `/`, `/blog/`, every `/blog/<slug>/`.
  `lastmod` is the article's own `updated ?? date` (the blog index
  reflects the newest article date); the home route omits `lastmod`
  rather than fake freshness. No priority/changefreq speculation.
- `public/robots.txt`: standard directives only (`User-agent: *`,
  `Allow: /`, `Sitemap:` absolute production URL). CSS/JS/images
  stay crawlable.
- **No RSS.** v2.5 removed the feed from the product and the
  pipeline entirely — no route, no autodiscovery link, no metadata,
  no build output. `verify:seo` positively verifies the ABSENCE of
  any feed artifact or reference. Discovery happens through the
  sitemap, the internal link graph, and social metadata.

Generated SEO files are committed (like posts.json/sitemap.xml) and
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
  `keywords`, and Open Graph `article:tag` — all generated from the
  same single source of truth.
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
RSS absence everywhere (no feed.xml, no autodiscovery, no
references), no `localhost` / `/blog/undefined`
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
  the tiered related-articles section
- `components/blog/BlogIndex.tsx` — the only client island on the
  index; it receives article **metadata only** (no HTML bodies)
- **Context chips + deep-link filters (2.5.2).** Every article
  header renders its `project` and `topics` as real links into a
  pre-filtered index (`/blog/?project=…`, `/blog/?topic=…`). The
  index reads those parameters as external URL state
  (`useSyncExternalStore` — no effect-time setState, no hydration
  mismatch), combines them with search and tag filters under AND
  semantics, ignores unknown values, and shows the active
  dimensions as removable chips; clearing rewrites the URL with
  `replaceState` so shareable links never lie.
- Related content: a build-time deterministic relationship graph
  (see "Related content model (2.5)" below) — no runtime scoring
- Reading motion: build-time reveal choreography on article blocks,
  a reading-progress instrument, and the organism's reading-focus
  mood (see "Reading motion system (2.5)" below)

Ordering law: posts are sorted date-descending with **slug-ascending
as the deterministic tiebreak**, so the September 10, 2026 edition
(all articles share one date) can never reorder randomly.

### Related content model (2.5)

Related articles are computed ONCE at build time by a deterministic
scoring model — no ML, no runtime work, no randomness:

1. **Explicit relationships** (frontmatter `related:`) are
   author-guaranteed and always come first, in the author's order.
   They are validated: unknown slugs, self-links, and duplicates fail
   the build with the file and the reason.
2. **Scored candidates** then fill the set (up to six related
   articles when the catalogue allows). A candidate qualifies only
   through a real relevance signal — never recency alone:
   - shared tags ×3 each (capped at three)
   - same category ×4
   - same `project` ×3
   - shared `topics` ×2 each (capped at three)
   - shared significant terms from title/subtitle/excerpt/topics
     (stopword-filtered, plural-folded, ×1 each, capped at four)
   - recency: a bounded tie-break (≤1 point) that can only reorder
     already-qualified candidates
3. The article page splits the set into two readable tiers:
   **primary** cards (author-explicit or scored ≥ 8, with excerpt,
   category, date, reading time) and **secondary** compact rows.
   Nothing is shown that a human would not understand.

Optional frontmatter (all non-mandatory, all build-validated):

- `related: ["slug-a", "slug-b"]` — guaranteed connections
- `project: "project-name"` — the system the article belongs to
- `topics: ["topic", "topic"]` — editorial subject tags beyond the
  public `tags`

### Internal link graph (2.5)

Every internal link in article content is validated at build time:

- `/blog/<slug>/` must exist, and an optional `#fragment` must match
  a real heading id of the target article
- `/#<scene>` must match a real hash scene of the world shell
- external links must use `https://` (never `http`, never localhost)
- root-relative links must NOT repeat the deployment base path —
  content is written root-relative; the pipeline adds the base

Anchor text is descriptive ("REP's reasoning protocol", "the OWASP
Top 10 for LLM Applications") — no "click here", no keyword stuffing:
links exist where a reader would genuinely want to follow them.
External links point at primary sources only (official documentation,
standards bodies, the canonical repository).

The export verifier closes the loop (2.5.2): every in-page
`href="#section"` on an exported page must match a real `id` in that
same document — a heading rename that breaks a deep-link is now a
build failure, not a silent dead anchor.

### Reading motion system (2.5)

Reading is animated through the SAME one-observer philosophy as the
rest of the site (MotionReveal) — no new observers, no scroll loops:

- **Build-time choreography.** The blog pipeline annotates every
  top-level article block with `data-reveal` and a chunked
  `data-reveal-order` that restarts at every h2 — a section enters
  as heading first, supporting content settling after (orders 1–4,
  capped). Paragraphs rise, blockquotes settle laterally, code fades
  with a slower ramp, figures scale in, rules simply fade.
- **Solo batches skip stagger.** The controller applies stagger only
  when several elements intersect together; a paragraph scrolling in
  alone never waits for a delay that was meant for a grid.
- **Reading progress.** `components/ReadingProgress.tsx` is a 2px
  fixed bar driven by `transform: scaleX()` — geometry is measured
  once per layout event (never per frame), the scroll handler is
  rAF-coalesced and reads only `scrollY`, and the same controller
  publishes `--reading-progress` + `data-reading` on `<html>`.
- **Reading focus organism mood.** With `data-reading` set, the
  WorldBackground pulls wisps/sparks/particles below their archive
  base — the article owns the reader's attention; leaving article
  pages restores the ambient mood. Opacity-only, existing 1.6s
  transitions smooth both directions.
- **Image parallax.** Figure images drift ±2.2% (±0.8% on small
  screens) via CSS scroll-linked animation (`animation-timeline:
  view()`), using the independent `translate` property so it composes
  with reveal transforms. Browsers without support — and
  reduced-motion users — simply get static images.
- **Route settle.** `app/blog/template.tsx` gives every incoming
  blog page one quiet opacity settle; navigation is never delayed.
- **Table of contents (2.5.1).** `components/blog/ArticleToc.tsx`
  turns the build-time `headings` data into a fixed right-rail
  instrument (≥1280px, geometry chosen so it can never overlap the
  860px content column) and a native `<details>` disclosure on
  smaller screens. ONE IntersectionObserver scroll-spies the active
  section; clicks smooth-scroll (reduced-motion aware); without JS
  the links remain ordinary anchors.
- **Print (2.5.1).** A full print stylesheet: screen chrome
  (organism, header, progress bar, TOC, navigation blocks) steps
  aside and the article prints as a clean document, with external
  link URLs surfaced after their anchors.
- **Heading anchors (2.5.2).** Every h2–h4 renders a server-side
  `#` self-link (build time, zero JS). It appears on heading
  hover/focus and stays quietly visible on touch devices; headings
  that themselves contain a link skip the anchor (no nested `<a>`).
  All heading levels now carry `scroll-margin-top`, so anchored
  landings (TOC clicks, off-site section links) clear the fixed
  header at every level — previously only h4 did.
- **Code block instruments (2.5.2).** Generated fences are wrapped
  in `.code-block`: the box carries the frame and a build-time
  `data-language` label (pure CSS `::after`), while a silent
  `CodeCopy` island (`components/blog/CodeCopy.tsx`) adds one COPY
  button per block after hydration — clipboard API with a legacy
  fallback, "COPIED" feedback, no re-renders. Both instruments pin
  to the wrapper, so wide code scrolls UNDER them instead of
  carrying them away; without JS the code is untouched and fully
  readable.
- **Back to top (2.5.2).** A circular control fixed to the
  bottom-right corner (safe-area aware on mobile) appears past 12%
  reading progress. It reuses the progress controller's rAF tick —
  visibility is one data-attribute write in the same frame as the
  bar, no second loop — and its scroll honors
  `prefers-reduced-motion`.
- **Keyboard article navigation (2.5.3).** `J` follows the NEXT
  link, `K` follows PREVIOUS — the same adjacent-article data the
  visible nav renders, passed as props so the island cannot drift.
  Keys are ignored while typing and with modifiers held; navigation
  goes through the App Router (same client-side transition as
  in-site links). The visible affordance is server-rendered
  `aria-hidden` keycap hints inside the nav labels; on touch devices
  the hints leave the labels entirely.
- **Copy-link instrument (2.5.3).** The article tags row reserves a
  right-hand actions slot; the `ShareLink` island docks a quiet COPY
  LINK button into it after hydration (no button exists without JS).
  It copies the live URL — including any heading hash the reader
  chose to share — with the same COPIED/FAILED feedback vocabulary
  as the code-copy instrument. Hidden in print.
- **Search hotkey (2.5.3).** On the blog index, `/` jumps focus into
  the search field (scroll-into-view, reduced-motion aware), Escape
  inside it clears and blurs. The input carries
  `aria-keyshortcuts="/"`; a decorative keycap chip sits beside it.
- **Category accents (2.5.3).** The three categories carry a
  deterministic color code — systems stays on the brand red,
  research is amber, engineering is teal — applied through
  `data-category` attributes and `currentColor` dots on index cards,
  related cards/rows, and the article header. Color is always
  decorative: the category name is spelled out beside the dot, and
  print re-points the accents at neutral ink.
- **"Referenced by" reverse link graph (2.5.4).** The build scans
  every article's rendered HTML for internal `/blog/<slug>/` links
  and inverts the graph into a `linksHere` index. Articles with
  inbound prose links render a REFERENCED BY section — compact rows
  (red ↩ glyph, accent-dotted category, title, reading time) — so a
  two-way relationship becomes discoverable in both directions and
  the internal link graph a search engine walks is also one a reader
  can walk. Deterministic order, runtime-validated, print-hidden.
- **Inbound-reference badges (2.5.5).** The same validated graph,
  surfaced at a glance: every blog-index card shows a quiet
  "↩ N" badge (red glyph, muted count, tooltip + screen-reader text)
  next to the reading time, and every article header carries an
  "↩ N" pill that fragment-links to its REFERENCED BY section
  (`#referenced-by` — build-verified like every fragment, landing
  below the fixed header, hidden in print where the section does
  not exist). Zero JS — the counts ride the server-rendered data.
- **Shared-signal hints (2.5.5).** Related articles explain WHY they
  are related: the scorer now emits the strongest concrete overlaps
  behind each scored entry (project, then tags, then topics, then
  significant terms — the same authority order as the weights,
  capped at 3), rendered as one quiet mono hint line on primary
  cards and compact rows ("↔ verification · systems-thinking").
  Author-curated frontmatter picks are marked "★ author-curated"
  instead — provenance, honestly labeled. Plain text, never links.
- **Reader text-size control (2.5.7).** The reading column bends to
  the reader: a three-step instrument (A− / A / A+) docks into the
  article tags row beside COPY LINK (after hydration only — without
  JS there is no control and no promise). It writes a single CSS
  custom property (`--reader-scale`, 0.95 … 1.2) that the article
  body and headings multiply — one variable, nothing else on the
  site consumes it, so the preference cannot leak outside the
  article. The choice persists in localStorage (guarded like the
  audio settings, re-validated on read), the range ends disable
  their buttons instead of looping, a visually hidden live region
  announces each step, and the reset button marks the calibrated
  default. Print hides the whole slot, as before.
- **Enter-to-open search (2.5.7).** A type-and-go search now ends
  the way a reader expects: Enter inside the search field opens the
  top visible result — the keyboard twin of clicking the first
  card. It rides the index's existing "/" handler (no new listener
  budget), stands down during IME composition and modified
  keystrokes, and only fires while focus is genuinely in the field.
  An "↵" keycap hint joins "/" in the search wrap (both hidden on
  touch devices), and the "?" reference documents the shortcut on
  the index route.
- **Keyboard shortcuts dialog (2.5.4).** A fixed "?" trigger
  (bottom-left, after hydration only — without JS there is no button
  and no promise) opens a native `<dialog>` listing the shortcuts
  that work on the current route: J/K article navigation on articles,
  `/` search focus on the index, `?` itself, Escape. The platform
  provides focus trapping, Escape, backdrop dismissal, and focus
  restoration; the entrance transition is gated behind
  `prefers-reduced-motion: no-preference`; print hides it. The J/K,
  `/`, and `?` handlers share one `isTypingTarget` guard
  (`lib/keyboard.ts`) so no single-key shortcut ever fires while the
  reader is typing.
- **Reduced motion / no-JS / SEO.** All hidden states exist only
  under the pre-paint `reveal-js` class; reduced motion removes
  travel and stagger; the static HTML always contains the complete
  article — animations are presentation, never a gate.

### Data pipeline

```
content/blog/*.md  (source of truth)
  scripts/build-blog.mjs
    → PARSE frontmatter
    → VALIDATE (fail loudly: file + reason)
    → RENDER markdown → HTML (escaped, subset)
    → NORMALIZE (reading time, covers, basePath-aware URLs)
    → INDEX (tags, categories, related, links-here, prev/next)
    → PRECOMPUTE (per-post search haystack for the client island)
    → EMIT data/blog/posts.json + public/sitemap.xml (same route source)
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

The five September 10, 2026 foundation articles — `date` and
`updated` set to `2026-09-10` — are written around one thesis: **AI
supplies capability, Will supplies direction, Systems convert the two
into execution.** Each has a distinct purpose (reasoning
frameworks / AI Instructions architecture / living-interface
philosophy / time architecture / constraint-first system building),
draws its factual claims about the 2026 AI landscape from attributed
public sources, and separates FACT from ANALYSIS from POSITION in
the text. The AI Instructions article summarises the canonical
source `Parsaetak/Contents@AI-frameworks/Ai-instructions-Sep2026.md`
and links to it.

The four v2.6.1 articles (September 12, 2026) extend the same
convention to the actual public project ecosystem, one article per
`project`: **Measuring Machine Intelligence** (project `uhit` — the
AIST-2026.09 / ASI-100-Elite-2026.09 specifications in
`Parsaetak/Contents@AI-Tests`), **Red Theory and the Living Web**
(project `red-theory` — the five-dynamics model, with the honest
boundary that the demonstrated instance is this repository),
**SHEYTAN: The Local-First Engineering Laboratory** (project
`sheytan-local-agent` — the public v1.1.5Z repository, including its
stated slower-than-llama.cpp native-engine status), and **FreeIran
Engineering Notes** (project `freeiran` — the v0.5.0 Go repository).
Every project claim in these articles is checkable in the linked
public repository; nothing is claimed beyond what the repositories
and this codebase demonstrate. The Work scene's project cards route
to the matching field-notes article where a real destination exists
(see Interaction law) — project → article, article → project
context, article → related article, through the one deterministic
related-content system.

## Writing an article

1. Create `content/blog/<slug>.md` (slug: lowercase kebab-case).
2. Frontmatter requires `title`, `excerpt`, `date` (YYYY-MM-DD),
   `author`, `category` (kebab-case), and optionally `subtitle`,
   `description`, `updated`, `tags`, `featured`, `cover`
   (`src` under `/blog/images/`, `alt`, `width`, `height`), plus the
   relationship metadata `related`, `project`, and `topics`
   (see "Related content model (2.5)").
3. If the cover is an SVG, commit a 1200×630 PNG twin at the same
   path (`<name>.png`) — the build fails without it because
   `og:image` needs a crawler-renderable format. The twin is used
   for social metadata only; the visible page keeps the SVG.
4. Markdown subset supported: `##`–`####` headings, paragraphs,
   **bold**, *italic*, `` `code` ``, fenced code blocks, links,
   images, blockquotes, lists, `---` rules.
5. Internal links point at real routes (`/blog/<slug>/`, `/`,
   `/#scenes` for scenes) with descriptive anchors — the build
   validates `/blog/…` links against known slugs AND heading
   fragments, `/#…` links against real scenes, and fails on any
   dead link, http:// external URL, or repeated base path.
6. Run `npm run build` (or `npm run blog`). A malformed article fails
   the build with the file and reason.
7. Commit the article and the regenerated
   `data/blog/posts.json` / `public/sitemap.xml`.

Generated files (`data/blog/posts.json`, `public/sitemap.xml`) are
committed so a fresh clone works
immediately; CI regenerates them on every build, so production never
serves a stale hand-edited copy.

## Development

```bash
npm ci                # install
npm run dev           # blog pipeline + next dev (http://localhost:3000)
npm run lint          # eslint
npm run blog          # regenerate blog data only
npm run build         # blog pipeline + static export into out/
```

The deployment environment is detected via `GITHUB_ACTIONS=true`
(→ `basePath: "/WEB"`), mirroring `next.config.ts` and
`scripts/build-blog.mjs`.

## Deployment

`.github/workflows/deploy.yml`: checkout → Node 22 + caches →
`npm ci` → Pages setup → Library manifest sync + validation →
blog content validation (posts.json + sitemap + no feed) → Next.js
build → static SEO verification (`verify-seo.mjs`) → export
verification (blog routes, sitemap, robots, og image present, feed
absent; sitemap URL count matches article count) → deployment
manifest → Pages artifact → deploy → deployed-revision verification.

## Verification

```bash
npm ci
npm run lint
npm run build
npm run verify:seo   # static SEO checks against out/
ls out/blog/ out/blog/<any-slug>/ out/sitemap.xml out/robots.txt
```