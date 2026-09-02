import type {
  CSSProperties
} from "react";

import styles from "@/components/WorldBackground.module.css";

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
  {
    left: "12%",
    top: "22%",
    "--dx": "22px",
    "--dy": "-28px",
    "--delay": "-2s",
    "--duration": "11s"
  },
  {
    left: "19%",
    top: "58%",
    "--dx": "-18px",
    "--dy": "24px",
    "--delay": "-7s",
    "--duration": "14s"
  },
  {
    left: "27%",
    top: "34%",
    "--dx": "26px",
    "--dy": "18px",
    "--delay": "-4s",
    "--duration": "12s"
  },
  {
    left: "34%",
    top: "72%",
    "--dx": "-30px",
    "--dy": "-16px",
    "--delay": "-10s",
    "--duration": "15s"
  },
  {
    left: "41%",
    top: "18%",
    "--dx": "20px",
    "--dy": "30px",
    "--delay": "-6s",
    "--duration": "13s"
  },
  {
    left: "48%",
    top: "46%",
    "--dx": "-22px",
    "--dy": "-22px",
    "--delay": "-12s",
    "--duration": "16s"
  },
  {
    left: "56%",
    top: "28%",
    "--dx": "32px",
    "--dy": "14px",
    "--delay": "-3s",
    "--duration": "12s"
  },
  {
    left: "64%",
    top: "62%",
    "--dx": "-18px",
    "--dy": "28px",
    "--delay": "-9s",
    "--duration": "14s"
  },
  {
    left: "71%",
    top: "38%",
    "--dx": "24px",
    "--dy": "-20px",
    "--delay": "-5s",
    "--duration": "13s"
  },
  {
    left: "78%",
    top: "72%",
    "--dx": "-28px",
    "--dy": "18px",
    "--delay": "-11s",
    "--duration": "15s"
  },
  {
    left: "84%",
    top: "24%",
    "--dx": "18px",
    "--dy": "-26px",
    "--delay": "-8s",
    "--duration": "12s"
  },
  {
    left: "89%",
    top: "52%",
    "--dx": "-20px",
    "--dy": "22px",
    "--delay": "-13s",
    "--duration": "17s"
  },
  {
    left: "16%",
    top: "78%",
    "--dx": "28px",
    "--dy": "-18px",
    "--delay": "-14s",
    "--duration": "16s"
  },
  {
    left: "23%",
    top: "18%",
    "--dx": "-24px",
    "--dy": "20px",
    "--delay": "-1s",
    "--duration": "13s"
  },
  {
    left: "31%",
    top: "54%",
    "--dx": "16px",
    "--dy": "-30px",
    "--delay": "-8s",
    "--duration": "14s"
  },
  {
    left: "38%",
    top: "40%",
    "--dx": "-32px",
    "--dy": "16px",
    "--delay": "-15s",
    "--duration": "18s"
  },
  {
    left: "46%",
    top: "80%",
    "--dx": "22px",
    "--dy": "24px",
    "--delay": "-5s",
    "--duration": "15s"
  },
  {
    left: "53%",
    top: "14%",
    "--dx": "-18px",
    "--dy": "-24px",
    "--delay": "-11s",
    "--duration": "13s"
  },
  {
    left: "61%",
    top: "48%",
    "--dx": "30px",
    "--dy": "-16px",
    "--delay": "-3s",
    "--duration": "16s"
  },
  {
    left: "69%",
    top: "16%",
    "--dx": "-26px",
    "--dy": "28px",
    "--delay": "-10s",
    "--duration": "14s"
  },
  {
    left: "76%",
    top: "58%",
    "--dx": "18px",
    "--dy": "20px",
    "--delay": "-6s",
    "--duration": "15s"
  },
  {
    left: "82%",
    top: "34%",
    "--dx": "-30px",
    "--dy": "-18px",
    "--delay": "-12s",
    "--duration": "17s"
  },
  {
    left: "91%",
    top: "78%",
    "--dx": "24px",
    "--dy": "16px",
    "--delay": "-4s",
    "--duration": "13s"
  },
  {
    left: "58%",
    top: "76%",
    "--dx": "-20px",
    "--dy": "-28px",
    "--delay": "-9s",
    "--duration": "16s"
  }
];

export default function WorldBackground() {
  return (
    <div
      className={styles.worldBackground}
      aria-hidden="true"
    >
      <div className={styles.redMagicCloud}>
        <div
          className={
            styles.redMagicCloudAura
          }
        />

        <div
          className={`${styles.redMagicCloudMass} ${styles.redMagicCloudMassOne}`}
        />

        <div
          className={`${styles.redMagicCloudMass} ${styles.redMagicCloudMassTwo}`}
        />

        <div
          className={`${styles.redMagicCloudMass} ${styles.redMagicCloudMassThree}`}
        />

        <div
          className={styles.redMagicCloudCore}
        />

        <div
          className={styles.redMagicCloudNucleus}
        />

        <div
          className={styles.redMagicCloudRings}
        >
          {RINGS.map(
            (ring) => (
              <span
                key={ring}
                className={`${styles.redMagicCloudRing} ${styles[`redMagicCloudRing${ring}`]}`}
              />
            )
          )}
        </div>

        <div
          className={styles.redMagicCloudWisps}
        >
          {WISPS.map(
            (wisp) => (
              <span
                key={wisp}
                className={`${styles.redMagicCloudWisp} ${styles[`redMagicCloudWisp${wisp}`]}`}
              />
            )
          )}
        </div>

        <div
          className={
            styles.redMagicCloudParticles
          }
        >
          {PARTICLES.map(
            (
              particle,
              index
            ) => (
              <span
                key={particle}
                className={`${styles.redMagicCloudParticle} ${styles[`redMagicCloudParticle${particle}`]}`}
                style={
                  PARTICLE_STYLES[index]
                }
              />
            )
          )}
        </div>

        <div
          className={
            styles.redMagicCloudSparks
          }
        >
          <span
            className={`${styles.redMagicCloudSpark} ${styles.redMagicCloudSparkOne}`}
          />
          <span
            className={`${styles.redMagicCloudSpark} ${styles.redMagicCloudSparkTwo}`}
          />
          <span
            className={`${styles.redMagicCloudSpark} ${styles.redMagicCloudSparkThree}`}
          />
          <span
            className={`${styles.redMagicCloudSpark} ${styles.redMagicCloudSparkFour}`}
          />
          <span
            className={`${styles.redMagicCloudSpark} ${styles.redMagicCloudSparkFive}`}
          />
          <span
            className={`${styles.redMagicCloudSpark} ${styles.redMagicCloudSparkSix}`}
          />
        </div>
      </div>

      <div
        className={
          styles.worldBackgroundVignette
        }
      />
    </div>
  );
}
