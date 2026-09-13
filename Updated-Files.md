# Updated-Files.md — WEB 2.7.1 Production Audit Release

## Release

| Field | Value |
| --- | --- |
| Release / version | **2.7.1** (production audit release) |
| Base commit | `b55af529d32546c1df33d85390f2520edc95f3ae` (2026.Sep.12) |
| Final commit (code state) | `cbf5558866e3d9b13e63ec2b0c67c5dffbb05ded` (Release 2.7.1 — production audit release; this document itself is committed on top of it) |
| Date | 2026-09-13 |
| Base commit state | Actions run 34712034155 failed at `Deploy site → Verify deployed revision` |

### Why 2.7.1 exists

Actions run **34712034155** failed its final step. Investigation proved the
verification step was **correctly failing**: the GitHub Pages site was (and still
is, until the settings change below) served by the **legacy "Deploy from a
branch" Jekyll build of README.md**, not by this workflow's Next.js artifact.
The workflow's `actions/deploy-pages` step "succeeds", but the branch build owns
the live URL, so the commit-specific `deployment.json` was never published.

Two additional latent defects in the verification itself were measured against
the live CDN and fixed, so that once the site source is corrected the check can
never be falsely failed by caching:

1. **Query strings are NOT part of the GitHub Pages (Fastly) cache key.**
   `/deployment.json?sha=X` and `?sha=Y` share one cache entry — the old
   `?sha=` "cache buster" was a no-op.
2. **404 responses ARE cached at the edge** (and 200s carry
   `Cache-Control: max-age=600`). An early probe during propagation could
   poison the manifest URL with a cached 404 and fail verification for the
   full retry window.

## ⚠️ Required manual action (cannot be done from the repository)

**Settings → Pages → Build and deployment → Source must be set to
"GitHub Actions"** (it is currently "Deploy from a branch").

This is the ROOT CAUSE of the run-34712034155 failure. No commit can change it;
it is a repository-settings operation that only a repository admin can perform.
After switching it, the legacy `pages build and deployment` (Jekyll) workflow
stops running and this workflow's artifact becomes the live site.

## Files to replace

| File | Action | Reason |
| --- | --- | --- |
| `.github/workflows/deploy.yml` | Replace | Root-cause deployment fix: writes a unique commit-addressed verification artifact `out/deployments/<sha>.json` (a path that can only exist in this commit's artifact — immune to stale cache entries by construction), keeps the human-readable `out/deployment.json`, verifies HTTP 200 + expected commit in the JSON body at the unique URL, retains 40×5s propagation retries, adds `Cache-Control: no-cache` request headers + run-id query (belt and braces), and on failure diagnoses what is actually served — explicitly detecting the legacy Jekyll branch build and naming the Pages source setting as the fix. |
| `components/SceneUrlSync.tsx` | Replace | Hash navigation bugs: (1) hashes arrive percent-encoded, so `'# MAGIC '` never matched a scene — the hash is now decoded before trimming; (2) at runtime, an invalid hash (e.g. `#bogus`) resolved the scene but left the raw hash in the address bar, inconsistent with load-time normalization — the URL is now canonicalized after every hashchange. |
| `components/blog/ArticleToc.module.css` | Replace | Closed-`<details>` contract: the author `display: flex` on the inline TOC list competed with the browser's closed-details hiding, leaving phantom laid-out boxes (not painted, not focusable, but polluting hit-testing and layout analysis). An explicit `.tocInline:not([open]) .inlineList { display: none }` makes the collapsed state deterministic. |
| `components/LivingShell.module.css` | Replace | Touch-target sizing (WCAG 2.5.8): world-shell HUD GitHub link was an ~11px target; padded inline-flex grows it to ~27px with no visual rhythm change. |
| `components/blog/BlogHeader.module.css` | Replace | Touch-target sizing (WCAG 2.5.8): blog-header GitHub link ~12px → ~28px; BLOG area control ~20px → ~28px. |
| `app/blog/[slug]/article.module.css` | Replace | Touch-target sizing (WCAG 2.5.8): article `← BLOG` back link ~11px → ~29px; `↩ N` inbound-references badge ~20px → ~26px. |
| `app/globals.css` | Replace | Reduced-motion: `scroll-behavior: smooth` was unconditional on `html`; it is now gated behind `@media (prefers-reduced-motion: no-preference)` (WCAG 2.3.3 / vestibular safety), matching the existing JS-side gating of every smooth `scrollIntoView`. |
| `data/library.json` | Replace | Synced to the remote Library manifest (version 2) exactly as the CI "Sync Library manifest" step does — the committed copy was stale at version 1. CI overwrites this file on every run; committing the synced state removes dev/prod drift. |
| `data/blog/posts.json` | Replace | Regenerated build artifact, now committed in the CI configuration (`basePath: "/WEB"`) instead of the dev configuration (`basePath: ""`) that was previously committed. CI regenerates it on every build; committing the production form is consistent. |
| `package.json` | Replace | Version bump 2.7.0 → 2.7.1. |

## Files to delete

| File | Delete | Reason |
| --- | --- | --- |
| (none) | — | This release changes no file layout. Nothing needs deletion. |

## Files added

None. No new source files, no new configuration files, no new static assets.
(The `out/deployments/<sha>.json` verification artifact is generated by CI during
each build — it is not a repository file.)

## No-change files (important systems intentionally preserved)

The following systems were audited and verified working; they are deliberately
unchanged:

- `next.config.ts` — static export + basePath `/WEB` + trailing slash (correct)
- `scripts/build-blog.mjs` — content pipeline (validated in CI and locally)
- `scripts/verify-seo.mjs` — SEO verifier (re-run, passes)
- `components/RedMagic*.ts*` / `MagicConsole.tsx` / `MagicInteractionLayer.tsx` —
  the RED MAGIC organism, its console, telemetry and interaction surface
- `components/scenes/*` — all six scenes (Home, About, Systems, RedMagic, Work,
  Library) — every interactive control tested
- `components/blog/*` — BlogIndex, ArticleToc, CodeCopy, ShareLink, TextSize,
  ArticleKeys, ShortcutsDialog, BlogAreaControl islands
- `components/LibraryPdfReader.tsx` / `LibraryScene.tsx` — the library viewer
- `components/CompactMenu.tsx` / `SceneNavigator.tsx` / `SceneRegistry.tsx` /
  `ScenePreloader.tsx` / `SceneViewport.tsx` / `MotionReveal.tsx` /
  `ReadingProgress.tsx` / `WorldBackground.tsx` / `RedCursor.tsx`
- `app/blog/**`, `app/not-found.tsx`, `app/layout.tsx`, `app/page.tsx`
- `content/blog/*.md` — all nine articles (content untouched)
- `public/robots.txt`, `public/sitemap.xml` (regenerated each build),
  `public/og-default.png`, `public/blog/images/**`
- `LICENSE.md`, `TRADEMARKS.md`, `README.md`, `PUSH-NOTES.txt`, `worklog.md`

## Migration instructions

Apply to an older checkout (e.g. `b55af52`) in this exact order:

1. **Replace these files** (copy from this package over the checkout):
   1. `.github/workflows/deploy.yml`
   2. `components/SceneUrlSync.tsx`
   3. `components/blog/ArticleToc.module.css`
   4. `components/LivingShell.module.css`
   5. `components/blog/BlogHeader.module.css`
   6. `app/blog/[slug]/article.module.css`
   7. `app/globals.css`
   8. `data/library.json`
   9. `data/blog/posts.json`
   10. `package.json`
2. **Delete these files:** none.
3. **Add these files:** none.
4. **Run install/build/test:**
   ```bash
   npm ci --legacy-peer-deps --no-audit --no-fund
   npm run lint                       # 0 errors (10 pre-existing warnings)
   GITHUB_ACTIONS=true npm run build  # regenerates data/blog/posts.json,
                                      # public/sitemap.xml, and out/
   GITHUB_ACTIONS=true node scripts/verify-seo.mjs
   # static export spot checks:
   test -f out/index.html && test -f out/blog/index.html \
     && test -f out/sitemap.xml && test -f out/robots.txt \
     && test -f out/og-default.png
   ```
   Expected: lint clean (warnings only), build succeeds, SEO verifier prints
   `[seo] static SEO verification passed.`, 9 article routes exported.
5. **Commit and push to `main`.**
6. **Required manual setting (the actual root-cause fix):** in the repository,
   go to **Settings → Pages → Build and deployment → Source** and select
   **"GitHub Actions"** (replacing "Deploy from a branch").
7. **Verify deployment:** the next push triggers `Deploy Next.js site to GitHub
   Pages`. Watch the run: all three verification rungs must be green —
   build job, deploy job, and `Verify deployed revision` (now checking
   `https://parsaetak.github.io/WEB/deployments/<commit-sha>.json`).
   If the run fails at verification with the Jekyll diagnostic, the Pages
   source setting was not switched (step 6).
8. **Verify the live site:** `https://parsaetak.github.io/WEB/` must serve the
   Next.js app (title "Parsa Tak — AI Systems, Reasoning, Software & RED
   MAGIC"), not the Jekyll README page, and
   `https://parsaetak.github.io/WEB/deployments/<latest-sha>.json` must return
   the expected commit.
