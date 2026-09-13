# Updated-Files.md — WEB 2.9.0 Production Release

## Release

| Field | Value |
| --- | --- |
| Release / version | **2.9.0** (13-point star identity + asset system, Search Console verification, favicon family, project imagery, brand validation) |
| Base commit | `a0ad86eff2d9da448b3e7178c9bd7d2cf7889ad9` ("2026-09-13") |
| Date | 2026-09-14 |
| Base commit state | Actions run green on `main`; site serving from `actions/deploy-pages@v5` with the Pages source preflight (`2.8.1` state) |

### Why 2.9.0 exists

The site's visible brand mark was the RED MAGIC all-seeing eye — an
artistic mark for one scene standing in as the identity of the whole
site — and the favicon mixed that eye into a star. There was no asset
system: the eye was inline JSX hydrated in three components, the
favicon was a hand-maintained file, and there was no Google Search
Console verification, no PNG/ICO favicon fallback, no Apple touch
icon, and no imagery on the home scene's featured projects.

2.9.0 separates identity from art and gives both a real system:

1. **A mathematically exact 13-point star becomes the site identity.**
   The regular star polygon `{13/5}` — 13 outer + 13 inner vertices,
   26 alternating vertices, 360/26° angular step, inner radius
   `R · cos(5π/13)/cos(4π/13)` — generated in polar coordinates by
   `scripts/generate-brand.mjs`, never hand-drawn. Nine colour
   variants share byte-identical geometry; only colour treatment
   differs.
2. **The Red Eye returns to RED MAGIC.** It now renders only as the
   RED MAGIC scene's sigil. Star = Parsa Tak / site identity; eye =
   the artistic system experience. Never merged.
3. **Google Search Console verification** ships in the root layout's
   metadata (one emission point, every canonical page) with the exact
   token `K8PQwvcGcrpBCyR-6XbmnDhv2IFPxpxjXV90UY7glTo`, and CI fails
   if the tag disappears or changes.
4. **A complete favicon family** is built from the star and served
   from `public/` (`icon.svg`, 192×192 PNG fallback, 16/32/48
   multi-size `favicon.ico`, 180×180 opaque Apple touch icon),
   linked through the root layout's explicit `metadata.icons`. The
   explicit declaration exists because Next's file-convention
   favicon.ico link proved unreliable once the `/WEB` basePath is
   active — the explicit set is deterministic in every build mode.
5. **A central `assets/` system** (brand / icons / illustrations /
   social) with documented conventions, a machine-readable manifest,
   byte-identical runtime copies under `public/`, and three
   deterministic zero-dependency generators whose re-run must change
   nothing (CI-enforced).
6. **Original featured-project artwork** (five 1200×630 abstract
   system diagrams — agent loop, benchmark scale, proxy mesh,
   organism, route tree) on the home scene's project cards, with
   descriptive alt text, intrinsic dimensions, and lazy loading. No
   fake screenshots.
7. **A new default OG image** (1200×630, star identity + wordmark)
   plus a square social variant, keeping the established article
   cover pipeline (per-article PNG twins) untouched.
8. **Structured-data truthfulness audit:** Person gains visible-backed
   `jobTitle` and `knowsAbout`; no invented Organization/logo nodes
   (a Person-published WebSite has no valid `logo` slot — documented,
   not forced).

## What changed in the application

- **Identity surfaces** — `LivingShell` (world HUD), `BlogHeader`,
  `SceneLoadingScreen`, and `SiteFooter` now render the star as a
  static `<img>` resolved through the new `lib/brand.ts` (basePath-
  aware). No logo hydration anywhere; decorative renderings are
  `aria-hidden` and the accessible name stays on the wrapping link.
  The HUD brand slot is square (36/34/32px by breakpoint); the
  loading surface's `.eye` slot became `.mark` (56px, red-hot
  gradient star); the footer anchors the legal block with an 18px
  star.
- **RED MAGIC scene** — carries the all-seeing-eye sigil (44px,
  `aria-hidden`) above the scene kicker. `RedEye.tsx` is unchanged
  and now has exactly one render site.
- **Home scene** — featured-project cards gained a third grid column
  (272px) holding the artwork plate; below 1100px the plate flows
  under the copy inside the text column; below 760px it spans the
  single column. Intrinsic `width`/`height` (1200×630) prevent
  layout shift. UHIT's visible copy now names "UHIT — the Universal
  Human Intelligence Test" (previously the acronym was metadata
  only), keeping the CI-checked phrase set intact.
- **Search Console** — `app/layout.tsx` gained
  `verification.google`; Next emits exactly one
  `<meta name="google-site-verification">` per page.
- **Structured data** — `lib/seo.tsx` Person entity gained
  `jobTitle` and `knowsAbout` (both mirror visible home content).
- **CI** — `deploy.yml` gained a brand-asset verification step after
  the SEO check: `verify-brand.mjs`, then a generator re-run with
  `git diff --exit-code` over the asset layers (determinism gate).
- **Tooling** — `package.json` 2.9.0 with `brand`, `brand:raster`,
  `verify:brand`, and combined `verify` scripts.

## Files to replace

| File | Reason |
| --- | --- |
| `package.json` | version 2.9.0; `brand` / `brand:raster` / `verify:brand` / `verify` scripts |
| `app/layout.tsx` | Google verification meta (root metadata, single emission point) + explicit `metadata.icons` favicon set |
| `lib/seo.tsx` | Person `jobTitle` + `knowsAbout` (visible-backed); documentation of the no-logo-in-schema decision |
| `public/icon.svg` | replaces the old `app/icon.svg` (star-eye) with the pure generated 13-point star favicon; linked via explicit `metadata.icons` |
| `components/LivingShell.tsx` | HUD brand: static star `<img>` replaces hydrated `RedEye` |
| `components/LivingShell.module.css` | square brand slots + `.livingShellFooterMark` |
| `components/blog/BlogHeader.tsx` | blog brand: static star `<img>` |
| `components/blog/BlogHeader.module.css` | square `.brandEye` slot |
| `components/SceneLoadingScreen.tsx` | loading identity: star `<img>` (`.mark` slot) |
| `components/SceneLoadingScreen.module.css` | `.eye` → `.mark` rename |
| `components/SiteFooter.tsx` | footer brand mark (18px star, aria-hidden) |
| `components/scenes/RedMagicScene.tsx` | RED MAGIC eye sigil (the eye's single remaining home) |
| `components/scenes/RedMagicScene.module.css` | `.magicOrganismSigil` |
| `components/scenes/HomeScene.tsx` | project artwork plates + UHIT visible naming |
| `components/scenes/HomeScene.module.css` | 3-column project grid + `.homeProjectVisual` + responsive overrides |
| `public/og-default.png` | new 1200×630 default OG (star identity + wordmark) |
| `scripts/verify-seo.mjs` | Search-Console tag, favicon-family, and brand-asset checks (94 checks total) |
| `.github/workflows/deploy.yml` | brand verification + generator-determinism gate |
| `README.md` | "Brand & asset system (2.9)" section; verification/deployment updates |
| `worklog.md` | Laws 63–65 (geometry, identity separation, asset system) |
| `Updated-Files.md` | this release block |

## Files to delete

| File | Reason |
| --- | --- |
| `app/icon.svg` | moved to `public/icon.svg` (same generated bytes) — the favicon family is now declared explicitly in `metadata.icons` instead of relying on Next file conventions, which dropped the favicon.ico link under basePath |

Nothing else became obsolete: the 2.8.1 file set remains valid, and
`RedEye.tsx` stays (single render site in the RED MAGIC scene).

## Files added

| Path | Purpose |
| --- | --- |
| `assets/README.md` | asset-system conventions (layers, naming, identity law, generators) |
| `assets/brand/star-red.svg` | primary identity star (solid brand red) — canonical |
| `assets/brand/star-red-hot.svg` | red-hot gradient variant |
| `assets/brand/star-crimson.svg` | deep crimson variant |
| `assets/brand/star-white.svg` | monochrome white variant |
| `assets/brand/star-black.svg` | monochrome black variant |
| `assets/brand/star-silver.svg` | neutral silver variant |
| `assets/brand/star-dark.svg` | dark neutral variant |
| `assets/brand/star-outline-red.svg` | transparent-fill red stroke variant |
| `assets/brand/star-outline-white.svg` | transparent-fill white stroke variant |
| `assets/brand/manifest.json` | machine-readable variant/geometry registry |
| `assets/icons/*.svg` (14) | currentColor glyph library (star, concentric, grid, orbit, signal, system, research, AI, engineering, simulation, link, arrows) |
| `assets/illustrations/*.svg` (5) | canonical featured-project artwork (1200×630) |
| `assets/social/og-default.png` | canonical copy of the served default OG |
| `assets/social/og-square.png` | 1200×1200 square social share variant |
| `public/brand/*.svg` (5) | served runtime copies of the star variants the site references |
| `public/brand/icons/*.svg` (14) | served runtime glyph copies |
| `public/images/projects/*.svg` (5) | served project artwork |
| `lib/brand.ts` | basePath-aware brand asset URL registry |
| `scripts/generate-brand.mjs` | deterministic star/glyph/favicon-SVG generator (source of the geometry) |
| `scripts/generate-project-art.mjs` | deterministic project-artwork generator |
| `scripts/generate-brand-raster.py` | deterministic raster generator (icon.png, favicon.ico, apple-icon.png, OG family; Pillow) |
| `scripts/verify-brand.mjs` | mathematical geometry proof + asset-system coherence gate |
| `public/icon.png` | 192×192 PNG favicon fallback (multiple of 48 per Google guidance) |
| `public/favicon.ico` | 16/32/48 legacy favicon |
| `public/apple-icon.png` | 180×180 opaque Apple touch icon |

## Important preserved systems (audited, deliberately unchanged)

- The SEO architecture: canonical strategy, metadataBase, JSON-LD
  `@id` graph, sitemap/robots generation, RSS absence, cover PNG-twin
  pipeline — all untouched; only additions (`verification`,
  `jobTitle`, `knowsAbout`).
- The blog pipeline (`build-blog.mjs`), content files, and the
  deterministic related-content model — untouched.
- `RedEye.tsx` component — unchanged code, one render site (RED MAGIC
  scene sigil).
- Motion system, compact menu, scene machinery, resource store,
  schedulers, library/PDF reader — untouched.
- `public/robots.txt`, `public/sitemap.xml` (generated), `data/**`
  (generated) — untouched.

## Verification performed on this release state

- `npm ci --legacy-peer-deps` — clean install
- `npm run lint` — **0 errors** (15 warnings: the 10 pre-existing
  accepted `<img>` warnings + 5 new static-asset `<img>` usages,
  same accepted static-export pattern; every new image declares
  intrinsic dimensions)
- `npm run build` — clean build, 14/14 routes exported
- `npm run verify:seo` — **94 checks pass**, including per-page
  exact-token Search Console verification, the favicon family
  (SVG + PNG + ICO + Apple touch, all linked from the home head),
  and brand assets in the export
- `npm run verify:brand` — **13 checks pass**: every star variant
  re-proven against the polar construction (26 vertices at
  `-90° + i·360/26°`, exact `{13/5}` inner ratio
  `0.624233221799`, 13-fold rotational symmetry), byte-identical
  geometry across variants, favicon star at icon scale, canonical↔
  runtime layers byte-identical, PNG/ICO dimensions and formats,
  OG family dimensions, weight budgets. Negative-tested: a
  deliberately corrupted vertex fails the build (symmetry, radius,
  and cross-variant drift all caught).
- Generator determinism: re-running all three generators produces
  byte-identical outputs (the CI gate enforces this on every deploy)
- Browser visual QA (headless Chromium against the exported site):
  world HUD star (36px) on dark; blog header star; footer star; RED
  MAGIC eye sigil; project artwork plates at 1440px and 390px;
  article header; star variant matrix rendered at 128/64/32/16px on
  white, near-black, and crimson backgrounds — geometry identical,
  legible at 16px, no clipping or blur; favicon frames verified at
  16/32/48
- No ranking or indexing claims are made — indexing is a crawler-side
  decision after deployment; the site is technically Search
  Console-ready (verified tag, sitemap, robots, canonical URLs,
  crawlable images, valid JSON-LD)

## Migration order

Apply to a checkout of `a0ad86e` in this exact order:

1. **Copy the whole `assets/` tree** from this release (canonical
   system), then the runtime copies: `public/brand/`,
   `public/images/projects/`, and the favicon family
   `public/icon.svg` (replaces the deleted `app/icon.svg`),
   `public/icon.png`, `public/favicon.ico`, `public/apple-icon.png`.
2. **Replace the files in "Files to replace"** and **add**
   `lib/brand.ts` plus the three generator scripts and
   `verify-brand.mjs` from "Files added".
3. **Run install/build/verify:**
   ```bash
   npm ci --legacy-peer-deps
   npm run lint                        # 0 errors (warnings only)
   npm run build                       # blog pipeline + static export
   npm run verify                      # verify:seo (94) + verify:brand (13)
   ```
   Expected: both verifiers print their `passed.` summaries; the
   favicon family ships in `out/` (`icon.svg`, `icon.png`,
   `favicon.ico`, `apple-icon.png`); every page head carries the
   exact Google verification meta tag.
4. **Optional — regenerate from scratch to prove determinism:**
   ```bash
   npm run brand && npm run brand:raster
   git diff --exit-code -- assets public/brand public/images/projects app
   ```
5. **Commit and push to `main`.** The deploy workflow now runs the
   brand-asset gate (including the determinism re-run) after the SEO
   gate; all three jobs must be green.
6. **After deployment:** use Search Console → URL Inspection on
   `https://parsaetak.github.io/WEB/` and request recrawl of the
   sitemap. Indexing and any favicon appearance in search are
   crawler-side outcomes that follow later — never claimed here.

---

# Updated-Files.md — release archive (2.8.1)

### Release

| Field | Value |
| --- | --- |
| Release / version | **2.8.1** (Pages-architecture preflight, reader-scale fix, touch-target and CI hardening) |
| Base commit | `c5b74c3cf03b905c1da47901f86f81a32b839992` ("Refactor GitHub Pages deployment workflow", 2026-09-13) |
| Date | 2026-09-13 |
| Base commit state | Actions run **34740258813**: FAIL at `Verify Pages configuration` (`build_type = legacy`); parallel legacy `pages build and deployment` run succeeded (still serving the branch build of README) |

#### Why 2.8.1 exists

The production workflow is still red for exactly one reason: GitHub Pages is
configured as **"Deploy from a branch"** (API `build_type: "legacy"`) while
this repository deploys exclusively through `actions/deploy-pages@v5`, which
requires the source to be **"GitHub Actions"** (`build_type: "workflow"`).
Repository files cannot change that setting — it is a repository-owner
operation.

2.8.1 does three things the base commit did not:

1. **Makes the Pages-source guard fail fast and impossible to miss.** The
   check moved out of the build job (where it ran after `setup-node` +
   `npm ci`) into a dedicated `pages-source` preflight job that fails in
   seconds — no Node setup, no dependency install, no wasted build minutes —
   and the deploy job re-verifies the setting immediately before
   `deploy-pages` runs, so a setting flipped back mid-run fails loudly
   instead of hanging in `purging_cdn` for the action timeout.
2. **Fixes a functional blog bug found by interaction testing:** the article
   TextSize control was visually inert on phones and small tablets — the
   `max-width: 760px` media query set `.body { font-size: 16px }` with no
   `--reader-scale` multiplication, so the control stayed visible, stored the
   preference, and did nothing on screen below 760 px.
3. **Fixes touch targets that failed the 24 px minimum** (WCAG 2.5.8): the
   blog card `PROJECT · <name>` filter chips (9 px tall), the card title
   anchors (21 px), and the footer LICENSE/TRADEMARKS links (11 px). All
   keep their exact visual geometry via padding + compensating negative
   margins.

### ⚠️ Required manual action (unchanged — cannot be done from the repository)

**Settings → Pages → Build and deployment → Source must be set to
"GitHub Actions"** (not "Deploy from a branch").

Until this is switched, every push will keep failing at the new
`Verify Pages source configuration` job — in seconds, with the exact fix in
the error message, and with zero build minutes spent. That failure is by
design and is the workflow working correctly.

### What changed in the deployment architecture

- **New `pages-source` preflight job.** Runs first; `build` needs it. Shallow
  checkout + one API call (`GET /repos/<owner>/<repo>/pages`). The job is
  named exactly `Verify Pages source configuration` so the failing state is
  visible in the Actions UI before anything expensive starts.
- **Shared guard script (`.github/scripts/verify-pages-source.sh`).** One
  implementation used by both the preflight and the deploy job. Behaviour:
  - `build_type = workflow` → pass, log `Pages build_type = workflow
    (GitHub Actions). Deployment path verified.`
  - `build_type = legacy` → hard fail reporting
    `Pages build_type = legacy (Deploy from a branch).` plus the exact
    settings path: `Settings -> Pages -> Build and deployment -> Source ->
    GitHub Actions`.
  - missing `build_type` field → treated as `legacy` and fails (the API's
    own default is the branch build).
  - HTTP 404 → Pages has never been configured; fails with the same
    settings path.
  - Any other HTTP status → fails and dumps the response body.
  - There is **no fallback deployment path** by design; the script never
    exits 0 on anything but `build_type = workflow`.
- **Deploy-job re-verification restored.** `c5b74c3` removed the deploy-time
  re-check; a mid-run settings flip would otherwise surface as a
  `deploy-pages` hang instead of an explicit error. The re-check runs
  immediately before deployment against the same script.
- **Everything else preserved unchanged:** `actions/deploy-pages@v5`,
  20-minute deploy `timeout: 1200000`, `actions/configure-pages@v6`,
  library manifest sync + validation, blog pipeline validation, Next.js
  build, SEO verification, static-export verification (sitemap/route
  equality, RSS absence), deployment manifests (`deployment.json`,
  `deployments/<sha>.json`), upload artifact, and the deployed-revision
  verification loop (40 × 5 s against the commit-unique manifest URL).

### What changed in the application

- **Article reader scale on mobile** (`app/blog/[slug]/article.module.css`):
  the `max-width: 760px` override `.body { font-size: 16px }` became
  `font-size: calc(16px * var(--reader-scale, 1))`. The TextSize island
  (visible on phones), its localStorage preference, and the desktop scale
  rule all already existed — only the small-screen override cancelled them.
  Every step (0.95 → 1.2) now scales the reading column on narrow screens.
- **Touch targets** (`components/blog/BlogIndex.module.css`,
  `components/LivingShell.module.css`): `PROJECT · <name>` chips → 25 px hit
  height (was 9 px), card title anchors → full title height ≥ 24 px (was
  21 px per line box), footer LICENSE/TRADEMARKS → 25 px (was 11 px). Each
  uses padding + compensating negative margin so rendered layout is
  pixel-identical; chip font stays 8 px by design.
- **CI strengthening** (`scripts/verify-seo.mjs`): new MEDIA EXISTENCE pass —
  every internal `<img src>` in the export must resolve to a file that
  ships (renamed/deleted assets are now a build failure, not a silent 404).
  19 media references audited on the current export. Negative-tested: a
  broken `src` fails the run.
- `package.json`: version bump 2.8.0 → 2.8.1.

### Files to replace

| File | Reason |
| ---- | ------ |
| `.github/workflows/deploy.yml` | New job graph: `pages-source` preflight → `build` → `deploy`; deploy job re-verifies Pages source before `deploy-pages@v5`; build job no longer hosts the guard (replaced by the preflight job that cannot waste build time). |
| `app/blog/[slug]/article.module.css` | Mobile `.body` font-size now multiplies `--reader-scale` — fixes the inert TextSize control below 760 px. |
| `components/blog/BlogIndex.module.css` | `.cardProject` chip and `.cardTitle a` touch targets raised to ≥ 24 px via padding + compensating negative margins (visual geometry unchanged). |
| `components/LivingShell.module.css` | Footer `.livingShellLegalLinks a` (LICENSE / TRADEMARKS) touch target raised to 25 px the same way. |
| `package.json` | Version bump 2.8.0 → 2.8.1. |
| `scripts/verify-seo.mjs` | New MEDIA EXISTENCE pass in `verifyInteractivity()` — every internal image `src` in the export must exist; negative-tested. |

### Files to delete

| File | Reason |
| ---- | ------ |
| (none) | This release removes nothing. |

### Files added

| File | Reason |
| ---- | ------ |
| `.github/scripts/verify-pages-source.sh` | The single Pages-source guard implementation, executed by both the `pages-source` preflight job and the deploy job's pre-deployment re-verification. Testable in isolation; passes on `workflow`, fails on `legacy` / missing field / 404 / other HTTP errors / API unreachable, always naming the exact settings path on failure. |

### Important preserved systems (audited, deliberately unchanged)

- `next.config.ts` — static export + `/WEB` basePath + trailing slash
- `components/LivingShell.tsx`, `SceneUrlSync.tsx`, `SceneRegistry.tsx`,
  `ScenePreloader.tsx`, `SceneViewport.tsx`, `MotionReveal.tsx`,
  `WorldBackground.tsx`, `RedCursor.tsx`, `CompactMenu.tsx`,
  `SceneLoadingScreen.tsx`, `RedEye.tsx` — world shell, hash routing,
  history navigation, preloading, single-observer reveal system
- `components/scenes/*` — all six scenes (Home, About, Systems, RedMagic,
  Work, Library); every link verified against live destinations and the
  export; REP/USEF informational panels correctly non-linked
- `components/RedMagic*.ts(x)`, `MagicConsole.tsx`,
  `MagicInteractionLayer.tsx` — organism engine, console modes (DRIFT /
  LISTEN / SURGE aria-pressed exclusivity), audio toggle, reduced-motion
  and hidden-tab suspension
- `components/blog/*` — index filters (project deep links via `?project=`,
  topic chips, tag buttons, search with Enter-to-open, `/` `?` J K T keys,
  CLEAR FILTERS), TOC anchors verified against heading ids, reading
  progress (transform-only), code copy + share link with honest fallback
  states, prev/next + related + referenced-by
- `components/LibraryPdfReader.tsx`, `lib/contentRepository.ts` — PDF/media
  viewer, focus trap, Escape/scroll-lock, DOWNLOAD + SOURCE provenance links
- `lib/*` — links (all external destinations verified live), keyboard,
  clipboard, schedulers, worldSignals, seo
- `content/blog/*.md` — all nine articles (content untouched)
- `public/robots.txt`, `public/og-default.png`, `public/blog/images/**`;
  `data/blog/posts.json` and `public/sitemap.xml` remain build-generated
  (never hand-edited)
- `LICENSE.md`, `TRADEMARKS.md`, `README.md`, `PUSH-NOTES.txt`, `worklog.md`

### Verification performed on this release state

- `npm ci --legacy-peer-deps --no-audit --no-fund` — clean install
- `npm run lint` — **0 errors** (10 pre-existing `<img>` warnings; static
  export uses unoptimized images by design)
- `GITHUB_ACTIONS=true npm run build` — clean build, 14/14 routes exported
- `GITHUB_ACTIONS=true node scripts/verify-seo.mjs` — **75 checks pass**,
  including the new 19-reference media pass
- Programmatic link audit: 14 HTML pages, 838 hrefs, 232 fragment refs —
  no `href="#"`, no empty href, no `javascript:`, no invalid internal
  paths, no missing images, no nested interactive elements, every internal
  link resolved against the actual export
- External destinations verified live: GitHub repos (SHEYTAN-local-agent,
  FreeIran, Contents incl. `AI-Tests` branch, WEB), CDN manifest, social
  links (403/429/999 responses are bot-protection, not dead links)
- Browser interaction tests (Chromium, headless): scene navigation via
  track + brand + hash URLs + browser back/forward + `#bogus`
  normalization; compact menu open/select/Escape/outside-tap/focus-out;
  home CTAs and all 19 unique home link targets; blog search filtering,
  Enter-to-open, project chip deep-link + CLEAR FILTERS, shortcuts dialog,
  J/K article navigation, T back-to-top, TOC anchor scrolling, reading
  progress, text size (post-fix), copy controls' honest states; library
  catalog, filters, featured card, PDF modal open/Escape, focus trap,
  scroll lock; RED MAGIC console mode exclusivity and pointer interaction.
  Zero console errors, zero page errors across all sessions.
- Responsive sweep: 15 viewports × 4 page types = **60 combos, zero
  horizontal overflow** (320×568 → 2560×1080)
- Guard script state tests: `legacy`, `workflow`, `404`, `500`, missing
  field, API unreachable — all six behave as specified
- Reduced motion: gated in all 10 shipped CSS chunks; smooth scrolling
  behind `no-preference`; canvas engines render static frames; JS smooth
  scrolls collapse to jumps

### Migration order

Apply to a checkout of `c5b74c3` in this exact order:

1. **Replace the files in "Files to replace"** and **add**
   `.github/scripts/verify-pages-source.sh` from "Files added"
   (`chmod +x` is not required — the workflow invokes it with `bash`).
2. **Run install/build/test:**
   ```bash
   npm ci --legacy-peer-deps --no-audit --no-fund
   npm run lint                       # 0 errors (10 pre-existing <img> warnings)
   GITHUB_ACTIONS=true npm run build  # regenerates data/blog/posts.json,
                                      # public/sitemap.xml, and out/
   GITHUB_ACTIONS=true node scripts/verify-seo.mjs
   # static export spot checks:
   test -f out/index.html && test -f out/blog/index.html \
     && test -f out/sitemap.xml && test -f out/robots.txt \
     && test -f out/og-default.png && test ! -f out/blog/feed.xml
   ```
   Expected: lint clean (warnings only), build succeeds, SEO verifier prints
   `[seo] static SEO verification passed.` with 75 checks, 9 article routes
   exported.
3. **Required manual setting (the actual root-cause fix):** repository
   **Settings → Pages → Build and deployment → Source → "GitHub Actions"**.
4. **Commit and push to `main`.**
5. **Verify the run:** the push triggers `Deploy Next.js site to GitHub
   Pages`. All three jobs must be green:
   `Verify Pages source configuration` → `Prepare and build site` (library
   validation, blog validation, Next.js build, SEO verification, static
   export verification, artifact upload) → `Deploy site` (pre-deploy
   re-verification, `deploy-pages`, `Verify deployed revision` against
   `https://parsaetak.github.io/WEB/deployments/<commit-sha>.json`).
6. **Verify the live site:** `https://parsaetak.github.io/WEB/` serves the
   Next.js app (title "Parsa Tak — AI Systems, Reasoning, Software & RED
   MAGIC"), the parallel legacy `pages build and deployment` workflow no
   longer appears in the run list, and the deployment manifest URL returns
   the pushed commit sha.
