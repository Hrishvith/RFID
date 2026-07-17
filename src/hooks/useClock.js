import { useEffect, useState } from "react";

/**
 * Ticking clock for the "Current Date / Current Time" dashboard widgets.
 * @param {number} intervalMs
 */
export function useClock(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
