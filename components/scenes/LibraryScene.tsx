"use client";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  CONTENT_BRANCHES,
  getContentKindLabel,
  listContent,
  type ContentItem,
  type ContentKind
} from "@/lib/contentRepository";

type MediaFilter =
  | "all"
  | "book"
  | "audio"
  | "video"
  | "art";

const MEDIA_FILTERS:
  readonly {
    id: MediaFilter;
    label: string;
  }[] =
  [
    {
      id: "all",
      label: "ALL"
    },
    {
      id: "book",
      label: "BOOKS"
    },
    {
      id: "audio",
      label: "AUDIO"
    },
    {
      id: "video",
      label: "VIDEO"
    },
    {
      id: "art",
      label: "ART"
    }
  ];

function formatSize(
  bytes: number
) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function titleFromFileName(
  fileName: string
) {
  return fileName
    .replace(
      /\.[^/.]+$/,
      ""
    )
    .replace(
      /[_-]+/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

function getMediaFilter(
  kind: ContentKind
): MediaFilter {
  if (kind === "pdf") {
    return "book";
  }

  if (kind === "mp3") {
    return "audio";
  }

  if (kind === "mp4") {
    return "video";
  }

  return "art";
}

function getBranchLabel(
  branch: string
) {
  return branch
    .replace(
      /[_-]+/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

function getCatalogLabel(
  item: ContentItem
) {
  if (
    item.kind ===
    "pdf"
  ) {
    return "BOOK";
  }

  return getContentKindLabel(
    item.kind
  );
}

export default function LibraryScene() {
  const [
    items,
    setItems
  ] = useState<ContentItem[]>(
    []
  );

  const [
    selected,
    setSelected
  ] = useState<
    ContentItem | null
  >(null);

  const [
    filter,
    setFilter
  ] = useState<MediaFilter>(
    "all"
  );

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState<
    string | null
  >(null);

  useEffect(() => {
    let cancelled =
      false;

    setLoading(true);
    setError(null);

    void listContent(
      CONTENT_BRANCHES
    )
      .then(
        (content) => {
          if (
            cancelled
          ) {
            return;
          }

          setItems(
            content
          );

          setSelected(
            content[0] ??
              null
          );
        }
      )
      .catch(
        (reason) => {
          if (
            cancelled
          ) {
            return;
          }

          setError(
            reason instanceof
              Error
              ? reason.message
              : "Unable to load the library."
          );
        }
      )
      .finally(() => {
        if (
          !cancelled
        ) {
          setLoading(
            false
          );
        }
      });

    return () => {
      cancelled =
        true;
    };
  }, []);

  const filteredItems =
    useMemo(() => {
      if (
        filter ===
        "all"
      ) {
        return items;
      }

      return items.filter(
        (
          item
        ) =>
          getMediaFilter(
            item.kind
          ) === filter
      );
    }, [
      items,
      filter
    ]);

  useEffect(() => {
    if (
      selected &&
      filteredItems.some(
        (
          item
        ) =>
          item.sha ===
          selected.sha
      )
    ) {
      return;
    }

    setSelected(
      filteredItems[0] ??
        null
    );
  }, [
    filter,
    filteredItems,
    selected
  ]);

  const renderViewer =
    () => {
      if (
        !selected
      ) {
        return (
          <div className="library-viewer-empty">
            <strong>
              No work selected
            </strong>

            <span>
              Choose an item from the collection.
            </span>
          </div>
        );
      }

      if (
        selected.kind ===
        "pdf"
      ) {
        return (
          <div className="library-pdf-viewer">
            <iframe
              title={
                selected.name
              }
              src={
                selected.rawUrl
              }
              className="library-pdf-frame"
            />
          </div>
        );
      }

      if (
        selected.kind ===
        "mp3"
      ) {
        return (
          <div className="library-media-viewer library-audio-viewer">
            <div className="library-media-symbol">
              AUDIO
            </div>

            <h2>
              {titleFromFileName(
                selected.name
              )}
            </h2>

            <p className="library-media-meta">
              {getBranchLabel(
                selected.branch
              )}
            </p>

            <audio
              className="library-audio-player"
              controls
              preload="metadata"
              src={
                selected.rawUrl
              }
            />
          </div>
        );
      }

      if (
        selected.kind ===
        "mp4"
      ) {
        return (
          <div className="library-media-viewer">
            <video
              className="library-video-player"
              controls
              preload="metadata"
              src={
                selected.rawUrl
              }
            />
          </div>
        );
      }

      return (
        <div className="library-image-viewer">
          <img
            src={
              selected.rawUrl
            }
            alt={
              titleFromFileName(
                selected.name
              )
            }
            className="library-image"
          />
        </div>
      );
    };

  return (
    <div className="library-scene">
      <section className="section library-section">
        <div
          className="library-atmosphere"
          aria-hidden="true"
        >
          <span className="library-atmosphere-orbit library-atmosphere-orbit-one" />
          <span className="library-atmosphere-orbit library-atmosphere-orbit-two" />
          <span className="library-atmosphere-axis library-atmosphere-axis-x" />
          <span className="library-atmosphere-axis library-atmosphere-axis-y" />
        </div>

        <div className="page-container">
          <header className="library-header">
            <div>
              <p className="kicker">
                06 / LIBRARY
              </p>

              <h1 className="section-title library-title">
                The works.
                <br />
                Read, watch,
                <br />
                listen.
              </h1>

              <p className="body-large library-lead">
                A living archive of books,
                experiments, media, and
                other original work.
              </p>
            </div>

            <div className="library-status">
              <span className="status-dot" />

              <span>
                {items.length} PUBLISHED
              </span>
            </div>
          </header>

          <div className="library-filters">
            {MEDIA_FILTERS.map(
              (
                mediaFilter
              ) => {
                const count =
                  mediaFilter.id ===
                  "all"
                    ? items.length
                    : items.filter(
                        (
                          item
                        ) =>
                          getMediaFilter(
                            item.kind
                          ) ===
                          mediaFilter.id
                      ).length;

                return (
                  <button
                    type="button"
                    className="library-filter"
                    data-active={
                      filter ===
                      mediaFilter.id
                        ? "true"
                        : "false"
                    }
                    key={
                      mediaFilter.id
                    }
                    onClick={() =>
                      setFilter(
                        mediaFilter.id
                      )
                    }
                  >
                    <span>
                      {
                        mediaFilter.label
                      }
                    </span>

                    <strong>
                      {String(
                        count
                      ).padStart(
                        2,
                        "0"
                      )}
                    </strong>
                  </button>
                );
              }
            )}
          </div>

          {loading && (
            <div className="library-loading">
              <span className="status-dot" />

              <span>
                LOADING CONTENT
              </span>
            </div>
          )}

          {error && (
            <div
              className="library-error"
              role="alert"
            >
              <strong>
                Library unavailable
              </strong>

              <p>
                {error}
              </p>
            </div>
          )}

          {!loading &&
            !error && (
              <div className="library-layout">
                <aside className="library-catalog">
                  <div className="library-catalog-header">
                    <div>
                      <p className="kicker">
                        COLLECTION
                      </p>

                      <h2>
                        {filter ===
                        "all"
                          ? "All works"
                          : MEDIA_FILTERS.find(
                              (
                                item
                              ) =>
                                item.id ===
                                filter
                            )?.label}
                      </h2>
                    </div>

                    <span>
                      {String(
                        filteredItems.length
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>
                  </div>

                  <div className="library-list">
                    {filteredItems.map(
                      (
                        item
                      ) => {
                        const active =
                          selected?.sha ===
                          item.sha;

                        return (
                          <button
                            type="button"
                            className="library-item"
                            data-active={
                              active
                                ? "true"
                                : "false"
                            }
                            key={
                              `${item.branch}:${item.path}`
                            }
                            onClick={() =>
                              setSelected(
                                item
                              )
                            }
                          >
                            <span className="library-item-type">
                              {
                                getCatalogLabel(
                                  item
                                )
                              }
                            </span>

                            <span className="library-item-main">
                              <strong>
                                {titleFromFileName(
                                  item.name
                                )}
                              </strong>

                              <small>
                                {getBranchLabel(
                                  item.branch
                                )}
                                {" · "}
                                {formatSize(
                                  item.size
                                )}
                              </small>
                            </span>

                            <span
                              className="library-item-arrow"
                              aria-hidden="true"
                            >
                              →
                            </span>
                          </button>
                        );
                      }
                    )}

                    {filteredItems.length ===
                      0 && (
                      <div className="library-empty">
                        No published media
                        exists in this
                        category yet.
                      </div>
                    )}
                  </div>

                  <p className="library-source">
                    Source:
                    {" "}
                    <strong>
                      Parsaetak / Contents
                    </strong>
                  </p>
                </aside>

                <section className="library-viewer">
                  <div className="library-viewer-header">
                    <div>
                      <span>
                        {selected
                          ? getCatalogLabel(
                              selected
                            )
                          : "SELECT"}
                      </span>

                      <h2>
                        {selected
                          ? titleFromFileName(
                              selected.name
                            )
                          : "Choose a work"}
                      </h2>
                    </div>

                    {selected && (
                      <a
                        href={
                          selected.githubUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="library-source-link"
                      >
                        SOURCE ↗
                      </a>
                    )}
                  </div>

                  <div className="library-viewer-content">
                    {renderViewer()}
                  </div>
                </section>
              </div>
            )}
        </div>
      </section>
    </div>
  );
}
