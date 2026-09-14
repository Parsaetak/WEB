import Link from "next/link";

import { BRAND_STAR } from "@/lib/brand";
import CompactMenu, {
  type CompactMenuEntry
} from "@/components/CompactMenu";
import { PRIMARY_NAV, WORLD_NAV } from "@/lib/navigation";

import { GITHUB_LINK } from "@/lib/links";

import styles from "./BlogHeader.module.css";

/*
 * Blog header — server-rendered shell with one small client island.
 *
 * v3.2 navigation: the header carries the professional primary nav
 * (HOME, WORK, RESEARCH, WRITING, ABOUT, CONTACT) with WRITING as
 * the active area, and the experimental world scenes (SYSTEMS,
 * RED MAGIC, LIBRARY) as a quieter secondary row. The numbered
 * scene-link row (01 HOME … 06 LIBRARY) and the separate BLOG area
 * control are retired — WRITING is the primary entry now.
 *
 * COMPACT MODE: on phones and narrow portrait tablets the link rows
 * stand down and a shared CompactMenu island takes over — the same
 * primary/world split, plus GitHub. The island is the only client
 * JavaScript here; the rest of the header remains static markup.
 */

const MENU_ENTRIES: readonly CompactMenuEntry[] = [
  ...PRIMARY_NAV.map(
    (entry): CompactMenuEntry => ({
      kind: "link",
      id: `blog-menu-${entry.id}`,
      label: entry.label,
      scene: entry.id,
      href: entry.href,
      active: entry.id === "writing"
    })
  ),
  ...WORLD_NAV.map(
    (entry): CompactMenuEntry => ({
      kind: "link",
      id: `blog-menu-${entry.id}`,
      label: entry.label,
      scene: entry.id,
      href: entry.href
    })
  ),
  ...(GITHUB_LINK
    ? [
        {
          kind: "link" as const,
          id: "blog-menu-github",
          label: "GitHub",
          scene: "github",
          href: GITHUB_LINK.href,
          external: true
        }
      ]
    : [])
];

export default function BlogHeader() {
  const github = GITHUB_LINK;

  return (
    <header className={styles.blogHeader}>
      <div className={styles.blogHeaderInner}>
        <Link
          className={styles.brand}
          href="/"
          aria-label="Parsa Tak — back to the world"
        >
          <span className={styles.brandEye} aria-hidden="true">
            {/*
             * The 13-point star — the Parsa Tak site identity, as a
             * static asset (no hydration for a logo). The link's
             * aria-label carries the accessible name.
             */}
            <img
              src={BRAND_STAR.red}
              alt=""
              width={32}
              height={32}
              loading="eager"
              decoding="async"
            />
          </span>

          <span className={styles.brandName}>
            Parsa Tak
          </span>
        </Link>

        <div
          className={styles.status}
        >
          <span
            className={styles.statusDot}
            aria-hidden="true"
          />

          <span>BLOG</span>
        </div>

        <nav
          className={styles.sceneLinks}
          aria-label="Site areas"
        >
          {PRIMARY_NAV.map((entry) => (
            <Link
              key={entry.id}
              className={styles.sceneLink}
              href={entry.href}
              data-active={
                entry.id === "writing"
                  ? "true"
                  : "false"
              }
              aria-current={
                entry.id === "writing"
                  ? "true"
                  : undefined
              }
              prefetch={false}
            >
              {entry.shortLabel}
            </Link>
          ))}

          <span
            className={styles.sceneNavDivider}
            aria-hidden="true"
          />

          {WORLD_NAV.map((entry) => (
            <Link
              key={entry.id}
              className={`${styles.sceneLink} ${styles.sceneLinkWorld}`}
              href={entry.href}
              data-active="false"
              prefetch={false}
            >
              {entry.shortLabel}
            </Link>
          ))}
        </nav>

        <div className={styles.headerActions}>
          {github && (
            <a
              className={styles.githubLink}
              href={github.href}
              target="_blank"
              rel="noreferrer"
            >
              GitHub ↗
            </a>
          )}

          <div
            className={styles.headerMenu}
          >
            <CompactMenu
              id="blog-compact-menu"
              label="Site navigation"
              entries={MENU_ENTRIES}
              dividerBefore={[
                "blog-menu-systems",
                "blog-menu-github"
              ]}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
