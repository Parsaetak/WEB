import styles from "@/components/LivingShell.module.css";

import { BRAND_STAR } from "@/lib/brand";

import FooterLinks from "@/components/FooterLinks";

import SiteDocNav from "@/components/SiteDocNav";

/*
 * Shared site footer — the legal block used by both the home world
 * shell and the blog routes. Rendered from a client parent it joins
 * the client tree; rendered from the blog layout it stays
 * server-rendered with zero client JavaScript.
 */

export default function SiteFooter() {
  return (
    /*
     * NO data-reveal opt-in (v4.0.4): the footer is site chrome and
     * renders on routes with AND without a reveal controller
     * (MotionReveal mounts on the world shell and the blog layout
     * only). Under html.reveal-js a data-reveal element without a
     * controller stays at opacity 0 forever — the pre-4.0.4 opt-in
     * left the ENTIRE footer (document nav, public links, legal
     * block) invisible on /about/, /contact/, /work/, /research/ and
     * every topic hub. Verified against the v4.0.3 export before the
     * fix; the footer is now permanently visible everywhere.
     */
    <footer
      className={
        styles.livingShellLegal
      }
    >
      <div
        className={
          styles.livingShellLegalInner
        }
      >
        {/*
          * SITE DOCUMENT NAV (v3.1): crawlable links to the real
          * indexable documents — identity routes and topic hubs —
          * carried by every page that renders this footer. The hash
          * scenes remain interaction states; these anchors make the
          * content graph reachable without JavaScript.
          */}
        <SiteDocNav />

        <div
          className={
            styles.livingShellFooterMain
          }
        >
          <div
            className={
              styles.livingShellLegalPrimary
            }
          >
            <strong>
              <span
                className={
                  styles.livingShellFooterMark
                }
                aria-hidden="true"
              >
                {/*
                 * The 13-point star anchors the legal block to the
                 * site identity. Decorative: the adjacent text is
                 * the accessible content.
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
              © 2026 Parsa Tak. All rights reserved.
            </strong>

            <span>
              Parsa Tak™
            </span>
          </div>

          <FooterLinks />
        </div>

        <div
          className={
            styles.livingShellLegalBottom
          }
        >
          <p>
            Original website design, visual identity,
            writing, artwork, and other original creative
            materials presented on this website are the
            work of Parsa Tak and may not be reproduced,
            redistributed, modified, or commercially
            exploited without prior written permission,
            except where a specific material states otherwise.
          </p>

          <div
            className={
              styles.livingShellLegalLinks
            }
          >
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
