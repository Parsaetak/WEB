"use client";

import {
  type ReactNode,
  useCallback,
  useState
} from "react";

import WorldBackground from "@/components/WorldBackground";

export type SceneId =
  | "home"
  | "about"
  | "systems"
  | "magic"
  | "work";

type SceneDefinition = {
  id: SceneId;
  label: string;
  shortLabel: string;
};

const SCENES: SceneDefinition[] = [
  {
    id: "home",
    label: "Home",
    shortLabel: "HOME"
  },
  {
    id: "about",
    label: "About",
    shortLabel: "ABOUT"
  },
  {
    id: "systems",
    label: "Systems",
    shortLabel: "SYSTEMS"
  },
  {
    id: "magic",
    label: "RED Magic",
    shortLabel: "MAGIC"
  },
  {
    id: "work",
    label: "Work",
    shortLabel: "WORK"
  }
];

type LivingShellProps = {
  children?: ReactNode;
  initialScene?: SceneId;
};

export default function LivingShell({
  children,
  initialScene = "home"
}: LivingShellProps) {
  const [activeScene, setActiveScene] =
    useState<SceneId>(
      initialScene
    );

  const changeScene = useCallback(
    (scene: SceneId) => {
      setActiveScene(scene);
    },
    []
  );

  return (
    <div
      className="living-shell"
      data-active-scene={activeScene}
    >
      <WorldBackground />

      <div
        className="living-shell-hud"
        aria-label="Site navigation"
      >
        <div className="living-shell-hud-inner">
          <div
            className="living-shell-status"
            aria-live="polite"
          >
            <span className="living-shell-status-dot" />

            <span>
              {SCENES.find(
                (scene) =>
                  scene.id ===
                  activeScene
              )?.label ?? "Home"}
            </span>
          </div>

          <nav
            className="living-shell-nav"
            aria-label="Scenes"
          >
            {SCENES.map(
              (scene) => {
                const active =
                  scene.id ===
                  activeScene;

                return (
                  <button
                    key={scene.id}
                    type="button"
                    className="living-shell-nav-item"
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
                      changeScene(
                        scene.id
                      )
                    }
                  >
                    <span className="living-shell-nav-index">
                      {String(
                        SCENES.indexOf(
                          scene
                        ) + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <span className="living-shell-nav-label">
                      {scene.shortLabel}
                    </span>
                  </button>
                );
              }
            )}
          </nav>
        </div>
      </div>

      <div
        className="living-shell-viewport"
        data-active-scene={
          activeScene
        }
      >
        {children}
      </div>
    </div>
  );
}
