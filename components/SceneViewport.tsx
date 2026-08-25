"use client";

import {
  Suspense,
  type ReactNode
} from "react";

import type {
  SceneId
} from "@/components/LivingShell";

import SceneLoadingScreen from "@/components/SceneLoadingScreen";

type SceneLoaderProps = {
  scene: SceneId;
  children: ReactNode;
};

function SceneFallback() {
  return (
    <SceneLoadingScreen />
  );
}

function SceneErrorState() {
  return (
    <div
      className="scene-error"
      role="status"
    >
      <p className="kicker">
        SCENE UNAVAILABLE
      </p>

      <p className="body">
        This part of the system could not be
        rendered. The surrounding world remains
        active.
      </p>
    </div>
  );
}

export default function SceneViewport({
  scene,
  children
}: SceneLoaderProps) {
  return (
    <section
      className="scene-viewport"
      data-scene={scene}
      aria-label={`${scene} scene`}
    >
      <Suspense fallback={<SceneFallback />}>
        <div className="scene-viewport-content">
          {children}
        </div>
      </Suspense>

      <div
        className="scene-viewport-frame"
        aria-hidden="true"
      />

      <div
        className="scene-viewport-corner scene-viewport-corner-tl"
        aria-hidden="true"
      />

      <div
        className="scene-viewport-corner scene-viewport-corner-tr"
        aria-hidden="true"
      />

      <div
        className="scene-viewport-corner scene-viewport-corner-bl"
        aria-hidden="true"
      />

      <div
        className="scene-viewport-corner scene-viewport-corner-br"
        aria-hidden="true"
      />
    </section>
  );
}

export {
  SceneFallback,
  SceneErrorState
};
