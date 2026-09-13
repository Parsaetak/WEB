"use client";

import dynamic from "next/dynamic";

import {
  useEffect,
  useMemo,
  useRef,
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

  /*
   * Focus target for the portal modal (see the opened effect):
   * focused on open, participates in the Tab cycle, focus returns
   * to the opening trigger on close.
   */
  const modalShellRef =
    useRef<HTMLDivElement | null>(
      null
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

    /*
     * Focus management (v2.8): the portal dialog is a plain div
     * (not a native <dialog>), so the platform provides no focus
     * trap or restoration. On open, remember the trigger, move
     * focus into the modal shell, and cycle Tab/Shift+Tab within
     * the modal's focusable elements; on close, hand focus back to
     * the trigger so keyboard and screen-reader readers never end
     * up stranded at the document start.
     */
    const previousFocus =
      document.activeElement instanceof
      HTMLElement
        ? document.activeElement
        : null;

    const shell =
      modalShellRef.current;

    if (shell) {
      shell.focus();
    }

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

          return;
        }

        if (
          event.key !==
            "Tab" ||
          !modalShellRef.current
        ) {
          return;
        }

        const focusable =
          modalShellRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'
          );

        if (
          focusable.length ===
          0
        ) {
          event.preventDefault();

          return;
        }

        const first =
          focusable[0];

        const last =
          focusable[focusable.length -
            1];

        const active =
          document.activeElement;

        if (
          event.shiftKey &&
          (active ===
            first ||
            active ===
            modalShellRef.current)
        ) {
          event.preventDefault();

          last.focus();
        } else if (
          !event.shiftKey &&
          active ===
          last
        ) {
          event.preventDefault();

          first.focus();
        } else if (
          active !==
            modalShellRef.current &&
          !modalShellRef.current.contains(
            active
          )
        ) {
          /* Focus escaped (e.g. clicked outside a control) — pull it back. */
          event.preventDefault();

          first.focus();
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

      previousFocus?.focus();
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
              ref={modalShellRef}
              tabIndex={-1}
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

                  {/*
                    * SOURCE (v2.8) — the item's GitHub origin.
                    * The URL was already computed for every item by
                    * lib/contentRepository but never surfaced; this
                    * gives the viewer an honest provenance link
                    * beside the download.
                    */}
                  <a
                    className={
                      styles.librarySourceButton
                    }
                    href={
                      selected.githubUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>SOURCE</span>

                    <span
                      aria-hidden="true"
                    >
                      ↗
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
                  The works
                  <br />
                  Read, watch,
                  <br />
                  listen
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
              role="group"
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
                      /*
                       * Toggle-style filter buttons (v2.8): the old
                       * role="tab"/aria-selected markup implied a
                       * tab pattern the component never implemented
                       * (no arrow-key handling, no tabpanels). A
                       * pressed/not-pressed button group describes
                       * exactly what these controls do.
                       */
                      aria-pressed={
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
