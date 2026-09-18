# AGENTS.md — Engineering Operating Guide for WEB

Persistent operating guide for any coding agent (human or AI) working in this
repository. Read it before your first change; re-read it before you argue with
it. The current live code always wins over documentation — including this file
— but the laws below describe *why* the code looks the way it does, so treat a
violation as a bug to be justified, not a style preference.

---

## Project identity

- **WEB** is the personal site of Parsa Tak: an evolving laboratory for AI
  systems, local AI agents, reasoning, evaluation, software engineering, and
  creative technology. It hosts the canonical **Work**, **Research**, and
  **Blog** surfaces plus six topic hubs.
- **RED MAGIC** is the site's signature: a living computational organism — a
  canvas-rendered energy field with a core, network, membrane, particles,
  energy flows and atmosphere. It is the product's visual identity, not a
  decoration. Never simplify it into a "generic animation".
- The **13-point star** (see `TRADEMARKS.md`, `lib/brand.ts`) is the brand
  mark. Preserve it everywhere it appears.
- The information architecture is **Blog-centered**: the Blog
  (`/blog/`) is the primary discovery surface for writing, work
  documentation, and research writing (content modes: ARTICLES / WORK /
  RESEARCH). The world shell (`/`) is an experiential scene navigator;
  `/work/` and `/research/` are canonical deep documents.

## Architecture

- **Next.js App Router + React + TypeScript**, `output: "export"` static
  export, deployed to **GitHub Pages** at `/WEB` (basePath applied when
  `GITHUB_ACTIONS=true`; see `next.config.ts` and the `NEXT_PUBLIC_BASE_PATH`
  env inline).
- **Public route model** (canonical registry: `data/routes.json`): home world
  shell `/`, identity documents `/about/`, `/contact/`, collections `/work/`,
  `/research/`, six topic hubs (`/local-ai/`, `/ai-systems/`,
  `/ai-reasoning/`, `/ai-evaluation/`, `/software-engineering/`,
  `/creative-technology/`), Blog index `/blog/`, articles `/blog/<slug>/`
  (derived from `content/blog/*.md`). World-shell hash scenes (`/#systems`,
  `/#magic`, `/#library`) are interaction states — never documents, never
  sitemap entries.
- **RED MAGIC is lazy-loaded.** `components/RedMagic.tsx` (~7k lines) is
  dynamically imported at idle time (`components/HomeOriginOrganism.tsx`,
  MagicConsole usage) with a CSS seed fallback. Never move the organism into
  the main bundle; never convert the raw `import()` to `next/dynamic`/Suspense
  (that broke static export before — see the file's header comment).
- Blog pipeline: `scripts/build-blog.mjs` parses/validates/renderers
  `content/blog/*.md` → `data/blog/posts.json` + `public/sitemap.xml`. A
  malformed article FAILS the build. Run before dev/build.
- **SEO registry**: `data/routes.json` is the single manually maintained
  route list. The sitemap generator, the SEO verifier, and `lib/hubs.ts` all
  derive their route facts from it. Do not create parallel route lists.
- Supporting engines: `lib/worldSignals.ts` (shared organism runtime state),
  `components/redmagic/engineConfig.ts` (quality budget / runtime states /
  adaptive-DPR policy / refresh estimator), `lib/backgroundScheduler.ts` +
  `lib/idleScheduler.ts` (idle-time loading).

## Core rules

1. **Inspect live code before claims.** Verify behavior in the current source
   and current commit; never trust old docs, old worklog entries, or memory.
2. **Preserve the working architecture.** Incremental, measured improvements.
   No framework migration, no speculative rewrites, no cosmetic reshuffles of
   working files.
3. **No invented metrics.** Never fabricate benchmark numbers, fps figures,
   coverage stats, or test results. Report only what you measured, and say
   how. The site's own copy never claims guaranteed frame rates — keep it
   that way.
4. **No fake performance claims** in code comments, UI copy, README, or
   commits. The organism's telemetry reports *measurements*, not trophies.
5. **The DRIFT / LISTEN / SURGE interaction modes are RETIRED.** Do not
   reintroduce them as UI modes, identifiers, or copy. (Library media verbs
   READ/LISTEN/WATCH and historical "retired in v3.5" notes are unrelated and
   stay.) Legacy identifier example: `ANGULAR_FALLOFF_ACTIVE` (formerly
   `ANGULAR_FALLOFF_SURGE`) — neutral names, equivalent behavior.
6. **Preserve reduced-motion behavior.** `prefers-reduced-motion: reduce`
   means one static frame for RedMagic, calm CSS-only breathing for
   WorldBackground, no ripples/pulses, seed-only hero. Every change must keep
   this path working.
7. **Preserve mobile behavior.** Coarse pointers, small viewports, and
   low-memory devices resolve to lower quality tiers; quality must degrade
   gracefully and navigation must stay fast.
8. **Preserve static-export compatibility.** No server runtime, no server
   actions, no ISR/SSR assumptions. Everything ships as files. `Suspense`
   boundaries around dynamic imports are dangerous in export — know the
   history before touching loading architecture.
9. **No new dependencies** without overwhelming justification. The runtime
   dependency list is Next/React only; scripts are zero-dependency Node.
10. **No analytics, no remote runtime services, no telemetry uploads.** The
    organism's diagnostics are in-memory and development-facing only.

## Engineering workflow

Work in this order; do not skip steps:

```
INSPECT → REPRODUCE → ROOT CAUSE → PLAN → IMPLEMENT → VERIFY → REGRESSION CHECK → CLEAN-ROOM BUILD → DELIVER
```

- INSPECT: read the actual code paths involved (all of them), current `main`,
  latest commit, workflow status.
- REPRODUCE: demonstrate the bug/regression before fixing it; for
  performance work, MEASURE before and after (a micro-benchmark script is a
  legitimate artifact — see `components/redmagic/engineConfig.ts` docs and
  the bounded-potential measurement note in `components/RedMagic.tsx`).
- ROOT CAUSE: name the mechanism, not the symptom.
- PLAN: state the blast radius; choose the smallest correct change.
- IMPLEMENT: follow the file-local conventions (RedMagic.tsx uses a vertical
  formatting style; keep new code consistent with its host file).
- VERIFY: run the full pipeline below.
- REGRESSION CHECK: re-verify the unaffected behaviors listed in the mission
  of the change (mobile, reduced motion, idle, hidden tab, resize…).
- CLEAN-ROOM BUILD: fresh `npm ci` + full pipeline from a clean state;
  inspect `git status` and the final diff; no stray files, no debug code.
- DELIVER: one clean commit describing the upgrade; verify GitHub Actions on
  it.

## RED MAGIC rules

- **Quality must reduce actual work.** A tier is a concrete budget allocation
  (`components/redmagic/engineConfig.ts`): grid size, particle pool, membrane
  resolution, flow count/segments, atmosphere allowance. Changing a label
  without changing per-frame work is a bug.
- **Two-level adaptation.** SOFT adaptation (particle active limit, draw
  strides, glow/atmosphere scaling) applies immediately and is safe in any
  frame. HARD adaptation (structural rebuilds: grid, membrane boundary,
  particle pools, influence tables) happens only on settled frames — never
  mid-interaction, never every frame.
- **Avoid hot-path allocations and redundant scans.** Per-frame object
  allocation in the render loop is a forbidden regression. Aggregates are
  tracked where data is already in registers (e.g. highest node energy is
  computed in `updateGrid`, not re-scanned in `drawCore`).
- **Adaptive runtime behavior.** Explicit runtime states (reduced /
  suspended / idle / ambient / active / recovery) drive simulation scale and
  redraw cadence. Idle must be substantially cheaper than active; hidden must
  cost nothing. A still pointer with settled energy falls into idle.
- **Continuous interaction energy.** Energy follows measurable signals
  (proximity, speed, dwell, impulse memory, charge) with rise/fall dynamics —
  never binary "pointer exists = maximum".
- **Adaptive DPR + refresh estimation** are debounced policies in
  `engineConfig.ts`; DPR never raises while the engine under-performs; the
  refresh estimate initializes conservatively, adopts only sustained-faster
  windows, decays on sustained collapse, and suspends with the tab.
- **Shared visual/performance budget.** `WorldBackground` (low-cost ambient
  organism) and the `RedMagic` canvas (high-detail interactive organism)
  coordinate through `lib/worldSignals.ts` organism activity: the ambient
  layer backs off its pointer-energy gain and skips duplicate ripples while
  the interactive organism is visibly responding.
- **Lazy loading must remain intact** (see Architecture).

## SEO rules

- **Canonical registry**: route identity, SEO metadata, sitemap policy,
  structured-data expectations, nav surfaces and hub relationships live in
  `data/routes.json`. Sitemap (`build-blog.mjs`), verifier
  (`verify-seo.mjs`), and route metadata (`lib/routes.ts` → `lib/hubs.ts`)
  derive from it. Update the registry, never a derived copy.
- **Crawlable internal architecture**: every document reachable through real,
  descriptive internal links; no orphan content; no generic anchor text
  ("read more"); collections discoverable from home AND blog index.
- **No invented indexing/ranking claims**: verification covers repository and
  exported-artifact facts only (metadata presence, canonical correctness,
  graph connectivity/depth, sitemap/robots coherence). Nothing here claims
  rankings, indexing status, or traffic.
- **Graph verification**: `verify-seo.mjs` checks route metadata, JSON-LD
  per route, internal link graph resolution, content graph connectivity, and
  graph depth (inbound census, orphan/orphan-adjacent articles, hub
  coverage percentage, anchor quality, canonical↔sitemap equality). It fails
  loudly on structural regressions.
- **Structured data verification**: every canonical page carries its
  registered JSON-LD types; article dates/authors must match the content
  index; one coherent Person/WebSite entity graph.
- **lastmod honesty**: content-revision dates only — never the build date.
- **No query/filter URLs in the sitemap**: Blog filter state is view state.

## Validation

Exact commands (from the repository root):

```bash
npm ci                 # clean install (CI uses --legacy-peer-deps)
npm run blog           # content pipeline → data/blog/posts.json + sitemap.xml
npm run build          # blog pipeline + next build (static export → out/)
npm run lint           # eslint — must stay at 0 errors
npm run verify         # verify:seo + verify:brand + verify:export
./node_modules/.bin/tsc --noEmit   # typecheck
npm run verify:seo     # SEO verification alone (needs out/ from build)
```

`npm run verify:seo` runs against `out/` after `next build` and includes the
v2 graph-depth group. `npm run verify:export` cross-checks the three-way
bijection: app routes == exported files == sitemap URLs.

Manual/behavioral checklist for organism-affecting changes (desktop +
mobile viewport, reduced motion, low-memory emulation, hidden/visible tab,
pointer interaction, idle ~10s, resize, quality downgrade/recovery, route
navigation, blog filters): console stays clean, no visual instability during
quality changes, initial page load and lazy-loading path unchanged.
