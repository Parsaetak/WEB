"use client";

import {
  useEffect
} from "react";

import type {
  SceneId
} from "@/components/LivingShell";

import {
  scheduleIdle
} from "@/lib/idleScheduler";

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

type ConnectionState = {
  saveData?: boolean;
  effectiveType?: string;
};

function getConnectionState():
  ConnectionState | null {
  if (
    typeof navigator ===
    "undefined"
  ) {
    return null;
  }

  const navigatorWithConnection =
    navigator as Navigator & {
      connection?: ConnectionState;
    };

  return (
    navigatorWithConnection.connection ??
    null
  );
}

function shouldPreloadInBackground() {
  const connection =
    getConnectionState();

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
        index + 1
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

/*
 * The idle scheduler is shared (lib/idleScheduler.ts).
 * Scene preloading uses a slightly longer idle timeout than the reader,
 * because background scene chunks are the lowest priority work on the page.
 */
function waitForIdle(): Promise<void> {
  return new Promise(
    (
      resolve
    ) => {
      scheduleIdle(
        resolve,
        1800
      );
    }
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

  await waitForIdle();

  if (
    nextScene ===
    previousScene
  ) {
    return;
  }

  if (
    !shouldPreloadInBackground()
  ) {
    return;
  }

  await preloadScene(
    previousScene
  );
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
      cancelled =
        true;

      cancelIdle();
    };
  }, [
    scene
  ]);

  return null;
}
