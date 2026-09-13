# Updated-Files.md — WEB 2.8.0 Production Deployment, UX & Performance Audit Release

## Release

| Field | Value |
| --- | --- |
| Release / version | **2.8.0** (deployment, UX, performance and accessibility audit release) |
| Base commit | `754bfe17e78c0012c849d959f3fb8fd2a410ac92` (2026-09-13) |
| Date | 2026-09-13 |
| Base commit state | Actions run **34736391200**: build/SEO/export/artifact all SUCCESS, `actions/deploy-pages@v5` FAILED after ~10.5 min with the deployment stuck in `purging_cdn`; `Verify deployed revision` skipped |

### Why 2.8.0 exists

Actions run **34736391200** failed in the `deploy-pages` step itself. Verified facts:

1. The GitHub Pages site is still owned by the **legacy "Deploy from a branch"
   (Jekyll) build of README.md** — the live URL serves the Primer-theme Jekyll
   rendering of README (`assets/css/style.css?v=<sha>`, an
   `edit/main/README.md` footer link), content that exists nowhere in this
   repository's Next.js source or git history.
2. `actions/deploy-pages@v5` has a **default timeout of 600 000 ms (10
   minutes)**. The deployment was created, sat in `purging_cdn` while the CDN
   purge lagged (consistent with the legacy-source conflict), hit the 10-minute
   ceiling, and the action cancelled it. The verification artifact
   `deployments/<sha>.json` was never published and the verify step never ran.
3. Repository code cannot flip the Pages source setting — it is a
   repository-settings operation. What code CAN do is detect the wrong
   configuration in seconds (instead of failing opaquely after 10 minutes),
   tolerate slow CDN purges, and retry once.

## ⚠️ Required manual action (unchanged from 2.7.1 — still cannot be done from the repository)

**Settings → Pages → Build and deployment → Source must be set to
"GitHub Actions"** (not "Deploy from a branch").

This is the ROOT CAUSE of the run-34736391200 failure. Until it is switched,
every deployment will keep behaving exactly like run 34736391200: the legacy
branch build keeps serving README.md while the Actions deployment hangs in
`purging_cdn`. With 2.8.0 the workflow now proves this condition in seconds
with an explicit error naming the exact setting, instead of timing out.

## What changed in the deployment architecture

- **Fail-fast Pages source check (both jobs).** `GET /repos/<owner>/<repo>/pages`
  with the workflow token; if `build_type` is not `workflow` ("GitHub Actions"),
  the run fails immediately with an error naming the exact settings path. The
  build job also re-checks so a misconfigured push never spends the full build
  pipeline on a deployment that cannot succeed. A transient API failure is a
  warning, never a false gate — deploy-pages and revision verification remain
  the acceptance authority.
- **Deploy timeout raised 10 → 20 minutes** (`actions/deploy-pages` `timeout:
  1200000`) so a slow Fastly CDN purge cannot kill a valid deployment.
- **Bounded single retry.** If the first deploy attempt fails, the SAME
  artifact is redeployed once (`continue-on-error` + explicit retry step).
  Acceptance is decided by a dedicated `Accept deployment` step that succeeds
  only when at least one attempt succeeded; a timed-out deployment is never
  treated as success.
- **Acceptance separated from verification.** Build success → deployment
  acceptance → live-revision verification remain three distinct rungs; each
  failure path prints its own diagnostics (including Pages deployment statuses
  fetched from the API so a stuck `purging_cdn` is visible in the log).
- **Verification ladder preserved.** Verification still targets the
  commit-unique `out/deployments/<sha>.json` path (immune to stale CDN entries
  by construction; query strings still not relied on; the stable
  `deployment.json` still not used for verification). The served-content
  diagnostic now also recognizes the legacy branch build by its Primer/Jekyll
  markup, not only the Jekyll generator meta tag.

## Files to replace

| File | Action | Why |
| ---- | ------ | --- |
| `.github/workflows/deploy.yml` | Replace | Deployment architecture above: fail-fast `build_type` check in build + deploy jobs, 20-min deploy timeout, one bounded retry, explicit acceptance step, API-backed stuck-deployment diagnostics, improved legacy-build detection in the verification failure path. |
| `lib/links.ts` | Replace | Patreon link used `http://` (insecure scheme, 301 in production). Now `https://`. |
| `lib/keyboard.ts` | Replace | New `isModalDialogOpen()` helper shared by the keyboard islands. |
| `components/blog/BlogIndex.tsx` | Replace | (1) basePath bug: `writeDeepLinkFilters` rewrote the address bar to hardcoded `/blog/?…`, dropping the production `/WEB` prefix — reload 404s, shareable URLs corrupted; now preserves `window.location.pathname`. (2) `+N / LESS` tag-overflow button gained `aria-expanded` + `aria-controls`. (3) Global `/`-key handler stands down while a modal dialog is open. |
| `components/blog/ArticleKeys.tsx` | Replace | J/K/T single-key shortcuts fired behind the open shortcuts dialog (keydowns bubble out of native `<dialog>`), navigating articles invisibly; they now stand down while any modal dialog is open. |
| `components/blog/ShortcutsDialog.tsx` | Replace | (1) Scroll lock: the page behind the modal stayed scrollable via wheel/touch, silently moving the reader's place; body overflow is now locked for the open window and restored on close. (2) `?` no longer re-triggers while a dialog is open. |
| `components/blog/ArticleToc.tsx` | Replace | Scroll-spy dead zone: the 15%–25% observer band left the highlight stuck on the last-crossed section while reading between headings and never cleared above the first heading on scroll-up. Geometry is now cached in document space (re-measured on the same events as ReadingProgress — zero layout reads during scroll); the observer is a crossing detector; the active section is "last heading above the activation line", correct in both directions. |
| `components/ReadingProgress.tsx` | Replace | `document.fonts.ready.then(...)` was never cancelled: navigating away before fonts settled re-measured and re-wrote the shared `--reading-progress` variable after cleanup. Now disposed-guarded. |
| `components/ReadingProgress.module.css` | Replace | Missing `-webkit-backdrop-filter` prefix on the back-to-top button (Safari). |
| `components/blog/BlogHeader.tsx` | Replace | Removed inert `aria-label` from a generic `div` (ignored by assistive tech, misleading in markup). |
| `app/blog/page.tsx` | Replace | Removed inert `aria-label="Blog status"` from a generic `div`. |
| `app/blog/[slug]/page.tsx` | Replace | (1) The article footer row (and the reserved actions slot holding COPY LINK and TextSize) was gated on `post.tags.length > 0` — a tagless article silently lost both controls; the row now renders unconditionally, tags only when present. (2) Removed inert `aria-label`s from generic `div`s. |
| `components/scenes/WorkScene.tsx` | Replace | Group cards with external GitHub URLs (AIST, ASI-100, CONTENTS) opened in the same tab, breaking the featured cards' and the header comment's stated law; external group links now carry `target="_blank" rel="noreferrer"`. |
| `components/scenes/LibraryScene.tsx` | Replace | (1) The PDF/media portal modal had no focus management: focus stayed on the page behind it and Tab escaped the modal; now focus moves into the modal on open, Tab/Shift+Tab cycle within it, and focus returns to the trigger on close. (2) Filter controls used `role="tablist"`/`role="tab"` without the required arrow-key pattern or tabpanels — converted to an honest `role="group"` of `aria-pressed` toggle buttons. (3) Added a SOURCE provenance link (`githubUrl` was computed for every item and never rendered) beside the download button. |
| `components/scenes/LibraryScene.module.css` | Replace | Styles for the SOURCE button, modal download-row gap, and component-level `:focus-visible` affordances for filter/preview/card controls that previously only had hover states. |
| `components/scenes/AboutScene.module.css` | Replace | Non-interactive identity cards had a hover lift that promised an action that does not exist; removed (honesty law the principles cards already followed). |
| `components/scenes/HomeScene.module.css` | Replace | Touch scroll trap: the home hero organism (RedMagic canvas) inherited `touch-action: none`, so vertical scroll gestures that started on the hero were swallowed on phones; the embedded instance now allows `pan-y` while the full MAGIC scene keeps `none`. |
| `components/scenes/RedMagicScene.module.css` | Replace | `prefers-reduced-motion: reduce` override stopping the three infinite organism rings and node pulse. |
| `components/scenes/SystemsScene.module.css` | Replace | `prefers-reduced-motion: reduce` override stopping the status pulse and module scan sweep. |
| `components/LivingShell.module.css` | Replace | `prefers-reduced-motion: reduce` override stopping the HUD status-dot pulse. |
| `components/SceneNavigator.module.css` | Replace | `prefers-reduced-motion: reduce` override stopping the active-item indicator pulse (selector specificity matched). |
| `components/LibraryPdfReader.module.css` | Replace | Short viewports: the fixed `min-height: 520px` stage forced the modal's content area to scroll on landscape phones/small laptops just to reach the controls; a `max-height: 760px` rule now keeps the whole viewer visible. |
| `components/RedMagic.tsx` | Replace | Performance + reduced motion: (1) under `prefers-reduced-motion` the engine now renders exactly ONE static frame and stops scheduling — previously it repainted an identical frame at full vsync forever; event-driven redraws (pointer, click, resize, visibility, mode change) render one fresh static frame each. (2) Idle cadence: after 4 s without pointer intent the ambient organism caps redraws at ~30/s (a full redraw every vsync was the engine's dominant GPU cost on 120 Hz displays); any interaction restores the full rate instantly. (3) Click particles are not spawned under reduced motion (their animation is stepDelta-driven and would freeze into artifacts). |
| `components/RedMagicAudio.ts` | Replace | (1) Silent-audio bug: `stop()` ramped master gain to 0, but `ensureStarted()` never restored it — toggling SOUND OFF→ON left a running context that was permanently silent until remount; master level is now re-applied on every start. (2) `setEnabled(true, { deferStart: true })` records a restored ON preference at mount without constructing the AudioContext before any user gesture (browser autoplay policy held it suspended and logged a console warning); the first interaction event starts the graph. |
| `components/MagicInteractionLayer.tsx` | Replace | (1) Mount-time audio restoration uses the deferred start above; the `soundEnabled` prop effect skips its mount run so only real toggle clicks construct the graph. (2) The window `scroll` listener called `updateGeometry()` (a forced `getBoundingClientRect`) per scroll event; now coalesced to one read per frame via rAF with cleanup on unmount. |
| `scripts/build-blog.mjs` | Replace | Body images emitted without `width`/`height` (latent CLS): the pipeline now sniffs intrinsic dimensions (PNG IHDR header; SVG width/height/viewBox) for local `/blog/images/` assets and emits them on every body `<img>`; unreadable/remote images are omitted attributes, never build failures. |
| `package.json` | Replace | Version bump 2.7.1 → 2.8.0. |
| `data/blog/posts.json` | Replace | Regenerated CI-configuration artifact (`basePath: "/WEB"`); content unchanged (timestamp only). CI regenerates it every run. |

## Files to delete

| File | Action | Why |
| ---- | ------ | --- |
| (none) | — | This release changes no file layout. Nothing needs deletion. |

## Files added

None. No new source files, configuration files, or static assets. The
`out/deployments/<sha>.json` verification artifact and the deployment
manifests are generated by CI during each build — they are not repository
files.

## Important preserved systems (audited, deliberately unchanged)

- `next.config.ts` — static export + `/WEB` basePath + trailing slash (correct)
- `scripts/verify-seo.mjs` — SEO verifier (re-run, passes: 14 pages, 838 hrefs,
  158 fragments resolved, JSON-LD WebSite/Person/WebPage/BlogPosting/
  BreadcrumbList valid, sitemap 11 URLs, robots OK, RSS absent)
- `components/SceneUrlSync.tsx` / `SceneRegistry.tsx` / `ScenePreloader.tsx` /
  `SceneViewport.tsx` / `MotionReveal.tsx` / `RedCursor.tsx` /
  `WorldBackground.tsx` — world-shell navigation and background architecture
- `components/CompactMenu.tsx` / `PublicLinks.tsx` / `FooterLinks.tsx` /
  `SiteFooter.tsx` / `MagicConsole.tsx` / `blog/CodeCopy.tsx` /
  `blog/ShareLink.tsx` / `blog/TextSize.tsx` / `blog/BlogAreaControl.tsx`
- `components/RedMagicInteraction.ts` / `RedMagicParticles.ts` /
  `RedMagicTelemetry.ts` — RedMagic engine subsystems
- `lib/contentRepository.ts`, `lib/resourceStore.ts`,
  `lib/backgroundScheduler.ts`, `lib/blog.ts`, `lib/blogFormat.ts`,
  `lib/clipboard.ts`, `lib/idleScheduler.ts`, `lib/loadPhase.ts`,
  `lib/worldSignals.ts`, `lib/seo.tsx`
- `content/blog/*.md` — all nine articles (content untouched)
- `public/robots.txt`, `public/sitemap.xml` (regenerated each build),
  `public/og-default.png`, `public/blog/images/**`
- `LICENSE.md`, `TRADEMARKS.md`, `README.md`, `PUSH-NOTES.txt`, `worklog.md`

## Migration order

Apply to an older checkout (e.g. `754bfe1`) in this exact order:

1. **Replace the files in the "Files to replace" table** (copy from this
   package over the checkout). There are no deletions and no additions.
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
   `[seo] static SEO verification passed.`, 9 article routes exported.
3. **Required manual setting (the actual root-cause fix):** in the repository,
   go to **Settings → Pages → Build and deployment → Source** and select
   **"GitHub Actions"**. Until this is done the workflow now fails fast at the
   "Check Pages source configuration" step with an explicit error — by design.
4. **Commit and push to `main`.**
5. **Verify deployment:** the push triggers `Deploy Next.js site to GitHub
   Pages`. All four rungs must be green: build job, `Check Pages source
   configuration`, `Accept deployment`, and `Verify deployed revision`
   (checking `https://parsaetak.github.io/WEB/deployments/<commit-sha>.json`).
6. **Verify the live site:** `https://parsaetak.github.io/WEB/` must serve the
   Next.js app (title "Parsa Tak — AI Systems, Reasoning, Software & RED
   MAGIC"), not the Jekyll README page, and
   `https://parsaetak.github.io/WEB/deployments/<latest-sha>.json` must return
   the expected commit.
