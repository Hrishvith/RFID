import settingsData from "../data/settings.json";
import departments from "../data/departments.json";
import { mockDelay } from "../utils/mockDelay";

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
