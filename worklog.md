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

Current version: 2.2.0

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
→ static export verification (blog routes + feed)
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
public/blog/feed.xml

These are committed so a fresh clone builds immediately, but they
are regenerated by scripts/build-blog.mjs on every build.
Never hand-edit generated files.
Never maintain a second manually duplicated index for RSS.

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
hand-edited data/blog/posts.json or public/blog/feed.xml
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

XVII. CURRENT BASELINE

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
- Blog: content pipeline, static routes, RSS feed, SEO/JSON-LD
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
