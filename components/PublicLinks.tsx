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
  return (
    <section
      className={
        compact
          ? "public-links public-links-compact"
          : "public-links"
      }
      aria-label={title}
    >
      <div className="section-heading-line">
        <span
          className="section-signal"
          aria-hidden="true"
        />

        <p className="kicker">
          {title}
        </p>
      </div>

      <div className="public-links-grid">
        {ALL_PUBLIC_LINKS.map(
          (link) => (
            <a
              key={link.id}
              className="panel public-link-card"
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
              <span className="public-link-card-index">
                {String(
                  ALL_PUBLIC_LINKS.indexOf(
                    link
                  ) + 1
                ).padStart(2, "0")}
              </span>

              <span className="public-link-card-label">
                {link.label}
              </span>

              <span
                className="public-link-card-arrow"
                aria-hidden="true"
              >
                ↗
              </span>
            </a>
          )
        )}
      </div>
    </section>
  );
}
