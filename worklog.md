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
Hash-based scene routing.

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
→ source artifact
→ Next.js build
→ Pages artifact
→ GitHub Pages deployment

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
requestAnimationFrame for decorative background motion
layout-triggering properties
continuous getBoundingClientRect calls
per-frame style recalculation
large filter chains
unbounded DOM particle counts

Do not introduce a second canvas solely for the global background.

The dedicated RedMagic.tsx engine already owns the interactive simulation.

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

XV. FORBIDDEN REGRESSIONS

The following are architectural regressions:

duplicate cursor runtime
duplicate dedicated RedMagic canvas
reintroduced cursor glow/shadow filters
per-frame radial-gradient allocation in RedMagic
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
