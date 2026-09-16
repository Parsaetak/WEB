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
 */

type SceneLoadingScreenProps = {
  visible?: boolean;
  phase?: LoadPhase;
  label?: string;
  variant?: "boot" | "scene";
};

export default function SceneLoadingScreen({
  visible = true,
  phase = "INITIALIZING",
  label,
  variant = "boot"
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
        isError
          ? "Loading error"
          : `Loading — ${phase.toLowerCase()}`
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
           */}
          <img
            src={BRAND_STAR.redHot}
            alt=""
            width={56}
            height={56}
            loading="eager"
            decoding="async"
          />
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
