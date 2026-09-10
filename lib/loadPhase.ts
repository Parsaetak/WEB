/*
 * Loading state vocabulary and priority contract.
 *
 * The site exposes exactly five load phases. UI may only claim one of
 * these — never an invented percentage. Indeterminate work uses the
 * indeterminate visual treatment; measurable work may add deterministic
 * progress on top of the phase, not instead of it.
 *
 * INITIALIZING — application boot before the shell is interactive.
 * LOADING      — a required resource is being fetched for the current view.
 * PREPARING    — data is resident; the view is being composed or staged.
 * READY        — the view is usable.
 * ERROR        — a required resource failed and recovery is offered.
 */

export type LoadPhase =
  | "INITIALIZING"
  | "LOADING"
  | "PREPARING"
  | "READY"
  | "ERROR";

export const LOAD_PHASES: readonly LoadPhase[] = [
  "INITIALIZING",
  "LOADING",
  "PREPARING",
  "READY",
  "ERROR"
];

/*
 * Loading priority ladder.
 *
 * P0 CRITICAL       — app shell, current scene chunk, essential CSS.
 * P1 NEAR-CRITICAL  — the most probable next scene; fetched as soon as
 *                     the main thread is idle.
 * P2 PREDICTIVE     — the adjacent previous scene; fetched after a second
 *                     idle gap so it never competes with P1.
 * P3 BACKGROUND      — secondary metadata and future navigation targets.
 *                     Nothing currently schedules P3 work.
 * P4 USER-TRIGGERED  — PDFs, audio, video, heavy media. NEVER loaded
 *                     without explicit user intent (READ / LISTEN / WATCH /
 *                     OPEN ARTICLE-style actions).
 */

export type LoadPriority = "P0" | "P1" | "P2" | "P3" | "P4";

/*
 * Background preload scope: the preloader considers at most two scene
 * chunks per active scene (P1 predicted primary + P2 secondary
 * prediction). Actual execution is owned by the unified background
 * scheduler (lib/backgroundScheduler.ts), which orders, deduplicates,
 * cancels, and defers all queued work.
 */
export const BACKGROUND_PRELOAD_BUDGET = 2;

/*
 * Background work runs through the unified scheduler's single idle
 * pump with this timeout.
 */
export const BACKGROUND_IDLE_TIMEOUT_MS = 1800;

/*
 * Scene transitions faster than this never paint the loading overlay.
 * Preloaded (cached) scene chunks complete inside the minimum
 * transition window, so the overlay stays invisible for them.
 */
export const SCENE_OVERLAY_DELAY_MS = 180;
