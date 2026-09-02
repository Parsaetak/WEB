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

import styles from "./LibraryScene.module.css";

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
  return item.kind ===
    "pdf"
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
    let cancelled =
      false;

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
        const counts =
          new Map<
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
            className={
              styles.libraryModal
            }
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
            <div
              className={
                styles.libraryModalShell
              }
            >
              <header
                className={
                  styles.libraryModalHeader
                }
              >
                <div
                  className={
                    styles.libraryModalHeading
                  }
                >
                  <span
                    className={
                      styles.libraryModalType
                    }
                  >
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
                  className={
                    styles.libraryModalClose
                  }
                  onClick={
                    closeViewer
                  }
                  aria-label="Close viewer"
                >
                  ×
                </button>
              </header>

              <div
                className={
                  styles.libraryModalContent
                }
              >
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
                  <div
                    className={
                      styles.libraryModalMedia
                    }
                  >
                    <div
                      className={
                        styles.libraryMediaSymbol
                      }
                    >
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
                      className={
                        styles.libraryAudioPlayer
                      }
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
                    className={
                      styles.libraryVideoPlayer
                    }
                  />
                )}

                {isImageKind(
                  selected.kind
                ) && (
                  <div
                    className={
                      styles.libraryModalImageWrap
                    }
                  >
                    <img
                      src={
                        selected.rawUrl
                      }
                      alt={
                        selected.title
                      }
                      className={
                        styles.libraryImage
                      }
                    />
                  </div>
                )}

                <div
                  className={
                    styles.libraryModalDownload
                  }
                >
                  <a
                    className={
                      styles.libraryDownloadButton
                    }
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
      <div
        className={
          styles.libraryScene
        }
      >
        <section
          className={`section ${styles.librarySection}`}
        >
          <div
            className={
              styles.libraryAtmosphere
            }
            aria-hidden="true"
          >
            <span
              className={`${styles.libraryAtmosphereOrbit} ${styles.libraryAtmosphereOrbitOne}`}
            />

            <span
              className={`${styles.libraryAtmosphereOrbit} ${styles.libraryAtmosphereOrbitTwo}`}
            />

            <span
              className={`${styles.libraryAtmosphereAxis} ${styles.libraryAtmosphereAxisX}`}
            />

            <span
              className={`${styles.libraryAtmosphereAxis} ${styles.libraryAtmosphereAxisY}`}
            />
          </div>

          <div className="page-container">
            <header
              className={
                styles.libraryHeader
              }
            >
              <div
                className={
                  styles.libraryHeaderCopy
                }
              >
                <p className="kicker">
                  06 / LIBRARY
                </p>

                <h1
                  className={`section-title ${styles.libraryTitle}`}
                >
                  The works.
                  <br />
                  Read, watch,
                  <br />
                  listen.
                </h1>

                <p
                  className={`body-large ${styles.libraryHeaderLead}`}
                >
                  A living archive of{" "}
                  books, experiments,
                  media, and other{" "}
                  original work.
                </p>
              </div>
            </header>

            <div
              className={
                styles.libraryFilters
              }
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
                      className={
                        styles.libraryFilter
                      }
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
              <div
                className={
                  styles.libraryLoading
                }
              >
                <span className="status-dot" />

                <span>
                  LOADING
                </span>
              </div>
            )}

            {error && (
              <div
                className={
                  styles.libraryError
                }
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
                <div
                  className={
                    styles.libraryLayout
                  }
                >
                  <section
                    className={
                      styles.libraryGallery
                    }
                    aria-label="Library collection"
                  >
                    <div
                      className={
                        styles.libraryCatalogHeader
                      }
                    >
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
                      <div
                        className={
                          styles.libraryFeaturedStrip
                        }
                      >
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
                                className={
                                  styles.libraryFeaturedCard
                                }
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
                                <div
                                  className={
                                    styles.libraryFeaturedCardVisual
                                  }
                                >
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

                                <div
                                  className={
                                    styles.libraryFeaturedCardContent
                                  }
                                >
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

                    <div
                      className={
                        styles.libraryList
                      }
                    >
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
                              className={
                                styles.libraryItem
                              }
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
                              <span
                                className={
                                  styles.libraryItemType
                                }
                              >
                                {
                                  getCatalogLabel(
                                    item
                                  )
                                }
                              </span>

                              <span
                                className={
                                  styles.libraryItemMain
                                }
                              >
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
                                className={
                                  styles.libraryItemArrow
                                }
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
                        <div
                          className={
                            styles.libraryEmpty
                          }
                        >
                          No published media{" "}
                          exists in this{" "}
                          category yet.
                        </div>
                      )}
                    </div>
                  </section>

                  <section
                    className={
                      styles.libraryPreview
                    }
                    aria-label="Selected work preview"
                  >
                    {!selected && (
                      <div
                        className={
                          styles.libraryPreviewEmpty
                        }
                      >
                        <span
                          className={
                            styles.libraryPreviewEmptyGlyph
                          }
                        >
                          EXPLORE
                        </span>

                        <strong>
                          Discover the{" "}
                          collection
                        </strong>

                        <p>
                          Choose a work to{" "}
                          see its preview,{" "}
                          story, and{" "}
                          publication{" "}
                          details.
                        </p>
                      </div>
                    )}

                    {selected && (
                      <article
                        className={
                          styles.libraryPreviewCard
                        }
                      >
                        <div
                          className={
                            styles.libraryPreviewArt
                          }
                          data-kind={
                            selected.kind
                          }
                          data-featured={
                            selected.featured
                              ? "true"
                              : "false"
                          }
                        >
                          <div
                            className={
                              styles.libraryPreviewArtGrid
                            }
                          />

                          <div
                            className={
                              styles.libraryPreviewArtOrbit
                            }
                          />

                          {selected.coverUrl ? (
                            <img
                              src={
                                selected.coverUrl
                              }
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className={
                                styles.libraryPreviewCover
                              }
                            />
                          ) : (
                            <>
                              <span
                                className={
                                  styles.libraryPreviewArtType
                                }
                              >
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
                              <small
                                className={
                                  styles.libraryPreviewCoverAuthor
                                }
                              >
                                {
                                  selected.author
                                }
                              </small>
                            )}

                          {selected.featured && (
                            <span
                              className={
                                styles.libraryFeaturedMark
                              }
                            >
                              FEATURED
                            </span>
                          )}
                        </div>

                        <div
                          className={
                            styles.libraryPreviewContent
                          }
                        >
                          <div
                            className={
                              styles.libraryPreviewKicker
                            }
                          >
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
                            <p
                              className={
                                styles.libraryPreviewSubtitle
                              }
                            >
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
                              <div
                                className={
                                  styles.libraryPreviewTags
                                }
                              >
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

                          <div
                            className={
                              styles.libraryPreviewMeta
                            }
                          >
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

                          <div
                            className={
                              styles.libraryPreviewActions
                            }
                          >
                            <button
                              type="button"
                              className={
                                styles.libraryOpenButton
                              }
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

                              <span
                                aria-hidden="true"
                              >
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
