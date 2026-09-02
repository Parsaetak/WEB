"use client";

import {
  createPortal
} from "react-dom";

import {
  useEffect,
  useRef,
  useState
} from "react";

/*
 * Hoisted once at module level: building this selector string on every
 * pointerover/pointerout event allocated needlessly in a hot path.
 */
const HOVER_TARGET_SELECTOR = [
  "a",
  "button",
  "[role='button']",
  "input",
  "textarea",
  "select",
  "summary"
].join(", ");

/*
 * The cursor is a single crisp vector instrument: no drop-shadow
 * filters, no glow circles, no trailing lights. Blur filters on a
 * per-frame translated element force expensive repaints and read as
 * haze; clean geometry with geometric precision stays sharp on any
 * display density.
 */
export default function RedCursor() {
  const cursorRef =
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

    if (!cursor) {
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

    /*
     * Latest browser pointer coordinates only.
     *
     * There is no interpolation, acceleration, smoothing, or speed
     * multiplier. The custom cursor follows the browser pointer position
     * directly.
     */
    const pointer = {
      x: -100,
      y: -100
    };

    /*
     * Only write a data attribute when its value actually changes.
     * This keeps hover/visibility state changes out of the animation
     * hot path.
     */
    const setVisible = (
      visible: boolean
    ) => {
      const nextValue =
        String(visible);

      if (
        cursor.dataset.visible !==
        nextValue
      ) {
        cursor.dataset.visible =
          nextValue;
      }
    };

    const setHover = (
      hover: boolean
    ) => {
      const nextValue =
        hover
          ? "true"
          : "false";

      if (
        cursor.dataset.hover !==
        nextValue
      ) {
        cursor.dataset.hover =
          nextValue;
      }
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

      /*
       * Exactly one per-frame DOM write.
       *
       * requestAnimationFrame coalesces high-polling-rate mouse events
       * to the browser's render cadence without introducing visual lag
       * through interpolation.
       */
      cursor.style.transform =
        `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;

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

      const nextHoverTarget =
        Boolean(
          target.closest(
            HOVER_TARGET_SELECTOR
          )
        );

      if (
        nextHoverTarget !==
        hoverTarget
      ) {
        hoverTarget =
          nextHoverTarget;

        setHover(
          hoverTarget
        );
      }
    };

    const updatePointer = (
      event: PointerEvent
    ) => {
      pointer.x =
        event.clientX;

      pointer.y =
        event.clientY;

      if (!pointerInside) {
        pointerInside = true;
        setVisible(true);
      }

      requestFrame();
    };

    const hidePointer = () => {
      if (!pointerInside) {
        return;
      }

      pointerInside = false;
      hoverTarget = false;

      setVisible(false);
      setHover(false);
    };

    const handleVisibility =
      () => {
        const visible =
          document.visibilityState ===
          "visible";

        if (visible) {
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

        setVisible(false);
        setHover(false);
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

    setVisible(false);
    setHover(false);

    return () => {
      running = false;

      if (
        frameRef.current
      ) {
        window.cancelAnimationFrame(
          frameRef.current
        );
      }

      stopFrame();

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
        shape-rendering="geometricPrecision"
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
        </defs>

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
          className="red-cursor-pointer-contour"
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
          fill="none"
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
          className="red-cursor-eye"
          cx="14.5"
          cy="23"
          r="4"
        />

        <circle
          className="red-cursor-eye-core"
          cx="14.5"
          cy="23"
          r="1.6"
        />
      </svg>

      <span className="red-cursor-ring" />
    </div>,
    document.body
  );
}
