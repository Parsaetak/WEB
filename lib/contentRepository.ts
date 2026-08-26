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

const MANIFEST_BRANCH =
  "Projects";

const CDN_BASE =
  `https://cdn.jsdelivr.net/gh/${OWNER}/${REPOSITORY}@${MANIFEST_BRANCH}`;

const MANIFEST_URL =
  `${CDN_BASE}/library.json`;

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

function createCdnUrl(
  branch: string,
  path: string
) {
  return [
    "https://cdn.jsdelivr.net/gh",
    OWNER,
    REPOSITORY,
    `@${encodeURIComponent(
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
        ? createCdnUrl(
            metadata.branch,
            metadata.cover
          )
        : undefined
  };
}

async function fetchManifest(
  url: string
): Promise<LibraryManifest> {
  const response =
    await fetch(
      url,
      {
        cache:
          "no-store",
        headers: {
          Accept:
            "application/json"
        }
      }
    );

  if (
    !response.ok
  ) {
    throw new Error(
      `Library metadata failed: ${response.status}`
    );
  }

  const data =
    (await response.json()) as LibraryManifest;

  if (
    typeof data.version !==
      "number" ||
    typeof data.updated !==
      "string" ||
    !Array.isArray(
      data.items
    )
  ) {
    throw new Error(
      "Library metadata is invalid."
    );
  }

  return data;
}

export async function loadLibraryManifest(): Promise<
  LibraryManifest
> {
  try {
    return await fetchManifest(
      MANIFEST_URL
    );
  } catch {
    /*
     * Keep GitHub Raw as a fallback.
     * This protects the Library if the CDN is temporarily
     * unavailable or has not refreshed its branch cache yet.
     */
    const fallbackUrl =
      `https://raw.githubusercontent.com/${OWNER}/${REPOSITORY}/${MANIFEST_BRANCH}/library.json`;

    return fetchManifest(
      fallbackUrl
    );
  }
}

export async function listContent(): Promise<
  ContentItem[]
> {
  const manifest =
    await loadLibraryManifest();

  return manifest.items
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
