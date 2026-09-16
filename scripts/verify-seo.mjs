#!/usr/bin/env node
/*
 * verify-seo.mjs — static SEO verification for the exported site.
 *
 * Runs against out/ AFTER `next build` (static export). Checks the
 * generated HTML/XML directly — the same artifacts crawlers receive
 * — and fails loudly with a report when something is wrong.
 *
 * Zero runtime dependencies. Checked in so the same verification
 * runs locally, in CI, and on any future clone.
 *
 * Check groups (each group is one function, run from main()):
 * - page metadata          verifyPage            — title, description,
 *   canonical, og:image, robots, Search Console token, JSON-LD types
 *   per canonical route; canonical/og URLs must be absolute, HTTPS,
 *   production-host, /WEB-aware (no localhost, no repository URLs,
 *   no /blog/undefined)
 * - articles               main()                — BlogPosting
 *   headline/date/author match the content index; BreadcrumbList
 *   present
 * - homepage content       verifyHomeContent     — one h1 inside <main>,
 *   no streamed-Suspense wrapper, capability/project/workflow
 *   vocabulary in the visible HTML
 * - writing links          verifyWritingLinks    — ≥3 crawlable
 *   article links, every target a real exported route, basePath-aware
 *   (local /blog/<slug>/, GitHub Pages /WEB/blog/<slug>/)
 * - interaction anchors    verifyInteractivity   — no dead anchors,
 *   every internal href resolves to an exported file, media src
 *   resolves, label punctuation QA
 * - link graph             verifyInternalLinkGraph — article/scene
 *   hrefs resolve, no localhost, no repository-clone URLs, orphan
 *   report
 * - sitemap                verifySitemap         — URL set equals the
 *   exported route set (incl. v3.1 content routes), production HTTPS,
 *   content-date lastmod
 * - robots                 verifyRobots          — production sitemap
 *   directive
 * - RSS policy             verifyNoRss           — feed.xml absent and
 *   unreferenced anywhere (the blog deliberately has no feed)
 * - favicon + brand assets verifyFaviconFamily / verifyBrandAssetsInExport
 * - content graph (v3.1)   verifyContentGraph    — /about/, /work/, and
 *   the topic hubs exist with full metadata, are linked from the home
 *   document, link ≥3 related articles (hubs), and have ≥3 inbound
 *   pages each — no SEO islands
 */

import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "..");
const OUT_DIR = path.join(ROOT, "out");

const SITE_ORIGIN = "https://parsaetak.github.io/WEB";

/*
 * Google Search Console verification token (v2.9). Emitted once from
 * the root layout's metadata.verification field; every canonical page
 * must carry it EXACTLY, and CI fails the moment it disappears or is
 * altered. This is a public verification token, not a secret.
 */
const GOOGLE_SITE_VERIFICATION =
  "K8PQwvcGcrpBCyR-6XbmnDhv2IFPxpxjXV90UY7glTo";

/*
 * Mirror next.config.ts / build-blog.mjs: exported hrefs carry the
 * deployment basePath in CI, but the out/ tree itself is NOT
 * basePath-prefixed — strip it before resolving hrefs to files.
 */
const BASE_PATH = process.env.GITHUB_ACTIONS === "true" ? "/WEB" : "";

/*
 * Hash scenes of the world shell — interaction states, not
 * documents (see LivingShell.tsx SCENES). Legal hrefs on the home
 * route; never sitemap entries; exempt from in-page anchor
 * resolution because the shell handles them through SceneUrlSync.
 */
const SCENE_HASHES = new Set([
  "home",
  "about",
  "systems",
  "magic",
  "work",
  "library"
]);

/*
 * STATIC CONTENT ROUTES (v3.1) — the real indexable documents beyond
 * the blog: the identity/portfolio pages and the topic hubs. Must
 * mirror the route tree (app/<route>/) and the sitemap generator's
 * STATIC_CONTENT_ROUTES list in scripts/build-blog.mjs. All three
 * are cross-checked here: a route exported but absent from the
 * sitemap (or vice versa) fails the build, and every route below is
 * verified for metadata, structured data, and graph connectivity.
 */
const CONTENT_ROUTES = [
  { route: "about", title: "About — Parsa Tak", types: ["WebSite", "Person", "ProfilePage", "BreadcrumbList"] },
  { route: "work", title: "Selected Work — Parsa Tak", types: ["WebSite", "Person", "WebPage", "ItemList", "BreadcrumbList"] },
  { route: "research", title: "Research — Parsa Tak", types: ["WebSite", "Person", "WebPage", "BreadcrumbList"] },
  { route: "contact", title: "Contact — Parsa Tak", types: ["WebSite", "Person", "WebPage", "BreadcrumbList"] },
  { route: "local-ai", title: "Local AI Systems & Agents — Parsa Tak", types: ["WebSite", "Person", "WebPage", "BreadcrumbList"] },
  { route: "ai-systems", title: "AI Systems Engineering & Frameworks — Parsa Tak", types: ["WebSite", "Person", "WebPage", "BreadcrumbList"] },
  { route: "ai-reasoning", title: "AI Reasoning Architectures — Parsa Tak", types: ["WebSite", "Person", "WebPage", "BreadcrumbList"] },
  { route: "ai-evaluation", title: "AI Evaluation, Benchmarks & Measurement — Parsa Tak", types: ["WebSite", "Person", "WebPage", "BreadcrumbList"] },
  { route: "software-engineering", title: "Software Engineering Notes & Systems — Parsa Tak", types: ["WebSite", "Person", "WebPage", "BreadcrumbList"] },
  { route: "creative-technology", title: "Creative Technology & the Living Web — Parsa Tak", types: ["WebSite", "Person", "WebPage", "BreadcrumbList"] }
];

const failures = [];
const checks = [];

function fail(message) {
  failures.push(message);
}

function pass(message) {
  checks.push(message);
}

function requireString(haystack, needle, label, file) {
  if (!haystack.includes(needle)) {
    fail(`${file}: missing ${label} (expected "${needle}")`);
    return false;
  }
  return true;
}

/* Decode the small set of entities Next escapes into <title>. */
function decodeEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'");
}

function extractMatch(haystack, pattern, label, file) {
  const match = haystack.match(pattern);
  if (!match) {
    fail(`${file}: could not extract ${label}`);
    return null;
  }
  return match[1];
}

function extractJsonLdBlocks(html) {
  const blocks = [];
  const pattern = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    blocks.push(match[1]);
  }
  return blocks;
}

async function readText(relativePath) {
  return readFile(path.join(OUT_DIR, relativePath), "utf8");
}

/*
 * Visible-text projection: strip scripts, styles, and markup so the
 * checks below read exactly what a crawler's renderer sees before
 * any JavaScript runs.
 */
function toVisibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");
}

/* -------------------------------------------------------------------------- */

async function verifyPage(route, file, expectations) {
  if (!existsSync(path.join(OUT_DIR, file))) {
    fail(`${route}: exported file missing: ${file}`);
    return;
  }

  const html = await readText(file);

  /*
   * RSS must not exist anywhere (v2.5). The blog deliberately has no
   * feed: no autodiscovery <link>, no feed.xml href, nothing.
   */
  if (html.includes("application/rss+xml")) {
    fail(`${route}: RSS autodiscovery found (RSS was removed in v2.5)`);
  }
  if (html.includes("feed.xml")) {
    fail(`${route}: reference to feed.xml found (RSS was removed in v2.5)`);
  }

  /* Exactly one <title> */
  const titleMatches = html.match(/<title[^>]*>([\s\S]*?)<\/title>/g) ?? [];
  const titleText =
    titleMatches.length === 1
      ? decodeEntities(titleMatches[0].replace(/<\/?title[^>]*>/g, ""))
      : null;
  if (titleMatches.length !== 1) {
    fail(`${route}: expected exactly one <title>, found ${titleMatches.length}`);
  } else if (expectations.title && titleText !== expectations.title) {
    fail(`${route}: title is "${titleText}", expected "${expectations.title}"`);
  } else {
    pass(`${route}: one <title> "${titleText ?? "(present)"}"`);
  }

  /* Description */
  const description = extractMatch(
    html,
    /<meta name="description" content="([^"]*)"/,
    "meta description",
    file
  );
  if (description) {
    if (description.trim() === "") {
      fail(`${route}: empty meta description`);
    } else if (expectations.description && description !== expectations.description) {
      fail(`${route}: description mismatch — expected "${expectations.description}" got "${description}"`);
    } else {
      pass(`${route}: meta description present`);
    }
  }

  /* Canonical */
  const canonical = extractMatch(
    html,
    /<link rel="canonical" href="([^"]*)"/,
    "canonical link",
    file
  );
  if (canonical) {
    const expected = expectations.canonical;
    if (canonical !== expected) {
      fail(`${route}: canonical is "${canonical}", expected "${expected}"`);
    } else if (!/^https:\/\/parsaetak\.github\.io\/WEB\//.test(canonical)) {
      fail(`${route}: canonical is not a production HTTPS URL: "${canonical}"`);
    } else {
      pass(`${route}: canonical ${canonical}`);
    }
  }

  /* Open Graph URL */
  const ogUrl = extractMatch(html, /<meta property="og:url" content="([^"]*)"/, "og:url", file);
  if (ogUrl && !ogUrl.startsWith(SITE_ORIGIN)) {
    fail(`${route}: og:url is not production: "${ogUrl}"`);
  }

  /* OG image present and production-resolvable */
  const ogImage = extractMatch(html, /<meta property="og:image" content="([^"]*)"/, "og:image", file);
  if (ogImage) {
    if (!ogImage.startsWith(SITE_ORIGIN)) {
      fail(`${route}: og:image is not an absolute production URL: "${ogImage}"`);
    } else {
      const assetPath = ogImage.replace(SITE_ORIGIN, "");
      if (!existsSync(path.join(OUT_DIR, assetPath.replace(/^\//, "")))) {
        fail(`${route}: og:image asset missing from export: ${assetPath}`);
      } else {
        pass(`${route}: og:image ${assetPath}`);
      }
    }
  } else {
    fail(`${route}: og:image missing`);
  }

  /* Robots policy (Next emits "index, follow") */
  if (!/<meta name="robots" content="index,\s?follow"\/>/.test(html)) {
    fail(`${route}: missing robots meta (expected index,follow)`);
  } else {
    pass(`${route}: robots meta index,follow`);
  }

  /*
   * SEARCH CONSOLE VERIFICATION (v2.9): every canonical page must
   * carry the exact google-site-verification meta tag, exactly once,
   * with the token byte-preserved. Disappearing or mutated tokens are
   * a build failure — the tag is the site's ownership proof for
   * Google Search Console.
   */
  const verificationPattern = new RegExp(
    `<meta name="google-site-verification" content="${GOOGLE_SITE_VERIFICATION}"\\s*/>`,
    "g"
  );
  const verificationCount = (html.match(verificationPattern) ?? []).length;
  if (verificationCount !== 1) {
    fail(
      `${route}: google-site-verification meta tag must appear exactly once with the exact token (found ${verificationCount})`
    );
  } else {
    pass(`${route}: google-site-verification token present and exact`);
  }

  /* JSON-LD validity + expected types */
  const blocks = extractJsonLdBlocks(html);
  if (blocks.length === 0) {
    fail(`${route}: no JSON-LD emitted`);
  }

  const presentTypes = new Set();
  for (const block of blocks) {
    let parsed;
    try {
      parsed = JSON.parse(block);
    } catch (error) {
      fail(`${route}: JSON-LD does not parse: ${error.message}`);
      continue;
    }

    const graph = parsed["@graph"] ?? [parsed];
    for (const node of graph) {
      const type = node?.["@type"];
      if (typeof type === "string") {
        presentTypes.add(type);
      }
    }

    /* No localhost / undefined anywhere inside structured data */
    if (block.includes("localhost") || block.includes("/blog/undefined")) {
      fail(`${route}: JSON-LD contains forbidden URL fragments`);
    }
  }

  for (const expectedType of expectations.types) {
    if (!presentTypes.has(expectedType)) {
      fail(`${route}: expected ${expectedType} structured data, found [${[...presentTypes].join(", ")}]`);
    }
  }
  if (expectations.types.length > 0) {
    pass(`${route}: structured data [${expectations.types.join(", ")}] valid`);
  }

  /* Forbidden strings anywhere in the document head area */
  if (html.includes("localhost")) {
    fail(`${route}: page references localhost`);
  }
  if (html.includes("/blog/undefined")) {
    fail(`${route}: page references /blog/undefined`);
  }
}

/* -------------------------------------------------------------------------- */

async function collectArticleRoutes() {
  const blogDir = path.join(OUT_DIR, "blog");
  const entries = await readdir(blogDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && entry.name !== "images")
    .map((entry) => entry.name)
    .sort();
}

/* -------------------------------------------------------------------------- */
/* Interaction audit (v2.4)                                                    */
/* -------------------------------------------------------------------------- */

async function collectHtmlFiles(dir, base = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectHtmlFiles(full, base)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(path.relative(base, full));
    }
  }
  return files.sort();
}

/*
 * Interaction audit (v2.4).
 *
 * Hash scene hrefs (#magic, #systems, …) are interaction states of
 * the home route — legal hrefs, never sitemap entries. In-page
 * anchors (#top) are likewise legal. Everything else must resolve.
 */
async function verifyInteractivity() {
  const htmlFiles = await collectHtmlFiles(OUT_DIR);
  if (htmlFiles.length === 0) {
    fail("interaction: no exported HTML files found");
    return;
  }

  let hrefsChecked = 0;
  let fragmentsChecked = 0;
  let labelIssues = 0;

  for (const file of htmlFiles) {
    const html = await readFile(path.join(OUT_DIR, file), "utf8");
    const label = file;

    /* Dead anchor targets */
    if (/\shref="#["\s>]/.test(html)) {
      fail(`${label}: dead href="#" found (placeholder destination)`);
    }
    if (/\shref="["\s>]/.test(html)) {
      fail(`${label}: empty href found`);
    }
    if (/href="javascript:/i.test(html)) {
      fail(`${label}: javascript: URL found`);
    }

    /* Every href must be absolute-external or resolvable-internal */
    const hrefs = [...html.matchAll(/\shref="([^"]*)"/g)].map((match) =>
      decodeEntities(match[1])
    );

    /*
     * SAME-PAGE FRAGMENT VALIDATION (v2.5.2): every in-document
     * anchor (`href="#section"` — TOC links, heading self-links)
     * must point at a REAL id in the same document. A heading rename
     * that breaks a deep-link is now a build failure, not a silent
     * dead anchor. (Bare `href="#"` placeholders are already
     * rejected above.)
     */
    const documentIds = new Set(
      [...html.matchAll(/\sid="([^"]+)"/g)].map((match) =>
        decodeEntities(match[1])
      )
    );

    for (const href of hrefs) {
      if (href.startsWith("#") && href.length > 1) {
        /*
         * SCENE HASHES (v2.7): #home, #about, #systems, #magic,
         * #work, #library are interaction states of the world shell
         * handled by SceneUrlSync — the same-document hash links the
         * shell's own navigation emits. They are not document
         * anchors and are exempt from in-page id resolution (they
         * were invisible to this check before the home scene became
         * server-rendered in v2.7).
         */
        if (SCENE_HASHES.has(href.slice(1))) {
          continue;
        }
        fragmentsChecked += 1;
        if (!documentIds.has(href.slice(1))) {
          fail(`${label}: in-page href "${href}" matches no id in the document`);
        }
      }
    }

    for (const href of hrefs) {
      hrefsChecked += 1;

      if (
        /^https?:\/\//i.test(href) ||
        /^mailto:/i.test(href) ||
        href.startsWith("#")
      ) {
        continue;
      }

      /*
       * Root-relative path. Strip the deployment basePath first (CI
       * hrefs are /WEB/… while out/ holds the un-prefixed tree),
       * then drop any fragment/query before resolving to a file.
       */
      const unbased = BASE_PATH !== "" && href.startsWith(BASE_PATH)
        ? href.slice(BASE_PATH.length)
        : href;
      const clean = unbased.split("#")[0].split("?")[0];
      if (clean === "" || clean === "/") {
        continue;
      }

      const target = path.join(OUT_DIR, clean.replace(/^\//, ""));
      const targetDir = `${target}${target.endsWith("/") ? "" : "/"}`;
      const indexCandidates = [
        target.endsWith("/") ? `${target}index.html` : target,
        targetDir.length > 0 ? `${targetDir}index.html` : null,
        target
      ].filter(Boolean);

      if (!indexCandidates.some((candidate) => existsSync(candidate))) {
        fail(`${label}: internal href does not resolve to an exported route: "${href}"`);
      }
    }

    /* Uppercase label-style text must not end with a terminal "." */
    const labelMatches = html.match(
      />([^<>{}]*[A-Z]{2,}[^<>{}]*?)\.+</g
    );
    if (labelMatches) {
      for (const match of labelMatches) {
        const text = match.slice(1, -2).trim();
        /*
         * Only flag text that is essentially label-case: letters,
         * digits, spaces, and separators, dominated by uppercase
         * words (prose sentences are sentence-case and never match).
         */
        if (
          /^[A-Z0-9][A-Z0-9 ·,/&—–-]*(?:\s+[A-Z0-9][A-Z0-9 ·,/&—–-]*)*$/.test(
            text
          ) &&
          (text.match(/[A-Z]/g) ?? []).length >
            (text.match(/[a-z]/g) ?? []).length
        ) {
          fail(`${label}: uppercase label ends with a terminal period: "${text}."`);
          labelIssues += 1;
        }
      }
    }
  }

  /*
   * MEDIA EXISTENCE (v2.8.1): every internal <img src> and favicon
   * reference in the export must point at a file that actually ships.
   * Broken image references were previously invisible to this
   * pipeline (href auditing never looked at src attributes) — a
   * renamed or deleted asset is now a build failure instead of a
   * silent 404 for visitors and crawlers.
   */
  let mediaChecked = 0;

  for (const file of htmlFiles) {
    const html = await readFile(path.join(OUT_DIR, file), "utf8");
    const label = file;
    const srcs = [...html.matchAll(/\ssrc="([^"]+)"/g)].map((match) =>
      decodeEntities(match[1])
    );

    for (const src of srcs) {
      if (!/\.(png|jpe?g|svg|webp|avif|gif|ico)(\?|$)/i.test(src)) {
        continue;
      }

      if (/^(https?:)?\/\//i.test(src) || src.startsWith("data:")) {
        continue;
      }

      mediaChecked += 1;

      const unbased =
        BASE_PATH !== "" && src.startsWith(BASE_PATH)
          ? src.slice(BASE_PATH.length)
          : src;
      const clean = unbased.split("?")[0].split("#")[0];

      if (!existsSync(path.join(OUT_DIR, clean.replace(/^\//, "")))) {
        fail(`${label}: image src does not resolve to an exported file: "${src}"`);
      }
    }
  }

  pass(
    `interaction: ${htmlFiles.length} page(s), ${hrefsChecked} href(s) audited, ${fragmentsChecked} in-page fragment(s), ${mediaChecked} media reference(s) resolved — no dead anchors${labelIssues === 0 ? ", no label punctuation violations" : ""}`
  );
}

async function verifySitemap(articleRoutes) {
  if (!existsSync(path.join(OUT_DIR, "sitemap.xml"))) {
    fail("sitemap.xml: missing from export");
    return;
  }

  const xml = await readText("sitemap.xml");

  if (!xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) {
    fail("sitemap.xml: unexpected urlset namespace");
  }

  const locs = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((match) => match[1]);
  const expected = [
    `${SITE_ORIGIN}/`,
    `${SITE_ORIGIN}/blog/`,
    /* Static content routes (v3.1): /about/, /work/, topic hubs. */
    ...CONTENT_ROUTES.map((entry) => `${SITE_ORIGIN}/${entry.route}/`),
    ...articleRoutes.map((slug) => `${SITE_ORIGIN}/blog/${slug}/`)
  ].sort();

  const actual = [...locs].sort();

  if (actual.length !== expected.length || actual.some((url, index) => url !== expected[index])) {
    fail(`sitemap.xml: URL set does not match exported routes\n    sitemap: ${actual.join(", ")}\n    routes:  ${expected.join(", ")}`);
  } else {
    pass(`sitemap.xml: ${actual.length} URLs match exported routes`);
  }

  for (const url of locs) {
    if (!/^https:\/\/parsaetak\.github\.io\/WEB(\/|$)/.test(url)) {
      fail(`sitemap.xml: non-production URL "${url}"`);
    }
  }

  const lastmods = [...xml.matchAll(/<lastmod>([^<]*)<\/lastmod>/g)].map((match) => match[1]);
  for (const lastmod of lastmods) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(lastmod)) {
      fail(`sitemap.xml: invalid lastmod "${lastmod}"`);
    }
  }

  /* lastmod must reflect article dates, not the build date */
  const postsIndex = JSON.parse(
    await readFile(path.join(ROOT, "data", "blog", "posts.json"), "utf8")
  );
  for (const post of postsIndex.posts) {
    const entry = `<loc>${SITE_ORIGIN}/blog/${post.slug}/</loc><lastmod>${post.updated ?? post.date}</lastmod>`;
    if (!xml.replace(/\s+/g, "").includes(entry.replace(/\s+/g, ""))) {
      fail(`sitemap.xml: ${post.slug} lastmod does not match its content date`);
    }
  }
}

async function verifyRobots() {
  if (!existsSync(path.join(OUT_DIR, "robots.txt"))) {
    fail("robots.txt: missing from export");
    return;
  }

  const robots = await readText("robots.txt");
  requireString(robots, "User-agent: *", "User-agent directive", "robots.txt");
  requireString(robots, "Allow: /", "Allow directive", "robots.txt");
  requireString(robots, `Sitemap: ${SITE_ORIGIN}/sitemap.xml`, "Sitemap directive", "robots.txt") &&
    pass("robots.txt: crawlable, sitemap identified");
}

async function verifyNoRss() {
  /*
   * RSS removal (v2.5) — verified positively: the export contains NO
   * feed.xml, NO RSS XML, and no residual feed references in any
   * served artifact (HTML, sitemap, robots, deployment manifest).
   */
  if (existsSync(path.join(OUT_DIR, "blog", "feed.xml"))) {
    fail("blog/feed.xml: still present in export (RSS was removed in v2.5)");
  } else {
    pass("blog/feed.xml: absent from export as intended");
  }

  const htmlFiles = await collectHtmlFiles(OUT_DIR);
  let rssRefs = 0;

  for (const file of htmlFiles) {
    const html = await readFile(path.join(OUT_DIR, file), "utf8");
    if (html.includes("application/rss+xml") || html.includes("feed.xml")) {
      fail(`${file}: residual RSS reference found`);
      rssRefs += 1;
    }
  }

  if (rssRefs === 0) {
    pass(`RSS: no references in ${htmlFiles.length} exported page(s)`);
  }

  const sitemap = existsSync(path.join(OUT_DIR, "sitemap.xml"))
    ? await readText("sitemap.xml")
    : "";
  if (sitemap.includes("feed.xml")) {
    fail("sitemap.xml: feed URL found (RSS was removed in v2.5)");
  }

  const robots = existsSync(path.join(OUT_DIR, "robots.txt"))
    ? await readText("robots.txt")
    : "";
  if (robots.includes("feed")) {
    fail("robots.txt: feed reference found (RSS was removed in v2.5)");
  }
}

/*
 * HOME CONTENT VERIFICATION (v2.7, tightened v3.0).
 *
 * The home scene is now server-rendered into the static export, so
 * its semantic content is crawlable. This check proves the
 * information-priority release actually shipped: one meaningful h1,
 * the capability vocabulary, the featured project names, the
 * workflow stages, and crawlable links to the real destinations.
 * It reads the same exported HTML a search engine receives.
 *
 * v3.0 additions — the P0 crawlability guarantees:
 * - the h1 must sit INSIDE <main> in the real DOM, not inside a
 *   React streamed-Suspense completion wrapper (<div hidden id="S:0">)
 *   and not inside a <template> or script payload;
 * - the visible <main> surface itself must carry the core content,
 *   independent of what the flight data contains.
 */
async function verifyHomeContent(articleRoutes) {
  const html = await readFile(path.join(OUT_DIR, "index.html"), "utf8");

  const visible = toVisibleText(html);

  /*
   * P0 (v3.0): the visible document — the part a search engine's
   * renderer and every social scraper see before any JavaScript —
   * is the <main>…</main> slice with scripts stripped. The home
   * scene's core message must live THERE, verbatim.
   */
  const mainMatch = html.match(/<main[\s\S]*?<\/main>/);
  const mainVisible = toVisibleText(mainMatch ? mainMatch[0] : "");

  if (!mainMatch) {
    fail("home: no <main> element found in exported HTML");
  }

  const h1Matches = html.match(/<h1[^>]*>/g) ?? [];
  if (h1Matches.length !== 1) {
    fail(`home: expected exactly one h1, found ${h1Matches.length}`);
  } else {
    pass("home: exactly one h1 in exported HTML");
  }

  /*
   * P0 (v3.0): React's streamed-Suspense completion lands in a
   * <div hidden id="S:0"> wrapper. Its presence means the visible
   * document shipped a loading gate instead of content.
   */
  if (/<div hidden id="S:0">/.test(html)) {
    fail(
      "home: streamed Suspense wrapper <div hidden id=\"S:0\"> found — home scene content is not in the visible document"
    );
  } else {
    pass("home: no hidden streamed-Suspense wrapper (content renders inline)");
  }

  const h1InMain = /<main[^>]*>[\s\S]*?<h1[\s\S]*?<\/main>/.test(html);
  if (!h1InMain) {
    fail("home: h1 is not inside <main> in the exported HTML");
  } else {
    pass("home: h1 renders inside <main> (visible initial document)");
  }

  const requiredPhrases = [
    ["identity", "PARSA TAK"],
    ["identity roles", "SOFTWARE ENGINEER"],
    ["identity roles", "PRODUCT BUILDER"],
    ["identity roles", "AI SYSTEMS RESEARCHER"],
    ["capability", "AI systems"],
    ["capability", "Reasoning"],
    ["capability", "Software"],
    ["capability", "Product building"],
    ["capability section", "What I can do"],
    ["capability term", "Local AI"],
    /*
     * v3.5: the home capabilities grid is exactly eight entries
     * (4 + 4). "Creative technology" was consolidated out of the
     * grid — it keeps its dedicated /creative-technology/ topic hub
     * and RED MAGIC presentation — so this check pins "System
     * architecture", a term that must remain visible in the grid.
     */
    ["capability term", "System architecture"],
    ["projects section", "What I have actually built"],
    ["project name", "SHEYTAN Local Agent"],
    ["project name", "Universal Human Intelligence Test"],
    ["project name", "FreeIran"],
    ["project name", "RED MAGIC"],
    ["workflow section", "How I work"],
    ["workflow stage", "RESEARCH"],
    ["workflow stage", "PRODUCT DIRECTION"],
    ["workflow stage", "ARCHITECTURE"],
    ["workflow stage", "IMPLEMENTATION"],
    ["workflow stage", "TESTING"],
    ["workflow stage", "VERIFICATION"],
    ["workflow stage", "DELIVERY"]
  ];

  for (const [kind, phrase] of requiredPhrases) {
    if (!visible.includes(phrase)) {
      fail(`home: ${kind} phrase missing from visible HTML: "${phrase}"`);
    }
  }

  if (!failures.some((entry) => entry.startsWith("home:"))) {
    pass(
      `home: ${requiredPhrases.length} capability/project/workflow phrase(s) present in visible HTML`
    );
  }

  /*
   * P0 (v3.0): the core professional message must be present in
   * the VISIBLE main document — not merely in the flight payload.
   * These are the same phrases the mission defines as the minimum
   * crawlable home content.
   */
  const mainRequiredPhrases = [
    ["h1", "AI systems"],
    ["positioning", "SOFTWARE ENGINEER"],
    ["positioning", "I research intelligence"],
    ["capabilities", "What I can do"],
    ["featured work", "SHEYTAN Local Agent"],
    ["featured work", "FreeIran"],
    ["writing section", "Field notes"],
    ["writing section", "Open the Blog"],
    ["contact CTA", "Email Parsa Tak"]
  ];

  for (const [kind, phrase] of mainRequiredPhrases) {
    if (!mainVisible.includes(phrase)) {
      fail(`home: ${kind} missing from visible <main> content: "${phrase}"`);
    }
  }

  if (
    !failures.some((entry) =>
      entry.includes("missing from visible <main> content")
    )
  ) {
    pass(
      `home: ${mainRequiredPhrases.length} core phrase(s) present in visible <main> before JavaScript`
    );
  }

  verifyWritingLinks(html, articleRoutes);

  /* Crawlable destinations from the home scene. */
  const requiredHrefs = [
    "https://github.com/Parsaetak/SHEYTAN-local-agent",
    "https://github.com/Parsaetak/FreeIran",
    "https://github.com/Parsaetak/WEB",
    "https://github.com/Parsaetak/Contents/tree/AI-Tests"
  ];

  for (const href of requiredHrefs) {
    if (!html.includes(`href="${href}"`)) {
      fail(`home: crawlable destination missing: ${href}`);
    }
  }

  if (!failures.some((entry) => entry.includes("crawlable destination"))) {
    pass("home: repository destinations crawlable in exported HTML");
  }
}

/*
 * WRITING-LINK VERIFICATION (v3.0, basePath-aware).
 *
 * The home route must link real articles with descriptive
 * destinations, not just the blog index.
 *
 * The href pattern is built from BASE_PATH — the same source of
 * truth next.config.ts and build-blog.mjs use — so the check sees
 * the links exactly as crawlers receive them in both deployment
 * shapes:
 *   local:        /blog/<slug>/
 *   GitHub Pages: /WEB/blog/<slug>/
 *
 * Every detected href must resolve to an article route actually
 * present in the export: a renamed or deleted slug, `/blog/undefined`,
 * or any malformed target is a failure, not a silent dead link.
 */
const HOME_WRITING_MIN_LINKS = 3;

const ARTICLE_SLUG_PATTERN = "[a-z0-9-]+";

function verifyWritingLinks(html, articleRoutes) {
  const articleHref = new RegExp(
    `href="(${BASE_PATH}/blog/${ARTICLE_SLUG_PATTERN}/)"`,
    "g"
  );
  const writingHrefs = [...html.matchAll(articleHref)].map(
    (match) => match[1]
  );

  if (writingHrefs.length < HOME_WRITING_MIN_LINKS) {
    fail(
      `home: expected ≥${HOME_WRITING_MIN_LINKS} crawlable article links from the Writing section, found ${writingHrefs.length}`
    );
    return;
  }

  const exportedSlugs = new Set(articleRoutes);

  const invalid = writingHrefs.filter((href) => {
    if (href.includes("localhost") || href.includes("/blog/undefined")) {
      return true;
    }
    /* Strip the deployment prefix and route prefix to the raw slug. */
    const slug = href
      .slice(BASE_PATH.length)
      .replace(/^\/blog\//, "")
      .replace(/\/$/, "");
    return !exportedSlugs.has(slug);
  });

  if (invalid.length > 0) {
    for (const href of invalid) {
      fail(`home: writing link does not resolve to an exported article route: ${href}`);
    }
    return;
  }

  pass(
    `home: ${writingHrefs.length} crawlable article link(s) in home HTML, all resolve to exported routes`
  );
}

/*
 * FAVICON FAMILY (v2.9): the export must carry the complete brand
 * icon set built from the 13-point star, and the home page HTML must
 * link every piece of it. Google surfaces favicons in search when the
 * icon is crawlable, square, stable, and larger than minimum — the
 * checks below keep that true.
 */
async function verifyFaviconFamily() {
  const requiredIcons = [
    { file: "icon.svg", label: "SVG favicon (public/icon.svg)" },
    { file: "icon.png", label: "PNG favicon fallback (192×192)" },
    { file: "favicon.ico", label: "legacy multi-size favicon" },
    { file: "apple-icon.png", label: "Apple touch icon (180×180)" }
  ];

  for (const icon of requiredIcons) {
    if (!existsSync(path.join(OUT_DIR, icon.file))) {
      fail(`${icon.file}: ${icon.label} missing from export`);
    } else {
      pass(`${icon.file}: ${icon.label} present in export`);
    }
  }

  const html = await readText("index.html");
  /*
   * The icon link set must be complete AND correctly prefixed: Next
   * emits metadata.icons hrefs verbatim (metadataBase does not apply),
   * so under the /WEB deployment the hrefs must carry the basePath —
   * an unprefixed href would 404 on GitHub Pages.
   */
  const linkExpectations = [
    { file: "favicon.ico", label: "favicon.ico icon link" },
    { file: "icon.svg", label: "SVG icon link" },
    { file: "icon.png", label: "PNG icon link" },
    { file: "apple-icon.png", label: "apple-touch-icon link" }
  ];

  for (const expectation of linkExpectations) {
    const hrefPattern = new RegExp(
      `<link rel="(?:icon|apple-touch-icon)"[^>]*href="${BASE_PATH}/${expectation.file.replace(/\./g, "\\.")}"`,
      ""
    );
    if (!hrefPattern.test(html)) {
      fail(
        `home: ${expectation.label} missing or not basePath-prefixed (expected href="${BASE_PATH}/${expectation.file}")`
      );
    } else {
      pass(`home: ${expectation.label} present (${BASE_PATH}/${expectation.file})`);
    }
  }
}

/*
 * BRAND ASSETS IN EXPORT (v2.9): the generated brand system must
 * actually ship — star variants, the glyph library, and the project
 * artwork the home scene references.
 */
async function verifyBrandAssetsInExport() {
  const requiredRuntime = [
    "brand/star-red.svg",
    "brand/star-red-hot.svg",
    "brand/star-white.svg",
    "brand/star-outline-red.svg",
    "brand/star-silver.svg",
    "images/projects/sheytan-agent-lab.svg",
    "images/projects/uhit-intelligence-scale.svg",
    "images/projects/freeiran-vpn-mesh.svg",
    "images/projects/red-magic-organism.svg",
    "images/projects/web-static-living-system.svg"
  ];

  for (const asset of requiredRuntime) {
    if (!existsSync(path.join(OUT_DIR, asset))) {
      fail(`brand asset missing from export: ${asset}`);
    }
  }

  const iconCount = existsSync(path.join(OUT_DIR, "brand", "icons"))
    ? (await readdir(path.join(OUT_DIR, "brand", "icons"))).filter((name) => name.endsWith(".svg")).length
    : 0;
  if (iconCount < 14) {
    fail(`brand glyph library incomplete in export: ${iconCount}/14 icons`);
  }

  if (failures.length === 0 || !failures.some((entry) => entry.startsWith("brand asset missing") || entry.startsWith("brand glyph library"))) {
    pass(
      `brand assets: ${requiredRuntime.length} runtime asset(s) + ${iconCount} glyph(s) ship in the export`
    );
  }
}

/*
 * INTERNAL LINK GRAPH AUDIT (v3.0).
 *
 * Mission §7: identify orphan pages and weak links, and validate
 * that internal links resolve. This audit:
 *  1. FAILS on any internal href in the exported HTML that points
 *     to an article slug or scene hash that does not exist
 *     (broken internal links);
 *  2. FAILS on accidental repository-clone URLs and localhost
 *     destinations;
 *  3. REPORTS the inbound internal-link count per article from the
 *     build-time graph plus the exported HTML, and WARNs on zero-
 *     inbound articles without failing the build (warnings must be
 *     fixed with real links, never artificial ones).
 */
async function verifyInternalLinkGraph(articleRoutes) {
  /*
   * collectHtmlFiles() (defined with the v2.4 interaction audit)
   * returns export-relative HTML paths (index.html, blog/<slug>/
   * index.html, …). Reuse it — one file-walk across the script.
   */
  const htmlFiles = await collectHtmlFiles(OUT_DIR);

  /*
   * BasePath tolerance: the export rewrites internal hrefs to carry
   * the /WEB prefix when building for GitHub Pages. The audit must
   * accept both shapes — BASE_PATH mirrors next.config.ts /
   * build-blog.mjs and is the single source of truth in this script.
   */
  const internalHrefs = new Set();

  const broken = [];

  const articleSlugSet = new Set(articleRoutes);

  for (const relFile of htmlFiles) {
    const file = path.join(OUT_DIR, relFile);

    const html = await readFile(file, "utf8");

    const hrefs = [
      ...html.matchAll(/href="([^"]+)"/g)
    ].map((match) => match[1]);

    for (const href of hrefs) {
      if (href.startsWith("http://localhost") || href.includes("127.0.0.1")) {
        broken.push(`${relFile}: localhost link ${href}`);
        continue;
      }

      if (href.startsWith("git@") || href.endsWith(".git")) {
        broken.push(`${relFile}: repository-clone URL ${href}`);
        continue;
      }

      const articleMatch = href.match(
        new RegExp(`^${BASE_PATH}/blog/([a-z0-9-]+)/?$`)
      );

      if (articleMatch) {
        internalHrefs.add(`blog/${articleMatch[1]}`);

        if (!articleSlugSet.has(articleMatch[1])) {
          broken.push(
            `${relFile}: link to unknown article ${href}`
          );
        }

        continue;
      }

      const sceneMatch = href.match(
        new RegExp(`^${BASE_PATH}/?#([a-z]+)$`)
      );

      if (sceneMatch && !SCENE_HASHES.has(sceneMatch[1]) && sceneMatch[1] !== "top") {
        broken.push(
          `${relFile}: link to unknown scene ${href}`
        );
      }
    }
  }

  if (broken.length > 0) {
    for (const entry of broken) {
      fail(`link graph: ${entry}`);
    }
  } else {
    pass(
      `link graph: all internal article/scene hrefs across ${htmlFiles.length} exported page(s) resolve`
    );
  }

  /*
   * Inbound report: build-time body links + template edges
   * (project chips / scene chips / writing section are all real
   * anchors in the exported HTML, so the HTML scan above catches
   * them — the per-slug count below reuses the same set).
   */
  const inboundCounts = {};

  for (const slug of articleRoutes) {
    inboundCounts[slug] = 0;
  }

  for (const href of internalHrefs) {
    const slug = href.replace(/^blog\//, "");

    if (slug in inboundCounts) {
      inboundCounts[slug] += 1;
    }
  }

  const orphans = articleRoutes.filter(
    (slug) => (inboundCounts[slug] ?? 0) === 0
  );

  for (const slug of articleRoutes) {
    console.log(
      `  · link graph: /blog/${slug}/ has ${inboundCounts[slug]} inbound internal link(s)`
    );
  }

  if (orphans.length > 0) {
    console.warn(
      `[seo] WARNING — ${orphans.length} article(s) with zero inbound internal links (fix with real links, never artificial ones): ${orphans.join(", ")}`
    );
  } else {
    pass("link graph: no orphan articles — every article has ≥1 inbound internal link");
  }
}

/* -------------------------------------------------------------------------- */
/* Content route verification + graph (v3.1)                                   */
/* -------------------------------------------------------------------------- */

/*
 * CONTENT GRAPH (v3.1) — the static content documents must be a
 * connected, crawlable part of the site, never SEO islands.
 * Deliberately concise: the checks below cover only the NEW
 * invariants (existence/metadata/graph for the content routes);
 * everything else continues to run through the existing groups.
 */
async function verifyContentGraph() {
  const failureCountBefore = failures.length;

  const htmlFiles = await collectHtmlFiles(OUT_DIR);

  const pages = [];
  for (const file of htmlFiles) {
    pages.push({
      file,
      html: await readFile(path.join(OUT_DIR, file), "utf8")
    });
  }

  const routeHref = (route) => `${BASE_PATH}/${route}/`;
  const routeFile = (route) => path.join(route, "index.html");

  /* Reachability: the home document links every content route. */
  const home = pages.find((page) => page.file === "index.html");

  if (!home) {
    fail("content graph: home page not found in export");
  } else {
    let missing = 0;

    for (const entry of CONTENT_ROUTES) {
      if (!home.html.includes(`href="${routeHref(entry.route)}"`)) {
        fail(
          `content graph: /${entry.route}/ is not linked from the home document (expected href="${routeHref(entry.route)}")`
        );
        missing += 1;
      }
    }

    if (missing === 0) {
      pass(
        `content graph: all ${CONTENT_ROUTES.length} content routes linked from the home document`
      );
    }
  }

  /* Outbound edges: sibling routes on every route, ≥3 articles per hub. */
  /*
   * Hub routes (v3.2) — the six topic hubs, which must link ≥3
   * related articles. The identity/professional routes (about, work,
   * research, contact) are content routes but not hubs, and are
   * therefore exempt from the article-count check.
   */
  const NON_HUB_ROUTES = new Set(["about", "work", "research", "contact"]);

  const hubRoutes = CONTENT_ROUTES.filter(
    (entry) => !NON_HUB_ROUTES.has(entry.route)
  );

  let hubArticleShortfalls = 0;

  let siblingShortfalls = 0;

  for (const entry of CONTENT_ROUTES) {
    const ownPage = pages.find((page) => page.file === routeFile(entry.route));

    if (!ownPage) {
      /* Missing export is already reported by verifyPage(). */
      continue;
    }

    const siblings = new Set(
      [...ownPage.html.matchAll(/href="[^"]*\/([a-z-]+)\/"/g)]
        .map((match) => match[1])
        .filter(
          (slug) =>
            slug !== entry.route &&
            CONTENT_ROUTES.some((candidate) => candidate.route === slug)
        )
    );

    if (siblings.size < 2) {
      fail(
        `content graph: /${entry.route}/ links fewer than 2 sibling content routes (found ${siblings.size})`
      );
      siblingShortfalls += 1;
    }

    if (hubRoutes.some((hub) => hub.route === entry.route)) {
      const articles = new Set(
        [...ownPage.html.matchAll(/href="[^"]*\/blog\/([a-z0-9-]+)\/"/g)].map(
          (match) => match[1]
        )
      );

      if (articles.size < 3) {
        fail(
          `content graph: hub /${entry.route}/ links fewer than 3 related articles (found ${articles.size})`
        );
        hubArticleShortfalls += 1;
      }
    }
  }

  if (siblingShortfalls === 0 && hubArticleShortfalls === 0) {
    pass(
      "content graph: every content route links ≥2 sibling documents; every hub links ≥3 related articles"
    );
  }

  /* Inbound edges: no orphan content route (footer nav carries it site-wide). */
  let orphans = 0;

  for (const entry of CONTENT_ROUTES) {
    const inbound = pages.filter(
      (page) =>
        page.file !== routeFile(entry.route) &&
        page.html.includes(`href="${routeHref(entry.route)}"`)
    );

    if (inbound.length < 3) {
      fail(
        `content graph: /${entry.route}/ has only ${inbound.length} inbound page(s) (expected ≥3 — the footer nav carries every route site-wide)`
      );
      orphans += 1;
    }
  }

  if (orphans === 0) {
    pass(
      "content graph: no orphan content routes (every route has ≥3 inbound pages)"
    );
  }

  /*
   * The group-level passes above must never print alongside
   * failures from this group — belt and braces for report clarity.
   */
  if (failures.length > failureCountBefore) {
    fail(`content graph: ${failures.length - failureCountBefore} content-graph failure(s) listed above`);
  }
}

async function main() {
  if (!existsSync(OUT_DIR)) {
    console.error("[seo] out/ does not exist — run `npm run build` first.");
    process.exit(1);
  }

  const articleRoutes = await collectArticleRoutes();

  const postsIndex = JSON.parse(
    await readFile(path.join(ROOT, "data", "blog", "posts.json"), "utf8")
  );

  const postBySlug = new Map(postsIndex.posts.map((post) => [post.slug, post]));

  /* Duplicate slug check */
  const slugs = postsIndex.posts.map((post) => post.slug);
  if (new Set(slugs).size !== slugs.length) {
    fail("data/blog/posts.json: duplicate article slug detected");
  }

  await verifyPage("home", "index.html", {
    title: "Parsa Tak — Software Engineer, Product Builder & AI Systems Researcher",
    canonical: `${SITE_ORIGIN}/`,
    types: ["WebSite", "Person", "WebPage"]
  });

  await verifyHomeContent(articleRoutes);

  await verifyPage("blog index", path.join("blog", "index.html"), {
    title: "Blog — Parsa Tak",
    canonical: `${SITE_ORIGIN}/blog/`,
    types: ["WebSite", "Person", "Blog"]
  });

  for (const slug of articleRoutes) {
    const post = postBySlug.get(slug);
    if (!post) {
      fail(`blog/${slug}/: exported route has no matching content record`);
      continue;
    }

    await verifyPage(`blog/${slug}/`, path.join("blog", slug, "index.html"), {
      title: `${post.title} — Parsa Tak`,
      canonical: `${SITE_ORIGIN}/blog/${slug}/`,
      /*
       * Articles reference the Blog collection through the
       * /blog/#blog @id interlock — they do not embed the Blog node
       * itself (that lives on /blog/).
       */
      types: ["WebSite", "Person", "BlogPosting", "BreadcrumbList"]
    });

    /* Article-specific structured data: date + author + breadcrumb */
    const html = await readText(path.join("blog", slug, "index.html"));
    const blocks = extractJsonLdBlocks(html);
    for (const block of blocks) {
      const parsed = JSON.parse(block);
      const graph = parsed["@graph"] ?? [parsed];
      const posting = graph.find(
        (node) => node?.["@type"] === "BlogPosting"
      );
      if (!posting) continue;

      if (posting.datePublished !== post.date) {
        fail(`blog/${slug}/: JSON-LD datePublished ${posting.datePublished} != content date ${post.date}`);
      }
      if (posting.dateModified !== (post.updated ?? post.date)) {
        fail(`blog/${slug}/: JSON-LD dateModified does not match content updated/date`);
      }
      if (posting.author?.name !== post.author) {
        fail(`blog/${slug}/: JSON-LD author "${posting.author?.name}" != "${post.author}"`);
      }

      const breadcrumb = graph.find(
        (node) => node?.["@type"] === "BreadcrumbList"
      );
      if (!breadcrumb || !Array.isArray(breadcrumb.itemListElement)) {
        fail(`blog/${slug}/: BreadcrumbList missing or malformed`);
      } else {
        const names = breadcrumb.itemListElement.map((item) => item?.name);
        if (names[0] !== "Home" || names[1] !== "Blog" || names[2] !== post.title) {
          fail(`blog/${slug}/: breadcrumb names [${names.join(" → ")}] do not match Home → Blog → title`);
        }
      }
    }

    /* og article metadata */
    const file = path.join("blog", slug, "index.html");
    requireString(html, `<meta property="article:published_time" content="${post.date}"`, "article:published_time", file);
    requireString(html, `<meta property="article:modified_time" content="${post.updated ?? post.date}"`, "article:modified_time", file);
  }

  for (const entry of CONTENT_ROUTES) {
    await verifyPage(entry.route, path.join(entry.route, "index.html"), {
      title: entry.title,
      canonical: `${SITE_ORIGIN}/${entry.route}/`,
      types: entry.types
    });
  }

  await verifySitemap(articleRoutes);
  await verifyRobots();
  await verifyNoRss();
  await verifyInteractivity();
  await verifyInternalLinkGraph(articleRoutes);
  await verifyContentGraph();

  /* Favicon family + brand assets (v2.9) — checked with the export. */
  await verifyFaviconFamily();
  await verifyBrandAssetsInExport();

  console.log(`\n[seo] ${checks.length} check(s) passed`);
  for (const entry of checks) {
    console.log(`  ✓ ${entry}`);
  }

  if (failures.length > 0) {
    console.error(`\n[seo] ${failures.length} FAILURE(S):`);
    for (const failure of failures) {
      console.error(`  ✗ ${failure}`);
    }
    process.exit(1);
  }

  console.log("\n[seo] static SEO verification passed.");
}

main().catch((error) => {
  console.error("[seo] unexpected verification failure:", error);
  process.exit(1);
});
