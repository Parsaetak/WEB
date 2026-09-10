"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import Link from "next/link";
import {
  useRouter
} from "next/navigation";

import styles from "@/components/LivingShell.module.css";

import RedEye from "@/components/RedEye";
import SceneLoadingScreen from "@/components/SceneLoadingScreen";
import SceneNavigator, {
  type SceneNavigationItem
} from "@/components/SceneNavigator";
import ScenePreloader from "@/components/ScenePreloader";
import SceneRegistry from "@/components/SceneRegistry";
import SceneUrlSync from "@/components/SceneUrlSync";
import SiteFooter from "@/components/SiteFooter";
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

  /*
   * BLOG is a real route, not a scene. The link stays inert until
   * pointer or focus intent, and only then prefetches the blog
   * payload — aggressive auto-prefetch of route targets is
   * deliberately avoided.
   */
  const router =
    useRouter();

  const warmBlogRoute =
    useCallback(
      () => {
        router.prefetch(
          "/blog/"
        );
      },
      [router]
    );

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

          <div
            className={
              styles.livingShellHudActions
            }
          >
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

            <Link
              className={
                styles.livingShellBlog
              }
              href="/blog/"
              prefetch={
                false
              }
              onPointerEnter={
                warmBlogRoute
              }
              onFocus={
                warmBlogRoute
              }
            >
              Blog ↗
            </Link>
          </div>
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

      <SiteFooter />

      <SceneLoadingScreen
        visible={
          !urlReady
        }
        phase="INITIALIZING"
        label="LIVE WORLD"
      />
    </div>
  );
}
