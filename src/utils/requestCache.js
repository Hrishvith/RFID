/**
 * Tiny in-memory TTL cache for read-heavy service calls (students,
 * attendance) that hit the external Apps Script API - which is slow and
 * has no caching of its own. Without this, every page navigation refetches
 * the same data from scratch, which is what made switching pages feel slow.
 *
 * Also dedupes in-flight requests: if several components ask for the same
 * key at once (e.g. Dashboard's stats + the Navbar's notification bell both
 * mounting together), they share one network call instead of firing N.
 */
const cache = new Map(); // key -> { data, expiresAt }
const inFlight = new Map(); // key -> Promise

/**
 * @param {string} key
 * @param {number} ttlMs
 * @param {() => Promise<any>} fetcher
 * @param {(data: any) => boolean} [shouldCache] Return false to skip
 *   caching this particular result (e.g. a suspicious empty array from a
 *   transient upstream hiccup) - it's still returned to the caller, just
 *   not trusted for the next `ttlMs`, so the very next call retries instead
 *   of a one-off bad response getting "locked in" for the full TTL.
 */
export async function cached(key, ttlMs, fetcher, shouldCache = () => true) {
  const entry = cache.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    return entry.data;
  }

  if (inFlight.has(key)) {
    return inFlight.get(key);
  }

  const promise = fetcher()
    .then((data) => {
      if (shouldCache(data)) {
        cache.set(key, { data, expiresAt: Date.now() + ttlMs });
      }
      inFlight.delete(key);
      return data;
    })
    .catch((err) => {
      inFlight.delete(key);
      throw err;
    });

  inFlight.set(key, promise);
  return promise;
}

/** Forces the next call for this key to hit the network again. */
export function invalidateCache(key) {
  cache.delete(key);
}
