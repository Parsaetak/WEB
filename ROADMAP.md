# WEB — Future Roadmap

## Purpose

This roadmap defines the next product layer for WEB beyond the current portfolio, research laboratory, knowledge graph, and RED MAGIC world.

The goal is to evolve WEB into a unified personal **portfolio + research lab + media library + storefront + publication system**, while preserving:

- the RED MAGIC / living-world identity
- the professional information architecture
- the static-first / crawlable document layer
- the Blog-centered knowledge graph
- the current GitHub Pages deployment model unless a future feature genuinely requires another runtime
- performance, accessibility, reduced-motion support, and mobile usability
- truthful content and metadata
- a clean, maintainable repository

The roadmap is intentionally staged. Do not implement every feature as one large rewrite.

---

# Current Product Direction

WEB should gradually become:

```text
                         PARSA TAK
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
     PROFESSIONAL        KNOWLEDGE           MEDIA
     / PORTFOLIO         / RESEARCH          / ART
        │                   │                   │
      WORK               BLOG              MEDIA
      ABOUT              RESEARCH          MUSIC
      CONTACT            TOPIC HUBS        VIDEO
                                            ART
                                                │
                                             SHOP
                                                │
                                           DIGITAL SALES
````

The existing world layer remains the experiential layer:

```text
#home
#systems
#magic
#work
#media (done in v4.0.0; #library kept as a normalised backward-compatible
       alias; the #about scene was removed in v4.0.1 — /about/ is the only
       canonical About)
```

The document layer remains the canonical, crawlable web architecture.

---

# Priority Order

The recommended implementation sequence is:

```text
PHASE 1 — Repository / Information Hygiene
        ↓
PHASE 2 — Media Architecture + Library → Media
        ↓
PHASE 3 — Music Player
        ↓
PHASE 4 — Video Player
        ↓
PHASE 5 — Shop / Digital Products
        ↓
PHASE 6 — News
        ↓
PHASE 7 — Final Product-System Polish
```

This order minimizes rework because Media becomes the common foundation for music, video, artwork, and eventually the Shop.

---

# PHASE 1 — Repository, Files & Documentation Hygiene

## Objective

Make the entire WEB repository clean, coherent, polished, predictable, and easy for both humans and AI agents to understand.

## Scope

Audit and reorganize, without changing public behavior unnecessarily:

* source files
* Markdown documents
* project notes
* generated documentation
* scripts
* content directories
* static assets
* media assets
* route metadata
* configuration files
* naming conventions
* obsolete files
* duplicated documentation
* temporary/debug files
* stale architectural references
* version references
* comments that no longer match implementation

## Documentation model

Establish clear roles:

```text
README.md
    ↓
what the project is / architecture / local development

AGENTS.md
    ↓
engineering rules / constraints / agent workflow

ROADMAP.md
    ↓
future product direction

Git history
    ↓
historical implementation record (the only one — the former
worklog.md / Updated-Files.md diaries were removed in v4.0.1;
commit messages and diffs are the record)
```

Do not allow these documents to become overlapping copies of one another.

## Cleanup rules

* Remove obsolete documentation.
* Remove dead code and unused assets only after verifying they are not referenced.
* Normalize filenames where safe.
* Keep generated files clearly distinguished from hand-authored sources.
* Eliminate stale version numbers.
* Eliminate contradictory architecture descriptions.
* Make directory responsibilities obvious.
* Keep public content separate from engineering metadata.
* Keep temporary research/agent artifacts outside production content paths.
* Do not break existing imports or static export behavior.

## Completion

A clean repository should allow a new engineer/agent to understand:

1. what WEB is,
2. where source code lives,
3. where content lives,
4. where media lives,
5. where future product data belongs,
6. what is generated,
7. what is canonical,
8. how the site is deployed,
9. what is planned next.

---

# PHASE 2 — Media Architecture + Library → Media

> **STATUS: DELIVERED in v4.0.0.** The Library scene is now Media (`#media`),
> backed by `data/media.json` (version 4 since v4.0.2) and the discriminated `MediaItem`
> model (Book / Music / Video / Art). The external Contents
> `Projects/library.json` contract is intact; the optional Music source
> (`Projects/music.json`) is supported and currently absent — the Media scene
> renders an honest empty state with zero fabricated tracks. Embedded audio
> metadata (ID3v2 / MP4 atoms / FLAC / RIFF-WAVE) is extracted at build time over
> HTTP range requests; covers resolve deterministically (explicit → basename →
> folder → fallback). The global player (one store, one `<audio>` element,
> full queue semantics, Media Session) ships lazy-mounted so the initial
> bundle and the RED MAGIC runtime are untouched.

## Objective

Rename the conceptual `Library` area to **Media** and make it the common discovery layer for all media types.

## New Media model

Media should eventually contain:

```text
MEDIA
├── ART
├── MUSIC
├── VIDEO
└── OTHER
```

Potential future subtypes:

```text
ART
├── digital art
├── illustrations
├── experiments
├── wallpapers
└── printable assets

MUSIC
├── tracks
├── albums
├── beats
├── instrumentals
└── sound experiments

VIDEO
├── videos
├── experiments
├── documentaries
├── project footage
└── presentations
```

## Rename requirements

Carefully migrate:

* `Library` labels
* navigation labels
* route/scene naming where appropriate
* world-shell terminology
* metadata
* accessibility labels
* documentation
* route comments
* internal references

Important:

* Preserve backward compatibility where needed.
* Do not break existing hashes/URLs without a migration strategy.
* DECIDED (v4.0.0): `#library` remains as a normalised backward-compatible alias; `#media` is canonical. The address bar is rewritten to the canonical form after resolution.
* Do not create unnecessary duplicate canonical documents.

## Media content model

Introduce a unified media metadata model capable of describing:

```text
id
title
slug
type
description
thumbnail
source
directUrl
repositoryPath
mimeType
duration
dimensions
license
visibility
freeVariant
premiumVariant
price
tags
relatedProjects
relatedArticles
relatedResearch
publishedAt
updatedAt
```

Not every field needs to be populated for every media item.

## Media source modes

Support:

1. local/content repository assets
2. direct external media URLs

All external sources must be explicit and validated.

## Completion

Media becomes the single conceptual home for personal media rather than a collection of unrelated player components.

---

# PHASE 3 — Music Player

> **STATUS: DELIVERED across v4.0.0 + v4.0.2.** v4.0.0 shipped the store,
> queue semantics, and lazy player surfaces. v4.0.2 completed the phase:
> the player is now mounted once from the ROOT application layout, so
> playback continues across every client-side route navigation site-wide;
> direct external media URLs are supported (explicit `sourceType`
> discriminator in the manifest, absolute http/https URLs validated at
> sync/validation time, never proxied or downloaded by WEB); WAV is
> supported everywhere audio types are defined (MP3 / M4A / FLAC / WAV);
> non-sensitive playback state persists locally and a full reload restores
> a PAUSED player at the persisted position (autoplay never happens); the
> store owns deterministic shuffle, stop, retry, and the full Media Session
> action set with per-action feature detection.
>
> Remaining Phase 3 work that is intentionally NOT shipped: keyboard
> shortcuts, premium/free playback states, and cross-session resume
> beyond the paused-restore contract (these stay future polish).

## Objective

Add an integrated music experience capable of playing personal music from repository content or approved direct URLs.

## Required capabilities

### Sources

Support:

```text
repository/content file
+
direct URL
```

At minimum:

* MP3
* WAV

The architecture should remain extensible for other browser-supported audio formats.

## Player

Core controls:

```text
play / pause
seek
volume
mute
duration
current time
next / previous
track selection
```

Useful secondary features:

```text
loop
shuffle
playlist
queue
keyboard shortcuts
media-session integration where supported
```

Do not ship every advanced feature immediately if the simpler player is more reliable.

## Media metadata

Each track should support:

* title
* artist
* artwork
* album/collection
* duration
* description
* tags
* project/creative context
* free/premium state
* source

## Performance

* Do not eagerly load every audio file.
* Load metadata and audio progressively.
* Avoid downloading WAV files before the user chooses them.
* Prefer streaming/range-request compatible delivery.
* Keep the initial page bundle small.
* Do not block the Home route on the media player.

## Completion

A visitor can open Media, select a track, and play it reliably on desktop and mobile without loading the whole media collection.

---

# PHASE 4 — Video Player

## Objective

Add a unified video playback experience using repository-hosted content or direct media URLs.

## Sources

Support:

```text
repository/content video
+
direct URL
```

Start with browser-friendly formats and do not assume every external provider behaves identically.

## Player

Core:

```text
play / pause
seek
volume
mute
fullscreen
duration
poster
```

Later:

```text
captions
playback speed
quality selection
picture-in-picture
```

Add advanced controls only where browser/provider support is reliable.

## Media metadata

Support:

* title
* description
* poster
* duration
* dimensions
* source
* tags
* related project
* related article
* related research
* free/premium state

## Performance

* poster-first loading
* lazy player initialization
* no autoplay with sound
* no eager download of large videos
* no player initialization for videos outside the viewport unless intent justifies it

## Completion

A visitor can discover and watch personal videos through Media using a consistent player architecture.

---

# PHASE 5 — Art + Shop / Digital Products

## Objective

Turn the personal art/media system into a real digital-product storefront.

The Shop should sell high-quality digital work while keeping appropriate low-quality/free versions accessible.

## Product model

A product should support:

```text
product
├── preview/free asset
├── premium asset
├── metadata
├── price
├── purchase state
└── delivery state
```

## Art licensing model

Example intended product structure:

```text
ARTWORK
├── preview / low-resolution → FREE
└── high-resolution PNG → PAID
```

Do not expose the original high-quality asset through public static paths.

The premium asset delivery architecture must prevent accidental public indexing or direct unauthenticated access.

## Music licensing model

Example:

```text
TRACK
├── MP3 → FREE
└── WAV → PAID
```

The free MP3 may remain directly playable/downloadable.

The premium WAV must be delivered only after successful purchase/authorization.

## Shop requirements

Plan for:

* product catalogue
* product detail pages
* preview gallery
* pricing
* purchase flow
* payment provider integration
* receipt/order state
* secure download delivery
* entitlement verification
* download limits where appropriate
* refund/support information
* licensing terms
* product metadata
* related articles/projects

## Important architectural constraint

GitHub Pages is static hosting.

A serious digital shop will likely require a secure backend/service for:

* payment confirmation
* user/order state
* entitlement validation
* secure file delivery

Do not pretend client-side JavaScript can protect premium files.

Keep the static/public site as the presentation layer and introduce a backend only where the commercial requirements actually need it.

## Product discovery

Shop content should connect to Media:

```text
Media → Artwork → Product
Media → Track → Product
Media → Video → Product
Project → Media → Product
Article → Media → Product
```

## Completion

A visitor can:

1. discover an artwork/track,
2. inspect the free version,
3. understand what the premium version contains,
4. purchase it,
5. receive the correct digital asset securely.

---

# PHASE 6 — News

## Objective

Add a **News** area where Parsa Tak can publish personal news, project updates, observations, and selected world news commentary.

## Content model

Separate at least:

```text
PERSONAL / PROJECT NEWS
WORLD NEWS / COMMENTARY
```

Do not merge reporting and personal updates into one ambiguous content type.

## Suggested content fields

```text
title
slug
summary
body
date
updated
type
source
sourceUrl
tags
relatedProjects
relatedResearch
relatedMedia
```

For world-news posts:

* clearly identify the original source,
* distinguish sourced facts from commentary,
* preserve publication dates,
* use direct source links,
* avoid presenting third-party claims as original reporting,
* make the author's perspective explicit.

## News architecture

Potential structure:

```text
NEWS
├── Latest
├── Parsa Tak
├── Projects
└── World
```

Use the existing Blog/content system where practical rather than creating a second completely separate CMS/content pipeline.

The final implementation should avoid duplicated content registries.

## Discovery

News can connect to:

* Blog
* projects
* research
* media
* topic hubs

Example:

```text
News item
   ↓
related project
   ↓
related article
   ↓
related media
```

## Completion

News becomes a first-class publishing surface without turning the entire site into a generic news portal.

---

# PHASE 7 — FINAL PRODUCT-SYSTEM POLISH

## Objective

After Media, Music, Video, Shop and News exist, perform a complete architectural cleanup pass.

Audit:

### Information architecture

```text
Home
About
Blog
News
Media
Contact
```

with:

```text
Work
Research
Topic Hubs
Shop
```

as deeper destinations where appropriate.

Do not automatically add every destination to the primary nav.

The navigation must stay understandable.

## Unified navigation

One source of truth.

One renderer.

Consistent desktop/mobile behavior.

Consistent active/focus semantics.

## Unified content registry

Avoid independent registries for:

* articles
* news
* media
* products
* projects

Use shared primitives where appropriate while keeping content types semantically distinct.

## Unified relationship graph

Eventually support:

```text
Person
│
├── Project
│    ├── Article
│    ├── Research
│    ├── Media
│    └── Product
│
├── Research
│    ├── Article
│    ├── Project
│    └── Media
│
├── Media
│    ├── Music
│    ├── Video
│    └── Art
│
└── News
     ├── Project
     ├── Research
     └── Media
```

This should strengthen discovery without creating an unreadable graph for users.

---

# CROSS-CUTTING ENGINEERING RULES

## Performance

Never:

* eagerly load the whole media library,
* download large premium files before intent,
* preload every song/video,
* put heavy media logic into the critical Home bundle,
* initialize players unnecessarily,
* regress RED MAGIC's lazy boundary.

Prefer:

```text
metadata first
→ preview
→ user intent
→ full media
```

## Accessibility

All new features must support:

* keyboard access
* visible focus
* semantic labels
* captions/subtitles where applicable
* reduced motion
* touch controls
* usable mobile layouts
* no hover-only information

## SEO

Every new public document must have:

* unique title
* unique description
* canonical URL
* correct Open Graph metadata
* structured data when appropriate
* descriptive internal links
* sitemap policy
* export verification

Do not index:

* private purchase state,
* payment callbacks,
* temporary downloads,
* internal player state,
* arbitrary query-state combinations unless they are intentionally canonical documents.

## Security

Especially for Shop:

* never expose premium source files in the public static directory,
* never treat hidden URLs as authentication,
* verify payment server-side,
* protect download entitlement,
* do not trust client-side purchase state.

## Content truthfulness

Never fabricate:

* artwork metadata
* publication dates
* prices
* download counts
* audience metrics
* sales
* performance metrics
* news facts
* external sources

---

# VERSION / RELEASE STRATEGY

Suggested major milestones:

```text
v3.9  Information Architecture + Discovery                (shipped)
v4.0  Media Architecture + Library → Media + Music Player (shipped — the
      Music Player was folded into v4.0 rather than split into v4.1,
      because the Media model without a player would have shipped a
      listening surface that could not listen)
v4.0.1 Repository cleanup + architecture-integrity pass (shipped — no new
      product features: Library migration finished, one hash parser, one
      work catalogue, real static 404, RED MAGIC engine modularization,
      tests under typecheck, fresh CI installs, working static preview)
v4.0.2 Global Music + Direct Sources + WAV (shipped — the player is
      mounted once from the root application layout so playback
      continues across the full site; direct external media URLs are
      supported through an explicit manifest source discriminator,
      validated at build time and never proxied or downloaded by WEB;
      WAV joins MP3/M4A/FLAC everywhere audio types are defined;
      playback state persists locally with a paused, never-autoplaying
      reload restore. Shop, secure purchases, and News remain future
      phases — nothing beyond the Music Player scope is claimed)
v4.1  Video Player enhancements
v4.2  Art + Digital Shop foundation
v4.3  Secure digital delivery / purchase flow
v4.4  News
v4.5  Full repository + product-system polish
```

These version numbers are planning labels, not commitments. Keep the actual repository version consistent with the scope actually shipped.

---

# LONG-TERM TARGET

The mature WEB product should allow a visitor to move naturally through:

```text
DISCOVER
   ↓
UNDERSTAND
   ↓
EXPLORE
   ↓
READ / WATCH / LISTEN
   ↓
CONNECT
   ↓
SUPPORT / BUY
```

while preserving the deeper identity:

```text
PORTFOLIO
+
RESEARCH LAB
+
KNOWLEDGE GRAPH
+
MEDIA LIBRARY
+
LIVING WORLD
+
DIGITAL STORE
+
PUBLICATION
```

The system should feel like one coherent product, not seven separate websites attached to one domain.

---

# ROADMAP COMPLETION RULE

Every future feature should pass the same gates:

```text
INSPECT
→ DEFINE
→ DESIGN
→ IMPLEMENT
→ VERIFY
→ REGRESSION CHECK
→ CLEAN UP
→ DOCUMENT
→ RELEASE
```

A roadmap item is not complete merely because its UI exists.

It is complete when:

* the architecture is coherent,
* the feature works,
* accessibility works,
* mobile works,
* static/crawlable behavior is correct,
* performance remains controlled,
* security is appropriate,
* documentation is updated,
* verification passes,
* no unrelated regressions remain.

```

---

# PHASE 8 — LOADING PERFORMANCE + UNIFIED DOCUMENT TABS

> **STATUS: DELIVERED in v4.0.3.**

## Objective

A measured performance/regression pass on v4.0.2: find the real mechanism
behind the felt loading slowdown, fix the smallest correct boundaries, and
add the verification layer so the class of regression cannot pass unnoticed.

## Root causes found (measured, not assumed)

1. **Viewport prefetch of the home shell from every content route** — the
   document shell's brand link and Home crumb rendered `next/link` without
   `prefetch={false}`, so each content page prefetch-hydrated the full "/"
   graph (LivingShell + HomeScene chunks, ~115 KB, plus 3 RSC payloads) in
   the background right after hydration.
2. **Blog payload flood** — blog-index and article surfaces carried up to
   11 internal links without `prefetch={false}`; a cold /blog/ visit fetched
   6+ article payloads with zero user intent.
3. **Hard navigations to /work/ and /research/** — document-body links
   (cards, link rows, prose anchors) rendered plain `<a>`; clicking them
   reloaded the whole document, killing the global player.
4. **Speculation before first paint** — predicted scene chunks and the
   RED MAGIC organism began downloading at the first idle callback, which
   on fast connections fires before FCP.
5. **Host chunk carried the full persistence module** — v4.0.2's root-layout
   player host shipped session read/write/validate code on every route
   (+5,987 B raw / +1,761 B gzip per route) although only a raw storage
   probe is needed eagerly.
6. **Instant hover warming** — pointer-enter prefetch fired with no dwell,
   no save-data guard, and warmed the current route.

## Delivered

- `whenPageSettled()` (lib/loadPhase.ts): load → idle → speculation, one
  shared promise, hard cap; consumed by the scene preloader and the RED
  MAGIC organism.
- `lib/player/sessionPresence.ts`: the raw session-presence probe split
  out of persistence.ts; the host's initial graph is minimal by design.
- `lib/connection.ts`: the one connection/device probe module, shared by
  the scheduler and the navigation.
- Warming discipline: pointer-down/focus immediate, pointer-enter dwell +
  cancel, save-data/2G skip, current-route skip, deduplicated with retry.
- `prefetch={false}` on every internal `next/link` site-wide; document-body
  internal links upgraded to `next/link` (DocLink) so the global player
  survives every in-document jump.
- Registry-driven page identity (`pageIdForRoutePath`, lib/routes.ts):
  About and Contact ride the exact shared ContentShell contract of Work,
  Research and the hubs; the href→identity switch is gone.
- `npm run verify:loading`: export-level proof (no player surface in HTML,
  no scene/organism code in initial chunks, host chunk probe-only, About/
  Contact/Research skeleton bijection with Work).
- `npm run bench:loading`: reproducible Playwright benchmark measuring
  cold-load bytes/timings, speculative request classification, navigation
  medians, and real player continuity — medians over repeated cold runs.

## Measured results (same harness, same environment, medians of 5)

- /blog/ cold load: 8 cross-route payload fetches → 0; dynamic JS on
  content routes: 4 chunks (the prefetched home shell) → 0.
- Client navigation blog→work: 791 ms → 111 ms; work→research:
  702 ms → 94 ms (hard reloads became client-side navigations).
- Player continuity across the full route flow: playback continues
  (verified playing at t+5.5 s after six navigations); reload restoration
  stays paused; fresh visitors create no audio element.
- Speculation (scene chunks + organism) now starts strictly after the
  load event plus one idle gap; in v4.0.2 it began before FCP.
