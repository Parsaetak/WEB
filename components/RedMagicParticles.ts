export type RedMagicParticleProfile = {
  pointerGain: number;
  particleImpulse: number;
};

export type RedMagicParticle = {
  x: number;
  y: number;

  spawnX: number;
  spawnY: number;

  velocityX: number;
  velocityY: number;

  size: number;

  phase: number;
  drift: number;
  twinkle: number;

  hue: number;
  saturation: number;
  lightness: number;
  hueDrift: number;

  impulseX: number;
  impulseY: number;

  /*
   * Reveal particles remain completely
   * dormant when the cursor is far away.
   */
  revealable: boolean;

  revealRadius: number;
  revealStrength: number;
};

type Point = {
  x: number;
  y: number;
};

type ParticleRenderOptions = {
  context: CanvasRenderingContext2D;

  particles: RedMagicParticle[];

  width: number;
  height: number;

  centerX: number;
  centerY: number;
  radius: number;

  pointer: Point;
  pointerActive: boolean;
  pointerEnergy: number;
  charge: number;

  profile: RedMagicParticleProfile;

  time: number;
  delta: number;

  reducedMotion: boolean;
};

const TAU =
  Math.PI * 2;

const PARTICLE_WRAP_MARGIN =
  80;

const PARTICLE_EDGE_MIN_ALPHA =
  0.12;

const PARTICLE_MIN_VISIBLE_ALPHA =
  0.008;

const PARTICLE_REVEAL_MIN_ALPHA =
  0.84;

const PARTICLE_REVEAL_DISTANCE_SCALE =
  0.32;

const PARTICLE_REVEAL_DISTANCE_POWER =
  1.75;

const PARTICLE_REVEAL_SIZE_BOOST =
  1.8;

const PARTICLE_REVEAL_BRIGHTNESS =
  24;

const PARTICLE_REVEAL_SATURATION =
  12;

const PARTICLE_REVEALABLE_RATIO =
  0.42;

const PARTICLE_HUES = [
  0,
  8,
  22,
  42,
  190,
  212,
  252,
  282,
  315,
  336
];

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

function createRandomGenerator(
  seed: number
) {
  let state =
    seed >>> 0;

  return () => {
    state =
      (
        state *
          1664525 +
        1013904223
      ) >>> 0;

    return (
      state /
      4294967296
    );
  };
}

export function createPageSeed() {
  const now =
    Date.now();

  const performanceSeed =
    Math.floor(
      performance.now() *
        1000
    );

  return (
    (
      now ^
      performanceSeed ^
      (
        now >>> 7
      )
    ) >>> 0
  );
}

export function createParticles(
  count: number,
  seed: number
): RedMagicParticle[] {
  const random =
    createRandomGenerator(
      seed
    );

  return Array.from(
    {
      length:
        count
    },
    () => {
      const hueIndex =
        Math.floor(
          random() *
            PARTICLE_HUES.length
        );

      const baseHue =
        PARTICLE_HUES[
          hueIndex
        ];

      const revealable =
        random() <
        PARTICLE_REVEALABLE_RATIO;

      return {
        x:
          0,

        y:
          0,

        spawnX:
          random(),

        spawnY:
          random(),

        velocityX:
          (
            random() -
            0.5
          ) *
          0.06,

        velocityY:
          (
            random() -
            0.5
          ) *
          0.06,

        size:
          0.38 +
          random() *
            1.45,

        phase:
          random() *
          TAU,

        drift:
          0.35 +
          random() *
            1.15,

        twinkle:
          0.6 +
          random() *
            1.6,

        hue:
          baseHue +
          (
            random() -
            0.5
          ) *
            12,

        saturation:
          74 +
          random() *
            20,

        lightness:
          58 +
          random() *
            22,

        hueDrift:
          3 +
          random() *
            12,

        impulseX:
          0,

        impulseY:
          0,

        revealable,

        revealRadius:
          0.65 +
          random() *
            0.7,

        revealStrength:
          0.55 +
          random() *
            0.75
      };
    }
  );
}

export function placeParticles(
  particles: RedMagicParticle[],
  width: number,
  height: number
) {
  for (
    let index = 0;
    index <
      particles.length;
    index += 1
  ) {
    const particle =
      particles[index];

    particle.x =
      particle.spawnX *
      width;

    particle.y =
      particle.spawnY *
      height;
  }
}

export function updateAndDrawParticles(
  options: ParticleRenderOptions
) {
  const {
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
  } =
    options;

  const deltaScale =
    delta /
    16;

  const impulseDecay =
    Math.pow(
      0.91,
      deltaScale
    );

  const damping =
    Math.pow(
      0.985,
      deltaScale
    );

  const revealBaseRadius =
    Math.min(
      width,
      height
    ) *
    PARTICLE_REVEAL_DISTANCE_SCALE;

  const influenceRadius =
    radius *
    0.62;

  const influenceRadiusSquared =
    influenceRadius *
    influenceRadius;

  const pointerX =
    pointer.x;

  const pointerY =
    pointer.y;

  const pointerVisible =
    pointerActive &&
    !reducedMotion;

  context.globalAlpha =
    1;

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

    const driftTime =
      reducedMotion
        ? 0
        : time;

    const waveX =
      Math.sin(
        driftTime *
          0.0009 *
          particle.drift +
          particle.phase
      ) *
      0.0028;

    const waveY =
      Math.cos(
        driftTime *
          0.0009 *
          (
            particle.drift *
            0.82
          ) +
          particle.phase *
            1.37
      ) *
      0.0028;

    particle.velocityX +=
      waveX *
      deltaScale;

    particle.velocityY +=
      waveY *
      deltaScale;

    particle.velocityX *=
      damping;

    particle.velocityY *=
      damping;

    particle.x +=
      particle.velocityX *
      deltaScale;

    particle.y +=
      particle.velocityY *
      deltaScale;

    particle.x +=
      particle.impulseX *
      0.003 *
      deltaScale;

    particle.y +=
      particle.impulseY *
      0.003 *
      deltaScale;

    if (
      particle.x <
      -PARTICLE_WRAP_MARGIN
    ) {
      particle.x =
        width +
        PARTICLE_WRAP_MARGIN;
    } else if (
      particle.x >
      width +
        PARTICLE_WRAP_MARGIN
    ) {
      particle.x =
        -PARTICLE_WRAP_MARGIN;
    }

    if (
      particle.y <
      -PARTICLE_WRAP_MARGIN
    ) {
      particle.y =
        height +
        PARTICLE_WRAP_MARGIN;
    } else if (
      particle.y >
      height +
        PARTICLE_WRAP_MARGIN
    ) {
      particle.y =
        -PARTICLE_WRAP_MARGIN;
    }

    const normalizedCenterDistance =
      Math.min(
        1.6,
        Math.hypot(
          (
            particle.x -
            centerX
          ) /
            Math.max(
              width *
                0.5,
              1
            ),
          (
            particle.y -
            centerY
          ) /
            Math.max(
              height *
                0.5,
              1
            )
        )
      );

    const centerVisibility =
      clamp(
        1 -
          normalizedCenterDistance *
            0.45,
        PARTICLE_EDGE_MIN_ALPHA,
        1
      );

    let mouseReveal =
      0;

    if (
      pointerVisible &&
      particle.revealable
    ) {
      const revealRadius =
        revealBaseRadius *
        particle.revealRadius;

      const revealRadiusSquared =
        revealRadius *
        revealRadius;

      const localDistanceSquared =
        distanceSquared(
          pointerX,
          pointerY,
          particle.x,
          particle.y
        );

      if (
        localDistanceSquared <
        revealRadiusSquared
      ) {
        const distance =
          Math.sqrt(
            localDistanceSquared
          );

        const normalizedDistance =
          clamp(
            distance /
              revealRadius,
            0,
            1
          );

        mouseReveal =
          Math.pow(
            1 -
              smoothstep(
                normalizedDistance
              ),
            PARTICLE_REVEAL_DISTANCE_POWER
          ) *
          particle.revealStrength;
      }
    }

    /*
     * Reveal particles are not merely dimmed
     * when far from the cursor.
     *
     * They genuinely disappear from the
     * visible particle field until the
     * cursor reveals them.
     */
    if (
      particle.revealable &&
      mouseReveal <=
        PARTICLE_MIN_VISIBLE_ALPHA
    ) {
      continue;
    }

    let interactionVisibility =
      0;

    if (
      pointerVisible
    ) {
      const localDistanceSquared =
        distanceSquared(
          pointerX,
          pointerY,
          particle.x,
          particle.y
        );

      if (
        localDistanceSquared <
        influenceRadiusSquared
      ) {
        interactionVisibility =
          smoothstep(
            1 -
              Math.sqrt(
                localDistanceSquared
              ) /
                influenceRadius
          ) *
          profile.pointerGain;
      }
    }

    const twinkle =
      0.82 +
      Math.sin(
        driftTime *
          0.0025 *
          particle.twinkle +
          particle.phase
      ) *
        0.18;

    const revealIntensity =
      clamp(
        mouseReveal,
        0,
        1
      );

    const normalSize =
      particle.size *
      (
        0.5 +
        centerVisibility *
          0.5
      );

    const revealSize =
      normalSize *
      (
        1 +
        revealIntensity *
          (
            PARTICLE_REVEAL_SIZE_BOOST -
            1
          )
      );

    const size =
      revealSize *
      (
        1 +
        interactionVisibility *
          0.7 +
        charge *
          0.12
      );

    const ambientAlpha =
      particle.revealable
        ? 0
        : (
            0.15 +
            centerVisibility *
              0.85
          );

    const revealAlpha =
      particle.revealable
        ? (
            PARTICLE_REVEAL_MIN_ALPHA +
            revealIntensity *
              (
                1 -
                PARTICLE_REVEAL_MIN_ALPHA
              )
          )
        : 1;

    const interactionAlpha =
      1 +
      interactionVisibility *
        0.45;

    const alpha =
      (
        0.22 +
        pointerEnergy *
          0.08 +
        charge *
          0.06
      ) *
      ambientAlpha *
      revealAlpha *
      interactionAlpha *
      twinkle;

    if (
      alpha <=
      PARTICLE_MIN_VISIBLE_ALPHA
    ) {
      continue;
    }

    const hue =
      (
        particle.hue +
        Math.sin(
          driftTime *
            0.00055 +
            particle.phase
        ) *
          particle.hueDrift
      ) %
      360;

    const saturation =
      clamp(
        particle.saturation +
          revealIntensity *
            PARTICLE_REVEAL_SATURATION,
        55,
        100
      );

    const lightness =
      clamp(
        particle.lightness +
          revealIntensity *
            PARTICLE_REVEAL_BRIGHTNESS,
        40,
        96
      );

    context.globalAlpha =
      clamp(
        alpha,
        PARTICLE_MIN_VISIBLE_ALPHA,
        1
      );

    context.fillStyle =
      `hsl(${(
        hue + 360
      ) % 360}, ${saturation}%, ${lightness}%)`;

    context.beginPath();

    context.arc(
      particle.x,
      particle.y,
      Math.max(
        0.35,
        size
      ),
      0,
      TAU
    );

    context.fill();

    /*
     * Revealed particles receive a second,
     * tiny hot center. This creates the
     * impression that the cursor is exposing
     * latent light rather than simply fading
     * an existing particle.
     */
    if (
      revealIntensity >
      0.16
    ) {
      const coreSize =
        Math.max(
          0.35,
          size *
            (
              0.28 +
              revealIntensity *
                0.3
            )
        );

      context.globalAlpha =
        clamp(
          alpha *
            (
              0.35 +
              revealIntensity *
                0.65
            ),
          0,
          1
        );

      context.fillStyle =
        `hsl(${(
          hue + 360
        ) % 360}, ${Math.min(
          100,
          saturation + 4
        )}%, ${Math.min(
          98,
          lightness + 10
        )}%)`;

      context.beginPath();

      context.arc(
        particle.x,
        particle.y,
        coreSize,
        0,
        TAU
      );

      context.fill();
    }
  }

  context.globalAlpha =
    1;
}
