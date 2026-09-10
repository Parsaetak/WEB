import libraryManifest from "@/data/library.json";

import {
  loadResource
} from "@/lib/resourceStore";

export type ContentKind =
  | "pdf"
  | "mp3"
  | "mp4"
  | "png"
  | "jpg"
  | "jpeg"
  | "webp"
  | "gif";

export type LibraryMetadata = {
  branch: string;
  source: string;
  title: string;
  type:
    | "book"
    | "audio"
    | "video"
    | "art";
  description?: string;
  subtitle?: string;
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
};

export type LibraryManifest = {
  version: number;
  updated: string;
  items: LibraryMetadata[];
};

export type ContentItem =
  LibraryMetadata & {
    name: string;
    path: string;
    kind: ContentKind;
    size: number;
    sha: string;
    rawUrl: string;
    githubUrl: string;
    coverUrl?: string;
};

const OWNER =
  "Parsaetak";

const REPOSITORY =
  "Contents";

const MIME_EXTENSIONS: Record<
  ContentKind,
  true
> = {
  pdf: true,
  mp3: true,
  mp4: true,
  png: true,
  jpg: true,
  jpeg: true,
  webp: true,
  gif: true
};

const LIBRARY_RESOURCE_KEY =
  "library-manifest:content-items";

/*
 * Data flow (see worklog.md — Data Pipeline):
 * source manifest (synced + validated at build time by deploy.yml)
 * → runtime normalization (validate each record)
 * → derived ContentItem list (cached once, shared by every consumer)
 * → UI
 *
 * The build-time validation is the authoritative gate. The runtime
 * check below is defense in depth: one malformed optional record is
 * filtered out instead of crashing the whole catalogue.
 */

function isNonEmptyString(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    value.length > 0
  );
}

function isValidLibraryItem(
  value: unknown
): value is LibraryMetadata {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const candidate =
    value as Record<
      string,
      unknown
    >;

  return (
    isNonEmptyString(
      candidate.branch
    ) &&
    isNonEmptyString(
      candidate.source
    ) &&
    isNonEmptyString(
      candidate.title
    ) &&
    isNonEmptyString(
      candidate.type
    )
  );
}

function getContentKind(
  path: string
): ContentKind | null {
  const extension =
    path
      .split(".")
      .pop()
      ?.toLowerCase();

  if (
    !extension ||
    !(extension in MIME_EXTENSIONS)
  ) {
    return null;
  }

  return extension as ContentKind;
}

function encodePath(
  path: string
) {
  return path
    .split("/")
    .map(
      encodeURIComponent
    )
    .join("/");
}

function encodeBranch(
  branch: string
) {
  return encodeURIComponent(
    branch
  );
}

function createMediaUrl(
  branch: string,
  path: string
) {
  return [
    "https://cdn.jsdelivr.net/gh",
    `${OWNER}/${REPOSITORY}@${encodeBranch(
      branch
    )}`,
    encodePath(path)
  ].join("/");
}

function createGitHubUrl(
  branch: string,
  path: string
) {
  return [
    "https://github.com",
    OWNER,
    REPOSITORY,
    "blob",
    encodeBranch(
      branch
    ),
    encodePath(path)
  ].join("/");
}

function createContentItem(
  metadata: LibraryMetadata
): ContentItem | null {
  const kind =
    getContentKind(
      metadata.source
    );

  if (!kind) {
    return null;
  }

  const sourceName =
    metadata.source
      .split("/")
      .pop() ??
    metadata.source;

  return {
    ...metadata,

    name:
      metadata.title ||
      sourceName,

    path:
      metadata.source,

    kind,

    size: 0,

    sha:
      `${metadata.branch}:${metadata.source}`,

    rawUrl:
      createMediaUrl(
        metadata.branch,
        metadata.source
      ),

    githubUrl:
      createGitHubUrl(
        metadata.branch,
        metadata.source
      ),

    coverUrl:
      metadata.cover
        ? createMediaUrl(
            metadata.branch,
            metadata.cover
          )
        : undefined
  };
}

const LIBRARY_MANIFEST =
  libraryManifest as unknown as LibraryManifest;

/*
 * Normalization + indexing happens exactly once and is shared across
 * every scene mount. loadResource guarantees that concurrent callers
 * (multiple components mounting in the same tick) join one
 * normalization pass instead of racing separate derivations.
 */
function buildContentItems():
  Promise<ContentItem[]> {
  return Promise.resolve(
    LIBRARY_MANIFEST.items
      .filter(
        isValidLibraryItem
      )
      .map(
        createContentItem
      )
      .filter(
        (
          item
        ): item is ContentItem =>
          item !== null
      )
  );
}

export async function loadLibraryManifest(): Promise<
  LibraryManifest
> {
  return LIBRARY_MANIFEST;
}

export async function listContent(): Promise<
  ContentItem[]
> {
  return loadResource(
    LIBRARY_RESOURCE_KEY,
    buildContentItems
  );
}

export function getContentKindLabel(
  kind: ContentKind
) {
  if (
    kind ===
    "pdf"
  ) {
    return "BOOK";
  }

  if (
    kind ===
    "mp3"
  ) {
    return "AUDIO";
  }

  if (
    kind ===
    "mp4"
  ) {
    return "VIDEO";
  }

  return "ART";
}
