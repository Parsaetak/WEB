/*
 * tests/player-store.test.ts — the global player store: queue
 * semantics, next/previous gestures, repeat/auto-advance, playback
 * error state, and single-audio-element guarantees.
 *
 * The store runs against a scripted FAKE audio element — no real
 * network, no real decoder, fully deterministic.
 */

import { describe, it, beforeEach } from "node:test";

import assert from "node:assert/strict";

import {
  createPlayerStore,
  setPlayerAudioFactory,
  resetPlayerStoreForTests,
  type PlayerAudioElement
} from "../lib/player/playerStore";

import type { MusicItem } from "../lib/media/normalize";

type FakeAudio = PlayerAudioElement & {
  listeners: Map<string, (() => void)[]>;

  emit(type: string): void;

  playCalls: number[];

  sources: string[];
};

function makeFakeAudio(): FakeAudio {
  const listeners = new Map<string, (() => void)[]>();

  const audio: FakeAudio = {
    src: "",
    preload: "",
    volume: 1,
    muted: false,
    currentTime: 0,
    duration: 0,
    paused: true,
    playbackRate: 1,

    listeners,

    playCalls: [],

    sources: [],

    emit(type) {
      for (const listener of listeners.get(type) ?? []) {
        listener();
      }
    },

    async play() {
      audio.playCalls.push(audio.sources.length);

      audio.paused = false;

      audio.emit("play");

      return;
    },

    pause() {
      audio.paused = true;

      audio.emit("pause");
    },

    load() {},

    addEventListener(type, listener) {
      const list = listeners.get(type) ?? [];

      list.push(listener);

      listeners.set(type, list);
    },

    removeEventListener(type, listener) {
      const list = listeners.get(type) ?? [];

      listeners.set(
        type,
        list.filter((entry) => entry !== listener)
      );
    }
  };

  /* Track the src assignments for assertions. */
  let currentSrc = "";

  Object.defineProperty(audio, "src", {
    get: () => currentSrc,
    set: (value) => {
      currentSrc = value;

      audio.sources.push(value);
    }
  });

  return audio;
}

const TRACKS: MusicItem[] = [
  "One",
  "Two",
  "Three",
  "Four"
].map((title, index) => ({
  id: `Music/${title}.mp3`,
  name: title,
  path: `${title}.mp3`,
  kind: "mp3" as const,
  category: "music" as const,
  title,
  rawUrl: `https://cdn.test/${title}.mp3`,
  githubUrl: `https://github.test/${title}.mp3`,
  coverUrl: undefined,
  track: {
    title,
    artist: "Artist",
    duration: 30 + index,
    source: "manifest" as const
  }
}));

function setup() {
  resetPlayerStoreForTests();

  const audio = makeFakeAudio();

  setPlayerAudioFactory(() => audio);

  const store = createPlayerStore();

  store.setCollection(TRACKS, "media:all");

  /* The browser wires element events via PlayerSurface; tests wire
   * the same path explicitly so the fake element is observed. */
  store.attachElementListeners();

  return { store, audio };
}

describe("player store — play intent and single element", () => {
  beforeEach(() => {
    resetPlayerStoreForTests();
  });

  it("creates exactly ONE audio element and only on play intent", () => {
    let created = 0;

    resetPlayerStoreForTests();

    setPlayerAudioFactory(() => {
      created += 1;

      return makeFakeAudio();
    });

    const store = createPlayerStore();

    store.setCollection(TRACKS, "media:all");

    assert.equal(created, 0, "no audio before any intent");

    store.playCollectionFrom("Music/Two.mp3");

    assert.equal(created, 1, "exactly one element");

    store.playNow("Music/Three.mp3");

    assert.equal(created, 1, "still one element across tracks");

    store.next();

    assert.equal(created, 1);
  });

  it("playCollectionFrom builds the queue from the collection order", () => {
    const { store, audio } = setup();

    store.playCollectionFrom("Music/Two.mp3");

    const state = store.getState();

    assert.equal(state.currentTrackId, "Music/Two.mp3");
    assert.deepEqual(state.upcoming, [
      "Music/Three.mp3",
      "Music/Four.mp3"
    ]);
    assert.equal(state.history.length, 0);
    assert.equal(audio.sources[0], "https://cdn.test/Two.mp3");
  });
});

describe("player store — queue operations", () => {
  it("play next inserts at the head; add appends; duplicates collapse", () => {
    const { store } = setup();

    store.playCollectionFrom("Music/One.mp3");

    store.playNext("Music/Four.mp3");

    assert.deepEqual(store.getState().upcoming, [
      "Music/Four.mp3",
      "Music/Two.mp3",
      "Music/Three.mp3"
    ]);

    store.addToQueue("Music/Four.mp3");

    assert.equal(
      store.getState().upcoming.filter((id) => id === "Music/Four.mp3")
        .length,
      1
    );

    store.addToQueue("Music/One.mp3");

    assert.deepEqual(store.getState().upcoming, [
      "Music/Four.mp3",
      "Music/Two.mp3",
      "Music/Three.mp3",
      "Music/One.mp3"
    ]);
  });

  it("remove drops one entry; clear empties upcoming; current survives", () => {
    const { store } = setup();

    store.playCollectionFrom("Music/One.mp3");

    store.removeFromQueue("Music/Two.mp3");

    assert.deepEqual(store.getState().upcoming, [
      "Music/Three.mp3",
      "Music/Four.mp3"
    ]);

    store.clearUpcoming();

    assert.deepEqual(store.getState().upcoming, []);
    assert.equal(store.getState().currentTrackId, "Music/One.mp3");
  });

  it("select queued track plays it immediately and removes it from the queue", () => {
    const { store, audio } = setup();

    store.playCollectionFrom("Music/One.mp3");

    store.selectQueued("Music/Three.mp3");

    const state = store.getState();

    assert.equal(state.currentTrackId, "Music/Three.mp3");
    /* Three left the queue; the rest keep their order. */
    assert.deepEqual(state.upcoming, ["Music/Two.mp3", "Music/Four.mp3"]);
    assert.deepEqual(state.history, ["Music/One.mp3"]);
    assert.equal(audio.sources.at(-1), "https://cdn.test/Three.mp3");
  });

  it("queued ids outside the registry are refused (deterministic skip)", () => {
    const { store } = setup();

    store.playCollectionFrom("Music/One.mp3");

    /* Ghost id (not in the registry) — addToQueue refuses it so the
     * queue can never carry an unplayable entry. */
    store.addToQueue("Music/Ghost.mp3");

    assert.deepEqual(store.getState().upcoming, [
      "Music/Two.mp3",
      "Music/Three.mp3",
      "Music/Four.mp3"
    ]);
  });
});

describe("player store — next / previous / auto-advance", () => {
  it("end of track advances into the queue (auto-advance)", () => {
    const { store, audio } = setup();

    store.playCollectionFrom("Music/One.mp3");

    audio.emit("ended");

    assert.equal(store.getState().currentTrackId, "Music/Two.mp3");

    audio.emit("ended");

    assert.equal(store.getState().currentTrackId, "Music/Three.mp3");
  });

  it("repeat one replays the current track", () => {
    const { store, audio } = setup();

    store.playCollectionFrom("Music/One.mp3");

    store.cycleRepeat();

    assert.equal(store.getState().repeat, "all");

    store.cycleRepeat();

    assert.equal(store.getState().repeat, "one");

    const before = audio.sources.length;

    audio.emit("ended");

    assert.equal(store.getState().currentTrackId, "Music/One.mp3");
    assert.equal(audio.sources.length, before, "src unchanged — replay");
  });

  it("repeat all restarts the collection when the queue drains", () => {
    const { store, audio } = setup();

    store.playCollectionFrom("Music/Three.mp3");

    store.cycleRepeat(); /* off → all */

    audio.emit("ended");

    assert.equal(store.getState().currentTrackId, "Music/Four.mp3");

    audio.emit("ended");

    assert.equal(
      store.getState().currentTrackId,
      "Music/One.mp3",
      "collection restart"
    );
  });

  it("stops honestly when the queue drains with repeat off", () => {
    const { store, audio } = setup();

    store.playCollectionFrom("Music/Four.mp3");

    audio.emit("ended");

    const state = store.getState();

    assert.equal(state.upcoming.length, 0);
    assert.equal(state.status, "paused");
    assert.equal(state.currentTrackId, "Music/Four.mp3");
  });

  it("previous restarts when sufficiently progressed, steps history near the start", () => {
    const { store, audio } = setup();

    store.playCollectionFrom("Music/One.mp3");

    /* Sufficiently progressed → restart the current track. */
    store.seek(10);

    assert.equal(store.getState().currentTime, 10);

    store.previous();

    assert.equal(store.getState().currentTrackId, "Music/One.mp3");
    assert.equal(store.getState().currentTime, 0);

    /* Advance into Two; history now holds One. */
    audio.emit("ended");

    assert.equal(store.getState().currentTrackId, "Music/Two.mp3");

    /* Near the beginning → the previous gesture steps history back. */
    store.previous();

    assert.equal(store.getState().currentTrackId, "Music/One.mp3");

    /* History still holds Two (the track we stepped away from), so
     * previous keeps walking back through it — standard behaviour. */
    store.previous();

    assert.equal(store.getState().currentTrackId, "Music/Two.mp3");
  });

  it("previous with empty history and no progress restarts the current track", () => {
    const { store } = setup();

    store.playCollectionFrom("Music/Two.mp3");

    store.seek(20);

    store.previous();

    assert.equal(store.getState().currentTrackId, "Music/Two.mp3");

    /* History is empty (no track change yet) — a second previous at
     * the very start stays honest and restarts again. */
    store.previous();

    assert.equal(store.getState().currentTrackId, "Music/Two.mp3");
  });

  it("manual next walks the queue, then wraps the collection", () => {
    const { store } = setup();

    store.playCollectionFrom("Music/One.mp3");

    store.next();

    assert.equal(store.getState().currentTrackId, "Music/Two.mp3");

    store.clearUpcoming();

    store.next();

    assert.equal(store.getState().currentTrackId, "Music/Three.mp3");
  });
});

describe("player store — state and errors", () => {
  it("tracks play/pause status and time from element events", () => {
    const { store, audio } = setup();

    store.playCollectionFrom("Music/One.mp3");

    assert.equal(store.getState().status, "playing");

    audio.currentTime = 12;

    audio.emit("timeupdate");

    assert.equal(store.getState().currentTime, 12);

    audio.pause();

    assert.equal(store.getState().status, "paused");

    store.togglePlay();

    assert.equal(store.getState().status, "playing");
  });

  it("surfaces playback errors without crashing the queue", () => {
    const { store, audio } = setup();

    store.playCollectionFrom("Music/One.mp3");

    audio.emit("error");

    assert.equal(store.getState().status, "error");
    assert.ok(store.getState().error);

    audio.emit("ended");

    assert.equal(store.getState().currentTrackId, "Music/Two.mp3");
  });

  it("volume persists through the store contract (0..1 clamped)", () => {
    const { store } = setup();

    store.setVolume(1.5);

    assert.equal(store.getState().volume, 1);

    store.setVolume(-2);

    assert.equal(store.getState().volume, 0);

    store.setVolume(0.42);

    assert.equal(store.getState().volume, 0.42);

    store.toggleMute();

    assert.equal(store.getState().muted, true);

    store.toggleMute();

    assert.equal(store.getState().muted, false);
  });

  it("seek clamps into the known duration (manifest until element reports)", () => {
    const { store } = setup();

    store.playCollectionFrom("Music/One.mp3");

    /* The track registry carries duration 30 s for "One". */
    assert.equal(store.getState().duration, 30);

    store.seek(999);

    assert.equal(store.getState().currentTime, 30);

    store.seek(-10);

    assert.equal(store.getState().currentTime, 0);
  });

  it("element-reported duration wins over the manifest once loaded", () => {
    const { store, audio } = setup();

    store.playCollectionFrom("Music/One.mp3");

    audio.duration = 42.5;

    audio.emit("loadedmetadata");

    assert.equal(store.getState().duration, 42.5);
  });

  it("expanded toggles", () => {
    const { store } = setup();

    assert.equal(store.getState().expanded, false);

    store.setExpanded(true);

    assert.equal(store.getState().expanded, true);
  });

  it("getTrack resolves registry entries and tolerates ghosts", () => {
    const { store } = setup();

    assert.equal(store.getTrack("Music/One.mp3")?.title, "One");
    assert.equal(store.getTrack("Music/Ghost.mp3"), null);
    assert.equal(store.getTrack(null), null);
  });
});
