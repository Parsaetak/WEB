# Updated-Files.md — WEB 2.8.1 Production Release

## Release

| Field | Value |
| --- | --- |
| Release / version | **2.8.1** (Pages-architecture preflight, reader-scale fix, touch-target and CI hardening) |
| Base commit | `c5b74c3cf03b905c1da47901f86f81a32b839992` ("Refactor GitHub Pages deployment workflow", 2026-09-13) |
| Date | 2026-09-13 |
| Base commit state | Actions run **34740258813**: FAIL at `Verify Pages configuration` (`build_type = legacy`); parallel legacy `pages build and deployment` run succeeded (still serving the branch build of README) |

### Why 2.8.1 exists

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

## ⚠️ Required manual action (unchanged — cannot be done from the repository)

**Settings → Pages → Build and deployment → Source must be set to
"GitHub Actions"** (not "Deploy from a branch").

Until this is switched, every push will keep failing at the new
`Verify Pages source configuration` job — in seconds, with the exact fix in
the error message, and with zero build minutes spent. That failure is by
design and is the workflow working correctly.

## What changed in the deployment architecture

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

## What changed in the application

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

## Files to replace

| File | Reason |
| ---- | ------ |
| `.github/workflows/deploy.yml` | New job graph: `pages-source` preflight → `build` → `deploy`; deploy job re-verifies Pages source before `deploy-pages@v5`; build job no longer hosts the guard (replaced by the preflight job that cannot waste build time). |
| `app/blog/[slug]/article.module.css` | Mobile `.body` font-size now multiplies `--reader-scale` — fixes the inert TextSize control below 760 px. |
| `components/blog/BlogIndex.module.css` | `.cardProject` chip and `.cardTitle a` touch targets raised to ≥ 24 px via padding + compensating negative margins (visual geometry unchanged). |
| `components/LivingShell.module.css` | Footer `.livingShellLegalLinks a` (LICENSE / TRADEMARKS) touch target raised to 25 px the same way. |
| `package.json` | Version bump 2.8.0 → 2.8.1. |
| `scripts/verify-seo.mjs` | New MEDIA EXISTENCE pass in `verifyInteractivity()` — every internal image `src` in the export must exist; negative-tested. |

## Files to delete

| File | Reason |
| ---- | ------ |
| (none) | This release removes nothing. |

## Files added

| File | Reason |
| ---- | ------ |
| `.github/scripts/verify-pages-source.sh` | The single Pages-source guard implementation, executed by both the `pages-source` preflight job and the deploy job's pre-deployment re-verification. Testable in isolation; passes on `workflow`, fails on `legacy` / missing field / 404 / other HTTP errors / API unreachable, always naming the exact settings path on failure. |

## Important preserved systems (audited, deliberately unchanged)

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

## Verification performed on this release state

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

## Migration order

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
