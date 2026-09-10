"use client";

import {
  useEffect,
  useRef
} from "react";

import type {
  ComponentType
} from "react";

import {
  BACKGROUND_PRIORITY
} from "@/lib/backgroundScheduler";

import {
  cancelBackgroundTasksByOwner,
  enqueueBackgroundTask
} from "@/lib/backgroundScheduler";

import type {
  SceneId
} from "@/components/LivingShell";

/*
 * SCENE PRELOADER — THIRD GENERATION
 *
 * Owns every dynamic import() of a scene module. There is exactly one
 * import site per scene in the whole application — this file. Bundler
 * chunk duplication and double downloads during navigation are
 * structurally impossible because SceneRegistry's dynamic() components
 * resolve through the same loader map below.
 *
 * Orchestration model (RESOURCE → PRIORITY → STATE → OWNER → LIFETIME):
 * - P0  the active scene: loaded by SceneRegistry the moment the user
 *       asks for it. Always immediate; never queued.
 * - P1  predicted primary destination: enqueued at NEAR_TERM priority
 *       through the unified background scheduler.
 * - P2  secondary prediction: enqueued at PREDICTIVE priority, so it
 *       can never compete with P1 (the scheduler is strictly ordered).
 * - P4  heavy media never preloads here — user-triggered only.
 *
 * Speculation yields to intent: every scene change first cancels all
 * queued tasks owned by this preloader, so background work that was
 * useful for the previous scene can never delay the scene the user
 * actually requested. Hover/focus warming in SceneNavigator bypasses
 * the queue entirely — explicit intent loads immediately.
 *
 * Prediction is a small deterministic frequency heuristic over recent
 * navigation transitions (bounded map, no machine learning): the most
 * frequent recorded successor of the current scene wins when the
 * history has a signal; otherwise the next scene in navigation order
 * is predicted. Prediction hit/miss counters are exposed for
 * verification via getScenePredictionStats().
 *
 * Network / memory degradation is delegated to the scheduler: save-data,
 * 2G, and constrained devices drop PREDICTIVE+ tasks at enqueue time.
 * The loader cache below retains cheap resolved scene CODE (intentional
 * — module chunks are tiny relative to their re-instantiation cost),
 * while every expensive runtime resource is owned by its scene.
 */

const SCENE_ORDER: readonly SceneId[] =
  [
    "home",
    "about",
    "systems",
    "magic",
    "work",
    "library"
  ];

const PRELOADER_OWNER =
  "scene-preloader";

const TRANSITION_HISTORY_LIMIT = 36;

const MIN_CONFIDENT_TRANSITIONS = 2;

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

/*
 * Resolved scene chunk cache. Cheap, reusable, intentional: dynamic
 * import() results are module references, not runtime state. Evicting
 * them would save trivial memory and force re-downloads.
 */
const preloadCache =
  new Map<
    SceneId,
    Promise<SceneModule>
  >();

/* -------------------------------------------------------------------------- */
/* Prediction history                                                         */
/* -------------------------------------------------------------------------- */

const transitionCounts =
  new Map<
    SceneId,
    Map<SceneId, number>
  >();

const predictionStats = {
  hits: 0,
  misses: 0,
  recorded: 0
};

/*
 * The prediction made for the most recent scene, used to score the
 * next navigation as a hit or a miss. Bounded to a single entry.
 */
let lastPredictedPrimary: SceneId | null = null;

function recordSceneTransition(
  from: SceneId,
  to: SceneId
) {
  if (from === to) {
    return;
  }

  predictionStats.recorded += 1;

  let successors =
    transitionCounts.get(from);

  if (!successors) {
    successors = new Map();

    transitionCounts.set(
      from,
      successors
    );
  }

  successors.set(
    to,
    (successors.get(to) ?? 0) + 1
  );

  /*
   * Bounded history: when the map outgrows its budget, halve the
   * weakest signals instead of growing without limit.
   */
  if (transitionCounts.size > TRANSITION_HISTORY_LIMIT) {
    for (const [scene, map] of transitionCounts) {
      if (transitionCounts.size <= TRANSITION_HISTORY_LIMIT / 2) {
        break;
      }

      const weakest = [...map.values()].reduce(
        (sum, count) => sum + count,
        0
      );

      if (weakest <= MIN_CONFIDENT_TRANSITIONS) {
        transitionCounts.delete(scene);
      }
    }
  }
}

function getFrequentSuccessor(
  scene: SceneId
): SceneId | null {
  const successors =
    transitionCounts.get(scene);

  if (!successors) {
    return null;
  }

  let bestScene: SceneId | null =
    null;

  let bestCount =
    MIN_CONFIDENT_TRANSITIONS;

  for (const [
    successor,
    count
  ] of successors) {
    if (
      count > bestCount ||
      (count === bestCount &&
        bestScene !== null &&
        SCENE_ORDER.indexOf(successor) <
          SCENE_ORDER.indexOf(bestScene))
    ) {
      bestScene = successor;
      bestCount = count;
    }
  }

  return bestScene;
}

export function getScenePredictionStats() {
  return { ...predictionStats };
}

/* -------------------------------------------------------------------------- */
/* Scene chunk loading (single import site)                                   */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Prediction                                                                 */
/* -------------------------------------------------------------------------- */

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
 * Decide the two scenes worth warming for `scene`:
 * primary — the adaptive prediction (history-weighted, falling back to
 *           the next scene in navigation order);
 * secondary — the previous scene in navigation order, unless it is the
 *           same as the primary.
 */
function getPredictionPair(
  scene: SceneId
): readonly [
  SceneId,
  SceneId | null
] {
  const [next, previous] =
    getAdjacentScenes(scene);

  const predicted =
    getFrequentSuccessor(scene) ?? next;

  if (predicted === previous) {
    return [predicted, null];
  }

  return [predicted, previous];
}

type ScenePreloaderProps = {
  scene: SceneId;
};

export default function ScenePreloader({
  scene
}: ScenePreloaderProps) {
  const previousSceneRef =
    useRef<SceneId | null>(
      null
    );

  useEffect(() => {
    /*
     * USER INTENT WINS: the previous scene's speculative queue is
     * cancelled before anything new is considered. The requested
     * scene itself is loaded by SceneRegistry at P0, immediately.
     */
    cancelBackgroundTasksByOwner(
      PRELOADER_OWNER
    );

    /*
     * Score the previous prediction against the scene the user
     * actually navigated to, then record the observed transition so
     * future predictions adapt to real navigation patterns.
     */
    const previousScene =
      previousSceneRef.current;

    if (previousScene && previousScene !== scene) {
      if (
        lastPredictedPrimary ===
        scene
      ) {
        predictionStats.hits += 1;
      } else {
        predictionStats.misses += 1;
      }

      recordSceneTransition(
        previousScene,
        scene
      );
    }

    previousSceneRef.current = scene;

    const [
      primary,
      secondary
    ] =
      getPredictionPair(scene);

    lastPredictedPrimary = primary;

    enqueueBackgroundTask({
      id: `scene-chunk:${primary}`,
      priority:
        BACKGROUND_PRIORITY.NEAR_TERM,
      owner: PRELOADER_OWNER,
      run: () =>
        preloadScene(primary)
    });

    if (secondary) {
      enqueueBackgroundTask({
        id: `scene-chunk:${secondary}`,
        priority:
          BACKGROUND_PRIORITY.PREDICTIVE,
        owner: PRELOADER_OWNER,
        run: () =>
          preloadScene(secondary)
      });
    }

    return () => {
      cancelBackgroundTasksByOwner(
        PRELOADER_OWNER
      );
    };
  }, [
    scene
  ]);

  return null;
}
