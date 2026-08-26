"use client";

import {
  useEffect,
  useRef,
  useState
} from "react";

type PdfDocument = {
  numPages: number;
  getPage: (
    pageNumber: number
  ) => Promise<PdfPage>;
};

type PdfPage = {
  getViewport: (
    options: {
      scale: number;
    }
  ) => {
    width: number;
    height: number;
  };

  render: (
    options: {
      canvas: HTMLCanvasElement;
      canvasContext: CanvasRenderingContext2D;
      viewport: {
        width: number;
        height: number;
      };
    }
  ) => {
    promise: Promise<void>;
  };
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
  ) => {
    promise: Promise<PdfDocument>;
  };
};

type LibraryPdfReaderProps = {
  src: string;
  title: string;
};

let pdfJsPromise:
  | Promise<PdfJs>
  | null = null;

function loadPdfJs() {
  if (
    pdfJsPromise
  ) {
    return pdfJsPromise;
  }

  pdfJsPromise =
    import(
      "pdfjs-dist/build/pdf.mjs"
    ) as unknown as Promise<PdfJs>;

  return pdfJsPromise;
}

export default function LibraryPdfReader({
  src,
  title
}: LibraryPdfReaderProps) {
  const pageRef =
    useRef<HTMLDivElement | null>(
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

  useEffect(() => {
    let cancelled =
      false;

    setLoading(true);
    setError(null);
    setPdf(null);
    setPageNumber(1);

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
            `https://cdn.jsdelivr.net/npm/pdfjs-dist@6.2.108/build/pdf.worker.min.mjs`;

          const documentTask =
            pdfjs.getDocument({
              url: src,
              withCredentials:
                false
            });

          const document =
            await documentTask.promise;

          if (
            cancelled
          ) {
            return;
          }

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
      cancelled = true;
    };
  }, [src]);

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

          const container =
            pageRef.current;

          const viewport =
            page.getViewport({
              scale
            });

          const canvas =
            document.createElement(
              "canvas"
            );

          const context =
            canvas.getContext(
              "2d"
            );

          if (!context) {
            throw new Error(
              "Canvas rendering is unavailable."
            );
          }

          const devicePixelRatio =
            Math.min(
              window.devicePixelRatio ||
                1,
              2
            );

          canvas.width =
            Math.floor(
              viewport.width *
                devicePixelRatio
            );

          canvas.height =
            Math.floor(
              viewport.height *
                devicePixelRatio
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

          container.replaceChildren(
            canvas
          );

          await page
            .render({
              canvas,
              canvasContext:
                context,
              viewport
            })
            .promise;

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
              : "Unable to render this PDF."
          );
        }
      };

    void renderPage();

    return () => {
      cancelled = true;
    };
  }, [
    pdf,
    pageNumber,
    scale
  ]);

  const pageCount =
    pdf?.numPages ??
    0;

  const previousPage =
    () => {
      setPageNumber(
        (current) =>
          Math.max(
            1,
            current - 1
          )
      );
    };

  const nextPage =
    () => {
      setPageNumber(
        (current) =>
          Math.min(
            pageCount,
            current + 1
          )
      );
    };

  const zoomOut =
    () => {
      setScale(
        (current) =>
          Math.max(
            0.65,
            Math.round(
              (current - 0.1) *
                10
            ) / 10
          )
      );
    };

  const zoomIn =
    () => {
      setScale(
        (current) =>
          Math.min(
            2.2,
            Math.round(
              (current + 0.1) *
                10
            ) / 10
          )
      );
    };

  const fitWidth =
    () => {
      setScale(
        1
      );
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

      <div className="library-pdf-stage">
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
