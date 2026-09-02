"use client";

import {
  useEffect,
  useState
} from "react";

import RedMagic, {
  type RedMagicMode
} from "@/components/RedMagic";

import MagicInteractionLayer from "@/components/MagicInteractionLayer";

import {
  subscribeRedMagicPerformance,
  type RedMagicPerformanceSample
} from "@/components/RedMagicTelemetry";

import styles from "@/components/MagicConsole.module.css";

const SOUND_STORAGE_KEY =
  "red-magic-sound-enabled";

type BehaviourOption = {
  id: RedMagicMode;
  label: string;
  note: string;
};

const BEHAVIOURS:
  BehaviourOption[] = [
  {
    id: "drift",
    label: "DRIFT",
    note:
      "Slow orbit. The organism rests inside itself and barely reacts."
  },

  {
    id: "listen",
    label: "LISTEN",
    note:
      "Balanced state. It follows your pointer and answers its motion."
  },

  {
    id: "surge",
    label: "SURGE",
    note:
      "Excited state. The core runs hot and the membrane reaches toward you."
  }
];

function readSoundPreference() {
  if (
    typeof window ===
    "undefined"
  ) {
    return false;
  }

  try {
    return (
      window.localStorage.getItem(
        SOUND_STORAGE_KEY
      ) === "true"
    );
  } catch {
    return false;
  }
}

function writeSoundPreference(
  enabled: boolean
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  try {
    window.localStorage.setItem(
      SOUND_STORAGE_KEY,
      String(enabled)
    );
  } catch {
    /*
     * Sound still works when localStorage
     * is unavailable.
     */
  }
}

function vitalityLabel(
  fps: number
) {
  if (
    fps >= 55
  ) {
    return "FLOWING";
  }

  if (
    fps >= 34
  ) {
    return "STEADY";
  }

  return "CONSERVING";
}

function signalLabel(
  energy: number
) {
  if (
    energy < 0.18
  ) {
    return "RESTING";
  }

  if (
    energy < 0.7
  ) {
    return "AWAKE";
  }

  return "SURGING";
}

function formLabel(
  quality:
    RedMagicPerformanceSample[
      "quality"
    ]
) {
  if (
    quality ===
    "high"
  ) {
    return "DENSE";
  }

  if (
    quality ===
    "medium"
  ) {
    return "BALANCED";
  }

  return "LIGHT";
}

export default function MagicConsole() {
  const [
    mode,
    setMode
  ] =
    useState<RedMagicMode>(
      "listen"
    );

  const [
    soundEnabled,
    setSoundEnabled
  ] =
    useState(false);

  const [
    soundHydrated,
    setSoundHydrated
  ] =
    useState(false);

  const [
    sample,
    setSample
  ] =
    useState<RedMagicPerformanceSample | null>(
      null
    );

  useEffect(() => {
    setSoundEnabled(
      readSoundPreference()
    );

    setSoundHydrated(
      true
    );

    return subscribeRedMagicPerformance(
      setSample
    );
  }, []);

  const toggleSound =
    () => {
      const next =
        !soundEnabled;

      setSoundEnabled(
        next
      );

      writeSoundPreference(
        next
      );
    };

  const activeBehaviour =
    BEHAVIOURS.find(
      (
        behaviour
      ) =>
        behaviour.id ===
        mode
    ) ??
    BEHAVIOURS[1];

  const signal =
    sample
      ? signalLabel(
          sample.pointerEnergy ??
            0
        )
      : "—";

  const vitality =
    sample
      ? vitalityLabel(
          sample.fps
        )
      : "—";

  const form =
    sample
      ? formLabel(
          sample.quality
        )
      : "—";

  return (
    <div
      className={
        styles.magicLab
      }
    >
      <div
        className={
          styles.magicLabBar
        }
      >
        <div
          className={
            styles.magicControls
          }
          role="group"
          aria-label="Organism behaviour"
        >
          {BEHAVIOURS.map(
            (
              behaviour
            ) => (
              <button
                key={
                  behaviour.id
                }
                type="button"
                className={
                  styles.magicControl
                }
                aria-pressed={
                  behaviour.id ===
                  mode
                }
                onClick={() =>
                  setMode(
                    behaviour.id
                  )
                }
              >
                {
                  behaviour.label
                }
              </button>
            )
          )}
        </div>

        <div
          className={
            styles.magicLabActions
          }
        >
          <button
            type="button"
            className={
              styles.magicSoundControl
            }
            aria-pressed={
              soundEnabled
            }
            disabled={
              !soundHydrated
            }
            onClick={
              toggleSound
            }
          >
            SOUND{" "}
            {soundEnabled
              ? "ON"
              : "OFF"}
          </button>

          <p
            className={
              styles.magicLabNote
            }
            aria-live="polite"
          >
            {
              activeBehaviour.note
            }
          </p>
        </div>
      </div>

      <div
        className={
          styles.magicLabFrame
        }
      >
        <div
          className={
            styles.magicLabShell
          }
        >
          <MagicInteractionLayer
            soundEnabled={
              soundEnabled
            }
            mode={
              mode
            }
          >
            <RedMagic
              mode={
                mode
              }
            />
          </MagicInteractionLayer>
        </div>
      </div>

      <div
        className={
          styles.magicVitals
        }
      >
        <div>
          <span>
            SIGNAL
          </span>

          <strong>
            {signal}
          </strong>
        </div>

        <div>
          <span>
            VITALITY
          </span>

          <strong>
            {vitality}
          </strong>
        </div>

        <div>
          <span>
            FORM
          </span>

          <strong>
            {form}
          </strong>
        </div>
      </div>
    </div>
  );
}
