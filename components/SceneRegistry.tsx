"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useRef,
  useState,
  type ComponentType
} from "react";

import type {
  SceneId
} from "@/components/LivingShell";

import {
  preloadScene
} from "@/components/ScenePreloader";

import SceneViewport from "@/components/SceneViewport";

import styles from "@/components/SceneRegistry.module.css";

type SceneComponent =
  ComponentType;

const HomeScene = dynamic(
  () =>
    import(
      "@/components/scenes/HomeScene"
    )
);

const AboutScene = dynamic(
  () =>
    import(
      "@/components/scenes/AboutScene"
    )
);

const SystemsScene = dynamic(
  () =>
    import(
      "@/components/scenes/SystemsScene"
    )
);

const RedMagicScene = dynamic(
  () =>
    import(
      "@/components/scenes/RedMagicScene"
    )
);

const WorkScene = dynamic(
  () =>
    import(
      "@/components/scenes/WorkScene"
    )
);

const LibraryScene = dynamic(
  () =>
    import(
      "@/components/scenes/LibraryScene"
    )
);

const SCENE_COMPONENTS:
  Record<
    SceneId,
    SceneComponent
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

  const [
    transitioning,
    setTransitioning
  ] = useState(false);

  const transitionId =
    useRef(0);

  useEffect(() => {
    if (
      scene === renderedScene
    ) {
      return;
    }

    const currentTransitionId =
      ++transitionId.current;

    let cancelled = false;

    setTransitioning(
      true
    );

    const loadScene =
      preloadScene(
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

      setTransitioning(
        false
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
