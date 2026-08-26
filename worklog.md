````md
# Parsa Tak WEB — Project Worklog

## 0. Continuation Rule

This file is the project's persistent handoff document.

Any future AI continuing this project must:

1. Read this entire file before making changes.
2. Inspect the actual current repository before trusting any statement here.
3. Verify the newest GitHub Actions run before declaring the site healthy.
4. Prefer root-cause fixes over patches.
5. When several edits affect one file, provide the complete replacement file in one code block.
6. Keep frontend experience visually strong and technical infrastructure mostly invisible.
7. Never assume a selector, file, component, dependency, or architecture exists without checking it.
8. Update this worklog only after major milestones, not after every small edit.
9. Never rely on an older workflow run when a newer one exists.
10. Preserve GitHub Pages static-export compatibility.

The repository owner usually edits files manually and pushes them. The normal collaboration pattern is:

```text
AI inspects repository
        ↓
AI identifies root cause / next improvement
        ↓
AI gives exact edit
        ↓
Owner edits and pushes
        ↓
AI verifies actual repository
        ↓
AI verifies Actions / deployment
        ↓
AI continues
````

---

# 1. Project Identity

**Website:** [https://parsaetak.github.io/WEB/](https://parsaetak.github.io/WEB/)
**Repository:** [https://github.com/Parsaetak/WEB](https://github.com/Parsaetak/WEB)
**Content repository:** [https://github.com/Parsaetak/Contents](https://github.com/Parsaetak/Contents)

**Owner / Designer:** Parsa Tak
**Project identity:** Parsa Tak / SHEYTAN

The WEB project is a personal interactive website intended to feel like a living digital environment rather than a conventional portfolio.

The site combines:

* identity
* writing
* research
* software
* systems
* RED MAGIC
* projects
* books
* art
* audio
* video
* interactive visual experiences

---

# 2. Core Product Philosophy

The public-facing website should prioritise:

```text
visual design
typography
motion
interaction
meaning
media
entertainment
```

Technical complexity should generally stay in the background.

Visitors should not be unnecessarily exposed to:

* GitHub branches
* commit hashes
* raw repository paths
* implementation details
* internal architecture
* excessive HUD microtext
* redundant labels
* duplicated explanations
* technical loading processes

The site should feel:

* distinctive
* intelligent
* cinematic
* experimental
* polished
* fast
* calm where appropriate
* interactive where useful

---

# 3. Performance Philosophy

Primary rule:

```text
foreground experience first
background work second
heavy work only when needed
```

Desired execution model:

```text
current visible scene
        ↓
render immediately
        ↓
user interaction
        ↓
load only what interaction requires
        ↓
background work during idle time
```

Background work may include:

* dynamic scene loading
* idle scene preloading
* manifest synchronization
* browser caching
* deferred media preparation
* controlled media look-ahead
* adaptive visual quality

Do not move heavy work into the initial critical path unless there is a proven user-experience benefit.

---

# 4. Current Scene Architecture

Current scenes:

```text
1. HOME
2. ABOUT
3. SYSTEMS
4. MAGIC
5. WORK
6. LIBRARY
```

Current `SceneId` values:

```text
home
about
systems
magic
work
library
```

Important files:

```text
components/LivingShell.tsx
components/SceneRegistry.tsx
components/ScenePreloader.tsx
components/SceneUrlSync.tsx
```

`SceneRegistry.tsx` maps each scene ID to its scene component.

`SceneUrlSync.tsx` must accept all six scenes.

Library URL:

```text
#library
```

Home uses the empty hash.

---

# 5. Scene Responsibilities

## HOME

Home is the strongest first impression.

Responsibilities:

* establish identity
* introduce direction
* introduce major ideas
* visually entertain
* remain relatively concise
* provide an atmospheric experience

Important special rule:

**RED MAGIC is intentionally allowed on Home.**

RED MAGIC gives the website character and should not be removed simply because there is a dedicated RED MAGIC scene.

Home should introduce RED MAGIC visually and conceptually.

The dedicated RED MAGIC scene owns the deeper explanation and interactive experience.

Do not make Home reproduce the entire RED MAGIC explanation.

---

## ABOUT

About owns:

* identity
* philosophy
* personal practice
* creative direction
* research/build/write/create relationship

Existing conceptual areas include:

```text
identity
IN PRACTICE
research / build / write / create statement
BASED AROUND
OUTPUT
```

Avoid copying the same paragraph or conceptual explanation into other scenes unless the second usage expresses a genuinely different concept.

---

## SYSTEMS

Systems owns:

* AI Instructions
* REP
* USEF
* system-level intellectual frameworks
* related methodology

Do not reproduce full Systems explanations in Home, About, Work, or RED MAGIC.

---

## RED MAGIC / MAGIC

The dedicated RED MAGIC scene should become the deeper RED MAGIC experience.

It should own:

* RED MAGIC explanation
* deeper principles
* interactive visualisation
* computational experiment concepts
* system behaviour
* future interactive elements
* future explanatory material

Home may retain a RED MAGIC visual/atmospheric presence.

Future goal:

```text
HOME
→ RED MAGIC atmosphere / character

MAGIC
→ complete RED MAGIC experience
```

The user specifically wants RED MAGIC to become more complete now that it has its own page.

---

## WORK

Work owns:

* projects
* selected outputs
* project presentation
* project-specific material

Avoid duplicating Systems or RED MAGIC explanations here.

---

## LIBRARY

Library is a public-facing publishing/media experience.

It should feel like:

```text
digital gallery
+
publishing platform
+
media room
```

It should NOT feel like:

```text
GitHub browser
repository explorer
file manager
```

Library should contain:

* books
* audio
* video
* visual art
* future published media

The technical content system should remain mostly invisible.

---

# 6. Text / Visual Rules

The site previously became weaker because of excessive tiny technical-looking text.

Avoid gratuitous text such as:

```text
01RESEARCHER02WRITER03ARTIST04PROGRAMMER
```

and similar decorative sequences when they do not add real value.

Meaningful small typography is acceptable.

Use small labels only when they:

* communicate useful context
* reinforce hierarchy
* reinforce the design language
* improve navigation
* identify a meaningful section

Do not add tiny text merely because space is available.

---

# 7. No Repeated Concept Rule

The same exact explanation should not appear in multiple scenes.

Ownership model:

```text
ABOUT
→ identity / philosophy

SYSTEMS
→ AI Instructions / REP / USEF

MAGIC
→ RED MAGIC itself

WORK
→ projects

LIBRARY
→ media

HOME
→ introduction / atmosphere
```

A concept may appear on Home as a preview and again in its own scene as a deeper treatment.

It should not be duplicated verbatim.

---

# 8. Legal / Attribution

The project already contains:

```text
LICENSE.md
TRADEMARKS.md
```

Current trademark direction includes:

```text
Parsa Tak™
SHEYTAN™
RED MAGIC™
RED THEORY™
REP™
USEF™
```

Legal presentation is centrally handled rather than repeated throughout scenes.

Do not duplicate legal blocks unnecessarily.

---

# 9. Content Repository

Current public content repository:

```text
Parsaetak/Contents
```

It is intentionally public for the current architecture.

Known branches:

```text
AI-Tests
AI-frameworks
Archive-old-files
Books
Projects
```

Important:

The current manifest is on the `Projects` branch.

Do not accidentally change the manifest branch to `main`.

---

# 10. Library Content Source of Truth

Current manifest:

```text
Contents/library.json
```

Current manifest branch:

```text
Projects
```

This manifest is the editorial source of truth for the Library.

Production build synchronises the manifest into the WEB project.

Desired architecture:

```text
Contents/library.json
        ↓
GitHub Actions
        ↓
download at build time
        ↓
validate
        ↓
WEB/data/library.json
        ↓
static Library catalog
```

Important principle:

**Do not maintain a second manually edited production manifest.**

The local `WEB/data/library.json` is a build-time/generated snapshot.

---

# 11. Current Library Metadata Model

`LibraryMetadata` currently supports:

```text
branch
source
title
type
description
subtitle
year
language
author
series
volume
featured
status
readingTime
tags
cover
```

Current media type values:

```text
book
audio
video
art
```

The site converts the underlying file extension into a `ContentKind`.

Supported file extensions:

```text
.pdf
.mp3
.mp4
.png
.jpg
.jpeg
.webp
.gif
```

Mapping:

```text
PDF     → BOOK
MP3     → AUDIO
MP4     → VIDEO
images  → ART
```

---

# 12. Current Library Books

Current `Books` branch contains:

```text
RED MAGIC.pdf
RED MAGIC 0_ MAGIC FOR KIDS.pdf
RED MAGIC II_ THE BOOK OF THE DEMIURGE.pdf
```

These are currently the principal Library items.

---

# 13. Library UX Rules

The user should experience:

```text
ENTER LIBRARY
      ↓
instant lightweight catalog
      ↓
choose a work
      ↓
see preview
      ↓
explicit READ / LISTEN / WATCH / VIEW
      ↓
load heavy media
```

The Library must NOT automatically:

* open a book
* download a complete PDF
* stream a complete video
* load a full audio file unnecessarily
* load full-resolution media just because the Library tab opened

Selecting a work should only select it and reveal editorial information.

The final media action should load the heavy resource.

---

# 14. Current Library UI

Important file:

```text
components/scenes/LibraryScene.tsx
```

Current behaviour:

* loads the static catalog
* filters by media type
* supports featured items
* allows user selection
* shows an editorial preview
* does not automatically select the first work
* opens heavy media only after explicit action
* uses a modal-style viewer
* closes with Escape
* closes from the modal background
* locks document scrolling while open

Current filter categories:

```text
ALL
BOOKS
AUDIO
VIDEO
ART
```

---

# 15. Content Repository Layer

Important file:

```text
lib/contentRepository.ts
```

Responsibilities:

* provide typed Library metadata
* resolve supported media kinds
* produce `ContentItem`
* produce raw media URLs
* produce GitHub source URLs
* support optional cover URLs
* expose Library content to the scene

`ContentItem` currently includes:

```text
name
path
kind
size
sha
rawUrl
githubUrl
coverUrl?
```

The media source is still GitHub Raw.

---

# 16. Library Cover System

Optional manifest property:

```json
{
  "cover": "covers/red-magic.webp"
}
```

Current `ContentItem` supports:

```ts
coverUrl?: string;
```

No assumption should be made that covers currently exist.

The preferred future design is:

```text
small lightweight cover
        ↓
catalog / preview
        ↓
user clicks READ
        ↓
full PDF
```

The cover should remain lightweight and cacheable.

---

# 17. Library PDF Reader

Important file:

```text
components/LibraryPdfReader.tsx
```

The project does NOT use the npm `pdfjs-dist` package anymore.

Reason:

The npm dependency caused Next.js build integration problems.

The current implementation loads PDF.js in the browser through a remote browser-side import from jsDelivr.

Current URLs:

```text
https://cdn.jsdelivr.net/npm/pdfjs-dist@6.2.108/build/pdf.min.mjs

https://cdn.jsdelivr.net/npm/pdfjs-dist@6.2.108/build/pdf.worker.min.mjs
```

Do not reintroduce the npm dependency unless there is a deliberate architectural reason and current build compatibility has been verified.

---

# 18. Current PDF Loading Architecture

Current intended flow:

```text
user clicks READ
        ↓
LibraryPdfReader loads
        ↓
PDF.js loads in browser
        ↓
PDF document is opened
        ↓
current page is rendered
        ↓
nearby pages are warmed during idle time
```

Current configuration:

```text
disableRange      = false
disableStream     = true
disableAutoFetch  = true
rangeChunkSize    = 256 KiB
```

The intention is:

```text
range loading enabled
automatic document-wide prefetch disabled
explicit page look-ahead controlled by application
```

Current look-ahead:

```text
3 pages ahead
```

Do not render all warmed pages.

Only the current page is rendered into the active canvas.

---

# 19. PDF Reader Loading States

The PDF reader now has an actual opening/loading presentation.

Initial state can display:

```text
LIBRARY / READER

Opening
BOOK TITLE

progress / preparing
```

The reader distinguishes conceptually between:

```text
OPENING BOOK
RENDERING
READY
LOADING NEXT
```

Exact byte percentage may not always be available.

Do not fake exact percentages when PDF.js does not provide meaningful total byte information.

Stage-based messaging is preferable when exact progress is unavailable.

---

# 20. PDF Reader Controls

Current intended controls:

```text
previous page
page input
total pages
next page

zoom out
zoom percentage
zoom in
FIT

reading percentage
background loading state
```

Keyboard navigation:

```text
ArrowLeft
ArrowRight
Home
End
```

Escape is handled by the parent viewer.

---

# 21. PDF Reader Rendering Rules

Current rendering behaviour:

* one active canvas
* current page only
* device pixel ratio capped at 2
* rendering can be cancelled
* previous render is discarded when page changes
* PDF document is destroyed when reader closes
* reader is dynamically loaded from `LibraryScene`

Do not introduce a design that renders every page simultaneously.

Memory must stay controlled.

---

# 22. Progressive PDF Loading Goal

The user's desired model:

```text
show first useful page quickly
        ↓
read
        ↓
load nearby pages in background
        ↓
continue reading
        ↓
jump ahead when requested
        ↓
fetch only what is required
```

Preferred future model:

```text
current page
+
small look-ahead window
+
minimal retained render memory
```

Do not download an entire large book merely because the reader opened.

---

# 23. PDF Range-Request Limitation

Important unresolved verification point:

The application is configured for PDF.js range loading, but **the project has not established via repository/Actions verification alone that GitHub Raw is actually returning effective `206 Partial Content` responses for the specific PDFs.**

Browser DevTools are required for definitive verification.

The correct browser test is:

```text
Network
→ open RED MAGIC.pdf
→ inspect PDF requests
→ check whether Range / Partial Content behaviour occurs
```

Ideal evidence:

```text
206 Partial Content
Content-Range
multiple byte requests
```

A single full:

```text
200 OK
entire PDF
```

would mean the host is not giving us the expected progressive network behaviour.

Do not claim page-by-page network downloading is proven until this has been observed.

---

# 24. Important PDF Concept

A PDF is not normally stored as:

```text
page1.pdf
page2.pdf
page3.pdf
```

Therefore the site does not literally request a page file.

Instead:

```text
PDF.js
→ requests the PDF byte ranges needed
→ resolves the requested page
→ renders that page
```

This is the technically correct interpretation of progressive PDF loading.

---

# 25. Library Future Roadmap

After the current reader is proven stable, the next Library upgrades should be considered in roughly this order:

```text
1. browser-verify range behaviour
2. persistent reading position
3. richer publication metadata presentation
4. lightweight cover / thumbnail system
5. improved reader navigation
6. media-specific viewers
7. additional content types
8. more advanced publishing experience
```

Persistent reading position idea:

```text
RED MAGIC
page 37 / 184
20% read

close

return later
→ Resume from page 37
```

This should use local browser storage rather than a backend.

---

# 26. RED MAGIC Architecture

Important file:

```text
components/RedMagic.tsx
```

RED MAGIC contains a canvas-based visual system.

Current capabilities include:

* requestAnimationFrame
* pointer interaction
* intersection visibility detection
* document visibility detection
* reduced-motion support
* adaptive quality
* multiple visual systems
* simulation-like behaviour

Important performance rule:

```text
RED MAGIC ON HOME
→ atmospheric
→ cheaper
→ subtle
→ blended into background

RED MAGIC TAB
→ full experience
→ richer interaction
→ more complex visualisation
```

The user specifically likes the RED MAGIC visual on Home and wants it preserved.

Do not remove it from Home.

---

# 27. RED MAGIC Visual Direction

The Home RED MAGIC canvas should be:

* cleaner
* lower visual weight
* blended into the page background
* less intrusive
* still recognisably RED MAGIC

The dedicated RED MAGIC scene can afford:

* richer interaction
* more visible simulation
* additional explanations
* advanced controls
* deeper visual systems

Do not put every technical RED MAGIC control on Home.

---

# 28. Cursor

Important file:

```text
components/RedCursor.tsx
```

Current goals:

* custom red cursor
* smooth high-refresh movement
* RAF-driven animation
* trail
* hover reaction
* pointer interaction
* reduced-motion fallback

The user wants the cursor to feel extremely smooth, targeting high-refresh displays including approximately 120 Hz and above.

Important historical issue:

A previous implementation accidentally duplicated cursor runtime logic and caused a build problem.

There must be only one cursor runtime effect.

Preserve the existing SVG visual unless doing a deliberate visual redesign.

---

# 29. Cursor Performance Rule

Preferred model:

```text
pointer event
      ↓
update target position only
      ↓
one RAF loop
      ↓
interpolate / write transform
```

Avoid:

* multiple RAF loops for the same cursor
* unnecessary DOM reads every frame
* layout-triggering properties
* duplicate cursor effects
* repeated event registration

---

# 30. Scene Preloading

Important file:

```text
components/ScenePreloader.tsx
```

Current intent:

* wait for idle time
* respect connection quality
* respect Data Saver
* avoid background work on slow networks
* prioritize next scene
* then previous scene
* yield between work

Desired priority:

```text
1. current scene
2. next scene
3. previous scene
4. heavy media only after user action
```

Never let background preloading dominate the visible experience.

---

# 31. Global CSS

Important file:

```text
app/globals.css
```

Contains:

* global typography
* scene styling
* background
* responsive design
* reduced-motion handling
* cursor styles
* RED MAGIC styles
* Library styles
* PDF reader styles
* legal/footer styles

Past mistake:

An `.about-identity` selector was discussed even though it did not exist in the actual stylesheet.

Rule:

**Never assume a selector exists. Inspect the current CSS first.**

Another past mistake involved damaging formatting in a global CSS edit.

Rule:

When editing major CSS, prefer a complete replacement file if many related changes are involved.

---

# 32. Navigation CSS

Navigation contains six items:

```text
HOME
ABOUT
SYSTEMS
MAGIC
WORK
LIBRARY
```

Important past bug:

The navigation CSS was configured for five columns, which pushed Library out of the main row.

It was corrected to six columns.

If Library becomes inaccessible again, inspect these first:

```text
components/LivingShell.tsx
components/SceneUrlSync.tsx
components/SceneRegistry.tsx
app/globals.css
```

Do not immediately rewrite Library itself.

---

# 33. URL Routing

Important file:

```text
components/SceneUrlSync.tsx
```

Current valid scenes:

```ts
[
  "home",
  "about",
  "systems",
  "magic",
  "work",
  "library"
]
```

A previous bug omitted `library`, making `#library` invalid and redirecting to Home.

If Library navigation breaks, check the valid-scene list before changing LibraryScene.

---

# 34. Next.js / Static Export

The project is deployed using GitHub Pages.

Important principle:

```text
output: "export"
```

The deployment uses:

```text
basePath: "/WEB"
```

The site must remain compatible with static export.

Avoid introducing server-only requirements.

Do not introduce a backend merely to solve a frontend problem unless there is a proven requirement.

---

# 35. GitHub Actions

Workflow:

```text
.github/workflows/deploy.yml
```

Current intended workflow stages:

```text
checkout
↓
restore Next.js cache
↓
setup Node
↓
setup Pages
↓
npm ci
↓
sync Contents/library.json
↓
validate manifest
↓
npm run build
↓
upload Pages artifact
↓
deploy
```

Current action targets:

```text
actions/checkout@v5
actions/cache@v5
actions/setup-node@v5
actions/configure-pages@v6
actions/upload-pages-artifact@v5
actions/deploy-pages@v5
```

These versions were updated after the GitHub Actions Node 20 deprecation warnings.

Do not downgrade without checking current official GitHub documentation.

---

# 36. Library Manifest Build Sync

The production workflow downloads:

```text
https://raw.githubusercontent.com/Parsaetak/Contents/Projects/library.json
```

into:

```text
WEB/data/library.json
```

before building.

The workflow validates:

```text
version
updated
items
branch
source
title
type
```

This allows the public site to have a static Library catalog without making users wait for a runtime manifest request.

---

# 37. Build Caching

The workflow caches:

```text
.next/cache
```

using:

```text
actions/cache@v5
```

and hashes:

```text
package-lock.json
```

The project also uses npm dependency caching through `actions/setup-node`.

The cache was previously missing; this was corrected.

A successful run should restore the Next.js cache.

---

# 38. Package Environment

Current project environment has been observed around:

```text
Next.js 16.3.3
React 19.2.8
React DOM 19.2.8
TypeScript 5.9+
ESLint 10.x
```

Current build command:

```text
npm run build
```

Current lint command:

```text
npm run lint
```

The exact dependency versions must always be verified against the actual current `package.json` before editing.

Do not rely on this section for exact current versions if the project has changed since this worklog was updated.

---

# 39. PDF.js Dependency Rule

Important:

`pdfjs-dist` was removed from npm dependencies.

The reader currently loads browser-side PDF.js dynamically from jsDelivr.

Do not accidentally reinstall:

```text
pdfjs-dist
```

into `package.json` / `package-lock.json`.

A previous attempt to install it caused a Next.js build failure.

The current architecture intentionally keeps PDF.js outside the Next.js application bundle.

---

# 40. Browser-Only Heavy Reader Rule

`LibraryScene.tsx` dynamically loads:

```text
components/LibraryPdfReader.tsx
```

using:

```text
next/dynamic
```

with:

```text
ssr: false
```

This is intentional.

PDF.js should not enter the initial Home or Library catalog critical path.

---

# 41. Media Viewer Rules

Current intended media behaviour:

```text
PDF
→ custom PDF.js reader

MP3
→ native audio element

MP4
→ native video element

image
→ native image element
```

All are loaded only after explicit user action.

---

# 42. Mobile / Responsive Rules

The site must remain usable on:

* desktop
* laptop
* tablet
* mobile

PDF reader controls need to collapse gracefully on small screens.

Do not allow long metadata rows or large controls to overflow.

Avoid introducing fixed widths where responsive layouts are required.

---

# 43. Reduced Motion

The site should respect:

```text
prefers-reduced-motion
```

This applies to:

* cursor
* RED MAGIC
* Library decorative motion
* PDF opening animation
* transitions where appropriate

Do not remove reduced-motion support to gain visual polish.

---

# 44. Verification Protocol

After a substantial modification:

```text
1. inspect repository
2. inspect changed file
3. inspect directly related files
4. run / verify build
5. inspect newest Actions run
6. inspect failed job if needed
7. fix root cause
8. verify new deployment
9. test relevant browser behaviour
10. update worklog only at milestone
```

For Actions failures:

```text
newest run
↓
failed job
↓
failed step
↓
first real compiler/runtime error
↓
source file
↓
root cause
```

Do not debug from an old run when a newer one exists.

---

# 45. Editing Protocol

## Complete-file replacement preferred

When multiple related edits affect the same file, send:

```text
the whole updated file
```

in one TypeScript / CSS / JSON / YAML code block.

This is especially preferred for:

```text
.tsx
.ts
.css
workflows
large configuration files
```

Use small `find → replace` instructions only for genuinely isolated edits.

The repository owner explicitly prefers complete files because it reduces accidental drift and keeps the project cleaner.

---

# 46. Do Not Over-Engineer

The user prefers the website to feel sophisticated while its infrastructure remains mostly invisible.

Do not create unnecessary:

* services
* APIs
* databases
* backends
* abstractions
* configuration layers
* technical UI

when a simpler static/client architecture works.

The current project is intentionally compatible with GitHub Pages.

---

# 47. Current Major Milestones

## Completed

### Site architecture

* six-scene architecture established
* URL-based scene navigation established
* Library route integrated
* scene code splitting established
* scene preloading established

### Visual direction

* excessive repeated tiny text reduced
* scene responsibilities separated
* RED MAGIC retained on Home
* RED MAGIC dedicated scene retained for deeper experience
* cursor performance architecture improved
* RED MAGIC visibility/performance protections retained

### Legal

* LICENSE.md exists
* TRADEMARKS.md exists
* Parsa Tak / SHEYTAN / RED MAGIC / RED THEORY / REP / USEF trademark direction established

### Library

* public Contents repository integrated
* static manifest sync implemented
* manifest validation implemented
* lightweight catalog implemented
* user-driven selection implemented
* heavy media deferred
* publication metadata expanded
* PDF reader implemented
* PDF reader loading state implemented
* PDF progress/navigation implemented
* PDF progressive range architecture implemented
* PDF look-ahead implemented
* PDF reader dynamically loaded
* PDF.js npm dependency removed after build issues
* browser-side PDF.js loading implemented
* Next.js cache implemented

### Deployment

* GitHub Actions Node warning handled
* Pages deployment workflow updated
* Next.js cache implemented
* manifest build sync implemented
* production builds have been successfully restored to green after previous PDF-related failures

---

# 48. Current Known Open Items

These are the most important continuation points.

## HIGH PRIORITY — Library

### A. Verify real PDF network behaviour

Browser verification is still required to establish whether:

```text
raw.githubusercontent.com
```

actually provides effective partial/range requests for the published PDFs.

Do not claim this is proven until observed in browser Network tools.

### B. Persistent reading position

Future goal:

```text
save last page locally
resume later
```

Use local browser storage.

No backend required.

### C. Cover system

Add lightweight cover assets to `Contents` when appropriate.

### D. Improve publication presentation

Expose the newer metadata gracefully:

```text
subtitle
series
volume
language
status
reading time
```

Do not dump all metadata onto the screen.

Use strong visual hierarchy.

---

# 49. RED MAGIC Next Direction

Once Library is stable:

```text
RED MAGIC dedicated scene
        ↓
much richer experience
```

Potential directions:

* deeper explanation
* interactive controls
* more sophisticated visualisation
* clearer simulation model
* visual states
* user-controlled experiments
* structured sections
* better integration of concept + visual system

The dedicated scene can be substantially more complicated than Home.

Home should remain comparatively clean.

---

# 50. Home RED MAGIC Rule

Never remove the Home RED MAGIC simply because the dedicated Magic scene becomes more advanced.

The current intent is:

```text
Home
→ character

Magic
→ depth
```

---

# 51. Quality Bar

Before declaring a milestone complete, check:

```text
FUNCTION
Does it actually work?

UX
Does it feel good?

VISUAL
Does it look intentional?

PERFORMANCE
Does heavy work stay deferred?

ARCHITECTURE
Is the responsibility in the correct scene/component?

MAINTAINABILITY
Is the solution understandable?

DEPLOYMENT
Does production build and deploy cleanly?

CONTENT
Is the user-facing text readable and non-repetitive?
```

A feature is not complete just because TypeScript compiles.

---

# 52. Avoid Past Mistakes

Known mistakes from previous iterations:

### Mistake 1

Changing too many files with scattered edits.

**Correction:** provide complete-file replacements when a file needs multiple related changes.

### Mistake 2

Assuming `.about-identity` existed.

**Correction:** inspect actual CSS first.

### Mistake 3

Navigation configured for five items while six scenes existed.

**Correction:** inspect navigation layout whenever adding a scene.

### Mistake 4

Library route existed in scene architecture but was omitted from URL validation.

**Correction:** verify every integration layer when adding a route.

### Mistake 5

Installing `pdfjs-dist` directly into the Next.js app caused build problems.

**Correction:** current browser-only CDN loading architecture.

### Mistake 6

Calling a PDF solution "page-by-page downloads" without proving range requests.

**Correction:** distinguish:

```text
page-level rendering
```

from:

```text
HTTP byte-range transfer
```

### Mistake 7

Declaring deployment success from an older run.

**Correction:** always verify the newest run.

---

# 53. Preferred Development Style

Work in small verified milestones.

Preferred progression:

```text
inspect
↓
one coherent change
↓
push
↓
verify
↓
continue
```

Do not stack many unverified architectural changes.

For large feature upgrades:

```text
architecture
↓
implementation
↓
build verification
↓
runtime verification
↓
polish
```

---

# 54. Current Continuation Point

The project is currently in the:

```text
LIBRARY / PUBLISHING EXPERIENCE
```

phase.

The Library is already:

```text
reachable
static-catalog based
user-driven
metadata aware
PDF-capable
lazy-loaded
progressive-loading capable
```

The next high-value technical verification is:

```text
browser Network inspection
→ confirm actual PDF range behaviour
```

After that, the next user-facing Library upgrade should be:

```text
persistent reading position
+
better publication metadata presentation
+
lightweight covers
```

After Library reaches a stable milestone, return to:

```text
RED MAGIC dedicated scene
```

and make it substantially richer than its Home representation.

---

# 55. Worklog Update Rule

Update this file only after a meaningful milestone such as:

* a major architecture change
* a new media system
* a new scene capability
* a deployment architecture change
* a major performance milestone
* a completed Library publishing milestone
* a completed RED MAGIC milestone

Do not add a new worklog entry after every tiny CSS fix.

Keep this document detailed enough that another AI can continue the project without conversation history, but do not turn it into a diary.

---

# 56. Last Verified Direction

Current high-level architecture:

```text
                         WEB
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
     Scenes            Systems           Library
        │                                   │
        │                              static catalog
        │                                   │
        │                              user selection
        │                                   │
        │                              editorial preview
        │                                   │
        │                              explicit open
        │                                   │
        │                         ┌─────────┴─────────┐
        │                         │         │         │
        │                        PDF      AUDIO     VIDEO/ART
        │                         │
        │                     PDF.js
        │                         │
        │                  range-capable
        │                  controlled loading
        │
        └── RED MAGIC
              │
          Home atmosphere
              +
          dedicated deeper scene
```

Core rule:

```text
make the website feel simple
while the system underneath remains sophisticated
```

---

# 57. Final Handoff Instruction

When another AI resumes this project, its first action should be:

```text
Inspect current main branch.
Inspect newest commit.
Inspect newest GitHub Actions run.
Read the current files relevant to the requested change.
Compare reality against this worklog.
Only then propose the next change.
```

Never assume this file is newer than the repository.

The repository is the source of truth.

The worklog is the architectural memory.

```
```
