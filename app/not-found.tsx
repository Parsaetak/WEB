import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "32px"
      }}
    >
      <section
        className="panel panel-red"
        style={{
          width: "min(100%, 720px)",
          textAlign: "center"
        }}
      >
        <div className="panel-content">
          <p className="kicker">RED MAGIC / SIGNAL LOST</p>

          <h1
            className="hero-title"
            style={{
              marginTop: "20px",
              fontSize: "clamp(4rem, 14vw, 9rem)"
            }}
          >
            404
          </h1>

          <p className="body-large" style={{ marginTop: "18px" }}>
            This path does not exist in the current system.
          </p>

          <p
            className="body"
            style={{
              maxWidth: "540px",
              margin: "12px auto 0"
            }}
          >
            The architecture is still evolving. Return to the core and continue
            exploring the living system.
          </p>

          <div
            className="hero-actions"
            style={{
              justifyContent: "center",
              marginTop: "28px"
            }}
          >
            <Link className="button button-primary" href="/">
              Return to the core
            </Link>

            <a
              className="button button-secondary"
              href="https://github.com/Parsaetak/WEB"
              target="_blank"
              rel="noreferrer"
            >
              Open repository ↗
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
