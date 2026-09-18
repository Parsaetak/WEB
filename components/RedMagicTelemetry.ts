"use client";

import type {
  QualityName,
  RuntimeState
} from "@/components/redmagic/engineConfig";

export type RedMagicPerformanceSample = {
  fps: number;
  frameTime: number;
  quality: QualityName;
  dpr: number;
  width: number;
  height: number;

  /*
   * Normalised pointer energy (0..1) at sample time. Optional so older
   * publishers stay type-compatible.
   */
  pointerEnergy?: number;

  /*
   * Display refresh-rate estimate in Hz, derived from the fastest
   * sustained requestAnimationFrame interval (v2.2). Optional so older
   * publishers stay type-compatible. Never presented as a guarantee —
   * it is a measurement of the display the engine observed.
   */
  refreshHz?: number;

  /*
   * RUNTIME TELEMETRY (v2) — everything below is optional so older
   * publishers stay type-compatible. All values are measurements of
   * the live engine, held in memory only; nothing here is tracked,
   * uploaded, or presented as a benchmark.
   */

  /** Explicit runtime cadence state (idle / ambient / active / …). */
  runtimeState?: RuntimeState;

  /** DPR ceiling the adaptive policy currently allows for this tier. */
  dprCap?: number;

  /** Simulation time scale actually applied this window. */
  simulationScale?: number;

  /** Particles updated/drawn this window vs the tier's pool budget. */
  particlesActive?: number;
  particlesBudget?: number;

  /** Structural complexity of the live world (grid/boundary/flows). */
  gridNodes?: number;
  gridEdges?: number;
  membranePoints?: number;
  flowCount?: number;
  flowSegments?: number;

  /** Membrane draw stride (soft adaptation coarsens the stroke). */
  membraneStride?: number;

  /** 0..1 atmosphere/glow layer allowance currently applied. */
  atmosphere?: number;

  /** The most recent quality adaptation (soft = budget-only, hard = rebuild). */
  lastAdaptation?: RedMagicAdaptation;
};

export type RedMagicAdaptation = {
  /** soft = work reduction inside the tier; hard = structural rebuild. */
  type: "soft" | "hard";

  from: QualityName;
  to: QualityName;

  /** What triggered it: sustained-fps, reduced-motion, resize, recovery… */
  reason: string;

  /** performance.now() at the change. */
  at: number;
};

type Listener =
  (
    sample: RedMagicPerformanceSample
  ) => void;

const listeners =
  new Set<Listener>();

let latestSample:
  RedMagicPerformanceSample | null =
  null;

export function publishRedMagicPerformance(
  sample: RedMagicPerformanceSample
) {
  latestSample = sample;

  listeners.forEach(
    (listener) => {
      listener(sample);
    }
  );
}

export function subscribeRedMagicPerformance(
  listener: Listener
) {
  listeners.add(listener);

  if (latestSample) {
    listener(
      latestSample
    );
  }

  return () => {
    listeners.delete(
      listener
    );
  };
}

export function getLatestRedMagicPerformance() {
  return latestSample;
}
