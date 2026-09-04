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

  revealable: boolean;
  revealRadius: number;
  revealStrength: number;

  /*
   * true only for particles created directly by a user click.
   *
   * These particles are persisted for the lifetime of the
   * current browser tab through sessionStorage.
   */
  persistentClick: boolean;

  /*
   * Restored particles temporarily keep their position,
   * velocity and impulse values normalized to the previous
   * canvas dimensions until placeParticles() applies the
   * current canvas size.
   */
  persistentLayoutNormalized: boolean;
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

type ParticleLayout = {
  width: number;
  height: number;
};

type PersistedClickParticle = {
  x: number;
  y: number;

  velocityX: number;
  velocityY: number;

  impulseX: number;
  impulseY: number;

  size: number;

  phase: number;
  drift: number;
  twinkle: number;

  hue: number;
  saturation: number;
  lightness: number;
  hueDrift: number;

  revealRadius: number;
  revealStrength: number;
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

/*
 * These values intentionally match the requested click-particle
 * lifetime behavior:
 *
 * - one particle per click
 * - hard lifetime cap of 100 click-created particles
 * - lifetime is scoped to the browser tab
 */
const MAX_PERSISTENT_CLICK_PARTICLES =
  100;

const CLICK_PARTICLE_SESSION_KEY =
  "parsaetak:red-magic:click-particles:v1";

/*
 * WeakMap preserves normal particle-layout state without introducing
 * React state or per-frame allocations.
 */
const particleLayouts = new WeakMap<
  RedMagicParticle[],
  ParticleLayout
>();

/*
 * Cached tab-session persistence state.
 *
 * - persistedClickParticlesCache:
 *   null until sessionStorage has been read.
 *
 * - persistedClickParticleCount:
 *   number of particles confirmed in storage.
 *
 * - livePersistentClickParticleCount:
 *   number of click particles created in this JS lifetime.
 *
 * - persistentClickParticlePending:
 *   true only after one or more click particles have been created
 *   and need to be serialized.
 */
let persistedClickParticlesCache:
  PersistedClickParticle[] | null =
  null;

let persistedClickParticleCount =
  -1;

let livePersistentClickParticleCount =
  -1;

let persistentClickParticlePending =
  false;

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
        state * 1664525 +
        1013904223
      ) >>> 0;

    return (
      state /
      4294967296
    );
  };
}

function getPersistedClickParticles():
  PersistedClickParticle[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  if (
    persistedClickParticlesCache !==
    null
  ) {
    return persistedClickParticlesCache;
  }

  try {
    const raw =
      window.sessionStorage.getItem(
        CLICK_PARTICLE_SESSION_KEY
      );

    if (!raw) {
      persistedClickParticlesCache =
        [];

      persistedClickParticleCount =
        0;

      livePersistentClickParticleCount =
        0;

      return persistedClickParticlesCache;
    }

    const parsed =
      JSON.parse(raw) as unknown;

    if (
      !Array.isArray(parsed)
    ) {
      window.sessionStorage.removeItem(
        CLICK_PARTICLE_SESSION_KEY
      );

      persistedClickParticlesCache =
        [];

      persistedClickParticleCount =
        0;

      livePersistentClickParticleCount =
        0;

      return persistedClickParticlesCache;
    }

    const result:
      PersistedClickParticle[] =
      [];

    const count =
      Math.min(
        parsed.length,
        MAX_PERSISTENT_CLICK_PARTICLES
      );

    for (
      let index = 0;
      index < count;
      index += 1
    ) {
      const value =
        parsed[index] as
          | Partial<PersistedClickParticle>
          | null;

      if (
        !value ||
        typeof value.x !== "number" ||
        typeof value.y !== "number" ||
        typeof value.velocityX !== "number" ||
        typeof value.velocityY !== "number" ||
        typeof value.impulseX !== "number" ||
        typeof value.impulseY !== "number" ||
        typeof value.size !== "number" ||
        typeof value.phase !== "number" ||
        typeof value.drift !== "number" ||
        typeof value.twinkle !== "number" ||
        typeof value.hue !== "number" ||
        typeof value.saturation !== "number" ||
        typeof value.lightness !== "number" ||
        typeof value.hueDrift !== "number" ||
        typeof value.revealRadius !== "number" ||
        typeof value.revealStrength !== "number"
      ) {
        continue;
      }

      result.push({
        x: clamp(
          value.x,
          -1,
          2
        ),

        y: clamp(
          value.y,
          -1,
          2
        ),

        velocityX:
          value.velocityX,

        velocityY:
          value.velocityY,

        impulseX:
          value.impulseX,

        impulseY:
          value.impulseY,

        size:
          value.size,

        phase:
          value.phase,

        drift:
          value.drift,

        twinkle:
          value.twinkle,

        hue:
          value.hue,

        saturation:
          value.saturation,

        lightness:
          value.lightness,

        hueDrift:
          value.hueDrift,

        revealRadius:
          value.revealRadius,

        revealStrength:
          value.revealStrength
      });
    }

    persistedClickParticlesCache =
      result;

    persistedClickParticleCount =
      result.length;

    livePersistentClickParticleCount =
      result.length;

    if (
      result.length ===
      0
    ) {
      window.sessionStorage.removeItem(
        CLICK_PARTICLE_SESSION_KEY
      );
    }

    return result;
  } catch {
    persistedClickParticlesCache =
      [];

    persistedClickParticleCount =
      0;

    livePersistentClickParticleCount =
      0;

    try {
      window.sessionStorage.removeItem(
        CLICK_PARTICLE_SESSION_KEY
      );
    } catch {
      /*
       * sessionStorage may be disabled.
       * The simulation must continue normally.
       */
    }

    return [];
  }
}

function getPersistentClickParticleCount() {
  if (
    livePersistentClickParticleCount <
    0
  ) {
    getPersistedClickParticles();
  }

  return Math.min(
    livePersistentClickParticleCount,
    MAX_PERSISTENT_CLICK_PARTICLES
  );
}

function persistClickParticles(
  particles: RedMagicParticle[],
  width: number,
  height: number
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const safeWidth =
    Math.max(
      1,
      width
    );

  const safeHeight =
    Math.max(
      1,
      height
    );

  const records:
    PersistedClickParticle[] =
    [];

  for (
    let index = 0;
    index < particles.length;
    index += 1
  ) {
    const particle =
      particles[index];

    if (
      !particle.persistentClick
    ) {
      continue;
    }

    if (
      records.length >=
      MAX_PERSISTENT_CLICK_PARTICLES
    ) {
      break;
    }

    records.push({
      x:
        particle.x /
        safeWidth,

      y:
        particle.y /
        safeHeight,

      velocityX:
        particle.velocityX /
        safeWidth,

      velocityY:
        particle.velocityY /
        safeHeight,

      impulseX:
        particle.impulseX /
        safeWidth,

      impulseY:
        particle.impulseY /
        safeHeight,

      size:
        particle.size,

      phase:
        particle.phase,

      drift:
        particle.drift,

      twinkle:
        particle.twinkle,

      hue:
        particle.hue,

      saturation:
        particle.saturation,

      lightness:
        particle.lightness,

      hueDrift:
        particle.hueDrift,

      revealRadius:
        particle.revealRadius,

      revealStrength:
        particle.revealStrength
    });
  }

  if (
    records.length ===
    0
  ) {
    persistedClickParticlesCache =
      [];

    persistedClickParticleCount =
      0;

    try {
      window.sessionStorage.removeItem(
        CLICK_PARTICLE_SESSION_KEY
      );
    } catch {
      /*
       * Ignore unavailable storage.
       */
    }

    return;
  }

  try {
    window.sessionStorage.setItem(
      CLICK_PARTICLE_SESSION_KEY,
      JSON.stringify(
        records
      )
    );

    persistedClickParticlesCache =
      records;

    persistedClickParticleCount =
      records.length;

    livePersistentClickParticleCount =
      Math.max(
        livePersistentClickParticleCount,
        records.length
      );
  } catch {
    /*
     * Storage failure must never interrupt rendering.
     * The in-memory cap remains enforced.
     */
  }
}

function restorePersistedClickParticles(
  particles: RedMagicParticle[]
) {
  const persisted =
    getPersistedClickParticles();

  if (
    persisted.length ===
    0
  ) {
    return;
  }

  for (
    let index = 0;
    index < persisted.length;
    index += 1
  ) {
    const value =
      persisted[index];

    particles.push({
      /*
       * x/y are assigned by placeParticles().
       */
      x:
        0,

      y:
        0,

      /*
       * Store click positions as normalized
       * coordinates so the particle survives
       * viewport-size changes.
       */
      spawnX:
        value.x,

      spawnY:
        value.y,

      /*
       * These values remain normalized until
       * placeParticles() applies the actual
       * current canvas dimensions.
       */
      velocityX:
        value.velocityX,

      velocityY:
        value.velocityY,

      impulseX:
        value.impulseX,

      impulseY:
        value.impulseY,

      size:
        value.size,

      phase:
        value.phase,

      drift:
        value.drift,

      twinkle:
        value.twinkle,

      hue:
        value.hue,

      saturation:
        value.saturation,

      lightness:
        value.lightness,

      hueDrift:
        value.hueDrift,

      /*
       * Restored click particles must remain
       * permanently visible.
       */
      revealable:
        false,

      revealRadius:
        value.revealRadius,

      revealStrength:
        value.revealStrength,

      persistentClick:
        true,

      persistentLayoutNormalized:
        true
    });
  }
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
        now >>>
        7
      )
    ) >>> 0
  );
}

export function createParticles(
  count: number,
  seed: number
): RedMagicParticle[] {
  /*
   * The main RedMagic click path calls
   * createParticles(1, seed).
   *
   * Enforce the 100-particle lifetime cap
   * independently of the component-local counter.
   */
  if (
    count === 1 &&
    getPersistentClickParticleCount() >=
      MAX_PERSISTENT_CLICK_PARTICLES
  ) {
    return [];
  }

  const random =
    createRandomGenerator(
      seed
    );

  const particles =
    Array.from(
      {
        length:
          count
      },
      () => {
        const baseHue =
          PARTICLE_HUES[
            Math.floor(
              random() *
              PARTICLE_HUES.length
            )
          ];

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

          revealable:
            random() <
            PARTICLE_REVEALABLE_RATIO,

          revealRadius:
            0.65 +
            random() *
            0.7,

          revealStrength:
            0.55 +
            random() *
            0.75,

          /*
           * createParticles(1) is the click-particle
           * creation path in the current RedMagic renderer.
           */
          persistentClick:
            count === 1,

          persistentLayoutNormalized:
            false
        };
      }
    );

  if (
    count === 1
  ) {
    /*
     * Keep the lifetime cap in module scope so a
     * component remount cannot reset it.
     */
    livePersistentClickParticleCount =
      Math.min(
        livePersistentClickParticleCount +
        1,
        MAX_PERSISTENT_CLICK_PARTICLES
      );

    /*
     * The actual click position and impulse are
     * assigned by RedMagic immediately after this
     * function returns. Serialization therefore
     * happens on the next animation frame.
     */
    persistentClickParticlePending =
      true;
  } else if (
    count > 1
  ) {
    /*
     * The normal world build is allowed to append
     * the click particles saved for this tab.
     */
    restorePersistedClickParticles(
      particles
    );
  }

  return particles;
}

export function placeParticles(
  particles: RedMagicParticle[],
  width: number,
  height: number
) {
  const safeWidth =
    Math.max(
      1,
      width
    );

  const safeHeight =
    Math.max(
      1,
      height
    );

  const previous =
    particleLayouts.get(
      particles
    );

  /*
   * Initial placement.
   */
  if (
    !previous ||
    previous.width <= 0 ||
    previous.height <= 0
  ) {
    for (
      let index = 0;
      index < particles.length;
      index += 1
    ) {
      const particle =
        particles[index];

      particle.x =
        particle.spawnX *
        safeWidth;

      particle.y =
        particle.spawnY *
        safeHeight;

      /*
       * Restored click particles keep their
       * normalized velocity/impulse until the
       * current canvas size is known.
       */
      if (
        particle.persistentClick &&
        particle.persistentLayoutNormalized
      ) {
        particle.velocityX *=
          safeWidth;

        particle.velocityY *=
          safeHeight;

        particle.impulseX *=
          safeWidth;

        particle.impulseY *=
          safeHeight;

        particle.persistentLayoutNormalized =
          false;
      }
    }
  } else {
    /*
     * Existing live particle field:
     * preserve the current simulation and only
     * scale it to the new canvas dimensions.
     */
    const scaleX =
      safeWidth /
      previous.width;

    const scaleY =
      safeHeight /
      previous.height;

    if (
      Math.abs(
        scaleX - 1
      ) > 0.0001 ||
      Math.abs(
        scaleY - 1
      ) > 0.0001
    ) {
      for (
        let index = 0;
        index < particles.length;
        index += 1
      ) {
        const particle =
          particles[index];

        particle.x *=
          scaleX;

        particle.y *=
          scaleY;

        particle.velocityX *=
          scaleX;

        particle.velocityY *=
          scaleY;

        particle.impulseX *=
          scaleX;

        particle.impulseY *=
          scaleY;
      }
    }
  }

  particleLayouts.set(
    particles,
    {
      width:
        safeWidth,

      height:
        safeHeight
    }
  );
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

  /*
   * Keep the existing 60 Hz reference and
   * frame-hitch protection.
   */
  const deltaScale =
    clamp(
      delta / 16,
      0.25,
      2
    );

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

  const driftTime =
    reducedMotion
      ? 0
      : time;

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

  const pointerVisible =
    pointerActive &&
    !reducedMotion;

  const pointerX =
    pointer.x;

  const pointerY =
    pointer.y;

  /*
   * Persistence is intentionally outside the
   * per-particle hot loop.
   *
   * It executes only after at least one new click
   * particle has been created.
   */
  if (
    persistentClickParticlePending
  ) {
    persistClickParticles(
      particles,
      width,
      height
    );

    persistentClickParticlePending =
      false;
  }

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

    const waveX =
      reducedMotion
        ? 0
        : Math.sin(
            driftTime *
              0.0009 *
              particle.drift +
              particle.phase
          ) *
          0.0028;

    const waveY =
      reducedMotion
        ? 0
        : Math.cos(
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

    /*
     * Continuous wrapping keeps every particle
     * alive indefinitely.
     */
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

    /*
     * Calculate cursor distance once.
     */
    const pointerDistanceSquared =
      pointerVisible
        ? distanceSquared(
            pointerX,
            pointerY,
            particle.x,
            particle.y
          )
        : Number.POSITIVE_INFINITY;

    let pointerDistance =
      0;

    let mouseReveal =
      0;

    if (
      pointerVisible
    ) {
      const revealRadius =
        revealBaseRadius *
        particle.revealRadius;

      const revealRadiusSquared =
        revealRadius *
        revealRadius;

      const needsPointerDistance =
        pointerDistanceSquared <
          revealRadiusSquared ||
        pointerDistanceSquared <
          influenceRadiusSquared;

      if (
        needsPointerDistance
      ) {
        pointerDistance =
          Math.sqrt(
            pointerDistanceSquared
          );
      }

      /*
       * Only normal revealable particles can
       * disappear when the pointer moves away.
       *
       * Click-created particles remain visible.
       */
      if (
        particle.revealable &&
        pointerDistanceSquared <
          revealRadiusSquared
      ) {
        const normalizedDistance =
          clamp(
            pointerDistance /
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
      pointerVisible &&
      pointerDistanceSquared <
        influenceRadiusSquared
    ) {
      interactionVisibility =
        smoothstep(
          1 -
            pointerDistance /
              influenceRadius
        ) *
        profile.pointerGain;
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
        hue +
        360
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
     * Revealed particles get a tiny hot center.
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
          context.globalAlpha *
            (
              0.65 +
              revealIntensity *
              0.35
            ),
          PARTICLE_MIN_VISIBLE_ALPHA,
          1
        );

      context.fillStyle =
        "rgba(255, 245, 238, 0.96)";

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
