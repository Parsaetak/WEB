"use client";

import { BRAND_STAR } from "@/lib/brand";

import type {
  LoadPhase
} from "@/lib/loadPhase";

import styles from "@/components/SceneLoadingScreen.module.css";

/*
 * Shared loading surface.
 *
 * Honest state contract:
 * - the title is one of the five load phases from lib/loadPhase.ts
 * - the progress treatment is indeterminate — it never claims a
 *   percentage that does not correspond to a measurable process
 * - `boot` variant: full-screen gate used once while the application
 *   becomes interactive
 * - `scene` variant (v3.5): the transfer surface of the layered
 *   transition — intent (tab hover identity) → transfer (this
 *   surface: 13-point star with a subtle orbiting signal arc)
 *   → ready (the keyed settle-in). It fades in only after
 *   SCENE_OVERLAY_DELAY_MS, so warmed/cached scene transitions never
 *   flash it, it never blocks pointer interaction, and the
 *   indeterminate signal motion stays honest — no fake percentage.
 * - `route` variant (v4.0.4): the transfer surface of REAL
 *   route/tab navigation, mounted once from the root layout by
 *   GlobalRouteTransition. Same star + orbiting signal language at a
 *   smaller scale, never blocks pointer interaction, never appears
 *   for fast navigations (the host applies its own grace period),
 *   and it is inert (data-visible="false") in the static export.
 */

type SceneLoadingScreenProps = {
  visible?: boolean;
  phase?: LoadPhase;
  label?: string;
  variant?: "boot" | "scene" | "route";
  /**
   * Optional aria-label override. The default derives from the load
   * phase ("Loading — loading"); the route variant announces the
   * destination instead ("Loading — routing to /about/") through this
   * prop (v4.0.4).
   */
  ariaLabel?: string;
  /**
   * Render the 13-point star image (default true). The route host
   * mounts this surface from the ROOT layout on every route: an
   * eagerly-rendered <img> inside an always-present opacity-0 overlay
   * would fetch the star on every page load — a speculative request
   * before any intent. The host flips this on at the first real
   * overlay engagement, making the fetch part of a genuine navigation
   * (the browser caches it afterwards).
   */
  renderMark?: boolean;
};

export default function SceneLoadingScreen({
  visible = true,
  phase = "INITIALIZING",
  label,
  variant = "boot",
  ariaLabel,
  renderMark = true
}: SceneLoadingScreenProps) {
  const isError =
    phase === "ERROR";

  return (
    <div
      className={
        styles.sceneLoadingScreen
      }
      data-visible={
        visible
          ? "true"
          : "false"
      }
      data-variant={
        variant
      }
      data-phase={
        phase
      }
      role="status"
      aria-live="polite"
      aria-label={
        ariaLabel ??
        (isError
          ? "Loading error"
          : `Loading — ${phase.toLowerCase()}`)
      }
      aria-hidden={
        visible
          ? "false"
          : "true"
      }
    >
      <div
        className={
          styles.backdrop
        }
        aria-hidden="true"
      />

      <div
        className={
          styles.inner
        }
      >
        <div
          className={
            styles.mark
          }
          data-error={
            isError
              ? "true"
              : "false"
          }
          aria-hidden="true"
        >
          {/*
           * The 13-point star — the site identity, shown while the
           * world becomes interactive. Static asset, aria-hidden:
           * the surface itself already announces state through its
           * role="status" label, so the mark is decorative.
           * renderMark=false ships the empty ring box only (the
           * route host opts in at first engagement).
           */}
          {renderMark && (
            <img
              src={BRAND_STAR.redHot}
              alt=""
              width={56}
              height={56}
              loading="eager"
              decoding="async"
            />
          )}
        </div>

        <div
          className={
            styles.label
          }
        >
          <span
            className={
              styles.kicker
            }
          >
            RED SYSTEM
          </span>

          <span
            className={
              styles.title
            }
          >
            {phase}
          </span>
        </div>

        <div
          className={
            styles.progress
          }
          aria-hidden="true"
        >
          <span />
        </div>

        <div
          className={
            styles.meta
          }
        >
          <span>
            {label ?? "LIVE WORLD"}
          </span>

          <span>
            {
              isError
                ? "RELOAD TO RETRY"
                : "SYNC"
            }
          </span>
        </div>
      </div>
    </div>
  );
}
