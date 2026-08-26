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
  year?: string;
  featured?: boolean;
  author?: string;
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

const LIBRARY_MANIFEST: LibraryManifest = {
  version: 1,
  updated: "2026-08-26",
  items: [
    {
      branch: "Books",
      source: "RED MAGIC.pdf",
      title: "RED MAGIC",
      type: "book",
      description:
        "A living work exploring intelligence, systems, consciousness, adaptation, and the possibility of computational life.",
      year: "2026",
      author: "Parsa Tak",
      featured: true,
      tags: [
        "RED MAGIC",
        "AI",
        "intelligence",
        "systems",
        "consciousness",
        "simulation",
        "adaptation"
      ]
    },
    {
      branch: "Books",
      source:
        "RED MAGIC 0_ MAGIC FOR KIDS.pdf",
      title:
        "RED MAGIC 0: MAGIC FOR KIDS",
      type: "book",
      description:
        "An accessible entry point into the ideas behind RED MAGIC, introducing its concepts in a more approachable form.",
      year: "2026",
      author: "Parsa Tak",
      featured: false,
      tags: [
        "RED MAGIC",
        "intelligence",
        "systems",
        "introduction"
      ]
    },
    {
      branch: "Books",
      source:
        "RED MAGIC II_ THE BOOK OF THE DEMIURGE.pdf",
      title:
        "RED MAGIC II: THE BOOK OF THE DEMIURGE",
      type: "book",
      description:
        "A deeper exploration of creation, intelligence, systems, and the forces that shape synthetic life.",
      year: "2026",
      author: "Parsa Tak",
      featured: false,
      tags: [
        "RED MAGIC",
        "systems",
        "creation",
        "intelligence",
        "synthetic life",
        "demiurge"
      ]
    }
  ]
};

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

function createRawUrl(
  branch: string,
  path: string
) {
  return [
    "https://raw.githubusercontent.com",
    OWNER,
    REPOSITORY,
    encodeURIComponent(
      branch
    ),
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
    encodeURIComponent(
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
      createRawUrl(
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
        ? createRawUrl(
            metadata.branch,
            metadata.cover
          )
        : undefined
  };
}

export async function loadLibraryManifest(): Promise<
  LibraryManifest
> {
  return LIBRARY_MANIFEST;
}

export async function listContent(): Promise<
  ContentItem[]
> {
  return LIBRARY_MANIFEST.items
    .map(
      createContentItem
    )
    .filter(
      (
        item
      ): item is ContentItem =>
        item !== null
    );
}

export function getContentKindLabel(
  kind: ContentKind
) {
  return kind.toUpperCase();
}
