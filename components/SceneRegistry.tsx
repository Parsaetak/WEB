"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
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

const SCENE_COMPONENTS:
  Record<SceneId, SceneComponent> =
  {
    home: HomeScene,
    about: AboutScene,
    systems: SystemsScene,
    magic: RedMagicScene,
    work: WorkScene
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

  useEffect(() => {
    if (
      scene === renderedScene
    ) {
      return;
    }

    let cancelled =
      false;

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
        cancelled
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
      scene={renderedScene}
      loading={transitioning}
    >
      <div
        className="scene-transition-layer"
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
