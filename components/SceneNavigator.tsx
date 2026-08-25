"use client";

import type {
  SceneId
} from "@/components/LivingShell";

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
      className="scene-navigator"
      aria-label="Living system scenes"
    >
      <div className="scene-navigator-track">
        {scenes.map(
          (scene, index) => {
            const active =
              scene.id ===
              activeScene;

            return (
              <button
                key={scene.id}
                type="button"
                className="scene-navigator-item"
                data-active={
                  active
                    ? "true"
                    : "false"
                }
                aria-current={
                  active
                    ? "page"
                    : undefined
                }
                aria-label={`Open ${scene.label} scene`}
                onClick={() =>
                  onSceneChange(
                    scene.id
                  )
                }
              >
                <span
                  className="scene-navigator-index"
                  aria-hidden="true"
                >
                  {String(
                    index + 1
                  ).padStart(
                    2,
                    "0"
                  )}
                </span>

                <span className="scene-navigator-label">
                  {scene.shortLabel}
                </span>

                <span
                  className="scene-navigator-indicator"
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
