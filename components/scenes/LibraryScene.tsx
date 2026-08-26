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
  if (
    bytes <
    1024
  ) {
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
  if (
    kind ===
    "pdf"
  ) {
    return "book";
  }

  if (
    kind ===
    "mp3"
  ) {
    return "audio";
  }

  if (
    kind ===
    "mp4"
  ) {
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

function getActionLabel(
  kind: ContentKind
) {
  if (
    kind ===
    "pdf"
  ) {
    return "READ";
  }

  if (
    kind ===
    "mp3"
  ) {
    return "LISTEN";
  }

  if (
    kind ===
    "mp4"
  ) {
    return "WATCH";
  }

  return "VIEW";
}

function getDescription(
  item: ContentItem
) {
  const title =
    titleFromFileName(
      item.name
    );

  if (
    item.kind ===
    "pdf"
  ) {
    return `${title} is a written work published through the ${getBranchLabel(
      item.branch
    )} collection. Open it when you are ready to read the complete document.`;
  }

  if (
    item.kind ===
    "mp3"
  ) {
    return `${title} is an audio work from the ${getBranchLabel(
      item.branch
    )} collection. Open it when you are ready to listen.`;
  }

  if (
    item.kind ===
    "mp4"
  ) {
    return `${title} is a video work from the ${getBranchLabel(
      item.branch
    )} collection. Open it when you are ready to watch.`;
  }

  return `${title} is visual work from the ${getBranchLabel(
    item.branch
  )} collection. Open it to view the full-resolution original.`;
}

function getPreviewGlyph(
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

  return "IMAGE";
}

export default function LibraryScene() {
  const [
    items,
    setItems
  ] = useState<
    ContentItem[]
  >([]);

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
    opened,
    setOpened
  ] = useState(false);

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
        (
          content
        ) => {
          if (
            cancelled
          ) {
            return;
          }

          setItems(
            content
          );

          setSelected(
            null
          );
        }
      )
      .catch(
        (
          reason
        ) => {
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

  useEffect(() => {
    if (!opened) {
      document.body.style.overflow =
        "";
      return;
    }

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [opened]);

  const filteredItems =
    useMemo(
      () => {
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
            ) ===
            filter
        );
      },
      [
        items,
        filter
      ]
    );

  const selectItem = (
    item: ContentItem
  ) => {
    setSelected(
      item
    );

    setOpened(
      false
    );
  };

  const openItem = () => {
    if (
      !selected
    ) {
      return;
    }

    setOpened(
      true
    );
  };

  const closeViewer =
    () => {
      setOpened(
        false
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
                A living archive of
                books, experiments,
                media, and other
                original work.
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
                DISCOVERING CONTENT
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
                              selectItem(
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
                        No published media exists
                        in this category yet.
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

                <section className="library-preview">
                  {!selected && (
                    <div className="library-preview-empty">
                      <span className="library-preview-empty-glyph">
                        SELECT
                      </span>

                      <strong>
                        Choose a work
                      </strong>

                      <p>
                        Select an item from
                        the collection to
                        see its preview,
                        description, and
                        publication details.
                      </p>
                    </div>
                  )}

                  {selected && (
                    <article className="library-preview-card">
                      <div className="library-preview-art">
                        <div className="library-preview-art-orbit" />
                        <span>
                          {getPreviewGlyph(
                            selected.kind
                          )}
                        </span>

                        <strong>
                          {titleFromFileName(
                            selected.name
                          )}
                        </strong>
                      </div>

                      <div className="library-preview-content">
                        <div className="library-preview-kicker">
                          {getCatalogLabel(
                            selected
                          )}
                          {" · "}
                          {getBranchLabel(
                            selected.branch
                          )}
                        </div>

                        <h2>
                          {titleFromFileName(
                            selected.name
                          )}
                        </h2>

                        <p>
                          {getDescription(
                            selected
                          )}
                        </p>

                        <div className="library-preview-meta">
                          <span>
                            {formatSize(
                              selected.size
                            )}
                          </span>

                          <span>
                            ORIGINAL
                          </span>
                        </div>

                        <div className="library-preview-actions">
                          <button
                            type="button"
                            className="library-open-button"
                            onClick={
                              openItem
                            }
                          >
                            {getActionLabel(
                              selected.kind
                            )}
                            {" "}
                            WORK
                            <span>
                              →
                            </span>
                          </button>

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
                        </div>
                      </div>
                    </article>
                  )}
                </section>
              </div>
            )}
        </div>
      </section>

      {opened &&
        selected && (
          <div
            className="library-modal"
            role="dialog"
            aria-modal="true"
            aria-label={
              titleFromFileName(
                selected.name
              )
            }
            onMouseDown={(
              event
            ) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeViewer();
              }
            }}
          >
            <div className="library-modal-shell">
              <header className="library-modal-header">
                <div>
                  <span>
                    {getCatalogLabel(
                      selected
                    )}
                  </span>

                  <h2>
                    {titleFromFileName(
                      selected.name
                    )}
                  </h2>
                </div>

                <button
                  type="button"
                  className="library-modal-close"
                  onClick={
                    closeViewer
                  }
                  aria-label="Close viewer"
                >
                  ×
                </button>
              </header>

              <div className="library-modal-content">
                {selected.kind ===
                  "pdf" && (
                  <iframe
                    title={
                      selected.name
                    }
                    src={
                      selected.rawUrl
                    }
                    className="library-pdf-frame"
                  />
                )}

                {selected.kind ===
                  "mp3" && (
                  <div className="library-modal-media">
                    <div className="library-media-symbol">
                      AUDIO
                    </div>

                    <h3>
                      {titleFromFileName(
                        selected.name
                      )}
                    </h3>

                    <audio
                      controls
                      autoPlay
                      preload="metadata"
                      src={
                        selected.rawUrl
                      }
                      className="library-audio-player"
                    />
                  </div>
                )}

                {selected.kind ===
                  "mp4" && (
                  <video
                    controls
                    autoPlay
                    preload="metadata"
                    src={
                      selected.rawUrl
                    }
                    className="library-video-player"
                  />
                )}

                {(
                  selected.kind ===
                    "png" ||
                  selected.kind ===
                    "jpg" ||
                  selected.kind ===
                    "jpeg" ||
                  selected.kind ===
                    "webp" ||
                  selected.kind ===
                    "gif"
                ) && (
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
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
