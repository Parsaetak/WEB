"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import Link from "next/link";
import {
  useRouter
} from "next/navigation";

import styles from "@/components/LivingShell.module.css";

import CompactMenu, {
  type CompactMenuEntry
} from "@/components/CompactMenu";
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
import MotionReveal from "@/components/MotionReveal";
import {
  pulseWorld,
  setWorldScene
} from "@/lib/worldSignals";
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

  /*
   * Connect the global organism to the active scene. The first run
   * establishes the initial mood; every later scene change fires a
   * coordinated organism pulse. These are module-level signals — no
   * React re-render is caused beyond the scene switch itself.
   */
  const organismInitializedRef =
    useRef(false);

  useEffect(() => {
    setWorldScene(
      activeScene
    );

    if (
      !organismInitializedRef.current
    ) {
      organismInitializedRef.current =
        true;

      return;
    }

    pulseWorld();
  }, [activeScene]);

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

  /*
   * COMPACT MENU (v2.6.1) — the touch-first navigation mode for
   * viewports where the full scene track stops being honest touch
   * UI. Same scenes, same changeScene pipeline; BLOG and GITHUB ride
   * in the same panel so every area stays reachable from one
   * discoverable control. Rendered for phone and narrow-tablet
   * widths by CSS (display rules in LivingShell.module.css); the
   * full SceneNavigator remains the desktop navigation.
   */
  const compactMenuEntries =
    useMemo<readonly CompactMenuEntry[]>(
      () => [
        ...SCENES.map(
          (
            scene,
            index
          ) => ({
            kind: "action" as const,
            id: `compact-scene-${scene.id}`,
            label: scene.label,
            index: String(
              index + 1
            ).padStart(
              2,
              "0"
            ),
            scene: scene.id,
            active:
              scene.id ===
              activeScene,
            onSelect: () =>
              changeScene(
                scene.id
              )
          })
        ),
        {
          kind: "link",
          id: "compact-blog",
          label: "Blog",
          index: "07",
          scene: "blog",
          href: "/blog/"
        },
        ...(github
          ? [
              {
                kind: "link" as const,
                id: "compact-github",
                label: "GitHub",
                index: "↗",
                scene: "github",
                href: github.href,
                external: true
              }
            ]
          : [])
      ],
      [activeScene, changeScene, github]
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

      {/*
        * One reveal observer for the world shell — HUD, scenes and
        * footer all share it. Never mounted per scene.
        */}
      <MotionReveal />

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
        data-reveal="instant"
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

            <div
              className={
                styles.livingShellMenu
              }
            >
              <CompactMenu
                id="world-compact-menu"
                label="Site scenes and areas"
                entries={
                  compactMenuEntries
                }
                dividerBefore={[
                  "compact-blog"
                ]}
              />
            </div>
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
        {/*
          * SCENE REGISTRY (v2.7): rendered on the server and during
          * hydration with the default scene ("home"), so the home
          * route's semantic content — the single h1, capabilities,
          * featured projects, workflow — exists in the exported
          * static HTML, not only after client JavaScript runs. The
          * first client render matches the server render (the
          * initial scene state is "home" on both), so hydration
          * cannot mismatch; the URL-determined scene correction
          * happens in the mount effect below, behind the loading
          * screen, through the normal transition machinery.
          */}
        <SceneRegistry
          scene={
            activeScene
          }
        />
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
