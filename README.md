# Parsa Tak — WEB

A statically exported Next.js portfolio that behaves like a living system: six hash-navigated scenes, a markdown-driven blog, a generated SEO graph, and a canvas organism that loads only when the browser can afford it.

**Live Site:** https://parsaetak.github.io/WEB/
**Repository:** https://github.com/Parsaetak/WEB

---

## What this is

This is the personal website of **Parsa Tak** — researcher, builder, programmer, writer, and artist. It presents the work in one place: AI systems, reasoning and evaluation, software engineering, and creative technology. The site itself is also a project: it is built as a static-first Next.js application that demonstrates how far a static export can go before it needs a server.

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
app/                 routes: home, blog index, blog articles, 404
components/          world shell, scenes, navigation, RED MAGIC systems
components/scenes/   the six scene components (HomeScene is static)
content/blog/        markdown article source (frontmatter + body)
lib/                 data access, SEO graph, brand, schedulers, links
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
- JSON-LD structured data: `Person` + `WebSite` anchors in the root layout, plus `WebPage`, `Blog`, `BlogPosting`, and `BreadcrumbList` on the right routes — all cross-referenced by `@id`, never duplicated
- Google Search Console ownership meta tag emitted once per route and byte-verified on every build
- `sitemap.xml` + `robots.txt` generated and verified against the actual export
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

**Verification law:** a change is not done until `npm run build` and `npm run verify` pass and the generated `out/` has been inspected.

## Project status

- Next.js 16.3.4 / React 19.2.8 / TypeScript 5.9, static export, Node 22 in CI
- 9 published articles; the Writing section links them from the homepage
- Full verification suite green: SEO + brand gates pass on every build
- Known limitations: GitHub Pages serves the site under `/WEB`, so the bare root URL redirects; hash-scene states are not individually indexable documents by design (articles carry the indexable concepts)

## Licence

Original design, writing, artwork, and creative materials are licensed under the terms of [`LICENSE.md`](LICENSE.md) — all rights reserved by Parsa Tak. Brand and trademark notices live in [`TRADEMARKS.md`](TRADEMARKS.md). Third-party runtime libraries are governed by their own licences.
