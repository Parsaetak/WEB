"use client";

import {
  useEffect,
  useState
} from "react";

import RedMagic,
{
  type RedMagicMode
} from "@/components/RedMagic";

import MagicInteractionLayer from "@/components/MagicInteractionLayer";

import {
  subscribeRedMagicPerformance,
  type RedMagicPerformanceSample
} from "@/components/RedMagicTelemetry";

type BehaviourOption = {
  id: RedMagicMode;
  label: string;
  note: string;
};

const BEHAVIOURS:
  BehaviourOption[] =
  [
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
    RedMagicPerformanceSample["quality"]
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
    sample,
    setSample
  ] =
    useState<RedMagicPerformanceSample | null>(
      null
    );

  useEffect(() => {
    return subscribeRedMagicPerformance(
      setSample
    );
  }, []);

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
    <div className="magic-lab">
      <div className="magic-lab-bar">
        <div
          className="magic-controls"
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
                className="magic-control"
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

        <div className="magic-lab-actions">
          <button
            type="button"
            className="magic-sound-control"
            aria-pressed={
              soundEnabled
            }
            onClick={() =>
              setSoundEnabled(
                (
                  current
                ) =>
                  !current
              )
            }
          >
            SOUND{" "}
            {soundEnabled
              ? "ON"
              : "OFF"}
          </button>

          <p
            className="magic-lab-note"
            aria-live="polite"
          >
            {
              activeBehaviour.note
            }
          </p>
        </div>
      </div>

      <div className="magic-lab-frame">
        <div className="magic-lab-shell">
          <MagicInteractionLayer
            soundEnabled={
              soundEnabled
            }
          >
            <RedMagic
              mode={mode}
            />
          </MagicInteractionLayer>
        </div>
      </div>

      <div className="magic-vitals">
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
