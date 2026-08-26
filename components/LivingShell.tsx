"use client";

import {
  useCallback,
  useMemo,
  useState
} from "react";

import RedEye from "@/components/RedEye";
import SceneNavigator, {
  type SceneNavigationItem
} from "@/components/SceneNavigator";
import ScenePreloader from "@/components/ScenePreloader";
import SceneRegistry from "@/components/SceneRegistry";
import SceneUrlSync from "@/components/SceneUrlSync";
import WorldBackground from "@/components/WorldBackground";
import { PUBLIC_LINKS } from "@/lib/links";

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
  initialScene?: SceneId;
};

export default function LivingShell({
  initialScene = "home"
}: LivingShellProps) {
  const [activeScene, setActiveScene] =
    useState<SceneId>(
      initialScene
    );

  const changeScene = useCallback(
    (scene: SceneId) => {
      if (
        scene === activeScene
      ) {
        return;
      }

      const hash =
        scene === "home"
          ? ""
          : `#${scene}`;

      window.history.pushState(
        null,
        "",
        `${window.location.pathname}${window.location.search}${hash}`
      );

      setActiveScene(scene);
    },
    [activeScene]
  );

  const activeSceneDefinition =
    SCENES.find(
      (scene) =>
        scene.id === activeScene
    );

  const nextScene =
    useMemo(() => {
      const index =
        SCENES.findIndex(
          (scene) =>
            scene.id === activeScene
        );

      if (index < 0) {
        return "about" as SceneId;
      }

      return (
        SCENES[
          (index + 1) %
            SCENES.length
        ]?.id ??
        "home"
      );
    }, [activeScene]);

  const github =
    PUBLIC_LINKS.social.find(
      (link) =>
        link.id === "github"
    );

  return (
    <div
      className="living-shell"
      data-active-scene={
        activeScene
      }
    >
      <WorldBackground />

      <SceneUrlSync
        scene={activeScene}
        onSceneChange={
          changeScene
        }
      />

      <ScenePreloader
        scene={nextScene}
      />

      <header className="living-shell-hud">
        <div className="living-shell-hud-inner">
          <a
            className="living-shell-brand"
            href="#top"
            aria-label="Parsa Tak home"
            onClick={() =>
              changeScene("home")
            }
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

          {github && (
            <a
              className="living-shell-github"
              href={github.href}
              target="_blank"
              rel="noreferrer"
            >
              GitHub ↗
            </a>
          )}
        </div>
      </header>

      <main
        id="top"
        className="living-shell-viewport"
        data-active-scene={
          activeScene
        }
      >
        <SceneRegistry
          scene={activeScene}
        />
      </main>
    </div>
  );
}
