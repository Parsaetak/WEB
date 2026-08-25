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
    if (scene === renderedScene) {
      return;
    }

    setTransitioning(true);

    const timer =
      window.setTimeout(() => {
        setRenderedScene(scene);
        setTransitioning(false);
      }, 160);

    return () => {
      window.clearTimeout(timer);
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
