import notificationsData from "../data/notifications.json";
import { mockDelay } from "../utils/mockDelay";
import { getStudents } from "./studentService";
import { getAttendance } from "./attendanceService";
import { lowestAttendance, recentScans } from "../utils/attendanceUtils";
import { getUnknownCardEvents, registerUnknownCard } from "./unknownCardStore";
import { getNewStudentEvents } from "./newStudentStore";
import { relativeTime } from "../utils/dateUtils";

/**
 * @typedef {import('../types').Notification} Notification
 * @returns {Promise<Notification[]>}
 */
export async function getNotifications() {
  await mockDelay(200);
  return notificationsData;
}

const LOW_ATTENDANCE_THRESHOLD = 75;

/**
 * Builds notifications from the actual live students/attendance data
 * instead of a fixed sample list - a low-attendance alert only appears
 * when a student is genuinely below the threshold, and check-in/check-out
 * entries reflect real recent scans.
 * @returns {Promise<Notification[]>}
 */
export async function getLiveNotifications() {
  let students;
  let records;

  try {
    [students, records] = await Promise.all([getStudents(), getAttendance()]);
  } catch (err) {
    console.error("getLiveNotifications failed:", err);
    return [];
  }

  const notifications = [];

  const atRisk = lowestAttendance(students, records, students.length).filter(
    (s) => s.attendanceRate < LOW_ATTENDANCE_THRESHOLD
  );

  if (atRisk.length > 0) {
    notifications.push({
      id: "low-attendance",
      type: "warning",
      title: "Low attendance alert",
      message: `${atRisk.length} student${atRisk.length === 1 ? "" : "s"} ${
        atRisk.length === 1 ? "has" : "have"
      } attendance below ${LOW_ATTENDANCE_THRESHOLD}%.`,
      time: "Ongoing",
    });
  }

  const knownScans = records.filter((r) => r.status !== "Unknown");
  const unknownScans = records.filter((r) => r.status === "Unknown");

  recentScans(knownScans, 5).forEach((r) => {
    const isInside = r.status === "Inside";
    notifications.push({
      id: `scan-${r.usn}-${r.date}-${r.loginTime ?? "na"}`,
      type: isInside ? "success" : "info",
      title: isInside ? "Student checked in" : "Student checked out",
      message: `${r.name} (${r.usn}) - ${r.department}`,
      time: r.loginTime ? `${r.date} · ${r.loginTime}` : r.date,
    });
  });

  // Apps Script logs an unregistered card scan as an attendance row with
  // status "Unknown" (uid set, no matching student) instead of the
  // ephemeral { success: false, message: "Student Not Found" } response it
  // only ever sends directly to the ESP32. registerUnknownCard() dedupes so
  // a card scanned repeatedly this session only notifies once.
  recentScans(unknownScans, 5).forEach((r) => registerUnknownCard(r.uid));

  getUnknownCardEvents().forEach(({ uid, detectedAt }) => {
    notifications.push({
      id: `unknown-card-${uid}`,
      type: "warning",
      title: "Unknown RFID Card",
      message: `UID : ${uid}`,
      time: relativeTime(detectedAt),
    });
  });

  getNewStudentEvents().forEach(({ uid, name, detectedAt }) => {
    notifications.push({
      id: `new-student-${uid}-${detectedAt.getTime()}`,
      type: "success",
      title: "New Student Added",
      message: name ? `${name} - UID : ${uid}` : `UID : ${uid}`,
      time: relativeTime(detectedAt),
    });
  });

  return notifications;
}
