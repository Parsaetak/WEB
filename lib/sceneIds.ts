/*
 * lib/sceneIds.ts — the canonical world-shell scene vocabulary.
 *
 * Shared by LivingShell, SceneUrlSync and the navigation layer so the
 * scene id type and the legacy hash aliases live in ONE neutral
 * module (no component-to-component import cycles).
 *
 * v4.0.0: the former "library" scene id is now "media"; "#library"
 * links keep working through SCENE_ID_ALIASES and the address bar is
 * normalised to the canonical form after resolution.
 */

export type SceneId =
  | "home"
  | "about"
  | "systems"
  | "magic"
  | "work"
  | "media";

/*
 * BACKWARD-COMPATIBLE HASH ALIASES (v4.0.0).
 */
export const SCENE_ID_ALIASES: Readonly<
  Record<string, SceneId>
> = {
  library: "media"
};
