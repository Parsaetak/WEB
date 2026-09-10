"use client";

import {
  Suspense,
  type ReactNode
} from "react";

import type {
  SceneId
} from "@/components/LivingShell";

import SceneLoadingScreen from "@/components/SceneLoadingScreen";

import styles from "@/components/SceneViewport.module.css";

type SceneLoaderProps = {
  scene: SceneId;
  pendingScene?: SceneId;
  loading?: boolean;
  children: ReactNode;
};

function SceneFallback({
  scene
}: {
  scene: SceneId;
}) {
  return (
    <SceneLoadingScreen
      visible={true}
      variant="scene"
      phase="LOADING"
      label={scene.toUpperCase()}
    />
  );
}

function SceneErrorState() {
  return (
    <div
      className={styles.sceneError}
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
  pendingScene,
  loading = false,
  children
}: SceneLoaderProps) {
  return (
    <section
      className={
        styles.sceneViewport
      }
      data-scene={
        scene
      }
      aria-label={`${scene} scene`}
    >
      <Suspense
        fallback={
          <SceneFallback
            scene={scene}
          />
        }
      >
        <div
          className={
            styles.sceneViewportContent
          }
        >
          {children}
        </div>
      </Suspense>

      <SceneLoadingScreen
        visible={
          loading
        }
        variant="scene"
        phase="LOADING"
        label={
          pendingScene
            ? pendingScene.toUpperCase()
            : scene.toUpperCase()
        }
      />

      <div
        className={
          styles.sceneViewportFrame
        }
        aria-hidden="true"
      />

      <div
        className={`${styles.sceneViewportCorner} ${styles.sceneViewportCornerTl}`}
        aria-hidden="true"
      />

      <div
        className={`${styles.sceneViewportCorner} ${styles.sceneViewportCornerTr}`}
        aria-hidden="true"
      />

      <div
        className={`${styles.sceneViewportCorner} ${styles.sceneViewportCornerBl}`}
        aria-hidden="true"
      />

      <div
        className={`${styles.sceneViewportCorner} ${styles.sceneViewportCornerBr}`}
        aria-hidden="true"
      />
    </section>
  );
}

export {
  SceneFallback,
  SceneErrorState
};
