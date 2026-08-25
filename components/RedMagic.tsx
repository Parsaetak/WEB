"use client";

import { useEffect, useRef } from "react";

type Particle = {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  phase: number;
  orbit: number;
  drift: number;
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

type Point = {
  x: number;
  y: number;
};

type QualityName = "high" | "medium" | "low";

type Quality = {
  particles: number;
  nodes: number;
  membraneSteps: number;
  flowCount: number;
  flowSegments: number;
};

const TAU = Math.PI * 2;
const MAX_DPR = 2;

const QUALITY: Record<QualityName, Quality> = {
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

function smoothstep(value: number) {
  const x = clamp(value, 0, 1);

  return x * x * (3 - 2 * x);
}

function createParticles(
  count: number
): Particle[] {
  return Array.from(
    { length: count },
    (_, index) => ({
      angle:
        (index / count) *
          TAU +
        Math.random() * 0.35,

      radius:
        0.18 +
        Math.random() * 0.7,

      speed:
        (0.08 +
          Math.random() * 0.22) *
        (Math.random() > 0.5
          ? 1
          : -1),

      size:
        0.7 +
        Math.random() * 1.8,

      phase:
        Math.random() * TAU,

      orbit:
        0.75 +
        Math.random() * 0.45,

      drift:
        0.15 +
        Math.random() * 0.45
    })
  );
}

function createNodes(
  count: number
): Node[] {
  return Array.from(
    { length: count },
    (_, index) => ({
      angle:
        (index / count) *
          TAU +
        Math.random() * 0.25,

      radius:
        0.32 +
        Math.random() * 0.52,

      speed:
        (0.03 +
          Math.random() * 0.08) *
        (Math.random() > 0.5
          ? 1
          : -1),

      size:
        1.7 +
        Math.random() * 2.6,

      phase:
        Math.random() * TAU
    })
  );
}

function createBoundary(
  count: number
): BoundaryPoint[] {
  return Array.from(
    { length: count + 1 },
    (_, index) => {
      const angle =
        (index / count) * TAU;

      return {
        sin: Math.sin(angle),
        cos: Math.cos(angle),
        angle
      };
    }
  );
}

function qualityFromArea(
  area: number
): QualityName {
  if (area < 120_000) {
    return "low";
  }

  if (area < 260_000) {
    return "medium";
  }

  return "high";
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
      canvas.getContext("2d", {
        alpha: true,
        desynchronized: true
      });

    if (!context) {
      return;
    }

    const reduceMotionQuery =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    let reducedMotion =
      reduceMotionQuery.matches;

    let animationFrame = 0;
    let resizeObserver:
      | ResizeObserver
      | null = null;

    let intersectionObserver:
      | IntersectionObserver
      | null = null;

    let visible = true;

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

    let pointerTarget: Point = {
      x: 0,
      y: 0
    };

    let pointerActive = false;
    let pointerEnergy = 0;

    let qualityName:
      QualityName = "high";

    let quality =
      QUALITY[qualityName];

    let particles: Particle[] = [];
    let nodes: Node[] = [];
    let boundary: BoundaryPoint[] =
      [];

    let pointerAngle = 0;
    let pointerDistance = 0;

    let performanceSampleTime = 0;
    let performanceFrames = 0;

    let lastQualityChange = 0;

    const buildWorld = (
      name: QualityName
    ) => {
      qualityName = name;
      quality = QUALITY[name];

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

      lastQualityChange =
        performance.now();
    };

    const chooseInitialQuality =
      () => {
        const rect =
          canvas.getBoundingClientRect();

        const area =
          rect.width *
          rect.height;

        buildWorld(
          qualityFromArea(area)
        );
      };

    const resize = () => {
      const rect =
        canvas.getBoundingClientRect();

      width = Math.max(
        1,
        rect.width
      );

      height = Math.max(
        1,
        rect.height
      );

      dpr = Math.min(
        window.devicePixelRatio ||
          1,
        MAX_DPR
      );

      canvas.width =
        Math.floor(
          width * dpr
        );

      canvas.height =
        Math.floor(
          height * dpr
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

      chooseInitialQuality();
    };

    const updatePointer =
      (
        clientX: number,
        clientY: number
      ) => {
        const rect =
          canvas.getBoundingClientRect();

        pointerTarget.x =
          clamp(
            clientX -
              rect.left,
            0,
            width
          );

        pointerTarget.y =
          clamp(
            clientY -
              rect.top,
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

    const getBoundaryRadius =
      (
        point: BoundaryPoint,
        time: number
      ) => {
        const primaryWave =
          Math.sin(
            point.angle * 3 +
              time * 0.0011
          ) * 0.034;

        const secondaryWave =
          Math.sin(
            point.angle * 7 -
              time * 0.0008 +
              1.3
          ) * 0.022;

        const tertiaryWave =
          Math.sin(
            point.angle * 11 +
              time * 0.00065
          ) * 0.012;

        let interaction = 0;

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

          const influence =
            Math.exp(
              -(delta * delta) /
                0.18
            );

          const distanceFactor =
            clamp(
              1 -
                pointerDistance /
                  (radius * 2.2),
              0,
              1
            );

          interaction =
            influence *
            distanceFactor *
            0.075;
        }

        return (
          1 +
          primaryWave +
          secondaryWave +
          tertiaryWave +
          interaction
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
            alpha * 0.46
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

    const drawCore = (
      time: number
    ) => {
      const pulse =
        1 +
        Math.sin(
          time * 0.0022
        ) * 0.035 +
        Math.sin(
          time * 0.0049
        ) * 0.012;

      const activePulse =
        pointerEnergy *
        0.11;

      const coreRadius =
        radius *
        0.49 *
        (pulse +
          activePulse);

      drawGlow(
        centerX,
        centerY,
        coreRadius * 0.08,
        coreRadius * 1.75,
        0.11 +
          pointerEnergy *
            0.04
      );

      const coreGradient =
        context.createRadialGradient(
          centerX -
            coreRadius *
              0.18,

          centerY -
            coreRadius *
              0.2,

          coreRadius * 0.08,

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

      const nucleusRadius =
        radius *
        0.17 *
        (1 +
          Math.sin(
            time * 0.0036
          ) *
            0.08);

      drawGlow(
        centerX,
        centerY,
        nucleusRadius * 0.1,
        nucleusRadius * 2.2,
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
      (time: number) => {
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
            ) * radius;

          const x =
            centerX +
            point.cos *
              normalizedRadius;

          const y =
            centerY +
            point.sin *
              normalizedRadius;

          if (index === 0) {
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

        const gradient =
          context.createRadialGradient(
            centerX,
            centerY,
            radius * 0.35,
            centerX,
            centerY,
            radius * 1.2
          );

        gradient.addColorStop(
          0,
          "rgba(255, 34, 24, 0)"
        );

        gradient.addColorStop(
          0.64,
          "rgba(190, 0, 0, 0.06)"
        );

        gradient.addColorStop(
          0.9,
          "rgba(255, 38, 25, 0.11)"
        );

        gradient.addColorStop(
          1,
          "rgba(255, 25, 20, 0.01)"
        );

        context.fillStyle =
          gradient;

        context.fill();

        context.shadowColor =
          "rgba(255, 32, 24, 0.35)";

        context.shadowBlur =
          18;

        context.lineWidth =
          reducedMotion
            ? 1.2
            : 1.6;

        context.strokeStyle =
          "rgba(255, 55, 40, 0.68)";

        context.stroke();

        context.shadowBlur = 0;

        context.lineWidth = 4;

        context.strokeStyle =
          "rgba(125, 0, 0, 0.12)";

        context.stroke();
      };

    const drawEnergyFlows =
      (time: number) => {
        for (
          let index = 0;
          index <
          quality.flowCount;
          index += 1
        ) {
          const baseAngle =
            (index /
              quality.flowCount) *
              TAU +
            time *
              0.00016 *
              (index % 2 ===
              0
                ? 1
                : -1);

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
                0.05;

            const distance =
              radius *
              (0.12 +
                progress *
                  0.67);

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
              0.025;

            const x =
              centerX +
              Math.cos(angle) *
                (distance +
                  wave);

            const y =
              centerY +
              Math.sin(angle) *
                (distance +
                  wave);

            if (
              segment === 0
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
              0.8;

          context.strokeStyle =
            `rgba(255, 70, 48, ${
              0.08 +
              pointerEnergy *
                0.05
            })`;

          context.stroke();
        }
      };

    const drawParticles = (
      time: number,
      delta: number
    ) => {
      const step =
        delta *
        0.0009 *
        16;

      for (
        let index = 0;
        index <
        particles.length;
        index += 1
      ) {
        const particle =
          particles[index];

        particle.angle +=
          particle.speed *
          (1 +
            pointerEnergy *
              1.8) *
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

        const x =
          centerX +
          Math.cos(
            particle.angle
          ) *
            orbitalRadius +
          swirl;

        const y =
          centerY +
          Math.sin(
            particle.angle
          ) *
            orbitalRadius +
          swirl *
            0.55;

        const pointerInfluence =
          pointerActive
            ? smoothstep(
                1 -
                  Math.hypot(
                    pointer.x -
                      x,

                    pointer.y -
                      y
                  ) /
                    (radius *
                      0.62)
              )
            : 0;

        const size =
          particle.size *
          (1 +
            pointerInfluence *
              0.75);

        context.fillStyle =
          `rgba(255, ${
            60 +
            Math.floor(
              pointerInfluence *
                80
            )
          }, ${
            48 +
            Math.floor(
              pointerInfluence *
                35
            )
          }, ${
            0.28 +
            pointerInfluence *
              0.42
          })`;

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
    };

    const drawNodes = (
      time: number,
      delta: number
    ) => {
      const step =
        delta *
        0.0009 *
        16;

      for (
        let index = 0;
        index < nodes.length;
        index += 1
      ) {
        const node =
          nodes[index];

        node.angle +=
          node.speed * step;

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
          (1 +
            pointerEnergy *
              0.4);

        drawGlow(
          x,
          y,
          nodeSize * 0.15,
          nodeSize * 5,
          0.035 +
            pointerEnergy *
              0.025
        );

        context.fillStyle =
          "rgba(255, 96, 72, 0.78)";

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
    };

    const drawInteraction =
      () => {
        if (
          !pointerActive ||
          pointerEnergy <= 0
        ) {
          return;
        }

        const fieldRadius =
          radius *
          (0.25 +
            pointerEnergy *
              0.8);

        const gradient =
          context.createRadialGradient(
            pointer.x,
            pointer.y,
            0,
            pointer.x,
            pointer.y,
            fieldRadius
          );

        gradient.addColorStop(
          0,
          `rgba(255, 70, 45, ${
            0.11 *
            pointerEnergy
          })`
        );

        gradient.addColorStop(
          0.35,
          `rgba(255, 30, 20, ${
            0.035 *
            pointerEnergy
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
          pointer.x,
          pointer.y,
          fieldRadius,
          0,
          TAU
        );

        context.fill();
      };

    const maybeAdaptQuality =
      (timestamp: number) => {
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

        performanceFrames += 1;

        const sampleElapsed =
          timestamp -
          performanceSampleTime;

        if (
          sampleElapsed <
          1800
        ) {
          return;
        }

        const fps =
          performanceFrames *
          1000 /
          sampleElapsed;

        performanceSampleTime =
          timestamp;

        performanceFrames = 0;

        if (
          timestamp -
            lastQualityChange <
          3500
        ) {
          return;
        }

        /*
         * Hysteresis:
         * degrade quickly when performance is poor,
         * recover only after a comfortable margin.
         */
        if (
          fps < 45 &&
          qualityName !==
            "low"
        ) {
          buildWorld(
            "low"
          );

          return;
        }

        if (
          fps < 68 &&
          qualityName ===
            "high"
        ) {
          buildWorld(
            "medium"
          );

          return;
        }

        if (
          fps >= 86 &&
          qualityName ===
            "low"
        ) {
          buildWorld(
            "medium"
          );

          return;
        }

        if (
          fps >= 92 &&
          qualityName ===
            "medium"
        ) {
          buildWorld(
            "high"
          );
        }
      };

    const render = (
      timestamp: number
    ) => {
      if (!visible) {
        animationFrame = 0;

        return;
      }

      if (
        lastTimestamp === 0
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

      if (
        !reducedMotion
      ) {
        elapsed += delta;
      }

      const time =
        reducedMotion
          ? 0
          : elapsed;

      pointer.x +=
        (pointerTarget.x -
          pointer.x) *
        Math.min(
          1,
          delta * 0.018
        );

      pointer.y +=
        (pointerTarget.y -
          pointer.y) *
        Math.min(
          1,
          delta * 0.018
        );

      const targetEnergy =
        pointerActive ? 1 : 0;

      pointerEnergy +=
        (targetEnergy -
          pointerEnergy) *
        Math.min(
          1,
          delta * 0.008
        );

      updatePointerGeometry();

      context.clearRect(
        0,
        0,
        width,
        height
      );

      drawInteraction();
      drawMembrane(time);
      drawEnergyFlows(time);
      drawCore(time);
      drawParticles(
        time,
        delta
      );
      drawNodes(
        time,
        delta
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
        animationFrame !== 0 ||
        !visible
      ) {
        return;
      }

      lastTimestamp = 0;

      animationFrame =
        window.requestAnimationFrame(
          render
        );
    };

    const stop = () => {
      if (
        animationFrame !== 0
      ) {
        window.cancelAnimationFrame(
          animationFrame
        );

        animationFrame = 0;
      }

      lastTimestamp = 0;
    };

    const handlePointerMove = (
      event: PointerEvent
    ) => {
      updatePointer(
        event.clientX,
        event.clientY
      );

      pointerActive = true;
    };

    const handlePointerLeave =
      () => {
        pointerActive = false;
      };

    const handleMotionChange = (
      event: MediaQueryListEvent
    ) => {
      reducedMotion =
        event.matches;

      if (
        reducedMotion
      ) {
        buildWorld("low");
      } else {
        chooseInitialQuality();
      }
    };

    const handleIntersection =
      (
        entries: IntersectionObserverEntry[]
      ) => {
        visible =
          entries[0]?.isIntersecting ??
          true;

        if (visible) {
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

    reduceMotionQuery.addEventListener(
      "change",
      handleMotionChange
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
          threshold: 0.02
        }
      );

    intersectionObserver.observe(
      canvas
    );

    resize();

    if (reducedMotion) {
      buildWorld("low");
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

      reduceMotionQuery.removeEventListener(
        "change",
        handleMotionChange
      );

      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
    };
  }, []);

  return (
    <div
      className="red-magic"
      role="img"
      aria-label="RED MAGIC living organism"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
      />
    </div>
  );
}
