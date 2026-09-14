import { Fragment, type ReactNode } from "react";

import { BRAND_STAR } from "@/lib/brand";

import { routeHref } from "@/lib/hubs";

import SiteFooter from "@/components/SiteFooter";

import styles from "@/components/content/content.module.css";

/*
 * CONTENT SHELL (v3.1) — the shared server-rendered frame for the
 * static content documents: /about/, /work/, and the topic hubs.
 *
 * It is deliberately minimal: a light header (13-point star + name +
 * four plain anchors), a breadcrumb, the document H1 block, the
 * page sections, and the shared site footer. No canvas organism, no
 * cursor, no reveal observer, no client components — a content
 * route ships as static semantic HTML with zero route JavaScript,
 * while the living-world homepage remains the high-experience
 * route.
 *
 * The 13-point star, mono kickers, and red accents are reused so
 * every content document reads as the same website, not a template.
 */

export type Crumb = {
  name: string;
  /** Root-relative href (basePath applied automatically) or null for the current page. */
  href: string | null;
};

type ContentShellProps = {
  kicker: string;
  title: string;
  /** Breadcrumb trail from Home to this page (last entry = current). */
  crumbs: readonly Crumb[];
  /** Lead paragraphs rendered directly under the H1. */
  lead: readonly string[];
  children: ReactNode;
};

const HEADER_LINKS: readonly { label: string; href: string }[] = [
  { label: "HOME", href: "/" },
  { label: "WORK", href: "/work/" },
  { label: "ABOUT", href: "/about/" },
  { label: "BLOG", href: "/blog/" }
];

export default function ContentShell({
  kicker,
  title,
  crumbs,
  lead,
  children
}: ContentShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a className={styles.brand} href={routeHref("/")}>
            {/*
             * The 13-point star — the site identity — anchors the
             * content shell to the same brand as the world shell
             * and the blog. Decorative: the adjacent text is the
             * accessible content.
             */}
            <img
              src={BRAND_STAR.red}
              alt=""
              width={30}
              height={30}
              loading="eager"
              decoding="async"
            />

            <span className={styles.brandName}>Parsa Tak</span>
          </a>

          <nav className={styles.headerNav} aria-label="Site">
            {HEADER_LINKS.map((link) => (
              <a
                key={link.label}
                className={styles.headerLink}
                href={routeHref(link.href)}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className={styles.main} id="content">
        <div className={styles.doc}>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1;

              return (
                <Fragment key={crumb.name}>
                  {index > 0 && (
                    <span
                      className={styles.crumbSeparator}
                      aria-hidden="true"
                    >
                      /
                    </span>
                  )}

                  {crumb.href && !isLast ? (
                    <a
                      className={styles.crumbLink}
                      href={routeHref(crumb.href)}
                    >
                      {crumb.name}
                    </a>
                  ) : (
                    <span
                      className={styles.crumbCurrent}
                      aria-current={isLast ? "page" : undefined}
                    >
                      {crumb.name}
                    </span>
                  )}
                </Fragment>
              );
            })}
          </nav>

          <p className={styles.docKicker}>{kicker}</p>

          <h1 className={styles.title}>{title}</h1>

          <div className={styles.lead}>
            {lead.map((paragraph, index) => (
              <p key={index} className={styles.leadParagraph}>
                {paragraph}
              </p>
            ))}
          </div>

          {children}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
