"use client";

import {
  useEffect,
  useRef
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

const VALID_SCENES: readonly SceneId[] =
  [
    "home",
    "about",
    "systems",
    "magic",
    "work",
    "library"
  ];

function readSceneFromHash():
  | SceneId
  | null {
  let hash =
    window.location.hash
      .replace(
        /^#/,
        ""
      );

  /*
   * Hashes set by the browser arrive percent-encoded ("# MAGIC "
   * becomes "#%20MAGIC%20"), so the trim below would otherwise
   * operate on encoded bytes and never trim anything. Decode first;
   * a malformed percent sequence falls back to the raw string.
   */
  try {
    hash =
      decodeURIComponent(
        hash
      );
  } catch {
    /* keep the raw hash */
  }

  hash =
    hash
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
  /*
   * Scene and handler live in refs so the browser listeners below are
   * registered exactly once per mount. The previous shape depended on
   * [scene, onSceneChange] and resubscribed both window listeners on
   * every scene change — correct, but needless teardown/setup churn
   * (and one more retained closure per swap) on a permanently-mounted
   * shell component.
   */
  const sceneRef =
    useRef(scene);

  const onSceneChangeRef =
    useRef(onSceneChange);

  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);

  useEffect(() => {
    onSceneChangeRef.current =
      onSceneChange;
  }, [onSceneChange]);

  useEffect(() => {
    const initialScene =
      readSceneFromHash();

    const nextScene =
      initialScene ??
      "home";

    if (
      nextScene !==
      sceneRef.current
    ) {
      onSceneChangeRef.current(
        nextScene
      );
    }

    normalizeHash(
      nextScene
    );
  }, []);

  useEffect(() => {
    const handleNavigation =
      () => {
        const nextScene =
          readSceneFromHash();

        if (
          nextScene
        ) {
          onSceneChangeRef.current(
            nextScene
          );

          /*
           * Canonicalize the URL after any hash navigation.
           * Invalid (e.g. "#bogus") and aliased (e.g. "#home",
           * "#MAGIC") hashes resolve to a scene above, but the
           * raw hash would otherwise stay in the address bar —
           * inconsistent with the load-time normalization in the
           * mount effect, which always rewrites to the canonical
           * form. replaceState never fires hashchange or
           * popstate, so this cannot re-enter.
           */
          normalizeHash(
            nextScene
          );

          return;
        }

        normalizeHash(
          sceneRef.current
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
  }, []);

  return null;
}
