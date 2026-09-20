"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import { usePathname } from "next/navigation";

import SceneLoadingScreen from "@/components/SceneLoadingScreen";

import {
  ROUTE_OVERLAY_DELAY_MS,
  ROUTE_TRANSITION_CAP_MS
} from "@/lib/loadPhase";

import {
  normalizeRoutePath,
  resolveNavigationDestination,
  routeLabel
} from "@/lib/routeIntent";

/*
 * GLOBAL ROUTE TRANSITION (v4.0.4) — the ONE unified loading
 * experience for real route/tab navigation, mounted exactly once
 * from the ROOT layout so it survives every App Router navigation
 * (the same law as the global Music Player host).
 *
 * Experience contract:
 *
 *   CLICK (explicit internal navigation intent)
 *     → intent captured (capture-phase click listener, passive)
 *     → GRACE PERIOD (ROUTE_OVERLAY_DELAY_MS): fast/warmed/cached
 *       navigations commit inside it and never flash a loader
 *     → the overlay appears (once crossed, it stays until the
 *       destination is actually ready — never a timed exit)
 *     → route ready (usePathname reports the destination)
 *     → the destination paints (double rAF), then the overlay exits
 *     → destination settles in
 *
 * Honesty contract: the surface is display-only — pointer-events
 * none in every state (navigation is NEVER blocked or delayed),
 * indeterminate signal motion only (the 13-point star + orbiting
 * arc of the scene loader, variant="route"), no fake percentage,
 * no minimum duration. Hash-scene transitions keep their own state
 * machine (SceneViewport) — same-path clicks resolve to null here,
 * so the two systems share a visual language but never compete.
 *
 * Race contract: every intent carries a monotonic token; timers and
 * dismissal callbacks act only while their token is the LATEST one,
 * so rapid repeated clicks keep the overlay continuous under the
 * newest navigation and a stale navigation can never dismiss (or
 * re-show) the latest state. ROUTE_TRANSITION_CAP_MS is a safety
 * valve that clears a silently-died navigation's overlay.
 *
 * Exclusions (enforced with lib/routeIntent.ts + DOM guards):
 * external links, downloads, mailto/tel, modifier-click new-tab
 * behavior, target="_blank", same-route clicks, and hash-scene
 * navigation. Browser back/forward is deliberately not intercepted
 * — detecting it without fragile history hacks is not worth it, and
 * a committed popstate simply dismisses any pending overlay through
 * the pathname effect.
 *
 * Accessibility contract: the overlay reuses SceneLoadingScreen —
 * role="status", aria-live="polite", a meaningful label, and
 * aria-hidden="true" whenever inactive. There is no focus trap and
 * no scroll locking. Reduced motion collapses the arc to a static
 * ring (SceneLoadingScreen.module.css). Without JavaScript the
 * overlay ships inert (data-visible="false" under the html.reveal-js
 * gate) — never permanent exported blocking content.
 */

/*
 * The deployment basePath, inlined at build time (mirrors
 * next.config.ts and app/layout.tsx) — used to compare clicked
 * hrefs against usePathname(), which is basePath-free.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type PendingTransition = {
  /** Monotonic intent token — the latest intent always wins. */
  token: number;

  /** Normalized, basePath-free destination route path. */
  destination: string;

  /** The normalized path the transition started from. */
  startedFrom: string;
};

export default function GlobalRouteTransition() {
  const pathname = usePathname();

  const [visible, setVisible] =
    useState(false);

  const [label, setLabel] =
    useState("");

  /*
   * The 13-point star image mounts only after the first REAL
   * overlay engagement: the root layout renders on every route, and
   * an eagerly-rendered <img> inside an opacity-0 overlay would
   * still fetch on every page load — a speculative request before
   * any intent, exactly what the loading laws forbid. Flipping it
   * on at first visibility makes the fetch part of a genuine
   * navigation, and the browser caches it afterwards.
   */
  const [engaged, setEngaged] =
    useState(false);

  const pendingRef =
    useRef<PendingTransition | null>(
      null
    );

  const tokenRef = useRef(0);

  /*
   * The click listener closes over the LATEST pathname (usePathname
   * in render scope would freeze it at mount time — the listener is
   * registered once).
   */
  const pathnameRef = useRef(pathname);

  const graceTimerRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const capTimerRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const clearTimers = useCallback(() => {
    if (
      graceTimerRef.current !==
      null
    ) {
      clearTimeout(
        graceTimerRef.current
      );

      graceTimerRef.current = null;
    }

    if (
      capTimerRef.current !== null
    ) {
      clearTimeout(
        capTimerRef.current
      );

      capTimerRef.current = null;
    }
  }, []);

  const finishTransition =
    useCallback(() => {
      clearTimers();

      pendingRef.current = null;

      setVisible(false);
    }, [clearTimers]);

  /*
   * Dismissal lets the destination PAINT before the overlay starts
   * fading (double rAF), so the exit reads as "destination settles
   * in" instead of a flash. Guarded by the intent token: a newer
   * intent that arrived inside the two frames owns the overlay and
   * cannot be dismissed by the stale callback.
   */
  const scheduleDismissal = useCallback(
    (token: number) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (
            pendingRef.current?.token !==
            token
          ) {
            return;
          }

          finishTransition();
        });
      });
    },
    [finishTransition]
  );

  /*
   * ROUTE READINESS — the pathname commits when the destination
   * route has rendered. Matching the pending destination dismisses
   * the overlay; a commit to ANY other path (back/forward during a
   * pending transition, router fallback) also ends it — a committed
   * route means the transition is over, and a newer intent re-arms
   * everything.
   */
  useEffect(() => {
    const pending =
      pendingRef.current;

    if (!pending) {
      return;
    }

    const current =
      normalizeRoutePath(
        pathname ?? "/"
      );

    if (current === pending.startedFrom) {
      return;
    }

    scheduleDismissal(
      pending.token
    );
  }, [pathname, scheduleDismissal]);

  useEffect(() => {
    const handleClick = (
      event: MouseEvent
    ) => {
      /*
       * Navigation intent guards (DOM-level): a default-prevented
       * click, a non-primary button, any modifier key (new-tab
       * behavior belongs to the visitor), or a plain-element target
       * is not a route navigation this host tracks.
       */
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target =
        event.target instanceof
        Element
          ? event.target
          : null;

      const anchor =
        target?.closest(
          "a[href]"
        ) ?? null;

      if (
        !(
          anchor instanceof
          HTMLAnchorElement
        )
      ) {
        return;
      }

      /* Explicit new-tab / download intent never tracks. */
      if (
        anchor.target &&
        anchor.target !== "_self"
      ) {
        return;
      }

      if (
        anchor.hasAttribute(
          "download"
        )
      ) {
        return;
      }

      const destination =
        resolveNavigationDestination(
          {
            href:
              anchor.getAttribute(
                "href"
              ),
            currentPathname:
              pathnameRef.current ??
              "/",
            basePath: BASE_PATH,
            origin:
              window.location.origin
          }
        );

      if (!destination) {
        return;
      }

      /*
       * LATEST NAVIGATION WINS: bump the token, supersede any
       * pending transition, restart the grace period. An already
       * visible overlay simply stays visible — no flicker between
       * rapid clicks.
       */
      const token =
        ++tokenRef.current;

      pendingRef.current = {
        token,
        destination,
        startedFrom:
          normalizeRoutePath(
            pathnameRef.current ??
              "/"
          )
      };

      setLabel(
        routeLabel(
          destination
        )
      );

      clearTimers();

      graceTimerRef.current =
        setTimeout(() => {
          if (
            pendingRef.current?.token !==
            token
          ) {
            return;
          }

          setEngaged(true);

          setVisible(true);
        }, ROUTE_OVERLAY_DELAY_MS);

      /*
       * Safety cap (not a duration): a navigation that silently
       * dies must not leave a zombie overlay. A committed route
       * dismisses long before this through the pathname effect.
       */
      capTimerRef.current =
        setTimeout(() => {
          if (
            pendingRef.current?.token !==
            token
          ) {
            return;
          }

          finishTransition();
        }, ROUTE_TRANSITION_CAP_MS);

      /*
       * The navigation itself is NEVER blocked: no
       * preventDefault, no custom routing — the router proceeds
       * exactly as it would have.
       */
    };

    document.addEventListener(
      "click",
      handleClick,
      { capture: true, passive: true }
    );

    return () => {
      document.removeEventListener(
        "click",
        handleClick,
        { capture: true }
      );
    };
  }, [
    clearTimers,
    finishTransition
  ]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return (
    <SceneLoadingScreen
      visible={visible}
      phase="LOADING"
      variant="route"
      renderMark={engaged}
      label={
        visible && label
          ? `→ /${label === "HOME" ? "" : label}/`
          : ""
      }
      ariaLabel={
        visible && label
          ? `Loading — routing to ${label.toLowerCase()}`
          : undefined
      }
    />
  );
}
