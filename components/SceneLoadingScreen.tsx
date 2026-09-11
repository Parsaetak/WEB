"use client";

import RedEye from "@/components/RedEye";

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
 * - `scene` variant: overlay inside the scene viewport. It fades in
 *   only after SCENE_OVERLAY_DELAY_MS, so preloaded (cached) scene
 *   chunks — which transition inside the minimum window — never flash
 *   a loader, and it never blocks pointer interaction
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
            styles.eye
          }
          data-error={
            isError
              ? "true"
              : "false"
          }
          aria-hidden="true"
        >
          <RedEye
            size={56}
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
