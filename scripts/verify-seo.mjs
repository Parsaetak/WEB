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
 * Checks:
 * - every indexable route: exactly one <title>, a meta description,
 *   a canonical link, and a parseable JSON-LD block with the
 *   expected entity types
 * - canonical/og URLs are absolute, HTTPS, production host, and
 *   /WEB-aware (no localhost, no repository URLs, no /blog/undefined)
 * - articles: BlogPosting headline/date/author match the content
 *   index; BreadcrumbList present
 * - sitemap.xml: parses, every <loc> is production HTTPS, and the
 *   URL set equals the actual exported route set
 * - robots.txt: references the production sitemap
 * - RSS absence (v2.5): no feed.xml in the export, no RSS
 *   autodiscovery link, and no feed.xml reference anywhere — the
 *   blog deliberately has no feed, and nothing may half-reference it
 * - interaction audit (v2.4): every exported page is free of dead
 *   anchor targets (href="#", empty href, javascript: URLs), and
 *   every root-relative internal href resolves to an exported file
 *   or a known in-page anchor — no dead navigation ships
 * - text QA (v2.4): uppercase label-style text (kickers, buttons,
 *   nav, status chips) never ends in a terminal "." — the site's
 *   editorial rule is short labels without punctuation, full prose
 *   sentences with it
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

  pass(
    `interaction: ${htmlFiles.length} page(s), ${hrefsChecked} href(s) audited, ${fragmentsChecked} in-page fragment(s) resolved — no dead anchors${labelIssues === 0 ? ", no label punctuation violations" : ""}`
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
 * HOME CONTENT VERIFICATION (v2.7).
 *
 * The home scene is now server-rendered into the static export, so
 * its semantic content is crawlable. This check proves the
 * information-priority release actually shipped: one meaningful h1,
 * the capability vocabulary, the featured project names, the
 * workflow stages, and crawlable links to the real destinations.
 * It reads the same exported HTML a search engine receives.
 */
async function verifyHomeContent() {
  const html = await readFile(path.join(OUT_DIR, "index.html"), "utf8");

  /* Strip tags and scripts to the visible text surface. */
  const visible = html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");

  const h1Matches = html.match(/<h1[^>]*>/g) ?? [];
  if (h1Matches.length !== 1) {
    fail(`home: expected exactly one h1, found ${h1Matches.length}`);
  } else {
    pass("home: exactly one h1 in exported HTML");
  }

  const requiredPhrases = [
    ["identity", "PARSA TAK"],
    ["identity roles", "RESEARCHER"],
    ["capability", "AI systems"],
    ["capability", "Reasoning"],
    ["capability", "Software"],
    ["capability section", "What I can do"],
    ["capability term", "Local AI"],
    ["capability term", "Creative technology"],
    ["projects section", "What I have actually built"],
    ["project name", "SHEYTAN Local Agent"],
    ["project name", "Universal Human Intelligence Test"],
    ["project name", "FreeIran"],
    ["project name", "RED MAGIC"],
    ["workflow section", "How I work"],
    ["workflow stage", "UNDERSTAND"],
    ["workflow stage", "VERIFY"],
    ["workflow stage", "SYNTHESIZE"],
    ["workflow stage", "EVALUATE"]
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
    title: "Parsa Tak — AI Systems, Reasoning, Software & RED MAGIC",
    canonical: `${SITE_ORIGIN}/`,
    types: ["WebSite", "Person", "WebPage"]
  });

  await verifyHomeContent();

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

  await verifySitemap(articleRoutes);
  await verifyRobots();
  await verifyNoRss();
  await verifyInteractivity();

  /* Icon asset */
  if (!existsSync(path.join(OUT_DIR, "icon.svg"))) {
    fail("icon.svg: favicon missing from export");
  } else {
    pass("icon.svg: favicon present in export");
  }

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
