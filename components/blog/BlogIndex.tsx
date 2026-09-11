"use client";

import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore
} from "react";

import Link from "next/link";

import type {
  BlogPostMeta
} from "@/lib/blogFormat";

import {
  formatBlogDateShort
} from "@/lib/blogFormat";

import { isTypingTarget } from "@/lib/keyboard";

import styles from "./BlogIndex.module.css";

/*
 * Blog index island — the only client component on the blog index.
 *
 * IMPORTANT BOUNDARY: this component imports from lib/blogFormat.ts
 * ONLY. lib/blog.ts imports the full generated content file, so a
 * single value import from it would pull every article body into this
 * page's client bundle. Metadata arrives as serialized props from the
 * server-rendered index instead.
 *
 * Search is a scan over the precomputed `search` haystack emitted at
 * build time — typing re-filters without joining strings per post.
 * The runtime fallback covers data generated before v2.1.
 */

function matchesQuery(
  post: BlogPostMeta,
  query: string
): boolean {
  if (query === "") {
    return true;
  }

  const haystack =
    post.search ??
    [
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

type BlogIndexProps = {
  posts: readonly BlogPostMeta[];
  tags: readonly string[];
};

/*
 * DEEP-LINK FILTERS (v2.5.2): article context chips link here as
 * /blog/?project=<name> and /blog/?topic=<name>. The URL is the
 * single source of truth for both dimensions — read through
 * useSyncExternalStore (no effect-time setState, no hydration
 * mismatch: the server snapshot is ""), so a chip clear rewrites
 * the address and the store notifies in one motion. An unknown
 * value is ignored — the index never renders a broken-looking
 * state from a stale or hand-edited URL.
 */
const URL_FILTER_EVENT = "blogindex:filters";

function readDeepLinkFilters(
  search: string,
  posts: readonly BlogPostMeta[]
): {
  project: string | null;
  topic: string | null;
} {
  if (search === "") {
    return {
      project: null,
      topic: null
    };
  }

  const params =
    new URLSearchParams(search);

  const project =
    params.get("project");

  const topic = params.get("topic");

  const validProject =
    project &&
    posts.some(
      (post) =>
        post.project === project
    )
      ? project
      : null;

  const validTopic =
    topic &&
    posts.some((post) =>
      post.topics.includes(topic)
    )
      ? topic
      : null;

  return {
    project: validProject,
    topic: validTopic
  };
}

/*
 * The store: location.search, re-read on popstate AND after the
 * island's own replaceState writes (history.replaceState fires no
 * event, so the writer announces itself).
 */
function subscribeToUrlFilters(
  onStoreChange: () => void
): () => void {
  window.addEventListener(
    "popstate",
    onStoreChange
  );

  window.addEventListener(
    URL_FILTER_EVENT,
    onStoreChange
  );

  return () => {
    window.removeEventListener(
      "popstate",
      onStoreChange
    );

    window.removeEventListener(
      URL_FILTER_EVENT,
      onStoreChange
    );
  };
}

function getUrlSearchSnapshot(): string {
  return window.location.search;
}

function getServerUrlSearchSnapshot(): string {
  return "";
}

/*
 * URL sync for the deep-link dimensions: clearing a filter chip
 * rewrites the address with replaceState so a shareable URL never
 * advertises a filter that is no longer active. History is left
 * alone — filter state is view state, not navigation.
 */
function writeDeepLinkFilters(
  project: string | null,
  topic: string | null
) {
  if (
    typeof window === "undefined" ||
    typeof window.history === "undefined"
  ) {
    return;
  }

  const params =
    new URLSearchParams(
      window.location.search
    );

  if (project) {
    params.set(
      "project",
      project
    );
  } else {
    params.delete(
      "project"
    );
  }

  if (topic) {
    params.set("topic", topic);
  } else {
    params.delete("topic");
  }

  const query =
    params.toString();

  window.history.replaceState(
    null,
    "",
    query
      ? `/blog/?${query}`
      : "/blog/"
  );

  window.dispatchEvent(
    new Event(URL_FILTER_EVENT)
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

  /*
   * Deep-link dimensions live in the URL (single source of truth).
   * The store snapshot is "" during SSR and re-read on popstate and
   * after the island's own replaceState writes — no effect-time
   * setState anywhere.
   */
  const urlSearch =
    useSyncExternalStore(
      subscribeToUrlFilters,
      getUrlSearchSnapshot,
      getServerUrlSearchSnapshot
    );

  const { project: activeProject, topic: activeTopic } =
    useMemo(
      () =>
        readDeepLinkFilters(
          urlSearch,
          posts
        ),
      [urlSearch, posts]
    );

  const clearProject = () => {
    writeDeepLinkFilters(
      null,
      activeTopic
    );
  };

  const clearTopic = () => {
    writeDeepLinkFilters(
      activeProject,
      null
    );
  };

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
              )) &&
            (activeProject ===
              null ||
              post.project ===
                activeProject) &&
            (activeTopic === null ||
              post.topics.includes(
                activeTopic
              ))
        ),
      [
        posts,
        query,
        activeTag,
        activeProject,
        activeTopic
      ]
    );

  const hasFilters =
    query !== "" ||
    activeTag !== null ||
    activeProject !== null ||
    activeTopic !== null;

  const clearFilters = () => {
    setQuery("");

    setActiveTag(
      null
    );

    writeDeepLinkFilters(
      null,
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

  /*
   * Search hotkey (v2.5.3): "/" anywhere on the index jumps focus
   * into the search field; Escape inside it clears and blurs.
   * Both keys are ignored while the reader is already typing in a
   * field (lib/keyboard — and modified keystrokes always pass
   * through untouched). The visible affordance is the aria-hidden
   * <kbd> hint inside the search wrap — without JS it is inert
   * chrome, with JS it teaches the shortcut. Reduced motion is
   * honored for the scroll-into-view.
   */
  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }

      const searchInput =
        document.getElementById(
          "blog-search"
        );

      if (!searchInput) {
        return;
      }

      if (
        event.key === "/" &&
        !event.shiftKey &&
        !isTypingTarget(
          event.target
        ) &&
        !event.defaultPrevented
      ) {
        event.preventDefault();

        searchInput.scrollIntoView(
          {
            block: "nearest",

            behavior:
              window.matchMedia(
                "(prefers-reduced-motion: reduce)"
              ).matches
                ? "auto"
                : "smooth"
          }
        );

        searchInput.focus();

        return;
      }

      if (
        event.key === "Escape" &&
        event.target ===
          searchInput
      ) {
        setQuery("");

        searchInput.blur();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

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
            aria-keyshortcuts="/"
          />

          {/**
            * Hotkey hint (v2.5.3) — decorative; the input carries
            * aria-keyshortcuts for assistive tech.
            */}
          <kbd
            className={
              styles.searchKey
            }
            aria-hidden="true"
          >
            /
          </kbd>
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

        {/*
         * Active deep-link dimensions (v2.5.2): shown as removable
         * chips so a reader arriving from an article context chip
         * always sees WHY the list is narrowed — and can undo it.
         */}
        {activeProject && (
          <button
            type="button"
            className={
              styles.deepLinkChip
            }
            onClick={
              clearProject
            }
            aria-label={`Remove project filter: ${activeProject}`}
          >
            PROJECT ·{" "}
            {activeProject}
            <span
              aria-hidden="true"
              className={
                styles.deepLinkChipX
              }
            >
              ×
            </span>
          </button>
        )}

        {activeTopic && (
          <button
            type="button"
            className={
              styles.deepLinkChip
            }
            onClick={clearTopic}
            aria-label={`Remove topic filter: ${activeTopic}`}
          >
            TOPIC ·{" "}
            {activeTopic}
            <span
              aria-hidden="true"
              className={
                styles.deepLinkChipX
              }
            >
              ×
            </span>
          </button>
        )}
      </div>

      {filteredPosts.length >
        0 && (
        <ul className={styles.grid}>
          {filteredPosts.map(
            (
              post,
              index
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
                data-category={
                  post.category
                }
                /*
                 * REVEAL STAGGER (v2.2): cards enter with a
                 * deterministic stagger. Grid position drives the
                 * delay (capped by the controller); cards that
                 * survive a filter change keep their revealed state,
                 * newly matching cards fade in, removed cards leave
                 * the set without a heavy exit system.
                 */
                data-reveal=""
                data-reveal-order={
                  index % 6
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
                    <span
                      className={
                        styles.cardCategory
                      }
                    >
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
          data-reveal="instant"
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
            The index is live and
            waiting for the first
            transmission.
          </p>
        </div>
      )}
    </div>
  );
}
