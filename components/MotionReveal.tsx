"use client";

import { useEffect } from "react";

import styles from "@/components/MotionReveal.module.css";

/*
 * MOTION REVEAL — the ONE observer behind the site-wide fade-in system.
 *
 * Every element that opts in with `data-reveal` is watched by a single
 * IntersectionObserver owned by this component. When an element enters
 * the viewport it is marked `data-revealed="true"`, and CSS (globals.css
 * motion tokens) performs the actual transition. No rAF loop, no timers,
 * no per-element work beyond one attribute write and one inline custom
 * property.
 *
 * Design law:
 * - ONE observer per page, never one per component.
 * - Reveal is one-shot: elements are unobserved after revealing, so
 *   scroll cost decays to zero as the page settles.
 * - Stagger is deterministic, never timer-based: elements revealed in
 *   the same batch receive an incremental `--reveal-delay` derived from
 *   an explicit `data-reveal-order` (grid position) or batch position,
 *   capped so deep groups never feel slow.
 * - A passive MutationObserver catches `data-reveal` elements that
 *   appear AFTER mount (blog filter results, expanded groups) and joins
 *   them into the same observer. It does nothing for any other mutation.
 * - Reduced motion needs no JavaScript — CSS drops travel and duration
 *   under `prefers-reduced-motion` directly.
 * - Content safety: without JavaScript the pre-paint `reveal-js` class
 *   never lands, so nothing is ever hidden from the user.
 */

const STAGGER_STEP_MS = 45;

const MAX_STAGGER_STEPS = 5;

export default function MotionReveal() {
  useEffect(() => {
    const observer =
      new IntersectionObserver(
        (entries) => {
          let batchIndex = 0;

          for (const entry of entries) {
            if (!entry.isIntersecting) {
              continue;
            }

            const element =
              entry.target as HTMLElement;

            /*
             * Deterministic order: an explicit `data-reveal-order`
             * (grid position) wins; otherwise batch position.
             */
            const explicit =
              element.dataset.revealOrder;

            const order =
              explicit !== undefined &&
              Number.isFinite(Number(explicit))
                ? Number(explicit)
                : batchIndex;

            const step =
              Math.min(
                MAX_STAGGER_STEPS - 1,
                Math.max(0, order)
              );

            element.style.setProperty(
              "--reveal-delay",
              `${step * STAGGER_STEP_MS}ms`
            );

            element.dataset.revealed =
              "true";

            observer.unobserve(element);

            batchIndex += 1;
          }
        },
        {
          /*
           * Reveal just before the element is fully on screen so the
           * motion reads as settling into place, not appearing late.
           */
          rootMargin: "0px 0px -8% 0px",

          threshold: 0.05
        }
      );

    const revealElement = (
      element: HTMLElement
    ) => {
      if (
        element.dataset.revealed === "true"
      ) {
        return;
      }

      observer.observe(element);
    };

    const scanElement = (
      root: HTMLElement
    ) => {
      if (
        root.matches("[data-reveal]")
      ) {
        revealElement(root);
      }

      if (
        root.querySelector("[data-reveal]")
      ) {
        root
          .querySelectorAll<HTMLElement>(
            "[data-reveal]:not([data-revealed])"
          )
          .forEach(revealElement);
      }
    };

    document
      .querySelectorAll<HTMLElement>(
        "[data-reveal]:not([data-revealed])"
      )
      .forEach(revealElement);

    /*
     * Catch late arrivals (client-side filtering, expanded lists).
     * The callback returns immediately when nothing relevant was added.
     */
    const mutation =
      new MutationObserver((records) => {
        for (const record of records) {
          for (
            let index = 0;
            index < record.addedNodes.length;
            index += 1
          ) {
            const node =
              record.addedNodes[index];

            if (node.nodeType !== 1) {
              continue;
            }

            scanElement(
              node as HTMLElement
            );
          }
        }
      });

    mutation.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();

      mutation.disconnect();
    };
  }, []);

  return (
    <div
      className={
        styles.motionRevealHost
      }
      aria-hidden="true"
    />
  );
}
