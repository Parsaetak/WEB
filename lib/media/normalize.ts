/*
 * lib/media/normalize.ts — pure Media model core (test-friendly).
 *
 * No imports, no aliases, no environment access: this module is the
 * single definition of the Media vocabulary and the manifest →
 * MediaItem derivation, exercised both by the app (lib/
 * mediaRepository.ts) at build/runtime and by `node --test` (the
 * manifest-sync pipeline and these functions must never disagree).
 *
 * MEDIA MODEL (v4.0.0) — one discriminated union:
 *
 *   MediaItem
 *    ├─ BookItem   (category "book",  .pdf)
 *    ├─ MusicItem  (category "music", .mp3 / .m4a / .flac)
 *    ├─ VideoItem  (category "video", .mp4)
 *    └─ ArtItem    (category "art",   .png / .jpg / .jpeg / .webp / .gif)
 */

export type MediaCategory =
  | "book"
  | "music"
  | "video"
  | "art";

export type MediaKind =
  | "pdf"
  | "mp3"
  | "m4a"
  | "flac"
  | "mp4"
  | "png"
  | "jpg"
  | "jpeg"
  | "webp"
  | "gif";

/**
 * Manifest record (data/media.json, version 3). The legacy external
 * type "audio" is normalised to "music" by the sync pipeline; this
 * module also tolerates it when normalising (defense in depth).
 */
export type MediaManifestItem = {
  branch: string;
  source: string;
  title: string;
  type: string;

  subtitle?: string;
  description?: string;
  year?: string;
  language?: string;
  author?: string;
  series?: string;
  volume?: number;
  featured?: boolean;
  status?: string;
  readingTime?: string;
  tags?: string[];
  cover?: string;

  /* Music-only fields (embedded metadata, extracted at build time). */
  artist?: string;
  album?: string;
  albumArtist?: string;
  genre?: string;
  composer?: string;
  comment?: string;
  trackNumber?: number;
  trackTotal?: number;
  discNumber?: number;
  discTotal?: number;
  duration?: number;
  metadataSource?: "embedded" | "manifest";
};

export type MediaManifest = {
  version: number;
  updated: string;
  items: MediaManifestItem[];
};

/** Fields shared by every resolved MediaItem. */
type MediaItemFields = {
  /** Canonical catalog id: "<branch>:<source>" — stable + unique. */
  id: string;
  name: string;
  path: string;
  kind: MediaKind;
  category: MediaCategory;
  rawUrl: string;
  githubUrl: string;
  coverUrl?: string;
};

export type BookItem = MediaItemFields & {
  category: "book";
  title: string;
  subtitle?: string;
  description?: string;
  year?: string;
  language?: string;
  author?: string;
  series?: string;
  volume?: number;
  featured?: boolean;
  status?: string;
  readingTime?: string;
  tags?: string[];
};

export type MusicItem = MediaItemFields & {
  category: "music";
  title: string;
  subtitle?: string;
  description?: string;
  year?: string;
  language?: string;
  author?: string;
  featured?: boolean;
  status?: string;
  tags?: string[];
  /** Authoritative track metadata (embedded tags, build-extracted). */
  track: {
    title: string;
    artist?: string;
    album?: string;
    albumArtist?: string;
    year?: string;
    genre?: string;
    trackNumber?: number;
    trackTotal?: number;
    discNumber?: number;
    discTotal?: number;
    composer?: string;
    comment?: string;
    /** Seconds; undefined until the build pipeline extracts it. */
    duration?: number;
    /** Where the metadata came from — never invented at runtime. */
    source: "embedded" | "manifest";
  };
};

export type VideoItem = MediaItemFields & {
  category: "video";
  title: string;
  subtitle?: string;
  description?: string;
  year?: string;
  language?: string;
  author?: string;
  featured?: boolean;
  status?: string;
  tags?: string[];
};

export type ArtItem = MediaItemFields & {
  category: "art";
  title: string;
  subtitle?: string;
  description?: string;
  year?: string;
  language?: string;
  author?: string;
  featured?: boolean;
  status?: string;
  tags?: string[];
};

export type MediaItem =
  | BookItem
  | MusicItem
  | VideoItem
  | ArtItem;

const KIND_BY_CATEGORY: Record<MediaCategory, readonly MediaKind[]> = {
  book: ["pdf"],
  music: ["mp3", "m4a", "flac"],
  video: ["mp4"],
  art: ["png", "jpg", "jpeg", "webp", "gif"]
};

const CATEGORY_BY_KIND: Record<MediaKind, MediaCategory> = {
  pdf: "book",
  mp3: "music",
  m4a: "music",
  flac: "music",
  mp4: "video",
  png: "art",
  jpg: "art",
  jpeg: "art",
  webp: "art",
  gif: "art"
};

/**
 * True when the value is a non-empty string.
 */
export function isNonEmptyString(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    value.length > 0
  );
}

/**
 * Extension → MediaKind, or null for unknown extensions.
 */
export function getMediaKind(
  path: string
): MediaKind | null {
  const extension = path
    .split(".")
    .pop()
    ?.toLowerCase();

  if (!extension) {
    return null;
  }

  for (const kinds of Object.values(KIND_BY_CATEGORY)) {
    if ((kinds as readonly string[]).includes(extension)) {
      return extension as MediaKind;
    }
  }

  return null;
}

/**
 * MediaKind → MediaCategory (pdf→book, audio kinds→music, …).
 */
export function getCategoryForKind(
  kind: MediaKind
): MediaCategory {
  return CATEGORY_BY_KIND[kind];
}

/**
 * Legacy/manifest type string → canonical category.
 * "audio" is the one accepted legacy alias (external contract).
 */
export function normalizeCategory(
  type: string
): MediaCategory | null {
  if (type === "audio") {
    return "music";
  }

  if (
    type === "book" ||
    type === "music" ||
    type === "video" ||
    type === "art"
  ) {
    return type;
  }

  return null;
}

/**
 * Percent-encode each path segment (CDN + GitHub URLs).
 */
export function encodePath(
  path: string
): string {
  return path
    .split("/")
    .map(encodeURIComponent)
    .join("/");
}

const CDN_BASE = "https://cdn.jsdelivr.net/gh";

const GITHUB_BASE = "https://github.com";

const CONTENTS_OWNER = "Parsaetak";

const CONTENTS_REPOSITORY = "Contents";

/**
 * jsDelivr URL for a branch file (playback/streaming + covers).
 */
export function createMediaUrl(
  branch: string,
  path: string
): string {
  return [
    CDN_BASE,
    `${CONTENTS_OWNER}/${CONTENTS_REPOSITORY}@${encodeURIComponent(branch)}`,
    encodePath(path)
  ].join("/");
}

/**
 * GitHub provenance URL for a branch file.
 */
export function createGitHubUrl(
  branch: string,
  path: string
): string {
  return [
    GITHUB_BASE,
    CONTENTS_OWNER,
    CONTENTS_REPOSITORY,
    "blob",
    encodeURIComponent(branch),
    encodePath(path)
  ].join("/");
}

/**
 * Normalize one manifest record into a discriminated MediaItem.
 *
 * Returns null (caller filters) when the record is malformed or the
 * source extension is unknown. The category comes from the manifest
 * type (with the documented legacy alias); the rendering capability
 * comes from the file extension. A type/extension contradiction is
 * rejected — the sync pipeline + validator make this unreachable.
 */
export function normalizeMediaItem(
  metadata: MediaManifestItem
): MediaItem | null {
  if (
    !isNonEmptyString(metadata.branch) ||
    !isNonEmptyString(metadata.source) ||
    !isNonEmptyString(metadata.title)
  ) {
    return null;
  }

  const category = normalizeCategory(metadata.type);

  if (!category) {
    return null;
  }

  const kind = getMediaKind(metadata.source);

  if (!kind) {
    return null;
  }

  if (getCategoryForKind(kind) !== category) {
    return null;
  }

  const sourceName =
    metadata.source.split("/").pop() ?? metadata.source;

  const coverUrl = isNonEmptyString(metadata.cover)
    ? createMediaUrl(metadata.branch, metadata.cover)
    : undefined;

  const shared: MediaItemFields = {
    id: `${metadata.branch}:${metadata.source}`,
    name: metadata.title || sourceName,
    path: metadata.source,
    kind,
    category,
    rawUrl: createMediaUrl(metadata.branch, metadata.source),
    githubUrl: createGitHubUrl(metadata.branch, metadata.source),
    coverUrl
  };

  const base = {
    ...shared,

    title: metadata.title,
    subtitle: metadata.subtitle,
    description: metadata.description,
    year: metadata.year,
    language: metadata.language,
    author: metadata.author,
    featured: metadata.featured,
    status: metadata.status,
    tags: metadata.tags
  };

  if (category === "book") {
    const book: BookItem = {
      ...base,
      category: "book",
      series: metadata.series,
      volume: metadata.volume,
      readingTime: metadata.readingTime
    };

    return book;
  }

  if (category === "music") {
    const music: MusicItem = {
      ...base,
      category: "music",
      track: {
        title: isNonEmptyString(metadata.title)
          ? metadata.title
          : sourceName,
        artist: metadata.artist,
        album: metadata.album,
        albumArtist: metadata.albumArtist,
        year: metadata.year,
        genre: metadata.genre,
        trackNumber: metadata.trackNumber,
        trackTotal: metadata.trackTotal,
        discNumber: metadata.discNumber,
        discTotal: metadata.discTotal,
        composer: metadata.composer,
        comment: metadata.comment,
        duration:
          typeof metadata.duration === "number" &&
          Number.isFinite(metadata.duration) &&
          metadata.duration > 0
            ? metadata.duration
            : undefined,
        source: metadata.metadataSource ?? "manifest"
      }
    };

    return music;
  }

  if (category === "video") {
    const video: VideoItem = {
      ...base,
      category: "video"
    };

    return video;
  }

  const art: ArtItem = {
    ...base,
    category: "art"
  };

  return art;
}

/**
 * Normalize a whole manifest: invalid records are filtered (defense
 * in depth behind the build-time validator, one malformed optional
 * record must never crash the catalogue).
 */
export function normalizeManifestItems(
  manifest: MediaManifest
): MediaItem[] {
  const items: MediaItem[] = [];

  for (const raw of manifest.items ?? []) {
    const item = normalizeMediaItem(raw);

    if (item) {
      items.push(item);
    }
  }

  return items;
}

/**
 * UI filter ids for the Media scene, in display order.
 */
export type MediaFilter =
  | "all"
  | "music"
  | "book"
  | "video"
  | "art";

export const MEDIA_FILTERS: readonly {
  id: MediaFilter;
  label: string;
}[] = [
  { id: "all", label: "ALL" },
  { id: "music", label: "MUSIC" },
  { id: "book", label: "BOOKS" },
  { id: "video", label: "VIDEO" },
  { id: "art", label: "ART" }
];

/**
 * MediaItem → its filter group.
 */
export function getMediaFilterForItem(
  item: MediaItem
): Exclude<MediaFilter, "all"> {
  switch (item.category) {
    case "music":
      return "music";

    case "book":
      return "book";

    case "video":
      return "video";

    case "art":
      return "art";
  }
}

/**
 * Catalog label for an item (BOOK / MUSIC / VIDEO / IMAGE).
 */
export function getCatalogLabel(item: MediaItem): string {
  if (item.category === "book") {
    return "BOOK";
  }

  if (item.category === "music") {
    return "MUSIC";
  }

  if (item.category === "video") {
    return "VIDEO";
  }

  return "IMAGE";
}

/**
 * Kicker/glyph label per kind (preview surfaces without a cover).
 */
export function getPreviewGlyph(item: MediaItem): string {
  if (item.category === "book") {
    return "BOOK";
  }

  if (item.category === "music") {
    return "MUSIC";
  }

  if (item.category === "video") {
    return "VIDEO";
  }

  return "IMAGE";
}

/**
 * Primary action label per category
 * (READ / LISTEN / WATCH / VIEW).
 */
export function getActionLabel(item: MediaItem): string {
  if (item.category === "book") {
    return "READ";
  }

  if (item.category === "music") {
    return "LISTEN";
  }

  if (item.category === "video") {
    return "WATCH";
  }

  return "VIEW";
}

/**
 * Download button label per category.
 */
export function getDownloadLabel(item: MediaItem): string {
  switch (item.category) {
    case "book":
      return "DOWNLOAD PDF";

    case "music":
      return item.kind === "flac"
        ? "DOWNLOAD FLAC"
        : item.kind === "m4a"
          ? "DOWNLOAD M4A"
          : "DOWNLOAD MP3";

    case "video":
      return "DOWNLOAD VIDEO";

    case "art":
      return "DOWNLOAD IMAGE";
  }
}
