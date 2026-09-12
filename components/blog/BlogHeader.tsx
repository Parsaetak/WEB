import Link from "next/link";

import RedEye from "@/components/RedEye";
import CompactMenu, {
  type CompactMenuEntry
} from "@/components/CompactMenu";
import BlogAreaControl from "@/components/blog/BlogAreaControl";

import { GITHUB_LINK } from "@/lib/links";

import styles from "./BlogHeader.module.css";

/*
 * Blog header — server-rendered shell with two small client islands.
 *
 * Mirrors the world shell's HUD geometry. Scene links return to the
 * home world with the target hash; the BLOG control (v2.6.1) is a
 * real link to /blog/ rendered by the BlogAreaControl island, so the
 * active area is navigable instead of a dead span.
 *
 * COMPACT MODE (v2.6.1): on phones and narrow portrait tablets the
 * wrapped scene-link row stands down and a shared CompactMenu island
 * takes over — HOME, the five world scenes, BLOG and GITHUB in one
 * touch panel. The islands are the only client JavaScript here; the
 * rest of the header remains static markup.
 */

const SCENE_LINKS: readonly {
  label: string;
  href: string;
  index: string;
}[] = [
  { label: "HOME", href: "/", index: "01" },
  { label: "ABOUT", href: "/#about", index: "02" },
  { label: "SYSTEMS", href: "/#systems", index: "03" },
  { label: "MAGIC", href: "/#magic", index: "04" },
  { label: "WORK", href: "/#work", index: "05" },
  { label: "LIBRARY", href: "/#library", index: "06" }
];

const MENU_ENTRIES: readonly CompactMenuEntry[] = [
  ...SCENE_LINKS.map(
    (
      scene
    ): CompactMenuEntry => ({
      kind: "link",
      id: `blog-menu-${scene.label.toLowerCase()}`,
      label: scene.label,
      index: scene.index,
      scene: scene.label.toLowerCase(),
      href: scene.href
    })
  ),
  {
    kind: "link",
    id: "blog-menu-blog",
    label: "BLOG",
    index: "07",
    scene: "blog",
    href: "/blog/",
    active: true
  },
  ...(GITHUB_LINK
    ? [
        {
          kind: "link" as const,
          id: "blog-menu-github",
          label: "GitHub",
          index: "↗",
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
          <span className={styles.brandEye}>
            <RedEye size={32} />
          </span>

          <span className={styles.brandName}>
            Parsa Tak
          </span>
        </Link>

        <div
          className={styles.status}
          aria-label="Current area"
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
          {SCENE_LINKS.map((scene) => (
            <Link
              key={scene.label}
              className={styles.sceneLink}
              href={scene.href}
              prefetch={false}
            >
              {scene.label}
            </Link>
          ))}
        </nav>

        <div className={styles.headerActions}>
          <BlogAreaControl />

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
              label="Site areas"
              entries={MENU_ENTRIES}
              dividerBefore={[
                "blog-menu-github"
              ]}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
