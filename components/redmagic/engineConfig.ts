/*
 * RED MAGIC ENGINE CONFIG (Runtime v2) — pure configuration and policy
 * for the living organism's unified visual/CPU budget.
 *
 * This module is deliberately free of React, DOM and canvas code so the
 * budget rules, the runtime-state model, the adaptive-DPR policy, the
 * refresh-rate estimator and the interaction-energy signal model can be
 * reasoned about (and tested) independently of the 6.8k-line engine in
 * RedMagic.tsx. The engine imports these values and policies; it never
 * redefines them locally.
 *
 * UNIFIED BUDGET LAW: core, network, membrane, particles, energy flows
 * and atmosphere/background effects are ONE coordinated budget. A tier
 * is not a label — it is a concrete allocation of per-frame work across
 * every layer. Quality changes must reduce (or restore) actual work.
 *
 * TWO-LEVEL ADAPTATION:
 * - SOFT (immediate): reduce the cheapest expensive layers first —
 *   active particle count, flow density, membrane draw stride, node-glow
 *   floor, secondary atmosphere passes. No structural rebuild, no pool
 *   reallocation, safe inside the hot path's frame.
 * - HARD (controlled): rebuild expensive structures — grid, membrane
 *   boundary, particle pools, edge/influence tables. Only after
 *   SUSTAINED degradation, on a settled frame (no active pointer
 *   interaction, no live shockwaves), never every frame.
 */

export type QualityName =
  | "high"
  | "medium"
  | "low";

/**
 * One tier = one coordinated allocation across all six layers of the
 * organism. `gridSize`, `particles`, `membraneSteps`, `flowCount` and
 * `flowSegments` are the historical v3.x knobs; `atmosphere` (0..1)
 * gates secondary glow/atmosphere passes and `nodeGlowFloor` raises the
 * minimum node energy that earns a glow sprite on constrained tiers.
 */
export type QualityBudget = {
  /** Network extent (gridSize² cells inside the unit circle). */
  gridSize: number;

  /** Base particle pool size (soft adaptation may draw fewer). */
  particles: number;

  /** Membrane boundary resolution (points around the star field). */
  membraneSteps: number;

  /** Energy-flow curve count. */
  flowCount: number;

  /** Points per energy-flow curve. */
  flowSegments: number;

  /** 0..1 allowance for secondary atmosphere/glow passes. */
  atmosphere: number;

  /** Minimum node energy that earns a glow pass at this tier. */
  nodeGlowFloor: number;
};

export const QUALITY_BUDGETS: Record<
  QualityName,
  QualityBudget
> = {
  high: {
    gridSize: 8,
    particles: 112,
    membraneSteps: 180,
    flowCount: 7,
    flowSegments: 28,
    atmosphere: 1,
    nodeGlowFloor: 0.018
  },

  medium: {
    gridSize: 7,
    particles: 76,
    membraneSteps: 132,
    flowCount: 5,
    flowSegments: 22,
    atmosphere: 0.8,
    nodeGlowFloor: 0.026
  },

  low: {
    gridSize: 6,
    particles: 42,
    membraneSteps: 90,
    flowCount: 4,
    flowSegments: 17,
    atmosphere: 0.55,
    nodeGlowFloor: 0.038
  }
};

/** Soft adaptation never starves the organism below this pool fraction. */
export const SOFT_PARTICLE_FLOOR = 0.55;

/*
 * RUNTIME STATES — explicit cadence model (Runtime v2).
 *
 * reduced    reduced-motion preference: one static frame, no loop
 * suspended  canvas offscreen or document hidden: no work at all
 * idle       no pointer intent (or a pointer resting still for a while)
 *            and settled energy: capped redraw rate, reduced simulation
 * ambient    organism awake at low energy: full redraw, moderate sim
 * active     pointer interaction: full redraw, full simulation
 * recovery   quality recently changed: full cadence held stable while
 *            the new budget settles (no further adaptation decisions)
 */
export type RuntimeState =
  | "reduced"
  | "suspended"
  | "idle"
  | "ambient"
  | "active"
  | "recovery";

/** Simulation time scale per state (active = 1). */
export const STATE_SIMULATION_SCALE: Record<
  RuntimeState,
  number
> = {
  reduced: 0,
  suspended: 0,
  idle: 0.32,
  ambient: 0.66,
  active: 1,
  recovery: 0.9
};

/**
 * Window without pointer movement after which a present-but-still
 * pointer falls into the idle cadence (mirrors IDLE_CADENCE_DELAY_MS).
 */
export const STILL_POINTER_IDLE_MS = 4000;

/** Energy below which a resting pointer counts as settled for idle. */
export const SETTLED_ENERGY = 0.14;

/**
 * INTERACTION SIGNAL MODEL (Runtime v2).
 *
 * The organism's arousal is a continuous function of measurable signals,
 * not a binary "pointer exists = maximum energy" switch:
 * - proximity   0..1, pointer closeness to the organism's centre
 * - speed       smoothed pointer speed, normalised by the engine
 * - dwell       0..1 presence built up over sustained contact
 * - memory      0..1 decaying afterglow of recent impulses
 * - charge      click/hold charge contribution
 */
export type InteractionSignals = {
  proximity: number;
  speed: number;
  dwell: number;
  memory: number;
  charge: number;
};

/** Pointer speed (px/s) that saturates the speed signal. */
export const SPEED_SATURATION_PX_S = 900;

/** Presence (ms of sustained nearby contact) that saturates dwell. */
export const DWELL_SATURATION_MS = 4000;

/**
 * Continuous target energy from interaction signals. Deterministic: the
 * same signal values always produce the same target. Weights are the
 * organism's temperament — proximity alone wakes but never saturates it;
 * speed dominates; charge (a deliberate act) earns the most.
 */
export function interactionTargetEnergy(
  signals: InteractionSignals
): number {
  const proximity =
    clamp01(signals.proximity) * 0.3;

  const speed =
    clamp01(signals.speed) * 0.36;

  const dwell =
    clamp01(signals.dwell) * 0.14;

  const memory =
    clamp01(signals.memory) * 0.2;

  const charge =
    clamp01(signals.charge) * 0.42;

  return clamp01(
    proximity + speed + dwell + memory + charge
  );
}

/*
 * ADAPTIVE DPR POLICY (Runtime v2).
 *
 * DPR is no longer one global constant. The target resolution derives
 * from canvas area, active quality and device constraints, with a safe
 * absolute upper bound. The engine applies the policy debounced: a
 * change only lands when it is meaningful (>= DPR_MIN_STEP), not more
 * often than DPR_CHANGE_DEBOUNCE_MS, and never on a hot interaction
 * frame — resolution switches happen on settled frames only.
 */
export const MAX_DPR = 2;

export const DPR_CHANGE_DEBOUNCE_MS = 2500;

export const DPR_MIN_STEP = 0.25;

/** Canvas area (CSS px²) above which 2× resolution buys little. */
export const LARGE_AREA_PX = 600_000;

export type DprPolicyInput = {
  deviceDpr: number;

  /** CSS pixel area of the canvas. */
  area: number;

  quality: QualityName;

  /**
   * Ratio of sustained fps to the measured refresh rate (1 = native).
   * Below 0.8 the policy holds the current DPR instead of raising it —
   * the quality controller owns degradation; DPR must not fight it.
   */
  performanceRatio: number;

  currentDpr: number;

  /** Timestamp of the last applied DPR change (performance.now()). */
  lastChangeAt: number;

  now: number;
};

/** Highest DPR the policy allows for a given quality tier and area. */
export function dprCeilingFor(
  quality: QualityName,
  area: number
): number {
  const tierCeiling =
    quality === "high"
      ? 2
      : quality === "medium"
        ? 1.75
        : 1.5;

  const areaCeiling =
    area > LARGE_AREA_PX ? 1.75 : 2;

  return Math.min(tierCeiling, areaCeiling);
}

/**
 * Resolve the DPR target for this frame. Returns the CURRENT dpr when
 * the policy declines to change (debounce window, sub-step delta,
 * degraded performance, or the target already matches).
 */
export function resolveAdaptiveDpr(
  input: DprPolicyInput
): number {
  const deviceDpr =
    input.deviceDpr > 0 ? input.deviceDpr : 1;

  const ceiling = dprCeilingFor(
    input.quality,
    input.area
  );

  const target = Math.min(
    deviceDpr,
    MAX_DPR,
    ceiling
  );

  if (target === input.currentDpr) {
    return input.currentDpr;
  }

  /*
   * Never RAISE resolution while the engine is failing to hold its
   * current frame rate — that is the quality controller's call, and
   * the two mechanisms must not fight each other.
   */
  if (
    target >
      input.currentDpr &&
    input.performanceRatio >
      0 &&
    input.performanceRatio <
      0.8
  ) {
    return input.currentDpr;
  }

  const delta = Math.abs(
    target - input.currentDpr
  );

  if (delta < DPR_MIN_STEP) {
    return input.currentDpr;
  }

  if (
    input.lastChangeAt >
      0 &&
    input.now - input.lastChangeAt <
      DPR_CHANGE_DEBOUNCE_MS
  ) {
    return input.currentDpr;
  }

  return target;
}

/*
 * REFRESH-RATE ESTIMATION (Runtime v2, hardened).
 *
 * The browser does not expose the display's native refresh rate, but
 * requestAnimationFrame delivers frames at that rate, so the fastest
 * sustained inter-frame interval IS the native interval. The estimator:
 * - initialises conservatively at 0 (unknown → relative thresholds use
 *   conservative fallback lines),
 * - adopts a window only when it is SUSTAINED faster (3% above the
 *   current estimate) — scheduling jitter cannot manufacture a boost,
 * - decays: if observed windows run at less than half the estimate for
 *   VALIDATION_WINDOWS consecutive windows (a display-context change —
 *   monitor switch, power-saving throttle — not transient jank), the
 *   estimate resets to the observed rate,
 * - suspends cleanly: hidden tabs and idle-cadence gaps produce no
 *   deltas at all, so windows reopen fresh instead of trusting stale
 *   fast numbers.
 */
export const REFRESH_VALIDATION_WINDOWS = 6;

export type RefreshEstimator = {
  /** Current estimate in Hz; 0 = unknown. */
  estimate: number;

  /** Consecutive windows observed below half the estimate. */
  slowStreak: number;
};

export function createRefreshEstimator(): RefreshEstimator {
  return { estimate: 0, slowStreak: 0 };
}

export type RefreshWindowResult = {
  /** Updated estimate after this window. */
  estimate: number;

  /** True when the estimate changed this window (telemetry event). */
  changed: boolean;
};

/**
 * Close one sampling window. `windowHz` is derived from the window's
 * minimum raw inter-frame delta; pass null when the window produced no
 * valid deltas (suspended, idle-capped — the window is skipped).
 */
export function closeRefreshWindow(
  estimator: RefreshEstimator,
  windowHz: number | null
): RefreshWindowResult {
  if (windowHz === null) {
    return {
      estimate: estimator.estimate,
      changed: false
    };
  }

  let changed = false;

  if (
    estimator.estimate === 0 ||
    windowHz >
      estimator.estimate * 1.03
  ) {
    estimator.estimate = Math.min(
      240,
      windowHz
    );

    estimator.slowStreak = 0;

    changed = true;
  } else if (
    estimator.estimate > 0 &&
    windowHz <
      estimator.estimate * 0.5
  ) {
    /*
     * Sustained collapse: a genuine display-context change decays the
     * stale fast estimate instead of letting it stand forever. Requires
     * VALIDATION_WINDOWS consecutive slow windows; isolated jank or a
     * few dropped frames never reach that.
     */
    estimator.slowStreak += 1;

    if (
      estimator.slowStreak >=
      REFRESH_VALIDATION_WINDOWS
    ) {
      estimator.estimate = windowHz;

      estimator.slowStreak = 0;

      changed = true;
    }
  } else {
    estimator.slowStreak = 0;
  }

  return {
    estimate: estimator.estimate,
    changed
  };
}

/** Suspensions (hidden tab, idle cadence) invalidate the open window. */
export function suspendRefreshWindow(
  estimator: RefreshEstimator
): void {
  estimator.slowStreak = 0;
}

function clamp01(value: number): number {
  return Math.max(
    0,
    Math.min(1, value)
  );
}
