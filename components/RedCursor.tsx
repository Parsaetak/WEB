"use client";

import {
  createPortal
} from "react-dom";

import {
  useEffect,
  useRef,
  useState
} from "react";

export default function RedCursor() {
  const cursorRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const trailRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const frameRef =
    useRef(0);

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const cursor =
      cursorRef.current;

    const trail =
      trailRef.current;

    if (!cursor || !trail) {
      return;
    }

    const finePointer =
      window.matchMedia(
        "(hover: hover) and (pointer: fine)"
      );

    const reduceMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    if (
      !finePointer.matches ||
      reduceMotion.matches
    ) {
      return;
    }

    let running = true;

    let frameRequested = false;

    let pointerInside = false;

    let hoverTarget = false;

    const pointer = {
      x: -100,
      y: -100
    };

    const cursorPosition = {
      x: -100,
      y: -100
    };

    const trailPosition = {
      x: -100,
      y: -100
    };

    const applyState = () => {
      cursor.dataset.visible =
        String(pointerInside);

      trail.dataset.visible =
        String(pointerInside);

      cursor.dataset.hover =
        hoverTarget
          ? "true"
          : "false";
    };

    const stopFrame = () => {
      frameRequested = false;
      frameRef.current = 0;
    };

    const animate = () => {
      frameRequested = false;

      if (!running) {
        frameRef.current = 0;
        return;
      }

      const cursorSmoothing =
        0.82;

      const trailSmoothing =
        0.18;

      cursorPosition.x +=
        (pointer.x -
          cursorPosition.x) *
        cursorSmoothing;

      cursorPosition.y +=
        (pointer.y -
          cursorPosition.y) *
        cursorSmoothing;

      trailPosition.x +=
        (cursorPosition.x -
          trailPosition.x) *
        trailSmoothing;

      trailPosition.y +=
        (cursorPosition.y -
          trailPosition.y) *
        trailSmoothing;

      cursor.style.transform =
        `translate3d(${cursorPosition.x}px, ${cursorPosition.y}px, 0)`;

      trail.style.transform =
        `translate3d(${trailPosition.x}px, ${trailPosition.y}px, 0)`;

      applyState();

      const cursorDelta =
        Math.abs(
          pointer.x -
            cursorPosition.x
        ) +
        Math.abs(
          pointer.y -
            cursorPosition.y
        );

      const trailDelta =
        Math.abs(
          cursorPosition.x -
            trailPosition.x
        ) +
        Math.abs(
          cursorPosition.y -
            trailPosition.y
        );

      const shouldContinue =
        pointerInside &&
        (
          cursorDelta > 0.05 ||
          trailDelta > 0.05
        );

      if (
        shouldContinue
      ) {
        frameRef.current =
          window.requestAnimationFrame(
            animate
          );

        frameRequested = true;

        return;
      }

      frameRef.current = 0;
    };

    const requestFrame = () => {
      if (
        !running ||
        frameRequested
      ) {
        return;
      }

      frameRequested = true;

      frameRef.current =
        window.requestAnimationFrame(
          animate
        );
    };

    const updateHoverState = (
      event: PointerEvent
    ) => {
      const target =
        event.target;

      if (
        !(target instanceof Element)
      ) {
        return;
      }

      hoverTarget =
        Boolean(
          target.closest(
            [
              "a",
              "button",
              "[role='button']",
              "input",
              "textarea",
              "select",
              "summary"
            ].join(", ")
          )
        );

      requestFrame();
    };

    const updatePointer = (
      event: PointerEvent
    ) => {
      pointer.x =
        event.clientX;

      pointer.y =
        event.clientY;

      pointerInside = true;

      if (
        cursorPosition.x <
        -50
      ) {
        cursorPosition.x =
          event.clientX;

        cursorPosition.y =
          event.clientY;

        trailPosition.x =
          event.clientX;

        trailPosition.y =
          event.clientY;
      }

      requestFrame();
    };

    const hidePointer = () => {
      pointerInside = false;
      hoverTarget = false;

      requestFrame();
    };

    const handleVisibility =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          running = true;
          requestFrame();

          return;
        }

        running = false;

        if (
          frameRef.current
        ) {
          window.cancelAnimationFrame(
            frameRef.current
          );
        }

        stopFrame();

        pointerInside = false;
        hoverTarget = false;

        applyState();
      };

    window.addEventListener(
      "pointermove",
      updatePointer,
      {
        passive: true
      }
    );

    window.addEventListener(
      "pointerover",
      updateHoverState,
      {
        passive: true
      }
    );

    window.addEventListener(
      "pointerout",
      updateHoverState,
      {
        passive: true
      }
    );

    document.addEventListener(
      "mouseleave",
      hidePointer
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    document.documentElement.classList.add(
      "red-cursor-enabled"
    );

    applyState();

    return () => {
      running = false;

      if (
        frameRef.current
      ) {
        window.cancelAnimationFrame(
          frameRef.current
        );
      }

      frameRequested = false;
      frameRef.current = 0;

      window.removeEventListener(
        "pointermove",
        updatePointer
      );

      window.removeEventListener(
        "pointerover",
        updateHoverState
      );

      window.removeEventListener(
        "pointerout",
        updateHoverState
      );

      document.removeEventListener(
        "mouseleave",
        hidePointer
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

      document.documentElement.classList.remove(
        "red-cursor-enabled"
      );
    };
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <>
      <div
        ref={trailRef}
        className="red-cursor-trail"
        aria-hidden="true"
        data-visible="false"
      >
        <span />
        <span />
        <span />
      </div>

      <div
        ref={cursorRef}
        className="red-cursor"
        aria-hidden="true"
        data-visible="false"
        data-hover="false"
      >
        <svg
          className="red-cursor-svg"
          viewBox="0 0 48 58"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="redCursorFace"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#ff5848"
              />

              <stop
                offset="42%"
                stopColor="#d20f0f"
              />

              <stop
                offset="100%"
                stopColor="#460000"
              />
            </linearGradient>

            <linearGradient
              id="redCursorSide"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#ff3028"
              />

              <stop
                offset="100%"
                stopColor="#680000"
              />
            </linearGradient>

            <filter
              id="redCursorGlow"
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >
              <feGaussianBlur
                stdDeviation="1.8"
                result="blur"
              />

              <feMerge>
                <feMergeNode
                  in="blur"
                />

                <feMergeNode
                  in="SourceGraphic"
                />
              </feMerge>
            </filter>
          </defs>

          {/*
            True pointer silhouette:
            the sharp upper-left point is the click tip,
            while the rest forms a pyramid.
          */}

          <path
            className="red-cursor-pointer-shadow"
            d="
              M 2 2
              L 2 52
              L 15 39
              L 27 56
              L 36 51
              L 24 34
              L 43 34
              Z
            "
          />

          <path
            className="red-cursor-pointer"
            fill="url(#redCursorFace)"
            d="
              M 1.5 1.5
              L 1.5 49
              L 14.5 36.5
              L 26.5 53.5
              L 34 48.5
              L 22.5 32.5
              L 41.5 32.5
              Z
            "
          />

          <path
            className="red-cursor-pointer-edge"
            fill="url(#redCursorSide)"
            d="
              M 1.5 1.5
              L 22.5 32.5
              L 41.5 32.5
              L 1.5 1.5
              Z
            "
          />

          <path
            className="red-cursor-pointer-highlight"
            d="
              M 3.5 5
              L 3.5 43
              L 13.5 33.5
            "
            fill="none"
          />

          <circle
            className="red-cursor-eye-glow"
            cx="14.5"
            cy="23"
            r="8.5"
            filter="url(#redCursorGlow)"
          />

          <circle
            className="red-cursor-eye"
            cx="14.5"
            cy="23"
            r="4"
          />

          <circle
            className="red-cursor-eye-core"
            cx="14.5"
            cy="23"
            r="1.5"
          />
        </svg>

        <span className="red-cursor-ring" />
      </div>
    </>,
    document.body
  );
}
