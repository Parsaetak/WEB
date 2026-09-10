---
title: "Building Under Constraints"
subtitle: "What a no-server, static-only deployment teaches about architecture."
excerpt: "GitHub Pages cannot run a backend, resize an image, or render on demand. Those limits are not obstacles — they are the design."
description: "How the static-export-only constraint shaped this site's data pipeline, content architecture, and the new blog — and why constraints beat features."
date: "2026-06-03"
author: "Parsa Tak"
category: "systems"
tags: ["architecture", "static export", "content pipeline", "GitHub Pages"]
featured: false
cover:
  src: "/blog/images/static-constraints.svg"
  alt: "A red blueprint grid with a bounded frame and a solid core cell"
  width: 1200
  height: 630
---

Every interesting system is shaped by what it cannot do. This site cannot run a server. GitHub Pages serves files — full stop. No runtime rendering, no image optimisation pipeline, no backend, no database, no server actions. Anything the site needs must either exist as a file before deployment or happen entirely in the browser.

It is tempting to read that as poverty. In practice it is the most useful constraint I have worked under, because it forces every expensive operation to happen at the right time.

## Build time is your server

The whole architecture falls out of one question: *what can move from runtime to build time?*

The answer turned out to be almost everything. Content manifests are synced and validated before the build — a malformed library record fails the pipeline loudly instead of shipping corrupted pages. The blog's articles are normalised, validated, and rendered to HTML before the site exists; indexes for tags, categories, related posts, and the RSS feed are precomputed then too. The browser receives finished, typed data and never parses a markdown file.

The pipeline is deliberately boring:

- **Source** — markdown files with structured frontmatter, in the repository.
- **Validate** — required fields, types, slug format, dates, duplicate detection. A bad record fails the build with the file and the reason.
- **Normalise** — one canonical shape, reading time computed, URLs resolved.
- **Index** — deterministic lookup maps for slugs, tags, categories, and related posts.
- **Emit** — static pages and a feed generated from the same data. There is no second, hand-maintained index anywhere.

Failures are loud by design. A content pipeline that silently drops a broken record produces a site that is quietly wrong — the worst kind of wrong, because it looks healthy.

## What the constraint buys

A no-server rule sounds like a limitation. Measure what it returns:

- **Deployment is a copy.** No warm-up, no cold starts, no runtime dependencies to monitor. Pages either exist or the build failed.
- **Performance is structural.** Everything is a static file behind a CDN. Caching is content-addressed by fingerprint, so return visits cost the browser cache and nothing else.
- **Security surface is near zero.** No server code, no API to abuse, no secrets in the client.
- **Cost is zero.** An architecture that scales to zero users and to a million users at the same price.

The constraint also disciplines the client. There is no build-time image optimisation, so images ship with explicit dimensions, real lazy-loading below the fold, and priority only on the hero. There is no server-side search, so the blog index is a precomputed dataset small enough to filter in memory during a keystroke. Heavy media — books, audio, video — never moves without an explicit click, because on a static host, every megabyte comes out of the visitor's patience.

## Constraints as a creative instrument

The RED MAGIC organism runs under the same philosophy. One canvas, one animation loop, quality that adapts when frames drop — not because canvas work is impossible, but because the *interesting* version is the one that survives contact with a mid-range phone on a slow network.

That is the general lesson. Removing options does not remove design; it concentrates it. When you cannot solve a problem with infrastructure, you have to solve it with architecture — and architectural solutions travel. The loading priorities, the single-import discipline, and the data pipeline described in [The Anatomy of a Fast Static Site](/blog/the-anatomy-of-a-fast-static-site/) would make a server-backed site faster too.

A system defined by what it refuses to do is a system whose behaviour you can predict. Predictability is the foundation everything else — performance, reliability, trust — is built on. Choose constraints deliberately, keep them honest, and let them do the design work.
