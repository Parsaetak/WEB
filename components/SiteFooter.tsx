import styles from "@/components/SiteFooter.module.css";

import { BRAND_STAR } from "@/lib/brand";

import FooterLinks from "@/components/FooterLinks";

import SiteDocNav from "@/components/SiteDocNav";

/*
 * SITE FOOTER (v4.0.5) — the compact, professional footer shared by
 * every surface: the home world shell, the blog routes, the static
 * content documents (/about/, /work/, /research/, /contact/) and the
 * topic hubs. Rendered from a client parent it joins the client
 * tree; rendered from the blog layout it stays server-rendered with
 * zero client JavaScript.
 *
 * COMPOSITION (v4.0.5): the four logical navigation groups render as
 * one compact COLUMN grid (SiteDocNav), the brand/copyright line and
 * the public network share one meta row, and the legal notice keeps
 * its wording with LICENSE / TRADEMARKS top-aligned beside it — every
 * link of the old tall footer is preserved; only the composition
 * changed. Styles live in this component's OWN module
 * (SiteFooter.module.css), not in the living-world shell's sheet.
 *
 * The footer never opts into a route-scoped reveal system: reveal
 * controllers mount only on the world shell and the blog layout, and
 * a data-reveal element without a controller stays invisible under
 * html.reveal-js (the v4.0.3 bug — the footer must stay permanently
 * visible on every route).
 */

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        {/*
          * SITE DOCUMENT NAV (v3.1, columns in v4.0.5): crawlable
          * links to the real indexable documents — identity routes,
          * collections, world scenes and topic hubs — carried by every
          * page that renders this footer. The hash scenes remain
          * interaction states; these anchors make the content graph
          * reachable without JavaScript.
          */}
        <SiteDocNav />

        <div className={styles.footerMeta}>
          <div className={styles.footerBrand}>
            <span
              className={styles.footerMark}
              aria-hidden="true"
            >
              {/*
               * The 13-point star anchors the legal block to the
               * site identity. Decorative: the adjacent text is the
               * accessible content.
               */}
              <img
                src={BRAND_STAR.red}
                alt=""
                width={18}
                height={18}
                loading="lazy"
                decoding="async"
              />
            </span>

            <strong className={styles.footerCopyright}>
              © 2026 Parsa Tak. All rights reserved.
            </strong>

            <span className={styles.footerTrademark}>
              Parsa Tak™
            </span>
          </div>

          {/*
           * THE PUBLIC NETWORK (v4.0.5) — one semantic group that
           * wraps naturally; the layout decides how many visual
           * lines it needs. The fixed 7 + 7 row slicing is gone.
           */}
          <FooterLinks />
        </div>

        <div className={styles.footerLegal}>
          <p>
            Original website design, visual identity,
            writing, artwork, and other original creative
            materials presented on this website are the
            work of Parsa Tak and may not be reproduced,
            redistributed, modified, or commercially
            exploited without prior written permission,
            except where a specific material states otherwise.
          </p>

          <div className={styles.footerLegalLinks}>
            <a
              href="https://github.com/Parsaetak/WEB/blob/main/LICENSE.md"
              target="_blank"
              rel="noreferrer"
            >
              LICENSE
            </a>

            <a
              href="https://github.com/Parsaetak/WEB/blob/main/TRADEMARKS.md"
              target="_blank"
              rel="noreferrer"
            >
              TRADEMARKS
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
