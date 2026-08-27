"use client";

export type RedMagicPerformanceSample = {
  fps: number;
  frameTime: number;
  quality: "high" | "medium" | "low";
  dpr: number;
  width: number;
  height: number;

  /*
   * Normalised pointer energy (0..1) at sample time. Optional so older
   * publishers stay type-compatible.
   */
  pointerEnergy?: number;
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
