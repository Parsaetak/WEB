import { Fragment, type ReactNode } from "react";

import Link from "next/link";

import { BRAND_STAR } from "@/lib/brand";

import { PRIMARY_NAV, WORLD_NAV } from "@/lib/navigation";

import { GITHUB_LINK } from "@/lib/links";

import UnifiedSiteNav, {
  type UnifiedNavEntry
} from "@/components/UnifiedSiteNav";

import FullScreenPageShell from "@/components/FullScreenPageShell";

import { pageIdForRoutePath } from "@/lib/routes";

import SiteFooter from "@/components/SiteFooter";

import styles from "@/components/content/content.module.css";

/*
 * CONTENT SHELL (v3.6) — the shared frame for the static content
 * documents: /about/, /work/, /research/, /contact/, and the topic
 * hubs.
 *
 * v3.6 full-screen architecture: the shell is now a
 * FullScreenPageShell — every tab BEGINS as a full-screen
 * composition (crumbs, kicker, title and lead composed against a
 * per-tab identity field), and the document below it scrolls
 * naturally for as long as it needs. Full-screen is composition,
 * not confinement: no fixed heights, no clipping, no squeezed
 * text — the hero simply refuses to be shorter than one viewport
 * (with a content floor so short screens scroll instead of
 * cramping).
 *
 * v3.4 navigation: the header renders the UNIFIED navigation system
 * (UnifiedSiteNav) — the same renderer, data source, geometry,
 * accents, active states and hover identities as the world HUD and
 * the blog header. The nav is the page's one small client island;
 * the document body below it remains static semantic HTML, and the
 * nav itself still ships as complete server-rendered markup for
 * crawlers and no-JS readers.
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

/*
 * TAB IDENTITY (v4.0.3): resolved from the canonical route registry
 * (data/routes.json) through lib/routes.ts — the same registry that
 * derives SEO metadata and the sitemap. Before v4.0.3 this was a
 * hardcoded switch that could forget a route; now every registered
 * primary document route automatically receives its shell identity,
 * and topic hubs keep the neutral "hub" identity of the shared
 * shell. About and Contact therefore ride the EXACT same registry
 * path as Work, Research and the hubs — no special cases.
 */

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
    <FullScreenPageShell
      page={pageIdForRoutePath(activeHref)}
      className={styles.shell}
    >
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/" prefetch={false}>
            {/*
             * The 13-point star — the site identity — anchors the
             * content shell to the same brand as the world shell
             * and the blog. Decorative: the adjacent text is the
             * accessible content.
             *
             * Soft navigation (v4.0.2): the brand links home through
             * next/link — a crawlable anchor in the export, a
             * client-side navigation when hydrated, so the root
             * layout and the global Music player never unmount.
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
          </Link>

          <UnifiedSiteNav
            className={styles.contentNav}
            menuId="content-unified-nav"
            entries={navEntries}
          />
        </div>
      </header>

      <main className={styles.main} id="content">
        {/*
         * FULL-SCREEN HERO (v3.6) — the first screen of every tab.
         * The identity field behind it is decorative (aria-hidden,
         * pointer-transparent) and themed per tab through the
         * shell's data-page accent tokens. The cue line at the
         * bottom says what the composition does: the document
         * continues below the fold.
         */}
        <section
          className={styles.hero}
          aria-label={title}
        >
          <div
            className={styles.heroField}
            aria-hidden="true"
          >
            <span
              className={`${styles.heroRing} ${styles.heroRingOne}`}
            />
            <span
              className={`${styles.heroRing} ${styles.heroRingTwo}`}
            />
            <span
              className={`${styles.heroRing} ${styles.heroRingThree}`}
            />
            <span className={styles.heroAxis} />
            <span
              className={`${styles.heroNode} ${styles.heroNodeOne}`}
            />
            <span
              className={`${styles.heroNode} ${styles.heroNodeTwo}`}
            />
          </div>

          {/*
           * HERO RAIL (v3.6.1) — the hero text block sits on the same
           * shared alignment rail as the header brand, the home hero,
           * the blog hero and the footer (styles.heroDoc). The
           * document body below the fold keeps the narrower readable
           * measure (styles.doc).
           */}
          <div className={styles.heroDoc}>
            <nav
              className={styles.crumbs}
              aria-label="Breadcrumb"
            >
              {crumbs.map((crumb, index) => {
                const isLast =
                  index === crumbs.length - 1;

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
                      <Link
                        className={styles.crumbLink}
                        href={crumb.href}
                        prefetch={false}
                      >
                        {crumb.name}
                      </Link>
                    ) : (
                      <span
                        className={styles.crumbCurrent}
                        aria-current={
                          isLast
                            ? "page"
                            : undefined
                        }
                      >
                        {crumb.name}
                      </span>
                    )}
                  </Fragment>
                );
              })}
            </nav>

            <p className={styles.docKicker}>
              {kicker}
            </p>

            <h1 className={styles.title}>
              {title}
            </h1>

            <div className={styles.lead}>
              {lead.map((paragraph, index) => (
                <p
                  key={index}
                  className={styles.leadParagraph}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div
            className={styles.heroCue}
            aria-hidden="true"
          >
            <span>SCROLL</span>

            <i className={styles.heroCueLine} />
          </div>
        </section>

        <div className={styles.doc}>
          {children}
        </div>
      </main>

      <SiteFooter />
    </FullScreenPageShell>
  );
}
