export type ContentKind =
  | "pdf"
  | "mp3"
  | "mp4"
  | "png"
  | "jpg"
  | "jpeg"
  | "webp"
  | "gif";

export type ContentItem = {
  name: string;
  path: string;
  branch: string;
  kind: ContentKind;
  size: number;
  sha: string;
  rawUrl: string;
  githubUrl: string;
};

const OWNER =
  "Parsaetak";

const REPOSITORY =
  "Contents";

const API_BASE =
  "https://api.github.com";

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

function createRawUrl(
  branch: string,
  path: string
) {
  return [
    `https://raw.githubusercontent.com`,
    OWNER,
    REPOSITORY,
    encodeURIComponent(branch),
    path
      .split("/")
      .map(
        encodeURIComponent
      )
      .join("/")
  ].join("/");
}

function createGitHubUrl(
  branch: string,
  path: string
) {
  return [
    `https://github.com`,
    OWNER,
    REPOSITORY,
    "blob",
    encodeURIComponent(branch),
    path
      .split("/")
      .map(
        encodeURIComponent
      )
      .join("/")
  ].join("/");
}

type GitTreeEntry = {
  path?: string;
  mode?: string;
  type?: string;
  size?: number;
  sha?: string;
};

type GitTreeResponse = {
  tree?: GitTreeEntry[];
  truncated?: boolean;
};

const catalogCache =
  new Map<
    string,
    Promise<ContentItem[]>
  >();

export async function listBranchContent(
  branch: string
): Promise<ContentItem[]> {
  const cached =
    catalogCache.get(
      branch
    );

  if (cached) {
    return cached;
  }

  const request =
    fetch(
      `${API_BASE}/repos/${OWNER}/${REPOSITORY}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
      {
        headers: {
          Accept:
            "application/vnd.github+json"
        },
        cache:
          "no-store"
      }
    )
      .then(
        async (
          response
        ) => {
          if (
            !response.ok
          ) {
            throw new Error(
              `GitHub content discovery failed: ${response.status}`
            );
          }

          return response.json() as Promise<GitTreeResponse>;
        }
      )
      .then(
        (
          data
        ) => {
          if (
            data.truncated
          ) {
            console.warn(
              `Content branch "${branch}" was truncated by GitHub.`
            );
          }

          return (data.tree ?? [])
            .filter(
              (
                entry
              ): entry is Required<
                Pick<
                  GitTreeEntry,
                  "path" |
                    "sha"
                > &
                  Pick<
                    GitTreeEntry,
                    "size" |
                      "type"
                  >
              > =>
                entry.type ===
                  "blob" &&
                typeof entry.path ===
                  "string" &&
                typeof entry.sha ===
                  "string"
            )
            .map(
              (
                entry
              ) => {
                const kind =
                  getContentKind(
                    entry.path
                  );

                if (!kind) {
                  return null;
                }

                return {
                  name:
                    entry.path
                      .split("/")
                      .pop() ??
                    entry.path,
                  path:
                    entry.path,
                  branch,
                  kind,
                  size:
                    entry.size ?? 0,
                  sha:
                    entry.sha,
                  rawUrl:
                    createRawUrl(
                      branch,
                      entry.path
                    ),
                  githubUrl:
                    createGitHubUrl(
                      branch,
                      entry.path
                    )
                };
              }
            )
            .filter(
              (
                item
              ): item is ContentItem =>
                item !== null
            );
        }
      );

  catalogCache.set(
    branch,
    request
  );

  return request;
}

export async function listContent(
  branches: string[]
): Promise<ContentItem[]> {
  const uniqueBranches =
    Array.from(
      new Set(
        branches
      )
    );

  const results =
    await Promise.all(
      uniqueBranches.map(
        listBranchContent
      )
    );

  return results
    .flat()
    .sort(
      (
        a,
        b
      ) =>
        a.name.localeCompare(
          b.name
        )
    );
}

export function getContentKindLabel(
  kind: ContentKind
) {
  return kind.toUpperCase();
}
