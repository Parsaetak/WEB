"use client";

import {
  useEffect,
  useState
} from "react";

type LibraryPdfReaderProps = {
  src: string;
  title: string;
};

export default function LibraryPdfReader({
  src,
  title
}: LibraryPdfReaderProps) {
  const [
    failed,
    setFailed
  ] = useState(false);

  const [
    loaded,
    setLoaded
  ] = useState(false);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [src]);

  return (
    <div className="library-pdf-reader">
      <div className="library-pdf-reader-toolbar">
        <div className="library-pdf-reader-identity">
          <span className="library-pdf-reader-dot" />

          <div>
            <span className="library-pdf-reader-kicker">
              PDF READER
            </span>

            <strong>
              {title}
            </strong>
          </div>
        </div>

        <a
          className="library-pdf-reader-open"
          href={src}
          target="_blank"
          rel="noopener noreferrer"
        >
          OPEN PDF ↗
        </a>
      </div>

      <div className="library-pdf-reader-stage">
        {!loaded &&
          !failed && (
            <div className="library-pdf-reader-loading">
              <span className="status-dot" />

              <span>
                LOADING DOCUMENT
              </span>
            </div>
          )}

        {failed && (
          <div className="library-pdf-reader-fallback">
            <span className="library-pdf-reader-fallback-label">
              PDF PREVIEW UNAVAILABLE
            </span>

            <h3>
              Open the document directly.
            </h3>

            <p>
              Your browser could not render this PDF inside the embedded viewer.
            </p>

            <a
              className="library-download-button"
              href={src}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>
                OPEN PDF
              </span>

              <span aria-hidden="true">
                ↗
              </span>
            </a>
          </div>
        )}

        <iframe
          key={src}
          className={
            loaded
              ? "library-pdf-frame is-loaded"
              : "library-pdf-frame"
          }
          src={src}
          title={title}
          loading="eager"
          onLoad={() =>
            setLoaded(true)
          }
          onError={() =>
            setFailed(true)
          }
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
