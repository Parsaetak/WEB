"use client";

import type {
  SceneId
} from "@/components/LivingShell";

import {
  preloadScene
} from "@/components/ScenePreloader";

import styles from "@/components/SceneNavigator.module.css";

export type SceneNavigationItem = {
  id: SceneId;
  label: string;
  shortLabel: string;
};

type SceneNavigatorProps = {
  scenes: readonly SceneNavigationItem[];
  activeScene: SceneId;
  onSceneChange: (
    scene: SceneId
  ) => void;
};

export default function SceneNavigator({
  scenes,
  activeScene,
  onSceneChange
}: SceneNavigatorProps) {
  return (
    <nav
      className={
        styles.sceneNavigator
      }
      aria-label="Site scenes"
    >
      <div
        className={
          styles.track
        }
      >
        {scenes.map(
          (
            scene,
            index
          ) => {
            const active =
              scene.id ===
              activeScene;

            const warmScene =
              () => {
                if (!active) {
                  void preloadScene(
                    scene.id
                  );
                }
              };

            return (
              <button
                key={
                  scene.id
                }
                type="button"
                className={
                  styles.item
                }
                data-active={
                  active
                    ? "true"
                    : "false"
                }
                data-scene={
                  scene.id
                }
                aria-current={
                  active
                    ? "page"
                    : undefined
                }
                aria-label={`Open ${scene.label}`}
                onPointerEnter={
                  warmScene
                }
                onFocus={
                  warmScene
                }
                onClick={() =>
                  onSceneChange(
                    scene.id
                  )
                }
              >
                <span
                  className={
                    styles.index
                  }
                  aria-hidden="true"
                >
                  {String(
                    index + 1
                  ).padStart(
                    2,
                    "0"
                  )}
                </span>

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
                      scene.shortLabel
                    }
                  </span>
                </span>

                <span
                  className={
                    styles.indicator
                  }
                  aria-hidden="true"
                />
              </button>
            );
          }
        )}
      </div>
    </nav>
  );
}
