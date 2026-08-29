"use client";

import {
  useEffect,
  useRef
} from "react";

import {
  emitRedMagicInteraction
} from "@/components/RedMagicInteraction";

type InteractionKind =
  | "enter"
  | "impact"
  | "flick"
  | "orbit"
  | "leave";

type Point = {
  x: number;
  y: number;
};

type MagicInteractionLayerProps = {
  children: React.ReactNode;
  soundEnabled: boolean;
};

const RIPPLE_COUNT = 8;

const ORBIT_THRESHOLD = 0.012;

const FLICK_THRESHOLD = 1.15;

const MIN_SOUND_INTERVAL = 90;

const CHARGE_RATE = 0.00082;

const CHARGE_SOUND_INTERVAL = 260;

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

function angleDelta(
  next: number,
  previous: number
) {
  return Math.atan2(
    Math.sin(
      next - previous
    ),
    Math.cos(
      next - previous
    )
  );
}

export default function MagicInteractionLayer({
  children,
  soundEnabled
}: MagicInteractionLayerProps) {
  const rootRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const pointerRef =
    useRef<Point>({
      x: 0,
      y: 0
    });

  const previousPointerRef =
    useRef<Point>({
      x: 0,
      y: 0
    });

  const previousTimeRef =
    useRef(0);

  const centerRef =
    useRef<Point>({
      x: 0,
      y: 0
    });

  const rectRef =
    useRef<DOMRect | null>(
      null
    );

  const angleRef =
    useRef(0);

  const accumulatedOrbitRef =
    useRef(0);

  const lastSoundRef =
    useRef(0);

  const lastChargeSoundRef =
    useRef(0);

  const rippleIndexRef =
    useRef(0);

  const audioContextRef =
    useRef<AudioContext | null>(
      null
    );

  const masterGainRef =
    useRef<GainNode | null>(
      null
    );

  const reducedMotionRef =
    useRef(false);

  const pointerHeldRef =
    useRef(false);

  const chargeRef =
    useRef(0);

  const updateGeometry = () => {
    const root =
      rootRef.current;

    if (!root) {
      return;
    }

    const rect =
      root.getBoundingClientRect();

    rectRef.current =
      rect;

    centerRef.current = {
      x:
        rect.width * 0.5,
      y:
        rect.height * 0.5
    };
  };

  const getCanvasTarget = () => {
    const root =
      rootRef.current;

    if (!root) {
      return null;
    }

    return (
      root.querySelector(
        "canvas"
      ) ?? root
    );
  };

  const emitInteraction = (
    type:
      | "enter"
      | "move"
      | "impact"
      | "flick"
      | "charge"
      | "release"
      | "orbit"
      | "leave",
    x: number,
    y: number,
    velocity: number,
    proximity: number,
    energy: number,
    angle: number,
    charge: number
  ) => {
    const target =
      getCanvasTarget();

    if (!target) {
      return;
    }

    emitRedMagicInteraction(
      target,
      {
        type,
        x,
        y,
        velocity,
        proximity,
        energy,
        angle,
        charge
      }
    );
  };

  const ensureAudio = async () => {
    if (!soundEnabled) {
      return null;
    }

    if (
      typeof window ===
      "undefined"
    ) {
      return null;
    }

    let context =
      audioContextRef.current;

    if (!context) {
      context =
        new AudioContext();

      const master =
        context.createGain();

      master.gain.value =
        0.075;

      master.connect(
        context.destination
      );

      audioContextRef.current =
        context;

      masterGainRef.current =
        master;
    }

    if (
      context.state ===
      "suspended"
    ) {
      await context.resume();
    }

    return context;
  };

  const playTone = async (
    kind: InteractionKind,
    intensity: number
  ) => {
    if (
      !soundEnabled ||
      reducedMotionRef.current
    ) {
      return;
    }

    const now =
      performance.now();

    if (
      now -
        lastSoundRef.current <
      MIN_SOUND_INTERVAL
    ) {
      return;
    }

    lastSoundRef.current =
      now;

    const context =
      await ensureAudio();

    const master =
      masterGainRef.current;

    if (
      !context ||
      !master
    ) {
      return;
    }

    const oscillator =
      context.createOscillator();

    const gain =
      context.createGain();

    const filter =
      context.createBiquadFilter();

    const normalized =
      clamp(
        intensity,
        0,
        1
      );

    let frequency =
      220;

    let duration =
      0.12;

    let type:
      OscillatorType =
      "sine";

    switch (kind) {
      case "enter":
        frequency =
          150 +
          normalized * 70;

        duration =
          0.18;
        break;

      case "impact":
        frequency =
          180 +
          normalized * 280;

        duration =
          0.14;

        type =
          "triangle";
        break;

      case "flick":
        frequency =
          260 +
          normalized * 520;

        duration =
          0.095;

        type =
          "sawtooth";
        break;

      case "orbit":
        frequency =
          320 +
          normalized * 260;

        duration =
          0.22;

        type =
          "triangle";
        break;

      case "leave":
        frequency =
          170;

        duration =
          0.2;
        break;
    }

    const start =
      context.currentTime;

    const end =
      start + duration;

    oscillator.type =
      type;

    oscillator.frequency.setValueAtTime(
      frequency,
      start
    );

    if (
      kind === "flick"
    ) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(
          80,
          frequency * 0.52
        ),
        end
      );
    }

    if (
      kind === "orbit"
    ) {
      oscillator.frequency.linearRampToValueAtTime(
        frequency * 1.12,
        end
      );
    }

    filter.type =
      "lowpass";

    filter.frequency.setValueAtTime(
      1800 +
        normalized * 2600,
      start
    );

    filter.Q.value =
      0.65;

    gain.gain.setValueAtTime(
      0.0001,
      start
    );

    gain.gain.exponentialRampToValueAtTime(
      0.08 +
        normalized * 0.08,
      start + 0.008
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      end
    );

    oscillator.connect(
      filter
    );

    filter.connect(
      gain
    );

    gain.connect(
      master
    );

    oscillator.start(
      start
    );

    oscillator.stop(
      end + 0.015
    );
  };

  const triggerRipple = (
    x: number,
    y: number,
    intensity: number
  ) => {
    if (
      reducedMotionRef.current
    ) {
      return;
    }

    const root =
      rootRef.current;

    if (!root) {
      return;
    }

    const ripples =
      root.querySelectorAll<HTMLSpanElement>(
        ".magic-interaction-ripple"
      );

    if (
      ripples.length ===
      0
    ) {
      return;
    }

    const index =
      rippleIndexRef.current %
      ripples.length;

    rippleIndexRef.current +=
      1;

    const ripple =
      ripples[index];

    ripple.style.setProperty(
      "--ripple-x",
      `${x}px`
    );

    ripple.style.setProperty(
      "--ripple-y",
      `${y}px`
    );

    ripple.style.setProperty(
      "--ripple-size",
      `${42 +
        intensity *
          120}px`
    );

    ripple.style.setProperty(
      "--ripple-strength",
      `${0.38 +
        intensity *
          0.46}`
    );

    ripple.classList.remove(
      "is-active"
    );

    void ripple.offsetWidth;

    ripple.classList.add(
      "is-active"
    );
  };

  const handlePointerEnter = (
    event:
      React.PointerEvent<HTMLDivElement>
  ) => {
    updateGeometry();

    const rect =
      rectRef.current;

    if (!rect) {
      return;
    }

    const x =
      event.clientX -
      rect.left;

    const y =
      event.clientY -
      rect.top;

    const center =
      centerRef.current;

    const angle =
      Math.atan2(
        y -
          center.y,
        x -
          center.x
      );

    pointerRef.current = {
      x,
      y
    };

    previousPointerRef.current = {
      x,
      y
    };

    previousTimeRef.current =
      performance.now();

    angleRef.current =
      angle;

    accumulatedOrbitRef.current =
      0;

    emitInteraction(
      "enter",
      x,
      y,
      0,
      0,
      0,
      angle,
      chargeRef.current
    );

    triggerRipple(
      x,
      y,
      0.55
    );

    void playTone(
      "enter",
      0.55
    );
  };

  const handlePointerMove = (
    event:
      React.PointerEvent<HTMLDivElement>
  ) => {
    const rect =
      rectRef.current;

    if (!rect) {
      updateGeometry();
      return;
    }

    const x =
      event.clientX -
      rect.left;

    const y =
      event.clientY -
      rect.top;

    const now =
      performance.now();

    const previous =
      previousPointerRef.current;

    const deltaTime =
      Math.max(
        8,
        now -
          previousTimeRef.current
      );

    const dx =
      x -
      previous.x;

    const dy =
      y -
      previous.y;

    const distance =
      Math.hypot(
        dx,
        dy
      );

    const velocity =
      distance /
      deltaTime;

    const center =
      centerRef.current;

    const centerDx =
      x -
      center.x;

    const centerDy =
      y -
      center.y;

    const centerDistance =
      Math.hypot(
        centerDx,
        centerDy
      );

    const maxDistance =
      Math.max(
        1,
        Math.hypot(
          center.x,
          center.y
        )
      );

    const proximity =
      1 -
      clamp(
        centerDistance /
          maxDistance,
        0,
        1
      );

    const currentAngle =
      Math.atan2(
        centerDy,
        centerDx
      );

    const deltaAngle =
      angleDelta(
        currentAngle,
        angleRef.current
      );

    angleRef.current =
      currentAngle;

    accumulatedOrbitRef.current +=
      deltaAngle;

    const orbiting =
      Math.abs(
        deltaAngle
      ) >
        ORBIT_THRESHOLD &&
      Math.abs(
        accumulatedOrbitRef.current
      ) >
        Math.PI * 0.9 &&
      proximity >
        0.18;

    const flicking =
      velocity >
      FLICK_THRESHOLD;

    if (
      pointerHeldRef.current
    ) {
      chargeRef.current =
        clamp(
          chargeRef.current +
            deltaTime *
              CHARGE_RATE,
          0,
          1
        );
    }

    pointerRef.current = {
      x,
      y
    };

    previousPointerRef.current = {
      x,
      y
    };

    previousTimeRef.current =
      now;

    const root =
      rootRef.current;

    if (root) {
      root.style.setProperty(
        "--magic-pointer-x",
        `${x}px`
      );

      root.style.setProperty(
        "--magic-pointer-y",
        `${y}px`
      );

      root.style.setProperty(
        "--magic-proximity",
        `${proximity}`
      );

      root.style.setProperty(
        "--magic-velocity",
        `${clamp(
          velocity * 10,
          0,
          1
        )}`
      );

      root.style.setProperty(
        "--magic-angle",
        `${currentAngle}rad`
      );

      root.style.setProperty(
        "--magic-charge",
        `${chargeRef.current}`
      );
    }

    emitInteraction(
      "move",
      x,
      y,
      velocity,
      proximity,
      proximity,
      currentAngle,
      chargeRef.current
    );

    if (
      pointerHeldRef.current
    ) {
      emitInteraction(
        "charge",
        x,
        y,
        velocity,
        proximity,
        chargeRef.current,
        currentAngle,
        chargeRef.current
      );

      const nowForSound =
        performance.now();

      if (
        chargeRef.current >
          0.35 &&
        nowForSound -
          lastChargeSoundRef.current >
          CHARGE_SOUND_INTERVAL
      ) {
        lastChargeSoundRef.current =
          nowForSound;

        void playTone(
          "orbit",
          chargeRef.current *
            0.4
        );
      }
    }

    if (flicking) {
      emitInteraction(
        "flick",
        x,
        y,
        velocity,
        proximity,
        clamp(
          velocity / 10,
          0,
          1
        ),
        currentAngle,
        chargeRef.current
      );

      triggerRipple(
        x,
        y,
        clamp(
          velocity * 0.65,
          0.35,
          1
        )
      );

      void playTone(
        "flick",
        clamp(
          velocity * 0.5,
          0,
          1
        )
      );

      return;
    }

    if (orbiting) {
      emitInteraction(
        "orbit",
        x,
        y,
        velocity,
        proximity,
        proximity,
        currentAngle,
        chargeRef.current
      );

      void playTone(
        "orbit",
        proximity
      );

      accumulatedOrbitRef.current =
        0;
    }
  };

  const handlePointerDown = (
    event:
      React.PointerEvent<HTMLDivElement>
  ) => {
    const rect =
      rectRef.current;

    if (!rect) {
      updateGeometry();
      return;
    }

    const x =
      event.clientX -
      rect.left;

    const y =
      event.clientY -
      rect.top;

    const center =
      centerRef.current;

    const distance =
      Math.hypot(
        x -
          center.x,
        y -
          center.y
      );

    const maxDistance =
      Math.max(
        1,
        Math.hypot(
          center.x,
          center.y
        )
      );

    const proximity =
      1 -
      clamp(
        distance /
          maxDistance,
        0,
        1
      );

    pointerHeldRef.current =
      true;

    chargeRef.current =
      0;

    lastChargeSoundRef.current =
      0;

    const angle =
      Math.atan2(
        y -
          center.y,
        x -
          center.x
      );

    emitInteraction(
      "impact",
      x,
      y,
      0,
      proximity,
      proximity,
      angle,
      0
    );

    triggerRipple(
      x,
      y,
      0.5 +
        proximity *
          0.5
    );

    void playTone(
      "impact",
      0.45 +
        proximity *
          0.55
    );
  };

  const handlePointerUp = () => {
    const root =
      rootRef.current;

    if (!root) {
      return;
    }

    const x =
      pointerRef.current.x;

    const y =
      pointerRef.current.y;

    const center =
      centerRef.current;

    const distance =
      Math.hypot(
        x -
          center.x,
        y -
          center.y
      );

    const maxDistance =
      Math.max(
        1,
        Math.hypot(
          center.x,
          center.y
        )
      );

    const proximity =
      1 -
      clamp(
        distance /
          maxDistance,
        0,
        1
      );

    const charge =
      chargeRef.current;

    const angle =
      Math.atan2(
        y -
          center.y,
        x -
          center.x
      );

    pointerHeldRef.current =
      false;

    emitInteraction(
      "release",
      x,
      y,
      0,
      proximity,
      charge,
      angle,
      charge
    );

    if (
      charge >
      0.08
    ) {
      triggerRipple(
        x,
        y,
        0.35 +
          charge *
            0.65
      );
    }

    chargeRef.current =
      0;

    root.style.setProperty(
      "--magic-charge",
      "0"
    );
  };

  const handlePointerLeave = () => {
    const x =
      pointerRef.current.x;

    const y =
      pointerRef.current.y;

    pointerHeldRef.current =
      false;

    emitInteraction(
      "leave",
      x,
      y,
      0,
      0,
      0,
      angleRef.current,
      chargeRef.current
    );

    void playTone(
      "leave",
      0.3
    );

    chargeRef.current =
      0;

    const root =
      rootRef.current;

    if (root) {
      root.style.setProperty(
        "--magic-charge",
        "0"
      );
    }

    window.setTimeout(
      () => {
        if (
          rootRef.current
        ) {
          rootRef.current.dataset.interaction =
            "idle";
        }
      },
      260
    );
  };

  useEffect(() => {
    updateGeometry();

    const reduceMotionQuery =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    reducedMotionRef.current =
      reduceMotionQuery.matches;

    const handleMotionChange =
      (
        event:
          MediaQueryListEvent
      ) => {
        reducedMotionRef.current =
          event.matches;
      };

    reduceMotionQuery.addEventListener(
      "change",
      handleMotionChange
    );

    window.addEventListener(
      "resize",
      updateGeometry,
      {
        passive: true
      }
    );

    window.addEventListener(
      "scroll",
      updateGeometry,
      {
        passive: true
      }
    );

    return () => {
      reduceMotionQuery.removeEventListener(
        "change",
        handleMotionChange
      );

      window.removeEventListener(
        "resize",
        updateGeometry
      );

      window.removeEventListener(
        "scroll",
        updateGeometry
      );

      const context =
        audioContextRef.current;

      if (
        context &&
        context.state !==
          "closed"
      ) {
        void context.close();
      }
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="magic-interaction"
      onPointerEnter={
        handlePointerEnter
      }
      onPointerMove={
        handlePointerMove
      }
      onPointerDown={
        handlePointerDown
      }
      onPointerUp={
        handlePointerUp
      }
      onPointerCancel={
        handlePointerUp
      }
      onPointerLeave={
        handlePointerLeave
      }
    >
      <div
        className="magic-interaction-visual"
        aria-hidden="true"
      >
        <span className="magic-interaction-aura" />

        <span className="magic-interaction-orbit magic-interaction-orbit-one" />

        <span className="magic-interaction-orbit magic-interaction-orbit-two" />

        <span className="magic-interaction-orbit magic-interaction-orbit-three" />

        <span className="magic-interaction-axis magic-interaction-axis-x" />

        <span className="magic-interaction-axis magic-interaction-axis-y" />

        {Array.from(
          {
            length:
              RIPPLE_COUNT
          },
          (_, index) => (
            <span
              className="magic-interaction-ripple"
              key={index}
            />
          )
        )}

        <span className="magic-interaction-reticle" />
      </div>

      <div className="magic-interaction-content">
        {children}
      </div>
    </div>
  );
}
