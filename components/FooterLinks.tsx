import {
  LinkIcon
} from "@/components/PublicLinks";
import {
  PUBLIC_LINKS,
  type PublicLink
} from "@/lib/links";

const LINK_GROUPS = [
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
] as const;

function FooterLink({
  link
}: {
  link: PublicLink;
}) {
  const isMail = link.href.startsWith("mailto:");

  return (
    <a
      className="living-shell-footer-link"
      href={link.href}
      target={
        isMail
          ? undefined
          : "_blank"
      }
      rel={
        isMail
          ? undefined
          : "noreferrer"
      }
      aria-label={link.label}
    >
      <span
        className="living-shell-footer-link-icon"
        aria-hidden="true"
      >
        <LinkIcon icon={link.icon} />
      </span>

      <span className="living-shell-footer-link-label">
        {link.label}
      </span>

      {!isMail && (
        <span
          className="living-shell-footer-link-arrow"
          aria-hidden="true"
        >
          ↗
        </span>
      )}
    </a>
  );
}

export default function FooterLinks() {
  return (
    <section
      className="living-shell-footer-links"
      aria-label="Public links"
    >
      <div className="living-shell-footer-links-heading">
        <span className="section-signal" aria-hidden="true" />
        <p className="kicker">
          PUBLIC NETWORK
        </p>
      </div>

      <div className="living-shell-footer-links-grid">
        {LINK_GROUPS.map((group) => (
          <div
            className="living-shell-footer-link-group"
            key={group.label}
          >
            <p className="living-shell-footer-link-group-title">
              {group.label}
            </p>

            <div className="living-shell-footer-link-list">
              {group.links.map((link) => (
                <FooterLink
                  key={link.id}
                  link={link}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
