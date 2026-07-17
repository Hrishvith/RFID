import { apiRequest } from "./apiClient";
import { cached } from "../utils/requestCache";

/**
 * @typedef {import('../types').AttendanceRecord} AttendanceRecord
 */

const ATTENDANCE_CACHE_KEY = "attendance";
const ATTENDANCE_CACHE_TTL_MS = 15_000;

/**
 * The "?uid=..." ESP32-facing endpoint (no "action" param) is what actually
 * responds with { success: false, message: "Student Not Found", data: { uid } }
 * for an unregistered card - confirmed live. That's a direct ESP32-to-Apps-
 * Script call our site never makes, and the scan isn't persisted anywhere,
 * so "action=attendance" (what this calls) always returns a plain array and
 * can never see it. Unknown-card detection instead looks for rows with
 * status "Unknown" in that array - see notificationService.js - which
 * requires Apps Script to log unregistered scans into the attendance sheet.
 *
 * Cached briefly (see requestCache.js) - scans aren't second-by-second
 * critical here, and this is the single biggest reason page navigation felt
 * slow (every page independently re-fetched the whole attendance sheet from
 * the slow external API).
 *
 * An empty result is never cached. A quiet day with zero scans is a
 * legitimate empty array, but confirmed live that Apps Script can also
 * transiently return [] as a one-off hiccup even when real records exist -
 * not caching the empty case means the very next call (e.g. reopening the
 * notification bell, which now refreshes on open) retries instead of the
 * whole site incorrectly showing "no activity" for a full 15s.
 */
export async function getAttendance() {
  return cached(
    ATTENDANCE_CACHE_KEY,
    ATTENDANCE_CACHE_TTL_MS,
    () => apiRequest("attendance"),
    (data) => Array.isArray(data) && data.length > 0
  );
}

export async function getAttendanceByDate(date) {
  const attendance = await getAttendance();

  return attendance.filter((record) => record.date === date);
}

export async function getAttendanceByStudent(usn) {
  const attendance = await getAttendance();

  // usn comes back as a number or a string inconsistently depending on how
  // it was typed into the Google Sheet (confirmed live: e.g. 1234566 vs
  // "1DA23IS049") - String() on both sides avoids a silent zero-match.
  return attendance.filter((record) => String(record.usn) === String(usn));
}

export async function logScan(record) {
  console.log("Attendance is recorded through ESP32.", record);
  return record;
}