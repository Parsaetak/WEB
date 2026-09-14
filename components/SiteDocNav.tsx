import { routeHref } from "@/lib/hubs";

import styles from "@/components/SiteDocNav.module.css";

/*
 * SITE DOCUMENT NAV (v3.1) — crawlable links to the real, indexable
 * documents: the identity/portfolio routes and the six topic hubs.
 *
 * Rendered inside the shared SiteFooter, so every page that carries
 * the footer (world shell, blog, articles, and the content routes
 * themselves) exposes the whole content graph through ordinary
 * anchors. This is the discoverability layer for the hub
 * architecture: the hash scenes stay interaction states, while the
 * real documents are one hop from anywhere.
 *
 * Plain anchors through routeHref: basePath-aware on GitHub Pages,
 * zero client JavaScript.
 */

const DOCUMENT_LINKS: readonly { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about/" },
  { label: "Work", href: "/work/" },
  { label: "Blog", href: "/blog/" }
];

const TOPIC_LINKS: readonly { label: string; href: string }[] = [
  { label: "Local AI", href: "/local-ai/" },
  { label: "AI Systems", href: "/ai-systems/" },
  { label: "AI Reasoning", href: "/ai-reasoning/" },
  { label: "AI Evaluation", href: "/ai-evaluation/" },
  { label: "Software Engineering", href: "/software-engineering/" },
  { label: "Creative Technology", href: "/creative-technology/" }
];

function NavRow({
  heading,
  links
}: {
  heading: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div className={styles.row}>
      <span className={styles.heading}>{heading}</span>

      <ul className={styles.list}>
        {links.map((link) => (
          <li key={link.href}>
            <a className={styles.link} href={routeHref(link.href)}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SiteDocNav() {
  return (
    <nav className={styles.nav} aria-label="Site documents and topics">
      <NavRow heading="Site" links={DOCUMENT_LINKS} />

      <NavRow heading="Topics" links={TOPIC_LINKS} />
    </nav>
  );
}
