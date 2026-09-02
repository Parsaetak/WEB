"use client";

import RedEye from "@/components/RedEye";
import styles from "@/components/SceneLoadingScreen.module.css";

type SceneLoadingScreenProps = {
  visible?: boolean;
};

export default function SceneLoadingScreen({
  visible = true
}: SceneLoadingScreenProps) {
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
      role="status"
      aria-live="polite"
      aria-label="Loading"
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
            INITIALIZING
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
            LIVE WORLD
          </span>

          <span>
            SYNC
          </span>
        </div>
      </div>
    </div>
  );
}
