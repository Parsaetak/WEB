import { routeHref } from "@/lib/hubs";

import { PRIMARY_NAV, WORLD_NAV } from "@/lib/navigation";

import styles from "@/components/SiteDocNav.module.css";

/*
 * SITE DOCUMENT NAV (v3.2) — crawlable links to the real, indexable
 * documents, carried by the shared SiteFooter on every page.
 *
 * Three rows, in priority order:
 * - Site: the professional primary navigation (HOME, ABOUT, WORK,
 *   RESEARCH, BLOG, CONTACT) — the canonical evidence chain
 *   PERSON → ABOUT → WORK → RESEARCH → BLOG → GITHUB → CONTACT;
 * - World: the experimental scenes (SYSTEMS, RED MAGIC, LIBRARY) as
 *   contextual destinations;
 * - Topics: the six topic hubs — the research map, one hop from
 *   every document.
 *
 * The hash scenes remain interaction states; these anchors make the
 * whole content graph reachable without JavaScript. Plain anchors
 * through routeHref: basePath-aware on GitHub Pages, zero client
 * JavaScript, no numbered labels.
 */

const DOCUMENT_LINKS: readonly { label: string; href: string }[] =
  PRIMARY_NAV.map((entry) => ({
    label: entry.label,
    href: entry.href
  }));

const WORLD_LINKS: readonly { label: string; href: string }[] =
  WORLD_NAV.map((entry) => ({
    label: entry.label,
    href: entry.href
  }));

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

      <NavRow heading="World" links={WORLD_LINKS} />

      <NavRow heading="Topics" links={TOPIC_LINKS} />
    </nav>
  );
}
