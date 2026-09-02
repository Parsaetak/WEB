import styles from "@/components/FooterLinks.module.css";

import {
  LinkIcon
} from "@/components/PublicLinks";

import {
  ALL_PUBLIC_LINKS,
  type PublicLink
} from "@/lib/links";

const FOOTER_LINK_ROWS: readonly (
  readonly PublicLink[]
)[] = [
  ALL_PUBLIC_LINKS.slice(
    0,
    8
  ),
  ALL_PUBLIC_LINKS.slice(
    8,
    15
  )
];

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
      className={
        styles.link
      }
      href={
        link.href
      }
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
        className={
          styles.linkIcon
        }
        aria-hidden="true"
      >
        <LinkIcon
          icon={
            link.icon
          }
        />
      </span>

      <span
        className={
          styles.linkLabel
        }
      >
        {
          link.label
        }
      </span>

      {!isMail && (
        <span
          className={
            styles.linkArrow
          }
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
      className={
        styles.footerLinks
      }
      aria-label="Public network"
    >
      {FOOTER_LINK_ROWS.map(
        (
          row,
          rowIndex
        ) => (
          <div
            className={
              styles.linkRow
            }
            key={
              `footer-row-${rowIndex}`
            }
          >
            {row.map(
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
          </div>
        )
      )}
    </nav>
  );
}
