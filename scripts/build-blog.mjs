#!/usr/bin/env node
/*
 * build-blog.mjs — static blog content pipeline.
 *
 * SOURCE (content/blog/*.md)
 *   → PARSE frontmatter
 *   → VALIDATE records (fail loudly: file + reason)
 *   → RENDER markdown to HTML (small trusted subset, fully escaped)
 *   → NORMALIZE (reading time, cover URLs, link basePath)
 *   → INDEX (tags, categories, related, prev/next)
 *   → EMIT data/blog/posts.json + public/blog/feed.xml
 *         + public/sitemap.xml
 *
 * SEO emission law: the sitemap is generated from the SAME content
 * index that produces the site routes — site configuration + blog
 * slugs + real static routes. There is no separately maintained
 * URL list, so the sitemap can never disagree with the site.
 * lastmod values are the articles' own updated/date fields — never
 * "today" — so freshness is never faked.
 *
 * Zero runtime dependencies. Runs before `next dev` and `next build`
 * (see package.json scripts) and inside the deployment workflow.
 *
 * Environment awareness mirrors next.config.ts:
 *   GITHUB_ACTIONS === "true" → basePath "/WEB", otherwise "".
 *
 * A malformed article FAILS the build. A missing/empty content
 * directory is an explicit empty state, not a failure.
 */

import { readdir, readFile, writeFile, mkdir, access } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "..");
const CONTENT_DIR = path.join(ROOT, "content", "blog");
const DATA_DIR = path.join(ROOT, "data", "blog");
const PUBLIC_BLOG_DIR = path.join(ROOT, "public", "blog");

const SITE_URL = "https://parsaetak.github.io/WEB";
const SITE_NAME = "Parsa Tak";
const SITE_DESCRIPTION =
  "Notes from an evolving laboratory for AI systems, reasoning architecture, creative technology, and RED MAGIC.";

const IS_GITHUB_ACTIONS = process.env.GITHUB_ACTIONS === "true";
const BASE_PATH = IS_GITHUB_ACTIONS ? "/WEB" : "";

const BLOG_PATH = `${BASE_PATH}/blog`;
const FEED_URL = `${SITE_URL}/blog/feed.xml`;

/*
 * Root-relative site OG image. Validated below so a missing social
 * image fails the build instead of shipping broken og:image URLs.
 * Root-relative on purpose: og metadata is resolved against the
 * metadataBase (which already contains /WEB), never basePath-prefixed.
 */
const SITE_OG_IMAGE_PATH = "/og-default.png";
const SITE_OG_IMAGE_FILE = path.join(ROOT, "public", "og-default.png");

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const WORDS_PER_MINUTE = 200;
const MAX_RELATED = 2;

/*
 * Search metadata is composed ONCE here instead of being re-derived
 * in the browser on every keystroke. The client island only lowercases
 * the query and checks inclusion against this precomputed haystack.
 */
function buildSearchHaystack(record) {
  return [
    record.title,
    record.subtitle,
    record.excerpt,
    record.category,
    record.author,
    ...(Array.isArray(record.tags) ? record.tags : [])
  ]
    .filter((part) => typeof part === "string" && part.length > 0)
    .join(" ")
    .toLowerCase();
}

const failures = [];

function fail(file, reason) {
  failures.push(`  ${file}\n    ${reason}`);
}

/* -------------------------------------------------------------------------- */
/* Frontmatter parsing                                                        */
/* -------------------------------------------------------------------------- */

function parseScalar(raw) {
  const value = raw.trim();
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+$/.test(value)) {
    return Number.parseInt(value, 10);
  }
  return value;
}

function parseInlineArray(raw) {
  const value = raw.trim();
  if (!(value.startsWith("[") && value.endsWith("]"))) {
    return null;
  }
  const inner = value.slice(1, -1).trim();
  if (inner === "") return [];
  return inner
    .split(",")
    .map((part) => parseScalar(part).toString().trim())
    .filter((part) => part.length > 0);
}

function parseFrontmatter(source) {
  const lines = source.split(/\r?\n/);
  if (lines[0] === undefined || lines[0].trim() !== "---") {
    return { data: {}, body: source };
  }

  const data = {};
  const contextStack = [];

  let index = 1;
  for (; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() === "---") {
      index += 1;
      break;
    }

    const objectMatch = line.match(/^(\s*)([A-Za-z][A-Za-z0-9_-]*):\s*$/);
    if (objectMatch) {
      const depth = Math.floor(objectMatch[1].length / 2);
      contextStack.length = depth;
      contextStack[depth] = objectMatch[2];
      const container =
        depth === 0 ? data : getOrCreate(data, contextStack.slice(0, depth));
      container[objectMatch[2]] = {};
      continue;
    }

    const pairMatch = line.match(/^(\s*)([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (pairMatch) {
      const [, indent, key, rawValue] = pairMatch;
      const depth = Math.floor(indent.length / 2);
      contextStack.length = depth;

      const container =
        depth === 0 ? data : getOrCreate(data, contextStack.slice(0, depth));

      if (rawValue.trim().startsWith("[")) {
        const arrayValue = parseInlineArray(rawValue);
        if (arrayValue !== null) {
          container[key] = arrayValue;
          continue;
        }
      }

      container[key] = parseScalar(rawValue);
    }
  }

  const body = lines.slice(index).join("\n").trim();
  return { data, body };
}

function getOrCreate(root, keys) {
  let node = root;
  for (const key of keys) {
    if (node[key] === undefined) {
      node[key] = {};
    }
    node = node[key];
  }
  return node;
}

/* -------------------------------------------------------------------------- */
/* Markdown rendering (trusted subset, HTML-escaped)                          */
/* -------------------------------------------------------------------------- */

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugifyHeading(text, usedIds) {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  let id = base || "section";
  let counter = 2;
  while (usedIds.has(id)) {
    id = `${base}-${counter}`;
    counter += 1;
  }
  usedIds.add(id);
  return id;
}

function renderInline(text, usedIds) {
  let html = escapeHtml(text);

  /*
   * Links and images are re-injected after escaping so only the
   * approved href/src shapes reach the DOM.
   */
  html = html.replace(
    /!\[([^\]]*)\]\(([^)\s]+)\)/g,
    (match, alt, src) => {
      if (!isSafeUrl(src)) {
        return escapeHtml(match);
      }
      return `<img src="${applyBasePath(src)}" alt="${alt}" loading="lazy" decoding="async" />`;
    }
  );

  html = html.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (match, label, href) => {
      if (!isSafeUrl(href)) {
        return escapeHtml(match);
      }
      const isInternal = href.startsWith("/");
      return `<a href="${applyBasePath(href)}"${isInternal ? "" : ' target="_blank" rel="noreferrer"'}>${label}</a>`;
    }
  );

  html = html.replace(
    /`([^`]+)`/g,
    "<code>$1</code>"
  );

  html = html.replace(
    /\*\*([^*]+)\*\*/g,
    "<strong>$1</strong>"
  );

  html = html.replace(
    /(^|[\s(])\*([^*\s][^*]*)\*/g,
    "$1<em>$2</em>"
  );

  return html;
}

function isSafeUrl(url) {
  if (url.startsWith("#") || url.startsWith("/")) {
    return true;
  }
  return /^https?:\/\//i.test(url) || /^mailto:/i.test(url);
}

/*
 * Root-relative URLs are emitted with the deployment basePath so
 * the generated HTML is correct for the environment being built.
 */
function applyBasePath(url) {
  if (BASE_PATH === "" || !url.startsWith("/")) {
    return url;
  }
  return `${BASE_PATH}${url}`;
}

function renderMarkdown(source) {
  const usedIds = new Set();
  const headings = [];
  const lines = source.split(/\r?\n/);
  const out = [];

  let inCodeBlock = false;
  let codeLanguage = "";
  let codeBuffer = [];
  let paragraphBuffer = [];
  let listType = null;
  let listBuffer = [];
  let quoteBuffer = [];

  function flushParagraph() {
    if (paragraphBuffer.length > 0) {
      out.push(`<p>${renderInline(paragraphBuffer.join(" "), usedIds)}</p>`);
      paragraphBuffer = [];
    }
  }

  function flushList() {
    if (listType !== null) {
      const tag = listType === "ordered" ? "ol" : "ul";
      const items = listBuffer
        .map((item) => `<li>${renderInline(item, usedIds)}</li>`)
        .join("");
      out.push(`<${tag}>${items}</${tag}>`);
      listType = null;
      listBuffer = [];
    }
  }

  function flushQuote() {
    if (quoteBuffer.length > 0) {
      out.push(
        `<blockquote><p>${renderInline(quoteBuffer.join(" "), usedIds)}</p></blockquote>`
      );
      quoteBuffer = [];
    }
  }

  function flushAll() {
    flushParagraph();
    flushList();
    flushQuote();
  }

  for (const line of lines) {
    const trimmed = line.trim();

    /* Fenced code blocks */
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        const escapedCode = escapeHtml(codeBuffer.join("\n"));
        out.push(
          `<pre data-language="${escapeHtml(codeLanguage)}"><code>${escapedCode}</code></pre>`
        );
        inCodeBlock = false;
        codeBuffer = [];
        codeLanguage = "";
      } else {
        flushAll();
        inCodeBlock = true;
        codeLanguage = trimmed.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    /* Blank line */
    if (trimmed === "") {
      flushAll();
      continue;
    }

    /* Horizontal rule */
    if (/^-{3,}$/.test(trimmed)) {
      flushAll();
      out.push("<hr />");
      continue;
    }

    /* Headings */
    const headingMatch = trimmed.match(/^(#{2,4})\s+(.*)$/);
    if (headingMatch) {
      flushAll();
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const id = slugifyHeading(text, usedIds);
      headings.push({ id, text, level });
      out.push(
        `<h${level} id="${id}">${renderInline(text, usedIds)}</h${level}>`
      );
      continue;
    }

    /* Blockquote */
    if (trimmed.startsWith("> ")) {
      flushParagraph();
      flushList();
      quoteBuffer.push(trimmed.slice(2));
      continue;
    }

    /* Unordered list */
    const unorderedMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (unorderedMatch) {
      flushParagraph();
      flushQuote();
      if (listType !== "unordered") {
        flushList();
        listType = "unordered";
      }
      listBuffer.push(unorderedMatch[1]);
      continue;
    }

    /* Ordered list */
    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      flushQuote();
      if (listType !== "ordered") {
        flushList();
        listType = "ordered";
      }
      listBuffer.push(orderedMatch[1]);
      continue;
    }

    /* Standalone image */
    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (imageMatch && isSafeUrl(imageMatch[2])) {
      flushAll();
      out.push(
        `<figure><img src="${applyBasePath(imageMatch[2])}" alt="${imageMatch[1]}" loading="lazy" decoding="async" /></figure>`
      );
      continue;
    }

    /* Paragraph line */
    flushList();
    flushQuote();
    paragraphBuffer.push(trimmed);
  }

  flushAll();

  return { html: out.join("\n"), headings };
}

/* -------------------------------------------------------------------------- */
/* Social image twins                                                          */
/* -------------------------------------------------------------------------- */

/*
 * og:image twin path for a cover: same file, extension swapped to
 * .png. Covers committed as PNG/JPG already serve as their own
 * social image. The twin's EXISTENCE is validated alongside the
 * cover itself — a missing twin fails the build with the expected
 * path instead of shipping an og:image URL that 404s on social
 * platforms.
 */
function coverOgSrc(coverSrc) {
  if (/\.(png|jpe?g|webp)$/i.test(coverSrc)) {
    return coverSrc;
  }
  return coverSrc.replace(/\.svg$/i, ".png");
}

function validateCoverTwin(coverSrc, file) {
  const ogSrc = coverOgSrc(coverSrc);
  const ogFile = path.join(ROOT, "public", ogSrc.replace(/^\//, ""));
  if (!existsSync(ogFile)) {
    fail(
      file,
      `cover social-image twin not found: ${ogSrc} (og:image requires a PNG twin of every SVG cover)`
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

function isValidDateString(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime());
}

function validatePost(record, file) {
  const problems = [];

  if (typeof record.title !== "string" || record.title.trim() === "") {
    problems.push("title is required and must be a non-empty string");
  }

  if (typeof record.excerpt !== "string" || record.excerpt.trim() === "") {
    problems.push("excerpt is required (short summary for index and feed)");
  }

  if (!isValidDateString(record.date)) {
    problems.push("date is required and must be YYYY-MM-DD");
  }

  if (
    record.updated !== undefined &&
    !isValidDateString(record.updated)
  ) {
    problems.push("updated must be YYYY-MM-DD when present");
  }

  if (
    isValidDateString(record.date) &&
    isValidDateString(record.updated) &&
    record.updated < record.date
  ) {
    problems.push("updated must not be earlier than date");
  }

  if (typeof record.author !== "string" || record.author.trim() === "") {
    problems.push("author is required");
  }

  if (
    typeof record.category !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.category)
  ) {
    problems.push("category is required (lowercase kebab-case)");
  }

  if (
    record.tags !== undefined &&
    (!Array.isArray(record.tags) ||
      record.tags.some(
        (tag) => typeof tag !== "string" || tag.trim() === ""
      ))
  ) {
    problems.push("tags must be an array of non-empty strings");
  }

  if (
    record.featured !== undefined &&
    typeof record.featured !== "boolean"
  ) {
    problems.push("featured must be true or false");
  }

  if (record.cover !== undefined && record.cover !== null) {
    if (typeof record.cover !== "object") {
      problems.push("cover must be an object");
    } else {
      if (
        typeof record.cover.src !== "string" ||
        !/^\/blog\/images\//.test(record.cover.src)
      ) {
        problems.push("cover.src must start with /blog/images/");
      } else {
        const coverFile = path.join(
          ROOT,
          "public",
          record.cover.src.replace(/^\//, "")
        );
        if (!existsSync(coverFile)) {
          problems.push(`cover file not found: ${record.cover.src}`);
        }
        validateCoverTwin(record.cover.src, file);
      }
      if (
        typeof record.cover.alt !== "string" ||
        record.cover.alt.trim() === ""
      ) {
        problems.push("cover.alt is required when cover is present");
      }
      if (
        !Number.isInteger(record.cover.width) ||
        record.cover.width <= 0 ||
        !Number.isInteger(record.cover.height) ||
        record.cover.height <= 0
      ) {
        problems.push("cover.width/height must be positive integers");
      }
    }
  }

  if (typeof record.body !== "string" || record.body.trim() === "") {
    problems.push("article body is empty");
  }

  for (const problem of problems) {
    fail(file, problem);
  }

  return problems.length === 0;
}

function checkInternalLinks(body, validSlugs, file) {
  const matches = body.matchAll(/\]\(\/?blog\/([^)/?#\s"']*)/g);
  for (const match of matches) {
    const slug = match[1];
    if (slug === "" || slug === "images" || slug === "feed.xml") {
      continue;
    }
    if (!validSlugs.has(slug)) {
      fail(file, `internal blog link points to unknown slug: ${slug}`);
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Normalization + indexing                                                   */
/* -------------------------------------------------------------------------- */

function countWords(body) {
  const plain = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`\-]/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  return plain === "" ? 0 : plain.split(" ").length;
}

function buildRelated(posts) {
  const related = {};
  for (const post of posts) {
    const scored = posts
      .filter((other) => other.slug !== post.slug)
      .map((other) => {
        const sharedTags = other.tags.filter((tag) =>
          post.tags.includes(tag)
        ).length;
        const sameCategory = other.category === post.category ? 1 : 0;
        return {
          slug: other.slug,
          score: sharedTags * 2 + sameCategory,
          date: other.date,
        };
      })
      .filter((candidate) => candidate.score > 0)
      .sort((a, b) =>
        b.score - a.score ||
        (a.date < b.date ? 1 : a.date > b.date ? -1 : 0) ||
        (a.slug < b.slug ? -1 : 1)
      )
      .slice(0, MAX_RELATED)
      .map((candidate) => candidate.slug);

    related[post.slug] = scored;
  }
  return related;
}

function buildAdjacent(postsByDateAsc) {
  const adjacent = {};
  postsByDateAsc.forEach((post, index) => {
    adjacent[post.slug] = {
      prev: index > 0 ? postsByDateAsc[index - 1].slug : null,
      next:
        index < postsByDateAsc.length - 1
          ? postsByDateAsc[index + 1].slug
          : null
    };
  });
  return adjacent;
}

/* -------------------------------------------------------------------------- */
/* RSS                                                                        */
/* -------------------------------------------------------------------------- */

function toRfc822(dateString) {
  return new Date(`${dateString}T12:00:00Z`).toUTCString();
}

/* -------------------------------------------------------------------------- */
/* Sitemap                                                                     */
/* -------------------------------------------------------------------------- */

/*
 * Sitemap source of truth: site configuration (SITE_URL) + the blog
 * content index + the real static routes of the site. Only genuinely
 * indexable, canonical URLs are listed — no hash scenes, no filter
 * states, no search results, no asset URLs.
 *
 * lastmod policy (sitemap freshness):
 * - articles: the article's own `updated` date, falling back to `date`
 * - /blog/: the newest article modification the index reflects
 * - /: omitted — the world shell has no dated content model, and
 *   inventing a date would fake freshness.
 * priority/changefreq are deliberately omitted: search engines
 * ignore them and they would be speculative signals.
 */
/* Total sitemap URL count: home + blog index + every article. */
function sitemapUrlCount(postCount) {
  return 2 + postCount;
}

function buildSitemap(posts) {
  const urls = [
    `  <url>\n    <loc>${SITE_URL}/</loc>\n  </url>`,
  ];

  if (posts.length > 0) {
    const blogLastMod = posts
      .map((post) => post.updated ?? post.date)
      .sort()
      .at(-1);

    urls.push(
      `  <url>\n    <loc>${SITE_URL}/blog/</loc>\n    <lastmod>${blogLastMod}</lastmod>\n  </url>`
    );
  } else {
    urls.push(`  <url>\n    <loc>${SITE_URL}/blog/</loc>\n  </url>`);
  }

  for (const post of posts) {
    const lastMod = post.updated ?? post.date;
    urls.push(
      `  <url>\n    <loc>${SITE_URL}/blog/${post.slug}/</loc>\n    <lastmod>${lastMod}</lastmod>\n  </url>`
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
    urls.join("\n")
  }\n</urlset>\n`;
}

function buildFeed(posts, generatedAt) {
  const items = posts
    .map((post) => {
      const link = `${SITE_URL}/blog/${post.slug}/`;
      const categories = post.tags
        .map((tag) => `<category>${escapeHtml(tag)}</category>`)
        .join("");
      const content = post.html.includes("]]>")
        ? escapeHtml(post.excerpt)
        : post.html;

      return `    <item>
      <title>${escapeHtml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${toRfc822(post.date)}</pubDate>
      ${post.updated ? `<atom:updated>${toRfc822(post.updated)}</atom:updated>` : ""}
      <description>${escapeHtml(post.excerpt)}</description>
      <content:encoded><![CDATA[${content}]]></content:encoded>
      ${categories}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeHtml(SITE_NAME)} — Blog</title>
    <link>${SITE_URL}/blog/</link>
    <description>${escapeHtml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${generatedAt.toUTCString()}</lastBuildDate>
    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

/* -------------------------------------------------------------------------- */
/* Main                                                                       */
/* -------------------------------------------------------------------------- */

async function main() {
  const generatedAt = new Date();
  const posts = [];
  const rawBodies = new Map();

  if (!existsSync(CONTENT_DIR)) {
    console.warn(
      "[blog] content/blog/ does not exist — emitting an explicit empty index."
    );
  }

  const files = existsSync(CONTENT_DIR)
    ? (await readdir(CONTENT_DIR))
        .filter((name) => name.endsWith(".md"))
        .sort()
    : [];

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const filePath = path.join(CONTENT_DIR, file);
    const source = await readFile(filePath, "utf8");
    const { data, body } = parseFrontmatter(source);

    const record = {
      ...data,
      body
    };

    if (!SLUG_PATTERN.test(slug)) {
      fail(file, `filename must match ${SLUG_PATTERN} (got "${slug}")`);
      continue;
    }

    if (!validatePost(record, file)) {
      continue;
    }

    const { html, headings } = renderMarkdown(body);

    const wordCount = countWords(body);
    const readingMinutes = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));

    const tags = Array.from(
      new Set(
        (Array.isArray(record.tags) ? record.tags : [])
          .map((tag) => String(tag).trim())
          .filter((tag) => tag.length > 0)
      )
    );

    const cover =
      record.cover && typeof record.cover.src === "string"
        ? {
            src: `${BASE_PATH}${record.cover.src}`,
            alt: String(record.cover.alt),
            width: record.cover.width,
            height: record.cover.height,

            /*
             * Social-image twin (og:image / twitter:image). SVG covers
             * are crisp on the page but poorly rendered by social
             * crawlers, so each cover carries a PNG twin at the same
             * path with the extension swapped. ROOT-RELATIVE and
             * deliberately NOT basePath-prefixed: this value is used
             * for metadata only, where Next resolves URLs against the
             * production metadataBase.
             */
            ogSrc: coverOgSrc(record.cover.src)
          }
        : null;

    posts.push({
      slug,
      search: buildSearchHaystack(record),
      title: String(record.title).trim(),
      subtitle:
        typeof record.subtitle === "string" && record.subtitle.trim() !== ""
          ? record.subtitle.trim()
          : null,
      excerpt: String(record.excerpt).trim(),
      description:
        typeof record.description === "string" &&
        record.description.trim() !== ""
          ? record.description.trim()
          : String(record.excerpt).trim(),
      date: record.date,
      updated:
        typeof record.updated === "string" ? record.updated : null,
      author: String(record.author).trim(),
      category: record.category,
      tags,
      readingMinutes,
      readingTime: `${readingMinutes} min read`,
      wordCount,
      featured: record.featured === true,
      cover,
      html,
      headings
    });

    rawBodies.set(slug, body);
  }

  /* Internal link validation runs after all slugs are known. */
  const validSlugs = new Set(posts.map((post) => post.slug));
  const slugSeen = new Set();
  for (const post of posts) {
    if (slugSeen.has(post.slug)) {
      fail(`${post.slug}.md`, "duplicate slug");
      continue;
    }
    slugSeen.add(post.slug);
    checkInternalLinks(
      String(rawBodies.get(post.slug) ?? ""),
      validSlugs,
      `${post.slug}.md`
    );
  }

  /*
   * SEO asset validation: the site-level social image must exist
   * before any page can claim an og:image. Fails loudly with the
   * expected path.
   */
  if (!existsSync(SITE_OG_IMAGE_FILE)) {
    fail(
      "public/og-default.png",
      `site social image not found: ${SITE_OG_IMAGE_PATH} (og:image for home and blog routes requires it)`
    );
  }

  if (failures.length > 0) {
    console.error("\n[blog] CONTENT PIPELINE FAILED:\n");
    console.error(failures.join("\n"));
    console.error(`\n[blog] ${failures.length} invalid record(s). Build aborted.`);
    process.exit(1);
  }

  /* Deterministic order: date descending, then slug ascending. */
  posts.sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug < b.slug ? -1 : 1
  );

  const chronologicalAsc = [...posts].reverse();

  const tagIndex = {};
  const categoryIndex = {};
  for (const post of posts) {
    for (const tag of post.tags) {
      (tagIndex[tag] ??= []).push(post.slug);
    }
    (categoryIndex[post.category] ??= []).push(post.slug);
  }

  const data = {
    version: 1,
    generatedAt: generatedAt.toISOString(),
    basePath: BASE_PATH,
    siteUrl: SITE_URL,
    siteName: SITE_NAME,
    siteDescription: SITE_DESCRIPTION,
    posts,
    indexes: {
      tags: tagIndex,
      categories: categoryIndex,
      related: buildRelated(posts),
      adjacent: buildAdjacent(chronologicalAsc)
    }
  };

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(
    path.join(DATA_DIR, "posts.json"),
    `${JSON.stringify(data, null, 2)}\n`,
    "utf8"
  );

  const feed = buildFeed(posts, generatedAt);
  await mkdir(PUBLIC_BLOG_DIR, { recursive: true });
  await writeFile(path.join(PUBLIC_BLOG_DIR, "feed.xml"), feed, "utf8");

  const sitemap = buildSitemap(posts);
  await writeFile(
    path.join(ROOT, "public", "sitemap.xml"),
    sitemap,
    "utf8"
  );

  const featuredCount = posts.filter((post) => post.featured).length;
  const tagCount = Object.keys(tagIndex).length;
  const categoryCount = Object.keys(categoryIndex).length;

  console.log(
    `[blog] ${posts.length} article(s) · ${tagCount} tag(s) · ${categoryCount} category(ies) · ${featuredCount} featured`
  );
  console.log(`[blog] wrote data/blog/posts.json (${posts.length} posts)`);
  console.log("[blog] wrote public/blog/feed.xml (RSS 2.0)");
  console.log(
    `[blog] wrote public/sitemap.xml (${sitemapUrlCount(posts.length)} URL(s))`
  );
  console.log(`[blog] basePath: "${BASE_PATH}" (GITHUB_ACTIONS=${IS_GITHUB_ACTIONS})`);

  if (posts.length === 0) {
    console.warn(
      "[blog] no articles found — the blog will render its empty state."
    );
  }
}

main().catch((error) => {
  console.error("[blog] unexpected pipeline failure:", error);
  process.exit(1);
});
