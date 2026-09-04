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

  sin3: number;
  cos3: number;

  sin7: number;
  cos7: number;

  sin11: number;
  cos11: number;

  sin13: number;
  cos13: number;

  angle: number;
  fieldIndex: number;
};

type Shockwave = {
  x: number;
  y: number;

  angle: number;

  age: number;
  strength: number;

  angularInfluence: Float32Array;
};

type FlowGeometry = {
  baseAngles: Float32Array;
  directions: Int8Array;

  distanceScales: Float32Array;
  anglePhaseSin: Float32Array;
  anglePhaseCos: Float32Array;

  wavePhaseSin: Float32Array;
  wavePhaseCos: Float32Array;

  pointCount: number;
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

const NODE_SPRITE_SIZE =
  64;

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

const MAX_NETWORK_INFLUENCES =
  14;

const CORE_ROTATION_SPEED =
  0.00008;

const CORE_DETAIL_ROTATION_SPEED =
  0.000125;

const CORE_MOVEMENT_SPEED =
  0.00135;

const CORE_MOVEMENT_AMPLITUDE =
  0.014;

/*
 * Persistent click-particle system.
 *
 * Exactly one particle is added per user click.
 * After 100 successful particle additions,
 * subsequent clicks only trigger a temporary
 * global illumination response.
 */
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
    dx * dx + dy * dy
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

function createNodeSprite():
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
    NODE_SPRITE_SIZE;

  sprite.height =
    NODE_SPRITE_SIZE;

  const context =
    sprite.getContext(
      "2d"
    );

  if (!context) {
    return null;
  }

  const center =
    NODE_SPRITE_SIZE *
    0.5;

  const radius =
    NODE_SPRITE_SIZE *
    0.5;

  context.fillStyle =
    "rgba(255, 92, 70, 1)";

  context.beginPath();

  context.arc(
    center,
    center,
    radius *
      0.9,
    0,
    TAU
  );

  context.fill();

  return sprite;
}

function drawCoreFilament(
  context: CanvasRenderingContext2D,
  center: number,
  radius: number,
  startAngle: number,
  length: number,
  bend: number,
  width: number,
  alpha: number
) {
  context.beginPath();

  const segments =
    18;

  for (
    let index = 0;
    index <= segments;
    index += 1
  ) {
    const progress =
      index /
      segments;

    const angle =
      startAngle +
      progress *
        length;

    const radial =
      radius *
      (
        0.34 +
        progress *
          0.52 +
        Math.sin(
          progress *
            Math.PI *
            2
        ) *
          bend
      );

    const x =
      center +
      Math.cos(
        angle
      ) *
        radial;

    const y =
      center +
      Math.sin(
        angle
      ) *
        radial;

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

  context.lineWidth =
    width;

  context.strokeStyle =
    `rgba(255, 205, 180, ${alpha})`;

  context.stroke();
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

  const radius =
    CORE_SPRITE_SIZE *
    0.5;

  const gradient =
    context.createRadialGradient(
      center -
        CORE_SPRITE_SIZE *
          0.1,
      center -
        CORE_SPRITE_SIZE *
          0.12,
      CORE_SPRITE_SIZE *
        0.045,
      center,
      center,
      radius
    );

  gradient.addColorStop(
    0,
    "rgba(255, 245, 235, 0.98)"
  );

  gradient.addColorStop(
    0.11,
    "rgba(255, 115, 95, 0.99)"
  );

  gradient.addColorStop(
    0.28,
    "rgba(255, 52, 35, 0.98)"
  );

  gradient.addColorStop(
    0.52,
    "rgba(205, 16, 10, 0.92)"
  );

  gradient.addColorStop(
    0.76,
    "rgba(105, 0, 0, 0.62)"
  );

  gradient.addColorStop(
    0.9,
    "rgba(48, 0, 0, 0.28)"
  );

  gradient.addColorStop(
    1,
    "rgba(12, 0, 0, 0)"
  );

  context.fillStyle =
    gradient;

  context.fillRect(
    0,
    0,
    CORE_SPRITE_SIZE,
    CORE_SPRITE_SIZE
  );

  context.save();

  context.beginPath();

  context.arc(
    center,
    center,
    radius *
      0.91,
    0,
    TAU
  );

  context.clip();

  const spots = [
    {
      x:
        center -
        radius *
          0.31,
      y:
        center -
        radius *
          0.18,
      radius:
        radius *
        0.075,
      alpha:
        0.4
    },
    {
      x:
        center +
        radius *
          0.23,
      y:
        center -
        radius *
          0.31,
      radius:
        radius *
        0.048,
      alpha:
        0.32
    },
    {
      x:
        center +
        radius *
          0.34,
      y:
        center +
        radius *
          0.19,
      radius:
        radius *
        0.067,
      alpha:
        0.3
    },
    {
      x:
        center -
        radius *
          0.16,
      y:
        center +
        radius *
          0.34,
      radius:
        radius *
        0.045,
      alpha:
        0.26
    }
  ];

  for (
    let index = 0;
    index < spots.length;
    index += 1
  ) {
    const spot =
      spots[index];

    const spotGradient =
      context.createRadialGradient(
        spot.x,
        spot.y,
        0,
        spot.x,
        spot.y,
        spot.radius
      );

    spotGradient.addColorStop(
      0,
      `rgba(48, 0, 0, ${spot.alpha})`
    );

    spotGradient.addColorStop(
      0.68,
      `rgba(120, 0, 0, ${
        spot.alpha *
        0.5
      })`
    );

    spotGradient.addColorStop(
      1,
      "rgba(190, 0, 0, 0)"
    );

    context.fillStyle =
      spotGradient;

    context.beginPath();

    context.arc(
      spot.x,
      spot.y,
      spot.radius,
      0,
      TAU
    );

    context.fill();
  }

  drawCoreFilament(
    context,
    center,
    radius,
    -2.55,
    1.4,
    0.026,
    2.1,
    0.28
  );

  drawCoreFilament(
    context,
    center,
    radius,
    -0.75,
    1.18,
    0.022,
    1.6,
    0.22
  );

  drawCoreFilament(
    context,
    center,
    radius,
    0.65,
    1.28,
    0.028,
    1.8,
    0.2
  );

  drawCoreFilament(
    context,
    center,
    radius,
    2.35,
    1.05,
    0.02,
    1.5,
    0.18
  );

  context.restore();

  return sprite;
}

function createCoreDetailSprite():
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

  const radius =
    CORE_SPRITE_SIZE *
    0.5;

  context.save();

  context.beginPath();

  context.arc(
    center,
    center,
    radius *
      0.84,
    0,
    TAU
  );

  context.clip();

  drawCoreFilament(
    context,
    center,
    radius,
    -1.9,
    1.7,
    0.035,
    1.35,
    0.25
  );

  drawCoreFilament(
    context,
    center,
    radius,
    -0.12,
    1.42,
    0.032,
    1.15,
    0.2
  );

  drawCoreFilament(
    context,
    center,
    radius,
    1.15,
    1.52,
    0.028,
    1.45,
    0.22
  );

  drawCoreFilament(
    context,
    center,
    radius,
    2.75,
    1.32,
    0.026,
    1.1,
    0.18
  );

  context.restore();

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
        ) *
        TAU;

      return {
        sin:
          Math.sin(
            angle
          ),

        cos:
          Math.cos(
            angle
          ),

        sin3:
          Math.sin(
            angle * 3
          ),

        cos3:
          Math.cos(
            angle * 3
          ),

        sin7:
          Math.sin(
            angle * 7
          ),

        cos7:
          Math.cos(
            angle * 7
          ),

        sin11:
          Math.sin(
            angle * 11
          ),

        cos11:
          Math.cos(
            angle * 11
          ),

        sin13:
          Math.sin(
            angle * 13
          ),

        cos13:
          Math.cos(
            angle * 13
          ),

        angle,

        fieldIndex:
          index
      };
    }
  );
}

function buildFlowGeometry(
  quality: Quality
): FlowGeometry {
  const flowCount =
    quality.flowCount;

  const segments =
    quality.flowSegments;

  const pointCount =
    flowCount *
    (
      segments +
      1
    );

  const baseAngles =
    new Float32Array(
      flowCount
    );

  const directions =
    new Int8Array(
      flowCount
    );

  const distanceScales =
    new Float32Array(
      pointCount
    );

  const anglePhaseSin =
    new Float32Array(
      pointCount
    );

  const anglePhaseCos =
    new Float32Array(
      pointCount
    );

  const wavePhaseSin =
    new Float32Array(
      pointCount
    );

  const wavePhaseCos =
    new Float32Array(
      pointCount
    );

  for (
    let flowIndex = 0;
    flowIndex <
      flowCount;
    flowIndex += 1
  ) {
    baseAngles[
      flowIndex
    ] =
      (
        flowIndex /
        flowCount
      ) *
      TAU;

    directions[
      flowIndex
    ] =
      flowIndex % 2 === 0
        ? 1
        : -1;

    const flowOffset =
      flowIndex *
      (
        segments +
        1
      );

    for (
      let segment = 0;
      segment <= segments;
      segment += 1
    ) {
      const progress =
        segment /
        segments;

      const pointIndex =
        flowOffset +
        segment;

      const anglePhase =
        progress *
        TAU;

      const wavePhase =
        progress *
          Math.PI *
          3.2 +
        flowIndex;

      distanceScales[
        pointIndex
      ] =
        0.12 +
        progress *
          0.67;

      anglePhaseSin[
        pointIndex
      ] =
        Math.sin(
          anglePhase
        );

      anglePhaseCos[
        pointIndex
      ] =
        Math.cos(
          anglePhase
        );

      wavePhaseSin[
        pointIndex
      ] =
        Math.sin(
          wavePhase
        );

      wavePhaseCos[
        pointIndex
      ] =
        Math.cos(
          wavePhase
        );
    }
  }

  return {
    baseAngles,
    directions,

    distanceScales,
    anglePhaseSin,
    anglePhaseCos,

    wavePhaseSin,
    wavePhaseCos,

    pointCount
  };
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
      ] =
        weight;

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
      | null = null;

    let intersectionObserver:
      | IntersectionObserver
      | null = null;

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

    let pointerAngleSin =
      0;

    let pointerAngleCos =
      1;

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

    /*
     * This value survives the entire mounted tab session.
     * It never gets reset by resize or adaptive quality.
     */
    let clickParticleCount =
      0;

    /*
     * Temporary lighting energy generated after the
     * particle cap has been reached.
     */
    let clickLightBoost =
      0;

    let qualityName:
      QualityName =
      qualityFromArea(
        window.innerWidth *
          window.innerHeight
      );

    let quality =
      QUALITY[
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

    let edgeBuckets =
      new Uint8Array(
        0
      );

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
      BoundaryPoint[] =
      [];

    let boundaryNetworkNodeIndices =
      new Int16Array(
        0
      );

    let boundaryNetworkNodeWeights =
      new Float32Array(
        0
      );

    let boundaryNetworkResidualWeights =
      new Float32Array(
        0
      );

    let boundaryNetworkInfluenceCounts =
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

    let lastQualityChange =
      0;

    let membraneGradient:
      CanvasGradient | null =
      null;

    let profile =
      MODE_PROFILES[
        modeRef.current
      ];

    const buildBoundaryNetworkWeights =
      () => {
        const boundaryCount =
          membraneBoundary.length;

        const nodeCount =
          gridNodes.length;

        const influenceCapacity =
          Math.min(
            MAX_NETWORK_INFLUENCES,
            nodeCount
          );

        const nodeIndices =
          new Int16Array(
            boundaryCount *
              influenceCapacity
          );

        const influenceWeights =
          new Float32Array(
            boundaryCount *
              influenceCapacity
          );

        const residualWeights =
          new Float32Array(
            boundaryCount
          );

        const influenceCounts =
          new Uint8Array(
            boundaryCount
          );

        for (
          let boundaryIndex = 0;
          boundaryIndex <
            boundaryCount;
          boundaryIndex += 1
        ) {
          const point =
            membraneBoundary[
              boundaryIndex
            ];

          const targetX =
            point.cos *
            0.9;

          const targetY =
            point.sin *
            0.9;

          const selectedIndices =
            new Int16Array(
              influenceCapacity
            );

          const selectedWeights =
            new Float32Array(
              influenceCapacity
            );

          selectedIndices.fill(
            -1
          );

          let totalWeight =
            0;

          let selectedWeight =
            0;

          for (
            let nodeIndex = 0;
            nodeIndex <
              nodeCount;
            nodeIndex += 1
          ) {
            const node =
              gridNodes[
                nodeIndex
              ];

            const dx =
              targetX -
              node.homeX;

            const dy =
              targetY -
              node.homeY;

            const distance =
              Math.hypot(
                dx,
                dy
              );

            const weight =
              0.004 /
              (
                1 +
                distance *
                  3.5
              );

            totalWeight +=
              weight;

            let insertionIndex =
              influenceCapacity;

            for (
              let slot = 0;
              slot <
                influenceCapacity;
              slot += 1
            ) {
              if (
                weight >
                selectedWeights[
                  slot
                ]
              ) {
                insertionIndex =
                  slot;

                break;
              }
            }

            if (
              insertionIndex >=
              influenceCapacity
            ) {
              continue;
            }

            for (
              let slot =
                influenceCapacity -
                1;
              slot >
                insertionIndex;
              slot -= 1
            ) {
              selectedWeights[
                slot
              ] =
                selectedWeights[
                  slot - 1
                ];

              selectedIndices[
                slot
              ] =
                selectedIndices[
                  slot - 1
                ];
            }

            selectedWeights[
              insertionIndex
            ] =
              weight;

            selectedIndices[
              insertionIndex
            ] =
              nodeIndex;
          }

          const rowOffset =
            boundaryIndex *
            influenceCapacity;

          for (
            let slot = 0;
            slot <
              influenceCapacity;
            slot += 1
          ) {
            const nodeIndex =
              selectedIndices[
                slot
              ];

            if (
              nodeIndex <
              0
            ) {
              continue;
            }

            const weight =
              selectedWeights[
                slot
              ];

            nodeIndices[
              rowOffset +
                slot
            ] =
              nodeIndex;

            influenceWeights[
              rowOffset +
                slot
            ] =
              weight;

            selectedWeight +=
              weight;
          }

          influenceCounts[
            boundaryIndex
          ] =
            influenceCapacity;

          residualWeights[
            boundaryIndex
          ] =
            Math.max(
              0,
              totalWeight -
                selectedWeight
            );
        }

        boundaryNetworkNodeIndices =
          nodeIndices;

        boundaryNetworkNodeWeights =
          influenceWeights;

        boundaryNetworkResidualWeights =
          residualWeights;

        boundaryNetworkInfluenceCounts =
          influenceCounts;
      };

    /*
     * Quality changes now preserve the live simulation.
     *
     * We only change render/detail configuration.
     * The existing:
     *
     * - particles
     * - particle velocities
     * - particle positions
     * - grid nodes
     * - grid energy
     * - edge flows
     * - membrane deformation
     * - shockwaves
     * - click count
     *
     * remain alive.
     */
    const setQuality =
      (
        name: QualityName
      ) => {
        if (
          name ===
          qualityName
        ) {
          return;
        }

        qualityName =
          name;

        quality =
          QUALITY[name];

        flowGeometry =
          buildFlowGeometry(
            quality
          );

        lastQualityChange =
          performance.now();
      };

    /*
     * World initialization happens exactly once for the
     * lifetime of this mounted RedMagic instance.
     */
    const buildWorld = (
      name: QualityName
    ) => {
      qualityName =
        name;

      quality =
        QUALITY[name];

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
          ) >>> 0
        );

      clickParticleCount =
        0;

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

      edgeBuckets =
        new Uint8Array(
          gridEdges.length
        );

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

      buildBoundaryNetworkWeights();

      shockwaves =
        [];

      averageGridEnergy =
        0;

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

      /*
       * Important:
       *
       * Resize no longer calls buildWorld().
       * The current world remains alive.
       */
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

      /*
       * placeParticles() preserves live positions while
       * adapting them to the new canvas dimensions.
       */
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

        pointerAngleSin =
          pointerDistance >
          0.0001
            ? dy /
              pointerDistance
            : 0;

        pointerAngleCos =
          pointerDistance >
          0.0001
            ? dx /
              pointerDistance
            : 1;
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

      const angleSin =
        Math.sin(
          shockwaveAngle
        );

      const angleCos =
        Math.cos(
          shockwaveAngle
        );

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

    /*
     * Adds exactly one persistent particle for each
     * successful click until the 100-particle cap.
     */
    const addClickParticle = (
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
        ) >>> 0;

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

      /*
       * Give click-created particles a stronger outward
       * velocity so the click feels like particle creation
       * rather than a static dot appearing.
       */
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

      /*
       * Freshly created click particles are intentionally
       * visible and interactive immediately.
       */
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

      /*
       * Every particle creation also produces a brief
       * illumination pulse.
       */
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

    /*
     * Native click handler:
     *
     * This deliberately counts actual clicks rather than
     * every pointer-move or interaction event.
     */
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

        addClickParticle(
          x,
          y
        );
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

      let totalGridEnergy =
        0;

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
        gridNodes.length > 0
          ? totalGridEnergy /
            gridNodes.length
          : 0;
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

    const getBoundaryRadius = (
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

      if (
        pointerActive &&
        pointerDistance >
          0.0001
      ) {
        const deltaSin =
          point.sin *
            pointerAngleCos -
          point.cos *
            pointerAngleSin;

        const deltaCos =
          point.cos *
            pointerAngleCos +
          point.sin *
            pointerAngleSin;

        const delta =
          Math.atan2(
            deltaSin,
            deltaCos
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

    const drawGlow = (
      x: number,
      y: number,
      innerRadius: number,
      outerRadius: number,
      alpha: number
    ) => {
      /*
       * The click light boost globally increases
       * illumination without introducing a filter,
       * blur, shadow, or extra Canvas layer.
       */
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
        `rgba(255, 50, 35, ${boostedAlpha})`
      );

      gradient.addColorStop(
        0.35,
        `rgba(255, 20, 20, ${
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

    const drawNodeCore = (
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

      let hasBaseline =
        false;

      let hasFaint =
        false;

      let hasLow =
        false;

      let hasMedium =
        false;

      let hasHigh =
        false;

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

        let bucket =
          4;

        if (
          active <
          0.01
        ) {
          bucket =
            0;

          hasBaseline =
            true;
        } else if (
          active <
          0.12
        ) {
          bucket =
            1;

          hasFaint =
            true;
        } else if (
          active <
          0.3
        ) {
          bucket =
            2;

          hasLow =
            true;
        } else if (
          active <
          0.62
        ) {
          bucket =
            3;

          hasMedium =
            true;
        } else {
          bucket =
            4;

          hasHigh =
            true;
        }

        edgeBuckets[
          index
        ] =
          bucket;
      }

      const lightMultiplier =
        1 +
        clickLightBoost *
          0.75;

      if (
        hasBaseline
      ) {
        context.beginPath();

        for (
          let index = 0;
          index <
            gridEdges.length;
          index += 1
        ) {
          if (
            edgeBuckets[
              index
            ] !==
            0
          ) {
            continue;
          }

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
        hasFaint
      ) {
        context.beginPath();

        for (
          let index = 0;
          index <
            gridEdges.length;
          index += 1
        ) {
          if (
            edgeBuckets[
              index
            ] !==
            1
          ) {
            continue;
          }

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
        hasLow
      ) {
        context.beginPath();

        for (
          let index = 0;
          index <
            gridEdges.length;
          index += 1
        ) {
          if (
            edgeBuckets[
              index
            ] !==
            2
          ) {
            continue;
          }

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
        hasMedium
      ) {
        context.beginPath();

        for (
          let index = 0;
          index <
            gridEdges.length;
          index += 1
        ) {
          if (
            edgeBuckets[
              index
            ] !==
            3
          ) {
            continue;
          }

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
        hasHigh
      ) {
        context.beginPath();

        for (
          let index = 0;
          index <
            gridEdges.length;
          index += 1
        ) {
          if (
            edgeBuckets[
              index
            ] !==
            4
          ) {
            continue;
          }

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

    const drawMembrane = (
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

      context.lineWidth =
        reducedMotion
          ? 1.2
          : 1.6;

      context.strokeStyle =
        `rgba(255, 55, 40, ${
          0.68 *
          lightMultiplier
        })`;

      context.stroke();

      context.lineWidth =
        4;

      context.strokeStyle =
        `rgba(125, 0, 0, ${
          0.12 *
          lightMultiplier
        })`;

      context.stroke();
    };

    const drawEnergyFlows = (
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

      context.strokeStyle =
        `rgba(255, 70, 48, ${
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
          )
        })`;

      context.beginPath();

      for (
        let index = 0;
        index < flowCount;
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

        for (
          let segment = 0;
          segment <= flowSegments;
          segment += 1
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
            (
              geometry.distanceScales[
                pointIndex
              ] *
              radius
            ) +
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

        highestGridEnergy =
          Math.max(
            highestGridEnergy,
            energy
          );
      }

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
        0.09 +
          pointerEnergy *
            0.05 +
          averageGridEnergy *
            0.04 +
          movementEnergy *
            0.05
      );

      context.fillStyle =
        "rgba(255, 220, 205, 0.92)";

      context.globalAlpha =
        clamp(
          1 +
            clickLightBoost *
              0.2,
          0,
          1.2
        );

      context.beginPath();

      context.arc(
        centerX -
          nucleusRadius *
            0.15,
        centerY -
          nucleusRadius *
            0.17,
        nucleusRadius *
          (
            1 +
            movementEnergy *
              0.3
          ),
        0,
        TAU
      );

      context.fill();

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
          /*
           * Adapt render detail only.
           * DO NOT rebuild the world.
           */
          setQuality(
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
          setQuality(
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
          setQuality(
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
          setQuality(
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

        /*
         * Do not rebuild a live world when reduced-motion
         * preference changes.
         *
         * Existing simulation state remains intact.
         */
        if (
          reducedMotion
        ) {
          setQuality(
            "low"
          );
        } else {
          setQuality(
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

    /*
     * The world is constructed once.
     *
     * From this point until this component is unmounted,
     * adaptive quality and resize never recreate it.
     */
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
