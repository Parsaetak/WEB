import styles from "@/components/LivingShell.module.css";

import FooterLinks from "@/components/FooterLinks";

/*
 * Shared site footer — the legal block used by both the home world
 * shell and the blog routes. Rendered from a client parent it joins
 * the client tree; rendered from the blog layout it stays
 * server-rendered with zero client JavaScript.
 */

export default function SiteFooter() {
  return (
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
