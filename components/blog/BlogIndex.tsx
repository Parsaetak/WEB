"use client";

import {
  useMemo,
  useState
} from "react";

import Link from "next/link";

import type {
  BlogPostMeta
} from "@/lib/blog";

import {
  formatBlogDateShort
} from "@/lib/blog";

import styles from "./BlogIndex.module.css";

/*
 * Blog index island — the only client component on the blog index.
 *
 * Receives article metadata (no HTML bodies). Search and tag
 * filtering are in-memory scans of a small array — precomputed
 * indexes are unnecessary at this size, and the array is memoized
 * so typing re-filters without re-deriving anything.
 */

type BlogIndexProps = {
  posts: readonly BlogPostMeta[];
  tags: readonly string[];
};

function matchesQuery(
  post: BlogPostMeta,
  query: string
): boolean {
  if (query === "") {
    return true;
  }

  const haystack = [
    post.title,
    post.subtitle ?? "",
    post.excerpt,
    post.category,
    post.author,
    ...post.tags
  ]
    .join(" ")
    .toLowerCase();

  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) =>
      haystack.includes(term)
    );
}

export default function BlogIndex({
  posts,
  tags
}: BlogIndexProps) {
  const [query, setQuery] =
    useState("");

  const [activeTag, setActiveTag] =
    useState<string | null>(
      null
    );

  const [showAllTags, setShowAllTags] =
    useState(false);

  const visibleTags =
    useMemo(
      () =>
        showAllTags
          ? tags
          : tags.slice(0, 8),
      [tags, showAllTags]
    );

  const filteredPosts =
    useMemo(
      () =>
        posts.filter(
          (post) =>
            matchesQuery(
              post,
              query
            ) &&
            (activeTag === null ||
              post.tags.includes(
                activeTag
              ))
        ),
      [posts, query, activeTag]
    );

  const hasFilters =
    query !== "" ||
    activeTag !== null;

  const clearFilters =
    () => {
      setQuery("");

      setActiveTag(
        null
      );
    };

  const toggleTag = (
    tag: string
  ) => {
    setActiveTag(
      (current) =>
        current === tag
          ? null
          : tag
    );
  };

  return (
    <div className={styles.blogIndex}>
      <div className={styles.controls}>
        <div
          className={styles.searchWrap}
          role="search"
          aria-label="Search articles"
        >
          <label
            className={styles.searchLabel}
            htmlFor="blog-search"
          >
            SEARCH
          </label>

          <input
            id="blog-search"
            className={styles.searchInput}
            type="search"
            value={query}
            onChange={(
              event
            ) => {
              setQuery(
                event
                  .target
                  .value
              );
            }}
            placeholder="Title, tag, or topic…"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {tags.length > 0 && (
          <div
            className={styles.tagFilter}
            role="group"
            aria-label="Filter by tag"
          >
            {visibleTags.map(
              (tag) => {
                const active =
                  activeTag ===
                  tag;

                return (
                  <button
                    key={tag}
                    type="button"
                    className={
                      styles.tagChip
                    }
                    data-active={
                      active
                        ? "true"
                        : "false"
                    }
                    aria-pressed={
                      active
                    }
                    onClick={() =>
                      toggleTag(
                        tag
                      )
                    }
                  >
                    {tag}
                  </button>
                );
              }
            )}

            {tags.length > 8 && (
              <button
                type="button"
                className={
                  styles.tagMore
                }
                onClick={() =>
                  setShowAllTags(
                    (
                      current
                    ) =>
                      !current
                  )
                }
              >
                {showAllTags
                  ? "LESS −"
                  : `+${tags.length - 8}`}
              </button>
            )}
          </div>
        )}

        {hasFilters && (
          <button
            type="button"
            className={
              styles.clearButton
            }
            onClick={
              clearFilters
            }
          >
            CLEAR FILTERS
          </button>
        )}
      </div>

      <div
        className={
          styles.resultMeta
        }
        aria-live="polite"
      >
        <span>
          {filteredPosts.length}
          {" "}
          ARTICLE
          {filteredPosts.length ===
          1
            ? ""
            : "S"}
        </span>

        {activeTag && (
          <span>
            TAGGED · {activeTag}
          </span>
        )}
      </div>

      {filteredPosts.length >
        0 && (
        <ul className={styles.grid}>
          {filteredPosts.map(
            (
              post
            ) => (
              <li
                key={
                  post.slug
                }
                className={
                  styles.card
                }
                data-featured={
                  post.featured
                    ? "true"
                    : "false"
                }
              >
                {post.cover && (
                  <Link
                    className={
                      styles.cardVisual
                    }
                    href={`/blog/${post.slug}/`}
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <img
                      src={
                        post.cover.src
                      }
                      alt=""
                      width={
                        post.cover.width
                      }
                      height={
                        post.cover.height
                      }
                      loading="lazy"
                      decoding="async"
                    />
                  </Link>
                )}

                <div
                  className={
                    styles.cardContent
                  }
                >
                  <p
                    className={
                      styles.cardKicker
                    }
                  >
                    <span>
                      {
                        post.category
                      }
                    </span>

                    <span>
                      {
                        post.readingTime
                      }
                    </span>
                  </p>

                  <h2
                    className={
                      styles.cardTitle
                    }
                  >
                    <Link
                      href={`/blog/${post.slug}/`}
                    >
                      {
                        post.title
                      }
                    </Link>
                  </h2>

                  <p
                    className={
                      styles.cardExcerpt
                    }
                  >
                    {
                      post.excerpt
                    }
                  </p>

                  <p
                    className={
                      styles.cardMeta
                    }
                  >
                    <time
                      dateTime={
                        post.date
                      }
                    >
                      {formatBlogDateShort(
                        post.date
                      )}
                    </time>

                    <span>
                      {
                        post.author
                      }
                    </span>
                  </p>

                  {post.tags.length >
                    0 && (
                    <div
                      className={
                        styles.cardTags
                      }
                    >
                      {post.tags
                        .slice(
                          0,
                          3
                        )
                        .map(
                          (
                            tag
                          ) => (
                            <span
                              key={
                                tag
                              }
                            >
                              {
                                tag
                              }
                            </span>
                          )
                        )}
                    </div>
                  )}
                </div>
              </li>
            )
          )}
        </ul>
      )}

      {posts.length > 0 &&
        filteredPosts.length ===
          0 && (
        <div
          className={
            styles.empty
          }
          role="status"
        >
          <span
            className={
              styles.emptyGlyph
            }
          >
            NO SIGNAL
          </span>

          <strong>
            No articles match
            this filter.
          </strong>

          <p>
            Adjust the search
            terms or clear the
            active tag to see
            the full index.
          </p>

          <button
            type="button"
            className={
              styles.emptyAction
            }
            onClick={
              clearFilters
            }
          >
            CLEAR FILTERS
          </button>
        </div>
      )}

      {posts.length === 0 && (
        <div
          className={
            styles.empty
          }
          role="status"
        >
          <span
            className={
              styles.emptyGlyph
            }
          >
            STANDBY
          </span>

          <strong>
            No articles published
            yet.
          </strong>

          <p>
            The feed is live and
            waiting for the first
            transmission.
          </p>
        </div>
      )}
    </div>
  );
}
