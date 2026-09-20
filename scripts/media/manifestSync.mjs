/*
 * manifestSync.mjs — core of the Media manifest sync (testable).
 *
 * Pipeline (executed by scripts/sync-media-manifest.mjs in CI):
 *
 *   1. fetch the external Contents library manifest
 *      (Parsaetak/Contents/Projects/library.json — external contract,
 *      never renamed) and normalise its items
 *   2. fetch the OPTIONAL music manifest (Projects/music.json).
 *      A 404/absent file is the documented "no Music source" state —
 *      the pipeline continues with zero tracks and never fabricates
 *      music.
 *   3. for every music item: extract embedded metadata over HTTP
 *      range requests (scripts/media/audioMetadata.mjs) and resolve
 *      the cover path deterministically (scripts/media/covers.mjs)
 *   4. write data/media.json (version 3) — the app's only data input
 *
 * Everything network-shaped is injected: `fetchJson`, `fetchRange`,
 * `exists` (remote path probe). Tests provide deterministic fakes.
 */

import { extractAudioMetadata } from "./audioMetadata.mjs";
import { resolveCoverPath } from "./covers.mjs";

const MUSIC_KIND_BY_EXTENSION = {
  mp3: "mp3",
  m4a: "m4a",
  flac: "flac"
};

function extensionOf(path) {
  const match = path.toLowerCase().match(/\.([a-z0-9]+)$/);

  return match ? match[1] : null;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

/**
 * Normalise one raw manifest record into the canonical Media item.
 * Returns { item } or { error } (with a human-readable reason).
 */
export function normalizeRawItem(raw, origin) {
  if (
    typeof raw !== "object" ||
    raw === null
  ) {
    return { error: `${origin}: item is not an object` };
  }

  for (const field of ["branch", "source", "title"]) {
    if (!isNonEmptyString(raw[field])) {
      return {
        error: `${origin}: item is missing a valid \`${field}\` string`
      };
    }
  }

  let type = raw.type;

  /* The external library contract historically used "audio". */
  if (type === "audio") {
    type = "music";
  }

  if (!["book", "music", "video", "art"].includes(type)) {
    return {
      error: `${origin}: unknown type ${JSON.stringify(raw.type)}`
    };
  }

  const item = {
    branch: raw.branch,
    source: raw.source,
    title: raw.title,
    type
  };

  const copyStrings = [
    "subtitle",
    "description",
    "year",
    "language",
    "author",
    "series",
    "status",
    "readingTime",
    "cover",
    "artist",
    "album",
    "albumArtist",
    "genre",
    "composer",
    "comment"
  ];

  for (const field of copyStrings) {
    if (isNonEmptyString(raw[field])) {
      item[field] = raw[field];
    }
  }

  for (const field of ["volume"]) {
    if (Number.isFinite(raw[field])) {
      item[field] = raw[field];
    }
  }

  if (typeof raw.featured === "boolean") {
    item.featured = raw.featured;
  }

  if (
    Array.isArray(raw.tags) &&
    raw.tags.every((tag) => isNonEmptyString(tag))
  ) {
    item.tags = [...raw.tags];
  }

  return { item };
}

/**
 * Build one branch-CDN probe (`exists`) from `fetchRange` — a HEAD
 * would be enough, but range GET of one byte works on every static
 * CDN and gives us status precision for free.
 */
function createExistsProbe(fetchRange) {
  const cache = new Map();

  return async (url) => {
    const cached = cache.get(url);

    if (cached !== undefined) {
      return cached;
    }

    let result = false;

    try {
      const response = await fetchRange(url, 0, 0);

      result = response.status === 200 || response.status === 206;
    } catch {
      result = false;
    }

    cache.set(url, result);

    return result;
  };
}

/**
 * Enrich one music item with embedded metadata + cover resolution.
 * Never throws: extraction problems downgrade to manifest metadata
 * with a returned warning string.
 */
export async function enrichMusicItem({
  item,
  branchBaseUrl,
  fetchRange,
  warn = () => {}
}) {
  const extension = extensionOf(item.source);

  const kind = MUSIC_KIND_BY_EXTENSION[extension ?? ""];

  const enriched = { ...item };

  if (!kind) {
    return {
      item: enriched,
      warning: `unsupported audio extension: ${item.source}`
    };
  }

  const audioUrl = `${branchBaseUrl}/${item.branch}/${item.source
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;

  const probeExists = createExistsProbe(fetchRange);

  /* Cover resolution runs first (cheap HEAD-ish probes). */
  try {
    const exists = async (path) =>
      probeExists(`${branchBaseUrl}/${item.branch}/${path.split("/").map(encodeURIComponent).join("/")}`);

    const coverPath = await resolveCoverPath(item, exists);

    if (coverPath) {
      enriched.cover = coverPath;
    }
  } catch (reason) {
    warn(
      `cover resolution failed for ${item.source}: ${reason instanceof Error ? reason.message : String(reason)}`
    );
  }

  /* Embedded metadata extraction (range windows only). */
  try {
    const extracted = await extractAudioMetadata({
      url: audioUrl,
      kind,
      fetchRange
    });

    if (extracted.source === "embedded") {
      const merged = { ...extracted.fields };

      /* Manifest values win only where extraction found nothing. */
      for (const field of ["artist", "album", "albumArtist", "genre", "composer", "comment", "year"]) {
        if (
          enriched[field] !== undefined &&
          merged[field] === undefined
        ) {
          merged[field] = enriched[field];
        }
      }

      if (extracted.duration !== undefined) {
        merged.duration = extracted.duration;
      }

      for (const [key, value] of Object.entries(merged)) {
        enriched[key] = value;
      }

      enriched.metadataSource = "embedded";
    } else {
      /* Extraction found nothing usable (404, unparsable, empty tags)
       * — keep honest manifest metadata and warn so the source can be
       * checked. Never invent fields. */
      warn(
        `no embedded metadata found for ${item.source} — falling back to manifest values`
      );

      if (
        enriched.artist ||
        enriched.album ||
        enriched.duration !== undefined
      ) {
        enriched.metadataSource = "manifest";
      }
    }
  } catch (reason) {
    warn(
      `metadata extraction failed for ${item.source}: ${reason instanceof Error ? reason.message : String(reason)}`
    );

    enriched.metadataSource = "manifest";
  }

  return { item: enriched };
}

/**
 * Compose the final manifest object from raw sources.
 *
 * @param {object} options
 * @param {{ items: unknown[], updated?: string }} options.library
 * @param {{ items?: unknown[], updated?: string } | null} options.music
 * @param {string} options.branchBaseUrl — CDN base for branch files
 * @param options.fetchRange / options.warn — injected
 * @returns {Promise<{ manifest: object, warnings: string[] }>}
 */
export async function buildMediaManifest({
  library,
  music,
  branchBaseUrl,
  fetchRange
}) {
  const warnings = [];

  const items = [];

  for (const [index, raw] of (library?.items ?? []).entries()) {
    const normalized = normalizeRawItem(
      raw,
      `library.json items[${index}]`
    );

    if (normalized.error) {
      warnings.push(normalized.error);
      continue;
    }

    items.push(normalized.item);
  }

  for (const [index, raw] of (music?.items ?? []).entries()) {
    /*
     * The music manifest's items ARE music: the type defaults to
     * "music" so authors list bare file records, while an explicit
     * wrong type still fails loudly (no silent coercion of books).
     */
    const normalized = normalizeRawItem(
      { type: "music", ...raw },
      `music.json items[${index}]`
    );

    if (normalized.error) {
      warnings.push(normalized.error);
      continue;
    }

    const item = normalized.item;

    if (item.type !== "music") {
      warnings.push(
        `music.json items[${index}]: type must be "music" (got ${item.type}) — skipped`
      );
      continue;
    }

    const enriched = await enrichMusicItem({
      item,
      branchBaseUrl,
      fetchRange,
      warn: (message) => warnings.push(message)
    });

    if (enriched.warning) {
      warnings.push(
        `music.json items[${index}]: ${enriched.warning}`
      );
    }

    items.push(enriched.item);
  }

  const updated =
    (music && isNonEmptyString(music.updated) ? music.updated : null) ??
    (isNonEmptyString(library?.updated) ? library.updated : null) ??
    new Date().toISOString().slice(0, 10);

  return {
    manifest: {
      version: 3,
      updated,
      items
    },
    warnings
  };
}
