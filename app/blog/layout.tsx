import type {
  Metadata
} from "next";

import WorldBackground from "@/components/WorldBackground";
import RedCursor from "@/components/RedCursor";
import SiteFooter from "@/components/SiteFooter";
import BlogHeader from "@/components/blog/BlogHeader";
import MotionReveal from "@/components/MotionReveal";
import ShortcutsDialog from "@/components/blog/ShortcutsDialog";

import {
  getBlogInfo
} from "@/lib/blog";

import {
  SITE_DESCRIPTION as FALLBACK_DESCRIPTION,
  SITE_OG_IMAGE_HEIGHT,
  SITE_OG_IMAGE_PATH,
  SITE_OG_IMAGE_WIDTH
} from "@/lib/seo";

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
      canonical: "/blog/"
    },
    openGraph: {
      type: "website",
      title: "Blog — Parsa Tak",
      description: info.siteDescription,
      url: "/blog/",
      images: [
        {
          url: SITE_OG_IMAGE_PATH,
          width: SITE_OG_IMAGE_WIDTH,
          height: SITE_OG_IMAGE_HEIGHT,
          alt: "Parsa Tak — writing from the laboratory"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: "Blog — Parsa Tak",
      description:
        info.siteDescription || FALLBACK_DESCRIPTION,
      images: [SITE_OG_IMAGE_PATH]
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

      {/*
        * KEYBOARD REFERENCE (v2.5.4) — one island per blog page:
        * the "?" trigger + shortcuts dialog. Client-only by design
        * (the keys don't work without JS, so no-JS visitors are
        * never advertised a lie); nothing renders server-side.
        */}
      <ShortcutsDialog />

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
