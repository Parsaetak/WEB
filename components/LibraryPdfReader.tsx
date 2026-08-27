"use client";

import {
  useCallback,
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

  onProgress?: (
    data: PdfProgressData
  ) => void;
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

const NAVIGATION_PAGE_COUNT =
  10;

const NAVIGATION_WINDOW_BEHIND =
  2;

const BACKGROUND_LOOK_AHEAD =
  3;

const SCRUB_SEEK_DELAY =
  140;

const READ_ZOOM_SCALE =
  1.6;

const MAX_RENDER_DPR =
  2;

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
        callback,
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

const READING_POSITION_PREFIX =
  "library-reading-position:";

type SavedReadingPosition = {
  page: number;

  total: number;

  updatedAt: number;
};

function getReadingPositionStorageKey(
  src: string
) {
  return READING_POSITION_PREFIX + src;
}

function readSavedReadingPosition(
  src: string
): SavedReadingPosition | null {
  if (
    typeof window ===
      "undefined" ||
    !window.localStorage
  ) {
    return null;
  }

  try {
    const raw =
      window.localStorage.getItem(
        getReadingPositionStorageKey(
          src
        )
      );

    if (
      !raw
    ) {
      return null;
    }

    const parsed =
      JSON.parse(
        raw
      ) as Partial<SavedReadingPosition> | null;

    if (
      !parsed ||
      typeof parsed.page !==
        "number" ||
      !Number.isFinite(
        parsed.page
      ) ||
      parsed.page <
        1
    ) {
      return null;
    }

    return {
      page: Math.floor(
        parsed.page
      ),

      total:
        typeof parsed.total ===
          "number"
          ? parsed.total
          : 0,

      updatedAt:
        typeof parsed.updatedAt ===
          "number"
          ? parsed.updatedAt
          : 0
    };
  } catch {
    return null;
  }
}

function writeSavedReadingPosition(
  src: string,
  page: number,
  total: number
) {
  if (
    typeof window ===
      "undefined" ||
    !window.localStorage
  ) {
    return;
  }

  try {
    window.localStorage.setItem(
      getReadingPositionStorageKey(
        src
      ),
      JSON.stringify(
        {
          page,
          total,
          updatedAt: Date.now()
        }
      )
    );
  } catch {
    /*
     * Persisting the reading position is best effort.
     * Private browsing or storage limits must never interrupt reading.
     */
  }
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

  const readerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const scrubTimerRef =
    useRef<number | null>(
      null
    );

  const thumbnailRefs =
    useRef(
      new Map<
        number,
        HTMLSpanElement
      >()
    );

  const documentRef =
    useRef<PdfDocument | null>(
      null
    );

  const loadingTaskRef =
    useRef<PdfLoadingTask | null>(
      null
    );

  const renderTaskRef =
    useRef<PdfRenderTask | null>(
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

  const thumbnailInFlightRef =
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

  const [
    savedPosition,
    setSavedPosition
  ] = useState<
    SavedReadingPosition | null
  >(() =>
    readSavedReadingPosition(
      src
    )
  );

  const [
    resumedAtPage,
    setResumedAtPage
  ] = useState<
    number | null
  >(null);

  const [
    isFullscreen,
    setIsFullscreen
  ] = useState(false);

  const [
    scrubValue,
    setScrubValue
  ] = useState(1);

  const latestPositionRef =
    useRef<
      | (SavedReadingPosition & {
          src: string;
        })
      | null
    >(null);

  const pageCount =
    pdf?.numPages ??
    0;

  const navigationCount =
    Math.min(
      NAVIGATION_PAGE_COUNT,
      pageCount
    );

  const navigationStart =
    pageCount > 0
      ? clamp(
          pageNumber -
            NAVIGATION_WINDOW_BEHIND,
          1,
          Math.max(
            1,
            pageCount -
              navigationCount +
              1
          )
        )
      : 1;

  const navigationEnd =
    Math.min(
      navigationStart +
        navigationCount -
        1,
      Math.max(
        pageCount,
        navigationStart
      )
    );

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

  const renderThumbnail =
    useCallback(
      async (
        pdfDocument: PdfDocument,
        number: number
      ) => {
        if (
          thumbnailInFlightRef.current.has(
            number
          )
        ) {
          return;
        }

        const host =
          thumbnailRefs.current.get(
            number
          );

        if (!host) {
          return;
        }

        if (
          host.querySelector(
            "canvas"
          )
        ) {
          return;
        }

        thumbnailInFlightRef.current.add(
          number
        );

        try {
          const page =
            await pdfDocument.getPage(
              number
            );

          const baseViewport =
            page.getViewport({
              scale: 1
            });

          const thumbnailWidth =
            112;

          const thumbnailScale =
            thumbnailWidth /
            baseViewport.width;

          const viewport =
            page.getViewport({
              scale:
                thumbnailScale
            });

          const dpr =
            Math.min(
              window.devicePixelRatio ||
                1,
              1.5
            );

          const canvas =
            globalThis.document.createElement(
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
            return;
          }

          canvas.width =
            Math.ceil(
              viewport.width *
                dpr
            );

          canvas.height =
            Math.ceil(
              viewport.height *
                dpr
            );

          canvas.style.width =
            `${viewport.width}px`;

          canvas.style.height =
            `${viewport.height}px`;

          canvas.className =
            "library-pdf-thumbnail-canvas";

          context.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
          );

          host.replaceChildren(
            canvas
          );

          const thumbnailTask =
            page.render({
              canvas,
              canvasContext:
                context,
              viewport
            });

          await thumbnailTask.promise;
        } catch {
          /*
           * Thumbnail rendering is supplementary.
           * Failure must not interrupt reading.
           */
        } finally {
          thumbnailInFlightRef.current.delete(
            number
          );
        }
      },
      []
    );

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

    setScale(
      1
    );

    setResumedAtPage(
      null
    );

    prefetchedPagesRef.current.clear();

    thumbnailInFlightRef.current.clear();

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

              rangeChunkSize:
                RANGE_CHUNK_SIZE,

              disableRange:
                false,

              disableStream:
                true,

              disableAutoFetch:
                true
            });

          loadingTaskRef.current =
            loadingTask;

          loadingTask.onProgress =
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
                  clamp(
                    Math.round(
                      (
                        data.loaded /
                        data.total
                      ) *
                        100
                    ),
                    0,
                    100
                  )
                );
              }
            };

          const pdfDocument =
            await loadingTask.promise;

          if (
            cancelled
          ) {
            await pdfDocument.destroy?.();
            return;
          }

          documentRef.current =
            pdfDocument;

          const restoredPosition =
            readSavedReadingPosition(
              src
            );

          setSavedPosition(
            restoredPosition
          );

          if (
            restoredPosition &&
            restoredPosition.page >
              1 &&
            restoredPosition.page <=
              pdfDocument.numPages
          ) {
            setPageNumber(
              restoredPosition.page
            );

            setPageInput(
              String(
                restoredPosition.page
              )
            );

            setResumedAtPage(
              restoredPosition.page
            );
          }

          setPdf(
            pdfDocument
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

      renderTaskRef.current?.cancel();

      prefetchCancelRef.current?.();

      prefetchCancelRef.current =
        null;

      const pdfDocument =
        documentRef.current;

      const loadingTask =
        loadingTaskRef.current;

      documentRef.current =
        null;

      loadingTaskRef.current =
        null;

      void loadingTask?.destroy?.();

      void pdfDocument?.destroy?.();
    };
  }, [
    src
  ]);

  useEffect(() => {
    if (
      !pdf
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

          const stage =
            stageRef.current;

          if (
            cancelled ||
            !stage
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
              stage.clientWidth -
                54
            );

          setFitScale(
            clamp(
              availableWidth /
                viewport.width,
              0.45,
              2.2
            )
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
      !pdf
    ) {
      return;
    }

    const stage =
      stageRef.current;

    if (
      !stage
    ) {
      return;
    }

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
                54
            );

          setFitScale(
            clamp(
              availableWidth /
                viewport.width,
              0.45,
              2.2
            )
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

    const renderPage =
      async () => {
        setRendering(
          true
        );

        setError(
          null
        );

        renderTaskRef.current?.cancel();

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

          const dpr =
            Math.min(
              window.devicePixelRatio ||
                1,
              MAX_RENDER_DPR
            );

          const canvas =
            globalThis.document.createElement(
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
                  dpr
              )
            );

          canvas.height =
            Math.max(
              1,
              Math.ceil(
                viewport.height *
                  dpr
              )
            );

          canvas.style.width =
            `${viewport.width}px`;

          canvas.style.height =
            `${viewport.height}px`;

          canvas.className =
            "library-pdf-page";

          context.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
          );

          pageRef.current.replaceChildren(
            canvas
          );

          const renderTask =
            page.render({
              canvas,
              canvasContext:
                context,
              viewport
            });

          renderTaskRef.current =
            renderTask;

          await renderTask.promise;

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

      renderTaskRef.current?.cancel();

      renderTaskRef.current =
        null;
    };
  }, [
    pdf,
    pageNumber,
    scale
  ]);

  useEffect(() => {
    if (
      !pdf ||
      navigationCount ===
        0
    ) {
      return;
    }

    let cancelled =
      false;

    let cancelIdle:
      | (() => void)
      | null =
      null;

    /*
     * Thumbnails render inside a strict byte budget: only the
     * current page and its look-ahead neighbours. Those page
     * objects are fetched for reading anyway, so the sidebar
     * costs no additional range requests. Everything else in
     * the window stays a numbered placeholder until the reader
     * navigates to it.
     */
    const eagerPages: number[] =
      [];

    const lastEagerPage =
      Math.min(
        pdf.numPages,
        pageNumber +
          BACKGROUND_LOOK_AHEAD
      );

    for (
      let number = pageNumber;
      number <=
        lastEagerPage;
      number += 1
    ) {
      eagerPages.push(
        number
      );
    }

    let index = 0;

    const runNext =
      () => {
        if (
          cancelled ||
          index >=
            eagerPages.length
        ) {
          return;
        }

        void renderThumbnail(
          pdf,
          eagerPages[
            index
          ]
        ).then(() => {
          if (
            cancelled
          ) {
            return;
          }

          index +=
            1;

          if (
            index <
            eagerPages.length
          ) {
            cancelIdle =
              scheduleIdle(
                runNext
              );
          }
        });
      };

    if (
      eagerPages.length >
      0
    ) {
      cancelIdle =
        scheduleIdle(
          runNext
        );
    }

    return () => {
      cancelled =
        true;

      cancelIdle?.();
    };
  }, [
    pdf,
    pageNumber,
    navigationCount,
    renderThumbnail
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
        BACKGROUND_LOOK_AHEAD;
      offset +=
        1
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

    const warmNext =
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

        setBackgroundLoading(
          true
        );

        const candidate =
          pagesToWarm[
            index
          ];

        try {
          await pdf.getPage(
            candidate
          );

          if (
            cancelled
          ) {
            return;
          }

          prefetchedPagesRef.current.add(
            candidate
          );
        } catch {
          /*
           * Background warming is optional.
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
              void warmNext(
                index + 1
              );
            }
          );
      };

    prefetchCancelRef.current =
      scheduleIdle(
        () => {
          void warmNext(
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

  useEffect(() => {
    if (
      !pdf
    ) {
      latestPositionRef.current =
        null;

      return;
    }

    latestPositionRef.current =
      {
        src,

        page: pageNumber,

        total:
          pdf.numPages,

        updatedAt: Date.now()
      };

    const timer =
      window.setTimeout(
        () => {
          writeSavedReadingPosition(
            src,
            pageNumber,
            pdf.numPages
          );
        },
        400
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    pdf,
    pageNumber,
    src
  ]);

  useEffect(() => {
    return () => {
      const latest =
        latestPositionRef.current;

      if (
        !latest
      ) {
        return;
      }

      writeSavedReadingPosition(
        latest.src,
        latest.page,
        latest.total
      );
    };
  }, []);

  useEffect(() => {
    if (
      resumedAtPage ===
        null
    ) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          setResumedAtPage(
            null
          );
        },
        4000
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    resumedAtPage
  ]);

  useEffect(() => {
    const syncFullscreen =
      () => {
        setIsFullscreen(
          Boolean(
            globalThis.document?.fullscreenElement
          )
        );
      };

    globalThis.document?.addEventListener(
      "fullscreenchange",
      syncFullscreen
    );

    return () => {
      globalThis.document?.removeEventListener(
        "fullscreenchange",
        syncFullscreen
      );
    };
  }, []);

  useEffect(() => {
    setScrubValue(
      pageNumber
    );
  }, [
    pageNumber
  ]);

  useEffect(() => {
    return () => {
      if (
        scrubTimerRef.current !==
          null
      ) {
        window.clearTimeout(
          scrubTimerRef.current
        );

        scrubTimerRef.current =
          null;
      }
    };
  }, []);

  const toggleFullscreen =
    () => {
      const element =
        readerRef.current;

      if (
        !element
      ) {
        return;
      }

      try {
        if (
          globalThis.document.fullscreenElement
        ) {
          void globalThis.document.exitFullscreen?.();
        } else {
          void element.requestFullscreen?.()?.catch(
            () => {
              /*
               * Fullscreen is a nice-to-have.
               * Denial must never interrupt reading.
               */
            }
          );
        }
      } catch {
        /* Fullscreen unavailable — ignore. */
      }
    };

  const seekFromScrubber =
    (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const requested =
        Number(
          event.target.value
        );

      if (
        !Number.isFinite(
          requested
        ) ||
        pageCount ===
          0
      ) {
        return;
      }

      const target =
        clamp(
          Math.round(
            requested
          ),
          1,
          pageCount
        );

      setScrubValue(
        target
      );

      setPageInput(
        String(
          target
        )
      );

      if (
        scrubTimerRef.current !==
          null
      ) {
        window.clearTimeout(
          scrubTimerRef.current
        );
      }

      scrubTimerRef.current =
        window.setTimeout(
          () => {
            scrubTimerRef.current =
              null;

            goToPage(
              target
            );
          },
          SCRUB_SEEK_DELAY
        );
    };

  const toggleReadingZoom =
    () => {
      setScale(
        (
          current
        ) =>
          current >
            fitScale +
              0.05
            ? fitScale
            : Math.max(
                fitScale,
                READ_ZOOM_SCALE
              )
      );
    };

  const goToPage =
    (
      number: number
    ) => {
      if (
        pageCount ===
        0
      ) {
        return;
      }

      const target =
        clamp(
          Math.round(
            number
          ),
          1,
          pageCount
        );

      setPageNumber(
        target
      );

      setPageInput(
        String(
          target
        )
      );

      thumbnailRefs.current
        .get(
          target
        )
        ?.scrollIntoView({
          behavior:
            "smooth",
          block:
            "nearest"
        });
    };

  const submitPage =
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

      goToPage(
        requested
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

  const previousPage =
    () => {
      goToPage(
        pageNumber -
          1
      );
    };

  const nextPage =
    () => {
      goToPage(
        pageNumber +
          1
      );
    };

  const handleKeyDown =
    (
      event: React.KeyboardEvent
    ) => {
      if (
        event.key ===
          "Escape" &&
        globalThis.document?.fullscreenElement
      ) {
        /*
         * Inside fullscreen the browser owns Escape:
         * exit the view, keep the reader open.
         */
        event.stopPropagation();

        event.preventDefault();

        return;
      }

      if (
        event.key ===
          "PageUp"
      ) {
        event.preventDefault();
        previousPage();
      }

      if (
        event.key ===
          "PageDown"
      ) {
        event.preventDefault();
        nextPage();
      }

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
        goToPage(
          1
        );
      }

      if (
        event.key ===
        "End"
      ) {
        event.preventDefault();
        goToPage(
          pageCount
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
                        "28%"
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

            {savedPosition &&
              savedPosition.page >
                1 && (
              <span>
                RESUME AT PAGE{" "}
                {
                  savedPosition.page
                }
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
      ref={readerRef}
      className="library-pdf-reader"
      data-fullscreen={
        isFullscreen
          ? "true"
          : "false"
      }
      tabIndex={0}
      aria-label={
        `${title} reader`
      }
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
              submitPage
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
              /{" "}
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
          {resumedAtPage !==
            null && (
            <span>
              RESUMED AT PAGE{" "}
              {
                resumedAtPage
              }
            </span>
          )}

          {resumedAtPage ===
            null &&
            rendering && (
              <span>
                RENDERING
              </span>
            )}

          {resumedAtPage ===
            null &&
            !rendering &&
            backgroundLoading && (
              <span>
                LOADING NEXT
              </span>
            )}

          {resumedAtPage ===
            null &&
            !rendering &&
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
            aria-pressed={
              Math.abs(
                scale -
                  fitScale
              ) <
              0.05
                ? "true"
                : "false"
            }
          >
            FIT
          </button>

          <button
            type="button"
            onClick={
              toggleFullscreen
            }
            aria-pressed={
              isFullscreen
                ? "true"
                : "false"
            }
            aria-label={
              isFullscreen
                ? "Exit fullscreen"
                : "Enter fullscreen"
            }
          >
            ⛶
          </button>
        </div>
      </div>

      <div className="library-pdf-reader-body">
        <aside className="library-pdf-navigation">
          <div className="library-pdf-navigation-header">
            <span>
              PAGES
            </span>

            <strong>
              {String(
                navigationStart
              ).padStart(
                2,
                "0"
              )}
              –
              {String(
                navigationEnd
              ).padStart(
                2,
                "0"
              )}
              {" / "}
              {pageCount}
            </strong>
          </div>

          <div className="library-pdf-thumbnails">
            {Array.from(
              {
                length: Math.max(
                  0,
                  navigationEnd -
                    navigationStart +
                    1
                )
              },
              (
                _,
                index
              ) => {
                const number =
                  navigationStart +
                  index;

                const active =
                  pageNumber ===
                  number;

                return (
                  <button
                    key={
                      number
                    }
                    type="button"
                    className="library-pdf-thumbnail"
                    data-active={
                      active
                        ? "true"
                        : "false"
                    }
                    onClick={() =>
                      goToPage(
                        number
                      )
                    }
                    aria-label={
                      `Go to page ${number}`
                    }
                  >
                    <span
                      className="library-pdf-thumbnail-page"
                      ref={(
                        element
                      ) => {
                        if (
                          element
                        ) {
                          thumbnailRefs.current.set(
                            number,
                            element
                          );
                        } else {
                          thumbnailRefs.current.delete(
                            number
                          );
                        }
                      }}
                    >
                      <span className="library-pdf-thumbnail-placeholder">
                        {String(
                          number
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>
                    </span>

                    <span className="library-pdf-thumbnail-label">
                      {String(
                        number
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </aside>

        <main className="library-pdf-main">
          <div
            ref={stageRef}
            className="library-pdf-stage"
            onDoubleClick={
              toggleReadingZoom
            }
          >
            <div className="library-pdf-reading-indicator">
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
                %
              </span>
            </div>

            <div
              ref={pageRef}
              className="library-pdf-page-host"
            />

            {rendering && (
              <div className="library-pdf-rendering">
                RENDERING
              </div>
            )}
          </div>
        </main>
      </div>

      <footer className="library-pdf-reader-footer">
        <span className="library-pdf-footer-meta">
          PAGE{" "}
          {String(
            pageNumber
          ).padStart(
            2,
            "0"
          )}
        </span>

        <input
          className="library-pdf-scrubber"
          type="range"
          min={1}
          max={Math.max(
            1,
            pageCount
          )}
          step={1}
          value={Math.min(
            Math.max(
              1,
              scrubValue
            ),
            Math.max(
              1,
              pageCount
            )
          )}
          onChange={
            seekFromScrubber
          }
          style={
            {
              "--scrub-progress": `${readingProgress}%`
            } as React.CSSProperties
          }
          aria-label="Reading position"
          disabled={
            pageCount <=
            1
          }
        />

        <span className="library-pdf-footer-meta">
          {readingProgress}
          % READ
        </span>

        {backgroundLoading && (
          <span className="library-pdf-footer-prefetch">
            PREFETCHING
          </span>
        )}
      </footer>
    </div>
  );
}
