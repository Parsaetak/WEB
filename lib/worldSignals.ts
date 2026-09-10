/*
 * WORLD SIGNALS — tiny shared runtime state for the living background.
 *
 * A module-level store (NOT React state, NOT a state library) that
 * carries the organism's shared sense of "now" between the shell and
 * the global WorldBackground:
 *
 * - active scene (mood)
 * - latest pointer position (raw, coalesced by the receiver)
 * - click ripples
 * - scene-transition pulses
 * - page visibility
 *
 * Why a module: LivingShell already re-renders on scene change, but
 * feeding every pointer movement through React state would re-render
 * the whole shell per event. The organism instead reads these signals
 * through one subscription inside WorldBackground and expresses them
 * as CSS variables on its own subtree — zero React renders, zero
 * component-wide churn.
 *
 * Footprint: a handful of numbers, one listener set, no history, no
 * timers of its own. Bounded by design.
 */

export type WorldSceneMood =
  | "home"
  | "about"
  | "systems"
  | "magic"
  | "work"
  | "library"
  | "archive";

export type WorldEvent =
  | "scene"
  | "pulse"
  | "click"
  | "visibility";

type WorldListener = (event: WorldEvent) => void;

const listeners =
  new Set<WorldListener>();

const state = {
  scene: "home" as WorldSceneMood,

  pointerX: 0,
  pointerY: 0,

  clickX: 0,
  clickY: 0,

  hidden: false,

  /*
   * Monotonic tokens — the receiver compares against its last seen
   * value to detect fresh events without any allocation.
   */
  pulseToken: 0,
  clickToken: 0
};

function publish(event: WorldEvent) {
  for (const listener of listeners) {
    listener(event);
  }
}

export function getWorldScene(): WorldSceneMood {
  return state.scene;
}

export function getWorldPointer(): { x: number; y: number } {
  return { x: state.pointerX, y: state.pointerY };
}

export function getWorldClick(): { x: number; y: number; token: number } {
  return {
    x: state.clickX,
    y: state.clickY,
    token: state.clickToken
  };
}

export function getPulseToken(): number {
  return state.pulseToken;
}

export function isWorldHidden(): boolean {
  return state.hidden;
}

export function setWorldScene(scene: WorldSceneMood) {
  if (state.scene === scene) {
    return;
  }

  state.scene = scene;

  publish("scene");
}

/*
 * Coordinated organism pulse — fired on scene transitions. The
 * receiver plays one cheap compositor animation and settles back.
 */
export function pulseWorld() {
  state.pulseToken += 1;

  publish("pulse");
}

export function noteWorldPointerMove(x: number, y: number) {
  state.pointerX = x;
  state.pointerY = y;
}

export function noteWorldClick(x: number, y: number) {
  state.clickX = x;
  state.clickY = y;
  state.clickToken += 1;

  publish("click");
}

export function noteWorldVisibility(hidden: boolean) {
  if (state.hidden === hidden) {
    return;
  }

  state.hidden = hidden;

  publish("visibility");
}

export function subscribeWorld(listener: WorldListener): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
