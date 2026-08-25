"use client";

import dynamic from "next/dynamic";

import type {
  ComponentType
} from "react";

import type {
  SceneId
} from "@/components/LivingShell";

import SceneViewport from "@/components/SceneViewport";

type SceneComponent =
  ComponentType;

const HomeScene =
  dynamic(
    () =>
      import(
        "@/components/scenes/HomeScene"
      ),
    {
      loading: () => (
        <div className="scene-loading">
          <span className="scene-loading-orbit" />
          <span className="scene-loading-core" />
          <span className="scene-loading-text">
            LOADING / HOME
          </span>
        </div>
      )
    }
  );

const AboutScene =
  dynamic(
    () =>
      import(
        "@/components/scenes/AboutScene"
      ),
    {
      loading: () => (
        <div className="scene-loading">
          <span className="scene-loading-orbit" />
          <span className="scene-loading-core" />
          <span className="scene-loading-text">
            LOADING / ABOUT
          </span>
        </div>
      )
    }
  );

const SystemsScene =
  dynamic(
    () =>
      import(
        "@/components/scenes/SystemsScene"
      ),
    {
      loading: () => (
        <div className="scene-loading">
          <span className="scene-loading-orbit" />
          <span className="scene-loading-core" />
          <span className="scene-loading-text">
            LOADING / SYSTEMS
          </span>
        </div>
      )
    }
  );

const RedMagicScene =
  dynamic(
    () =>
      import(
        "@/components/scenes/RedMagicScene"
      ),
    {
      loading: () => (
        <div className="scene-loading">
          <span className="scene-loading-orbit" />
          <span className="scene-loading-core" />
          <span className="scene-loading-text">
            ACTIVATING / RED MAGIC
          </span>
        </div>
      )
    }
  );

const WorkScene =
  dynamic(
    () =>
      import(
        "@/components/scenes/WorkScene"
      ),
    {
      loading: () => (
        <div className="scene-loading">
          <span className="scene-loading-orbit" />
          <span className="scene-loading-core" />
          <span className="scene-loading-text">
            LOADING / WORK
          </span>
        </div>
      )
    }
  );

const SCENE_COMPONENTS: Record<
  SceneId,
  SceneComponent
> = {
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
  const Scene =
    SCENE_COMPONENTS[scene] ??
    HomeScene;

  return (
    <SceneViewport
      scene={scene}
    >
      <Scene />
    </SceneViewport>
  );
}
