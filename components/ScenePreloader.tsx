"use client";

import {
  useEffect
} from "react";

import type {
  ComponentType
} from "react";

import {
  BACKGROUND_IDLE_TIMEOUT_MS,
  BACKGROUND_PRELOAD_BUDGET
} from "@/lib/loadPhase";

import {
  scheduleIdle
} from "@/lib/idleScheduler";

import type {
  SceneId
} from "@/components/LivingShell";

/*
 * SCENE PRELOADER
 *
 * Owns every dynamic import() of a scene module. There is exactly one
 * import site per scene in the whole application — this file. Bundler
 * chunk duplication and double downloads during navigation are
 * structurally impossible because SceneRegistry's dynamic() components
 * resolve through the same loader map below.
 *
 * Priorities (see lib/loadPhase.ts):
 * - P0 the active scene is loaded by SceneRegistry on demand
 * - P1 the next scene in navigation order loads once the main thread
 *      is idle and background work is allowed
 * - P2 the previous scene loads after a second idle gap
 * - Background work is bounded to BACKGROUND_PRELOAD_BUDGET chunks,
 *   skips while the tab is hidden, and respects save-data / 2g.
 * - P4 media never preloads here — heavy media stays user-triggered.
 */

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

type SceneModule = {
  default: ComponentType;
};

const preloaders: Record<
  SceneId,
  () => Promise<SceneModule>
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
    Promise<SceneModule>
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

function isPageVisible() {
  return (
    typeof document ===
      "undefined" ||
    document.visibilityState ===
      "visible"
  );
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

/*
 * The single entry point for scene chunk loading. Concurrent callers
 * (SceneRegistry transition, navigator hover warming, background
 * preloading) all receive the same cached promise — one network
 * request, one module instance, one execution.
 */
export function preloadScene(
  scene: SceneId
): Promise<SceneModule> {
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
    return Promise.resolve({
      default: () => null
    });
  }

  const promise =
    preload();

  preloadCache.set(
    scene,
    promise
  );

  /*
   * Failed imports are evicted so a later attempt can retry —
   * a network hiccup once must not disable a scene forever.
   */
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
 * Alias used by SceneRegistry's dynamic() components so the registry
 * and the preloader share one import graph.
 */
export function loadSceneModule(
  scene: SceneId
): Promise<SceneModule> {
  return preloadScene(
    scene
  );
}

/*
 * Scene preloading deliberately uses a longer idle timeout than
 * other background work because these chunks are low priority.
 */
function waitForIdle(): Promise<void> {
  return new Promise(
    (
      resolve
    ) => {
      scheduleIdle(
        resolve,
        BACKGROUND_IDLE_TIMEOUT_MS
      );
    }
  );
}

export async function preloadAdjacentScenes(
  scene: SceneId,
  isCancelled: () => boolean = () => false
): Promise<void> {
  if (
    isCancelled()
  ) {
    return;
  }

  if (
    !shouldPreloadInBackground()
  ) {
    return;
  }

  if (
    !isPageVisible()
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

  let loaded = 0;

  /*
   * P1 — the next scene is the highest-value prediction, so load it
   * immediately once background preloading is allowed.
   */
  await preloadScene(
    nextScene
  );

  loaded += 1;

  if (
    isCancelled() ||
    loaded >=
      BACKGROUND_PRELOAD_BUDGET
  ) {
    return;
  }

  /*
   * Give the browser another idle opportunity before loading the
   * lower-priority previous scene.
   */
  await waitForIdle();

  if (
    isCancelled()
  ) {
    return;
  }

  if (
    nextScene ===
    previousScene
  ) {
    return;
  }

  if (
    !shouldPreloadInBackground() ||
    !isPageVisible()
  ) {
    return;
  }

  /*
   * P2 — the previous scene in navigation order.
   */
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

    const beginPreload =
      () => {
        if (
          cancelled ||
          !shouldPreloadInBackground() ||
          !isPageVisible()
        ) {
          return;
        }

        void preloadAdjacentScenes(
          scene,
          () => cancelled
        );
      };

    /*
     * Hidden tabs do no background work. When the page becomes
     * visible the preload decision is re-evaluated.
     */
    const handleVisibility =
      () => {
        if (
          isPageVisible()
        ) {
          beginPreload();
        }
      };

    const cancelIdle =
      scheduleIdle(
        beginPreload,
        BACKGROUND_IDLE_TIMEOUT_MS
      );

    document.addEventListener(
      "visibilitychange",
      handleVisibility,
      { passive: true }
    );

    return () => {
      cancelled =
        true;

      cancelIdle();

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [
    scene
  ]);

  return null;
}
