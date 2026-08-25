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
    useRef<HTMLDivElement | null>(null);

  const trailRef =
    useRef<HTMLDivElement | null>(null);

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

    let targetX = -100;
    let targetY = -100;

    let currentX = -100;
    let currentY = -100;

    let trailX = -100;
    let trailY = -100;

    let frame = 0;
    let visible = false;
    let running = true;

    const setVisible = (
      nextVisible: boolean
    ) => {
      visible = nextVisible;

      cursor.dataset.visible =
        String(nextVisible);

      trail.dataset.visible =
        String(nextVisible);
    };

    const updatePointer = (
      event: PointerEvent
    ) => {
      if (!running) {
        return;
      }

      targetX = event.clientX;
      targetY = event.clientY;

      if (!visible) {
        currentX = targetX;
        currentY = targetY;

        trailX = targetX;
        trailY = targetY;

        setVisible(true);
      }
    };

    const updateHoverState = (
      event: PointerEvent
    ) => {
      const target =
        event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const interactive =
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
        );

      cursor.dataset.hover =
        interactive
          ? "true"
          : "false";
    };

    const hidePointer = () => {
      setVisible(false);
    };

    const animate = () => {
      if (!running) {
        frame = 0;
        return;
      }

      currentX +=
        (targetX - currentX) *
        0.34;

      currentY +=
        (targetY - currentY) *
        0.34;

      trailX +=
        (targetX - trailX) *
        0.14;

      trailY +=
        (targetY - trailY) *
        0.14;

      cursor.style.transform =
        `translate3d(${currentX}px, ${currentY}px, 0)`;

      trail.style.transform =
        `translate3d(${trailX}px, ${trailY}px, 0)`;

      frame =
        window.requestAnimationFrame(
          animate
        );
    };

    const handleVisibility =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          running = true;

          if (!frame) {
            frame =
              window.requestAnimationFrame(
                animate
              );
          }

          return;
        }

        running = false;

        if (frame) {
          window.cancelAnimationFrame(
            frame
          );

          frame = 0;
        }

        setVisible(false);
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

    document.documentElement.dataset.redCursor =
      "ready";

    document.documentElement.classList.add(
      "red-cursor-enabled"
    );

    setVisible(false);

    frame =
      window.requestAnimationFrame(
        animate
      );

    return () => {
      running = false;

      if (frame) {
        window.cancelAnimationFrame(
          frame
        );
      }

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

      delete document.documentElement.dataset.redCursor;

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
        <span className="red-cursor-pyramid">
          <span className="red-cursor-pyramid-top" />
          <span className="red-cursor-pyramid-left" />
          <span className="red-cursor-pyramid-right" />
          <span className="red-cursor-pyramid-core" />
        </span>

        <span className="red-cursor-ring" />
      </div>
    </>,
    document.body
  );
}
