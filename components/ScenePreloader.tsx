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

    const run =
      () => {
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

      const id =
        idleWindow.requestIdleCallback(
          run
        );

      return () => {
        if (
          "cancelIdleCallback" in
          window
        ) {
          const cancelWindow =
            window as typeof window & {
              cancelIdleCallback: (
                id: number
              ) => void;
            };

          cancelWindow.cancelIdleCallback(
            id
          );
        }
      };
    }

    const id =
      window.setTimeout(
        run,
        250
      );

    return () => {
      window.clearTimeout(id);
    };
  }, [scene]);

  return null;
}
