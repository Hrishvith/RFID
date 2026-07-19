/**
 * Parses a "DD-MM-YYYY" string (the format produced by the ESP32 / Apps
 * Script pipeline) into a real Date object.
 * @param {string} dateStr
 * @returns {Date}
 */
export function parseDMY(dateStr) {
  const [day, month, year] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * @param {Date} date
 * @returns {string} "DD-MM-YYYY"
 */
export function formatDMY(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}-${m}-${date.getFullYear()}`;
}

export function formatFriendlyDate(date) {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(date) {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function isSameDay(a, b) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

/** Sunday is the institute's fixed weekly off. */
export function isSunday(date) {
  return date.getDay() === 0;
}

/** Inclusive range check, ignoring time-of-day on all three dates. */
export function isWithinDateRange(date, start, end) {
  const d = new Date(date).setHours(0, 0, 0, 0);
  const s = new Date(start).setHours(0, 0, 0, 0);
  const e = new Date(end).setHours(0, 0, 0, 0);
  return d >= s && d <= e;
}

/** @returns {string} "YYYY-MM-DD", the format <input type="date"> uses. */
export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parses "YYYY-MM-DD" as a local date (avoids the UTC-midnight shift new Date(str) does). */
export function parseISODate(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isWithinLastDays(date, days, referenceDate = new Date()) {
  const refMidnight = new Date(referenceDate).setHours(0, 0, 0, 0);
  const dateMidnight = new Date(date).setHours(0, 0, 0, 0);
  const diffDays = (refMidnight - dateMidnight) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays < days;
}

/**
 * @param {Date} date
 * @returns {string} "Just now", "5 mins ago", "2 hrs ago", "3 days ago", ...
 */
export function relativeTime(date) {
  const diffSec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (diffSec < 60) return "Just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min${diffMin === 1 ? "" : "s"} ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr${diffHr === 1 ? "" : "s"} ago`;

  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
}

export function getWeekLabel(date) {
  const oneJan = new Date(date.getFullYear(), 0, 1);
  const week = Math.ceil(((date - oneJan) / 86400000 + oneJan.getDay() + 1) / 7);
  return `Week ${week}`;
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
