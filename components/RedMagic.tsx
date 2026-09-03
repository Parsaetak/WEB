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

type Point = {
  x: number;
  y: number;
};

type Particle = {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  phase: number;
  orbit: number;
  drift: number;

  impulseX: number;
  impulseY: number;
};

type Node = {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  phase: number;
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
    recovery: 0.78
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
    recovery: 1
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
    recovery: 1.22
  }
};

type Quality = {
  particles: number;
  nodes: number;
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
    particles: 112,
    nodes: 12,
    membraneSteps: 180,
    flowCount: 7,
    flowSegments: 28
  },

  medium: {
    particles: 76,
    nodes: 9,
    membraneSteps: 132,
    flowCount: 5,
    flowSegments: 22
  },

  low: {
    particles: 42,
    nodes: 7,
    membraneSteps: 90,
    flowCount: 4,
    flowSegments: 17
  }
};

const TAU =
  Math.PI * 2;

const MAX_DPR = 2;

const GLOW_SPRITE_SIZE =
  256;

const CORE_SPRITE_SIZE =
  256;

const HIGH_FPS_TARGET =
  88;

const HIGH_FPS_FLOOR =
  76;

const MAX_SHOCKWAVES =
  5;

const SHOCKWAVE_DURATION =
  820;

const PARTICLE_INFLUENCE_FACTOR =
  0.62;

const IDLE_SIMULATION_SCALE =
  0.32;

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(
    min,
    Math.min(max, value)
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
          0.10,
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

function createParticles(
  count: number
): Particle[] {
  return Array.from(
    {
      length:
        count
    },
    (
      _,
      index
    ) => ({
      angle:
        (index /
          count) *
          TAU +
        Math.random() *
          0.35,

      radius:
        0.18 +
        Math.random() *
          0.7,

      speed:
        (
          0.08 +
          Math.random() *
            0.22
        ) *
        (
          Math.random() >
          0.5
            ? 1
            : -1
        ),

      size:
        0.7 +
        Math.random() *
          1.8,

      phase:
        Math.random() *
        TAU,

      orbit:
        0.75 +
        Math.random() *
          0.45,

      drift:
        0.15 +
        Math.random() *
          0.45,

      impulseX:
        0,

      impulseY:
        0
    })
  );
}

function createNodes(
  count: number
): Node[] {
  return Array.from(
    {
      length:
        count
    },
    (
      _,
      index
    ) => ({
      angle:
        (index /
          count) *
          TAU +
        Math.random() *
          0.25,

      radius:
        0.32 +
        Math.random() *
          0.52,

      speed:
        (
          0.03 +
          Math.random() *
            0.08
        ) *
        (
          Math.random() >
          0.5
            ? 1
            : -1
        ),

      size:
        1.7 +
        Math.random() *
          2.6,

      phase:
        Math.random() *
        TAU
    })
  );
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
        (index /
          count) *
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

    let pointerTarget:
      Point = {
      x: 0,
      y: 0
    };

    let pointerActive =
      false;

    let pointerEnergy = 0;

    let pointerVelocity = 0;

    let pointerVelocityX = 0;

    let pointerVelocityY = 0;

    let pointerDistance = 0;

    let pointerAngle = 0;

    let interactionEnergy = 0;

    let interactionTurbulence =
      0;

    let charge = 0;

    let pointerHeld = false;

    let qualityName:
      QualityName = "high";

    let quality =
      QUALITY[
        qualityName
      ];

    let particles:
      Particle[] = [];

    let nodes:
      Node[] = [];

    let boundary:
      BoundaryPoint[] = [];

    let shockwaves:
      Shockwave[] = [];

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

    const buildWorld = (
      name:
        QualityName
    ) => {
      qualityName =
        name;

      quality =
        QUALITY[name];

      particles =
        createParticles(
          quality.particles
        );

      nodes =
        createNodes(
          quality.nodes
        );

      boundary =
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

      const desiredQuality =
        qualityFromArea(
          rect.width *
            rect.height
        );

      if (
        particles.length ===
          0 ||
        desiredQuality !==
          qualityName
      ) {
        buildWorld(
          desiredQuality
        );
      }
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

    const spawnShockwave =
      (
        detail:
          RedMagicInteractionDetail,
        strength: number
      ) => {
        shockwaves.push({
          x:
            detail.x,

          y:
            detail.y,

          angle:
            Math.atan2(
              detail.y -
                centerY,
              detail.x -
                centerX
            ),

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
              PARTICLE_INFLUENCE_FACTOR
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

          const orbitalRadius =
            radius *
            particle.radius;

          const x =
            centerX +
            Math.cos(
              particle.angle
            ) *
              orbitalRadius;

          const y =
            centerY +
            Math.sin(
              particle.angle
            ) *
              orbitalRadius;

          const dx =
            x -
            detail.x;

          const dy =
            y -
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
            particle.impulseX +=
              -normalizedY *
              Math.min(
                detail.velocity *
                  0.006,
                0.18
              );

            particle.impulseY +=
              normalizedX *
              Math.min(
                detail.velocity *
                  0.006,
                0.18
              );
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

        pointerVelocityX =
          detail.x -
          pointer.x;

        pointerVelocityY =
          detail.y -
          pointer.y;

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

    const getBoundaryRadius =
      (
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
        }

        context.globalAlpha =
          1;
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
            profile.coreGain;

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
              0.035
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
        } else {
          const coreGradient =
            context.createRadialGradient(
              centerX -
                coreRadius *
                  0.18,
              centerY -
                coreRadius *
                  0.2,
              coreRadius *
                0.08,
              centerX,
              centerY,
              coreRadius
            );

          coreGradient.addColorStop(
            0,
            "rgba(255, 115, 95, 0.96)"
          );

          coreGradient.addColorStop(
            0.16,
            "rgba(255, 48, 35, 0.95)"
          );

          coreGradient.addColorStop(
            0.48,
            "rgba(185, 10, 10, 0.78)"
          );

          coreGradient.addColorStop(
            0.78,
            "rgba(85, 0, 0, 0.28)"
          );

          coreGradient.addColorStop(
            1,
            "rgba(20, 0, 0, 0)"
          );

          context.fillStyle =
            coreGradient;

          context.beginPath();

          context.arc(
            centerX,
            centerY,
            coreRadius,
            0,
            TAU
          );

          context.fill();
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
              0.25
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
              0.05
        );

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

    const drawMembrane =
      (
        time: number
      ) => {
        context.beginPath();

        for (
          let index = 0;
          index <
            boundary.length;
          index += 1
        ) {
          const point =
            boundary[index];

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

    const drawEnergyFlows =
      (
        time: number
      ) => {
        for (
          let index = 0;
          index <
            quality.flowCount;
          index += 1
        ) {
          const direction =
            index %
              2 ===
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

    const drawParticles =
      (
        time: number,
        delta: number
      ) => {
        const step =
          delta *
          0.0009 *
          16;

        const impulseDecay =
          Math.pow(
            0.91,
            delta /
              16
          );

        const pointerActiveNow =
          pointerActive;

        const surgeMode =
          modeRef.current ===
          "surge";

        const surgeInteraction =
          surgeMode &&
          pointerActiveNow &&
          pointerDistance <
            radius *
              0.95;

        const impulseScale =
          radius *
          0.11;

        const influenceRadius =
          radius *
          PARTICLE_INFLUENCE_FACTOR;

        const influenceRadiusSquared =
          influenceRadius *
          influenceRadius;

        const pointerX =
          pointer.x;

        const pointerY =
          pointer.y;

        const dxFromPointer =
          pointerX -
          centerX;

        const dyFromPointer =
          pointerY -
          centerY;

        let radialX = 0;

        let radialY = 0;

        let surgePull = 0;

        if (
          surgeInteraction
        ) {
          const radialPointerLength =
            Math.max(
              0.0001,
              Math.hypot(
                dxFromPointer,
                dyFromPointer
              )
            );

          radialX =
            dxFromPointer /
            radialPointerLength;

          radialY =
            dyFromPointer /
            radialPointerLength;

          surgePull =
            (
              1 -
              clamp(
                pointerDistance /
                  (
                    radius *
                    0.95
                  ),
                0,
                1
              )
            ) *
            0.0025;
        }

        const baseAlpha =
          0.28 +
          charge *
            0.08;

        context.fillStyle =
          "rgb(255, 72, 55)";

        if (
          !pointerActiveNow
        ) {
          context.globalAlpha =
            baseAlpha;

          for (
            let index = 0;
            index <
              particles.length;
            index += 1
          ) {
            const particle =
              particles[index];

            particle.impulseX *=
              impulseDecay;

            particle.impulseY *=
              impulseDecay;

            particle.angle +=
              particle.speed *
              (
                1 +
                pointerEnergy *
                  1.8 +
                interactionTurbulence *
                  0.6
              ) *
              step;

            const breathing =
              1 +
              Math.sin(
                time *
                  0.0013 *
                  particle.drift +
                  particle.phase
              ) *
                0.055;

            const orbitalRadius =
              Math.max(
                radius *
                  0.08,
                radius *
                  particle.radius *
                  breathing *
                  particle.orbit
              );

            const swirl =
              Math.sin(
                time *
                  0.0007 +
                  particle.phase
              ) *
              radius *
              0.02;

            const x =
              centerX +
              Math.cos(
                particle.angle
              ) *
                orbitalRadius +
              swirl +
              particle.impulseX *
                impulseScale;

            const y =
              centerY +
              Math.sin(
                particle.angle
              ) *
                orbitalRadius +
              swirl *
                0.55 +
              particle.impulseY *
                impulseScale;

            context.beginPath();

            context.arc(
              x,
              y,
              particle.size,
              0,
              TAU
            );

            context.fill();
          }

          context.globalAlpha =
            1;

          return;
        }

        for (
          let index = 0;
          index <
            particles.length;
          index += 1
        ) {
          const particle =
            particles[index];

          particle.impulseX *=
            impulseDecay;

          particle.impulseY *=
            impulseDecay;

          particle.angle +=
            particle.speed *
            (
              1 +
              pointerEnergy *
                1.8 +
              interactionTurbulence *
                0.6
            ) *
            step;

          const breathing =
            1 +
            Math.sin(
              time *
                0.0013 *
                particle.drift +
                particle.phase
            ) *
              0.055;

          let orbitalRadius =
            radius *
            particle.radius *
            breathing *
            particle.orbit;

          const swirl =
            Math.sin(
              time *
                0.0007 +
                particle.phase
            ) *
            radius *
            0.02;

          if (
            surgeInteraction
          ) {
            particle.impulseX +=
              radialX *
              surgePull;

            particle.impulseY +=
              radialY *
              surgePull;
          }

          orbitalRadius =
            Math.max(
              radius *
                0.08,
              orbitalRadius
            );

          const x =
            centerX +
            Math.cos(
              particle.angle
            ) *
              orbitalRadius +
            swirl +
            particle.impulseX *
              impulseScale;

          const y =
            centerY +
            Math.sin(
              particle.angle
            ) *
              orbitalRadius +
            swirl *
              0.55 +
            particle.impulseY *
              impulseScale;

          const localDistanceSquared =
            distanceSquared(
              pointerX,
              pointerY,
              x,
              y
            );

          let clampedInfluence =
            0;

          if (
            localDistanceSquared <
            influenceRadiusSquared
          ) {
            const pointerInfluence =
              smoothstep(
                1 -
                  Math.sqrt(
                    localDistanceSquared
                  ) /
                    influenceRadius
              ) *
              profile.pointerGain;

            clampedInfluence =
              Math.min(
                1,
                pointerInfluence
              );
          }

          const size =
            particle.size *
            (
              1 +
              clampedInfluence *
                0.75 +
              charge *
                0.16
            );

          context.globalAlpha =
            baseAlpha +
            clampedInfluence *
              0.42;

          context.beginPath();

          context.arc(
            x,
            y,
            size,
            0,
            TAU
          );

          context.fill();
        }

        context.globalAlpha =
          1;
      };

    const drawNodes =
      (
        time: number,
        delta: number
      ) => {
        const step =
          delta *
          0.0009 *
          16;

        context.fillStyle =
          "rgb(255, 96, 72)";

        for (
          let index = 0;
          index <
            nodes.length;
          index += 1
        ) {
          const node =
            nodes[index];

          node.angle +=
            node.speed *
            step;

          const breathing =
            1 +
            Math.sin(
              time *
                0.0014 +
                node.phase
            ) *
              0.07;

          const distance =
            radius *
            node.radius *
            breathing;

          const x =
            centerX +
            Math.cos(
              node.angle
            ) *
              distance;

          const y =
            centerY +
            Math.sin(
              node.angle
            ) *
              distance;

          const pulse =
            1 +
            Math.sin(
              time *
                0.0035 +
                node.phase
            ) *
              0.25;

          const nodeSize =
            node.size *
            pulse *
            (
              1 +
              pointerEnergy *
                0.4 +
              charge *
                0.12
            );

          context.globalAlpha =
            0.08 +
            pointerEnergy *
              0.04;

          context.beginPath();

          context.arc(
            x,
            y,
            nodeSize *
              3.2,
            0,
            TAU
          );

          context.fill();

          context.globalAlpha =
            0.78 +
            pointerEnergy *
              0.08;

          context.beginPath();

          context.arc(
            x,
            y,
            nodeSize,
            0,
            TAU
          );

          context.fill();
        }

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

        for (
          let index =
            shockwaves.length -
            1;
          index >=
            0;
          index -= 1
        ) {
          const shockwave =
            shockwaves[index];

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
          sampledFrames >
          0
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

      drawNodes(
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
        passive: true
      }
    );

    canvas.addEventListener(
      "pointerleave",
      handlePointerLeave,
      {
        passive: true
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

    resize();

    if (
      reducedMotion
    ) {
      buildWorld(
        "low"
      );
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
      aria-label="Interactive RED MAGIC living organism"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
      />
    </div>
  );
}
