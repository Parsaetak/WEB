"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import Link from "next/link";

import styles from "@/components/CompactMenu.module.css";

/*
 * COMPACT MENU (v2.6.1) — the touch-first navigation mode shared by
 * the world shell HUD and the blog header.
 *
 * A disclosure-pattern navigation: one trigger button expands a small
 * panel of real navigation entries (buttons for world scenes, links
 * for routed areas). It exists because a six-item horizontal scene
 * track stops being honest touch UI below ~860px — cramped targets,
 * hidden overflow, no discoverability.
 *
 * Behavior contract:
 * - trigger carries aria-expanded / aria-controls / aria-haspopup
 * - opening focuses the active entry (or the first entry)
 * - ArrowUp/ArrowDown/Home/End move focus inside the panel
 * - Escape closes and restores focus to the trigger
 * - pointer-down outside closes without stealing focus
 * - focus leaving the root (Tab past the panel) closes it
 * - selecting an entry ALWAYS closes the menu
 * - no scroll locking anywhere; native scrolling is preserved
 * - motion is compositor-only and collapses under reduced motion
 */

export type CompactMenuEntry =
  | {
      kind: "action";
      id: string;
      label: string;
      /** Optional index glyph ("01"…"07", "↗") shown before the label. */
      index?: string;
      /** Accent hook — scene id or area name for the CSS accent map. */
      scene?: string;
      active?: boolean;
      onSelect: () => void;
    }
  | {
      kind: "link";
      id: string;
      label: string;
      href: string;
      index?: string;
      scene?: string;
      active?: boolean;
      external?: boolean;
    };

type CompactMenuProps = {
  /** Unique panel id, referenced by the trigger's aria-controls. */
  id: string;
  /** Accessible name of the navigation the panel exposes. */
  label: string;
  entries: readonly CompactMenuEntry[];
  /** Entry ids that get a quiet red divider above them. */
  dividerBefore?: readonly string[];
};

const EXTERNAL_ARROW = "↗";

export default function CompactMenu({
  id,
  label,
  entries,
  dividerBefore
}: CompactMenuProps) {
  const [open, setOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);

  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const closeAndRestoreFocus = useCallback(() => {
    setOpen(false);

    triggerRef.current?.focus();
  }, []);

  /*
   * Open: focus lands on the active entry, or the first focusable
   * entry. One effect per open — no timers, no rAF.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    const focusables = panel.querySelectorAll<HTMLElement>(
      "button, a[href]"
    );

    const target =
      Array.from(focusables).find(
        (element) =>
          element.getAttribute("data-active") === "true"
      ) ?? focusables[0];

    target?.focus();
  }, [open]);

  /*
   * Outside interaction: a pointer-down that starts outside the root
   * closes the menu. The listener exists only while open and is
   * passive — scroll behavior is never touched.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (
      event: PointerEvent
    ) => {
      if (
        rootRef.current &&
        event.target instanceof Node &&
        !rootRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
      true
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
        true
      );
    };
  }, [open]);

  /*
   * Keyboard: roving focus inside the panel, Escape to close and
   * restore the trigger. Tab is left to the browser; if focus
   * leaves the root entirely the focusout handler below closes.
   */
  const handleRootKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        if (open) {
          event.stopPropagation();

          closeAndRestoreFocus();
        }

        return;
      }

      if (!open) {
        return;
      }

      if (
        event.key !== "ArrowDown" &&
        event.key !== "ArrowUp" &&
        event.key !== "Home" &&
        event.key !== "End"
      ) {
        return;
      }

      const panel = panelRef.current;

      if (!panel) {
        return;
      }

      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(
          "button, a[href]"
        )
      );

      if (focusables.length === 0) {
        return;
      }

      const currentIndex =
        focusables.findIndex(
          (element) =>
            element ===
            document.activeElement
        );

      let nextIndex = currentIndex;

      if (event.key === "ArrowDown") {
        nextIndex =
          currentIndex < 0
            ? 0
            : (currentIndex + 1) %
              focusables.length;
      } else if (event.key === "ArrowUp") {
        nextIndex =
          currentIndex < 0
            ? focusables.length - 1
            : (currentIndex -
                1 +
                focusables.length) %
              focusables.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else {
        nextIndex = focusables.length - 1;
      }

      event.preventDefault();

      focusables[nextIndex]?.focus();
    },
    [open, closeAndRestoreFocus]
  );

  /*
   * Focus leaving the root (Tab past the last entry, or a programmatic
   * jump) closes the panel without moving focus itself. React's onBlur
   * maps to the DOM focusout event, so relatedTarget is available.
   */
  const handleFocusOut = useCallback(
    (event: React.FocusEvent) => {
      if (!open) {
        return;
      }

      if (
        rootRef.current &&
        event.relatedTarget instanceof Node &&
        !rootRef.current.contains(
          event.relatedTarget
        )
      ) {
        setOpen(false);
      }
    },
    [open]
  );

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-open={open ? "true" : "false"}
      onKeyDown={handleRootKeyDown}
      onBlur={handleFocusOut}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        data-open={open ? "true" : "false"}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-haspopup="true"
        onClick={() =>
          setOpen((value) => !value)
        }
      >
        <span
          className={
            styles.triggerGlyph
          }
          aria-hidden="true"
        >
          <span />

          <span />
        </span>

        <span className={styles.triggerLabel}>
          Menu
        </span>
      </button>

      {open && (
        <div
          ref={panelRef}
          id={id}
          className={styles.panel}
        >
          <nav
            className={styles.panelNav}
            aria-label={label}
          >
            <ul className={styles.list}>
              {entries.map(
                (entry) => {
                  const divider =
                    dividerBefore?.includes(
                      entry.id
                    ) ?? false;

                  const entryBody = (
                    <>
                      <span
                        className={
                          styles.entryIndex
                        }
                        aria-hidden="true"
                      >
                        {entry.index ??
                          ""}
                      </span>

                      <span
                        className={
                          styles.entryLabel
                        }
                      >
                        {entry.label}
                      </span>

                      <span
                        className={
                          styles.entryDot
                        }
                        aria-hidden="true"
                      />
                    </>
                  );

                  return (
                    <Fragment
                      key={entry.id}
                    >
                      {divider && (
                        <li
                          className={
                            styles.divider
                          }
                          role="presentation"
                        />
                      )}

                      <li
                        className={
                          styles.item
                        }
                      >
                        {entry.kind ===
                        "action" ? (
                          <button
                            type="button"
                            className={
                              styles.entry
                            }
                            data-scene={
                              entry.scene
                            }
                            data-active={
                              entry.active
                                ? "true"
                                : "false"
                            }
                            aria-current={
                              entry.active
                                ? "page"
                                : undefined
                            }
                            onClick={() => {
                              entry.onSelect();

                              close();
                            }}
                          >
                            {
                              entryBody
                            }
                          </button>
                        ) : entry.external ? (
                          <a
                            className={
                              styles.entry
                            }
                            data-scene={
                              entry.scene
                            }
                            data-active={
                              entry.active
                                ? "true"
                                : "false"
                            }
                            href={
                              entry.href
                            }
                            target="_blank"
                            rel="noreferrer"
                            onClick={close}
                          >
                            {
                              entryBody
                            }

                            <span
                              className={
                                styles.entryArrow
                              }
                              aria-hidden="true"
                            >
                              {
                                EXTERNAL_ARROW
                              }
                            </span>
                          </a>
                        ) : (
                          <Link
                            className={
                              styles.entry
                            }
                            data-scene={
                              entry.scene
                            }
                            data-active={
                              entry.active
                                ? "true"
                                : "false"
                            }
                            aria-current={
                              entry.active
                                ? "page"
                                : undefined
                            }
                            href={
                              entry.href
                            }
                            prefetch={false}
                            onClick={close}
                          >
                            {
                              entryBody
                            }
                          </Link>
                        )}
                      </li>
                    </Fragment>
                  );
                }
              )}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
