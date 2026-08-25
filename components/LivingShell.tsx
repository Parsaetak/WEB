"use client";

import {
  type ReactNode,
  useCallback,
  useState
} from "react";

import SceneNavigator, {
  type SceneNavigationItem
} from "@/components/SceneNavigator";

import WorldBackground from "@/components/WorldBackground";

export type SceneId =
  | "home"
  | "about"
  | "systems"
  | "magic"
  | "work";

export const SCENES:
  readonly SceneNavigationItem[] =
  [
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

  const activeSceneDefinition =
    SCENES.find(
      (scene) =>
        scene.id === activeScene
    );

  return (
    <div
      className="living-shell"
      data-active-scene={
        activeScene
      }
    >
      <WorldBackground />

      <header className="living-shell-hud">
        <div className="living-shell-hud-inner">
          <div
            className="living-shell-status"
            aria-live="polite"
          >
            <span
              className="living-shell-status-dot"
              aria-hidden="true"
            />

            <span>
              {activeSceneDefinition?.label ??
                "Home"}
            </span>
          </div>

          <SceneNavigator
            scenes={SCENES}
            activeScene={activeScene}
            onSceneChange={
              changeScene
            }
          />
        </div>
      </header>

      <main
        className="living-shell-viewport"
        data-active-scene={
          activeScene
        }
      >
        {children}
      </main>
    </div>
  );
}
