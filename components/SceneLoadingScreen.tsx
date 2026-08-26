"use client";

import RedEye from "@/components/RedEye";

type SceneLoadingScreenProps = {
  visible?: boolean;
};

export default function SceneLoadingScreen({
  visible = true
}: SceneLoadingScreenProps) {
  return (
    <div
      className="scene-loading-screen"
      data-visible={
        visible
          ? "true"
          : "false"
      }
      role="status"
      aria-live="polite"
      aria-label="Loading"
      aria-hidden={
        visible
          ? "false"
          : "true"
      }
    >
      <div
        className="scene-loading-screen-backdrop"
        aria-hidden="true"
      />

      <div className="scene-loading-screen-inner">
        <div
          className="scene-loading-screen-eye"
          aria-hidden="true"
        >
          <RedEye size={56} />
        </div>

        <div className="scene-loading-screen-label">
          <span className="scene-loading-screen-kicker">
            RED SYSTEM
          </span>

          <span className="scene-loading-screen-title">
            INITIALIZING
          </span>
        </div>

        <div
          className="scene-loading-screen-progress"
          aria-hidden="true"
        >
          <span />
        </div>

        <div className="scene-loading-screen-meta">
          <span>
            LIVE WORLD
          </span>

          <span>
            SYNC
          </span>
        </div>
      </div>
    </div>
  );
}
