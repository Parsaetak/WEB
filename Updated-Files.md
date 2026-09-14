# Updated-Files.md — WEB release history

## Release: CI basePath fix + Next.js 16.3.4 upgrade (2026-09-14)

Base commit: `e74b05a938366081a158c8c1a3462a2ca21abe8b` ("2026-09-14")

### Root cause fixed

CI failed on `e74b05a` with:

```
✗ home: expected ≥3 crawlable article links from the Writing section, found 0
```

`scripts/verify-seo.mjs` matched Writing links with a hard-coded
`/blog/<slug>/` pattern. Under GitHub Pages the exported hrefs carry
the `/WEB` basePath (`/WEB/blog/<slug>/`), so the check found 0 links
in CI while the same build passed locally. The application itself was
correct — the verifier was blind to the deployment shape.

### Files changed

- `scripts/verify-seo.mjs`
  - Writing-link check rebuilt on the script's existing `BASE_PATH`
    constant (single source of truth): detects article hrefs in both
    shapes, keeps the ≥3 requirement, and now also verifies every
    detected target resolves to a real exported article route
    (rejects `/blog/undefined`, localhost, and stale slugs).
  - Consolidated duplicated constants: the internal-link-graph audit
    reuses `BASE_PATH` and the shared `SCENE_HASHES` set instead of
    private copies.
  - Extracted `toVisibleText()` (shared crawler-view projection) and
    `verifyWritingLinks()`; document header now indexes the check
    groups. `verifyHomeContent()` receives the already-collected
    article routes instead of re-scanning the export.
- `package.json` / `package-lock.json`
  - `next` and `eslint-config-next` 16.3.3 → **16.3.4**. React stays
    at 19.2.8 (no compatibility issue). Lockfile updated by npm.
  - New `build:next` script (`next build` alone); `npm run build`
    composes blog pipeline + `build:next`.
- `.github/workflows/deploy.yml`
  - The blog pipeline previously ran twice per build (validation step
    and again inside `npm run build`). The validation step still runs
    first and fails fast; the build step now runs `npm run build:next`
    so the deterministic pipeline is evaluated once.
  - Inline Library-manifest validation heredoc moved to
    `scripts/validate-library-manifest.mjs` (same gate, now runnable
    locally, clearer failure messages).
- `components/scenes/HomeScene.tsx`
  - Readability refactor, no markup/CSS/behavior change: extracted
    `HomeSectionIntro`, `HomeProjectCard`, `HomeSystemItem` (also
    deduplicates the anchor/Link branch), and `HomeWritingItem`.
    Module comment states the static-render and import-boundary
    laws; version-number chatter removed from comments.
- `README.md`
  - Rewritten as a project homepage for visitors, recruiters/clients,
    developers, and AI agents (architecture invariants, source-of-
    truth map, verification law). Detailed historical releases remain
    in this file and worklog.md.
- `worklog.md`
  - Added Law 66 (Base-Path Verification) and Law 67 (Single Pipeline
    Evaluation).

### Verified

- CI-mode export: `GITHUB_ACTIONS=true npm run build` then
  `node scripts/verify-seo.mjs` → 100 checks passed, Writing links
  detected and resolved (`/WEB/blog/…`).
- Local-mode export: same without the env var → passes.
- `npm run lint` → 0 errors (16 pre-existing intentional
  `no-img-element` warnings; images are unoptimized by design under
  static export).
- Home critical-path JS: 11 chunks, unchanged mass (≈643 KB raw,
  Turbopack, uncompressed on-disk) — no secondary scene, no RED MAGIC
  subsystem, no blog body in the initial graph (verified by scanning
  the loaded chunks).
- Clean-room check: archive extracted to an empty directory, fresh
  `npm install`, build, lint, verify all pass; `next` resolves to
  16.3.4 in the extracted copy.

---

# WEB 3.0.0 Professional SEO, Content Graph, Readability, Performance & Interaction Upgrade

## Release

| Field | Value |
| --- | --- |
| Release / version | **3.0.0** (crawlable-first home document, lazy organism, home Writing section, knowledge-graph link repair, readability pass, interaction system, verification tightening) |
| Base commit | `fec289e5d81b9f52917fc94cc7ec0702eaa062f2` ("2026-09-13") |
| Date | 2026-09-14 |

### Why 3.0.0 exists

The 2.9.0 site rendered the home scene through `next/dynamic`. During
static export a dynamic scene suspends, so React streamed the entire
homepage as a hidden Suspense completion (`<div hidden id="S:0">`)
while the visible document showed only a loading gate. The homepage's
H1, positioning, capabilities, projects and links existed only in the
flight payload — invisible to crawlers that do not execute React
hydration, to social scrapers, and to visitors with JavaScript
disabled. The boot loading gate had no no-JS escape either, and the
hero mounted the full 6.8k-line RED MAGIC canvas organism eagerly.

3.0.0 inverts the architecture to the target model:

```text
semantic/static HTML → real professional content → React hydration
→ living scene system → animation → RED MAGIC (enhancement layer)
```

1. **The home document is genuinely crawlable.** The home scene is
   statically imported into `SceneRegistry` and `SceneViewport` no
   longer wraps it in a Suspense boundary. The exported `index.html`
   now carries the complete homepage inline in `<main>` — h1, core
   positioning, capabilities, five featured projects with crawlable
   links, workflow, frameworks, Writing, and Connect — 964 visible
   words before any JavaScript, versus 10 before (the loading gate).
   Lazy hash scenes keep their Suspense boundary and their
   interaction-gated loading.
2. **The RED MAGIC organism is an idle-time enhancement.** The hero
   renders a CSS-only seed (glow, membrane rings, 13-point star) in
   the exported HTML. After hydration, and only when the environment
   allows it (motion permitted, no save-data, not a memory-
   constrained device), one dynamic `import()` fetches the organism
   chunk at idle time and mounts it over the seed. Reduced-motion,
   save-data and low-memory visitors keep the complete dormant hero
   permanently.
3. **No-JS and reduced-motion safety gates.** The boot loading gate
   is hidden by default and becomes visible only under the pre-paint
   `html.reveal-js` class — the same law the reveal system already
   followed. Without JavaScript the world renders directly.
4. **Home Writing section.** The strongest articles (author-flagged
   featured first, then by real inbound internal-link count, then by
   date) are selected on the server from the content index and passed
   down as serializable props — the server-only blog data layer never
   enters the client graph. The section links real article routes
   with a quiet "↩ N references" badge from the site's own graph.
5. **Knowledge-graph repair.** The two zero-inbound articles
   (`freeiran-engineering-notes`, `red-theory-and-the-living-web`)
   gained honest contextual inbound links from three related articles
   (`building-under-constraints`, `sheytan-the-local-first-laboratory`,
   `why-the-website-is-a-living-system`). Every project-tagged article
   now also links to the Work scene through a `SCENE · Work ↗` context
   chip. No artificial links: each new edge names a real technical
   relationship.
6. **Readability.** Article body scale rises to 17–18.7px (≈1.06–1.17rem)
   with a 745px measure (≈72ch at body size, inside the 65–78ch
   target), paragraph spacing 1.4em → 1.5em, article header metadata
   10px → 11px, site-wide `.body` copy 1rem → 1.0625rem. The mono
   label hierarchy is untouched.
7. **Interaction system.** Shared buttons gain a press state (90ms
   contact), a release ease, an explicit focus-visible ring and a
   disabled state; hover travel is guarded by
   `prefers-reduced-motion: no-preference`. Home scene rows/cards gain
   arrow nudges, artwork scale, press feedback and keyboard focus
   rings — transform/opacity only, reduced-motion aware, no layout
   animation.
8. **Verification tightening.** `verify-seo.mjs` now fails the build
   if the home h1 is not inside `<main>`, if a hidden streamed
   Suspense wrapper exists, if core positioning/writing phrases are
   missing from the visible main document, or if fewer than three
   crawlable article links ship on the home route. A new internal
   link-graph audit resolves every internal article/scene href across
   all exported pages, fails on broken/localhost/repository-clone
   destinations, and reports per-article inbound link counts with a
   warning (not a failure) on zero-inbound articles.

### What deliberately did not change

The six-scene world architecture, the visual identity (13-point star
= site, Red Eye = RED MAGIC), the SEO entity graph, canonical/OG/Twitter
metadata, sitemap generation law (lastmod from real article dates only),
the GSC verification token
(`K8PQwvcGcrpBCyR-6XbmnDhv2IFPxpxjXV90UY7glTo`), the asset system, and
the blog pipeline were preserved. No new runtime dependencies.

---

## Added

| File | Purpose |
| --- | --- |
| `components/HomeOriginOrganism.tsx` | Lazy hero organism: CSS seed in SSR, one idle-time `import()` for the RED MAGIC canvas, capability-gated (reduced motion / save-data / device memory) |
| `lib/homeWriting.ts` | Server-side Writing selection for the home scene (featured → inbound links → date), serializable props only |

## Modified

| File | Change |
| --- | --- |
| `components/SceneRegistry.tsx` | Home scene statically imported (was `dynamic()`); `suspense={renderedScene !== "home"}`; `writingPosts` prop forwarded to the home scene |
| `components/SceneViewport.tsx` | Conditional Suspense boundary (`suspense` prop) — the P0 fix that keeps large synchronous scene content inline in the exported HTML instead of React's hidden streamed completion |
| `components/scenes/HomeScene.tsx` | Organism via `HomeOriginOrganism` (was static RedMagic import); new Writing section; `writingPosts` prop; `formatBlogDate` from the client-safe formatter module |
| `components/scenes/HomeScene.module.css` | Seed visual styles; Writing section styles; interaction refinements (artwork scale, arrow nudge, press states, focus rings) with reduced-motion guards |
| `components/LivingShell.tsx` | `writingPosts` prop threading to `SceneRegistry` |
| `components/SceneLoadingScreen.module.css` | Boot gate hidden by default, visible only under `html.reveal-js` (no-JS safety) |
| `app/page.tsx` | Server-side `getHomeWritingPosts()` → `LivingShell writingPosts` |
| `app/globals.css` | `.body` 1.0625rem; button interaction system (press/release/focus/disabled, reduced-motion guard) |
| `app/blog/[slug]/article.module.css` | Body 17–18.7px, measure 745px, paragraph spacing 1.5em, header meta 11px |
| `app/blog/[slug]/page.tsx` | `SCENE · Work ↗` context chip linking project-tagged articles to the Work scene |
| `content/blog/building-under-constraints.md` | Contextual link to `freeiran-engineering-notes` (real engineering-philosophy relationship) |
| `content/blog/sheytan-the-local-first-laboratory.md` | Contextual link to `freeiran-engineering-notes` (shared Go-first discipline) |
| `content/blog/why-the-website-is-a-living-system.md` | Contextual link to `red-theory-and-the-living-web` (theory ↔ demonstration) |
| `scripts/verify-seo.mjs` | P0 home-content assertions (h1 in main, no S:0 wrapper, visible-main phrases, ≥3 article links) + internal link-graph audit with orphan report |
| `data/blog/posts.json` | Regenerated by `scripts/build-blog.mjs` from the three edited articles (body HTML, related/linksHere indexes) |
| `package.json` | Version 2.9.0 → 3.0.0 |

## Deleted

None.

---

## Behaviour changes

### Homepage rendering
- Exported `out/index.html` contains the full home scene inline in
  `<main>` (h1 → positioning → capabilities → featured work → method →
  frameworks → writing → direction → connect). Before: 10 visible words
  (loading gate) with the real content inside `<div hidden id="S:0">`.
  After: 964 visible words, no hidden wrapper.
- Hydration is unchanged for JS visitors: initial scene is "home" on
  server and client, hash correction still happens behind the boot
  gate, scene transitions keep their loading choreography.

### Internal-link graph
- Every article now has ≥1 inbound internal link (was: two orphans).
- Articles with a `project` link to `/#work` (12 new template edges,
  one per project-tagged article — 9 articles).
- Home → Writing adds 3 article links + the blog index link.

### SEO
- Verification suite extended (see `verify-seo.mjs` above); all
  previous checks unchanged and passing (canonical, OG, Twitter,
  robots, sitemap↔route equality, GSC token exactness, favicon family,
  brand assets, structured-data entity graph).
- Sitemap unchanged in URL set; `lastmod` still derived from real
  article `updated`/`date` fields only.

### Typography
- Article reading column: 17–18.7px / 1.85 line-height / 745px measure.
- Site interface body copy 17px. Metadata floor in article headers
  raised 10px → 11px. Everything remains reader-scale aware.

### Interaction system
- `.button`: press 90ms transform contact, 200ms release ease,
  focus-visible ring, disabled state; hover lift only under
  `prefers-reduced-motion: no-preference`.
- Home cards/rows: hover arrow nudge, artwork scale (1.025), press
  scale (0.995), explicit focus-visible rings.

### Performance
Measured on identical hardware, production builds of `fec289e` (before)
and this release (after), `out/` inspected directly:

| Metric | Before | After |
| --- | --- | --- |
| Eager script JS on `/` | 617 KB (11 chunks) | 644 KB (11 chunks) |
| RED MAGIC organism chunk | 28 KB, fetched immediately at hydration; canvas runs from first paint of the scene | 28 KB, fetched at idle (≤2.4s cap) and only when motion/save-data/memory allow; skipped entirely otherwise |
| Visible words in initial `<main>` | 10 | 964 |
| Hidden streamed `S:0` wrapper | present | absent |
| First-paint content | loading gate only | full homepage (LCP candidate is real content) |

The +27 KB eager delta is the home scene's content module moving into
the eager graph — the cost of a crawlable inline document. The
organism's bytes and main-thread work moved off the hydration path to
idle time.

### Accessibility
- No-JS: boot gate and reveal system cannot hide content
  (`html.reveal-js`-gated CSS); full homepage readable without
  JavaScript.
- Reduced motion: seed replaces the animated organism; hover/press
  transforms are removed while color/shadow/border feedback and all
  functional state changes remain.
- Keyboard: explicit focus-visible rings on shared buttons and home
  rows; tab order unchanged.

---

## Verification

Commands actually executed against this tree, with real results:

| Command | Result |
| --- | --- |
| `npx tsc --noEmit` | Passed, no type errors |
| `npm run lint` | `✖ 16 problems (0 errors, 16 warnings)` — all pre-existing `@next/next/no-img-element` warnings |
| `npm run build` | Exit 0; 13 static routes generated (/, /blog, 9 articles, 404, not-found) |
| `npm run verify:seo` | `[seo] static SEO verification passed.` — includes the new v3.0 checks: `home: no hidden streamed-Suspense wrapper`, `home: h1 renders inside <main>`, `home: 8 core phrase(s) present in visible <main> before JavaScript`, `home: N crawlable article link(s) in home HTML`, `link graph: all internal article/scene hrefs across 14 exported page(s) resolve`, `link graph: no orphan articles` |
| `npm run verify:brand` | `[brand] brand asset verification passed.` |
| `node scripts/build-blog.mjs` (via `npm run blog`) | Regenerated indexes; reported the inbound deltas `freeiran-engineering-notes: 0 → 2`, `red-theory-and-the-living-web: 0 → 1` |
| Generated-output inspection | `out/index.html`: 84,311 bytes; `<main>` 37,263 bytes inline; h1/SHEYTAN/FreeIran/Writing/CTAs present before JavaScript; `<div hidden id="S:0">` absent; `google-site-verification` meta exact |
| Browser verification (agent-browser against `out/` served statically) | Home: h1 rendered, seed → organism canvas mounts at idle, Writing section links = featured + 2 most-referenced articles, `#work` scene switch + history back work, zero console errors/page errors, Tab focus shows solid outline ring. Article `/blog/building-under-constraints/`: h1 rendered, `SCENE · Work ↗` chip present, FreeIran contextual link present, computed body typography 18.56px / 745px / line-height 1.85 |

## ZIP

`WEB-PROFESSIONAL-SEO-UX-UPGRADE.zip` — complete project source
(excluding `node_modules/`, `.next/`, `out/`, `.git/`). Verified by
extracting into a clean directory, running `npm ci`, `npm run build`
and `npm run verify:seo` from the extracted tree, then re-inspecting
the regenerated `out/index.html`.
