"use client";

import {
  Suspense,
  type ReactNode
} from "react";

import type {
  SceneId
} from "@/components/LivingShell";

type SceneLoaderProps = {
  scene: SceneId;
  children: ReactNode;
};

function SceneFallback({
  scene
}: {
  scene: SceneId;
}) {
  return (
    <div
      className="scene-loading"
      role="status"
      aria-live="polite"
      aria-label={`Loading ${scene} scene`}
    >
      <span className="scene-loading-orbit" />

      <span className="scene-loading-core" />

      <span className="scene-loading-text">
        LOADING /{" "}
        {scene.toUpperCase()}
      </span>
    </div>
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
      <Suspense
        fallback={
          <SceneFallback
            scene={scene}
          />
        }
      >
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
