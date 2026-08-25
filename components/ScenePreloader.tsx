"use client";

import {
  useEffect
} from "react";

import type {
  SceneId
} from "@/components/LivingShell";

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

type ScenePreloaderProps = {
  scene: SceneId;
};

export default function ScenePreloader({
  scene
}: ScenePreloaderProps) {
  useEffect(() => {
    const preload =
      preloaders[scene];

    if (!preload) {
      return;
    }

    const run = () => {
      void preload();
    };

    if (
      "requestIdleCallback" in window
    ) {
      const idleWindow =
        window as typeof window & {
          requestIdleCallback: (
            callback: () => void
          ) => number;
        };

      const cancelWindow =
        window as typeof window & {
          cancelIdleCallback?: (
            id: number
          ) => void;
        };

      const id =
        idleWindow.requestIdleCallback(
          run
        );

      return () => {
        cancelWindow.cancelIdleCallback?.(
          id
        );
      };
    }

    const id =
      window.setTimeout(
        run,
        300
      );

    return () => {
      window.clearTimeout(id);
    };
  }, [scene]);

  return null;
}
