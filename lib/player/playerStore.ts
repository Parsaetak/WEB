/*
 * lib/player/playerStore.ts — the global Music player store (v4.0.0).
 *
 * ONE authoritative audio element for the whole application, created
 * lazily on the first explicit playback intent — never per track,
 * never at page load, never without user interaction (no autoplay).
 *
 * The store is framework-free (subscribe/getState) so the React
 * binding (usePlayer) stays a thin useSyncExternalStore shim and the
 * pure queue/history/repeat logic is unit-testable under `node
 * --test` with a fake audio adapter.
 *
 * QUEUE SEMANTICS (deterministic, derived from the active Media
 * collection):
 *   current    — the playing/selected track id
 *   upcoming   — FIFO queue (play next / add to queue)
 *   history    — LIFO stack of previously PLAYED tracks
 *   play now   — replaces current, pushes it to history
 *   play next  — inserts at the head of upcoming
 *   add        — appends at the tail of upcoming
 *   remove     — removes an upcoming entry by id
 *   select     — an upcoming entry jumps to current
 *   clear      — empties upcoming (current untouched)
 *
 * PREVIOUS: sufficiently progressed (> 3 s) restarts the current
 * track; near the beginning it pops history (or restarts when the
 * stack is empty).
 *
 * AUTO-ADVANCE (end of track): repeat "one" replays; otherwise the
 * next upcoming track plays; with an empty upcoming queue and repeat
 * "all" the active collection restarts; otherwise playback stops —
 * the player never invents a next track.
 */

import type { MusicItem } from "@/lib/media/normalize";

/* ---------------------------------------------------------------- */
/* Minimal audio element contract (real <audio> or a test fake)      */
/* ---------------------------------------------------------------- */

export type PlayerAudioElement = {
  src: string;
  preload: string;
  volume: number;
  muted: boolean;
  currentTime: number;
  duration: number;
  paused: boolean;
  playbackRate: number;

  play(): Promise<void>;

  pause(): void;

  load(): void;

  addEventListener(
    type: string,
    listener: () => void
  ): void;

  removeEventListener(
    type: string,
    listener: () => void
  ): void;
};

export type PlayerAudioFactory = () => PlayerAudioElement | null;

let audioFactory: PlayerAudioFactory = defaultAudioFactory;

/**
 * Replace the audio element factory (tests inject a fake here;
 * production code never needs to call this).
 */
export function setPlayerAudioFactory(
  factory: PlayerAudioFactory
): void {
  audioFactory = factory;
}

function defaultAudioFactory(): PlayerAudioElement | null {
  if (typeof window === "undefined") {
    return null;
  }

  const element = new window.Audio();

  element.preload = "metadata";

  /*
   * Attach the authoritative element to the document: some engines
   * (notably iOS Safari) refuse to play detached media elements. It
   * is invisible and carries no src until the first play intent, so
   * attaching it requests nothing.
   */
  if (typeof document !== "undefined") {
    element.setAttribute("data-web-player", "true");

    element.style.display = "none";

    element.setAttribute("aria-hidden", "true");

    document.body.appendChild(element);
  }

  return element as unknown as PlayerAudioElement;
}

/* ---------------------------------------------------------------- */
/* State                                                             */
/* ---------------------------------------------------------------- */

export type PlayerRepeat = "off" | "all" | "one";

export type PlayerStatus =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "error";

export type PlayerState = {
  /** Current track id (registry key), null when nothing selected. */
  currentTrackId: string | null;
  /** Upcoming queue (head = next). */
  upcoming: string[];
  /** Previously played tracks, most recent last. */
  history: string[];
  status: PlayerStatus;
  /** Human-readable playback failure reason (role="alert" surface). */
  error: string | null;
  /** Seconds. */
  currentTime: number;
  /** Seconds; manifest duration until the element reports its own. */
  duration: number;
  /** 0..1, persisted to localStorage. */
  volume: number;
  muted: boolean;
  repeat: PlayerRepeat;
  /** Expanded player surface (large artwork + queue) visibility. */
  expanded: boolean;
  /**
   * Identity of the collection the queue was built from — a
   * deterministic fingerprint of the active Media filter/order.
   * Queued ids outside the registry resolve to nothing (skipped).
   */
  collectionId: string | null;
};

const INITIAL_STATE: PlayerState = {
  currentTrackId: null,
  upcoming: [],
  history: [],
  status: "idle",
  error: null,
  currentTime: 0,
  duration: 0,
  volume: 1,
  muted: false,
  repeat: "off",
  expanded: false,
  collectionId: null
};

const PREVIOUS_RESTART_THRESHOLD_SECONDS = 3;

const VOLUME_STORAGE_KEY = "web-player-volume";

const VOLUME_STORAGE_VERSION = "v1";

type StoredVolume = {
  version: string;
  volume: number;
  muted: boolean;
};

function readStoredVolume(): {
  volume: number;
  muted: boolean;
} {
  if (typeof window === "undefined") {
    return { volume: 1, muted: false };
  }

  try {
    const raw = window.localStorage.getItem(VOLUME_STORAGE_KEY);

    if (!raw) {
      return { volume: 1, muted: false };
    }

    const parsed = JSON.parse(raw) as StoredVolume;

    if (parsed.version !== VOLUME_STORAGE_VERSION) {
      return { volume: 1, muted: false };
    }

    return {
      volume:
        typeof parsed.volume === "number" &&
        Number.isFinite(parsed.volume) &&
        parsed.volume >= 0 &&
        parsed.volume <= 1
          ? parsed.volume
          : 1,
      muted: parsed.muted === true
    };
  } catch {
    return { volume: 1, muted: false };
  }
}

function writeStoredVolume(
  volume: number,
  muted: boolean
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const payload: StoredVolume = {
      version: VOLUME_STORAGE_VERSION,
      volume,
      muted
    };

    window.localStorage.setItem(
      VOLUME_STORAGE_KEY,
      JSON.stringify(payload)
    );
  } catch {
    /* Storage unavailable — preferences simply stay ephemeral. */
  }
}

/* ---------------------------------------------------------------- */
/* Store                                                             */
/* ---------------------------------------------------------------- */

export type TrackRegistryEntry = {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  albumArtist?: string;
  url: string;
  coverUrl?: string;
  duration?: number;
};

function toRegistryEntry(item: MusicItem): TrackRegistryEntry {
  return {
    id: item.id,
    title: item.track.title,
    artist: item.track.artist ?? item.author,
    album: item.track.album,
    albumArtist: item.track.albumArtist,
    url: item.rawUrl,
    coverUrl: item.coverUrl,
    duration: item.track.duration
  };
}

export type PlayerStore = {
  getState(): PlayerState;

  subscribe(
    listener: () => void
  ): () => void;

  /** Register the playable catalog (Media scene collection). */
  setCollection(
    tracks: MusicItem[],
    collectionId: string
  ): void;

  /** Deterministic collection identity for a filtered list. */
  getCollectionId(): string | null;

  getTrack(
    id: string | null
  ): TrackRegistryEntry | null;

  /* Commands */
  playCollectionFrom(
    trackId: string,
    collectionId?: string
  ): void;

  playNow(trackId: string): void;

  playNext(trackId: string): void;

  addToQueue(trackId: string): void;

  removeFromQueue(trackId: string): void;

  clearUpcoming(): void;

  selectQueued(trackId: string): void;

  togglePlay(): void;

  pause(): void;

  next(): void;

  previous(): void;

  seek(seconds: number): void;

  setVolume(value: number): void;

  toggleMute(): void;

  cycleRepeat(): void;

  setExpanded(expanded: boolean): void;

  /** Element event bridge (wired once by the player surface). */
  attachElementListeners(): void;
};

export function createPlayerStore(): PlayerStore {
  let state: PlayerState = {
    ...INITIAL_STATE,
    ...readStoredVolume()
  };

  const listeners = new Set<() => void>();

  const registry = new Map<string, TrackRegistryEntry>();

  let collectionOrder: string[] = [];

  let audio: PlayerAudioElement | null = null;

  let listenersAttached = false;

  function emit() {
    for (const listener of listeners) {
      listener();
    }
  }

  function setState(patch: Partial<PlayerState>) {
    state = { ...state, ...patch };

    emit();
  }

  function ensureAudio(): PlayerAudioElement | null {
    if (audio) {
      return audio;
    }

    audio = audioFactory();

    if (!audio) {
      return null;
    }

    audio.volume = state.muted ? 0 : state.volume;

    audio.muted = state.muted;

    return audio;
  }

  function resolveTrack(
    trackId: string | null
  ): TrackRegistryEntry | null {
    if (!trackId) {
      return null;
    }

    return registry.get(trackId) ?? null;
  }

  function commitPlaybackStart(entry: TrackRegistryEntry) {
    const element = ensureAudio();

    if (!element) {
      setState({
        status: "error",
        error: "Audio playback is not available in this browser."
      });

      return;
    }

    /*
     * Push the PREVIOUS current track into history when playback
     * switches to a different track (history never holds duplicates).
     */
    const previousId = state.currentTrackId;

    const history =
      previousId && previousId !== entry.id
        ? [...state.history.filter((id) => id !== previousId), previousId]
        : state.history;

    element.src = entry.url;

    setState({
      currentTrackId: entry.id,
      history,
      status: "loading",
      error: null,
      currentTime: 0,
      duration: entry.duration ?? 0
    });

    void element.play().catch(() => {
      setState({
        status: "error",
        error: "The browser could not start playback for this track."
      });
    });

    engageObserver();
  }

  /**
   * First-play engagement signal. The player surface (mini bar,
   * expanded view) is mounted by PlayerRoot only after this DOM
   * event — keeping the whole player UI out of the initial bundle.
   */
  function engageObserver() {
    if (typeof document === "undefined") {
      return;
    }

    document.dispatchEvent(
      new CustomEvent("web:player:engage")
    );
  }

  function advanceToEnd() {
    if (state.repeat === "one") {
      const element = ensureAudio();

      if (element) {
        element.currentTime = 0;

        void element.play().catch(() => {
          setState({
            status: "error",
            error: "The browser could not restart this track."
          });
        });
      }

      return;
    }

    const [nextId, ...rest] = state.upcoming;

    if (nextId) {
      const entry = resolveTrack(nextId);

      if (entry) {
        setState({ upcoming: rest });

        commitPlaybackStart(entry);

        return;
      }

      /* Queued id not in the registry — skip it deterministically. */
      setState({ upcoming: rest });

      advanceToEnd();

      return;
    }

    if (state.repeat === "all" && collectionOrder.length > 0) {
      const firstId = collectionOrder[0];

      const entry = resolveTrack(firstId);

      if (entry) {
        commitPlaybackStart(entry);

        setState({
          upcoming: collectionOrder.slice(1),
          collectionId: state.collectionId
        });

        return;
      }
    }

    /* Nothing honest left to play — stop, keep the last state. */
    setState({ status: "paused" });
  }

  function handleEnded() {
    advanceToEnd();
  }

  function handleTimeUpdate() {
    if (!audio) {
      return;
    }

    setState({ currentTime: audio.currentTime });
  }

  function handleLoadedMetadata() {
    if (!audio) {
      return;
    }

    const duration = audio.duration;

    setState({
      duration:
        Number.isFinite(duration) && duration > 0
          ? duration
          : state.duration
    });
  }

  function handlePlay() {
    setState({ status: "playing" });
  }

  function handlePause() {
    if (state.status !== "error") {
      setState({ status: "paused" });
    }
  }

  function handleError() {
    setState({
      status: "error",
      error: "This track could not be loaded or played."
    });
  }

  const store: PlayerStore = {
    getState() {
      return state;
    },

    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },

    getCollectionId() {
      return state.collectionId;
    },

    setCollection(tracks, collectionId) {
      registry.clear();

      collectionOrder = [];

      for (const track of tracks) {
        const entry = toRegistryEntry(track);

        registry.set(entry.id, entry);

        collectionOrder.push(entry.id);
      }

      if (state.collectionId !== collectionId) {
        setState({ collectionId });
      } else {
        emit();
      }
    },

    getTrack(trackId) {
      return resolveTrack(trackId);
    },

    playCollectionFrom(trackId, collectionId) {
      const entry = resolveTrack(trackId);

      if (!entry) {
        return;
      }

      const index = collectionOrder.indexOf(trackId);

      const upcoming =
        index >= 0 ? collectionOrder.slice(index + 1) : [];

      setState({
        upcoming,
        collectionId: collectionId ?? state.collectionId
      });

      commitPlaybackStart(entry);
    },

    playNow(trackId) {
      const entry = resolveTrack(trackId);

      if (!entry) {
        return;
      }

      commitPlaybackStart(entry);
    },

    playNext(trackId) {
      if (!registry.has(trackId)) {
        return;
      }

      const upcoming = state.upcoming.filter((id) => id !== trackId);

      upcoming.unshift(trackId);

      setState({ upcoming });
    },

    addToQueue(trackId) {
      if (!registry.has(trackId)) {
        return;
      }

      if (state.upcoming.includes(trackId)) {
        return;
      }

      setState({ upcoming: [...state.upcoming, trackId] });
    },

    removeFromQueue(trackId) {
      setState({
        upcoming: state.upcoming.filter((id) => id !== trackId)
      });
    },

    clearUpcoming() {
      setState({ upcoming: [] });
    },

    selectQueued(trackId) {
      const entry = resolveTrack(trackId);

      if (!entry) {
        return;
      }

      setState({
        upcoming: state.upcoming.filter((id) => id !== trackId)
      });

      commitPlaybackStart(entry);
    },

    togglePlay() {
      if (!state.currentTrackId) {
        /* Nothing selected: start the collection, if one exists. */
        const firstId = collectionOrder[0];

        if (firstId) {
          store.playCollectionFrom(firstId);
        }

        return;
      }

      const element = ensureAudio();

      if (!element) {
        return;
      }

      if (state.status === "playing") {
        element.pause();

        return;
      }

      void element.play().catch(() => {
        setState({
          status: "error",
          error: "The browser could not resume playback."
        });
      });
    },

    pause() {
      const element = ensureAudio();

      element?.pause();
    },

    next() {
      const [nextId, ...rest] = state.upcoming;

      const entry = resolveTrack(nextId ?? null);

      if (entry) {
        setState({ upcoming: rest });

        commitPlaybackStart(entry);

        return;
      }

      if (collectionOrder.length > 0) {
        const currentIndex = state.currentTrackId
          ? collectionOrder.indexOf(state.currentTrackId)
          : -1;

        const wrappedId =
          collectionOrder[
            (currentIndex + 1) % collectionOrder.length
          ];

        const wrapped = resolveTrack(wrappedId);

        if (wrapped && wrappedId !== state.currentTrackId) {
          commitPlaybackStart(wrapped);

          setState({
            upcoming: collectionOrder.slice(
              collectionOrder.indexOf(wrappedId) + 1
            )
          });
        }
      }
    },

    previous() {
      const element = ensureAudio();

      const progressed =
        state.currentTime > PREVIOUS_RESTART_THRESHOLD_SECONDS;

      if (element && progressed) {
        element.currentTime = 0;

        setState({ currentTime: 0 });

        return;
      }

      const history = [...state.history];

      const previousId = history.pop();

      const entry = resolveTrack(previousId ?? null);

      if (entry) {
        setState({ history });

        commitPlaybackStart(entry);

        return;
      }

      if (element) {
        element.currentTime = 0;

        setState({ currentTime: 0 });
      }
    },

    seek(seconds) {
      const element = ensureAudio();

      if (!element) {
        return;
      }

      const target =
        state.duration > 0
          ? Math.min(Math.max(seconds, 0), state.duration)
          : Math.max(seconds, 0);

      element.currentTime = target;

      setState({ currentTime: target });
    },

    setVolume(value) {
      const volume = Math.min(Math.max(value, 0), 1);

      const element = ensureAudio();

      if (element) {
        element.volume = volume;

        if (volume > 0 && state.muted) {
          element.muted = false;

          setState({ muted: false });
        }
      }

      setState({ volume });

      writeStoredVolume(volume, state.muted);
    },

    toggleMute() {
      const muted = !state.muted;

      const element = ensureAudio();

      if (element) {
        element.muted = muted;
      }

      setState({ muted });

      writeStoredVolume(state.volume, muted);
    },

    cycleRepeat() {
      const order: PlayerRepeat[] = ["off", "all", "one"];

      const next =
        order[(order.indexOf(state.repeat) + 1) % order.length];

      setState({ repeat: next });
    },

    setExpanded(expanded) {
      setState({ expanded });
    },

    attachElementListeners() {
      const element = ensureAudio();

      if (!element || listenersAttached) {
        return;
      }

      listenersAttached = true;

      element.addEventListener("ended", handleEnded);
      element.addEventListener("timeupdate", handleTimeUpdate);
      element.addEventListener("loadedmetadata", handleLoadedMetadata);
      element.addEventListener("play", handlePlay);
      element.addEventListener("pause", handlePause);
      element.addEventListener("error", handleError);

      /*
       * Playback may have started before the player surface mounted
       * (the engage event triggers a dynamic import). Sync the status
       * with the element's reality — events that fired before the
       * listeners attached must not leave the UI stuck on "loading".
       */
      if (!element.paused) {
        setState({ status: "playing" });
      }
    }
  };

  return store;
}

/* ---------------------------------------------------------------- */
/* Module-level singleton                                            */
/* ---------------------------------------------------------------- */

declare global {
  interface Window {
    __webPlayerStore?: PlayerStore;
  }
}

let singleton: PlayerStore | null = null;

/**
 * The application-wide store. Every surface (Media scene, mini
 * player, expanded player) shares this instance — player state is
 * never duplicated across cards, queue and player UI.
 */
export function getPlayerStore(): PlayerStore {
  if (singleton) {
    return singleton;
  }

  if (typeof window !== "undefined") {
    /* Fast refresh / double-hydration safety. */
    if (window.__webPlayerStore) {
      singleton = window.__webPlayerStore;

      return singleton;
    }
  }

  singleton = createPlayerStore();

  if (typeof window !== "undefined") {
    window.__webPlayerStore = singleton;
  }

  return singleton;
}

/**
 * Testing hook: drop the singleton so a test starts from scratch.
 */
export function resetPlayerStoreForTests(): void {
  singleton = null;

  if (typeof window !== "undefined") {
    delete window.__webPlayerStore;
  }
}

/* ---------------------------------------------------------------- */
/* Media Session integration                                         */
/* ---------------------------------------------------------------- */

type MediaSessionLike = {
  metadata: unknown;

  playbackState: string;

  setActionHandler(
    action: string,
    handler: (() => void) | null
  ): void;
};

/**
 * Wire the Media Session API to the store (no-op where unsupported).
 * Called once by the player surface after the audio element exists.
 */
export function attachMediaSession(
  store: PlayerStore
): void {
  if (
    typeof navigator === "undefined" ||
    !("mediaSession" in navigator)
  ) {
    return;
  }

  const session = (
    navigator as Navigator & {
      mediaSession: MediaSessionLike;
    }
  ).mediaSession;

  const updateMetadata = () => {
    try {
      const track = store.getTrack(
        store.getState().currentTrackId
      );

      if (!track) {
        return;
      }

      /*
       * The WebIDL type is MediaMetadata? — a MediaMetadata INSTANCE
       * (a plain dictionary throws on assignment). Guarded: engines
       * without the constructor simply skip metadata.
       */
      if (typeof window === "undefined" || typeof window.MediaMetadata !== "function") {
        return;
      }

      session.metadata = new window.MediaMetadata({
        title: track.title,
        artist: track.artist ?? "",
        album: track.album ?? "",
        artwork: track.coverUrl
          ? [
              {
                src: track.coverUrl,
                sizes: "512x512",
                type: "image/png"
              }
            ]
          : []
      });
    } catch {
      /*
       * A Media Session failure must never break playback or the
       * store's subscribers — it is an enhancement, not a feature.
       */
    }
  };

  try {
    session.setActionHandler("play", () => store.togglePlay());
    session.setActionHandler("pause", () => store.pause());
    session.setActionHandler("previoustrack", () => store.previous());
    session.setActionHandler("nexttrack", () => store.next());
    session.setActionHandler("stop", () => store.pause());
  } catch {
    /* Some actions are unsupported per-platform; feature-detective. */
  }

  store.subscribe(updateMetadata);

  updateMetadata();
}
