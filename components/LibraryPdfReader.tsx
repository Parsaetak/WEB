"use client";

import {
  useEffect,
  useRef,
  useState
} from "react";

type PdfViewport = {
  width: number;
  height: number;
};

type PdfRenderTask = {
  promise: Promise<void>;
  cancel: () => void;
};

type PdfPage = {
  getViewport: (
    options: {
      scale: number;
    }
  ) => PdfViewport;

  render: (
    options: {
      canvas: HTMLCanvasElement;
      canvasContext: CanvasRenderingContext2D;
      viewport: PdfViewport;
    }
  ) => PdfRenderTask;
};

type PdfDocument = {
  numPages: number;

  getPage: (
    pageNumber: number
  ) => Promise<PdfPage>;

  destroy?: () => Promise<void>;
};

type PdfProgressData = {
  loaded: number;
  total?: number;
};

type PdfLoadingTask = {
  promise: Promise<PdfDocument>;

  destroy?: () => Promise<void>;
};

type PdfJs = {
  GlobalWorkerOptions: {
    workerSrc: string;
  };

  getDocument: (
    source: {
      url: string;
      withCredentials?: boolean;
      rangeChunkSize?: number;
      disableRange?: boolean;
      disableStream?: boolean;
      disableAutoFetch?: boolean;
    }
  ) => PdfLoadingTask;
};

type LibraryPdfReaderProps = {
  src: string;
  title: string;
};

const PDF_JS_URL =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.2.108/build/pdf.min.mjs";

const PDF_WORKER_URL =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.2.108/build/pdf.worker.min.mjs";

const RANGE_CHUNK_SIZE =
  256 * 1024;

const PREFETCH_AHEAD =
  3;

let pdfJsPromise:
  | Promise<PdfJs>
  | null = null;

function loadPdfJs(): Promise<PdfJs> {
  if (
    pdfJsPromise
  ) {
    return pdfJsPromise;
  }

  pdfJsPromise =
    import(
      /* webpackIgnore: true */
      PDF_JS_URL
    ) as unknown as Promise<PdfJs>;

  return pdfJsPromise;
}

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}

function scheduleIdle(
  callback: () => void
) {
  if (
    typeof window !==
      "undefined" &&
    typeof window.requestIdleCallback ===
      "function"
  ) {
    const id =
      window.requestIdleCallback(
        () => {
          callback();
        },
        {
          timeout:
            1200
        }
      );

    return () => {
      window.cancelIdleCallback(
        id
      );
    };
  }

  const id =
    globalThis.setTimeout(
      callback,
      300
    );

  return () => {
    globalThis.clearTimeout(
      id
    );
  };
}

function formatProgress(
  loaded: number,
  total?: number
) {
  if (
    !total ||
    total <= 0
  ) {
    return null;
  }

  return clamp(
    Math.round(
      (
        loaded /
        total
      ) *
        100
    ),
    0,
    100
  );
}

function formatBytes(
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
    return `${Math.round(
      bytes /
        1024
    )} KB`;
  }

  return `${(
    bytes /
    (
      1024 *
      1024
    )
  ).toFixed(
    1
  )} MB`;
}

export default function LibraryPdfReader({
  src,
  title
}: LibraryPdfReaderProps) {
  const stageRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const pageRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const documentRef =
    useRef<PdfDocument | null>(
      null
    );

  const loadingTaskRef =
    useRef<PdfLoadingTask | null>(
      null
    );

  const prefetchCancelRef =
    useRef<
      (() => void) | null
    >(null);

  const prefetchedPagesRef =
    useRef(
      new Set<number>()
    );

  const [
    pdf,
    setPdf
  ] = useState<
    PdfDocument | null
  >(null);

  const [
    pageNumber,
    setPageNumber
  ] = useState(1);

  const [
    pageInput,
    setPageInput
  ] = useState("1");

  const [
    scale,
    setScale
  ] = useState(1);

  const [
    fitScale,
    setFitScale
  ] = useState(1);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    rendering,
    setRendering
  ] = useState(false);

  const [
    backgroundLoading,
    setBackgroundLoading
  ] = useState(false);

  const [
    loadProgress,
    setLoadProgress
  ] = useState<
    number | null
  >(null);

  const [
    bytesLoaded,
    setBytesLoaded
  ] = useState(0);

  const [
    bytesTotal,
    setBytesTotal
  ] = useState<
    number | null
  >(null);

  const [
    error,
    setError
  ] = useState<
    string | null
  >(null);

  useEffect(() => {
    let cancelled =
      false;

    setLoading(
      true
    );

    setRendering(
      false
    );

    setBackgroundLoading(
      false
    );

    setLoadProgress(
      null
    );

    setBytesLoaded(
      0
    );

    setBytesTotal(
      null
    );

    setError(
      null
    );

    setPdf(
      null
    );

    setPageNumber(
      1
    );

    setPageInput(
      "1"
    );

    prefetchedPagesRef.current.clear();

    documentRef.current =
      null;

    loadingTaskRef.current =
      null;

    void loadPdfJs()
      .then(
        async (
          pdfjs
        ) => {
          if (
            cancelled
          ) {
            return;
          }

          pdfjs.GlobalWorkerOptions.workerSrc =
            PDF_WORKER_URL;

          const loadingTask =
            pdfjs.getDocument({
              url:
                src,

              withCredentials:
                false,

              disableRange:
                false,

              disableStream:
                true,

              disableAutoFetch:
                true,

              rangeChunkSize:
                RANGE_CHUNK_SIZE
            });

          loadingTaskRef.current =
            loadingTask;

          const progressTask =
            loadingTask as PdfLoadingTask & {
              onProgress?: (
                data: PdfProgressData
              ) => void;
            };

          progressTask.onProgress =
            (
              data
            ) => {
              if (
                cancelled
              ) {
                return;
              }

              setBytesLoaded(
                data.loaded
              );

              if (
                typeof data.total ===
                  "number" &&
                data.total > 0
              ) {
                setBytesTotal(
                  data.total
                );

                setLoadProgress(
                  formatProgress(
                    data.loaded,
                    data.total
                  )
                );

                return;
              }

              setLoadProgress(
                null
              );
            };

          const document =
            await loadingTask.promise;

          if (
            cancelled
          ) {
            await document.destroy?.();
            return;
          }

          documentRef.current =
            document;

          setPdf(
            document
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
              : "Unable to open this PDF."
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

      prefetchCancelRef.current?.();

      prefetchCancelRef.current =
        null;

      const document =
        documentRef.current;

      const loadingTask =
        loadingTaskRef.current;

      documentRef.current =
        null;

      loadingTaskRef.current =
        null;

      void loadingTask?.destroy?.();

      void document?.destroy?.();
    };
  }, [
    src
  ]);

  useEffect(() => {
    if (
      !pdf ||
      !stageRef.current
    ) {
      return;
    }

    let cancelled =
      false;

    const updateFit =
      async () => {
        try {
          const page =
            await pdf.getPage(
              pageNumber
            );

          if (
            cancelled ||
            !stageRef.current
          ) {
            return;
          }

          const viewport =
            page.getViewport({
              scale: 1
            });

          const availableWidth =
            Math.max(
              280,
              stageRef.current.clientWidth -
                44
            );

          const nextFit =
            clamp(
              availableWidth /
                viewport.width,
              0.45,
              2.2
            );

          setFitScale(
            nextFit
          );
        } catch {
          if (
            !cancelled
          ) {
            setFitScale(
              1
            );
          }
        }
      };

    void updateFit();

    return () => {
      cancelled =
        true;
    };
  }, [
    pdf,
    pageNumber
  ]);

  useEffect(() => {
    if (
      !pdf ||
      !stageRef.current
    ) {
      return;
    }

    const stage =
      stageRef.current;

    const updateFit =
      async () => {
        try {
          const page =
            await pdf.getPage(
              pageNumber
            );

          const viewport =
            page.getViewport({
              scale: 1
            });

          const availableWidth =
            Math.max(
              280,
              stage.clientWidth -
                44
            );

          const nextFit =
            clamp(
              availableWidth /
                viewport.width,
              0.45,
              2.2
            );

          setFitScale(
            nextFit
          );
        } catch {
          setFitScale(
            1
          );
        }
      };

    const observer =
      new ResizeObserver(
        () => {
          void updateFit();
        }
      );

    observer.observe(
      stage
    );

    void updateFit();

    return () => {
      observer.disconnect();
    };
  }, [
    pdf,
    pageNumber
  ]);

  useEffect(() => {
    if (
      !pdf ||
      !pageRef.current
    ) {
      return;
    }

    let cancelled =
      false;

    let activeRenderTask:
      | PdfRenderTask
      | null = null;

    const renderPage =
      async () => {
        setRendering(
          true
        );

        setError(
          null
        );

        try {
          const page =
            await pdf.getPage(
              pageNumber
            );

          if (
            cancelled ||
            !pageRef.current
          ) {
            return;
          }

          const viewport =
            page.getViewport({
              scale
            });

          const devicePixelRatio =
            Math.min(
              window.devicePixelRatio ||
                1,
              2
            );

          const canvas =
            document.createElement(
              "canvas"
            );

          const context =
            canvas.getContext(
              "2d",
              {
                alpha:
                  false
              }
            );

          if (!context) {
            throw new Error(
              "Canvas rendering is unavailable."
            );
          }

          canvas.width =
            Math.max(
              1,
              Math.ceil(
                viewport.width *
                  devicePixelRatio
              )
            );

          canvas.height =
            Math.max(
              1,
              Math.ceil(
                viewport.height *
                  devicePixelRatio
              )
            );

          canvas.style.width =
            `${viewport.width}px`;

          canvas.style.height =
            `${viewport.height}px`;

          canvas.className =
            "library-pdf-page";

          context.setTransform(
            devicePixelRatio,
            0,
            0,
            devicePixelRatio,
            0,
            0
          );

          pageRef.current.replaceChildren(
            canvas
          );

          activeRenderTask =
            page.render({
              canvas,
              canvasContext:
                context,
              viewport
            });

          await activeRenderTask.promise;

          if (
            !cancelled
          ) {
            setRendering(
              false
            );
          }
        } catch (
          reason
        ) {
          if (
            cancelled
          ) {
            return;
          }

          setRendering(
            false
          );

          setError(
            reason instanceof
              Error
              ? reason.message
              : "Unable to render this page."
          );
        }
      };

    void renderPage();

    return () => {
      cancelled =
        true;

      activeRenderTask?.cancel();
    };
  }, [
    pdf,
    pageNumber,
    scale
  ]);

  useEffect(() => {
    if (
      !pdf
    ) {
      return;
    }

    prefetchCancelRef.current?.();

    prefetchCancelRef.current =
      null;

    const pagesToWarm:
      number[] =
      [];

    for (
      let offset = 1;
      offset <=
        PREFETCH_AHEAD;
      offset += 1
    ) {
      const candidate =
        pageNumber +
        offset;

      if (
        candidate >
        pdf.numPages
      ) {
        break;
      }

      if (
        prefetchedPagesRef.current.has(
          candidate
        )
      ) {
        continue;
      }

      pagesToWarm.push(
        candidate
      );
    }

    if (
      pagesToWarm.length ===
      0
    ) {
      setBackgroundLoading(
        false
      );

      return;
    }

    let cancelled =
      false;

    const loadNextPage =
      async (
        index: number
      ) => {
        if (
          cancelled ||
          index >=
            pagesToWarm.length
        ) {
          if (
            !cancelled
          ) {
            setBackgroundLoading(
              false
            );
          }

          return;
        }

        const nextPage =
          pagesToWarm[index];

        setBackgroundLoading(
          true
        );

        try {
          await pdf.getPage(
            nextPage
          );

          if (
            cancelled
          ) {
            return;
          }

          prefetchedPagesRef.current.add(
            nextPage
          );
        } catch {
          /*
           * Background warming is optional.
           * Never interrupt active reading.
           */
        }

        if (
          cancelled
        ) {
          return;
        }

        prefetchCancelRef.current =
          scheduleIdle(
            () => {
              void loadNextPage(
                index + 1
              );
            }
          );
      };

    prefetchCancelRef.current =
      scheduleIdle(
        () => {
          void loadNextPage(
            0
          );
        }
      );

    return () => {
      cancelled =
        true;

      prefetchCancelRef.current?.();

      prefetchCancelRef.current =
        null;

      setBackgroundLoading(
        false
      );
    };
  }, [
    pdf,
    pageNumber
  ]);

  const pageCount =
    pdf?.numPages ??
    0;

  const readingProgress =
    pageCount > 0
      ? Math.round(
          (
            pageNumber /
            pageCount
          ) *
            100
        )
      : 0;

  const previousPage =
    () => {
      setPageNumber(
        (
          current
        ) => {
          const next =
            Math.max(
              1,
              current - 1
            );

          setPageInput(
            String(
              next
            )
          );

          return next;
        }
      );
    };

  const nextPage =
    () => {
      setPageNumber(
        (
          current
        ) => {
          const next =
            Math.min(
              pageCount,
              current + 1
            );

          setPageInput(
            String(
              next
            )
          );

          return next;
        }
      );
    };

  const goToPage =
    (
      event: React.FormEvent
    ) => {
      event.preventDefault();

      const requested =
        Number(
          pageInput
        );

      if (
        !Number.isFinite(
          requested
        )
      ) {
        setPageInput(
          String(
            pageNumber
          )
        );

        return;
      }

      const target =
        Math.min(
          pageCount,
          Math.max(
            1,
            Math.round(
              requested
            )
          )
        );

      setPageNumber(
        target
      );

      setPageInput(
        String(
          target
        )
      );
    };

  const zoomOut =
    () => {
      setScale(
        (
          current
        ) =>
          clamp(
            Math.round(
              (
                current -
                0.1
              ) *
                10
            ) /
              10,
            0.5,
            2.2
          )
      );
    };

  const zoomIn =
    () => {
      setScale(
        (
          current
        ) =>
          clamp(
            Math.round(
              (
                current +
                0.1
              ) *
                10
            ) /
              10,
            0.5,
            2.2
          )
      );
    };

  const fitWidth =
    () => {
      setScale(
        fitScale
      );
    };

  const handleKeyDown =
    (
      event: React.KeyboardEvent
    ) => {
      if (
        event.key ===
        "ArrowLeft"
      ) {
        event.preventDefault();
        previousPage();
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        event.preventDefault();
        nextPage();
      }

      if (
        event.key ===
        "Home"
      ) {
        event.preventDefault();

        setPageNumber(
          1
        );

        setPageInput(
          "1"
        );
      }

      if (
        event.key ===
        "End"
      ) {
        event.preventDefault();

        setPageNumber(
          pageCount
        );

        setPageInput(
          String(
            pageCount
          )
        );
      }
    };

  if (
    loading
  ) {
    return (
      <div className="library-pdf-reader library-pdf-reader-opening">
        <div className="library-pdf-opening">
          <div className="library-pdf-opening-mark">
            <span />
            <span />
            <span />
          </div>

          <p className="kicker">
            LIBRARY / READER
          </p>

          <h2>
            Opening
            <br />
            {title}
          </h2>

          <div className="library-pdf-progress">
            <div
              className="library-pdf-progress-bar"
              style={
                loadProgress !==
                null
                  ? {
                      width:
                        `${loadProgress}%`
                    }
                  : {
                      width:
                        "34%"
                    }
              }
            />
          </div>

          <div className="library-pdf-opening-meta">
            <span>
              {loadProgress !==
              null
                ? `${loadProgress}%`
                : "PREPARING"}
            </span>

            {bytesTotal !==
              null && (
              <span>
                {formatBytes(
                  bytesLoaded
                )}
                {" / "}
                {formatBytes(
                  bytesTotal
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (
    error ||
    !pdf
  ) {
    return (
      <div className="library-pdf-reader">
        <div className="library-pdf-error">
          <strong>
            Unable to open
          </strong>

          <p>
            {error ??
              "This document could not be rendered."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="library-pdf-reader"
      aria-label={
        `${title} reader`
      }
      tabIndex={0}
      onKeyDown={
        handleKeyDown
      }
    >
      <header className="library-pdf-reader-header">
        <div className="library-pdf-reader-title">
          <span>
            BOOK
          </span>

          <strong>
            {title}
          </strong>
        </div>

        <div className="library-pdf-reader-progress">
          <span>
            {readingProgress}
            %
          </span>

          <div>
            <i
              style={{
                width:
                  `${readingProgress}%`
              }}
            />
          </div>
        </div>
      </header>

      <div className="library-pdf-toolbar">
        <div className="library-pdf-toolbar-group">
          <button
            type="button"
            onClick={
              previousPage
            }
            disabled={
              pageNumber <=
              1
            }
            aria-label="Previous page"
          >
            ←
          </button>

          <form
            className="library-pdf-page-form"
            onSubmit={
              goToPage
            }
          >
            <input
              value={
                pageInput
              }
              onChange={(
                event
              ) =>
                setPageInput(
                  event.target
                    .value
                )
              }
              inputMode="numeric"
              aria-label="Page number"
            />

            <span>
              /
              {" "}
              {pageCount}
            </span>
          </form>

          <button
            type="button"
            onClick={
              nextPage
            }
            disabled={
              pageNumber >=
              pageCount
            }
            aria-label="Next page"
          >
            →
          </button>
        </div>

        <div className="library-pdf-reader-state">
          {rendering && (
            <span>
              RENDERING
            </span>
          )}

          {!rendering &&
            backgroundLoading && (
              <span>
                LOADING NEXT
              </span>
            )}

          {!rendering &&
            !backgroundLoading && (
              <span>
                READY
              </span>
            )}
        </div>

        <div className="library-pdf-toolbar-group">
          <button
            type="button"
            onClick={
              zoomOut
            }
            aria-label="Zoom out"
          >
            −
          </button>

          <span>
            {Math.round(
              scale *
                100
            )}
            %
          </span>

          <button
            type="button"
            onClick={
              zoomIn
            }
            aria-label="Zoom in"
          >
            +
          </button>

          <button
            type="button"
            onClick={
              fitWidth
            }
          >
            FIT
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        className="library-pdf-stage"
      >
        <div className="library-pdf-reading-indicator">
          <span>
            {readingProgress}
            %
          </span>
        </div>

        <div
          ref={pageRef}
          className="library-pdf-page-host"
        />
      </div>

      <footer className="library-pdf-reader-footer">
        <span>
          PAGE{" "}
          {String(
            pageNumber
          ).padStart(
            2,
            "0"
          )}
        </span>

        <span>
          {readingProgress}
          % READ
        </span>

        {backgroundLoading && (
          <span>
            PREFETCHING
          </span>
        )}
      </footer>
    </div>
  );
}
