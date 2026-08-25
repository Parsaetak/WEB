"use client";

import { useEffect, useRef } from "react";

export default function RedCursor() {
  const cursorRef =
    useRef<HTMLDivElement | null>(null);

  const trailRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
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

    if (!finePointer.matches) {
      return;
    }

    let targetX = -100;
    let targetY = -100;

    let currentX = targetX;
    let currentY = targetY;

    let trailX = targetX;
    let trailY = targetY;

    let frame = 0;
    let visible = false;

    const updatePointer = (
      event: PointerEvent
    ) => {
      targetX = event.clientX;
      targetY = event.clientY;

      if (!visible) {
        currentX = targetX;
        currentY = targetY;
        trailX = targetX;
        trailY = targetY;

        visible = true;

        cursor.dataset.visible = "true";
        trail.dataset.visible = "true";
      }
    };

    const hidePointer = () => {
      visible = false;

      cursor.dataset.visible = "false";
      trail.dataset.visible = "false";
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
          "a, button, [role='button'], input, textarea, select, summary"
        );

      cursor.dataset.hover =
        interactive
          ? "true"
          : "false";
    };

    const animate = () => {
      currentX +=
        (targetX - currentX) *
        0.32;

      currentY +=
        (targetY - currentY) *
        0.32;

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

    window.addEventListener(
      "pointermove",
      updatePointer,
      { passive: true }
    );

    window.addEventListener(
      "pointerover",
      updateHoverState,
      { passive: true }
    );

    window.addEventListener(
      "pointerout",
      updateHoverState,
      { passive: true }
    );

    window.addEventListener(
      "blur",
      hidePointer
    );

    document.documentElement.dataset.redCursor =
      "ready";

    frame =
      window.requestAnimationFrame(
        animate
      );

    return () => {
      window.cancelAnimationFrame(
        frame
      );

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

      window.removeEventListener(
        "blur",
        hidePointer
      );

      delete document.documentElement.dataset.redCursor;
    };
  }, []);

  return (
    <>
      <div
        ref={trailRef}
        className="red-cursor-trail"
        aria-hidden="true"
      >
        <span />
        <span />
        <span />
      </div>

      <div
        ref={cursorRef}
        className="red-cursor"
        aria-hidden="true"
      >
        <span className="red-cursor-pyramid">
          <span className="red-cursor-pyramid-top" />
          <span className="red-cursor-pyramid-left" />
          <span className="red-cursor-pyramid-right" />
          <span className="red-cursor-pyramid-core" />
        </span>

        <span className="red-cursor-ring" />
      </div>
    </>
  );
}
