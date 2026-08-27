# Parsa Tak WEB — Agent Handoff

This is the single handoff document for any AI (or human) continuing this project.
It was rebuilt from scratch on **2026-08-27**. Completed history lives in git — this file
contains only what an agent needs to work correctly: rules, map, and open tasks.

The repository is the source of truth. This file is the map. Never trust either one
over the actual current files.

---

## 0. Working Protocol

```text
inspect repository + newest commit + newest Actions run
        ↓
read the files relevant to the requested change
        ↓
identify root cause / next coherent step
        ↓
one verified change (small milestones, no stacked unverified work)
        ↓
owner applies and pushes (or agent provides complete replacement file)
        ↓
verify build + newest Actions run + live site
        ↓
continue
```

Editing rules:

* For multiple related edits in one file, provide the **complete replacement file** in one code block (`.tsx`, `.ts`, `.css`, `.yml`). The owner applies files manually and prefers this.
* Small isolated edits may use find → replace.
* Update this worklog only at real milestones. Not after every CSS tweak.

---

## 1. Hard Rules (MUST / NEVER)

1. **Static export only.** GitHub Pages, `output: "export"`, `basePath: "/WEB"` (set automatically when `GITHUB_ACTIONS=true`). No backend, no server-only code, no new services.
2. **Never install `pdfjs-dist`** into `package.json`. It broke builds before. PDF.js loads in the browser from jsDelivr (`components/LibraryPdfReader.tsx`).
3. **Library manifest** comes from `Parsaetak/Contents` branch **`Projects`** → synced at build time into `data/library.json`. Never point it at `main`. Never maintain a second hand-edited production manifest.
4. **Heavy media loads only after explicit user action** (READ / LISTEN / WATCH). Never auto-open, auto-download a full PDF, or prefetch whole media files.
5. **RED MAGIC stays on Home** (atmospheric, cheap). The dedicated MAGIC scene owns depth. Never remove it from Home to "avoid duplication".
6. **No repeated concepts across scenes.** Ownership: ABOUT = identity, SYSTEMS = AI Instructions/REP/USEF, MAGIC = RED MAGIC, WORK = projects, LIBRARY = media, HOME = introduction/atmosphere. A Home preview + deeper own-scene treatment is allowed; verbatim duplication is not.
7. **Navigation has six items** in a six-column grid. When adding a scene, check: `SceneRegistry.tsx`, `SceneUrlSync.tsx` valid-scenes list, nav CSS grid columns, `LivingShell.tsx`.
8. **`.library-modal` must cover the full viewport** (`inset: 0`, `z-index: 1100`, portaled to `document.body`). It was once positioned under the header (`top: var(--shell-header)`) and the reader appeared trapped underneath. Do not reintroduce header offsets.
9. **Respect `prefers-reduced-motion`** (cursor, RED MAGIC, Library motion, PDF opening animation).
10. **Mobile must not overflow.** Reader controls collapse gracefully; avoid fixed widths.
11. **Never assume a selector/component exists.** Inspect the actual CSS/TSX first (past failure: `.about-identity` did not exist).
12. **Only one cursor runtime** (`components/RedCursor.tsx`). One RAF loop, no duplicates.
13. **Verify the newest GitHub Actions run** before declaring deployment healthy. Never debug from an old run.
14. Do not expose technical internals in the UI (branches, commits, loading jargon). Infrastructure stays invisible.

---

## 2. Snapshot

```text
Site:            https://parsaetak.github.io/WEB/
Repo:            github.com/Parsaetak/WEB        (this repository)
Content repo:    github.com/Parsaetak/Contents   (media + library.json, branch Projects)
Stack:           Next.js 16 / React 19 / TypeScript — verify exact versions in package.json before editing
Deploy:          .github/workflows/deploy.yml → checkout → cache → npm ci → sync manifest → validate → build → Pages
Scenes:          home | about | systems | magic | work | library   (hash routing; library = #library)
```

Key files:

```text
components/LivingShell.tsx          shell: fixed header (z 1000, isolation: isolate), nav, footer
components/SceneRegistry.tsx        scene id → component map
components/SceneUrlSync.tsx         hash ↔ scene (valid scenes list lives here)
components/ScenePreloader.tsx       idle-time scene preload (current → next → previous)
components/RedCursor.tsx            custom cursor (single RAF loop)
components/RedMagic.tsx             canvas visual system (Home = atmospheric, MAGIC = full)
components/scenes/LibraryScene.tsx  catalog, filters, editorial preview, modal viewer (portal)
components/LibraryPdfReader.tsx     PDF.js reader (dynamically imported, ssr: false)
lib/contentRepository.ts            manifest → ContentItem; builds media URLs
data/library.json                   build-time synced snapshot (generated, do not hand-edit)
app/globals.css                     all styling (~20k lines, vertical formatting style)
```

Media URL construction (`contentRepository.ts`):

```text
https://cdn.jsdelivr.net/gh/Parsaetak/Contents@<branch>/<path>
```

Note: media is served from **jsDelivr CDN, not raw.githubusercontent.com**. Range
requests verified working (2026-08-27): `accept-ranges: bytes`, CORS `*`, real
`206 Partial Content` + `Content-Range` in production reader sessions, PDF.js
chunking at the configured 256 KiB.

---

## 3. Library / Reader Essentials

UX contract:

```text
ENTER LIBRARY → instant static catalog → select work → editorial preview
→ explicit READ/LISTEN/WATCH → heavy media loads → close (Escape / × / backdrop)
```

PDF reader invariants:

```text
range loading ON, streaming OFF, autoFetch OFF, rangeChunkSize 256 KiB
3-page look-ahead, single active canvas, DPR capped at 2
render cancelable, document destroyed on close
loading states: OPENING → RENDERING → READY / LOADING NEXT (never fake percentages)
nav strip = sliding window: 10 slots anchored current−2, shows range in header;
canvas thumbnails render ONLY for current page .. +3 look-ahead — numbered
placeholders elsewhere are INTENTIONAL (byte budget), not a bug. Do not
"fix" them by rendering all slots.
```

Persistent reading position (added 2026-08-27):

```text
storage:    localStorage key "library-reading-position:<rawUrl>"
payload:    { page, total, updatedAt }   per book (keyed by src URL)
save:       debounced 400 ms on page change + instant flush on unmount
resume:     on open, if saved page > 1 → jump there; "RESUMED AT PAGE N" chip ~4 s
            opening screen shows "RESUME AT PAGE N" while loading
page 1 is never resumed; storage failures are silently ignored (private mode safe)
```

Reader modernization (added 2026-08-27):

```text
footer scrubber:  range input, debounced seek 140 ms, red fill via --scrub-progress
fullscreen:       ⛶ button on reader root; Escape inside fullscreen is swallowed by
                  the reader (stopPropagation) so the parent window handler does
                  NOT close the viewer — browser exits fullscreen only
double-click stage: toggle FIT ↔ 1.6× reading zoom
keyboard:         ← → pages, PageUp/PageDown pages, Home/End first/last, Escape closes
                  (only when NOT fullscreen)
aria-pressed on FIT + fullscreen buttons; reduced-motion kills all reader animation
```

Site-wide code audit (2026-08-27, every source file reviewed):

```text
RedMagic.tsx        FIXED: file did not compile (createGlowSprite + GLOW_SPRITE_SIZE
                    each declared twice — TS2393/TS2451). Then wired the previously
                    dead glow sprite into drawGlow (drawImage + globalAlpha instead of
                    2 radial-gradient allocations/frame; gradient path kept as
                    fallback). resize() now derives quality from the rect it already
                    measured and rebuilds the particle world only when the quality
                    band changes — window drags no longer re-allocate everything per
                    ResizeObserver tick. Visual output verified identical (canvas
                    pixel probes: red core + falloff intact).
LivingShell.tsx     github link now uses lib GITHUB_LINK (was a .find() every render);
                    changeScene is referentially stable via activeSceneRef, so
                    SceneUrlSync stops resubscribing URL listeners on every
                    navigation. Behaviour identical incl. back/forward.
Home/WorkScene.tsx  same GITHUB_LINK migration (per-render .find() removed).
RedCursor.tsx       hover-target selector string hoisted to module const (was
                    rebuilt on every pointerover/out).
PublicLinks.tsx     link groups + compact-id Set hoisted to module level.
LibraryScene.tsx    filter counts derived in one useMemo pass (was one .filter()
                    per filter button per render).
app/layout.tsx      <link rel="preconnect" href="https://cdn.jsdelivr.net"> so the
                    first heavy media/PDF.js request skips DNS+TCP+TLS.
globals.css         MOBILE FIX: .library-preview-tags spans render with no
                    whitespace between them → zero break opportunities → 513px
                    unbreakable run forced the 1fr preview grid track wide and
                    clipped on phones. Now flex + wrap with meta-pill styling
                    (consistent look, verified 390px: content 316px, no clipping;
                    desktop unchanged visually apart from intentional pill chips).
```

Audit invariants: never declare the same `const`/function twice in one module
(broke the build); adjacent inline spans need a wrapping container (flex/grid)
because JSX renders no whitespace between them; RedMagic glow = sprite stamps,
do not revert to per-frame gradients.

---

## 4. Completed Baseline (context — do not redo)

Six-scene shell, hash routing, scene code-splitting + idle preload, manifest build
sync + validation, catalog + filters + featured + editorial preview, deferred heavy
media, PDF reader (CDN PDF.js, progressive range loading verified end-to-end),
persistent reading position, sliding thumbnail window with byte budget, reader
modernization (scrubber, fullscreen, double-click zoom, keyboard pages, motion
polish), full-viewport modal fix, reduced-motion support, LICENSE.md /
TRADEMARKS.md, Actions workflow on current action versions, Next.js build cache,
full-repo performance/quality audit (2026-08-27 — see section 3 notes; compile
errors fixed, sprite render path, stable callbacks, preconnect, mobile preview
overflow fix). Production deploys green.

---

## 5. OPEN ITEMS (priority order)

### 1. Large-book open efficiency — agent side DONE, content side OPEN

Reader-side fix shipped 2026-08-27 (see invariants above): thumbnails render in a
strict byte budget (current page + 3 look-ahead only), the nav strip slides with
the reading position. Verified: resume-open of RED MAGIC.pdf at page 150 now
transfers 1.3 MB (10.8% of file) instead of walking the head of the book;
sliding to a nearby page costs 0 extra bytes; fresh opens unaffected.

The remaining cold-open cost is **file content, not code**. Structural analysis
of RED MAGIC.pdf (11.5 MB, Skia/PDF m145 = Google Docs export):

```text
page 2 of 270 → object 7: ONE FlateDecode image, 10.24 MB = 84.7% of the file
stored at file offset 942 (front). Any viewer rendering pages 1→2 must fetch it.
No client-side change can beat this; do not try.
```

Owner action (Contents repo, Books branch):

* Recompress / re-export that page-2 artwork losslessly-compressed → JPEG
  (or run the whole book through a recompression pass, e.g. ghostscript
  `/ebook`). This alone can cut ~85% of book size and fixes cold open.
* Then optionally `qpdf --linearize` the exports for fast-web-view ordering.

Acceptance: cold-open of the recompressed RED MAGIC.pdf transfers a small
fraction of the file for the first pages. (Resume-open already meets the bar.)

### 2. Cover system

`cover` field already flows end-to-end (manifest → `coverUrl`). Add lightweight,
cacheable cover assets to `Contents` and reference them in `library.json`.
Keep catalog/preview usage lightweight; full media still loads only on READ.

### 3. Publication presentation

Expose existing metadata with strong visual hierarchy — subtitle, series, volume,
language, status, reading time. Do not dump every field on screen; editorial
selection over data listing.

### 4. Optional: catalog-level resume hint

Reader-level resume is done. Optional polish: show "continue at page N / x% read"
on the catalog card or editorial preview (read the same localStorage keys).

### 5. Reader focus management (minor)

Arrow-key navigation requires the reader div to have focus (click inside first).
Pre-existing. Consider moving focus into the reader on modal open; keep Escape
handled by the parent viewer.

### 6. RED MAGIC dedicated scene (post-Library focus)

Make the MAGIC scene substantially richer than Home's atmospheric version:
deeper explanation, interactive controls, clearer simulation model, structured
sections. Home stays clean.

---

## 6. Verification Protocol

After any substantial change:

```text
1. npm run build            (local build has no /WEB basePath — that is correct)
2. serve out/ statically and browser-test the changed behaviour
3. push → verify the NEWEST Actions run (build + deploy green)
4. verify on https://parsaetak.github.io/WEB/
5. for library/reader changes: open a book, page through, zoom, close,
   reopen (resume), check mobile width, check reduced motion if relevant
```

Actions failure triage: newest run → failed job → failed step → first real
compiler/runtime error → source file → root cause.

---

## 7. Quality Bar

A milestone is complete only when: it works (function), feels right (UX), looks
intentional (visual), heavy work stayed deferred (performance), responsibility
sits in the correct component (architecture), the next agent can understand it
(maintainability), it builds and deploys cleanly (deployment), and user-facing
text stays readable and non-repetitive (content).

TypeScript compiling is not "done".
