import type {
  RedMagicInteractionDetail,
  RedMagicInteractionType
} from "@/components/RedMagicInteraction";

type RedMagicAudioMode =
  | "drift"
  | "listen"
  | "surge";

type AudioNodes = {
  master: GainNode;
  ambientGain: GainNode;
  bodyGain: GainNode;
  bodyFilter: BiquadFilterNode;
  shimmerGain: GainNode;
  shimmerFilter: BiquadFilterNode;
  lowOscillator: OscillatorNode;
  bodyOscillator: OscillatorNode;
  shimmerOscillator: OscillatorNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
};

const STORAGE_KEY =
  "red-magic-sound-enabled";

const MASTER_GAIN = 0.075;

const IDLE_AMBIENT_GAIN =
  0.018;

const ACTIVE_AMBIENT_GAIN =
  0.052;

const MAX_CHARGE_GAIN =
  0.024;

const EVENT_COOLDOWN_MS =
  72;

const MODE_SETTINGS: Record<
  RedMagicAudioMode,
  {
    lowFrequency: number;
    bodyFrequency: number;
    shimmerFrequency: number;
    filterFrequency: number;
    lfoRate: number;
  }
> = {
  drift: {
    lowFrequency: 48,
    bodyFrequency: 96,
    shimmerFrequency: 420,
    filterFrequency: 430,
    lfoRate: 0.08
  },

  listen: {
    lowFrequency: 55,
    bodyFrequency: 110,
    shimmerFrequency: 560,
    filterFrequency: 1100,
    lfoRate: 0.14
  },

  surge: {
    lowFrequency: 64,
    bodyFrequency: 128,
    shimmerFrequency: 760,
    filterFrequency: 2200,
    lfoRate: 0.25
  }
};

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

function isAudioContext(
  value: unknown
): value is AudioContext {
  return (
    typeof value === "object" &&
    value !== null &&
    "createOscillator" in value &&
    "createGain" in value
  );
}

export class RedMagicAudio {
  private context:
    AudioContext | null =
    null;

  private nodes:
    AudioNodes | null =
    null;

  private enabled =
    false;

  private mode:
    RedMagicAudioMode =
    "listen";

  private energy = 0;

  private charge = 0;

  private visible = true;

  private lastEventTime = 0;

  private attachedTarget:
    EventTarget | null =
    null;

  private visibilityHandler:
    (() => void) | null =
    null;

  constructor() {
    this.enabled =
      this.readPreference();

    this.visibilityHandler =
      () => {
        void this.handleVisibilityChange();
      };

    if (
      typeof document !==
      "undefined"
    ) {
      document.addEventListener(
        "visibilitychange",
        this.visibilityHandler
      );

      this.visible =
        document.visibilityState ===
        "visible";
    }
  }

  private readPreference() {
    if (
      typeof window ===
      "undefined"
    ) {
      return false;
    }

    try {
      return (
        window.localStorage.getItem(
          STORAGE_KEY
        ) === "true"
      );
    } catch {
      return false;
    }
  }

  private writePreference(
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
        STORAGE_KEY,
        String(enabled)
      );
    } catch {
      /*
       * localStorage can be unavailable in restrictive
       * privacy modes. Audio functionality should continue.
       */
    }
  }

  public isEnabled() {
    return this.enabled;
  }

  public setEnabled(
    enabled: boolean
  ) {
    this.enabled =
      enabled;

    this.writePreference(
      enabled
    );

    if (
      enabled
    ) {
      void this.ensureStarted();
    } else {
      this.stop();
    }
  }

  public setMode(
    mode: RedMagicAudioMode
  ) {
    this.mode =
      mode;

    const nodes =
      this.nodes;

    const context =
      this.context;

    if (
      !nodes ||
      !context
    ) {
      return;
    }

    const settings =
      MODE_SETTINGS[
        mode
      ];

    const now =
      context.currentTime;

    nodes.lowOscillator.frequency.setTargetAtTime(
      settings.lowFrequency,
      now,
      0.3
    );

    nodes.bodyOscillator.frequency.setTargetAtTime(
      settings.bodyFrequency,
      now,
      0.3
    );

    nodes.shimmerOscillator.frequency.setTargetAtTime(
      settings.shimmerFrequency,
      now,
      0.3
    );

    nodes.bodyFilter.frequency.setTargetAtTime(
      settings.filterFrequency,
      now,
      0.35
    );

    nodes.lfo.frequency.setTargetAtTime(
      settings.lfoRate,
      now,
      0.3
    );
  }

  public attach(
    target: EventTarget
  ) {
    this.detach();

    this.attachedTarget =
      target;

    target.addEventListener(
      "red-magic-interaction",
      this.handleEvent
    );

    if (
      this.enabled
    ) {
      /*
       * Do not create AudioContext here.
       * Browsers require a user gesture.
       * The first interaction event will activate it.
       */
    }
  }

  public detach() {
    if (
      this.attachedTarget
    ) {
      this.attachedTarget.removeEventListener(
        "red-magic-interaction",
        this.handleEvent
      );

      this.attachedTarget =
        null;
    }
  }

  private ensureContext() {
    if (
      !this.enabled
    ) {
      return null;
    }

    if (
      typeof window ===
      "undefined"
    ) {
      return null;
    }

    if (
      !this.context
    ) {
      const AudioContextConstructor =
        window.AudioContext ??
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (
        !AudioContextConstructor
      ) {
        return null;
      }

      this.context =
        new AudioContextConstructor();
    }

    return this.context;
  }

  private ensureGraph() {
    const existing =
      this.nodes;

    if (
      existing
    ) {
      return existing;
    }

    const context =
      this.ensureContext();

    if (
      !context
    ) {
      return null;
    }

    const master =
      context.createGain();

    const ambientGain =
      context.createGain();

    const bodyGain =
      context.createGain();

    const bodyFilter =
      context.createBiquadFilter();

    const shimmerGain =
      context.createGain();

    const shimmerFilter =
      context.createBiquadFilter();

    const lowOscillator =
      context.createOscillator();

    const bodyOscillator =
      context.createOscillator();

    const shimmerOscillator =
      context.createOscillator();

    const lfo =
      context.createOscillator();

    const lfoGain =
      context.createGain();

    const settings =
      MODE_SETTINGS[
        this.mode
      ];

    master.gain.value =
      MASTER_GAIN;

    ambientGain.gain.value =
      IDLE_AMBIENT_GAIN;

    bodyGain.gain.value =
      0.36;

    shimmerGain.gain.value =
      0.07;

    bodyFilter.type =
      "lowpass";

    bodyFilter.frequency.value =
      settings.filterFrequency;

    bodyFilter.Q.value =
      0.7;

    shimmerFilter.type =
      "bandpass";

    shimmerFilter.frequency.value =
      settings.shimmerFrequency;

    shimmerFilter.Q.value =
      1.2;

    lowOscillator.type =
      "sine";

    lowOscillator.frequency.value =
      settings.lowFrequency;

    bodyOscillator.type =
      "triangle";

    bodyOscillator.frequency.value =
      settings.bodyFrequency;

    shimmerOscillator.type =
      "sine";

    shimmerOscillator.frequency.value =
      settings.shimmerFrequency;

    lfo.type =
      "sine";

    lfo.frequency.value =
      settings.lfoRate;

    lfoGain.gain.value =
      160;

    lowOscillator.connect(
      ambientGain
    );

    bodyOscillator.connect(
      bodyFilter
    );

    bodyFilter.connect(
      bodyGain
    );

    shimmerOscillator.connect(
      shimmerFilter
    );

    shimmerFilter.connect(
      shimmerGain
    );

    bodyGain.connect(
      ambientGain
    );

    shimmerGain.connect(
      ambientGain
    );

    ambientGain.connect(
      master
    );

    lfo.connect(
      lfoGain
    );

    lfoGain.connect(
      bodyFilter.frequency
    );

    master.connect(
      context.destination
    );

    lowOscillator.start();

    bodyOscillator.start();

    shimmerOscillator.start();

    lfo.start();

    this.nodes = {
      master,
      ambientGain,
      bodyGain,
      bodyFilter,
      shimmerGain,
      shimmerFilter,
      lowOscillator,
      bodyOscillator,
      shimmerOscillator,
      lfo,
      lfoGain
    };

    return this.nodes;
  }

  private async ensureStarted() {
    if (
      !this.enabled ||
      !this.visible
    ) {
      return false;
    }

    const context =
      this.ensureContext();

    if (
      !isAudioContext(
        context
      )
    ) {
      return false;
    }

    const nodes =
      this.ensureGraph();

    if (
      !nodes
    ) {
      return false;
    }

    this.setMode(
      this.mode
    );

    if (
      context.state ===
      "suspended"
    ) {
      try {
        await context.resume();
      } catch {
        return false;
      }
    }

    return (
      context.state ===
      "running"
    );
  }

  private stop() {
    const context =
      this.context;

    const nodes =
      this.nodes;

    if (
      !context ||
      !nodes
    ) {
      return;
    }

    const now =
      context.currentTime;

    nodes.master.gain.setTargetAtTime(
      0,
      now,
      0.08
    );

    if (
      context.state ===
      "running"
    ) {
      void context.suspend();
    }
  }

  private async handleVisibilityChange() {
    if (
      typeof document ===
      "undefined"
    ) {
      return;
    }

    this.visible =
      document.visibilityState ===
      "visible";

    const context =
      this.context;

    if (
      !context
    ) {
      return;
    }

    if (
      !this.visible
    ) {
      if (
        context.state ===
        "running"
      ) {
        try {
          await context.suspend();
        } catch {
          // Ignore browser lifecycle races.
        }
      }

      return;
    }

    if (
      this.enabled
    ) {
      await this.ensureStarted();
    }
  }

  private updateAmbient(
    detail: RedMagicInteractionDetail
  ) {
    const context =
      this.context;

    const nodes =
      this.nodes;

    if (
      !context ||
      !nodes
    ) {
      return;
    }

    const energy =
      clamp(
        detail.energy,
        0,
        1
      );

    const proximity =
      clamp(
        detail.proximity,
        0,
        1
      );

    const activeGain =
      IDLE_AMBIENT_GAIN +
      energy *
        (
          ACTIVE_AMBIENT_GAIN -
          IDLE_AMBIENT_GAIN
        );

    const filterBoost =
      proximity *
      900;

    const shimmer =
      energy *
      0.09;

    const now =
      context.currentTime;

    nodes.ambientGain.gain.setTargetAtTime(
      activeGain +
        Math.min(
          MAX_CHARGE_GAIN,
          this.charge *
            0.024
        ),
      now,
      0.14
    );

    nodes.bodyFilter.frequency.setTargetAtTime(
      MODE_SETTINGS[
        this.mode
      ].filterFrequency +
        filterBoost,
      now,
      0.16
    );

    nodes.shimmerGain.gain.setTargetAtTime(
      shimmer,
      now,
      0.18
    );
  }

  private triggerEnvelope(
    frequency: number,
    duration: number,
    peakGain: number,
    oscillatorType:
      OscillatorType =
      "sine"
  ) {
    const context =
      this.context;

    const nodes =
      this.nodes;

    if (
      !context ||
      !nodes
    ) {
      return;
    }

    const oscillator =
      context.createOscillator();

    const gain =
      context.createGain();

    const filter =
      context.createBiquadFilter();

    const now =
      context.currentTime;

    const end =
      now +
      duration;

    oscillator.type =
      oscillatorType;

    oscillator.frequency.setValueAtTime(
      frequency,
      now
    );

    filter.type =
      "lowpass";

    filter.frequency.setValueAtTime(
      Math.max(
        500,
        frequency *
          5
      ),
      now
    );

    gain.gain.setValueAtTime(
      0.0001,
      now
    );

    gain.gain.exponentialRampToValueAtTime(
      Math.max(
        0.0002,
        peakGain
      ),
      now +
        Math.min(
          0.018,
          duration *
            0.16
        )
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
      nodes.master
    );

    oscillator.start(
      now
    );

    oscillator.stop(
      end +
        0.02
    );
  }

  private triggerImpact(
    detail: RedMagicInteractionDetail
  ) {
    const intensity =
      clamp(
        detail.proximity,
        0,
        1
      );

    this.triggerEnvelope(
      250 +
        intensity *
          160,
      0.17,
      0.055 +
        intensity *
          0.035,
      "triangle"
    );

    this.triggerEnvelope(
      82 +
        intensity *
          36,
      0.22,
      0.045 +
        intensity *
          0.025,
      "sine"
    );
  }

  private triggerFlick(
    detail: RedMagicInteractionDetail
  ) {
    const intensity =
      clamp(
        detail.energy,
        0,
        1
      );

    this.triggerEnvelope(
      380 +
        intensity *
          420,
      0.09,
      0.035 +
        intensity *
          0.025,
      "sawtooth"
    );
  }

  private triggerRelease(
    detail: RedMagicInteractionDetail
  ) {
    const charge =
      clamp(
        detail.charge,
        0,
        1
      );

    if (
      charge <
      0.08
    ) {
      return;
    }

    this.triggerEnvelope(
      65 +
        charge *
          28,
      0.32,
      0.05 +
        charge *
          0.06,
      "sine"
    );

    this.triggerEnvelope(
      420 +
        charge *
          580,
      0.26,
      0.025 +
        charge *
          0.035,
      "triangle"
    );

    this.triggerEnvelope(
      900 +
        charge *
          1200,
      0.19,
      0.008 +
        charge *
          0.016,
      "sine"
    );
  }

  private triggerOrbit(
    detail: RedMagicInteractionDetail
  ) {
    const intensity =
      clamp(
        detail.proximity,
        0,
        1
      );

    this.triggerEnvelope(
      300 +
        intensity *
          320,
      0.16,
      0.012 +
        intensity *
          0.025,
      "triangle"
    );
  }

  private handleEvent = (
    event: Event
  ) => {
    const customEvent =
      event as CustomEvent<RedMagicInteractionDetail>;

    const detail =
      customEvent.detail;

    if (
      !detail
    ) {
      return;
    }

    /*
     * Audio is deliberately created only from an interaction event.
     * This keeps it compliant with browser user-gesture restrictions.
     */
    void this.ensureStarted();

    this.energy =
      clamp(
        detail.energy,
        0,
        1
      );

    this.charge =
      clamp(
        detail.charge,
        0,
        1
      );

    this.updateAmbient(
      detail
    );

    const now =
      performance.now();

    const interactiveEvent: RedMagicInteractionType =
      detail.type;

    if (
      now -
        this.lastEventTime <
      EVENT_COOLDOWN_MS &&
      interactiveEvent !==
        "release"
    ) {
      return;
    }

    this.lastEventTime =
      now;

    switch (
      interactiveEvent
    ) {
      case "impact":
        this.triggerImpact(
          detail
        );
        break;

      case "flick":
        this.triggerFlick(
          detail
        );
        break;

      case "release":
        this.triggerRelease(
          detail
        );
        break;

      case "orbit":
        this.triggerOrbit(
          detail
        );
        break;

      case "enter":
        this.triggerEnvelope(
          170,
          0.18,
          0.025,
          "sine"
        );
        break;

      case "leave":
        this.triggerEnvelope(
          135,
          0.22,
          0.018,
          "sine"
        );
        break;

      case "charge":
      case "move":
        break;
    }
  };

  public destroy() {
    this.detach();

    if (
      typeof document !==
      "undefined" &&
      this.visibilityHandler
    ) {
      document.removeEventListener(
        "visibilitychange",
        this.visibilityHandler
      );
    }

    const context =
      this.context;

    if (
      context &&
      context.state !==
      "closed"
    ) {
      void context.close();
    }

    this.nodes =
      null;

    this.context =
      null;
  }
}
