# Parsa Tak — WEB

A statically exported Next.js portfolio that behaves like a living system: six hash-navigated scenes, a markdown-driven blog, a generated SEO graph, and a canvas organism that loads only when the browser can afford it — plus a connected knowledge base of real, indexable topic documents.

**Live Site:** https://parsaetak.github.io/WEB/
**Repository:** https://github.com/Parsaetak/WEB

---

## What this is

This is the personal website of **Parsa Tak** — independent software engineer, product builder, and AI systems researcher. It presents the work in one place: AI systems, reasoning and evaluation, software engineering, product building, and creative technology. The site itself is also a project: it is built as a static-first Next.js application that demonstrates how far a static export can go before it needs a server.

Everything a visitor and every search crawler receives is pre-rendered HTML. There is no server runtime, no database, and no client-rendered content gate: the homepage's full semantic content — identity, capabilities, featured work, method, systems, writing, and links — ships in the initial HTML.

## Why it exists

The site has three jobs. First, it is the professional index of the work: every project, article, and experiment is reachable from a public, permanent URL. Second, it is an engineering demonstration: static export, crawlability, performance budgets, accessibility, and verification gates are all treated as first-class features rather than afterthoughts. Third, it is the substrate for RED MAGIC, a long-running computational-organism experiment that needed a real website as its host.

## What you will find here

### Work
The **Work scene** (the `#work` hash scene) is the full portfolio: projects with their repositories, categories, and real destinations. The homepage carries the featured subset.

### Research
The **Systems scene** (`#systems`) presents the framework family — AI Instructions, REP (Reasoning & Evaluation Protocol), and USEF (Unified System Evolution Framework) — plus the measurement programme behind UHIT/AIST. The **Library scene** (`#library`) hosts longer-form documents and PDFs.

### Writing
The **blog** is real content, not a stub: markdown articles under `content/blog/` become fully static `/blog/<slug>/` routes with generated metadata, related-article graphs, and structured data. The homepage's Writing section links the strongest articles, selected on the server at build time.

### Topic hubs and content documents (v3.1, extended v3.2)
Beyond the living-world homepage, the site carries real indexable documents that own the site's most important search and research themes:

- `/about/` — the entity/author page: identity, what I do, how I work (the research → product direction → architecture → implementation → testing → verification → delivery pipeline), research, engineering, product building, selected systems, current direction, both collaboration tracks, writing, profiles, and contact. JSON-LD: `ProfilePage` referencing the site-wide `Person` `@id`
- `/work/` — the canonical professional portfolio: every significant system with what it is, the problem it addresses, why it matters, and real destinations
- `/research/` — the research programme: the questions, the six topic hubs as the research map, the framework family, the UHIT/AIST measurement programme, and selected research writing
- `/contact/` — the single honest contact document: primary CTA **Email Parsa Tak** (resolved from `lib/links.ts`), secondary GitHub/LinkedIn, and the four collaboration types (academic/research, business/engineering, project collaboration, open technical collaboration). No form, no backend
- `/local-ai/`, `/ai-systems/`, `/ai-reasoning/`, `/ai-evaluation/`, `/software-engineering/`, `/creative-technology/` — six topic hubs, each a self-contained document: topic definition, what I work on in the area, the systems built in the area, genuinely related articles, and a next exploration path

The distinction between URL kinds is deliberate: a **real URL** (`/about/`, `/work/`, `/research/`, `/contact/`, hubs, blog) is an indexable document; a **hash** (`/#work`, `/#magic`) is an interactive scene state of the living world, not a separate page. Every content route is statically rendered from server components with zero route-specific client JavaScript — they are the lightest pages on the site.

### Navigation (v3.2)
The site-wide navigation leads with the professional destinations and keeps the experimental world one click away:

```
PRIMARY:  HOME · WORK · RESEARCH · WRITING · ABOUT · CONTACT
WORLD:    SYSTEMS · RED MAGIC · LIBRARY   (quieter, contextual)
```

Both rows render from one source of truth (`lib/navigation.ts`) across every surface — the desktop track, the CompactMenu, the blog header, the content-shell header, and the shared footer. The numbered HUD labels (`01 HOME` … `06 LIBRARY`) are gone: hierarchy is carried by spacing, typography, and active states. The six-scene world is unchanged internally — scene ids (`home / about / systems / magic / work / library`), hash routing, and preloading all behave exactly as before.

### RED MAGIC
RED MAGIC is the site's living-layer experiment: a canvas-based computational organism with adaptation, perception, and visible state. It is deliberately **not** part of the critical path — visitors receive a CSS-only seed first, and the organism loads at idle time only when motion is permitted and the device can afford it.

## Key projects

| Project | What it is | Where |
| --- | --- | --- |
| **SHEYTAN** | A local-first AI laboratory: managed llama.cpp (local LLM runtime) inference, a real agent loop, isolated coding workspaces, objective verification | [GitHub repository](https://github.com/Parsaetak/SHEYTAN-local-agent) + [field notes](https://parsaetak.github.io/WEB/blog/sheytan-the-local-first-laboratory/) |
| **UHIT** | The Universal Human Intelligence Test — measurement programme realised as the AIST-2026.09 standard and the ASI-100-Elite benchmark | [Specifications](https://github.com/Parsaetak/Contents/tree/AI-Tests) + [article](https://parsaetak.github.io/WEB/blog/measuring-machine-intelligence/) |
| **FreeIran** | Free, open-source VPN configuration manager for Windows: a Go multi-core runtime that discovers, tests, maintains, and runs public proxy configurations | [GitHub repository](https://github.com/Parsaetak/FreeIran) + [engineering notes](https://parsaetak.github.io/WEB/blog/freeiran-engineering-notes/) |
| **RED MAGIC** | The living canvas organism experiment hosted by this website | [Live experiment](https://parsaetak.github.io/WEB/#magic) + [article](https://parsaetak.github.io/WEB/blog/why-the-website-is-a-living-system/) |
| **WEB** | This website itself — a statically exported living system | [This repository](https://github.com/Parsaetak/WEB) + [how it works](https://parsaetak.github.io/WEB/blog/the-anatomy-of-a-fast-static-site/) |

## Experience architecture

The whole site is one route with six hash-navigated scenes, wrapped in a persistent "world shell":

```
one canonical URL ( / )
├── #home      ← statically rendered into the HTML (crawlable)
├── #about     ← lazily loaded scene
├── #systems   ← lazily loaded scene
├── #magic     ← lazily loaded scene (RED MAGIC)
├── #work      ← lazily loaded scene
└── #library   ← lazily loaded scene
/blog/          ← real routes, one static page per article
```

Scene changes are URL-addressable (`#systems` is a shareable state), handled by the shell's navigation, and never produce separate documents — only the blog earns separate indexable routes.

## Technical architecture

- **Next.js 16** (App Router, Turbopack builds) with **React 19** and **TypeScript**
- **Static export** (`output: "export"`) — the entire site compiles to plain files in `out/`
- **GitHub Pages** hosting behind the `/WEB` basePath, deployed by GitHub Actions
- Server components pick content at build time; client components receive only minimal serializable props
- Blog bodies exist only in generated static HTML — never in client JavaScript bundles
- Zero runtime dependencies beyond React/Next; the build, blog, brand, and verification tooling is dependency-free Node.js

## Repository structure

```
app/                 routes: home, blog index, blog articles, 404,
                     and the content documents (about, work, research,
                     contact, and the six topic hubs)
components/          world shell, scenes, navigation, RED MAGIC systems
components/content/  shared server-rendered content-route system
                     (shell, building blocks, hub view)
components/scenes/   the six scene components (HomeScene is static)
content/blog/        markdown article source (frontmatter + body)
lib/                 data access, SEO graph, hub definitions, brand,
                     schedulers, links
scripts/             build-blog, brand generators, verification suite
data/blog/           GENERATED posts.json (never edited by hand)
public/              static assets: brand art, icons, sitemap, robots
assets/              brand system source (star variants, glyphs, social)
.github/workflows/   the Pages deployment pipeline
out/                 GENERATED static export (deployed artifact)
```

## Blog/content pipeline

`scripts/build-blog.mjs` runs before every build:

1. **Parse** markdown + frontmatter from `content/blog/*.md`
2. **Validate** records and the relationship graph (a malformed article fails the build with the file and reason)
3. **Render** a trusted markdown subset to fully escaped HTML
4. **Normalize** reading time, cover URLs, and link base paths
5. **Index** tags, categories, related articles (explicit `related` frontmatter plus a deterministic scoring model), and prev/next adjacency
6. **Emit** `data/blog/posts.json` (content + indexes) and `public/sitemap.xml`

The sitemap is generated from the **same** content index that produces the routes, so it can never disagree with the site. `lastmod` values come from the articles' own dates — freshness is never faked.

## SEO

- Every canonical route ships exactly one `<title>`, meta description, canonical link, Open Graph image, and robots directive
- JSON-LD structured data: `Person` + `WebSite` anchors in the root layout, plus `WebPage`, `ProfilePage` (on `/about/`), `Blog`, `BlogPosting`, and `BreadcrumbList` on the right routes — all cross-referenced by `@id`, never duplicated. The content routes add route-specific `WebPage` + `BreadcrumbList` nodes (and a truthful `ItemList` on `/work/`) referencing the same stable entities
- Google Search Console ownership meta tag emitted once per route and byte-verified on every build
- `sitemap.xml` + `robots.txt` generated and verified against the actual export, including the content routes; article `lastmod` reflects content dates, never the build date
- Semantic internal-link graph: every article carries a `TOPIC HUB` chip to its honest primary hub; every hub links its systems and ≥3 genuinely related articles; the shared footer exposes every content document site-wide — the verifier rejects orphan routes and link-count padding
- Visible author authority: every article ends with a factual author block (independent software engineer, product builder, and AI systems researcher) linking to `/about/`
- Social metadata (OG/Twitter) with stable, production-absolute image URLs
- RSS is **intentionally absent** — the export must contain no feed and no residual feed references, and verification enforces that

`scripts/verify-seo.mjs` checks all of the above against the generated HTML in `out/` — the same artifacts crawlers receive.

## Brand system

- The **13-point star** is the primary site identity: favicon family (SVG + PNG + ICO + Apple touch), hero mark, and brand assets — all generated by `scripts/generate-brand.mjs` and `scripts/generate-brand-raster.py`
- The **Red Eye** belongs to RED MAGIC and is used within that system's surfaces
- Glyph library and project artwork are generated, deterministic, and verified: CI regenerates them and fails if anything drifts
- Source assets live in `assets/`; runtime assets ship from `public/`

## Performance architecture

The loading strategy is static-first with intent-gated enhancement:

```
static HTML + CSS seed
→ hydration of the shell
→ idle time / interaction
→ heavy enhancement (canvas organism, secondary scenes)
```

- The **home scene is statically imported** — its content is the initial HTML, never behind a Suspense gate
- The five **secondary scenes are dynamically imported** one at a time, on navigation
- The **RED MAGIC organism loads at idle** and only when reduced-motion, save-data, and memory constraints allow; otherwise the CSS seed stays permanently
- Motion is CSS-first (transform/opacity), driven by one shared IntersectionObserver with one-shot reveals — no per-frame React state, no scroll listeners
- Images carry intrinsic dimensions, lazy-load below the fold, and use stable static URLs
- Blog route payloads are prefetched on intent (hover/focus), not automatically

## Accessibility

- Semantic HTML: one `<h1>` inside `<main>`, real headings, real links and buttons, landmark structure
- Full keyboard operability for menus, scenes, and interactive surfaces; visible focus states
- `prefers-reduced-motion` is honoured everywhere — reveals flatten and the heavy organism never mounts
- Without JavaScript, content stays fully visible: the reveal system hides nothing unless its pre-paint gate class is present
- Decorative visuals are `aria-hidden`; icon-only controls carry accessible names

## Local development

Requires Node.js 22+ (the version GitHub Actions uses).

```bash
npm install
npm run dev
```

`npm run dev` regenerates blog data first, then serves at `http://localhost:3000` with no base path.

## Production build

```bash
npm run build
```

Runs the blog pipeline, then `next build`, producing the static export in `out/`. Locally the export uses root-relative URLs; in CI (`GITHUB_ACTIONS=true`) every href carries the `/WEB` base path — the deployment target's shape.

## Verification

```bash
npm run verify
```

Runs the two gates CI enforces:

- `verify:seo` — static SEO/export verification against `out/` (page metadata, structured data, homepage crawlability, writing links, interaction anchors, link graph, sitemap, robots, RSS absence, favicon family, brand assets)
- `verify:brand` — brand asset coherence and determinism

Both read only generated artifacts, so they check what actually ships.

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) deploys `main` to GitHub Pages:

Pages source check → dependencies → Library manifest fetch + validation → blog pipeline validation → `next build` → SEO verification → brand verification (with regeneration/drift check) → static export validation → deployment manifests → Pages upload → deploy → live revision probe.

The pipeline is concurrency-gated and verifies the deployed revision is publicly observable before reporting success.

## For developers and AI agents

Read this section before changing anything. It is the safety net that keeps the site's guarantees intact.

**Source of truth (edit these):**
`app/` (routes and metadata) · `components/` (shell, scenes, systems) · `lib/` (data access, SEO, brand, schedulers) · `content/blog/` (articles) · `scripts/` (pipeline, generators, verification)

**Generated (never hand-edit):**
`data/blog/posts.json` · `public/sitemap.xml` · `public/brand/` and `public/images/projects/` (regenerate with `npm run brand`) · `out/` (build artifact)

**Static export:**
`out/` is the whole site. If a change works in `next dev` but breaks the export, the export is right and the change is wrong — `npm run build && npm run verify` decides.

**Deployment base:**
`/WEB`. Determined in three mirrored places — `next.config.ts`, `scripts/build-blog.mjs`, and `scripts/verify-seo.mjs` — all keyed off `GITHUB_ACTIONS === "true"`. If you add href-building code, derive the prefix from `NEXT_PUBLIC_BASE_PATH` or the existing `BASE_PATH` constants; never hard-code `/WEB` a second time.

**Critical invariants:**
- Home is statically crawlable: one `<h1>` inside `<main>`, full semantic content in the visible HTML, no Suspense loading gate
- Secondary scenes remain lazy; the home scene never regresses to a dynamic import
- RED MAGIC and its subsystems stay out of the critical path (CSS seed → idle import)
- Client components must not import `lib/blog` (it contains article HTML); they receive metadata as serializable props via `lib/homeWriting`
- The Google verification meta tag must remain byte-exact; canonical URLs use production `/WEB` URLs
- RSS is intentionally absent — do not add a feed or references to one
- The 13-point star is the site identity; the Red Eye belongs to RED MAGIC
- The SEO verifier requires ≥3 crawlable, resolvable article links on the home route, detected in a base-path-aware way

**Site voice (v3.3):**
All user-facing personal and author copy speaks in first person ("I build…", "My research…", "I write…") — the site is Parsa Tak speaking directly. The rule splits by subject: personal story is first person; projects and systems keep their natural entity voice ("SHEYTAN runs…", "FreeIran provides…"); structured data and SEO surfaces (meta descriptions, page titles, `Person`/JSON-LD, bylines, ogAlt) stay in technically correct third-person/entity form, as do legal attribution and CTA wording ("Email Parsa Tak"). Do not reintroduce he/him/his for Parsa in visible prose, and do not force first person into machine-readable entity data.

**Verification law:** a change is not done until `npm run build` and `npm run verify` pass and the generated `out/` has been inspected.

## Project status

- Next.js 16.3.4 / React 19.2.8 / TypeScript 5.9, static export, Node 22 in CI
- 9 published articles; the Writing section links them from the homepage
- 8 static content documents (v3.1): `/about/`, `/work/`, and six topic hubs forming the site's knowledge base
- Full verification suite green: SEO + brand gates pass on every build
- Known limitations: GitHub Pages serves the site under `/WEB`, so the bare root URL redirects; hash-scene states are not individually indexable documents by design (the content routes and articles carry the indexable concepts)

### Search Console workflow (v3.1)

The site ships no analytics; discovery is measured through Google Search Console, which is already ownership-verified. The intended review loop:

```text
Search Console
  ↓ queries with impressions
pages ranking 8–20
  ↓ improve page depth / links / title
queries generating unexpected impressions
  ↓ consider a dedicated authoritative hub
```

In practice: a query cluster that repeatedly produces impressions for a page ranking outside the top positions is a signal that the topic deserves more depth — a stronger hub section, more genuine internal links from related articles, or a clearer title. New hubs are created only when real material exists to support them; thin pages are worse than no pages.

## Licence

Original design, writing, artwork, and creative materials are licensed under the terms of [`LICENSE.md`](LICENSE.md) — all rights reserved by Parsa Tak. Brand and trademark notices live in [`TRADEMARKS.md`](TRADEMARKS.md). Third-party runtime libraries are governed by their own licences.
