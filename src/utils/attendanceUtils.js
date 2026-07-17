import { parseDMY, formatDMY, isWithinLastDays } from "./dateUtils";

/**
 * @typedef {import('../types').AttendanceRecord} AttendanceRecord
 * @typedef {import('../types').Student} Student
 */

// ======================================================
// Records for Today
// ======================================================

export function recordsForDate(records, date) {
  const target = formatDMY(date);
  return records.filter((r) => r.date === target);
}

// ======================================================
// Shared helpers
// ======================================================

/**
 * A student can tap their RFID card in/out multiple times a day (in, out,
 * back in again). Each tap creates its own attendance record, so counting
 * records instead of unique students inflates "present" past the real
 * headcount - this is the cause of impossible values like
 * Present > Total Students. Dedupe to one entry per student, keeping
 * "Completed" over "Inside" since it reflects their most advanced state.
 */
function getPresentStatusByUsn(records) {
  const statusByUsn = new Map();

  records.forEach((r) => {
    if (r.status !== "Inside" && r.status !== "Completed") return;

    const current = statusByUsn.get(r.usn);
    if (!current || (current === "Inside" && r.status === "Completed")) {
      statusByUsn.set(r.usn, r.status);
    }
  });

  return statusByUsn;
}

function clampPercentage(value) {
  return Math.min(100, Math.max(0, value));
}

// ======================================================
// Dashboard Statistics
// ======================================================

export function computeTodayStats(students, todaysRecords) {

  const totalStudents = students.length;

  const presentByUsn = getPresentStatusByUsn(todaysRecords);
  const presentToday = presentByUsn.size;

  if (presentToday > totalStudents) {
    console.error(
      `[dashboard] Data inconsistency: ${presentToday} students marked present today but only ${totalStudents} are registered. ` +
      `Check for duplicate/stale attendance records or deleted students.`
    );
  }

  // Absent can never go negative, even when present temporarily exceeds
  // the registered headcount due to a data inconsistency.
  const absentToday = Math.max(0, totalStudents - presentToday);

  // Percentage is always clamped to [0, 100] and rounded to 2 decimals,
  // regardless of any upstream data inconsistency.
  const attendancePercentage =
    totalStudents > 0
      ? Number(clampPercentage((presentToday / totalStudents) * 100).toFixed(2))
      : 0;

  let insideToday = 0;
  let completedToday = 0;

  presentByUsn.forEach((status) => {
    if (status === "Completed") completedToday++;
    else insideToday++;
  });

  // One working-hours reading per student today, so repeat scans don't
  // skew the average.
  const workingHoursByUsn = new Map();
  todaysRecords.forEach((r) => {
    if (r.workingHours) workingHoursByUsn.set(r.usn, r.workingHours);
  });

  let totalMinutes = 0;
  let count = 0;

  workingHoursByUsn.forEach((workingHours) => {

    const parts = workingHours.split(":");

    if (parts.length === 2) {

      totalMinutes +=
        Number(parts[0]) * 60 +
        Number(parts[1]);

      count++;

    }

  });

  const avgMinutes =
    count > 0
      ? Math.floor(totalMinutes / count)
      : 0;

  const avgWorkingHours =
    String(Math.floor(avgMinutes / 60)).padStart(2, "0") +
    ":" +
    String(avgMinutes % 60).padStart(2, "0");

  return {

    totalStudents,

    presentToday,

    absentToday,

    insideToday,

    completedToday,

    attendancePercentage,

    averageWorkingHours: avgWorkingHours

  };

}

// ======================================================
// Student Attendance Percentage
// ======================================================

export function computeStudentAttendanceRates(students, records) {

  return students.map((student) => {

    const studentRecords =
      records.filter((r) => r.usn === student.usn);

    const completed =
      studentRecords.filter(
        (r) =>
          r.status === "Completed" ||
          r.status === "Inside"
      ).length;

    const rate =
      studentRecords.length > 0
        ? (completed / studentRecords.length) * 100
        : 0;

    return {

      ...student,

      attendanceRate:
        Number(rate.toFixed(1))

    };

  });

}

// ======================================================

export function topAttendance(
  students,
  records,
  limit = 5
) {

  return computeStudentAttendanceRates(
    students,
    records
  )
    .sort(
      (a, b) =>
        b.attendanceRate -
        a.attendanceRate
    )
    .slice(0, limit);

}

export function lowestAttendance(
  students,
  records,
  limit = 5
) {

  return computeStudentAttendanceRates(
    students,
    records
  )
    .sort(
      (a, b) =>
        a.attendanceRate -
        b.attendanceRate
    )
    .slice(0, limit);

}

// ======================================================
// Weekly Chart
// ======================================================

export function dailyAttendanceSeries(
  students,
  records,
  days = 7,
  referenceDate = new Date()
) {

  const totalStudents = students.length;
  const series = [];

  for (let i = days - 1; i >= 0; i--) {

    const date = new Date(referenceDate);

    date.setDate(referenceDate.getDate() - i);

    const dateStr = formatDMY(date);

    const dayRecords =
      records.filter((r) => r.date === dateStr);

    const presentByUsn = getPresentStatusByUsn(dayRecords);
    const present = presentByUsn.size;

    if (present > totalStudents) {
      console.error(
        `[dashboard] Data inconsistency on ${dateStr}: ${present} students marked present but only ${totalStudents} are registered.`
      );
    }

    let inside = 0;
    let completed = 0;
    presentByUsn.forEach((status) => {
      if (status === "Completed") completed++;
      else inside++;
    });

    series.push({

      date: dateStr,

      label:
        date.toLocaleDateString("en-IN", {
          weekday: "short",
        }),

      present,

      absent: Math.max(0, totalStudents - present),

      inside,

      completed,

    });

  }

  return series;

}

// ======================================================
// Monthly Chart
// ======================================================

export function monthlyAttendanceSeries(records) {

  const buckets = new Map();

  records.forEach((r) => {

    const date = parseDMY(r.date);

    const key =
      date.getFullYear() +
      "-" +
      date.getMonth();

    if (!buckets.has(key)) {

      buckets.set(key, {

        label:
          date.toLocaleDateString("en-IN", {
            month: "short",
          }),

        present: 0,

        absent: 0,

        sortKey:
          date.getFullYear() * 12 +
          date.getMonth(),

      });

    }

    const bucket = buckets.get(key);

    if (
      r.status === "Completed" ||
      r.status === "Inside"
    ) {

      bucket.present++;

    }

  });

  return [...buckets.values()].sort(
    (a, b) =>
      a.sortKey - b.sortKey
  );

}

// ======================================================
// Department Wise
// ======================================================

export function departmentAttendance(
  students,
  records
) {

  const departments = {};

  students.forEach((student) => {

    if (!departments[student.department]) {

      departments[student.department] = {

        department:
          student.department,

        students: 0,

        attendanceRate: 0,

      };

    }

    departments[student.department]
      .students++;

  });

  const rates =
    computeStudentAttendanceRates(
      students,
      records
    );

  Object.values(departments).forEach(
    (dept) => {

      const deptStudents =
        rates.filter(
          (s) =>
            s.department ===
            dept.department
        );

      dept.attendanceRate =
        deptStudents.length > 0
          ? Number(
              (
                deptStudents.reduce(
                  (sum, s) =>
                    sum +
                    s.attendanceRate,
                  0
                ) / deptStudents.length
              ).toFixed(1)
            )
          : 0;

    }
  );

  return Object.values(departments);

}

// ======================================================
// Range Stats
// ======================================================

export function computeRangeStats(records) {

  const present =
    records.filter(
      (r) =>
        r.status === "Completed" ||
        r.status === "Inside"
    ).length;

  const total = records.length;

  const absent =
    total - present;

  const attendancePercentage =
    total
      ? Number(
          ((present / total) * 100).toFixed(1)
        )
      : 0;

  return {

    totalStudents: total,

    presentToday: present,

    absentToday: absent,

    attendancePercentage,

  };

}

// ======================================================
// Recent Scans
// ======================================================

/**
 * Ranks a record by actual date + time so "recent" is a real chronological
 * ordering. loginTime alone ("HH:mm") ignores which day the scan happened,
 * so mixed-date input (e.g. the full attendance history) would rank a late
 * time-of-day from weeks ago above an early scan from today.
 */
function scanTimestamp(record) {
  if (!record.date) return 0;

  const day = parseDMY(record.date).getTime();

  const parts = (record.loginTime || "").split(":");
  const minutes =
    parts.length === 2 && !Number.isNaN(Number(parts[0])) && !Number.isNaN(Number(parts[1]))
      ? Number(parts[0]) * 60 + Number(parts[1])
      : 0;

  return day + minutes * 60000;
}

export function recentScans(
  records,
  limit = 8
) {

  return [...records]
    .sort((a, b) => scanTimestamp(b) - scanTimestamp(a))
    .slice(0, limit);

}

// ======================================================
// Date Filter
// ======================================================

export function filterRecordsByRange(
  records,
  range,
  referenceDate = new Date()
) {

  if (range === "all")
    return records;

  const days =
    range === "daily"
      ? 1
      : range === "weekly"
      ? 7
      : 30;

  return records.filter((r) =>
    isWithinLastDays(
      parseDMY(r.date),
      days,
      referenceDate
    )
  );

}