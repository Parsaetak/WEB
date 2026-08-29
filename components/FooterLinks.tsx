import {
  LinkIcon
} from "@/components/PublicLinks";
import {
  ALL_PUBLIC_LINKS,
  type PublicLink
} from "@/lib/links";

function FooterLink({
  link
}: {
  link: PublicLink;
}) {
  const isMail =
    link.href.startsWith(
      "mailto:"
    );

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
      aria-label={
        link.label
      }
    >
      <span
        className="living-shell-footer-link-icon"
        aria-hidden="true"
      >
        <LinkIcon
          icon={
            link.icon
          }
        />
      </span>

      <span className="living-shell-footer-link-label">
        {
          link.label
        }
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
    <nav
      className="living-shell-footer-links"
      aria-label="Public network"
    >
      {ALL_PUBLIC_LINKS.map(
        (link) => (
          <FooterLink
            key={
              link.id
            }
            link={
              link
            }
          />
        )
      )}
    </nav>
  );
}
