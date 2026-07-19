import settingsData from "../data/settings.json";
import departments from "../data/departments.json";
import { mockDelay } from "../utils/mockDelay";
import { toISODate } from "../utils/dateUtils";

const STORAGE_KEY = "rfid_dashboard_settings";

/**
 * @typedef {import('../types').InstituteSettings} InstituteSettings
 * @returns {Promise<InstituteSettings>}
 */
export async function getSettings() {
  await mockDelay(200);
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored ? { ...settingsData, ...JSON.parse(stored) } : settingsData;
}

/**
 * @param {Partial<InstituteSettings>} updates
 */
export async function updateSettings(updates) {
  await mockDelay(300);
  const current = await getSettings();
  const next = { ...current, ...updates };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export async function getDepartments() {
  await mockDelay(100);
  return departments;
}

const ATTENDANCE_TIMING_KEY = "rfid_dashboard_attendance_timing_settings";

export const DEFAULT_ATTENDANCE_TIMING = {
  loginStartTime: "09:00",
  loginEndTime: "09:30",
  logoutStartTime: "17:00",
};

/**
 * Admin-only RFID attendance timing window (login start/end, logout start).
 * Kept separate from getSettings()/updateSettings() above - a distinct
 * concern with its own storage key, defaults and validation.
 * @returns {Promise<typeof DEFAULT_ATTENDANCE_TIMING>}
 */
export async function getAttendanceSettings() {
  await mockDelay(200);
  const stored = window.localStorage.getItem(ATTENDANCE_TIMING_KEY);
  return stored ? { ...DEFAULT_ATTENDANCE_TIMING, ...JSON.parse(stored) } : { ...DEFAULT_ATTENDANCE_TIMING };
}

/**
 * @param {Partial<typeof DEFAULT_ATTENDANCE_TIMING>} updates
 */
export async function saveAttendanceSettings(updates) {
  await mockDelay(300);
  const current = await getAttendanceSettings();
  const next = { ...current, ...updates };
  window.localStorage.setItem(ATTENDANCE_TIMING_KEY, JSON.stringify(next));
  return next;
}

// ======================================================
// Holiday Calendar
// ======================================================

const HOLIDAYS_KEY = "rfid_dashboard_holidays";

/**
 * @typedef {{ id: string, type: "date", date: string, label: string }
 *         | { id: string, type: "range", startDate: string, endDate: string, label: string }} Holiday
 * Dates are stored as "YYYY-MM-DD" (native <input type="date"> format).
 * On these dates - and every Sunday - attendance is not marked absent.
 * @returns {Promise<Holiday[]>}
 */
export async function getHolidays() {
  await mockDelay(150);
  const stored = window.localStorage.getItem(HOLIDAYS_KEY);
  return stored ? JSON.parse(stored) : [];
}

async function persistHolidays(holidays) {
  window.localStorage.setItem(HOLIDAYS_KEY, JSON.stringify(holidays));
  return holidays;
}

/**
 * @param {{ date: string, label: string }} entry
 */
export async function addSingleHoliday(entry) {
  const holidays = await getHolidays();
  const next = [...holidays, { id: crypto.randomUUID(), type: "date", ...entry }];
  return persistHolidays(next);
}

/**
 * @param {{ startDate: string, endDate: string, label: string }} entry
 */
export async function addHolidayRange(entry) {
  const holidays = await getHolidays();
  const next = [...holidays, { id: crypto.randomUUID(), type: "range", ...entry }];
  return persistHolidays(next);
}

export async function removeHoliday(id) {
  const holidays = await getHolidays();
  return persistHolidays(holidays.filter((h) => h.id !== id));
}

/**
 * One-click override for a sudden closure - marks the current calendar day
 * as a holiday without the admin having to fill out the date-picker form.
 * No-op if today is already covered by an existing entry.
 */
export async function markTodayAsHoliday(label = "Unscheduled holiday") {
  const today = toISODate(new Date());
  const holidays = await getHolidays();

  const alreadyCovered = holidays.some((h) =>
    h.type === "date" ? h.date === today : today >= h.startDate && today <= h.endDate
  );
  if (alreadyCovered) return holidays;

  return addSingleHoliday({ date: today, label });
}
