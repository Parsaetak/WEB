"use client";

import {
  useCallback,
  useEffect,
  useState
} from "react";

import RedEye from "@/components/RedEye";
import SceneLoadingScreen from "@/components/SceneLoadingScreen";
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

export type SceneChangeSource =
  | "navigation"
  | "history";

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

function readInitialScene(): SceneId {
  if (
    typeof window ===
    "undefined"
  ) {
    return "home";
  }

  const hash =
    window.location.hash
      .replace(
        /^#/,
        ""
      )
      .toLowerCase();

  return SCENES.some(
    (scene) =>
      scene.id === hash
  )
    ? (hash as SceneId)
    : "home";
}

function normalizeInitialHash(
  scene: SceneId
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const targetHash =
    scene === "home"
      ? ""
      : `#${scene}`;

  if (
    window.location.hash ===
    targetHash
  ) {
    return;
  }

  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${window.location.search}${targetHash}`
  );
}

export default function LivingShell({
  initialScene = "home"
}: LivingShellProps) {
  const [
    activeScene,
    setActiveScene
  ] = useState<SceneId>(
    initialScene
  );

  const [
    urlReady,
    setUrlReady
  ] = useState(false);

  useEffect(() => {
    const initialUrlScene =
      readInitialScene();

    normalizeInitialHash(
      initialUrlScene
    );

    setActiveScene(
      initialUrlScene
    );

    setUrlReady(
      true
    );
  }, []);

  const changeScene = useCallback(
    (
      scene: SceneId,
      source: SceneChangeSource =
        "navigation"
    ) => {
      if (
        scene === activeScene
      ) {
        return;
      }

      if (
        source ===
        "navigation"
      ) {
        const hash =
          scene ===
          "home"
            ? ""
            : `#${scene}`;

        window.history.pushState(
          null,
          "",
          `${window.location.pathname}${window.location.search}${hash}`
        );
      }

      setActiveScene(
        scene
      );
    },
    [activeScene]
  );

  const activeSceneDefinition =
    SCENES.find(
      (scene) =>
        scene.id ===
        activeScene
    );

  const github =
    PUBLIC_LINKS.social.find(
      (link) =>
        link.id ===
        "github"
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
          (scene) =>
            changeScene(
              scene,
              "history"
            )
        }
      />

      {urlReady && (
        <ScenePreloader
          scene={activeScene}
        />
      )}

      <header className="living-shell-hud">
        <div className="living-shell-hud-inner">
          <a
            className="living-shell-brand"
            href="#top"
            aria-label="Parsa Tak home"
            onClick={(
              event
            ) => {
              event.preventDefault();

              changeScene(
                "home"
              );
            }}
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
              {
                activeSceneDefinition?.label ??
                "Home"
              }
            </span>
          </div>

          <SceneNavigator
            scenes={SCENES}
            activeScene={
              activeScene
            }
            onSceneChange={
              (
                scene
              ) =>
                changeScene(
                  scene,
                  "navigation"
                )
            }
          />

          {github && (
            <a
              className="living-shell-github"
              href={
                github.href
              }
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
  >
  {urlReady && (
    <SceneRegistry
      scene={activeScene}
    />
  )}
</main>

<footer className="living-shell-legal">
  <div className="living-shell-legal-inner">
    <div className="living-shell-legal-primary">
      <strong>
        © 2026 Parsa Tak. All rights reserved.
      </strong>

      <span>
        Parsa Tak™
      </span>
    </div>

    <p>
      Original website design, visual identity,
      writing, artwork, and other original creative
      materials presented on this website are the
      work of Parsa Tak and may not be reproduced,
      redistributed, modified, or commercially
      exploited without prior written permission,
      except where a specific material states otherwise.
    </p>

    <div className="living-shell-legal-links">
      <a
        href="https://github.com/Parsaetak/WEB/blob/main/LICENSE.md"
        target="_blank"
        rel="noreferrer"
      >
        LICENSE
      </a>

      <a
        href="https://github.com/Parsaetak/WEB/blob/main/TRADEMARKS.md"
        target="_blank"
        rel="noreferrer"
      >
        TRADEMARKS
      </a>
    </div>
  </div>
</footer>

<SceneLoadingScreen
  visible={!urlReady}
/>
    </div>
  );
}
