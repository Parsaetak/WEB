"use client";

import { useEffect, useState } from "react";

import styles from "./ArticleToc.module.css";

/*
 * ARTICLE TOC (v2.5.1) — navigation for long reads, in the site's
 * instrument-panel language.
 *
 * Two presentations from ONE heading list (the build-time `headings`
 * data every article already carries — no pipeline change):
 *
 * - RAIL (≥1280px): a fixed instrument rail in the right gutter,
 *   outside the content column (it starts at 50% + 446px — past the
 *   860px related/adjacent blocks). Sticky-by-nature: it stays with
 *   the reader for the whole article.
 * - INLINE (below 1280px): a native <details> disclosure above the
 *   article body — keyboard accessible, functional without JS.
 *
 * Scroll-spy law: ONE IntersectionObserver watches the heading
 * elements (observer-driven state, never a scroll listener) and
 * highlights the section currently being read. Clicks smooth-scroll
 * with scroll-margin respected and degrade to instant jumps under
 * reduced motion. Without JavaScript the links are ordinary anchors:
 * the TOC navigates, only the highlighting disappears.
 */

type TocHeading = {
  id: string;
  text: string;
  level: number;
};

export default function ArticleToc({
  headings
}: {
  headings: readonly TocHeading[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) {
      return;
    }

    const targets = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null);

    if (targets.length === 0) {
      return;
    }

    const orderOf = new Map(
      targets.map((element, index) => [element.id, index])
    );

    /*
     * A thin horizontal band 15%–25% from the top of the viewport:
     * whatever heading sits in it is the section being read. When
     * several land in one callback batch, the EARLIEST wins.
     */
    const observer = new IntersectionObserver(
      (entries) => {
        let best: string | null = null;
        let bestOrder = Number.POSITIVE_INFINITY;

        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          const order = orderOf.get(entry.target.id) ?? 0;

          if (order < bestOrder) {
            bestOrder = order;
            best = entry.target.id;
          }
        }

        if (best !== null) {
          setActiveId(best);
        }
      },
      {
        rootMargin: "-15% 0px -75% 0px",
        threshold: 0
      }
    );

    targets.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  const scrollTo = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    const element = document.getElementById(id);

    if (!element) {
      return;
    }

    event.preventDefault();

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    element.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start"
    });

    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  };

  const renderList = (variant: "rail" | "inline") => (
    <ol
      className={
        variant === "rail" ? styles.railList : styles.inlineList
      }
    >
      {headings.map((heading, index) => (
        <li key={heading.id}>
          <a
            className={
              variant === "rail" ? styles.railLink : styles.inlineLink
            }
            href={`#${heading.id}`}
            data-active={
              activeId === heading.id ? "true" : "false"
            }
            data-level={heading.level}
            onClick={(event) => scrollTo(event, heading.id)}
          >
            <span
              className={styles.index}
              aria-hidden="true"
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <span className={styles.label}>
              {heading.text}
            </span>
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      {/*
        * INLINE variant — below 1280px, above the article body.
        * Native details/summary: opens with Enter/Space, works
        * without JavaScript, never traps focus.
        */}
      <details
        className={styles.tocInline}
        data-reveal="instant"
      >
        <summary className={styles.tocInlineSummary}>
          <span>CONTENTS</span>

          <span className={styles.tocInlineCount}>
            {headings.length} SECTIONS
          </span>
        </summary>

        {renderList("inline")}
      </details>

      {/*
        * RAIL variant — ≥1280px only (CSS-hidden elsewhere). Fixed in
        * the right gutter; no ancestor carries a transform, so
        * `position: fixed` behaves literally.
        */}
      <nav
        className={styles.tocRail}
        aria-label="Article contents"
        data-reveal="instant"
      >
        <p className={styles.railKicker}>CONTENTS</p>

        {renderList("rail")}
      </nav>
    </>
  );
}
