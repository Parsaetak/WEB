"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import styles from "@/components/UnifiedSiteNav.module.css";

/*
 * UNIFIED SITE NAVIGATION (v3.4) — THE one navigation system.
 *
 * Every surface of the website renders its primary navigation through
 * this component: the living world HUD, the blog header, the static
 * content documents (/about/, /work/, /research/, /contact/) and the
 * six topic hubs. One renderer, one data source (lib/navigation.ts),
 * one visual identity, one interaction contract.
 *
 * The component renders BOTH responsive modes of the same system from
 * the same entries:
 *
 * - TRACK (desktop): the horizontal primary/world track, identical on
 *   every surface. Primary tabs (HOME, ABOUT, WORK, RESEARCH, BLOG,
 *   CONTACT) each carry their own ~1s hover identity animation; the
 *   world scenes (SYSTEMS, RED MAGIC, LIBRARY) follow a quiet divider.
 * - MENU (≤860px): a disclosure-panel mode of the same navigation —
 *   same labels, same ordering, same accents, same animation language.
 *   The trigger expands a panel with roving focus, Escape-to-close,
 *   focus restoration and outside-pointer dismissal.
 *
 * Entry kinds:
 * - "link":   a real destination. Internal routes render as
 *             next/link with viewport prefetch disabled (no page is
 *             fetched continuously in the background, per site law);
 *             instead v3.5 warms the route ON INTENT — pointer enter,
 *             focus, or pointer-down fetches the destination's RSC
 *             payload through router.prefetch() once, deduplicated,
 *             so the click itself is a cache hit. Static-export
 *             payloads are tiny text files; no heavy page assets are
 *             pulled by warming. External links render as plain
 *             anchors.
 * - "action": an in-shell interaction state (the world scenes),
 *             switched through onSelect with the same preloading
 *             contract as before (onActionWarm — immediate, bypasses
 *             the background scheduler, deduplicated by the scene
 *             preloader cache).
 *
 * Accessibility contract (every surface):
 * - semantic <nav> with accessible names
 * - aria-current="page" on the active entry, data-active for styling
 * - aria-expanded / aria-controls / aria-haspopup on the menu trigger
 * - roving ArrowUp/ArrowDown/Home/End focus inside the open panel
 * - Escape closes the panel and restores focus to the trigger
 * - pointer-down outside closes without stealing focus
 * - focus leaving the root closes the panel
 * - no scroll locking anywhere; native scrolling is preserved
 * - motion is compositor-only (transform/opacity/clip-path) and
 *   collapses under prefers-reduced-motion
 * - decorative hover identities only run on hover-capable pointers;
 *   touch devices never depend on hover
 */

export type UnifiedNavEntry =
  | {
      kind: "link";
      id: string;
      group: "primary" | "world" | "utility";
      label: string;
      shortLabel: string;
      href: string;
      external?: boolean;
      active?: boolean;
    }
  | {
      kind: "action";
      id: string;
      group: "primary" | "world" | "utility";
      label: string;
      shortLabel: string;
      active?: boolean;
      onSelect: () => void;
    };

type UnifiedSiteNavProps = {
  /** Unique panel id, referenced by the trigger's aria-controls. */
  menuId: string;
  /** Accessible name of the disclosure panel's navigation. */
  menuLabel?: string;
  entries: readonly UnifiedNavEntry[];
  /**
   * Scene-warming hook fired on pointer enter / focus of action
   * entries (the world shell passes its scene preloader here).
   */
  onActionWarm?: (id: string) => void;
  /** Extra class for surface-specific placement of the nav root. */
  className?: string;
};

export default function UnifiedSiteNav({
  menuId,
  menuLabel = "Site navigation",
  entries,
  onActionWarm,
  className
}: UnifiedSiteNavProps) {
  /*
   * INTENT WARMING (v3.5) — the mechanism that makes clicking a tab
   * feel immediate. Hover/focus/press on an entry fetches its
   * destination BEFORE the click commits:
   * - scene actions warm their module through onActionWarm
   *   (preloadScene — immediate, deduplicated by the preloader).
   * - internal route links warm through router.prefetch(), the
   *   framework's own mechanism: in this static export it fetches
   *   the route's RSC payload exactly once, and the client router
   *   reuses the cache on navigation. Viewport prefetch stays off
   *   (prefetch={false}), so nothing is fetched continuously and no
   *   heavy page asset is pulled — warming costs one small text
   *   file per intended destination.
   */
  const router = useRouter();

  const warmedRoutes =
    useRef<Set<string>>(new Set());

  const warmRoute = useCallback(
    (href: string) => {
      if (
        warmedRoutes.current.has(
          href
        )
      ) {
        return;
      }

      warmedRoutes.current.add(
        href
      );

      /*
       * router.prefetch is typed as void in the current Next types,
       * but failures surface as promise rejections internally — wrap
       * defensively so a failed warm evicts the entry and a later
       * intent can retry. The click itself always navigates normally.
       */
      void Promise.resolve(
        router.prefetch(href)
      ).catch(() => {
        warmedRoutes.current.delete(
          href
        );
      });
    },
    [router]
  );

  const warmEntry = useCallback(
    (entry: UnifiedNavEntry) => {
      if (
        entry.kind === "action"
      ) {
        if (!entry.active) {
          onActionWarm?.(
            entry.id
          );
        }

        return;
      }

      if (
        entry.kind === "link" &&
        !entry.external
      ) {
        warmRoute(entry.href);
      }
    },
    [onActionWarm, warmRoute]
  );

  const primary = entries.filter(
    (entry) => entry.group === "primary"
  );

  const world = entries.filter(
    (entry) => entry.group === "world"
  );

  return (
    <div
      className={
        className
          ? `${styles.root} ${className}`
          : styles.root
      }
    >
      <nav
        className={
          styles.trackNav
        }
        aria-label="Site"
      >
        <div
          className={
            styles.track
          }
        >
          {primary.map(
            (entry) => (
              <NavEntry
                key={
                  entry.id
                }
                entry={
                  entry
                }
                onWarm={
                  warmEntry
                }
              />
            )
          )}

          {world.length >
            0 && (
            <span
              className={
                styles.divider
              }
              aria-hidden="true"
            />
          )}

          {world.map(
            (entry) => (
              <NavEntry
                key={
                  entry.id
                }
                entry={
                  entry
                }
                onWarm={
                  warmEntry
                }
              />
            )
          )}
        </div>
      </nav>

      <NavMenu
        menuId={menuId}
        label={
          menuLabel
        }
        entries={
          entries
        }
        onWarm={
          warmEntry
        }
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared entry renderer (desktop track)                                       */
/* -------------------------------------------------------------------------- */

function NavEntry({
  entry,
  onWarm
}: {
  entry: UnifiedNavEntry;
  onWarm?: (entry: UnifiedNavEntry) => void;
}) {
  /*
   * WARM ON INTENT (v3.5): pointerenter + focus cover the desktop
   * contract (hover, keyboard); pointerdown covers touch — a finger
   * pressing the tab fetches the destination during the ~100ms
   * before the click event commits, with or without hover support.
   * All three share one deduplicated entry point.
   */
  const warm = () => {
    onWarm?.(entry);
  };

  const body = (
    <>
      <span
        className={
          styles.copy
        }
      >
        <span
          className={
            styles.label
          }
        >
          {
            entry.shortLabel
          }
        </span>
      </span>

      {/*
       * Hover-identity layers (v3.4). Two dedicated spans plus the
       * item's ::after pseudo-element give every primary tab three
       * animatable compositor-only layers. Decorative: hidden from
       * assistive technology, idle-invisible, animated only under
       * hover-capable pointers with motion allowed.
       */}
      <span
        className={
          styles.fx
        }
        aria-hidden="true"
      />

      <span
        className={
          styles.fx2
        }
        aria-hidden="true"
      />

      <span
        className={
          styles.indicator
        }
        aria-hidden="true"
      />
    </>
  );

  const shared = {
    className: `${styles.item} ${
      entry.group === "world"
        ? styles.worldItem
        : ""
    }`.trim(),
    "data-id":
      entry.id,
    "data-active":
      entry.active
        ? "true"
        : "false",
    "aria-current":
      entry.active
        ? ("page" as const)
        : undefined,
    "aria-label": `Open ${entry.label}`,
    onPointerEnter:
      warm,
    onPointerDown:
      warm,
    onFocus: warm
  };

  if (
    entry.kind ===
    "action"
  ) {
    return (
      <button
        {...shared}
        type="button"
        onClick={
          entry.onSelect
        }
      >
        {
          body
        }
      </button>
    );
  }

  if (
    entry.external
  ) {
    return (
      <a
        {...shared}
        href={
          entry.href
        }
        target="_blank"
        rel="noreferrer"
      >
        {
          body
        }
      </a>
    );
  }

  return (
    <Link
      {...shared}
      href={
        entry.href
      }
      prefetch={
        false
      }
    >
      {
        body
      }
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Disclosure menu (mobile / narrow viewport mode of the same system)          */
/* -------------------------------------------------------------------------- */

const EXTERNAL_ARROW = "↗";

function NavMenu({
  menuId,
  label,
  entries,
  onWarm
}: {
  menuId: string;
  label: string;
  entries: readonly UnifiedNavEntry[];
  onWarm?: (entry: UnifiedNavEntry) => void;
}) {
  const [open, setOpen] =
    useState(false);

  const rootRef =
    useRef<HTMLDivElement>(null);

  const triggerRef =
    useRef<HTMLButtonElement>(null);

  const panelRef =
    useRef<HTMLDivElement>(null);

  const close =
    useCallback(() => {
      setOpen(false);
    }, []);

  const closeAndRestoreFocus =
    useCallback(() => {
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

    const panel =
      panelRef.current;

    if (!panel) {
      return;
    }

    const focusables =
      panel.querySelectorAll<HTMLElement>(
        "button, a[href]"
      );

    const target =
      Array.from(
        focusables
      ).find(
        (element) =>
          element.getAttribute(
            "data-active"
          ) === "true"
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

    const handlePointerDown =
      (
        event: PointerEvent
      ) => {
        if (
          rootRef.current &&
          event.target instanceof
            Node &&
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
   * leaves the root entirely the focusout handler closes.
   */
  const handleRootKeyDown =
    useCallback(
      (
        event: React.KeyboardEvent
      ) => {
        if (
          event.key ===
          "Escape"
        ) {
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
          event.key !==
            "ArrowDown" &&
          event.key !==
            "ArrowUp" &&
          event.key !==
            "Home" &&
          event.key !==
            "End"
        ) {
          return;
        }

        const panel =
          panelRef.current;

        if (!panel) {
          return;
        }

        const focusables =
          Array.from(
            panel.querySelectorAll<HTMLElement>(
              "button, a[href]"
            )
          );

        if (
          focusables.length ===
          0
        ) {
          return;
        }

        const currentIndex =
          focusables.findIndex(
            (element) =>
              element ===
              document.activeElement
          );

        let nextIndex =
          currentIndex;

        if (
          event.key ===
          "ArrowDown"
        ) {
          nextIndex =
            currentIndex < 0
              ? 0
              : (currentIndex +
                  1) %
                focusables.length;
        } else if (
          event.key ===
          "ArrowUp"
        ) {
          nextIndex =
            currentIndex < 0
              ? focusables.length -
                1
              : (currentIndex -
                  1 +
                  focusables.length) %
                focusables.length;
        } else if (
          event.key ===
          "Home"
        ) {
          nextIndex = 0;
        } else {
          nextIndex =
            focusables.length -
            1;
        }

        event.preventDefault();

        focusables[nextIndex]?.focus();
      },
      [
        open,
        closeAndRestoreFocus
      ]
    );

  /*
   * Focus leaving the root (Tab past the last entry, or a
   * programmatic jump) closes the panel without moving focus.
   * React's onBlur maps to the DOM focusout event, so
   * relatedTarget is available.
   */
  const handleFocusOut =
    useCallback(
      (
        event: React.FocusEvent
      ) => {
        if (!open) {
          return;
        }

        if (
          rootRef.current &&
          event.relatedTarget instanceof
            Node &&
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
      className={
        styles.menuRoot
      }
      data-open={
        open
          ? "true"
          : "false"
      }
      onKeyDown={
        handleRootKeyDown
      }
      onBlur={
        handleFocusOut
      }
    >
      <button
        ref={triggerRef}
        type="button"
        className={
          styles.menuTrigger
        }
        data-open={
          open
            ? "true"
            : "false"
        }
        aria-expanded={
          open
        }
        aria-controls={
          open
            ? menuId
            : undefined
        }
        aria-haspopup="true"
        onClick={() =>
          setOpen(
            (value) =>
              !value
          )
        }
      >
        <span
          className={
            styles.menuGlyph
          }
          aria-hidden="true"
        >
          <span />

          <span />
        </span>

        <span
          className={
            styles.menuTriggerLabel
          }
        >
          Menu
        </span>
      </button>

      {/*
       * Focus scrim (v3.6 mobile): the open panel is a surface, not
       * a stencil — the page behind dims instead of competing with
       * the entries. Purely decorative + click-through is already
       * handled by the outside-pointerdown dismissal, so the scrim
       * itself stays aria-hidden and pointer-transparent.
       */}
      {open && (
        <div
          className={
            styles.menuScrim
          }
          aria-hidden="true"
        />
      )}

      {open && (
        <div
          ref={panelRef}
          id={menuId}
          className={
            styles.menuPanel
          }
        >
          <nav
            className={
              styles.menuPanelNav
            }
            aria-label={
              label
            }
          >
            <ul
              className={
                styles.menuList
              }
            >
              {entries.map(
                (
                  entry,
                  index
                ) => {
                  /*
                   * One quiet divider per group boundary: primary →
                   * world → utility. The primary block always leads.
                   */
                  const previousGroup =
                    index > 0
                      ? entries[
                          index -
                            1
                        ]
                          .group
                      : null;

                  const divider =
                    previousGroup !==
                      null &&
                    previousGroup !==
                      entry.group;

                  const entryBody =
                    (
                      <>
                        <span
                          className={
                            styles.menuEntryLabel
                          }
                        >
                          {
                            entry.shortLabel
                          }
                        </span>

                        <span
                          className={
                            styles.menuEntryDot
                          }
                          aria-hidden="true"
                        />
                      </>
                    );

                  /*
                   * WARM ON INTENT (v3.5) — the disclosure panel warms
                   * exactly like the desktop track: pointerenter for
                   * hover-capable pointers, focus for keyboard users,
                   * pointerdown for touch. Scene actions preload their
                   * module; internal links prefetch their route. One
                   * deduplicated contract, no hover requirement.
                   */
                  const warm = () => {
                    onWarm?.(entry);
                  };

                  return (
                    <Fragment
                      key={
                        entry.id
                      }
                    >
                      {divider && (
                        <li
                          className={
                            styles.menuDivider
                          }
                          role="presentation"
                        />
                      )}

                      <li
                        className={
                          styles.menuItem
                        }
                      >
                        {entry.kind ===
                        "action" ? (
                          <button
                            type="button"
                            className={
                              styles.menuEntry
                            }
                            data-id={
                              entry.id
                            }
                            data-group={
                              entry.group
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
                            onPointerEnter={
                              warm
                            }
                            onPointerDown={
                              warm
                            }
                            onFocus={
                              warm
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
                              styles.menuEntry
                            }
                            data-id={
                              entry.id
                            }
                            data-group={
                              entry.group
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
                            onClick={
                              close
                            }
                          >
                            {
                              entryBody
                            }

                            <span
                              className={
                                styles.menuEntryArrow
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
                              styles.menuEntry
                            }
                            data-id={
                              entry.id
                            }
                            data-group={
                              entry.group
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
                            prefetch={
                              false
                            }
                            onPointerEnter={
                              warm
                            }
                            onPointerDown={
                              warm
                            }
                            onFocus={
                              warm
                            }
                            onClick={
                              close
                            }
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
