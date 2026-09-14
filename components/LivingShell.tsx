"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import styles from "@/components/LivingShell.module.css";

import CompactMenu, {
  type CompactMenuEntry
} from "@/components/CompactMenu";
import { BRAND_STAR } from "@/lib/brand";
import SceneLoadingScreen from "@/components/SceneLoadingScreen";
import SceneNavigator, {
  type SceneNavEntry
} from "@/components/SceneNavigator";
import { PRIMARY_NAV, WORLD_NAV } from "@/lib/navigation";
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

import type {
  HomeWritingPost
} from "@/lib/homeWriting";

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

/*
 * INTERNAL SCENE REGISTRY (v3.2) — the six-scene world, unchanged.
 * Scene ids (home / about / systems / magic / work / library) are
 * interaction states of the shell, NOT navigation labels; the labels
 * here feed the HUD status readout and hash parsing. The visible
 * navigation is built from lib/navigation.ts (PRIMARY_NAV +
 * WORLD_NAV), which leads with the professional destinations.
 */
const SCENES: readonly {
  id: SceneId;
  label: string;
  shortLabel: string;
}[] =
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

  /*
   * SERVER-SIDE WRITING SELECTION (v3.0): computed once in
   * app/page.tsx from the blog content index and passed down to the
   * home scene. Serializable metadata only — article bodies never
   * enter the client graph through this path.
   */
  writingPosts?: readonly HomeWritingPost[];
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
  initialScene = "home",
  writingPosts
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
   * NAVIGATION (v3.2) — the desktop track leads with the
   * professional primary nav. HOME stays an in-shell scene action
   * (a same-route link could not switch the hash scene); WORK,
   * RESEARCH, WRITING, ABOUT and CONTACT are real routes. The
   * experimental scenes (SYSTEMS, RED MAGIC, LIBRARY) follow as the
   * quieter world group — the six-scene world stays one click away.
   */
  const navigatorEntries = useMemo<readonly SceneNavEntry[]>(
    () => [
      ...PRIMARY_NAV.map(
        (entry): SceneNavEntry =>
          entry.id === "home"
            ? {
                kind: "scene",
                group: "primary",
                id: "home",
                label: entry.label,
                shortLabel: entry.shortLabel
              }
            : {
                kind: "route",
                group: "primary",
                id: entry.id,
                label: entry.label,
                shortLabel: entry.shortLabel,
                href: entry.href
              }
      ),
      ...WORLD_NAV.map(
        (entry): SceneNavEntry => ({
          kind: "scene",
          group: "world",
          id: entry.id as SceneId,
          label: entry.label,
          shortLabel: entry.shortLabel
        })
      )
    ],
    []
  );

  /*
   * COMPACT MENU (v3.2) — the touch-first navigation mode for
   * viewports where the full scene track stops being honest touch
   * UI. Same primary/world split as the desktop track, no numbered
   * index glyphs. HOME switches the scene in-shell, the other
   * primary entries are links, the world scenes follow, and GitHub
   * rides last as an external link.
   */
  const compactMenuEntries =
    useMemo<readonly CompactMenuEntry[]>(
      () => [
        ...PRIMARY_NAV.map(
          (entry): CompactMenuEntry =>
            entry.id === "home"
              ? {
                  kind: "action" as const,
                  id: `compact-${entry.id}`,
                  label: entry.label,
                  scene: entry.id,
                  active:
                    activeScene === "home",
                  onSelect: () =>
                    changeScene("home")
                }
              : {
                  kind: "link" as const,
                  id: `compact-${entry.id}`,
                  label: entry.label,
                  scene: entry.id,
                  href: entry.href
                }
        ),
        ...WORLD_NAV.map(
          (entry): CompactMenuEntry => ({
            kind: "action" as const,
            id: `compact-${entry.id}`,
            label: entry.label,
            scene: entry.id,
            active:
              entry.id === activeScene,
            onSelect: () =>
              changeScene(
                entry.id as SceneId
              )
          })
        ),
        ...(github
          ? [
              {
                kind: "link" as const,
                id: "compact-github",
                label: "GitHub",
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
              aria-hidden="true"
            >
              {/*
               * The 13-point star — the Parsa Tak site identity. A
               * static asset on purpose: no component hydration for a
               * logo. The accessible name lives on the wrapping link
               * (aria-label="Parsa Tak home"), so the image is
               * decorative to assistive technology.
               */}
              <img
                src={BRAND_STAR.red}
                alt=""
                width={36}
                height={36}
                loading="eager"
                decoding="async"
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
            entries={
              navigatorEntries
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

            <div
              className={
                styles.livingShellMenu
              }
            >
              <CompactMenu
                id="world-compact-menu"
                label="Site navigation"
                entries={
                  compactMenuEntries
                }
                dividerBefore={[
                  "compact-systems",
                  "compact-github"
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
          writingPosts={
            writingPosts
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
