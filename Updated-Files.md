# Updated-Files.md — WEB release history

## Release: v3.9.0 — INFORMATION ARCHITECTURE, FIRST-ACTION CLARITY & KNOWLEDGE-GRAPH DISCOVERY (2026-09-19)

Mission: make the site easier to understand and navigate without removing
its RED MAGIC / laboratory character — a clear first task, fast proof,
deeper discovery, related content, conversion/contact — while keeping the
world shell, the canonical document layer, and the RED MAGIC performance
boundaries exactly as they were.

### Root cause fixed: related-graph-covered 0/9

`scripts/verify-seo.mjs` (v3.8) read `post.related` from the emitted post
records, but the blog pipeline emits related sets under
`data/blog/posts.json → indexes.related[slug]`; the per-post field never
existed. The metric therefore read 0/9 while the pipeline computed 53 real
edges and every article page already rendered them ("RELATED
TRANSMISSIONS") as crawlable links. v3.9 replaces the check with one that
verifies the exported HTML: every article with declared related entries
must render at least one of those exact hrefs, and the deterministic
lateral edges below are required per article. The metric is measured
against what crawlers receive — the check got stronger, not suppressed.

### First-action model + proof-first home ordering

- `components/scenes/HomeScene.tsx`: new START HERE strip in the hero — a
  labeled `<nav aria-label="Start here — main paths through the site">`
  with four real crawlable destinations (Selected Work `/work/`, Research
  `/research/`, Blog `/blog/`, Contact `/contact/`), each with a one-line
  provenance note. The standalone Contact hero button was removed (Contact
  lives once, in the strip); "Explore the work ↓" (world scene) and GitHub
  remain the action row.
- Home order is now `Hero → Featured Work → Capabilities → Method →
  Systems → Writing → Direction → Connect` — the concrete proof directly
  follows the identity layer instead of sitting behind the capability
  grid (measured: the capability DOM previously separated the hero from
  the first project card; the hero itself is 100svh).
- The FULL PORTFOLIO archive link now targets the canonical `/work/`
  document (was the `#work` scene; the scene stays reachable through the
  world navigation and the footer).
- Every capability card carries a descriptive `proof` link —
  `01 → /ai-systems/`, `02 → /ai-evaluation/`, `03 →
  /software-engineering/`, `04 → /work/`, `05 → /local-ai/`, `06 →
  /blog/sheytan-the-local-first-laboratory/`, `07 →
  /blog/ai-instructions/`, `08 → /blog/the-anatomy-of-a-fast-static-site/`
  — so capabilities route to evidence instead of dead-ending.
- `components/scenes/HomeScene.module.css`: `.homeHeroEntries*` (2×2 grid,
  single column ≤760px, focus-visible outlines, reduced-motion-safe) and
  `.homeCapabilityProof`.

### Lateral content graph (deterministic, crawlable)

- `lib/workRegistry.ts` (NEW): `WORK_ENTRIES` moved out of
  `app/work/page.tsx` into the shared registry, plus
  `getWorkEntryForProject(project)`. The RED MAGIC entry declares
  `blogProjectAliases: ["red-theory"]` — the organism and the RED THEORY
  model are written under two project streams but documented by one Work
  entry. No article frontmatter was renamed.
- `lib/blog.ts`: `getRelatedDestinations(slug)` derives each article's
  lateral collection edges: `project` → the Work registry entry's
  `/work/` edge (labeled with the real entry name); `type=research` → a
  `/research/` edge. Two rules, no keyword matching, nothing invented.
- `app/blog/[slug]/page.tsx`: the related section now also renders an
  "IN THE LABORATORY" row group — crawlable plain anchors to `/work/`
  and/or `/research/` with the relationship kind (SYSTEMS / RESEARCH),
  the destination name, and the provenance note. Section aria-label
  updated to "Related articles, systems, and research".
- `app/blog/[slug]/article.module.css`: `.relatedLateral*` styles.
- The four content types now connect in exported HTML:
  TOPIC (hub chip) ↔ ARTICLE (related/links-here) ↔ WORK (lateral) ↔
  RESEARCH (lateral); verifier reports `related-graph-covered 9/9
  (declared-article + lateral work:9 research:4)`.

### Work / Research / Blog / Lab Map discovery

- `app/work/page.tsx`: consumes `lib/workRegistry.ts` (single source of
  truth); each project card's name now links to its field notes (the
  first interaction routes identity → proof). Cards keep repository,
  topic-hub, article, and project-filter links.
- `app/research/page.tsx`: each research module gains a SYSTEM edge —
  `Reasoning → REP executed inside SHEYTAN`, `Evaluation → UHIT — the
  measurement arm`, `Local AI → SHEYTAN Local Agent` — all routed to the
  canonical `/work/` document (`researchModuleSystem` row).
- `app/blog/page.tsx`: every Lab Map territory now carries a second
  truthful link to the canonical collection documenting it (Selected Work
  or the research programme) — six territories, no new territories, no
  hub-page changes.

### Verification changes

- `scripts/verify-seo.mjs`: related-graph coverage now measured from
  exported article HTML against the declared index (fails when a
  declared edge set renders zero links); lateral gates per article
  (project → `/work/`, `type=research` → `/research/`) scoped to the
  related section so the site-wide footer cannot fake them; new
  `first action` group requiring the home hero's START HERE nav with all
  four canonical destinations above the FEATURED WORK marker; graph-depth
  report line extended with the lateral counts.

### Registry / metadata

- `data/routes.json`: `/work/` and `/research/` lastmod bumped to
  2026-09-19 (substantive content changed); no other lastmod touched —
  home stays dateless by design, fake freshness stays banned.
- `package.json`: version 3.9.0.

### Preserved (verified, not assumed)

- RED MAGIC remains lazy: CSS seed in the initial HTML, raw `import()` at
  idle, no eager chunk (browser + HTML verified); Runtime v2.1 untouched.
- Primary navigation stays `HOME · ABOUT · BLOG · CONTACT`; world-shell
  scenes stay hash interaction states; no duplicate documents created.
- Static export valid; sitemap 21 URLs ↔ export ↔ canonicals coherent.
- Accessibility: START HERE and proof links are real focusable anchors
  with visible focus states; lateral rows are list semantics; no
  hover-only information; reduced-motion CSS untouched and verified.
- Initial-load budget: home initial JS 675,929 B (baseline 674,207 B,
  +0.26%); home HTML 91,579 B (baseline 89,537 B, +2.3% — the new
  crawlable content itself). No measurable initial-load regression.

### Measured results (v3.8.0 → v3.9.0)

- related-graph-covered: 0/9 → 9/9 (measured from exported HTML)
- hub-covered articles: 9/9 → 9/9 (unchanged); collection/home-covered
  9/9 → 9/9 (unchanged); orphan count 0 → 0
- Home hero entry points: 0 → 4 canonical document links in first screen
- Article → /work/ edges: 0 → 9 (every project-tagged article)
- Article → /research/ edges: 0 → 4 (every type=research article)
- Work card name→article links: 0 → 6 (Contents has no article)
- SEO checks: 182 → 184 passed; brand 13; export 11 (all green)

## Release: v3.7.0 — VISUAL UX + BLOG-CENTERED CONTENT ARCHITECTURE + SEO GRAPH (2026-09-18)

Mission: make the site feel like a visual laboratory rather than a
collection of long text documents, and simplify the information
architecture around the Blog — without destroying the SEO value of the
existing /work/ and /research/ routes.

### Information architecture

- Primary navigation is now `HOME · ABOUT · BLOG · CONTACT`
  (`lib/navigation.ts`). BLOG is the site's main content discovery
  surface; WORK and RESEARCH left the primary tabs and became CONTENT
  NAV "collections" — canonical deep landing pages kept crawlable
  site-wide by the footer document nav's new Collections row
  (`components/SiteDocNav.tsx`) and by the Blog's lab map. The
  experiential `#work` living-world scene is untouched.
- `app/blog/page.tsx` is the content hub: a visual hero (positioning
  copy left, live instrument panel right — featured cover, real
  per-type count readouts, latest signal), the featured card with its
  content type, the content-mode discovery grid, and a new LAB MAP —
  six territory cards (each linking its topic hub and key system
  article) plus the two canonical collection cards (/work/,
  /research/).
- `components/blog/BlogIndex.tsx`: content-mode selector
  (ALL · ARTICLES · WORK · RESEARCH) with real counts, `aria-pressed`,
  URL state `?type=work|research|article` riding the existing
  replaceState URL store (shareable, reload-safe, Back-safe; unknown
  values ignored); compact result summary renders the catalogue's real
  per-type composition; cards gain a type badge and a type-tinted top
  edge. Existing search/tag/project/topic filtering unchanged.
- `app/work/page.tsx`: visual project cards — real article covers (or
  a truthful 13-point-star geometric identity card for Contents; no
  fabricated screenshots), one-sentence purpose, key signal, tech
  stack, links including per-project "all writing in the Blog"
  filters; the deep what/problem/why documentation moved below the
  visual summary inside the same card.
- `app/research/page.tsx`: three research modules rendered as
  QUESTION → METHOD → FRAMEWORK → MEASUREMENT → ARTIFACT chains
  (horizontal desktop, left-rail mobile), each step linking its real
  framework/artifact; links into the Blog research mode.
- `app/blog/[slug]/page.tsx`: the at-a-glance strip now leads with a
  TYPE chip (tinted by content type, linking the matching Blog mode)
  and renders unconditionally before the project/hub/topic chips.
- `components/scenes/HomeScene.tsx` + `lib/homeWriting.ts`: the home
  writing list carries the same content-type badge vocabulary.

### Content-type model

- All 9 articles in `content/blog/*.md` carry a new required
  frontmatter field `type: article | work | research`, classified
  from each article's own meaning: 1 article
  (building-under-constraints), 4 work (freeiran-engineering-notes,
  sheytan-the-local-first-laboratory, the-anatomy-of-a-fast-static-site,
  why-the-website-is-a-living-system), 4 research (ai-instructions,
  measuring-machine-intelligence, reasoning-is-a-system-property,
  red-theory-and-the-living-web).
- `scripts/build-blog.mjs` validates the type (unknown/missing fails
  the build), emits it into `data/blog/posts.json` and the search
  haystack, and logs the per-type counts.
- `lib/blogFormat.ts` exports the shared ContentType model, labels,
  and plural helpers (client-safe); `lib/blog.ts` adds
  getPostsByType/getTypeCounts and drops typeless records during
  normalization.

### SEO graph

- `app/blog/page.tsx` metadata rewritten for the discovery-surface
  role (description, page-level openGraph/twitter with og:image); the
  Blog JSON-LD keeps the Blog entity and adds a truthful ItemList of
  the canonical content collections (no query URLs in structured data
  or the sitemap).
- `scripts/verify-seo.mjs`: `verifyWritingLinks` renamed
  `verifyContentDiscoveryLinks`; new `verifyBlogContentDiscovery`
  check group — ≥3 crawlable article links on /blog/, /work/ and
  /research/ crawlable from the Blog, content-type model valid with no
  orphaned mode, and the v3.7 four-entry primary-nav topology; the
  link-graph fragment check now distinguishes `/#scene` links from
  bare in-page `#fragment` anchors (validated against the page's own
  element ids; index.html keeps scene-routing semantics).

### Styling

- `app/blog/page.module.css`: hero instrument (rings, cover panel,
  readouts, latest line), hero actions, lab map grid, territory cards,
  collection cards, responsive + reduced-motion rules.
- `components/blog/BlogIndex.module.css`: type selector, mode counts,
  result summary, card type badges and type variants, mobile
  touch-target sizing.
- `components/content/content.module.css`: visual project cards
  (media cell, identity card, purpose/signal, detail block, responsive
  rules) and research chain modules.
- `app/blog/[slug]/article.module.css` and
  `components/scenes/HomeScene.module.css`: type-chip and type-badge
  tint variants.

### Documentation

- `README.md`: navigation section rewritten for the v3.7 topology
  (primary/collections/world), new content-type model and
  visual-laboratory sections.
- `worklog.md`: v3.7 release entry (mission, decisions, measured
  verification).
- `Updated-Files.md`: this entry.
- `package.json`: 3.6.1 → 3.7.0.

### Verification

- npm ci / npm run blog / npm run build / npm run lint: 0 errors
  (21 pre-existing img warnings, unchanged).
- npm run verify: 177 SEO + brand + export-route checks pass
  (content types: 1 article · 4 work · 4 research; /work/ and
  /research/ crawlable from the Blog; no orphaned content mode).
- Browser verification over the static export (agent-browser):
  9 routes × 6 viewports (1440×900, 1280×800, 1024×768, 430×932,
  390×844, 360×800) — zero horizontal overflow, zero broken images,
  zero console/page errors; content modes, deep links (?type=work,
  ?type=research, ?type=invalid), and project filtering verified
  interactively; mobile selector targets 46px; VLM screenshot audit
  of the Blog/Work pages confirms composition and scannability.
- No accidental client-bundle growth: the only interactive surface
  remains the existing metadata-only BlogIndex island.

## Release: v3.6.1 — ALIGNMENT FIX: one unified page-frame contract (2026-09-17)

Mission: eliminate the visual inconsistency between the six
primary tabs. The site already had `FullScreenPageShell`, but the
tabs still rendered through three competing page-frame systems.
v3.6.1 repairs the underlying layout contract so every tab
composes from the same primitives — same geometry, different
identity. Base version: v3.6 (package.json 3.6.0 → 3.6.1).

### Root cause (measured, not assumed)

Browser measurement at identical viewports (e.g. 1440×900) found:

- THREE header systems: HOME HUD fixed/74px/1440px rail/36px star;
  content header sticky/85px/1240px rail + 32px padding/30px star;
  blog header fixed/92px/1440px rail/15+21px padding. Brand x:
  16 / 132 / 16. Two positioning modes changed the effective
  first-screen composition.
- BLOG-only compensations: `.blogMain` padding-top
  `calc(var(--shell-header) + 46px)` = 120px (mobile literal
  `68px + 38px`), existing on no other tab, offsetting the fixed
  header plus extra lead-in.
- BLOG hero rail break: `.blogHero > .page-container { width: 100% }`
  pushed the blog hero text to x=0 — zero gutter at every
  viewport — while every other rail sat at 8–322px.
- First-screen math off by the real header height: content hero
  used `100svh − 74px` while the actual header rendered 85px →
  first screen = 911px on a 900px viewport.
- Three content rails (1240 / 1240+32 / full-bleed), three footer
  spacings (0 / 88 / 96), four mobile gutter systems, three H1
  scales (34–58 / 36.8–76.8 / 52–124.8).

### The fix — tokens, one header contract, one rail, one hero formula

- `app/globals.css` — NEW canonical page-frame tokens:
  `--page-content-width` (1240), `--page-doc-width` (860),
  `--page-lead-measure` (720), `--page-h1-scale`, `--page-gutter`
  (32 → 24 @≤860 → 20 @≤560), `--page-header-height`
  (76 → 68 @≤860), `--page-hero-min-height` (440 → 380 @≤560),
  `--page-section-gap` (64), `--page-footer-spacing` (88).
  Legacy tokens (`--content-width`, `--shell-width`,
  `--shell-header`) are now ALIASES of the canonical tokens, so
  all 48 pre-existing references (scenes, blog, TOC, article
  scroll-margins) resolve to the unified contract automatically.
  `.page-container` is the shared alignment rail:
  `min(calc(100% − 2*gutter), content-width)` — no per-breakpoint
  width overrides anymore.
- `components/content/content.module.css` — header contract
  (sticky, z-index 1000, rail width, min-height
  `calc(header − 1px)` so the border lives inside the contract,
  brand normalized to 32px star + 15px/800 name); `.main`
  padding-bottom → `--page-footer-spacing`; `.doc` → tokenized
  860px document measure; NEW `.heroDoc` hero-rail container;
  `.hero` min-height → `max(--page-hero-min-height, 100vh/svh/dvh
  − --page-header-height)`; `.title` → `--page-h1-scale` +
  doc-width cap; `.lead` → `--page-lead-measure`; mobile
  overrides deduplicated (gutters are token-owned now).
- `components/ContentShell.tsx` — hero text block moved from
  `.doc` to the new `.heroDoc` rail (hero starts on the shared
  rail; the document body keeps the readable measure).
- `components/LivingShell.module.css` — world shell is now the
  same flex-column page-frame (footer behavior unified); HUD
  fixed → STICKY (same visual, in-flow, zero-compensation
  scroll composition); HUD inner → shared rail + full
  `--page-header-height` (border inside border-box); brand star
  36 → 32; `.livingShellViewport` drops `min-height` + the 74px/
  68px `padding-top` compensation, gains `flex: 1` + footer
  spacing token; legal footer inner → shared rail; ≤760 block
  rewritten around tokens (safe-area insets kept).
- `components/blog/BlogHeader.module.css` — fixed → STICKY,
  z-index 1000; inner → shared rail + full header height (the
  15/21px padding removed); ≤760 rewritten around tokens.
- `app/blog/layout.module.css` — the Blog-only padding-top
  compensations DELETED (both the `+46px` and the mobile
  `68px + 38px` literals); `.blogMain` keeps flex:1 + footer
  spacing token; scroll-padding-top tokenized.
- `app/blog/page.module.css` — hero min-height → the ONE shared
  first-screen formula (the `− 46px` magic and the mobile
  `− 68px − 96px` literals removed); the `width: 100%` rail
  override REMOVED (hero text back on the shared rail); blog
  hero H1 → shared `--page-h1-scale` + doc-width cap; lead →
  shared lead measure; kicker → shared document-kicker geometry
  (accent color, 10px/0.26em) via new `.blogHeroKicker`.
- `app/blog/page.tsx` — hero h1/kicker stop competing with
  global `section-title`/`kicker` classes; module classes own
  the first composition (same geometry as document tabs).
- `app/blog/[slug]/article.module.css` — article top spacing is
  now a design clamp on `.article` (the header is in flow; no
  viewport compensation math anywhere).
- `components/FullScreenPageShell.module.css` — comment updated
  to document the v3.6.1 token contract (shell rules unchanged).

### Not changed (regression guard)

- v3.5 intent-based route warming, scene preloading, zero-delay
  scene transitions, RED MAGIC organism + one SOUND ON/OFF
  system, SEO/static export, canonical `/blog/` URLs, article
  routes, accessibility, reduced-motion behavior, page content,
  visual identity, UnifiedSiteNav internals (one nav component
  everywhere; the blog nav slot now merely provides the same
  flex context the content header already had, so the ≤860px
  trigger keeps its end-alignment contract).

### Verification (performed)

- Automated geometry comparison, 6 tabs × 6 viewports
  (1440×900, 1280×800, 1024×768, 768×1024, 390×844, 360×800),
  before/after: header height 76/68 on ALL tabs (was
  74/85/92); brand x = H1 rail x = 100/32/32/24/24/24 on ALL
  tabs (was 16/132/16 vs 100/322/0); first-screen bottom =
  exact viewport height on all one-screen tabs (was 911/900);
  uniform 88px footer spacing; zero horizontal overflow.
- No hydration layout shift (header/rail identical at 250ms and
  2.2s); hash scene routing works (`/#work` → work scene);
  ≤860px disclosure menu opens with all six primary tabs +
  GITHUB; article geometry verified; zero console errors/page
  errors on all primary routes + article + hub.
- npm ci / npm run blog / npm run build / npm run lint
  (0 errors, pre-existing img warnings only) / npm run verify
  (seo + brand + export) all green. No WRITING label; no active
  DRIFT / LISTEN / SURGE references.

## Release: v3.6 — BLOG rename, one RED MAGIC sound, full-screen tabs (2026-09-17)

Mission: professional ordering and terminology, one honest RED
MAGIC sound engine, and a consistent full-screen presentation for
every primary tab — without regressing the v3.5 fast-navigation
paths or redesigning unrelated systems. Base version: v3.5
(package.json 3.6.0).

### Navigation — WRITING → BLOG + identity-first order

- `lib/navigation.ts` — PRIMARY_NAV reordered to HOME · ABOUT ·
  WORK · RESEARCH · BLOG · CONTACT (identity → capability →
  research → writing → contact) and the writing entry renamed
  (id `writing` → `blog`, label Writing → Blog, shortLabel
  WRITING → BLOG). Canonical `/blog/` URL and article routes
  unchanged; scene ids unchanged (v3.2 law).
- `components/UnifiedSiteNav.module.css` — hover-identity
  selectors and accents renamed `data-id="writing"` →
  `data-id="blog"` (type caret, ink line, blink); keyframes
  renamed navBlogCaret/navBlogInk/navBlogBlink.
- `components/SceneNavigator.module.css` — scene-accent selector
  `data-scene="writing"` → `data-scene="blog"`.
- `components/blog/BlogHeader.tsx` — active entry id `blog`.
- `components/scenes/HomeScene.tsx` — home section kicker
  WRITING → BLOG, "ALL WRITING" → "ALL ARTICLES", aria-label
  "Selected articles" (SEO-verified phrases "Field notes" and
  "Open the Blog" preserved).
- `components/scenes/AboutScene.tsx` — output card
  SOFTWARE · WRITING · ART → SOFTWARE · BLOG · ART.
- `components/scenes/WorkScene.tsx` — RED MAGIC BOOKS card type
  WRITING → PUBLICATION.
- `app/blog/page.tsx`, `app/blog/layout.tsx` — hero title
  "Writing from the laboratory" → "Notes from the laboratory"
  (+ matching OG alt text).
- Comments updated in UnifiedSiteNav.tsx, SceneNavigator.tsx,
  SiteDocNav.tsx, LivingShell.tsx, BlogHeader.tsx, navigation.ts.
- Verified: no visible WRITING label remains in any component,
  route, or style.

### RED MAGIC — one sound engine (modes removed, real audio)

- `components/RedMagicAudio.ts` — REWRITTEN as a single engine.
  Removed: RedMagicAudioMode, MODE_SETTINGS, setMode(), all
  drift/listen/surge profile data. New graph: low body (52 Hz +
  78.2 Hz sines), warm harmonic (104 Hz triangle), breathing
  shimmer (416/624 Hz + 0.06 Hz tremolo), 0.045 Hz breath LFO on
  the body filter, and a pink-noise texture layer — all behind
  one compressor → master → destination chain. Gain staging
  rebuilt for audibility (master 0.85; the v3.5 engine topped
  out near -50 dB and was effectively silent). Interaction
  energy/proximity/charge drive one continuous intensity control
  (gains, filter opening, shimmer brightness, texture level)
  with a self-decay loop; impact/flick/release/orbit/enter/leave
  transient envelopes layered over the bed. Autoplay policy:
  the AudioContext is constructed only after real user
  activation (toggle click, or one-shot document
  pointerdown/keydown/touchend listeners armed when a stored ON
  preference is restored) — never during hydration, so the
  console stays clean. ON ramps master to level on every start
  (no silently-stuck running context); OFF fades the master then
  suspends after ~0.5 s. Hidden tab suspends, visible tab
  resumes when enabled. Preference persists under
  `red-magic-sound-enabled`.
- `components/MagicConsole.tsx` — behaviour selector
  (DRIFT/LISTEN/SURGE buttons + notes) removed; the control
  surface is the single SOUND ON / SOUND OFF toggle with an
  honest live note. Vitals readout kept; signal label SURGING →
  ACTIVE.
- `components/MagicInteractionLayer.tsx` — mode prop and
  audio.setMode effect removed; soundEnabled wiring unchanged.
- `components/RedMagic.tsx` — visual mode system removed:
  RedMagicMode type, MODE_PROFILES, mode prop and modeRef are
  gone; one fixed ORGANISM_PROFILE (balanced baseline). The
  surge-gated behaviours became activity-gated (pointer energy >
  0.7 drives the angular falloff swap and the rotational
  particle swirl) — the organism stays interaction-driven.
- `components/MagicConsole.module.css` — mode-control styles
  retired; bar is note + single sound control (40px target,
  44px on touch); focus-visible ring added.
- `components/scenes/RedMagicScene.tsx` — console copy updated
  (no behaviour chooser reference).
- Browser-verified with a real click gesture: OFF→ON ramps
  master to 0.85 and starts all ambient voices; pointer movement
  over the organism sweeps intensity params (body gain
  0.055→0.133, filter 130→1018 Hz, texture 0→0.054); ON→OFF
  fades to zero and suspends; reload restores the preference;
  zero console errors/warnings.

### Full-screen tab architecture

- `components/FullScreenPageShell.tsx` + `.module.css` — NEW
  shared shell: one full-screen contract (min-height 100vh →
  100svh → 100dvh stack, flex column, footer pinned on short
  documents, natural scroll on long ones) + per-tab identity
  tokens (`data-page` → `--page-accent`: about #ff8a5c, work
  #ff6a3d, research #ff7847, blog #ff5c5c, contact red-hot,
  home/hub red-hot).
- `components/content/ContentShell.tsx` — restructured on the
  shell: the document header (crumbs/kicker/title/lead) is now a
  full-screen HERO section with a per-tab decorative identity
  field (about: portrait halo; work: tick grid + construction
  line; research: radar rings; blog/hubs: editorial baselines;
  contact: transmission ripples) and a SCROLL cue. Content floor
  (max()) keeps short viewports scrolling instead of cramping.
  Applies automatically to /about/, /work/, /research/,
  /contact/ and the six topic hubs.
- `app/blog/layout.tsx` + `layout.module.css` — blog route rides
  the FullScreenPageShell (page="blog").
- `app/blog/page.module.css` — blog hero now fills the first
  screen (minus fixed header), title block vertically composed.
- Viewport unit stacks (100vh → 100svh → 100dvh) applied to:
  `app/globals.css` (body), `components/LivingShell.module.css`
  (.livingShell, .livingShellViewport),
  `components/SceneViewport.module.css`,
  `components/scenes/{HomeScene,AboutScene,WorkScene,SystemsScene,RedMagicScene}.module.css`
  first-screen sections (and their ≤760px variants).

### Mobile upgrade

- `components/UnifiedSiteNav.module.css` — open disclosure panel
  now renders on a near-opaque surface with a fixed focus scrim
  behind it (page dims; compositor-only fade; reduced-motion
  safe); trigger font 9→10px, entries 10→11px, entry padding up;
  trigger/entries keep ≥44/46px touch targets.
- `components/content/content.module.css` — mobile document
  padding 16→20px, section rhythm 64→48px, lead 17→16px at
  ≤560px; hero min-height floor 380px with edge-aware motif
  positioning.
- `components/MagicConsole.module.css` — sound control 44px
  touch target at ≤760px.
- Verified at 390×844 and 320px-class widths: zero horizontal
  overflow on /, /about/, /work/, /research/, /blog/, /contact/.

### Verification (all green)

- `npm ci`, `npm run blog`, `npm run build`, `npm run lint`
  (0 errors; 18 pre-existing no-img-element warnings),
  `npm run verify` (SEO 173 checks, brand, export 11 checks).
- Browser (Chromium) pass: primary nav order + labels on every
  surface; all six world scenes (#home #about #systems #magic
  #work #library) switch correctly; every primary tab begins as
  a full-screen composition (hero bottom = fold); audio
  gesture/suspend/persist cycle verified with an instrumented
  AudioContext; reduced-motion rules preserved and new
  animations gated; zero page errors and zero console
  warnings across routes.

### Files changed

lib/navigation.ts; components/RedMagicAudio.ts;
components/MagicConsole.tsx; components/MagicConsole.module.css;
components/MagicInteractionLayer.tsx; components/RedMagic.tsx;
components/scenes/RedMagicScene.tsx;
components/scenes/HomeScene.tsx; components/scenes/AboutScene.tsx;
components/scenes/WorkScene.tsx; components/FullScreenPageShell.tsx
(new); components/FullScreenPageShell.module.css (new);
components/content/ContentShell.tsx;
components/content/content.module.css; app/blog/layout.tsx;
app/blog/layout.module.css; app/blog/page.tsx;
app/blog/page.module.css; components/UnifiedSiteNav.tsx;
components/UnifiedSiteNav.module.css;
components/SceneNavigator.tsx; components/SceneNavigator.module.css;
components/SiteDocNav.tsx; components/LivingShell.tsx;
components/LivingShell.module.css; components/SceneViewport.module.css;
components/scenes/{HomeScene,AboutScene,WorkScene,SystemsScene,RedMagicScene}.module.css;
app/globals.css; components/blog/BlogHeader.tsx; package.json
(3.6.0); README.md; Updated-Files.md; worklog.md.

## Release: v3.5 — Fast Navigation (2026-09-16)

Mission: clicking a navigation tab should feel immediate. The
loading/navigation path is rebuilt around two honest paths — fast
(warmed/cached destination renders before the next paint, no loader)
and slow (genuine fetch keeps the current scene dipped and shows the
viewport loading surface only when the fetch runs long) — plus a
content consolidation on the home capabilities grid. Base version:
v3.4 (package.json 3.5.0). No visual identity changed: the six hover
identities, accents, geometry and labels of the v3.4 unified
navigation are untouched.

### Route loading — intent-based warming

- `components/UnifiedSiteNav.tsx` — internal route links keep
  `prefetch={false}` (nothing is fetched continuously, per site law)
  but now warm ON INTENT: `pointerenter` + `focus` (desktop) and
  `pointerdown` (touch/press) call `router.prefetch(href)` through a
  single deduplicated entry point (a per-instance `Set`; a failed
  warm evicts so a later intent can retry). Applies to both the
  desktop track and the ≤860px disclosure menu; scene "action"
  entries keep the existing immediate `onActionWarm` →
  `preloadScene` contract. In the static export a warm costs one
  small RSC payload text file per intended destination — verified in
  the browser: hover on RESEARCH fetched `/research/__next.*.txt`,
  the subsequent click re-fetched nothing and landed from the router
  cache.
- `components/blog/BlogHeader.tsx`, `components/content/ContentShell.tsx`
  — no source change needed; they render the same `UnifiedSiteNav`
  and inherit the warming contract through hydration.

### Scene transitions — no artificial delay

- `components/SceneRegistry.tsx` — REMOVED `MIN_TRANSITION_MS = 160`
  and its `wait()` timer. Transition model is now
  requested → load → render when ready. The effect became an
  isomorphic layout effect: when `isSceneModuleReady(scene)` reports
  the module resident, `setRenderedScene` commits inside the layout
  phase — before the browser paints — so a cached scene never paints
  a transitioning frame, a blank frame, or a loader. Otherwise the
  module is fetched at P0 and rendered the moment it lands. The
  monotonic `transitionId` + effect-cleanup race protection is
  preserved: rapid navigation can only ever commit the latest
  requested scene.
- `components/ScenePreloader.tsx` — new synchronous readiness map
  (`resolvedModules`) filled when an import promise resolves, and
  the exported `isSceneModuleReady(scene)` predicate (home is always
  ready — it ships in the main bundle). `preloadScene` keeps its
  dedupe + failed-import eviction; successful imports now also
  publish readiness for the registry's fast path.

### Loading animation — layered, honest, alive

- `components/SceneLoadingScreen.module.css` — scene variant is now
  a lightweight transition surface instead of a wall: lighter
  background with a red radial focus, a `--scene-overlay-delay`-driven
  fade (in sync with `SCENE_OVERLAY_DELAY_MS`), and a new SIGNAL ARC
  — a thin conic sweep orbiting the 13-point star (compositor-only
  transform, scene variant only, boot gate identity unchanged) that
  reads as transfer-in-motion rather than a spinner. No fake
  percentage anywhere; the indeterminate bar stays. Under
  `prefers-reduced-motion` the arc collapses to a static thin ring
  and all fades go effectively instant.
- `components/SceneLoadingScreen.tsx` + `lib/loadPhase.ts` —
  documentation of the layered model
  (intent → transfer → ready): the overlay is shown only when the
  destination module is genuinely still being fetched after
  `SCENE_OVERLAY_DELAY_MS`; warmed/cached transitions never paint
  it. The overlay never blocks pointer interaction (unchanged).

### Flash/jank audit (no code defects found, fast path hardened)

- Single `sceneEnterHost` (no double scene mount), single
  `sceneLoadingScreen` per viewport (no duplicate overlays), keyed
  remount per rendered scene (no stale previous scene), overlay is
  absolutely positioned (no layout shift), Suspense fallback rides
  the same delayed-fade surface (no visible blank frame), and the
  fast path swaps before paint so the slow-path animation never
  penalises it. Verified in a real browser across first visit,
  hover→click, rapid tab racing, back/forward, mobile menu, and
  repeated navigation.

### Content — capabilities 9 → 8

- `components/scenes/HomeScene.tsx` — the visible capability set is
  exactly eight objects (4 + 4 desktop grid; no orphan card, no CSS
  hiding). "Creative technology" (09) was consolidated out: the
  discipline already owns dedicated presentation surfaces — the
  `/creative-technology/` topic hub and the RED MAGIC scene/article —
  so the home grid repeated it without adding signal. It was chosen
  over the alternatives because every other capability names work
  with no separate home presentation.
- `scripts/verify-seo.mjs` — the home required-phrase check swaps
  "Creative technology" for "System architecture" (a grid term that
  must remain visible), with a comment explaining the v3.5
  consolidation.
- `app/layout.tsx` — keywords keep "creative technology" (still
  backed by the hub + RED MAGIC presentations); the keyword-
  discipline comment now documents that the home grid is exactly
  eight entries since v3.5.
- `lib/seo.tsx` — `knowsAbout` keeps "Creative technology" (the
  person still practises it and the hub presents it); comment updated
  to name the topic hubs as its backing surface.
- Grid math (`components/scenes/HomeScene.module.css`) needed no
  change: desktop `repeat(4, minmax(0,1fr))` renders
  [1][2][3][4]/[5][6][7][8]; ≤1100px two columns render four even
  rows; the smallest breakpoint stacks one column. `min-height`
  (not fixed height) means no text clipping at any width. Verified
  computed column counts at 1440/900/390px with no horizontal
  scroll.

### Housekeeping

- `package.json` — version 3.5.0.
- `README.md` — navigation and performance architecture sections
  document intent warming and the fast/slow transition model.

### Verification

- `npm ci` ✓ · `npm run blog` ✓ · `npm run build` ✓ (23 static
  routes) · `npm run lint` ✓ (0 errors; pre-existing `<img>`
  warnings only) · `npm run verify` ✓ (SEO + brand + export gates)
- Browser navigation test pass: HOME/WORK/RESEARCH/WRITING/ABOUT/
  CONTACT and SYSTEMS/RED MAGIC/LIBRARY all reach their destinations
  with warmed-first loads; no console errors; no duplicate overlays;
  no double mounts; back/forward and the ≤860px disclosure menu
  behave.

## Release: v3.4 — Unified Navigation (2026-09-16)

Mission: one navigation system for the whole website — every surface
renders its navigation from one renderer and one data source — plus a
distinct ~1-second hover identity animation for each primary tab.
Base version: v3.3 (package.json 3.3.0).

### The unified navigation

- `components/UnifiedSiteNav.tsx` (new) — THE navigation renderer.
  Renders both responsive modes of the same system from the same
  entries: the desktop track (primary + world groups with a divider)
  and the ≤860px disclosure menu (primary → world → utility with
  structural dividers). Entry kinds: "link" (next/link, prefetch off,
  basePath-safe; external = plain anchor) and "action" (in-shell
  scene switch with the preload-on-intent warming hook). Full
  accessibility contract: aria-current="page" + data-active, semantic
  nav, aria-expanded/controls/haspopup trigger, roving
  ArrowUp/ArrowDown/Home/End focus, Escape close + focus restore,
  outside pointer-down close, focusout close, no scroll locking.
- `components/UnifiedSiteNav.module.css` (new) — one geometry, one
  typography, one accent map (data-id based, identical on track and
  menu), active/focus/hover states, the six hover identities, the
  860px mode switch, and the reduced-motion collapse.
- Deleted: `components/SceneNavigator.tsx` + `.module.css`
  (desktop track) and `components/CompactMenu.tsx` + `.module.css`
  (touch disclosure) — both superseded by UnifiedSiteNav. No route
  uses an older menu.

### Surfaces migrated

- `components/LivingShell.tsx` — world HUD renders UnifiedSiteNav
  (scene actions + route links + GitHub utility) via one memoized
  entries list; scene warming (`preloadScene`) preserved through the
  `onActionWarm` hook; `LivingShell.module.css` drops the
  `.livingShellMenu` island rules.
- `components/blog/BlogHeader.tsx` — the separate scene-link row and
  the standalone CompactMenu island are replaced by UnifiedSiteNav
  (WRITING active; GitHub rides in the disclosure panel);
  `BlogHeader.module.css` drops `.sceneLinks/.sceneLink/
  .sceneLinkWorld/.sceneNavDivider/.headerMenu` and adds the
  `.blogNav` placement slot; the BLOG status chip stands down at
  ≤1100px matching the world HUD.
- `components/content/ContentShell.tsx` — the separate light headerNav
  row is replaced by UnifiedSiteNav: world navigation (/#systems,
  /#magic, /#library) and the mobile disclosure menu are newly
  available on /about/, /work/, /research/, /contact/ and the six
  hubs; per-route active state preserved via `activeHref`;
  `content.module.css` drops `.headerNav/.headerLink` and adds the
  `.contentNav` placement slot. The nav is the content routes' one
  small client island; document bodies remain static HTML and the nav
  ships fully server-rendered.
- `app/work/page.tsx` — now passes `activeHref="/work/"` (pre-existing
  gap: WORK was never highlighted on its own document).
- `lib/navigation.ts` + `components/ScenePreloader.tsx` — comments
  refreshed to name the unified renderer; data model unchanged.

### Six hover identities (~1s, compositor-only)

HOME — ignition (orbit ring + core flash) · WORK — construction
(scanline sweep + tick-grid build) · RESEARCH — signal (staggered
radar pings + data trace) · WRITING — typography (caret sweep + self-
writing ink + end caret blink) · ABOUT — identity (halo swing + aura
bloom) · CONTACT — transmission (staggered ripples + outbound packet).
Transform/opacity/clip-path only; the label never moves (no layout
shift); effects replay on every re-enter; gated behind
`(hover: hover) and (pointer: fine) and (prefers-reduced-motion:
no-preference)` so touch devices and reduced-motion readers get the
static state changes only.

### Verification

- npm ci / npm run blog / npm run build / npm run lint (0 errors) /
  npm run verify — all green; exported HTML inspected on every route
  (nav present, aria-current correct, world links present, zero old
  nav markup, 15 keyframes compiled with gates).
- Live browser checks: desktop track + active states; scene switch
  via nav with hash + history; mobile panel (focus, roving, Escape,
  auto-close, navigation); hover + focus-visible states; no console
  errors.
- `package.json` — version 3.3.0 → 3.4.0.

## Release: v3.3 — First-Person Voice (2026-09-15)

Mission: make all user-facing personal/author writing read as Parsa Tak
speaking directly in first person, while preserving project/system voice,
the SEO/entity architecture, static export, and every verification gate.
Base version: v3.2 (package.json 3.2.0).

### Voice rule applied

- Personal self-description in visible prose → first person
  ("I build…", "My research…", "I write…").
- Projects/systems keep natural entity voice ("SHEYTAN runs…",
  "FreeIran provides…").
- SEO/entity surfaces stay technically correct third person: meta
  titles/descriptions, ogAlt, Person/ProfilePage/JSON-LD, bylines,
  legal lines, and the "Email Parsa Tak" CTA (asserted by verify-seo).

### Files changed

- `app/about/page.tsx` — lead and all body sections converted to
  natural first person ("He builds… and researches…" → "I build… and I
  research…", "The work follows" → "My work follows", "To work
  together" → "To work with me", "The research track asks…" → "In
  research, I ask…", etc.); module comment updated. Structure,
  sections, facts, and ProfilePage JSON-LD unchanged.
- `app/contact/page.tsx` — lead rewritten to first person ("I am an
  independent software engineer… all reach me in one place…").
- `components/content/HubPageView.tsx` — the six topic hubs' focus
  section title is now "What I work on in <topic>" (was "What Parsa
  Tak works on in <topic>"); new `topicInSentence()` helper lowercases
  the topic for mid-sentence use while preserving the "AI" acronym
  (also fixes the old "local ai" casing quirk).
- `app/work/page.tsx` — About cross-link note is now "Who I am, how I
  work, and what I build" (was "The researcher and builder behind the
  systems").
- `components/scenes/LibraryScene.tsx` — library preview fallback
  description is now "An original work from my archive."
- `lib/hubs.ts` — comments updated to the first-person reading; all
  metaTitles/metaDescriptions untouched (SEO surface).
- `README.md` — hub description updated; new "Site voice (v3.3)"
  paragraph in the developer section documents the rule.
- `worklog.md` — content-route invariant wording updated; v3.3 entry
  added.
- `package.json` — version 3.2.0 → 3.3.0.

### Intentional third-person occurrences that remain

Meta titles/descriptions and ogAlt across all routes; Person /
ProfilePage / WebSite JSON-LD descriptions; bylines and the article
author box; "Email Parsa Tak" CTAs; footer copyright, trademark, and
legal lines; brand wordmarks in headers; historical changelog entries
(v3.2 and earlier in this file, PUSH-NOTES.txt).

### Verification

`npm ci`, `npm run blog`, `npm run build`, `npm run lint`, and
`npm run verify` (seo + brand + export) all pass. Exported HTML
inspected directly: about and contact leads are first person, all six
hubs render "What I work on in …", zero he/him/his matches in `out/`,
JSON-LD/sitemap/canonical/base-path architecture unchanged.

---

## Release: v3.2 — Professional Identity (2026-09-15)

Mission: make the site read as the portfolio of an independent software
engineer · product builder · AI systems researcher — while preserving the
experimental Parsa Tak / RED MAGIC identity, the six-scene world, and the
entire v3.0/v3.1 SEO architecture.

### Navigation (numbered HUD labels removed, new primary nav)

- `lib/navigation.ts` — NEW. Single source of truth for site-wide
  navigation: `PRIMARY_NAV` (HOME, WORK, RESEARCH, WRITING, ABOUT,
  CONTACT) and `WORLD_NAV` (SYSTEMS, RED MAGIC, LIBRARY, quieter
  secondary destinations). Every nav surface renders from these lists.
- `components/SceneNavigator.tsx` — rebuilt: mixed scene/route entries
  with a primary group and a quieter world group after a divider; the
  numbered index spans (`01`–`06`) are gone. Route entries are real
  `next/link`s (prefetch on intent); scene entries keep the preload
  contract.
- `components/LivingShell.tsx` — builds the desktop track and the
  CompactMenu from `lib/navigation.ts`. HOME remains an in-shell scene
  action; WORK/RESEARCH/WRITING/ABOUT/CONTACT are routes; the separate
  "Blog ↗" HUD link is retired (WRITING covers it); the six-scene world
  (scene ids, hash routing, preloading) is unchanged.
- `components/CompactMenu.tsx` — index glyphs (`01`…`07`, `↗`) removed;
  entries separated by dividers, spacing, and accent colors.
- `components/blog/BlogHeader.tsx` — primary nav with WRITING active +
  quiet world row; the separate BLOG area control is retired.
  `components/blog/BlogAreaControl.tsx` — DELETED (stale island).
- `components/content/ContentShell.tsx` — header renders the primary
  nav from `lib/navigation.ts` with per-route active state
  (`activeHref` + `data-active` + `aria-current`).
- `components/SiteDocNav.tsx` — footer rows restructured: Site (primary
  nav), World (experimental scenes), Topics (six hubs).
- Scene kickers de-numbered: `01 / ABOUT` → `ABOUT`, `02 / SYSTEMS` →
  `SYSTEMS`, `03 / MAGIC` → `RED MAGIC`, `04 / WORK` → `WORK`,
  `06 / LIBRARY` → `LIBRARY` (in AboutScene, SystemsScene, RedMagicScene,
  WorkScene, LibraryScene). The `SYSTEMS 03` overview link label in
  HomeScene lost its number too.
- CSS: `SceneNavigator.module.css` (divider, world-group typography,
  route accents; index styles removed), `CompactMenu.module.css`
  (entryIndex removed), `BlogHeader.module.css` (active state on the
  link, world row, divider), `content.module.css` (headerLink active
  state; contactCtaRow), `LivingShell.module.css` (livingShellBlog
  removed), `HomeScene.module.css` (contact CTA row).

### Professional positioning

- `lib/seo.tsx` — `HOME_TITLE` → "Parsa Tak — Software Engineer, Product
  Builder & AI Systems Researcher"; `SITE_DESCRIPTION` and
  `AUTHOR_TAGLINE` updated; `Person` jobTitle/description/knowsAbout
  refreshed (product building included; still visible-backed and free of
  invented credentials); `contentWebPageEntity` gained an optional
  `pageType` (ProfilePage support).
- `components/scenes/HomeScene.tsx` — hero kicker "SOFTWARE ENGINEER ·
  PRODUCT BUILDER · AI SYSTEMS RESEARCHER"; hero description states the
  full pipeline; capability grid gains "Product building" (09 items);
  the METHOD section is the seven-stage pipeline (research, product
  direction, architecture, implementation, testing, verification,
  delivery); the final section is a WORK WITH ME contact block
  (primary email CTA + contact page + GitHub).
- `app/layout.tsx` — keywords add "product building" (visible-backed).

### About (restructured, 13 sections)

- `app/about/page.tsx` — restructured around: Identity (the lead answers
  who / what he builds / what he researches / how to work with him), What
  I do, How I work (pipeline), Research (preserved areas + hubs),
  Engineering (evidence), Product building (evidence), Selected systems
  (preserved), Current direction, Academic/research collaboration,
  Business/engineering collaboration, Writing (preserved), Profiles
  (preserved), Contact (email CTA resolved from `lib/links.ts`).
  JSON-LD: `ProfilePage` with `mainEntity` → the existing Person `@id`
  (no duplicated Person).

### Contact (new route)

- `app/contact/page.tsx` — NEW. Primary CTA "Email Parsa Tak"
  (`mailto:Parsaetak@gmail.com`, resolved from `lib/links.ts` — no
  duplicated contact constant); secondary GitHub / LinkedIn; the four
  collaboration types separated (academic/research, business/engineering,
  project collaboration, open technical collaboration); "before writing"
  guidance; no form, no backend. JSON-LD: `WebPage` with `about` →
  Person `@id` + `BreadcrumbList`.

### Research (new route)

- `app/research/page.tsx` — NEW. The research programme: four questions,
  the six topic hubs as the research map (clearly accessible from
  Research), the framework family, the UHIT/AIST/ASI-100 measurement
  programme with public specification links, selected research writing,
  and next steps into contact/work. Not a thin page: every claim links a
  real artifact.

### SEO / entity integration

- `lib/hubs.ts` — `RESEARCH_ROUTE` + `CONTACT_ROUTE` definitions;
  `ABOUT_ROUTE` meta description refreshed.
- `scripts/verify-seo.mjs` — CONTENT_ROUTES adds research + contact and
  expects `ProfilePage` on about; hub/article-count checks explicitly
  exempt about/work/research/contact (non-hubs); home title + phrase
  expectations updated to the v3.2 positioning (pipeline stages, product
  building, email CTA).
- `scripts/build-blog.mjs` — STATIC_CONTENT_ROUTES adds research +
  contact (lastmod 2026-09-15); sitemap now 21 URLs.
- `package.json` — version 3.2.0.

### Docs

- `README.md` — identity line, content documents list, Navigation (v3.2)
  section, SEO section (ProfilePage), author block wording.
- `worklog.md` — v3.2 entry appended.

### Verification

- npm ci / npm run blog / npm run build / npm run lint (0 errors;
  pre-existing img warnings only) / npm run verify — all pass, in both
  plain and GITHUB_ACTIONS=true (basePath /WEB) modes.
- Exported HTML re-inspected: new nav on every surface, no numbered HUD
  labels in any <nav>, ProfilePage/WebPage JSON-LD, exactly one full
  Person node, single mailto site-wide, 21-URL sitemap, no /undefined,
  no localhost, no dead routes, all internal hrefs basePath-correct.


## Release: v3.1 — SEO & Discovery (2026-09-14)

Base commit: `36e60eb` ("2026-09-14 + Next.js 16.3.4"). Mission: move the
site from strong technical SEO to stronger search discovery, topical
authority, semantic structure, and professional identity — without
regressing any v3.0 foundation.

### New routes (8 static content documents)

- `app/about/page.tsx` — `/about/`: the entity/author page. Professional
  positioning, six research areas (each linking its topic hub), selected
  systems, five selected articles, the organisational loop, and real
  public profiles (resolved from `lib/links.ts`). JSON-LD: `WebPage`
  whose `mainEntity` references the site-wide `Person` `@id`, plus
  `BreadcrumbList`. Nothing invented: no employment, awards, or
  credentials.
- `app/work/page.tsx` — `/work/`: the canonical professional portfolio
  document (the `#work` scene remains the interactive experience). Seven
  system entries with what/problem/why/technology/destinations, plus a
  "where to go deeper" cross-link section into every hub. JSON-LD:
  `WebPage` + truthful `ItemList` + `BreadcrumbList`.
- `app/local-ai/page.tsx`, `app/ai-systems/page.tsx`,
  `app/ai-reasoning/page.tsx`, `app/ai-evaluation/page.tsx`,
  `app/software-engineering/page.tsx`, `app/creative-technology/page.tsx`
  — six topic hubs. Every hub: H1 + lead definition, focus areas, the
  systems built in the area (real repositories/specifications), ≥3
  genuinely related articles with stated relationships, cross-hub links,
  and a next exploration path. Thin candidates were skipped, not padded.

### Shared content-route system

- `components/content/ContentShell.tsx` — server-rendered frame: light
  header (13-point star + four plain anchors), breadcrumb, H1 block,
  shared footer. No canvas, no cursor, no reveal observer, no client
  components.
- `components/content/ContentBlocks.tsx` — Section / FocusList /
  ProjectCardList / ArticleCard / LinkCardRow / NextStep building
  blocks. Descriptive anchor text everywhere; no "read more".
- `components/content/HubPageView.tsx` — the shared hub document
  structure, so hubs cannot drift apart structurally.
- `components/content/content.module.css` — built on the existing
  design tokens; same dark surface, red accents, mono kickers.

### Data layer

- `lib/hubs.ts` (new) — single source of truth for the content routes:
  `HUB_ROUTES` definitions, `ARTICLE_PRIMARY_HUB` (article → primary
  hub), `requireHub` (build-time typed lookup), `routeHref` (basePath-
  aware plain-anchor helper), and `contentRouteMetadata` (unique
  title/description, canonical, OG/Twitter, robots per route).
- `lib/seo.tsx` — `HOME_TITLE` evolved to "Parsa Tak — AI Systems,
  Local AI & Software Engineering" (RED MAGIC stays visible as
  content/brand, not a forced title element). `personEntity` jobTitle →
  "Independent AI systems researcher and builder", `knowsAbout` gains
  "AI evaluation". New `AUTHOR_TAGLINE` / `AUTHOR_RESEARCH_LINE`
  constants plus `contentWebPageEntity()` / `contentBreadcrumbEntity()`
  builders that reference the stable `@id` entities (never duplicate
  them).

### Internal-link graph

- `components/SiteFooter.tsx` + `components/SiteDocNav.tsx` (new,
  with `SiteDocNav.module.css`) — the shared footer now carries a
  crawlable "Site / Topics" nav (Home, About, Work, Blog + six hubs),
  so every exported page links the whole content graph.
- `app/blog/[slug]/page.tsx` — every article now renders (1) a
  `TOPIC HUB` chip linking its honest primary hub via
  `ARTICLE_PRIMARY_HUB`, and (2) an author block at the end of the
  body: "By Parsa Tak — Independent AI systems researcher and software
  engineer. Research: AI systems · local AI · reasoning · evaluation ·
  software architecture", linking to `/about/`.
- `app/blog/[slug]/article.module.css` — author-block styles.

### Article title quality (5 frontmatter edits, all faithful)

- `sheytan-the-local-first-laboratory` — title → "SHEYTAN: A Local-First
  AI Agent Laboratory"
- `measuring-machine-intelligence` — subtitle names the UHIT programme
- `reasoning-is-a-system-property` — subtitle names AI Instructions,
  REP, USEF
- `the-anatomy-of-a-fast-static-site` — subtitle states the subject
  ("How this static Next.js site is engineered…")
- `data/blog/posts.json` / `public/sitemap.xml` — regenerated by the
  pipeline (generated files, not hand-edited)

### Sitemap

- `scripts/build-blog.mjs` — `STATIC_CONTENT_ROUTES` list (8 routes with
  content-revision lastmod, never the build date); `sitemapUrlCount`
  updated. Sitemap output: 19 URLs (home + blog + 9 articles + 8
  content routes).

### Verification

- `scripts/verify-seo.mjs` — new `CONTENT_ROUTES` registry and
  `verifyContentGraph()` group: route existence, full metadata per
  route (title/canonical/OG/robots/verification token), expected
  JSON-LD types (`WebPage` + `BreadcrumbList` everywhere, `ItemList` on
  `/work/`), home-document reachability, ≥2 sibling links per route,
  ≥3 related articles per hub, ≥3 inbound pages per route (no orphan
  hubs), trailing-slash hrefs enforced by exact-match reachability.
  `verifySitemap()` now expects the content routes. Home title
  expectation updated. 159 checks pass.

### Documentation

- `README.md` — v3.1 architecture: topic hubs, `/about/`, `/work/`,
  URL-kind distinction (real URL = document, hash = scene state),
  repository structure, SEO additions, Search Console workflow.
- `worklog.md` — durable architectural laws only.

### Validation (v3.1)

`npm install`, `npm run build` (21 static pages), `npm run lint`
(0 errors), `npm run verify` (SEO: 159 checks; brand: 13 checks) —
all green. `out/` inspected: every new route renders one `<h1>`,
unique metadata, correct JSON-LD, footer nav; sitemap contains all 19
production URLs; no basePath regression (basePath 0 locally, `/WEB`
under GITHUB_ACTIONS).

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

## Release: v3.1.1 — CI Reliability & Runtime Hardening (2026-09-14)

Base commit: `bf3d009` ("2026-09-14"). Mission: fix the failing static-export
verification (run 34856727071) at its root cause, make route validation
future-proof, and fix only measured or directly demonstrated runtime
inefficiencies. No architecture change. No visual change.

### CI root cause fix

- Failure: "Sitemap/route mismatch: 19 sitemap URLs for 9 article(s)." The
  workflow's inline `article_count + 2` formula predated the v3.1 content
  hubs and counted nothing but articles, while the sitemap generator
  correctly emitted home + blog index + 8 hubs + 9 articles = 19 URLs.
  verify-seo.mjs's own strict sitemap bijection had already passed — the
  inline block was an obsolete duplicate check.
- `scripts/verify-export-routes.mjs` (new, zero-dependency): replaces the
  inline bash with a three-way bijection — app/**\/page.tsx +
  data/blog/posts.json == exported out/**\/index.html == sitemap <loc> set.
  No hardcoded route counts. Catches: missing/unexpected exports, sitemap
  omissions and duplicates, wrong basePath, localhost/non-production URLs,
  hash/query/_next/feed/deployment URLs, non-indexable exports
  (/404/, /_not-found/ declared explicitly), missing article or hub routes,
  and app routes that never exported. Proven by 16 negative tests (each
  required failure mode) plus the pristine-sandbox pass.
- `.github/workflows/deploy.yml`: "Verify static export output" now runs the
  new validator. Redundant inline checks (robots sitemap directive, RSS
  absence) remain covered by verify-seo.mjs — same or stronger verification,
  one authoritative implementation.

### Runtime hardening (each fix evidence-backed)

- `components/RedMagicAudio.ts`: ensureStarted() fast-path when the graph is
  already running (it previously re-issued ~6 AudioParam automations per
  coalesced pointer-move event); updateAmbient() throttled to ≈11 Hz
  (0.14–0.18 s smoothing constants make per-frame updates inaudible).
- `components/MagicInteractionLayer.tsx`: ripple restart no longer forces a
  synchronous layout with `void ripple.offsetWidth` (per-frame cost on the
  flick path); pooled ripple elements are cached once instead of re-queried
  per trigger; restart timers are tracked and cancelled on unmount; the
  resize handler is rAF-coalesced through scheduleGeometry like scroll.
- `components/RedMagic.tsx`: resize() skips the full canvas reallocation
  (backing store reset, gradient rebuild, particle/grid re-placement) when
  width/height/DPR are unchanged; the per-frame drawParticles options object
  literal is a reused record (no per-frame allocation).
- `components/RedMagicParticles.ts`: color cache key is a packed number —
  the old template-literal string key allocated per drawn particle per
  frame even on cache hits, contradicting the zero-garbage design law.
- `components/WorldBackground.tsx`: ripple-restart setTimeout(16) ids are
  tracked and cancelled on unmount like every other timer in the effect.
- `components/MagicConsole.tsx`: the performance-sample subscription moved
  from MagicConsole state into a MagicVitals leaf component — telemetry
  ticks no longer re-render the MagicInteractionLayer/RedMagic subtree.

### Verification

- npm run lint: 0 errors (18 pre-existing img warnings, unchanged).
- npm run verify: 159 SEO + 13 brand + 11 export-route checks pass.
- CI-mode build (GITHUB_ACTIONS=true, /WEB basePath) passes the same suite.
- Browser stress (Playwright + production-like static server): load, idle
  cadence (22 fps active → 8 fps idle), hidden-tab halt (RAF 61→0→66),
  3000-event pointer storm (0 new registrations, heap stable), 66 scene
  switches + 20 back/forward (heap stable, no duplicate canvases), 20
  resize alternations incl. DPR change (backing store capped at MAX_DPR 2 —
  858×799 for 429 CSS px on a DPR-3 device), all 19 routes (unique titles,
  one h1 each, zero console errors), reduced-motion emulation (RAF fully
  halted, canvas never allocated, content intact), live-listener audit
  after 4 scene cycles (only the current scene's 6 img load/error pairs).
