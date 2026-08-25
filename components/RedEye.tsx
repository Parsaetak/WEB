"use client";

import { useEffect, useRef } from "react";

type RedEyeProps = {
  size?: number;
  className?: string;
};

export default function RedEye({
  size = 30,
  className = ""
}: RedEyeProps) {
  const eyeRef =
    useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const eye = eyeRef.current;

    if (!eye) {
      return;
    }

    let frame = 0;
    let start = performance.now();

    const animate = (
      timestamp: number
    ) => {
      const elapsed =
        timestamp - start;

      const pulse =
        1 +
        Math.sin(
          elapsed * 0.0022
        ) * 0.045;

      eye.style.setProperty(
        "--eye-pulse",
        String(pulse)
      );

      eye.style.setProperty(
        "--eye-glow",
        String(
          0.72 +
            Math.sin(
              elapsed * 0.0031
            ) *
              0.16
        )
      );

      frame =
        window.requestAnimationFrame(
          animate
        );
    };

    frame =
      window.requestAnimationFrame(
        animate
      );

    return () => {
      window.cancelAnimationFrame(
        frame
      );
    };
  }, []);

  return (
    <svg
      ref={eyeRef}
      className={`red-eye ${className}`}
      width={size}
      height={size * 0.68}
      viewBox="0 0 100 68"
      role="img"
      aria-label="RED MAGIC all-seeing eye"
      style={
        {
          "--eye-pulse": "1",
          "--eye-glow": "0.8"
        } as React.CSSProperties
      }
    >
      <defs>
        <radialGradient
          id="red-eye-iris"
          cx="50%"
          cy="50%"
          r="50%"
        >
          <stop
            offset="0%"
            stopColor="#fff4ef"
          />
          <stop
            offset="12%"
            stopColor="#ff6652"
          />
          <stop
            offset="42%"
            stopColor="#ff2020"
          />
          <stop
            offset="78%"
            stopColor="#a90000"
          />
          <stop
            offset="100%"
            stopColor="#420000"
          />
        </radialGradient>

        <radialGradient
          id="red-eye-glow"
          cx="50%"
          cy="50%"
          r="50%"
        >
          <stop
            offset="0%"
            stopColor="rgba(255, 45, 35, 0.55)"
          />
          <stop
            offset="55%"
            stopColor="rgba(255, 20, 20, 0.16)"
          />
          <stop
            offset="100%"
            stopColor="rgba(255, 0, 0, 0)"
          />
        </radialGradient>

        <filter
          id="red-eye-soft-glow"
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur
            stdDeviation="3"
            result="blur"
          />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse
        className="red-eye-glow"
        cx="50"
        cy="34"
        rx="41"
        ry="26"
        fill="url(#red-eye-glow)"
      />

      <path
        className="red-eye-outline"
        d="M7 34
           C19 12 35 5 50 5
           C65 5 81 12 93 34
           C81 56 65 63 50 63
           C35 63 19 56 7 34Z"
        fill="rgba(8, 0, 0, 0.45)"
        stroke="rgba(255, 32, 32, 0.78)"
        strokeWidth="2.2"
      />

      <path
        d="M13 34
           C23 17 36 11 50 11
           C64 11 77 17 87 34
           C77 51 64 57 50 57
           C36 57 23 51 13 34Z"
        fill="rgba(42, 0, 0, 0.5)"
        stroke="rgba(255, 50, 38, 0.22)"
        strokeWidth="1"
      />

      <g
        className="red-eye-iris-wrap"
        style={{
          transform:
            "translate(50px 34px) scale(var(--eye-pulse)) translate(-50px -34px)"
        }}
      >
        <circle
          cx="50"
          cy="34"
          r="17"
          fill="url(#red-eye-iris)"
          filter="url(#red-eye-soft-glow)"
        />

        <circle
          cx="50"
          cy="34"
          r="11"
          fill="#8c0000"
          stroke="rgba(255, 120, 100, 0.46)"
          strokeWidth="1"
        />

        <ellipse
          cx="50"
          cy="34"
          rx="4"
          ry="9"
          fill="#070000"
        />

        <circle
          cx="45"
          cy="28"
          r="2.4"
          fill="rgba(255, 255, 255, 0.84)"
        />
      </g>

      <path
        d="M10 29
           C22 9 38 2 50 2
           C62 2 78 9 90 29"
        fill="none"
        stroke="rgba(255, 32, 32, 0.2)"
        strokeWidth="1"
        strokeDasharray="2 5"
        opacity="var(--eye-glow)"
      />
    </svg>
  );
}
