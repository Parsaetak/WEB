"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useRef,
  useState
} from "react";

import type {
  ComponentType
} from "react";

import type {
  SceneId
} from "@/components/LivingShell";

import {
  loadSceneModule
} from "@/components/ScenePreloader";

import SceneViewport from "@/components/SceneViewport";

import styles from "@/components/SceneRegistry.module.css";

/*
 * Scene registry.
 *
 * Every scene component resolves through loadSceneModule(), the single
 * import site owned by ScenePreloader. The dynamic() wrappers below
 * exist only to integrate React.lazy-compatible rendering with
 * Suspense — they never produce their own import graphs, so the
 * bundler emits exactly one chunk per scene.
 */

const HomeScene = dynamic(
  () =>
    loadSceneModule(
      "home"
    )
);

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
};

export default function SceneRegistry({
  scene
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
    >
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
        <Scene />
      </div>
    </SceneViewport>
  );
}
