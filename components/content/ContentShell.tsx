import { Fragment, type ReactNode } from "react";

import { BRAND_STAR } from "@/lib/brand";

import { routeHref } from "@/lib/hubs";

import { PRIMARY_NAV, WORLD_NAV } from "@/lib/navigation";

import { GITHUB_LINK } from "@/lib/links";

import UnifiedSiteNav, {
  type UnifiedNavEntry
} from "@/components/UnifiedSiteNav";

import SiteFooter from "@/components/SiteFooter";

import styles from "@/components/content/content.module.css";

/*
 * CONTENT SHELL (v3.4) — the shared frame for the static content
 * documents: /about/, /work/, /research/, /contact/, and the topic
 * hubs.
 *
 * v3.4 navigation: the header renders the UNIFIED navigation system
 * (UnifiedSiteNav) — the same renderer, data source, geometry,
 * accents, active states and hover identities as the world HUD and
 * the blog header. The separate light-weight headerNav row (which
 * carried only the primary links, no world group, no mobile menu)
 * is retired. The nav is the page's one small client island; the
 * document body below it remains static semantic HTML, and the nav
 * itself still ships as complete server-rendered markup for crawlers
 * and no-JS readers.
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
  /** Root-relative href of the current route, marks the active header link. */
  activeHref?: string;
  children: ReactNode;
};

export default function ContentShell({
  kicker,
  title,
  crumbs,
  lead,
  activeHref,
  children
}: ContentShellProps) {
  /*
   * UNIFIED NAVIGATION (v3.4): same entries on every content route —
   * the primary destinations (active state resolved per route), the
   * world scenes as plain hash links into the living shell, and
   * GitHub as a utility entry in the disclosure menu. Serializable
   * data only: the server renders the full nav markup and the client
   * island hydrates the interaction on top.
   */
  const navEntries: readonly UnifiedNavEntry[] = [
    ...PRIMARY_NAV.map(
      (entry): UnifiedNavEntry => ({
        kind: "link",
        group: "primary",
        id: entry.id,
        label: entry.label,
        shortLabel: entry.shortLabel,
        href: entry.href,
        active: activeHref === entry.href
      })
    ),
    ...WORLD_NAV.map(
      (entry): UnifiedNavEntry => ({
        kind: "link",
        group: "world",
        id: entry.id,
        label: entry.label,
        shortLabel: entry.shortLabel,
        href: entry.href
      })
    ),
    ...(GITHUB_LINK
      ? [
          {
            kind: "link" as const,
            group: "utility" as const,
            id: "github",
            label: GITHUB_LINK.label,
            shortLabel: "GITHUB",
            href: GITHUB_LINK.href,
            external: true
          }
        ]
      : [])
  ];

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

          <UnifiedSiteNav
            className={styles.contentNav}
            menuId="content-unified-nav"
            entries={navEntries}
          />
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
