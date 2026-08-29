"use client";

import {
  useEffect,
  useRef
} from "react";

type InteractionKind =
  | "enter"
  | "impact"
  | "flick"
  | "orbit"
  | "leave";

type RippleSlot = {
  element: HTMLSpanElement;
  activeUntil: number;
};

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

const MIN_SOUND_INTERVAL = 80;

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
    Math.sin(next - previous),
    Math.cos(next - previous)
  );
}

export default function MagicInteractionLayer({
  children,
  soundEnabled
}: MagicInteractionLayerProps) {
  const rootRef =
    useRef<HTMLDivElement | null>(null);

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
    useRef<DOMRect | null>(null);

  const angleRef =
    useRef(0);

  const accumulatedOrbitRef =
    useRef(0);

  const lastInteractionRef =
    useRef<InteractionKind | null>(
      null
    );

  const lastSoundRef =
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

    let audioContext =
      audioContextRef.current;

    if (!audioContext) {
      audioContext =
        new AudioContext();

      const master =
        audioContext.createGain();

      master.gain.value =
        0.075;

      master.connect(
        audioContext.destination
      );

      audioContextRef.current =
        audioContext;

      masterGainRef.current =
        master;
    }

    if (
      audioContext.state ===
      "suspended"
    ) {
      await audioContext.resume();
    }

    return audioContext;
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

        type =
          "sine";

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

        type =
          "sine";

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
      kind ===
      "flick"
    ) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(
          80,
          frequency * 0.52
        ),
        end
      );
    } else if (
      kind ===
      "orbit"
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
      `${42 + intensity * 110}px`
    );

    ripple.style.setProperty(
      "--ripple-strength",
      `${0.38 + intensity * 0.46}`
    );

    ripple.classList.remove(
      "is-active"
    );

    void ripple.offsetWidth;

    ripple.classList.add(
      "is-active"
    );
  };

  const setInteractionState = (
    kind:
      | InteractionKind
      | null
  ) => {
    const root =
      rootRef.current;

    if (!root) {
      return;
    }

    root.dataset.interaction =
      kind ?? "idle";
  };

  const handlePointerEnter = (
    event: React.PointerEvent<HTMLDivElement>
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

    setInteractionState(
      "enter"
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
    event: React.PointerEvent<HTMLDivElement>
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
      x - previous.x;

    const dy =
      y - previous.y;

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
      x - center.x;

    const centerDy =
      y - center.y;

    const centerDistance =
      Math.hypot(
        centerDx,
        centerDy
      );

    const maxDistance =
      Math.hypot(
        center.x,
        center.y
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
    }

    if (
      flicking
    ) {
      setInteractionState(
        "flick"
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

    if (
      orbiting
    ) {
      setInteractionState(
        "orbit"
      );

      void playTone(
        "orbit",
        proximity
      );

      accumulatedOrbitRef.current =
        0;

      return;
    }

    if (
      proximity >
      0.68
    ) {
      setInteractionState(
        "impact"
      );
    } else {
      setInteractionState(
        null
      );
    }
  };

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>
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
        x - center.x,
        y - center.y
      );

    const maxDistance =
      Math.hypot(
        center.x,
        center.y
      );

    const proximity =
      1 -
      clamp(
        distance /
          maxDistance,
        0,
        1
      );

    setInteractionState(
      "impact"
    );

    triggerRipple(
      x,
      y,
      0.5 +
        proximity * 0.5
    );

    void playTone(
      "impact",
      0.45 +
        proximity * 0.55
    );
  };

  const handlePointerLeave = () => {
    setInteractionState(
      "leave"
    );

    accumulatedOrbitRef.current =
      0;

    void playTone(
      "leave",
      0.3
    );

    window.setTimeout(
      () => {
        if (
          rootRef.current
        ) {
          setInteractionState(
            null
          );
        }
      },
      260
    );
  };

  useEffect(() => {
    const query =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    reducedMotionRef.current =
      query.matches;

    const handleMotionChange =
      (
        event: MediaQueryListEvent
      ) => {
        reducedMotionRef.current =
          event.matches;
      };

    query.addEventListener(
      "change",
      handleMotionChange
    );

    updateGeometry();

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
      query.removeEventListener(
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
