"use client";

import type {
  SceneId
} from "@/components/LivingShell";

import {
  preloadScene
} from "@/components/ScenePreloader";

export type SceneNavigationItem = {
  id: SceneId;
  label: string;
  shortLabel: string;
  identity: string;
  symbol: string;
};

type SceneNavigatorProps = {
  scenes: readonly SceneNavigationItem[];
  activeScene: SceneId;
  onSceneChange: (
    scene: SceneId
  ) => void;
};

const SCENE_IDENTITIES: Record<
  SceneId,
  {
    identity: string;
    symbol: string;
  }
> = {
  home: {
    identity: "ORIGIN",
    symbol: "◉"
  },

  about: {
    identity: "OBSERVER",
    symbol: "◌"
  },

  systems: {
    identity: "ARCHITECT",
    symbol: "◇"
  },

  magic: {
    identity: "ORGANISM",
    symbol: "✦"
  },

  work: {
    identity: "LABORATORY",
    symbol: "▣"
  }
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

            const metadata =
              SCENE_IDENTITIES[
                scene.id
              ];

            const warmScene =
              () => {
                if (
                  !active
                ) {
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
                className="scene-navigator-item"
                data-active={
                  active
                    ? "true"
                    : "false"
                }
                data-scene={
                  scene.id
                }
                data-identity={
                  metadata.identity
                }
                aria-current={
                  active
                    ? "page"
                    : undefined
                }
                aria-label={`Open ${scene.label} — ${metadata.identity} scene`}
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

                <span
                  className="scene-navigator-symbol"
                  aria-hidden="true"
                >
                  {metadata.symbol}
                </span>

                <span className="scene-navigator-copy">
                  <span className="scene-navigator-label">
                    {
                      scene.shortLabel
                    }
                  </span>

                  <span className="scene-navigator-identity">
                    {
                      metadata.identity
                    }
                  </span>
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
