import Link from "next/link";

import RedEye from "@/components/RedEye";

import { GITHUB_LINK } from "@/lib/links";

import styles from "./BlogHeader.module.css";

/*
 * Blog header — server-rendered, zero client JavaScript.
 *
 * Mirrors the world shell's HUD geometry. Scene links return to the
 * home world with the target hash; the blog link is the active area.
 */

const SCENE_LINKS: readonly {
  label: string;
  href: string;
}[] = [
  { label: "HOME", href: "/" },
  { label: "ABOUT", href: "/#about" },
  { label: "SYSTEMS", href: "/#systems" },
  { label: "MAGIC", href: "/#magic" },
  { label: "WORK", href: "/#work" },
  { label: "LIBRARY", href: "/#library" }
];

const FEED_HREF = `${
  process.env.NEXT_PUBLIC_BASE_PATH ?? ""
}/blog/feed.xml`;

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

          <span
            className={`${styles.sceneLink} ${styles.sceneLinkActive}`}
            aria-current="page"
          >
            BLOG
          </span>
        </nav>

        <div className={styles.headerActions}>
          <a
            className={styles.feedLink}
            href={FEED_HREF}
            aria-label="Blog RSS feed"
          >
            RSS
          </a>

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
        </div>
      </div>
    </header>
  );
}
