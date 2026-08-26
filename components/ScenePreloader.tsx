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
    "work",
    "library"
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
  ),

library: () =>
  import(
    "@/components/scenes/LibraryScene"
  )
};

const preloadCache =
  new Map<
    SceneId,
    Promise<unknown>
  >();

function getAdjacentScenes(
  scene: SceneId
): readonly SceneId[] {
  const index =
    SCENE_ORDER.indexOf(
      scene
    );

  if (
    index < 0
  ) {
    return [
      "home",
      "about"
    ];
  }

  const previous =
    SCENE_ORDER[
      (index -
        1 +
        SCENE_ORDER.length) %
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
): Promise<unknown> {
  const cached =
    preloadCache.get(
      scene
    );

  if (
    cached
  ) {
    return cached;
  }

  const preload =
    preloaders[scene];

  if (
    !preload
  ) {
    return Promise.resolve();
  }

  const promise =
    preload();

  preloadCache.set(
    scene,
    promise
  );

  promise.catch(() => {
    preloadCache.delete(
      scene
    );
  });

  return promise;
}

export async function preloadAdjacentScenes(
  scene: SceneId
): Promise<void> {
  const adjacent =
    getAdjacentScenes(
      scene
    );

  const unique =
    Array.from(
      new Set(adjacent)
    );

  await Promise.allSettled(
    unique.map(
      (
        adjacentScene
      ) =>
        preloadScene(
          adjacentScene
        )
    )
  );
}

function scheduleIdle(
  callback: () => void
) {
  if (
    typeof window !==
      "undefined" &&
    "requestIdleCallback" in
      window
  ) {
    const idleWindow =
      window as typeof window & {
        requestIdleCallback: (
          callback: () => void,
          options?: {
            timeout?: number;
          }
        ) => number;

        cancelIdleCallback: (
          id: number
        ) => void;
      };

    const id =
      idleWindow.requestIdleCallback(
        callback,
        {
          timeout: 1500
        }
      );

    return () => {
      idleWindow.cancelIdleCallback(
        id
      );
    };
  }

  const id =
    globalThis.setTimeout(
      callback,
      250
    );

  return () => {
    globalThis.clearTimeout(
      id
    );
  };
}

type ScenePreloaderProps = {
  scene: SceneId;
};

export default function ScenePreloader({
  scene
}: ScenePreloaderProps) {
  useEffect(() => {
    return scheduleIdle(
      () => {
        void preloadAdjacentScenes(
          scene
        );
      }
    );
  }, [
    scene
  ]);

  return null;
}
