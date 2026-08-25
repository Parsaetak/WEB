"use client";

import {
  useEffect
} from "react";

import type {
  SceneId
} from "@/components/LivingShell";

type SceneUrlSyncProps = {
  scene: SceneId;
  onSceneChange: (
    scene: SceneId
  ) => void;
};

const VALID_SCENES:
  readonly SceneId[] = [
    "home",
    "about",
    "systems",
    "magic",
    "work"
  ];

function readSceneFromHash():
  | SceneId
  | null {
  const hash =
    window.location.hash
      .replace(/^#/, "")
      .toLowerCase();

  return VALID_SCENES.includes(
    hash as SceneId
  )
    ? (hash as SceneId)
    : null;
}

export default function SceneUrlSync({
  scene,
  onSceneChange
}: SceneUrlSyncProps) {
  useEffect(() => {
    const initialScene =
      readSceneFromHash();

    if (
      initialScene &&
      initialScene !== scene
    ) {
      onSceneChange(
        initialScene
      );
    }

    const handleHashChange =
      () => {
        const nextScene =
          readSceneFromHash();

        if (
          nextScene &&
          nextScene !== scene
        ) {
          onSceneChange(
            nextScene
          );
        }
      };

    window.addEventListener(
      "hashchange",
      handleHashChange
    );

    return () => {
      window.removeEventListener(
        "hashchange",
        handleHashChange
      );
    };
  }, [
    onSceneChange,
    scene
  ]);

  useEffect(() => {
    const current =
      readSceneFromHash();

    if (current === scene) {
      return;
    }

    const hash =
      scene === "home"
        ? ""
        : `#${scene}`;

    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}${hash}`
    );
  }, [scene]);

  return null;
}
