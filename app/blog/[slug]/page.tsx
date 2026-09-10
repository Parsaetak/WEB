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

import {
  JsonLd,
  PERSON_ID,
  PERSON_NAME,
  SITE_IN_LANGUAGE,
  SITE_OG_IMAGE_HEIGHT,
  SITE_OG_IMAGE_PATH,
  SITE_OG_IMAGE_WIDTH,
  SITE_URL
} from "@/lib/seo";

import styles from "./article.module.css";

/*
 * Blog article — fully static.
 *
 * Every page below is prerendered at build time from the generated
 * content index. The article body is build-time HTML from the
 * validated markdown source; no markdown is parsed in the browser
 * and no client component hydrates on this route beyond the cursor.
 *
 * SEO: one JSON-LD graph per article — BreadcrumbList + BlogPosting —
 * describing exactly what the page shows (real headline, real dates,
 * real cover, real navigation hierarchy Home → Blog → article).
 * Author/publisher reference the site-wide Person @id so the
 * article plugs into the same entity graph as every other route.
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

/*
 * Social image for an article: the cover's PNG twin when the
 * article has one, otherwise the site-level default. Root-relative
 * paths — Next resolves og/twitter image URLs against the
 * production metadataBase.
 */
function socialImage(post: NonNullable<ReturnType<typeof getPost>>) {
  const cover = post.cover;

  if (cover && cover.ogSrc) {
    return {
      url: cover.ogSrc,
      alt: cover.alt,
      width: cover.width,
      height: cover.height
    };
  }

  return {
    url: SITE_OG_IMAGE_PATH,
    alt: `${post.title} — Parsa Tak`,
    width: SITE_OG_IMAGE_WIDTH,
    height: SITE_OG_IMAGE_HEIGHT
  };
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

  const image = socialImage(post);

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
      tags: post.tags,
      images: [
        {
          url: image.url,
          width: image.width,
          height: image.height,
          alt: image.alt
        }
      ]
    },

    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [image.url]
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

  /*
   * Article structured data. The image field is absolute (JSON-LD
   * is not resolved against metadataBase the way Next metadata is)
   * and present exactly when a cover actually exists.
   */
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",

    "@graph": [
      {
        "@type": "BreadcrumbList",

        "@id": `${SITE_URL}/blog/${post.slug}/#breadcrumb`,

        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${SITE_URL}/`
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: `${SITE_URL}/blog/`
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title
          }
        ]
      },

      {
        "@type": "BlogPosting",

        "@id": `${SITE_URL}/blog/${post.slug}/#article`,

        headline:
          post.title,

        description:
          post.description,

        url:
          `${SITE_URL}/blog/${post.slug}/`,

        datePublished:
          post.date,

        dateModified:
          post.updated ??
          post.date,

        author: {
          "@type": "Person",
          "@id": PERSON_ID,
          name: post.author
        },

        publisher: {
          "@type": "Person",
          "@id": PERSON_ID,
          name: PERSON_NAME
        },

        isPartOf: {
          "@id": `${SITE_URL}/blog/#blog`
        },

        breadcrumb: {
          "@id": `${SITE_URL}/blog/${post.slug}/#breadcrumb`
        },

        mainEntityOfPage: {
          "@type": "WebPage",
          "@id":
            `${SITE_URL}/blog/${post.slug}/`
        },

        image: [
          `${SITE_URL}${
            post.cover?.ogSrc ??
            SITE_OG_IMAGE_PATH
          }`
        ],

        keywords:
          post.tags.join(", "),

        wordCount:
          post.wordCount,

        articleSection:
          post.category,

        inLanguage: SITE_IN_LANGUAGE
      }
    ]
  };

  return (
    <article
      className={styles.article}
    >
      <JsonLd data={jsonLd} />

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
