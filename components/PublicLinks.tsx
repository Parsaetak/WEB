import {
  ALL_PUBLIC_LINKS
} from "@/lib/links";

type PublicLinksProps = {
  compact?: boolean;
  title?: string;
};

export default function PublicLinks({
  compact = false,
  title = "PUBLIC NETWORK"
}: PublicLinksProps) {
  const links = compact
    ? ALL_PUBLIC_LINKS.slice(0, 8)
    : ALL_PUBLIC_LINKS;

  return (
    <section
      className="section-tight"
      aria-label={title}
    >
      <div className="section-heading">
        <div className="section-heading-line">
          <span
            className="section-signal"
            aria-hidden="true"
          />

          <p className="kicker">
            {title}
          </p>
        </div>
      </div>

      <div className="work-grid">
        {links.map(
          (link, index) => (
            <a
              key={link.id}
              className="glow-border"
              href={link.href}
              target={
                link.href.startsWith(
                  "mailto:"
                )
                  ? undefined
                  : "_blank"
              }
              rel={
                link.href.startsWith(
                  "mailto:"
                )
                  ? undefined
                  : "noreferrer"
              }
            >
              <div className="panel magic-panel">
                <div className="panel-content">
                  <div className="panel-topline">
                    <span className="system-number">
                      {String(
                        index + 1
                      ).padStart(2, "0")}
                    </span>

                    <span className="system-type">
                      {link.verified
                        ? "VERIFIED"
                        : "REFERENCE"}
                    </span>
                  </div>

                  <h2 className="system-title">
                    {link.label}
                  </h2>

                  <div className="work-card-footer">
                    <span>
                      OPEN
                    </span>

                    <span
                      className="public-link-card-arrow"
                      aria-hidden="true"
                    >
                      ↗
                    </span>
                  </div>
                </div>
              </div>
            </a>
          )
        )}
      </div>
    </section>
  );
}
