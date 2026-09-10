import type {
  Metadata
} from "next";

import Link from "next/link";

import { notFound } from "next/navigation";

import {
  formatBlogDate,
  formatBlogDateShort,
  getAdjacentPosts,
  getBlogMetaList,
  getPost,
  getRelatedPosts
} from "@/lib/blog";

import styles from "./article.module.css";

/*
 * Blog article — fully static.
 *
 * Every page below is prerendered at build time from the generated
 * content index. The article body is build-time HTML from the
 * validated markdown source; no markdown is parsed in the browser
 * and no client component hydrates on this route beyond the cursor.
 */

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getBlogMetaList().map(
    (post) => ({
      slug: post.slug
    })
  );
}

function resolvePost(
  slug: string
) {
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  return post;
}

export async function generateMetadata({
  params
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;

  const post = getPost(slug);

  if (!post) {
    return {
      title: "Article not found"
    };
  }

  return {
    title: post.title,
    description: post.description,

    alternates: {
      canonical: `/blog/${post.slug}/`
    },

    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}/`,
      publishedTime: post.date,
      modifiedTime:
        post.updated ?? post.date,
      authors: [post.author],
      tags: post.tags
    },

    twitter: {
      card: "summary",
      title: post.title,
      description: post.description
    },

    robots: {
      index: true,
      follow: true
    }
  };
}

export default async function ArticlePage({
  params
}: ArticlePageProps) {
  const { slug } = await params;

  const post = resolvePost(
    slug
  );

  const adjacent =
    getAdjacentPosts(
      post.slug
    );

  const related =
    getRelatedPosts(
      post.slug
    );

  const publishedDate =
    formatBlogDate(
      post.date
    );

  const updatedDate =
    post.updated
      ? formatBlogDate(
          post.updated
        )
      : null;

  const jsonLd = {
    "@context":
      "https://schema.org",

    "@type": "BlogPosting",

    headline:
      post.title,

    description:
      post.description,

    datePublished:
      post.date,

    dateModified:
      post.updated ??
      post.date,

    author: {
      "@type": "Person",
      name: post.author,
      url: "https://github.com/Parsaetak"
    },

    publisher: {
      "@type": "Person",
      name: "Parsa Tak"
    },

    mainEntityOfPage: {
      "@type": "WebPage",
      "@id":
        "https://parsaetak.github.io/WEB/blog/" +
        `${post.slug}/`
    },

    keywords:
      post.tags.join(", "),

    wordCount:
      post.wordCount,

    articleSection:
      post.category,

    inLanguage: "en"
  };

  return (
    <article
      className={styles.article}
    >
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            jsonLd
          )
        }}
      />

      <div className="page-container">
        <header
          className={styles.header}
          data-reveal="instant"
        >
          <p
            className={
              styles.headerKicker
            }
          >
            <Link
              href="/blog/"
              className={
                styles.backLink
              }
            >
              ← BLOG
            </Link>

            <span>
              {post.category}
            </span>

            <span>
              {
                post.readingTime
              }
            </span>
          </p>

          <h1
            className={
              styles.title
            }
          >
            {post.title}
          </h1>

          {post.subtitle && (
            <p
              className={
                styles.subtitle
              }
            >
              {post.subtitle}
            </p>
          )}

          <div
            className={
              styles.meta
            }
          >
            <span>
              {
                post.author
              }
            </span>

            <time
              dateTime={
                post.date
              }
            >
              {
                publishedDate
              }
            </time>

            {updatedDate && (
              <span>
                UPDATED{" "}
                {
                  updatedDate
                }
              </span>
            )}

            <span>
              {
                post.wordCount
              }
              {" "}
              WORDS
            </span>
          </div>
        </header>

        {post.cover && (
          <figure
            className={
              styles.cover
            }
            data-reveal="scale"
          >
            <img
              src={
                post.cover.src
              }
              alt={
                post.cover.alt
              }
              width={
                post.cover.width
              }
              height={
                post.cover.height
              }
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </figure>
        )}

        <div
          className={
            styles.body
          }
          dangerouslySetInnerHTML={{
            __html: post.html
          }}
        />

        {post.tags.length > 0 && (
          <div
            className={
              styles.tags
            }
            aria-label="Article tags"
            data-reveal="instant"
          >
            {post.tags.map(
              (tag) => (
                <span
                  key={tag}
                >
                  {tag}
                </span>
              )
            )}
          </div>
        )}

        <nav
          className={
            styles.adjacentNav
          }
          data-count={
            (adjacent.prev ? 1 : 0) +
            (adjacent.next ? 1 : 0)
          }
          aria-label="Article navigation"
          data-reveal=""
        >
          {adjacent.prev ? (
            <Link
              className={
                styles.adjacentLink
              }
              href={`/blog/${adjacent.prev.slug}/`}
            >
              <span
                className={
                  styles.adjacentLabel
                }
              >
                ← PREVIOUS
              </span>

              <span
                className={
                  styles.adjacentTitle
                }
              >
                {
                  adjacent.prev.title
                }
              </span>
            </Link>
          ) : (
            <span />
          )}

          {adjacent.next && (
            <Link
              className={`${styles.adjacentLink} ${styles.adjacentLinkNext}`}
              href={`/blog/${adjacent.next.slug}/`}
            >
              <span
                className={
                  styles.adjacentLabel
                }
              >
                NEXT →
              </span>

              <span
                className={
                  styles.adjacentTitle
                }
              >
                {
                  adjacent.next.title
                }
              </span>
            </Link>
          )}
        </nav>

        {related.length > 0 && (
          <section
            className={
              styles.related
            }
            aria-label="Related articles"
            data-reveal=""
          >
            <p
              className={
                styles.relatedKicker
              }
            >
              RELATED TRANSMISSIONS
            </p>

            <div
              className={
                styles.relatedGrid
              }
            >
              {related.map(
                (
                  relatedPost
                ) => (
                  <Link
                    key={
                      relatedPost.slug
                    }
                    className={
                      styles.relatedCard
                    }
                    href={`/blog/${relatedPost.slug}/`}
                    prefetch={
                      false
                    }
                  >
                    <span
                      className={
                        styles.relatedCardCategory
                      }
                    >
                      {
                        relatedPost.category
                      }
                    </span>

                    <strong>
                      {
                        relatedPost.title
                      }
                    </strong>

                    <span
                      className={
                        styles.relatedCardMeta
                      }
                    >
                      {
                        relatedPost.readingTime
                      }
                      {" · "}
                      {formatBlogDateShort(
                        relatedPost.date
                      )}
                    </span>
                  </Link>
                )
              )}
            </div>
          </section>
        )}

        <div
          className={
            styles.footerNav
          }
        >
          <Link
            className={`button button-secondary ${styles.backToIndex}`}
            href="/blog/"
          >
            ← All articles
          </Link>

          <Link
            className={`button button-secondary ${styles.backToWorld}`}
            href="/"
          >
            Back to the world
          </Link>
        </div>
      </div>
    </article>
  );
}
