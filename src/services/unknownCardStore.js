/**
 * Session-scoped registry of unknown RFID card scans (Apps Script responds
 * with { success: false, message: "Student Not Found", data: { uid } } when
 * a scanned card isn't linked to a registered student). Kept in memory only
 * - a fresh browser session starts with a clean slate, and a UID already
 * seen this session is never registered twice, satisfying "one notification
 * per UID" without needing a backend change.
 */
const seenUids = new Set();
const events = [];

export function registerUnknownCard(uid) {
  if (!uid || seenUids.has(uid)) return;
  seenUids.add(uid);
  events.push({ uid, detectedAt: new Date() });
}

export function getUnknownCardEvents() {
  return events;
}
