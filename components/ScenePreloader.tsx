"use client";

import {
  useEffect
} from "react";

import type {
  SceneId
} from "@/components/LivingShell";

const SCENE_ORDER:
  readonly SceneId[] =
  [
    "home",
    "about",
    "systems",
    "magic",
    "work"
  ];

const preloaders: Record<
  SceneId,
  () => Promise<unknown>
> = {
  home: () =>
    import(
      "@/components/scenes/HomeScene"
    ),

  about: () =>
    import(
      "@/components/scenes/AboutScene"
    ),

  systems: () =>
    import(
      "@/components/scenes/SystemsScene"
    ),

  magic: () =>
    import(
      "@/components/scenes/RedMagicScene"
    ),

  work: () =>
    import(
      "@/components/scenes/WorkScene"
    )
};

function getAdjacentScenes(
  scene: SceneId
): readonly SceneId[] {
  const index =
    SCENE_ORDER.indexOf(
      scene
    );

  if (index < 0) {
    return ["home", "about"];
  }

  const previous =
    SCENE_ORDER[
      (index - 1 + SCENE_ORDER.length) %
        SCENE_ORDER.length
    ];

  const next =
    SCENE_ORDER[
      (index + 1) %
        SCENE_ORDER.length
    ];

  return [
    previous,
    next
  ];
}

export function preloadScene(
  scene: SceneId
) {
  const preload =
    preloaders[scene];

  if (!preload) {
    return;
  }

  void preload();
}

export function preloadAdjacentScenes(
  scene: SceneId
) {
  const adjacent =
    getAdjacentScenes(
      scene
    );

  const unique =
    new Set(adjacent);

  unique.forEach(
    (adjacentScene) => {
      preloadScene(
        adjacentScene
      );
    }
  );
}

type ScenePreloaderProps = {
  scene: SceneId;
};

export default function ScenePreloader({
  scene
}: ScenePreloaderProps) {
  useEffect(() => {
    const run = () => {
      preloadAdjacentScenes(
        scene
      );
    };

    if (
      typeof window !==
        "undefined" &&
      "requestIdleCallback" in
        window
    ) {
      const idleWindow =
        window as typeof window & {
          requestIdleCallback: (
            callback: () => void
          ) => number;

          cancelIdleCallback: (
            id: number
          ) => void;
        };

      const id =
        idleWindow.requestIdleCallback(
          run
        );

      return () => {
        idleWindow.cancelIdleCallback(
          id
        );
      };
    }

    const id =
      globalThis.setTimeout(
        run,
        250
      );

    return () => {
      globalThis.clearTimeout(
        id
      );
    };
  }, [scene]);

  return null;
}
