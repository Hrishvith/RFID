/**
 * Session-scoped registry of "new student added" events. When an admin adds
 * a student, Apps Script's addStudent() action responds with
 * { success: true, message: "...", data: { uid, name, ... } } - captured
 * here so the Notifications panel can surface it, mirroring
 * unknownCardStore.js for unknown-card scans.
 */
const events = [];

export function registerNewStudent(uid, name) {
  if (!uid) return;
  events.push({ uid, name: name || "", detectedAt: new Date() });
}

export function getNewStudentEvents() {
  return events;
}
