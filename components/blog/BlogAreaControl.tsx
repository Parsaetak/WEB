"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import styles from "./BlogHeader.module.css";

/*
 * BLOG AREA CONTROL (v2.6.1) — the top-right BLOG item of the blog
 * header, as a REAL navigation control.
 *
 * Root-cause history: this control used to be a server-rendered
 * <span> because the header lives in app/blog/layout.tsx, which
 * cannot know the current pathname at build time — so the active
 * state was faked with a dead, pointer-events-none span. The root
 * cause was the missing route context, not the styling; this tiny
 * island supplies the missing context with usePathname() and renders
 * a real link in both cases:
 *
 * - on /blog/            → aria-current="page", links to the index
 * - on /blog/<slug>/     → no aria-current claim (the current page is
 *                          the article), links back to the index
 *
 * Static export prerenders each route with its own pathname, so the
 * exported HTML carries the correct semantics per page and hydration
 * matches. Mouse, touch, keyboard and direct navigation all work —
 * it is one honest <Link href="/blog/">.
 */

export default function BlogAreaControl() {
  const pathname = usePathname();

  const onBlogIndex =
    pathname === "/blog" ||
    pathname === "/blog/";

  return (
    <Link
      className={styles.sceneLinkActive}
      href="/blog/"
      aria-current={
        onBlogIndex
          ? "page"
          : undefined
      }
      aria-label={
        onBlogIndex
          ? "Blog — current area"
          : "Blog — back to the blog index"
      }
    >
      BLOG
    </Link>
  );
}
