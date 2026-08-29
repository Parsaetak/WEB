"use client";

import dynamic from "next/dynamic";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  createPortal
} from "react-dom";

import {
  getContentKindLabel,
  listContent,
  type ContentItem,
  type ContentKind
} from "@/lib/contentRepository";

const LibraryPdfReader =
  dynamic(
    () =>
      import(
        "@/components/LibraryPdfReader"
      ),
    {
      ssr: false
    }
  );

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

function getMediaFilter(
  kind: ContentKind
): MediaFilter {
  switch (kind) {
    case "pdf":
      return "book";

    case "mp3":
      return "audio";

    case "mp4":
      return "video";

    default:
      return "art";
  }
}

function getCatalogLabel(
  item: ContentItem
) {
  return item.kind === "pdf"
    ? "BOOK"
    : getContentKindLabel(
        item.kind
      );
}

function getActionLabel(
  kind: ContentKind
) {
  switch (kind) {
    case "pdf":
      return "READ";

    case "mp3":
      return "LISTEN";

    case "mp4":
      return "WATCH";

    default:
      return "VIEW";
  }
}

function getDownloadLabel(
  kind: ContentKind
) {
  switch (kind) {
    case "pdf":
      return "DOWNLOAD PDF";

    case "mp3":
      return "DOWNLOAD AUDIO";

    case "mp4":
      return "DOWNLOAD VIDEO";

    default:
      return "DOWNLOAD IMAGE";
  }
}

function getPreviewGlyph(
  kind: ContentKind
) {
  switch (kind) {
    case "pdf":
      return "BOOK";

    case "mp3":
      return "AUDIO";

    case "mp4":
      return "VIDEO";

    default:
      return "IMAGE";
  }
}

function isImageKind(
  kind: ContentKind
) {
  return (
    kind === "png" ||
    kind === "jpg" ||
    kind === "jpeg" ||
    kind === "webp" ||
    kind === "gif"
  );
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
    let cancelled = false;

    void listContent()
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

          setError(
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
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (
      !opened
    ) {
      document.body.style.overflow =
        "";

      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    const handleKeyDown =
      (
        event: KeyboardEvent
      ) => {
        if (
          event.key ===
          "Escape"
        ) {
          setOpened(
            false
          );
        }
      };

    document.body.style.overflow =
      "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [opened]);

  const filteredItems =
    useMemo(
      () => {
        if (
          filter === "all"
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
      },
      [
        items,
        filter
      ]
    );

  const featuredItems =
    useMemo(
      () =>
        filteredItems.filter(
          (
            item
          ) =>
            item.featured
        ),
      [
        filteredItems
      ]
    );

  const regularItems =
    useMemo(
      () =>
        filteredItems.filter(
          (
            item
          ) =>
            !item.featured
        ),
      [
        filteredItems
      ]
    );

  const filterCounts =
    useMemo(
      () => {
        const counts = new Map<
          MediaFilter,
          number
        >();

        for (
          const item of items
        ) {
          const mediaFilter =
            getMediaFilter(
              item.kind
            );

          counts.set(
            mediaFilter,
            (
              counts.get(
                mediaFilter
              ) ?? 0
            ) + 1
          );
        }

        return counts;
      },
      [items]
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

  const viewer =
    opened &&
    selected &&
    typeof document !==
      "undefined"
      ? createPortal(
          <div
            className="library-modal"
            role="dialog"
            aria-modal="true"
            aria-label={
              selected.title
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
                <div className="library-modal-heading">
                  <span className="library-modal-type">
                    {
                      getCatalogLabel(
                        selected
                      )
                    }
                  </span>

                  <h2>
                    {
                      selected.title
                    }
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
                  <LibraryPdfReader
                    src={
                      selected.rawUrl
                    }
                    title={
                      selected.title
                    }
                  />
                )}

                {selected.kind ===
                  "mp3" && (
                  <div className="library-modal-media">
                    <div className="library-media-symbol">
                      AUDIO
                    </div>

                    <h3>
                      {
                        selected.title
                      }
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

                {isImageKind(
                  selected.kind
                ) && (
                  <div className="library-modal-image-wrap">
                    <img
                      src={
                        selected.rawUrl
                      }
                      alt={
                        selected.title
                      }
                      className="library-image"
                    />
                  </div>
                )}

                <div className="library-modal-download">
                  <a
                    className="library-download-button"
                    href={
                      selected.rawUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>
                      {
                        getDownloadLabel(
                          selected.kind
                        )
                      }
                    </span>

                    <span
                      aria-hidden="true"
                    >
                      ↓
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
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
              <div className="library-header-copy">
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

                <p className="body-large library-header-lead">
                  A living archive of{" "}
                  books, experiments,
                  media, and other{" "}
                  original work.
                </p>
              </div>
            </header>

            <div
              className="library-filters"
              role="tablist"
              aria-label="Library filters"
            >
              {MEDIA_FILTERS.map(
                (
                  mediaFilter
                ) => {
                  const count =
                    mediaFilter.id ===
                    "all"
                      ? items.length
                      : filterCounts.get(
                            mediaFilter.id
                          ) ?? 0;

                  const active =
                    filter ===
                    mediaFilter.id;

                  return (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={
                        active
                      }
                      className="library-filter"
                      data-active={
                        active
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
                  LOADING
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
                  <section
                    className="library-gallery"
                    aria-label="Library collection"
                  >
                    <div className="library-catalog-header">
                      <div>
                        <p className="kicker">
                          COLLECTION
                        </p>

                        <h2>
                          {filter ===
                          "all"
                            ? "Gallery"
                            : MEDIA_FILTERS.find(
                                (
                                  mediaFilter
                                ) =>
                                  mediaFilter.id ===
                                  filter
                              )?.label ??
                              "Collection"}
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

                    {featuredItems.length >
                      0 && (
                      <div className="library-featured-strip">
                        {featuredItems.map(
                          (
                            item
                          ) => {
                            const active =
                              selected?.sha ===
                              item.sha;

                            return (
                              <button
                                type="button"
                                className="library-featured-card"
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
                                <div className="library-featured-card-visual">
                                  {item.coverUrl ? (
                                    <img
                                      src={
                                        item.coverUrl
                                      }
                                      alt=""
                                      loading="lazy"
                                      decoding="async"
                                    />
                                  ) : (
                                    <span>
                                      {
                                        getPreviewGlyph(
                                          item.kind
                                        )
                                      }
                                    </span>
                                  )}
                                </div>

                                <div className="library-featured-card-content">
                                  <span>
                                    FEATURED
                                  </span>

                                  <strong>
                                    {
                                      item.title
                                    }
                                  </strong>

                                  {item.year && (
                                    <small>
                                      {
                                        item.year
                                      }
                                    </small>
                                  )}
                                </div>
                              </button>
                            );
                          }
                        )}
                      </div>
                    )}

                    <div className="library-list">
                      {regularItems.map(
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
                                  {
                                    item.title
                                  }
                                </strong>

                                <small>
                                  {
                                    item.year ??
                                    "ORIGINAL WORK"
                                  }
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
                          No published media{" "}
                          exists in this{" "}
                          category yet.
                        </div>
                      )}
                    </div>
                  </section>

                  <section
                    className="library-preview"
                    aria-label="Selected work preview"
                  >
                    {!selected && (
                      <div className="library-preview-empty">
                        <span className="library-preview-empty-glyph">
                          EXPLORE
                        </span>

                        <strong>
                          Discover the{" "}
                          collection
                        </strong>

                        <p>
                          Choose a work to{" "}
                          see its preview,
                          story, and{" "}
                          publication{" "}
                          details.
                        </p>
                      </div>
                    )}

                    {selected && (
                      <article className="library-preview-card">
                        <div
                          className="library-preview-art"
                          data-kind={
                            selected.kind
                          }
                          data-featured={
                            selected.featured
                              ? "true"
                              : "false"
                          }
                        >
                          <div className="library-preview-art-grid" />

                          <div className="library-preview-art-orbit" />

                          {selected.coverUrl ? (
                            <img
                              src={
                                selected.coverUrl
                              }
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="library-preview-cover"
                            />
                          ) : (
                            <>
                              <span className="library-preview-art-type">
                                {
                                  getPreviewGlyph(
                                    selected.kind
                                  )
                                }
                              </span>

                              <strong>
                                {
                                  selected.title
                                }
                              </strong>

                              {selected.author && (
                                <small>
                                  {
                                    selected.author
                                  }
                                </small>
                              )}
                            </>
                          )}

                          {selected.coverUrl &&
                            selected.author && (
                              <small className="library-preview-cover-author">
                                {
                                  selected.author
                                }
                              </small>
                            )}

                          {selected.featured && (
                            <span className="library-featured-mark">
                              FEATURED
                            </span>
                          )}
                        </div>

                        <div className="library-preview-content">
                          <div className="library-preview-kicker">
                            {
                              getCatalogLabel(
                                selected
                              )
                            }
                          </div>

                          <h2>
                            {
                              selected.title
                            }
                          </h2>

                          {selected.subtitle && (
                            <p className="library-preview-subtitle">
                              {
                                selected.subtitle
                              }
                            </p>
                          )}

                          <p>
                            {
                              selected.description ??
                              "An original work from the Parsa Tak archive."
                            }
                          </p>

                          {selected.tags &&
                            selected.tags.length >
                              0 && (
                              <div className="library-preview-tags">
                                {selected.tags.map(
                                  (
                                    tag
                                  ) => (
                                    <span
                                      key={
                                        tag
                                      }
                                    >
                                      {
                                        tag
                                      }
                                    </span>
                                  )
                                )}
                              </div>
                            )}

                          <div className="library-preview-meta">
                            {selected.author && (
                              <span>
                                {
                                  selected.author
                                }
                              </span>
                            )}

                            {selected.year && (
                              <span>
                                {
                                  selected.year
                                }
                              </span>
                            )}

                            {selected.language && (
                              <span>
                                {
                                  selected.language
                                }
                              </span>
                            )}

                            {selected.series &&
                              typeof selected.volume ===
                                "number" && (
                                <span>
                                  {
                                    selected.series
                                  }{" "}
                                  · V
                                  {String(
                                    selected.volume
                                  ).padStart(
                                    2,
                                    "0"
                                  )}
                                </span>
                              )}

                            {selected.readingTime && (
                              <span>
                                {
                                  selected.readingTime
                                }
                              </span>
                            )}
                          </div>

                          <div className="library-preview-actions">
                            <button
                              type="button"
                              className="library-open-button"
                              onClick={
                                openItem
                              }
                            >
                              {
                                getActionLabel(
                                  selected.kind
                                )
                              }{" "}
                              WORK

                              <span aria-hidden="true">
                                →
                              </span>
                            </button>
                          </div>
                        </div>
                      </article>
                    )}
                  </section>
                </div>
              )}
          </div>
        </section>
      </div>

      {viewer}
    </>
  );
}
