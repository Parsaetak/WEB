/*
 * lib/player/persistence.ts — non-sensitive playback-session
 * persistence (v4.0.2).
 *
 * WHAT is persisted (never anything sensitive — plain playback
 * preferences and queue identity):
 *   repeat, shuffle, queue (upcoming), history, current track id,
 *   current position, collection id
 * Volume + muted keep their own long-standing key
 * ("web-player-volume", v1) so existing visitors keep their setting.
 *
 * WHEN it is read: once, when the lazy player surface mounts, to
 * restore a session that a full browser reload destroyed.
 *
 * WHAT restoration NEVER does: autoplay. The restored player shows
 * PAUSED state and waits for an explicit user gesture; the persisted
 * position becomes a pending seek applied after the resumed track's
 * metadata loads. Client-side route navigation never needs this
 * module — the live store and its audio element already survive it.
 */

const SESSION_STORAGE_KEY = "web-player-session";

const SESSION_STORAGE_VERSION = "v1";

export type PersistedPlayerSession = {
  version: string;
  currentTrackId: string | null;
  position: number;
  upcoming: string[];
  history: string[];
  collectionId: string | null;
  repeat: "off" | "all" | "one";
  shuffle: boolean;
};

export type SessionSnapshotInput = {
  currentTrackId: string | null;
  currentTime: number;
  upcoming: string[];
  history: string[];
  collectionId: string | null;
  repeat: "off" | "all" | "one";
  shuffle: boolean;
};

function sanitizeIdList(
  value: unknown
): string[] | null {
  if (
    !Array.isArray(value) ||
    value.length > 1000 ||
    !value.every((id) => typeof id === "string" && id.length > 0)
  ) {
    return null;
  }

  return value as string[];
}

/**
 * Read the persisted session. Returns null when nothing valid is
 * stored (fresh visitor, corrupt payload, wrong version, or storage
 * unavailable) — callers treat null as "no session to restore".
 */
export function readPersistedSession(): PersistedPlayerSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  let raw: string | null = null;

  try {
    raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }

  if (!raw) {
    return null;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (
    typeof parsed !== "object" ||
    parsed === null
  ) {
    return null;
  }

  const record = parsed as Record<string, unknown>;

  if (record.version !== SESSION_STORAGE_VERSION) {
    return null;
  }

  if (
    typeof record.currentTrackId !== "string" ||
    record.currentTrackId.length === 0
  ) {
    /* A session without a current track is not a session. */
    return null;
  }

  const upcoming = sanitizeIdList(record.upcoming);

  const history = sanitizeIdList(record.history);

  if (!upcoming || !history) {
    return null;
  }

  const position =
    typeof record.position === "number" &&
    Number.isFinite(record.position) &&
    record.position >= 0
      ? record.position
      : 0;

  const repeat =
    record.repeat === "off" ||
    record.repeat === "all" ||
    record.repeat === "one"
      ? record.repeat
      : "off";

  return {
    version: SESSION_STORAGE_VERSION,
    currentTrackId: record.currentTrackId,
    position,
    upcoming,
    history,
    collectionId:
      typeof record.collectionId === "string" &&
      record.collectionId.length > 0
        ? record.collectionId
        : null,
    repeat,
    shuffle: record.shuffle === true
  };
}

/**
 * Write the session snapshot. Never throws: storage can be full,
 * blocked, or unavailable — persistence is an enhancement, and a
 * failed write simply means the next reload starts fresh.
 *
 * A snapshot without a current track is not a session: the key is
 * REMOVED so the host's existence probe never mounts a player UI for
 * nothing.
 */
export function writePersistedSession(
  snapshot: SessionSnapshotInput
): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!snapshot.currentTrackId) {
    try {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      /* Unavailable storage — nothing to remove. */
    }

    return;
  }

  const payload: PersistedPlayerSession = {
    version: SESSION_STORAGE_VERSION,
    currentTrackId: snapshot.currentTrackId,
    position: Math.max(0, snapshot.currentTime),
    upcoming: snapshot.upcoming,
    history: snapshot.history,
    collectionId: snapshot.collectionId,
    repeat: snapshot.repeat,
    shuffle: snapshot.shuffle
  };

  try {
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify(payload)
    );
  } catch {
    /* Unavailable storage — the session stays ephemeral. */
  }
}

/**
 * Existence probe used by the global player HOST (which deliberately
 * does not import the store): a raw string check that decides whether
 * the lazy player surface should mount to show a restored, paused
 * player. Parsing/validation happens later, inside the store.
 */
export function hasPersistedSession(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return (
      window.localStorage.getItem(SESSION_STORAGE_KEY) !== null
    );
  } catch {
    return false;
  }
}

/**
 * Test hook: clear the persisted session.
 */
export function clearPersistedSessionForTests(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    /* Nothing to clear. */
  }
}
