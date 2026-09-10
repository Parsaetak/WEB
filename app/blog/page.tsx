import type {
  Metadata
} from "next";

import Link from "next/link";

import BlogIndex from "@/components/blog/BlogIndex";

import {
  formatBlogDate,
  getBlogInfo,
  getBlogMetaList,
  getFeaturedPost,
  getAllTags
} from "@/lib/blog";

import styles from "./page.module.css";

/*
 * Blog index — fully static.
 *
 * The featured article and page shell render at build time. The
 * interactive island below receives article METADATA ONLY (no HTML
 * bodies) so filtering is an in-memory scan of a tiny array.
 */

export function generateMetadata(): Metadata {
  const info = getBlogInfo();

  return {
    title: "Blog",
    description: info.siteDescription,
    alternates: {
      canonical: "/blog/"
    }
  };
}

export default function BlogPage() {
  const posts = getBlogMetaList();
  const tags = getAllTags();
  const featured = getFeaturedPost();
  const info = getBlogInfo();

  return (
    <div className={styles.blogPage}>
      <section
        className={`section ${styles.blogHero}`}
      >
        <div className="page-container">
          <header className={styles.blogHeroHeader}>
            <div className={styles.blogHeroCopy}>
              <p className="kicker">
                07 / BLOG
              </p>

              <h1
                className={`section-title ${styles.blogHeroTitle}`}
              >
                Writing from
                <br />
                the laboratory.
              </h1>

              <p
                className={`body-large ${styles.blogHeroLead}`}
              >
                Notes on AI systems, reasoning
                architecture, performance
                engineering, and the ideas
                behind RED MAGIC.
              </p>
            </div>

            <div
              className={styles.blogHeroStatus}
              aria-label="Blog status"
            >
              <span
                className="status-dot"
                aria-hidden="true"
              />

              <span>
                {posts.length} ARTICLE{posts.length === 1 ? "" : "S"}
              </span>
            </div>
          </header>
        </div>
      </section>

      {featured && (
        <section
          className={`section-tight ${styles.blogFeaturedSection}`}
          aria-label="Featured article"
        >
          <div className="page-container">
            <div
              className={styles.blogFeaturedCard}
            >
              {featured.cover && (
                <Link
                  className={
                    styles.blogFeaturedVisual
                  }
                  href={`/blog/${featured.slug}/`}
                  aria-label={featured.title}
                  tabIndex={-1}
                >
                  <img
                    src={featured.cover.src}
                    alt={featured.cover.alt}
                    width={featured.cover.width}
                    height={featured.cover.height}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </Link>
              )}

              <div
                className={styles.blogFeaturedContent}
              >
                <p
                  className={styles.blogFeaturedKicker}
                >
                  FEATURED
                </p>

                <h2
                  className={styles.blogFeaturedTitle}
                >
                  <Link
                    href={`/blog/${featured.slug}/`}
                  >
                    {featured.title}
                  </Link>
                </h2>

                {featured.subtitle && (
                  <p
                    className={
                      styles.blogFeaturedSubtitle
                    }
                  >
                    {featured.subtitle}
                  </p>
                )}

                <p
                  className={styles.blogFeaturedExcerpt}
                >
                  {featured.excerpt}
                </p>

                <p
                  className={styles.blogFeaturedMeta}
                >
                  {formatBlogDate(
                    featured.date
                  )}
                  {" · "}
                  {featured.readingTime}
                  {" · "}
                  {featured.author}
                </p>

                <Link
                  className={`button button-primary ${styles.blogFeaturedAction}`}
                  href={`/blog/${featured.slug}/`}
                >
                  Read article
                  <span aria-hidden="true">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section
        className={`section ${styles.blogListSection}`}
        aria-label="All articles"
      >
        <div className="page-container">
          <BlogIndex
            posts={posts}
            tags={tags}
          />
        </div>
      </section>

      <section
        className={`section-tight ${styles.blogFeedSection}`}
      >
        <div className="page-container">
          <p className={styles.blogFeedCopy}>
            Prefer a reader? This blog
            publishes an RSS feed generated
            from the same content index —
            there is no second, hand-maintained
            list.
          </p>
        </div>
      </section>
    </div>
  );
}
