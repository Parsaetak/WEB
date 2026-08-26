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
      .replace(
        /^#/,
        ""
      )
      .trim()
      .toLowerCase();

  if (
    hash === "" ||
    hash === "home"
  ) {
    return "home";
  }

  return VALID_SCENES.includes(
    hash as SceneId
  )
    ? (hash as SceneId)
    : "home";
}

function normalizeHash(
  scene: SceneId
) {
  const targetHash =
    scene === "home"
      ? ""
      : `#${scene}`;

  const currentHash =
    window.location.hash;

  if (
    currentHash ===
    targetHash
  ) {
    return;
  }

  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${window.location.search}${targetHash}`
  );
}

export default function SceneUrlSync({
  scene,
  onSceneChange
}: SceneUrlSyncProps) {
  useEffect(() => {
    const initialScene =
      readSceneFromHash();

    const nextScene =
  initialScene ?? "home";

if (
  nextScene !==
  scene
) {
  onSceneChange(
    nextScene
  );
}

normalizeHash(
  nextScene
);
  }, [
    onSceneChange,
    scene
  ]);

  useEffect(() => {
    const handleNavigation =
      () => {
        const nextScene =
          readSceneFromHash();

        if (
          nextScene
        ) {
          onSceneChange(
            nextScene
          );
          return;
        }

        normalizeHash(
          scene
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
    onSceneChange,
    scene
  ]);

  return null;
}
