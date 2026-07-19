import { getStudents } from "./studentService";
import { getAttendance } from "./attendanceService";
import { getHolidays } from "./settingsService";
import {
  computeTodayStats,
  recordsForDate,
  dailyAttendanceSeries,
  monthlyAttendanceSeries,
  departmentAttendance,
  topAttendance,
  lowestAttendance,
} from "../utils/attendanceUtils";

export async function getDashboardSummary(referenceDate = new Date()) {

  const students = await getStudents();

  const attendance = await getAttendance();

  const holidays = await getHolidays();

  const todaysRecords = recordsForDate(attendance, referenceDate);

  return {

    students,

    attendance,

    todaysRecords,

    stats: computeTodayStats(
      students,
      todaysRecords,
      referenceDate,
      holidays
    ),

    weekly: dailyAttendanceSeries(
      students,
      attendance,
      7,
      referenceDate,
      holidays
    ),

  };

}

export async function getReportData(referenceDate = new Date()) {

  const students = await getStudents();

  const attendance = await getAttendance();

  const holidays = await getHolidays();

  return {

    daily: dailyAttendanceSeries(
      students,
      attendance,
      7,
      referenceDate,
      holidays
    ),

    monthly: monthlyAttendanceSeries(
      attendance
    ),

    byDepartment: departmentAttendance(
      students,
      attendance
    ),

    top: topAttendance(
      students,
      attendance,
      5
    ),

    lowest: lowestAttendance(
      students,
      attendance,
      5
    )

  };

}