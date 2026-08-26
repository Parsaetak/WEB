Create `WEB/worklog.md` with the following complete content:

````md
# Parsa Tak WEB — Project Worklog

## Project

**Website:** https://parsaetak.github.io/WEB/  
**Repository:** https://github.com/Parsaetak/WEB  
**Content repository:** https://github.com/Parsaetak/Contents

**Owner / Designer:** Parsa Tak  
**Project identity:** Parsa Tak / SHEYTAN  
**Current date:** 2026-08-26

---

# 1. Project Purpose

The WEB project is a personal interactive website for Parsa Tak.

The site should feel like a living digital environment rather than a conventional portfolio.

Primary goals:

- Present Parsa Tak's identity, ideas, systems, projects, and media.
- Make the website visually distinctive and entertaining.
- Keep technical infrastructure mostly invisible to visitors.
- Prioritise smooth interaction, fast foreground rendering, and deferred background work.
- Allow the site to evolve continuously as new projects and media are created.
- Support a growing personal media library backed by the public `Contents` repository.

---

# 2. Core UX Principle

## Front-end

The user should primarily experience:

- visual design
- typography
- motion
- interaction
- books
- art
- audio
- video
- projects
- ideas

The visitor should NOT be exposed unnecessarily to:

- GitHub branches
- SHA values
- raw repository paths
- implementation details
- technical loading systems
- internal architecture
- unnecessary HUD-like micro labels
- duplicated explanatory text

## Background

Technical work should happen invisibly whenever possible:

- scene code splitting
- dynamic imports
- idle preloading
- media discovery
- manifest loading
- animation throttling
- visibility detection
- caching
- deferred media loading

The foreground should remain the highest priority.

---

# 3. Current Scene Architecture

Current scenes:

1. Home
2. About
3. Systems
4. RED Magic
5. Work
6. Library

Scene ID type currently contains:

- `home`
- `about`
- `systems`
- `magic`
- `work`
- `library`

Scene navigation is defined in:

`components/LivingShell.tsx`

Scene implementation mapping is defined in:

`components/SceneRegistry.tsx`

Scene preloading is handled by:

`components/ScenePreloader.tsx`

---

# 4. Current Scene Responsibilities

## Home

Purpose:

- establish identity
- establish overall direction
- provide the strongest first impression
- introduce major ideas without excessive explanation
- retain RED MAGIC as a distinctive part of the Home experience

Important:

RED MAGIC is intentionally allowed on Home because it gives the website character.

Do not remove RED MAGIC from Home merely because a dedicated RED MAGIC scene exists.

Home should introduce and express the concept.

The dedicated RED MAGIC scene should contain the deeper explanation.

---

## About

Purpose:

- explain who Parsa Tak is
- explain working philosophy
- explain practice and creative direction

Current conceptual structure includes:

- identity
- IN PRACTICE
- statement about researching, building, writing and creating
- BASED AROUND
- OUTPUT

Avoid repeating the same exact explanation elsewhere unless another scene presents a genuinely different concept.

---

## Systems

Purpose:

- contain the technical/intellectual systems
- AI Instructions
- REP
- USEF

Do not duplicate these detailed frameworks in Home or unrelated scenes.

---

## RED Magic

Purpose:

- own the deeper RED MAGIC concept
- explain the living computational experiment
- contain its principles and long-term direction

Home may reference and visually express RED MAGIC, but the dedicated scene owns the detailed explanation.

---

## Work

Purpose:

- projects and completed work
- selected outputs
- project presentation

Avoid duplicating Systems, RED MAGIC, or About content here.

---

## Library

Purpose:

- public-facing media experience
- books
- audio
- video
- visual art
- future published media

The Library should feel like a media gallery / publishing surface.

It should NOT feel like a GitHub repository browser.

---

# 5. Legal / Attribution

The project already contains:

`LICENSE.md`

and:

`TRADEMARKS.md`

Current trademark direction includes:

- Parsa Tak™
- SHEYTAN™
- RED MAGIC™
- RED THEORY™
- REP™
- USEF™

Global legal presentation is handled through `LivingShell.tsx`.

Do not recreate or duplicate legal text unnecessarily throughout scenes.

---

# 6. Content Repository

Current public content repository:

`Parsaetak/Contents`

The repository is intentionally kept public for the current architecture.

Current branches:

- `AI-Tests`
- `AI-frameworks`
- `Archive-old-files`
- `Books`
- `Projects`

The repository default branch is currently:

`Projects`

This is important when constructing direct manifest URLs.

---

# 7. Library Architecture

The Library does NOT download complete media when the Library scene opens.

Current intended flow:

```text
Enter Library
      ↓
load lightweight library.json
      ↓
show catalogue / preview
      ↓
user selects a work
      ↓
show editorial preview
      ↓
user explicitly opens work
      ↓
load full media
````

Heavy media must remain deferred.

---

# 8. Supported Media

Current supported media types:

* `.pdf`
* `.mp3`
* `.mp4`
* `.png`
* `.jpg`
* `.jpeg`
* `.webp`
* `.gif`

Mapping:

* PDF → BOOK
* MP3 → AUDIO
* MP4 → VIDEO
* image formats → ART

---

# 9. Current Contents / Books

The current `Books` branch contains three PDFs:

* `RED MAGIC.pdf`
* `RED MAGIC 0_ MAGIC FOR KIDS.pdf`
* `RED MAGIC II_ THE BOOK OF THE DEMIURGE.pdf`

The books are currently the main media available to the Library.

---

# 10. Library Manifest

Current manifest:

`Contents/library.json`

Current manifest location:

`Projects` branch

The manifest is the editorial source of truth for public Library presentation.

Current metadata model includes:

* `branch`
* `source`
* `title`
* `type`
* `description`
* `year`
* `featured`
* `author`
* `tags`
* `cover`

The site should use manifest metadata for presentation instead of generating descriptions from filenames.

---

# 11. Content Reader

Current file:

`lib/contentRepository.ts`

Responsibilities:

* load `library.json`
* validate manifest structure
* convert manifest records into `ContentItem`
* construct raw GitHub media URLs
* construct GitHub source URLs
* determine media type
* support optional cover URLs

The current manifest URL points to:

```text
https://raw.githubusercontent.com/Parsaetak/Contents/Projects/library.json
```

Do NOT accidentally change this to `main`.

---

# 12. Library UX

Library should be:

* visually rich
* calm
* cinematic
* easy to browse
* media-first
* low on technical information

Users should mainly see:

* artwork / covers
* title
* short description
* author
* year
* tags
* featured status
* action such as READ / LISTEN / WATCH / VIEW

Technical repository information should stay hidden unless explicitly exposed later.

Do not prominently display:

* branch names
* file hashes
* GitHub paths
* raw file names
* unnecessary file sizes
* internal loading architecture

---

# 13. Library Loading Philosophy

Current design requirement:

Entering Library must NOT immediately load:

* full PDFs
* full MP3s
* full MP4s
* full-resolution images

Selecting a work must NOT automatically open it.

The current desired interaction is:

```text
SELECT
  ↓
PREVIEW
  ↓
READ / LISTEN / WATCH / VIEW
  ↓
FULL MEDIA
```

Only the final action should create the heavy media element.

---

# 14. Library Viewer

Current full-media viewer supports:

## PDF

Embedded PDF viewer through an iframe.

## MP3

Native audio element.

## MP4

Native video element.

## Images

Native image display.

The viewer uses a modal-style full-screen presentation.

`Escape` closes the viewer.

Clicking outside the modal content can close it.

The document body is locked while the viewer is open.

---

# 15. Library Visual Direction

The Library is evolving from:

```text
technical catalog
```

toward:

```text
digital gallery / publishing platform
```

The desired visual hierarchy is:

```text
visual
  ↓
title
  ↓
meaning
  ↓
action
  ↓
technical source
```

not:

```text
technical metadata
  ↓
filename
  ↓
repository information
  ↓
media
```

---

# 16. Cover / Thumbnail System

`LibraryMetadata` already supports:

```ts
cover?: string;
```

and `ContentItem` supports:

```ts
coverUrl?: string;
```

The next intended evolution is to add small cover/thumbnail assets to `Contents`.

Example:

```json
{
  "cover": "covers/red-magic.webp"
}
```

The cover should be lightweight.

The full media must remain deferred.

Preferred architecture:

```text
small cover
    ↓
Library preview
    ↓
user clicks READ
    ↓
large PDF
```

---

# 17. Performance Architecture

The project currently uses Next.js dynamic scene imports.

`SceneRegistry.tsx` uses `next/dynamic` for scenes:

* Home
* About
* Systems
* RED Magic
* Work
* Library

This keeps scene code split.

---

# 18. Scene Preloading

Current file:

`components/ScenePreloader.tsx`

The preloader now:

* waits for browser idle time
* checks connection quality
* avoids background preload when Data Saver is enabled
* avoids preload on slow 2G / 2G
* preloads the next scene first
* yields
* then preloads the previous scene

Desired priority:

```text
Priority 1
current scene

Priority 2
next scene

Priority 3
previous scene

Priority 4
heavy media
only after explicit user action
```

The foreground must always win over background work.

---

# 19. RED MAGIC Performance

`RedMagic.tsx` contains a canvas-based simulation/visual system.

Current implementation already uses:

* `requestAnimationFrame`
* intersection detection
* document visibility detection
* reduced-motion detection
* adaptive quality
* pointer interaction

It stops rendering when the visual is not meaningfully visible.

Do not remove these protections.

---

# 20. Cursor

Current cursor file:

`components/RedCursor.tsx`

Current design goals:

* smooth custom cursor
* high-refresh compatibility
* RAF-driven position updates
* smooth tracking
* visual trail
* hover reaction
* reduced-motion fallback

Current cursor optimisation changed direct pointer transform writes into a RAF-driven animation path.

Current target is very smooth operation on high-refresh displays.

Do not duplicate cursor effects.

There must be only one runtime cursor effect.

The cursor's SVG visual design should be preserved unless a deliberate visual redesign is being made.

---

# 21. Important Cursor History

A previous mistake caused two cursor effects to be inserted into `RedCursor.tsx`.

This resulted in a build failure.

The corrected version contains:

```text
mount effect
      ↓
one RAF-driven cursor effect
      ↓
existing SVG / cursor visual
```

There must never again be duplicated legacy cursor runtime logic.

---

# 22. Global CSS

Main stylesheet:

`app/globals.css`

The project already contains:

* global typography
* scene styling
* background system
* cursor styling
* RED MAGIC styling
* Library styling
* responsive rules
* reduced-motion rules
* legal/footer styling

Avoid assuming a selector exists before checking the current file.

Past mistake:

`.about-identity`

was discussed even though it did not exist.

Rule:

Always inspect the current file before giving replacement instructions.

---

# 23. Visual Design Rules

The site should avoid:

* unnecessary tiny labels
* repeated numbers
* excessive HUD styling
* repeated statements
* overly dense information
* decorative technical text with no user value

Meaningful small typography is allowed.

Technical-looking labels should exist only when they reinforce the visual language or communicate useful context.

---

# 24. Text Repetition Rule

Do not repeat the same conceptual text across scenes.

Each scene should own its subject.

Example:

```text
About
→ identity and philosophy

Systems
→ AI Instructions / REP / USEF

RED Magic
→ living computational experiment

Work
→ projects

Library
→ media
```

Home can preview these ideas, but should not reproduce their complete explanations.

RED MAGIC is specifically allowed to remain prominent on Home because it gives the site character.

---

# 25. Navigation

Current navigation contains six scenes:

```text
HOME
ABOUT
SYSTEMS
MAGIC
WORK
LIBRARY
```

Navigation state is synchronized to URL hash.

Examples:

```text
#about
#systems
#magic
#work
#library
```

Home uses the empty hash.

---

# 26. GitHub Pages Deployment

Deployment workflow:

`.github/workflows/deploy.yml`

Current action versions were upgraded after GitHub's Node 20 deprecation warning.

Current target versions:

```yaml
actions/checkout@v5
actions/setup-node@v5
actions/configure-pages@v6
actions/upload-pages-artifact@v4
actions/deploy-pages@v5
```

Do not downgrade these without checking current GitHub documentation.

---

# 27. Next.js Static Export

Current configuration is designed for GitHub Pages static export.

Relevant configuration:

```ts
output: "export"
```

with:

```text
basePath: "/WEB"
```

when deployed through GitHub Actions.

The site must remain compatible with GitHub Pages.

---

# 28. Package Environment

Current package environment includes:

```text
Next.js 16.3.3
React 19.2.8
React DOM 19.2.8
TypeScript 5.9+
ESLint 10
```

Current project build command:

```text
npm run build
```

Current lint command:

```text
npm run lint
```

---

# 29. Verification Protocol

After every substantial change:

1. Inspect the current repository state.
2. Verify the exact modified file(s).
3. Check related files for integration errors.
4. Check GitHub Actions.
5. Fix actual errors rather than guessing.
6. Push.
7. Verify the new deployment.
8. Update this worklog.

For deployment failures:

* inspect the newest workflow run
* inspect the actual failed job
* inspect the first real compiler/runtime error
* trace it to the source file
* fix the root cause
* verify again

Never rely on an older run when a newer run exists.

---

# 30. Editing Protocol

For future project work:

### Whole-file replacement

When multiple edits are required in the same file, provide the **complete updated file in one code block**.

Preferred for:

* `.tsx`
* `.ts`
* major `.css` changes
* workflows with multiple related modifications
* large configuration updates

### Exact replacements

Use small `from → to` instructions only when the change is isolated and genuinely simpler.

The project owner explicitly prefers complete files when there are many edits in the same file because this keeps the repository cleaner and reduces editing mistakes.

---

# 31. Git Workflow

The typical workflow is:

```text
Assistant checks repository
        ↓
Assistant gives exact change
        ↓
User edits locally / in GitHub
        ↓
User pushes
        ↓
Assistant checks actual repository
        ↓
Assistant verifies Actions
        ↓
Assistant continues
```

The user commonly performs the actual file replacement and push.

Never claim a file was changed remotely unless the repository confirms it.

---

# 32. Current Known Direction

The website is moving toward:

```text
TECHNICAL ENGINE
        ↓
mostly invisible
        ↓
FAST FOREGROUND
        ↓
VISUAL EXPERIENCE
        ↓
MEDIA
        ↓
INTERACTION
```

Heavy work should be divided into chunks and executed in the background where possible.

Examples:

```text
scene code
→ dynamic chunk

next scene
→ idle preload

previous scene
→ later idle preload

cover image
→ lightweight lazy asset

full book
→ explicit user action

full video
→ explicit user action

full audio
→ explicit user action
```

---

# 33. Current Library Long-Term Plan

Target architecture:

```text
                 CONTENTS
                    │
              library.json
                    │
                    ▼
                WEB LIBRARY
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
      visual      metadata     filters
      preview
        │
        ▼
   user chooses
        │
        ▼
   editorial view
        │
        ▼
 READ / WATCH / LISTEN / VIEW
        │
        ▼
     full media
```

Future enhancements:

* real book covers
* artwork thumbnails
* video poster images
* better audio visualisation
* immersive PDF reader
* book page navigation
* progress persistence
* shareable work URLs
* featured works
* curated collections
* richer publication metadata
* optional source/details panel
* media search
* favourites / recently opened works
* accessibility improvements

---

# 34. Performance Roadmap

Next performance areas to investigate:

1. Font loading
2. CSS animation cost
3. RED MAGIC canvas adaptive quality
4. Cover/image loading
5. Library catalog caching
6. Scene transition cost
7. Initial JavaScript payload
8. unnecessary client components
9. long-running background loops
10. mobile performance
11. high-refresh cursor performance
12. memory usage during media viewing

Prioritise measurable improvements over speculative optimisation.

---

# 35. UX Roadmap

The next visual evolution should focus on:

* stronger media presentation
* actual covers
* more elegant Library browsing
* better typography hierarchy
* richer hover interactions
* subtle transitions
* responsive mobile layouts
* immersive readers
* less technical presentation
* stronger emotional/visual impact

The site should remain sophisticated rather than becoming cluttered.

---

# 36. Current Important Decisions

These decisions are intentional:

### RED MAGIC remains on Home

Do not remove it merely because a RED MAGIC scene exists.

### Contents remains public

This simplifies direct public media delivery.

### Library is lazy

Do not load full media on entering Library.

### Manifest is the editorial source

`Contents/library.json` controls public Library metadata.

### Technical details stay backstage

The user experience should not resemble GitHub.

### Dynamic scene imports remain

Do not collapse all scenes into one large client bundle.

### Progressive idle preload remains

Do not preload everything immediately.

### Whole-file edits are preferred

When a file needs multiple changes, provide the full replacement file.

---

# 37. Current Project Status

## Stable / implemented

* six-scene architecture
* URL-hash scene navigation
* dynamic scene imports
* progressive scene preloading
* visibility-aware RED MAGIC rendering
* high-refresh cursor architecture
* legal attribution layer
* trademark layer
* public Contents repository integration
* Library scene
* Library manifest
* lazy media opening
* PDF support
* MP3 support
* MP4 support
* image support
* responsive Library styling
* featured metadata
* editorial metadata
* GitHub Pages Node 24-compatible workflow

## Current main area of development

**Library / media experience**

Priority:

```text
make Library feel like a premium personal media platform
```

rather than a repository interface.

---

# 38. Worklog Maintenance Rule

This file is the persistent continuity document for the project.

After each substantial project response:

1. verify current repository state
2. record what changed
3. record what was verified
4. record remaining issues
5. record the next intended action

Future sessions must read this file before continuing major WEB work.

Never assume an earlier chat contains the complete current state.

The repository plus this worklog are the authoritative continuation sources.

---

# 39. Latest Session Continuation

Current active direction:

**Upgrade the entire user experience while moving heavy work into deferred/background chunks.**

Immediate focus:

```text
Library
→ visual media first
→ lightweight previews
→ explicit full-media loading
→ covers / thumbnails
→ smoother browsing
→ immersive readers
```

Performance philosophy:

```text
foreground first
background second
heavy work deferred
media explicitly opened
```

Next major target:

**real cover/thumbnail system + increasingly immersive media presentation.**

---

```
```
