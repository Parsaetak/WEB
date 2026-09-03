"use client";

import {
  useEffect,
  useRef
} from "react";

import styles from "@/components/RedMagic.module.css";

import {
  publishRedMagicPerformance
} from "@/components/RedMagicTelemetry";

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

type Point = {
  x: number;
  y: number;
};

type GridNode = {
  homeX: number;
  homeY: number;

  x: number;
  y: number;

  energy: number;
  velocity: number;

  phase: number;

  neighbors: number[];
  neighborEdges: number[];
};

type GridEdge = {
  a: number;
  b: number;

  restLength: number;
  resistance: number;

  flow: number;
};

type BoundaryPoint = {
  sin: number;
  cos: number;
  angle: number;
};

type Shockwave = {
  x: number;
  y: number;

  angle: number;

  age: number;
  strength: number;
};

type QualityName =
  | "high"
  | "medium"
  | "low";

export type RedMagicMode =
  | "drift"
  | "listen"
  | "surge";

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

const MODE_PROFILES:
  Record<
    RedMagicMode,
    ModeProfile
  > = {
  drift: {
    timeScale: 0.55,

    energyCeiling: 0.55,
    energyFloor: 0.06,

    pointerGain: 0.7,
    coreGain: 0.85,

    responseLag: 0.008,

    particleImpulse: 0.42,

    turbulenceGain: 0.55,

    shockwaveGain: 0.72,

    recovery: 0.78,

    gridConductance: 0.11,

    globalPotentialGain: 0.025
  },

  listen: {
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
  },

  surge: {
    timeScale: 1.45,

    energyCeiling: 1,
    energyFloor: 0.42,

    pointerGain: 1.45,
    coreGain: 1.3,

    responseLag: 0.028,

    particleImpulse: 1.15,

    turbulenceGain: 1.45,

    shockwaveGain: 1.35,

    recovery: 1.22,

    gridConductance: 0.27,

    globalPotentialGain: 0.075
  }
};

type Quality = {
  gridSize: number;

  particles: number;

  membraneSteps: number;

  flowCount: number;

  flowSegments: number;
};

const QUALITY:
  Record<
    QualityName,
    Quality
  > = {
  high: {
    gridSize: 8,

    particles: 112,

    membraneSteps: 180,

    flowCount: 7,

    flowSegments: 28
  },

  medium: {
    gridSize: 7,

    particles: 76,

    membraneSteps: 132,

    flowCount: 5,

    flowSegments: 22
  },

  low: {
    gridSize: 6,

    particles: 42,

    membraneSteps: 90,

    flowCount: 4,

    flowSegments: 17
  }
};

const TAU =
  Math.PI * 2;

const MAX_DPR =
  2;

const GLOW_SPRITE_SIZE =
  256;

const CORE_SPRITE_SIZE =
  256;

const HIGH_FPS_TARGET =
  120;

const HIGH_FPS_FLOOR =
  105;

const MAX_SHOCKWAVES =
  5;

const SHOCKWAVE_DURATION =
  820;

const IDLE_SIMULATION_SCALE =
  0.32;

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
    (3 - 2 * x)
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

function createGlowSprite():
  HTMLCanvasElement | null {
  if (
    typeof document ===
    "undefined"
  ) {
    return null;
  }

  const sprite =
    document.createElement(
      "canvas"
    );

  sprite.width =
    GLOW_SPRITE_SIZE;

  sprite.height =
    GLOW_SPRITE_SIZE;

  const context =
    sprite.getContext(
      "2d"
    );

  if (!context) {
    return null;
  }

  const half =
    GLOW_SPRITE_SIZE *
    0.5;

  const gradient =
    context.createRadialGradient(
      half,
      half,
      0,
      half,
      half,
      half
    );

  gradient.addColorStop(
    0,
    "rgba(255, 50, 35, 1)"
  );

  gradient.addColorStop(
    0.35,
    "rgba(255, 20, 20, 0.46)"
  );

  gradient.addColorStop(
    1,
    "rgba(255, 0, 0, 0)"
  );

  context.fillStyle =
    gradient;

  context.fillRect(
    0,
    0,
    GLOW_SPRITE_SIZE,
    GLOW_SPRITE_SIZE
  );

  return sprite;
}

function createCoreSprite():
  HTMLCanvasElement | null {
  if (
    typeof document ===
    "undefined"
  ) {
    return null;
  }

  const sprite =
    document.createElement(
      "canvas"
    );

  sprite.width =
    CORE_SPRITE_SIZE;

  sprite.height =
    CORE_SPRITE_SIZE;

  const context =
    sprite.getContext(
      "2d"
    );

  if (!context) {
    return null;
  }

  const center =
    CORE_SPRITE_SIZE *
    0.5;

  const gradient =
    context.createRadialGradient(
      center -
        CORE_SPRITE_SIZE *
          0.09,
      center -
        CORE_SPRITE_SIZE *
          0.1,
      CORE_SPRITE_SIZE *
        0.04,
      center,
      center,
      center
    );

  gradient.addColorStop(
    0,
    "rgba(255, 115, 95, 0.96)"
  );

  gradient.addColorStop(
    0.16,
    "rgba(255, 48, 35, 0.95)"
  );

  gradient.addColorStop(
    0.48,
    "rgba(185, 10, 10, 0.78)"
  );

  gradient.addColorStop(
    0.78,
    "rgba(85, 0, 0, 0.28)"
  );

  gradient.addColorStop(
    1,
    "rgba(20, 0, 0, 0)"
  );

  context.fillStyle =
    gradient;

  context.fillRect(
    0,
    0,
    CORE_SPRITE_SIZE,
    CORE_SPRITE_SIZE
  );

  return sprite;
}

function createBoundary(
  count: number
): BoundaryPoint[] {
  return Array.from(
    {
      length:
        count + 1
    },
    (
      _,
      index
    ) => {
      const angle =
        (
          index /
          count
        ) * TAU;

      return {
        sin:
          Math.sin(
            angle
          ),

        cos:
          Math.cos(
            angle
          ),

        angle
      };
    }
  );
}

function qualityFromArea(
  area: number
): QualityName {
  if (
    area <
    120_000
  ) {
    return "low";
  }

  if (
    area <
    260_000
  ) {
    return "medium";
  }

  return "high";
}

function createGrid(
  gridSize: number
) {
  const nodes: GridNode[] =
    [];

  const nodeByCell =
    new Map<
      string,
      number
    >();

  const spacing =
    2 /
    Math.max(
      1,
      gridSize - 1
    );

  for (
    let row = 0;
    row < gridSize;
    row += 1
  ) {
    for (
      let column = 0;
      column < gridSize;
      column += 1
    ) {
      const x =
        -1 +
        column *
          spacing;

      const y =
        -1 +
        row *
          spacing;

      const radialDistance =
        Math.hypot(
          x,
          y
        );

      if (
        radialDistance >
        1
      ) {
        continue;
      }

      const index =
        nodes.length;

      nodeByCell.set(
        `${row}:${column}`,
        index
      );

      nodes.push({
        homeX:
          x,

        homeY:
          y,

        x,
        y,

        energy:
          0,

        velocity:
          0,

        phase:
          Math.random() *
          TAU,

        neighbors:
          [],

        neighborEdges:
          []
      });
    }
  }

  const edges: GridEdge[] =
    [];

  const connect = (
    a: number,
    b: number
  ) => {
    if (
      a === b
    ) {
      return;
    }

    if (
      nodes[a].neighbors.includes(
        b
      )
    ) {
      return;
    }

    const dx =
      nodes[a].homeX -
      nodes[b].homeX;

    const dy =
      nodes[a].homeY -
      nodes[b].homeY;

    const restLength =
      Math.hypot(
        dx,
        dy
      );

    if (
      restLength <=
      0.0001
    ) {
      return;
    }

    const resistance =
      0.72 +
      restLength *
        0.85;

    const edgeIndex =
      edges.length;

    edges.push({
      a,
      b,

      restLength,

      resistance,

      flow:
        0
    });

    nodes[a].neighbors.push(
      b
    );

    nodes[a].neighborEdges.push(
      edgeIndex
    );

    nodes[b].neighbors.push(
      a
    );

    nodes[b].neighborEdges.push(
      edgeIndex
    );
  };

  for (
    let row = 0;
    row < gridSize;
    row += 1
  ) {
    for (
      let column = 0;
      column < gridSize;
      column += 1
    ) {
      const current =
        nodeByCell.get(
          `${row}:${column}`
        );

      if (
        current ===
        undefined
      ) {
        continue;
      }

      const right =
        nodeByCell.get(
          `${row}:${column + 1}`
        );

      const down =
        nodeByCell.get(
          `${row + 1}:${column}`
        );

      const diagonal =
        nodeByCell.get(
          `${row + 1}:${column + 1}`
        );

      const antiDiagonal =
        nodeByCell.get(
          `${row + 1}:${column - 1}`
        );

      if (
        right !==
        undefined
      ) {
        connect(
          current,
          right
        );
      }

      if (
        down !==
        undefined
      ) {
        connect(
          current,
          down
        );
      }

      if (
        diagonal !==
        undefined
      ) {
        connect(
          current,
          diagonal
        );
      }

      if (
        antiDiagonal !==
        undefined
      ) {
        connect(
          current,
          antiDiagonal
        );
      }
    }
  }

  for (
    let index = 0;
    index <
      nodes.length;
    index += 1
  ) {
    const node =
      nodes[index];

    if (
      node.neighbors.length >=
      4
    ) {
      continue;
    }

    let bestIndex =
      -1;

    let bestDistance =
      Number.POSITIVE_INFINITY;

    for (
      let other = 0;
      other <
        nodes.length;
      other += 1
    ) {
      if (
        other ===
          index ||
        node.neighbors.includes(
          other
        )
      ) {
        continue;
      }

      const distance =
        distanceSquared(
          node.homeX,
          node.homeY,
          nodes[other].homeX,
          nodes[other].homeY
        );

      if (
        distance <
        bestDistance
      ) {
        bestDistance =
          distance;

        bestIndex =
          other;
      }
    }

    if (
      bestIndex >=
      0
    ) {
      connect(
        index,
        bestIndex
      );
    }
  }

  return {
    nodes,
    edges
  };
}

function buildGlobalPotentialWeights(
  nodes: GridNode[]
) {
  const count =
    nodes.length;

  const weights =
    new Float32Array(
      count * count
    );

  const totals =
    new Float32Array(
      count
    );

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    let total =
      0;

    const node =
      nodes[index];

    for (
      let otherIndex = 0;
      otherIndex < count;
      otherIndex += 1
    ) {
      const other =
        nodes[
          otherIndex
        ];

      const dx =
        node.homeX -
        other.homeX;

      const dy =
        node.homeY -
        other.homeY;

      const distance =
        Math.hypot(
          dx,
          dy
        );

      const weight =
        1 /
        (
          1 +
          distance *
            GRID_GLOBAL_RADIUS
        );

      weights[
        index * count +
          otherIndex
      ] = weight;

      total +=
        weight;
    }

    totals[index] =
      total;
  }

  return {
    weights,
    totals
  };
}

export default function RedMagic({
  mode = "listen"
}: {
  mode?: RedMagicMode;
} = {}) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const modeRef =
    useRef<RedMagicMode>(
      mode
    );

  useEffect(() => {
    modeRef.current =
      mode;
  }, [mode]);

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

    const coreSprite =
      createCoreSprite();

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
      | null = null;

    let intersectionObserver:
      | IntersectionObserver
      | null = null;

    let visible = true;

    let documentVisible =
      document.visibilityState ===
      "visible";

    let width = 1;

    let height = 1;

    let centerX = 0;

    let centerY = 0;

    let radius = 1;

    let dpr = 1;

    let elapsed = 0;

    let lastTimestamp = 0;

    let pointer: Point = {
      x: 0,
      y: 0
    };

    let pointerTarget: Point =
      {
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

    let interactionEnergy =
      0;

    let interactionTurbulence =
      0;

    let charge = 0;

    let pointerHeld =
      false;

    let qualityName:
      QualityName =
      "high";

    let quality =
      QUALITY[
        qualityName
      ];

    let particles:
      RedMagicParticle[] = [];

    let gridNodes:
      GridNode[] = [];

    let gridEdges:
      GridEdge[] = [];

    let nodePotential =
      new Float32Array(
        0
      );

    let nextNodeEnergy =
      new Float32Array(
        0
      );

    let globalPotentialWeights =
      new Float32Array(
        0
      );

    let globalPotentialTotals =
      new Float32Array(
        0
      );

    let membraneBoundary:
      BoundaryPoint[] = [];

    let shockwaves:
      Shockwave[] = [];

    let canvasRectLeft = 0;

    let canvasRectTop = 0;

    let performanceSampleTime =
      0;

    let performanceFrames =
      0;

    let lastQualityChange =
      0;

    let membraneGradient:
      CanvasGradient | null =
      null;

    let profile =
      MODE_PROFILES[
        modeRef.current
      ];

    const buildWorld = (
      name: QualityName
    ) => {
      qualityName =
        name;

      quality =
        QUALITY[name];

      particles =
        createParticles(
          quality.particles,
          (
            pageSeed +
            quality.gridSize *
              1009 +
            quality.particles *
              9176
          ) >>> 0
        );

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

      nodePotential =
        new Float32Array(
          gridNodes.length
        );

      nextNodeEnergy =
        new Float32Array(
          gridNodes.length
        );

      const globalPotential =
        buildGlobalPotentialWeights(
          gridNodes
        );

      globalPotentialWeights =
        globalPotential.weights;

      globalPotentialTotals =
        globalPotential.totals;

      membraneBoundary =
        createBoundary(
          quality.membraneSteps
        );

      shockwaves =
        [];

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

    const resize = () => {
      const rect =
        canvas.getBoundingClientRect();

      canvasRectLeft =
        rect.left;

      canvasRectTop =
        rect.top;

      width =
        Math.max(
          1,
          rect.width
        );

      height =
        Math.max(
          1,
          rect.height
        );

      dpr =
        Math.min(
          window.devicePixelRatio ||
            1,
          MAX_DPR
        );

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

      centerX =
        width * 0.5;

      centerY =
        height * 0.5;

      radius =
        Math.min(
          width,
          height
        ) * 0.39;

      rebuildMembraneGradient();

      const desiredQuality =
        qualityFromArea(
          rect.width *
            rect.height
        );

      if (
        gridNodes.length ===
          0 ||
        desiredQuality !==
          qualityName
      ) {
        buildWorld(
          desiredQuality
        );
      }

      for (
        let index = 0;
        index <
          gridNodes.length;
        index += 1
      ) {
        const node =
          gridNodes[index];

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
    };

    const updatePointer = (
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

        pointerAngle =
          pointerDistance >
          0.0001
            ? Math.atan2(
                dy,
                dx
              )
            : 0;
      };

    const nearestGridNode = (
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
          gridNodes[index];

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

    const spawnShockwave = (
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
          )
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
          neighbors[index];

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

        for (
          let index = 0;
          index <
            particles.length;
          index += 1
        ) {
          const particle =
            particles[index];

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
            modeRef.current ===
            "surge"
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

            break;
        }
      };

    const updateGrid = (
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
        MODE_PROFILES[
          modeRef.current
        ];

      const decay =
        Math.pow(
          GRID_ENERGY_DECAY,
          deltaScale *
            activeProfile.recovery
        );

      for (
        let index = 0;
        index <
          gridNodes.length;
        index += 1
      ) {
        const node =
          gridNodes[index];

        node.x =
          centerX +
          node.homeX *
            radius;

        node.y =
          centerY +
          node.homeY *
            radius;

        node.energy *=
          decay;

        node.velocity *=
          Math.pow(
            0.8,
            deltaScale
          );

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

      for (
        let index = 0;
        index < nodeCount;
        index += 1
      ) {
        const rowOffset =
          index *
          nodeCount;

        let weightedEnergy =
          0;

        for (
          let otherIndex = 0;
          otherIndex <
            nodeCount;
          otherIndex += 1
        ) {
          weightedEnergy +=
            gridNodes[
              otherIndex
            ].energy *
            globalPotentialWeights[
              rowOffset +
                otherIndex
            ];
        }

        const totalWeight =
          globalPotentialTotals[
            index
          ];

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

      nextNodeEnergy.fill(
        0
      );

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
          gridEdges[index];

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
          gridNodes[index];

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

      for (
        let index = 0;
        index <
          gridNodes.length;
        index += 1
      ) {
        const node =
          gridNodes[index];

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
    };

    const getBoundaryRadius = (
      point:
        BoundaryPoint,
      time: number
    ) => {
      const primaryWave =
        Math.sin(
          point.angle *
            3 +
            time *
              0.0011
        ) *
        0.034;

      const secondaryWave =
        Math.sin(
          point.angle *
            7 -
            time *
              0.0008 +
            1.3
        ) *
        0.022;

      const tertiaryWave =
        Math.sin(
          point.angle *
            11 +
            time *
              0.00065
        ) *
        0.012;

      let interaction =
        0;

      if (
        pointerActive &&
        pointerDistance >
          0.0001
      ) {
        const delta =
          Math.atan2(
            Math.sin(
              point.angle -
                pointerAngle
            ),
            Math.cos(
              point.angle -
                pointerAngle
            )
          );

        const sigma =
          modeRef.current ===
          "surge"
            ? 0.28
            : 0.18;

        const influence =
          Math.exp(
            -(
              delta *
              delta
            ) /
              sigma
          );

        const distanceFactor =
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

        interaction =
          influence *
          distanceFactor *
          0.075 *
          profile.pointerGain;
      }

      const turbulence =
        interactionTurbulence *
        (
          0.012 +
          Math.sin(
            point.angle *
              13 +
              time *
                0.004 +
              pointerAngle *
                2
          ) *
            0.008
        );

      let networkDeformation =
        0;

      for (
        let index = 0;
        index <
          gridNodes.length;
        index += 1
      ) {
        const node =
          gridNodes[index];

        const dx =
          point.cos *
            0.9 -
          node.homeX;

        const dy =
          point.sin *
            0.9 -
          node.homeY;

        const distance =
          Math.hypot(
            dx,
            dy
          );

        const field =
          1 /
          (
            1 +
            distance *
              3.5
          );

        networkDeformation +=
          node.energy *
          field *
          0.004;
      }

      let shockwaveDeformation =
        0;

      for (
        let index = 0;
        index <
          shockwaves.length;
        index += 1
      ) {
        const shockwave =
          shockwaves[index];

        const progress =
          clamp(
            shockwave.age /
              SHOCKWAVE_DURATION,
            0,
            1
          );

        const delta =
          Math.atan2(
            Math.sin(
              point.angle -
                shockwave.angle
            ),
            Math.cos(
              point.angle -
                shockwave.angle
            )
          );

        const angularInfluence =
          Math.exp(
            -(
              delta *
              delta
            ) /
              0.34
          );

        const currentRadius =
          radius *
          (
            0.08 +
            progress *
              1.05
          );

        const pointRadius =
          radius *
          0.9;

        const waveOffset =
          pointRadius -
          currentRadius;

        const widthFactor =
          radius *
          0.11;

        const widthSquared =
          Math.max(
            1,
            widthFactor *
              widthFactor
          );

        const radialInfluence =
          Math.exp(
            -(
              waveOffset *
              waveOffset
            ) /
              widthSquared
          );

        shockwaveDeformation +=
          radialInfluence *
          angularInfluence *
          (
            1 -
            progress
          ) *
          shockwave.strength *
          0.1352;
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

    const drawGlow = (
      x: number,
      y: number,
      innerRadius: number,
      outerRadius: number,
      alpha: number
    ) => {
      if (
        glowSprite
      ) {
        context.globalAlpha =
          alpha;

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
        `rgba(255, 50, 35, ${alpha})`
      );

      gradient.addColorStop(
        0.35,
        `rgba(255, 20, 20, ${
          alpha *
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

    const drawNetwork = (
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

      for (
        let index = 0;
        index <
          gridEdges.length;
        index += 1
      ) {
        const edge =
          gridEdges[index];

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

        if (
          active <
          0.01
        ) {
          context.globalAlpha =
            0.012;

          context.lineWidth =
            0.4;

          context.strokeStyle =
            "rgba(115, 18, 18, 1)";
        } else {
          context.globalAlpha =
            0.018 +
            active *
              0.12;

          context.lineWidth =
            0.5 +
            active *
              0.75;

          context.strokeStyle =
            "rgba(255, 70, 52, 1)";
        }

        context.beginPath();

        context.moveTo(
          a.x,
          a.y
        );

        context.lineTo(
          b.x,
          b.y
        );

        context.stroke();
      }

      for (
        let index = 0;
        index <
          gridNodes.length;
        index += 1
      ) {
        const node =
          gridNodes[index];

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
            0.24 +
              energy *
                0.72 +
              potential *
                0.16,
            0,
            1
          );

        context.globalAlpha =
          nodeAlpha;

        context.fillStyle =
          "rgba(255, 92, 70, 1)";

        context.beginPath();

        context.arc(
          node.x,
          node.y,
          Math.max(
            1.2,
            nodeRadius
          ),
          0,
          TAU
        );

        context.fill();

        if (
          energy >
          0.018
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
            0.028 +
              energy *
                0.07
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
          pointerEnergy <= 0.01 &&
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

        if (
          pointerActive &&
          interactionSprite
        ) {
          context.globalAlpha =
            0.04 +
            pointerEnergy *
              0.065;

          context.drawImage(
            interactionSprite,
            pointer.x -
              fieldRadius,
            pointer.y -
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
            pointer.x,
            pointer.y,
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
            shockwaves[index];

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
            0.38;

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

    const drawMembrane = (
      time: number
    ) => {
      context.beginPath();

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

        const normalizedRadius =
          getBoundaryRadius(
            point,
            time
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

        context.fill();
      }

      context.lineWidth =
        reducedMotion
          ? 1.2
          : 1.6;

      context.strokeStyle =
        "rgba(255, 55, 40, 0.68)";

      context.stroke();

      context.lineWidth =
        4;

      context.strokeStyle =
        "rgba(125, 0, 0, 0.12)";

      context.stroke();
    };

    const drawEnergyFlows = (
      time: number
    ) => {
      for (
        let index = 0;
        index <
          quality.flowCount;
        index += 1
      ) {
        const direction =
          index % 2 ===
          0
            ? 1
            : -1;

        const baseAngle =
          (
            index /
            quality.flowCount
          ) *
            TAU +
          time *
            0.00016 *
            direction +
          interactionTurbulence *
            0.04 *
            direction;

        context.beginPath();

        for (
          let segment = 0;
          segment <=
            quality.flowSegments;
          segment += 1
        ) {
          const progress =
            segment /
            quality.flowSegments;

          const angle =
            baseAngle +
            Math.sin(
              progress *
                Math.PI *
                2 +
                time *
                  0.0012
            ) *
              (
                0.05 +
                interactionTurbulence *
                  0.018
              );

          const distance =
            radius *
            (
              0.12 +
              progress *
                0.67
            );

          const wave =
            Math.sin(
              progress *
                Math.PI *
                3.2 +
                time *
                  0.0017 +
                index
            ) *
            radius *
            (
              0.025 +
              interactionTurbulence *
                0.016
            );

          const x =
            centerX +
            Math.cos(
              angle
            ) *
              (
                distance +
                wave
              );

          const y =
            centerY +
            Math.sin(
              angle
            ) *
              (
                distance +
                wave
              );

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

        context.lineWidth =
          0.8 +
          pointerEnergy *
            0.8 +
          interactionTurbulence *
            0.5;

        context.strokeStyle =
          `rgba(255, 70, 48, ${
            0.08 +
            pointerEnergy *
              0.05 +
            interactionTurbulence *
              0.035
          })`;

        context.stroke();
      }
    };

    const drawParticles = (
      time: number,
      delta: number
    ) => {
      updateAndDrawParticles({
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

        time,
        delta,

        reducedMotion
      });
    };

    const drawCore = (
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

      let totalGridEnergy =
        0;

      let highestGridEnergy =
        0;

      for (
        let index = 0;
        index <
          gridNodes.length;
        index += 1
      ) {
        const energy =
          gridNodes[
            index
          ].energy;

        totalGridEnergy +=
          energy;

        highestGridEnergy =
          Math.max(
            highestGridEnergy,
            energy
          );
      }

      const averageGridEnergy =
        gridNodes.length > 0
          ? totalGridEnergy /
            gridNodes.length
          : 0;

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
          0.035;

      const coreRadius =
        radius *
        0.49 *
        (
          pulse +
          activePulse
        );

      drawGlow(
        centerX,
        centerY,
        coreRadius *
          0.08,
        coreRadius *
          1.75,
        0.11 +
          pointerEnergy *
            0.04 *
            profile.coreGain +
          charge *
            0.035 +
          averageGridEnergy *
            0.04
      );

      if (
        charge >
        0.01
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
          0.055 +
            charge *
              0.09
        );
      }

      if (
        coreSprite
      ) {
        context.globalAlpha =
          1;

        context.drawImage(
          coreSprite,
          centerX -
            coreRadius,
          centerY -
            coreRadius,
          coreRadius *
            2,
          coreRadius *
            2
        );
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
            0.12
        );

      drawGlow(
        centerX,
        centerY,
        nucleusRadius *
          0.1,
        nucleusRadius *
          2.2,
        0.09 +
          pointerEnergy *
            0.05 +
          averageGridEnergy *
            0.04
      );

      /*
       * The central core is deliberately
       * kept red/white-red.
       */
      context.fillStyle =
        "rgba(255, 205, 190, 0.9)";

      context.beginPath();

      context.arc(
        centerX -
          nucleusRadius *
            0.15,
        centerY -
          nucleusRadius *
            0.17,
        nucleusRadius,
        0,
        TAU
      );

      context.fill();
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

        interactionEnergy +=
          (
            pointerEnergy -
            interactionEnergy
          ) *
          Math.min(
            1,
            delta *
              0.006
          );

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

        updateGrid(
          delta *
            interactionRecovery,
          elapsed
        );

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

    const maybeAdaptQuality =
      (
        timestamp: number
      ) => {
        if (
          reducedMotion
        ) {
          return;
        }

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
          sampledFrames > 0
            ? sampleElapsed /
              sampledFrames
            : 0;

        performanceSampleTime =
          timestamp;

        performanceFrames =
          0;

        publishRedMagicPerformance(
          {
            fps,

            frameTime,

            quality:
              qualityName,

            dpr,

            width,

            height,

            pointerEnergy:
              Math.round(
                pointerEnergy *
                  100
              ) /
              100
          }
        );

        if (
          timestamp -
            lastQualityChange <
          3500
        ) {
          return;
        }

        if (
          fps <
            HIGH_FPS_FLOOR &&
          qualityName ===
            "high"
        ) {
          buildWorld(
            "medium"
          );

          return;
        }

        if (
          fps <
            50 &&
          qualityName !==
            "low"
        ) {
          buildWorld(
            "low"
          );

          return;
        }

        if (
          fps >=
            HIGH_FPS_TARGET &&
          qualityName ===
            "medium"
        ) {
          buildWorld(
            "high"
          );

          return;
        }

        if (
          fps >=
            58 &&
          qualityName ===
            "low"
        ) {
          buildWorld(
            "medium"
          );
        }
      };

    const render = (
      timestamp: number
    ) => {
      if (
        !visible ||
        !documentVisible
      ) {
        animationFrame =
          0;

        return;
      }

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

      profile =
        MODE_PROFILES[
          modeRef.current
        ];

      const interactionScale =
        pointerActive
          ? 1
          : IDLE_SIMULATION_SCALE;

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

      const targetEnergy =
        pointerActive
          ? profile.energyCeiling
          : profile.energyFloor;

      pointerEnergy +=
        (
          targetEnergy -
          pointerEnergy
        ) *
        Math.min(
          1,
          delta *
            0.008
        );

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

      updatePhysicalState(
        stepDelta
      );

      context.globalAlpha =
        1;

      context.clearRect(
        0,
        0,
        width,
        height
      );

      drawInteraction();

      drawMembrane(
        time
      );

      drawNetwork(
        time
      );

      drawEnergyFlows(
        time
      );

      drawCore(
        time
      );

      drawParticles(
        time,
        stepDelta
      );

      maybeAdaptQuality(
        timestamp
      );

      animationFrame =
        window.requestAnimationFrame(
          render
        );
    };

    const start = () => {
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

    const stop = () => {
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
      };

    const handlePointerLeave =
      () => {
        pointerActive =
          false;
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
          buildWorld(
            "low"
          );
        } else {
          buildWorld(
            qualityFromArea(
              width *
                height
            )
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
      buildWorld(
        "low"
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
    };
  }, []);

  return (
    <div
      className={styles.root}
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
