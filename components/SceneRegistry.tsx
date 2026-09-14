"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useRef,
  useState
} from "react";

import HomeScene from "@/components/scenes/HomeScene";

import type {
  ComponentType
} from "react";

import type {
  SceneId
} from "@/components/LivingShell";

import type {
  HomeWritingPost
} from "@/lib/homeWriting";

import {
  loadSceneModule
} from "@/components/ScenePreloader";

import SceneViewport from "@/components/SceneViewport";

import styles from "@/components/SceneRegistry.module.css";

/*
 * Scene registry.
 *
 * Every secondary scene component resolves through loadSceneModule(),
 * the single import site owned by ScenePreloader. The dynamic()
 * wrappers below exist only to integrate React.lazy-compatible
 * rendering with Suspense — they never produce their own import
 * graphs, so the bundler emits exactly one chunk per scene.
 *
 * P0 (v3.0) — the HOME scene is the exception: it is imported
 * statically. A dynamic() scene suspends during static export, so
 * the exported homepage previously carried its semantic content
 * only inside React's streamed <div hidden id="S:0"> completion
 * while the visible document showed a loading gate. Statically
 * importing the scene renders it synchronously into <main> in the
 * exported HTML: crawlers, social scrapers and no-JS visitors read
 * the real homepage immediately, hydration still matches (initial
 * scene is "home" on both sides), and the other five scenes keep
 * their interaction-gated loading.
 */

const AboutScene = dynamic(
  () =>
    loadSceneModule(
      "about"
    )
);

const SystemsScene = dynamic(
  () =>
    loadSceneModule(
      "systems"
    )
);

const RedMagicScene = dynamic(
  () =>
    loadSceneModule(
      "magic"
    )
);

const WorkScene = dynamic(
  () =>
    loadSceneModule(
      "work"
    )
);

const LibraryScene = dynamic(
  () =>
    loadSceneModule(
      "library"
    )
);

const SCENE_COMPONENTS:
  Record<
    SceneId,
    ComponentType
  > = {
  home: HomeScene,
  about: AboutScene,
  systems: SystemsScene,
  magic: RedMagicScene,
  work: WorkScene,
  library: LibraryScene
};

const MIN_TRANSITION_MS =
  160;

function wait(
  milliseconds: number
): Promise<void> {
  return new Promise(
    (resolve) => {
      window.setTimeout(
        resolve,
        milliseconds
      );
    }
  );
}

type SceneRegistryProps = {
  scene: SceneId;

  /*
   * SERVER-SIDE WRITING SELECTION (v3.0): forwarded to the home
   * scene only. The home scene is statically rendered, so these
   * props land in the exported HTML.
   */
  writingPosts?: readonly HomeWritingPost[];
};

export default function SceneRegistry({
  scene,
  writingPosts
}: SceneRegistryProps) {
  const [
    renderedScene,
    setRenderedScene
  ] = useState<SceneId>(
    scene
  );

  const transitionId =
    useRef(0);

  /*
   * Transition state is derived, not stored: while the requested
   * scene differs from the rendered one, a transition is in
   * flight. This removes a synchronous setState inside the effect.
   */
  const transitioning =
    scene !== renderedScene;

  useEffect(() => {
    if (
      scene === renderedScene
    ) {
      return;
    }

    const currentTransitionId =
      ++transitionId.current;

    let cancelled = false;

    /*
     * P0 — the scene the user asked for. preloadScene deduplicates
     * with any warming request already in flight.
     */
    const loadScene =
      loadSceneModule(
        scene
      );

    const minimumTransition =
      wait(
        MIN_TRANSITION_MS
      );

    void Promise.allSettled([
      loadScene,
      minimumTransition
    ]).then(() => {
      if (
        cancelled ||
        currentTransitionId !==
          transitionId.current
      ) {
        return;
      }

      setRenderedScene(
        scene
      );
    });

    return () => {
      cancelled = true;
    };
  }, [
    scene,
    renderedScene
  ]);

  const Scene =
    SCENE_COMPONENTS[
      renderedScene
    ] ?? HomeScene;

  return (
    <SceneViewport
      scene={
        renderedScene
      }
      pendingScene={
        transitioning
          ? scene
          : undefined
      }
      loading={
        transitioning
      }
      /*
       * P0 (v3.0): the home scene is statically rendered — it must
       * not sit behind a Suspense boundary, or static export streams
       * it into the hidden S:0 completion instead of the visible
       * document. Every other scene resolves through dynamic import
       * and keeps its boundary.
       */
      suspense={
        renderedScene !== "home"
      }
    >
      {/*
        * SCENE TRANSITION MOTION (v2.2).
        *
        * The layer handles the outgoing fade (data-transitioning);
        * the keyed host inside it replays a short settle animation on
        * every scene mount, so the incoming scene rises into place
        * while the layer fades back in. One keyframe, transform and
        * opacity only, reduced-motion aware via CSS.
        */}
      <div
        className={
          styles.sceneTransitionLayer
        }
        data-transitioning={
          transitioning
            ? "true"
            : "false"
        }
      >
        <div
          className={
            styles.sceneEnterHost
          }
          key={
            renderedScene
          }
        >
          {renderedScene === "home" ? (
            <HomeScene writingPosts={writingPosts} />
          ) : (
            <Scene />
          )}
        </div>
      </div>
    </SceneViewport>
  );
}
