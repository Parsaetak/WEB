"use client";

import { useEffect, useRef } from "react";

import styles from "@/components/RedMagic.module.css";

import {
  publishRedMagicPerformance,
  type RedMagicAdaptation
} from "@/components/RedMagicTelemetry";

import {
  noteOrganismActivity
} from "@/lib/worldSignals";

import {
  QUALITY_BUDGETS,
  SOFT_PARTICLE_FLOOR,
  STATE_SIMULATION_SCALE,
  STILL_POINTER_IDLE_MS,
  SETTLED_ENERGY,
  SPEED_SATURATION_PX_S,
  DWELL_SATURATION_MS,
  interactionTargetEnergy,
  resolveAdaptiveDpr,
  resolvePressureDpr,
  dprCeilingFor,
  createRefreshEstimator,
  closeRefreshWindow,
  suspendRefreshWindow,
  createRefreshDeltaSampler,
  recordRefreshDelta,
  resetRefreshDeltaSampler,
  representativeWindowHz,
  isSettledFrame,
  type QualityName,
  type QualityBudget,
  type RuntimeState,
  type RefreshEstimator,
  type RefreshDeltaSampler,
  type InteractionSignals
} from "@/components/redmagic/engineConfig";

import {
  createGlowSprite,
  createNodeSprite,
  createCoreSprite,
  createCoreDetailSprite
} from "@/components/redmagic/engineSprites";

import {
  qualityFromArea,
  createBoundary,
  buildFlowGeometry,
  createGrid,
  buildGlobalPotentialWeights,
  buildBoundaryNetworkWeights,
  sampleAngularLookup,
  ANGULAR_FALLOFF_NORMAL,
  ANGULAR_FALLOFF_ACTIVE,
  MAX_NETWORK_INFLUENCES,
  type GridNode,
  type GridEdge,
  type BoundaryPoint,
  type FlowGeometry,
  type GlobalPotentialField,
  type BoundaryNetworkWeights
} from "@/components/redmagic/engineWorld";

import {
  RED_MAGIC_INTERACTION_EVENT,
  type RedMagicInteractionDetail
} from "@/components/RedMagicInteraction";

import {
  createPageSeed,
  createParticles,
  placeParticles,
  updateAndDrawParticles,
  type RedMagicParticle
} from "@/components/RedMagicParticles";

import {
  type RedMagicSubsystemTimings
} from "@/components/RedMagicTelemetry";

/*
 * SUBSYSTEM PROFILING (Runtime v2.1) — build-time-gated measurement of
 * the engine's per-subsystem CPU cost, published through the in-memory
 * telemetry store every sampling window.
 *
 * The gate is a BUILD-TIME constant: Next inlines
 * NEXT_PUBLIC_RED_MAGIC_TIMING into the bundle, so a default
 * `npm run build` compiles every timing call below out of existence
 * (the branch folds to `false` before minification). Measurement
 * builds (`NEXT_PUBLIC_RED_MAGIC_TIMING=1 npm run build`) keep it and
 * add ~14 performance.now() calls per drawn frame — negligible next
 * to the subsystems being measured, and identical in every measurement
 * build, so before/after comparisons stay honest.
 *
 * This is diagnostics, not telemetry in the tracking sense: samples
 * live in memory only and are never uploaded (see AGENTS.md).
 */
const RED_MAGIC_TIMING =
  process.env.NEXT_PUBLIC_RED_MAGIC_TIMING ===
  "1";

type Point = {
  x: number;
  y: number;
};

type Shockwave = {
  x: number;
  y: number;

  angle: number;

  age: number;
  strength: number;

  angularInfluence: Float32Array;
};

/*
 * QualityName and the unified per-tier budget live in
 * redmagic/engineConfig.ts (Runtime v2) — one coordinated allocation
 * across core, network, membrane, particles, flows and atmosphere.
 * `Quality` survives as a legacy alias for the budget shape.
 */
type Quality =
  QualityBudget;

type ModeProfile = {
  timeScale: number;

  energyCeiling: number;
  energyFloor: number;

  pointerGain: number;
  coreGain: number;

  responseLag: number;

  particleImpulse: number;

  turbulenceGain: number;

  shockwaveGain: number;

  recovery: number;

  gridConductance: number;
  globalPotentialGain: number;
};

/*
 * ONE ORGANISM, ONE PROFILE (v3.6): the DRIFT / LISTEN / SURGE
 * modes are retired. The organism runs its balanced baseline and
 * lets interaction energy do all the shaping — the same law the
 * sound engine follows.
 */
const ORGANISM_PROFILE: ModeProfile = {
  timeScale: 1,

  energyCeiling: 1,
  energyFloor: 0,

  pointerGain: 1,
  coreGain: 1,

  responseLag: 0.018,

  particleImpulse: 0.7,

  turbulenceGain: 1,

  shockwaveGain: 1,

  recovery: 1,

  gridConductance: 0.18,

  globalPotentialGain: 0.045
};

const TAU =
  Math.PI * 2;

const MAX_SHOCKWAVES =
  5;

const SHOCKWAVE_DURATION =
  820;

/*
 * Idle cadence (v2.8, Runtime v2): after this long without pointer
 * intent — or with a pointer resting still while its energy has
 * settled — the ambient organism drops from full vsync to a capped
 * redraw rate. The canvas redraw — clear plus membrane, network, node
 * sprites and glow passes — is the engine's dominant cost; capping idle
 * redraws cuts that cost to roughly a quarter on high-refresh displays
 * while the drift stays visibly alive. Any pointer movement, click, or
 * interaction event restores the full rate instantly. The simulation
 * scales per runtime state come from STATE_SIMULATION_SCALE in
 * redmagic/engineConfig.ts.
 */
const IDLE_CADENCE_DELAY_MS =
  4000;

const IDLE_FRAME_INTERVAL_MS =
  33;

const GRID_ENERGY_DECAY =
  0.94;

const GRID_IDLE_ENERGY =
  0.008;

const GRID_MAX_NODE_ENERGY =
  1.4;

const GRID_GLOBAL_RADIUS =
  1.25;

const GRID_ROUTE_BONUS =
  0.018;

const GRID_FLOW_LIMIT =
  0.16;

const GRID_POINTER_RADIUS =
  0.72;

const GRID_POINTER_CONTRIBUTION =
  0.025;

const CORE_ROTATION_SPEED =
  0.00008;

const CORE_DETAIL_ROTATION_SPEED =
  0.000125;

const CORE_MOVEMENT_SPEED =
  0.00135;

const CORE_MOVEMENT_AMPLITUDE =
  0.014;

const MAX_CLICK_PARTICLES =
  100;

const PARTICLE_WRAP_MARGIN =
  80;

const CLICK_LIGHT_BOOST_MAX =
  1;

const CLICK_LIGHT_DECAY =
  0.965;

const CLICK_LIGHT_DECAY_REFERENCE_MS =
  16;


function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}

function smoothstep(
  value: number
) {
  const x =
    clamp(
      value,
      0,
      1
    );

  return (
    x *
    x *
    (
      3 -
      2 * x
    )
  );
}

function distanceSquared(
  ax: number,
  ay: number,
  bx: number,
  by: number
) {
  const dx =
    ax - bx;

  const dy =
    ay - by;

  return (
    dx * dx +
    dy * dy
  );
}







export default function RedMagic() {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );


  useEffect(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const context =
      canvas.getContext(
        "2d",
        {
          alpha: true,
          desynchronized:
            true
        }
      );

    if (!context) {
      return;
    }

    const pageSeed =
      createPageSeed();

    const glowSprite =
      createGlowSprite();

    const interactionSprite =
      createGlowSprite();

    const nodeSprite =
      createNodeSprite();

    const coreSprite =
      createCoreSprite();

    const coreDetailSprite =
      createCoreDetailSprite();

    const reduceMotionQuery =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    let reducedMotion =
      reduceMotionQuery.matches;

    let animationFrame =
      0;

    let resizeObserver:
      | ResizeObserver
      | null =
      null;

    let intersectionObserver:
      | IntersectionObserver
      | null =
      null;

    let visible =
      true;

    let documentVisible =
      document.visibilityState ===
      "visible";

    let width =
      1;

    let height =
      1;

    let centerX =
      0;

    let centerY =
      0;

    let radius =
      1;

    let dpr =
      1;

    let elapsed =
      0;

    let lastTimestamp =
      0;

    /*
     * Idle-cadence bookkeeping: the timestamp of the last frame
     * actually drawn, and when pointer intent left the canvas
     * (null = intent present or never left; 0 = never entered —
     * a never-touched organism idles from the start).
     */
    let lastDrawTimestamp =
      0;

    let idleSince:
      | number
      | null =
      0;

    let pointer: Point = {
      x: 0,
      y: 0
    };

    let pointerTarget: Point = {
      x: 0,
      y: 0
    };

    let pointerActive =
      false;

    let pointerEnergy =
      0;

    let pointerVelocity =
      0;

    let pointerDistance =
      0;

    let pointerAngle =
      0;

    let pointerAngleSin =
      0;

    let pointerAngleCos =
      1;

    /*
     * Precomputed once per frame and reused for every boundary point.
     * This removes the repeated pointer-distance clamp/multiply work
     * from the hot boundary loop.
     */
    let boundaryPointerDistanceFactor =
      0;

    let boundaryPointerStrength =
      0;

    let boundaryAngularLookup =
      ANGULAR_FALLOFF_NORMAL;

    let boundaryPrimaryPhaseSin =
      0;

    let boundaryPrimaryPhaseCos =
      1;

    let boundarySecondaryPhaseSin =
      0;

    let boundarySecondaryPhaseCos =
      1;

    let boundaryTertiaryPhaseSin =
      0;

    let boundaryTertiaryPhaseCos =
      1;

    let boundaryTurbulencePhaseSin =
      0;

    let boundaryTurbulencePhaseCos =
      1;

    let interactionEnergy =
      0;

    let interactionTurbulence =
      0;

    let charge =
      0;

    let pointerHeld =
      false;

    let averageGridEnergy =
      0;

    let clickParticleCount =
      0;

    let clickLightBoost =
      0;

    let qualityName:
      QualityName =
      qualityFromArea(
        window.innerWidth *
        window.innerHeight
      );

    let quality =
      QUALITY_BUDGETS[
        qualityName
      ];

    let flowGeometry =
      buildFlowGeometry(
        quality
      );

    let particles:
      RedMagicParticle[] =
      [];

    let gridNodes:
      GridNode[] =
      [];

    let gridEdges:
      GridEdge[] =
      [];

    /*
     * NETWORK BUCKET INDEX LISTS (Runtime v2.1) — the network draw
     * pass used to re-traverse EVERY grid edge once per stroke bucket
     * (one classify traversal + five bucket-filtered draw traversals
     * = six full edge sweeps per frame, ~2.3k iterations at the high
     * tier). The classify pass now writes each edge's index into its
     * bucket's preallocated index list, and each draw pass walks only
     * its own members: two sweeps total. Lists are allocated at world
     * build (capacity = edge count — worst case, every edge in one
     * bucket) and reused every frame: zero steady-state allocation.
     */
    const NETWORK_BUCKET_COUNT =
      5;

    let networkBucketIndices:
      Uint16Array[] =
      [];

    let networkBucketCounts =
      new Int32Array(
        NETWORK_BUCKET_COUNT
      );

    let nodePotential =
      new Float32Array(
        0
      );

    let nextNodeEnergy =
      new Float32Array(
        0
      );

    /*
     * Bounded global-potential field (Runtime v2): indices/weights/totals
     * plus the per-frame energy snapshot. Null before the first build.
     */
    let globalPotential:
      GlobalPotentialField |
      null =
      null;

    let membraneBoundary:
      BoundaryPoint[] =
      [];

    let boundaryNetworkNodeIndices:
      BoundaryNetworkWeights["nodeIndices"] =
      new Int16Array(
        0
      );

    let boundaryNetworkNodeWeights:
      BoundaryNetworkWeights["nodeWeights"] =
      new Float32Array(
        0
      );

    let boundaryNetworkResidualWeights:
      BoundaryNetworkWeights["residualWeights"] =
      new Float32Array(
        0
      );

    let boundaryNetworkInfluenceCounts:
      BoundaryNetworkWeights["influenceCounts"] =
      new Uint8Array(
        0
      );

    let shockwaves:
      Shockwave[] =
      [];

    const shockwaveRadialInfluence =
      new Float32Array(
        MAX_SHOCKWAVES
      );

    const shockwaveAngularCoefficient =
      new Float32Array(
        MAX_SHOCKWAVES
      );

    let canvasRectLeft =
      0;

    let canvasRectTop =
      0;

    let performanceSampleTime =
      0;

    let performanceFrames =
      0;

    /* Last sampled fps (updated every ~1.8s window) — feeds the DPR policy. */
    let latestFps =
      0;

    let lastQualityChange =
      0;

    /*
     * RUNTIME V2 STATE — adaptive quality, explicit cadence, continuous
     * interaction signals, adaptive DPR. Everything below is allocated
     * once per mount and mutated in place; the frame loop performs no
     * per-frame allocations beyond the existing discipline.
     */

    /* Soft-adaptation pressure (0..1): 0 = full budget, 1 = maximum soft reduction. */
    let softPressure =
      0;

    /* Soft-adaptation outputs consumed by the draw path every frame. */
    let activeParticleLimit =
      0;

    let baseParticleCount =
      0;

    let membraneStride =
      1;

    let flowStride =
      1;

    let atmosphereScale =
      1;

    /* Highest node energy, tracked inside updateGrid — drawCore reads it. */
    let highestNodeEnergy =
      0;

    /* Deferred hard rebuild (structural world rebuild on a settled frame). */
    let hardRebuildPending =
      false;

    let hardRebuildTarget:
      QualityName |
      null =
      null;

    let hardRebuildReason =
      "";

    /* Explicit runtime cadence state exposed to telemetry. */
    let runtimeState:
      RuntimeState =
      "ambient";

    /* Continuous interaction signals (Runtime v2). */
    let pointerSpeedPxPerS =
      0;

    let lastPointerMovementAt =
      0;

    let pointerPresentSince =
      0;

    let interactionMemory =
      0;

    /* Adaptive DPR bookkeeping. */
    let dprLastChangeAt =
      0;

    let dprCap =
      2;

    /* Refresh-rate estimator (engineConfig) — replaces raw locals. */
    const refreshEstimator =
      createRefreshEstimator();

    /*
     * Subsystem timing accumulator (Runtime v2.1) — null unless this
     * is a NEXT_PUBLIC_RED_MAGIC_TIMING=1 measurement build. Sums are
     * per WINDOW (reset at every sampling boundary), divided by the
     * drawn-frame count at publication time. Lives outside the frame
     * decision path: when null, every timing branch below folds away.
     */
    const subsystemTiming:
      | RedMagicSubsystemTimings
      | null =
      RED_MAGIC_TIMING
        ? {
            sim: 0,

            grid: 0,

            render: 0,

            membrane: 0,

            network: 0,

            flows: 0,

            core: 0,

            particles: 0
          }
        : null;

    let timingFrameCount =
      0;

    /* Organism-activity coordination throttle (worldSignals). */
    let activityPublishCounter =
      0;

    /*
     * ZERO-ALLOCATION SIGNAL RECORD (v2.1): the render loop used to
     * pass a fresh object literal to interactionTargetEnergy every
     * frame — one allocation per frame in the one component whose
     * discipline treats per-frame garbage as a forbidden regression.
     * The record is allocated once per mount and mutated in place;
     * field writes on a stable monomorphic shape allocate nothing.
     */
    const interactionSignals: InteractionSignals = {
      proximity: 0,

      speed: 0,

      dwell: 0,

      memory: 0,

      charge: 0
    };

    /*
     * REFRESH-RATE AWARENESS (v2.2, hardened in Runtime v2).
     *
     * The estimator itself lives in redmagic/engineConfig.ts
     * (refreshEstimator above): conservative 0 init, sustained-fast
     * adoption, sustained-collapse decay for display-context changes,
     * and clean suspension. Quality thresholds stay RELATIVE to the
     * measured refresh rate; see maybeAdaptQuality.
     */
    let lastAdaptTimestamp =
      0;

    /*
     * V2.1: valid raw inter-frame deltas are collected into this
     * bounded, reused typed-array buffer; the window's representative
     * interval is a robust low percentile of the collected samples
     * (see engineConfig) — one glitch-short RAF can no longer define
     * the display.
     */
    const refreshSampler =
      createRefreshDeltaSampler();

    /*
     * Hysteresis: quality responds to SUSTAINED conditions, not single
     * bad windows. Demotion needs two consecutive bad windows, and
     * promotion needs three consecutive good ones — oscillation like
     * HIGH → LOW → HIGH across neighbouring windows is impossible.
     */
    let demoteStreak =
      0;

    let promoteStreak =
      0;

    let membraneGradient:
      CanvasGradient | null =
      null;

    /*
     * NUCLEUS GRADIENT — allocated ONCE per engine mount, never per
     * frame. CanvasGradient objects are reusable across frames; the
     * per-frame size variation is applied through the canvas transform
     * (gradient coordinates are resolved in user space at fill time),
     * so the rendered result is identical to the previous per-frame
     * createRadialGradient call while allocating zero garbage. This
     * closes the last known per-frame allocation in the core draw
     * path (a forbidden regression under the performance law).
     */
    const nucleusGradient =
      context.createRadialGradient(
        -0.18,
        -0.2,
        0.05,
        0,
        0,
        1
      );

    nucleusGradient.addColorStop(
      0,
      "rgba(255, 214, 108, 0.98)"
    );

    nucleusGradient.addColorStop(
      0.28,
      "rgba(255, 153, 52, 0.96)"
    );

    nucleusGradient.addColorStop(
      0.62,
      "rgba(255, 74, 24, 0.94)"
    );

    nucleusGradient.addColorStop(
      1,
      "rgba(185, 16, 10, 0.72)"
    );

    const profile =
      ORGANISM_PROFILE;

    /*
     * Boundary→network influence tables (v2.1): the table construction
     * is a pure build-time function in redmagic/engineWorld.ts; this
     * closure only rebinds the engine's working references to the
     * freshly built structures (old tables become garbage with the
     * closure that held them).
     */
    const rebuildBoundaryNetworkWeights =
      () => {
        const weights =
          buildBoundaryNetworkWeights(
            membraneBoundary,
            gridNodes
          );

        boundaryNetworkNodeIndices =
          weights.nodeIndices;

        boundaryNetworkNodeWeights =
          weights.nodeWeights;

        boundaryNetworkResidualWeights =
          weights.residualWeights;

        boundaryNetworkInfluenceCounts =
          weights.influenceCounts;
      };

    /*
     * SOFT ADAPTATION (Runtime v2) — immediate, non-structural work
     * reduction inside the current tier. Pressure 0..1 scales:
     * - active particle count (update/draw/impulse loops)
     * - membrane draw stride (coarser stroke, structures intact)
     * - energy-flow draw stride
     * - secondary atmosphere/glow allowance
     * No pools, grids, boundaries or influence tables are touched, so
     * this is safe to apply the moment performance pressure appears —
     * including between frames of an ongoing interaction.
     */
    const applySoftAdaptation =
      () => {
        const pressure =
          softPressure;

        const poolFloor =
          Math.max(
            4,
            Math.round(
              quality.particles *
                SOFT_PARTICLE_FLOOR
            )
          );

        activeParticleLimit =
          Math.max(
            poolFloor,
            Math.round(
              quality.particles *
                (1 - pressure * 0.45)
            )
          );

        membraneStride =
          pressure > 0.55
            ? 2
            : 1;

        flowStride =
          pressure > 0.55
            ? 2
            : 1;

        atmosphereScale =
          quality.atmosphere *
          (1 - pressure * 0.4);
      };

    /*
     * The most recent quality adaptation, published with telemetry.
     * Declared before setQuality/buildWorld, which both write it.
     */
    let lastAdaptation:
      | RedMagicAdaptation
      | null =
      null;

    /*
     * HARD ADAPTATION SCHEDULER (Runtime v2) — structural rebuilds
     * (grid, membrane boundary, particle pools, influence tables) are
     * never executed mid-frame or mid-interaction. They are scheduled
     * here and executed by the render loop on a SETTLED frame:
     * no active pointer, no live shockwaves, no turbulence, no fresh
     * click particles, and (normally) the idle cadence already active.
     * A pending rebuild older than HARD_REBUILD_MAX_WAIT_MS is allowed
     * through on any non-active frame so sustained degradation cannot
     * defer recovery forever on a constantly-hovered canvas.
     */
    const HARD_REBUILD_MAX_WAIT_MS =
      12000;

    let hardRebuildScheduledAt =
      0;

    const scheduleHardRebuild =
      (
        target: QualityName,
        reason: string
      ) => {
        if (
          hardRebuildPending &&
          hardRebuildTarget ===
            target
        ) {
          return;
        }

        hardRebuildPending =
          true;

        hardRebuildTarget =
          target;

        hardRebuildReason =
          reason;

        hardRebuildScheduledAt =
          performance.now();
      };

    /*
     * setQuality (Runtime v2) — two-level adaptation.
     *
     * mode "soft" (default): retarget the budget immediately (flows,
     * particle limit, strides, atmosphere) and — when the new tier
     * needs different structures (grid size, boundary resolution, pool
     * size) — schedule the hard rebuild for the next settled frame.
     * mode "hard": rebuild synchronously. Used on mount, when reduced
     * motion flips (a static frame cannot see a deferred rebuild), and
     * when a resize changes the tier before any interaction exists.
     */
    const setQuality =
      (
        name: QualityName,
        options?: {
          mode?: "soft" | "hard";
          reason?: string;
        }
      ) => {
        const mode =
          options?.mode ?? "soft";

        const reason =
          options?.reason ??
          "unspecified";

        const changed =
          name !== qualityName;

        if (
          !changed &&
          mode === "soft"
        ) {
          return;
        }

        lastAdaptation =
          changed
            ? {
                type:
                  mode === "hard"
                    ? "hard"
                    : "soft",
                from: qualityName,
                to: name,
                reason,
                at:
                  performance.now()
              }
            : lastAdaptation;

        qualityName = name;

        quality =
          QUALITY_BUDGETS[name];

        flowGeometry =
          buildFlowGeometry(
            quality
          );

        dprCap = dprCeilingFor(
          name,
          width * height
        );

        if (
          mode === "hard"
        ) {
          buildWorld(
            name,
            reason
          );

          return;
        }

        /*
         * Soft path: structures from the previous tier keep working
         * (grid/boundary/pools are all self-consistent); the new tier's
         * structure sizes are adopted by the deferred hard rebuild.
         * Until then the soft outputs already deliver a real work
         * reduction — that is the point of the two-level design.
         */
        softPressure =
          name === qualityFromArea(
            width * height
          )
            ? 0
            : 0.35;

        applySoftAdaptation();

        if (changed) {
          scheduleHardRebuild(
            name,
            reason
          );
        }

        lastQualityChange =
          performance.now();
      };

    const buildWorld =
      (
        name: QualityName,
        reason: string = "build"
      ) => {
        qualityName =
          name;

        quality =
          QUALITY_BUDGETS[
            name
          ];

        flowGeometry =
          buildFlowGeometry(
            quality
          );

        particles =
          createParticles(
            quality.particles,
            (
              pageSeed +
              quality.gridSize *
                1009 +
              quality.particles *
                9176
            ) >>>
              0
          );

        clickParticleCount =
          0;

        baseParticleCount =
          particles.length;

        placeParticles(
          particles,
          width,
          height
        );

        const grid =
          createGrid(
            quality.gridSize
          );

        gridNodes =
          grid.nodes;

        gridEdges =
          grid.edges;

        networkBucketIndices =
          [];

        for (
          let bucket = 0;
          bucket <
            NETWORK_BUCKET_COUNT;
          bucket += 1
        ) {
          networkBucketIndices
            .push(
              new Uint16Array(
                gridEdges.length
              )
            );
        }

        networkBucketCounts =
          new Int32Array(
            NETWORK_BUCKET_COUNT
          );

        nodePotential =
          new Float32Array(
            gridNodes.length
          );

        nextNodeEnergy =
          new Float32Array(
            gridNodes.length
          );

        const globalPotentialField =
          buildGlobalPotentialWeights(
            gridNodes
          );

        globalPotential =
          globalPotentialField;

        membraneBoundary =
          createBoundary(
            quality.membraneSteps
          );

        rebuildBoundaryNetworkWeights();

        shockwaves =
          [];

        averageGridEnergy =
          0;

        highestNodeEnergy = 0;

        /*
         * A structural rebuild resets soft adaptation to the new tier's
         * full budget — the hard rebuild IS the recovery path.
         */
        softPressure = 0;

        applySoftAdaptation();

        hardRebuildPending = false;

        hardRebuildTarget = null;

        if (reason !== "build") {
          lastAdaptation = {
            type: "hard",

            from:
              lastAdaptation?.to ?? name,

            to: name,

            reason,

            at:
              performance.now()
          };
        }

        lastQualityChange =
          performance.now();
      };

    const rebuildMembraneGradient =
      () => {
        membraneGradient =
          context.createRadialGradient(
            centerX,
            centerY,
            radius *
              0.35,
            centerX,
            centerY,
            radius *
              1.2
          );

        membraneGradient.addColorStop(
          0,
          "rgba(255, 34, 24, 0)"
        );

        membraneGradient.addColorStop(
          0.64,
          "rgba(190, 0, 0, 0.06)"
        );

        membraneGradient.addColorStop(
          0.9,
          "rgba(255, 38, 25, 0.11)"
        );

        membraneGradient.addColorStop(
          1,
          "rgba(255, 25, 20, 0.01)"
        );
      };

    /*
     * MEASUREMENT RESET (v2.1) — a real geometry or DPR change is a
     * structural event: the open performance window and the refresh
     * sampling window are invalidated so the next window measures the
     * new configuration cleanly. (Hidden-tab suspension uses the same
     * reset; see handleVisibility.)
     */
    const resetPerformanceSampling =
      () => {
        resetRefreshDeltaSampler(
          refreshSampler
        );

        lastAdaptTimestamp = 0;

        performanceSampleTime = 0;

        performanceFrames = 0;

        latestFps = 0;
      };

    /*
     * BACKING STORE (v2.1) — the single bitmap-write path: canvas
     * dimensions from the CURRENT width/height/dpr triple plus the
     * matching transform. resize() calls it unconditionally on a real
     * geometry change (width/height may change while dpr does not —
     * e.g. a 1× display — and the store must still be rewritten);
     * applyDpr() calls it on a pure resolution switch.
     */
    const applyBackingStore =
      () => {
        canvas.width =
          Math.floor(
            width *
              dpr
          );

        canvas.height =
          Math.floor(
            height *
              dpr
          );

        context.setTransform(
          dpr,
          0,
          0,
          dpr,
          0,
          0
        );
      };

    /*
     * APPLY DPR (v2.1) — a PURE resolution switch (no CSS geometry
     * change): new bitmap through applyBackingStore, no world rebuild
     * needed (particles and grid nodes live in CSS pixel space; the
     * membrane gradient's user-space coordinates resolve under the
     * CTM at fill time). The measurement reset stops the sampler from
     * judging the new resolution with the old window's numbers.
     */
    const applyDpr =
      (nextDpr: number) => {
        if (
          nextDpr === dpr
        ) {
          return;
        }

        dpr =
          nextDpr;

        dprLastChangeAt =
          performance.now();

        applyBackingStore();

        resetPerformanceSampling();
      };

    const resize =
      () => {
        const rect =
          canvas.getBoundingClientRect();

        canvasRectLeft =
          rect.left;

        canvasRectTop =
          rect.top;

        const nextWidth =
          Math.max(
            1,
            rect.width
          );

        const nextHeight =
          Math.max(
            1,
            rect.height
          );

        /*
         * ADAPTIVE DPR (Runtime v2): the target resolution derives from
         * the device DPR, canvas area, active quality tier and sustained
         * performance via resolveAdaptiveDpr (engineConfig). The policy
         * itself is debounced (>= 0.25 steps, >= 2.5s between changes,
         * never raising while the engine under-performs), so resolution
         * changes are rare, stable and always real work changes.
         */
        dprCap = dprCeilingFor(
          qualityName,
          nextWidth * nextHeight
        );

        const nextDpr =
          resolveAdaptiveDpr({
            deviceDpr:
              window.devicePixelRatio || 1,
            area: nextWidth * nextHeight,
            quality: qualityName,
            performanceRatio:
              refreshEstimator.estimate > 0
                ? latestFps / refreshEstimator.estimate
                : 0,
            currentDpr: dpr,
            lastChangeAt: dprLastChangeAt,
            now: performance.now()
          });

        /*
         * Perf guard (v3.1.1): ResizeObserver only coalesces within a
         * frame — a continuous window drag delivered up to ~60
         * callbacks/s, and each one reset the canvas backing store,
         * rebuilt the membrane gradient and re-placed every particle
         * and grid node even when the observed size had not actually
         * changed (initial no-op observer callbacks, the duplicate
         * reduced-motion mount call, sub-pixel jitter). Skip the
         * entire reallocation path when width/height/DPR are
         * unchanged; the rect reads above still refresh pointer
         * mapping.
         */
        if (
          nextWidth ===
            width &&
          nextHeight ===
            height &&
          nextDpr ===
            dpr
        ) {
          return;
        }

        width =
          nextWidth;

        height =
          nextHeight;

        /*
         * Real geometry change (v2.1): adopt the resolved DPR (the
         * backing store must be rewritten even when the DPR itself is
         * unchanged — a 1× display resizing its window still needs a
         * new bitmap), then invalidate the measurement windows —
         * resize previously let the open sampler window carry pre-
         * and post-resize frames in one average.
         */
        if (
          nextDpr !== dpr
        ) {
          dpr =
            nextDpr;

          dprLastChangeAt =
            performance.now();
        }

        applyBackingStore();

        resetPerformanceSampling();

        centerX =
          width *
          0.5;

        centerY =
          height *
          0.5;

        radius =
          Math.min(
            width,
            height
          ) *
          0.39;

        rebuildMembraneGradient();

        if (
          gridNodes.length ===
          0
        ) {
          buildWorld(
            qualityFromArea(
              rect.width *
              rect.height
            )
          );
        }

        for (
          let index = 0;
          index <
            gridNodes.length;
          index += 1
        ) {
          const node =
            gridNodes[
              index
            ];

          node.x =
            centerX +
            node.homeX *
              radius;

          node.y =
            centerY +
            node.homeY *
              radius;
        }

        placeParticles(
          particles,
          width,
          height
        );

        /*
         * A resize changed the world geometry. While the loop runs,
         * start() is a no-op and the next frame picks the new size
         * up; under reduced motion the loop is stopped, so this
         * renders one fresh static frame at the new size instead of
         * leaving a stale canvas.
         */
        start();
      };

    /*
     * INTERACTION SIGNAL INTAKE (Runtime v2). Raw pointer events feed a
     * continuous signal model: smoothed pointer speed (px/s), presence
     * duration and a decaying impulse memory. Discrete events (impact,
     * flick, charge, release) lift the signal floor through
     * interactionEnergy — see the render loop for the full model.
     */
    let lastSignalPointerX = 0;

    let lastSignalPointerY = 0;

    let lastSignalPointerAt = 0;

    const updatePointer =
      (
        clientX: number,
        clientY: number
      ) => {
        pointerTarget.x =
          clamp(
            clientX -
              canvasRectLeft,
            0,
            width
          );

        pointerTarget.y =
          clamp(
            clientY -
              canvasRectTop,
            0,
            height
          );

        /*
         * Smoothed pointer speed from consecutive raw events. Event
         * timestamps are wall-clock; the 1..400ms guard rejects both
         * zero-delta coalesced events and stale bursts after tab switches.
         */
        const now =
          performance.now();

        if (
          lastSignalPointerAt >
          0
        ) {
          const dt =
            now -
            lastSignalPointerAt;

          if (
            dt >= 1 &&
            dt <= 400
          ) {
            const dx =
              clientX -
              lastSignalPointerX;

            const dy =
              clientY -
              lastSignalPointerY;

            const eventSpeed =
              (Math.hypot(dx, dy) / dt) * 1000;

            pointerSpeedPxPerS +=
              (eventSpeed - pointerSpeedPxPerS) *
              0.35;
          }
        }

        lastSignalPointerX = clientX;

        lastSignalPointerY = clientY;

        lastSignalPointerAt = now;

        lastPointerMovementAt = now;

        if (
          pointerPresentSince ===
          0
        ) {
          pointerPresentSince = now;
        }
      };

    const updatePointerGeometry =
      () => {
        const dx =
          pointer.x -
          centerX;

        const dy =
          pointer.y -
          centerY;

        pointerDistance =
          Math.hypot(
            dx,
            dy
          );

        if (
          pointerDistance >
          0.0001
        ) {
          pointerAngle =
            Math.atan2(
              dy,
              dx
            );

          pointerAngleSin =
            dy /
            pointerDistance;

          pointerAngleCos =
            dx /
            pointerDistance;
        } else {
          pointerAngle =
            0;

          pointerAngleSin =
            0;

          pointerAngleCos =
            1;
        }

        /*
         * These values are now calculated once per frame rather than
         * once per boundary point.
         */
        boundaryPointerDistanceFactor =
          clamp(
            1 -
              pointerDistance /
                (
                  radius *
                  2.2
                ),
            0,
            1
          );

        boundaryAngularLookup =
          pointerEnergy >
            0.7
            ? ANGULAR_FALLOFF_ACTIVE
            : ANGULAR_FALLOFF_NORMAL;

        boundaryPointerStrength =
          boundaryPointerDistanceFactor *
          0.075 *
          profile.pointerGain;
      };

    const nearestGridNode =
      (
        x: number,
        y: number
      ) => {
        let closest =
          -1;

        let closestDistance =
          Number.POSITIVE_INFINITY;

        for (
          let index = 0;
          index <
            gridNodes.length;
          index += 1
        ) {
          const node =
            gridNodes[
              index
            ];

          const distance =
            distanceSquared(
              x,
              y,
              node.x,
              node.y
            );

          if (
            distance <
            closestDistance
          ) {
            closestDistance =
              distance;

            closest =
              index;
          }
        }

        return closest;
      };

    const spawnShockwave =
      (
        detail:
          RedMagicInteractionDetail,
        strength: number
      ) => {
        const shockwaveAngle =
          Math.atan2(
            detail.y -
              centerY,
            detail.x -
              centerX
          );

        const angleSin =
          Math.sin(
            shockwaveAngle
          );

        const angleCos =
          Math.cos(
            shockwaveAngle
          );

        /*
         * Shockwaves are created only on discrete interaction events,
         * so keeping this exact calculation preserves their visual
         * response without moving the cost into the animation loop.
         */
        const angularInfluence =
          new Float32Array(
            membraneBoundary.length
          );

        for (
          let index = 0;
          index <
            membraneBoundary.length;
          index += 1
        ) {
          const point =
            membraneBoundary[
              index
            ];

          const deltaSin =
            point.sin *
              angleCos -
            point.cos *
              angleSin;

          const deltaCos =
            point.cos *
              angleCos +
            point.sin *
              angleSin;

          const delta =
            Math.atan2(
              deltaSin,
              deltaCos
            );

          angularInfluence[
            index
          ] =
            Math.exp(
              -(
                delta *
                delta
              ) /
                0.34
            );
        }

        shockwaves.push({
          x:
            detail.x,

          y:
            detail.y,

          angle:
            shockwaveAngle,

          age:
            0,

          strength:
            clamp(
              strength *
                profile.shockwaveGain,
              0,
              1.4
            ),

          angularInfluence
        });

        if (
          shockwaves.length >
          MAX_SHOCKWAVES
        ) {
          shockwaves.shift();
        }

        const closest =
          nearestGridNode(
            detail.x,
            detail.y
          );

        if (
          closest <
          0
        ) {
          return;
        }

        const injection =
          clamp(
            strength *
              profile.shockwaveGain,
            0,
            1.2
          );

        gridNodes[
          closest
        ].energy =
          clamp(
            gridNodes[
              closest
            ].energy +
              injection,
            0,
            GRID_MAX_NODE_ENERGY
          );

        const neighbors =
          gridNodes[
            closest
          ].neighbors;

        for (
          let index = 0;
          index <
            neighbors.length;
          index += 1
        ) {
          const neighborIndex =
            neighbors[
              index
            ];

          const neighbor =
            gridNodes[
              neighborIndex
            ];

          neighbor.energy =
            clamp(
              neighbor.energy +
                injection *
                  0.09,
              0,
              GRID_MAX_NODE_ENERGY
            );
        }
      };

    const addClickParticle =
      (
        x: number,
        y: number
      ) => {
        if (
          clickParticleCount >=
          MAX_CLICK_PARTICLES
        ) {
          clickLightBoost =
            CLICK_LIGHT_BOOST_MAX;

          return;
        }

        const particleSeed =
          (
            pageSeed ^
            (
              (
                clickParticleCount +
                1
              ) *
              0x9e3779b9
            )
          ) >>>
            0;

        const created =
          createParticles(
            1,
            particleSeed
          );

        if (
          created.length ===
          0
        ) {
          return;
        }

        const particle =
          created[0];

        particle.x =
          clamp(
            x,
            -PARTICLE_WRAP_MARGIN,
            width +
              PARTICLE_WRAP_MARGIN
          );

        particle.y =
          clamp(
            y,
            -PARTICLE_WRAP_MARGIN,
            height +
              PARTICLE_WRAP_MARGIN
          );

        const dx =
          x -
          centerX;

        const dy =
          y -
          centerY;

        const distance =
          Math.max(
            0.001,
            Math.hypot(
              dx,
              dy
            )
          );

        const normalX =
          dx /
          distance;

        const normalY =
          dy /
          distance;

        const baseKick =
          0.012 +
          Math.min(
            0.04,
            pointerVelocity *
              0.0012
          );

        particle.velocityX +=
          normalX *
          baseKick;

        particle.velocityY +=
          normalY *
          baseKick;

        particle.impulseX +=
          normalX *
          1.4;

        particle.impulseY +=
          normalY *
          1.4;

        particle.revealable =
          false;

        particle.revealStrength =
          1;

        particle.revealRadius =
          1;

        particles.push(
          particle
        );

        clickParticleCount +=
          1;

        clickLightBoost =
          Math.max(
            clickLightBoost,
            0.42
          );
      };

    const applyParticleImpulse =
      (
        detail:
          RedMagicInteractionDetail,
        strength: number
      ) => {
        const influenceRadius =
          radius *
          (
            0.24 +
            detail.proximity *
              0.62
          );

        const influenceRadiusSquared =
          influenceRadius *
          influenceRadius;

        const impulseStrength =
          clamp(
            strength *
              profile.particleImpulse,
            0,
            1.5
          );

        /*
         * Soft adaptation (Runtime v2): impulses skip base-pool
         * particles beyond the active limit; click particles (index
         * >= baseParticleCount) always receive the impulse so
         * interaction feedback never degrades.
         */
        const impulseLimit =
          Math.max(
            0,
            activeParticleLimit
          );

        for (
          let index = 0;
          index <
            particles.length;
          index += 1
        ) {
          if (
            index <
              baseParticleCount &&
            index >=
              impulseLimit
          ) {
            continue;
          }

          const particle =
            particles[
              index
            ];

          const dx =
            particle.x -
            detail.x;

          const dy =
            particle.y -
            detail.y;

          const localDistanceSquared =
            dx * dx +
            dy * dy;

          if (
            localDistanceSquared >
            influenceRadiusSquared
          ) {
            continue;
          }

          const distance =
            Math.sqrt(
              Math.max(
                localDistanceSquared,
                0.0001
              )
            );

          const falloff =
            1 -
            distance /
              influenceRadius;

          const normalizedX =
            dx /
            distance;

          const normalizedY =
            dy /
            distance;

          const localStrength =
            falloff *
            impulseStrength;

          particle.impulseX +=
            normalizedX *
            localStrength;

          particle.impulseY +=
            normalizedY *
            localStrength;

          if (
            detail.energy >
            0.7
          ) {
            const rotational =
              Math.min(
                detail.velocity *
                  0.006,
                0.18
              );

            particle.impulseX +=
              -normalizedY *
              rotational;

            particle.impulseY +=
              normalizedX *
              rotational;
          }
        }
      };

    const handleInteractionEvent =
      (
        event: Event
      ) => {
        const customEvent =
          event as CustomEvent<RedMagicInteractionDetail>;

        const detail =
          customEvent.detail;

        if (!detail) {
          return;
        }

        pointerTarget.x =
          clamp(
            detail.x,
            0,
            width
          );

        pointerTarget.y =
          clamp(
            detail.y,
            0,
            height
          );

        pointerVelocity =
          detail.velocity;

        /*
         * Impulse memory (Runtime v2): discrete events leave a decaying
         * afterglow so the organism's energy falls naturally instead of
         * snapping back the instant the event ends.
         */
        interactionMemory =
          Math.max(
            interactionMemory,
            detail.energy
          );

        interactionTurbulence =
          clamp(
            (
              detail.velocity /
              40
            ) *
              profile.turbulenceGain,
            0,
            1
          );

        interactionEnergy =
          Math.max(
            interactionEnergy,
            detail.energy
          );

        switch (
          detail.type
        ) {
          case "enter":
            pointerActive =
              true;

            if (
              pointerPresentSince ===
              0
            ) {
              pointerPresentSince =
                performance.now();
            }

            interactionEnergy =
              Math.max(
                interactionEnergy,
                0.14
              );

            break;

          case "move":
            pointerActive =
              true;

            break;

          case "impact":
            pointerActive =
              true;

            interactionEnergy =
              Math.max(
                interactionEnergy,
                detail.proximity
              );

            spawnShockwave(
              detail,
              0.62 +
                detail.proximity *
                  0.28
            );

            applyParticleImpulse(
              detail,
              0.48 +
                detail.proximity *
                  0.38
            );

            break;

          case "flick":
            pointerActive =
              true;

            interactionEnergy =
              Math.max(
                interactionEnergy,
                detail.energy
              );

            spawnShockwave(
              detail,
              0.34 +
                clamp(
                  detail.velocity /
                    10,
                  0,
                  0.7
                )
            );

            applyParticleImpulse(
              detail,
              0.72 +
                clamp(
                  detail.velocity /
                    8,
                  0,
                  0.28
                )
            );

            break;

          case "charge":
            pointerHeld =
              true;

            charge =
              detail.charge;

            interactionEnergy =
              Math.max(
                interactionEnergy,
                detail.charge
              );

            break;

          case "release":
            pointerHeld =
              false;

            charge =
              detail.charge;

            interactionEnergy =
              Math.max(
                interactionEnergy,
                detail.charge
              );

            if (
              detail.charge >
              0.08
            ) {
              spawnShockwave(
                detail,
                0.42 +
                  detail.charge *
                    0.58
              );

              applyParticleImpulse(
                detail,
                0.55 +
                  detail.charge *
                    0.9
              );
            }

            break;

          case "orbit":
            pointerActive =
              true;

            interactionTurbulence =
              Math.max(
                interactionTurbulence,
                0.45 *
                  profile.turbulenceGain
              );

            break;

          case "leave":
            pointerActive =
              false;

            pointerHeld =
              false;

            interactionEnergy =
              Math.min(
                interactionEnergy,
                0.35
              );

            charge =
              0;

            /*
             * Signals decay from here: the organism calms down over the
             * following seconds instead of dropping instantly.
             */
            pointerPresentSince = 0;

            pointerSpeedPxPerS = 0;

            lastSignalPointerAt = 0;

            idleSince =
              performance.now();

            break;
        }

        /*
         * Interaction events carry real intent: leave the idle
         * cadence and (under reduced motion) draw one fresh static
         * frame so event-driven state is reflected without a loop.
         */
        if (detail.type !== "leave") {
          idleSince =
            null;
        }

        start();
      };

    const handleCanvasClick =
      (
        event:
          MouseEvent
      ) => {
        const x =
          clamp(
            event.clientX -
              canvasRectLeft,
            0,
            width
          );

        const y =
          clamp(
            event.clientY -
              canvasRectTop,
            0,
            height
          );

        pointerTarget.x =
          x;

        pointerTarget.y =
          y;

        /*
         * Click particles animate through stepDelta, which is
         * permanently zero under reduced motion — spawning them
         * there would leave frozen artifacts. The click still
         * produces one fresh static frame via start().
         */
        if (!reducedMotion) {
          addClickParticle(
            x,
            y
          );
        }

        idleSince =
          null;

        start();
      };

    const updateGrid =
      (
        delta: number,
        time: number
      ) => {
        if (
          gridNodes.length ===
          0
        ) {
          return;
        }

        const deltaScale =
          clamp(
            delta /
              16,
            0,
            2
          );

        const activeProfile =
          ORGANISM_PROFILE;

        const decay =
          Math.pow(
            GRID_ENERGY_DECAY,
            deltaScale *
              activeProfile.recovery
          );

        /*
         * REDUNDANT-WORK ELIMINATION (v2.1): the velocity decay and
         * the breathing position are frame-uniform — Math.pow(0.8, …)
         * was evaluated once per node per frame (49 pow calls at the
         * high tier) and the node position was written twice (the
         * pre-breathing write was dead the moment the breathing write
         * followed). Both now happen once per frame / once per node.
         */
        const velocityDecay =
          Math.pow(
            0.8,
            deltaScale
          );

        for (
          let index = 0;
          index <
            gridNodes.length;
          index += 1
        ) {
          const node =
            gridNodes[
              index
            ];

          node.energy *=
            decay;

          node.velocity *=
            velocityDecay;

          const breathing =
            Math.sin(
              time *
                0.001 +
                node.phase
            );

          const breathingScale =
            1 +
            breathing *
              0.012;

          node.x =
            centerX +
            node.homeX *
              radius *
              breathingScale;

          node.y =
            centerY +
            node.homeY *
              radius *
              breathingScale;
        }

        const nodeCount =
          gridNodes.length;

        /*
         * BOUNDED POTENTIAL (Runtime v2): snapshot the decayed energies
         * into a typed array once, then accumulate each node's potential
         * from its precomputed top-K neighbourhood — no object reads and
         * no all-node pairs inside the hot loop. Replaces the dense N×N
         * weighting pass (measured hotspot; see
         * buildGlobalPotentialWeights for the measurement and model).
         */
        const potentialField =
          globalPotential;

        if (
          potentialField &&
          potentialField.count ===
            nodeCount
        ) {
          const snapshot =
            potentialField.snapshot;

          for (
            let index = 0;
            index <
              nodeCount;
            index += 1
          ) {
            snapshot[index] =
              gridNodes[index].energy;
          }

          const fieldIndices =
            potentialField.indices;

          const fieldWeights =
            potentialField.weights;

          const fieldTotals =
            potentialField.totals;

          const fieldK =
            potentialField.k;

          for (
            let index = 0;
            index <
              nodeCount;
            index += 1
          ) {
            const row =
              index * fieldK;

            let weightedEnergy = 0;

            for (
              let slot = 0;
              slot < fieldK;
              slot += 1
            ) {
              weightedEnergy +=
                snapshot[
                  fieldIndices[
                    row + slot
                  ]
                ] *
                fieldWeights[
                  row + slot
                ];
            }

            const totalWeight =
              fieldTotals[index];

            nodePotential[
              index
            ] =
              totalWeight > 0
                ? clamp(
                    weightedEnergy /
                      totalWeight,
                    0,
                    GRID_MAX_NODE_ENERGY
                  )
                : 0;
          }
        } else {
          /*
           * Fallback (field not built or size mismatch): zero potential
           * keeps the simulation stable until the next buildWorld.
           */
          nodePotential.fill(0);
        }

        /*
         * Seed next-frame energies from the decayed values (v2.1: the
         * previous fill(0) was dead work — the copy below overwrites
         * every element unconditionally).
         */
        for (
          let index = 0;
          index <
            gridNodes.length;
          index += 1
        ) {
          nextNodeEnergy[
            index
          ] =
            gridNodes[
              index
            ].energy;
        }

        for (
          let index = 0;
          index <
            gridEdges.length;
          index += 1
        ) {
          const edge =
            gridEdges[
              index
            ];

          const a =
            gridNodes[
              edge.a
            ];

          const b =
            gridNodes[
              edge.b
            ];

          const energyDifference =
            a.energy -
            b.energy;

          if (
            Math.abs(
              energyDifference
            ) <
            GRID_ENERGY_DECAY *
              0.004
          ) {
            edge.flow *=
              0.86;

            continue;
          }

          const potentialDifference =
            nodePotential[
              edge.a
            ] -
            nodePotential[
              edge.b
            ];

          const directionalDifference =
            energyDifference +
            potentialDifference *
              0.42;

          const sign =
            directionalDifference >=
            0
              ? 1
              : -1;

          const magnitude =
            Math.abs(
              directionalDifference
            );

          const resistance =
            edge.resistance *
            (
              1 +
              edge.flow *
                0.65
            );

          const conductance =
            activeProfile.gridConductance /
            Math.max(
              0.5,
              resistance
            );

          const flow =
            clamp(
              magnitude *
                conductance *
                deltaScale,
              0,
              GRID_FLOW_LIMIT
            );

          if (
            sign > 0
          ) {
            nextNodeEnergy[
              edge.a
            ] -=
              flow;

            nextNodeEnergy[
              edge.b
            ] +=
              flow;
          } else {
            nextNodeEnergy[
              edge.a
            ] +=
              flow;

            nextNodeEnergy[
              edge.b
            ] -=
              flow;
          }

          edge.flow =
            clamp(
              edge.flow *
                0.74 +
                flow *
                  1.8,
              0,
              1
            );

          const nodeVelocity =
            flow /
            Math.max(
              0.02,
              edge.restLength
            );

          a.velocity +=
            nodeVelocity *
            sign *
            0.12;

          b.velocity -=
            nodeVelocity *
            sign *
            0.12;
        }

        for (
          let index = 0;
          index <
            gridNodes.length;
          index += 1
        ) {
          const node =
            gridNodes[
              index
            ];

          if (
            node.energy <
            GRID_IDLE_ENERGY
          ) {
            continue;
          }

          const neighbors =
            node.neighbors;

          const neighborEdges =
            node.neighborEdges;

          if (
            neighbors.length ===
            0
          ) {
            continue;
          }

          let bestNeighbor =
            -1;

          let bestEffort =
            Number.POSITIVE_INFINITY;

          const currentPotential =
            nodePotential[
              index
            ];

          for (
            let neighborIndex = 0;
            neighborIndex <
              neighbors.length;
            neighborIndex += 1
          ) {
            const neighbor =
              neighbors[
                neighborIndex
              ];

            const edgeIndex =
              neighborEdges[
                neighborIndex
              ];

            const edge =
              gridEdges[
                edgeIndex
              ];

            const potentialDifference =
              Math.max(
                0,
                currentPotential -
                  nodePotential[
                    neighbor
                  ]
              );

            const edgeResistance =
              edge.resistance *
              (
                1 +
                edge.flow *
                  0.55
              );

            const effort =
              edgeResistance +
              potentialDifference *
                0.7 -
              nodePotential[
                neighbor
              ] *
                GRID_ROUTE_BONUS;

            if (
              effort <
              bestEffort
            ) {
              bestEffort =
                effort;

              bestNeighbor =
                neighbor;
            }
          }

          if (
            bestNeighbor <
            0
          ) {
            continue;
          }

          const availableEnergy =
            Math.max(
              0,
              nextNodeEnergy[
                index
              ]
            );

          const routeFlow =
            clamp(
              availableEnergy *
                activeProfile.gridConductance *
                0.09 *
                deltaScale,
              0,
              0.035
            );

          nextNodeEnergy[
            index
          ] -=
            routeFlow;

          nextNodeEnergy[
            bestNeighbor
          ] +=
            routeFlow;
        }

        const pointerInfluenceRadius =
          radius *
          GRID_POINTER_RADIUS;

        const pointerInfluenceRadiusSquared =
          pointerInfluenceRadius *
          pointerInfluenceRadius;

        let totalGridEnergy =
          0;

        let frameHighestEnergy = 0;

        for (
          let index = 0;
          index <
            gridNodes.length;
          index += 1
        ) {
          const node =
            gridNodes[
              index
            ];

          const globalTarget =
            nodePotential[
              index
            ] *
            activeProfile.globalPotentialGain;

          let pointerInfluence =
            0;

          if (
            pointerActive
          ) {
            const pointerDistanceSquared =
              distanceSquared(
                pointer.x,
                pointer.y,
                node.x,
                node.y
              );

            if (
              pointerDistanceSquared <
              pointerInfluenceRadiusSquared
            ) {
              pointerInfluence =
                smoothstep(
                  1 -
                    Math.sqrt(
                      pointerDistanceSquared
                    ) /
                      pointerInfluenceRadius
                ) *
                activeProfile.pointerGain;
            }
          }

          const pointerContribution =
            pointerInfluence *
            GRID_POINTER_CONTRIBUTION;

          const organicPulse =
            (
              Math.sin(
                time *
                  0.0015 +
                  node.phase
              ) +
              1
            ) *
            0.5 *
            0.003;

          nextNodeEnergy[
            index
          ] +=
            globalTarget *
              deltaScale +
            pointerContribution *
              deltaScale +
            organicPulse *
              deltaScale;

          node.energy =
            clamp(
              nextNodeEnergy[
                index
              ],
              0,
              GRID_MAX_NODE_ENERGY
            );

          if (
            node.energy >
            frameHighestEnergy
          ) {
            frameHighestEnergy =
              node.energy;
          }

          totalGridEnergy +=
            node.energy;

          node.velocity *=
            0.96;

          if (
            node.energy >
            0.03
          ) {
            node.velocity +=
              node.energy *
              0.01;
          }
        }

        averageGridEnergy =
          gridNodes.length >
          0
            ? totalGridEnergy /
              gridNodes.length
            : 0;

        /*
         * Track the aggregate during the update step (Runtime v2):
         * drawCore previously re-scanned every node every frame just
         * to recover this maximum — pure redundant hot-path work.
         */
        highestNodeEnergy =
          frameHighestEnergy;
      };

    const prepareShockwaveFrame =
      () => {
        const shockwaveCount =
          shockwaves.length;

        if (
          shockwaveCount ===
          0
        ) {
          return;
        }

        const pointRadius =
          radius *
          0.9;

        const widthFactor =
          radius *
          0.11;

        const widthSquared =
          Math.max(
            1,
            widthFactor *
              widthFactor
          );

        for (
          let index = 0;
          index <
            shockwaveCount;
          index += 1
        ) {
          const shockwave =
            shockwaves[
              index
            ];

          const progress =
            clamp(
              shockwave.age /
                SHOCKWAVE_DURATION,
              0,
              1
            );

          const currentRadius =
            radius *
            (
              0.08 +
              progress *
                1.05
            );

          const waveOffset =
            pointRadius -
            currentRadius;

          shockwaveRadialInfluence[
            index
          ] =
            Math.exp(
              -(
                waveOffset *
                waveOffset
              ) /
                widthSquared
            );

          shockwaveAngularCoefficient[
            index
          ] =
            (
              1 -
              progress
            ) *
            shockwave.strength *
            0.1352;
        }
      };

    const getBoundaryRadius =
      (
        point:
          BoundaryPoint
      ) => {
        const primaryWave =
          (
            point.sin3 *
              boundaryPrimaryPhaseCos +
            point.cos3 *
              boundaryPrimaryPhaseSin
          ) *
          0.034;

        const secondaryWave =
          (
            point.sin7 *
              boundarySecondaryPhaseCos +
            point.cos7 *
              boundarySecondaryPhaseSin
          ) *
          0.022;

        const tertiaryWave =
          (
            point.sin11 *
              boundaryTertiaryPhaseCos +
            point.cos11 *
              boundaryTertiaryPhaseSin
          ) *
          0.012;

        let interaction =
          0;

        /*
         * The old hot path performed:
         *
         *   atan2(...)
         *   exp(...)
         *
         * for every boundary point.
         *
         * Now:
         * - point.angle is already precomputed
         * - pointerAngle is computed once per frame
         * - wrapped angular delta uses simple branches
         * - Gaussian response is sampled from a lookup table
         */
        if (
          pointerActive &&
          pointerDistance >
            0.0001 &&
          boundaryPointerStrength >
            0
        ) {
          let delta =
            point.angle -
            pointerAngle;

          if (
            delta >
            Math.PI
          ) {
            delta -=
              TAU;
          } else if (
            delta <
            -Math.PI
          ) {
            delta +=
              TAU;
          }

          interaction =
            sampleAngularLookup(
              delta,
              boundaryAngularLookup
            ) *
            boundaryPointerStrength;
        }

        const turbulenceWave =
          (
            point.sin13 *
              boundaryTurbulencePhaseCos +
            point.cos13 *
              boundaryTurbulencePhaseSin
          );

        const turbulence =
          interactionTurbulence *
          (
            0.012 +
            turbulenceWave *
              0.008
          );

        const influenceCapacity =
          Math.min(
            MAX_NETWORK_INFLUENCES,
            gridNodes.length
          );

        let networkDeformation =
          averageGridEnergy *
          boundaryNetworkResidualWeights[
            point.fieldIndex
          ];

        const networkOffset =
          point.fieldIndex *
          influenceCapacity;

        const influenceCount =
          boundaryNetworkInfluenceCounts[
            point.fieldIndex
          ];

        for (
          let index = 0;
          index <
            influenceCount;
          index += 1
        ) {
          const nodeIndex =
            boundaryNetworkNodeIndices[
              networkOffset +
                index
            ];

          if (
            nodeIndex <
            0
          ) {
            continue;
          }

          networkDeformation +=
            gridNodes[
              nodeIndex
            ].energy *
            boundaryNetworkNodeWeights[
              networkOffset +
                index
            ];
        }

        let shockwaveDeformation =
          0;

        const shockwaveCount =
          shockwaves.length;

        for (
          let index = 0;
          index <
            shockwaveCount;
          index += 1
        ) {
          const shockwave =
            shockwaves[
              index
            ];

          shockwaveDeformation +=
            shockwaveRadialInfluence[
              index
            ] *
            shockwave.angularInfluence[
              point.fieldIndex
            ] *
            shockwaveAngularCoefficient[
              index
            ];
        }

        return (
          1 +
          primaryWave +
          secondaryWave +
          tertiaryWave +
          interaction +
          turbulence +
          networkDeformation +
          shockwaveDeformation
        );
      };

    const drawGlow =
      (
        x: number,
        y: number,
        innerRadius: number,
        outerRadius: number,
        alpha: number
      ) => {
        const boostedAlpha =
          clamp(
            alpha *
              (
                1 +
                clickLightBoost *
                  0.7
              ),
            0,
            1
          );

        if (
          glowSprite
        ) {
          context.globalAlpha =
            boostedAlpha;

          context.drawImage(
            glowSprite,
            x -
              outerRadius,
            y -
              outerRadius,
            outerRadius *
              2,
            outerRadius *
              2
          );

          context.globalAlpha =
            1;

          return;
        }

        const gradient =
          context.createRadialGradient(
            x,
            y,
            innerRadius,
            x,
            y,
            outerRadius
          );

        gradient.addColorStop(
          0,
          `rgba(255, 80, 20, ${boostedAlpha})`
        );

        gradient.addColorStop(
          0.35,
          `rgba(255, 28, 12, ${
            boostedAlpha *
            0.46
          })`
        );

        gradient.addColorStop(
          1,
          "rgba(255, 0, 0, 0)"
        );

        context.fillStyle =
          gradient;

        context.beginPath();

        context.arc(
          x,
          y,
          outerRadius,
          0,
          TAU
        );

        context.fill();
      };

    const drawNodeCore =
      (
        x: number,
        y: number,
        radiusValue: number,
        alpha: number
      ) => {
        const boostedAlpha =
          clamp(
            alpha *
              (
                1 +
                clickLightBoost *
                  0.55
              ),
            0,
            1
          );

        if (
          !nodeSprite
        ) {
          context.globalAlpha =
            boostedAlpha;

          context.fillStyle =
            "rgba(255, 92, 70, 1)";

          context.beginPath();

          context.arc(
            x,
            y,
            radiusValue,
            0,
            TAU
          );

          context.fill();

          context.globalAlpha =
            1;

          return;
        }

        const diameter =
          Math.max(
            2.4,
            radiusValue *
              2
          );

        context.globalAlpha =
          boostedAlpha;

        context.drawImage(
          nodeSprite,
          x -
            diameter *
              0.5,
          y -
            diameter *
              0.5,
          diameter,
          diameter
        );

        context.globalAlpha =
          1;
      };

    const drawNetwork =
      (
        time: number
      ) => {
        if (
          gridNodes.length ===
          0
        ) {
          return;
        }

        context.lineCap =
          "round";

        context.lineJoin =
          "round";

        /*
         * CLASSIFY PASS (v2.1): one sweep decides each edge's stroke
         * bucket AND records its index in that bucket's preallocated
         * index list — the draw passes below walk only their own
         * members instead of re-scanning the full edge array once per
         * bucket (the pre-v2.1 path performed six full sweeps).
         */
        networkBucketCounts
          .fill(
            0
          );

        for (
          let index = 0;
          index <
            gridEdges.length;
          index += 1
        ) {
          const edge =
            gridEdges[
              index
            ];

          const a =
            gridNodes[
              edge.a
            ];

          const b =
            gridNodes[
              edge.b
            ];

          const energy =
            (
              a.energy +
              b.energy
            ) *
            0.5;

          const active =
            clamp(
              energy *
                1.8 +
                edge.flow *
                  1.4,
              0,
              1
            );

          let bucket =
            4;

          if (
            active <
            0.01
          ) {
            bucket =
              0;
          } else if (
            active <
            0.12
          ) {
            bucket =
              1;
          } else if (
            active <
            0.3
          ) {
            bucket =
              2;
          } else if (
            active <
            0.62
          ) {
            bucket =
              3;
          }

          networkBucketIndices[
            bucket
          ][
            networkBucketCounts[
              bucket
            ]
          ] =
            index;

          networkBucketCounts[
            bucket
          ] +=
            1;
        }

        const lightMultiplier =
          1 +
          clickLightBoost *
            0.75;

        if (
          networkBucketCounts[
            0
          ] >
            0
        ) {
          context.beginPath();

          const bucketList =
            networkBucketIndices[
              0
            ];

          const bucketCount =
            networkBucketCounts[
              0
            ];

          for (
            let member = 0;
            member <
              bucketCount;
            member += 1
          ) {
            const edge =
              gridEdges[
                bucketList[
                  member
                ]
              ];

            const a =
              gridNodes[
                edge.a
              ];

            const b =
              gridNodes[
                edge.b
              ];

            context.moveTo(
              a.x,
              a.y
            );

            context.lineTo(
              b.x,
              b.y
            );
          }

          context.globalAlpha =
            0.012 *
            lightMultiplier;

          context.lineWidth =
            0.4;

          context.strokeStyle =
            "rgba(115, 18, 18, 1)";

          context.stroke();
        }

        if (
          networkBucketCounts[
            1
          ] >
            0
        ) {
          context.beginPath();

          const bucketList =
            networkBucketIndices[
              1
            ];

          const bucketCount =
            networkBucketCounts[
              1
            ];

          for (
            let member = 0;
            member <
              bucketCount;
            member += 1
          ) {
            const edge =
              gridEdges[
                bucketList[
                  member
                ]
              ];

            const a =
              gridNodes[
                edge.a
              ];

            const b =
              gridNodes[
                edge.b
              ];

            context.moveTo(
              a.x,
              a.y
            );

            context.lineTo(
              b.x,
              b.y
            );
          }

          context.globalAlpha =
            0.028 *
            lightMultiplier;

          context.lineWidth =
            0.46;

          context.strokeStyle =
            "rgba(255, 70, 52, 1)";

          context.stroke();
        }

        if (
          networkBucketCounts[
            2
          ] >
            0
        ) {
          context.beginPath();

          const bucketList =
            networkBucketIndices[
              2
            ];

          const bucketCount =
            networkBucketCounts[
              2
            ];

          for (
            let member = 0;
            member <
              bucketCount;
            member += 1
          ) {
            const edge =
              gridEdges[
                bucketList[
                  member
                ]
              ];

            const a =
              gridNodes[
                edge.a
              ];

            const b =
              gridNodes[
                edge.b
              ];

            context.moveTo(
              a.x,
              a.y
            );

            context.lineTo(
              b.x,
              b.y
            );
          }

          context.globalAlpha =
            0.052 *
            lightMultiplier;

          context.lineWidth =
            0.56;

          context.strokeStyle =
            "rgba(255, 70, 52, 1)";

          context.stroke();
        }

        if (
          networkBucketCounts[
            3
          ] >
            0
        ) {
          context.beginPath();

          const bucketList =
            networkBucketIndices[
              3
            ];

          const bucketCount =
            networkBucketCounts[
              3
            ];

          for (
            let member = 0;
            member <
              bucketCount;
            member += 1
          ) {
            const edge =
              gridEdges[
                bucketList[
                  member
                ]
              ];

            const a =
              gridNodes[
                edge.a
              ];

            const b =
              gridNodes[
                edge.b
              ];

            context.moveTo(
              a.x,
              a.y
            );

            context.lineTo(
              b.x,
              b.y
            );
          }

          context.globalAlpha =
            0.092 *
            lightMultiplier;

          context.lineWidth =
            0.72;

          context.strokeStyle =
            "rgba(255, 70, 52, 1)";

          context.stroke();
        }

        if (
          networkBucketCounts[
            4
          ] >
            0
        ) {
          context.beginPath();

          const bucketList =
            networkBucketIndices[
              4
            ];

          const bucketCount =
            networkBucketCounts[
              4
            ];

          for (
            let member = 0;
            member <
              bucketCount;
            member += 1
          ) {
            const edge =
              gridEdges[
                bucketList[
                  member
                ]
              ];

            const a =
              gridNodes[
                edge.a
              ];

            const b =
              gridNodes[
                edge.b
              ];

            context.moveTo(
              a.x,
              a.y
            );

            context.lineTo(
              b.x,
              b.y
            );
          }

          context.globalAlpha =
            0.13 *
            lightMultiplier;

          context.lineWidth =
            1.1;

          context.strokeStyle =
            "rgba(255, 70, 52, 1)";

          context.stroke();
        }


        for (
          let index = 0;
          index <
            gridNodes.length;
          index += 1
        ) {
          const node =
            gridNodes[
              index
            ];

          const potential =
            nodePotential[
              index
            ];

          const energy =
            node.energy;

          const localPulse =
            1 +
            Math.sin(
              time *
                0.003 +
                node.phase
            ) *
              0.12;

          const nodeRadius =
            (
              1.5 +
              energy *
                4.2 +
              potential *
                1.5
            ) *
            localPulse;

          const nodeAlpha =
            clamp(
              (
                0.24 +
                energy *
                  0.72 +
                potential *
                  0.16
              ) *
                (
                  1 +
                  clickLightBoost *
                    0.55
                ),
              0,
              1
            );

          drawNodeCore(
            node.x,
            node.y,
            Math.max(
              1.2,
              nodeRadius
            ),
            nodeAlpha
          );

          /*
           * Budget-gated glow pass (Runtime v2): the node-glow sprite
           * layer is part of the atmosphere allocation. Lower tiers
           * raise the energy floor and soft adaptation scales the
           * alpha — the cheap line network stays, the expensive glow
           * layer degrades first.
           */
          if (
            energy >
              quality.nodeGlowFloor &&
            atmosphereScale >
              0.25
          ) {
            drawGlow(
              node.x,
              node.y,
              0,
              nodeRadius *
                (
                  3.2 +
                  energy *
                    2
                ),
              (
                0.028 +
                energy *
                  0.07
              ) *
                atmosphereScale
            );
          }
        }

        context.globalAlpha =
          1;
      };

    const drawInteraction =
      () => {
        if (
          !pointerActive &&
          pointerEnergy <=
            0.01 &&
          shockwaves.length ===
            0
        ) {
          return;
        }

        const fieldRadius =
          radius *
          (
            0.25 +
            pointerEnergy *
              0.8 +
            interactionTurbulence *
              0.18 +
            charge *
              0.18
          ) *
          profile.pointerGain;

        const visualPointerX =
          pointerTarget.x;

        const visualPointerY =
          pointerTarget.y;

        if (
          pointerActive &&
          interactionSprite
        ) {
          context.globalAlpha =
            (
              0.04 +
              pointerEnergy *
                0.065
            ) *
            (
              1 +
              clickLightBoost *
                0.7
            );

          context.drawImage(
            interactionSprite,
            visualPointerX -
              fieldRadius,
            visualPointerY -
              fieldRadius,
            fieldRadius *
              2,
            fieldRadius *
              2
          );

          context.globalAlpha =
            1;
        } else if (
          pointerActive
        ) {
          drawGlow(
            visualPointerX,
            visualPointerY,
            0,
            fieldRadius,
            0.045 +
              pointerEnergy *
                0.06
          );
        }

        for (
          let index = 0;
          index <
            shockwaves.length;
          index += 1
        ) {
          const shockwave =
            shockwaves[
              index
            ];

          const progress =
            clamp(
              shockwave.age /
                SHOCKWAVE_DURATION,
              0,
              1
            );

          const waveRadius =
            radius *
            (
              0.08 +
              progress *
                1.05
            );

          context.globalAlpha =
            (
              1 -
              progress
            ) *
            shockwave.strength *
            0.38 *
            (
              1 +
              clickLightBoost *
                0.55
            );

          context.lineWidth =
            1 +
            shockwave.strength *
              1.5;

          context.strokeStyle =
            "rgba(255, 74, 54, 1)";

          context.beginPath();

          context.arc(
            shockwave.x,
            shockwave.y,
            waveRadius,
            0,
            TAU
          );

          context.stroke();

          const innerRadius =
            waveRadius *
            0.92;

          context.globalAlpha *=
            0.25;

          context.lineWidth *=
            0.55;

          context.beginPath();

          context.arc(
            shockwave.x,
            shockwave.y,
            innerRadius,
            0,
            TAU
          );

          context.stroke();
        }

        context.globalAlpha =
          1;
      };

    const drawMembrane =
      (
        time: number
      ) => {
        prepareShockwaveFrame();

        const primaryPhase =
          time *
          0.0011;

        boundaryPrimaryPhaseSin =
          Math.sin(
            primaryPhase
          );

        boundaryPrimaryPhaseCos =
          Math.cos(
            primaryPhase
          );

        const secondaryPhase =
          1.3 -
          time *
            0.0008;

        boundarySecondaryPhaseSin =
          Math.sin(
            secondaryPhase
          );

        boundarySecondaryPhaseCos =
          Math.cos(
            secondaryPhase
          );

        const tertiaryPhase =
          time *
          0.00065;

        boundaryTertiaryPhaseSin =
          Math.sin(
            tertiaryPhase
          );

        boundaryTertiaryPhaseCos =
          Math.cos(
            tertiaryPhase
          );

        const turbulencePhase =
          time *
            0.004 +
          pointerAngle *
            2;

        boundaryTurbulencePhaseSin =
          Math.sin(
            turbulencePhase
          );

        boundaryTurbulencePhaseCos =
          Math.cos(
            turbulencePhase
          );

        context.beginPath();

        /*
         * Membrane draw stride (Runtime v2 soft adaptation): under soft
         * pressure the stroke is drawn every second point. The boundary
         * structures and influence tables stay intact — only the stroke
         * resolution drops, so recovery is instant and lossless.
         */
        const boundaryStride =
          membraneStride;

        for (
          let index = 0;
          index <
            membraneBoundary.length;
          index += boundaryStride
        ) {
          const point =
            membraneBoundary[
              index
            ];

          const normalizedRadius =
            getBoundaryRadius(
              point
            ) *
            radius;

          const x =
            centerX +
            point.cos *
              normalizedRadius;

          const y =
            centerY +
            point.sin *
              normalizedRadius;

          if (
            index ===
            0
          ) {
            context.moveTo(
              x,
              y
            );
          } else {
            context.lineTo(
              x,
              y
            );
          }
        }

        context.closePath();

        if (
          membraneGradient
        ) {
          context.fillStyle =
            membraneGradient;

          context.globalAlpha =
            1 +
            clickLightBoost *
              0.3;

          context.fill();

          context.globalAlpha =
            1;
        }

        const lightMultiplier =
          1 +
          clickLightBoost *
            0.65;

        /*
         * STRING-FREE STROKES (v2.1): the stroke colour used to be
         * rebuilt from a template literal every frame — two fresh
         * strings per frame here, one more in drawEnergyFlows. The
         * strokeStyle is now a constant and the light multiplier is
         * applied through globalAlpha, which composites identically
         * (source alpha = strokeStyle alpha × globalAlpha) while
         * allocating nothing.
         */
        context.lineWidth =
          reducedMotion
            ? 1.2
            : 1.6;

        context.strokeStyle =
          "rgb(255, 55, 40)";

        context.globalAlpha =
          0.68 *
          lightMultiplier;

        context.stroke();

        context.lineWidth =
          4;

        context.strokeStyle =
          "rgb(125, 0, 0)";

        context.globalAlpha =
          0.12 *
          lightMultiplier;

        context.stroke();

        context.globalAlpha =
          1;
      };

    const drawEnergyFlows =
      (
        time: number
      ) => {
        const flowCount =
          quality.flowCount;

        if (
          flowCount ===
          0
        ) {
          return;
        }

        const flowSegments =
          quality.flowSegments;

        const geometry =
          flowGeometry;

        const angleTime =
          time *
          0.0012;

        const waveTime =
          time *
          0.0017;

        const angleTimeSin =
          Math.sin(
            angleTime
          );

        const angleTimeCos =
          Math.cos(
            angleTime
          );

        const waveTimeSin =
          Math.sin(
            waveTime
          );

        const waveTimeCos =
          Math.cos(
            waveTime
          );

        const angleAmplitude =
          0.05 +
          interactionTurbulence *
            0.018;

        const waveAmplitude =
          radius *
          (
            0.025 +
            interactionTurbulence *
              0.016
          );

        context.lineWidth =
          (
            0.8 +
            pointerEnergy *
              0.8 +
            interactionTurbulence *
              0.5
          );

        /* String-free stroke (v2.1): constant colour, alpha via globalAlpha. */
        context.strokeStyle =
          "rgb(255, 70, 48)";

        context.globalAlpha =
          (
            0.08 +
            pointerEnergy *
              0.05 +
            interactionTurbulence *
              0.035
          ) *
          (
            1 +
            clickLightBoost *
              0.65
          );

        context.beginPath();

        for (
          let index = 0;
          index <
            flowCount;
          index += 1
        ) {
          const direction =
            geometry.directions[
              index
            ];

          const baseAngle =
            geometry.baseAngles[
              index
            ] +
            time *
              0.00016 *
              direction +
            interactionTurbulence *
              0.04 *
              direction;

          const baseSin =
            Math.sin(
              baseAngle
            );

          const baseCos =
            Math.cos(
              baseAngle
            );

          const flowOffset =
            index *
            (
              flowSegments +
              1
            );

          /*
           * Flow draw stride (Runtime v2 soft adaptation): coarser
           * point sampling under pressure; geometry arrays are intact
           * so the stride restores to 1 losslessly.
           */
          const segmentStride =
            flowStride;

          for (
            let segment = 0;
            segment <= flowSegments;
            segment += segmentStride
          ) {
            const pointIndex =
              flowOffset +
              segment;

            const phaseSin =
              geometry.anglePhaseSin[
                pointIndex
              ] *
                angleTimeCos +
              geometry.anglePhaseCos[
                pointIndex
              ] *
                angleTimeSin;

            const angleOffset =
              phaseSin *
              angleAmplitude;

            const angleOffsetSquared =
              angleOffset *
              angleOffset;

            const offsetSin =
              angleOffset -
              angleOffset *
                angleOffsetSquared /
                6;

            const offsetCos =
              1 -
              angleOffsetSquared *
                0.5;

            const directionX =
              baseCos *
                offsetCos -
              baseSin *
                offsetSin;

            const directionY =
              baseSin *
                offsetCos +
              baseCos *
                offsetSin;

            const waveSin =
              geometry.wavePhaseSin[
                pointIndex
              ] *
                waveTimeCos +
              geometry.wavePhaseCos[
                pointIndex
              ] *
                waveTimeSin;

            const radialDistance =
              geometry.distanceScales[
                pointIndex
              ] *
              radius +
              waveSin *
                waveAmplitude;

            const x =
              centerX +
              directionX *
                radialDistance;

            const y =
              centerY +
              directionY *
                radialDistance;

            if (
              segment ===
              0
            ) {
              context.moveTo(
                x,
                y
              );
            } else {
              context.lineTo(
                x,
                y
              );
            }
          }
        }

        context.stroke();

        context.globalAlpha =
          1;
      };

    /*
     * Reused draw-options record (perf, v3.1.1): the draw loop calls
     * this once per animated frame; the previous object literal
     * allocated a fresh 14-property object every frame inside the one
     * component whose own allocation discipline treats per-frame
     * garbage as a forbidden regression. Field writes on a stable
     * monomorphic shape allocate nothing.
     *
     * Runtime v2 adds `activeLimit`/`baseCount`: soft adaptation draws
     * only the first `activeLimit` pool particles; click particles
     * (appended beyond the base pool) always update and draw.
     */
    const particleDrawOptions = {
      context,

      particles,

      width,
      height,

      centerX,
      centerY,
      radius,

      pointer,
      pointerActive,

      pointerEnergy,
      charge,

      profile,

      time: 0,
      delta: 0,

      reducedMotion,

      activeLimit: 0,

      baseCount: 0
    };

    const drawParticles =
      (
        time: number,
        delta: number
      ) => {
        particleDrawOptions.width =
          width;

        particleDrawOptions.height =
          height;

        particleDrawOptions.centerX =
          centerX;

        particleDrawOptions.centerY =
          centerY;

        particleDrawOptions.radius =
          radius;

        particleDrawOptions.pointer =
          pointer;

        particleDrawOptions.pointerActive =
          pointerActive;

        particleDrawOptions.pointerEnergy =
          pointerEnergy;

        particleDrawOptions.charge =
          charge;

        particleDrawOptions.time =
          time;

        particleDrawOptions.delta =
          delta;

        particleDrawOptions.activeLimit =
          activeParticleLimit;

        particleDrawOptions.baseCount =
          baseParticleCount;

        updateAndDrawParticles(
          particleDrawOptions
        );
      };

    const drawCore =
      (
        time: number
      ) => {
        const pulse =
          1 +
          Math.sin(
            time *
              0.0022
          ) *
            0.035 +
          Math.sin(
            time *
              0.0049
          ) *
            0.012;

        /*
         * Highest node energy arrives tracked from updateGrid (Runtime
         * v2) — the per-frame re-scan of every grid node that used to
         * live here is gone; the aggregate is produced where the
         * energies are already in registers.
         */
        const highestGridEnergy =
          highestNodeEnergy;

        const activePulse =
          pointerEnergy *
            0.11 *
            profile.coreGain +
          charge *
            0.18 *
            profile.coreGain +
          interactionTurbulence *
            0.035 +
          pointerVelocity *
            0.003 *
            profile.coreGain +
          averageGridEnergy *
            0.09 +
          highestGridEnergy *
            0.035 +
          clickLightBoost *
            0.06;

        const solarBreathing =
          1 +
          Math.sin(
            time *
              CORE_MOVEMENT_SPEED
          ) *
            CORE_MOVEMENT_AMPLITUDE +
          Math.sin(
            time *
              0.0029
          ) *
            0.004;

        const movementEnergy =
          clamp(
            (
              pointerEnergy *
                0.08 +
              charge *
                0.12 +
              averageGridEnergy *
                0.035 +
              interactionTurbulence *
                0.03 +
              clickLightBoost *
                0.035
            ) *
              profile.coreGain,
            0,
            0.18
          );

        const coreRadius =
          radius *
          0.49 *
          (
            pulse +
            activePulse
          ) *
          solarBreathing;

        const coreRotation =
          time *
          CORE_ROTATION_SPEED;

        const detailRotation =
          time *
          CORE_DETAIL_ROTATION_SPEED;

        const dynamicScale =
          1 +
          movementEnergy;

        drawGlow(
          centerX,
          centerY,
          coreRadius *
            0.08,
          coreRadius *
            (
              1.72 +
              movementEnergy *
                1.8
            ),
          0.11 +
            pointerEnergy *
              0.04 *
              profile.coreGain +
            charge *
              0.035 +
            averageGridEnergy *
              0.04 +
            movementEnergy *
              0.09
        );

        if (
          charge >
            0.01 &&
          atmosphereScale >
            0.3
        ) {
          drawGlow(
            centerX,
            centerY,
            coreRadius *
              0.2,
            coreRadius *
              (
                1.9 +
                charge *
                  1.2
              ),
            (
              0.055 +
              charge *
                0.09
            ) *
              atmosphereScale
          );
        }

        if (
          coreSprite
        ) {
          context.save();

          context.globalAlpha =
            1;

          context.translate(
            centerX,
            centerY
          );

          context.rotate(
            coreRotation
          );

          context.scale(
            dynamicScale,
            dynamicScale
          );

          context.drawImage(
            coreSprite,
            -coreRadius,
            -coreRadius,
            coreRadius *
              2,
            coreRadius *
              2
          );

          context.restore();
        }

        if (
          coreDetailSprite
        ) {
          context.save();

          context.globalAlpha =
            clamp(
              (
                0.42 +
                pointerEnergy *
                  0.14 +
                interactionTurbulence *
                  0.1 +
                charge *
                  0.08
              ) *
                (
                  1 +
                  clickLightBoost *
                    0.35
                ),
              0,
              1
            );

          context.translate(
            centerX,
            centerY
          );

          context.rotate(
            detailRotation
          );

          context.scale(
            1 +
              movementEnergy *
                0.45,
            1 +
              movementEnergy *
                0.45
          );

          context.drawImage(
            coreDetailSprite,
            -coreRadius,
            -coreRadius,
            coreRadius *
              2,
            coreRadius *
              2
          );

          context.restore();

          context.globalAlpha =
            1;
        }

        const nucleusRadius =
          radius *
          0.17 *
          (
            1 +
            Math.sin(
              time *
                0.0036
            ) *
              0.08 +
            charge *
              0.25 +
            averageGridEnergy *
              0.12 +
            movementEnergy *
              0.35 +
            clickLightBoost *
              0.1
          );

        drawGlow(
          centerX,
          centerY,
          nucleusRadius *
            0.1,
          nucleusRadius *
            2.2,
          (
            0.09 +
            pointerEnergy *
              0.05 +
            averageGridEnergy *
              0.04 +
            movementEnergy *
              0.05
          ) *
            atmosphereScale
        );

        /*
         * Fill the nucleus through the cached gradient. The transform
         * maps one unit of user space onto nucleusRadius device
         * pixels, reproducing the original per-frame gradient geometry
         * exactly:
         *   gradient inner center  (−0.18r, −0.2r), inner radius 0.05r
         *   gradient outer center  (0, 0),        outer radius r
         *   fill arc center        (−0.08r, −0.1r), radius (0.9+me·0.3)r
         */
        context.save();

        context.translate(
          centerX,
          centerY
        );

        context.scale(
          nucleusRadius,
          nucleusRadius
        );

        context.fillStyle =
          nucleusGradient;

        context.globalAlpha =
          clamp(
            0.94 +
              clickLightBoost *
                0.08,
            0,
            1
          );

        context.beginPath();

        context.arc(
          -0.08,
          -0.1,
          0.9 +
            movementEnergy *
              0.3,
          0,
          TAU
        );

        context.fill();

        context.restore();

        context.globalAlpha =
          1;
      };

    const updatePhysicalState =
      (
        delta: number
      ) => {
        const interactionRecovery =
          profile.recovery;

        interactionTurbulence *=
          Math.pow(
            0.92,
            delta /
              16
          );

        pointerVelocity *=
          Math.pow(
            0.84,
            delta /
              16
          );

        /*
         * Runtime v2: interactionEnergy is a decaying EVENT FLOOR, not
         * a follower of pointerEnergy. Discrete events lift it; it then
         * decays with its own memory so energy falls naturally after a
         * burst instead of being pinned near its peak.
         */
        interactionEnergy *=
          Math.pow(
            0.988,
            delta /
              16
          );

        if (
          interactionEnergy <
          0.004
        ) {
          interactionEnergy = 0;
        }

        clickLightBoost *=
          Math.pow(
            CLICK_LIGHT_DECAY,
            delta /
              CLICK_LIGHT_DECAY_REFERENCE_MS
          );

        if (
          clickLightBoost <
          0.001
        ) {
          clickLightBoost =
            0;
        }

        if (
          !pointerActive
        ) {
          charge *=
            Math.pow(
              0.94,
              delta /
                16
            );
        }

        const timingGridStart =
          subsystemTiming !== null
            ? performance.now()
            : 0;

        updateGrid(
          delta *
            interactionRecovery,
          elapsed
        );

        if (
          subsystemTiming !== null
        ) {
          subsystemTiming.grid +=
            performance.now() -
            timingGridStart;
        }

        for (
          let index =
            shockwaves.length -
            1;
          index >=
            0;
          index -= 1
        ) {
          const shockwave =
            shockwaves[
              index
            ];

          shockwave.age +=
            delta *
            interactionRecovery;

          if (
            shockwave.age >
            SHOCKWAVE_DURATION
          ) {
            shockwaves.splice(
              index,
              1
            );
          }
        }
      };

    /*
     * maybeAdaptQuality (Runtime v2) — the engine's measurement and
     * adaptation controller.
     *
     * Sampling: raw inter-frame deltas feed the refresh estimator and a
     * ~1.8s fps window. IDLE-CADENCE FRAMES ARE EXCLUDED: an organism
     * deliberately redrawing at 33ms is a cadence decision, not a
     * performance problem — counting those frames made the sampler
     * demote quality on healthy machines that were merely idle (the
     * sampler now also resets across state transitions so a window
     * never mixes idle and active frames).
     *
     * Adaptation: quality responds to SUSTAINED conditions only
     * (two bad windows demote, three good windows promote, a 3.5s
     * recovery guard sits after every change). Demotion applies SOFT
     * adaptation immediately — real work reduction the very next frame
     * — and schedules the HARD structural rebuild for the next settled
     * frame. Promotion restores soft outputs immediately and schedules
     * the structural rebuild the same way, so both directions are real
     * work changes with no mid-interaction rebuilds.
     */
    const maybeAdaptQuality =
      (
        timestamp: number,
        idleCapped: boolean
      ) => {
        if (
          reducedMotion
        ) {
          return;
        }

        /*
         * Idle-capped frames (idle cadence drew this frame at the
         * reduced rate) never feed the sampler — the window instead
         * restarts so the next active phase is measured cleanly.
         */
        if (
          idleCapped
        ) {
          performanceSampleTime = timestamp;

          performanceFrames = 0;

          lastAdaptTimestamp = timestamp;

          return;
        }

        /*
         * Collect the raw (unclamped) inter-frame delta for refresh
         * estimation. The simulation clamps deltas at 32 ms, but the
         * DISPLAY's native interval lives below that cap under normal
         * conditions. V2.1: valid deltas are recorded into the bounded
         * sampler buffer; the window's representative is a robust low
         * PERCENTILE of the samples (engineConfig) instead of the raw
         * minimum — a single glitch-short interval can no longer pin
         * the estimate at a phantom refresh rate.
         */
        if (
          lastAdaptTimestamp !==
          0
        ) {
          const rawDelta =
            timestamp -
            lastAdaptTimestamp;

          if (
            rawDelta >=
              3 &&
            rawDelta <=
              34
          ) {
            recordRefreshDelta(
              refreshSampler,
              rawDelta
            );
          }
        }

        lastAdaptTimestamp =
          timestamp;

        if (
          performanceSampleTime ===
          0
        ) {
          performanceSampleTime =
            timestamp;

          return;
        }

        performanceFrames +=
          1;

        const sampleElapsed =
          timestamp -
          performanceSampleTime;

        if (
          sampleElapsed <
          1800
        ) {
          return;
        }

        const sampledFrames =
          performanceFrames;

        const fps =
          (
            sampledFrames *
            1000
          ) /
          sampleElapsed;

        const frameTime =
          sampledFrames >
          0
            ? sampleElapsed /
              sampledFrames
            : 0;

        performanceSampleTime =
          timestamp;

        performanceFrames =
          0;

        latestFps = fps;

        /*
         * Subsystem averages for this window (measurement builds
         * only): per drawn frame, reset after publication.
         */
        let subsystems:
          | RedMagicSubsystemTimings
          | undefined;

        if (
          subsystemTiming !== null
        ) {
          if (
            timingFrameCount >
              0
          ) {
            const frames =
              timingFrameCount;

            subsystems = {
              sim:
                subsystemTiming.sim /
                frames,

              grid:
                subsystemTiming.grid /
                frames,

              render:
                subsystemTiming.render /
                frames,

              membrane:
                subsystemTiming.membrane /
                frames,

              network:
                subsystemTiming.network /
                frames,

              flows:
                subsystemTiming.flows /
                frames,

              core:
                subsystemTiming.core /
                frames,

              particles:
                subsystemTiming.particles /
                frames
            };
          }

          subsystemTiming.sim = 0;

          subsystemTiming.grid = 0;

          subsystemTiming.render = 0;

          subsystemTiming.membrane = 0;

          subsystemTiming.network = 0;

          subsystemTiming.flows = 0;

          subsystemTiming.core = 0;

          subsystemTiming.particles = 0;

          timingFrameCount = 0;
        }

        /*
         * Refresh estimate (v2.1): the window's representative is the
         * robust percentile of the collected samples — sustained-fast
         * adoption, sustained-collapse decay, null window when too few
         * valid deltas arrived (suspension/idle gaps).
         */
        const windowHz =
          representativeWindowHz(
            refreshSampler
          );

        closeRefreshWindow(
          refreshEstimator,
          windowHz
        );

        resetRefreshDeltaSampler(
          refreshSampler
        );

        const refreshHzEstimate =
          refreshEstimator.estimate;

        publishRedMagicPerformance({
          fps,

          frameTime,

          quality:
            qualityName,

          dpr,

          dprCap,

          width,

          height,

          pointerEnergy:
            Math.round(
              pointerEnergy *
                100
            ) /
            100,

          refreshHz:
            refreshHzEstimate >
            0
              ? Math.round(
                  refreshHzEstimate
                )
              : undefined,

          runtimeState,

          simulationScale:
            STATE_SIMULATION_SCALE[
              runtimeState
            ],

          particlesActive:
            Math.min(
              activeParticleLimit,
              baseParticleCount
            ) +
            (particles.length -
              baseParticleCount),

          particlesBudget:
            quality.particles,

          gridNodes:
            gridNodes.length,

          gridEdges:
            gridEdges.length,

          membranePoints:
            membraneBoundary.length,

          flowCount:
            quality.flowCount,

          flowSegments:
            quality.flowSegments,

          membraneStride,

          atmosphere:
            Math.round(
              atmosphereScale * 100
            ) /
            100,

          lastAdaptation:
            lastAdaptation ??
            undefined,

          subsystems
        });

        if (
          timestamp -
            lastQualityChange <
          3500
        ) {
          return;
        }

        /*
         * RELATIVE thresholds. With no estimate yet the fallback lines
         * behave conservatively (48 / 55). On a measured display:
         *
         *   60 Hz  → demote below 48, promote above 54
         *   120 Hz → demote below 86, promote above 108
         *
         * A display running at its native rate is never demoted; a
         * display that lost a third of its frames is, regardless of
         * how good the absolute numbers look.
         */
        const hasEstimate =
          refreshHzEstimate >
          40;

        const demoteLine =
          hasEstimate
            ? Math.max(
                48,
                refreshHzEstimate *
                  0.72
              )
            : 55;

        const promoteLine =
          hasEstimate
            ? refreshHzEstimate *
              0.9
            : 58;

        let nextQuality:
          | QualityName
          | null =
          null;

        let adaptReason =
          "";

        if (
          fps <
          demoteLine
        ) {
          demoteStreak +=
            1;

          promoteStreak =
            0;

          if (
            demoteStreak >=
            2
          ) {
            if (
              qualityName ===
              "high"
            ) {
              nextQuality =
                "medium";

              adaptReason = "sustained-fps";
            } else if (
              fps <
                50 &&
              qualityName ===
                "medium"
            ) {
              nextQuality =
                "low";

              adaptReason = "sustained-fps";
            }
          }
        } else {
          demoteStreak =
            0;
        }

        if (
          fps >=
          promoteLine
        ) {
          promoteStreak +=
            1;

          if (
            promoteStreak >=
            3
          ) {
            if (
              qualityName ===
                "medium"
            ) {
              nextQuality =
                "high";

              adaptReason = "recovery";
            } else if (
              qualityName ===
                "low" &&
              fps >=
                58
            ) {
              nextQuality =
                "medium";

              adaptReason = "recovery";
            }
          }
        } else {
          promoteStreak =
            0;
        }

        /*
         * DPR pressure evidence (v2.1), captured from THIS window's
         * streaks before any reset below: the same two-bad-window /
         * three-good-window hysteresis the quality controller uses.
         */
        const sustainedPoor =
          demoteStreak >=
            2;

        const sustainedRecovery =
          promoteStreak >=
            3;

        if (
          nextQuality !==
          null
        ) {
          demoteStreak =
            0;

          promoteStreak =
            0;

          /*
           * SOFT FIRST: the new tier's budgets (particle limit, flows,
           * strides, atmosphere) apply from the next drawn frame. The
           * structural rebuild is scheduled and executes on a settled
           * frame — never mid-interaction.
           */
          setQuality(nextQuality, {
            mode: "soft",
            reason: adaptReason
          });
        }

        /*
         * MEASURED-PRESSURE DPR (v2.1): evaluated HERE, on the
         * measurement boundary — no resize event required. Sustained
         * degradation lowers the backing-store resolution one coarse
         * step (real fill-rate reduction, cheaper to reverse than a
         * structural rebuild); sustained recovery with a healthy
         * measured ratio restores it toward the static ceiling one
         * fine step. The policy itself (engineConfig.resolvePressureDpr)
         * owns the debounce, floor, ceiling and never-raise-while-poor
         * law. applyDpr performs the switch and invalidates the
         * sampling windows so the next window measures the new
         * resolution instead of mixing old and new frames.
         */
        if (
          !reducedMotion
        ) {
          const pressureDpr =
            resolvePressureDpr({
              currentDpr: dpr,

              ceiling: dprCeilingFor(
                qualityName,
                width *
                  height
              ),

              deviceDpr:
                window.devicePixelRatio ||
                1,

              sustainedPoor,

              sustainedRecovery,

              performanceRatio:
                refreshHzEstimate >
                  0
                  ? fps /
                    refreshHzEstimate
                  : 0,

              lastChangeAt:
                dprLastChangeAt,

              now: performance.now()
            });

          applyDpr(
            pressureDpr
          );
        }
      };

    const render =
      (
        timestamp: number
      ) => {
        /*
         * SUSPENDED — offscreen or hidden document: zero work. The loop
         * does not reschedule itself; start() re-arms it on visibility.
         */
        if (
          !visible ||
          !documentVisible
        ) {
          runtimeState = "suspended";

          animationFrame =
            0;

          return;
        }

        /*
         * POINTER STILLNESS (Runtime v2): a pointer that rests on the
         * canvas without moving used to pin the engine at full vsync
         * forever ("active = high energy" by mere presence). Under the
         * continuous signal model its energy decays naturally, and once
         * it settles the organism earns the idle cadence exactly as if
         * the pointer had left.
         */
        const pointerStillMs =
          pointerActive &&
          lastPointerMovementAt > 0
            ? timestamp - lastPointerMovementAt
            : 0;

        const pointerStillIdle =
          pointerActive &&
          pointerStillMs >
            STILL_POINTER_IDLE_MS &&
          pointerEnergy <
            SETTLED_ENERGY;

        /*
         * A settled still pointer enters the idle cadence backdated to
         * when stillness passed the threshold, so the cadence delay is
         * measured from the moment the organism actually calmed — not
         * from when the engine noticed.
         */
        if (
          pointerStillIdle &&
          idleSince === null
        ) {
          idleSince =
            lastPointerMovementAt +
            STILL_POINTER_IDLE_MS;
        }

        /*
         * Idle cadence (v2.8, extended in Runtime v2): with no pointer
         * intent (or a settled still pointer), skip the expensive
         * redraw and just reschedule. Physics deltas collapse to the
         * clamp ceiling on the next drawn frame, so ambient motion
         * stays continuous — only the redraw rate drops.
         */
        if (
          (!pointerActive ||
            pointerStillIdle) &&
          idleSince !== null &&
          timestamp - idleSince >
            IDLE_CADENCE_DELAY_MS &&
          timestamp - lastDrawTimestamp <
            IDLE_FRAME_INTERVAL_MS
        ) {
          runtimeState = "idle";

          animationFrame =
            window.requestAnimationFrame(
              render
            );

          return;
        }

        /*
         * Distinguish "this frame drew at the idle cadence" from "this
         * frame drew at full rate" — the sampler must never mix the
         * two (see maybeAdaptQuality).
         */
        const idleCapped =
          (!pointerActive ||
            pointerStillIdle) &&
          idleSince !== null &&
          timestamp - idleSince >
            IDLE_CADENCE_DELAY_MS;

        lastDrawTimestamp =
          timestamp;

        if (
          lastTimestamp ===
          0
        ) {
          lastTimestamp =
            timestamp;

          performanceSampleTime =
            timestamp;
        }

        const delta =
          clamp(
            timestamp -
              lastTimestamp,
            0,
            32
          );

        lastTimestamp =
          timestamp;

        /*
         * RUNTIME STATE (Runtime v2) — explicit, telemetry-visible:
         * active (interaction energy high or pointer moving),
         * ambient (awake at low energy, moderate sim rate),
         * recovery (quality recently changed — cadence held stable).
         * idle/reduced/suspended return above or below.
         */
        /*
         * Proximity only counts while the pointer is actually on
         * the canvas — a stale geometry value from a departed
         * pointer must never hold the organism awake.
         */
        interactionSignals.proximity =
          pointerActive
            ? boundaryPointerDistanceFactor
            : 0;

        interactionSignals.speed =
          clamp(
            pointerSpeedPxPerS /
              SPEED_SATURATION_PX_S,
            0,
            1
          );

        /*
         * Presence builds dwell; stillness bleeds it away at 0.75×
         * so resting on the canvas cannot hold energy forever.
         */
        interactionSignals.dwell =
          pointerPresentSince > 0 &&
          pointerActive
            ? clamp(
                (timestamp -
                  pointerPresentSince -
                  pointerStillMs * 0.75) /
                  DWELL_SATURATION_MS,
                0,
                1
              )
            : 0;

        interactionSignals.memory =
          interactionMemory;

        interactionSignals.charge =
          charge;

        const signalEnergy =
          interactionTargetEnergy(
            interactionSignals
          );

        const recovered =
          timestamp - lastQualityChange <
          3500;

        if (
          pointerActive &&
          (signalEnergy > 0.42 ||
            interactionEnergy > 0.3)
        ) {
          runtimeState = "active";
        } else if (
          recovered &&
          softPressure > 0
        ) {
          runtimeState = "recovery";
        } else if (
          pointerActive ||
          pointerEnergy > 0.06 ||
          interactionEnergy > 0.02
        ) {
          runtimeState = "ambient";
        } else {
          runtimeState = "idle";
        }

        const interactionScale =
          reducedMotion
            ? 0
            : STATE_SIMULATION_SCALE[
                runtimeState
              ];

        if (
          !reducedMotion
        ) {
          elapsed +=
            delta *
            profile.timeScale *
            interactionScale;
        }

        const time =
          reducedMotion
            ? 0
            : elapsed;

        const stepDelta =
          reducedMotion
            ? 0
            : delta *
              profile.timeScale *
              interactionScale;

        pointer.x +=
          (
            pointerTarget.x -
            pointer.x
          ) *
          Math.min(
            1,
            delta *
              profile.responseLag
          );

        pointer.y +=
          (
            pointerTarget.y -
            pointer.y
          ) *
          Math.min(
            1,
            delta *
              profile.responseLag
          );

        /*
         * CONTINUOUS INTERACTION MODEL (Runtime v2) — replaces the
         * binary "pointer present = ceiling / absent = floor" law.
         * pointerEnergy now chases the signal-driven target: proximity,
         * smoothed speed, sustained presence, decaying impulse memory
         * and deliberate charge. Discrete events (impact/flick/charge/
         * release) hold an interactionEnergy FLOOR that decays with its
         * own memory, so energy rises and falls naturally and never
         * jumps to the ceiling just because the pointer exists.
         */
        const targetEnergy = Math.max(
          signalEnergy,
          interactionEnergy * 0.85
        );

        const riseRate = 0.011;

        const fallRate = 0.0035;

        pointerEnergy +=
          (targetEnergy - pointerEnergy) *
          Math.min(
            1,
            delta *
              (targetEnergy > pointerEnergy
                ? riseRate
                : fallRate)
          );

        /* Signal decay: speed fades without fresh events; memory lingers. */
        pointerSpeedPxPerS *=
          Math.pow(
            0.9,
            delta / 16
          );

        interactionMemory *=
          Math.pow(
            0.9975,
            delta / 16
          );

        if (interactionMemory < 0.004) {
          interactionMemory = 0;
        }

        if (
          pointerHeld
        ) {
          charge =
            clamp(
              charge +
                delta *
                  0.00082,
              0,
              1
            );
        }

        updatePointerGeometry();

        const timingSimStart =
          subsystemTiming !== null
            ? performance.now()
            : 0;

        updatePhysicalState(
          stepDelta
        );

        if (
          subsystemTiming !== null
        ) {
          subsystemTiming.sim +=
            performance.now() -
            timingSimStart;
        }

        /*
         * WORLD COORDINATION (Runtime v2): publish the organism's
         * arousal to the shared world-signal store (a module number —
         * no listeners, no allocation). WorldBackground reads it to
         * keep its own ambient layer from amplifying the SAME pointer
         * energy the interactive canvas is already expressing — one
         * shared visual/performance budget across both layers.
         */
        activityPublishCounter += 1;

        if (
          activityPublishCounter >=
          8
        ) {
          activityPublishCounter = 0;

          noteOrganismActivity(
            Math.max(
              pointerEnergy,
              interactionMemory
            )
          );
        }

        /*
         * HARD REBUILD EXECUTION (Runtime v2, settle rule hardened in
         * v2.1): a scheduled structural rebuild runs ONLY on a settled
         * frame — no live shockwaves, no turbulence, no recent click
         * particles, and a pointer that is EITHER absent OR resting
         * still past the stillness/energy thresholds (the pre-v2.1
         * predicate demanded pointerleave, so a parked pointer held
         * every rebuild hostage — measured: none within 15 s). The
         * HARD_REBUILD_MAX_WAIT_MS timeout remains as the safety net
         * for any state the settle model does not cover.
         */
        if (
          hardRebuildPending &&
          hardRebuildTarget !== null
        ) {
          const settled =
            isSettledFrame(
              pointerActive,

              pointerStillIdle,

              shockwaves.length,

              interactionTurbulence,

              clickParticleCount
            );

          const waitedOut =
            hardRebuildScheduledAt > 0 &&
            performance.now() -
              hardRebuildScheduledAt >
              HARD_REBUILD_MAX_WAIT_MS;

          /*
           * The timeout is a FULL escape, not a settled-frame variant:
           * it lets a long-pending rebuild through on any NON-ACTIVE
           * frame (its documented intent — "sustained degradation
           * cannot defer recovery forever on a constantly-hovered
           * canvas"). A pointer parked ON the organism core holds
           * proximity energy above the settle threshold by design, so
           * without this escape that canvas would never rebuild.
           */
          const timeoutEscape =
            waitedOut &&
            runtimeState !==
              "active";

          if (
            (settled &&
              (runtimeState ===
                "idle" ||
                pointerStillIdle)) ||
            timeoutEscape
          ) {
            const target = hardRebuildTarget;

            const reason = hardRebuildReason;

            buildWorld(target, reason);
          }
        }

        context.globalAlpha =
          1;

        /*
         * Subsystem timing (v2.1, measurement builds only): the sim
         * clock wraps updatePhysicalState above; the render clock wraps
         * clear → particles. Both are read once per subsystem via
         * performance.now() and accumulated per window.
         */
        const timingRenderStart =
          subsystemTiming !== null
            ? performance.now()
            : 0;

        context.clearRect(
          0,
          0,
          width,
          height
        );

        drawInteraction();

        const timingMembraneStart =
          subsystemTiming !== null
            ? performance.now()
            : 0;

        drawMembrane(
          time
        );

        if (
          subsystemTiming !== null
        ) {
          subsystemTiming.membrane +=
            performance.now() -
            timingMembraneStart;
        }

        const timingNetworkStart =
          subsystemTiming !== null
            ? performance.now()
            : 0;

        drawNetwork(
          time
        );

        if (
          subsystemTiming !== null
        ) {
          subsystemTiming.network +=
            performance.now() -
            timingNetworkStart;
        }

        const timingFlowsStart =
          subsystemTiming !== null
            ? performance.now()
            : 0;

        drawEnergyFlows(
          time
        );

        if (
          subsystemTiming !== null
        ) {
          subsystemTiming.flows +=
            performance.now() -
            timingFlowsStart;
        }

        const timingCoreStart =
          subsystemTiming !== null
            ? performance.now()
            : 0;

        drawCore(
          time
        );

        if (
          subsystemTiming !== null
        ) {
          subsystemTiming.core +=
            performance.now() -
            timingCoreStart;
        }

        const timingParticlesStart =
          subsystemTiming !== null
            ? performance.now()
            : 0;

        drawParticles(
          time,
          stepDelta
        );

        if (
          subsystemTiming !== null
        ) {
          subsystemTiming.particles +=
            performance.now() -
            timingParticlesStart;

          subsystemTiming.render +=
            performance.now() -
            timingRenderStart;

          timingFrameCount +=
            1;
        }

        maybeAdaptQuality(
          timestamp,
          idleCapped
        );

        /*
         * Reduced motion (v2.8): render exactly one static frame and
         * stop scheduling. Redrawing an identical frame at full
         * vsync is not reduced motion — it is the same cost with
         * time frozen. Event-driven state changes (pointer, click,
         * resize, visibility) call start() themselves, which
         * produces one fresh static frame per event.
         */
        if (reducedMotion) {
          runtimeState = "reduced";

          animationFrame =
            0;

          return;
        }

        animationFrame =
          window.requestAnimationFrame(
            render
          );
      };

    const start =
      () => {
        if (
          animationFrame !==
            0 ||
          !visible ||
          !documentVisible
        ) {
          return;
        }

        lastTimestamp =
          0;

        animationFrame =
          window.requestAnimationFrame(
            render
          );
      };

    const stop =
      () => {
        if (
          animationFrame !==
          0
        ) {
          window.cancelAnimationFrame(
            animationFrame
          );

          animationFrame =
            0;
        }

        lastTimestamp =
          0;
      };

    const handlePointerMove =
      (
        event:
          PointerEvent
      ) => {
        updatePointer(
          event.clientX,
          event.clientY
        );

        pointerActive =
          true;

        /*
         * Pointer intent is present: leave idle cadence and (under
         * reduced motion) draw one fresh static frame per event.
         */
        idleSince =
          null;

        start();
      };

    const handlePointerLeave =
      () => {
        pointerActive =
          false;

        pointerPresentSince = 0;

        pointerSpeedPxPerS = 0;

        lastSignalPointerAt = 0;

        idleSince =
          performance.now();
      };

    const handleMotionChange =
      (
        event:
          MediaQueryListEvent
      ) => {
        reducedMotion =
          event.matches;

        if (
          reducedMotion
        ) {
          /*
           * Hard mode: a static organism draws one frame and stops, so
           * a deferred soft rebuild would never execute.
           */
          setQuality(
            "low",
            {
              mode: "hard",
              reason: "reduced-motion"
            }
          );
        } else {
          setQuality(
            qualityFromArea(
              width *
                height
            ),
            {
              mode: "hard",
              reason: "motion-restored"
            }
          );
        }

        resize();

        start();
      };

    const handleIntersection =
      (
        entries:
          IntersectionObserverEntry[]
      ) => {
        visible =
          entries[0]
            ?.isIntersecting ??
          true;

        if (
          visible
        ) {
          start();
        } else {
          stop();
        }
      };

    const handleVisibility =
      () => {
        documentVisible =
          document.visibilityState ===
          "visible";

        if (
          documentVisible
        ) {
          start();
        } else {
          /*
           * Suspension resets the open sampling window: deltas across a
           * hidden period say nothing about the display or the engine,
           * and a stale window must not drive adaptation (Runtime v2;
           * the same measurement reset geometry/DPR changes use, v2.1).
           */
          resetPerformanceSampling();

          suspendRefreshWindow(
            refreshEstimator
          );

          stop();
        }
      };

    canvas.addEventListener(
      "pointermove",
      handlePointerMove,
      {
        passive:
          true
      }
    );

    canvas.addEventListener(
      "pointerleave",
      handlePointerLeave,
      {
        passive:
          true
      }
    );

    canvas.addEventListener(
      "click",
      handleCanvasClick,
      {
        passive:
          true
      }
    );

    canvas.addEventListener(
      RED_MAGIC_INTERACTION_EVENT,
      handleInteractionEvent
    );

    reduceMotionQuery.addEventListener(
      "change",
      handleMotionChange
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    resizeObserver =
      new ResizeObserver(
        resize
      );

    resizeObserver.observe(
      canvas
    );

    intersectionObserver =
      new IntersectionObserver(
        handleIntersection,
        {
          threshold:
            0.02
        }
      );

    intersectionObserver.observe(
      canvas
    );

    buildWorld(
      qualityFromArea(
        canvas.clientWidth *
          canvas.clientHeight
      )
    );

    resize();

    if (
      reducedMotion
    ) {
      setQuality(
        "low",
        {
          mode: "hard",
          reason: "reduced-motion-mount"
        }
      );

      resize();
    }

    start();

    return () => {
      stop();

      canvas.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      canvas.removeEventListener(
        "pointerleave",
        handlePointerLeave
      );

      canvas.removeEventListener(
        "click",
        handleCanvasClick
      );

      canvas.removeEventListener(
        RED_MAGIC_INTERACTION_EVENT,
        handleInteractionEvent
      );

      reduceMotionQuery.removeEventListener(
        "change",
        handleMotionChange
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

      resizeObserver?.disconnect();

      intersectionObserver?.disconnect();

      /*
       * Memory lifecycle: release the canvas backing store
       * deterministically instead of waiting for GC. Resizing to zero
       * drops the bitmap allocation for this context immediately; the
       * sprites and typed arrays are reachable only from this closure
       * and are collected with it.
       */
      context.clearRect(
        0,
        0,
        width,
        height
      );

      canvas.width = 0;

      canvas.height = 0;
    };
  }, []);

  return (
    <div
      className={
        styles.root
      }
      role="img"
      aria-label="Interactive RED MAGIC interconnected computational energy field"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
      />
    </div>
  );
}
