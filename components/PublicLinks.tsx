import {
  PUBLIC_LINKS,
  type PublicLink
} from "@/lib/links";

type PublicLinksProps = {
  compact?: boolean;
  title?: string;
};

type LinkGroup = {
  label: string;
  links: readonly PublicLink[];
};

export default function PublicLinks({
  compact = false,
  title = "PUBLIC NETWORK"
}: PublicLinksProps) {
  const groups: LinkGroup[] = [
    {
      label: "SOCIAL",
      links: PUBLIC_LINKS.social
    },
    {
      label: "RESOURCES",
      links: PUBLIC_LINKS.resources
    },
    {
      label: "REFERENCE",
      links: PUBLIC_LINKS.meta
    }
  ];

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

      {groups.map(
        (group) => {
          const links = compact
            ? group.links.slice(
                0,
                group.label === "SOCIAL"
                  ? 4
                  : group.links.length
              )
            : group.links;

          if (links.length === 0) {
            return null;
          }

          return (
            <div
              key={group.label}
              style={{
                marginTop: "28px"
              }}
            >
              <p
                className="kicker"
                style={{
                  marginBottom: "12px"
                }}
              >
                {group.label}
              </p>

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

                            <span aria-hidden="true">
                              ↗
                            </span>
                          </div>
                        </div>
                      </div>
                    </a>
                  )
                )}
              </div>
            </div>
          );
        }
      )}
    </section>
  );
}
