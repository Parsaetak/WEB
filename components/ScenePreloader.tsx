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

type ConnectionInformation =
  NetworkInformation & {
    saveData?: boolean;
    effectiveType?:
      | "slow-2g"
      | "2g"
      | "3g"
      | "4g";
  };

function getConnectionInformation() {
  if (
    typeof navigator ===
    "undefined"
  ) {
    return null;
  }

  const connection =
    (
      navigator as Navigator & {
        connection?: ConnectionInformation;
      }
    ).connection;

  return (
    connection ?? null
  );
}

function shouldPreloadInBackground() {
  const connection =
    getConnectionInformation();

  if (!connection) {
    return true;
  }

  if (
    connection.saveData
  ) {
    return false;
  }

  if (
    connection.effectiveType ===
      "slow-2g" ||
    connection.effectiveType ===
      "2g"
  ) {
    return false;
  }

  return true;
}

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
      (
        index -
        1 +
        SCENE_ORDER.length
      ) %
        SCENE_ORDER.length
    ];

  const next =
    SCENE_ORDER[
      (
        index +
        1
      ) %
        SCENE_ORDER.length
    ];

  return [
    next,
    previous
  ];
}

export function preloadScene(
  scene: SceneId
): Promise<unknown> {
  const cached =
    preloadCache.get(
      scene
    );

  if (cached) {
    return cached;
  }

  const preload =
    preloaders[scene];

  if (!preload) {
    return Promise.resolve();
  }

  const promise =
    preload();

  preloadCache.set(
    scene,
    promise
  );

  promise.catch(
    () => {
      preloadCache.delete(
        scene
      );
    }
  );

  return promise;
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
          callback: (
            deadline: IdleDeadline
          ) => void,
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
          timeout: 1800
        }
      );

    return () => {
      idleWindow.cancelIdleCallback(
        id
      );
    };
  }

  const id =
    window.setTimeout(
      callback,
      350
    );

  return () => {
    window.clearTimeout(
      id
    );
  };
}

function scheduleNextIdle(
  callback: () => void
) {
  return scheduleIdle(
    callback
  );
}

export async function preloadAdjacentScenes(
  scene: SceneId
): Promise<void> {
  if (
    !shouldPreloadInBackground()
  ) {
    return;
  }

  const [
    nextScene,
    previousScene
  ] =
    getAdjacentScenes(
      scene
    );

  await preloadScene(
    nextScene
  );

  await new Promise<void>(
    (resolve) => {
      scheduleNextIdle(
        resolve
      );
    }
  );

  if (
    nextScene !==
    previousScene &&
    shouldPreloadInBackground()
  ) {
    await preloadScene(
      previousScene
    );
  }
}

type ScenePreloaderProps = {
  scene: SceneId;
};

export default function ScenePreloader({
  scene
}: ScenePreloaderProps) {
  useEffect(() => {
    let cancelled =
      false;

    const cancelIdle =
      scheduleIdle(
        () => {
          if (
            cancelled ||
            !shouldPreloadInBackground()
          ) {
            return;
          }

          void preloadAdjacentScenes(
            scene
          );
        }
      );

    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, [
    scene
  ]);

  return null;
}
