import type {
  CSSProperties
} from "react";

const PARTICLES = Array.from(
  { length: 24 },
  (_, index) => index + 1
);

const RINGS = Array.from(
  { length: 5 },
  (_, index) => index + 1
);

const WISPS = Array.from(
  { length: 7 },
  (_, index) => index + 1
);

type ParticleStyle =
  CSSProperties &
  Record<
    "--dx" | "--dy" | "--delay" | "--duration",
    string
  >;

const PARTICLE_STYLES: ParticleStyle[] = [
  { left: "12%", top: "22%", "--dx": "22px", "--dy": "-28px", "--delay": "-2s", "--duration": "11s" },
  { left: "19%", top: "58%", "--dx": "-18px", "--dy": "24px", "--delay": "-7s", "--duration": "14s" },
  { left: "27%", top: "34%", "--dx": "26px", "--dy": "18px", "--delay": "-4s", "--duration": "12s" },
  { left: "34%", top: "72%", "--dx": "-30px", "--dy": "-16px", "--delay": "-10s", "--duration": "15s" },
  { left: "41%", top: "18%", "--dx": "20px", "--dy": "30px", "--delay": "-6s", "--duration": "13s" },
  { left: "48%", top: "46%", "--dx": "-22px", "--dy": "-22px", "--delay": "-12s", "--duration": "16s" },
  { left: "56%", top: "28%", "--dx": "32px", "--dy": "14px", "--delay": "-3s", "--duration": "12s" },
  { left: "64%", top: "62%", "--dx": "-18px", "--dy": "28px", "--delay": "-9s", "--duration": "14s" },
  { left: "71%", top: "38%", "--dx": "24px", "--dy": "-20px", "--delay": "-5s", "--duration": "13s" },
  { left: "78%", top: "72%", "--dx": "-28px", "--dy": "18px", "--delay": "-11s", "--duration": "15s" },
  { left: "84%", top: "24%", "--dx": "18px", "--dy": "-26px", "--delay": "-8s", "--duration": "12s" },
  { left: "89%", top: "52%", "--dx": "-20px", "--dy": "22px", "--delay": "-13s", "--duration": "17s" },

  { left: "16%", top: "78%", "--dx": "28px", "--dy": "-18px", "--delay": "-14s", "--duration": "16s" },
  { left: "23%", top: "18%", "--dx": "-24px", "--dy": "20px", "--delay": "-1s", "--duration": "13s" },
  { left: "31%", top: "54%", "--dx": "16px", "--dy": "-30px", "--delay": "-8s", "--duration": "14s" },
  { left: "38%", top: "40%", "--dx": "-32px", "--dy": "16px", "--delay": "-15s", "--duration": "18s" },
  { left: "46%", top: "80%", "--dx": "22px", "--dy": "24px", "--delay": "-5s", "--duration": "15s" },
  { left: "53%", top: "14%", "--dx": "-18px", "--dy": "-24px", "--delay": "-11s", "--duration": "13s" },
  { left: "61%", top: "48%", "--dx": "30px", "--dy": "-16px", "--delay": "-3s", "--duration": "16s" },
  { left: "69%", top: "16%", "--dx": "-26px", "--dy": "28px", "--delay": "-10s", "--duration": "14s" },
  { left: "76%", top: "58%", "--dx": "18px", "--dy": "20px", "--delay": "-6s", "--duration": "15s" },
  { left: "82%", top: "34%", "--dx": "-30px", "--dy": "-18px", "--delay": "-12s", "--duration": "17s" },
  { left: "91%", top: "78%", "--dx": "24px", "--dy": "16px", "--delay": "-4s", "--duration": "13s" },
  { left: "58%", top: "76%", "--dx": "-20px", "--dy": "-28px", "--delay": "-9s", "--duration": "16s" }
];

const RED_MAGIC_BACKGROUND_STYLES = `
  .red-magic-cloud {
    position: absolute;
    inset: -18vh -12vw;
    overflow: hidden;
    pointer-events: none;
    contain: paint;
    isolation: isolate;
  }

  .red-magic-cloud-aura {
    position: absolute;
    left: 50%;
    top: 48%;
    width: 115vw;
    height: 105vh;
    transform: translate3d(-50%, -50%, 0);
    background:
      radial-gradient(
        ellipse at 48% 46%,
        rgba(255, 30, 20, 0.09) 0%,
        rgba(210, 0, 0, 0.065) 24%,
        rgba(110, 0, 0, 0.035) 46%,
        transparent 74%
      );
    animation:
      red-magic-cloud-breathe
      28s
      ease-in-out
      infinite
      alternate;
    will-change: transform, opacity;
  }

  .red-magic-cloud-mass {
    position: absolute;
    border-radius: 50%;
    transform-origin: center;
    will-change: transform, opacity;
  }

  .red-magic-cloud-mass-one {
    left: 18%;
    top: 9%;
    width: 62vw;
    height: 63vh;
    background:
      radial-gradient(
        ellipse at 44% 52%,
        rgba(255, 55, 38, 0.12) 0%,
        rgba(232, 25, 20, 0.075) 24%,
        rgba(150, 0, 0, 0.035) 50%,
        transparent 72%
      );
    transform:
      rotate(-11deg)
      translate3d(0, 0, 0);
    animation:
      red-magic-cloud-drift-one
      42s
      ease-in-out
      infinite
      alternate;
  }

  .red-magic-cloud-mass-two {
    right: 5%;
    top: 24%;
    width: 58vw;
    height: 58vh;
    background:
      radial-gradient(
        ellipse at 48% 48%,
        rgba(255, 42, 30, 0.105) 0%,
        rgba(190, 0, 0, 0.068) 28%,
        rgba(92, 0, 0, 0.025) 52%,
        transparent 74%
      );
    transform:
      rotate(19deg)
      translate3d(0, 0, 0);
    animation:
      red-magic-cloud-drift-two
      51s
      ease-in-out
      infinite
      alternate;
  }

  .red-magic-cloud-mass-three {
    left: 31%;
    bottom: -4%;
    width: 64vw;
    height: 52vh;
    background:
      radial-gradient(
        ellipse at 48% 42%,
        rgba(175, 0, 0, 0.08) 0%,
        rgba(115, 0, 0, 0.048) 31%,
        transparent 72%
      );
    transform:
      rotate(-8deg)
      translate3d(0, 0, 0);
    animation:
      red-magic-cloud-drift-three
      57s
      ease-in-out
      infinite
      alternate;
  }

  .red-magic-cloud-core {
    position: absolute;
    left: 50%;
    top: 47%;
    width: min(53vw, 900px);
    height: min(53vw, 900px);
    transform: translate3d(-50%, -50%, 0);
    border-radius: 50%;
    background:
      radial-gradient(
        circle,
        rgba(255, 72, 50, 0.08) 0%,
        rgba(238, 25, 18, 0.065) 18%,
        rgba(167, 0, 0, 0.035) 43%,
        transparent 69%
      );
    animation:
      red-magic-cloud-core
      19s
      ease-in-out
      infinite;
    will-change: transform, opacity;
  }

  .red-magic-cloud-nucleus {
    position: absolute;
    left: 50%;
    top: 47%;
    width: min(13vw, 220px);
    height: min(13vw, 220px);
    transform: translate3d(-50%, -50%, 0);
    border-radius: 50%;
    background:
      radial-gradient(
        circle,
        rgba(255, 120, 95, 0.14) 0%,
        rgba(255, 40, 25, 0.085) 22%,
        rgba(185, 0, 0, 0.03) 56%,
        transparent 76%
      );
    animation:
      red-magic-cloud-nucleus
      8.5s
      ease-in-out
      infinite;
    will-change: transform, opacity;
  }

  .red-magic-cloud-rings {
    position: absolute;
    left: 50%;
    top: 47%;
    width: min(72vw, 1200px);
    height: min(72vw, 1200px);
    transform: translate3d(-50%, -50%, 0);
    pointer-events: none;
  }

  .red-magic-cloud-ring {
    position: absolute;
    left: 50%;
    top: 50%;
    border:
      1px solid
      rgba(255, 48, 38, 0.08);
    border-radius: 50%;
    transform:
      translate3d(-50%, -50%, 0)
      rotate(0deg);
    will-change: transform, opacity;
  }

  .red-magic-cloud-ring-1 {
    width: 34%;
    height: 21%;
    animation:
      red-magic-cloud-ring-one
      34s
      linear
      infinite;
  }

  .red-magic-cloud-ring-2 {
    width: 49%;
    height: 30%;
    animation:
      red-magic-cloud-ring-two
      41s
      linear
      infinite
      reverse;
  }

  .red-magic-cloud-ring-3 {
    width: 66%;
    height: 40%;
    animation:
      red-magic-cloud-ring-three
      53s
      linear
      infinite;
  }

  .red-magic-cloud-ring-4 {
    width: 83%;
    height: 51%;
    border-color:
      rgba(255, 38, 28, 0.045);
    animation:
      red-magic-cloud-ring-four
      67s
      linear
      infinite
      reverse;
  }

  .red-magic-cloud-ring-5 {
    width: 100%;
    height: 62%;
    border-color:
      rgba(255, 38, 28, 0.03);
    animation:
      red-magic-cloud-ring-five
      82s
      linear
      infinite;
  }

  .red-magic-cloud-wisps {
    position: absolute;
    inset: 0;
  }

  .red-magic-cloud-wisp {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 46vw;
    height: 12vh;
    border:
      1px solid
      rgba(255, 54, 42, 0.065);
    border-radius: 50%;
    transform-origin: center;
    will-change: transform, opacity;
  }

  .red-magic-cloud-wisp-1 {
    transform:
      translate3d(-50%, -50%, 0)
      rotate(-12deg)
      scaleY(0.58);
    animation:
      red-magic-cloud-wisp-one
      31s
      ease-in-out
      infinite
      alternate;
  }

  .red-magic-cloud-wisp-2 {
    width: 53vw;
    transform:
      translate3d(-50%, -50%, 0)
      rotate(21deg)
      scaleY(0.62);
    animation:
      red-magic-cloud-wisp-two
      37s
      ease-in-out
      infinite
      alternate;
  }

  .red-magic-cloud-wisp-3 {
    width: 37vw;
    transform:
      translate3d(-50%, -50%, 0)
      rotate(54deg)
      scaleY(0.48);
    animation:
      red-magic-cloud-wisp-three
      43s
      ease-in-out
      infinite
      alternate;
  }

  .red-magic-cloud-wisp-4 {
    width: 60vw;
    transform:
      translate3d(-50%, -50%, 0)
      rotate(-41deg)
      scaleY(0.38);
    animation:
      red-magic-cloud-wisp-four
      49s
      ease-in-out
      infinite
      alternate;
  }

  .red-magic-cloud-wisp-5 {
    width: 41vw;
    transform:
      translate3d(-50%, -50%, 0)
      rotate(73deg)
      scaleY(0.34);
    animation:
      red-magic-cloud-wisp-five
      56s
      ease-in-out
      infinite
      alternate;
  }

  .red-magic-cloud-wisp-6 {
    width: 68vw;
    transform:
      translate3d(-50%, -50%, 0)
      rotate(7deg)
      scaleY(0.22);
    animation:
      red-magic-cloud-wisp-six
      61s
      ease-in-out
      infinite
      alternate;
  }

  .red-magic-cloud-wisp-7 {
    width: 31vw;
    height: 8vh;
    transform:
      translate3d(-50%, -50%, 0)
      rotate(-68deg)
      scaleY(0.28);
    animation:
      red-magic-cloud-wisp-seven
      47s
      ease-in-out
      infinite
      alternate;
  }

  .red-magic-cloud-particles {
    position: absolute;
    inset: 0;
  }

  .red-magic-cloud-particle {
    position: absolute;
    width: 2px;
    height: 2px;
    margin:
      -1px
      0
      0
      -1px;
    border-radius: 50%;
    background:
      rgba(255, 94, 72, 0.78);
    transform: translate3d(0, 0, 0);
    animation:
      red-magic-cloud-particle
      var(--duration)
      ease-in-out
      infinite
      var(--delay);
    will-change: transform, opacity;
  }

  .red-magic-cloud-particle:nth-child(3n) {
    width: 3px;
    height: 3px;
    margin:
      -1.5px
      0
      0
      -1.5px;
    background:
      rgba(255, 55, 42, 0.56);
  }

  .red-magic-cloud-particle:nth-child(4n) {
    width: 1px;
    height: 1px;
    margin:
      -0.5px
      0
      0
      -0.5px;
    opacity: 0.64;
  }

  .red-magic-cloud-sparks {
    position: absolute;
    inset: 0;
  }

  .red-magic-cloud-spark {
    position: absolute;
    width: 2px;
    height: 22px;
    border-radius: 999px;
    background:
      linear-gradient(
        to bottom,
        transparent,
        rgba(255, 80, 58, 0.72),
        transparent
      );
    transform-origin: center;
    animation:
      red-magic-cloud-spark
      6.8s
      ease-in-out
      infinite;
    will-change: transform, opacity;
  }

  .red-magic-cloud-spark-one {
    left: 22%;
    top: 31%;
    transform: rotate(41deg);
    animation-delay: -1.4s;
  }

  .red-magic-cloud-spark-two {
    left: 31%;
    top: 69%;
    transform: rotate(-28deg);
    animation-delay: -4.1s;
  }

  .red-magic-cloud-spark-three {
    left: 47%;
    top: 16%;
    transform: rotate(17deg);
    animation-delay: -2.2s;
  }

  .red-magic-cloud-spark-four {
    left: 64%;
    top: 76%;
    transform: rotate(63deg);
    animation-delay: -5.3s;
  }

  .red-magic-cloud-spark-five {
    left: 77%;
    top: 35%;
    transform: rotate(-54deg);
    animation-delay: -3.4s;
  }

  .red-magic-cloud-spark-six {
    left: 84%;
    top: 63%;
    transform: rotate(24deg);
    animation-delay: -6s;
  }

  @keyframes red-magic-cloud-breathe {
    0% {
      transform:
        translate3d(-50%, -50%, 0)
        scale(0.985);
      opacity: 0.72;
    }

    50% {
      transform:
        translate3d(-49.5%, -50.8%, 0)
        scale(1.015);
      opacity: 0.92;
    }

    100% {
      transform:
        translate3d(-50.8%, -49.4%, 0)
        scale(0.998);
      opacity: 0.78;
    }
  }

  @keyframes red-magic-cloud-drift-one {
    0% {
      transform:
        rotate(-11deg)
        translate3d(-2.5vw, 1vh, 0)
        scale(0.98);
      opacity: 0.72;
    }

    100% {
      transform:
        rotate(-6deg)
        translate3d(3vw, -2vh, 0)
        scale(1.04);
      opacity: 0.98;
    }
  }

  @keyframes red-magic-cloud-drift-two {
    0% {
      transform:
        rotate(19deg)
        translate3d(2vw, -1vh, 0)
        scale(0.98);
      opacity: 0.62;
    }

    100% {
      transform:
        rotate(12deg)
        translate3d(-3vw, 3vh, 0)
        scale(1.05);
      opacity: 0.9;
    }
  }

  @keyframes red-magic-cloud-drift-three {
    0% {
      transform:
        rotate(-8deg)
        translate3d(2vw, 2vh, 0)
        scale(1);
      opacity: 0.45;
    }

    100% {
      transform:
        rotate(-3deg)
        translate3d(-2vw, -2vh, 0)
        scale(1.06);
      opacity: 0.78;
    }
  }

  @keyframes red-magic-cloud-core {
    0% {
      transform:
        translate3d(-50%, -50%, 0)
        scale(0.97);
      opacity: 0.6;
    }

    50% {
      transform:
        translate3d(-50%, -50%, 0)
        scale(1.04);
      opacity: 0.94;
    }

    100% {
      transform:
        translate3d(-50%, -50%, 0)
        scale(0.98);
      opacity: 0.7;
    }
  }

  @keyframes red-magic-cloud-nucleus {
    0% {
      transform:
        translate3d(-50%, -50%, 0)
        scale(0.9);
      opacity: 0.46;
    }

    50% {
      transform:
        translate3d(-50%, -50%, 0)
        scale(1.12);
      opacity: 0.92;
    }

    100% {
      transform:
        translate3d(-50%, -50%, 0)
        scale(0.95);
      opacity: 0.58;
    }
  }

  @keyframes red-magic-cloud-ring-one {
    from {
      transform:
        translate3d(-50%, -50%, 0)
        rotate(0deg)
        scaleX(1);
    }

    to {
      transform:
        translate3d(-50%, -50%, 0)
        rotate(360deg)
        scaleX(1.08);
    }
  }

  @keyframes red-magic-cloud-ring-two {
    from {
      transform:
        translate3d(-50%, -50%, 0)
        rotate(360deg)
        scaleY(1);
    }

    to {
      transform:
        translate3d(-50%, -50%, 0)
        rotate(0deg)
        scaleY(1.06);
    }
  }

  @keyframes red-magic-cloud-ring-three {
    from {
      transform:
        translate3d(-50%, -50%, 0)
        rotate(0deg)
        scale(1);
    }

    to {
      transform:
        translate3d(-50%, -50%, 0)
        rotate(360deg)
        scale(0.95);
    }
  }

  @keyframes red-magic-cloud-ring-four {
    from {
      transform:
        translate3d(-50%, -50%, 0)
        rotate(360deg)
        scaleX(1);
    }

    to {
      transform:
        translate3d(-50%, -50%, 0)
        rotate(0deg)
        scaleX(1.05);
    }
  }

  @keyframes red-magic-cloud-ring-five {
    from {
      transform:
        translate3d(-50%, -50%, 0)
        rotate(0deg)
        scaleY(1);
    }

    to {
      transform:
        translate3d(-50%, -50%, 0)
        rotate(360deg)
        scaleY(0.96);
    }
  }

  @keyframes red-magic-cloud-wisp-one {
    0% {
      transform:
        translate3d(-50%, -50%, 0)
        rotate(-12deg)
        scaleY(0.58)
        translateX(-3vw);
      opacity: 0.25;
    }

    100% {
      transform:
        translate3d(-50%, -50%, 0)
        rotate(-7deg)
        scaleY(0.72)
        translateX(3vw);
      opacity: 0.72;
    }
  }

  @keyframes red-magic-cloud-wisp-two {
    0% {
      transform:
        translate3d(-50%, -50%, 0)
        rotate(21deg)
        scaleY(0.62)
        translateY(2vh);
      opacity: 0.16;
    }

    100% {
      transform:
        translate3d(-50%, -50%, 0)
        rotate(27deg)
        scaleY(0.74)
        translateY(-2vh);
      opacity: 0.55;
    }
  }

  @keyframes red-magic-cloud-wisp-three {
    0% {
      transform:
        translate3d(-50%, -50%, 0)
        rotate(54deg)
        scaleY(0.48)
        translateX(2vw);
      opacity: 0.18;
    }

    100% {
      transform:
        translate3d(-50%, -50%, 0)
        rotate(47deg)
        scaleY(0.66)
        translateX(-2vw);
      opacity: 0.48;
    }
  }

  @keyframes red-magic-cloud-wisp-four {
    0% {
      transform:
        translate3d(-50%, -50%, 0)
        rotate(-41deg)
        scaleY(0.38)
        translateX(-2vw);
      opacity: 0.14;
    }

    100% {
      transform:
        translate3d(-50%, -50%, 0)
        rotate(-35deg)
        scaleY(0.52)
        translateX(2vw);
      opacity: 0.4;
    }
  }

  @keyframes red-magic-cloud-wisp-five {
    0% {
      transform:
        translate3d(-50%, -50%, 0)
        rotate(73deg)
        scaleY(0.34)
        translateY(-2vh);
      opacity: 0.12;
    }

    100% {
      transform:
        translate3d(-50%, -50%, 0)
        rotate(67deg)
        scaleY(0.46)
        translateY(2vh);
      opacity: 0.34;
    }
  }

  @keyframes red-magic-cloud-wisp-six {
    0% {
      transform:
        translate3d(-50%, -50%, 0)
        rotate(7deg)
        scaleY(0.22)
        translateX(2vw);
      opacity: 0.12;
    }

    100% {
      transform:
        translate3d(-50%, -50%, 0)
        rotate(12deg)
        scaleY(0.36)
        translateX(-2vw);
      opacity: 0.3;
    }
  }

  @keyframes red-magic-cloud-wisp-seven {
    0% {
      transform:
        translate3d(-50%, -50%, 0)
        rotate(-68deg)
        scaleY(0.28)
        translateY(1vh);
      opacity: 0.1;
    }

    100% {
      transform:
        translate3d(-50%, -50%, 0)
        rotate(-61deg)
        scaleY(0.4)
        translateY(-1vh);
      opacity: 0.28;
    }
  }

  @keyframes red-magic-cloud-particle {
    0% {
      transform:
        translate3d(0, 0, 0)
        scale(0.65);
      opacity: 0.12;
    }

    35% {
      transform:
        translate3d(
          calc(var(--dx) * 0.35),
          calc(var(--dy) * 0.35),
          0
        )
        scale(1);
      opacity: 0.72;
    }

    70% {
      transform:
        translate3d(
          calc(var(--dx) * 0.75),
          calc(var(--dy) * 0.75),
          0
        )
        scale(0.82);
      opacity: 0.38;
    }

    100% {
      transform:
        translate3d(
          var(--dx),
          var(--dy),
          0
        )
        scale(0.56);
      opacity: 0.08;
    }
  }

  @keyframes red-magic-cloud-spark {
    0%,
    100% {
      opacity: 0;
      transform:
        translate3d(0, 10px, 0)
        scaleY(0.3);
    }

    45% {
      opacity: 0.66;
      transform:
        translate3d(0, 0, 0)
        scaleY(1);
    }

    70% {
      opacity: 0.12;
      transform:
        translate3d(0, -8px, 0)
        scaleY(0.55);
    }
  }

  @media (max-width: 800px) {
    .red-magic-cloud {
      inset: -10vh -30vw;
    }

    .red-magic-cloud-ring-4,
    .red-magic-cloud-ring-5,
    .red-magic-cloud-wisp-5,
    .red-magic-cloud-wisp-6,
    .red-magic-cloud-wisp-7 {
      display: none;
    }

    .red-magic-cloud-particle:nth-child(n + 13) {
      display: none;
    }

    .red-magic-cloud-core {
      width: 82vw;
      height: 82vw;
    }

    .red-magic-cloud-nucleus {
      width: 24vw;
      height: 24vw;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .red-magic-cloud *,
    .red-magic-cloud {
      animation: none !important;
    }
  }
`;

export default function WorldBackground() {
  return (
    <div
      className="world-background"
      aria-hidden="true"
    >
      <style>
        {RED_MAGIC_BACKGROUND_STYLES}
      </style>

      <div className="red-magic-cloud">
        <div className="red-magic-cloud-aura" />

        <div className="red-magic-cloud-mass red-magic-cloud-mass-one" />
        <div className="red-magic-cloud-mass red-magic-cloud-mass-two" />
        <div className="red-magic-cloud-mass red-magic-cloud-mass-three" />

        <div className="red-magic-cloud-core" />
        <div className="red-magic-cloud-nucleus" />

        <div className="red-magic-cloud-rings">
          {RINGS.map(
            (ring) => (
              <span
                key={ring}
                className={`red-magic-cloud-ring red-magic-cloud-ring-${ring}`}
              />
            )
          )}
        </div>

        <div className="red-magic-cloud-wisps">
          {WISPS.map(
            (wisp) => (
              <span
                key={wisp}
                className={`red-magic-cloud-wisp red-magic-cloud-wisp-${wisp}`}
              />
            )
          )}
        </div>

        <div className="red-magic-cloud-particles">
          {PARTICLES.map(
            (
              particle,
              index
            ) => (
              <span
                key={particle}
                className={`red-magic-cloud-particle red-magic-cloud-particle-${particle}`}
                style={
                  PARTICLE_STYLES[index]
                }
              />
            )
          )}
        </div>

        <div className="red-magic-cloud-sparks">
          <span className="red-magic-cloud-spark red-magic-cloud-spark-one" />
          <span className="red-magic-cloud-spark red-magic-cloud-spark-two" />
          <span className="red-magic-cloud-spark red-magic-cloud-spark-three" />
          <span className="red-magic-cloud-spark red-magic-cloud-spark-four" />
          <span className="red-magic-cloud-spark red-magic-cloud-spark-five" />
          <span className="red-magic-cloud-spark red-magic-cloud-spark-six" />
        </div>
      </div>

      <div className="world-background-vignette" />
    </div>
  );
}
