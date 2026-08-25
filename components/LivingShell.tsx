"use client";

import {
  type ReactNode,
  useCallback,
  useState
} from "react";

import RedEye from "@/components/RedEye";
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
          <a
            className="living-shell-brand"
            href="#top"
            aria-label="Parsa Tak home"
          >
            <span className="living-shell-brand-eye">
              <RedEye size={36} />
            </span>

            <span className="living-shell-brand-name">
              Parsa Tak
            </span>
          </a>

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

          <a
            className="living-shell-github"
            href="https://github.com/Parsaetak"
            target="_blank"
            rel="noreferrer"
          >
            GitHub ↗
          </a>
        </div>
      </header>

      <main
        id="top"
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
