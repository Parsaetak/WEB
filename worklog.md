# PARSA TAK WEB — TECHNICAL CONSTITUTION

This document is the operational source of truth for future development agents.

The repository is authoritative.
This document defines constraints, architecture, invariants, verification protocol, and extension rules.

Do not infer current implementation from this document alone.
Always inspect the current repository before modifying code.

---

# I. PROJECT IDENTITY

Site:
https://parsaetak.github.io/WEB/

Repository:
https://github.com/Parsaetak/WEB

Content repository:
https://github.com/Parsaetak/Contents

Content branch:
Projects

Primary stack:
Next.js 16
React 19
TypeScript

Deployment:
GitHub Pages

Rendering model:
Static export only

Current scene set:
home
about
systems
magic
work
library

Routing:
Hash-based scene routing for the world shell.

Top-level routed areas:

/ — world shell (six hash scenes)
/blog/ — blog index (static route)
/blog/<slug>/ — article pages (static routes)

Current version: 2.5.0

---

# II. FUNDAMENTAL LAW

## 1. Repository Authority

The current repository state is always more authoritative than:

- this document
- previous conversations
- old commits
- cached assumptions
- previous agent conclusions

Never modify a file based only on remembered structure.

Inspect the actual current file first.

---

## 2. Development Cycle

Every meaningful change follows:

```text
inspect repository
        ↓
inspect newest commit
        ↓
inspect newest Actions run
        ↓
inspect relevant files
        ↓
identify root cause
        ↓
make one coherent change
        ↓
owner applies and pushes
        ↓
verify exact resulting commit
        ↓
verify newest Actions run
        ↓
verify production behavior when applicable
        ↓
continue

Never declare a deployment healthy from an old Actions run.

Never declare a change successful merely because a file was edited.

3. Change Discipline

Prefer small coherent milestones.

Do not stack unrelated changes before verification.

For substantial changes to .tsx, .ts, .css, or .yml:

provide the complete replacement file
preserve unrelated behavior
avoid speculative refactors

For isolated changes:

use precise find/replace guidance

Do not rewrite architecture unless the current architecture has been inspected and a measurable benefit is established.

III. DEPLOYMENT CONSTITUTION
4. Static Export

The site must remain compatible with GitHub Pages.

Required properties:

output: "export"
basePath: "/WEB"

basePath may be conditioned by the deployment environment as implemented by the current configuration.

No backend is permitted.

No required server runtime is permitted.

No new external service may become a runtime dependency without explicit architectural approval.

5. Deployment Pipeline

The deployment workflow is:

checkout
→ Node setup
→ npm ci
→ Pages setup
→ Contents manifest sync
→ manifest validation
→ blog content validation (scripts/build-blog.mjs)
→ Next.js build
→ static export verification (blog routes, sitemap; feed absent)
→ deployment manifest
→ Pages artifact
→ GitHub Pages deployment
→ deployed revision verification

The workflow is defined in:

.github/workflows/deploy.yml

Do not bypass this pipeline for production assumptions.

IV. ARCHITECTURE
6. Global Shell

Primary shell:

components/LivingShell.tsx

Responsibilities:

scene state
hash navigation
scene switching
global background
custom cursor
scene preloading
navigation shell
footer
loading shell

Global background is mounted once from LivingShell.

Custom cursor is mounted once from LivingShell.

Do not duplicate either runtime inside individual scenes.

7. Scene Registry

Primary mapping:

components/SceneRegistry.tsx

Scene synchronization:

components/SceneUrlSync.tsx

Scene preloading:

components/ScenePreloader.tsx

Current scenes:

home
about
systems
magic
work
library

When a new scene is eventually introduced, update all relevant systems consistently:

SceneRegistry.tsx
SceneUrlSync.tsx
LivingShell.tsx
navigation definition
navigation layout
preloader
scene-specific styling

The project will eventually require a more scalable scene registry/navigation architecture.

Do not implement that larger system yet unless the number of scenes or complexity requires it.

7. Blog Routes

The blog is NOT a scene.

It is a real route tree exported statically:

app/blog/layout.tsx
app/blog/page.tsx
app/blog/[slug]/page.tsx

The blog must never be folded into the hash-scene system.
World scenes link to /blog/ through the HUD.
Blog pages link back to /#<scene>.

V. SCENE OWNERSHIP
8. Concept Ownership

Each scene has a defined conceptual domain.

HOME
Introduction, atmosphere, broad orientation.

ABOUT
Identity and personal context.

SYSTEMS
AI Instructions, REP, USEF, reasoning/system frameworks.

MAGIC
RED MAGIC as the primary interactive visual system.

WORK
Projects and created work.

LIBRARY
Media catalogue and reading/listening/viewing experience.

Do not duplicate complete concepts across scenes.

A Home preview may point toward a deeper scene.

Verbatim duplication is forbidden.

VI. RED MAGIC CONSTITUTION
9. Global Red Magic Background

Primary component:

components/WorldBackground.tsx

Purpose:

A fixed ambient Red Magic field spanning the entire site.

It is atmospheric.
It is autonomous.
It must not require a JavaScript animation loop.

The current implementation uses CSS-driven animation with:

large atmospheric red masses
central core
nucleus
rotating elliptical rings
energy wisps
particles
intermittent sparks
fixed global positioning

The global background must remain visually significant but subordinate to foreground content.

Never allow the background to reduce text readability or interaction clarity.

10. Global Background Performance

The global Red Magic background must prefer:

CSS transform
CSS opacity
GPU-compositor-friendly animation
containment
static DOM structure

Avoid:

per-frame React state
layout-triggering properties
continuous getBoundingClientRect calls
per-frame style recalculation
large filter chains
unbounded DOM particle counts

Do not introduce a second canvas solely for the global background.

The dedicated RedMagic.tsx engine already owns the interactive simulation.

10-b. Living Organism Law (v2.1, amended v2.2)

WorldBackground is ONE continuous living system, not a collection of
independent decorations. It is mounted exactly once per route tree
(shell and blog layout) and never remounted for scene changes.

Looped timescales are layered and must remain non-synchronized
(particles/sparks micro loops, wisps short loops, rings medium loops,
aura/masses long loops, core/nucleus heartbeat, event pulse/ripples).
Every element keeps its own duration and phase offset. Long-period
loops (rings, wisps, resonance) additionally carry NEGATIVE
animation-delays so the organism is never phase-synchronized at t=0.

Shared organism state is expressed through:

- root attributes: data-scene (mood), data-quality, data-hidden,
  data-reduced, data-pulse
- shared CSS variables: --organism-energy, --organism-pointer-x/y
- layer-group mood bases: --mood-opacity (v2.2)

The single controller (WorldBackground.tsx + lib/worldSignals.ts):

- writes ONLY custom properties and attributes on its own subtree;
  consumers are transform/opacity-only (compositor-friendly)
- allocates nothing per frame; all mutable state lives once per mount
- runs ONE rAF loop that SELF-SUSPENDS when the organism settles
  (zero JavaScript cost while calm)
- listens passively; pointer movement is coalesced through the loop,
  never processed expensively per event

Energy coupling (v2.2): the rings/wisps/particles/sparks group
wrappers modulate their opacity around the scene's mood base via
--mood-opacity, scaled by shared energy. Scene moods declare the base;
interaction visibly wakes the field as ONE system. Never couple layer
opacity to React state or re-introduce per-element JS writes.

The RESONANCE layer (v2.2) — two energy-scaled heartbeat-echo rings —
is an interaction-tier layer: invisible at rest (opacity derives from
--organism-energy), display:none on data-quality="low" and under
prefers-reduced-motion, paused with the rest of the organism on
hidden tabs. It must not gain elements with unconditioned animation
opacity.

Scene connection happens through data-scene mood selectors — static
attribute CSS, no React state, no per-frame cost.

Lifecycle law:

- hidden tab → data-hidden pauses ALL organism animation and stops
  the controller loop
- prefers-reduced-motion → calmer organism, not dead organism: the
  slowest breathing layers survive at reduced amplitude; particles,
  sparks, ring rotation, wisp flow, interaction layers stop
- quality tiers (data-quality: low/medium/high) trim peripheral
  layers on coarse-pointer, small, or memory-constrained devices;
  the visual identity must survive every tier

Do not feed pointer movement or organism state through React state,
context, or any state-management library; use worldSignals.

Do not add a second organism runtime, a second canvas, or per-scene
background mounts.

VII. INTERACTIVE RED MAGIC
11. Dedicated Engine

Primary component:

components/RedMagic.tsx

The dedicated engine is the primary interactive RED MAGIC simulation.

It currently uses:

Canvas 2D
single animation loop
quality adaptation
particle system
energy flows
membrane deformation
nodes
shockwaves
pointer interaction
mode profiles
telemetry
12. RedMagic Modes

Supported modes:

drift
listen
surge

Default:

listen

The default listen profile must preserve Home compatibility.

Mode changes must not remount the entire engine.

Mode is delivered through stable runtime state/ref mechanisms as implemented by the current engine.

13. RedMagic Quality

Current quality bands:

high
medium
low

Quality adaptation exists to protect frame rate.

Do not remove adaptive quality merely to increase visual density.

Visual additions should preferably increase perceived complexity rather than brute-force particle counts.

13-b. Refresh-Rate-Aware Quality Law (v2.2)

Quality thresholds are RELATIVE to the display the engine measures,
never absolute fps numbers. The engine derives the native refresh rate
from its fastest sustained rAF interval (window minimum, promoted only
when 3% above the current estimate) and applies:

- demote line: max(48, refreshHz * 0.72) — two consecutive bad
  windows required
- promote line: refreshHz * 0.9 — three consecutive clean windows
  required
- hard protection: sustained fps < 50 demotes medium → low
- 3.5 s cooldown between changes

A display running at its native rate must NEVER be demoted for being
below an arbitrary fps number (the 2.1 absolute thresholds punished
60 Hz panels). Telemetry publishes the measured refreshHz and the
console labels vitality relative to it. Claiming a guaranteed frame
rate anywhere in the UI is forbidden — report measurements only.

14. RedMagic Canvas Invariant

There must be exactly one dedicated RED MAGIC canvas instance for the active MAGIC laboratory.

Do not introduce duplicate organism canvases.

The global WorldBackground is not a replacement for this engine.

VIII. CURSOR CONSTITUTION
15. Custom Cursor

Primary component:

components/RedCursor.tsx

There is exactly one cursor runtime.

The cursor must:

follow browser pointer coordinates directly
use no artificial speed multiplier
use no artificial acceleration
use no interpolation
use no trailing simulation
use a single RAF scheduler

The current cursor intentionally follows the browser pointer position 1:1.

Do not reintroduce smoothing merely for visual effect.

16. Cursor Visual Law

The cursor is intentionally crisp.

Forbidden:

drop-shadow
box-shadow halos
feGaussianBlur
glow trails
multi-dot trails
per-frame bloom

The current visual language is:

vector geometry
crisp contour
geometric precision
controlled hover scale

Any future cursor redesign must preserve low paint cost.

IX. PERFORMANCE CONSTITUTION
17. Primary Objective

The site's two highest-level engineering priorities are:

1. Visual quality
2. Runtime performance

They are equal architectural concerns.

Do not improve style by blindly increasing rendering cost.

Do not improve performance by flattening the site's visual identity.

Prefer techniques that improve both simultaneously.

18. Animation

Preferred:

transform
opacity
CSS animations
requestAnimationFrame only where actual simulation is required

Avoid unnecessary animation loops.

A visual system that can be expressed through CSS should generally remain CSS-driven.

A simulation that requires physics/state may use Canvas + RAF.

19. DOM Work

Avoid in hot paths:

React state updates
DOM queries
querySelector loops
getBoundingClientRect
layout reads followed by writes
allocation-heavy object creation
rebuilding selector strings
recreating static arrays

Hoist static values to module scope where useful.

Do not optimize readability into unreasonable fragmentation.

20. High-Hz Pointer Input

Pointer handlers must be lightweight.

For high-polling-rate mice:

store latest input
coalesce rendering through RAF
render once per frame

Do not process expensive visual work on every raw pointer event.

Passive listeners should be used where appropriate.

21. Visibility

Animations that are not visible should stop when practical.

Use:

document.visibilityState
IntersectionObserver

where the component architecture benefits from them.

Do not keep expensive simulations running in hidden tabs or off-screen sections unnecessarily.

22. Reduced Motion

Always respect:

prefers-reduced-motion

This requirement applies to:

cursor
Red Magic
scene transitions
Library motion
PDF opening animation
background animation

Reduced-motion behavior must be intentional, not merely partially disabled.

X. LIBRARY CONSTITUTION
23. Library Manifest

Production manifest source:

Parsaetak/Contents
branch: Projects

The website's build process synchronizes:

data/library.json

Do not point production synchronization at main.

Do not maintain a second manually edited production manifest.

24. Heavy Media

Heavy media must load only after explicit user intent.

Allowed triggers:

READ
LISTEN
WATCH

Forbidden:

automatic full-media loading
automatic PDF opening
automatic full-media prefetch

Static catalog browsing must remain lightweight.

25. Media Delivery

Media is served through the project's current jsDelivr-based content URL system.

Do not revert to raw GitHub delivery unless there is a measured architectural reason.

The existing reader relies on ranged media access.

Preserve byte-efficient progressive loading.

XI. PDF READER CONSTITUTION
26. PDF Engine

Primary component:

components/LibraryPdfReader.tsx

PDF.js must not be added as a local package dependency if the current CDN architecture remains in place.

Specifically:

DO NOT install pdfjs-dist

The current design loads PDF.js in the browser from the configured CDN path.

27. Reader Loading Policy

Current reader invariants:

range loading ON
streaming OFF
autoFetch OFF
rangeChunkSize = 256 KiB

Rendering policy:

single active canvas
cancelable rendering
document destroyed on close
DPR capped at 2

Navigation keeps a limited look-ahead window.

Do not render all thumbnails merely to make the navigation strip appear complete.

The byte budget is intentional.

28. Reader UX

The current reader includes:

persistent reading position
resume state
scrubber
fullscreen
double-click zoom
keyboard navigation
reduced-motion behavior

Persistent position key:

library-reading-position:<rawUrl>

Storage failures must remain non-fatal.

XII. MOBILE CONSTITUTION
29. Mobile Safety

The entire site must remain usable on narrow screens.

Never introduce:

fixed-width overflow
unbreakable content runs
desktop-only navigation assumptions
reader controls wider than viewport
background effects that obscure content

Use responsive reduction rather than simply hiding essential functionality.

Visual density may be reduced on smaller screens.

XIII. CSS CONSTITUTION
30. Global Styling

Primary file:

app/globals.css

Keep the existing visual language:

dark field
red primary accent
high contrast typography
technical/magical atmosphere
precise geometry
restrained effects

Prefer compositor-friendly effects.

Do not add expensive blur/shadow effects merely because they look impressive in isolation.

31. Selector Discipline

Never assume a selector exists.

Before modifying CSS:

inspect the actual TSX
inspect the actual CSS
confirm the class exists
confirm the component using it

Never invent selectors based on remembered versions.

31-b. Motion and Reveal Law (v2.2)

All appearance/disappearance motion flows through ONE vocabulary and
ONE observer system.

Transition tokens live in app/globals.css (:root):

--motion-micro / --motion-short / --motion-medium / --motion-long
--ease-out-soft / --ease-standard
--motion-stagger, --reveal-shift

New UI motion must reference these tokens for its perceptual band;
scattering one-off durations across module CSS is forbidden.
Animation is compositor-only: opacity, transform, visibility,
cheap clip-path. Animating layout properties for reveal purposes is
forbidden.

The reveal system:

- elements opt in with data-reveal ("", "scale", or "instant")
  plus optional data-reveal-order (grid position for stagger)
- components/MotionReveal.tsx owns THE single IntersectionObserver
  per route tree (mounted once from LivingShell and the blog layout);
  it is one-shot, self-draining, and never runs a rAF loop or timers
- a passive MutationObserver in the same controller joins late-
  mounted data-reveal elements (blog filter results) into the same
  observer
- stagger is deterministic: data-reveal-order wins, else batch
  position, capped at 5 steps of --motion-stagger
- the hidden initial state exists ONLY under html.reveal-js, set by
  the pre-paint inline script in app/layout.tsx. Without JavaScript
  nothing is ever hidden — animation is enhancement, never a gate
- prefers-reduced-motion: no travel, minimal crossfade, no delays
- article body HTML on /blog/<slug>/ is NEVER wrapped in the reveal
  gate — readability outranks theatre

Scene transitions: the SceneRegistry transition layer owns the
outgoing fade (data-transitioning); the keyed sceneEnterHost replays
one settle animation per scene mount. The minimum transition timing
(MIN_TRANSITION_MS) is unchanged. Preloaded scenes must still feel
instant.

Do not add Framer Motion or any animation dependency; CSS + the
existing controllers are the architecture. Do not use rAF for fades,
card reveals, or ordinary opacity work — JS animation loops are for
actual simulation only.

XIV. COMPONENT DISCIPLINE
32. Static Data

Static arrays, configuration, constant selectors, and stable definitions should be module-level when appropriate.

Do not recreate them on every render without reason.

33. React Boundaries

Keep client components intentional.

Avoid moving server-safe work into client components unnecessarily.

Maintain serializable boundaries.

Do not add client state for purely presentational constants.

34. Dynamic Imports

Heavy scene/client systems should remain compatible with the existing scene code-splitting strategy.

Use dynamic imports where the current architecture calls for them.

Do not make the entire site a single client bundle.

XIV-B. BLOG CONSTITUTION

37. Blog Content Source

The blog source of truth is:

content/blog/*.md

One markdown file per article, slug derived from the filename.

Generated files:

data/blog/posts.json
public/sitemap.xml

These are committed so a fresh clone builds immediately, but they
are regenerated by scripts/build-blog.mjs on every build.
Never hand-edit generated files.
Never maintain a second manually duplicated index for any artifact.
The blog has NO RSS (removed in v2.5): no feed route, no feed
output, no feed metadata anywhere in the product or pipeline.

38. Blog Content Validation

Every article is validated at build time:

required fields, field types, slug format, date format,
duplicate slugs, cover existence, internal link targets.

A malformed article FAILS the build with the file and reason.
An empty content directory is an explicit empty state, not a failure.

39. Blog Data Access

The single access layer is lib/blog.ts (SERVER SIDE — it imports the
generated data/blog/posts.json).

Client components import from lib/blogFormat.ts exclusively: shared
types plus pure date formatters, zero generated data. A single value
import of lib/blog.ts from a client component would pull every
article body into that page's client bundle — this is a forbidden
regression.

Article metadata reaches client islands as serialized props from
server components; article HTML is rendered into static HTML at build
time.

Search metadata (post.search) is precomputed at build time by
scripts/build-blog.mjs; the client island never re-derives haystacks
per keystroke.

40. Blog SEO

Article pages generate canonical URLs, Open Graph article metadata,
published/modified times, and BlogPosting JSON-LD statically.
Do not add metadata that does not correspond to real content.

40-b. Deterministic Ordering and Edition Dating (v2.2)

Ordering is date-descending with slug-ascending as the tiebreak at
both the generator (scripts/build-blog.mjs) and the access layer
(lib/blog.ts). When all articles share one publication date (the
September 10, 2026 edition), the index order is deterministic and
must never change between builds. Do not introduce a secondary
ordering source (no timestamps, no random, no manual order file).

The 2026 content policy: articles carry date: 2026-09-10 and
updated: 2026-09-10; factual claims about external AI systems are
attributed in the text and separated from analysis and personal
position. Claims about this site must be backed by this repository.

XIV-C. DATA PIPELINE CONSTITUTION

41. Layer Separation

STATIC CONFIG: scene definitions, navigation, site constants
(lib/links.ts, lib/loadPhase.ts, SCENES)

CONTENT DATA: data/library.json, data/blog/posts.json

RUNTIME STATE: React state inside components

Do not mix these layers.

42. Resource Store

lib/resourceStore.ts is the single async resource manager:

request deduplication (in-flight promise sharing)
failure cleanup (rejected entries evicted for retry)
race protection (abort-aware entry dropping)
stale protection (staleAfter re-fetch)
explicit invalidation

Explicit memory policy (v2.1):

- Every entry declares a lifetime class: immutable (default),
  short-lived, or transient. short-lived/transient REQUIRE staleAfter.
- Settled values are bounded by RESOURCE_STORE_MAX_ENTRIES; eviction
  is least-recently-USED, never in-flight.
- Expired short-lived/transient entries are swept lazily on load and
  via sweepResourceStore().
- releaseSettledResources() sheds all retained values for graceful
  degradation under memory pressure; in-flight results still resolve.
- getResourceStoreStats() exposes bounded counters (hits, misses,
  evictions, expiries, depths) for verification — never a public UI
  feature, never networked.

Components must not invent their own fetch/dedup layers.

Static build content that needs no async loading (the Library
manifest) is derived once at module scope instead of passing through
the store; the store exists for genuinely asynchronous or
expirable resources.

43. Cache Policy

IMMUTABLE (default): build-stamped content, content-addressed assets
SHORT-LIVED (staleAfter): remote/derived metadata that may change
  (for example Library media probes, TTL ten minutes)
TRANSIENT (staleAfter): prediction/preload scratch data
SESSION: lightweight navigation state (not the store)
PERSISTENT: reading position and preferences (localStorage)
HEAVY MEDIA: never retained after its viewer is destroyed; only
  metadata about it may be cached, under a TTL

Do not cache data forever when it is expected to change.
Do not disable normal browser caching without reason.

43-b. Background Work Scheduler

lib/backgroundScheduler.ts is the ONE background work queue. Do not
spawn competing idle loops, chained setTimeout queues, or ad-hoc
"schedule when idle" helpers for background work.

- Tasks carry id (deduplicated), priority (USER_NAVIGATION,
  NEAR_TERM, PREDICTIVE, BACKGROUND), and owner.
- The single pump executes at most one task per idle gap, then yields.
- cancelBackgroundTasksByOwner(owner) must be called when the state
  that made speculation useful changes (scene switches, unmount).
- Hidden tab suspends the pump; visibility resumes it.
- save-data / 2G / deviceMemory ≤ 2 drop PREDICTIVE-and-lower tasks
  at enqueue time. Core and user-triggered work is never dropped.
- Scene chunk imports remain owned by ScenePreloader (single import
  site law). Resolved scene modules are cached intentionally: they
  are cheap code, not runtime state.

XIV-D. LOADING ARCHITECTURE CONSTITUTION

44. Load Phases

Loading UI may only expose:

INITIALIZING, LOADING, PREPARING, READY, ERROR

Fake progress percentages are forbidden.
Indeterminate work uses the indeterminate treatment.
Measurable work may add deterministic progress on top of the phase.

45. Priority Ladder

P0 critical: shell, current scene, essential CSS
P1 near-critical: most probable next scene (after first idle)
P2 predictive: adjacent previous scene (after second idle)
P3 background: secondary metadata (nothing schedules this)
P4 user-triggered: PDFs, audio, video — never automatic

Background preloading is bounded (BACKGROUND_PRELOAD_BUDGET),
skips hidden tabs, and respects save-data / 2G.

46. Scene Import Law

ScenePreloader owns the ONLY dynamic import site per scene.
SceneRegistry lazy components resolve through loadSceneModule().

Never add a second import() site for a scene module.
Duplicate scene chunks are an architectural regression.

47. Loader Visibility

The boot loader may block interaction.
The scene-variant overlay never blocks interaction and fades in
only after SCENE_OVERLAY_DELAY_MS, so preloaded scene transitions
never flash a loader.

XV. FORBIDDEN REGRESSIONS

The following are architectural regressions:

duplicate cursor runtime
duplicate dedicated RedMagic canvas
reintroduced cursor glow/shadow filters
per-frame radial-gradient allocation in RedMagic
per-frame allocation anywhere in a steady-state render loop
per-frame color/string allocation in a steady-state render loop
quality adaptation judged against absolute fps instead of the
  measured display refresh rate
a second IntersectionObserver for data-reveal elements
reveal/hidden states applied without the pre-paint reveal-js gate
animating layout properties for reveal or transition purposes
an animation dependency (Framer Motion or similar)
phase-synchronized organism loops (no negative animation-delays)
client components importing lib/blog.ts (article bodies in the bundle)
a second background work queue outside lib/backgroundScheduler.ts
a second WorldBackground runtime or per-scene background mounts
organism state propagated through React state/context
background animation left running in hidden tabs
reduced-motion reduced to a dead background
manual duplicate library manifest
production manifest sourced from Contents/main
automatic heavy media loading
pdfjs-dist dependency
server/backend requirement
broken static export
mobile horizontal overflow
ignoring prefers-reduced-motion
fake loading percentages for media operations
technical infrastructure details exposed in public UI
second dynamic import site for a scene module
hand-edited data/blog/posts.json or public/sitemap.xml
markdown parsing in browser runtime
runtime backend or API route required by the blog
blog folded into the hash-scene system
auto-prefetch of P4 media or heavy routes without intent
XVI. VERIFICATION CONSTITUTION
35. Minimum Verification

After every pushed milestone verify:

1. exact newest commit
2. changed files
3. exact newest Actions run
4. prepare/validation result
5. build result
6. deployment result

When UI behavior is materially changed, also verify the live production site.

36. Do Not Trust Old Runs

Always identify the Actions run by:

head_sha

and verify that it matches the commit being evaluated.

Never use a successful older run to declare a newer commit healthy.

XVI-A. SEO CONSTITUTION
48. Canonical Law

There is exactly one canonical base for the whole site:

https://parsaetak.github.io/WEB/

Absolute, HTTPS, stable, /WEB-aware.

Every indexable route emits exactly one canonical URL:

/ — the world shell
/blog/ — the blog index
/blog/<slug>/ — every article

Hash scenes are interaction states of /, not SEO documents.
A concept that deserves independent indexing gets a real
/blog/<slug>/ route, never an invented hash URL.

Production metadata must never contain localhost, repository,
or alternate-host URLs.

49. Entity Law

lib/seo.tsx owns THE site entity graph.

The Person and WebSite objects are emitted exactly once, in the
root layout, with stable @id anchors. Route-specific structured
data references those @ids and never redefines the entities.

sameAs may contain only real public profile URLs that already
exist in lib/links.ts. Never invent profiles. Contact channels
are not identity profiles.

Every structured-data object must describe something actually
present on the page that emits it.

50. Sitemap Law

The sitemap is generated by scripts/build-blog.mjs from the same
content index that produces the site routes.

Never maintain a separate hand-edited URL list.

lastmod comes from article updated/date fields only — never the
build date. Faking freshness is forbidden.

No hash URLs, filter states, search results, or asset URLs in
the sitemap.

51. Robots Law

robots.txt uses only widely supported directives:

User-agent: *
Allow: /
Sitemap: (absolute production URL)

Do not block CSS, JS, or images. Do not add exotic crawler
directives without a verified purpose.

52. Social Image Law

Every SVG cover in public/blog/images/ requires a 1200×630 PNG
twin at the same path. The build fails when a twin is missing.

The twin path (cover.ogSrc in posts.json) is root-relative and
metadata-only: Next resolves og/twitter image URLs against
metadataBase, so ogSrc must never be basePath-prefixed.

JSON-LD image URLs are explicitly absolute.

53. SEO Verification Law

npm run verify:seo (scripts/verify-seo.mjs) must pass after every
build that changes metadata, routes, or content.

CI runs it on every deploy. It inspects the exported artifacts:
unique titles, descriptions, canonicals, JSON-LD validity,
sitemap/route-set equality, robots, RSS absence (no feed.xml, no
autodiscovery, no references), and the absence of localhost or
/blog/undefined references.

54. SEO Invisibility Law

Technical SEO must not damage human experience.

Forbidden: keyword walls, hidden text, SEO-only visible sections,
fake headings, misleading schema, doorway or duplicate pages.

All metadata is emitted at build time into static HTML. No client
SEO runtime, no measurable hydration or bundle cost.

55. Metadata Merging Law

Next.js shallow-merges metadata per key between layout and page.

A page's alternates object replaces the layout's: any alternates
entry that matters on a specific page must be declared on that page.

A layout title template applies only to DEEPER segments: the
same-segment page must use an absolute title.

56. Interaction Truth Law (2.4)

Every visible affordance must tell the truth.

A control with hover motion, an arrow glyph, or a link shape must
navigate or act. Informational cards carry no hover-lift affordance.

Where a card's summary and destination coincide, the whole card is
ONE link (never a nested <a> inside an <a>): Home system rows,
the Systems AI-INSTRUCTIONS module, the Work RED MAGIC project.

Scoping is done with data attributes (data-linked on Work project
cards, data-article on Systems modules) so CSS affordances exist
only on elements that actually navigate.

Loading/error surfaces may only claim recovery paths that exist:
the ERROR phase suggests a reload because a reload is the real
recovery; no UI may promise a retry control that is not wired.

Every newly-linked card must carry a :focus-visible outline.

57. Text Style Law (2.4)

Short UI text (kickers, buttons, nav labels, status chips,
uppercase metadata, stacked display headings) never ends with a
terminal period.

Full prose sentences keep normal punctuation. Technical values,
versions, and statuses follow their component's intended format.

scripts/verify-seo.mjs enforces the label case on the exported
HTML (uppercase label-style text ending in "." fails verification).

58. Identity Keyword Law (2.4)

SHEYTAN and "Red illuminati" are legitimate identity terms. They
appear exactly once each in site-level keywords; SHEYTAN additionally
appears once in the Person entity description; Red illuminati
additionally appears as one visible tag on the RED MAGIC article.

They must never appear as hidden text, off-screen text, opacity-0
blocks, user-agent-specific content, or repeated keyword stuffing.
Every identity term must correspond to something the site actually
presents or claims (TRADEMARKS.md is the claim source).

XVII. CURRENT BASELINE

Version 2.5.7 — reader comfort (cron QA round 9):

QA FIRST: worklog read, sandbox state verified (tree alive at
v2.5.6, ZIPs byte-identical 8dd2169e… in download/ and public/,
:3000/:3100 healthy), agent-browser pass on the export (badges
5/5, UPDATED chips, card tag toggles, T 2500 → 0, REFERENCED BY
present, heading anchors are real <a.h-anchor> links with ids,
console clean after a QA-method fix: `agent-browser console
--clear` is the working syntax — the buffer is GLOBAL across the
browser session and stale :3000 dev-server HMR logs had survived
a wrong-syntax clear) and the delivery page — baseline stable →
feature round.

- READER TEXT-SIZE CONTROL (articles): a three-step instrument
  (A− / A / A+) docks into the tags row's actions slot beside COPY
  LINK, following the exact ShareLink/CodeCopy imperative island
  laws (no markup without JS — the slot stays empty; no state; no
  hydration mismatch). It writes ONE CSS custom property,
  --reader-scale (steps 0.95 / 1 / 1.1 / 1.2), on the document
  root; article.module.css multiplies .body and h2/h3/h4 sizes by
  it (calc(clamp(…) * var(--reader-scale, 1))) — nothing else
  consumes the variable, so the preference cannot leak outside
  articles. Persists to localStorage under web.reader-text-scale
  (guarded, re-validated integer in range on read); range ends
  disable their buttons instead of looping; reset (A) marks the
  default with [data-active] red; a visually hidden aria-live
  region announces "Text size N%"; coarse pointers get ≥38px hit
  targets; print already hides the whole slot. Cleanup removes the
  listeners, the variable, and the group — a later article
  re-applies the stored step through a fresh mount.
- ENTER-TO-OPEN SEARCH (index): Enter inside the search field
  opens the top visible result — the keyboard twin of clicking the
  first card. It rides the existing "/" keydown handler (still ONE
  listener on the index), reads the visible list through a ref
  (the handler is registered once and cannot close over filter
  state), guards isComposing (IME confirm never navigates) and
  defaultPrevented, and fires only when focus is genuinely in the
  field. An "↵" keycap hint joins "/" in the search wrap (both
  hidden on touch), and the "?" dialog's index rows gain
  "↵ — Open the top result (from search)". Articles keep their own
  row set — T/J/K/?/Esc unchanged.
- Styling details: the actions slot (.tagsActions) now wraps with
  an 8px gap so two instruments share the row honestly on narrow
  screens instead of shrinking the pills; the text-size group is a
  single pill with hairline dividers matching the COPY LINK
  language (mono glyphs, red hover/focus, reduced-motion collapse).
- Docs: README header (2.5.7 "reader comfort") + 2 feature
  bullets; worklog (this entry); package.json → 2.5.7.
- Verified: lint 0 errors (10 pre-existing warnings, none new);
  build ✓ (14 edges / 5 articles, Δ: no changes); verify:seo 48/48
  — 469 hrefs / 96 fragments UNCHANGED (the new instruments are
  buttons and hints, never links — the audited graph is stable);
  feed.xml still absent. Browser QA (export): text-size group
  renders beside COPY LINK, A+ scales body 18 → 19.8px computed,
  A− returns to 18px, preference survives a reload (localStorage
  read back), reset marks default, disabled states at both ends,
  sr-only status present and visually hidden, article header/TOC
  unaffected; minus disables at the 0.95 floor (stored "0"),
  plus disables at the 1.2 ceiling (stored "3"); index "/" →
  type "agent" → Enter lands on the top matching article
  (ai-instructions, 2 ARTICLES shown); Enter with an EMPTY
  query likewise opens the top visible card — the rule is
  deliberately uniform ("Enter opens the top visible result"),
  never a surprise no-op; J/K/T/? regressions clean; 390px:
  no horizontal overflow, slot wraps.

Version 2.5.6 — wayfinding and quiet signals (cron QA round 8):
 — wayfinding and quiet signals (cron QA round 8):

QA FIRST: worklog read, sandbox state verified (tree alive, ZIPs
byte-identical in download/ and public/, :3000/:3100 healthy, live
Pages site still serving the owner's v2.5.4 — 71ec72d — so v2.5.5
remains unshipped upstream), agent-browser pass on the export and
the delivery page (badges, shared hints, header pill jump, dialog,
console clean, no 390px overflow) — baseline stable → feature round.

- UPDATED CHIPS (index cards): a card whose frontmatter `updated`
  date is past its `date` now shows a quiet revision marker in the
  meta row — "↻ Sep 11, 2026" right beside the publication date,
  red glyph at reduced opacity (the inbound badge's voice), muted
  text so the row still reads date-first, title tooltip with the
  long-form date. Two of five cards qualify today. ISO strings
  compare lexically — "later" is a plain `>`; no new data, the
  field has existed in posts.json since v2.4.
- CLICK-TO-FILTER CARD TAGS: the tag pills on index cards stop
  being dead text and join the chip bar's toggle system — clicking
  "architecture" on a card filters the index exactly as if the
  chip had been pressed (same activeTag state, same CLEAR FILTERS
  escape, chip bar and card pills highlight together via
  aria-pressed + data-active). Real buttons: keyboard-reachable,
  focus-visible ring, 26px min-height (an honest target that still
  fits the dense meta row, up from the dead pills' 20px).
- T → BACK TO TOP: the keyboard twin of the visible back-to-top
  control ReadingProgress has rendered since v2.5.2. Handled in
  the ArticleKeys island — no new listener, no new island; the
  smooth scroll collapses to an instant jump under
  prefers-reduced-motion. The neighborless-article early return
  was removed so T works on the newest/oldest articles too (J/K
  already no-op safely on null hrefs). Documented in the "?"
  READER CONSOLE on article routes ("T — Back to top"); the index
  list stays honest (T does nothing there, so it is not listed).
- INBOUND GRAPH Δ (build log): build-blog.mjs now diffs this
  build's reverse-link counts against the posts.json it is about
  to overwrite and prints a per-article ledger — "slug: 2 → 3" —
  or "Δ: no changes" / "Δ: first build". Deterministic (sorted
  slugs, removed articles read N → 0). The inbound badge counts
  ARE the graph's public face; now an edit that moves a cross-link
  announces itself at build time instead of silently shifting UI
  numbers. Proven by tampering the stored graph and rebuilding
  ("reasoning-is-a-system-property: 2 → 3"), then clean rebuild
  ("no changes").
- Docs: README header (2.5.6 "wayfinding and quiet signals") +
  worklog (this entry); package.json → 2.5.6.
- Verified: lint 0 errors (10 pre-existing warnings, none new);
  build ✓ (14 edges / 5 articles, Δ: no changes); verify:seo 48/48
  — 469 hrefs / 96 fragments UNCHANGED (the new instruments are
  buttons and chips, never links — the audited graph is stable);
  feed.xml still absent. Browser QA (export): UPDATED chip renders
  with correct tooltip; card-tag click filters 5 → 1 cards with
  chip bar + pill both active and CLEAR FILTERS visible; clear
  restores 5; T scrolls 2400 → 0 smoothly; T is ignored while
  typing in the search field (isTypingTarget); dialog shows the
  T row on articles only; J/K regression clean; Esc closes;
  390px: no horizontal overflow.

Version 2.5.5 — the graph made visible (cron QA round 7):

QA FIRST: full suite re-run on the restored tree (lint 0 errors /
10 pre-existing warnings, build ✓, verify:seo 48/48, 464 hrefs /
91 fragments) plus an agent-browser pass on the production export —
baseline stable → feature round.

- INBOUND-REFERENCE BADGES: getInboundCounts() in lib/blog.ts derives
  slug → inbound-article-count from the SAME validated linksHere
  graph (no second source of truth). BlogIndex takes an optional
  `inboundRefs` prop (plain data — the island still never imports
  lib/blog.ts) and renders a quiet "↩ N" badge in each card's
  kicker, right-aligned beside the reading time (red glyph, muted
  count, title tooltip, sr-only sentence; absent when the count is
  0 or the data is older than v2.5.4). The article header kicker
  gains an "↩ N" pill — a fragment link to #referenced-by so the
  badge is an instrument, not just a stat: lands below the fixed
  header (scroll-margin-top), hover brightens the hairline, hidden
  in print (the section it points to is print-hidden too — a link
  to a ghost would be a lie). Verify-seo now audits these 5 new
  fragment links like every other.
- SHARED-SIGNAL HINTS ("why related"): scoreRelatedCandidate now
  also returns the strongest concrete overlaps — same project
  first, then shared tags, shared topics, then significant terms
  (insertion order of the deterministic term sets; capped at
  MAX_SHARED_SIGNALS = 3; the category match is deliberately NOT a
  hint, the row already shows the category). Emitted as `shared`
  on scored entries in indexes.related (explicit entries carry []).
  lib/blog.ts validates at runtime (strings only, cap 4). The
  article renders one quiet mono line per related card and row:
  "↔ 2026 · AI-assisted engineering · system" for scored matches,
  "↔ ★ author-curated" for explicit frontmatter picks — provenance
  honestly labeled, plain text, never links. .relatedRowShared
  takes its own full-width flex line so the row grid stays intact.
- BUG FIXED — sr-only was never defined: ShortcutsDialog (v2.5.4)
  and the new badges marked up text as className="sr-only" but the
  utility did not exist anywhere in the project CSS, so
  screen-reader-only text rendered VISIBLY (the header badge
  showed its whole sentence; the dialog duplicated every key name).
  .sr-only is now a real global utility in globals.css (standard
  visually-hidden pattern: 1px, clip-path, out of flow).
- Docs: README header + two new bullets (inbound badges, shared
  hints) + pipeline note; worklog (this entry); package.json →
  2.5.5.
- Verified: lint 0 errors (10 pre-existing warnings, none new);
  build ✓; verify:seo 48/48 — 469 hrefs (+5 header badge fragment
  links) / 96 in-page fragments, all resolved; feed.xml still
  absent. Browser QA (export): badges on all 5 index cards
  (2+3+3+3+3 = 14 edges, matching the build log), header pill
  "↩ 3" on anatomy, click → #referenced-by lands 347px from top
  (below the fixed header), hints render on cards AND rows with
  correct content, dialog key names now properly hidden, sr-only
  computed style position:absolute / 1px, mobile 390px: kicker
  wraps cleanly, badge fits, no horizontal overflow.

Version 2.5.4 — link-graph mirror + keyboard reference (cron QA round 5):

QA FIRST: agent-browser pass on the production export and the
delivery page — no regressions, no overflow, console clean, TOC/
keys/share/related instruments healthy. Baseline stable → feature
round.

- REFERENCED BY (reverse link graph): scripts/build-blog.mjs gains
  buildLinksHere — scans each article's RENDERED body HTML for
  internal /blog/<slug>/ hrefs and inverts the graph into
  indexes.linksHere (dedup, self-links impossible by construction,
  deterministic order = posts array order = date desc/slug asc;
  slugs with zero inbound links are absent). The build logs the
  edge count. lib/blog.ts exposes getLinksHere(slug) with the same
  runtime defense as getRelatedPosts (unknown/self/dupes dropped,
  never rendered). The article page renders a REFERENCED BY section
  (aria-label "Articles that link here") between the related
  cluster and the footer nav: compact rows in the secondary-row
  visual grammar — red ↩ glyph, accent-dotted category label
  (reuses .relatedRowCategory + the li's data-category so the
  v2.5.3 dot rules apply unchanged), bold title, mono reading-time/
  date pushed right — plus one inbound-only signal: a red LEFT
  hairline (2px, 0.22 alpha) that brightens to 0.75 on hover.
  Print-hidden like every navigation block. Current graph: 14
  inbound edges across 5 articles; every article has ≥2 inbound.
- KEYBOARD SHORTCUTS DIALOG: new island
  components/blog/ShortcutsDialog.tsx (+ module CSS), mounted ONCE
  in app/blog/layout.tsx so it serves the index AND every article.
  Pressing "?" opens a native <dialog> ("READER CONSOLE /
  Keyboard shortcuts") listing only the shortcuts that work on the
  current route — usePathname filters: index rows are /, ?, Esc;
  article rows are J, K, ?, Esc — so the dialog never advertises a
  dead key. Progressive enhancement law: without JS there is no
  trigger button and no dialog (the keys don't work without JS
  either; nothing server-rendered). The platform provides focus
  trapping, Escape (cancel → close), and focus restoration;
  backdrop clicks close (event.target === dialog); a CLOSE button
  gives pointer users an explicit target. Entrance animation =
  opacity+transform keyframes on .dialog[open], gated under
  (prefers-reduced-motion: no-preference); ::backdrop fades in the
  same gate. Trigger: fixed 44px pill bottom-left (safe-area aware
  mobile offset), aria-haspopup="dialog" + aria-keyshortcuts="?",
  z-index 1150 (below the native top-layer the dialog lives in,
  above header 1000), print-hidden.
- TYPING GUARD DEDUP: the isTypingTarget predicate moved to
  lib/keyboard.ts; ArticleKeys and ShortcutsDialog import it, and
  BlogIndex's inline copy was replaced by the same import. One
  definition of "the reader is typing" now backs J/K, /, and ?.
- README: pipeline diagram now says "EMIT data/blog/posts.json +
  public/sitemap.xml" — the v2.5 purge had missed one stale
  "+ public/blog/feed.xml" in the Data pipeline section; removed.
  New reading-motion bullets for both 2.5.4 features; version
  header → 2.5.4. package.json → 2.5.4.
- Verified: lint 0 errors (10 pre-existing warnings, none new);
  npm run build ✓; verify:seo 48/48, interaction audit now 464
  hrefs (+8 from linksHere rows) / 91 fragments, feed.xml still
  absent; browser QA on the production export: "?" opens the
  dialog on articles (J/K/?/Esc rows) and the index (//?/Esc rows),
  Escape closes, trigger click opens, backdrop click closes,
  synthetic "?" keydown on the search input does NOT open the
  dialog (typing guard), "/" still focuses search, J still
  navigates (building-under-constraints → ai-instructions),
  REFERENCED BY rows carry 6px accent dots (amber research / teal
  engineering) and the red left hairline, mobile 390px: dialog
  fits (358px < 390), trigger reachable, no overflow. Console
  clean on the static export.

Version 2.5.3 — reading-flow round (cron QA round 4):

QA FIRST: agent-browser pass on the production export and the
delivery page — no regressions, no overflow, share/TOC/related
instruments all healthy, console clean. Baseline stable → feature
round ("reading flow & polish").

- KEYBOARD ARTICLE NAVIGATION: new silent island
  components/blog/ArticleKeys.tsx — J follows the adjacent NEXT
  link, K follows PREVIOUS. The hrefs arrive as props from the page
  (the SAME getAdjacentPosts data the visible nav renders), so the
  island owns zero content logic. Keys are ignored while focus sits
  in an input/textarea/select/contentEditable and with any modifier
  held; navigation goes through the App Router (client-side
  transition, static-export safe). The visible affordance is
  server-rendered <kbd> keycap hints (aria-hidden) inside the
  PREVIOUS/NEXT labels — global kbd styling in globals.css
  (mono chip, quiet border); hints leave the labels entirely on
  hover:none devices and in print.
- COPY-LINK INSTRUMENT: new silent island
  components/blog/ShareLink.tsx + module CSS — the tags row
  reserves a right-hand actions slot (server-rendered
  <span data-article-actions>, layout belongs to
  article.module.css; the tag pill group moved into .tagList so the
  slot never shifts the pills). After hydration the island docks a
  COPY LINK button that copies window.location.href AT CLICK TIME
  (heading hashes included in what gets shared), with the CodeCopy
  feedback vocabulary: COPY LINK → COPIED (green) / FAILED (red),
  one reset timer, data-copied attribute styling. The clipboard
  helper moved from CodeCopy into lib/clipboard.ts and both islands
  share it. No button exists without JS; the whole slot is
  print-hidden; on narrow screens the button spans the row width.
- SEARCH HOTKEY: BlogIndex (already the index island) listens for
  "/" — focus jumps into the search field with scroll-into-view
  (reduced-motion aware behavior choice), Escape inside the field
  clears the query and blurs. Typing-safety identical to ArticleKeys
  (inputs/textarea/select/contentEditable + modifiers ignored). The
  input carries aria-keyshortcuts="/"; a decorative aria-hidden
  keycap chip sits in the search wrap (hover:none devices drop it).
- CATEGORY ACCENT SYSTEM: globals.css gains --cat-systems (brand
  red), --cat-research (amber), --cat-engineering (teal). Applied
  through data-category attributes on index cards, related primary
  cards, related secondary rows, and the article header, with a
  6px currentColor dot ::before the category label everywhere. The
  color is decorative only — the category name is always spelled
  out — and print re-points all three vars at neutral ink. Related
  primary cards additionally gained a hover/focus arrow (mono "→"
  in the top-right corner, opacity+transform only, flattened under
  reduced motion).
- Related-card hover arrow + mobile tags-row layout
  (actions slot drops below the pill group) are part of the same
  round.
- Verified: lint 0 errors (10 pre-existing warnings, none new);
  npm run build ✓; verify:seo 48 checks ✓ (456 hrefs / 91
  fragments); browser QA on the production export: J navigated
  anatomy → reasoning (real keypress), K returned, J correctly
  inert on the newest article (no NEXT), "/" focused the search
  field and typed-query filtered, Escape cleared and restored the
  full list, COPY LINK real-click showed COPIED then auto-reset,
  category dots render amber/red/teal on index cards AND related
  tiers AND the article header, keycap hints server-rendered
  (present in raw HTML, slot empty without JS), mobile 390px: no
  overflow, tags column layout, full-width share button.

Version 2.5.2 — reading-instrument round (cron QA round 3):

QA FIRST: agent-browser pass on the production export and the index —
no functional regressions, no overflow, console clean on a fresh
session (the hydration notices documented earlier appear only on dev
pages). Baseline judged stable → feature round instead of fixes.

- CONTEXT CHIPS + DEEP-LINK FILTERS: every article header renders
  its `project` and `topics` (already in the v2.5 metadata) as real
  pill chips linking into a pre-filtered index
  (/blog/?project=…, /blog/?topic=…) — every chip answers the SEO
  link test (a reader understands where it leads). BlogIndex treats
  the URL as the single source of truth for both dimensions:
  useSyncExternalStore over location.search (server snapshot "",
  so no hydration mismatch; no effect-time setState — lint-clean
  under the react-hooks v6 rules), a custom event wakes the store
  after the island's own replaceState, unknown parameter values are
  ignored (no broken-looking state from stale URLs), active
  dimensions render as removable chips in the result row, and the
  search haystack now also contains project/topics so the box finds
  them too. AND semantics across query/tag/project/topic.
- HEADING ANCHORS: the build pipeline renders a server-side
  class="h-anchor" "#" self-link into every h2–h4 (skipped when the
  heading text itself renders a link — nested <a> is invalid).
  Hidden until heading hover/focus, quietly visible on touch
  (hover:none). Pure build output, zero JS.
- SCROLL-MARGIN FIX: .body h2 and h3 now carry the same
  scroll-margin-top: calc(var(--shell-header) + 30px) that h4
  already had — anchored landings (TOC clicks, "#" links, off-site
  section fragments) clear the fixed header at every level.
- CODE BLOCK INSTRUMENTS: generated fences are wrapped in
  <div class="code-block"> carrying the box styles, the reveal
  attributes (motion CSS is attribute-based — zero globals change)
  and the build-time data-language label (pure-CSS ::after chip).
  A silent CodeCopy island (components/blog/CodeCopy.tsx) adds one
  COPY button per block after hydration: clipboard API + legacy
  execCommand fallback, COPY→COPIED/FAILED text feedback with a
  single reset timer, buttons anchored to the WRAPPER so wide code
  scrolls UNDER the pinned chrome. Without JS: no button, code
  fully readable. Print hides the button; print pre styles target
  wrapper + pre.
- BACK TO TOP: ReadingProgress now also renders a circular
  bottom-right control (46px, 44px + safe-area inset on mobile,
  z-index below the top bar, print-hidden). Visibility is one
  data-visible attribute write inside the EXISTING rAF-coalesced
  tick (no second scroll loop, no React state); click smooth-scrolls
  to top with a prefers-reduced-motion check.
- VERIFY-SEO UPGRADE: the interaction audit now resolves every
  in-page href="#fragment" against the ids of the same document —
  a heading rename that breaks a deep-link fails the build. Fresh
  totals: 456 hrefs audited, 91 in-page fragments resolved, all
  checks pass.
- Verified: lint 0 errors (10 pre-existing warnings, none new);
  npm run build ✓; verify:seo 49 checks ✓; browser QA (production
  export): 10 heading anchors on the flagship article, 3 copy
  buttons with COPIED feedback and auto-reset, 2 language labels
  (empty fences correctly label-less), 5 context chips with correct
  deep-links, ?project=ai-frameworks → 2 articles + removable chip,
  chip clear → /blog/ clean URL + 5 articles, ?topic=verification →
  2 articles, bogus parameter ignored, topic + search combine
  (governance → 1 article — proves the extended haystack), back-to-top
  appears past 12% and returns to 0, mobile 390px: no overflow,
  chips wrap, copy button visible on touch, TOC disclosure present,
  no-JS raw HTML contains the complete article and zero injected
  chrome.

Version 2.5.1 — reading-navigation round (cron QA round 2):

- ARTICLE TOC (components/blog/ArticleToc.tsx + module): both a
  fixed right-rail (≥1280px; left = calc(50% + 446px), width =
  min(220px, 50% − 454px) — always past the 860px content column,
  so overlap is geometrically impossible) and a native <details>
  disclosure below 1280px, fed by the build-time `headings` data
  (no pipeline change). ONE IntersectionObserver scroll-spies the
  active section (rootMargin band −15%/−75%, earliest match wins);
  clicks smooth-scroll via scrollIntoView with a reduced-motion
  check and replaceState hash; anchors stay ordinary <a href="#…">
  so no-JS still navigates. Data-reveal="instant" only (no
  transformed ancestors — the fixed rail must behave literally).
- PRINT STYLESHEET: @media print blocks in globals (paper base),
  WorldBackground (organism off), ReadingProgress (bar off),
  BlogHeader (HUD off), LivingShell (footer off), article.module
  (nav/related/footerNav off; black-on-white body; external link
  URLs surfaced via ::after attr(href)). Content is never hidden —
  only screen chrome.
- Fix found in QA: the inline TOC disclosure was visible on desktop
  alongside the rail — @media (min-width: 1280px) now hides it, so
  exactly one TOC exists per viewport.
- Verified: lint 0 errors; build ✓; verify:seo 48 checks (401 hrefs,
  0 dead — TOC anchors included); browser QA: rail geometry + no
  overlap, scroll-spy tracks sections, click navigates + hash
  updates, mobile disclosure works, print blocks present in the CSS
  bundle (7), console limited to the 4 pre-existing hydration
  notices.

Version 2.5.0 — the RSS-removal / related-content / SEO-link-graph /
reading-motion edition:

RSS REMOVAL (complete, product + pipeline + docs):

- public/blog/feed.xml deleted; scripts/build-blog.mjs no longer
  emits a feed (buildFeed/toRfc822/FEED_URL removed)
- RSS autodiscovery metadata removed from app/blog/layout.tsx and
  app/blog/page.tsx (alternates carry canonical only); the blog
  index's "Prefer a reader?" RSS section removed
- Blog header RSS link removed (BlogHeader.tsx + module CSS)
- scripts/verify-seo.mjs: verifyFeed removed; verifyNoRss added —
  positively verifies NO feed.xml in the export and NO RSS
  reference in any exported artifact; sitemap/robots checked too
- deploy.yml: no feed in pipeline/export expectations; explicit
  failure if public/blog/feed.xml or out/blog/feed.xml appears
- next.config.ts NEXT_PUBLIC_BASE_PATH comment updated (the env
  stays: not-found.tsx still consumes it)
- README/worklog/PUSH-NOTES purged of RSS references; article
  content updated where it described the pipeline ("indexes for
  tags, categories, related posts, and the sitemap")
- Sitemap, canonical URLs, BlogPosting/BreadcrumbList JSON-LD,
  robots, Open Graph all preserved — RSS was the ONLY removal

RELATED CONTENT MODEL (v2.5, deterministic, build-time):

- New optional frontmatter: related: [slugs], project: name,
  topics: [names] — parseable by the existing frontmatter parser,
  validated per record and as a graph (unknown slugs, self-links,
  duplicates fail with file + reason)
- Scoring signals (buildRelated/scoreRelatedCandidate):
  explicit-first, then shared tags ×3 (cap 3), same category ×4,
  same project ×3, shared topics ×2 (cap 3), shared significant
  terms from title/subtitle/excerpt/topics ×1 (cap 4,
  stopword-filtered, plural-folded), recency as bounded ≤1-point
  tie-break that can NEVER qualify a candidate alone
- MAX_RELATED 2 → 6; qualification requires at least one real
  signal (tag/topic/category/project or ≥2 shared terms)
- posts.json v2: indexes.related entries are
  {slug, score, explicit}; records carry project/topics
- lib/blog.ts getRelatedPosts returns RelatedPost {post, score,
  explicit} with runtime defense-in-depth (drops unknown/self/
  duplicate targets)
- Article UI: two tiers — primary cards (explicit or score ≥ 8;
  title + excerpt + category + date + reading time, staggered
  reveal) and compact secondary rows; no recommendation wall

INTERNAL LINK GRAPH (v2.5):

- checkInternalLinks rewritten: validates every body link —
  /blog/<slug>/ existence, optional #fragment against the target's
  real heading ids, /#scene against the KNOWN_SCENES set, https-only
  externals (http:// and localhost fail), protocol-relative and
  repeated-basePath links fail, unknown internal routes fail
- Content edits: REP/USEF anchors in ai-instructions, RED MAGIC
  organism + GitHub Pages docs links in building-under-constraints,
  MDN requestAnimationFrame + Library scene in the anatomy article,
  AI-Instructions constitution link in the living-system article;
  OWASP (genai.owasp.org) and MCP (modelcontextprotocol.io) as
  authoritative external sources
- Anchor-text law: descriptive anchors only; links exist where a
  reader would follow them; no keyword stuffing

READING MOTION SYSTEM (v2.5):

- Build-time choreography: renderMarkdown annotates every top-level
  article block with data-reveal + chunked data-reveal-order
  (restarts at every h2 — heading 0, supporting 1–4 capped);
  variants: heading (shorter travel), quote (lateral settle), code
  (fade + slower opacity ramp), scale (figures), fade (rules)
- MotionReveal: solo batches skip stagger entirely — a paragraph
  entering alone never inherits a grid delay; batch staggering is
  unchanged for cards/tags/grids
- components/ReadingProgress.tsx: 2px fixed bar, transform:scaleX
  only, geometry measured once per layout event (mount/resize/load/
  fonts.ready), rAF-coalesced passive scroll handler reading only
  scrollY; publishes --reading-progress + data-reading on <html>
- WorldBackground reading focus: html[data-reading] pulls
  wisps/sparks/particles to --mood-opacity 0.4 and
  atmosphere/heart opacity down — the organism quiets while the
  article is read; existing 1.6s opacity transitions smooth both
  directions; reduced motion keeps the calm mood
- Figure parallax: CSS scroll-linked animation
  (animation-timeline: view()) on article figure images, ±2.2%
  desktop / ±0.8% ≤760px, via the independent `translate` property
  (composes with reveal transforms); @supports-gated so unsupported
  browsers and reduced motion get static images
- app/blog/template.tsx: one opacity-only 240ms route settle on
  every blog navigation; never delays navigation; disabled under
  reduced motion
- globals.css: new reveal variants + mobile --reveal-shift 9px at
  ≤560px; reduced-motion law unchanged (no travel, 1ms, no delay)
- No-JS/SEO law preserved: hidden states exist only under the
  pre-paint reveal-js class; static HTML always carries the full
  article; zero content depends on animation

Verification (v2.5): npm run lint → 0 errors (10 pre-existing
warnings); npm run build → static export ok (10 pages);
npm run verify:seo → all checks pass, including RSS absence and
341 hrefs audited with zero dead links; sitemap 7 URLs = routes.

Version 2.4.0 — the full regression / UI-cleanup / SEO-hardening
edition:

- Interaction Truth Law (56): Home systems overview block and
  system rows are real links (overview + REP/USEF → #systems,
  AI INSTRUCTIONS → /blog/ai-instructions/); the Systems
  AI-INSTRUCTIONS module is one full-card link; the Work RED MAGIC
  project card links to #magic; About principle panels and Home
  direction stages lost their inert hover affordances; the loading
  ERROR phase no longer claims a nonexistent retry control
  ("RELOAD TO RETRY")
- Text Style Law (57): all stacked display headings and short
  headings lost terminal periods (Home "Research / Build / Repeat",
  Work, Library, Magic, Blog hero, PDF reader fallback); prose
  punctuation untouched
- Link correctness: both "MAGIC laboratory" article links now
  point to /#magic (the actual scene) instead of unrelated articles;
  reasoning-is-a-system-property gained a natural related-article
  link to the living-system article
- Identity Keyword Law (58): SHEYTAN (keywords + Person
  description) and Red illuminati (keywords + one visible RED MAGIC
  article tag) integrated truthfully — visible, single-mention,
  never hidden
- verify-seo.mjs now audits the exported HTML for interaction
  truth (no href="#"/empty href/javascript: URLs; every
  root-relative href resolves against the export, basePath-aware)
  and label punctuation; wired into the same npm run verify:seo
- Articles genuinely edited in this release carry updated:
  2026-09-11 (reasoning-is-a-system-property, why-the-website-
  is-a-living-system); all other article dates unchanged
- Dead code removed: SceneErrorState component + .sceneError CSS
  (never rendered anywhere)
- Scroll-offset fix (found in browser QA): both shells now set
  scroll-padding-top so keyboard-focused / anchor-scrolled
  elements clear the fixed HUD and blog header instead of landing
  beneath them (the blog tag filter was literally unclickable at
  its scroll-in position)

Version 2.3.0 — the technical SEO + AI Instructions edition:

- SEO constitution (XVI-A): canonical system, entity graph
  (Person + WebSite via lib/seo.tsx, emitted once in the root
  layout), route-level structured data that interlocks through
  stable @id anchors (WebPage on /, Blog on /blog/,
  BlogPosting + BreadcrumbList on articles)
- Sitemap + robots generated by the blog pipeline from
  the same content index; sitemap lastmod from real content dates;
  committed like posts.json and regenerated in CI
- Social previews: og:image + twitter:card on every route; SVG
  covers carry validated 1200×630 PNG twins; public/og-default.png
  is the site-level social image
- scripts/verify-seo.mjs (npm run verify:seo): programmatic
  verification of the exported artifacts; wired into deploy.yml
  as a dedicated CI step
- Blog: fifth article (ai-instructions) documenting the AI
  Instructions framework from the canonical source
  Parsaetak/Contents@AI-frameworks/Ai-instructions-Sep2026.md
  (blob SHA f6952faf0bc173408f50b0e46d4f94fb7a34ba36); Systems
  scene links to it; the reasoning article links to it; it links
  back to the systems scene, the blog, and sibling articles
- Home title and Blog index title made explicit and descriptive
  (absolute titles; layout templates apply only to deeper segments)

Version 2.2.0 — the high-refresh smoothness upgrade:

- Refresh-rate-aware adaptive quality (RedMagic.tsx): the engine
  derives the display's native rate from its fastest sustained rAF
  interval; quality thresholds are relative (demote < max(48, hz*0.72)
  after 2 bad windows, promote > hz*0.9 after 3 clean windows, 3.5 s
  cooldown). Replaced the 2.1 absolute thresholds that punished
  60 Hz panels. Telemetry publishes measured refreshHz; the console
  labels vitality relative to it (MagicConsole.tsx)
- Zero steady-state allocation in the particle loop
  (RedMagicParticles.ts): bounded quantized hsl() color-string cache
  replaces per-particle-per-frame string building
- Site-wide motion vocabulary (app/globals.css :root): motion tokens
  (micro/short/medium/long + easings + stagger unit) as CSS custom
  properties
- Reveal system: components/MotionReveal.tsx owns THE single
  IntersectionObserver per route tree (one-shot, self-draining,
  deterministic stagger via data-reveal-order); a passive
  MutationObserver joins late-mounted reveal elements. Hidden state
  gated by a pre-paint reveal-js class (app/layout.tsx) so no-JS
  never hides content. Applied to blog hero/featured/cards, article
  header/cover/tags/nav/related; article body HTML stays ungated
- Scene transition motion: keyed scene-enter settle animation in
  SceneRegistry (transform/opacity only, reduced-motion aware) on top
  of the existing outgoing fade
- Living organism evolution (WorldBackground): long-period loops carry
  negative animation-delays (no t=0 phase sync); energy coupling
  modulates rings/wisps/particles/sparks around scene mood bases via
  --mood-opacity; new RESONANCE layer (two energy-scaled heartbeat
  echo rings, hidden on low quality / reduced motion, paused on hidden
  tabs)
- Blog 2026 edition: all four articles rewritten around AI + Will +
  Systems; date/updated 2026-09-10; ordering stays deterministic via
  the existing slug-ascending tiebreak; factual 2026 AI claims
  attributed in text and separated from analysis/position

Version 2.1.0 — memory lifecycle, pipeline throughput, loading
orchestration, and the living organism upgrade:

- Resource store memory policy: lifetime classes (immutable /
  short-lived / transient), TTL expiry, LRU bounding, eviction,
  releaseSettledResources(), bounded telemetry counters
  (lib/resourceStore.ts)
- Library manifest normalization moved to module scope (one pass,
  no promise machinery)
- Blog client boundary: lib/blogFormat.ts (client-safe) vs
  lib/blog.ts (server-only). Article bodies no longer ship in ANY
  client chunk. Search haystacks precomputed at build time.
  Measured: blog index JS 185.5 → 179.7 KB gzip; static export
  2059.8 → 1895.9 KB (article data no longer duplicated into six
  page bundles)
- Unified background scheduler (lib/backgroundScheduler.ts):
  single idle pump, priority/dedup/owner-cancellation, hidden-tab
  suspension, save-data/2G/memory-aware speculative gating
- Scene prediction: deterministic frequency heuristic over bounded
  transition history, hit/miss counters, speculation yields to user
  intent (ScenePreloader v3)
- RedMagic: nucleus radial gradient cached once per mount (per-frame
  createRadialGradient eliminated); canvas backing store released on
  unmount; MagicInteractionLayer leave-timer cleaned up
- Living organism: worldSignals module store; self-suspending
  controller writing CSS variables/attributes only; layered looped
  timescales; scene moods via data-scene; click ripples (pooled);
  transition pulse; hidden-tab suspension; reduced-motion calm-not-
  dead tiers; data-quality perceptual scaling
- SceneUrlSync listeners registered once per mount (ref-stable)

Version 2.0.0 — performance architecture, data pipeline, and blog upgrade:

- Scene chunk deduplication: single import site per scene
  (deployed JS reduced from 27 chunks / 968 KB to 18 chunks / ~709 KB;
  scene navigation downloads each scene chunk once, not twice)
- Loading architecture: phase vocabulary + priority ladder + delayed
  scene overlay (lib/loadPhase.ts)
- Resource store with dedup/failure cleanup (lib/resourceStore.ts)
- Blog: content pipeline, static routes, SEO/JSON-LD
- Data access layers: lib/blog.ts + contentRepository validation
- ESLint toolchain repaired (eslint 9.x aligned with
  eslint-config-next 16.3.3; react version pinned in config)
- not-found redirect fixed to stay inside the deployment basePath

Current verified progression:

Cursor direct-follow:
711f4ec5de3bbb00e28daf38bda60a40839cd85a

Cursor state optimization:
68711fa7fbf99f8d3bf91cf27dc1d1dc47b75438

Global Red Magic background:
a7c850b66c110c33f22338ea18caa528359f3b94

Latest verified background deployment:

workflow:
Deploy Next.js site to GitHub Pages

run:
313

head:
a7c850b66c110c33f22338ea18caa528359f3b94

result:
success

Latest Pages deployment associated with that commit:

run:
329

result:
success
XVIII. FUTURE EXTENSION LAW

The site will eventually contain more scenes/tabs.

The current six-scene model is acceptable for the present stage.

Do not prematurely replace it with a large navigation framework.

When scene count begins making the current architecture difficult to reason about, introduce a centralized declarative system for:

scene identity
navigation metadata
routing validity
preloading priority
scene ownership
accessibility metadata

That system should become the single source of truth.

Until that threshold is reached:

do not add architectural complexity merely because future growth is possible.
XIX. DOCUMENT MAINTENANCE

This document is constitutional, not a diary.

Do not record:

every small CSS tweak
every temporary bug
every conversation
old implementation details that no longer constrain the system
repeated explanations
subjective commentary

Update this document only when a change creates or modifies a durable engineering invariant, architectural rule, or future-development constraint.

Completed history belongs in git.

The repository contains implementation.
This document contains law.

XX. FINAL AGENT RULE

Before changing anything:

READ THE CURRENT CODE.
READ THE CURRENT ARCHITECTURE.
VERIFY THE CURRENT DEPLOYMENT STATE.
THEN CHANGE ONE THING.
THEN VERIFY IT.

Never optimize an imagined version of the site.

Never preserve a historical implementation merely because it appears in this document.

Prefer the smallest architecture that can support the current experience.

Preserve the site's identity.

Preserve its performance.

Preserve its ability to evolve.
