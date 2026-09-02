"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import styles from "@/components/LivingShell.module.css";

import FooterLinks from "@/components/FooterLinks";
import RedEye from "@/components/RedEye";
import SceneLoadingScreen from "@/components/SceneLoadingScreen";
import SceneNavigator, {
  type SceneNavigationItem
} from "@/components/SceneNavigator";
import ScenePreloader from "@/components/ScenePreloader";
import SceneRegistry from "@/components/SceneRegistry";
import SceneUrlSync from "@/components/SceneUrlSync";
import WorldBackground from "@/components/WorldBackground";
import RedCursor from "@/components/RedCursor";
import { GITHUB_LINK } from "@/lib/links";

export type SceneId =
  | "home"
  | "about"
  | "systems"
  | "magic"
  | "work"
  | "library";

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
    },
    {
      id: "library",
      label: "Library",
      shortLabel: "LIBRARY"
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

  /*
   * Mirror of activeScene kept next to the setter so changeScene can
   * stay referentially stable. SceneUrlSync's URL listeners then stop
   * resubscribing on every scene change.
   */
  const activeSceneRef =
    useRef<SceneId>(initialScene);

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

    activeSceneRef.current =
      initialUrlScene;

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
        scene ===
        activeSceneRef.current
      ) {
        return;
      }

      activeSceneRef.current =
        scene;

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
    []
  );

  const changeSceneFromHistory =
    useCallback(
      (
        scene: SceneId
      ) => {
        changeScene(
          scene,
          "history"
        );
      },
      [changeScene]
    );

  const activeSceneDefinition =
    SCENES.find(
      (scene) =>
        scene.id ===
        activeScene
    );

  const github = GITHUB_LINK;

  return (
    <div
      className={
        styles.livingShell
      }
      data-active-scene={
        activeScene
      }
    >
      <WorldBackground />

      <RedCursor />

      <SceneUrlSync
        scene={
          activeScene
        }
        onSceneChange={
          changeSceneFromHistory
        }
      />

      {urlReady && (
        <ScenePreloader
          scene={
            activeScene
          }
        />
      )}

      <header
        className={
          styles.livingShellHud
        }
      >
        <div
          className={
            styles.livingShellHudInner
          }
        >
          <a
            className={
              styles.livingShellBrand
            }
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
            <span
              className={
                styles.livingShellBrandEye
              }
            >
              <RedEye
                size={36}
              />
            </span>

            <span
              className={
                styles.livingShellBrandName
              }
            >
              Parsa Tak
            </span>
          </a>

          <div
            className={
              styles.livingShellStatus
            }
            aria-live="polite"
          >
            <span
              className={
                styles.livingShellStatusDot
              }
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
            scenes={
              SCENES
            }
            activeScene={
              activeScene
            }
            onSceneChange={
              changeScene
            }
          />

          {github && (
            <a
              className={
                styles.livingShellGithub
              }
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
        className={
          styles.livingShellViewport
        }
        data-active-scene={
          activeScene
        }
      >
        {urlReady && (
          <SceneRegistry
            scene={
              activeScene
            }
          />
        )}
      </main>

      <footer
        className={
          styles.livingShellLegal
        }
      >
        <div
          className={
            styles.livingShellLegalInner
          }
        >
          <div
            className={
              styles.livingShellFooterMain
            }
          >
            <div
              className={
                styles.livingShellLegalPrimary
              }
            >
              <strong>
                © 2026 Parsa Tak. All rights reserved.
              </strong>

              <span>
                Parsa Tak™
              </span>
            </div>

            <FooterLinks />
          </div>

          <div
            className={
              styles.livingShellLegalBottom
            }
          >
            <p>
              Original website design, visual identity,
              writing, artwork, and other original creative
              materials presented on this website are the
              work of Parsa Tak and may not be reproduced,
              redistributed, modified, or commercially
              exploited without prior written permission,
              except where a specific material states otherwise.
            </p>

            <div
              className={
                styles.livingShellLegalLinks
              }
            >
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
        </div>
      </footer>

      <SceneLoadingScreen
        visible={
          !urlReady
        }
      />
    </div>
  );
}
