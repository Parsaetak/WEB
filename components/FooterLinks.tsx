import styles from "@/components/FooterLinks.module.css";

import {
  LinkIcon
} from "@/components/PublicLinks";

import {
  ALL_PUBLIC_LINKS,
  type PublicLink
} from "@/lib/links";

/*
 * THE PUBLIC NETWORK (v4.0.5) — ONE semantic group of every
 * verified public link (lib/links.ts owns the registry). The fixed
 * 7 + 7 row slicing of v4.0.4 is gone: the group wraps naturally
 * and the LAYOUT decides how many visual lines it needs, so adding
 * or retiring a channel can never leave a hardcoded row split
 * stale.
 */

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
