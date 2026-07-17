/**
 * Simulates real network latency for mock service calls so loading states
 * behave the same way they will once these are backed by Google Apps Script.
 * @param {number} ms
 */
export function mockDelay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
