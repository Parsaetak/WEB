import type {
  Metadata
} from "next";

import WorldBackground from "@/components/WorldBackground";
import RedCursor from "@/components/RedCursor";
import SiteFooter from "@/components/SiteFooter";
import BlogHeader from "@/components/blog/BlogHeader";
import MotionReveal from "@/components/MotionReveal";

import {
  getBlogInfo
} from "@/lib/blog";

import styles from "./layout.module.css";

/*
 * Blog shell.
 *
 * The blog is a real route tree, not a scene. It shares the world's
 * ambient background, cursor, and legal footer, and renders entirely
 * statically — article HTML is produced at build time from the
 * generated content index.
 */

export function generateMetadata(): Metadata {
  const info = getBlogInfo();

  return {
    title: {
      default: "Blog",
      template: "%s — Parsa Tak"
    },
    description: info.siteDescription,
    alternates: {
      canonical: "/blog/",
      types: {
        "application/rss+xml": [
          {
            url: "/blog/feed.xml",
            title: `${info.siteName} — Blog RSS`
          }
        ]
      }
    },
    openGraph: {
      type: "website",
      title: "Blog — Parsa Tak",
      description: info.siteDescription,
      url: "/blog/"
    },
    twitter: {
      card: "summary",
      title: "Blog — Parsa Tak",
      description: info.siteDescription
    }
  };
}

export default function BlogLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.blogShell}>
      {/*
        * The organism persists across the blog route tree with a
        * quiet archival mood — same single global background
        * runtime, no remount between blog pages.
        */}
      <WorldBackground mood="archive" />

      <RedCursor />

      {/*
        * The single reveal observer for the whole blog route tree:
        * one IntersectionObserver serves headers, cards, article
        * metadata and related-article grids everywhere.
        */}
      <MotionReveal />

      <BlogHeader />

      <main
        className={styles.blogMain}
        id="blog-content"
      >
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
