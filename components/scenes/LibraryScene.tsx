"use client";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  getContentKindLabel,
  listBranchContent,
  type ContentItem
} from "@/lib/contentRepository";

const LIBRARY_BRANCH =
  "Books";

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

    void listBranchContent(
      LIBRARY_BRANCH
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

  const groupedItems =
    useMemo(() => {
      return items.reduce(
        (
          groups,
          item
        ) => {
          const group =
            groups[
              item.kind
            ] ?? [];

          group.push(
            item
          );

          groups[
            item.kind
          ] = group;

          return groups;
        },
        {} as Record<
          string,
          ContentItem[]
        >
      );
    }, [items]);

  const renderViewer =
    () => {
      if (
        !selected
      ) {
        return (
          <div className="library-viewer-empty">
            Select a work to open it.
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
                CONTENTS / BOOKS
              </span>
            </div>
          </header>

          {loading && (
            <div className="library-loading">
              <span className="status-dot" />

              <span>
                LOADING LIBRARY
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
                        Books
                      </h2>
                    </div>

                    <span>
                      {String(
                        items.length
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>
                  </div>

                  <div className="library-list">
                    {Object.entries(
                      groupedItems
                    ).map(
                      ([
                        kind,
                        content
                      ]) => (
                        <div
                          className="library-group"
                          key={kind}
                        >
                          <div className="library-group-label">
                            {getContentKindLabel(
                              kind as ContentItem["kind"]
                            )}
                          </div>

                          {content.map(
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
                                    {getContentKindLabel(
                                      item.kind
                                    )}
                                  </span>

                                  <span className="library-item-main">
                                    <strong>
                                      {titleFromFileName(
                                        item.name
                                      )}
                                    </strong>

                                    <small>
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
                        </div>
                      )
                    )}

                    {items.length ===
                      0 && (
                      <div className="library-empty">
                        No supported media
                        found in this
                        collection.
                      </div>
                    )}
                  </div>

                  <p className="library-source">
                    Stored in the public
                    <strong>
                      Contents
                    </strong>{" "}
                    repository.
                  </p>
                </aside>

                <section className="library-viewer">
                  <div className="library-viewer-header">
                    <div>
                      <span>
                        {selected
                          ? getContentKindLabel(
                              selected.kind
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
