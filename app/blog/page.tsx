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
  getAllTags,
  getInboundCounts
} from "@/lib/blog";

import {
  JsonLd,
  PERSON_ID,
  SITE_IN_LANGUAGE,
  SITE_URL,
  WEBSITE_ID
} from "@/lib/seo";

import styles from "./page.module.css";

/*
 * Blog index — fully static.
 *
 * The featured article and page shell render at build time. The
 * interactive island below receives article METADATA ONLY (no HTML
 * bodies) so filtering is an in-memory scan of a tiny array.
 *
 * SEO: this page emits the Blog entity — one object describing the
 * /blog/ collection, with BlogPosting stubs whose @id values match
 * the full article graphs emitted on /blog/<slug>/ routes. The
 * collection object and the article objects interlock instead of
 * duplicating each other.
 */

export function generateMetadata(): Metadata {
  const info = getBlogInfo();

  return {
    /*
     * absolute: the layout's "%s — Parsa Tak" template only applies
     * to DEEPER segments (article pages), not to this same-segment
     * index page — so the full title is spelled out exactly once
     * here, matching the site's title convention.
     */
    title: {
      absolute: "Blog — Parsa Tak"
    },
    description: info.siteDescription,

    alternates: {
      canonical: "/blog/"
    }
  };
}

function blogEntity(info: {
  siteName: string;
  siteDescription: string;
}, posts: readonly { slug: string; title: string }[]) {
  return {
    "@type": "Blog",
    "@id": `${SITE_URL}/blog/#blog`,
    url: `${SITE_URL}/blog/`,
    name: `Blog — ${info.siteName}`,
    description: info.siteDescription,
    inLanguage: SITE_IN_LANGUAGE,
    isPartOf: { "@id": WEBSITE_ID },
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      "@id": `${SITE_URL}/blog/${post.slug}/#article`,
      url: `${SITE_URL}/blog/${post.slug}/`,
      headline: post.title
    }))
  };
}

export default function BlogPage() {
  const posts = getBlogMetaList();
  const tags = getAllTags();
  const featured = getFeaturedPost();
  const info = getBlogInfo();

  /*
   * Inbound reference counts (v2.5.5) for the quiet "↩ N" card
   * badges — straight from the validated build-time link graph.
   */
  const inboundRefs = getInboundCounts();

  return (
    <div className={styles.blogPage}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [blogEntity(info, posts)]
        }}
      />

      <section
        className={`section ${styles.blogHero}`}
      >
        <div className="page-container">
          <header className={styles.blogHeroHeader} data-reveal="instant">
            <div className={styles.blogHeroCopy}>
              <p className="kicker">
                07 / BLOG
              </p>

              <h1
                className={`section-title ${styles.blogHeroTitle}`}
              >
                Writing from
                <br />
                the laboratory
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
              data-reveal="scale"
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
            inboundRefs={inboundRefs}
          />
        </div>
      </section>
    </div>
  );
}
