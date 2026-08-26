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
    scale,
    setScale
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
    error,
    setError
  ] = useState<
    string | null
  >(null);

  const [
    fitScale,
    setFitScale
  ] = useState(1);

  useEffect(() => {
    let cancelled =
      false;

    setLoading(
      true
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
              url: src,
              withCredentials:
                false
            });

          loadingTaskRef.current =
            loadingTask;

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
  }, [src]);

  useEffect(() => {
    if (
      !pdf ||
      !stageRef.current
    ) {
      return;
    }

    let cancelled =
      false;

    const calculateFitScale =
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

          if (
            !cancelled
          ) {
            setFitScale(
              nextFit
            );

            setScale(
              (
                current
              ) =>
                current ===
                fitScale
                  ? nextFit
                  : current
            );
          }
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

    void calculateFitScale();

    return () => {
      cancelled = true;
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

          const dpr =
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
                alpha: false
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
      cancelled = true;

      activeRenderTask?.cancel();
    };
  }, [
    pdf,
    pageNumber,
    scale
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

  const pageCount =
    pdf?.numPages ??
    0;

  const previousPage =
    () => {
      setPageNumber(
        (
          current
        ) =>
          Math.max(
            1,
            current - 1
          )
      );
    };

  const nextPage =
    () => {
      setPageNumber(
        (
          current
        ) =>
          Math.min(
            pageCount,
            current + 1
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
        previousPage();
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        nextPage();
      }
    };

  if (
    loading
  ) {
    return (
      <div className="library-pdf-reader">
        <div className="library-pdf-status">
          <span className="status-dot" />

          <span>
            OPENING BOOK
          </span>
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

          <span>
            {pageNumber}
            {" / "}
            {pageCount}
          </span>

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
              scale * 100
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
        {rendering && (
          <div className="library-pdf-rendering">
            RENDERING
          </div>
        )}

        <div
          ref={pageRef}
          className="library-pdf-page-host"
        />
      </div>
    </div>
  );
}
