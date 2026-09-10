/*
 * Resource store — typed async resource manager.
 *
 * Single source of truth for "load an async resource exactly once".
 *
 * Guarantees:
 * - request deduplication: concurrent callers share one in-flight promise
 * - failure cleanup: a rejected entry is removed so a later caller retries
 * - race protection: callers can pass an AbortSignal; aborted loads are
 *   dropped from the cache so the next caller starts fresh
 * - stale-result protection: entries older than `staleAfter` are re-fetched
 *   (in-flight entry is still shared while refreshing)
 * - cache lookup + explicit invalidation
 *
 * Resource lifetime policy (see worklog.md — Cache Strategy):
 * - IMMUTABLE (default): build-stamped data, content-addressed assets
 * - SHORT-LIVED (staleAfter): remote manifests that may change
 * - SESSION: runtime navigation state — never belongs here
 * - PERSISTENT: reading position / preferences — belongs to localStorage,
 *   not this store
 */

export type ResourceEntry<T> = {
  promise: Promise<T>;
  createdAt: number;
};

const inFlight = new Map<string, ResourceEntry<unknown>>();
const settled = new Map<string, ResourceEntry<unknown>>();

export type LoadResourceOptions = {
  /*
   * Milliseconds after which a settled entry is considered stale and a
   * fresh load is started. Omit for immutable resources.
   */
  staleAfter?: number;

  /*
   * Abort the underlying work. The entry is removed from the cache when
   * the abort fires so the resource is not left half-open.
   */
  signal?: AbortSignal;
};

function dropEntry(key: string) {
  inFlight.delete(key);
  settled.delete(key);
}

export function loadResource<T>(
  key: string,
  loader: () => Promise<T>,
  options: LoadResourceOptions = {}
): Promise<T> {
  const { staleAfter, signal } = options;

  const live = inFlight.get(key);

  if (live) {
    return live.promise as Promise<T>;
  }

  const cached = settled.get(key);

  if (
    cached &&
    (staleAfter === undefined ||
      Date.now() - cached.createdAt < staleAfter)
  ) {
    return cached.promise as Promise<T>;
  }

  const promise = loader().then(
    (value) => {
      /*
       * If the entry was dropped while loading (abort or explicit
       * invalidation), do not resurrect it — the next caller should
       * start a fresh load rather than receive a stale settle.
       */
      if (inFlight.get(key)?.promise !== promise) {
        return value;
      }

      inFlight.delete(key);

      settled.set(key, {
        promise: Promise.resolve(value),
        createdAt: Date.now()
      });

      return value;
    },
    (reason) => {
      /*
       * Failure cleanup: never cache a rejection. The next caller
       * must be able to retry.
       */
      dropEntry(key);

      throw reason;
    }
  );

  inFlight.set(key, {
    promise,
    createdAt: Date.now()
  });

  if (signal) {
    const handleAbort = () => {
      if (inFlight.get(key)?.promise === promise) {
        dropEntry(key);
      }
    };

    if (signal.aborted) {
      handleAbort();
    } else {
      signal.addEventListener("abort", handleAbort, { once: true });
    }
  }

  return promise;
}

/*
 * Synchronous peek. Returns the settled value container when present,
 * or null when the resource has never completed (or failed) a load.
 */
export function peekResource<T>(key: string): Promise<T> | null {
  return (settled.get(key)?.promise as Promise<T> | undefined) ?? null;
}

/*
 * Explicit invalidation for cases where the owner knows the resource
 * changed (for example after a write or a manual refresh).
 */
export function invalidateResource(key: string) {
  dropEntry(key);
}

export function clearResourceStore() {
  inFlight.clear();
  settled.clear();
}
