# PARSA TAK — WEB

Live site: https://parsaetak.github.io/WEB/

Repository: https://github.com/Parsaetak/WEB

## Stack

- Next.js 16 (App Router, `output: "export"`, static only)
- React 19, TypeScript
- GitHub Pages deployment (no server, no runtime backend)
- Zero runtime content dependencies — the data layer is custom and typed

## Architecture

### World shell (scenes)

The home experience is a single route (`/`) driven by hash-based scene
routing inside `components/LivingShell.tsx`:

- `SceneRegistry` renders the active scene through `next/dynamic`
- `ScenePreloader` owns **the only dynamic import site per scene** —
  the registry's lazy components resolve through the same loader, so
  scene chunks exist exactly once and never download twice
- `SceneUrlSync` keeps scenes and browser history in sync
- `SceneLoadingScreen` exposes honest load phases
  (`INITIALIZING / LOADING / PREPARING / READY / ERROR`) and never
  fakes progress percentages
- `WorldBackground` (CSS ambient) and `RedCursor` (native CSS cursor)
  are mounted once from the shell

### Blog (routes)

`/blog/` and `/blog/<slug>/` are real statically exported routes:

- `app/blog/layout.tsx` — shared shell (background, cursor, header, footer)
- `app/blog/page.tsx` — index: featured article + search/tag island
- `app/blog/[slug]/page.tsx` — article pages with full metadata,
  Open Graph/Twitter cards, JSON-LD `BlogPosting`, prev/next and
  related posts
- `components/blog/BlogIndex.tsx` — the only client island on the
  index; it receives article **metadata only** (no HTML bodies)
- RSS feed: `/blog/feed.xml`, generated from the same content index

### Data pipeline

```
content/blog/*.md  (source of truth)
  scripts/build-blog.mjs
    → PARSE frontmatter
    → VALIDATE (fail loudly: file + reason)
    → RENDER markdown → HTML (escaped, subset)
    → NORMALIZE (reading time, covers, basePath-aware URLs)
    → INDEX (tags, categories, related, prev/next)
    → EMIT data/blog/posts.json + public/blog/feed.xml
  lib/blog.ts (typed access layer, runtime validation, memoized indexes)
    → app/blog/* pages
```

The Library follows the same shape: the manifest is synced from
[Parsaetak/Contents](https://github.com/Parsaetak/Contents) (branch
`Projects`) during CI, validated in the workflow, normalized once at
runtime through `lib/contentRepository.ts`, and deduplicated through
`lib/resourceStore.ts` (in-flight promise sharing, failure cleanup).

### Loading priorities

Defined in `lib/loadPhase.ts`:

- **P0** critical — shell, current scene, essential CSS
- **P1** near-critical — most probable next scene (after first idle)
- **P2** predictive — adjacent previous scene (after second idle)
- **P3** background — secondary metadata (nothing schedules this yet)
- **P4** user-triggered — PDFs / audio / video; **never** loaded
  without explicit intent

Background preloading is bounded, skips hidden tabs, and respects
`save-data` / 2G connections.

## Writing an article

1. Create `content/blog/<slug>.md` (slug: lowercase kebab-case).
2. Frontmatter requires `title`, `excerpt`, `date` (YYYY-MM-DD),
   `author`, `category` (kebab-case), and optionally `subtitle`,
   `description`, `updated`, `tags`, `featured`, `cover`
   (`src` under `/blog/images/`, `alt`, `width`, `height`).
3. Markdown subset supported: `##`–`####` headings, paragraphs,
   **bold**, *italic*, `` `code` ``, fenced code blocks, links,
   images, blockquotes, lists, `---` rules.
4. Run `npm run build` (or `npm run blog`). A malformed article fails
   the build with the file and reason.
5. Commit both the article and the regenerated
   `data/blog/posts.json` / `public/blog/feed.xml`.

Generated files (`data/blog/posts.json`, `public/blog/feed.xml`) are
committed so a fresh clone works immediately; CI regenerates them on
every build, so production never serves a stale hand-edited copy.

## Development

```bash
npm ci                # install
npm run dev           # blog pipeline + next dev (http://localhost:3000)
npm run lint          # eslint
npm run blog          # regenerate blog data + feed only
npm run build         # blog pipeline + static export into out/
```

The deployment environment is detected via `GITHUB_ACTIONS=true`
(→ `basePath: "/WEB"`), mirroring `next.config.ts` and
`scripts/build-blog.mjs`.

## Deployment

`.github/workflows/deploy.yml`: checkout → Node 22 + caches →
`npm ci` → Pages setup → Library manifest sync + validation →
blog content validation → Next.js build → static-export verification
(blog routes + feed present) → deployment manifest → Pages artifact →
deploy → deployed-revision verification.

## Verification

```bash
npm ci
npm run lint
npm run build
ls out/blog/ out/blog/<any-slug>/
```
