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

function writeSceneToHistory(
  scene: SceneId
) {
  const hash =
    scene === "home"
      ? ""
      : `#${scene}`;

  window.history.pushState(
    null,
    "",
    `${window.location.pathname}${window.location.search}${hash}`
  );
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

    const handleNavigation =
      () => {
        const nextScene =
          readSceneFromHash();

        onSceneChange(
          nextScene ?? "home"
        );
      };

    window.addEventListener(
      "hashchange",
      handleNavigation
    );

    window.addEventListener(
      "popstate",
      handleNavigation
    );

    return () => {
      window.removeEventListener(
        "hashchange",
        handleNavigation
      );

      window.removeEventListener(
        "popstate",
        handleNavigation
      );
    };
  }, [
    onSceneChange
  ]);

  useEffect(() => {
    const current =
      readSceneFromHash();

    if (
      current === scene
    ) {
      return;
    }

    writeSceneToHistory(
      scene
    );
  }, [scene]);

  return null;
}
