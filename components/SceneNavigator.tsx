"use client";

import Link from "next/link";

import type {
  SceneId
} from "@/components/LivingShell";

import {
  preloadScene
} from "@/components/ScenePreloader";

import styles from "@/components/SceneNavigator.module.css";

/*
 * SCENE NAVIGATOR (v3.2) — the desktop navigation track.
 *
 * v3.2 leads with the professional primary navigation (HOME, ABOUT,
 * WORK, RESEARCH, BLOG, CONTACT) and demotes the experimental
 * scenes (SYSTEMS, RED MAGIC, MEDIA) to a quieter "world" group
 * after a divider. The numbered HUD labels (01–06) are gone:
 * hierarchy is carried by spacing, typography and active states.
 *
 * Entry kinds:
 * - "scene": an in-shell interaction state, switched through
 *   changeScene with the same preloading contract as before;
 * - "route": a real document, rendered as a next/link with
 *   prefetch disabled (routes load on intent, per site law).
 */

export type SceneNavEntry =
  | {
      kind: "scene";
      group: "primary" | "world";
      id: SceneId;
      label: string;
      shortLabel: string;
    }
  | {
      kind: "route";
      group: "primary" | "world";
      id: string;
      label: string;
      shortLabel: string;
      href: string;
    };

type SceneNavigatorProps = {
  entries: readonly SceneNavEntry[];
  activeScene: SceneId;
  onSceneChange: (
    scene: SceneId
  ) => void;
};

export default function SceneNavigator({
  entries,
  activeScene,
  onSceneChange
}: SceneNavigatorProps) {
  const primary = entries.filter(
    (entry) => entry.group === "primary"
  );

  const world = entries.filter(
    (entry) => entry.group === "world"
  );

  return (
    <nav
      className={
        styles.sceneNavigator
      }
      aria-label="Site"
    >
      <div
        className={
          styles.track
        }
      >
        {primary.map(
          (entry) => (
            <NavigatorEntry
              key={
                entry.id
              }
              entry={
                entry
              }
              activeScene={
                activeScene
              }
              onSceneChange={
                onSceneChange
              }
            />
          )
        )}

        {world.length > 0 && (
          <>
            <span
              className={
                styles.divider
              }
              aria-hidden="true"
            />

            {world.map(
              (entry) => (
                <NavigatorEntry
                  key={
                    entry.id
                  }
                  entry={
                    entry
                  }
                  activeScene={
                    activeScene
                  }
                  onSceneChange={
                    onSceneChange
                  }
                />
              )
            )}
          </>
        )}
      </div>
    </nav>
  );
}

function NavigatorEntry({
  entry,
  activeScene,
  onSceneChange
}: {
  entry: SceneNavEntry;
  activeScene: SceneId;
  onSceneChange: (
    scene: SceneId
  ) => void;
}) {
  const isScene =
    entry.kind === "scene";

  const active =
    isScene &&
    entry.id ===
      activeScene;

  const warmScene = () => {
    if (
      isScene &&
      !active
    ) {
      void preloadScene(
        entry.id
      );
    }
  };

  const body = (
    <>
      <span
        className={
          styles.copy
        }
      >
        <span
          className={
            styles.label
          }
        >
          {
            entry.shortLabel
          }
        </span>
      </span>

      <span
        className={
          styles.indicator
        }
        aria-hidden="true"
      />
    </>
  );

  const shared = {
    className: `${styles.item} ${
      entry.group === "world"
        ? styles.worldItem
        : ""
    }`.trim(),
    "data-active":
      active
        ? "true"
        : "false",
    "data-scene":
      entry.id,
    "aria-current":
      active
        ? ("page" as const)
        : undefined,
    "aria-label": `Open ${entry.label}`
  };

  if (
    entry.kind ===
    "route"
  ) {
    return (
      <Link
        {...shared}
        href={
          entry.href
        }
        prefetch={
          false
        }
      >
        {body}
      </Link>
    );
  }

  return (
    <button
      {...shared}
      type="button"
      onPointerEnter={
        warmScene
      }
      onFocus={
        warmScene
      }
      onClick={() =>
        onSceneChange(
          entry.id
        )
      }
    >
      {body}
    </button>
  );
}
